/**
 * Galaxy Factory Module
 * Handles galaxy drawing and sprite generation for the visualization
 */

/**
 * Draws a single 2D galaxy onto a canvas context.
 * Uses radial gradients for the core/disk and bezier curves to draw spiral arms
 * if the galaxy type is spiral.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
 * @param {number} boundsSize - The size of the canvas bounds
 * @param {Object} typeConfig - Configuration object for the galaxy type
 * @param {Function} rng - Random number generator function
 */
function drawGalaxyClassic(ctx, boundsSize, typeConfig, rng = Math.random) {
    const r = rng;
    const x = r() * boundsSize;
    const y = r() * boundsSize;

    // Determine if spiral or elliptical
    let isSpiral = r() > 0.5;
    if (typeConfig.isCluster) isSpiral = false;

    // Randomize color properties (Hue, Saturation, Lightness)
    let hue;
    let sat;
    let light;
    if (isSpiral) {
        hue = 190 + r() * 60; // Blue/Cyan range
        sat = 50 + r() * 40;
        light = 75 + r() * 20;
    } else {
        hue = 25 + r() * 40; // Orange/Yellow range
        sat = 60 + r() * 40;
        light = 70 + r() * 20;
    }

    let size = typeConfig.minSize + r() * (typeConfig.maxSize - typeConfig.minSize);

    // Occasional large outlier galaxy
    if (!typeConfig.isForeground && !typeConfig.isCluster && r() > 0.98) size *= 2.0;

    let aspect;
    if (!typeConfig.isForeground && !typeConfig.isCluster) {
        aspect = 0.6 + r() * 0.3;
    } else {
        aspect = 0.4 + r() * 0.6;
    }

    const angle = r() * Math.PI * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1, aspect);

    // Draw Core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
    coreGrad.addColorStop(0, `hsla(${hue}, ${sat}%, 95%, 1.0)`);
    coreGrad.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${light}%, 0.8)`);
    coreGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0.0)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Disk
    const diskGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    diskGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0.4)`);
    diskGrad.addColorStop(0.6, `hsla(${hue}, ${sat}%, ${light}%, 0.1)`);
    diskGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw Spiral Arms (if applicable)
    if (isSpiral && size > 4) {
        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light + 10}%, 0.5)`;
        ctx.lineWidth = size * 0.15;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, 0);
        ctx.bezierCurveTo(-size * 0.5, -size * 1.2, size * 0.8, -size * 1.0, size * 1.2, 0);
        ctx.moveTo(size * 0.2, 0);
        ctx.bezierCurveTo(size * 0.5, size * 1.2, -size * 0.8, size * 1.0, -size * 1.2, 0);
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Factory to pre-render sprite sheets for galaxies.
 * Instead of drawing complex vector shapes every frame, we draw them once to a small canvas
 * and reuse that image as a sprite.
 */
const GalaxyFactory = {
    sprites: { blueSpiral: [], redSpiral: [] },

    /**
     * Generate a single galaxy sprite
     * @param {string} type - Type of galaxy ('blueSpiral' or 'redSpiral')
     * @param {number} size - Size of the sprite canvas
     * @returns {HTMLCanvasElement} The generated sprite canvas
     */
    generateSprite(type, size = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;

        let hue;
        let sat;
        if (type === 'blueSpiral') {
            hue = 200 + Math.random() * 40;
            sat = 60 + Math.random() * 20;
        } else {
            hue = 10 + Math.random() * 40;
            sat = 60 + Math.random() * 20;
        }

        // Core
        const coreSize = size * 0.15;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 2);
        grad.addColorStop(0, `hsla(${hue}, ${sat}%, 95%, 1)`);
        grad.addColorStop(0.5, `hsla(${hue}, ${sat}%, 60%, 0.5)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Particle Arms
        const armCount = Math.random() > 0.7 ? 3 : 2;
        const winding = 2 + Math.random() * 2;
        const particleCount = 1200;

        for (let i = 0; i < particleCount; i++) {
            const t = Math.random();
            const rNorm = t ** 1.5;
            const r = rNorm * (size * 0.45);
            const angleBase = rNorm * Math.PI * winding;
            const armOffset = (Math.floor(Math.random() * armCount) / armCount) * Math.PI * 2;
            const scatter = (Math.random() - 0.5) * (size * 0.15) * rNorm;
            const theta = angleBase + armOffset;

            const x = cx + Math.cos(theta) * r + Math.cos(theta + Math.PI / 2) * scatter;
            const y = cy + Math.sin(theta) * r + Math.sin(theta + Math.PI / 2) * scatter;

            const isDust = Math.random() > 0.85;
            if (isDust) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const galaxyHue = hue + (Math.random() * 20 - 10);
                const galaxyLight = 90 - rNorm * 40;
                const alpha = 0.8 - rNorm * 0.5;
                ctx.fillStyle = `hsla(${galaxyHue}, ${sat}%, ${galaxyLight}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        return canvas;
    },

    /**
     * Initialize the sprite factory with pre-generated sprites
     */
    init() {
        for (let i = 0; i < 6; i++) {
            this.sprites.blueSpiral.push(this.generateSprite('blueSpiral'));
        }
        for (let i = 0; i < 4; i++) {
            this.sprites.redSpiral.push(this.generateSprite('redSpiral'));
        }
    },

    /**
     * Get a random sprite of the specified type
     * @param {string} type - Type of galaxy sprite
     * @param {Function} rng - Random number generator function
     * @returns {HTMLCanvasElement} A random sprite canvas
     */
    getRandomSprite(type, rng) {
        const r = rng ? rng() : Math.random();
        return this.sprites[type][Math.floor(r * this.sprites[type].length)];
    },
};

/**
 * Draw a foreground galaxy sprite
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} boundsSize - Size of the canvas bounds
 * @param {Object} typeConfig - Configuration for the galaxy
 * @param {Function} rng - Random number generator
 */
function drawForegroundSprite(ctx, boundsSize, typeConfig, rng = Math.random) {
    const r = rng;
    const x = r() * boundsSize;
    const y = r() * boundsSize;
    const type = r() > 0.5 ? 'blueSpiral' : 'redSpiral';
    const sprite = GalaxyFactory.getRandomSprite(type, r);

    const size = typeConfig.minSize + r() * (typeConfig.maxSize - typeConfig.minSize);
    const rotation = r() * Math.PI * 2;
    const tilt = 0.4 + r() * 0.6;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(1, tilt);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.restore();
}

// Export for use in other modules
window.GalaxyFactory = GalaxyFactory;
window.drawGalaxyClassic = drawGalaxyClassic;
window.drawForegroundSprite = drawForegroundSprite;
