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
