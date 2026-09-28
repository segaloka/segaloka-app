-- SEGALOKA Omnichannel v1: real channel connections (Meta WhatsApp / Messenger / Instagram, Telegram)
create extension if not exists pg_net;
create extension if not exists pgcrypto;

-- Channel credentials. `secrets` is write-only from the dashboard (never selected back to the page).
create table if not exists control_center.channel_accounts (
  id text primary key,                          -- wa | fb | ig | tg
  channel text not null,
  config jsonb not null default '{}'::jsonb,    -- non-secret: phone_number_id, waba_id, page_id, display, queue ...
  secrets jsonb not null default '{}'::jsonb,   -- access_token, app_secret, page_token, bot_token
  verify_token text not null default encode(gen_random_bytes(18), 'hex'),
  status text not null default 'pending',       -- pending | validating | active | error | disconnected
  last_error text,
  last_event_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists control_center.outbox (
  id text primary key,
  conversation text not null,
  channel text not null,
  recipient text not null,
  text text,
  template jsonb,
  status text not null default 'queued',        -- queued | sent | delivered | read | failed
  provider_msg_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists outbox_provider_idx on control_center.outbox (provider_msg_id);
create table if not exists control_center.omni_secrets (key text primary key, value text not null);
insert into control_center.omni_secrets (key, value) values ('hook_key', encode(gen_random_bytes(24), 'hex')) on conflict (key) do nothing;
insert into control_center.omni_secrets (key, value) values ('fn_url', 'https://lcfjqhnimbigwiqkrapm.supabase.co/functions/v1/omni') on conflict (key) do nothing;

alter table control_center.channel_accounts enable row level security;
alter table control_center.outbox enable row level security;
alter table control_center.omni_secrets enable row level security;
revoke all on control_center.channel_accounts, control_center.outbox, control_center.omni_secrets from anon, authenticated;

-- DB -> Edge Function calls (pg_net, async)
create or replace function control_center.sg_omni_call(route text, rec_id text) returns void language plpgsql security definer as $$
declare u text; k text;
begin
  select value into u from control_center.omni_secrets where key = 'fn_url';
  select value into k from control_center.omni_secrets where key = 'hook_key';
  perform net.http_post(url := u || route, body := jsonb_build_object('id', rec_id),
                        headers := jsonb_build_object('content-type', 'application/json', 'x-sg-key', k));
end $$;

create or replace function control_center.sg_outbox_dispatch() returns trigger language plpgsql security definer as $$
begin
  if new.status = 'queued' then perform control_center.sg_omni_call('/internal/send', new.id); end if;
  return new;
end $$;
drop trigger if exists outbox_dispatch on control_center.outbox;
create trigger outbox_dispatch after insert on control_center.outbox for each row execute function control_center.sg_outbox_dispatch();

create or replace function control_center.sg_channel_validate() returns trigger language plpgsql security definer as $$
begin
  if new.status = 'validating' then perform control_center.sg_omni_call('/internal/validate', new.id); end if;
  return new;
end $$;
drop trigger if exists channel_validate on control_center.channel_accounts;
create trigger channel_validate after insert or update of status, secrets, config on control_center.channel_accounts
  for each row when (new.status = 'validating') execute function control_center.sg_channel_validate();
