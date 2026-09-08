# CityFix architecture

## Boot sequence

`App.tsx` holds the native splash, starts the Firebase provider, and mounts the navigator. The navigator waits for auth restoration and the onboarding preference. It then hides the splash, shows the three-page onboarding if necessary, and routes unauthenticated users to the account form. Authenticated users enter the typed stack/tab navigator. Unauthenticated users cannot open private screens. FAQ, Privacy, Guidelines, and About are public routes.

The supplied logo is bundled locally and requires no image service. `BrandLogo` owns image rendering. The native splash uses a white background to match the supplied asset. Product guidance in `data/onboarding.ts` is separate from community data, which comes only from Firestore.

## Firebase responsibilities

| Service                                                 | Data / behavior                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Authentication                                          | Email/password identity, reset email, session persistence                                   |
| Firestore `users/{uid}`                                 | Display name and neighborhood; readable/writable only by that user                          |
| Firestore `users/{uid}/follows/{issueId}`               | Private followed issues                                                                     |
| Firestore `issues/{id}`                                 | Report, owner UID, status, server timestamps, coordinates, ordered photo URL/path list, confirmation map |
| Storage `issues/{uid}/{issueId}/photo-{0..4}.jpg`                  | Normalized JPEG report photos; authenticated reads, owner uploads/deletes                           |
| Realtime Database `presence/{uid}/sessions/{sessionId}` | Per-device foreground connection presence, private to its user                              |

Firestore is the source of truth for durable domain data. Realtime Database is used for presence, not a duplicate report database. Screen components call service-backed store actions. Firebase listeners update in-memory Zustand state. Listeners detach and account-specific state clears when auth changes. Native Firebase auth persistence uses AsyncStorage; browser auth uses Firebase's browser persistence.

Private preferences live at `users/{uid}/preferences/app`; support submissions at `users/{uid}/supportRequests/{id}`. Community comments live at `issues/{id}/comments/{id}`. Comments include the author profile name and support owner deletion. Settings and comments use Firestore listeners; all service access is separated from presentation components.

## Submission

Validate the form and 1?5 photo selection ? allocate a Firestore ID ? normalize and resize each image to JPEG ? upload sequentially ? obtain download URLs ? atomically save the report and optional automatic follow ? show a success popup only after the write is acknowledged. The unique user-facing reference is `CF-` plus the complete Firestore ID, so existing reports have references without a migration or collision-prone truncation.

`photoUpload.ts` handles normalization. The platform upload adapter uses base64 with Firebase on web, and a local-file XMLHttpRequest returning a native Blob plus `uploadBytes` on iOS/Android. Native code avoids `uploadString`, which turns base64 into Uint8Array and triggers unsupported Blob construction in React Native. Native Blobs are closed after success or failure. Failed document writes attempt to remove all uploaded images. A process termination between upload and document creation can still leave orphans.

Coordinates are nullable. Without GPS the issue is searchable by its address but has no fabricated map location. An actual GPS position is attached only after foreground permission and successful location capture.

## Maps and report details

Native maps use react-native-maps; web uses Leaflet with OpenStreetMap tiles. Maps show a world overview when neither a report position nor user-selected GPS position is available. No default city is presented as a user location. GPS is requested explicitly through My location. Address-only reports remain discoverable without invented markers. Gallery, sharing, directions, and live discussion are separate components/services.

## Security

Rules default to deny. Authenticated users can read reports, create validated reports owned by themselves, and change only their own key in a confirmation map. Firestore transactions protect concurrent confirmations and follow toggles. Profile writes cannot set an admin role. Status updates require an administrator custom claim or trusted Admin SDK/Console operation.

Storage enforces owner path, image content type, and a file size below 10 MB. Download URLs contain bearer tokens and can be shared; application auth does not revoke a previously shared image URL. Realtime Database permits only the user's own session records. No service-account key is included in the app or repository.

Confirmation maps are intentionally simple and have Firestore document-size limits. At larger scale move confirmations into subcollections and maintain trusted aggregate counts. The current feed is a live collection listener; add query limits/geospatial indexes and pagination as the community grows.

## Project and operations

The configured project is `cityfix-community-20260908`. `.firebaserc` pins CLI deployments to it; `.env.local` holds the Web app metadata. The project has billing enabled. Firestore uses `nam5`, Storage's existing bucket is in US East, and Realtime Database is in Singapore. Inspect Firebase Console before changing infrastructure regions, which are generally immutable.

`scripts/firebase-admin.cjs` uses the existing Firebase CLI login in memory for provisioning, status inspection, configuration retrieval, and narrowly scoped integration-test cleanup. It never writes admin access tokens into the application. The live-test manifest contains only the test UID/email and report ID, and is ignored by Git.

## Validation boundaries

Rules emulator tests exercise unauthenticated access, ownership spoofing, cross-account profile/follow access, confirmation integrity, admin-only status updates, private presence, disallowed uploads, photo count/path validation, private preferences/support, comment authorship/deletion, and atomic automatic follows. Browser tests cover auth form validation, onboarding navigation/persistence, and optionally actual Firebase signup, upload, report, live cross-session updates, profile editing, and logout.

Native device testing remains necessary for permission prompts, camera/library URIs, GPS, native maps, large accessibility text, and the release splash. Background push notifications, a durable offline outbox, server pagination, and moderation screens are separate future features.
