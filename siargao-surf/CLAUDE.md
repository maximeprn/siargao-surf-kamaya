# Siargao Surf - Claude Project Documentation

## Project Overview
Application web de surf forecasting pour Siargao (Philippines) avec données météo en temps réel, analyses IA des conditions, et interface moderne avec effets glassmorphisme.

## Tech Stack
- **Framework**: Next.js 15.4.6 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + effets glassmorphisme personnalisés
- **Animations**: Framer Motion + CSS animations
- **Data**: Supabase (PostgreSQL)
- **API**: OpenAI GPT-5-mini pour rapports IA
- **Weather Data**: Marine Weather API
- **Icons**: Lucide React

## Key Features Implemented

### 🌊 Core Surf Features
- **Real-time surf data** with marine weather integration
- **AI surf reports** generated with GPT-5-mini (French/English)
- **Tide charts** with interactive hover tooltips showing exact values
- **Wave height correction** based on spot characteristics
- **Surf quality scoring** with visual gauge (POOR → EXCELLENT)
- **12 Siargao spots** with detailed metadata (Cloud 9, Quicksilver, etc.)

### 🎨 UI/UX Components
- **SurfPhotoCardAqua**: Hero image with aquatic effects (caustiques, rays)
- **SpotDetailsOverlay**: Key spot info overlaid on hero image
- **SwellCompass**: 3D tilt animation on hover with swell/wind directions
- **SpotSelector**: Navbar dropdown with glassmorphism effects
- **TideCurve**: Interactive SVG chart with hover tooltips

### 🔧 Technical Features
- **Caching system** for AI reports with conditions-based regeneration
- **Tide stage calculation** (low/mid/high) based on daily range
- **Spot routing** with dynamic pages `/spots/[id]`
- **Responsive design** with mobile-first approach

## File Structure

### Core Pages
- `src/app/page.tsx` - Homepage with main dashboard
- `src/app/spots/[id]/page.tsx` - Individual spot pages

### Key Components
- `src/components/ui/SpotLayoutNew.tsx` - Main spot layout with hero image
- `src/components/ui/SpotSelector.tsx` - Navbar spot dropdown
- `src/components/ui/TideCurve.tsx` - Interactive tide chart
- `src/components/ui/SwellCompassWithLegend.tsx` - 3D compass with animations
- `src/components/ui/SurfPhotoCardAqua.tsx` - Hero image with effects
- `src/components/ui/SpotDetailsOverlay.tsx` - Spot info overlay

### Data & Config
- `src/lib/spot-configs.ts` - Complete Siargao spots database
- `src/lib/ai.ts` - AI prompt building and tide stage calculation
- `src/lib/marine-weather.ts` - Weather data fetching and processing
- `src/lib/ai-cache.ts` - Caching system for AI reports

### API Routes
- `src/app/api/spot-report/route.ts` - AI report generation with caching

## Design System

### Colors & Effects
- **Primary**: `rgba(27, 51, 64, 0.6)` - Navbar/dropdown background
- **Glassmorphisme**: `backdrop-filter: blur(10px)` + semi-transparent backgrounds
- **Borders**: `rgba(255, 255, 255, 0.14)` for glass effect borders
- **Surf Quality**: Progressive colors from gray → orange → green → red

### Typography
- **Headers**: Font weight 600, white/90 opacity
- **Body**: Text-sm, white/80 opacity  
- **Labels**: Text-xs, white/60 opacity, uppercase tracking

### Animations
- **Compass 3D**: Perspective tilt on hover with smooth transitions
- **Dropdown**: 1000ms delay before close, invisible bridge area
- **Hover effects**: 200ms transitions on all interactive elements

## Development Workflow

### Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint checking
- `npm run typecheck` - TypeScript validation

### Git Workflow
- Always commit with descriptive messages
- Include "🤖 Generated with Claude Code" footer
- Use conventional commit format when possible

### API Keys Required
- `OPENAI_API_KEY` - For AI surf reports
- Supabase credentials for database access
- Marine weather API credentials

## Current Implementation Status

### ✅ Completed Features
- Hero image with aquatic effects and spot details overlay
- Interactive tide chart with hover tooltips
- 3D animated compass with smooth transitions
- Navbar spot selector with glassmorphism
- AI report system with caching and tide stage calculation
- Complete spot database with 12 Siargao locations
- Responsive layout with desktop/mobile optimization

### 🔄 Recent Improvements
- Fixed spot selector mouse detection for fast movements
- Added anti-close mechanism with invisible bridge area
- Enhanced glassmorphism effects matching navbar style
- Improved TypeScript safety for undefined properties

### 🎯 Conventions
- Use 'use client' for interactive components
- Prefer inline styles for complex glassmorphism effects
- Always include loading states and error handling
- Follow mobile-first responsive design
- Use TypeScript strictly with proper type definitions

## Troubleshooting

### Common Issues
- **Backdrop-filter not working**: Ensure browser supports CSS backdrop-filter
- **AI reports failing**: Check OpenAI API key and model availability
- **Dropdown closing**: Use longer delays (1000ms) and invisible bridge areas
- **Image 404s**: Images are in `/public/images/` directory

### Performance Notes
- AI reports are cached to avoid repeated API calls
- Marine weather data should be cached appropriately
- Images should use Next.js Image component for optimization
- Consider lazy loading for spot images

## Notes for Future Development
- Consider adding more surf spots outside Siargao
- Implement user preferences for units (meters/feet)
- Add surf session tracking and user accounts
- Improve mobile UX for dropdown interactions
- Add PWA capabilities for offline access