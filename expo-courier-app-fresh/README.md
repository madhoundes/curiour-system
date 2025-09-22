# Parcego Courier - Native Mobile App

A native mobile application built with Expo and React Native, providing couriers with a seamless delivery management experience.

## 🚀 Features

### 📱 Native Mobile Experience
- **Bottom Tab Navigation** - Native iOS/Android tab bar with smooth transitions
- **Haptic Feedback** - Tactile feedback for all interactions (iOS)
- **Safe Area Support** - Proper handling of notched devices and status bars
- **Platform-Specific Styling** - Optimized for both iOS and Android

### 🎯 Core Functionality
- **Dashboard Overview** - Real-time performance metrics and quick actions
- **Delivery Management** - Complete delivery workflow with status tracking
- **Performance Analytics** - Detailed performance metrics and achievements
- **Profile Management** - Personal information, vehicle details, and documents

### 🎨 UI/UX Features
- **Modern Design** - Clean, professional interface following mobile design patterns
- **Smooth Animations** - Native transitions and micro-interactions
- **Touch-Optimized** - Proper touch targets and gesture handling
- **Accessibility** - Screen reader support and keyboard navigation

## 📋 Prerequisites

Before running this app, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go app** on your mobile device (for testing)

## 🛠️ Installation & Setup

### 1. Clone and Navigate
```bash
cd expo-courier-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start the Development Server
```bash
npm start
# or
yarn start
```

### 4. Run on Device/Simulator

#### iOS Simulator
```bash
npm run ios
# or
yarn ios
```

#### Android Emulator
```bash
npm run android
# or
yarn android
```

#### Physical Device
1. Install **Expo Go** from App Store/Play Store
2. Scan the QR code displayed in your terminal
3. The app will load on your device

## 📱 App Structure

```
expo-courier-app/
├── app/
│   ├── (tabs)/           # Tab navigation screens
│   │   ├── index.tsx     # Dashboard/Overview
│   │   ├── deliveries.tsx # Delivery management
│   │   ├── performance.tsx # Analytics & metrics
│   │   ├── profile.tsx   # User profile & settings
│   │   └── _layout.tsx   # Tab layout configuration
│   ├── login.tsx         # Authentication screen
│   └── _layout.tsx       # Root layout
├── assets/               # Images, icons, fonts
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🔐 Demo Credentials

The app includes mock authentication with these test accounts:

- **Email:** `courier@parcego.com` | **Password:** `password123`
- **Email:** `test@parcego.com` | **Password:** `test123`
- **Email:** `demo@parcego.com` | **Password:** `demo123`
- **Email:** `ahmed@parcego.com` | **Password:** `ahmed123`

## 🎯 Key Features Explained

### Dashboard (Overview)
- **Performance Stats** - Today's deliveries, completion rate, earnings
- **Quick Actions** - Scan package, view route, upload proof, get help
- **Next Delivery** - Ready-to-go delivery with route optimization
- **Recent Deliveries** - List of current and completed deliveries

### Deliveries
- **Filter System** - Filter by status (All, Ready, In Transit, Delivered)
- **Delivery Cards** - Detailed information for each delivery
- **Action Buttons** - Context-aware actions based on delivery status
- **Status Tracking** - Visual indicators and progress tracking

### Performance
- **Analytics Dashboard** - Comprehensive performance metrics
- **Period Selection** - Today, This Week, This Month views
- **Achievement System** - Gamified progress tracking
- **Performance Tips** - Actionable advice for improvement

### Profile
- **Personal Information** - Contact details and courier ID
- **Vehicle Management** - Vehicle type, plate, and color
- **Document Status** - License, insurance, and background check status
- **Account Settings** - Comprehensive settings and preferences

## 🎨 Design System

### Colors
- **Primary:** `#3b82f6` (Blue)
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Amber)
- **Error:** `#ef4444` (Red)
- **Neutral:** `#6b7280` (Gray)

### Typography
- **Headers:** 20-28px, Font Weight 600-700
- **Body:** 14-16px, Font Weight 400-500
- **Captions:** 12px, Font Weight 500

### Spacing
- **Small:** 8px
- **Medium:** 16px
- **Large:** 24px
- **Extra Large:** 32px

## 🔧 Technical Implementation

### Navigation
- **Expo Router** - File-based routing with type safety
- **Tab Navigation** - Native bottom tab bar with icons
- **Stack Navigation** - Modal and screen transitions

### State Management
- **React Hooks** - useState, useEffect for local state
- **Context API** - For global state (if needed)
- **AsyncStorage** - For persistent data (authentication, preferences)

### Native Features
- **Haptic Feedback** - iOS tactile feedback
- **Safe Areas** - Proper handling of device notches
- **Platform Detection** - iOS/Android specific implementations
- **Status Bar** - Dynamic status bar styling

### Performance
- **Optimized Rendering** - Efficient list rendering with proper keys
- **Image Optimization** - Proper image sizing and caching
- **Memory Management** - Proper cleanup and optimization

## 🚀 Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
eas build --platform all
```

### App Store Submission
```bash
eas submit --platform ios
eas submit --platform android
```

## 🧪 Testing

### Manual Testing
- Test on both iOS and Android devices
- Verify all navigation flows
- Test authentication and logout
- Validate form inputs and error handling

### Device Testing
- **iOS:** iPhone 12/13/14 series, iPad
- **Android:** Various screen sizes and Android versions
- **Accessibility:** VoiceOver, TalkBack testing

## 🔮 Future Enhancements

### Phase 2 Features
- **Real-time Tracking** - Live GPS tracking and route optimization
- **Push Notifications** - Delivery updates and system notifications
- **Offline Support** - Work without internet connection
- **Biometric Authentication** - Fingerprint/Face ID login

### Advanced Features
- **AR Package Scanning** - Augmented reality barcode scanning
- **Voice Commands** - Hands-free operation while driving
- **Integration APIs** - Connect with real courier services
- **Analytics Dashboard** - Advanced performance insights

## 🐛 Troubleshooting

### Common Issues

#### Metro bundler issues
```bash
npx expo start --clear
```

#### iOS simulator not starting
```bash
npx expo run:ios --clear
```

#### Android build issues
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

#### Dependencies conflicts
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For technical support or questions:
- **Email:** support@parcego.com
- **Documentation:** [Expo Docs](https://docs.expo.dev/)
- **React Native Docs:** [React Native Docs](https://reactnative.dev/)

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using Expo and React Native**
