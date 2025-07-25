// Navigation Component
class NavigationComponent {
    constructor() {
        this.isInitialized = false;
        this.isMobileMenuOpen = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleMobileToggle = this.handleMobileToggle.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.updateActiveLink = this.updateActiveLink.bind(this);
    }

    async init() {
        try {
            console.log('🧭 Initializing Navigation Component');
            
            // Update navigation content from config
            this.updateFromConfig();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup scroll detection
            this.setupScrollDetection();
            
            this.isInitialized = true;
            console.log('✅ Navigation Component initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Navigation Component:', error);
        }
    }

    updateFromConfig() {
        const config = window.App ? window.App.getConfig() : null;
        if (!config) return;

        // Update event title in navigation
        const eventTitle = document.getElementById('event-title');
        if (eventTitle) {
            eventTitle.textContent = config.event.title || config.app.name;
        }

        // Update footer event name
        const footerEventName = document.getElementById('footer-event-name');
        if (footerEventName) {
            footerEventName.textContent = config.event.title || config.app.name;
        }
    }

    setupEventListeners() {
        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', this.handleMobileToggle);
        }

        // Window resize
        window.addEventListener('resize', this.handleResize);

        // Window scroll for navbar effects
        window.addEventListener('scroll', this.handleScroll);

        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            const nav = document.querySelector('.navigation-component');
            const navMenu = document.querySelector('.nav-menu');
            
            if (this.isMobileMenuOpen && 
                nav && 
                !nav.contains(event.target) && 
                navMenu) {
                this.closeMobileMenu();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Listen for navigation changes
        if (window.EventBus) {
            window.EventBus.on('navigation:change', (data) => {
                this.updateActiveLink(data.section);
                this.closeMobileMenu();
            });
        }
    }

    setupScrollDetection() {
        let ticking = false;
        
        const updateNav = () => {
            const nav = document.querySelector('.navigation-component');
            if (!nav) return;

            const scrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Auto-detect current section based on scroll position
            this.detectCurrentSection();
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        });
    }

    detectCurrentSection() {
        const sections = document.querySelectorAll('.page-section');
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        let currentSection = 'home';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionHeight = rect.height;
            
            // Check if section is in viewport
            if (scrollY >= sectionTop - windowHeight / 3 && 
                scrollY < sectionTop + sectionHeight - windowHeight / 3) {
                currentSection = section.id;
            }
        });

        // Update active link if different from current router section
        if (window.Router && currentSection !== window.Router.getCurrentSection()) {
            this.updateActiveLink(currentSection);
        }
    }

    handleMobileToggle(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!navToggle || !navMenu) return;

        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.classList.add('active');
            navMenu.classList.add('active');
            this.isMobileMenuOpen = true;
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus first menu item for accessibility
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) {
                firstLink.focus();
            }

            // Emit event
            this.emit('navigation:mobile-menu-opened');
        }
    }

    closeMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            this.isMobileMenuOpen = false;
            
            // Restore body scroll
            document.body.style.overflow = '';

            // Emit event
            this.emit('navigation:mobile-menu-closed');
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    handleScroll() {
        // Close mobile menu on scroll
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    updateActiveLink(activeSection) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const section = link.dataset.section;
            
            if (section === activeSection) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    // Smooth scroll to top
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add sticky navigation effect
    makeStickyOnScroll() {
        const nav = document.querySelector('.navigation-component');
        if (!nav) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        nav.classList.remove('sticky');
                    } else {
                        nav.classList.add('sticky');
                    }
                });
            },
            { threshold: 0 }
        );

        // Create a sentinel element at the top
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        sentinel.style.position = 'absolute';
        sentinel.style.top = '0';
        document.body.insertBefore(sentinel, document.body.firstChild);
        
        observer.observe(sentinel);
    }

    // Update navigation theme
    setTheme(theme) {
        const nav = document.querySelector('.navigation-component');
        if (nav) {
            nav.setAttribute('data-theme', theme);
        }
    }

    // Show/hide navigation
    show() {
        const nav = document.querySelector('.navigation-component');
        if (nav) {
            nav.style.transform = 'translateY(0)';
            nav.style.opacity = '1';
        }
    }

    hide() {
        const nav = document.querySelector('.navigation-component');
        if (nav) {
            nav.style.transform = 'translateY(-100%)';
            nav.style.opacity = '0';
        }
    }

    // Add breadcrumb support
    updateBreadcrumb(path) {
        const breadcrumb = document.querySelector('.nav-breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = path.map(item => 
                `<span class="breadcrumb-item">${item}</span>`
            ).join('<span class="breadcrumb-separator">›</span>');
        }
    }

    emit(eventType, data = null) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    // Public API
    getMobileMenuState() {
        return this.isMobileMenuOpen;
    }

    getActiveSection() {
        const activeLink = document.querySelector('.nav-link.active');
        return activeLink ? activeLink.dataset.section : null;
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.removeEventListener('click', this.handleMobileToggle);
        }

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);

        // Clear state
        this.isMobileMenuOpen = false;
        this.isInitialized = false;
        
        console.log('🧭 Navigation Component destroyed');
    }
}

// Make available globally
window.NavigationComponent = NavigationComponent;
