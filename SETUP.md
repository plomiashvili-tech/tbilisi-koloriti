# Setup Guide

## 1. Firebase

1. Go to https://console.firebase.google.com
2. Create a new project (e.g. "tbilisi-report")
3. Add a **Web app** → copy the config object into `src/lib/firebase.ts`
4. Enable **Firestore Database** (Start in test mode for now)
5. Enable **Storage** (Start in test mode for now)

### Firestore index (required for "My Reports" query)
Create a composite index on the `reports` collection:
- Field 1: `deviceId` (Ascending)
- Field 2: `createdAt` (Descending)

Firestore will show you a link in the error log the first time the query runs — just click it.

## 2. Google Maps API Key

1. Go to https://console.cloud.google.com
2. Enable **Maps SDK for Android** and **Maps SDK for iOS**
3. Create API key credentials
4. Replace `YOUR_GOOGLE_MAPS_ANDROID_API_KEY` and `YOUR_GOOGLE_MAPS_IOS_API_KEY` in `app.json`

## 3. Run on device

```bash
cd tbilisi-report

# Install Expo Go on your phone, then:
npx expo start

# Or build a development build:
npx expo run:android
npx expo run:ios   # macOS only
```

## Project structure

```
src/
  lib/
    firebase.ts      ← Firebase init (add your config here)
    reports.ts       ← Firestore read/write + Storage upload
    deviceId.ts      ← Anonymous device identifier
  screens/
    MapScreen.tsx        ← Home map with all report pins
    CameraScreen.tsx     ← Photo / 10s video capture
    SubmitScreen.tsx     ← Category + description form
    MyReportsScreen.tsx  ← User's own submissions
    ReportDetailScreen.tsx
  components/
    CategoryPicker.tsx   ← Horizontal category selector
  types.ts             ← Shared TypeScript types
```
