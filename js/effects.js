// SYNTAX SURGE v2.0 — Advanced Visual Effects System

class ParticleSystem3D {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.initParticles();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: `hsl(${Math.random() * 60 + 180}, 100%, 60%)`,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let p of this.particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    // Create explosion effect
    explosion(x, y, color) {
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                life: 1,
                color: color || `hsl(${Math.random() * 60 + 180}, 100%, 60%)`,
                size: Math.random() * 4 + 2
            });
        }
        
        const animateExplosion = () => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2;
                p.life -= 0.02;
                
                if (p.life <= 0 || p.y > this.canvas.height + 100) {
                    particles.splice(i, 1);
                    continue;
                }
                
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            if (particles.length > 0) {
                requestAnimationFrame(animateExplosion);
            }
        };
        
        animateExplosion();
    }
    
    // Create damage flash
    damageFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 51, 102, 0.3)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '999';
        flash.style.animation = 'fadeOut 0.3s forwards';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
    
    // Create correct flash
    correctFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(0, 255, 102, 0.2)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '999';
        flash.style.animation = 'fadeOut 0.2s forwards';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    }
    
    // Screen shake
    screenShake(intensity = 5, duration = 200) {
        const container = document.querySelector('.game-container');
        if (!container) return;
        
        const originalTransform = container.style.transform;
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                container.style.transform = originalTransform;
                return;
            }
            
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            container.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        };
        
        shake();
    }
}

// Initialize particle system
let particleSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    particleSystem = new ParticleSystem3D();
    
    // Add fade-out animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { particleSystem };
}
