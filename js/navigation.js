// Navigation & Smooth Scrolling

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Dynamic navbar background on scroll
let lastScrollTop = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Change navbar background opacity based on scroll position
    if (scrollTop > 100) {
        navbar.style.background = 'rgba(15, 15, 35, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 15, 35, 0.9)';
    }
    
    // Hide/show navbar on scroll (optional feature)
    if (scrollTop > lastScrollTop && scrollTop > 200) {
        // Scrolling down - hide navbar
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up - show navbar
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Active navigation highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Mobile menu toggle (for future mobile menu implementation)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open mobile menu
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.remove('mobile-active');
    }
});

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Navigation initialized');
    
    // Add active class styles
    const style = document.createElement('style');
    style.textContent = `
        .nav-links a.active {
            color: var(--accent-cyan);
        }
        .nav-links a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
});