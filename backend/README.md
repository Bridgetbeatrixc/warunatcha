# Warunatcha Cloudflare Worker

This Worker saves customer orders to Supabase and exposes protected order-management endpoints for the `/admin` dashboard.

## Supabase setup

1. Rotate the database password that was shared in chat. The Worker does not need that password.
2. Run `supabase/migrations/001_create_orders.sql` in the Supabase SQL editor.
3. Disable public user signup in Supabase Auth and create the administrator account manually.
4. Copy `.dev.vars.example` to `.dev.vars` for local development.
5. Use the project URL and a Supabase secret/service-role key. Never use the secret key in the frontend.

## Cloudflare setup

Update `FRONTEND_ORIGINS` and `ADMIN_EMAILS` in `wrangler.jsonc`, then configure encrypted secrets:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SECRET_KEY
```

Install and verify locally:

```bash
npm install
npm run typecheck
npm test
npm run dev
```

Deploy with `npm run deploy`. Add the resulting Worker URL to the frontend as `VITE_API_URL`.

## API

- `GET /api/health`
- `POST /api/orders`
- `GET /api/orders` (admin bearer token required)
- `GET /api/orders/summary` (admin bearer token required)
- `PATCH /api/orders/:id/status` (admin bearer token required)
