create or replace function public.get_order_summary(p_timezone text default 'Asia/Jakarta')
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with today_orders as (
    select status
    from public.orders
    where created_at >= (date_trunc('day', now() at time zone p_timezone) at time zone p_timezone)
      and created_at < ((date_trunc('day', now() at time zone p_timezone) + interval '1 day') at time zone p_timezone)
  ), paid_orders as (
    select total_amount
    from public.orders
    where payment_status = 'paid'
  )
  select jsonb_build_object(
    'total', (select count(*) from today_orders),
    'new', (select count(*) filter (where status = 'new') from today_orders),
    'preparing', (select count(*) filter (where status = 'preparing') from today_orders),
    'finished', (select count(*) filter (where status = 'finished') from today_orders),
    'cancelled', (select count(*) filter (where status = 'cancelled') from today_orders),
    'revenue', coalesce((select sum(total_amount) from paid_orders), 0)
  );
$$;

revoke all on function public.get_order_summary(text) from public, anon, authenticated;
grant execute on function public.get_order_summary(text) to service_role;
