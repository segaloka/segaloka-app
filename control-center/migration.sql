-- SEGALOKA Control Center · schema v1
-- Dipisah di schema `control_center` agar tidak mengubah skema produk di `public`.
create schema if not exists control_center;
revoke all on schema control_center from anon, authenticated;
-- Setiap entitas disimpan sebagai dokumen jsonb (sumber kebenaran untuk UI) + kolom bertipe
-- yang di-generate dari dokumen (untuk query, index, dan constraint aturan bisnis).

create or replace function control_center.sg_doc_table(t text, cols text) returns void language plpgsql as $f$
begin
  execute format('create table if not exists control_center.%I (
    id text primary key,
    data jsonb not null check (jsonb_typeof(data) = ''object'' and data->>''id'' = id),
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()%s)', t, cols);
  execute format('create index if not exists %I on control_center.%I (updated_at)', t || '_updated_idx', t);
  execute format('alter table control_center.%I enable row level security', t);
  execute format('revoke all on control_center.%I from anon, authenticated', t);
end $f$;

select control_center.sg_doc_table('travels', $c$,
  name text generated always as (data->>'name') stored,
  city text generated always as (data->>'city') stored,
  status text generated always as (data->>'op') stored check (status in ('active','review','inactive')),
  legal_status text generated always as (data->>'legal') stored check (legal_status in ('draft','submitted','under_review','verified','expiring','rejected','expired')),
  payment_mode text generated always as (data->>'payMode') stored check (payment_mode in ('DIRECT_TO_TRAVEL','VIA_SEGALOKA')),
  plan text generated always as (data#>>'{sub,plan}') stored,
  subscription_state text generated always as (data#>>'{sub,state}') stored check (subscription_state in ('pending','trial','active','grace','suspended','expired','cancelled')),
  branch_quota int generated always as ((data#>>'{branch,quota}')::int) stored check (branch_quota >= 2)$c$);

-- Mitra Travel terikat ke tepat SATU Travel (kolom tunggal, wajib).
select control_center.sg_doc_table('mitra', $c$,
  name text generated always as (data->>'name') stored,
  travel_id text generated always as (data->>'travel') stored not null,
  status text generated always as (data->>'status') stored$c$);

select control_center.sg_doc_table('vendors', $c$,
  name text generated always as (data->>'name') stored,
  verification text generated always as (data->>'verif') stored check (verification in ('draft','submitted','under_review','verified','rejected')),
  status text generated always as (data->>'status') stored$c$);

-- Affiliate boleh terhubung ke banyak Travel (array), terpisah dari Vendor & Mitra.
select control_center.sg_doc_table('affiliates', $c$,
  name text generated always as (data->>'name') stored,
  code text generated always as (data->>'code') stored,
  status text generated always as (data->>'status') stored$c$);

select control_center.sg_doc_table('travelers', $c$,
  name text generated always as (data->>'name') stored$c$);

select control_center.sg_doc_table('packages', $c$,
  name text generated always as (data->>'name') stored,
  travel_id text generated always as (data->>'travel') stored,
  category text generated always as (data->>'cat') stored,
  price numeric generated always as ((data->>'price')::numeric) stored,
  status text generated always as (data->>'state') stored check (status in ('draft','review','published','unpublished','archived'))$c$);

select control_center.sg_doc_table('bookings', $c$,
  travel_id text generated always as (data->>'travel') stored,
  traveler_id text generated always as (data->>'traveler') stored,
  package_id text generated always as (data->>'pkg') stored,
  total numeric generated always as ((data->>'total')::numeric) stored,
  paid numeric generated always as ((data->>'paid')::numeric) stored,
  status text generated always as (data->>'state') stored check (status in ('created','awaiting_payment','partially_paid','confirmed','processing','ready','departed','completed','cancelled','refund_requested','refunded','failed'))$c$);

select control_center.sg_doc_table('payments', $c$,
  booking_id text generated always as (data->>'booking') stored,
  travel_id text generated always as (data->>'travel') stored,
  amount numeric generated always as ((data->>'amount')::numeric) stored,
  provider text generated always as (data->>'provider') stored,
  flow text generated always as (data->>'flow') stored check (flow in ('DIRECT_TO_TRAVEL','VIA_SEGALOKA')),
  status text generated always as (data->>'status') stored check (status in ('pending','paid','failed','expired','refunded')),
  recon_status text generated always as (data->>'recon') stored check (recon_status in ('pending','reconciled','unmatched','mismatch'))$c$);

select control_center.sg_doc_table('settlements', $c$,
  travel_id text generated always as (data->>'travel') stored,
  net numeric generated always as ((data->>'net')::numeric) stored,
  status text generated always as (data->>'state') stored check (status in ('scheduled','processing','settled','hold','failed'))$c$);

select control_center.sg_doc_table('withdrawals', $c$,
  party_type text generated always as (data->>'partyType') stored check (party_type in ('Vendor','Travel','Affiliate')),
  amount numeric generated always as ((data->>'amount')::numeric) stored,
  status text generated always as (data->>'state') stored check (status in ('pending','approved','disbursed','hold','rejected'))$c$);

select control_center.sg_doc_table('refunds', $c$,
  booking_id text generated always as (data->>'booking') stored,
  amount numeric generated always as ((data->>'amount')::numeric) stored,
  status text generated always as (data->>'state') stored check (status in ('pending','refunded','rejected'))$c$);

select control_center.sg_doc_table('campaigns', $c$,
  name text generated always as (data->>'name') stored,
  owner_travel_id text generated always as (data->>'owner') stored,
  budget numeric generated always as ((data->>'budget')::numeric) stored,
  spent numeric generated always as ((data->>'spent')::numeric) stored,
  status text generated always as (data->>'state') stored check (status in ('draft','review','scheduled','active','paused','completed','archived'))$c$);

select control_center.sg_doc_table('conversations', $c$,
  channel text generated always as (data->>'channel') stored,
  contact text generated always as (data->>'contact') stored,
  assignee text generated always as (data->>'assignee') stored,
  status text generated always as (data->>'status') stored check (status in ('open','pending','resolved','closed'))$c$);

select control_center.sg_doc_table('approvals', $c$,
  domain text generated always as (data->>'domain') stored,
  type text generated always as (data->>'type') stored,
  priority text generated always as (data->>'priority') stored check (priority in ('p1','p2','p3')),
  risk int generated always as ((data->>'risk')::int) stored,
  status text generated always as (data->>'status') stored check (status in ('waiting','in_progress','needs_revision','approved','rejected'))$c$);

create index if not exists bookings_travel_idx on control_center.bookings (travel_id);
create index if not exists payments_booking_idx on control_center.payments (booking_id);
create index if not exists packages_travel_idx on control_center.packages (travel_id);
create index if not exists approvals_status_idx on control_center.approvals (status, priority);

-- Koleksi lain (konfigurasi, operasional, ads, omnichannel, dsb.)
create table if not exists control_center.records (
  collection text not null,
  id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  is_demo boolean not null default false,
  name text generated always as (data->>'name') stored,
  state text generated always as (coalesce(data->>'state', data->>'status')) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
create index if not exists records_updated_idx on control_center.records (updated_at);
alter table control_center.records enable row level security;
revoke all on control_center.records from anon, authenticated;

create table if not exists control_center.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table control_center.settings enable row level security;
revoke all on control_center.settings from anon, authenticated;

-- Audit log: append-only.
create table if not exists control_center.audit_log (
  id text primary key,
  ts timestamptz not null,
  actor text not null,
  action text not null,
  resource text not null,
  result text not null default 'success',
  source text,
  before text,
  after text,
  reason text,
  is_demo boolean not null default false,
  inserted_at timestamptz not null default now()
);
create index if not exists audit_ts_idx on control_center.audit_log (ts desc);
create index if not exists audit_inserted_idx on control_center.audit_log (inserted_at);
alter table control_center.audit_log enable row level security;
revoke all on control_center.audit_log from anon, authenticated;

create or replace function control_center.sg_audit_append_only() returns trigger language plpgsql set search_path = '' as $f$
begin raise exception 'audit_log is append-only'; end $f$;
drop trigger if exists audit_no_update on control_center.audit_log;
create trigger audit_no_update before update or delete on control_center.audit_log for each row execute function control_center.sg_audit_append_only();
drop trigger if exists audit_no_truncate on control_center.audit_log;
create trigger audit_no_truncate before truncate on control_center.audit_log for each statement execute function control_center.sg_audit_append_only();

drop function control_center.sg_doc_table(text, text);

-- v2: Agen (Travel -> Mitra Travel -> Agen)
create table if not exists control_center.agen (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text generated always as (data->>'name') stored,
  mitra_id text generated always as (data->>'mitra') stored not null,
  travel_id text generated always as (data->>'travel') stored not null,
  status text generated always as (data->>'status') stored check (status in ('active','review','inactive'))
);
create index if not exists agen_updated_idx on control_center.agen (updated_at);
create index if not exists agen_mitra_idx on control_center.agen (mitra_id);
alter table control_center.agen enable row level security;
revoke all on control_center.agen from anon, authenticated;
create or replace function control_center.sg_agen_check() returns trigger language plpgsql set search_path = '' as $f$
declare mt text;
begin
  select m.data->>'travel' into mt from control_center.mitra m where m.id = new.data->>'mitra';
  if mt is null then raise exception 'Agen % harus terikat ke Mitra Travel yang ada (mitra=%)', new.id, new.data->>'mitra'; end if;
  if mt is distinct from new.data->>'travel' then raise exception 'Agen %: travel % tidak sama dengan travel Mitra % (%)', new.id, new.data->>'travel', new.data->>'mitra', mt; end if;
  return new;
end $f$;
drop trigger if exists agen_hierarchy on control_center.agen;
create trigger agen_hierarchy before insert or update on control_center.agen for each row execute function control_center.sg_agen_check();
create or replace function control_center.sg_mitra_travel_lock() returns trigger language plpgsql set search_path = '' as $f$
begin
  if (old.data->>'travel') is distinct from (new.data->>'travel') and exists (select 1 from control_center.agen a where a.data->>'mitra' = new.id) then
    raise exception 'Mitra % masih memiliki Agen; Travel tidak dapat diubah', new.id;
  end if;
  return new;
end $f$;
drop trigger if exists mitra_travel_lock on control_center.mitra;
create trigger mitra_travel_lock before update on control_center.mitra for each row execute function control_center.sg_mitra_travel_lock();
