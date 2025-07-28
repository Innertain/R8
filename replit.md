# Volunteer Management Platform

## Overview

This is a full-stack volunteer management application built with React/TypeScript frontend and Express.js backend. The platform manages volunteer shifts and activities with Airtable integration for real-time data synchronization. Features include shift browsing, filtering, search functionality, volunteer signup tracking, and a comprehensive volunteer availability calendar system.

## Recent Changes (July 27, 2025)

✓ **Airtable Integration Complete**: Successfully connected to all production tables
✓ **Real Data Access**: Connected Drivers (100 records), Volunteer Applications (67 records), V Availability (4 records), V Shift Assignment (9+ records), V Shifts (6 records)  
✓ **Token Permissions Fixed**: Resolved authentication issues with proper scopes and base ID formatting
✓ **Table Schema Discovery**: Identified field structures for volunteer scheduling integration
✓ **Volunteer Availability Calendar System**: Built complete calendar interface using react-big-calendar
✓ **Volunteer Registration & Login**: Phone number-based authentication system  
✓ **Database Schema**: Added volunteers, availability, and shift assignment tables
✓ **Demo Account**: Created demo volunteer (555-DEMO) for testing
✓ **API Integration**: Full CRUD operations for volunteers and availability
✓ **Navigation**: Added volunteer portal with clean navigation between shift browsing and calendar management
✓ **Shift Assignment Sync**: Fixed Airtable V Shift Assignment integration with proper field mapping
✓ **Live Assignment Creation**: Shift signups now create records directly in Airtable with correct status options
✓ **Personal Account Integration**: Alex Mengel's account working with flexible phone number search (formatted and digits-only)
✓ **Volunteer Dashboard**: Added "My Shifts" dashboard tab showing assigned shifts with status indicators
✓ **Assignment Management**: Cancel shift assignments with confirmation dialog, updates status to "cancelled" in Airtable
✓ **Google Calendar Integration**: Add to Calendar button generates Google Calendar events with shift details
✓ **Authentication Required**: Home page shows read-only shifts, signup requires login through volunteer portal
✓ **Route Configuration**: Fixed volunteer portal routing from /volunteer-portal to /volunteer
✓ **Browse Shifts Tab**: Added authenticated shift browsing with signup status indicators
✓ **Signup Status Tracking**: Visual indicators show when volunteers are already registered for shifts
✓ **Assignment Creation Fixed**: Resolved Airtable field errors, assignments now sync successfully
✓ **Shift Name Population**: Fixed shift name display in assignments and "My Shifts" dashboard
✓ **Live Data Sync**: New shifts and activities added to Airtable automatically appear in volunteer portal
✓ **Assignment Records Working**: All volunteer signups successfully create records in V Shift Assignment table
✓ **Shift Name Display**: API correctly retrieves and displays shift names in volunteer portal
✓ **Airtable Field Linking Fixed**: V Shift Assignment "Shift ID" properly configured as linked field with array format
✓ **Complete Airtable Integration**: All users (Demo, Alex Mengel) successfully create assignments with shift names visible
✓ **Real Airtable Skills Integration**: Profile system now pulls actual volunteer skills/tags from existing Volunteer Applications table
✓ **Profile Updates for Real Users**: Profile management works for both demo volunteers and real Airtable volunteer records
✓ **Dynamic Skills Loading**: API endpoint extracts unique skills from 68 volunteer records including diverse specialties like "Chainsaw Operator", "GIS / Mapping", "Strategic Leadership", etc.
✓ **Airtable Profile Persistence**: Profile updates can sync back to Airtable fields when available (Bio, Emergency contacts, etc.)
✓ **Mobile-Optimized Tab Navigation**: Icon-based tabs with responsive design - vertical layout on mobile, horizontal on desktop
✓ **Enhanced Tab Interactions**: Added smooth hover effects with scale animation and color transitions for better UX
✓ **PII Protection**: Removed all personally identifiable information from login page - only demo account shown publicly
✓ **Volunteer Status Management**: Added account status options - "Active Volunteer", "Taking a Break", and secure "Remove My Data" functionality
✓ **Calendar Integration Complete**: Signed-up shifts now appear on volunteer availability calendar with real-time updates and visual status indicators
✓ **Host Integration Complete**: Successfully integrated Mutual Aid Partners (hosts) into shift displays with logo support
✓ **Airtable Host Mapping**: V Shifts now properly link to Mutual Aid Partners table with cached host data lookup
✓ **Host Visual Display**: Shift cards show host logos and names with fallback initial badges for partners without logos
✓ **Real Host Data**: Connected to 48+ mutual aid partners including FREEHOTMEALS.ORG, Impact LA Inc, WNCRR, Grassroots AID Partnership with actual logos
✓ **Host API Endpoint**: Added /api/mutual-aid-partners endpoint for accessing partner data with proper caching system
✓ **Duplicate Assignment Prevention**: Added backend validation to prevent multiple active assignments per volunteer per event with 409 error responses
✓ **Enhanced Error Handling**: Improved frontend error messages for duplicate signups with clear user guidance to "My Shifts" tab
✓ **Calendar Event Hover Effects**: Added smooth hover highlighting for calendar events with scale animation, brightness effects, and colored shadows for better visual feedback
✓ **Calendar Hover Tooltips**: Implemented detailed tooltips that appear on calendar event hover showing shift names, locations, times, status badges, and notes with professional styling
✓ **Evening Availability Workaround**: Added manual "Add Evening Hours (8-11 PM)" button to bypass React Big Calendar limitations with late evening time slot selection
✓ **Calendar Time Range Fixed**: Restored full day calendar view (6 AM - 11:59 PM) with proper 30-minute time slots for better usability
✓ **Full 24-Hour Calendar Grid**: Removed all min/max time constraints to display complete day from 12 AM to 11:59 PM with hourly intervals
✓ **Evening Time Selection Working**: Calendar allows selection of evening/night hours after 8 PM through direct click-and-drag on weekly/daily view  
✓ **6 AM Scroll Position**: Calendar automatically scrolls to 6 AM on load but shows full 24-hour grid for complete availability management
✓ **Complete Overnight Coverage**: Calendar grid displays full 24-hour cycle including early morning hours (1 AM, 2 AM, 3 AM, etc.) for night shift scheduling
✓ **6 AM Grid Start**: Calendar grid properly starts at 6 AM at the top and extends through to 5:59 AM for complete overnight shift coverage
✓ **FINAL CALENDAR SOLUTION**: Grid starts at 6 AM (first time slot) and displays complete 24-hour cycle through 5:59 AM next day with proper overnight coverage
✓ **Calendar Sync Foundation**: Implemented basic Google Calendar and Apple Calendar integration with .ics export functionality for confirmed volunteer shifts
✓ **Active Notification System**: Bell icon now functional with comprehensive notification settings dialog for volunteer preferences
✓ **User Profile Management**: JD profile dropdown with account access, volunteer portal navigation, and settings menu
✓ **Notification Badge Counter**: Visual unread notification indicator with red badge showing count
✓ **Notification Preferences**: Toggle controls for new shifts, reminders, updates, email, SMS, and push notifications
✓ **SMS Notification Placeholder**: Added SMS text message notification option with MessageSquare icon for future Twilio integration
✓ **User Authentication Display**: Dynamic user initials and profile information with professional dropdown interface
✓ **Volunteer Portal Notifications**: Added bell notification system to volunteer portal with badge counter and full settings dialog
✓ **Volunteer Portal User Menu**: Implemented user profile dropdown in volunteer portal with account settings, navigation, and logout
✓ **Consistent UX Across Platform**: Bell and user profile functionality now available in both home page and volunteer portal
✓ **Dynamic User Initials**: Profile avatars show actual volunteer initials extracted from their names
✓ **Notification Settings Enhanced**: Added Sparkles and Timer icons to notification preferences, removed "Shift Updates" option
✓ **Emergency Alerts Added**: Added AlertTriangle-icon emergency alerts for critical volunteer needs and urgent situations
✓ **Complete Icon Integration**: All 6 notification categories now have visual icons (Sparkles, Timer, AlertTriangle, Mail, MessageSquare, Smartphone)
✓ **Settings Icon Interface**: Changed bell icon to settings icon to clearly indicate notification preferences rather than active notifications
✓ **Streamlined Notification Categories**: Simplified to New Shifts, Shift Reminders, Emergency Alerts, Email, SMS, and Push notifications with visual icons
✓ **Updated Context Description**: Dialog descriptions now include emergency alerts alongside volunteer opportunities and shifts

## Future Enhancements (To Revisit)

**Calendar Sync Advanced Features**:
- Google Calendar API integration for automatic bi-directional sync
- Apple Calendar automated sync via CalDAV protocol
- Real-time availability sync from personal calendars to volunteer system
- Smart conflict detection between personal events and volunteer shifts
- Recurring volunteer shift patterns with calendar automation
- Bulk shift management and calendar coordination tools

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution
- **Production**: esbuild for bundling

### Database & ORM
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon Database)
- **Migrations**: Drizzle Kit for schema management
- **Storage Interface**: Abstracted storage layer with in-memory fallback

## Key Components

### Frontend Components
- **ShiftCard**: Displays volunteer shift information with status indicators
- **UI Components**: Comprehensive shadcn/ui component library including:
  - Form controls (inputs, selects, checkboxes)
  - Layout components (cards, dialogs, sheets)
  - Navigation (menus, tabs, breadcrumbs)
  - Data display (tables, charts, progress bars)

### Backend Components
- **Storage Layer**: Interface-based storage with pluggable implementations
- **Route Handler**: Centralized route registration system
- **Middleware**: Request logging and error handling
- **Development Tools**: Vite integration with HMR support

### Shared Components
- **Schema Definitions**: Drizzle schema with Zod validation
- **Type Safety**: Shared TypeScript types between frontend and backend

## Data Flow

1. **Client Requests**: Frontend makes API calls using fetch with credentials
2. **Server Processing**: Express routes handle API requests with centralized error handling
3. **Data Persistence**: Storage interface abstracts database operations
4. **State Management**: TanStack Query manages client-side caching and synchronization
5. **UI Updates**: React components re-render based on query state changes

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL integration
- **@tanstack/react-query**: Server state management and data fetching
- **@radix-ui/***: Headless UI component primitives
- **drizzle-orm**: Type-safe database ORM
- **wouter**: Lightweight React routing

### Data Integration
- **Airtable API**: Real-time volunteer shift data synchronization
- **Environment Variables**: VITE_AIRTABLE_TOKEN, VITE_BASE_ID

### Development Dependencies
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting
- **@replit/vite-plugin-cartographer**: Development tooling integration

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development
- **Hot Reload**: Vite dev server with Express middleware integration
- **TypeScript**: Real-time compilation with strict type checking
- **Environment**: NODE_ENV=development with enhanced debugging

### Production
- **Build Process**: 
  1. Vite builds optimized frontend bundle
  2. esbuild bundles server code for Node.js
  3. Static assets served from dist/public
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Process**: Single Node.js process serving both API and static files

### Database Management
- **Schema**: Managed through Drizzle migrations in ./migrations
- **Environment**: Requires DATABASE_URL for PostgreSQL connection
- **Development**: In-memory storage fallback for rapid prototyping

## Airtable Setup Instructions

To connect your volunteer management system to Airtable:

### 1. Authentication Setup
- **Get your Airtable Personal Access Token:**
  - Go to https://airtable.com/create/tokens
  - Create a new token with access to your base
  - Add the token to Replit Secrets as `AIRTABLE_TOKEN`

- **Find your Base ID:**
  - Open your Airtable base
  - Go to Help > API documentation
  - Your Base ID starts with "app" (e.g., appXXXXXXXXXXXXXX)
  - Add this to Replit Secrets as `VITE_BASE_ID`

### 2. Required Airtable Tables

#### Table 1: "V Shifts" (Already Working)
Your existing shifts table with these columns:
- `activityName` (Single line text)
- `dateTime` (Single line text)
- `location` (Single line text) 
- `volunteersNeeded` (Number)
- `volunteersSignedUp` (Number)
- `status` (Single select: active, urgent, remote, full)
- `category` (Single line text)
- `icon` (Single line text: utensils, users, book, gift, laptop, heart)

#### Table 2: "Volunteers" (New Table to Add)
Create this table with these exact field names:
- `Name` (Single line text) - Required
- `Phone` (Phone number) - Required, unique identifier
- `Email` (Email) - Optional
- `Is Driver` (Checkbox) - Whether volunteer can drive
- `Is Active` (Checkbox) - Whether volunteer is currently active
- `Airtable ID` (Formula: RECORD_ID()) - Auto-generated unique ID
- `Created Date` (Created time) - Auto-populated

#### Table 3: "Volunteer Availability" (New Table to Add)
Create this table with these exact field names:
- `Volunteer` (Link to Volunteers table) - Required
- `Start Time` (Date with time) - Required
- `End Time` (Date with time) - Required  
- `Is Recurring` (Checkbox) - Whether this is a recurring availability
- `Recurring Pattern` (Single select: Weekly, Bi-weekly, Monthly) - If recurring
- `Notes` (Long text) - Optional volunteer notes
- `Created Date` (Created time) - Auto-populated

#### Table 4: "Shift Assignments" (New Table to Add)
Create this table with these exact field names:
- `Volunteer` (Link to Volunteers table) - Required
- `Shift ID` (Link to V Shifts table) - Required, links to shift records
- `Shift Name` (Lookup from V Shifts via Shift ID link) - Auto-populated from linked V Shifts
- `Status` (Single select: confirmed, pending, cancelled) - Optional
- `Assigned Date` (Date with time) - Auto-populated 
- `Notes` (Long text) - Optional assignment notes

**Important**: The `Shift ID` field should be a **Link to V Shifts table**, not just text. This allows the `Shift Name` to be a lookup field that automatically shows the activity name.

### 3. Sample Data Setup

#### Add Sample Volunteers:
1. Demo Volunteer (Phone: 555-DEMO, Name: Demo User, Is Driver: Yes, Is Active: Yes)
2. Add 2-3 more test volunteers with different phone numbers

#### Add Sample Availability:
1. Create availability slots for your demo volunteer
2. Use current week dates with various time ranges
3. Mix regular and recurring patterns

### 4. Testing Your Setup
After creating these tables:
1. Use phone number "555-DEMO" to log into the volunteer portal
2. Test shift signup functionality
3. Check availability calendar management
4. Verify data sync between app and Airtable

The application will automatically fall back to sample data if Airtable credentials are not configured, ensuring the app works out of the box for development and testing.

The application follows a modern full-stack architecture with strong type safety, component-based UI design, and a clear separation between data access, business logic, and presentation layers.