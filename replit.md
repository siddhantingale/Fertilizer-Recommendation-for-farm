# FertilizerPro - Sustainable Fertilizer Usage Platform

## Overview

FertilizerPro is a comprehensive agricultural platform that helps farmers achieve higher crop yields through sustainable fertilizer usage. The platform provides OTP-based authentication, farm management, soil analysis tracking, and an intelligent NPK calculator that suggests appropriate fertilizers based on land characteristics including soil type, pH levels, crop type, and organic matter content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for login, home, farms, farm details, and NPK calculator
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom styling using shadcn/ui component library
- **Styling**: Tailwind CSS with green/agricultural theme, responsive mobile-first design
- **Authentication**: OTP-based phone verification with localStorage session management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with endpoints for authentication, users, farms, soil tests, recommendations, and NPK calculations
- **Storage Layer**: Database storage implementation using PostgreSQL with comprehensive CRUD operations
- **Development**: tsx for TypeScript execution in development, esbuild for production builds
- **OTP System**: Phone-based verification with 6-digit codes and expiration handling

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL configured via Neon serverless connection
- **Schema**: Comprehensive schema with tables for users, farms, soil tests, fertilizer recommendations, and usage tracking
- **Migrations**: Drizzle-kit for database schema migrations and management

### Authentication and Authorization
- **OTP Authentication**: Phone number-based verification with 6-digit codes
- **Session Management**: localStorage-based user session storage
- **User Management**: Complete user registration and profile management system

### External Service Integrations
- **Database Hosting**: Neon serverless PostgreSQL
- **Development Tools**: Replit-specific plugins for development environment
- **SMS Integration**: OTP delivery system (development mode shows OTP in response)
- **Fertilizer Database**: Built-in fertilizer recommendation engine with NPK calculations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Zod integration for schema validation
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **express**: Node.js web framework

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe styling variants
- **clsx**: Utility for constructing className strings

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Form and Validation
- **react-hook-form**: Performance-focused form library
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation

### Additional Utilities
- **date-fns**: Modern date utility library
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel component for React

## Recent Changes (December 2024)

### Major Platform Pivot Completed
- **Complete transformation** from ArtisanFind (art classes) to FertilizerPro (agricultural platform)
- **Database schema redesigned** with tables for users, farms, soil tests, and fertilizer recommendations
- **New authentication system** implemented with OTP-based phone verification
- **NPK calculator engine** built with comprehensive fertilizer recommendation algorithms
- **All frontend pages rebuilt** for agricultural use case with green/sustainable design theme
- **API endpoints restructured** for farm management, soil testing, and fertilizer calculations

### Technical Implementation
- **PostgreSQL database** successfully deployed and operational
- **Complete frontend rebuild** with 5 main pages: Login, Home, Farms, Farm Detail, Calculator
- **Responsive design** with mobile-first approach and agricultural color scheme
- **Real fertilizer database** with organic and synthetic options, sustainability scoring
- **Advanced NPK calculations** based on crop types, soil conditions, and application timing