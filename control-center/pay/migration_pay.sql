-- SEGALOKA Payment Gateway core (idempoten): pembayaran MASUK terkonfirmasi otomatis dari webhook gateway.
create table if not exists control_center.pay_outbox (
  id text primary key default ('POB-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12))),
  target_kind text not null check (target_kind in ('payment','sd_ledger')),
  target_id text not null,
  amount numeric not null,
  order_id text unique,
  provider text,
  status text not null default 'queued',
  checkout_url text,
  error text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pay_outbox_target on control_center.pay_outbox (target_kind, target_id);
alter table control_center.pay_outbox enable row level security;
revoke all on control_center.pay_outbox from anon, authenticated;

create or replace function control_center.sg_notify(p_to text, p_cat text, p_tone text, p_title text, p_sub text, p_route text) returns void
language sql security definer set search_path = '' as $f$
  insert into control_center.records (collection, id, data) select 'notifications', x.id, jsonb_build_object('id', x.id, 'to', p_to, 'cat', p_cat, 'tone', p_tone, 'title', p_title, 'sub', p_sub, 'route', p_route, 'ts', (extract(epoch from now()) * 1000)::bigint, 'unread', true)
  from (select 'NTF-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)) as id) x where p_to is not null
$f$;

create or replace function control_center.sg_gateway_paid(p_kind text, p_id text, p_amount numeric, p_ref text, p_provider text) returns text
language plpgsql security definer set search_path = '' as $f$
declare pay jsonb; bk jsonb; led jsonb; total numeric; newpaid numeric; st text; nid text; tid text; bal numeric; r record;
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  if p_kind = 'payment' then
    select data into pay from control_center.payments where id = p_id for update;
    if pay is null then return 'not_found'; end if;
    if pay->>'status' = 'paid' then return 'already'; end if;
    update control_center.payments set data = data || jsonb_build_object('status', 'paid', 'ts', now_ms, 'paidAmount', p_amount, 'gatewayRef', p_ref, 'provider', coalesce(nullif(p_provider, ''), data->>'provider'), 'recon', 'reconciled', 'auto', true), updated_at = now() where id = p_id;
    select data into bk from control_center.bookings where id = pay->>'booking' for update;
    if bk is not null then
      total := (bk->>'total')::numeric; newpaid := least(total, coalesce((bk->>'paid')::numeric, 0) + p_amount);
      st := case when bk->>'state' in ('created', 'awaiting_payment', 'partially_paid') then (case when newpaid >= total then 'confirmed' else 'partially_paid' end) else bk->>'state' end;
      update control_center.bookings set data = data || jsonb_build_object('paid', newpaid, 'state', st), updated_at = now() where id = bk->>'id';
      if newpaid < total and not exists (select 1 from control_center.payments where data->>'booking' = bk->>'id' and data->>'status' = 'pending') then
        nid := 'PAY-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
        insert into control_center.payments (id, data) values (nid, jsonb_build_object('id', nid, 'booking', bk->>'id', 'travel', bk->>'travel', 'payer', bk->>'traveler', 'amount', total - newpaid, 'provider', coalesce(nullif(p_provider, ''), pay->>'provider'), 'channel', 'Pelunasan', 'ref', coalesce(pay->>'ref', '') || '-2', 'status', 'pending', 'ts', now_ms, 'recon', 'pending', 'flow', bk->>'payMode', 'fee', 0));
      end if;
      perform control_center.sg_notify('traveler:' || (bk->>'traveler'), 'payment', 'ok', 'Pembayaran diterima', p_id || ' · Rp ' || to_char(p_amount, 'FM999G999G999G999'), '/p/traveler/bookings/' || (bk->>'id'));
      perform control_center.sg_notify('travel:' || (bk->>'travel'), 'payment', 'ok', 'Pembayaran masuk (otomatis)', (bk->>'id') || ' · Rp ' || to_char(p_amount, 'FM999G999G999G999'), '/p/travel/bookings/' || (bk->>'id'));
    end if;
  elsif p_kind = 'sd_ledger' then
    update control_center.records set data = data || jsonb_build_object('state', 'confirmed', 'confirmedAt', now_ms, 'gatewayRef', p_ref, 'auto', true), updated_at = now()
      where collection = 'sd_ledger' and id = p_id and data->>'state' = 'pending' returning data into led;
    if led is null then return 'already'; end if;
    tid := led->>'travel';
    for r in select id, data from control_center.records where collection = 'sd_ledger' and data->>'travel' = tid and data->>'kind' = 'fee' and data->>'state' = 'awaiting_deposit' order by (data->>'ts')::bigint loop
      select coalesce(sum(case when data->>'kind' = 'fee' then -(data->>'amount')::numeric else (data->>'amount')::numeric end), 0) into bal
        from control_center.records where collection = 'sd_ledger' and data->>'travel' = tid and data->>'state' = 'confirmed';
      exit when bal < (r.data->>'amount')::numeric;
      update control_center.records set data = data || jsonb_build_object('state', 'confirmed', 'settledAt', now_ms), updated_at = now() where collection = 'sd_ledger' and id = r.id;
      update control_center.bookings set data = data || jsonb_build_object('sdFeeState', 'paid'), updated_at = now() where id = r.data->>'booking';
    end loop;
    perform control_center.sg_notify('travel:' || tid, 'payment', 'ok', 'Deposit SegaDeals masuk (otomatis)', 'Rp ' || to_char(p_amount, 'FM999G999G999G999'), '/p/travel/segadeals');
  else return 'bad_kind'; end if;
  insert into control_center.audit_log (id, ts, actor, action, resource, result, source, after)
    values ('AUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12)), now(), 'System', 'webhook.payment.paid', case when p_kind = 'payment' then 'Payment/' else 'SegaDealsDeposit/' end || p_id, 'success', 'Gateway · ' || coalesce(p_provider, ''), coalesce(p_ref, '') || ' · ' || p_amount::text);
  update control_center.pay_outbox set status = 'paid', updated_at = now() where target_kind = p_kind and target_id = p_id;
  return 'ok';
end $f$;

create or replace function control_center.sg_gateway_failed(p_kind text, p_id text, p_status text) returns text
language plpgsql security definer set search_path = '' as $f$
begin
  if p_kind = 'payment' then
    update control_center.payments set data = data || jsonb_build_object('checkoutUrl', null, 'gatewayStatus', p_status), updated_at = now() where id = p_id and data->>'status' = 'pending';
  end if;
  update control_center.pay_outbox set status = p_status, updated_at = now() where target_kind = p_kind and target_id = p_id and status <> 'paid';
  return 'ok';
end $f$;
revoke all on function control_center.sg_gateway_paid(text, text, numeric, text, text) from public, anon, authenticated;
revoke all on function control_center.sg_gateway_failed(text, text, text) from public, anon, authenticated;
revoke all on function control_center.sg_notify(text, text, text, text, text, text) from public, anon, authenticated;
-- Bagian yang butuh pg_net + Vault (hanya di Supabase): trigger ke Edge Function "pay" & kunci gateway.
create extension if not exists pg_net;
create or replace function control_center.sg_pay_dispatch() returns trigger
language plpgsql security definer set search_path = '' as $f$
begin
  perform net.http_post(url := 'https://lcfjqhnimbigwiqkrapm.supabase.co/functions/v1/pay/create',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-sg-key', (select decrypted_secret from vault.decrypted_secrets where name = 'sg_omni_key')),
    body := jsonb_build_object('id', new.id));
  return new;
end $f$;
drop trigger if exists pay_dispatch on control_center.pay_outbox;
create trigger pay_dispatch after insert on control_center.pay_outbox for each row when (new.status = 'queued') execute function control_center.sg_pay_dispatch();

create or replace function control_center.sg_pay_set_secret(p_name text, p_value text) returns void
language plpgsql security definer set search_path = '' as $f$
declare sid uuid; nm text := 'pay_' || p_name;
begin
  if p_name not in ('midtrans_server_key', 'xendit_secret_key', 'xendit_callback_token') then raise exception 'secret tidak dikenal: %', p_name; end if;
  if coalesce(p_value, '') = '' then delete from vault.secrets where name = nm; return; end if;
  select id into sid from vault.secrets where name = nm;
  if sid is null then perform vault.create_secret(p_value, nm, 'SEGALOKA payment gateway'); else perform vault.update_secret(sid, p_value); end if;
end $f$;
revoke all on function control_center.sg_pay_set_secret(text, text) from public, anon, authenticated;
create or replace function control_center.sg_pay_secret_status() returns table(name text, is_set boolean, updated_at timestamptz)
language sql security definer set search_path = '' as $f$ select substr(s.name, 5), true, s.updated_at from vault.secrets s where s.name like 'pay\_%' $f$;
revoke all on function control_center.sg_pay_secret_status() from public, anon, authenticated;
insert into control_center.settings (key, value) values ('schema_gateway', '1'::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now();
