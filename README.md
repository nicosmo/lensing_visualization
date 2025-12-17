# Gravitational Lensing Visualization

**Interactive tool to visualize a massive galaxy cluster bending light from background layers.**

This project is a browser-based WebGL visualisation that renders real-time gravitational lensing effects. It visualizes how light from background galaxies is distorted by a massive foreground cluster (the "lens"), allowing users to toggle between different physics models and background sources.

![Project Screenshot](https://via.placeholder.com/800x450?text=Screenshot+Placeholder+Replace+Me)
*(Replace the link above with a real screenshot of your application)*

## Features:

### Physics & Visualilsation
* **Real-time Raytracing:** Uses custom GLSL fragment shaders to calculate light deflection pixel-by-pixel.
* **Physics Models:**
    * **Point Mass:** Simulates a simple, singular dense mass ($1/r$ potential).
    * **NFW Halo:** Simulates a **Navarro-Frenk-White** dark matter profile, representing realistic mass distribution in galaxy clusters.
* **Multi-Plane Lensing:** Simulates depth by treating the background as multiple distinct layers, creating parallax effects and varying distortion based on distance.

### Rendering & Procedural Generation
* **Procedural Universe:** Background galaxies and the foreground cluster are generated procedurally using seeded random numbers. Every "Reshuffle" creates a unique, consistent star field.
* **Parallax Depth:** Foreground stars, the cluster lens, and background layers move at different rates to simulate 3D space.
* **Custom Sprites:** Uses HTML5 Canvas to pre-render galaxy sprites (spirals and ellipticals) for high-performance rendering.

### Interactivity
* **Dynamic Controls:** Adjust Cluster Mass, Spread (Einstein Radius), Galaxy Density, and Brightness in real-time.
* **Custom Backgrounds:** Upload your own images to see how they are distorted by the lens.
* **Interactive Lens:** Drag the mouse to move the lens; click to lock it in place for inspection.

## Getting Started

Since this project relies on native browser technologies (HTML5, Three.js via CDN), there is no build process required.

### Prerequisites
* A modern web browser (Chrome, Firefox, Safari, Edge) with WebGL enabled.
* An internet connection (to load the Three.js library from cdnjs).

### Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/lensing_visualization.git](https://github.com/yourusername/lensing_visualization.git)
    cd lensing_visualization
    ```
2.  **Run the simulation:**
    Simply open `index.html` in your web browser.

## Usage

### Controls
* **Move Lens:** Move your mouse (or drag on touch devices) to position the galaxy cluster.
* **Lock Position:** Click anywhere on the canvas to **LOCK** the lens position. Click again to unlock.
* **UI Panel:** Use the top-left panel to toggle settings. (Click `-` to minimize).

### Using Custom Images
You can upload your own images to test the lensing effect:
1.  Open the UI Panel.
2.  Click **"Add Own Background Image"**.
3.  Select an image from your computer.
4.  *Tip:* You can upload multiple images to create multi-layer depth effects.

### Included Test Data
This repository includes a high-resolution astronomical image for testing:
* **File:** `Hubble_ultra_deep_field_high_rez.jpg`
* **Description:** A section of the Hubble Ultra-Deep Field, ideal for visualizing how a cluster distorts a realistic background field.
* **Source:** [Wikipedia](https://en.wikipedia.org/wiki/Hubble_Ultra-Deep_Field) (Accessed Dec 17, 2025).

## The Science

The simulation calculates the deflection angle $\hat{\alpha}$ of light rays as they pass near the lens.

1.  **Point Mass Model:**
    Assumes all mass is concentrated at a single point. Deflection decreases linearly with distance ($1/r$).
2.  **NFW (Navarro-Frenk-White) Profile:**
    Modeled on the density distribution of dark matter halos. It provides a "softer" core than a point mass, meaning the lensing effect doesn't approach infinity at the center, creating a more realistic distortion typical of galaxy clusters.

## Credits

* **Concept & Visualization:** Nico Schuster and Andres Salcedo.
* **Library:** Built with [Three.js](https://threejs.org/).
* **Test Image:** NASA/ESA (Hubble Ultra-Deep Field).

## License

This project is open source. [Include your license here, e.g., MIT].
