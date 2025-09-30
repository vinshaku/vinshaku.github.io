// ===============================
// Three.js Galaxy Background
// ===============================

let scene, camera, renderer;
let particles, nebula;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let animationId;
let galaxyColors = {
    light: {
        particle1: 0x1e66f5,  // Catppuccin Latte Blue
        particle2: 0x7287fd,  // Catppuccin Latte Lavender
        particle3: 0x8839ef,  // Catppuccin Latte Mauve
        nebula: 0xeff1f5      // Catppuccin Latte Base
    },
    dark: {
        particle1: 0x89b4fa,  // Catppuccin Mocha Blue
        particle2: 0xb4befe,  // Catppuccin Mocha Lavender
        particle3: 0xcba6f7,  // Catppuccin Mocha Mauve
        nebula: 0x1e1e2e      // Catppuccin Mocha Base
    }
};

function initGalaxy() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('galaxy-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create starfield
    createStarfield();
    
    // Create nebula effect
    createNebula();
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Mouse movement listener
    document.addEventListener('mousemove', onMouseMove);
    
    // Resize listener
    window.addEventListener('resize', onWindowResize);
    
    // Start animation
    animate();
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const sizes = [];
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorPalette = isDark ? galaxyColors.dark : galaxyColors.light;
    
    // Create 2000 stars
    for (let i = 0; i < 2000; i++) {
        // Position
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        vertices.push(x, y, z);
        
        // Color variation
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.33) {
            color = new THREE.Color(colorPalette.particle1);
        } else if (colorChoice < 0.66) {
            color = new THREE.Color(colorPalette.particle2);
        } else {
            color = new THREE.Color(colorPalette.particle3);
        }
        colors.push(color.r, color.g, color.b);
        
        // Size variation
        sizes.push(Math.random() * 2);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // Shader material for better performance
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                vec3 pos = position;
                
                // Add gentle movement
                pos.x += sin(time * 0.1 + position.y * 0.1) * 0.3;
                pos.y += cos(time * 0.1 + position.x * 0.1) * 0.3;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Size attenuation
                gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                // Circular particle shape
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createNebula() {
    const geometry = new THREE.PlaneGeometry(20, 20, 100, 100);
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nebulaColor = isDark ? galaxyColors.dark.nebula : galaxyColors.light.nebula;
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(nebulaColor) },
            color2: { value: new THREE.Color(isDark ? 0x313244 : 0xdce0e8) },
            opacity: { value: 0.15 }
        },
        vertexShader: `
            varying vec2 vUv;
            uniform float time;
            
            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Wave distortion
                float wave = sin(pos.x * 0.5 + time * 0.5) * 0.3;
                pos.z += wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            uniform float opacity;
            varying vec2 vUv;
            
            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vec2 uv = vUv;
                
                // Animated noise
                float noise = snoise(uv * 3.0 + time * 0.1) * 0.5 + 0.5;
                noise += snoise(uv * 6.0 - time * 0.15) * 0.25 + 0.25;
                noise = noise * 0.5;
                
                // Gradient
                vec3 color = mix(color1, color2, noise);
                
                // Fade edges
                float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
                edge *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
                
                gl_FragColor = vec4(color, opacity * edge * noise);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    nebula = new THREE.Mesh(geometry, material);
    nebula.position.z = -10;
    scene.add(nebula);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Smooth mouse following
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    
    // Rotate particles
    if (particles) {
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0002;
        
        // Mouse influence
        particles.rotation.x += targetY * 0.05;
        particles.rotation.y += targetX * 0.05;
        
        // Update shader time
        particles.material.uniforms.time.value += 0.01;
    }
    
    // Animate nebula
    if (nebula) {
        nebula.material.uniforms.time.value += 0.005;
        nebula.rotation.z += 0.0001;
    }
    
    // Camera movement
    camera.position.x = targetX * 0.5;
    camera.position.y = targetY * 0.5;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Update colors when theme changes
function updateGalaxyColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Remove old particles and nebula
    if (particles) {
        scene.remove(particles);
        particles.geometry.dispose();
        particles.material.dispose();
    }
    if (nebula) {
        scene.remove(nebula);
        nebula.geometry.dispose();
        nebula.material.dispose();
    }
    
    // Recreate with new colors
    createStarfield();
    createNebula();
}

// Clean up function
function cleanupGalaxy() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (particles) {
        particles.geometry.dispose();
        particles.material.dispose();
        scene.remove(particles);
    }
    
    if (nebula) {
        nebula.geometry.dispose();
        nebula.material.dispose();
        scene.remove(nebula);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onWindowResize);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalaxy);
} else {
    initGalaxy();
}
