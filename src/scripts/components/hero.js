// Hero Component
class HeroComponent {
    constructor() {
        this.isInitialized = false;
        this.animations = [];
        
        // Bind methods
        this.init = this.init.bind(this);
        this.updateFromConfig = this.updateFromConfig.bind(this);
        this.setupAnimations = this.setupAnimations.bind(this);
        this.handleCTAClick = this.handleCTAClick.bind(this);
    }

    async init() {
        try {
            console.log('🦸 Initializing Hero Component');
            
            // Update content from config
            this.updateFromConfig();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup animations
            this.setupAnimations();
            
            this.isInitialized = true;
            console.log('✅ Hero Component initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Hero Component:', error);
        }
    }

    updateFromConfig() {
        const config = window.App ? window.App.getConfig() : null;
        if (!config) return;

        // Update main title
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
            mainTitle.textContent = config.event.title || 'Welcome to Our Special Event';
        }

        // Update subtitle
        const mainSubtitle = document.getElementById('main-subtitle');
        if (mainSubtitle) {
            mainSubtitle.textContent = config.event.subtitle || 'Join us for an unforgettable experience';
        }

        // Update event date
        const eventDate = document.getElementById('event-date');
        if (eventDate) {
            eventDate.textContent = config.event.date || 'Date TBD';
        }

        // Update hero image
        const heroImg = document.getElementById('hero-img');
        if (heroImg && config.event.heroImage) {
            heroImg.src = config.event.heroImage;
            heroImg.alt = config.event.title || 'Event Hero Image';
        }

        // Update page title and meta
        document.title = config.event.title || config.app.name;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = config.event.subtitle || 'Join us for an unforgettable event experience';
        } else {
            // Create meta description if it doesn't exist
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = config.event.subtitle || 'Join us for an unforgettable event experience';
            document.head.appendChild(meta);
        }
    }

    setupEventListeners() {
        // CTA button click
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', this.handleCTAClick);
        }

        // Listen for app ready event to trigger animations
        if (window.EventBus) {
            window.EventBus.on('app:ready', () => {
                this.triggerEntranceAnimations();
            });

            // Listen for navigation changes
            window.EventBus.on('navigation:change', (data) => {
                if (data.section === 'home') {
                    this.onSectionEnter();
                } else {
                    this.onSectionLeave();
                }
            });
        }
    }

    setupAnimations() {
        // Setup intersection observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElements();
                    }
                });
            }, observerOptions);

            const heroComponent = document.querySelector('.hero-component');
            if (heroComponent) {
                observer.observe(heroComponent);
            }
        }

        // Setup parallax effect for hero image
        this.setupParallaxEffect();
    }

    setupParallaxEffect() {
        const heroImage = document.querySelector('.hero-image img');
        if (!heroImage) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            heroImage.style.transform = `translateY(${parallax}px)`;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    triggerEntranceAnimations() {
        // Animate hero content elements with staggered timing
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        const elements = [
            heroContent.querySelector('h1'),
            heroContent.querySelector('p'),
            heroContent.querySelector('.hero-date'),
            heroContent.querySelector('.cta-button')
        ];

        elements.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.classList.add('fade-in');
                    element.style.animationDelay = `${index * 0.2}s`;
                }, index * 100);
            }
        });

        // Animate hero image
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            setTimeout(() => {
                heroImage.classList.add('slide-in-right');
            }, 600);
        }
    }

    animateElements() {
        const heroComponent = document.querySelector('.hero-component');
        if (heroComponent && !heroComponent.classList.contains('animated')) {
            heroComponent.classList.add('animated');
            this.triggerEntranceAnimations();
        }
    }

    handleCTAClick(event) {
        event.preventDefault();
        
        // Add click animation
        const button = event.target;
        button.classList.add('clicked');
        
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);

        // Navigate to RSVP section
        if (window.Router) {
            window.Router.navigate('rsvp');
        }

        // Emit event
        this.emit('hero:cta-clicked', {
            buttonText: button.textContent,
            targetSection: 'rsvp'
        });
    }

    onSectionEnter() {
        // Re-trigger animations when returning to home section
        const heroComponent = document.querySelector('.hero-component');
        if (heroComponent) {
            heroComponent.style.opacity = '1';
            heroComponent.style.transform = 'translateY(0)';
        }
    }

    onSectionLeave() {
        // Subtle exit animation
        const heroComponent = document.querySelector('.hero-component');
        if (heroComponent) {
            heroComponent.style.opacity = '0.8';
            heroComponent.style.transform = 'translateY(-20px)';
        }
    }

    // Update hero content dynamically
    updateTitle(title) {
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
            mainTitle.textContent = title;
            
            // Add update animation
            mainTitle.classList.add('bounce-in');
            setTimeout(() => {
                mainTitle.classList.remove('bounce-in');
            }, 800);
        }
    }

    updateSubtitle(subtitle) {
        const mainSubtitle = document.getElementById('main-subtitle');
        if (mainSubtitle) {
            mainSubtitle.textContent = subtitle;
        }
    }

    updateDate(date) {
        const eventDate = document.getElementById('event-date');
        if (eventDate) {
            eventDate.textContent = date;
            
            // Add pulse animation for date updates
            eventDate.classList.add('pulse');
            setTimeout(() => {
                eventDate.classList.remove('pulse');
            }, 2000);
        }
    }

    updateHeroImage(imageSrc, altText = '') {
        const heroImg = document.getElementById('hero-img');
        if (heroImg) {
            // Add loading state
            heroImg.style.opacity = '0.5';
            
            // Create new image to preload
            const newImg = new Image();
            newImg.onload = () => {
                heroImg.src = imageSrc;
                heroImg.alt = altText;
                heroImg.style.opacity = '1';
                
                // Add fade-in animation
                heroImg.classList.add('fade-in');
                setTimeout(() => {
                    heroImg.classList.remove('fade-in');
                }, 600);
            };
            
            newImg.onerror = () => {
                console.error('Failed to load hero image:', imageSrc);
                heroImg.style.opacity = '1'; // Restore opacity
            };
            
            newImg.src = imageSrc;
        }
    }

    // Add countdown functionality
    startCountdown(targetDate) {
        const eventDate = document.getElementById('event-date');
        if (!eventDate || !targetDate) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                eventDate.innerHTML = `
                    <div class="countdown">
                        <div class="countdown-item">
                            <span class="countdown-number">${days}</span>
                            <span class="countdown-label">Days</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${hours}</span>
                            <span class="countdown-label">Hours</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${minutes}</span>
                            <span class="countdown-label">Minutes</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${seconds}</span>
                            <span class="countdown-label">Seconds</span>
                        </div>
                    </div>
                `;
            } else {
                eventDate.innerHTML = '<span class="event-live">🎉 Event is Live!</span>';
                clearInterval(this.countdownInterval);
            }
        };

        // Update immediately and then every second
        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    emit(eventType, data = null) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    // Cleanup method
    destroy() {
        // Stop countdown
        this.stopCountdown();
        
        // Remove event listeners
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.removeEventListener('click', this.handleCTAClick);
        }

        // Clear animations
        this.animations.forEach(animation => {
            if (animation.cancel) animation.cancel();
        });
        this.animations = [];

        this.isInitialized = false;
        console.log('🦸 Hero Component destroyed');
    }
}

// Make available globally
window.HeroComponent = HeroComponent;
