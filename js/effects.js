// SYNTAX SURGE - Visual Effects System

class EffectSystem {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.initCanvas();
    }
    
    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
        
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // Create damage effect (red particles)
    damageEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 1,
                color: `hsl(${Math.random() * 20 + 340}, 100%, 60%)`,
                size: Math.random() * 4 + 2
            });
        }
        
        // Flash screen red
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 51, 102, 0.3)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '998';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 150);
    }
    
    // Create correct syntax effect (green particles)
    correctEffect(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 3,
                life: 1,
                color: `hsl(${Math.random() * 40 + 80}, 100%, 60%)`,
                size: Math.random() * 5 + 2
            });
        }
        
        // Flash screen green
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(0, 255, 102, 0.2)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '998';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }
    
    // Create bug defeat effect (explosion)
    bugDefeatEffect(x, y) {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15 - 5,
                life: 1,
                color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                size: Math.random() * 6 + 2
            });
        }
        
        // Screen shake
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.transform = 'translate(3px, 3px)';
            setTimeout(() => container.style.transform = 'translate(-2px, -2px)', 50);
            setTimeout(() => container.style.transform = 'translate(0, 0)', 100);
        }
    }
    
    // Create power-up activation effect
    powerUpEffect(color) {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = color;
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '998';
        flash.style.animation = 'fadeOut 0.5s forwards';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }
    
    // Create combo burst effect
    comboBurst(comboCount) {
        if (comboCount % 5 === 0 && comboCount > 0) {
            for (let i = 0; i < 15; i++) {
                this.particles.push({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12 - 4,
                    life: 1,
                    color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
                    size: Math.random() * 5 + 2
                });
            }
        }
    }
    
    animate() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 0.02;
            
            if (p.life <= 0 || p.y > this.canvas.height + 100) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Code rain effect for background
class CodeRain {
    constructor() {
        this.canvas = document.getElementById('codeRain');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.columns = [];
        this.characters = '01abcdefghijklmnopqrstuvwxyz{}[]();:+-*/';
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.start();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initColumns();
    }
    
    initColumns() {
        const columnCount = Math.floor(this.canvas.width / 20);
        this.columns = [];
        for (let i = 0; i < columnCount; i++) {
            this.columns.push({
                x: i * 20,
                y: Math.random() * this.canvas.height,
                speed: 2 + Math.random() * 3,
                chars: []
            });
        }
    }
    
    start() {
        const draw = () => {
            if (!this.ctx) return;
            
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ffcc';
            this.ctx.font = '12px monospace';
            
            for (let col of this.columns) {
                const char = this.characters[Math.floor(Math.random() * this.characters.length)];
                this.ctx.fillText(char, col.x, col.y);
                
                col.y += col.speed;
                if (col.y > this.canvas.height) {
                    col.y = 0;
                }
            }
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
}

// Initialize effects when DOM loads
let effectSystem = null;
let codeRain = null;

document.addEventListener('DOMContentLoaded', () => {
    effectSystem = new EffectSystem();
    codeRain = new CodeRain();
});
