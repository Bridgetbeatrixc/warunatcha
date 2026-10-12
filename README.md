# Warunatcha

Online menu and ordering site for Warunatcha, a matcha drink shop, with an admin dashboard for managing orders.

**Live site:** https://warunatcha-umber.vercel.app

## Features

- **Menu and basket:** customers customise each drink (seasonal add-on, sugar level, milk, ice and matcha service) and build a basket with a running total.
- **Checkout to WhatsApp:** the order is saved to the database, then sent to the shop as a pre-filled WhatsApp message with the order number, items, address and payment method (BCA, OVO, GoPay or SeaBank).
- **Admin dashboard (`/admin`):** staff sign in with Supabase Auth to see incoming orders, move them through new → preparing → finished, mark payments as paid and view a paid-revenue summary.
- **Secure by design:** the Supabase secret key lives only in the Cloudflare Worker; admin endpoints require a bearer token from an allow-listed admin email; public signup is disabled.

## Tech stack

| Part | Stack |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, deployed on Vercel |
| Backend API | Hono on Cloudflare Workers, TypeScript, Vitest |
| Database & auth | Supabase (PostgreSQL with SQL migrations, Supabase Auth) |

## Project structure

```text
frontend/   React + Vite customer site and /admin dashboard
backend/    Cloudflare Worker API (Hono), tests and Supabase migrations
```

## Running locally

```bash
npm install --prefix frontend
npm install --prefix backend
npm run dev            # frontend
npm run dev:backend    # API worker
npm run test:backend   # API tests
```

See [backend/README.md](backend/README.md) for Supabase and Cloudflare setup and the API endpoints.
