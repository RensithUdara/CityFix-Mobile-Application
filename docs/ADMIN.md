# CityFix administration

The consumer app and `admin-web/` are separate applications. The React/Vite dashboard uses the same Firebase project and Firebase Authentication accounts. It provides live insights, server report search, moderation with required decision notes, flag review, audit history, webhook configuration and delivery logs.

## Run

```sh
cd admin-web
npm install
npm run dev
```

Copy `admin-web/.env.example` to `.env.local` and supply the Firebase web configuration when setting up another checkout. This workspace is configured from the existing project. Client configuration is not an admin credential. `npm run build` creates a static production build in `admin-web/dist`.

## Activate the first administrator

Create a normal Firebase Authentication account through CityFix, then from the repository root run:

```sh
node scripts/firebase-admin.cjs grant-admin administrator@example.com
```

The trusted helper uses the existing Firebase CLI session and checks the account exists. It writes `admin/{uid}` with `role: "admin"`, `active: true`, email and update time. No password or service-account key is stored in Firestore. Ordinary clients cannot write these records. Both server functions and Firestore rules check the current document, so revocation does not depend on an old custom claim expiring.

```sh
node scripts/firebase-admin.cjs revoke-admin administrator@example.com
```

No account has been automatically promoted. The project owner must select the email. Existing custom claims alone no longer grant moderation access.

## Search and map behavior

Advanced search executes on the server over all reports in pages of 200 scanned records. Terms match title, description, address and reference; category, status, severity and inclusive date filters are combined. Continue searching when a cursor is returned, including when a scanned page has zero matches. This bounded scan supports existing reports without a migration; it is not a dedicated full-text index. At larger scale, replace scans with a search service. Mobile sort-by-confirmations applies to fetched matches.

Native and web maps group reports into approximately 60-pixel Mercator grid cells as zoom changes. Selecting a group zooms in; coincident reports remain accessible in the map's report list. Maps show loaded reports, not a global geospatial index.

## Webhooks

Admins register public HTTPS endpoints on port 443 for `issue.created`, `issue.status_changed`, and `issue.deleted`. A secret is returned once and stored in a server-only collection. Each delivery contains an event ID, type and public report payload. Receivers must validate `X-CityFix-Signature` as HMAC-SHA256 of `${timestamp}.${rawBody}` using the signing secret; `X-CityFix-Timestamp` supplies the timestamp. Reject stale timestamps (for example over five minutes), use constant-time signature comparison, and deduplicate `X-CityFix-Id`.

Only 2xx responses count as success. Requests time out after 10 seconds, do not follow redirects, and resolve public IPv4 addresses that are pinned for the request. Local/private/metadata addresses are rejected. IPv6-only receivers are not currently supported. Five total attempts use exponential delays; a five-minute scheduler processes pending deliveries. Disabling a webhook cancels pending deliveries; an already-running request may still complete. Delivery is at least once, so receivers must tolerate duplicates. Failed deliveries are visible in the dashboard; creating a replacement endpoint does not replay old events.

Secrets are excluded from client reads. Delivery history currently retains event payloads without automatic expiry and the dashboard displays the latest 100 records. Configure a retention policy appropriate to your deployment. Webhooks only receive events occurring after registration.

## Deployment

```sh
firebase deploy --only "functions,firestore" --force
```

Serve `admin-web/dist` on your chosen HTTPS host and add that domain to Firebase Authentication's authorized domains. The dashboard is built locally; hosting is a separate operation.
