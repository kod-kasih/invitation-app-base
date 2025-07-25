// Core Application Module
class InvitationApp {
    constructor() {
        this.components = new Map();
        this.config = null;
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadConfig = this.loadConfig.bind(this);
        this.registerComponent = this.registerComponent.bind(this);
        this.getComponent = this.getComponent.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    async init() {
        try {
            this.showLoading();
            
            // Load configuration
            await this.loadConfig();
            
            // Initialize event bus
            if (window.EventBus) {
                window.EventBus.init();
            }
            
            // Initialize router
            if (window.Router) {
                window.Router.init();
            }
            
            // Initialize components
            await this.initializeComponents();
            
            // Apply theme
            this.applyTheme();
            
            // Hide loading
            this.hideLoading();
            
            this.isInitialized = true;
            
            // Emit app ready event
            this.emit('app:ready');
            
            console.log('✅ Invitation App initialized successfully');
            
        } catch (error) {
            this.handleError('Failed to initialize app', error);
        }
    }

    async loadConfig() {
        try {
            // Initialize YAML config service
            const yamlService = new YamlConfigService();
            
            // Try to load YAML configuration first
            let yamlConfig = null;
            try {
                yamlConfig = await yamlService.loadConfig('config.yaml');
                console.log('✅ YAML configuration loaded successfully');
            } catch (yamlError) {
                console.warn('⚠️ YAML configuration not available:', yamlError.message);
                console.info('ℹ️  Using fallback configuration. Users should update config.yaml for custom content.');
            }
            
            // Get JavaScript configuration (for technical settings)
            const jsConfig = window.AppConfig || this.getDefaultConfig();
            
            // Merge configurations (YAML content takes precedence, JS features/settings remain)
            if (yamlConfig) {
                // Preserve JS-only features but allow YAML to override content
                this.config = yamlService.mergeWithJsConfig(jsConfig);
                console.log('✅ Configuration merged: YAML content + JavaScript features');
            } else {
                this.config = jsConfig;
                console.log('✅ Using default configuration with helpful placeholders');
            }
            
            // Store yaml service for later use
            this.yamlService = yamlService;
            
            // Validate essential config exists
            this.validateConfig();
            
        } catch (error) {
            console.error('❌ Configuration loading failed:', error);
            this.config = this.getDefaultConfig();
            this.showConfigurationHelp();
        }
    }

    /**
     * Validate essential configuration and provide helpful guidance
     */
    validateConfig() {
        const requiredFields = [
            'event.title',
            'event.date',
            'event.location'
        ];

        const missingFields = [];
        requiredFields.forEach(field => {
            const value = this.getConfigValue(field);
            if (!value || value.includes('TBD') || value.includes('Please Update')) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            console.info('ℹ️  Configuration guidance: Please update these fields in config.yaml:');
            missingFields.forEach(field => console.info(`   - ${field}`));
            this.showConfigurationHelp();
        }
    }

    /**
     * Get configuration value by path
     */
    getConfigValue(path) {
        const keys = path.split('.');
        let current = this.config;
        for (const key of keys) {
            current = current?.[key];
            if (current === undefined) return null;
        }
        return current;
    }

    /**
     * Show helpful configuration guidance to users
     */
    showConfigurationHelp() {
        // Add a subtle help banner that won't alarm users
        const helpBanner = document.createElement('div');
        helpBanner.id = 'config-help-banner';
        helpBanner.style.cssText = `
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 12px 16px;
            margin: 0;
            font-size: 14px;
            color: #495057;
            position: relative;
            z-index: 1000;
        `;
        helpBanner.innerHTML = `
            <strong>💡 Customize this invitation:</strong> 
            Update the details in <code>src/config.yaml</code> to personalize your event. 
            <a href="YAML-CONFIG-GUIDE.md" target="_blank" style="color: #007bff;">View guide →</a>
        `;
        
        document.body.insertBefore(helpBanner, document.body.firstChild);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (helpBanner.parentNode) {
                helpBanner.remove();
            }
        }, 10000);
    }

    getDefaultConfig() {
        return {
            app: {
                name: 'Event Invitation',
                version: '1.0.0',
                theme: 'default'
            },
            event: {
                title: 'Event Title - Please Update Config',
                subtitle: 'Please update your event details in config.yaml',
                date: 'Date TBD - Please Update Config',
                location: 'Location TBD - Please Update Config',
                dresscode: 'Dress code TBD',
                dining: 'Dining details TBD',
                heroImage: 'placeholder-hero.svg',
                organizer: {
                    name: 'Organizer Name TBD',
                    email: 'email@example.com',
                    phone: '+1 (555) 000-0000'
                }
            },
            // These features are controlled by developers only
            features: {
                gallery: true,
                rsvp: true,
                contact: true,
                schedule: true,
                socialSharing: false,
                downloadCalendar: false
            },
            email: {
                serviceUrl: 'https://formspree.io/f/your-form-id',
                provider: 'formspree'
            },
            gallery: {
                images: []
            },
            schedule: [],
            rsvp: {
                enabled: true,
                fields: []
            },
            contact: {
                methods: []
            }
        };
    }

    async initializeComponents() {
        const componentInitializers = [
            'NavigationComponent',
            'HeroComponent',
            'GalleryComponent',
            'RSVPComponent',
            'ContactComponent'
        ];

        for (const componentName of componentInitializers) {
            try {
                if (window[componentName]) {
                    const component = new window[componentName]();
                    await component.init();
                    this.registerComponent(componentName, component);
                }
            } catch (error) {
                console.warn(`Failed to initialize ${componentName}:`, error);
            }
        }

        // Initialize template engine
        this.templateEngine = new TemplateEngine();
        this.templateEngine.init(this.config);

        // Update content from configuration
        this.updateContentFromConfig();
    }

    registerComponent(name, component) {
        this.components.set(name, component);
        console.log(`📦 Component registered: ${name}`);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    applyTheme() {
        if (this.config.app.theme && this.config.app.theme !== 'default') {
            document.documentElement.setAttribute('data-theme', this.config.app.theme);
        }
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }
    }

    emit(eventType, data = null) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    on(eventType, callback) {
        if (window.EventBus) {
            window.EventBus.on(eventType, callback);
        }
    }

    handleError(message, error) {
        console.error(`❌ ${message}:`, error);
        
        // Hide loading if there's an error
        this.hideLoading();
        
        // Show error message to user
        this.showErrorMessage(message);
        
        // Emit error event
        this.emit('app:error', { message, error });
    }

    showErrorMessage(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-bg);
            color: var(--error-color);
            border: 2px solid var(--error-border);
            border-radius: 10px;
            padding: 15px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Utility methods
    updateContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }

    updateHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    updateAttribute(elementId, attribute, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.setAttribute(attribute, value);
        }
    }

    // Public API
    getConfig() {
        return this.config;
    }

    setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        if (this.config) {
            this.config.app.theme = themeName;
        }
        
        // Save to storage
        if (window.StorageService) {
            window.StorageService.setItem('app_theme', themeName);
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'default';
    }

    updateContentFromConfig() {
        if (!this.config) return;

        // The template engine handles all placeholder population
        // This method is kept for any additional custom logic
        console.log('✅ Content updated from configuration');
    }

    updateSchedule() {
        const scheduleTimeline = document.getElementById('schedule-timeline');
        if (!scheduleTimeline || !this.config.schedule) return;

        scheduleTimeline.innerHTML = '';

        this.config.schedule.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-time">${item.time}</div>
                    <h4 class="timeline-title">${item.title}</h4>
                    <p class="timeline-description">${item.description}</p>
                </div>
            `;
            scheduleTimeline.appendChild(timelineItem);
        });
    }
}

// Create global app instance
window.App = new InvitationApp();

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.App.init();
    });
} else {
    // Document is already loaded
    window.App.init();
}
