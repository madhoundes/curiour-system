# Ashraf Project – Courier Business Platform

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

### 📋 **Phase 3: Advanced Features (PLANNED)**
- Analytics and reporting dashboard
- Admin panel and user management
- Mobile courier app
- Payment integration
- API development

### 🎯 Mission
Deliver a scalable, affordable, and transparent courier platform for small businesses, with seamless merchant experience, robust tracking, and operational efficiency.

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
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
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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
- **Navigation**: Seamless routing between all pages
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

### 🚧 **Phase 3: Tracking & Delivery (NEXT)**
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

### 🚀 **Phase 4: Integrations & Scale**
- [ ] Shopify integration and OAuth
- [ ] Multi-language support
- [ ] Advanced route optimization
- [ ] Integration with more e-commerce platforms
- [ ] White-label solutions

## 🎯 **Current Branch: `drop-off-system`**
This branch contains the complete implementation of Phases 1 & 2, including:
- Complete merchant authentication and dashboard
- Full shipment creation workflow (4 pages)
- Drop-off location finder with confirmation
- All frontend UI components with premium design

### 🌳 **Branch Structure:**
- **`main`**: Production-ready releases
- **`merchant-dashboard`**: Phase 1 - Dashboard and authentication
- **`create-shipment`**: Phase 2a - Shipment creation flow
- **`drop-off-system`**: Phase 2b - Drop-off location finder (current)

---

**Built with ❤️ by the Ashraf Project Team**