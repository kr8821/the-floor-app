# Chamber Platform — Product Spec (v1)

Working name: **Mainstreet** (placeholder — easy to change).

## Positioning

Member-first chamber of commerce software. The public directory and the member
business portal are the product; the chamber back office supports them.
Undercuts ChamberMaster/GrowthZone (~$330/mo) at $99–$149/mo, priced by
features rather than contact counts.

## Tenancy model

Multi-tenant, single deployment. Each chamber is a **tenant** with:
- a subdomain (`springfield.mainstreet.app`) and optional custom domain
- its own branding (logo, accent color), members, content, and settings

All data rows carry `chamberId`. No cross-tenant reads, ever.

## Roles

| Role | Who | Can do |
|---|---|---|
| `visitor` | The public | Browse directory, jobs, events, deals. Apply/inquire. |
| `member` | Staff at a member business | Edit their business profile, post jobs/deals/events, view ROI stats, register for events. |
| `chamber_admin` | Chamber staff | Everything: approve members/content, manage CRM, billing, events, email, reports. |
| `super_admin` | Us (platform operator) | Create/manage tenants. |

## Data model (core entities)

```
Chamber        id, slug, name, logoUrl, accentColor, city, state, plan
User           id, email, name, role, chamberId, businessId?
Business       id, chamberId, name, slug, category, description, address,
               phone, website, hours, logoUrl, photos[], tier (basic|enhanced|featured),
               status (pending|active|lapsed), joinedAt, renewsAt
Membership     id, businessId, tierId, amountCents, status, startsAt, renewsAt
MembershipTier id, chamberId, name, priceCents, interval, benefits[]
Job            id, businessId, chamberId, title, description, type, payRange?,
               applyUrl|applyEmail, status, postedAt, expiresAt, isNonMemberPost
Deal           id, businessId, chamberId, title, description, startsAt, endsAt, status
Event          id, chamberId, businessId?, title, description, startsAt, endsAt,
               location, capacity?, priceCents?, status (chamber event vs member-submitted)
Registration   id, eventId, userId|guestEmail, status, paidCents
ProfileView    id, businessId, kind (view|click|call|direction), occurredAt   ← powers ROI
Invoice        id, businessId, amountCents, kind (dues|job_post|upgrade|sponsorship),
               status, dueAt, paidAt, stripeInvoiceId
```

Analytics events (`ProfileView`) are append-only and aggregated nightly into
per-business monthly rollups for the ROI dashboard/email.

## Pages — public site (per chamber, SEO is the point)

| Route | Page |
|---|---|
| `/` | Chamber home: hero, featured businesses, upcoming events, latest jobs |
| `/directory` | Searchable/filterable business directory (category, keyword, map) |
| `/directory/[slug]` | Business profile — the SEO money page. Photos, hours, map, contact, jobs & deals by this business |
| `/jobs` | Job board, filter by category/type |
| `/jobs/[id]` | Job detail + apply |
| `/events` | Community calendar (chamber + member-submitted) |
| `/events/[id]` | Event detail + registration |
| `/deals` | Member deals/coupons |
| `/join` | Membership tiers + signup application |

## Pages — member portal (`/portal`)

| Route | Page |
|---|---|
| `/portal` | **ROI dashboard**: profile views, clicks, job applicants, events attended this month + trend. Renewal status. |
| `/portal/profile` | Edit business profile (live preview) |
| `/portal/jobs` | Manage job posts (create, repost, expire) |
| `/portal/deals` | Manage deals |
| `/portal/events` | Submit events; see registrations for own events |
| `/portal/billing` | Membership tier, invoices, payment method (Stripe) |

## Pages — chamber admin (`/admin`)

| Route | Page |
|---|---|
| `/admin` | Overview: members up for renewal, pending approvals, revenue MTD, at-risk members |
| `/admin/members` | CRM: list/search, statuses, notes, add member, approve applications |
| `/admin/approvals` | Moderation queue: new profiles, jobs, deals, member-submitted events |
| `/admin/events` | Create/manage chamber events, registrations, check-in |
| `/admin/billing` | Dues runs, invoices, tier management |
| `/admin/email` | Segmented sends (v1: simple blast to segments; sponsorship slots v2) |
| `/admin/reports` | Retention curve, revenue by source (dues vs non-dues), engagement scores, CSV export everywhere |
| `/admin/settings` | Branding, domains, membership tiers, directory categories |

## v1 scope decisions

- **In:** directory, profiles, portal, job board, deals, events + free registration,
  approval queues, member CRM, Stripe dues invoicing, ROI dashboard + monthly email, CSV exports.
- **Out (v2+):** paid event ticketing, newsletter sponsorship marketplace, mobile apps,
  community forum, LMS, multi-chapter, advocacy tracking, embeddable widgets
  (embeds are high-value — first item on the v2 list).
- **Auth:** email magic links (no passwords to support). Admins can impersonate members for support.
- **Payments:** Stripe. Dues = Stripe subscriptions/invoices; one-off (non-member job post) = Checkout.
- **Non-dues revenue in v1:** non-member job posting fee + enhanced/featured listing upgrades. Both self-serve.

## Engagement scoring (retention flag)

Simple v1 heuristic per business, computed monthly:
`score = profile_completeness + recency(last login) + activity(jobs/deals/events posted) + attendance`.
Businesses in the bottom quartile with a renewal inside 90 days surface on the
admin overview as **at-risk** — the chamber calls them before they lapse.

## Stack

- **Next.js (App Router)** — server rendering for directory SEO
- **Postgres** via **Prisma** (SQLite in dev, Postgres in prod — same schema)
- **Stripe** for billing, **Resend** for email
- **Tailwind** for UI
- Hosted on Vercel/Railway; wildcard subdomain routing by tenant slug

## Pricing (draft)

| Plan | Price | For |
|---|---|---|
| Starter | $79/mo | Volunteer-run chambers: directory, portal, jobs, events |
| Standard | $129/mo | + billing/dues automation, ROI emails, reports |
| Pro | $199/mo | + custom domain, featured-listing revenue tools, priority support |

All plans: unlimited members/contacts. That single line is a sales weapon
against per-contact pricing.
