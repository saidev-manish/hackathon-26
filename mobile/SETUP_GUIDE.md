# PulseCare Mobile App - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Firebase
Update `mobile/firebase/config.js` with your Firebase project credentials:
- Get credentials from Firebase Console
- Ensure Firestore is enabled
- Enable Authentication (Email/Password + Google)
- Set up Cloud Messaging for notifications

### 3. Configure Google Sign-In
Update `mobile/contexts/AuthContext.js` with your Google OAuth credentials:
- Android Client ID
- Web Client ID

### 4. Set Up Environment Variables (Optional)
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

### 5. Start Development Server
```bash
npm start
```

Options:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser

## Running on Emulator

### Android
```bash
npm run android
```

**First time setup:**
1. Have Android Studio and AVD Manager open
2. Create/start an emulator (Medium Phone API 36+)
3. Run above command

### iOS
```bash
npm run ios
```

Requires macOS with Xcode installed.

## Building for Production

### Android
```bash
# Preview build (for testing)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

### iOS
```bash
eas build --platform ios
```

## Common Setup Issues

### Issue: Metro Bundler crashes
**Solution:** Clear cache and restart
```bash
npm start -- --reset-cache
npm start -- -c
```

### Issue: Firestore connection fails
**Solution:** 
- Verify Firebase config in `firebase/config.js`
- Check internet connection
- Review Firestore security rules in Firebase Console

### Issue: Google Sign-In not working
**Solution:**
- Verify Client IDs in AuthContext.js
- Check OAuth consent screen configuration
- Verify app package name (com.companypcos) matches Firebase setup

### Issue: Notifications not receiving
**Solution:**
- Run on physical Android device (emulator has limitations)
- Verify FCM is enabled in Firebase
- Check Android permissions in app

## Project Commands

```bash
# Development
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
npm run ios           # Run on iOS simulator
npm run web           # Run on web browser

# Build & Deploy
eas build             # Build for distribution
eas submit            # Submit to app stores

# Cleaning
npm cache clean --force
rm -rf node_modules && npm install
```

## Testing

### In-App Testing
1. Create a test account
2. Navigate through all screens
3. Test logging functionality
4. Verify community posting
5. Check notifications

### Data Verification
- Check Firestore Console for stored logs
- Verify user profile data persists
- Check community posts appear in real-time

## Debugging

### View Console Logs
- Use Expo DevTools (press `d` in Metro terminal)
- Use React Native Debugger
- Check browser DevTools (for web)

### Inspect Network Requests
- Use Firebase Console for real-time updates
- Monitor Firestore reads/writes
- Check FCM delivery status

## Performance Tips

1. **Clear AsyncStorage** if experiencing cache issues
2. **Monitor App Size** - keep dependencies minimal
3. **Optimize Images** - use appropriate formats
4. **Test on Real Device** - emulator performance differs

## Deployment Checklist

- [ ] Firebase security rules configured
- [ ] All environment variables set
- [ ] Google Sign-In tested
- [ ] Notifications tested on device
- [ ] Community features tested
- [ ] Charts render correctly
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] No console errors or warnings

## File Structure Reference

```
mobile/
├── app/                    # Application screens
├── components/             # Reusable components
├── contexts/              # State management
├── firebase/              # Firebase setup
├── constants/             # App constants
├── styles/               # Design tokens
├── utils/                # Utilities
├── package.json          # Dependencies
└── PROFESSIONAL_README.md # Full documentation
```

## Next Steps

1. Install dependencies: `npm install`
2. Configure Firebase credentials
3. Start dev server: `npm start`
4. Test on emulator or device
5. Review code quality
6. Deploy to production

## Support

For issues or questions:
1. Check PROFESSIONAL_README.md
2. Review Firebase Console
3. Check Metro Bundler output
4. Verify all credentials are correct

---

**Remember:** Never commit sensitive credentials. Use `.env` files and environment variables.
