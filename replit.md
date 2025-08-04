# Overview

This is a full-stack lamb portion calculator web application built with Express.js backend and React frontend. The application helps users calculate the appropriate amount of lamb needed for different group sizes and hunger levels, providing detailed cut recommendations and serving suggestions. It features a modern UI built with shadcn/ui components and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with minimal overhead
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation resolvers
- **Animations**: Framer Motion for smooth UI transitions

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Build System**: esbuild for production bundling, tsx for development
- **API Design**: RESTful endpoints with `/api` prefix
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **ORM**: Drizzle with PostgreSQL dialect for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL connection
- **Development Storage**: In-memory storage implementation for development/testing
- **Migrations**: Drizzle Kit for database schema migrations

## Database Schema
- **Users Table**: Basic user authentication with username/password
- **Lamb Calculations Table**: Stores calculation history with people count, hunger level, total weight, and JSON recommendations
- **Schema Validation**: Drizzle-Zod integration for runtime type checking

## Authentication and Authorization
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Storage Interface**: Abstracted storage layer supporting both memory and database implementations
- **User Management**: Basic user creation and retrieval functionality

## External Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Development**: Replit-specific plugins for development environment integration
- **Build Tools**: Vite for frontend bundling, esbuild for backend production builds
- **Date Handling**: date-fns for date manipulation utilities