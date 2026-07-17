alter table public.orders
  add column if not exists packaging_amount integer not null default 0
    check (packaging_amount in (0, 5000));
