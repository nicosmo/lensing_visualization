/**
 * Utility functions for the Lensing Visualization
 * Contains seeded random number generator and helper functions
 */

// --- Seeded Random Number Generator ---
// A seeded RNG is used so that the "Reshuffle" feature generates a consistent
// galaxy field for a specific seed, allowing for reproducible visuals during a session.
function mulberry32(seed) {
    let a = seed;
    return function () {
        a += 0x6d2b79f5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Master seed for reproducible galaxy generation
let masterSeed = Math.floor(Math.random() * 100000);

/**
 * Get the current master seed
 * @returns {number} The current master seed
 */
function getMasterSeed() {
    return masterSeed;
}

/**
 * Set a new master seed
 * @param {number} seed - The new seed value
 */
function setMasterSeed(seed) {
    masterSeed = seed;
}

/**
 * Randomize the master seed
 * @returns {number} The new random seed
 */
function randomizeMasterSeed() {
    masterSeed = Math.floor(Math.random() * 100000);
    return masterSeed;
}

// --- CREDIT RANDOMIZATION ---
function randomizeCredits() {
    const names = ['Nico Schuster', 'Andres Salcedo'];
    if (Math.random() > 0.5) {
        names.reverse();
    }
    const creditEl = document.getElementById('credit-text');
    if (creditEl) {
        creditEl.innerText = `Concept & Visualization by ${names[0]} and ${names[1]}`;
    }
}

// Export functions for use in other modules
window.LensingUtils = {
    mulberry32,
    getMasterSeed,
    setMasterSeed,
    randomizeMasterSeed,
    randomizeCredits,
};


// --- CAUSTICS & CRITICAL CURVES MATH (CPU SOLVER) ---
// Inspired by the formalisms used in the 'lenstronomy' Python package
// for gravitational lensing (Birrer et al.).

// 1. Evaluate the analytical NIE Deflection
function nie_deflection(dx, dy, b, s, q, angle_deg) {
    const theta = angle_deg * Math.PI / 180.0;
    const c = Math.cos(theta);
    const sn = Math.sin(theta);

    // Rotate to aligned frame
    const x = c * dx + sn * dy;
    const y = -sn * dx + c * dy;

    const safeQ = Math.max(Math.min(q, 0.999), 0.01);
    const f = Math.sqrt(1.0 - safeQ * safeQ);
    const delta = Math.sqrt(safeQ * safeQ * (s * s + x * x) + y * y);
    const prefac = (b * safeQ) / f;

    const ax = prefac * Math.atan((x * f) / (delta + s));
    let arg = (y * f) / (delta + s * safeQ * safeQ);
    arg = Math.max(Math.min(arg, 0.999), -0.999);
    const ay = prefac * (0.5 * Math.log((1.0 + arg) / (1.0 - arg)));

    // Rotate back to sky frame
    return { x: c * ax - sn * ay, y: sn * ax + c * ay };
}

// 2. Central Difference Jacobian
function getJacobian(x, y, b, s, q, angle) {
    const eps = 1e-4;
    const dx_plus = nie_deflection(x + eps, y, b, s, q, angle);
    const dx_minus = nie_deflection(x - eps, y, b, s, q, angle);
    const dy_plus = nie_deflection(x, y + eps, b, s, q, angle);
    const dy_minus = nie_deflection(x, y - eps, b, s, q, angle);

    const ax_x = (dx_plus.x - dx_minus.x) / (2 * eps);
    const ay_x = (dx_plus.y - dx_minus.y) / (2 * eps);
    const ax_y = (dy_plus.x - dy_minus.x) / (2 * eps);
    const ay_y = (dy_plus.y - dy_minus.y) / (2 * eps);

    const detA = (1.0 - ax_x) * (1.0 - ay_y) - (ax_y * ay_x);
    const traceAlpha = ax_x + ay_y; // Equals 2 * kappa
    return { detA, traceAlpha };
}

// 3. 2D Marching Squares Algorithm (Lenstronomy Method)
function generateCausticLines(config, depth, aspect) {
    const b = (config.mass * 0.03) * depth * 8.0;
    const q = 1.0 - config.ellipticity;
    const s = Math.max(config.spread * 0.1, 0.005) * Math.sqrt(q);
    const angle = config.angle;

    const radialCritPts = [], tangCritPts = [];
    const radialCausticSegs = [], tangCausticSegs = [];
    const toWorld = (px, py) => new THREE.Vector3((px / aspect) * 2.5, py * 2.5, -0.01);

    // Helper to evaluate a grid and extract zero-contours
    function runMarchingSquares(L, N, findRadial) {
        const step = (2 * L) / N;
        const grid = new Float32Array((N + 1) * (N + 1));
        const traceGrid = new Float32Array((N + 1) * (N + 1));

        // Evaluate Determinant over the 2D window
        for (let i = 0; i <= N; i++) {
            for (let j = 0; j <= N; j++) {
                let x = -L + i * step;
                let y = -L + j * step;
                let jac = getJacobian(x, y, b, s, q, angle);
                grid[i * (N + 1) + j] = jac.detA;
                traceGrid[i * (N + 1) + j] = jac.traceAlpha;
            }
        }

        const getVal = (i, j) => grid[i * (N + 1) + j];
        const getTrace = (i, j) => traceGrid[i * (N + 1) + j];
        const getPos = (i, j) => ({ x: -L + i * step, y: -L + j * step });

        // Find zero-crossing contours
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                let v00 = getVal(i, j), v10 = getVal(i + 1, j);
                let v01 = getVal(i, j + 1), v11 = getVal(i + 1, j + 1);

                let caseIdx = 0;
                if (v00 > 0) caseIdx |= 1;
                if (v10 > 0) caseIdx |= 2;
                if (v11 > 0) caseIdx |= 4;
                if (v01 > 0) caseIdx |= 8;

                if (caseIdx === 0 || caseIdx === 15) continue;

                // traceAlpha = 2 * kappa. If > 2.0, it is the inner radial curve.
                let avgTrace = (getTrace(i, j) + getTrace(i+1, j) + getTrace(i, j+1) + getTrace(i+1, j+1)) / 4.0;
                let isRadial = avgTrace > 2.0;

                if (findRadial && !isRadial) continue;
                if (!findRadial && isRadial) continue;

                const interp = (v1, v2, p1, p2) => {
                    const t = v1 / (v1 - v2);
                    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
                };

                let p00 = getPos(i, j), p10 = getPos(i + 1, j);
                let p01 = getPos(i, j + 1), p11 = getPos(i + 1, j + 1);
                let edges = [];

                if ((caseIdx & 1) !== ((caseIdx & 2) >> 1)) edges.push(interp(v00, v10, p00, p10));
                if (((caseIdx & 2) >> 1) !== ((caseIdx & 4) >> 2)) edges.push(interp(v10, v11, p10, p11));
                if (((caseIdx & 8) >> 3) !== ((caseIdx & 4) >> 2)) edges.push(interp(v01, v11, p01, p11));
                if ((caseIdx & 1) !== ((caseIdx & 8) >> 3)) edges.push(interp(v00, v01, p00, p01));

                for (let e = 0; e < edges.length; e += 2) {
                    let pt1 = edges[e];
                    let pt2 = edges[e + 1];

                    let alpha1 = nie_deflection(pt1.x, pt1.y, b, s, q, angle);
                    let src1 = { x: pt1.x - alpha1.x, y: pt1.y - alpha1.y };
                    let alpha2 = nie_deflection(pt2.x, pt2.y, b, s, q, angle);
                    let src2 = { x: pt2.x - alpha2.x, y: pt2.y - alpha2.y };

                    if (findRadial) {
                        radialCritPts.push(toWorld(pt1.x, pt1.y)); // Save 1 point for dots
                        radialCausticSegs.push(toWorld(src1.x, src1.y), toWorld(src2.x, src2.y)); // Save 2 for segments
                    } else {
                        tangCritPts.push(toWorld(pt1.x, pt1.y));
                        tangCausticSegs.push(toWorld(src1.x, src1.y), toWorld(src2.x, src2.y));
                    }
                }
            }
        }
    }

    // 1. Macro Grid: Low-res, wide area to catch the massive Outer Tangential Curve
    runMarchingSquares(b * 1.5 + s + 0.1, 150, false);
    // 2. Micro Grid: High-res, tiny area to perfectly trace the microscopic Inner Radial Curve
    runMarchingSquares(s * 3.0 + 0.05, 120, true);

    return { radialCritPts, tangCritPts, radialCausticSegs, tangCausticSegs };
}

window.LensingUtils.generateCausticLines = generateCausticLines;

