# Backend

Small Express API for saving customer orders before the frontend opens WhatsApp.

## Setup

1. Copy `.env.example` to `.env`.
2. Add Supabase credentials when ready.
3. Run `npm install`.
4. Run `npm run dev`.

If Supabase credentials are not set, orders are saved locally to `backend/data/orders.json` for development.

## Supabase Table

Run this SQL in Supabase:

```sql
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  items jsonb not null,
  total_amount integer not null default 0,
  whatsapp_message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
```
