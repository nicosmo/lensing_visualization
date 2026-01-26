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
    // Toy Model Specifics
    uniform float u_wall_density; // Peak density of wall
    uniform float u_wall_width;   // Width of wall (outer edge - 1.0)

    // HSW Model Texture
    uniform sampler2D u_hsw_tex;  // Lookup table for HSW deflection

    varying vec2 vUv;

    // --- NFW Deflection Angle (Improved Stability) ---
    // x: r / rs (radius scaled by scale radius)
    float nfw_deflection(float x) {
        // Safety for center
        if (x < 0.0001) return 0.0;

        // Common term: ln(x/2)
        float term_log = log(x * 0.5);
        float term_geo = 0.0;

        // 1. INSIDE (x < 1)
        if (x < 0.999) {
            float root = sqrt(1.0 - x * x);
            // Manual acosh(1/x) = log( (1 + sqrt(1-x^2)) / x )
            float arg = (1.0 + root) / x;
            term_geo = log(arg) / root;
        }
        // 2. OUTSIDE (x > 1)
        else if (x > 1.001) {
            float root = sqrt(x * x - 1.0);
            term_geo = acos(1.0 / x) / root;
        }
        // 3. SINGULARITY (x ~ 1)
        else {
            // Limit as x->1 is exactly 1.0
            term_geo = 1.0;
        }

        float g_x = term_log + term_geo;

        // Return deflection (mass / x)
        return g_x / x;
    }

    // --- Void Toy Model (Exact Quadratic Wall) ---
    // r: distance from center
    // rv: void radius
    // d_in: inner density contrast
    // d_wall: wall peak density
    // w: wall width
    float void_toy_deflection(float r, float rv, float d_in, float d_wall, float w) {
        // Safety check
        if (r < 0.0001) return 0.0;

        float x = r / rv;
        float x_out = 1.0 + w;
        float x_core = 0.05;
        float lensing_strength = 3.0;

        float mass = 0.0;

        // 1. CONSTANT CORE (x < x_core)
        if (x < x_core) {
            mass = 0.5 * d_in * x * x;
        }

        // 2. QUADRATIC RISE (x_core <= x < 1.0)
        else if (x < 1.0) {
            // A. Mass of the full core
            float m_core = 0.5 * d_in * x_core * x_core;

            // B. Integrate Rise
            float diff = d_wall - d_in;
            float span = 1.0 - x_core;
            float scale = 1.0 / (span * span);

            float m_base = 0.5 * d_in * (x*x - x_core*x_core);

            float v = x - x_core;
            float term = (v*v*v*v)*0.25 + x_core*(v*v*v)*(1.0/3.0);
            float m_rise = diff * scale * term;

            mass = m_core + m_base + m_rise;
        }

        // 3. QUADRATIC WALL DROP (1.0 <= x < x_out)
        // Exact analytical integral of (1+u) * d_wall * (1-u/w)^2
        else if (x < x_out) {
            // A. Calculate Total Inner Mass (at x=1.0)
            float m_core = 0.5 * d_in * x_core * x_core;
            float m_base_full = 0.5 * d_in * (1.0 - x_core * x_core);

            float diff = d_wall - d_in;
            float span = 1.0 - x_core;
            float scale = 1.0 / (span * span);
            float v_full = span;
            float term_full = (v_full*v_full*v_full*v_full)*0.25 + x_core*(v_full*v_full*v_full)*(1.0/3.0);
            float m_rise_full = diff * scale * term_full;

            float M_inner = m_core + m_base_full + m_rise_full;

            // B. Integrate the Wall
            float u = x - 1.0;
            float q = u / w; // Normalized position 0..1

            float t1 = q;
            float t2 = q*q * (0.5 * w - 1.0);
            float t3 = q*q*q * (1.0/3.0 - (2.0/3.0)*w);
            float t4 = q*q*q*q * 0.25 * w;

            float m_wall = d_wall * w * (t1 + t2 + t3 + t4);

            mass = M_inner + m_wall;
        }

        // 4. OUTSIDE (x >= x_out)
        else {
            // A. Inner Total
            float m_core = 0.5 * d_in * x_core * x_core;
            float m_base_full = 0.5 * d_in * (1.0 - x_core * x_core);
            float diff = d_wall - d_in;
            float span = 1.0 - x_core;
            float scale = 1.0 / (span * span);
            float v_full = span;
            float term_full = (v_full*v_full*v_full*v_full)*0.25 + x_core*(v_full*v_full*v_full)*(1.0/3.0);
            float m_rise_full = diff * scale * term_full;
            float M_inner = m_core + m_base_full + m_rise_full;

            // B. Wall Total (q=1.0)
            float t1 = 1.0;
            float t2 = (0.5 * w - 1.0);
            float t3 = (1.0/3.0 - (2.0/3.0)*w);
            float t4 = 0.25 * w;

            float m_wall_total = d_wall * w * (t1 + t2 + t3 + t4);

            mass = M_inner + m_wall_total;
        }

        return lensing_strength * mass / x;
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
                // 0: Point Mass
                float lensStrength = baseStrength * depth;
                deflection = normalize(distVec) * lensStrength / (r + 0.005);
            }
            else if (u_model < 1.5) {
                // 1: NFW Halo (Using improved function)
                float nfwStrength = baseStrength * depth * 6.0;
                float rs = max(u_spread * 0.24, 0.01);
                float x = r / rs;
                // Use the new stable function
                float alpha = nfw_deflection(x);
                deflection = normalize(distVec) * nfwStrength * alpha;
            }
            else if (u_model < 2.5) {
                // 2: Void Toy Model
                float rv = max(u_spread * 0.24, 0.01);

                // Map slider (0-2) to density contrast (-1 to +1).
                // We allow d_in to be positive. The integral handles it correctly.
                float d_in = u_mass - 1.0;

                float alpha = void_toy_deflection(r, rv, d_in, u_wall_density, u_wall_width);
                float voidStrength = 0.15 * depth;
                deflection = normalize(distVec) * voidStrength * alpha;
            }
            else {
                // 3: HSW Void (Texture Lookup)
                float rv = max(u_spread * 0.24, 0.01);
                float max_r = 20.0 * rv;
                float tex_coord = r / max_r;

                float alpha = 0.0;
                if (tex_coord <= 1.0) {
                    // Texture stores absolute value.
                    // Multiply by -1.0 to restore negative mass (diverging void).
                    alpha = -1.0 * texture2D(u_hsw_tex, vec2(tex_coord, 0.5)).r;
                }

                // HSW visual strength multiplier
                float hswStrength = 0.33 * depth;
                deflection = normalize(distVec) * hswStrength * alpha;
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

                // Show Outer Wall Edge for Toy Model
                if (u_model > 1.5 && u_model < 2.5) {
                    float r_outer = rv * (1.0 + u_wall_width);
                    float distOut = abs(r - r_outer);
                    float outline2 = smoothstep(0.002, 0.0, distOut);
                    vec3 wallColor = vec3(0.3, 0.5, 0.8);
                    finalColor = mix(finalColor, wallColor, outline2 * 0.5);
                }
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
    fragmentShader,
};
