// ===============================
// Wave Animation Background
// ===============================

class WaveAnimation {
    constructor() {
        this.canvas = document.getElementById('wave-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.waves = [];
        this.numberOfWaves = 4;
        this.time = 0;
        this.animationId = null;
        
        // Colors based on theme
        this.colors = {
            light: [
                'rgba(30, 102, 245, 0.1)',   // Latte Blue
                'rgba(114, 135, 253, 0.1)',  // Latte Lavender
                'rgba(136, 57, 239, 0.1)',   // Latte Mauve
                'rgba(220, 138, 120, 0.1)'   // Latte Rosewater
            ],
            dark: [
                'rgba(137, 180, 250, 0.1)',  // Mocha Blue
                'rgba(180, 190, 254, 0.1)',  // Mocha Lavender
                'rgba(203, 166, 247, 0.1)',  // Mocha Mauve
                'rgba(245, 224, 220, 0.1)'   // Mocha Rosewater
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setCanvasSize();
        this.createWaves();
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.createWaves();
        });
        
        // Handle theme changes
        const observer = new MutationObserver(() => {
            this.createWaves();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    setCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createWaves() {
        this.waves = [];
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const colorPalette = isDark ? this.colors.dark : this.colors.light;
        
        for (let i = 0; i < this.numberOfWaves; i++) {
            this.waves.push({
                y: this.canvas.height * 0.5,
                amplitude: 30 + Math.random() * 40,
                frequency: 0.01 + Math.random() * 0.005,
                speed: 0.01 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2,
                color: colorPalette[i % colorPalette.length]
            });
        }
    }
    
    drawWave(wave) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        
        // Draw wave using sine function
        for (let x = 0; x <= this.canvas.width; x += 5) {
            const y = wave.y + 
                      Math.sin(x * wave.frequency + this.time * wave.speed + wave.phase) * wave.amplitude +
                      Math.sin(x * wave.frequency * 2 + this.time * wave.speed * 0.5) * wave.amplitude * 0.3;
            
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        // Complete the path
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        
        // Create gradient
        const gradient = this.ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, this.canvas.height);
        gradient.addColorStop(0, wave.color);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all waves
        this.waves.forEach(wave => {
            this.drawWave(wave);
        });
        
        this.time++;
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Alternative wave implementation using gradients only (for performance)
class GradientWaves {
    constructor() {
        this.canvas = document.getElementById('wave-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gradients = [];
        this.time = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setCanvasSize();
        this.animate();
        
        window.addEventListener('resize', () => {
            this.setCanvasSize();
        });
    }
    
    setCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createGradient(offset) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        
        if (isDark) {
            gradient.addColorStop(0, `hsla(217, 91%, 75%, ${0.05 + Math.sin(this.time * 0.001 + offset) * 0.03})`);
            gradient.addColorStop(0.5, `hsla(232, 97%, 85%, ${0.05 + Math.cos(this.time * 0.001 + offset) * 0.03})`);
            gradient.addColorStop(1, `hsla(267, 84%, 81%, ${0.05 + Math.sin(this.time * 0.001 + offset + Math.PI) * 0.03})`);
        } else {
            gradient.addColorStop(0, `hsla(217, 91%, 54%, ${0.03 + Math.sin(this.time * 0.001 + offset) * 0.02})`);
            gradient.addColorStop(0.5, `hsla(232, 97%, 72%, ${0.03 + Math.cos(this.time * 0.001 + offset) * 0.02})`);
            gradient.addColorStop(1, `hsla(267, 84%, 58%, ${0.03 + Math.sin(this.time * 0.001 + offset + Math.PI) * 0.02})`);
        }
        
        return gradient;
    }
    
    drawMorphingGradient() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw multiple gradient layers
        for (let i = 0; i < 3; i++) {
            this.ctx.save();
            
            // Create transformation for wave effect
            const scale = 1 + Math.sin(this.time * 0.0005 + i * Math.PI * 0.5) * 0.1;
            const translateX = Math.sin(this.time * 0.0003 + i) * 50;
            const translateY = Math.cos(this.time * 0.0004 + i) * 30;
            
            this.ctx.translate(this.canvas.width / 2 + translateX, this.canvas.height / 2 + translateY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
            
            // Draw gradient
            this.ctx.fillStyle = this.createGradient(i * Math.PI * 0.66);
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.restore();
        }
    }
    
    animate() {
        this.drawMorphingGradient();
        this.time++;
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize wave animation when DOM is loaded
let waveAnimation;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Use WaveAnimation for actual waves or GradientWaves for better performance
        waveAnimation = new WaveAnimation();
    });
} else {
    waveAnimation = new WaveAnimation();
}

// Export for external use
window.WaveAnimation = WaveAnimation;
window.GradientWaves = GradientWaves;
