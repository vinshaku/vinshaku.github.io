// ===============================
// Particle Text Effects
// ===============================

class ParticleText {
    constructor(element) {
        this.element = element;
        this.text = element.textContent;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.isHovered = false;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.updateCanvasSize();
        
        // Style canvas
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        
        // Insert canvas
        this.element.style.position = 'relative';
        this.element.appendChild(this.canvas);
        
        // Create particles from text
        this.createParticles();
        
        // Add event listeners
        this.element.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('resize', () => this.handleResize());
        
        // Start animation
        this.animate();
    }
    
    updateCanvasSize() {
        const rect = this.element.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createParticles() {
        this.particles = [];
        
        // Create temporary canvas for text measurement
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Get computed styles
        const styles = window.getComputedStyle(this.element);
        const fontSize = styles.fontSize;
        const fontFamily = styles.fontFamily;
        const fontWeight = styles.fontWeight;
        
        // Set font
        tempCtx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        
        // Measure text
        const textMetrics = tempCtx.measureText(this.text);
        const textWidth = textMetrics.width;
        const textHeight = parseInt(fontSize);
        
        // Set canvas size
        tempCanvas.width = textWidth;
        tempCanvas.height = textHeight * 2;
        
        // Draw text
        tempCtx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        tempCtx.fillStyle = '#000';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(this.text, 0, textHeight);
        
        // Get image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        // Sample pixels and create particles
        const sampling = 3; // Sample every 3rd pixel for performance
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const offsetX = centerX - textWidth / 2;
        const offsetY = centerY - textHeight / 2;
        
        for (let y = 0; y < tempCanvas.height; y += sampling) {
            for (let x = 0; x < tempCanvas.width; x += sampling) {
                const index = (y * tempCanvas.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if (alpha > 128) {
                    const particle = {
                        x: x + offsetX,
                        y: y + offsetY - textHeight / 2,
                        originX: x + offsetX,
                        originY: y + offsetY - textHeight / 2,
                        vx: 0,
                        vy: 0,
                        force: 0,
                        angle: 0,
                        distance: 0,
                        radius: Math.random() * 2 + 1,
                        opacity: 1,
                        color: this.getGradientColor()
                    };
                    this.particles.push(particle);
                }
            }
        }
    }
    
    getGradientColor() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const colors = isDark ? 
            ['#89b4fa', '#b4befe', '#cba6f7'] : // Mocha colors
            ['#1e66f5', '#7287fd', '#8839ef'];   // Latte colors
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    handleMouseEnter() {
        this.isHovered = true;
        this.explode();
    }
    
    handleMouseLeave() {
        this.isHovered = false;
        this.reform();
    }
    
    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }
    
    handleResize() {
        this.updateCanvasSize();
        this.createParticles();
    }
    
    explode() {
        this.particles.forEach(particle => {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 50 + 30;
            particle.vx = Math.cos(angle) * force;
            particle.vy = Math.sin(angle) * force;
        });
    }
    
    reform() {
        // Particles will naturally return to origin due to spring physics
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Spring physics to return to origin
            const dx = particle.originX - particle.x;
            const dy = particle.originY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Spring force
            const springForce = 0.02;
            const dampening = 0.95;
            
            if (!this.isHovered) {
                particle.vx += dx * springForce;
                particle.vy += dy * springForce;
            }
            
            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply dampening
            particle.vx *= dampening;
            particle.vy *= dampening;
            
            // Mouse repulsion when hovered
            if (this.isHovered && this.mouse.x && this.mouse.y) {
                const mouseDx = this.mouse.x - particle.x;
                const mouseDy = this.mouse.y - particle.y;
                const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                
                if (mouseDistance < 100) {
                    const repelForce = (100 - mouseDistance) / 100;
                    particle.vx -= (mouseDx / mouseDistance) * repelForce * 5;
                    particle.vy -= (mouseDy / mouseDistance) * repelForce * 5;
                }
            }
            
            // Update opacity based on distance from origin
            particle.opacity = Math.max(0.3, 1 - distance / 200);
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
        });
        
        // Reset global alpha
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.updateParticles();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.canvas.remove();
    }
}

// Initialize particle text effect
function initParticleText() {
    const particleTextElements = document.querySelectorAll('.particle-text');
    const particleInstances = [];
    
    particleTextElements.forEach(element => {
        // Hide original text
        const originalText = element.textContent;
        element.style.color = 'transparent';
        
        // Create particle effect
        const particleText = new ParticleText(element);
        particleInstances.push(particleText);
    });
    
    return particleInstances;
}

// Export for use in other scripts
window.ParticleText = ParticleText;
window.initParticleText = initParticleText;
