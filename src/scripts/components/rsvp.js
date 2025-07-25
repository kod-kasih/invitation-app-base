// RSVP Component
class RSVPComponent {
    constructor() {
        this.isInitialized = false;
        this.formData = {};
        this.isSubmitting = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupForm = this.setupForm.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
        this.showError = this.showError.bind(this);
    }

    async init() {
        try {
            console.log('✉️ Initializing RSVP Component');
            
            // Setup form
            this.setupForm();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ RSVP Component initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize RSVP Component:', error);
        }
    }

    setupForm() {
        const form = document.getElementById('rsvp-form');
        if (!form) return;

        // Add form validation classes
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Setup attendance change handler
        const attendanceSelect = document.getElementById('attendance');
        if (attendanceSelect) {
            attendanceSelect.addEventListener('change', this.handleAttendanceChange.bind(this));
        }

        // Setup guest count handler
        const guestCountInput = document.getElementById('guest-count');
        if (guestCountInput) {
            guestCountInput.addEventListener('change', this.handleGuestCountChange.bind(this));
        }
    }

    setupEventListeners() {
        const form = document.getElementById('rsvp-form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }

        // Listen for navigation changes
        if (window.EventBus) {
            window.EventBus.on('navigation:change', (data) => {
                if (data.section === 'rsvp') {
                    this.onSectionEnter();
                }
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
        const form = document.getElementById('rsvp-form');
        if (!form) return;

        const formData = new FormData(form);
        this.formData = {};

        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }

        // Add timestamp
        this.formData.timestamp = new Date().toISOString();
        this.formData.userAgent = navigator.userAgent;
    }

    validateForm() {
        const form = document.getElementById('rsvp-form');
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
        const emailField = document.getElementById('guest-email');
        if (emailField && emailField.value) {
            if (!this.isValidEmail(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }

        // Validate phone format if provided
        const phoneField = document.getElementById('guest-phone');
        if (phoneField && phoneField.value) {
            if (!this.isValidPhone(phoneField.value)) {
                this.showFieldError(phoneField, 'Please enter a valid phone number');
                isValid = false;
            }
        }

        // Validate guest count
        const guestCountField = document.getElementById('guest-count');
        if (guestCountField && guestCountField.value) {
            const count = parseInt(guestCountField.value);
            if (count < 1 || count > 10) {
                this.showFieldError(guestCountField, 'Guest count must be between 1 and 10');
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

        // Specific validation for select fields
        if (field.tagName === 'SELECT' && value === '') {
            this.showFieldError(field, 'Please make a selection');
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
        const form = document.getElementById('rsvp-form');
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
                subject: `RSVP Response - ${this.formData.guestName}`,
                formType: 'rsvp'
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
                window.StorageService.saveRSVP(this.formData);
            }

            // Show success
            this.showSuccess();
            
            // Emit success event
            this.emit('form:success', {
                formType: 'rsvp',
                data: this.formData
            });

        } catch (error) {
            console.error('RSVP submission failed:', error);
            this.showError('Sorry, there was an error submitting your RSVP. Please try again or contact us directly.');
            
            // Emit error event
            this.emit('form:error', {
                formType: 'rsvp',
                error: error.message,
                data: this.formData
            });
        } finally {
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const submitButton = document.querySelector('#rsvp-form .submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('loading');
        }
    }

    hideLoadingState() {
        const submitButton = document.querySelector('#rsvp-form .submit-button');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send RSVP';
            submitButton.classList.remove('loading');
        }
    }

    showSuccess() {
        const form = document.getElementById('rsvp-form');
        const successMessage = document.getElementById('rsvp-success');
        
        if (form && successMessage) {
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
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

        const form = document.getElementById('rsvp-form');
        if (form) {
            // Remove existing error message
            const existingError = form.querySelector('.form-error-message');
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

    handleAttendanceChange(event) {
        const attendance = event.target.value;
        const guestCountGroup = document.getElementById('guest-count').closest('.form-group');
        const dietaryGroup = document.getElementById('dietary-requirements').closest('.form-group');
        
        if (attendance === 'no') {
            // Hide guest count and dietary requirements for non-attendees
            if (guestCountGroup) guestCountGroup.style.display = 'none';
            if (dietaryGroup) dietaryGroup.style.display = 'none';
        } else {
            // Show fields for attendees
            if (guestCountGroup) guestCountGroup.style.display = 'block';
            if (dietaryGroup) dietaryGroup.style.display = 'block';
        }
    }

    handleGuestCountChange(event) {
        const count = parseInt(event.target.value);
        const label = document.querySelector('label[for="guest-count"]');
        
        if (label) {
            if (count === 1) {
                label.textContent = 'Number of Guests (including yourself)';
            } else {
                label.textContent = `Number of Guests (${count} people including yourself)`;
            }
        }
    }

    onSectionEnter() {
        // Focus on first form field when entering RSVP section
        const firstInput = document.querySelector('#rsvp-form input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 500);
        }
        
        // Animate form elements
        const formGroups = document.querySelectorAll('#rsvp-form .form-group');
        formGroups.forEach((group, index) => {
            setTimeout(() => {
                group.classList.add('slide-in-up');
            }, index * 100);
        });
    }

    // Utility validation methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('rsvp-form');
        const successMessage = document.getElementById('rsvp-success');
        
        if (form && successMessage) {
            form.reset();
            form.classList.remove('hidden');
            successMessage.classList.add('hidden');
            
            this.clearAllErrors();
            this.formData = {};
        }
    }

    // Get form data
    getFormData() {
        return { ...this.formData };
    }

    // Prefill form with data
    prefillForm(data) {
        const form = document.getElementById('rsvp-form');
        if (!form) return;

        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }

    emit(eventType, data = null) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    // Cleanup method
    destroy() {
        const form = document.getElementById('rsvp-form');
        if (form) {
            form.removeEventListener('submit', this.handleFormSubmit);
        }

        this.formData = {};
        this.isSubmitting = false;
        this.isInitialized = false;
        
        console.log('✉️ RSVP Component destroyed');
    }
}

// Make available globally
window.RSVPComponent = RSVPComponent;
