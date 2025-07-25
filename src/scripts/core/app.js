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
            // Try to load app config
            if (window.AppConfig) {
                this.config = window.AppConfig;
                return;
            }
            
            // Fallback to default config
            this.config = this.getDefaultConfig();
            
        } catch (error) {
            console.warn('Config not found, using default config');
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            app: {
                name: 'Event Invitation',
                version: '1.0.0',
                theme: 'default'
            },
            event: {
                title: 'Welcome to Our Special Event',
                subtitle: 'Join us for an unforgettable experience',
                date: 'Date TBD',
                location: 'Venue to be confirmed',
                organizer: {
                    name: 'Event Organizer',
                    email: 'contact@event.com',
                    phone: '+1 (555) 123-4567'
                }
            },
            features: {
                gallery: true,
                rsvp: true,
                contact: true,
                schedule: true
            },
            email: {
                serviceUrl: 'https://formspree.io/f/your-form-id',
                provider: 'formspree'
            },
            gallery: {
                images: [
                    {
                        src: 'assets/images/gallery/1.jpg',
                        caption: 'Sample Image 1',
                        alt: 'Gallery Image 1'
                    }
                ]
            },
            schedule: [
                {
                    time: '10:00 AM',
                    title: 'Welcome & Registration',
                    description: 'Check-in and welcome reception'
                },
                {
                    time: '11:00 AM',
                    title: 'Main Event',
                    description: 'The main celebration begins'
                },
                {
                    time: '1:00 PM',
                    title: 'Lunch',
                    description: 'Enjoy a delicious meal together'
                },
                {
                    time: '3:00 PM',
                    title: 'Activities',
                    description: 'Fun activities and entertainment'
                },
                {
                    time: '6:00 PM',
                    title: 'Closing',
                    description: 'Thank you and farewell'
                }
            ]
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

        // Update event details
        this.updateContent('detail-datetime', this.config.event.date);
        this.updateContent('detail-location', this.config.event.location);
        this.updateContent('detail-dresscode', this.config.event.dresscode);
        this.updateContent('detail-dining', this.config.event.dining);

        // Update schedule if enabled
        if (this.config.features.schedule && this.config.schedule) {
            this.updateSchedule();
        }
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
