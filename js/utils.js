/**
 * Utility functions for the Lensing Visualization
 * Contains seeded random number generator and helper functions
 */

// --- Seeded Random Number Generator ---
// A seeded RNG is used so that the "Reshuffle" feature generates a consistent
// galaxy field for a specific seed, allowing for reproducible visuals during a session.
// eslint-disable-next-line no-param-reassign
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
