create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) between 8 and 20),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total_amount integer not null check (total_amount >= 0),
  whatsapp_message text not null default '',
  status text not null default 'new' check (status in ('new', 'preparing', 'finished', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz,
  cancelled_at timestamptz
);

create index if not exists orders_status_created_at_idx on public.orders (status, created_at desc);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
grant all on table public.orders to service_role;

create or replace function public.get_order_summary(p_timezone text default 'Asia/Jakarta')
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with today_orders as (
    select status, total_amount
    from public.orders
    where created_at >= (date_trunc('day', now() at time zone p_timezone) at time zone p_timezone)
      and created_at < ((date_trunc('day', now() at time zone p_timezone) + interval '1 day') at time zone p_timezone)
  )
  select jsonb_build_object(
    'total', count(*),
    'new', count(*) filter (where status = 'new'),
    'preparing', count(*) filter (where status = 'preparing'),
    'finished', count(*) filter (where status = 'finished'),
    'cancelled', count(*) filter (where status = 'cancelled'),
    'revenue', coalesce(sum(total_amount) filter (where status = 'finished'), 0)
  )
  from today_orders;
$$;

revoke all on function public.get_order_summary(text) from public, anon, authenticated;
grant execute on function public.get_order_summary(text) to service_role;
