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
- **Emergency Alerts System**: Real-time emergency alerts via IPAWS/NWS APIs with comprehensive disaster tracking and community notification system. Map interface removed per user request due to inability to meet authentic geographic boundary requirements.
- **Supply Site Activity Tracking**: Advanced metrics for supply site activity within last 60 days based on inventory updates, delivery tracking, and recent needs/requests. Includes three activity metrics: Active Sites (inventory updates), Sites with Deliveries (received aid), and Sites with Recent Activity (current needs or updates).
- **Performance Optimization**: Comprehensive caching system to minimize API usage - FEMA disasters cached 1 hour, ReliefWeb/Humanitarian news cached 2 hours, frontend refresh intervals set to 30 minutes, stats cached 24 hours, activity data cached 6 hours.

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

### Development Tools
- `@replit/vite-plugin-runtime-error-modal`: Enhanced error reporting
- `@replit/vite-plugin-cartographer`: Development tooling integration