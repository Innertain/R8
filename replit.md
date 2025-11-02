# Volunteer Management Platform

## Overview
This project is a full-stack volunteer management application designed to streamline the coordination of volunteer shifts and activities. It features a React/TypeScript frontend and an Express.js backend, with real-time data synchronization via Airtable. The platform enables volunteers to browse and filter shifts, search for opportunities, track their sign-ups, and manage their availability through a comprehensive calendar system. The vision is to create an efficient, user-friendly platform that simplifies volunteer coordination and enhances community engagement, with additional modules for disaster education, supply site management, and bioregional exploration. It also includes comprehensive modules for disaster response (e.g., Hurricane Melissa) and tracking impact.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### UI/UX Decisions
The platform features a clean, professional design with a focus on readability and accessibility, utilizing a soft color scheme and improved contrast. Interactive UI elements incorporate subtle hover effects for clear visual feedback. The design is fully mobile-optimized with comprehensive responsive layouts. Navigation uses icon-based tabs with responsive layouts.

### Technical Implementations
#### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Framework**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with CSS custom properties
- **Build Tool**: Vite

#### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Development**: `tsx`
- **Production**: `esbuild` for bundling

#### Database & ORM
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon Database)
- **Migrations**: Drizzle Kit
- **Storage Interface**: Abstracted layer with in-memory fallback

### Feature Specifications
- **Volunteer Management**: Shift browsing, filtering, search, signup tracking, availability calendar, and profile management.
- **Authentication**: Phone number-based authentication with demo account support.
- **Airtable Integration**: Real-time data sync for volunteer shifts, assignments, availability, and profiles.
- **Calendar System**: Comprehensive calendar with event display, tooltips, 24-hour grid, and .ics export.
- **Notification System**: In-app notifications with customizable preferences.
- **Host Organization Integration**: Complete integration of mutual aid partner organizations with professional display in shift cards and calendar.
- **Enhanced Weather & Disaster Alerting**: Multi-source RSS feed integration for weather alerts, comprehensive FEMA and NOAA data integration, custom alerting system with multi-channel notifications, and custom disaster icons.
- **Disaster Impact & Education**: Major Disaster Impact Database, Interactive Disaster Education Center, and trauma-informed Impact Tracking System.
- **Supply Site Management**: Comprehensive supply site onboarding, management system, and an interactive public map displaying food hubs and supply distribution centers with inventory recency heat mapping.
- **Bioregional & Environmental**: Interactive Bioregion Explorer, Hawaii Regeneration Dashboard, and satellite imagery integration for natural disaster events.
- **Performance Optimization**: Comprehensive caching system for external APIs and React Query enhancements.
- **Hurricane Melissa Response Module**: Real-time disaster response platform with interactive infrastructure map for critical facilities, commodity tracking, and damage assessment.

## External Dependencies
- `@neondatabase/serverless`: Neon PostgreSQL integration
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI component primitives
- `drizzle-orm`: Type-safe database ORM
- `wouter`: Lightweight React routing
- `tailwindcss`: Utility-first CSS framework
- `lucide-react`: Icon library
- `date-fns`: Date manipulation utilities
- `turf.js`: Geospatial analysis
- **Airtable API**: Primary data source.
- **Geocoding APIs**: Zippopotam.us.
- **National Weather Service API (NWS)**: Weather alerts.
- **Hurricane Center RSS**: Hurricane alerts.
- **Storm Prediction Center RSS**: Storm alerts.
- **FEMA OpenData API**: Disaster data.
- **NASA EONET**: Natural hazards events.
- **USGS**: Earthquake monitoring.
- **InciWeb**: Wildfire incidents.
- **Wikipedia API**: Disaster information.
- **NOAA Data Sources**: Climate monitoring.
- **Esri World Imagery**: Satellite imagery.
- **OpenStreetMap / Overpass API**: Real-time infrastructure data.
- **Humanitarian Data Exchange (HDX)**: Humanitarian datasets.