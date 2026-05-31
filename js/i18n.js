/**
 * Internationalization dictionary for the Lensing Visualization tool.
 * English is the current source text. German mirrors English for now.
 */


const LensingI18n = {
    en: {
        appTitle: 'Lensing Visualization',
        loading: 'Generating Galaxy Field...',
        locked: 'LOCKED',
        toggleSettings: 'Toggle Settings',
        intro: 'Interactive visualization of a massive cluster or a cosmic void bending light from background layers. A qualitative and exaggerated representation of lensing effects.',
        credits: 'Concept & Visualization by Nico Schuster and Andres Salcedo',
        githubLink: 'Code and more info on GitHub',
        arxivLink: 'Paper on arXiv (2603.18145)',
        translationCredit: 'Translated by Nico Schuster',
        physicsModel: 'Physics Model',
        backgroundSource: 'Background Source',
        modelPoint: 'Point Mass',
        modelNFW: 'NFW Halo',
        modelElliptical: 'Elliptical Halo',
        modelVoid: 'Void Toy Model',
        modelHSW: 'HSW Void',
        addOwnBackgroundImage: 'Add Own Background Image',
        clusterMass: 'Cluster Mass',
        clusterSpread: 'Cluster Spread',
        innerDensityPercentMean: 'Inner Density (% Mean)',
        innerDensityDeltaC: 'Inner Density (Delta_c)',
        ellipticity: 'Ellipticity (q = 1 - e)',
        positionAngle: 'Position Angle (deg)',
        wallPeakDensity: 'Wall Peak Density',
        wallOuterEdge: 'Wall Outer Edge',
        scaleRadius: 'Scale Radius (r_s / r_v)',
        innerSlope: 'Inner Slope (α)',
        outerSlope: 'Outer Slope (β)',
        numberOfBackgroundLayers: 'Number Of Background Layers',
        galaxyDensity: 'Galaxy Density',
        gridDensity: 'Grid Density',
        gridPointDensity: 'Grid Point Density',
        dotSize: 'Dot Size',
        galaxyBrightness: 'Galaxy Brightness',
        brightness: 'Brightness',
        showCausticLines: 'Show Caustic Lines',
        basedOnLenstronomy: 'Based on GitHub:lenstronomy',
        showVoidBoundary: 'Show Void Boundary',
        reshuffleGalaxies: 'Reshuffle Galaxies',
        saveSnapshot: 'Save Snapshot',
        resetAllSettings: 'Reset All Settings',
        dragToMove: 'Drag to move • Click to Lock',
        clickToUnlock: 'Click to Unlock',
        viewHswPaper: 'View HSW Paper (arXiv:1403.5499) ↗',
        galaxies: 'Galaxies',
        bwLineGrid: 'B&W Line Grid',
        colorLineGrid: 'Color Line Grid',
        colorDottedGrid: 'Color Dotted Grid',
        showForegroundGalaxies: 'Show Foreground Galaxies',
        showClusterMemberGalaxies: 'Show Cluster Member Galaxies',
        showDarkMatterHalo: 'Show Dark Matter Halo',
        showMassDistribution: 'Show Mass Distribution',
        voidRadius: 'Void Radius',
        coreRadius: 'Core Radius',
        htmlTitle: 'Visualizing Gravitational Lensing',
        htmlDescription: 'Interactive visualization of gravitational lensing effects from galaxy clusters and cosmic voids',
        appleWebAppTitle: 'Lensing Viz',
        manifestName: 'Gravitational Lensing Visualization',
        manifestShortName: 'Lensing Viz',
        manifestDescription: 'Interactive visualization of gravitational lensing effects from galaxy clusters and cosmic voids',
        addBackgroundLayer: 'Add Background Layer',
        haloRadius: 'Halo Radius',
        voidRadiusLabel: 'Void Radius',
        imageLoadFailed: 'Failed to load the image. The file may be corrupted or in an unsupported format.',
        fileReadFailed: 'Failed to read the selected file. Please try again with a valid image file.',
        densityVsRadius: 'Density (δ) vs Radius',
        meanDensityLabel: 'Mean Density',
        layer: 'Layer'
    },
    de: {
        appTitle: 'Lensing Visualization',
        loading: 'Generiere Galaxienverteilung...',
        locked: 'FESTGESETZT',
        toggleSettings: 'Einstellungen umschalten',
        intro: 'Interaktive Visualisierung eines massiven Clusters oder eines kosmischen Voids, der Licht von den dahinter liegenden Ebenen ablenkt. Eine qualitative und übertreibende Darstellung von Gravitationslinseneffekten.',
        credits: 'Konzept & Visualisierung durch Nico Schuster und Andres Salcedo',
        githubLink: 'Code und weitere Informationen auf GitHub',
        arxivLink: 'Veröffentlichung auf arXiv (2603.18145)',
        translationCredit: 'Übersetzt von Nico Schuster',
        physicsModel: 'Physikalisches Modell',
        backgroundSource: 'Hintergrundquelle',
        modelPoint: 'Punktmasse',
        modelNFW: 'NFW-Halo',
        modelElliptical: 'Elliptisches Halo',
        modelVoid: 'Vereinfachtes Voidmodell',
        modelHSW: 'HSW Void',
        addOwnBackgroundImage: 'Eigenes Hintergrundbild hinzufügen',
        clusterMass: 'Cluster-Masse',
        clusterSpread: 'Cluster-Ausdehnung',
        innerDensityPercentMean: 'Innere Dichte (% mittlere Dichte)',
        innerDensityDeltaC: 'Innere Dichte (Delta_c)',
        ellipticity: 'Elliptizität (q = 1 - e)',
        positionAngle: 'Winkel (grad)',
        wallPeakDensity: 'Höchste Wand-Dichte',
        wallOuterEdge: 'Äußeres Ende der Wand',
        scaleRadius: 'Skalierungs-Radius (r_s / r_v)',
        innerSlope: 'Inneres Gefälle (α)',
        outerSlope: 'Äußeres Gefälle (β)',
        numberOfBackgroundLayers: 'Anzahl an Hintergrundebenen',
        galaxyDensity: 'Galaxiendichte',
        gridDensity: 'Gitterdichte',
        gridPointDensity: 'Gitterpunktdichte',
        dotSize: 'Punkt Größe',
        galaxyBrightness: 'Helligkeit der Galaxien',
        brightness: 'Helligkeit',
        showCausticLines: 'Zeige Caustic Linien',
        basedOnLenstronomy: 'Basierend auf GitHub:lenstronomy',
        showVoidBoundary: 'Zeige Void-Grenze',
        reshuffleGalaxies: 'Galaxien neu anordnen',
        saveSnapshot: 'Snapshot speichern',
        resetAllSettings: 'Alle Einstellungen zurücksetzen',
        dragToMove: 'Ziehen zum Bewegen • Klicken zum Sperren',
        clickToUnlock: 'Klicken zum Entsperren',
        viewHswPaper: 'Siehe HSW Paper (arXiv:1403.5499) ↗',
        galaxies: 'Galaxien',
        bwLineGrid: 'S&W Rasterlinien',
        colorLineGrid: 'Farbige Rasterlinien',
        colorDottedGrid: 'Farbige Gitterpunkte',
        showForegroundGalaxies: 'Zeige Vordergrund-Galaxien',
        showClusterMemberGalaxies: 'Zeige Cluster-Galaxien',
        showDarkMatterHalo: 'Zeige Dunkle Materie-Halo',
        showMassDistribution: 'Zeige Massenverteilung',
        voidRadius: 'Void Radius',
        coreRadius: 'Kernradius',
        htmlTitle: 'Visualizing Gravitational Lensing',
        htmlDescription: 'Interactive Visualisierung des Gravitationslinseneffects von Galaxiencluster und Voids',
        appleWebAppTitle: 'Lensing Viz',
        manifestName: 'Gravitational Lensing Visualization',
        manifestShortName: 'Lensing Viz',
        manifestDescription: 'Interactive Visualisierung des Gravitationslinseneffects von Galaxiencluster und Voids',
        addBackgroundLayer: 'Füge Hintergrundebene hinzu',
        haloRadius: 'Halo Radius',
        voidRadiusLabel: 'Void Radius',
        imageLoadFailed: 'Das Bild konnte nicht geladen werden. Die Datei ist möglicherweise beschädigt oder hat ein nicht unterstütztes Format.',
        fileReadFailed: 'Die ausgewählte Datei konnte nicht gelesen werden. Bitte versuche es erneut mit einer gültigen Bilddatei.',
        densityVsRadius: 'Dichte (δ) vs Radius',
        meanDensityLabel: 'Mittlere Dichte',
        layer: 'Ebene'
    }
};

LensingI18n.currentLang = 'en';

LensingI18n.t = function t(key, lang = LensingI18n.currentLang) {
    if (LensingI18n[lang] && LensingI18n[lang][key] !== undefined) {
        return LensingI18n[lang][key];
    }
    if (LensingI18n.en[key] !== undefined) {
        return LensingI18n.en[key];
    }
    return key;
};

LensingI18n.setLanguage = function setLanguage(lang) {
    const nextLang = LensingI18n[lang] ? lang : 'en';
    LensingI18n.currentLang = nextLang;
    document.documentElement.lang = nextLang;
    return nextLang;
};

LensingI18n.getAvailableLanguages = function getAvailableLanguages() {
    return Object.keys(LensingI18n).filter((key) => typeof LensingI18n[key] === 'object' && LensingI18n[key] !== null);
};

LensingI18n.getLanguageLabel = function getLanguageLabel(code, uiLang = LensingI18n.currentLang) {
    try {
        if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
            const names = new Intl.DisplayNames([uiLang], { type: 'language' });
            const label = names.of(code);
            if (label) {
                return label.charAt(0).toUpperCase() + label.slice(1);
            }
        }
    } catch (err) {
        // Fall through to manual labels.
    }

    const fallbackLabels = {
        en: 'English',
        de: 'Deutsch',
    };
    return fallbackLabels[code] || code.toUpperCase();
};

LensingI18n.applyStaticText = function applyStaticText() {
    const lang = LensingI18n.currentLang;
    const setText = (selector, key) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = LensingI18n.t(key, lang);
    };

    document.title = LensingI18n.t('htmlTitle', lang);
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.setAttribute('content', LensingI18n.t('htmlDescription', lang));
    const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitleMeta) appleTitleMeta.setAttribute('content', LensingI18n.t('appleWebAppTitle', lang));

    setText('#loading', 'loading');
    setText('#lock-indicator', 'locked');
    setText('.ui-header h1', 'appTitle');
    const toggleBtn = document.getElementById('toggle-btn');
    if (toggleBtn) toggleBtn.title = LensingI18n.t('toggleSettings', lang);

    const intro = document.querySelector('.control-content > p:first-of-type');
    if (intro) intro.textContent = LensingI18n.t('intro', lang);

    const credit = document.getElementById('credit-text');
    if (credit) credit.textContent = LensingI18n.t('credits', lang);

    const links = document.querySelectorAll('.control-content p.credit-text a');
    if (links[0]) links[0].textContent = LensingI18n.t('githubLink', lang);
    if (links[1]) links[1].textContent = LensingI18n.t('arxivLink', lang);
    setText('#lenstronomy-link', 'basedOnLenstronomy');

    let translationCredit = document.getElementById('translation-credit');
    if (!translationCredit) {
        translationCredit = document.createElement('p');
        translationCredit.id = 'translation-credit';
        translationCredit.className = 'credit-text';
        translationCredit.style.marginTop = '-8px';
        const creditParagraph = document.getElementById('credit-text');
        const githubParagraph = links[0] && links[0].closest('p');
        if (githubParagraph && githubParagraph.parentNode) {
            githubParagraph.parentNode.insertBefore(translationCredit, githubParagraph);
        } else if (creditParagraph && creditParagraph.parentNode) {
            creditParagraph.parentNode.insertBefore(translationCredit, creditParagraph.nextSibling);
        }
    }
    if (translationCredit) {
        if (lang === 'en') {
            translationCredit.textContent = '';
            translationCredit.style.display = 'none';
        } else {
            translationCredit.textContent = LensingI18n.t('translationCredit', lang);
            translationCredit.style.display = '';
        }
    }

    const instruct = document.getElementById('instruct');
    if (instruct) instruct.textContent = LensingI18n.t('dragToMove', lang);

    const switcher = document.getElementById('lang-switcher');
    if (switcher) {
        switcher.innerHTML = '';
        const globe = document.createElement('span');
        globe.className = 'lang-globe';
        globe.textContent = '🌐';
        globe.setAttribute('aria-hidden', 'true');

        const select = document.createElement('select');
        select.className = 'lang-select';
        select.setAttribute('aria-label', 'Select language');

        const languages = LensingI18n.getAvailableLanguages();
        languages.forEach((code) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = LensingI18n.getLanguageLabel(code, lang);
            if (code === lang) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (event) => {
            const nextLang = LensingI18n.setLanguage(event.target.value);
            window.dispatchEvent(new CustomEvent('lensing-language-change', { detail: { lang: nextLang } }));
            LensingI18n.applyStaticText();
        });

        switcher.appendChild(globe);
        switcher.appendChild(select);
    }

    const setLabelText = (selector, key) => {
        const label = document.querySelector(selector);
        if (label && label.firstChild) {
            label.firstChild.textContent = LensingI18n.t(key, lang);
        }
    };

        const buttons = {
            '#btn-model-point': 'modelPoint',
            '#btn-model-nfw': 'modelNFW',
            '#btn-model-elliptical': 'modelElliptical',
            '#btn-model-void': 'modelVoid',
            '#btn-model-hsw': 'modelHSW',
            '#hsw-link a': 'viewHswPaper',
            '#btn-galaxies': 'galaxies',
            '#btn-bw': 'bwLineGrid',
            '#btn-col': 'colorLineGrid',
            '#btn-dotted': 'colorDottedGrid',
            '#reshuffle-btn': 'reshuffleGalaxies',
            '#snapshot-btn': 'saveSnapshot',
            '#reset-main': 'resetAllSettings',
            '#upload-label': 'addOwnBackgroundImage',
        };

        Object.entries(buttons).forEach(([selector, key]) => setText(selector, key));

        const massLabel = document.getElementById('mass-label');
        if (massLabel && massLabel.firstChild) massLabel.firstChild.textContent = LensingI18n.t('clusterMass', lang);
        const spreadLabel = document.getElementById('spread-label');
        if (spreadLabel && spreadLabel.firstChild) spreadLabel.firstChild.textContent = LensingI18n.t('clusterSpread', lang);
        const coreLabel = document.getElementById('core-label');
        if (coreLabel && coreLabel.firstChild) coreLabel.firstChild.textContent = `${LensingI18n.t('showDarkMatterHalo', lang)} `;
        setText('#layers-label-text', 'numberOfBackgroundLayers');
        const brightKey = (window.LensingApp && LensingApp.currentMode && LensingApp.currentMode !== 'galaxies') ? 'brightness' : 'galaxyBrightness';
        setText('#bright-label-text', brightKey);
        setText('#fg-label-text', 'showForegroundGalaxies');
        setText('#cluster-label-text', 'showClusterMemberGalaxies');
        setText('#plot-label-text', 'showMassDistribution');
        setText('#caustic-label-text', 'showCausticLines');
        setLabelText('.control-group:nth-of-type(1) > label', 'physicsModel');
        setLabelText('.control-group:nth-of-type(2) > label', 'backgroundSource');
        setLabelText('label[for="bg-upload"]', 'addOwnBackgroundImage');
        setLabelText('#group-ellipticity label', 'ellipticity');
        setLabelText('#group-angle label', 'positionAngle');
        setLabelText('#group-wall-density label', 'wallPeakDensity');
        setLabelText('#group-wall-width label', 'wallOuterEdge');
        setLabelText('#group-hsw-rs label', 'scaleRadius');
        setLabelText('#group-hsw-alpha label', 'innerSlope');
        setLabelText('#group-hsw-beta label', 'outerSlope');
        setLabelText('#group-dot-size label', 'dotSize');
        setLabelText('#group-spread label', 'clusterSpread');
        setLabelText('#core-label', 'showDarkMatterHalo');
};

LensingI18n.refreshLanguage = function refreshLanguage(lang) {
    const nextLang = LensingI18n.setLanguage(lang);
    LensingI18n.applyStaticText();
    return nextLang;
};

LensingI18n.getBrowserLang = function getBrowserLang() {
    const availableLangs = LensingI18n.getAvailableLanguages();
    const browserLangs = Array.isArray(navigator.languages) && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || 'en'];

    for (const rawLang of browserLangs) {
        if (!rawLang) continue;

        const normalizedLang = rawLang.toLowerCase();
        if (availableLangs.includes(normalizedLang)) {
            return normalizedLang;
        }

        const baseLang = normalizedLang.split('-')[0];
        if (availableLangs.includes(baseLang)) {
            return baseLang;
        }
    }

    return 'en';
};

LensingI18n.currentLang = LensingI18n.getBrowserLang();

window.LensingI18n = LensingI18n;