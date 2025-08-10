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

### 🎯 Mission
Deliver a scalable, affordable, and transparent courier platform for small businesses, with seamless merchant experience, robust tracking, and operational efficiency.

### 🚚 **Current Implementation Status**
**Platform Coverage:**
- ✅ **Merchant Experience**: Complete shipment creation and management
- ✅ **Courier Experience**: Full delivery workflow with mobile optimization + AI route optimization
- ✅ **Super Admin Experience**: Complete platform management and monitoring
- 🔄 **Real-time Integration**: Live updates between all user types (ready for backend)

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Centralized Lucide React component system
- **State Management**: Zustand (client), React Query (server)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Maps**: Google Maps JavaScript API
- **PDFs**: React-PDF
- **Testing**: Vitest + GitHub Actions
- **Hosting**: Vercel

### Backend & Authentication
- **Platform**: Supabase (PostgreSQL, Auth, Storage)
- **API**: Vercel Serverless Functions / Node.js 20+ (Express.js)
- **API Documentation**: OpenAPI 3.0 (Swagger UI)
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit + Redis
- **CORS**: Secure configuration

### Barcode Scanning
- **Library**: @zxing/browser for WebAssembly-based barcode detection
- **Formats**: QR codes, Code 128, Code 39, EAN-13, UPC-A, and more
- **Camera**: Rear-facing camera preference with permission handling
- **Fallback**: Manual tracking number input for accessibility

### Mobile (Courier App)
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Camera**: Expo Camera
- **Location**: Expo Location
- **Barcode**: Expo Barcode Scanner
- **Push Notifications**: Expo Notifications

### Integrations
- **Payments**: Stripe
- **Shopify**: OAuth 2.0, webhooks, real-time sync

## 🔧 Key Features

### Core Functionality
- **User Authentication**: Secure login, email verification, optional 2FA, RBAC
- **Shipment Management**: Create shipments, real-time quotes, PDF label generation
- **Shopify Integration**: OAuth, real-time order sync, direct fulfillment
- **Drop-off & Tracking**: Interactive maps, multi-state tracking, GPS tracking
- **Proof of Delivery**: Mobile photo capture, GPS/timestamp, digital signatures
- **Analytics & Reporting**: Merchant dashboard, admin analytics, custom reports

### User Roles
- **Merchant**: Create shipments, track packages, view analytics
- **Courier**: Manage assignments, update routes, capture delivery proof
- **Admin**: Platform oversight, user management
- **Super Admin**: Complete system access and management

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/madhoundes/curiour-system.git
   cd curiour-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   # Local machine only
   npm run dev:local

   # Or expose on your LAN (other devices can open it)
   npm run dev:lan

   # Classic default
   npm run dev
   ```

4. **Open your browser**
   - Local: [http://localhost:3000](http://localhost:3000)
   - Network (LAN): use your machine IP with port 3000 (e.g., http://192.168.1.10:3000)

### 🎮 **Demo Credentials**
For testing the current implementation, use these sample credentials:
- **Email**: `merchant@business.com`
- **Password**: `password123`
- **Or click**: "Guest Login" for instant access

### 🎯 **Current Features Available**
- **Landing Page**: Complete authentication UI with multiple login options
- **Dashboard**: Fully functional merchant dashboard with mock data and quick actions
- **Complete Shipment Flow**: End-to-end shipment creation (4 pages)
  - Create shipment with sender/recipient details
  - Package specifications with special handling
  - Real-time quote preview with service selection
  - Mock payment processing with order confirmation
- **Drop-off Location Finder**: Search, filter, and select drop-off locations
- **Drop-off Confirmation**: Confirm location with detailed instructions
- **Courier Dashboard**: Mobile-optimized interface for delivery drivers
  - Delivery assignment management with priority sorting
  - Package scanning interface (barcode/QR mock)
  - Route navigation with GPS integration placeholder
  - Proof of delivery with photo capture and digital signatures
  - Performance tracking with earnings, ratings, and achievements
  - Bottom navigation optimized for mobile workflow
- **Super Admin Dashboard**: Complete platform management and monitoring
  - Platform overview with system health and key metrics
  - Merchant management with approval workflows and status tracking
  - Courier management with verification and performance monitoring
  - Analytics section with revenue trends and delivery performance charts
  - Platform settings for security, billing, and operational configuration
  - Real-time activity feed with system alerts and notifications
- **Navigation**: Seamless routing between all pages and user roles
- **Responsive Design**: Works on all device sizes with mobile optimization
- **Premium UI**: Modern design with subtle animations and transitions
- **Accessibility**: Full keyboard navigation and screen reader support

### 🔧 **Environment Setup (Optional for Phase 1)**
```bash
cp .env.example .env.local
```

Add your environment variables (for future phases):
```env
# Supabase (for backend integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Google Maps (for location services)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run dev:local    # Start on localhost:3000 only
npm run dev:lan      # Start on 0.0.0.0:3000 (LAN-accessible)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
```

## 🏗 Project Structure

```
curiour-system/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── custom/            # Custom components
├── lib/                   # Utility functions
├── public/                # Static assets
├── .cursor/              # Cursor AI rules
└── docs/                 # Documentation
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible components.

### Adding Components
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

## 🔒 Security & Best Practices

- **OWASP Top 10** compliance
- **PCI DSS** standards for payments
- **RBAC** (Role-Based Access Control)
- **JWT** secure sessions
- **Environment variables** for secrets
- **Input validation** with Zod
- **Rate limiting** and CORS protection

## 📱 Mobile Development

The courier mobile app is built with React Native (Expo):

```bash
cd mobile-app
npx expo start
```

## 🧪 Testing

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm run start
```

## 📊 Monitoring & Analytics

- **Performance**: Web Vitals tracking
- **Errors**: Sentry integration
- **Analytics**: Custom dashboard with Recharts
- **Logs**: Structured logging with Winston

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ashrafproject.com or join our Slack channel.

## 🗺 Development Roadmap

### ✅ **Phase 1: Frontend UI Foundation (COMPLETED)**
- [x] Merchant landing page with authentication UI
- [x] Merchant dashboard with analytics preview
- [x] Navigation and routing system
- [x] Responsive design and accessibility
- [x] Premium transitions and animations
- [x] Mock data integration

### ✅ **Phase 2: Core Shipping Features (COMPLETED)**
- [x] Create new shipment form with sender/recipient details
- [x] Package details and dimensions entry with special handling
- [x] Real-time shipping quote generation with service selection
- [x] Mock PDF label generation and printing functionality
- [x] Drop-off location finder with search, filters, and maps UI
- [x] Drop-off confirmation with detailed instructions

### 🚧 **Phase 5: Tracking & Delivery (NEXT)**
- [ ] Package tracking system with real-time updates
- [ ] Courier barcode scanning interface
- [ ] Photo proof of delivery capture
- [ ] AI route optimization for couriers
- [ ] SMS/Email notification system

### 📋 **Phase 4: Advanced Features**
- [ ] Enhanced analytics dashboard with charts
- [ ] Admin panel and user management
- [ ] Mobile courier app (React Native)
- [ ] Payment processing integration
- [ ] Email notifications system

### 🚀 **Phase 6: Integrations & Scale**
- [ ] Shopify integration and OAuth
- [ ] Multi-language support
- [ ] Advanced route optimization
- [ ] Integration with more e-commerce platforms
- [ ] White-label solutions

## 🎯 **Current Branch: `Courier-Package-scan`**
This branch contains the latest courier scanning improvements with real barcode detection, simplified UX, and hydration fixes for production deployment.

### 🌳 **Branch Structure:**
- **`main`**: Production-ready releases
- **`merchant-dashboard`**: Phase 1 - Dashboard and authentication
- **`create-shipment`**: Phase 2a - Shipment creation flow
- **`drop-off-system`**: Phase 2b - Drop-off location finder
- **`courier-dashboard`**: Phase 3 - Courier app UI
- **`super-admin-dashboard`**: Phase 4 - Super Admin UI
- **`Proof-of-Delivery`**: Proof of Delivery fixes and improvements
- **`Courier-Package-scan`**: Real barcode scanning and UX improvements (current)

---

**Built with ❤️ by the Ashraf Project Team**