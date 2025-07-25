# Event Invitation App - Base Template

A dynamic microfrontends-inspired static website for event invitations, built with pure HTML, CSS, and JavaScript. Perfect for weddings, parties, corporate events, and any special occasion.

## 🌟 Features

### Core Components
- **Hero Section**: Eye-catching welcome area with event title, date, and call-to-action
- **Event Details**: Comprehensive information about time, location, dress code, and schedule
- **Gallery**: Beautiful image gallery with lightbox functionality
- **RSVP Form**: Interactive form for guest responses with validation
- **Contact Section**: Organizer information and contact form
- **Responsive Navigation**: Mobile-friendly navigation with smooth scrolling

### Technical Features
- **Modular Architecture**: Component-based structure for easy customization
- **Theme System**: Multiple built-in themes (default, wedding, corporate, party, nature, elegant)
- **Email Integration**: Support for Formspree, Netlify Forms, EmailJS, and custom APIs
- **Local Storage**: Automatic backup of form submissions
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized loading with lazy images and minimal dependencies

## 🚀 Quick Start

1. **Fork this repository** to create your own event invitation
2. **Customize the configuration** in `src/config/app-config.js`
3. **Update the content** to match your event details
4. **Configure email service** for form submissions
5. **Deploy** to GitHub Pages, Netlify, or any static hosting service

## 📁 Project Structure

```
src/
├── index.html                  # Main HTML file
├── styles/
│   ├── core.css               # Base styles and utilities
│   ├── components.css         # Component-specific styles
│   └── theme.css              # Theme variables and animations
├── scripts/
│   ├── core/
│   │   ├── app.js            # Main application controller
│   │   ├── eventBus.js       # Event communication system
│   │   └── router.js         # Single-page navigation
│   ├── components/
│   │   ├── navigation.js     # Navigation component
│   │   ├── hero.js          # Hero section component
│   │   ├── gallery.js       # Image gallery component
│   │   ├── rsvp.js          # RSVP form component
│   │   └── contact.js       # Contact form component
│   ├── services/
│   │   ├── emailService.js   # Email handling service
│   │   └── storageService.js # Local storage management
│   └── utils/
│       └── helpers.js        # Utility functions
├── config/
│   └── app-config.js         # Application configuration
└── assets/
    └── images/               # Image assets
```

## ⚙️ Configuration

All customization is done through the `src/config/app-config.js` file:

### Basic Event Information
```javascript
event: {
    title: 'Your Event Title',
    subtitle: 'Event description',
    date: 'December 25, 2025 at 6:00 PM',
    location: 'Venue Name and Address',
    organizer: {
        name: 'Your Name',
        email: 'your@email.com',
        phone: '+1 (555) 123-4567'
    }
}
```

### Email Service Setup
```javascript
email: {
    provider: 'formspree', // or 'netlify', 'emailjs', 'custom'
    serviceUrl: 'https://formspree.io/f/your-form-id'
}
```

### Theme Selection
```javascript
app: {
    theme: 'wedding' // options: default, dark, wedding, corporate, party, nature, elegant
}
```

## 📧 Email Service Configuration

### Formspree (Recommended)
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy the form endpoint URL
4. Update `serviceUrl` in config

### Netlify Forms
1. Deploy to Netlify
2. Set `provider: 'netlify'` in config
3. Forms will automatically work

### EmailJS
1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create email service and template
3. Update config with service details

## 🎨 Customization

### Adding Custom Styles
Create custom CSS variables in the theme configuration:
```javascript
customization: {
    colors: {
        primary: '#your-color',
        secondary: '#your-color'
    }
}
```

### Modifying Components
Each component is modular and can be customized independently:
- Edit component JavaScript files in `src/scripts/components/`
- Modify component styles in `src/styles/components.css`
- Update HTML structure in `src/index.html`

### Adding New Sections
1. Add HTML section to `index.html`
2. Create component JavaScript file
3. Add styles to `components.css`
4. Register component in `app.js`

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/repository-name`

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: (leave empty for static sites)
3. Set publish directory: `src`
4. Deploy automatically on git push

### Vercel
1. Import your GitHub repository to Vercel
2. Set output directory: `src`
3. Deploy with one click

## 🛠️ Development

### Local Development
1. Clone the repository
2. Open `src/index.html` in a web browser
3. Or use a local server: `python -m http.server 8000` (from src directory)

### Making Changes
1. Edit configuration in `app-config.js`
2. Modify styles in CSS files
3. Update component logic in JavaScript files
4. Test in multiple browsers and devices

## 📱 Mobile Optimization

- Responsive grid system
- Touch-friendly navigation
- Optimized image loading
- Mobile-specific interactions
- Reduced motion support

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## 🔧 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance Features

- Lazy loading images
- Optimized CSS delivery
- Minimal JavaScript footprint
- Efficient event handling
- Local storage caching

## 🤝 Contributing

This is a base template designed to be forked and customized. To contribute to the base template:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Use Cases

- **Wedding Invitations**: Elegant designs with RSVP management
- **Corporate Events**: Professional themes with contact forms
- **Birthday Parties**: Fun themes with photo galleries
- **Social Gatherings**: Casual designs with event details
- **Fundraisers**: Information-rich layouts with contact options

## 💡 Tips for Success

1. **Test your email service** before going live
2. **Optimize images** for faster loading
3. **Test on mobile devices** thoroughly
4. **Set clear RSVP deadlines** in your configuration
5. **Include contact information** for questions
6. **Use high-quality images** in your gallery
7. **Keep content concise** and scannable

## 🔮 Future Enhancements

- Multi-language support
- Calendar integration
- Map integration
- Social media sharing
- Guest message board
- Photo upload for guests
- QR code generation
- Progressive Web App features

## 📞 Support

For questions and support:
- Create an issue in the GitHub repository
- Check the documentation in the code comments
- Review the configuration examples

---

**Happy Event Planning! 🎉**
