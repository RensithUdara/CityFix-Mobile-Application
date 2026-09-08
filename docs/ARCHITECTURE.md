# CityFix architecture

## Boot sequence

`App.tsx` holds the native splash, starts the Firebase provider, and mounts the navigator. The navigator waits for auth restoration and the onboarding preference. It then hides the splash, shows the three-page onboarding if necessary, and routes unauthenticated users to the account form. Authenticated users enter the typed stack/tab navigator. Issue URLs remain in the browser during authentication and can resolve afterward.

The supplied logo is bundled locally and requires no image service. `BrandLogo` owns image rendering. The native splash uses a white background to match the supplied asset. Product guidance in `data/onboarding.ts` is separate from community data, which comes only from Firestore.

## Firebase responsibilities

| Service                                                 | Data / behavior                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Authentication                                          | Email/password identity, reset email, session persistence                                   |
| Firestore `users/{uid}`                                 | Display name and neighborhood; readable/writable only by that user                          |
| Firestore `users/{uid}/follows/{issueId}`               | Private followed issues                                                                     |
| Firestore `issues/{id}`                                 | Report, owner UID, status, server timestamps, coordinates, photo URL/path, confirmation map |
| Storage `issues/{uid}/{issueId}/photo`                  | Uploaded report image; authenticated reads, owner uploads/deletes                           |
| Realtime Database `presence/{uid}/sessions/{sessionId}` | Per-device foreground connection presence, private to its user                              |

Firestore is the source of truth for durable domain data. Realtime Database is used for presence, not a duplicate report database. Screen components call service-backed store actions. Firebase listeners update in-memory Zustand state. Listeners detach and account-specific state clears when auth changes. Native Firebase auth persistence uses AsyncStorage; browser auth uses Firebase's browser persistence.

## Submission

Validate the form → allocate a Firestore ID → upload optional photo → get its download URL → save the report using server timestamps → navigate after Firebase acknowledges the write. Failed document writes attempt to delete the uploaded image. A process termination between upload and document creation can leave an orphan, so a production cleanup job is still recommended.

Coordinates are nullable. Without GPS the issue is searchable by its address but has no fabricated map location. An actual GPS position is attached only after foreground permission and successful location capture.

## Security

Rules default to deny. Authenticated users can read reports, create validated reports owned by themselves, and change only their own key in a confirmation map. Firestore transactions protect concurrent confirmations and follow toggles. Profile writes cannot set an admin role. Status updates require an administrator custom claim or trusted Admin SDK/Console operation.

Storage enforces owner path, image content type, and a file size below 10 MB. Download URLs contain bearer tokens and can be shared; application auth does not revoke a previously shared image URL. Realtime Database permits only the user's own session records. No service-account key is included in the app or repository.

Confirmation maps are intentionally simple and have Firestore document-size limits. At larger scale move confirmations into subcollections and maintain trusted aggregate counts. The current feed is a live collection listener; add query limits/geospatial indexes and pagination as the community grows.

## Project and operations

The configured project is `cityfix-community-20260908`. `.firebaserc` pins CLI deployments to it; `.env.local` holds the Web app metadata. The project has billing enabled. Firestore uses `nam5`, Storage's existing bucket is in US East, and Realtime Database is in Singapore. Inspect Firebase Console before changing infrastructure regions, which are generally immutable.

`scripts/firebase-admin.cjs` uses the existing Firebase CLI login in memory for provisioning, status inspection, configuration retrieval, and narrowly scoped integration-test cleanup. It never writes admin access tokens into the application. The live-test manifest contains only the test UID/email and report ID, and is ignored by Git.

## Validation boundaries

Rules emulator tests exercise unauthenticated access, ownership spoofing, cross-account profile/follow access, confirmation integrity, admin-only status updates, private presence, and disallowed uploads. Browser tests cover auth form validation, onboarding navigation/persistence, and optionally actual Firebase signup, upload, report, live cross-session updates, profile editing, and logout.

Native device testing remains necessary for permission prompts, camera/library URIs, GPS, native maps, large accessibility text, and the release splash. Background push notifications, a durable offline outbox, server pagination, and moderation screens are separate future features.
