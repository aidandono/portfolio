// Fluid Dynamics Animation System

class FluidParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.3; 
        this.vy = (Math.random() - 0.5) * 0.3;
        this.baseSize = Math.random() * 2 + 0.5; 
        this.size = this.baseSize;
        this.maxSize = this.baseSize * 2; 
        this.baseOpacity = Math.random() * 0.15 + 0.05;
        this.opacity = this.baseOpacity;
        this.maxOpacity = 0.7; 
        this.hue = Math.random() * 60 + 180; // Blue to cyan range
        this.driftSpeed = Math.random() * 0.15 + 0.05; // Individual drift speed
        this.attractionLevel = 0; // Track how attracted to mouse (0-1)
    }

    update(mouseX, mouseY, mouseInfluence) {
        // With fixed positioning, mouse coordinates are already correct
        // Just use them directly
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 120;

        if (distance < maxDistance && mouseInfluence > 0) {
            // Calculate attraction level (0-1)
            this.attractionLevel = Math.min(1.0, this.attractionLevel + 0.08);
            
            // Apply stronger force towards mouse
            const force = (maxDistance - distance) / maxDistance * 0.8;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force * mouseInfluence;
            this.vy += Math.sin(angle) * force * mouseInfluence;
        } else {
            // Return to floating state when not influenced
            this.attractionLevel = Math.max(0, this.attractionLevel - 0.04);
            
            // Add gentle floating drift
            this.vx += Math.sin(Date.now() * 0.001 + this.x * 0.01) * this.driftSpeed * 0.1;
            this.vy += Math.cos(Date.now() * 0.001 + this.y * 0.01) * this.driftSpeed * 0.1;
        }

        // Interpolate size and opacity based on attraction level
        this.size = this.baseSize + (this.maxSize - this.baseSize) * this.attractionLevel;
        this.opacity = this.baseOpacity + (this.maxOpacity - this.baseOpacity) * this.attractionLevel;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Apply damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Boundary wrapping - use viewport dimensions
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
    }

    draw(ctx) {
        if (this.opacity <= 0.01) return; // Skip nearly invisible particles

        const alpha = this.opacity;
        
        // Simplified particle rendering for performance
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
        
        // Reduced glow for performance - only for larger particles
        if (this.size > 2) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsl(${this.hue}, 70%, 60%)`;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Skip outer glow for smaller particles to improve performance
        if (this.size > 1.5) {
            ctx.globalAlpha = alpha * 0.2;
            ctx.shadowBlur = 0; // Remove shadow for outer glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class FluidSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseInfluence = 0;
        this.connections = [];
        this.scrollFadeFactor = 1.0; // New: global fade factor based on scroll
        this.maxParticles = 150; // New: track maximum particles
        this.currentMaxParticles = 150; // New: current particle limit

        // Create optimized particle count
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(new FluidParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ));
        }

        this.bindEvents();
    }

    bindEvents() {
        let mouseMoved = false;
        
        document.addEventListener('mousemove', (e) => {
            // Use client coordinates - let particle update handle conversion
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.mouseInfluence = 1.0;
            mouseMoved = true;
        });

        document.addEventListener('mouseleave', () => {
            this.mouseInfluence = 0;
        });

        // Gradually reduce mouse influence
        setInterval(() => {
            if (!mouseMoved) {
                this.mouseInfluence = Math.max(0, this.mouseInfluence - 0.05);
            }
            mouseMoved = false;
        }, 50);

        // New: Scroll-based fade calculation
        document.addEventListener('scroll', () => {
            this.updateScrollFade();
        });

        // Performance monitoring to prevent freezing
        this.lastFrameTime = Date.now();
        this.frameCount = 0;
        this.performanceCheck = setInterval(() => {
            if (this.frameCount < 30) { // If less than 30 FPS
                if (this.particles.length > this.currentMaxParticles) {
                    this.particles = this.particles.slice(0, Math.max(this.currentMaxParticles * 0.8, this.particles.length - 50));
                    console.log(`Reduced particles to ${this.particles.length} for better performance`);
                }
            }
            this.frameCount = 0;
        }, 1000);

        // Touch events for mobile
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
            this.mouseInfluence = 1.0;
        });

        document.addEventListener('touchstart', () => {
            // Reduce particle count on mobile for performance
            if (this.particles.length > 80) {
                this.particles = this.particles.slice(0, 80);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    // New: Calculate fade factor based on scroll position
    updateScrollFade() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = documentHeight - windowHeight;
        
        // Start fading after 20% of scroll, fully faded at 80% scroll
        const fadeStartThreshold = maxScroll * 0.1;
        const fadeEndThreshold = maxScroll * 0.5;
        
        if (scrollY <= fadeStartThreshold) {
            // No fade at top of page
            this.scrollFadeFactor = 1.0;
            this.currentMaxParticles = this.maxParticles;
        } else if (scrollY >= fadeEndThreshold) {
            // Fully faded at bottom
            this.scrollFadeFactor = 0.0;
            this.currentMaxParticles = 0;
        } else {
            // Gradual fade between thresholds
            const fadeProgress = (scrollY - fadeStartThreshold) / (fadeEndThreshold - fadeStartThreshold);
            this.scrollFadeFactor = 1.0 - fadeProgress;
            this.currentMaxParticles = Math.floor(this.maxParticles * this.scrollFadeFactor);
        }
        
        // Reduce particle count if needed
        if (this.particles.length > this.currentMaxParticles) {
            this.particles = this.particles.slice(0, this.currentMaxParticles);
        }
        
        // Add particles back when scrolling up
        while (this.particles.length < this.currentMaxParticles) {
            this.particles.push(new FluidParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    update() {
        // Update all particles
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY, this.mouseInfluence);
        });

        // Calculate connections - focus on attracted/larger particles
        this.connections = [];
        const maxConnections = 60;
        let connectionCount = 0;
        
        // Prioritize particles that are attracted to mouse (larger/brighter)
        const attractedParticles = this.particles.filter(p => p.attractionLevel > 0.3);
        
        for (let i = 0; i < attractedParticles.length && connectionCount < maxConnections; i++) {
            for (let j = i + 1; j < attractedParticles.length && connectionCount < maxConnections; j++) {
                const p1 = attractedParticles[i];
                const p2 = attractedParticles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Connect particles that are both attracted to mouse
                const maxDistance = 120; // Longer connections for attracted particles
                
                if (distance < maxDistance) {
                    const strength = (maxDistance - distance) / maxDistance;
                    const combinedAttraction = (p1.attractionLevel + p2.attractionLevel) / 2;
                    this.connections.push({
                        p1, p2, 
                        strength: strength * combinedAttraction * 2 // Make connections more visible
                    });
                    connectionCount++;
                }
            }
        }
    }

    draw() {
        // Clear canvas completely
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply scroll fade factor to all rendering
        const globalFade = this.scrollFadeFactor;

        // Draw connections with scroll fade
        this.connections.forEach(connection => {
            const { p1, p2, strength } = connection;
            
            if (strength > 0.1) {
                this.ctx.save();
                this.ctx.globalAlpha = strength * 0.5 * globalFade;
                this.ctx.strokeStyle = `hsl(${(p1.hue + p2.hue) / 2}, 70%, 65%)`;
                this.ctx.lineWidth = Math.max(0.7, strength * 2);
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = this.ctx.strokeStyle;
                
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
                this.ctx.restore();
            }
        });

        // Draw particles with scroll fade
        this.particles.forEach(particle => {
            if (particle.opacity > 0.01) {
                // Apply scroll fade to particle opacity
                const originalOpacity = particle.opacity;
                particle.opacity *= globalFade;
                particle.draw(this.ctx);
                particle.opacity = originalOpacity; // Restore original opacity for physics
            }
        });
    }

    animate() {
        // Performance tracking
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.frameCount++;

        // Skip frame if performance is poor
        if (deltaTime > 33) { // More than 30ms = less than 30 FPS
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        // For fixed positioning, only use viewport dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log(`Canvas resized to viewport: ${window.innerWidth} x ${window.innerHeight}`);
    }
}

// Initialize Fluid Dynamics System
document.addEventListener('DOMContentLoaded', () => {
    console.log('UPDATED VERSION: Fluid dynamics animation initialized');
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'fluidCanvas';
    
    // Set canvas styles to ensure full page coverage
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    canvas.style.background = 'transparent';
    
    // Insert canvas as first element in body
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const ctx = canvas.getContext('2d');
    
    // Set initial canvas size to viewport dimensions only
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(`Initial canvas size: ${window.innerWidth} x ${window.innerHeight}`);
    }
    
    setCanvasSize();

    // Create and start fluid system
    const fluidSystem = new FluidSystem(canvas, ctx);
    fluidSystem.animate();
    
    // Re-resize when window loads (in case content changes page dimensions)
    window.addEventListener('load', () => {
        setTimeout(() => {
            fluidSystem.resize();
        }, 100);
    });
});

// Keep existing scroll animations for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0.2s';
            entry.target.classList.add('fade-in');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const sectionsToAnimate = document.querySelectorAll('.section');
    sectionsToAnimate.forEach(section => {
        fadeInObserver.observe(section);
    });
});