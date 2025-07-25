// Contact Component
class ContactComponent {
    constructor() {
        this.isInitialized = false;
        this.formData = {};
        this.isSubmitting = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.updateFromConfig = this.updateFromConfig.bind(this);
        this.setupForm = this.setupForm.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    async init() {
        try {
            console.log('📞 Initializing Contact Component');
            
            // Update contact info from config
            this.updateFromConfig();
            
            // Setup form
            this.setupForm();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Contact Component initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Contact Component:', error);
        }
    }

    updateFromConfig() {
        const config = window.App ? window.App.getConfig() : null;
        if (!config || !config.event.organizer) return;

        const organizer = config.event.organizer;

        // Update organizer name
        const organizerName = document.getElementById('organizer-name');
        if (organizerName) {
            organizerName.textContent = organizer.name || 'Event Organizer';
        }

        // Update organizer email
        const organizerEmail = document.getElementById('organizer-email');
        if (organizerEmail) {
            organizerEmail.textContent = organizer.email || 'contact@event.com';
            organizerEmail.href = `mailto:${organizer.email}`;
        }

        // Update organizer phone
        const organizerPhone = document.getElementById('organizer-phone');
        if (organizerPhone) {
            organizerPhone.textContent = organizer.phone || '+1 (555) 123-4567';
            organizerPhone.href = `tel:${organizer.phone}`;
        }
    }

    setupForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Add form validation classes
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Auto-resize textarea
        const messageTextarea = document.getElementById('contact-message');
        if (messageTextarea) {
            messageTextarea.addEventListener('input', this.autoResizeTextarea);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }

        // Listen for navigation changes
        if (window.EventBus) {
            window.EventBus.on('navigation:change', (data) => {
                if (data.section === 'contact') {
                    this.onSectionEnter();
                }
            });
        }

        // Setup click handlers for contact info links
        this.setupContactLinks();
    }

    setupContactLinks() {
        // Make email clickable
        const emailElement = document.getElementById('organizer-email');
        if (emailElement && !emailElement.href) {
            emailElement.style.cursor = 'pointer';
            emailElement.addEventListener('click', () => {
                window.location.href = `mailto:${emailElement.textContent}`;
            });
        }

        // Make phone clickable
        const phoneElement = document.getElementById('organizer-phone');
        if (phoneElement && !phoneElement.href) {
            phoneElement.style.cursor = 'pointer';
            phoneElement.addEventListener('click', () => {
                window.location.href = `tel:${phoneElement.textContent}`;
            });
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }

        // Collect form data
        this.collectFormData();
        
        // Validate form
        if (!this.validateForm()) {
            this.showError('Please correct the errors above and try again.');
            return;
        }

        // Submit form
        this.submitForm();
    }

    collectFormData() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const formData = new FormData(form);
        this.formData = {};

        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }

        // Add metadata
        this.formData.timestamp = new Date().toISOString();
        this.formData.userAgent = navigator.userAgent;
        this.formData.formType = 'contact';
    }

    validateForm() {
        const form = document.getElementById('contact-form');
        if (!form) return false;

        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        // Clear previous errors
        this.clearAllErrors();

        // Validate required fields
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate email format
        const emailField = document.getElementById('contact-email');
        if (emailField && emailField.value) {
            if (!this.isValidEmail(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }

        // Validate message length
        const messageField = document.getElementById('contact-message');
        if (messageField && messageField.value) {
            if (messageField.value.length < 10) {
                this.showFieldError(messageField, 'Message must be at least 10 characters long');
                isValid = false;
            }
        }

        return isValid;
    }

    validateField(field) {
        if (!field.required) return true;

        const value = field.value.trim();
        
        if (!value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error class
        field.classList.add('error');

        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error-color);
            font-size: 0.875rem;
            margin-top: 5px;
        `;

        formGroup.appendChild(errorElement);
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.remove('error');
        
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearAllErrors() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Remove error classes
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });

        // Remove error messages
        const errorMessages = form.querySelectorAll('.field-error');
        errorMessages.forEach(message => {
            message.remove();
        });
    }

    async submitForm() {
        this.isSubmitting = true;
        
        // Show loading state
        this.showLoadingState();

        try {
            // Get email service configuration
            const config = window.App ? window.App.getConfig() : null;
            const emailConfig = config?.email;

            if (!emailConfig || !emailConfig.serviceUrl) {
                throw new Error('Email service not configured');
            }

            // Prepare submission data
            const submissionData = {
                ...this.formData,
                subject: this.formData.contactSubject || `Contact Form Message from ${this.formData.contactName}`,
                to: config.event.organizer.email
            };

            // Submit via email service
            let response;
            if (window.EmailService) {
                response = await window.EmailService.sendEmail(submissionData);
            } else {
                // Fallback to fetch
                response = await fetch(emailConfig.serviceUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            // Save to local storage as backup
            if (window.StorageService) {
                window.StorageService.saveContactMessage(this.formData);
            }

            // Show success
            this.showSuccess();
            
            // Reset form after delay
            setTimeout(() => {
                this.resetForm();
            }, 3000);
            
            // Emit success event
            this.emit('form:success', {
                formType: 'contact',
                data: this.formData
            });

        } catch (error) {
            console.error('Contact form submission failed:', error);
            this.showError('Sorry, there was an error sending your message. Please try again or contact us directly.');
            
            // Emit error event
            this.emit('form:error', {
                formType: 'contact',
                error: error.message,
                data: this.formData
            });
        } finally {
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const submitButton = document.querySelector('#contact-form .submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('loading');
        }
    }

    hideLoadingState() {
        const submitButton = document.querySelector('#contact-form .submit-button');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            submitButton.classList.remove('loading');
        }
    }

    showSuccess() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'contact-success-message';
        successDiv.innerHTML = `
            <div style="
                background: var(--success-bg);
                color: var(--success-color);
                border: 2px solid var(--success-border);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
                text-align: center;
            ">
                <h3 style="margin-bottom: 10px;">✅ Message Sent Successfully!</h3>
                <p style="margin: 0;">Thank you for contacting us. We'll get back to you soon!</p>
            </div>
        `;

        const form = document.getElementById('contact-form');
        if (form) {
            // Remove existing success message
            const existingSuccess = form.querySelector('.contact-success-message');
            if (existingSuccess) {
                existingSuccess.remove();
            }
            
            // Add success message at the top
            form.insertBefore(successDiv, form.firstChild);
            
            // Scroll to success message
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (successDiv.parentElement) {
                    successDiv.remove();
                }
            }, 5000);
        }
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'contact-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: var(--error-bg);
            color: var(--error-color);
            border: 2px solid var(--error-border);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
        `;

        const form = document.getElementById('contact-form');
        if (form) {
            // Remove existing error message
            const existingError = form.querySelector('.contact-error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message at the top
            form.insertBefore(errorDiv, form.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    }

    autoResizeTextarea(event) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    onSectionEnter() {
        // Focus on first form field when entering contact section
        const firstInput = document.querySelector('#contact-form input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 500);
        }
        
        // Animate contact elements
        const contactInfo = document.querySelector('.contact-info');
        const contactForm = document.querySelector('.contact-form');
        
        if (contactInfo) {
            setTimeout(() => {
                contactInfo.classList.add('slide-in-left');
            }, 200);
        }
        
        if (contactForm) {
            setTimeout(() => {
                contactForm.classList.add('slide-in-right');
            }, 400);
        }
    }

    // Utility validation methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.reset();
            this.clearAllErrors();
            this.formData = {};
            
            // Reset textarea height
            const messageTextarea = document.getElementById('contact-message');
            if (messageTextarea) {
                messageTextarea.style.height = 'auto';
            }
        }
    }

    // Prefill form with data
    prefillForm(data) {
        const form = document.getElementById('contact-form');
        if (!form) return;

        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
                
                // Trigger auto-resize for textareas
                if (field.tagName === 'TEXTAREA') {
                    this.autoResizeTextarea({ target: field });
                }
            }
        });
    }

    // Get form data
    getFormData() {
        return { ...this.formData };
    }

    // Update contact information
    updateContactInfo(organizerData) {
        if (organizerData.name) {
            const nameElement = document.getElementById('organizer-name');
            if (nameElement) nameElement.textContent = organizerData.name;
        }

        if (organizerData.email) {
            const emailElement = document.getElementById('organizer-email');
            if (emailElement) {
                emailElement.textContent = organizerData.email;
                emailElement.href = `mailto:${organizerData.email}`;
            }
        }

        if (organizerData.phone) {
            const phoneElement = document.getElementById('organizer-phone');
            if (phoneElement) {
                phoneElement.textContent = organizerData.phone;
                phoneElement.href = `tel:${organizerData.phone}`;
            }
        }
    }

    emit(eventType, data = null) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    // Cleanup method
    destroy() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.removeEventListener('submit', this.handleFormSubmit);
        }

        this.formData = {};
        this.isSubmitting = false;
        this.isInitialized = false;
        
        console.log('📞 Contact Component destroyed');
    }
}

// Make available globally
window.ContactComponent = ContactComponent;
