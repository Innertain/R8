# Volunteer Management Platform

## Overview
This project is a full-stack volunteer management application designed to streamline the coordination of volunteer shifts and activities. It features a React/TypeScript frontend and an Express.js backend, with real-time data synchronization via Airtable. The platform enables volunteers to browse and filter shifts, search for opportunities, track their sign-ups, and manage their availability through a comprehensive calendar system. The vision is to create an efficient, user-friendly platform that simplifies volunteer coordination and enhances community engagement.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### UI/UX Decisions
The platform features a clean, professional design with a focus on readability. It utilizes a soft color scheme with light grey backgrounds and improved contrast. Interactive UI elements incorporate subtle hover effects, such as slight lifting, enhanced shadows, and blue border highlights for clear visual feedback. The design is mobile-optimized with responsive layouts, appropriate touch targets, and simplified animations for a consistent experience across devices. Navigation uses icon-based tabs with responsive layouts (vertical on mobile, horizontal on desktop).

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
- **Volunteer Management**: Shift browsing, filtering, search, signup tracking, availability calendar.
- **Authentication**: Phone number-based authentication system for volunteers with demo account support.
- **Airtable Integration**: Real-time data sync for volunteer shifts, assignments, availability, and volunteer profiles.
- **Calendar System**: Comprehensive calendar with event display, detailed tooltips on hover, and full 24-hour grid display for availability management. Includes .ics export for Google and Apple Calendars.
- **Notification System**: In-app notifications with customizable preferences (new shifts, reminders, emergency alerts) and visual indicators.
- **Profile Management**: Volunteers can manage their profiles, including skills and status (Active, Taking a Break, Remove Data).
- **Duplicate Prevention**: Backend validation to prevent duplicate shift assignments.
- **Host Integration**: Display of mutual aid partners (hosts) with logos on shift cards.
- **Enhanced Weather Alert System**: Comprehensive multi-source RSS feed integration pulling from National Weather Service API (392 alerts), Hurricane Center RSS (2 alerts), and Storm Prediction Center RSS (8 alerts) for 399+ total weather alerts. Includes sophisticated RSS parsing, alert categorization, duplicate removal, and severity-based sorting.
- **Major Disaster Impact Database with Wikipedia Integration**: Curated database of significant disasters (2021-2025) with 10+ deaths or $100M+ damage. Features authentic casualty data verified from official government sources including FEMA, state emergency management agencies, CDC mortality data, and NOAA damage assessments. Enhanced with Wikipedia API integration for comprehensive disaster information and data verification capabilities. Clickable event cards open detailed modals with side-by-side comparison of official government data vs Wikipedia crowd-sourced information for cross-verification of casualty figures and damage estimates. **CRITICAL: Zero tolerance for mock/synthetic data - all events traceable to official sources. Never alter authentic dates or casualty figures provided by user.** Default view set to Event List for immediate access to disaster events rather than overview statistics.
- **Comprehensive NOAA Climate Integration**: Enhanced NOAA climate monitoring system with multi-source RSS feed integration from 4 official NOAA data sources (NCEI Monthly Reports, NCEI News, Climate.gov, NWS Climate). Features advanced data extraction for temperature anomalies, precipitation data, and severity analysis with intelligent categorization across 9 climate categories (temperature, drought, wildfire, storms, ice, flooding, air quality, ocean, other). Includes immersive dashboard with interactive trends analysis, geographic scope tracking, severity distribution charts, and comprehensive statistics with robust error handling for failed feeds.
- **Enhanced FEMA Integration**: Comprehensive FEMA OpenData API integration including disaster declarations with detailed incident periods, declaration dates, disaster type icons, statistics dashboard, mission assignments for real-time response coordination, housing assistance data for individual aid tracking, public assistance infrastructure funding, and NFIP flood claims data. Access to 43+ FEMA datasets across 6 categories: Disaster Information, Emergency Management, Individual Assistance, Public Assistance, Hazard Mitigation, and National Flood Insurance Program.
- **Supply Site Activity Tracking**: Advanced metrics for supply site activity within last 60 days based on inventory updates, delivery tracking, and recent needs/requests. Includes three activity metrics: Active Sites (inventory updates), Sites with Deliveries (received aid), and Sites with Recent Activity (current needs or updates).
- **Performance Optimization**: Comprehensive caching system to minimize API usage and reduce costs - FEMA disasters cached 2 hours, NASA EONET events cached 2 hours, species data cached 72 hours, photos cached 168 hours, frontend refresh intervals optimized to 2 hours, stats cached 24 hours, activity data cached 6 hours. Air quality monitoring reduced from 15 minutes to 2 hours. Debug endpoints optimized from 30 seconds to 2 minutes. React Query enhanced with request throttling (3-second minimum intervals), improved retry strategies, and extended cache durations. Fixed infinite render loops in interactive components.
- **Educational Data Explanations**: Comprehensive help text and data source explanations throughout the application. Each major component (Weather Alerts, Wildfire Incidents, Earthquake Data, Disaster Analytics) includes detailed information boxes explaining data sources, update frequencies, reliability, and how to interpret the information. Added dedicated DataSourcesOverview component providing complete information about FEMA, NWS, USGS, and InciWeb data sources with coverage areas, update frequencies, and data quality explanations.
- **Custom Alerting System**: Comprehensive alert management platform as primary monetization driver. Features user-defined alert rules for weather, wildfire, earthquake, and disaster events with multi-channel notifications (email/SMS/webhook), geographic filtering, severity thresholds, cooldown controls, and detailed delivery tracking. Includes PostgreSQL database integration with alert_rules, alert_deliveries, and user_notification_settings tables, plus sophisticated alert engine for real-time event processing and notification delivery.
- **Enhanced Social Media Monitoring**: TEMPORARILY DISABLED - Live Twitter/X API v2 integration successfully tested with Governor Gavin Newsom's account, proving real-time monitoring works. System consumed 96/100 monthly API requests quickly, making it unsustainable for continuous operation on free tier. **TODO: Reactivate later with paid Twitter API plan or improved caching optimization**. Complete infrastructure remains in place including intelligent caching, urgency classification, keyword filtering, and API usage tracking for all 50 state governors and emergency management agencies.
- **Custom Disaster Icons Integration**: COMPLETED - Full integration of user's custom disaster icons across all platform components. Professional visual enhancement includes Fire, Flood, Hurricane, Ice/Winter Storm, Storm, Tornado, and Wind icons integrated into Weather Alerts, FEMA Disasters, Wildfire Incidents, NASA EONET Events, and Disaster Analytics Dashboard. Implemented with proper fallback system to Lucide icons and smart disaster type mapping for enhanced visual branding.
- **Satellite Imagery Integration**: Successfully integrated high-resolution satellite imagery using Esri World Imagery tiles for all NASA EONET natural disaster events. Each event now displays actual satellite views of affected areas with reliable image loading and proper error handling. System uses coordinate-to-tile conversion for precise geographic targeting and zoom level 12 for optimal detail visualization.
- **Comprehensive Data Sources Integration**: Platform now integrates 8 official government data sources: FEMA disaster declarations, NWS weather alerts, USGS earthquake monitoring, InciWeb wildfire incidents, NASA EONET natural hazards, Hurricane Center RSS feeds, Storm Prediction Center RSS, and temporarily disabled Twitter emergency monitoring. All sources feature real-time to daily updates with official government reliability standards.
- **Interactive Bioregion Explorer**: COMPLETED & ENHANCED - Comprehensive global ecoregion exploration platform with enterprise-grade capabilities. Features enhanced visual presentation with card-based ecoregion display, advanced filtering by biomes and biogeographic realms, intelligent search functionality, and detailed information panels. Includes complete WWF/RESOLVE 2017 dataset framework (846 ecoregions across 14 biomes and 8 realms), extensive indigenous knowledge integration with traditional ecological knowledge documentation for major ecoregions worldwide including Native American, Aboriginal Australian, Amazonian indigenous groups, African traditional communities, Arctic peoples (Inuit, Sami, Nenets), and Himalayan mountain communities. Added comprehensive DatasetRecommendations component with GBIF, iNaturalist, eBird APIs, NOAA Climate Data, EPA EnviroAtlas integration paths, and UserExperienceEnhancements roadmap with 16 specific improvements across interactive mapping, search/navigation, visualizations, and mobile UX. Platform architected for expansion to full 846 ecoregion dataset with Native Land Digital API integration for complete indigenous territory mapping.
- **Hawaii Regeneration Dashboard**: NEW - Focused Hawaii-specific regeneration platform featuring traditional ahupua'a watershed management systems, current restoration projects across all islands, native species recovery efforts, sustainable agriculture initiatives, and community-led conservation with volunteer opportunities. Includes traditional knowledge sections covering ʻāina-based practices (taro cultivation, fishpond systems, forest stewardship, watershed management), impact statistics tracking (acres restored, species recovered, volunteers active), and actionable volunteer engagement opportunities. Built with comprehensive source date attribution system throughout.
- **Interactive Disaster Education Center**: NEW - Comprehensive educational platform explaining disaster concepts, classification systems, alert levels, and emergency management protocols. Features interactive learning modules for 6 major disaster types (earthquakes, hurricanes, wildfires, floods, tornadoes, winter storms) using custom disaster icons. Includes detailed coverage of official scales (Richter Scale, Saffir-Simpson Scale, Enhanced Fujita Scale, etc.), alert classification systems, and comprehensive preparedness/response/recovery guidance based on authoritative sources including NOAA, FEMA, and emergency management agencies. Organized into 6 educational tabs: Overview, Classification, Alerts, Preparedness, Response, and Recovery with visual icons and color-coded severity indicators.

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

### Data Integration
- **Airtable API**: Primary data source for volunteer shifts, assignments, and volunteer information. Uses `AIRTABLE_TOKEN` and `VITE_BASE_ID` environment variables.
- **Geocoding APIs**: Zippopotam.us for ZIP code to coordinates conversion, built-in state centroid database for U.S. state geocoding.
- **Bioregion Data**: GeoJSON-based bioregion polygon data with Turf.js geospatial analysis capabilities.

### Development Tools
- `@replit/vite-plugin-runtime-error-modal`: Enhanced error reporting
- `@replit/vite-plugin-cartographer`: Development tooling integration