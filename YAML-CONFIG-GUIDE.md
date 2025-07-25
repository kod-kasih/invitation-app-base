# YAML Configuration Guide

This guide explains how to customize your event invitation website using the `config.yaml` file.

## Quick Start

1. Open `src/config.yaml` in any text editor
2. Edit the values to match your event details
3. Save the file
4. Refresh your website to see the changes

> **Note:** If you see placeholder text like "Please Update Config" on your website, it means the configuration needs to be updated in `config.yaml`.

## How It Works

- **YAML Configuration**: Controls all visible content (event details, text, images)
- **JavaScript Configuration**: Controls technical features and functionality (managed by developers)
- **Graceful Fallbacks**: If YAML fails to load, helpful placeholder text guides you to update the configuration
- **No Broken Experience**: The website always works, even with missing configuration

## Configuration Sections

### 🎉 Event Information
```yaml
event:
  title: "Your Event Title"
  subtitle: "Brief description or tagline"
  date: "December 25, 2025 at 6:00 PM"
  location: "Your venue address"
  dresscode: "Dress code requirements"
  dining: "Food/drink information"
  heroImage: "hero-image.jpg"  # Place in src/assets/images/
```

### 👤 Organizer Contact
```yaml
organizer:
  name: "Your Name"
  email: "your-email@example.com"
  phone: "+1 (555) 123-4567"
```

### 📅 Event Schedule
```yaml
schedule:
  - time: "5:30 PM"
    title: "Registration"
    description: "Check-in and welcome drinks"
  # Add more schedule items as needed
```

### 🖼️ Gallery Images
```yaml
gallery:
  images:
    - src: "image1.jpg"        # Place in src/assets/images/
      alt: "Description"
      caption: "Image caption"
    # Add more images as needed
```

### 📝 RSVP Form
```yaml
rsvp:
  enabled: true
  deadline: "December 20, 2025"
  maxGuests: 2
  fields:
    - name: "fullName"
      label: "Full Name"
      type: "text"
      required: true
    # Customize form fields as needed
```

### 📞 Contact Methods
```yaml
contact:
  methods:
    - type: "email"
      label: "Email Us"
      value: "contact@example.com"
      icon: "📧"
    # Add more contact methods
```

### 🎨 Customization
```yaml
customization:
  theme: "default"           # Options: default, elegant, wedding, corporate
  navigation:
    home: true
    details: true
    gallery: true            # Set to false to hide sections
    rsvp: true
    contact: true
```

> **Important:** Feature toggles (like enabling/disabling major functionality) are controlled by developers in the JavaScript configuration and are not user-configurable for stability reasons.

## Tips for Non-Technical Users

1. **Keep the structure**: Don't change the indentation or structure
2. **Use quotes**: Always put text values in quotes like `"Your Text"`
3. **Boolean values**: Use `true` or `false` (no quotes)
4. **Comments**: Lines starting with `#` are comments and won't affect the website
5. **Images**: Place image files in `src/assets/images/` folder
6. **Testing**: Always test your changes by refreshing the website

## Common Customizations

### Change Event Title
```yaml
event:
  title: "My Wedding Reception"
  subtitle: "Celebrating Sarah & John"
```

### Hide a Section
```yaml
customization:
  navigation:
    gallery: false  # This will hide the gallery section
```

### Add More Schedule Items
```yaml
schedule:
  - time: "6:00 PM"
    title: "Cocktail Hour"
    description: "Drinks and appetizers"
  - time: "7:00 PM"
    title: "Dinner"
    description: "Three-course meal"
```

### Customize RSVP Form
```yaml
rsvp:
  fields:
    - name: "fullName"
      label: "Full Name"
      type: "text"
      required: true
    - name: "plusOne"
      label: "Plus One Name"
      type: "text"
      required: false
```

## Troubleshooting

- **Website not updating**: Check that you saved the file and refreshed the browser
- **Text not showing**: Make sure text values are in quotes
- **Structure broken**: Check that indentation is consistent (use spaces, not tabs)
- **Images not loading**: Ensure image files are in `src/assets/images/` folder

## Need Help?

If you need assistance with advanced customizations, contact your technical developer. They can modify the JavaScript configuration in `src/config/app-config.js` for more complex changes.
