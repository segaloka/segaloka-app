-- Canonical realtime/event boundary for Segaloka.
-- Business tables remain the source of truth; domain_events is an append-only integration stream.

create table if not exists public.domain_events (
  id bigint generated always as identity primary key,
  event_id uuid not null default gen_random_uuid() unique,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  org_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists domain_events_org_idx
  on public.domain_events(org_id, id desc);
create index if not exists domain_events_aggregate_idx
  on public.domain_events(aggregate_type, aggregate_id, id desc);
create index if not exists domain_events_type_idx
  on public.domain_events(event_type, id desc);

alter table public.domain_events enable row level security;

create policy domain_events_select on public.domain_events
for select to authenticated
using (
  public.is_platform_admin()
  or (org_id is not null and public.is_org_member(org_id))
  or actor_user_id = auth.uid()
);

create or replace function public.sg_emit_domain_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_old jsonb;
  v_id uuid;
  v_org uuid;
  v_event text;
  v_payload jsonb;
begin
  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
    v_old := null;
  else
    v_row := to_jsonb(new);
    if tg_op = 'UPDATE' then v_old := to_jsonb(old); end if;
  end if;

  begin
    v_id := nullif(v_row->>'id','')::uuid;
  exception when others then
    v_id := null;
  end;

  begin
    v_org := nullif(v_row->>'org_id','')::uuid;
  exception when others then
    v_org := null;
  end;

  v_event := lower(tg_table_name) || '.' || lower(tg_op);
  v_payload := jsonb_build_object('new', v_row);
  if v_old is not null then
    v_payload := v_payload || jsonb_build_object('old', v_old);
  end if;

  insert into public.domain_events(
    event_type, aggregate_type, aggregate_id, org_id, actor_user_id, payload
  ) values (
    v_event, tg_table_name, v_id, v_org, auth.uid(), v_payload
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.sg_emit_domain_event() from public, anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations',
    'vendors',
    'branches',
    'memberships',
    'affiliates',
    'affiliate_org_links',
    'mitra',
    'agen',
    'packages',
    'departures',
    'bookings',
    'payments',
    'invoices',
    'vendor_orders',
    'segadeals_requests',
    'segadeals_offers',
    'segadeals_deposits',
    'partner_earnings',
    'partner_withdrawals',
    'refunds',
    'settlements',
    'approvals',
    'notifications',
    'subscriptions',
    'websites',
    'website_pages'
  ]
  loop
    execute format('drop trigger if exists sg_domain_event on public.%I', t);
    execute format(
      'create trigger sg_domain_event after insert or update or delete on public.%I for each row execute function public.sg_emit_domain_event()',
      t
    );
  end loop;
end $$;

-- Publish canonical tables for Supabase Postgres Changes.
-- Guard each add because Supabase may already publish selected tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations',
    'vendors',
    'branches',
    'memberships',
    'affiliates',
    'affiliate_org_links',
    'mitra',
    'agen',
    'packages',
    'departures',
    'bookings',
    'payments',
    'invoices',
    'vendor_orders',
    'segadeals_requests',
    'segadeals_offers',
    'segadeals_deposits',
    'partner_earnings',
    'partner_withdrawals',
    'refunds',
    'settlements',
    'approvals',
    'notifications',
    'subscriptions',
    'websites',
    'website_pages',
    'domain_events'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
