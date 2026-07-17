alter table public.orders
  add column if not exists customer_address text not null default '';
