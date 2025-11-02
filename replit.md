# Volunteer Management Platform

## Overview
This project is a full-stack volunteer management application designed to streamline the coordination of volunteer shifts and activities. It features a React/TypeScript frontend and an Express.js backend, with real-time data synchronization via Airtable. The platform enables volunteers to browse and filter shifts, search for opportunities, track their sign-ups, and manage their availability through a comprehensive calendar system. The vision is to create an efficient, user-friendly platform that simplifies volunteer coordination and enhances community engagement, with additional modules for disaster education, supply site management, and bioregional exploration.

## User Preferences
Preferred communication style: Simple, everyday language.

## Contact Information
- **Contact Form**: https://form.jotform.com/250033214947047 (JotForm)
  - Use this form for all "Contact Us" / "Email Us" buttons throughout the platform
  - Purpose: Platform access requests, general inquiries, support requests

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
- **Host Organization Integration**: Complete integration of mutual aid partner organizations throughout the volunteer portal. Features: (1) Backend fetches "Mutual Aid Partners" table from Airtable with organization names and logos, (2) V Shifts table links to host organizations via "Host" field (linked record to Mutual Aid Partners), (3) Professional display in ShiftCard component with gradient background, larger logos (32px), and prominent styling, (4) Host information appears in Browse Shifts tab, My Shifts tab, and calendar event tooltips, (5) Automatic fallback to organization initial if no logo provided, (6) 5-minute caching for performance optimization.
  
  **Implementation Notes for Host Organization Display:**
  - **Airtable Schema**: V Shifts table must have: (a) "Host" field (linked record to Mutual Aid Partners), (b) "Name (from Host)" lookup field, (c) "Logo (from Host)" lookup field (attachment type)
  - **Critical Discovery**: Airtable API returns fields ONLY if they contain data. Empty fields are omitted from the response, so always check field existence before accessing.
  - **Field Naming**: Some Airtable fields have trailing spaces (e.g., "Activity ", "Location "). Always check both variations: `fields['Activity '] || fields['Activity']`
  - **Lookup Fields Priority**: Use Airtable lookup fields directly (`fields['Name (from Host)']`, `fields['Logo (from Host)']`) instead of fetching Mutual Aid Partners separately - more efficient and handles updates automatically.
  - **Logo URL Extraction**: Logo attachments return as array with objects containing `.url` property: `fields['Logo (from Host)']?.[0]?.url`
  - **Frontend Display Locations**: Host info must be added to THREE places: (1) `ShiftCard.tsx` component (Browse shifts page), (2) `volunteer-portal.tsx` Browse tab (AuthenticatedShiftCard), (3) `volunteer-portal.tsx` My Shifts tab (assignment cards)
  - **Consistent Styling**: Use gradient box `bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100` with white rounded container for logo, "Hosted by" label in gray text, and bold organization name
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
- **Supply Site Network Module**: Complete supply site onboarding and management system with a professional landing page, 8-step onboarding wizard matching WSS (WNC Supply Sites) database schema, support for dual taxonomies (R8 types: POD/POC/Community/Other; WSS types: Distribution Center/Warehouse), comprehensive validation with Zod schemas, privacy-aware data collection (public vs authenticated-only fields), public/private toggle for site information visibility, dev mode bypass for testing, mobile-first design, integrated training modules, and administrative review workflow explanation. Database schema includes supply_sites, site_managers, and counties tables matching WSS PostgreSQL structure.
- **Impact Tracking System**: Privacy-first "last mile" delivery tracking with aggregate distribution metrics (households served, items distributed, category breakdowns) and trauma-informed story collection. No personal identifiers collected from recipients. Features explicit consent management, review workflow for stories, and educational trauma-informed best practices guidelines. Database tables: site_impact_records (aggregate metrics only) and site_stories (anonymous narratives with consent flags).
- **Hurricane Melissa Response Module**: Real-time disaster response platform for Hurricane Melissa (Category 5) making landfall in Jamaica (Oct 27-28, 2025). Features interactive infrastructure map displaying critical facilities from OpenStreetMap/HDX datasets: hospitals & clinics, emergency shelters (schools, churches, community centers), airports & helipads, ports & harbors, and major road networks. Includes tabbed interface for crisis dashboard, infrastructure mapping, commodity inventory tracking, transportation logistics, and damage assessment. All infrastructure data sourced from Overpass API with 1-hour caching. Designed to support 165,000+ people at risk across 8 parishes (Saint Elizabeth, Manchester, Clarendon, Saint Catherine, Saint Andrew, Kingston, Saint Thomas, Portland). Integration points for ODPEM (Jamaica disaster management), CDEMA (Caribbean emergency management), Jamaica Red Cross, and WFP Caribbean Hub logistics.
- **Public Supply Sites Map**: Interactive public map displaying food hubs and supply distribution centers with inventory recency heat mapping for Western North Carolina and surrounding areas during the SNAP funding gap. Coordinated by R4 Reach, Valley Hope Foundation, WNC supply Sites, and mutual aid partners. Features: (1) Satellite imagery view using Esri World Imagery tiles with overlay layers (state lines, roads, counties, cities), (2) Leaflet-based mapping with color-coded markers (green=recently updated, yellow=moderate, red=needs update, gray=no data), (3) Publicly accessible without authentication at /supply-sites-map, (4) Embeddable for partner organizations via ?embed=true query parameter, (5) Configurable thresholds via URL parameters (?green=7&yellow=30), (6) Clickable site popups displaying name, address, hours, site type, accepting/distributing status, and last inventory update date, (7) Mobile-optimized responsive design, (8) Privacy-aware filtering showing only PUBLIC sites from Airtable (respects isPubliclyVisible flag), (9) Persistent file-based geocoding cache (geocode-cache.json) with 292+ addresses cached. Airtable integration fetches Site and Site Inventory tables using "Update Timestamp" field (with fallback to "Last Modified" then createdTime) to calculate inventory recency. Backend API at /api/supply-sites/public with server-side filtering and threshold calculation.

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
- **OpenStreetMap / Overpass API**: Real-time infrastructure data for disaster response (hospitals, shelters, airports, ports, roads).
- **Humanitarian Data Exchange (HDX)**: Pre-processed humanitarian datasets for crisis zones (998,700 buildings, health facilities, roads, airports, sea ports for Jamaica).