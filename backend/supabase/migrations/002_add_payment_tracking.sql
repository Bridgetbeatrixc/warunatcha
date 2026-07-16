alter table public.orders
  add column if not exists payment_method text not null default 'BCA'
    check (payment_method in ('BCA', 'OVO', 'GoPay', 'SeaBank')),
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid'));

create index if not exists orders_payment_status_idx on public.orders (payment_status);
