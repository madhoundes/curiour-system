# Parcego Courier Platform

A modern, scalable courier business platform built with Next.js 15+, React 19, TypeScript, and Tailwind CSS. Complete with merchant dashboard, courier management, real-time tracking, billing system, notifications center, and comprehensive support documentation.

## 🚀 Features

### Core Platform
- **Merchant Dashboard**: Complete shipment management and analytics
- **Courier App**: Mobile-optimized delivery management with scan functionality
- **Real-time Tracking**: Live shipment status updates with timeline view
- **Analytics & Reporting**: Comprehensive business insights with charts
- **Admin Panel**: Platform management and oversight
- **Billing System**: Complete payment management with multiple payment methods
- **Notifications Center**: Centralized notification management system
- **Support & Help**: Comprehensive help center with FAQs and tutorials
- **Insurance Claims System**: Multi-step claims filing with document upload and status tracking

### Enhanced Payment System
- **Smart Payment Modal**: Pre-filled with realistic test data for rapid development
- **Mock Data Integration**: All payment forms come with sample data (credit cards, ACH, PayPal)
- **Frontend State Management**: Temporary storage for testing without backend setup
- **Easy Reset Functionality**: One-click restore to default test values
- **Clear Test Indicators**: Visual warnings and labels to prevent confusion
- **React Hook Form**: Advanced form validation and state management

#### Payment Method Testing Features
- **Credit Card**: Pre-filled with Stripe test card `4242 4242 4242 4242`
- **ACH/Bank**: Sample routing and account numbers for testing
- **PayPal**: Test email address for development
- **Form Validation**: Real-time validation with helpful error messages
- **State Persistence**: Form data maintained during payment method type switching

## 🛠️ Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand, React Query
- **Icons**: Lucide React with centralized icon system and fallback handling
- **Charts**: Recharts for analytics and data visualization
- **Build Tool**: Next.js with TypeScript compilation
- **Development**: Hot reload, error boundaries, comprehensive debugging

## 📱 Development Scripts

```bash
# Local development (localhost:3000)
npm run dev:local

# Network development (0.0.0.0:3000)
npm run dev:lan

# Production build
npm run build

# Start production server
npm start
```

## 🛡️ Insurance Claims System

The platform includes a comprehensive insurance claims management system:

### Claims Filing Process
1. **Multi-step Form**: Guided 5-step process for easy claim submission
2. **Document Upload**: Support for multiple file types (PDF, images, documents)
3. **Insurance Coverage**: Clear display of coverage options and limits
4. **Real-time Validation**: Form validation with helpful error messages
5. **Claim Summary**: Final review before submission

### Claims Management Features
- **Claims History**: Track all submitted claims with status updates
- **Status Tracking**: Real-time updates on claim processing
- **Search & Filtering**: Find claims by ID, shipment number, or status
- **Document Management**: Upload and manage supporting documents
- **Processing Timeline**: Clear expectations for claim resolution

### Insurance Coverage Options
- **Basic Coverage**: Standard protection ($500 max, $50 deductible)
- **Premium Coverage**: Comprehensive protection ($2,500 max, $25 deductible)
- **Express Coverage**: High-value protection ($10,000 max, no deductible)

### Quick Access
- Dashboard quick action button for filing claims
- Top navigation link for easy access
- Direct routing from shipment tracking pages
- Integration with notification system for updates

## 🔧 Payment Modal Development

The payment method modal is designed for rapid development and testing:

### Quick Start Testing
1. Navigate to `/billing` → "Payment Methods" tab
2. Click "Add Payment Method"
3. All fields are pre-filled with realistic test data
4. Switch between payment types (Card/ACH/PayPal) to see different mock data
5. Use "Reset to Mock Data" button to restore defaults
6. Form validation works in real-time with helpful error messages

### Mock Data Structure
```typescript
const mockPaymentData = {
  card: {
    cardNumber: '4242 4242 4242 4242',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123',
    cardholderName: 'John Doe (Test)'
  },
  ach: {
    routingNumber: '110000000',
    accountNumber: '000123456789',
    accountType: 'checking'
  },
  paypal: {
    email: 'test@example.com'
  }
}
```

### Frontend State Management
- All payment methods are stored in temporary frontend state
- No backend or database setup required
- Data persists during the session for testing
- Easy to extend with additional payment methods

## 🎨 UI Components

Built with shadcn/ui for consistency and accessibility:
- **Form Controls**: Input, Select, Button with proper validation states
- **Layout**: Card, Dialog, Tabs for organized content structure
- **Feedback**: Badge, Alert for status and notifications
- **Navigation**: Breadcrumbs, pagination for complex workflows

## 🔒 Security & Testing

- **Test Mode Indicators**: Clear visual cues for development data
- **Form Validation**: Client-side validation with React Hook Form
- **Mock Data Safety**: All test data clearly marked and isolated
- **No Production Risk**: Frontend-only storage prevents accidental production use

## 📚 Documentation

- **Component Library**: Comprehensive shadcn/ui integration
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Optimized rendering with React best practices

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/madhoundes/curiour-system.git
   cd curiour-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev:local
   ```

4. **Explore the platform**
   - **Main Dashboard**: Navigate to `/dashboard` for merchant overview
   - **Create Shipment**: Use `/create-shipment` to test shipment creation flow
   - **Track Package**: Visit `/track-package` for real-time tracking demo
   - **Billing System**: Go to `/billing` to test payment management
   - **Notifications**: Check `/notifications` for notification center
   - **Support Center**: Visit `/support` for comprehensive help system
   - **Analytics**: View `/analytics` for business insights dashboard

## 🔧 Quick Fixes Applied

### Icon System Enhancement
- **Problem**: White screen issue caused by missing icon names in lucide-react
- **Solution**: Enhanced Icon component with comprehensive fallback system
- **Result**: Robust icon rendering that prevents application crashes

### Code Quality
- **ESLint**: Fixed all critical linting errors (unescaped entities, unused variables)
- **TypeScript**: Resolved type safety issues and any-type usage
- **Accessibility**: Proper ARIA labels and semantic HTML structure

## 🤝 Contributing

- Follow TypeScript best practices
- Use React Hook Form for all form implementations
- Maintain accessibility standards
- Test with mock data before backend integration
- Follow the established component patterns

## 📄 License

This project is proprietary software for the Ashraf Courier Business Platform.