# Place your images here

This folder should contain all image assets for your event invitation:

## Recommended Images

### Required Images
- `hero-image.jpg` - Main hero image (1920x1080 recommended)
- `placeholder-hero.jpg` - Fallback hero image

### Gallery Images
- Create a `gallery/` subfolder for gallery images
- Use descriptive filenames (e.g., `ceremony-01.jpg`, `reception-02.jpg`)
- Recommended size: 800x600 or higher
- Supported formats: JPG, PNG, WebP

### Optional Images
- `favicon.ico` - Website favicon (32x32)
- `logo.png` - Event or organizer logo
- `venue-exterior.jpg` - Venue photos
- `venue-interior.jpg` - Interior shots

## Image Optimization Tips

1. **Compress images** before uploading to reduce file size
2. **Use WebP format** when possible for better compression
3. **Provide alt text** for accessibility
4. **Consider responsive images** for different screen sizes

## Online Image Resources

If you need placeholder images:
- [Unsplash](https://unsplash.com) - Free high-quality photos
- [Pexels](https://pexels.com) - Free stock photos
- [Pixabay](https://pixabay.com) - Free images and vectors

## Image Configuration

Update the image paths in `config/app-config.js`:

```javascript
event: {
    heroImage: 'assets/images/hero-image.jpg'
},

gallery: {
    images: [
        {
            src: 'assets/images/gallery/image1.jpg',
            caption: 'Beautiful moment',
            alt: 'Description for accessibility'
        }
    ]
}
```
