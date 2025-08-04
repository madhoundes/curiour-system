# Ashraf Project – Courier Business Platform

A modern, scalable courier service platform designed to provide an affordable, efficient, and transparent delivery solution for small businesses.

## 🚀 Project Overview

This platform enables merchants to create shipments, generate labels, and track deliveries with proof of delivery using a modern, scalable microservices architecture.

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   STRIPE_SECRET_KEY=your_stripe_secret
   
   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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

## 🗺 Roadmap

- [ ] Enhanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced route optimization
- [ ] Integration with more e-commerce platforms
- [ ] White-label solutions

---

**Built with ❤️ by the Ashraf Project Team**