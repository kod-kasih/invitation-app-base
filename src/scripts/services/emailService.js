// Email Service - Handles form submissions and email communications
class EmailService {
    constructor() {
        this.config = null;
        this.providers = {
            formspree: this.sendViaFormspree.bind(this),
            netlify: this.sendViaNetlify.bind(this),
            emailjs: this.sendViaEmailJS.bind(this),
            custom: this.sendViaCustomAPI.bind(this)
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.sendEmail = this.sendEmail.bind(this);
        this.validateEmailData = this.validateEmailData.bind(this);
    }

    init() {
        // Get email configuration
        const appConfig = window.App ? window.App.getConfig() : null;
        this.config = appConfig?.email || {
            provider: 'formspree',
            serviceUrl: 'https://formspree.io/f/your-form-id'
        };
        
        console.log('📧 Email Service initialized with provider:', this.config.provider);
    }

    async sendEmail(data) {
        if (!this.config) {
            this.init();
        }

        // Validate email data
        if (!this.validateEmailData(data)) {
            throw new Error('Invalid email data provided');
        }

        const provider = this.config.provider || 'formspree';
        const sender = this.providers[provider];

        if (!sender) {
            throw new Error(`Unsupported email provider: ${provider}`);
        }

        try {
            console.log(`📧 Sending email via ${provider}...`);
            const result = await sender(data);
            console.log('✅ Email sent successfully');
            return result;
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            throw error;
        }
    }

    validateEmailData(data) {
        // Basic validation
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check for required fields based on form type
        if (data.formType === 'rsvp') {
            return !!(data.guestName && data.guestEmail && data.attendance);
        } else if (data.formType === 'contact') {
            return !!(data.contactName && data.contactEmail && data.contactMessage);
        }

        // Generic validation
        return !!(data.subject || data.message || data.contactMessage);
    }

    async sendViaFormspree(data) {
        const url = this.config.serviceUrl;
        
        if (!url || !url.includes('formspree.io')) {
            throw new Error('Invalid Formspree URL configuration');
        }

        const payload = this.prepareFormspreePayload(data);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    prepareFormspreePayload(data) {
        const payload = {
            subject: data.subject || this.generateSubject(data),
            _replyto: data.guestEmail || data.contactEmail,
            message: this.formatMessage(data),
            formType: data.formType || 'unknown'
        };

        // Add all form fields
        Object.keys(data).forEach(key => {
            if (!payload[key] && data[key]) {
                payload[key] = data[key];
            }
        });

        return payload;
    }

    async sendViaNetlify(data) {
        // Netlify Forms submission
        const payload = new FormData();
        
        // Add form-name for Netlify
        payload.append('form-name', data.formType || 'contact');
        
        // Add all form fields
        Object.keys(data).forEach(key => {
            if (data[key]) {
                payload.append(key, data[key]);
            }
        });

        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(payload).toString()
        });

        if (!response.ok) {
            throw new Error(`Netlify form submission failed: ${response.status}`);
        }

        return { success: true, provider: 'netlify' };
    }

    async sendViaEmailJS(data) {
        // EmailJS integration
        if (!window.emailjs) {
            throw new Error('EmailJS library not loaded');
        }

        const templateParams = {
            from_name: data.guestName || data.contactName,
            from_email: data.guestEmail || data.contactEmail,
            subject: data.subject || this.generateSubject(data),
            message: this.formatMessage(data),
            to_name: this.config.toName || 'Event Organizer',
            reply_to: data.guestEmail || data.contactEmail
        };

        const result = await window.emailjs.send(
            this.config.serviceId,
            this.config.templateId,
            templateParams,
            this.config.publicKey
        );

        return result;
    }

    async sendViaCustomAPI(data) {
        // Custom API endpoint
        const url = this.config.serviceUrl;
        const payload = {
            ...data,
            subject: data.subject || this.generateSubject(data),
            message: this.formatMessage(data)
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.headers || {})
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Custom API error: ${response.status}`);
        }

        return await response.json();
    }

    generateSubject(data) {
        if (data.formType === 'rsvp') {
            return `RSVP Response from ${data.guestName}`;
        } else if (data.formType === 'contact') {
            return data.contactSubject || `Contact Form Message from ${data.contactName}`;
        }
        return 'New Form Submission';
    }

    formatMessage(data) {
        let message = '';

        if (data.formType === 'rsvp') {
            message = this.formatRSVPMessage(data);
        } else if (data.formType === 'contact') {
            message = this.formatContactMessage(data);
        } else {
            // Generic message formatting
            message = data.message || data.contactMessage || 'No message provided';
        }

        return message;
    }

    formatRSVPMessage(data) {
        let message = `RSVP Response Details:\n\n`;
        message += `Name: ${data.guestName}\n`;
        message += `Email: ${data.guestEmail}\n`;
        
        if (data.guestPhone) {
            message += `Phone: ${data.guestPhone}\n`;
        }
        
        message += `Attendance: ${data.attendance}\n`;
        
        if (data.guestCount) {
            message += `Number of Guests: ${data.guestCount}\n`;
        }
        
        if (data.dietaryRequirements) {
            message += `Dietary Requirements: ${data.dietaryRequirements}\n`;
        }
        
        if (data.comments) {
            message += `Additional Comments: ${data.comments}\n`;
        }
        
        message += `\nSubmitted: ${new Date(data.timestamp).toLocaleString()}`;
        
        return message;
    }

    formatContactMessage(data) {
        let message = `Contact Form Message:\n\n`;
        message += `Name: ${data.contactName}\n`;
        message += `Email: ${data.contactEmail}\n`;
        
        if (data.contactSubject) {
            message += `Subject: ${data.contactSubject}\n`;
        }
        
        message += `\nMessage:\n${data.contactMessage}\n`;
        message += `\nSubmitted: ${new Date(data.timestamp).toLocaleString()}`;
        
        return message;
    }

    // Test email configuration
    async testConfiguration() {
        try {
            const testData = {
                formType: 'test',
                subject: 'Email Service Test',
                message: 'This is a test message to verify email service configuration.',
                contactName: 'Test User',
                contactEmail: 'test@example.com',
                timestamp: new Date().toISOString()
            };

            await this.sendEmail(testData);
            return { success: true, message: 'Email service test successful' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get provider status
    getProviderStatus() {
        return {
            provider: this.config?.provider || 'unknown',
            configured: !!(this.config?.serviceUrl),
            serviceUrl: this.config?.serviceUrl || null
        };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📧 Email service configuration updated');
    }

    // Retry failed email with exponential backoff
    async retryEmail(data, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.sendEmail(data);
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`📧 Email retry ${attempt}/${maxRetries} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }

    // Send email with fallback providers
    async sendEmailWithFallback(data, fallbackProviders = []) {
        const originalProvider = this.config.provider;
        
        try {
            return await this.sendEmail(data);
        } catch (error) {
            console.warn(`📧 Primary provider ${originalProvider} failed, trying fallbacks...`);
            
            for (const provider of fallbackProviders) {
                try {
                    this.config.provider = provider;
                    return await this.sendEmail(data);
                } catch (fallbackError) {
                    console.warn(`📧 Fallback provider ${provider} also failed:`, fallbackError.message);
                }
            }
            
            // Restore original provider
            this.config.provider = originalProvider;
            throw error;
        }
    }
}

// Create global instance
window.EmailService = new EmailService();

// Auto-initialize when app is ready
if (window.EventBus) {
    window.EventBus.on('app:ready', () => {
        window.EmailService.init();
    });
}

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
