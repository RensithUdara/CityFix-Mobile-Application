# CityFix

Expo SDK 57 + React Native + TypeScript community reporting app, connected to Firebase project **cityfix-community-20260908**.

## Run

```sh
npm install
npm start
# Browser
npm run web
```

The project's Firebase client configuration is in ignored `.env.local`. For a fresh checkout, copy `.env.example` to `.env.local` and enter the Web app configuration from Firebase Console. Client configuration is public app metadata, not a service-account key. Never put administrator credentials in Expo environment variables.

[Open Firebase Console](https://console.firebase.google.com/project/cityfix-community-20260908/overview)

## Implemented

- Supplied CityFix logo in the splash screen, app icon, onboarding, sign-in, and home header.
- Three onboarding pages with Back, Continue, Skip, page indicators, reduced-motion support, and persisted completion.
- Firebase email/password registration, login, password reset, session restoration, and logout.
- Firestore profiles, report submission, live issue listeners, transactional confirmations, and per-account follows.
- Firebase Storage image uploads, size/type validation, and cleanup after failed submission.
- Realtime Database per-session presence with disconnect cleanup and a connection indicator.
- Camera/library selection, GPS, form validation, search, filters, native/web maps, and activity screens.
- Deployed Firestore, Realtime Database, and Storage access rules.

No sample reports, fictional accounts, fake counts, sample photos, or fallback city coordinates are loaded. Categories and onboarding copy remain product constants. A manually entered address is saved without a map pin unless GPS is attached.

## Folder structure

```text
src/
  components/
    branding/      Shared supplied logo
    onboarding/    Onboarding illustration component
    ui/            Buttons, fields, screen shell, status/error UI
    home/          Home header, hero, aggregate report counts
    issues/        Cards, category filters, status badges
    map/           Platform-specific maps
  config/          Firebase initialization and platform auth persistence
  data/            Onboarding product copy
  hooks/           Debouncing and onboarding preferences
  navigation/      Auth gate, onboarding gate, typed tabs/stack/deep links
  providers/       Firebase auth/listener lifecycle
  screens/         App screens
  services/        Auth, reports/uploads, presence, device APIs
  store/           In-memory live state; no demo seed or persisted issue cache
  theme/           Shared design tokens
  types/           Domain and native Firebase type declarations
  utils/           Error messages, initials, date formatting
firebase/          Security rules and indexes
tests/             Browser and Firebase rules verification
scripts/           Project administration and scoped live-test cleanup
```

## Splash and onboarding

The original image is stored at `assets/cityfix-logo.png`. Configure the native splash in `app.json` under `expo-splash-screen`. Create a new native build to apply icon/splash configuration. Expo Go does not reproduce the release splash exactly; verify a release build, as described in the [SDK 57 splash documentation](https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/).

Onboarding appears once per installation/browser storage. Clear the `cityfix-onboarding-complete-v1` AsyncStorage key to replay it. Signing out preserves this preference. Screen copy lives in `src/data/onboarding.ts`; the onboarding artwork lives separately in `src/components/onboarding/`.

## Validation

```sh
npm run typecheck
npm run format:check
npm run build:web
npm run test:e2e
npm run test:rules
```

Rules tests use the local emulators with project `demo-cityfix` and require Java 21 and Firebase CLI. Install Chromium with `npx playwright install chromium` before browser tests.

The live integration test is opt-in. In PowerShell:

```powershell
$env:CITYFIX_LIVE_TEST='1'
npx playwright test tests/firebase-live.spec.ts --workers=1
```

It creates a temporary test account, uploads an image and report, verifies updates across two browser sessions, and deletes that account and its data. Cleanup uses the existing Firebase CLI login, checks the test email and UID, and is scoped to that identity. If interrupted, run `node scripts/firebase-admin.cjs cleanup-test` while the matching manifest remains in `test-results/`.

## Deployment and limits

```sh
firebase deploy --only "firestore,database,storage" --project cityfix-community-20260908
```

The app uses real Firebase services. It is not connected to a municipal authority. Issue status can be updated by trusted administrators through Firebase Console/Admin SDK; ordinary users cannot change status. The updates screen displays live followed-issue statuses; background FCM push delivery is not implemented.

The report feed currently subscribes to all reports. Large deployments should add geospatial querying and pagination. Durable offline submission queues, moderation UI, account deletion UI, and marker clustering are not implemented. Photo URLs are Firebase download-token URLs and should be treated as shareable links. Native camera, location, maps, and splash behavior still need device/release testing. Android native maps require a Google Maps API key in the deployment configuration.

See [architecture](docs/ARCHITECTURE.md) for data responsibilities and security details.
