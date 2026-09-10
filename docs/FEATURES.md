# Extended features

## Offline reporting

The report form first saves its payload and all photos durably on the current device. Native images are normalized and copied into Expo FileSystem's documents directory, with queue metadata in AsyncStorage. Web images are stored as JPEG data URLs in IndexedDB. Nothing is marked submitted until Firestore acknowledges the write.

The queue is scoped to the Firebase UID. It retries sequentially on reconnect, foregrounding, and a 15-second foreground timer. Retries use exponential delays and stop automatically after five failures; the user can retry or remove a draft. A stable Firestore ID makes retry after an ambiguous result idempotent. Uploads interrupted mid-transfer can leave photos in Storage; retry overwrites only that report's owner-scoped paths. Removing a draft removes the local copy, not any partial remote objects.

Sync requires the app to be open. This is not an OS background task. Clearing app/browser storage removes local drafts. The latest 100 loaded reports are cached for offline reading; remote photos are not guaranteed to be available offline. Queue limit: 20 drafts.

## Pagination

Home listens to the latest 20 reports and requests subsequent pages with Firestore `startAfter` cursors. Category/status filters are sent to Firestore. Text search searches loaded pages; load additional pages to broaden results. Details and followed reports have independent live listeners. My reports currently loads the latest 100 reports for the account. Map results use the reports currently loaded in the app. This is not a global geospatial query.

## Notifications and subscriptions

Followed documents contain `issueId`, `statusUpdates`, and `commentUpdates`. Existing follows are upgraded when their owner signs in. Server triggers create deterministic inbox IDs, preventing duplicate inbox entries on retries. A durable push outbox retries transient transport failures and checks Expo receipts, removing invalid device tokens.

Native registration uses Expo Push Service, which delivers through FCM/APNs. Add `EXPO_PUBLIC_EAS_PROJECT_ID`, configure the EAS project with FCM v1 credentials for Android and APNs credentials for iOS, and create a development/release build on a physical phone. Expo Go and the browser use the inbox rather than remote push. Delivery cannot be verified until those credentials and a real device are available. Notification taps open the issue after authentication. Sign-out removes this device's token.

## Moderation

Moderation and developer integration screens are excluded from the consumer app, including settings links and deep links. The backend remains available for a separate administrative interface; that interface is now available in `admin-web/` (see [ADMIN.md](ADMIN.md)). Users can still flag reports from issue details.

Any authenticated user can flag a report. Callable functions enforce moderator access through the protected `admin/{uid}` document; hiding or showing a screen is not the security boundary. Moderators can update status, dismiss flags, or delete reports with a required reason. Every action writes a private audit record. Deletions create a retried cleanup job for comments, follows, and photos.

Activate an explicitly chosen registered account using the trusted helper described in [ADMIN.md](ADMIN.md). No client can grant itself access. A moderator email still needs to be selected by the project owner.

## Analytics and badges

Firestore triggers reconcile each report against a server-owned contribution ledger in a transaction. Repeated or out-of-order events therefore do not double-count analytics or points. Daily reconciliation includes pre-existing reports. Analytics includes lifetime totals, category/status/severity breakdowns, daily trends, and average resolution time. Daily history is bounded to two years.

Personal achievements use server-calculated counts: 5 points per report and 10 additional points per resolved report. Badge thresholds are 1/5/20 submitted reports and 1/10 resolved reports. Deletions reverse the contribution. There is no public identity leaderboard.

## Operations

```sh
npm install --prefix functions
firebase deploy --only "functions,firestore,storage" --force
```

Functions run on Node 22 in `us-central1`, with a maximum of five instances per function. Scheduled tasks run push maintenance every five minutes and analytics reconciliation daily. Read [API.md](API.md) for integration usage.

Tests: `node --test tests/sync-queue.cjs tests/native-upload.cjs`, `npm test --prefix functions`, `npm run test:rules`, and the opt-in live Playwright test. The backend emulator test requires `FIRESTORE_EMULATOR_HOST` and exercises real Firestore transactions and authorization handlers without sending push messages.

## Report location picker

The location field suggests real places through a Photon-compatible OpenStreetMap geocoder after a 650 ms debounce. Selecting a suggestion fills the address and coordinates. Editing the address clears the attached pin. Choose location on map opens a separate picker: tap or drag the pin, then press Use this location. Closing the picker discards that selection. GPS permission is requested only for the explicit current-location action. Reverse lookup fills a readable address; coordinates remain usable if lookup fails.

`EXPO_PUBLIC_GEOCODER_URL` defaults to the Photon public demo. The demo is intended for reasonable light usage and has no availability guarantee; use a hosted/self-hosted Photon endpoint for production traffic. Search text and selected coordinates are sent to that provider. Maps use the existing native map provider and OpenStreetMap web tiles. This is not Google Places integration.

## Optional profile details

Users can upload, replace or remove a profile photo and optionally save a phone number and a bio (up to 500 characters). Neighborhood remains optional; display name retains its existing validation. Fields are private in `users/{uid}`. Photos use `profiles/{uid}/{unique-id}.jpg`, with owner-only Storage operations, JPEG content type and a 10 MB limit. Replacing a photo saves the new profile reference before removing the previous object. Firebase download links are bearer links: anyone given the URL may access the image. An interrupted upload can leave an unused object, so a periodic orphan cleanup is advisable for large deployments.
