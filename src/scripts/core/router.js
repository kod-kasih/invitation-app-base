// Router Module - Handles single-page navigation
class Router {
    constructor() {
        this.routes = new Map();
        this.currentSection = 'home';
        this.history = [];
        this.maxHistory = 50;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.registerRoute = this.registerRoute.bind(this);
        this.navigate = this.navigate.bind(this);
        this.goBack = this.goBack.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.updateURL = this.updateURL.bind(this);
    }

    init() {
        console.log('🧭 Router initialized');
        
        // Register default routes
        this.registerDefaultRoutes();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Handle initial route
        this.handleInitialRoute();
    }

    registerDefaultRoutes() {
        // Register page sections as routes
        const sections = ['home', 'details', 'gallery', 'rsvp', 'contact'];
        
        sections.forEach(section => {
            this.registerRoute(section, {
                element: `#${section}`,
                title: this.formatTitle(section),
                beforeEnter: (from, to) => this.animateOut(from),
                afterEnter: (from, to) => this.animateIn(to)
            });
        });
    }

    registerRoute(path, config) {
        this.routes.set(path, {
            path,
            element: config.element,
            title: config.title || path,
            beforeEnter: config.beforeEnter || null,
            afterEnter: config.afterEnter || null,
            data: config.data || {}
        });
        
        console.log(`📍 Route registered: ${path}`);
    }

    setupEventListeners() {
        // Handle hash changes
        window.addEventListener('hashchange', this.handleHashChange);
        
        // Handle navigation clicks
        document.addEventListener('click', this.handleNavClick);
        
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.section) {
                this.navigate(event.state.section, false);
            }
        });
    }

    handleInitialRoute() {
        const hash = window.location.hash.slice(1); // Remove #
        const initialSection = hash && this.routes.has(hash) ? hash : 'home';
        this.navigate(initialSection, false);
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && this.routes.has(hash) && hash !== this.currentSection) {
            this.navigate(hash, false);
        }
    }

    handleNavClick(event) {
        const navLink = event.target.closest('[data-section]');
        if (navLink) {
            event.preventDefault();
            const section = navLink.dataset.section;
            this.navigate(section);
        }

        // Handle CTA buttons that scroll to sections
        const ctaButton = event.target.closest('[data-action="scroll-to-rsvp"]');
        if (ctaButton) {
            event.preventDefault();
            this.navigate('rsvp');
        }
    }

    async navigate(section, updateHistory = true) {
        if (!this.routes.has(section)) {
            console.warn(`⚠️ Route not found: ${section}`);
            return false;
        }

        const fromSection = this.currentSection;
        const toSection = section;
        const route = this.routes.get(section);

        try {
            // Emit navigation start event
            this.emit('navigation:start', {
                from: fromSection,
                to: toSection
            });

            // Execute beforeEnter hook
            if (route.beforeEnter) {
                await route.beforeEnter(fromSection, toSection);
            }

            // Update current section
            this.currentSection = toSection;

            // Update URL
            if (updateHistory) {
                this.updateURL(section);
            }

            // Update navigation state
            this.updateNavigation(section);

            // Show target section
            this.showSection(section);

            // Update page title
            document.title = `${route.title} - ${this.getAppName()}`;

            // Execute afterEnter hook
            if (route.afterEnter) {
                await route.afterEnter(fromSection, toSection);
            }

            // Add to history
            if (updateHistory) {
                this.addToHistory(fromSection, toSection);
            }

            // Emit navigation complete event
            this.emit('navigation:complete', {
                from: fromSection,
                to: toSection
            });

            // Emit navigation change event for components
            this.emit('navigation:change', {
                section: toSection,
                route: route
            });

            console.log(`🧭 Navigated from ${fromSection} to ${toSection}`);
            return true;

        } catch (error) {
            console.error('❌ Navigation error:', error);
            this.emit('navigation:error', {
                from: fromSection,
                to: toSection,
                error
            });
            return false;
        }
    }

    updateURL(section) {
        const url = section === 'home' ? '#' : `#${section}`;
        
        // Update URL without triggering hashchange
        if (window.location.hash !== url) {
            history.pushState(
                { section },
                '',
                `${window.location.pathname}${url}`
            );
        }
    }

    updateNavigation(activeSection) {
        // Update navigation links
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

        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            
            const navToggle = document.querySelector('.nav-toggle');
            if (navToggle) {
                navToggle.classList.remove('active');
            }
        }
    }

    showSection(section) {
        // Hide all sections
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-hidden', 'true');
        });

        // Show target section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.setAttribute('aria-hidden', 'false');
            
            // Scroll to top of section
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async animateOut(section) {
        const element = document.getElementById(section);
        if (element) {
            element.style.transform = 'translateY(-20px)';
            element.style.opacity = '0';
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    async animateIn(section) {
        const element = document.getElementById(section);
        if (element) {
            // Reset transform and opacity
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }
    }

    addToHistory(from, to) {
        this.history.push({
            from,
            to,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    goBack() {
        if (this.history.length > 1) {
            // Get previous route
            const previous = this.history[this.history.length - 2];
            this.navigate(previous.from, false);
            
            // Remove last two entries to avoid loop
            this.history.splice(-2);
            
            return true;
        }
        
        // Fallback to home
        if (this.currentSection !== 'home') {
            this.navigate('home');
            return true;
        }
        
        return false;
    }

    formatTitle(section) {
        return section.charAt(0).toUpperCase() + section.slice(1);
    }

    getAppName() {
        return window.App && window.App.getConfig() 
            ? window.App.getConfig().app.name 
            : 'Event Invitation';
    }

    emit(eventType, data) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    // Public API methods
    getCurrentSection() {
        return this.currentSection;
    }

    getRoute(section) {
        return this.routes.get(section);
    }

    getAllRoutes() {
        return Array.from(this.routes.values());
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
    }

    // Smooth scroll to element within current section
    scrollToElement(selector, offset = 0) {
        const element = document.querySelector(selector);
        if (element) {
            const elementTop = element.offsetTop - offset;
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
            return true;
        }
        return false;
    }

    // Check if a route exists
    hasRoute(section) {
        return this.routes.has(section);
    }

    // Get current route info
    getCurrentRoute() {
        return this.routes.get(this.currentSection);
    }
}

// Create global router instance
window.Router = new Router();

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
