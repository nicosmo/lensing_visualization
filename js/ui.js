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

    coreCheck = document.getElementById('core-check');
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
 * Setup all slider event listeners
 * @param {Object} config - The configuration object to update
 * @param {Object} material - The Three.js material with uniforms
 */
function setupSliders(config, material) {
    massSlider.addEventListener('input', (e) => {
        config.mass = e.target.value / 100;
        document.getElementById('mass-val').innerText = `${e.target.value}%`;
    });

    spreadSlider.addEventListener('input', (e) => {
        config.spread = e.target.value / 100;
        document.getElementById('spread-val').innerText = `${(e.target.value / 100).toFixed(2)}x`;
    });

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

    // When density changes, we must regenerate the textures
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

    if (modelIndex === 0) btnPoint.classList.add('active');
    else if (modelIndex === 1) btnNFW.classList.add('active');
    else if (modelIndex === 2) btnVoid.classList.add('active');

    // Update UI Labels and Defaults based on Model
    if (modelIndex === 2) {
        // Voids
        massLabel.firstChild.textContent = 'Void Inner Density (% Mean)';
        spreadLabel.firstChild.textContent = 'Void Radius';
        coreLabel.childNodes[0].textContent = 'Show Void Boundary & Center ';

        // Set Defaults for Voids
        config.mass = 0.4;
        massSlider.value = 40;
        document.getElementById('mass-val').innerText = '40%';

        config.spread = 1.0;
        spreadSlider.value = 100;
        document.getElementById('spread-val').innerText = '1.00x';

        coreCheck.checked = true;
        config.showCore = 1.0;
    } else {
        massLabel.firstChild.textContent = 'Cluster Mass';
        spreadLabel.firstChild.textContent = 'Cluster Spread';
        coreLabel.childNodes[0].textContent = 'Show Dark Matter Halo ';

        // Restore defaults if moving away
        if (Number(massSlider.value) === 40 && Number(spreadSlider.value) === 100) {
            config.mass = 1.0;
            massSlider.value = 100;
            document.getElementById('mass-val').innerText = '100%';
        }
    }
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
