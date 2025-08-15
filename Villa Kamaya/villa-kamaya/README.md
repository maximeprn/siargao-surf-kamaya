# Villa Kamaya

A luxury tropical villa website built with Next.js 15, featuring stunning animations and a modern booking system.

## 🏝️ About Villa Kamaya

Villa Kamaya is a premium vacation rental website showcasing a beautiful villa in Siargao Island, Philippines. The site features:

- **Modern Design**: Clean, responsive design optimized for all devices
- **Smooth Animations**: GSAP-powered animations for premium user experience
- **Booking System**: Integrated booking flow (ready for Hospitable API)
- **Gallery**: Categorized photo gallery with lightbox functionality
- **Contact Forms**: Inquiry and contact forms (ready for Supabase integration)

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP with ScrollTrigger
- **State Management**: React Hooks
- **Development**: Turbopack for fast development

## 📁 Project Structure

```
src/
├── app/                    # App Router pages
│   ├── about/             # About page
│   ├── booking/           # Booking page
│   ├── contact/           # Contact page
│   ├── gallery/           # Gallery page
│   └── page.tsx           # Homepage
├── components/
│   ├── layout/            # Navigation, Footer
│   ├── sections/          # Homepage sections
│   └── ui/                # Reusable UI components
└── lib/
    ├── gsap.ts            # GSAP configuration and utilities
    └── utils.ts           # Utility functions
```

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   cd villa-kamaya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Features

### Homepage Sections
- **Hero**: Animated hero section with call-to-actions
- **Room Preview**: Villa showcase with amenities
- **Amenities**: Interactive amenities grid
- **Location**: Location details with nearby attractions
- **Reviews**: Customer testimonials
- **Quick Booking**: Booking widget with pricing

### Pages
- **Gallery**: Categorized photo gallery with lightbox
- **About**: Villa story and host information
- **Booking**: Multi-step booking flow
- **Contact**: Contact forms and information

### Animations
- Scroll-triggered animations using GSAP
- Smooth page transitions
- Interactive hover effects
- Staggered element animations

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type checking
```

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🎯 Next Steps

The website is ready for:
1. **Hospitable API Integration** - Connect booking system
2. **Supabase Integration** - Store inquiries and content
3. **Image Assets** - Replace placeholder images with actual villa photos
4. **SEO Optimization** - Add meta tags and structured data
5. **Performance Optimization** - Image optimization and caching

## 📄 License

This project is part of the Villa Kamaya brand. All rights reserved.
