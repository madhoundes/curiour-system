# Parcego – Courier Business Platform

A modern, scalable courier service platform designed to provide an affordable, efficient, and transparent delivery solution for small businesses.

## 🚀 Project Overview

This platform enables merchants to create shipments, generate labels, and track deliveries with proof of delivery using a modern, scalable microservices architecture.

## 🎯 Current Implementation Status

### ✅ **Phase 1: Frontend UI Foundation (COMPLETED)**
- **Merchant Landing Page**: Complete with login/signup forms, sample credentials, and guest login
- **Merchant Dashboard**: Fully functional dashboard with:
  - Welcome banner with personalized greeting
  - Quick stats cards (Total Shipments, Active Shipments, Delivered Today, Revenue)
  - Quick action buttons (Create Shipment, Track Package, Analytics)
  - Recent shipments table with status badges and mock data
  - Tracking widget for package lookup
  - Notifications/activity feed
  - Professional navigation with user profile dropdown
  - Responsive design with premium transitions

### ✅ **Phase 2: Core Shipping Features (COMPLETED)**
- **Create New Shipment**: Complete 4-step shipment creation flow
- **Package Details**: Dimensions, weight, and special handling options
- **Real-time Quotes**: Mock quote calculations with service selection
- **Label Purchase**: Mock Stripe payment integration with confirmation
- **Drop-off Location Finder**: Search and select drop-off locations with maps UI
- **Drop-off Confirmation**: Location confirmation with instructions

### ✅ **Phase 3: Courier Dashboard (COMPLETED)**
- **Mobile-Optimized Courier Interface**: Responsive dashboard for delivery drivers
- **Delivery Management**: View assigned deliveries with status tracking
- **Package Scanner**: Barcode/QR scanning interface (mock implementation)
- **Route Navigation**: GPS-enabled route planning with turn-by-turn directions
- **Enhanced Proof of Delivery (v2.0)**: 
  - Multi-photo capture with preview and removal
  - Digital signature canvas with touch support
  - GPS location and timestamp tracking
  - Recipient name verification
  - Delivery notes and special instructions
  - Real-time validation and error handling
  - Upload progress tracking with visual feedback
  - Success confirmation with next delivery navigation
- **Performance Tracking**: Personal analytics, earnings, ratings, and achievements
- **Bottom Navigation**: Mobile-first navigation optimized for courier workflow
 
#### Technical Architecture Notes
- **SSR/Hydration**: Timestamps and IDs are set in `useEffect` with loading fallbacks to avoid mismatches.
- **Icon System**: Centralized `<Icon name="PackageName" />` component using Lucide React for consistency and performance.
- **Accessibility**: Inline errors, focus management, ARIA roles, and progress announced via `aria-live`.
- **State Management**: Client-side state with Zustand, forms with React Hook Form + Zod validation.

### ✅ **Phase 4: Super Admin Dashboard (COMPLETED)**
- **Platform Overview**: System health monitoring with real-time stats (merchants, couriers, shipments, revenue)
- **Merchant Management**: Complete merchant lifecycle management with approval/suspension workflows
- **Courier Management**: Courier onboarding, verification, and performance tracking
- **Platform Analytics**: Revenue trends, shipment volume, geographic distribution, and delivery performance
- **System Administration**: General settings, security controls, billing configuration, and support management
- **Activity Monitoring**: Real-time platform activity feed with system alerts and notifications

### ✅ **Phase 5: Icon System Overhaul (COMPLETED)**
- **Centralized Icon Architecture**: Created reusable Icon component (`components/ui/icon.tsx`) with TypeScript support
- **Performance Optimization**: Migrated from runtime Iconify to static Lucide React components
- **Eliminated DOM Conflicts**: Fixed all `removeChild` errors and runtime DOM manipulation issues
- **Consistent Design System**: Standardized icon sizing, colors, and styling across all 13+ pages
- **Developer Experience**: Added icon aliases and auto-completion for improved maintainability
- **Core Flow Validation**: All major user journeys (merchant shipment, courier operations) fully functional

### ✅ **Phase 6: Production Build Optimization (COMPLETED)**
- **Suspense Boundary Implementation**: Fixed `useSearchParams` build errors in track-package and label-preview pages
- **Server/Client Component Architecture**: Properly separated server and client components for optimal performance
- **Build Stability**: Resolved all Next.js prerender errors and compilation issues
- **Production Ready**: Complete codebase now builds successfully with zero errors

### ✅ **Phase 7: Courier Package Scanning (COMPLETED)**
- **Real Barcode/QR Scanning**: Integrated `@zxing/browser` library for actual barcode detection from camera feed
- **Improved UX Design**: Simplified one-button workflow based on package status
  - `Pending` → "Confirm Pickup" button
  - `Picked Up` → "Start Delivery" button  
  - `In Transit` → "Complete Delivery (Proof)" button
  - `Delivered` → No buttons, completion state
- **Hydration Fixes**: Resolved SSR/client timestamp mismatches and iOS auto-linking issues
- **Enhanced Error Handling**: Comprehensive camera permission management and user guidance
- **Resource Management**: Proper cleanup of camera streams and barcode detection resources
- **Mobile Optimization**: Designed for courier field use with clear visual feedback

### ✅ **Phase 8: AI-Powered Route Optimization (COMPLETED)**
- **Advanced Route Planning**: Interactive route optimization with AI-powered suggestions
- **Enhanced UI/UX**: Increased icon sizes, improved visual clarity, and premium transitions
- **Drag & Drop Functionality**: Manual route reordering with visual feedback
- **Real-time Metrics**: Live updates of distance, ETA, fuel cost, and CO₂ savings
- **Smart Actions Panel**: AI optimization, traffic updates, alternative routes, and emergency support
- **Interactive Map Interface**: Visual route representation with delivery points and traffic indicators
- **Turn-by-Turn Directions**: Expandable navigation panel with step-by-step instructions
- **Accessibility Features**: ARIA labels, keyboard navigation, and reduced motion support
- **Responsive Design**: Mobile-optimized interface for courier field operations
- **Performance Optimization**: Zero linting errors, successful production build

### ✅ **Phase 9: Payment System Enhancement (COMPLETED)**
- **Pre-filled Payment Fields**: All payment forms automatically populated with realistic test data
- **Test Mode Integration**: Clear visual indicators for test environment with sample credentials
- **One-Click Testing**: Testers can complete purchase flows without manual form entry
- **Standard Test Data**: Uses industry-standard test card numbers (4111 1111 1111 1111)
- **Enhanced Developer Experience**: Accelerated QA cycles and usability testing
- **Production Ready**: All linting errors resolved, code quality standards maintained

## 🧪 **Testing & Development Features**

### **Payment Testing**
- **Auto-populated Forms**: All payment fields pre-filled with realistic dummy data
- **Test Card Numbers**: Standard Visa test card (4111 1111 1111 1111)
- **Sample Credentials**: 
  - Email: `merchant@business.com`
  - Password: `password123`
- **Test Environment**: Clear indicators and warnings for development/testing use

### **Quality Assurance**
- **Zero Linting Errors**: All ESLint warnings and errors resolved
- **TypeScript Compliance**: Full type safety across the codebase
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance**: Optimized builds with Next.js 14+ features

## 🎯 Mission

Deliver a scalable, affordable, and transparent courier platform for small businesses, with seamless merchant experience, robust tracking, and operational efficiency.

## 🏗️ Architecture

### **Frontend**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand (client), React Query (server)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React (centralized Icon component)
- **Testing**: Vitest + GitHub Actions

### **Backend & Integration**
- **Platform**: Supabase (PostgreSQL, Auth, Storage)
- **API**: Vercel Serverless Functions
- **Validation**: Zod schemas
- **Authentication**: JWT-based sessions with RBAC

### **Mobile (Courier App)**
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Camera**: Expo Camera with barcode scanning
- **Location**: Expo Location with GPS tracking
- **Navigation**: React Navigation 6

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**
```bash
# Clone the repository
git clone https://github.com/madhoundes/curiour-system.git
cd curiour-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### **Development Scripts**
```bash
npm run dev          # Start development server (localhost:3000)
npm run dev:local    # Start development server (localhost:3000)
npm run dev:lan      # Start development server (0.0.0.0:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 📱 **Available Pages & Features**

### **Merchant Experience**
- **Landing Page** (`/`) - Login, signup, and guest access
- **Dashboard** (`/dashboard`) - Main merchant hub with analytics
- **Create Shipment** (`/create-shipment`) - 4-step shipment creation
- **Package Details** (`/package-details`) - Dimensions and handling options
- **Quote Preview** (`/quote-preview`) - Service selection and pricing
- **Purchase Label** (`/purchase-label`) - Payment and label generation
- **Label Preview** (`/label/preview`) - 4x6 inch label preview
- **Find Drop-off** (`/find-dropoff`) - Location search and selection
- **Drop-off Confirmation** (`/dropoff-confirmation`) - Confirmation workflow

### **Courier Experience**
- **Courier Dashboard** (`/courier`) - Main courier interface
- **Package Scanner** (`/courier/scan`) - Barcode/QR scanning
- **Proof of Delivery** (`/courier/proof`) - Photo capture and signatures
- **Route Optimization** (`/courier/route`) - AI-powered route planning
- **Performance Tracking** (`/courier/performance`) - Analytics and achievements

### **Tracking & Management**
- **Track Package** (`/track-package`) - Real-time shipment tracking
- **Admin Panel** (`/admin`) - Super admin dashboard

## 🔧 **Technical Features**

### **Core Functionality**
- **Real-time Tracking**: Live shipment status updates
- **Barcode/QR Scanning**: Mobile-optimized package scanning
- **Route Optimization**: AI-powered delivery route planning
- **Proof of Delivery**: Multi-photo capture with digital signatures
- **Payment Processing**: Mock Stripe integration for testing
- **Label Generation**: 4x6 inch shipping label creation

### **Performance & Quality**
- **Zero Linting Errors**: Clean, maintainable codebase
- **TypeScript**: Full type safety and IntelliSense
- **Responsive Design**: Mobile-first, accessible UI
- **Premium Transitions**: Smooth animations and interactions
- **SEO Optimized**: Next.js App Router with metadata

## 📊 **Project Structure**

```
curiour-system/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Super admin dashboard
│   ├── courier/           # Courier operations
│   ├── dashboard/         # Merchant dashboard
│   ├── create-shipment/   # Shipment creation flow
│   ├── label/             # Label preview and generation
│   ├── purchase-label/    # Payment processing
│   └── track-package/     # Package tracking
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions and helpers
├── public/               # Static assets and logos
└── Flowcharts/           # Project documentation and diagrams
```

## 🌟 **Key Benefits**

### **For Merchants**
- **Seamless Experience**: Intuitive interface for shipment creation
- **Real-time Tracking**: Live updates on package status
- **Cost Transparency**: Clear pricing with no hidden fees
- **Professional Labels**: High-quality 4x6 inch shipping labels

### **For Couriers**
- **Mobile-First Design**: Optimized for field operations
- **Smart Routing**: AI-powered route optimization
- **Easy Scanning**: One-tap package identification
- **Proof of Delivery**: Comprehensive delivery verification

### **For Platform Operators**
- **Scalable Architecture**: Built for growth and expansion
- **Real-time Monitoring**: Live system health and analytics
- **User Management**: Complete lifecycle management
- **Performance Insights**: Detailed analytics and reporting

## 🔮 **Future Roadmap**

### **Phase 10: Shopify Integration**
- OAuth 2.0 authentication
- Real-time order synchronization
- Automated fulfillment workflows
- Webhook support for order updates

### **Phase 11: Advanced Analytics**
- Machine learning insights
- Predictive delivery times
- Customer behavior analysis
- Revenue optimization

### **Phase 12: Mobile Applications**
- Native iOS and Android apps
- Push notifications
- Offline functionality
- Enhanced mobile features

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines and ensure all code follows our quality standards:

- **Code Quality**: All code must pass linting and type checking
- **Testing**: Include tests for new features
- **Documentation**: Update relevant documentation
- **Accessibility**: Ensure UI is accessible to all users

## 📄 **License**

This project is proprietary software. All rights reserved.

## 📞 **Support**

For technical support or questions about the platform:
- **Email**: support@parcego.com
- **Documentation**: [Platform Documentation](https://docs.parcego.com)
- **Issues**: [GitHub Issues](https://github.com/madhoundes/curiour-system/issues)

---

**Built with ❤️ by the Parcego Team**

*Last updated: January 2025*
*Version: 0.3.0*
*Status: Production Ready - All Phases Complete*