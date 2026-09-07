# Architecture and design guide

## Responsibilities

Screens compose feature components and call store actions. Shared widgets have small typed props and no knowledge of navigation or storage. Domain types are independent of React. Device permissions and SDK calls live in `services/device.ts`. The store owns issue mutations and persistence; only the store imports sample issue data.

This deliberately uses a small layered architecture. Introduce repository abstractions when a remote data source is implemented, rather than keeping empty API folders or unused interfaces.

## Design customization

- `theme/index.ts`: shared color palette, spacing scale, radii, shadows.
- `components/ui`: reusable widgets, button states, input errors, screen bounds.
- `components/home`: branded wordmark and original city illustration built from native Views.
- `components/issues`: one issue-card design shared across home and activity.
- `components/map`: Metro selects `.web.tsx` in browsers and `.tsx` on native.
- `screens`: page composition and local styles, colocated for easy maintenance.

Use `StyleSheet.create` for reusable styling, keep component-specific layout beside its component, and promote repeated values into theme tokens. Add new categories in `types/issue.ts` and their icons in `CategoryFilter.tsx`.

## Backend integration plan

1. Add `api/issueRepository.ts` with typed fetch, create, follow, and confirmation operations. Implement Firestore or REST behind it. Keep transport details outside screens.
2. Add Firebase configuration through public Expo environment variables. Enforce authenticated ownership and field validation with Firestore and Storage rules; client configuration is not an authorization boundary.
3. Add an authentication provider and account screens. Replace the sample profile with the authenticated identity and scope cached data to the user.
4. Copy selected photos into durable app storage before queueing. Upload them to Firebase Storage and keep the resulting remote URL in each report.
5. Add a durable outbox containing a stable client-generated request ID, payload, retry count, and next retry time. Preserve the same ID on retries for server idempotency. Queue independently of connectivity and remove only after server acknowledgement.
6. Add connectivity and foreground listeners, a single-flight sync worker, bounded exponential retries, visible pending/failed states, and manual retry. Network availability does not guarantee server reachability.
7. Add FCM or Expo push registration after notification permission. Use the existing issue deep-link route when opening notifications. Handle deleted/inaccessible issues.
8. Add server cursors, geospatial queries, clustering, and measured list optimizations when real data volume requires them.

## Important persistence behavior

Zustand persists JSON asynchronously. It is suitable for this preview; production submission needs a durability acknowledgement and a visible recovery path for storage failures before promising that a report is safely queued. Local photo URIs may expire. No automatic upload or offline synchronization is claimed by the UI.

## Manual device checks

- Allow and deny camera and location permissions.
- Capture a photo and select a library image.
- Save a report, restart, and inspect its content and image.
- Inspect map positioning and tap markers on both platforms.
- Test long text, small screens, large accessibility text, and keyboard behavior.
- Open a known and unknown issue deep link.
