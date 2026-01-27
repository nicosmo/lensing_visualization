/**
 * UI Module
 * Handles all user interface interactions, sliders, buttons, and event handlers
 */

// DOM Element References
let uiLayer;
let toggleBtn;
let massSlider;
let spreadSlider;
let layersSlider;
let brightSlider;
let densitySlider;
let coreCheck;
let fgCheck;
let clusterCheck;
let massLabel;
let spreadLabel;
let coreLabel;
let btnVoid;
let btnPoint;
let btnNFW;
let btnGalaxies;
let btnBW;
let btnCol;
let btnDotted;
let layerList;
let bgUploadInput;
let uploadLabel;
let densityLabelText;

// UI State
let isMin = false;

/**
 * Initialize all UI element references
 */
function initUIElements() {
    uiLayer = document.getElementById('ui-layer');
    toggleBtn = document.getElementById('toggle-btn');

    massSlider = document.getElementById('mass-slider');
    spreadSlider = document.getElementById('spread-slider');
    layersSlider = document.getElementById('layers-slider');
    brightSlider = document.getElementById('bright-slider');
    densitySlider = document.getElementById('density-slider');

    // Toy Model Sliders
    wallDensitySlider = document.getElementById('wall-density-slider');
    wallWidthSlider = document.getElementById('wall-width-slider');

    // HSW Sliders
    hswRsSlider = document.getElementById('hsw-rs-slider');
    hswAlphaSlider = document.getElementById('hsw-alpha-slider');
    hswBetaSlider = document.getElementById('hsw-beta-slider');

    coreCheck = document.getElementById('core-check');
    plotCheck = document.getElementById('plot-check');
    fgCheck = document.getElementById('fg-check');
    clusterCheck = document.getElementById('cluster-check');

    massLabel = document.getElementById('mass-label');
    spreadLabel = document.getElementById('spread-label');
    coreLabel = document.getElementById('core-label');

    btnVoid = document.getElementById('btn-model-void');
    btnPoint = document.getElementById('btn-model-point');
    btnNFW = document.getElementById('btn-model-nfw');

    btnGalaxies = document.getElementById('btn-galaxies');
    btnBW = document.getElementById('btn-bw');
    btnCol = document.getElementById('btn-col');
    btnDotted = document.getElementById('btn-dotted');

    layerList = document.getElementById('layer-list');
    bgUploadInput = document.getElementById('bg-upload');
    uploadLabel = document.getElementById('upload-label');
    densityLabelText = document.getElementById('density-label-text');

    // Plotting & Links
    plotContainer = document.getElementById('plot-container');
    plotCanvas = document.getElementById('mass-plot');
    hswLink = document.getElementById('hsw-link');
    btnHSW = document.getElementById('btn-model-hsw'); // Added HSW button
}

/**
 * Setup the toggle button for minimizing the UI panel
 */
function setupToggleButton() {
    toggleBtn.addEventListener('click', () => {
        isMin = !isMin;
        if (isMin) {
            uiLayer.classList.add('minimized');
            toggleBtn.innerText = '+';
        } else {
            uiLayer.classList.remove('minimized');
            toggleBtn.innerText = '–';
        }
    });

    // Check for mobile start
    if (window.innerWidth < 768) {
        uiLayer.classList.add('minimized');
        toggleBtn.innerText = '+';
    }
}

/**
 * Perform high-precision CPU calculation for HSW deflection.
 * Stores result in the global DataTexture `LensingApp.hswTexture`.
 */
function updateHSWLookup(config) {
    if (!LensingApp.hswTexture) return;

    // TEXTURE RESOLUTION
    const size = 8192;
    const data = LensingApp.hswTexture.image.data;

    // PARAMETERS
    const dc = config.hswDeltac;
    const rs = config.hswRs;
    const alpha = config.hswAlpha;
    const beta = config.hswBeta;

    // INTEGRATION BOUNDS
    // max_r = 20.0 ensures we capture the long gravitational tail.
    const max_r = 20.0;
    const dr = max_r / size;

    // DEPTH SETTINGS
    // z_max matches max_r for isotropic integration
    const z_max = max_r;
    const z_steps = 1000;
    const dz = z_max / z_steps;

    // Helper: HSW Density Profile
    function getDensityHSW(r_3d) {
        if (r_3d < 0.0001) return dc;

        let x = r_3d / rs;
        let term1 = 1.0 - Math.pow(x, alpha);
        let term2 = 1.0 + Math.pow(x, beta);

        return dc * term1 / term2;
    }

    // --- CYLINDRICAL INTEGRATION ---
    let current_mass_2d = 0.0;

    for (let i = 0; i < size; i++) {
        let R = (i + 0.5) * dr; // Distance on sky

        // 1. Calculate Surface Density Sigma(R)
        let sigma = 0.0;

        for (let j = 0; j < z_steps; j++) {
            let z = (j + 0.5) * dz;
            let r_3d = Math.sqrt(R*R + z*z);
            sigma += getDensityHSW(r_3d);
        }
        // Multiply by dz and 2.0 (symmetry: -z to +z)
        sigma *= 2.0 * dz;

        // 2. Add to Enclosed Mass (Cylindrical Shell)
        current_mass_2d += sigma * R * dr;

        // 3. Store Deflection: Mass / R
        if (R < 0.001) {
            data[i * 4] = 0.0;
        } else {
            // Store Absolute Value to avoid texture clipping negative numbers
            data[i * 4] = Math.abs(current_mass_2d / R);
        }
    }

    LensingApp.hswTexture.needsUpdate = true;
}

function updatePlot() {
    if (!plotCheck || !plotCheck.checked || !LensingApp.config) return;
    drawMassPlot(LensingApp.config, plotCanvas);
}

function drawMassPlot(config, canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // --- 1. Setup Plot Constants ---
    const yZero = h / 2;
    const maxR = 2.5; // Plot shows up to 2.5x radius

    // Calculate x-position for the Radius Marker (r = 1.0 unit)
    const x_marker = (1.0 / maxR) * w;

    // --- 2. Draw Axes & Markers ---
    ctx.lineWidth = 1;

    // X-Axis (Mean Density Line)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(0, yZero); ctx.lineTo(w, yZero); ctx.stroke();

    // Vertical Marker (Dashed)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(x_marker, 0); ctx.lineTo(x_marker, h); ctx.stroke();
    ctx.setLineDash([]); // Reset to solid

    // Y-Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h); ctx.stroke();

    // --- 3. Draw Density Curve ---
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let px = 0; px < w; px++) {
        const rNorm = (px / w) * maxR;
        let val = 0;

        if (config.model === 1) { // NFW
            let x = Math.max(rNorm, 0.02);
            val = 0.15 / (x * (1.0+x) * (1.0+x));
        } else if (config.model === 2) { // Toy Void
            const din = config.mass - 1.0;
            const dwall = config.wallDensity;
            const w_wall = config.wallWidth;

            if (rNorm < 0.05) val = din;
            else if (rNorm < 1.0) {
                let u = (rNorm - 0.05)/0.95;
                val = din + (dwall - din) * u * u;
            } else if (rNorm < 1.0 + w_wall) {
                let u = (rNorm - 1.0)/w_wall;
                val = dwall * (1.0 - u) * (1.0 - u);
            } else {
                val = 0;
            }
        } else if (config.model === 3) { // HSW
            const dc = config.hswDeltac;
            const rs = config.hswRs;
            const a = config.hswAlpha;
            const b = config.hswBeta;
            let term1 = 1.0 - Math.pow(rNorm / rs, a);
            let term2 = 1.0 + Math.pow(rNorm, b);
            val = dc * term1 / term2;
        }

        // Scale Y
        const plotY = yZero - (val * (h * 0.4));

        if (px === 0) ctx.moveTo(px, plotY);
        else ctx.lineTo(px, plotY);
    }
    ctx.stroke();

    // --- 4. Draw Labels ---
    ctx.fillStyle = '#aaa';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';

    // Main Title
    ctx.fillText('Density (δ) vs Radius', w - 6, 12);

    // Context-Sensitive Labels for the Vertical Marker
    let markerLabel = 'Void Radius'; // Default for Toy (2) & HSW (3)
    if (config.model === 1) markerLabel = 'Halo Radius'; // Specific for NFW

    // Vertical Marker Label (Bottom)
    ctx.textAlign = 'center';
    ctx.fillText(markerLabel, x_marker, h - 4);

    // Horizontal Axis Label (Mean Density) - positioned above the line
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Mean Density', 2, yZero + 12);
}


/**
 * Setup all slider event listeners
 * @param {Object} config - The configuration object to update
 * @param {Object} material - The Three.js material with uniforms
 */
function setupSliders(config, material) {
    const updateAll = () => {
        if (config.model === 3) updateHSWLookup(config);
        updatePlot();
    };

    massSlider.addEventListener('input', (e) => {
        config.mass = e.target.value / 100;

        // For HSW, link mass slider to delta_c
        if (config.model === 3) {
            config.hswDeltac = config.mass - 1.0;
        }

        document.getElementById('mass-val').innerText = `${e.target.value}%`;
        updateAll();
    });

    spreadSlider.addEventListener('input', (e) => {
        config.spread = e.target.value / 100;
        document.getElementById('spread-val').innerText = `${(e.target.value / 100).toFixed(2)}x`;
        updateAll();
    });

    // --- Toy Model Sliders ---
    wallDensitySlider.addEventListener('input', (e) => {
        config.wallDensity = e.target.value / 100;
        document.getElementById('wall-density-val').innerText = config.wallDensity.toFixed(2);
        material.uniforms.u_wall_density.value = config.wallDensity;
        updateAll();
    });

    wallWidthSlider.addEventListener('input', (e) => {
        config.wallWidth = e.target.value / 100;
        document.getElementById('wall-width-val').innerText = (1.0 + config.wallWidth).toFixed(2) + "x";
        material.uniforms.u_wall_width.value = config.wallWidth;
        updateAll();
    });

    // --- HSW Sliders ---
    hswRsSlider.addEventListener('input', (e) => {
        config.hswRs = e.target.value / 100;
        document.getElementById('hsw-rs-val').innerText = config.hswRs.toFixed(2);
        updateAll();
    });

    hswAlphaSlider.addEventListener('input', (e) => {
        config.hswAlpha = e.target.value / 10.0;
        document.getElementById('hsw-alpha-val').innerText = config.hswAlpha.toFixed(1);
        updateAll();
    });

    hswBetaSlider.addEventListener('input', (e) => {
        config.hswBeta = e.target.value / 10.0;
        document.getElementById('hsw-beta-val').innerText = config.hswBeta.toFixed(1);
        updateAll();
    });

    // --- Standard Sliders ---
    layersSlider.addEventListener('input', (e) => {
        config.layers = parseFloat(e.target.value);
        document.getElementById('layers-val').innerText = e.target.value;
    });

    brightSlider.addEventListener('input', (e) => {
        config.brightness = e.target.value / 100;
        document.getElementById('bright-val').innerText = `${e.target.value}%`;
    });

    densitySlider.addEventListener('input', (e) => {
        document.getElementById('density-val').innerText = `${e.target.value}%`;
    });

    densitySlider.addEventListener('change', (e) => {
        config.density = e.target.value / 100;

        const newCluster = LensingTextures.createClusterTexture(config.density);
        newCluster.wrapS = THREE.ClampToEdgeWrapping;
        newCluster.wrapT = THREE.ClampToEdgeWrapping;
        material.uniforms.u_cluster.value = newCluster;

        const newFg = LensingTextures.createForegroundTexture(config.density);
        newFg.wrapS = THREE.RepeatWrapping;
        newFg.wrapT = THREE.RepeatWrapping;
        material.uniforms.u_fg.value = newFg;

        if (LensingApp.currentMode === 'galaxies') {
            const newBg = LensingTextures.createBackgroundTexture(config.density);
            newBg.wrapS = THREE.RepeatWrapping;
            newBg.wrapT = THREE.RepeatWrapping;
            material.uniforms.u_bg.value = newBg;
        } else if (LensingApp.currentMode === 'dotted-grid') {
            const newBg = LensingTextures.createDottedGridTexture(config.density);
            newBg.wrapS = THREE.RepeatWrapping;
            newBg.wrapT = THREE.RepeatWrapping;
            material.uniforms.u_bg.value = newBg;
        }
    });

    // Plot Toggle
    plotCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            plotContainer.style.display = 'block';
            updatePlot();
        } else {
            plotContainer.style.display = 'none';
        }
    });
}

/**
 * Setup checkbox event listeners
 * @param {Object} config - The configuration object to update
 */
function setupCheckboxes(config) {
    coreCheck.addEventListener('change', (e) => {
        config.showCore = e.target.checked ? 1.0 : 0.0;
    });

    fgCheck.addEventListener('change', (e) => {
        config.showForeground = e.target.checked ? 1.0 : 0.0;
    });

    clusterCheck.addEventListener('change', (e) => {
        config.showCluster = e.target.checked ? 1.0 : 0.0;
    });
}

/**
 * Set the physics model and update UI labels
 * @param {number} modelIndex - The model index (0=Point Mass, 1=NFW, 2=Void)
 * @param {Object} config - The configuration object to update
 */
function setModel(modelIndex, config) {
    config.model = modelIndex;
    const modelBtns = document.querySelectorAll('.model-btn');
    modelBtns.forEach((b) => b.classList.remove('active'));
    // Limit slider to 100% for HSW (Strictly Void), allow 200% for others
    if (modelIndex === 3) massSlider.max = 100;
    else massSlider.max = 200;

    if (modelIndex === 0) btnPoint.classList.add('active');
    else if (modelIndex === 1) btnNFW.classList.add('active');
    else if (modelIndex === 2) btnVoid.classList.add('active');
    else if (modelIndex === 3) btnHSW.classList.add('active');

    // --- UI Visibility ---
    const groupWallD = document.getElementById('group-wall-density');
    const groupWallW = document.getElementById('group-wall-width');
    const groupHswRs = document.getElementById('group-hsw-rs');
    const groupHswA = document.getElementById('group-hsw-alpha');
    const groupHswB = document.getElementById('group-hsw-beta');
    const groupPlot = document.getElementById('group-plot-toggle');

    // Reset visibility
    groupWallD.style.display = 'none';
    groupWallW.style.display = 'none';
    groupHswRs.style.display = 'none';
    groupHswA.style.display = 'none';
    groupHswB.style.display = 'none';
    hswLink.style.display = 'none';

    if (modelIndex === 0) {
        groupPlot.style.display = 'none';
    } else {
        groupPlot.style.display = 'block';
        // Ensure the container is visible if the box is checked
        if (plotCheck.checked) {
            plotContainer.style.display = 'block';
        }
    }

    if (modelIndex === 2) { // Toy Model
        massLabel.firstChild.textContent = 'Inner Density (% Mean)';
        spreadLabel.firstChild.textContent = 'Void Radius';
        coreLabel.childNodes[0].textContent = 'Show Void Boundary ';

        groupWallD.style.display = 'block';
        groupWallW.style.display = 'block';

        // Defaults
        if (config.mass > 0.5) config.mass = 0.2;
        massSlider.value = config.mass * 100;
        document.getElementById('mass-val').innerText = (config.mass * 100).toFixed(0) + '%';

        coreCheck.checked = true;
        config.showCore = 1.0;

    } else if (modelIndex === 3) { // HSW Model
        massLabel.firstChild.textContent = 'Inner Density (Delta_c)';
        spreadLabel.firstChild.textContent = 'Void Radius';
        coreLabel.childNodes[0].textContent = 'Show Void Boundary ';

        groupHswRs.style.display = 'block';
        groupHswA.style.display = 'block';
        groupHswB.style.display = 'block';
        hswLink.style.display = 'block';

        // Set HSW Defaults
        config.mass = 0.2; // 20% -> -0.8
        config.hswDeltac = -0.8;
        config.hswRs = 0.9;
        config.hswAlpha = 4.0;
        config.hswBeta = 15.0;

        massSlider.value = 20;
        document.getElementById('mass-val').innerText = '20%';

        hswRsSlider.value = 90;
        document.getElementById('hsw-rs-val').innerText = '0.90';

        hswAlphaSlider.value = 40;
        document.getElementById('hsw-alpha-val').innerText = '4.0';

        hswBetaSlider.value = 150;
        document.getElementById('hsw-beta-val').innerText = '15.0';

        updateHSWLookup(config);

    } else { // Point or NFW
        massLabel.firstChild.textContent = 'Cluster Mass';
        spreadLabel.firstChild.textContent = 'Cluster Spread';
        coreLabel.childNodes[0].textContent = 'Show Dark Matter Halo ';

        // ALWAYS reset to 100% when switching to a Cluster model
        // This ensures consistent behavior coming from ANY void settings
        config.mass = 1.0;
        massSlider.value = 100;
        document.getElementById('mass-val').innerText = '100%';
    }

    updatePlot();
}

/**
 * Setup model selection buttons
 * @param {Object} config - The configuration object to update
 */
function setupModelButtons(config) {
    const modelBtns = document.querySelectorAll('.model-btn');
    modelBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            setModel(parseFloat(btn.dataset.model), config);
        });
    });
}

/**
 * Update the texture based on selected background type
 * @param {string} type - The texture type
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function updateTexture(type, config, material) {
    let newTex;

    if (type !== 'upload') {
        clearManualLayers(config, material);
    }

    material.uniforms.u_grid_mode.value = 0.0;

    if (type === 'galaxies') {
        newTex = LensingTextures.createBackgroundTexture(config.density);
    } else if (type === 'bw-grid') {
        newTex = LensingTextures.createBWGridTexture();
    } else if (type === 'color-grid') {
        newTex = LensingTextures.createColorGridTexture();
        material.uniforms.u_grid_mode.value = 1.0;
    } else if (type === 'dotted-grid') {
        newTex = LensingTextures.createDottedGridTexture(config.density);
    }

    if (newTex) {
        newTex.wrapS = THREE.RepeatWrapping;
        newTex.wrapT = THREE.RepeatWrapping;
        material.uniforms.u_bg.value = newTex;
    }
}

/**
 * Set the background mode and update UI
 * @param {string} mode - The background mode
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function setBgMode(mode, config, material) {
    LensingApp.currentMode = mode;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((b) => b.classList.remove('active'));

    if (mode === 'galaxies') btnGalaxies.classList.add('active');
    else if (mode === 'bw-grid') btnBW.classList.add('active');
    else if (mode === 'color-grid') btnCol.classList.add('active');
    else if (mode === 'dotted-grid') btnDotted.classList.add('active');

    updateTexture(mode, config, material);

    if (mode === 'galaxies') {
        densitySlider.disabled = false;
        if (densityLabelText) densityLabelText.innerText = 'Galaxy Density';

        // Reset to default 3 layers for Galaxies
        config.layers = 3;
        layersSlider.value = 3;
        document.getElementById('layers-val').innerText = '3';
    } else {
        // For all grids, default to 1 layer
        config.layers = 1;
        layersSlider.value = 1;
        document.getElementById('layers-val').innerText = '1';

        if (mode === 'dotted-grid') {
            densitySlider.disabled = false;
            if (densityLabelText) densityLabelText.innerText = 'Grid Point Density';
        } else {
            densitySlider.disabled = true;
            if (densityLabelText) densityLabelText.innerText = 'Galaxy Density';
        }
    }
}

/**
 * Setup background preset buttons
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function setupPresetButtons(config, material) {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            setBgMode(btn.dataset.type, config, material);
        });
    });
}

/**
 * Update the layer list UI for manual uploads
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function updateLayerUI(config, material) {
    const { manualLayers } = LensingApp;
    layerList.innerHTML = '';

    manualLayers.forEach((layer, index) => {
        const item = document.createElement('div');
        item.className = 'layer-item';

        const name = document.createElement('span');
        name.className = 'layer-name';
        name.innerText = `Layer ${index + 1}: ${layer.name}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-layer-btn';
        removeBtn.innerText = '×';
        removeBtn.onclick = () => removeLayer(index, config, material);

        item.appendChild(name);
        item.appendChild(removeBtn);
        layerList.appendChild(item);
    });

    if (manualLayers.length > 0) {
        densitySlider.disabled = true;
    } else if (LensingApp.currentMode === 'galaxies' || LensingApp.currentMode === 'dotted-grid') {
        densitySlider.disabled = false;
    }

    if (manualLayers.length === 0) {
        uploadLabel.innerText = 'Add Own Background Image';
        uploadLabel.style.display = 'block';
    } else if (manualLayers.length < 8) {
        uploadLabel.innerText = `Add Background Layer ${manualLayers.length + 1}`;
        uploadLabel.style.display = 'block';
    } else {
        uploadLabel.style.display = 'none';
    }

    // Lock layer count slider if using manual layers
    if (manualLayers.length > 1) {
        layersSlider.disabled = true;
        layersSlider.value = manualLayers.length;
        document.getElementById('layers-val').innerText = manualLayers.length;
    } else {
        layersSlider.disabled = false;
        layersSlider.value = config.layers;
        document.getElementById('layers-val').innerText = config.layers;
    }

    for (let i = 0; i < 8; i++) {
        material.uniforms[`u_manual_tex_${i}`].value = null;
    }

    if (manualLayers.length > 0) {
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach((b) => b.classList.remove('active'));
        LensingApp.currentMode = 'upload';

        manualLayers.forEach((layer, i) => {
            material.uniforms[`u_manual_tex_${i}`].value = layer.texture;
        });

        if (manualLayers.length === 1) {
            material.uniforms.u_bg.value = manualLayers[0].texture;
        }
    }
}

/**
 * Remove a layer from manual layers
 * @param {number} index - Index of the layer to remove
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function removeLayer(index, config, material) {
    LensingApp.manualLayers.splice(index, 1);
    if (LensingApp.manualLayers.length === 0) {
        setBgMode('galaxies', config, material);
    } else {
        updateLayerUI(config, material);
    }
}

/**
 * Clear all manual layers
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function clearManualLayers(config, material) {
    if (LensingApp.manualLayers.length === 0) return;
    LensingApp.manualLayers = [];
    updateLayerUI(config, material);
}

/**
 * Setup file upload handler
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function setupFileUpload(config, material) {
    bgUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type || !file.type.startsWith('image/')) {
            // Not an image file; ignore this upload
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const tex = new THREE.Texture(img);
                tex.needsUpdate = true;
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;

                // If it's the first image, default to 1 layer
                if (LensingApp.manualLayers.length === 0) {
                    config.layers = 1;
                }

                LensingApp.manualLayers.push({ texture: tex, name: file.name });
                updateLayerUI(config, material);
            };
            img.onerror = function () {
                console.error('Error loading image from uploaded file:', file && file.name);
                alert('Failed to load the image. The file may be corrupted or in an unsupported format.');
            };
            img.src = event.target.result;
        };
        reader.onerror = function () {
            console.error('Error reading uploaded file:', reader.error);
            alert('Failed to read the selected file. Please try again with a valid image file.');
        };
        reader.readAsDataURL(file);
        bgUploadInput.value = '';
    });
}

/**
 * Setup reshuffle button
 * @param {Object} config - The configuration object
 * @param {Object} material - The Three.js material
 */
function setupReshuffleButton(config, material) {
    document.getElementById('reshuffle-btn').addEventListener('click', () => {
        LensingUtils.randomizeCredits();
        LensingUtils.randomizeMasterSeed();

        const newCluster = LensingTextures.createClusterTexture(config.density);
        newCluster.wrapS = THREE.ClampToEdgeWrapping;
        newCluster.wrapT = THREE.ClampToEdgeWrapping;
        material.uniforms.u_cluster.value = newCluster;

        const newFg = LensingTextures.createForegroundTexture(config.density);
        newFg.wrapS = THREE.RepeatWrapping;
        newFg.wrapT = THREE.RepeatWrapping;
        material.uniforms.u_fg.value = newFg;

        if (LensingApp.currentMode === 'galaxies') {
            const newBg = LensingTextures.createBackgroundTexture(config.density);
            newBg.wrapS = THREE.RepeatWrapping;
            newBg.wrapT = THREE.RepeatWrapping;
            material.uniforms.u_bg.value = newBg;
        } else if (LensingApp.currentMode === 'dotted-grid') {
            const newBg = LensingTextures.createDottedGridTexture(config.density);
            newBg.wrapS = THREE.RepeatWrapping;
            newBg.wrapT = THREE.RepeatWrapping;
            material.uniforms.u_bg.value = newBg;
        }
    });
}

/**
 * Setup reset button
 * @param {Object} config - The configuration object
 * @param {Object} defaultConfig - The default configuration
 * @param {Object} material - The Three.js material
 */
function setupResetButton(config, defaultConfig, material) {
    document.getElementById('reset-main').addEventListener('click', () => {
        LensingUtils.randomizeCredits();
        Object.assign(config, defaultConfig);

        massSlider.value = 100;
        document.getElementById('mass-val').innerText = '100%';

        spreadSlider.value = 100;
        document.getElementById('spread-val').innerText = '1.00x';

        layersSlider.value = 3;
        document.getElementById('layers-val').innerText = '3';

        densitySlider.value = 100;
        document.getElementById('density-val').innerText = '100%';

        brightSlider.value = 100;
        document.getElementById('bright-val').innerText = '100%';

        coreCheck.checked = true;

        if (fgCheck) {
            fgCheck.checked = true;
            config.showForeground = 1.0;
        }
        if (clusterCheck) {
            clusterCheck.checked = true;
            config.showCluster = 1.0;
        }

        setModel(0, config);
        LensingApp.manualLayers = [];
        updateLayerUI(config, material);
        setBgMode('galaxies', config, material);

        const newCluster = LensingTextures.createClusterTexture(config.density);
        newCluster.wrapS = THREE.ClampToEdgeWrapping;
        newCluster.wrapT = THREE.ClampToEdgeWrapping;
        material.uniforms.u_cluster.value = newCluster;

        const newFg = LensingTextures.createForegroundTexture(config.density);
        newFg.wrapS = THREE.RepeatWrapping;
        newFg.wrapT = THREE.RepeatWrapping;
        material.uniforms.u_fg.value = newFg;
    });
}

/**
 * Setup snapshot button
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The Three.js camera
 */
function setupSnapshotButton(renderer, scene, camera) {
    document.getElementById('snapshot-btn').addEventListener('click', () => {
        // 1. Render the 3D scene fresh
        renderer.render(scene, camera);

        // 2. Create a temporary 2D canvas
        const virtualCanvas = document.createElement('canvas');
        virtualCanvas.width = renderer.domElement.width;
        virtualCanvas.height = renderer.domElement.height;
        const ctx = virtualCanvas.getContext('2d');

        // 3. Draw the WebGL rendered image
        ctx.drawImage(renderer.domElement, 0, 0);

        // 4. Configure Text
        const text = 'nicosmo.github.io/lensing_visualization/';
        const fontSize = Math.max(12, Math.floor(virtualCanvas.width * 0.012));
        ctx.font = `300 ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // 5. Calculate positions & Measure text for the background box
        const marginX = virtualCanvas.width * 0.02;
        const x = virtualCanvas.width - marginX;
        const y = virtualCanvas.height - 15;

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const padding = fontSize * 0.5;
        const boxHeight = fontSize + padding;

        // 6. Draw the Dark Background Box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - textWidth - padding, y - fontSize - padding / 2, textWidth + padding * 2, boxHeight);

        // 7. Draw the Text on top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillText(text, x, y);

        // 8. Save
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.download = `gravitational_lens_${timestamp}.png`;
        link.href = virtualCanvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

/**
 * Initialize all UI components
 * @param {Object} config - The configuration object
 * @param {Object} defaultConfig - The default configuration
 * @param {Object} material - The Three.js material
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The Three.js camera
 */
function initUI(config, defaultConfig, material, renderer, scene, camera) {
    initUIElements();
    setupToggleButton();
    setupSliders(config, material);
    setupCheckboxes(config);
    setupModelButtons(config);
    setupPresetButtons(config, material);
    setupFileUpload(config, material);
    setupReshuffleButton(config, material);
    setupResetButton(config, defaultConfig, material);
    setupSnapshotButton(renderer, scene, camera);
}

// Export for use in other modules
window.LensingUI = {
    initUI,
    setModel,
    setBgMode,
    updateLayerUI,
};
