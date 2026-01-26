/**
 * Texture Generation Module
 * Contains all texture creation functions for backgrounds, clusters, and grids
 */

/**
 * Generates the deep field background of galaxies.
 * @param {number} density - Density multiplier for galaxy count
 * @returns {THREE.CanvasTexture} The generated background texture
 */
function createBackgroundTexture(density) {
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 1024 : 2048;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const rng = LensingUtils.mulberry32(LensingUtils.getMasterSeed() + 1);

    // Dark background
    ctx.fillStyle = '#010102';
    ctx.fillRect(0, 0, size, size);

    // Add diffuse background nebulosity
    for (let i = 0; i < 60; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * (size * 0.15) + size * 0.05;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'hsla(220, 40%, 15%, 0.05)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = 'screen';

    // Draw galaxies
    const baseCount = isMobile ? 350 : 733;
    const count = Math.floor(baseCount * density);
    const sizeScale = size / 2048;

    for (let i = 0; i < count; i++) {
        drawGalaxyClassic(
            ctx,
            size,
            {
                isForeground: false,
                isCluster: false,
                minSize: 2.0 * sizeScale,
                maxSize: 10.0 * sizeScale,
            },
            rng,
        );
    }
    return new THREE.CanvasTexture(canvas);
}

/**
 * Generates a simple Black and White Grid for testing lensing distortions.
 * @returns {THREE.CanvasTexture} The generated grid texture
 */
function createBWGridTexture() {
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 1024 : 2048;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';

    const gridSize = 128;
    const steps = size / gridSize;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const p = i * gridSize;
        ctx.moveTo(p, 0);
        ctx.lineTo(p, size);
        ctx.moveTo(0, p);
        ctx.lineTo(size, p);
    }
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}

/**
 * Generates a colored grid where vertical/horizontal lines have different colors.
 * @returns {THREE.CanvasTexture} The generated color grid texture
 */
function createColorGridTexture() {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    const gridSize = 128;
    const steps = size / gridSize;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff00ff';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const p = i * gridSize;
        ctx.moveTo(p, 0);
        ctx.lineTo(p, size);
    }
    ctx.stroke();

    ctx.strokeStyle = '#00ffff';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const p = i * gridSize;
        ctx.moveTo(0, p);
        ctx.lineTo(size, p);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

/**
 * Generates a grid of colored dots on a black background.
 * @param {number} density - Density multiplier for dot spacing
 * @returns {THREE.CanvasTexture} The generated dotted grid texture
 */
function createDottedGridTexture(density) {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Higher density means smaller spacing
    // Base spacing at density 1.0 is 64 pixels
    const safeDensity = Math.max(density, 0.1);
    const idealSpacing = 64 / safeDensity;
    const steps = Math.round(size / idealSpacing);
    const spacing = size / steps; // Ensures perfect wrapping

    for (let x = 0; x <= size; x += spacing) {
        // Rainbow from left to right (Hue based on X coordinate)
        const hue = (x / size) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;

        for (let y = 0; y <= size; y += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return new THREE.CanvasTexture(canvas);
}

/**
 * Generates the "Lens" object itself - the cluster of galaxies in the foreground
 * that acts as the gravitational lens.
 * @param {number} density - Density multiplier for galaxy count
 * @returns {THREE.CanvasTexture} The generated cluster texture
 */
function createClusterTexture(density) {
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 512 : 1024;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const rng = LensingUtils.mulberry32(LensingUtils.getMasterSeed() + 2);

    ctx.clearRect(0, 0, size, size);

    const baseCount = isMobile ? 15 : 25;
    const count = Math.floor(baseCount * density);
    const sizeScale = size / 1024;

    for (let i = 0; i < count; i++) {
        // Concentrate galaxies towards the center to simulate a cluster
        const rPower = rng() ** 1.6;
        const r = rPower * (size * 0.45);
        const theta = rng() * Math.PI * 2;
        const x = size / 2 + r * Math.cos(theta);
        const y = size / 2 + r * Math.sin(theta);

        const isSpiral = rng() > 0.5;
        const sizeConfig = {
            isForeground: false,
            isCluster: true,
            minSize: 30 * sizeScale,
            maxSize: 90 * sizeScale,
        };

        if (isSpiral) {
            ctx.globalCompositeOperation = 'source-over';
            const type = rng() > 0.5 ? 'blueSpiral' : 'redSpiral';
            const sprite = GalaxyFactory.getRandomSprite(type, rng);
            const s = sizeConfig.minSize + rng() * (sizeConfig.maxSize - sizeConfig.minSize);
            const rot = rng() * Math.PI * 2;
            const tilt = 0.5 + rng() * 0.5;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.scale(1, tilt);
            ctx.drawImage(sprite, -s / 2, -s / 2, s, s);
            ctx.restore();
        } else {
            ctx.globalCompositeOperation = 'screen';
            ctx.save();
            ctx.translate(x, y);

            const hue = 25 + rng() * 40;
            const sat = 60 + rng() * 40;
            const light = 70 + rng() * 20;
            const s = sizeConfig.minSize + rng() * (sizeConfig.maxSize - sizeConfig.minSize);
            const aspect = 0.4 + rng() * 0.6;
            const angle = rng() * Math.PI * 2;

            ctx.rotate(angle);
            ctx.scale(1, aspect);

            const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.4);
            coreGrad.addColorStop(0, `hsla(${hue}, ${sat}%, 95%, 1.0)`);
            coreGrad.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${light}%, 0.8)`);
            coreGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0.0)`);
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
            ctx.fill();

            const diskGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
            diskGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0.4)`);
            diskGrad.addColorStop(0.6, `hsla(${hue}, ${sat}%, ${light}%, 0.1)`);
            diskGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = diskGrad;
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
    return new THREE.CanvasTexture(canvas);
}

/**
 * Generates foreground noise/objects that are NOT part of the lens or the background.
 * Used to add depth parallax.
 * @param {number} density - Density multiplier for galaxy count
 * @returns {THREE.CanvasTexture} The generated foreground texture
 */
function createForegroundTexture(density) {
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 1024 : 2048;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const rng = LensingUtils.mulberry32(LensingUtils.getMasterSeed() + 3);

    ctx.clearRect(0, 0, size, size);

    ctx.globalCompositeOperation = 'source-over';

    const baseCount = isMobile ? 20 : 40;
    const count = Math.floor(baseCount * density);
    const sizeScale = size / 2048;

    for (let i = 0; i < count; i++) {
        drawForegroundSprite(
            ctx,
            size,
            {
                isForeground: true,
                isCluster: false,
                minSize: 25 * sizeScale,
                maxSize: 90 * sizeScale,
            },
            rng,
        );
    }
    return new THREE.CanvasTexture(canvas);
}

// Export for use in other modules
window.LensingTextures = {
    createBackgroundTexture,
    createBWGridTexture,
    createColorGridTexture,
    createDottedGridTexture,
    createClusterTexture,
    createForegroundTexture,
};
