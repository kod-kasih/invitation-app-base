// Application Configuration
const AppConfig = {
    // Application metadata
    app: {
        name: 'Event Invitation',
        version: '1.0.0',
        description: 'A beautiful invitation website for your special event',
        theme: 'default', // Options: default, dark, wedding, corporate, party, nature, elegant
        language: 'en'
    },

    // Event information
    event: {
        title: 'Welcome to Our Special Event',
        subtitle: 'Join us for an unforgettable experience',
        date: 'December 25, 2025 at 6:00 PM',
        location: 'Grand Ballroom, Elegant Hotel, 123 Event Street, City, State 12345',
        dresscode: 'Smart casual',
        dining: 'Dinner and refreshments will be served',
        heroImage: 'assets/images/hero-image.jpg',
        
        // Organizer contact information
        organizer: {
            name: 'Event Organizer',
            email: 'organizer@yourevent.com',
            phone: '+1 (555) 123-4567'
        }
    },

    // Feature toggles
    features: {
        gallery: true,
        rsvp: true,
        contact: true,
        schedule: true,
        countdown: false, // Set to true to show countdown timer
        guestMessages: false, // Feature for future implementation
        locationMap: false // Feature for future implementation
    },

    // Email service configuration
    email: {
        provider: 'formspree', // Options: formspree, netlify, emailjs, custom
        serviceUrl: 'https://formspree.io/f/your-form-id', // Replace with your actual form ID
        
        // For EmailJS configuration (uncomment if using EmailJS)
        // serviceId: 'your_service_id',
        // templateId: 'your_template_id',
        // publicKey: 'your_public_key',
        
        // Custom headers (for custom API)
        headers: {
            // 'Authorization': 'Bearer your-token',
            // 'X-API-Key': 'your-api-key'
        }
    },

    // Gallery images
    gallery: {
        images: [
            {
                src: 'https://picsum.photos/600/400?random=1',
                caption: 'Beautiful Moment 1',
                alt: 'Event Gallery Image 1'
            },
            {
                src: 'https://picsum.photos/600/400?random=2',
                caption: 'Memorable Experience 2',
                alt: 'Event Gallery Image 2'
            },
            {
                src: 'https://picsum.photos/600/400?random=3',
                caption: 'Special Gathering 3',
                alt: 'Event Gallery Image 3'
            },
            {
                src: 'https://picsum.photos/600/400?random=4',
                caption: 'Joyful Celebration 4',
                alt: 'Event Gallery Image 4'
            },
            {
                src: 'https://picsum.photos/600/400?random=5',
                caption: 'Wonderful Memories 5',
                alt: 'Event Gallery Image 5'
            },
            {
                src: 'https://picsum.photos/600/400?random=6',
                caption: 'Cherished Moments 6',
                alt: 'Event Gallery Image 6'
            }
        ]
    },

    // Event schedule
    schedule: [
        {
            time: '5:30 PM',
            title: 'Welcome & Registration',
            description: 'Arrival and check-in. Welcome drinks will be served.'
        },
        {
            time: '6:00 PM',
            title: 'Opening Ceremony',
            description: 'Welcome address and event introduction.'
        },
        {
            time: '6:30 PM',
            title: 'Main Event',
            description: 'The highlight of our celebration begins.'
        },
        {
            time: '8:00 PM',
            title: 'Dinner Service',
            description: 'Enjoy a delicious three-course meal.'
        },
        {
            time: '9:30 PM',
            title: 'Entertainment',
            description: 'Live music and entertainment for all guests.'
        },
        {
            time: '11:00 PM',
            title: 'Closing Remarks',
            description: 'Thank you message and farewell.'
        }
    ],

    // Event details configuration
    details: {
        location: {
            name: 'Grand Ballroom, Elegant Hotel',
            address: '123 Event Street, City, State 12345',
            mapUrl: 'https://maps.google.com/?q=123+Event+Street+City+State', // Optional
            parkingInfo: 'Free parking available on-site',
            directions: 'Take the main elevator to the 3rd floor'
        },
        
        accommodation: {
            available: true,
            hotels: [
                {
                    name: 'Elegant Hotel',
                    distance: '0 miles (venue hotel)',
                    phone: '+1 (555) 123-4567',
                    website: 'https://eleganthotel.com'
                },
                {
                    name: 'Nearby Inn',
                    distance: '0.5 miles',
                    phone: '+1 (555) 234-5678',
                    website: 'https://nearbyinn.com'
                }
            ]
        },

        transportation: {
            available: true,
            options: [
                'Self-driving with free parking',
                'Taxi and ride-sharing services',
                'Public transportation (Bus route 42)',
                'Airport shuttle available upon request'
            ]
        }
    },

    // RSVP configuration
    rsvp: {
        deadline: '2025-12-20', // RSVP deadline date
        maxGuestsPerInvitation: 5,
        requirePhoneNumber: false,
        allowMaybe: true,
        customQuestions: [
            // Add custom RSVP questions here
            // {
            //     id: 'song_requests',
            //     label: 'Any song requests for the DJ?',
            //     type: 'textarea',
            //     required: false
            // }
        ]
    },

    // Social media integration (optional)
    social: {
        enabled: false,
        hashtag: '#YourEventHashtag',
        platforms: {
            instagram: '', // Instagram handle
            facebook: '',  // Facebook page URL
            twitter: ''    // Twitter handle
        }
    },

    // Analytics configuration (optional)
    analytics: {
        enabled: false,
        googleAnalyticsId: '', // GA4 Measurement ID
        facebookPixelId: ''    // Facebook Pixel ID
    },

    // PWA configuration (for future implementation)
    pwa: {
        enabled: false,
        name: 'Event Invitation',
        shortName: 'Event',
        description: 'Your special event invitation',
        themeColor: '#6366f1',
        backgroundColor: '#ffffff'
    },

    // Advanced customization
    customization: {
        // Custom CSS variables can be added here
        colors: {
            // primary: '#your-color',
            // secondary: '#your-color'
        },
        
        // Custom fonts (Google Fonts)
        fonts: {
            // primary: 'Roboto',
            // secondary: 'Playfair Display'
        },
        
        // Animation preferences
        animations: {
            enabled: true,
            duration: 'normal', // fast, normal, slow
            reducedMotion: false // Will be automatically detected
        }
    },

    // Development and debugging
    debug: {
        enabled: false, // Set to true for development
        logLevel: 'info', // error, warn, info, debug
        showComponentBorders: false,
        performanceMonitoring: false
    }
};

// Freeze the configuration to prevent accidental modifications
Object.freeze(AppConfig);

// Make available globally
window.AppConfig = AppConfig;

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}

// Auto-update page title and meta tags based on config
document.addEventListener('DOMContentLoaded', () => {
    // Update page title
    document.title = `${AppConfig.event.title} - ${AppConfig.app.name}`;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    metaDescription.content = AppConfig.event.subtitle;
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = `event, invitation, celebration, ${AppConfig.event.title}`;
    
    // Update Open Graph tags for social sharing
    const updateMetaTag = (property, content) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', property);
            document.head.appendChild(tag);
        }
        tag.content = content;
    };
    
    updateMetaTag('og:title', AppConfig.event.title);
    updateMetaTag('og:description', AppConfig.event.subtitle);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    
    if (AppConfig.event.heroImage) {
        updateMetaTag('og:image', AppConfig.event.heroImage);
    }
    
    // Apply theme if specified
    if (AppConfig.app.theme && AppConfig.app.theme !== 'default') {
        document.documentElement.setAttribute('data-theme', AppConfig.app.theme);
    }
    
    console.log('📋 App configuration loaded and applied');
});
