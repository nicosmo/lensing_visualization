/**
 * Shader Module
 * Contains vertex and fragment shaders for the gravitational lensing visualization
 */

/**
 * Simple vertex shader that passes UV coordinates to the fragment shader
 */
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

/**
 * Fragment Shader
 * This is where the physics and rendering logic lives.
 * Implements Point Mass, NFW Halo, and Void lensing models.
 */
const fragmentShader = `
    uniform sampler2D u_bg;
    uniform sampler2D u_manual_tex_0;
    uniform sampler2D u_manual_tex_1;
    uniform sampler2D u_manual_tex_2;
    uniform sampler2D u_manual_tex_3;
    uniform sampler2D u_manual_tex_4;
    uniform sampler2D u_manual_tex_5;
    uniform sampler2D u_manual_tex_6;
    uniform sampler2D u_manual_tex_7;

    uniform sampler2D u_cluster;
    uniform sampler2D u_fg;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_mass;
    uniform float u_spread;
    uniform float u_layers;
    uniform float u_brightness;
    uniform float u_show_core;
    uniform float u_show_foreground;
    uniform float u_show_cluster;
    uniform float u_model;
    uniform float u_grid_mode;
    uniform float u_use_manual;

    varying vec2 vUv;

    // Calculates the NFW (Navarro-Frenk-White) mass profile
    // This describes how density falls off in a dark matter halo.
    float nfw_enclosed(float x) {
        float val;
        if (x < 1.0) {
            float num = log(x/2.0) + log(1.0/x + sqrt(1.0/(x*x) - 1.0)) / sqrt(1.0 - x*x);
            val = num;
        } else if (x > 1.0) {
            float num = log(x/2.0) + acos(1.0/x) / sqrt(x*x - 1.0);
            val = num;
        } else {
            val = 1.0;
        }
        return val / x;
    }

    // Calculates deflection for the Void model based on the density profile described.
    // r: distance from center
    // rv: void radius
    // d_in: inner density contrast (rho_in - 1)
    float void_deflection(float r, float rv, float d_in) {
        float x = r / rv;

        // --- Fixed Model Parameters ---
        float d_wall = 0.05;
        float x_core = 0.1;
        float lensing_strength = 3.0;
        // ------------------------------

        // Pre-calculate constants for the profile
        // k is the steepness of the quadratic rise from x_core to 1.0
        float k = (d_wall - d_in) / 0.81; // 0.81 is 0.9^2

        // 1. CONSTANT CORE (x < 0.1)
        if (x < x_core) {
            // Integral of constant d_in * u is 0.5 * d_in * x^2
            // Deflection = strength * Integral / x
            return lensing_strength * 0.5 * d_in * x;
        }

        // 2. QUADRATIC RISE (0.1 <= x < 1.0)
        else if (x < 1.0) {
            // A. Mass of the core
            float M_core = 0.5 * d_in * x_core * x_core;

            // B. Mass of the rising part from x_core to x
            float M_base = 0.5 * d_in * (x * x - x_core * x_core);

            float v = x - x_core;
            float M_rise = k * ( (v*v*v*v)*0.25 + x_core * (v*v*v)*(1.0/3.0) );

            return lensing_strength * (M_core + M_base + M_rise) / x;
        }

        // 3. LINEAR RIDGE DROP (1.0 <= x < 1.05)
        else if (x < 1.05) {
            // A. Mass of core + rise (fully integrated up to 1.0)
            float M_core = 0.5 * d_in * x_core * x_core;
            float M_base = 0.5 * d_in * (1.0 - x_core * x_core);
            float v_full = 1.0 - x_core;
            float M_rise = k * ( (v_full*v_full*v_full*v_full)*0.25 + x_core * (v_full*v_full*v_full)*(1.0/3.0) );
            float M_inner_total = M_core + M_base + M_rise;

            // B. Mass of the ridge shell
            // Profile: delta(u) = 1.05 - u
            // (Note: at u=1.0, delta is 0.05, which matches d_wall )
            float val_at_x = 0.525 * x * x - (x * x * x) / 3.0;
            float val_at_1 = 0.525 - 1.0 / 3.0;
            float M_ridge = val_at_x - val_at_1;

            return lensing_strength * (M_inner_total + M_ridge) / x;
        }

        // 4. OUTSIDE (x >= 1.05)
        else {
            // Calculate Total Mass of the void structure
            // 1. Inner total
            float M_core = 0.5 * d_in * x_core * x_core;
            float M_base = 0.5 * d_in * (1.0 - x_core * x_core);
            float v_full = 0.9;
            float M_rise = k * ( (v_full*v_full*v_full*v_full)*0.25 + x_core * (v_full*v_full*v_full)*(1.0/3.0) );
            float M_inner_total = M_core + M_base + M_rise;

            // 2. Ridge total (Integrated fully to 1.05)
            float val_at_end = 0.525 * 1.05 * 1.05 - (1.05 * 1.05 * 1.05) / 3.0;
            float val_at_1   = 0.525 - 1.0 / 3.0;
            float M_ridge_total = val_at_end - val_at_1;

            return lensing_strength * (M_inner_total + M_ridge_total) / x;
        }
    }

    vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.00, 0.33, 0.67);
        return a + b * cos(6.28318 * (c * t + d));
    }

    // Helper to fetch textures from the manual array
    vec4 getManualSample(int index, vec2 uv) {
        if (index == 0) return texture2D(u_manual_tex_0, uv);
        if (index == 1) return texture2D(u_manual_tex_1, uv);
        if (index == 2) return texture2D(u_manual_tex_2, uv);
        if (index == 3) return texture2D(u_manual_tex_3, uv);
        if (index == 4) return texture2D(u_manual_tex_4, uv);
        if (index == 5) return texture2D(u_manual_tex_5, uv);
        if (index == 6) return texture2D(u_manual_tex_6, uv);
        if (index == 7) return texture2D(u_manual_tex_7, uv);
        return vec4(0.0);
    }

    void main() {
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv = vUv;

        vec2 lensPos = u_mouse;
        vec2 distVec = (uv - lensPos);
        distVec.x *= aspect;
        float r = length(distVec);

        float baseStrength = u_mass * 0.03;

        vec3 finalColor = vec3(0.0);

        // Multi-Plane Lensing Loop:
        // We simulate depth by iterating through 'layers'.
        // Layers further back are deflected more than layers close to the lens.
        for (float i = 0.0; i < 8.0; i++) {
            if (i >= u_layers) break;

            float decay = 1.0 / (1.0 + i * 0.4);
            float layerBrightness = u_brightness * decay;

            float depth = 1.0 - (i * 0.12);

            vec2 deflection;

            // Calculate deflection angle based on chosen model
            if (u_model < 0.5) {
                // Point Mass (1/r)
                float lensStrength = baseStrength * depth;
                deflection = normalize(distVec) * lensStrength / (r + 0.005);
            } else if (u_model < 1.5) {
                // NFW Halo
                float nfwStrength = baseStrength * depth * 6.0;
                float rs = max(u_spread * 0.24, 0.01);
                float x = r / rs;
                float alpha = nfw_enclosed(x);
                deflection = normalize(distVec) * nfwStrength * alpha;
            } else {
                // Void Model
                float rv = max(u_spread * 0.24, 0.01);
                // u_mass is passed as raw slider value scaled 0-2 (0-200%).
                // We interpret u_mass as the inner density ratio here.
                float d_in = u_mass - 1.0;
                float alpha = void_deflection(r, rv, d_in);
                // Visual scaling to match user request for "slightly stronger" effect
                float voidStrength = 0.15 * depth;
                deflection = normalize(distVec) * voidStrength * alpha;
            }

            // Apply Parallax and Lensing Deflection
            float scale = 1.0 + i * 0.12;
            vec2 layerUv = (uv * scale * vec2(aspect, 1.0)) + vec2(i * 0.3, i * 0.7) - deflection;

            vec3 texColor;

            if (u_use_manual > 0.5) {
                texColor = getManualSample(int(i), layerUv).rgb;
            } else {
                texColor = texture2D(u_bg, layerUv).rgb;
            }

            // Debug Grid Coloring
            if (u_grid_mode > 0.5 && u_use_manual < 0.5) {
                vec3 colVert = palette(i * 0.15);
                vec3 colHoriz = palette(i * 0.15 + 0.5);
                vec3 mappedColor = texColor.r * colVert + texColor.g * colHoriz;
                if (texColor.r > 0.5 && texColor.g > 0.5) mappedColor = vec3(1.0);
                texColor = mappedColor;
            }

            finalColor += texColor * layerBrightness;
        }

        // Render the Dark Matter Halo Glow (if enabled)
        if (u_show_core > 0.5) {
            if (u_model < 1.5) {
                // Standard Cluster Halo
                float haloSize = (u_model > 0.5) ? max(u_spread * 0.2, 0.05) : u_mass * 0.1;
                float halo = smoothstep(haloSize, 0.0, r);
                vec3 haloColor = vec3(0.1, 0.12, 0.2) + vec3(0.4, 0.35, 0.3) * halo;
                finalColor += halo * haloColor * 0.3;
            } else {
                // Void Boundary & Center Markers
                float rv = max(u_spread * 0.24, 0.01);

                // 1. Dotted Outline at Boundary (rv)
                float distFromBound = abs(r - rv);
                float outline = smoothstep(0.003, 0.0, distFromBound);
                float angle = atan(distVec.y, distVec.x);
                float dashes = step(0.0, sin(angle * 40.0));
                vec3 outlineColor = vec3(0.7); // Bright Grey
                finalColor = mix(finalColor, outlineColor, outline * dashes * 0.8);

                // 2. X Cross at Center
                // Rotate coordinates by 45 degrees
                float s = 0.7071;
                vec2 local = distVec;
                vec2 rot = vec2(local.x * s - local.y * s, local.x * s + local.y * s);
                float thickness = 0.0015;
                float size = 0.0075;
                float cross = 0.0;

                if (abs(rot.x) < thickness && abs(rot.y) < size) cross = 1.0;
                if (abs(rot.y) < thickness && abs(rot.x) < size) cross = 1.0;

                finalColor = mix(finalColor, outlineColor, cross);
            }
        }

        // Render the Foreground Cluster (The Lens Object)
        // Only visible if NOT in Void mode
        if (u_model < 1.5 && u_show_cluster > 0.5) {
            vec2 memberUvCenter = uv - u_mouse;
            memberUvCenter.x *= aspect;
            vec2 memberUv = memberUvCenter / (u_spread * 0.24) + 0.5;

            if(memberUv.x > 0.0 && memberUv.x < 1.0 && memberUv.y > 0.0 && memberUv.y < 1.0) {
                vec4 clusterSample = texture2D(u_cluster, memberUv);
                vec3 clusterRgb = clusterSample.rgb * u_brightness;
                finalColor = mix(finalColor, clusterRgb, clusterSample.a);
            }
        }

        // Render very close foreground galaxies (No lensing applied to them)
        if (u_show_foreground > 0.5) {
            vec4 fgSample = texture2D(u_fg, uv);
            vec3 fgRgb = fgSample.rgb * u_brightness;
            finalColor = mix(finalColor, fgRgb, fgSample.a);
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Export shaders for use in other modules
window.LensingShaders = {
    vertexShader,
    fragmentShader
};
