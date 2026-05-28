# How to publish Tbilisi koloriti to App Stores

## Step 1 — Create a free Expo account (5 minutes)

1. Open: https://expo.dev/signup
2. Sign up with your email (free)
3. Open a terminal in this folder and run:
   ```
   eas login
   ```
   Enter your Expo email and password.

4. Then run:
   ```
   eas init
   ```
   This links your project to Expo and fills in the projectId in app.json.

---

## Step 2A — Android: Google Play Store ($25 one-time)

### Create developer account
1. Go to: https://play.google.com/console
2. Pay $25 registration fee
3. Complete account setup

### Build the app
```
npm run build:android
```
EAS will build an AAB file in the cloud. Takes ~10 minutes.
You'll get a download link when done.

### Submit to Play Store
1. Go to Play Console → Create app → "Tbilisi koloriti"
2. Fill in the store listing (description, screenshots, category: Utilities)
3. Upload the AAB from the EAS build
4. Set up content rating, pricing (Free)
5. Submit for review → usually approved in 1–3 days

---

## Step 2B — iOS: Apple App Store ($99/year)

### Create developer account
1. Go to: https://developer.apple.com/account
2. Pay $99/year
3. Complete enrollment (takes 1–2 business days for approval)

### Create app in App Store Connect
1. Go to: https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Name: "Tbilisi koloriti"
4. Bundle ID: com.tbilisikoloriti.app
5. Fill in description, screenshots, category: Utilities

### Fill in eas.json with your Apple credentials:
Open `eas.json` and replace:
- `YOUR_APPLE_ID_EMAIL` → your Apple ID email
- `YOUR_APP_STORE_CONNECT_APP_ID` → the 10-digit App ID from App Store Connect
- `YOUR_APPLE_TEAM_ID` → your Team ID from developer.apple.com/account

### Build and submit
```
npm run build:ios
npm run submit:ios
```
EAS handles all certificates and code signing automatically.

---

## Quick Android APK for testing (no Play Store, no payment)

To get an installable APK file right now:

```
npm run build:android
```

After ~10 minutes EAS will give you a download link.
Send it to your phone and install it (Android only — enable "Install from unknown sources").

---

## What reviewers want to see

Both stores will ask you to verify:
- Privacy policy URL → you can host PUBLISH.md as a simple webpage, or use: https://www.privacypolicygenerator.info
- App screenshots (take them in Expo Go while testing)
- Short description: "Report city infrastructure problems in Tbilisi — damaged roads, buildings, flooding, and more. Upload photos or short videos pinned to the exact location."

---

## After publishing — connect real Firebase (optional)

The app currently uses a local emulator. For production with real cloud sync:
1. Go to https://console.firebase.google.com → Create project
2. Add web app → copy config into `src/lib/firebase.ts`
3. Remove the `connectFirestoreEmulator` and `connectStorageEmulator` lines
4. Rebuild and submit an update
