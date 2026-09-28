-- SEGALOKA Omnichannel v1: outbox pesan keluar, log event webhook, penyimpanan token di Vault.
-- Aman dijalankan ulang (idempoten). Tidak mengubah tabel yang sudah ada.
create extension if not exists pg_net;
create extension if not exists pgcrypto;

create table if not exists control_center.omni_outbox (
  id text primary key default ('OUT-' || upper(encode(gen_random_bytes(6), 'hex'))),
  channel text not null check (channel in ('wa','ig','fb','email','tg')),
  conv_id text,
  msg_ts bigint,
  to_addr text not null,
  kind text not null default 'text' check (kind in ('text','template','ping')),
  body jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','sending','sent','delivered','read','failed')),
  provider_id text,
  error text,
  attempts int not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists omni_outbox_provider on control_center.omni_outbox (provider_id);
create index if not exists omni_outbox_created on control_center.omni_outbox (created_at desc);

create table if not exists control_center.omni_events (
  id bigserial primary key,
  channel text,
  kind text,
  payload jsonb,
  ok boolean not null default true,
  error text,
  received_at timestamptz not null default now()
);
create index if not exists omni_events_recv on control_center.omni_events (channel, received_at desc);

alter table control_center.omni_outbox enable row level security;
alter table control_center.omni_events enable row level security;
revoke all on control_center.omni_outbox, control_center.omni_events from anon, authenticated;

-- kunci internal (acak) yang dipakai trigger untuk memanggil Edge Function 'omni'
do $$ begin
  if not exists (select 1 from vault.secrets where name = 'sg_omni_key') then
    perform vault.create_secret(encode(gen_random_bytes(24), 'hex'), 'sg_omni_key', 'SEGALOKA: kunci internal outbox -> edge function omni');
  end if;
end $$;

-- setiap pesan baru di outbox langsung dikirim oleh Edge Function
create or replace function control_center.sg_omni_dispatch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://lcfjqhnimbigwiqkrapm.supabase.co/functions/v1/omni/send',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-sg-key', (select decrypted_secret from vault.decrypted_secrets where name = 'sg_omni_key')),
    body := jsonb_build_object('id', new.id));
  return new;
end $$;
drop trigger if exists omni_dispatch on control_center.omni_outbox;
create trigger omni_dispatch after insert on control_center.omni_outbox
  for each row when (new.status = 'queued') execute function control_center.sg_omni_dispatch();

-- simpan / ganti token provider di Vault (nilai tidak pernah dibaca balik oleh aplikasi)
create or replace function control_center.sg_omni_set_secret(p_name text, p_value text) returns void
language plpgsql security definer set search_path = '' as $$
declare sid uuid; nm text := 'omni_' || p_name;
begin
  if p_name not in ('meta_access_token','meta_page_token','meta_ig_token','meta_app_secret','meta_verify_token',
                    'resend_api_key','telegram_bot_token','telegram_webhook_secret','email_inbound_key') then
    raise exception 'secret tidak dikenal: %', p_name;
  end if;
  if coalesce(p_value, '') = '' then
    delete from vault.secrets where name = nm; return;
  end if;
  select id into sid from vault.secrets where name = nm;
  if sid is null then perform vault.create_secret(p_value, nm, 'SEGALOKA omnichannel');
  else perform vault.update_secret(sid, p_value); end if;
end $$;
revoke all on function control_center.sg_omni_set_secret(text, text) from public, anon, authenticated;

-- status token (hanya ada/tidak + waktu), tanpa nilai
create or replace function control_center.sg_omni_secret_status()
returns table(name text, is_set boolean, updated_at timestamptz)
language sql security definer set search_path = '' as $$
  select substr(s.name, 6), true, s.updated_at from vault.secrets s where s.name like 'omni\_%'
$$;
revoke all on function control_center.sg_omni_secret_status() from public, anon, authenticated;
