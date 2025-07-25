// Template Engine Service
// This service handles populating HTML placeholders with configuration data
class TemplateEngine {
    constructor() {
        this.config = null;
        this.placeholderSelectors = new Map();
        this.initializePlaceholders();
    }

    /**
     * Initialize with configuration data
     * @param {Object} config - Configuration object
     */
    init(config) {
        this.config = config;
        this.populateAllPlaceholders();
    }

    /**
     * Define placeholder mappings between HTML elements and config paths
     * @private
     */
    initializePlaceholders() {
        // Basic event information
        this.placeholderSelectors.set('#event-title', 'event.title');
        this.placeholderSelectors.set('#main-title', 'event.title');
        this.placeholderSelectors.set('#main-subtitle', 'event.subtitle');
        this.placeholderSelectors.set('#event-date', 'event.date');
        this.placeholderSelectors.set('#detail-datetime', 'event.date');
        this.placeholderSelectors.set('#detail-location', 'event.location');
        this.placeholderSelectors.set('#detail-dresscode', 'event.dresscode');
        this.placeholderSelectors.set('#detail-dining', 'event.dining');

        // Contact information
        this.placeholderSelectors.set('#organizer-name', 'organizer.name');
        this.placeholderSelectors.set('#organizer-email', 'organizer.email');
        this.placeholderSelectors.set('#organizer-phone', 'organizer.phone');
        this.placeholderSelectors.set('#contact-address', 'contact.address');

        // Hero image
        this.placeholderSelectors.set('#hero-img', 'event.heroImage');
    }

    /**
     * Populate all registered placeholders
     */
    populateAllPlaceholders() {
        if (!this.config) {
            console.warn('TemplateEngine: No configuration provided');
            return;
        }

        // Populate basic text placeholders
        this.placeholderSelectors.forEach((configPath, selector) => {
            this.populatePlaceholder(selector, configPath);
        });

        // Populate complex components
        this.populateSchedule();
        this.populateGallery();
        this.populateRSVPForm();
        this.populateContactMethods();
        this.populateNavigation();
    }

    /**
     * Populate a single placeholder
     * @param {string} selector - CSS selector for the element
     * @param {string} configPath - Dot-separated path to config value
     */
    populatePlaceholder(selector, configPath) {
        const element = document.querySelector(selector);
        if (!element) {
            return;
        }

        const value = this.getConfigValue(configPath);
        if (value === null || value === undefined) {
            return;
        }

        // Handle different element types
        if (element.tagName === 'IMG') {
            // For images, update src attribute
            if (configPath.includes('heroImage')) {
                element.src = `assets/images/${value}`;
            } else {
                element.src = value;
            }
        } else if (element.tagName === 'A' && configPath.includes('email')) {
            // For email links
            element.href = `mailto:${value}`;
            element.textContent = value;
        } else if (element.tagName === 'A' && configPath.includes('phone')) {
            // For phone links
            element.href = `tel:${value}`;
            element.textContent = value;
        } else {
            // For regular text content
            element.textContent = value;
        }
    }

    /**
     * Populate the schedule timeline
     */
    populateSchedule() {
        const scheduleContainer = document.querySelector('#schedule-timeline');
        if (!scheduleContainer) {
            return;
        }

        // Clear existing content
        scheduleContainer.innerHTML = '';

        // Get schedule from config with fallback
        const schedule = this.config?.schedule || this.getDefaultSchedule();

        if (!schedule || schedule.length === 0) {
            // Show helpful message instead of empty section
            scheduleContainer.innerHTML = `
                <div class="schedule-placeholder">
                    <p><em>Schedule details will be added soon. Please check back later or contact the organizer for more information.</em></p>
                </div>
            `;
            return;
        }

        schedule.forEach((item, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'timeline-item';
            scheduleItem.innerHTML = `
                <div class="timeline-time">${item.time || 'Time TBD'}</div>
                <div class="timeline-content">
                    <h4>${item.title || 'Event Item'}</h4>
                    <p>${item.description || 'Details to be announced'}</p>
                </div>
            `;
            scheduleContainer.appendChild(scheduleItem);
        });

        console.log('✅ Schedule populated with', schedule.length, 'items');
    }

    /**
     * Get default schedule if none provided
     * @private
     */
    getDefaultSchedule() {
        return [
            {
                time: "TBD",
                title: "Event Schedule",
                description: "Detailed schedule will be provided closer to the event date. Please stay tuned for updates!"
            }
        ];
    }

    /**
     * Populate the gallery grid
     */
    populateGallery() {
        const galleryContainer = document.querySelector('#gallery-grid');
        if (!galleryContainer) {
            return;
        }

        // Clear existing content
        galleryContainer.innerHTML = '';

        // Get gallery images with fallback
        const galleryImages = this.config?.gallery?.images || this.getDefaultGalleryImages();

        if (!galleryImages || galleryImages.length === 0) {
            // Show helpful message instead of empty section
            galleryContainer.innerHTML = `
                <div class="gallery-placeholder">
                    <p><em>Gallery images will be added soon. Please check back later for event photos and highlights!</em></p>
                </div>
            `;
            return;
        }

        galleryImages.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="assets/images/${image.src || 'placeholder-hero.svg'}" 
                     alt="${image.alt || 'Event image'}" 
                     data-caption="${image.caption || 'Event photo'}"
                     data-index="${index}">
                <div class="gallery-overlay">
                    <span class="gallery-caption">${image.caption || 'Event photo'}</span>
                </div>
            `;
            galleryContainer.appendChild(galleryItem);
        });

        console.log('✅ Gallery populated with', galleryImages.length, 'images');
    }

    /**
     * Get default gallery images if none provided
     * @private
     */
    getDefaultGalleryImages() {
        return [
            {
                src: "placeholder-hero.svg",
                alt: "Event placeholder",
                caption: "Event photos will be added soon!"
            }
        ];
    }

    /**
     * Populate RSVP form fields
     */
    populateRSVPForm() {
        const rsvpContainer = document.querySelector('#rsvp-form');
        if (!rsvpContainer) {
            return;
        }

        // Find or create form fields container
        let fieldsContainer = rsvpContainer.querySelector('.form-fields');
        if (!fieldsContainer) {
            fieldsContainer = document.createElement('div');
            fieldsContainer.className = 'form-fields';
            rsvpContainer.appendChild(fieldsContainer);
        }

        // Clear existing fields
        fieldsContainer.innerHTML = '';

        // Get RSVP fields with fallback
        const rsvpFields = this.config?.rsvp?.fields || this.getDefaultRSVPFields();

        rsvpFields.forEach(field => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'form-group';

            let fieldHTML = `<label for="${field.name}">${field.label || field.name}`;
            if (field.required) {
                fieldHTML += ' <span class="required">*</span>';
            }
            fieldHTML += '</label>';

            if (field.type === 'textarea') {
                fieldHTML += `<textarea 
                    id="${field.name}" 
                    name="${field.name}" 
                    ${field.required ? 'required' : ''}
                    ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                ></textarea>`;
            } else {
                fieldHTML += `<input 
                    type="${field.type || 'text'}" 
                    id="${field.name}" 
                    name="${field.name}" 
                    ${field.required ? 'required' : ''}
                    ${field.min ? `min="${field.min}"` : ''}
                    ${field.max ? `max="${field.max}"` : ''}
                    ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                >`;
            }

            fieldContainer.innerHTML = fieldHTML;
            fieldsContainer.appendChild(fieldContainer);
        });

        // Add deadline information if available
        const deadline = this.config?.rsvp?.deadline;
        if (deadline) {
            let deadlineInfo = rsvpContainer.querySelector('.rsvp-deadline');
            if (!deadlineInfo) {
                deadlineInfo = document.createElement('p');
                deadlineInfo.className = 'rsvp-deadline';
                rsvpContainer.insertBefore(deadlineInfo, fieldsContainer);
            }
            deadlineInfo.textContent = `Please RSVP by ${deadline}`;
        }

        console.log('✅ RSVP form populated with', rsvpFields.length, 'fields');
    }

    /**
     * Get default RSVP fields if none provided
     * @private
     */
    getDefaultRSVPFields() {
        return [
            {
                name: "fullName",
                label: "Full Name",
                type: "text",
                required: true
            },
            {
                name: "email",
                label: "Email Address",
                type: "email",
                required: true
            },
            {
                name: "attendance",
                label: "Will you be attending?",
                type: "select",
                required: true,
                options: ["Yes", "No", "Maybe"]
            }
        ];
    }

    /**
     * Populate contact methods
     */
    populateContactMethods() {
        const contactContainer = document.querySelector('.contact-methods');
        if (!contactContainer) {
            return;
        }

        // Clear existing content
        contactContainer.innerHTML = '';

        // Get contact methods with fallback
        const contactMethods = this.config?.contact?.methods || this.getDefaultContactMethods();

        if (!contactMethods || contactMethods.length === 0) {
            // Show helpful message
            contactContainer.innerHTML = `
                <div class="contact-placeholder">
                    <p><em>Additional contact information will be provided soon. Please check the organizer details above for now.</em></p>
                </div>
            `;
            return;
        }

        contactMethods.forEach(method => {
            const methodElement = document.createElement('div');
            methodElement.className = 'contact-method';

            let href = '';
            if (method.type === 'email') {
                href = `mailto:${method.value}`;
            } else if (method.type === 'phone') {
                href = `tel:${method.value}`;
            }

            methodElement.innerHTML = `
                <div class="contact-icon">${method.icon || '📞'}</div>
                <div class="contact-info">
                    <h4>${method.label || method.type}</h4>
                    ${href ? `<a href="${href}">${method.value || 'Contact details TBD'}</a>` : `<span>${method.value || 'Contact details TBD'}</span>`}
                </div>
            `;
            contactContainer.appendChild(methodElement);
        });

        console.log('✅ Contact methods populated');
    }

    /**
     * Get default contact methods if none provided
     * @private
     */
    getDefaultContactMethods() {
        return [
            {
                type: "email",
                label: "Email Us",
                value: "contact@example.com",
                icon: "📧"
            }
        ];
    }

    /**
     * Update navigation based on configuration
     */
    populateNavigation() {
        if (!this.config.customization?.navigation) {
            return;
        }

        const navigation = this.config.customization.navigation;
        
        // Hide navigation items that are disabled
        Object.keys(navigation).forEach(section => {
            if (!navigation[section]) {
                const navLink = document.querySelector(`[data-section="${section}"]`);
                const sectionElement = document.querySelector(`#${section}`);
                
                if (navLink) {
                    navLink.style.display = 'none';
                }
                if (sectionElement) {
                    sectionElement.style.display = 'none';
                }
            }
        });

        console.log('✅ Navigation updated');
    }

    /**
     * Get configuration value by path
     * @param {string} path - Dot-separated path
     * @returns {*} Configuration value
     */
    getConfigValue(path) {
        if (!this.config) return null;

        const keys = path.split('.');
        let current = this.config;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return null;
            }
        }

        return current;
    }

    /**
     * Update a specific placeholder
     * @param {string} selector - CSS selector
     * @param {string} configPath - Configuration path
     */
    updatePlaceholder(selector, configPath) {
        this.populatePlaceholder(selector, configPath);
    }

    /**
     * Refresh all placeholders (useful after config changes)
     */
    refresh() {
        this.populateAllPlaceholders();
    }
}

// Export for global use
window.TemplateEngine = TemplateEngine;
