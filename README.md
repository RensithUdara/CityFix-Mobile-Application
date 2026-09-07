# CityFix

A thoughtfully designed neighborhood issue reporter built with Expo, React Native, and TypeScript. Ivory surfaces, forest-green accents, reusable components, and responsive phone, tablet, and web layouts.

## Run

```sh
npm install
npm start
# Or open the browser preview
npm run web
```

Use an Expo Go version compatible with the installed Expo SDK, or a development build. Camera and GPS need device/browser permissions. Native Android map deployments require Google Maps credentials in the Expo configuration. Web maps use OpenStreetMap embeds and show the selected report; native maps show all filtered markers.

## Features included

- Nested stack and tab navigation with issue deep links (`cityfix://issue/CF-1024`).
- Home with community metrics, category and status filters, debounced search, and responsive virtualized cards.
- Map, reporting form, issue details, personal activity, sample profile, and followed-status screens.
- React Hook Form validation, camera/library photo selection, and GPS capture.
- Zustand state with AsyncStorage persistence for reports, follows, and confirmations.
- Consistent buttons, inputs, empty states, badges, icons, spacing, and colors.

## Folder structure

```text
App.tsx                     Application providers
src/
  components/
    ui/                     Shared Button, Field, Icon, Screen, and headers
    home/                   Header, illustrated hero, community statistics
    issues/                 Issue cards, status badges, category filters
    map/                    Platform-specific native and web maps
  data/                     Clearly identified sample community reports
  hooks/                    Reusable behavior such as debounced search
  navigation/               Typed stack, tabs, and deep-link configuration
  screens/                  Screen composition and screen-specific styles
  services/                 Device API adapters for camera and location
  store/                    Persistent application state and state actions
  theme/                    Color, spacing, corner-radius, and shadow tokens
  types/                    Issue domain types
  utils/                    Pure formatting helpers
docs/
  ARCHITECTURE.md            Customization and backend integration plan
```

## Customize

Start with `src/theme/index.ts` for colors and design tokens. Change reusable widgets in `src/components/ui/`, screen sections in the component subfolders, and individual page compositions in `src/screens/`. Sample content is in `src/data/issues.ts`; clear the `cityfix-issues-v1` storage key to reload seed changes on a previously used device.

## Preview boundaries

This is a functional local UI prototype, not a deployed civic reporting service. The profile is a sample identity. No Firebase authentication, remote API, uploads, push notifications, automatic offline sync, clustering, dark mode, or server pagination is implemented. Local reports are **not** delivered to authorities. Library/camera URIs are not permanent photo uploads; durable native media storage should be added before production. Map tiles and sample photos require internet. Manually entered addresses currently use a central Colombo fallback pin; GPS supplies actual coordinates.

See `docs/ARCHITECTURE.md` for the extension plan. Device camera, GPS, and native map behavior require testing on Android/iOS hardware.

## Validation

```sh
npm run typecheck
npm run build:web
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Platform integration references: [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) and [React Navigation setup](https://reactnavigation.org/docs/getting-started/).
