# Volunteer Management Platform

## Overview

This is a full-stack volunteer management application built with React/TypeScript frontend and Express.js backend. The platform appears to be designed for managing volunteer shifts and activities, with a focus on community service coordination.

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
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **drizzle-orm**: Type-safe database ORM
- **wouter**: Lightweight React routing

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

The application follows a modern full-stack architecture with strong type safety, component-based UI design, and a clear separation between data access, business logic, and presentation layers.