# Ovento - Next-Generation Event Management Platform

## Overview

Ovento is a revolutionary event management platform that surpasses existing solutions like Unstop and Devfolio by offering superior UI/UX, advanced features, and seamless integration for organizers, participants, and sponsors. The platform prioritizes intuitive navigation, AI-driven personalization, and immersive experiences to enhance engagement in hackathons, conferences, webinars, and competitions.

The application is built as a full-stack TypeScript solution with a React frontend and Express.js backend, emphasizing modern development practices, real-time features, and scalable design patterns. The platform is designed to run in both production and prototype modes, with fallback systems when external services are unavailable.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library providing a modern, consistent design system with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing, keeping the bundle size minimal
- **State Management**: TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui, ensuring accessibility and consistent behavior
- **Real-time Communication**: Custom WebSocket integration for live chat, notifications, and collaborative features
- **3D Graphics**: Three.js integration for immersive virtual environments and interactive backgrounds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules for modern JavaScript features
- **Language**: TypeScript with strict typing for enhanced code quality and developer experience
- **Authentication**: Dual-mode system supporting both Replit Auth with OpenID Connect and mock authentication for prototype mode
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple, falling back to memory store in prototype mode
- **API Design**: RESTful endpoints with comprehensive WebSocket support for real-time features like chat and live updates
- **File Upload**: Multer middleware with configurable limits (10MB) and type validation for secure file handling
- **Configuration System**: Centralized config management with feature flags and prototype mode detection

### Database Layer
- **Database**: PostgreSQL with Neon serverless hosting for production, with in-memory fallback for prototype mode
- **ORM**: Drizzle ORM providing type-safe schema definitions and query building
- **Migration Strategy**: Drizzle Kit for schema management, migrations, and database introspection
- **Connection Management**: Neon serverless connection pooling for efficient resource utilization
- **Schema Design**: Comprehensive tables for users, events, teams, registrations, chat messages, analytics, and notifications

### AI Integration
- **Provider**: OpenAI GPT API integration with hardcoded fallbacks in prototype mode
- **Use Cases**: Event recommendations based on user profiles, team matching algorithms, sentiment analysis of feedback, and image analysis
- **Implementation**: Dedicated service layer with proper error handling and structured JSON responses
- **Features**: Personalized event suggestions, skill-based team formation, and AI-powered content analysis

### Payment Processing
- **Primary**: Stripe integration with React Stripe.js components for secure payment handling
- **Fallback**: Comprehensive prototype mode with mock payment flows when Stripe keys are unavailable
- **Features**: Event registration fees, subscription management, sponsorship processing, and revenue tracking
- **Security**: PCI-compliant payment forms with client-side validation and server-side processing

### Real-time Features
- **WebSocket Server**: Native WebSocket implementation using ws library for scalable real-time communication
- **Message Types**: Support for chat messages, typing indicators, system notifications, and live event updates
- **Connection Management**: Automatic reconnection logic with user presence tracking and connection state management
- **Chat System**: Multi-room chat support with event-specific channels, direct messaging, and team collaboration spaces

### Virtual Environment System
- **3D Rendering**: Three.js-based virtual spaces for immersive event experiences
- **Video Integration**: WebRTC support for video conferencing and screen sharing capabilities
- **Interactive Elements**: Virtual whiteboards, polls, and gamification features like leaderboards and badges
- **Accessibility**: Progressive enhancement ensuring functionality without advanced 3D capabilities

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL hosting for production database with automatic scaling and connection pooling
- **In-Memory Storage**: Custom fallback implementation for prototype mode when database is unavailable

### Authentication Services
- **Replit OIDC**: OpenID Connect integration for production authentication with automatic user provisioning
- **Mock Authentication**: Hardcoded user system for prototype mode with session management

### Payment Processing
- **Stripe**: Complete payment infrastructure including payment intents, customer management, and subscription handling
- **Prototype Payments**: Mock payment flows simulating successful transactions for development and testing

### AI Services
- **OpenAI API**: GPT model integration for advanced AI features with structured prompting and response parsing
- **Fallback AI**: Hardcoded intelligent responses for all AI features when API is unavailable

### Email Services
- **SendGrid**: Transactional email delivery for registration confirmations, notifications, and marketing communications
- **Email Simulation**: Console-logged email simulation for prototype mode with full template support

### Cloud Storage
- **File Upload**: Local file handling with Multer middleware supporting images, documents, and media files
- **Asset Management**: Static file serving through Express with proper MIME type handling and security headers

### Development Tools
- **Vite**: Modern build tool with hot module replacement, optimized bundling, and development server
- **TypeScript**: Full-stack type safety with shared schema definitions and strict configuration
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration and responsive design patterns