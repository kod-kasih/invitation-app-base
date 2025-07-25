// Gallery Component
class GalleryComponent {
    constructor() {
        this.isInitialized = false;
        this.images = [];
        this.currentImageIndex = 0;
        this.lightboxOpen = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadImages = this.loadImages.bind(this);
        this.renderGallery = this.renderGallery.bind(this);
        this.handleImageClick = this.handleImageClick.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.showPreviousImage = this.showPreviousImage.bind(this);
        this.showNextImage = this.showNextImage.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    async init() {
        try {
            console.log('🖼️ Initializing Gallery Component');
            
            // Load images from config
            this.loadImages();
            
            // Render gallery
            this.renderGallery();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Gallery Component initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Gallery Component:', error);
        }
    }

    loadImages() {
        const config = window.App ? window.App.getConfig() : null;
        
        if (config && config.gallery && config.gallery.images) {
            this.images = config.gallery.images;
        } else {
            // Default placeholder images
            this.images = [
                {
                    src: 'https://picsum.photos/400/400?random=1',
                    caption: 'Beautiful Moment 1',
                    alt: 'Gallery Image 1'
                },
                {
                    src: 'https://picsum.photos/400/400?random=2',
                    caption: 'Beautiful Moment 2',
                    alt: 'Gallery Image 2'
                },
                {
                    src: 'https://picsum.photos/400/400?random=3',
                    caption: 'Beautiful Moment 3',
                    alt: 'Gallery Image 3'
                },
                {
                    src: 'https://picsum.photos/400/400?random=4',
                    caption: 'Beautiful Moment 4',
                    alt: 'Gallery Image 4'
                },
                {
                    src: 'https://picsum.photos/400/400?random=5',
                    caption: 'Beautiful Moment 5',
                    alt: 'Gallery Image 5'
                },
                {
                    src: 'https://picsum.photos/400/400?random=6',
                    caption: 'Beautiful Moment 6',
                    alt: 'Gallery Image 6'
                }
            ];
        }
    }

    renderGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        this.images.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-index', index);
            
            galleryItem.innerHTML = `
                <img src="${image.src}" alt="${image.alt || image.caption || `Gallery Image ${index + 1}`}" loading="lazy">
                <div class="gallery-overlay">
                    <div class="gallery-caption">${image.caption || ''}</div>
                </div>
            `;

            // Add click event listener
            galleryItem.addEventListener('click', () => this.handleImageClick(index));
            
            // Add intersection observer for lazy loading animation
            this.observeImage(galleryItem, index);
            
            galleryGrid.appendChild(galleryItem);
        });
    }

    observeImage(element, index) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('fade-in');
                        }, index * 100); // Stagger the animations
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(element);
        }
    }

    setupEventListeners() {
        // Lightbox controls
        const lightboxClose = document.querySelector('.lightbox-close');
        if (lightboxClose) {
            lightboxClose.addEventListener('click', this.closeLightbox);
        }

        const lightboxPrev = document.getElementById('lightbox-prev');
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', this.showPreviousImage);
        }

        const lightboxNext = document.getElementById('lightbox-next');
        if (lightboxNext) {
            lightboxNext.addEventListener('click', this.showNextImage);
        }

        // Lightbox background click to close
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', (event) => {
                if (event.target === lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown);

        // Listen for navigation changes to handle section visibility
        if (window.EventBus) {
            window.EventBus.on('navigation:change', (data) => {
                if (data.section === 'gallery') {
                    this.onSectionEnter();
                } else {
                    this.onSectionLeave();
                }
            });
        }
    }

    handleImageClick(index) {
        this.currentImageIndex = index;
        this.openLightbox();
        
        // Emit event
        this.emit('gallery:image-clicked', {
            index,
            image: this.images[index]
        });
    }

    openLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        
        if (!lightbox || !lightboxImg) return;

        const image = this.images[this.currentImageIndex];
        if (!image) return;

        // Set image
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt || image.caption || 'Gallery Image';

        // Show lightbox
        lightbox.classList.remove('hidden');
        this.lightboxOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus for accessibility
        lightbox.focus();

        // Update navigation buttons
        this.updateLightboxNavigation();

        // Emit event
        this.emit('gallery:lightbox-opened', {
            index: this.currentImageIndex,
            image
        });
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightbox.classList.add('hidden');
        this.lightboxOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to the clicked image
        const galleryItem = document.querySelector(`[data-index="${this.currentImageIndex}"]`);
        if (galleryItem) {
            galleryItem.focus();
        }

        // Emit event
        this.emit('gallery:lightbox-closed', {
            index: this.currentImageIndex
        });
    }

    showPreviousImage() {
        if (this.images.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.updateLightboxImage();
        this.updateLightboxNavigation();
    }

    showNextImage() {
        if (this.images.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.updateLightboxImage();
        this.updateLightboxNavigation();
    }

    updateLightboxImage() {
        const lightboxImg = document.getElementById('lightbox-img');
        if (!lightboxImg) return;

        const image = this.images[this.currentImageIndex];
        if (!image) return;

        // Add fade out effect
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt || image.caption || 'Gallery Image';
            
            // Fade back in
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    updateLightboxNavigation() {
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');
        
        if (this.images.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'block';
            if (nextBtn) nextBtn.style.display = 'block';
        }
    }

    handleKeydown(event) {
        if (!this.lightboxOpen) return;

        switch (event.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.showPreviousImage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.showNextImage();
                break;
        }
    }

    onSectionEnter() {
        // Trigger animations when entering gallery section
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('slide-in-up');
            }, index * 50);
        });
    }

    onSectionLeave() {
        // Close lightbox if open when leaving section
        if (this.lightboxOpen) {
            this.closeLightbox();
        }
    }

    // Add new image to gallery
    addImage(imageData) {
        this.images.push(imageData);
        this.renderGallery();
        
        // Emit event
        this.emit('gallery:image-added', { image: imageData });
    }

    // Remove image from gallery
    removeImage(index) {
        if (index >= 0 && index < this.images.length) {
            const removedImage = this.images.splice(index, 1)[0];
            this.renderGallery();
            
            // Emit event
            this.emit('gallery:image-removed', { 
                image: removedImage, 
                index 
            });
        }
    }

    // Update image data
    updateImage(index, newData) {
        if (index >= 0 && index < this.images.length) {
            this.images[index] = { ...this.images[index], ...newData };
            this.renderGallery();
            
            // Emit event
            this.emit('gallery:image-updated', { 
                image: this.images[index], 
                index 
            });
        }
    }

    // Filter images by category or tag
    filterImages(filterFn) {
        const filteredImages = this.images.filter(filterFn);
        
        // Temporarily store original images
        const originalImages = [...this.images];
        this.images = filteredImages;
        this.renderGallery();
        
        // Return function to restore original images
        return () => {
            this.images = originalImages;
            this.renderGallery();
        };
    }

    // Sort images
    sortImages(compareFn) {
        this.images.sort(compareFn);
        this.renderGallery();
        
        // Emit event
        this.emit('gallery:images-sorted');
    }

    // Load images from external source
    async loadImagesFromURL(url) {
        try {
            this.emit('gallery:loading-start');
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.images && Array.isArray(data.images)) {
                this.images = data.images;
                this.renderGallery();
                
                this.emit('gallery:images-loaded', { 
                    count: this.images.length,
                    source: url 
                });
            }
        } catch (error) {
            console.error('Failed to load images from URL:', error);
            this.emit('gallery:loading-error', { error, source: url });
        }
    }

    // Get gallery statistics
    getStats() {
        return {
            totalImages: this.images.length,
            lightboxOpen: this.lightboxOpen,
            currentIndex: this.currentImageIndex,
            isInitialized: this.isInitialized
        };
    }

    emit(eventType, data = null) {
        if (window.EventBus) {
            window.EventBus.emit(eventType, data);
        }
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Close lightbox if open
        if (this.lightboxOpen) {
            this.closeLightbox();
        }

        // Clear data
        this.images = [];
        this.currentImageIndex = 0;
        this.isInitialized = false;
        
        console.log('🖼️ Gallery Component destroyed');
    }
}

// Make available globally
window.GalleryComponent = GalleryComponent;
