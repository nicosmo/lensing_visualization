/**
 * Main Application Module
 * Contains the core Three.js initialization, rendering loop, and event handling
 */

// Application State
const LensingApp = {
    scene: null,
    camera: null,
    renderer: null,
    material: null,
    mesh: null,
    mouse: null,
    targetMouse: null,
    isLocked: false,
    currentMode: 'galaxies',
    manualLayers: [],

    // Default Configuration
    defaultConfig: {
        mass: 1.0,
        spread: 1.0,
        layers: 3,
        density: 1.0,
        brightness: 1.0,
        showCore: 1.0,
        showForeground: 1.0,
        showCluster: 1.0,
        model: 0,

        // Toy Model Defaults
        wallDensity: 0.05,
        wallWidth: 0.05,

        // HSW Model Defaults
        hswDeltac: -0.8,
        hswRs: 0.9,
        hswAlpha: 4.0,
        hswBeta: 15.0
    },

    // Current Configuration (will be a copy of defaultConfig)
    config: null,
};

/**
 * Initialize the application
 */
function init() {
    // Initialize config as a copy of defaultConfig
    LensingApp.config = { ...LensingApp.defaultConfig };
    const { config } = LensingApp;

    // Initialize galaxy factory sprites
    GalaxyFactory.init();

    // Randomize credits
    LensingUtils.randomizeCredits();

    const container = document.getElementById('canvas-container');

    // Setup Orthographic Camera for 2D Shader Pass
    const frustumSize = 2.5;
    LensingApp.scene = new THREE.Scene();
    LensingApp.camera = new THREE.OrthographicCamera(
        -frustumSize / 2,
        frustumSize / 2,
        frustumSize / 2,
        -frustumSize / 2,
        0,
        1,
    );

    LensingApp.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    LensingApp.renderer.setSize(window.innerWidth, window.innerHeight);
    LensingApp.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(LensingApp.renderer.domElement);

    // Initialize mouse tracking
    LensingApp.mouse = new THREE.Vector2(0.5, 0.5);
    LensingApp.targetMouse = new THREE.Vector2(0.5, 0.5);

    // Create Textures
    const bgTex = LensingTextures.createBackgroundTexture(config.density);
    bgTex.wrapS = THREE.RepeatWrapping;
    bgTex.wrapT = THREE.RepeatWrapping;

    const clusterTex = LensingTextures.createClusterTexture(config.density);
    clusterTex.wrapS = THREE.ClampToEdgeWrapping;
    clusterTex.wrapT = THREE.ClampToEdgeWrapping;

    const fgTex = LensingTextures.createForegroundTexture(config.density);
    fgTex.wrapS = THREE.RepeatWrapping;
    fgTex.wrapT = THREE.RepeatWrapping;

    // --- HSW Data Texture Initialization ---
    // We use a Float32Array to store the deflection profile.
    // LuminanceFormat is used for maximum compatibility (WebGL 1 & 2).
    // 8192 size matches ui.js calculation.
    // FIX: Use RGBA (4 channels) and NearestFilter for maximum device compatibility.
    // Float textures with LinearFilter often fail on mobile/WebGL2 without extensions.
    const hswData = new Float32Array(8192 * 4);
    LensingApp.hswTexture = new THREE.DataTexture(hswData, 8192, 1, THREE.RGBAFormat, THREE.FloatType);

    LensingApp.hswTexture.minFilter = THREE.NearestFilter;
    LensingApp.hswTexture.magFilter = THREE.NearestFilter;
    LensingApp.hswTexture.needsUpdate = true;

    document.getElementById('loading').style.display = 'none';

    // Prepare uniforms for manual user uploads (up to 8 layers)
    const manualUniforms = {};
    for (let i = 0; i < 8; i++) {
        manualUniforms[`u_manual_tex_${i}`] = { value: null };
    }

    // Uniforms pass data from CPU to GPU (Shaders)
    const uniforms = {
        u_bg: { value: bgTex },
        ...manualUniforms,
        u_cluster: { value: clusterTex },
        u_fg: { value: fgTex },

        // HSW Texture passed to shader
        u_hsw_tex: { value: LensingApp.hswTexture },

        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_mass: { value: config.mass },
        u_spread: { value: config.spread },

        // Toy Model Parameters
        u_wall_density: { value: config.wallDensity },
        u_wall_width: { value: config.wallWidth },

        u_layers: { value: config.layers },
        u_brightness: { value: config.brightness },
        u_show_core: { value: config.showCore },
        u_show_foreground: { value: config.showForeground },
        u_show_cluster: { value: config.showCluster },
        u_model: { value: config.model },
        u_grid_mode: { value: 0.0 },
        u_use_manual: { value: 0.0 },
        u_time: { value: 0 },
    };

    LensingApp.material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: LensingShaders.vertexShader,
        fragmentShader: LensingShaders.fragmentShader,
    });

    LensingApp.mesh = new THREE.Mesh(new THREE.PlaneGeometry(frustumSize, frustumSize), LensingApp.material);
    LensingApp.scene.add(LensingApp.mesh);

    // Setup Event Listeners
    setupEventListeners();

    // Initialize UI
    LensingUI.initUI(
        LensingApp.config,
        LensingApp.defaultConfig,
        LensingApp.material,
        LensingApp.renderer,
        LensingApp.scene,
        LensingApp.camera,
    );

    // Start animation loop
    animate();
}

/**
 * Setup all event listeners for mouse, touch, and window
 */
function setupEventListeners() {
    const { renderer } = LensingApp;

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Mouse move handler
    window.addEventListener('mousemove', onMouseMove, false);

    // Variables to track touch movement for "tap" detection
    let touchStartTime = 0;
    const touchStartPos = new THREE.Vector2();

    // Touch handlers
    function handleTouchStart(e) {
        if (e.touches.length > 0) {
            e.preventDefault();
            touchStartTime = Date.now();
            touchStartPos.set(e.touches[0].clientX, e.touches[0].clientY);

            if (!LensingApp.isLocked) {
                LensingApp.targetMouse.x = e.touches[0].clientX / window.innerWidth;
                LensingApp.targetMouse.y = 1.0 - e.touches[0].clientY / window.innerHeight;
            }
        }
    }

    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            e.preventDefault();
            if (!LensingApp.isLocked) {
                LensingApp.targetMouse.x = e.touches[0].clientX / window.innerWidth;
                LensingApp.targetMouse.y = 1.0 - e.touches[0].clientY / window.innerHeight;
            }
        }
    }

    function handleTouchEnd(e) {
        const duration = Date.now() - touchStartTime;
        const touchEndPos = new THREE.Vector2(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        const distance = touchStartPos.distanceTo(touchEndPos);

        // If tap was short and didn't move
        if (duration < 300 && distance < 10) {
            e.preventDefault();
            toggleLock(e);
        }
    }

    // Attach listeners specifically to the canvas
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Standard mouse click for desktop
    renderer.domElement.addEventListener('click', toggleLock, false);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    LensingApp.material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    LensingApp.renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handle mouse movement
 * @param {MouseEvent} e - The mouse event
 */
function onMouseMove(e) {
    if (!LensingApp.isLocked) {
        // Normalize mouse to 0..1 range
        LensingApp.targetMouse.x = e.clientX / window.innerWidth;
        LensingApp.targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    }
}

/**
 * Toggle the lock state for the lens position
 * @param {Event} e - The event (mouse or touch)
 */
function toggleLock(e) {
    LensingApp.isLocked = !LensingApp.isLocked;
    const ind = document.getElementById('lock-indicator');
    const instruct = document.getElementById('instruct');
    const container = document.getElementById('canvas-container');

    if (LensingApp.isLocked) {
        ind.style.display = 'block';
        instruct.innerText = 'Click to Unlock';
        container.style.cursor = 'default';
    } else {
        ind.style.display = 'none';
        instruct.innerText = 'Drag to move • Click to Lock';
        container.style.cursor = 'crosshair';

        // Handle coordinates for both Mouse and Touch
        let cx;
        let cy;

        if (e.changedTouches && e.changedTouches.length > 0) {
            // It is a touch event
            cx = e.changedTouches[0].clientX;
            cy = e.changedTouches[0].clientY;
        } else if (e.clientX !== undefined) {
            // It is a mouse event
            cx = e.clientX;
            cy = e.clientY;
        }

        // Only update position if we found valid coordinates
        if (cx !== undefined) {
            LensingApp.targetMouse.x = cx / window.innerWidth;
            LensingApp.targetMouse.y = 1.0 - cy / window.innerHeight;
        }
    }
}

/**
 * Animation loop
 * @param {number} time - The current time
 */
function animate(time) {
    requestAnimationFrame(animate);

    const { material } = LensingApp;
    const { config } = LensingApp;
    const { mouse } = LensingApp;
    const { targetMouse } = LensingApp;

    // Smooth mouse movement
    mouse.x += (targetMouse.x - mouse.x) * 0.1;
    mouse.y += (targetMouse.y - mouse.y) * 0.1;

    // Update Uniforms
    material.uniforms.u_mouse.value.copy(mouse);
    material.uniforms.u_time.value = time * 0.001;
    material.uniforms.u_mass.value = config.mass;
    material.uniforms.u_spread.value = config.spread;

    // Pass Toy Model parameters to shader
    material.uniforms.u_wall_density.value = config.wallDensity;
    material.uniforms.u_wall_width.value = config.wallWidth;

    // Handle switching between manual upload layers and procedural layers
    if (LensingApp.manualLayers.length > 1) {
        material.uniforms.u_layers.value = LensingApp.manualLayers.length;
        material.uniforms.u_use_manual.value = 1.0;
    } else {
        material.uniforms.u_layers.value = config.layers;
        material.uniforms.u_use_manual.value = 0.0;
    }

    material.uniforms.u_brightness.value = config.brightness;
    material.uniforms.u_show_core.value = config.showCore;
    material.uniforms.u_show_foreground.value = config.showForeground;
    material.uniforms.u_show_cluster.value = config.showCluster;
    material.uniforms.u_model.value = config.model;

    LensingApp.renderer.render(LensingApp.scene, LensingApp.camera);
}

// Export for global access
window.LensingApp = LensingApp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
