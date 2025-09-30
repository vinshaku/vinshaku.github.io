// ===============================
// Main JavaScript
// ===============================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initTheme();
    initLoadingScreen();
    initNavigation();
    initSmoothScroll();
    initCustomCursor();
    initFullscreenProjects();
    initContactForm();
    initAnimations();
    initScrollAnimations();
    
    // Scroll indicator click handler
    const scrollIndicator = document.querySelector('.scroll-indicator-modern');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// ===============================
// Theme Management
// ===============================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    
    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
    
    // Mobile theme toggle handler
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }
    
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Add transition class
        html.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        
        // Update theme
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update galaxy colors if available
        if (window.updateGalaxyColors) {
            window.updateGalaxyColors();
        }
        
        // Remove transition after completion
        setTimeout(() => {
            html.style.transition = '';
        }, 500);
    }
}

// ===============================
// Loading Screen
// ===============================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Hide loading screen after delay
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
            loadingScreen.remove();
        }, 100);
    }, 200);
}

// ===============================
// Navigation
// ===============================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add background on scroll
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.1)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.05)';
            navbar.style.backdropFilter = 'blur(24px)';
        }
        
        // Hide/show navbar on scroll (only on desktop)
        if (window.innerWidth > 768) {
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        // Hide mobile menu on scroll up for mobile devices
        if (window.innerWidth <= 768) {
            if (currentScroll < lastScroll && currentScroll > 50) {
                // Scrolling up - hide mobile menu if it's open
                if (mobileMenu.classList.contains('active')) {
                    mobileMenuToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Prevent body scroll when mobile menu is open
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && mobileMenu.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Touch event handling for mobile
    if ('ontouchstart' in window) {
        mobileMenu.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });
        
        // Close menu on swipe down
        let touchStartY = 0;
        let touchEndY = 0;
        
        mobileMenu.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        mobileMenu.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].clientY;
            const swipeDistance = touchStartY - touchEndY;
            
            if (swipeDistance > 100) { // Swipe up
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Active link highlighting
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-80px 0px -80px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===============================
// Smooth Scrolling
// ===============================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===============================
// Custom Cursor
// ===============================
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursor || !cursorDot || !cursorOutline) return;
    
    // Check if device has a mouse
    if (window.matchMedia('(hover: none)').matches) {
        cursor.style.display = 'none';
        return;
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Move dot immediately
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });
    
    // Smooth outline animation
    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top = outlineY + 'px';
        
        requestAnimationFrame(animateOutline);
    }
    animateOutline();
    
    // Add hover effects
    const hoverElements = document.querySelectorAll('a, button, .btn, input, textarea, .project-link');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
    
    // Click effect
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// ===============================
// Fullscreen Project Cards
// ===============================
function initFullscreenProjects() {
    const projectCards = document.querySelectorAll('.project-card-fullscreen');
    const projectsHeader = document.querySelector('.projects-header');
    
    if (projectCards.length === 0) return;
    
    // Create scroll observer for each card
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
    };
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            const cardIndex = parseInt(card.dataset.project);
            
            if (entry.intersectionRatio > 0.5) {
                // Card is more than 50% visible
                card.classList.add('active');
                
                // Hide header after first card
                if (cardIndex > 1 && projectsHeader) {
                    projectsHeader.classList.add('hidden');
                }
                
                // Scale effect for cards
                const scale = 0.9 + (entry.intersectionRatio * 0.1);
                const opacity = 0.5 + (entry.intersectionRatio * 0.5);
                
                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
            } else {
                card.classList.remove('active');
                
                // Show header for first card
                if (cardIndex === 1 && projectsHeader && entry.intersectionRatio > 0) {
                    projectsHeader.classList.remove('hidden');
                }
                
                // Parallax effect for inactive cards
                const translateY = (1 - entry.intersectionRatio) * 50;
                card.style.transform = `translateY(${translateY}px) scale(0.95)`;
                card.style.opacity = 0.8;
            }
        });
    }, observerOptions);
    
    // Observe all cards
    projectCards.forEach(card => {
        cardObserver.observe(card);
    });
    
    // Smooth scroll behavior for project section
    const projectSection = document.getElementById('projects');
    if (projectSection) {
        // Add smooth scrolling within project section
        let isScrolling = false;
        let scrollTimeout;
        
        projectSection.addEventListener('wheel', (e) => {
            if (!isScrolling) {
                isScrolling = true;
                
                // Clear existing timeout
                clearTimeout(scrollTimeout);
                
                // Set scrolling to false after scroll ends
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                }, 150);
            }
        }, { passive: true });
    }
}

// ===============================
// Contact Form
// ===============================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showFormStatus('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showFormStatus('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission (replace with actual backend integration)
        showFormStatus('Sending message...', '');
        
        setTimeout(() => {
            showFormStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
            form.reset();
            
            // Hide status after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
                formStatus.className = 'form-status';
            }, 5000);
        }, 1500);
    });
    
    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
    }
}

// ===============================
// Scroll Animations
// ===============================
function initAnimations() {
    // Fade in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    const slideElements = document.querySelectorAll('.slide-up');
    const scaleElements = document.querySelectorAll('.scale-in');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    [...fadeElements, ...slideElements, ...scaleElements].forEach(el => {
        el.style.animationPlayState = 'paused';
        animationObserver.observe(el);
    });
    
    // Section animations
    const sections = document.querySelectorAll('.section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate child elements
                const cards = entry.target.querySelectorAll('.glass-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease';
        sectionObserver.observe(section);
    });
    
    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .section.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ===============================
// Utility Functions
// ===============================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===============================
// Performance Monitoring
// ===============================
function monitorPerformance() {
    // Check if Performance API is available
    if (window.performance && window.performance.memory) {
        const memoryUsage = window.performance.memory.usedJSHeapSize / 1048576;
        
        // Reduce quality if memory usage is high
        if (memoryUsage > 50) {
            console.log('High memory usage detected, optimizing...');
            // Reduce particle count or animation complexity if needed
        }
    }
    
    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;
    
    function checkFPS() {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (currentTime - lastTime));
            
            // Reduce effects if FPS is low
            if (fps < 30) {
                console.log('Low FPS detected, reducing effects...');
                // Implement performance optimizations
            }
            
            frames = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkFPS);
    }
    
    // Start monitoring after page load
    setTimeout(checkFPS, 1000);
}

// Start performance monitoring
if (window.requestAnimationFrame) {
    monitorPerformance();
}

// ===============================
// Scroll Animations
// ===============================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-scale');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number-modern');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Start counter animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(animateCounters, 1000); // Start after 1 second
            heroObserver.unobserve(entry.target);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
});
