# Volunteer Management Platform

## Overview
This project is a full-stack volunteer management application designed to streamline the coordination of volunteer shifts and activities. It features a React/TypeScript frontend and an Express.js backend, with real-time data synchronization via Airtable. The platform enables volunteers to browse and filter shifts, search for opportunities, track their sign-ups, and manage their availability through a comprehensive calendar system. The vision is to create an efficient, user-friendly platform that simplifies volunteer coordination and enhances community engagement, with additional modules for disaster education, supply site management, and bioregional exploration.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### UI/UX Decisions
The platform features a clean, professional design with a focus on readability and accessibility, utilizing a soft color scheme and improved contrast. Interactive UI elements incorporate subtle hover effects for clear visual feedback. The design is fully mobile-optimized with comprehensive responsive layouts, including mobile-first grid breakpoints, balanced mobile spacing, and moderate negative margin overlapping for smooth section transitions. Navigation uses icon-based tabs with responsive layouts.

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
- **Volunteer Management**: Shift browsing, filtering, search, signup tracking, availability calendar, and profile management with skill and status updates.
- **Authentication**: Phone number-based authentication with demo account support.
- **Airtable Integration**: Real-time data sync for volunteer shifts, assignments, availability, and profiles.
- **Calendar System**: Comprehensive calendar with event display, detailed tooltips, 24-hour grid, and .ics export.
- **Notification System**: In-app notifications with customizable preferences for new shifts, reminders, and emergency alerts.
- **Duplicate Prevention**: Backend validation to prevent duplicate shift assignments.
- **Host Integration**: Display of mutual aid partners with logos on shift cards.
- **Enhanced Weather Alert System**: Multi-source RSS feed integration (National Weather Service, Hurricane Center, Storm Prediction Center) for comprehensive weather alerts, including sophisticated parsing, categorization, and severity-based sorting.
- **Major Disaster Impact Database**: Curated database of significant disasters (2021-2025) with authentic casualty and damage data from official government sources (FEMA, CDC, NOAA), enhanced with Wikipedia API integration for cross-verification.
- **Comprehensive NOAA Climate Integration**: Multi-source RSS feed integration from 4 official NOAA data sources for climate monitoring, including advanced data extraction for temperature anomalies and precipitation, and an immersive dashboard with interactive trend analysis.
- **Enhanced FEMA Integration**: Comprehensive FEMA OpenData API integration for disaster declarations, mission assignments, housing assistance, public assistance funding, and NFIP flood claims, covering 43+ datasets.
- **Supply Site Activity Tracking**: Advanced metrics for supply site activity within the last 60 days based on inventory updates, delivery tracking, and recent needs/requests.
- **Performance Optimization**: Comprehensive caching system for external APIs (FEMA, NASA EONET, species data, photos, air quality) to minimize API usage and costs, along with React Query enhancements for request throttling and improved retry strategies.
- **Educational Data Explanations**: Comprehensive help text and data source explanations throughout the application, including a dedicated DataSourcesOverview component.
- **Custom Alerting System**: User-defined alert rules for weather, wildfire, earthquake, and disaster events with multi-channel notifications (email/SMS/webhook), geographic filtering, and severity thresholds.
- **Custom Disaster Icons Integration**: Full integration of custom disaster icons across all platform components, with fallback to Lucide icons and smart disaster type mapping.
- **Satellite Imagery Integration**: High-resolution satellite imagery using Esri World Imagery tiles for all NASA EONET natural disaster events, displaying actual satellite views of affected areas.
- **Comprehensive Data Sources Integration**: Integration of 8 official government data sources: FEMA, NWS, USGS, InciWeb, NASA EONET, Hurricane Center RSS, Storm Prediction Center RSS, and temporarily disabled Twitter emergency monitoring.
- **Interactive Bioregion Explorer**: Comprehensive global ecoregion exploration platform with card-based display, advanced filtering, intelligent search, detailed information panels, and indigenous knowledge integration (WWF/RESOLVE 2017 dataset, Native Land Digital API integration planned).
- **Hawaii Regeneration Dashboard**: Hawaii-specific regeneration platform featuring traditional ahupua'a watershed management systems, current restoration projects, native species recovery, sustainable agriculture, and community-led conservation with volunteer opportunities.
- **Interactive Disaster Education Center**: Comprehensive educational platform explaining disaster concepts, classification systems, alert levels, and emergency management protocols for 6 major disaster types, based on authoritative sources.
- **Supply Site Network Module**: Complete supply site onboarding and management system with a professional landing page, 6-step onboarding wizard, support for multiple site types, mobile-first design, integrated training modules, and administrative review workflow explanation.

## External Dependencies
### Core Framework & Libraries
- `@neondatabase/serverless`: Neon PostgreSQL integration
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI component primitives
- `drizzle-orm`: Type-safe database ORM
- `wouter`: Lightweight React routing
- `tailwindcss`: Utility-first CSS framework
- `lucide-react`: Icon library
- `date-fns`: Date manipulation utilities
- `turf.js`: Geospatial analysis

### Data Integration
- **Airtable API**: Primary data source for volunteer shifts, assignments, and volunteer information.
- **Geocoding APIs**: Zippopotam.us for ZIP code to coordinates, built-in state centroid database.
- **Bioregion Data**: GeoJSON-based bioregion polygon data.
- **National Weather Service API (NWS)**: Weather alerts.
- **Hurricane Center RSS**: Hurricane alerts.
- **Storm Prediction Center RSS**: Storm alerts.
- **FEMA OpenData API**: Disaster declarations, assistance, funding, and flood claims.
- **NASA EONET**: Natural hazards events.
- **USGS**: Earthquake monitoring.
- **InciWeb**: Wildfire incidents.
- **Wikipedia API**: Disaster information and data verification.
- **NOAA Data Sources**: NCEI Monthly Reports, NCEI News, Climate.gov, NWS Climate for climate monitoring.
- **Esri World Imagery**: Satellite imagery for EONET events.