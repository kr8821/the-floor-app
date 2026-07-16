# Mainstreet — member-first chamber of commerce software

Phase-1 MVP scaffold. See `../docs/chamber-software-research.md` for the market
research and `../docs/chamber-product-spec.md` for the full product spec.
Clickable design mockups live in `../docs/mockups/chamber-mockups.html`.

## What works today

- **Public site** (per-chamber, SEO-friendly server rendering):
  - `/` — chamber home with featured members, latest jobs, upcoming events
  - `/directory` — searchable directory with category filters
  - `/directory/[slug]` — business profile; every render logs a `ProfileView`
    row, which is what powers the member ROI dashboard
  - `/jobs` — job board (live posts only)
  - `/events` — community calendar (chamber + approved member-submitted events)
- **Member portal** (`/portal`, sign in at `/login`):
  - ROI dashboard — profile views this month vs last, clicks, applicants,
    6-month views chart
  - Edit public profile (live immediately)
  - Post jobs (enter the chamber's approval queue)
- **Chamber admin** (`/admin`):
  - Overview: member count, renewals due, at-risk members (renewal soon +
    low directory activity), live jobs
  - Approval queue for member-submitted jobs and events

## Run it

```bash
cd chamber-app
cp .env.example .env
npm install
npm run setup     # prisma generate + db push + seed demo data
npm run dev       # http://localhost:3000
```

Demo sign-in is at `/login` — pick "Harbor Coffee Roasters" to see the member
ROI dashboard with seeded analytics, or sign in as chamber staff for the admin
view with a populated approval queue.

## Architecture notes

- **Multi-tenant by design.** Every row carries `chamberId`; `src/lib/tenant.js`
  resolves the current chamber (dev: `CHAMBER_SLUG` env or first chamber;
  prod: subdomain/custom-domain from the host header).
- **SQLite in dev, Postgres in prod.** The Prisma schema avoids SQLite-only
  types; switch `provider` to `postgresql` and set `DATABASE_URL`.
- **Demo auth.** `/login` sets a role cookie. Production swaps this for email
  magic links; `getSession()` call sites don't change.
- **Analytics are append-only.** `ProfileView` rows are written on profile
  render and aggregated at read time; at scale, roll up nightly into a
  monthly summary table.

## Not built yet (per spec, deliberately)

Stripe dues billing · renewal automation · monthly ROI email · event
registration · deals management UI · reports/CSV export · real auth ·
non-member paid job posts · embeddable widgets.
