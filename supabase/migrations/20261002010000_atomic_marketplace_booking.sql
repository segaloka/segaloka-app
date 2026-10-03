create or replace function public.create_marketplace_booking(
  p_departure_id uuid,
  p_passenger_names text[],
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_departure public.departures%rowtype;
  v_package public.packages%rowtype;
  v_booking_id uuid;
  v_pax_count integer;
  v_name text;
  v_total numeric;
  v_booking_code text;
  v_invoice_number text;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  v_pax_count := coalesce(array_length(p_passenger_names, 1), 0);
  if v_pax_count < 1 or v_pax_count > 100 then raise exception 'INVALID_PAX_COUNT'; end if;
  if exists (select 1 from unnest(p_passenger_names) as passenger_name where nullif(btrim(passenger_name), '') is null)
    then raise exception 'PASSENGER_NAME_REQUIRED'; end if;

  select * into v_departure from public.departures where id = p_departure_id for update;
  if not found or v_departure.status not in ('open', 'almost_full') then raise exception 'DEPARTURE_NOT_AVAILABLE'; end if;

  select * into v_package from public.packages where id = v_departure.package_id and status = 'published';
  if not found then raise exception 'PACKAGE_NOT_AVAILABLE'; end if;
  if v_departure.quota - v_departure.filled < v_pax_count then raise exception 'INSUFFICIENT_QUOTA'; end if;

  v_total := v_package.base_price * v_pax_count;
  v_booking_code := 'SLK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_invoice_number := 'INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  insert into public.bookings (code, org_id, departure_id, traveler_user_id, pax_count, total_amount, notes)
  values (v_booking_code, v_package.org_id, p_departure_id, v_user_id, v_pax_count, v_total, nullif(btrim(p_notes), ''))
  returning id into v_booking_id;

  foreach v_name in array p_passenger_names loop
    insert into public.booking_passengers (booking_id, full_name) values (v_booking_id, btrim(v_name));
  end loop;

  insert into public.invoices (booking_id, number, amount, due_date)
  values (v_booking_id, v_invoice_number, v_total, current_date + 3);

  update public.departures
  set filled = filled + v_pax_count,
      status = case
        when filled + v_pax_count >= quota then 'full'
        when filled + v_pax_count >= greatest(1, ceil(quota * 0.8)::integer) then 'almost_full'
        else status
      end
  where id = p_departure_id;

  return v_booking_id;
end;
$$;

revoke execute on function public.create_marketplace_booking(uuid, text[], text) from public, anon;
grant execute on function public.create_marketplace_booking(uuid, text[], text) to authenticated;
