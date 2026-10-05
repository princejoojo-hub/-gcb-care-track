# GCB Care Track

A lightweight customer complaint transparency and tracking MVP designed as a portfolio/prototype project.

> **Important:** This is an independent prototype and is not an official GCB Bank system. Do not use real customer data, credentials, or confidential bank information.

## What it does

- Customers enter a ticket ID and see its current status.
- A visual timeline shows: Ticket Received → Under Review → Assigned to IT → Resolved.
- Customers see issue type, ticket creation date, last update, and a safe customer-facing update message.
- Staff can sign in to a protected dashboard and update ticket status and notes.
- Supabase provides the database and authentication.

## 7-day build

### Day 1–2
Build and polish the customer tracker UI.

### Day 3–4
Create Supabase project, run `supabase/schema.sql`, and add demo tickets.

### Day 5
Connect customer and staff pages to Supabase.

### Day 6
Deploy customer and admin pages to Netlify/Vercel.

### Day 7
Test, record a short demo, and prepare the pitch.

## Setup

1. Create a free Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy your Supabase Project URL and anon/publishable key.
4. Open `customer/app.js` and `admin/app.js` and replace the two config placeholders.
5. Create a staff account in Supabase Authentication > Users.
6. Add your first ticket in Table Editor > tickets.
7. Deploy the project folders.

## Recommended deployment

For the simplest phone workflow, deploy `customer/` as one site and `admin/` as another private/internal site. If you deploy both from one repository, configure separate site roots in your hosting provider.

## Suggested demo tickets

- `GCB-1001` — Pending
- `GCB-1002` — Under Review
- `GCB-1003` — Assigned to IT
- `GCB-1004` — Resolved

## Production improvements before any real bank use

- Use a backend/serverless function instead of exposing broad database access from a public client.
- Require a second verification factor before revealing complaint details.
- Add role-based staff permissions.
- Add audit logs for every staff update.
- Encrypt and minimize customer information.
- Add rate limiting, bot protection, monitoring, and formal security testing.
- Integrate only with approved bank systems/APIs.
