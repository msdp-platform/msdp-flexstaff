# FlexStaff Mobile App (React Native)

Native mobile applications for iOS and Android built with React Native and Expo.

---

## 📱 Features

### ✅ Implemented
- **Authentication**
  - Welcome screen with app introduction
  - Login and registration
  - Role selection (Employer/Worker)
  - Persistent authentication with AsyncStorage
  - JWT token management

- **Navigation**
  - Stack navigation for auth flow
  - Bottom tab navigation for main app
  - Nested stack navigators for each tab
  - Deep linking support

- **Home Dashboard**
  - Stats overview (shifts, hours, earnings, rating)
  - Quick actions based on role
  - Upcoming shifts preview
  - Notifications badge

- **Shifts**
  - Browse available shifts
  - Search and filter functionality
  - Shift details view
  - Apply for shifts
  - Industry-specific filtering

- **Messages**
  - Conversation list
  - Real-time chat interface
  - Unread message indicators
  - Message notifications

- **Profile**
  - User information display
  - Settings access
  - Payment methods
  - Logout functionality

- **Additional Features**
  - Push notifications setup
  - Pull-to-refresh
  - Loading states
  - Error handling
  - Offline support (via React Query caching)

---

## 🏗️ Tech Stack

- **Framework:** React Native 0.74 with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation 6
- **UI Components:** React Native Paper (Material Design 3)
- **State Management:** Zustand with AsyncStorage persistence
- **API Client:** Axios with React Query
- **Icons:** React Native Vector Icons (Material Community Icons)
- **Notifications:** Expo Notifications
- **Forms:** React Hook Form with Zod validation

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Main navigator
│   │   ├── AuthNavigator.tsx       # Auth flow (Welcome, Login, Register)
│   │   └── MainNavigator.tsx       # Main app (Tabs + Stacks)
│   │
│   ├── screens/
│   │   ├── LoadingScreen.tsx       # App loading screen
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx   # Welcome/Onboarding
│   │   │   ├── LoginScreen.tsx     # Login form
│   │   │   └── RegisterScreen.tsx  # Registration form
│   │   └── main/
│   │       ├── HomeScreen.tsx      # Dashboard
│   │       ├── ShiftsScreen.tsx    # Browse shifts
│   │       ├── ShiftDetailScreen.tsx
│   │       ├── MessagesScreen.tsx  # Conversations
│   │       ├── ChatScreen.tsx      # Chat interface
│   │       ├── ProfileScreen.tsx   # User profile
│   │       ├── NotificationsScreen.tsx
│   │       ├── TimesheetScreen.tsx
│   │       └── CreateShiftScreen.tsx
│   │
│   ├── services/
│   │   └── api.ts                  # API client & endpoints
│   │
│   ├── store/
│   │   └── authStore.ts            # Authentication state
│   │
│   ├── utils/
│   │   ├── theme.ts                # Material Design theme
│   │   └── notifications.ts        # Push notification utils
│   │
│   └── types/                      # TypeScript types
│
├── App.tsx                         # App entry point
├── app.json                        # Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only)
- Android: Android Studio

### Installation

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Expo development server:**
   ```bash
   npm start
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

5. **Run on Web:**
   ```bash
   npm run web
   ```

---

## 🔧 Configuration

### Environment Setup

Update API URL in `src/services/api.ts`:

```typescript
const API_URL = __DEV__
  ? 'http://localhost:3000/api'       // For iOS simulator
  // ? 'http://10.0.2.2:3000/api'     // For Android emulator
  : 'https://api.flexstaff.co.uk/api';
```

### Push Notifications

1. Configure in `app.json`:
```json
{
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#0ea5e9"
  }
}
```

2. Register device token in your backend

---

## 📱 Running on Physical Devices

### iOS (TestFlight)
```bash
# Build for iOS
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

### Android (Internal Testing)
```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

---

## 🎨 Customization

### Theme Colors

Edit `src/utils/theme.ts`:

```typescript
const theme = {
  colors: {
    primary: '#0ea5e9',      // Your brand color
    secondary: '#0284c7',
    success: '#10b981',
    // ... more colors
  },
};
```

### App Icons & Splash Screen

Replace these files:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2436)
- `assets/adaptive-icon.png` (Android)

---

## 📊 API Integration

All API calls are centralized in `src/services/api.ts`:

```typescript
// Usage in components
import { shiftAPI } from '../services/api';

const { data } = useQuery({
  queryKey: ['shifts'],
  queryFn: () => shiftAPI.getShifts({ status: 'open' }),
});
```

Available API modules:
- `authAPI` - Authentication
- `shiftAPI` - Shifts management
- `applicationAPI` - Applications
- `timesheetAPI` - Timesheets
- `messageAPI` - Messaging
- `notificationAPI` - Notifications
- `teamAPI` - Team management
- `ratingAPI` - Ratings
- `paymentAPI` - Payments

---

## 🔐 Authentication Flow

1. App launches → Check AsyncStorage for auth token
2. If token exists → Navigate to Main app
3. If no token → Navigate to Auth flow (Welcome → Login/Register)
4. After login → Save token → Navigate to Main app
5. On logout → Clear token → Navigate to Auth flow

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

---

## 📦 Building for Production

### iOS

1. **Configure app signing in Xcode**
2. **Build:**
   ```bash
   eas build --platform ios --profile production
   ```
3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

### Android

1. **Configure signing in `eas.json`**
2. **Build:**
   ```bash
   eas build --platform android --profile production
   ```
3. **Submit to Google Play:**
   ```bash
   eas submit --platform android
   ```

---

## 🔔 Push Notifications Setup

### 1. Get Expo Push Token

```typescript
import { registerForPushNotifications } from './utils/notifications';

const token = await registerForPushNotifications();
// Send token to your backend
```

### 2. Handle Notifications

```typescript
import { useNotificationObserver } from './utils/notifications';

useNotificationObserver(
  (notification) => {
    // Handle received notification
  },
  (response) => {
    // Handle notification tap
  }
);
```

### 3. Send Notifications (Backend)

```javascript
const message = {
  to: expoPushToken,
  sound: 'default',
  title: 'New Shift Available',
  body: 'Waiter position at ABC Restaurant',
  data: { shiftId: '123' },
};

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
```

---

## 🌍 Localization (Future)

Add i18n support:
```bash
npm install i18next react-i18next
```

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npx expo start -c
```

### Android Emulator Not Connecting
Check API URL uses `10.0.2.2` instead of `localhost`

### iOS Simulator Issues
```bash
npx expo start --ios
# Or open in Xcode and run directly
```

### Build Errors
```bash
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📱 Screenshots

(Add your app screenshots here)

---

## 🚧 Roadmap

### Phase 1 (✅ Complete)
- ✅ Authentication screens
- ✅ Main navigation
- ✅ Home dashboard
- ✅ Shifts browsing
- ✅ Messaging
- ✅ Profile

### Phase 2 (In Progress)
- [ ] Complete shift details
- [ ] Application submission
- [ ] Timesheet management
- [ ] Payment integration
- [ ] Rating system
- [ ] Real-time messaging

### Phase 3 (Planned)
- [ ] Offline mode
- [ ] Biometric authentication
- [ ] Calendar integration
- [ ] Maps integration
- [ ] Document scanner
- [ ] Video profiles

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

Proprietary - All rights reserved

---

## 🆘 Support

- 📧 Email: support@flexstaff.co.uk
- 📖 Docs: See main README
- 🐛 Issues: GitHub Issues

---

**Built with ❤️ using React Native & Expo**
