# Volunteer Management Platform

## Overview

This is a full-stack volunteer management application built with React/TypeScript frontend and Express.js backend. The platform manages volunteer shifts and activities with Airtable integration for real-time data synchronization. Features include shift browsing, filtering, search functionality, and volunteer signup tracking.

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

To connect your volunteer shift data from Airtable:

1. **Get your Airtable Personal Access Token:**
   - Go to https://airtable.com/create/tokens
   - Create a new token with access to your base
   - Add the token to Replit Secrets as `AIRTABLE_TOKEN`

2. **Find your Base ID:**
   - Open your Airtable base
   - Go to Help > API documentation
   - Your Base ID starts with "app" (e.g., appXXXXXXXXXXXXXX)
   - Add this to Replit Secrets as `VITE_BASE_ID`

3. **Required Airtable Table Structure:**
   Your "Shifts" table should have these columns:
   - `activityName` (Single line text)
   - `dateTime` (Single line text)
   - `location` (Single line text) 
   - `volunteersNeeded` (Number)
   - `volunteersSignedUp` (Number)
   - `status` (Single select: active, urgent, remote, full)
   - `category` (Single line text)
   - `icon` (Single line text: utensils, users, book, gift, laptop, heart)

The application will automatically fall back to sample data if Airtable credentials are not configured, ensuring the app works out of the box for development and testing.

The application follows a modern full-stack architecture with strong type safety, component-based UI design, and a clear separation between data access, business logic, and presentation layers.