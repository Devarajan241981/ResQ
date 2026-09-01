# ResQ Bharath — Mobile app (Expo / React Native)

Native Android/iOS app that shares the same Django backend as the web app.

## Run it

```bash
cd mobile
# Point the app at your backend. A phone can't reach the laptop's "localhost",
# so use your machine's LAN IP (find it with `ipconfig getifaddr en0` on macOS):
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8020/api/v1 npx expo start
```

Then:

- **Android device:** install **Expo Go** from the Play Store and scan the QR code.
- **Android emulator:** press `a` in the terminal (use `http://10.0.2.2:8020/api/v1` as the API URL).
- Make sure the Django backend is running on port 8020 and that its `CORS_ALLOWED_ORIGINS` / `DJANGO_ALLOWED_HOSTS` allow the device.

If `EXPO_PUBLIC_API_URL` is unset, the app falls back to the Metro host IP on port 8020.

## Build an installable APK / Play Store bundle

Requires the Android SDK + a build. The easiest path is EAS:

```bash
npm install -g eas-cli
eas build -p android --profile preview   # APK you can sideload
```

## What's inside

- **Expo Router** file-based navigation (`src/app`), a bottom tab bar: Home, Missing Persons, SOS, Blood, Profile.
- **Auth** with `expo-secure-store` (`src/lib/auth.tsx`) — email/password login, token refresh, `/auth/me`.
- **API layer** (`src/lib/api.ts`) mirroring the web client (`apiFetch`, error extraction).
- **SOS** screen posts to `/sos/alerts/` with live location (`expo-location`) and one-tap helpline dialling.
- Public **missing-persons feed** and **blood requests** (no login needed to browse).

## Brand / logo

The app reads **ResQ Bharath**. To use the custom logo, drop the artwork into
`assets/images/` and reference it from `app.json` (`icon`, `android.adaptiveIcon.foregroundImage`).

## Building an installable APK (EAS)

The build config lives in `eas.json`. To produce an installable Android APK:

```bash
npm install -g eas-cli          # once
npx eas login                   # your Expo account
npx eas init                    # once — links the project (writes extra.eas.projectId)
npx eas build -p android --profile preview
```

`preview` builds a direct-install **APK** (internal distribution). `production`
builds an **AAB** for the Play Store. The build runs on Expo's servers and
returns a download URL — no local Android SDK needed.

For a local build instead (needs Android SDK + Java): `npx expo run:android`.

## One-tap SOS from the home screen

Two layers deliver "an SOS button on the home screen":

1. **App-icon shortcut (built in):** long-press the ResQ app icon → **Emergency SOS**
   → opens straight to the SOS screen. Configured via `expo-quick-actions`
   (`app/(tabs)/_layout.tsx`). Works in a **dev build** (not Expo Go).

2. **True home-screen widget (next native step):** a 1×1 tappable **SOS** widget
   that fires the alert without opening the app. This needs a native widget
   target and a dev build:
   - iOS: a WidgetKit extension (e.g. via `@bacons/apple-targets`) whose tap
     deep-links `resq://sos` (or posts to the API via an App Group + background task).
   - Android: an `AppWidgetProvider` (custom config plugin) whose button fires a
     broadcast → a headless task that calls `POST /sos/alerts/`.
   Build once with `npx eas build -p android --profile preview` to test on device.

The **website already ships this today** as a PWA — "Add SOS to Home Screen" drops
a red SOS icon that opens directly to a single SOS button (`/sos-launch`).
