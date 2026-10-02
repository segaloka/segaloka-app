-- Canonical sales-network and partner payable model for Segaloka.
-- Additive migration: legacy control_center data is intentionally untouched.

insert into public.roles (slug, label, description, scope)
values ('agen', 'Agen', 'Agen penjualan di bawah Mitra Travel', 'org')
on conflict (slug) do nothing;

insert into public.permissions (key, label, group_name)
values ('agen.manage', 'Kelola Agen', 'Ekosistem')
on conflict (key) do nothing;

insert into public.role_permissions (role_slug, permission_key)
select r.slug, 'agen.manage'
from public.roles r
where r.slug in ('travel.owner','travel.admin')
on conflict do nothing;

create table if not exists public.agen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  mitra_id uuid not null references public.mitra(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  commission_type text not null default 'percentage'
    check (commission_type in ('percentage','nominal')),
  commission_value numeric not null default 0 check (commission_value >= 0),
  status text not null default 'active'
    check (status in ('pending','active','suspended','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agen_mitra_idx on public.agen(mitra_id);
create index if not exists agen_org_idx on public.agen(org_id);

create or replace function public.enforce_agen_mitra_org()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select m.org_id into v_org_id from public.mitra m where m.id = new.mitra_id;
  if v_org_id is null then
    raise exception 'Mitra tidak ditemukan';
  end if;
  if new.org_id is distinct from v_org_id then
    raise exception 'Agen dan Mitra wajib berada pada Travel yang sama';
  end if;
  return new;
end;
$$;

drop trigger if exists agen_mitra_org_guard on public.agen;
create trigger agen_mitra_org_guard
before insert or update of mitra_id, org_id on public.agen
for each row execute function public.enforce_agen_mitra_org();

drop trigger if exists agen_set_updated_at on public.agen;
create trigger agen_set_updated_at
before update on public.agen
for each row execute function public.set_updated_at();

create table if not exists public.partner_release_policies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  partner_type text not null check (partner_type in ('affiliate','mitra','agen')),
  trigger_type text not null
    check (trigger_type in ('dp_paid','paid_in_full','ready_to_depart','departure_date','after_departure')),
  delay_days integer not null default 0 check (delay_days >= 0),
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, partner_type)
);

drop trigger if exists partner_release_policies_set_updated_at on public.partner_release_policies;
create trigger partner_release_policies_set_updated_at
before update on public.partner_release_policies
for each row execute function public.set_updated_at();

create table if not exists public.partner_earnings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  partner_type text not null check (partner_type in ('affiliate','mitra','agen')),
  partner_id uuid not null,
  booking_id uuid references public.bookings(id) on delete set null,
  source_type text not null default 'booking',
  source_id uuid,
  amount numeric not null check (amount >= 0),
  status text not null default 'PENDING'
    check (status in ('PENDING','HELD','AVAILABLE','WITHDRAWAL_PENDING','PAID','REVERSED')),
  release_trigger text
    check (release_trigger is null or release_trigger in ('dp_paid','paid_in_full','ready_to_depart','departure_date','after_departure')),
  release_at timestamptz,
  available_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_earnings_org_idx on public.partner_earnings(org_id);
create index if not exists partner_earnings_partner_idx on public.partner_earnings(partner_type, partner_id);
create index if not exists partner_earnings_booking_idx on public.partner_earnings(booking_id);
create index if not exists partner_earnings_status_idx on public.partner_earnings(status, release_at);

drop trigger if exists partner_earnings_set_updated_at on public.partner_earnings;
create trigger partner_earnings_set_updated_at
before update on public.partner_earnings
for each row execute function public.set_updated_at();

create table if not exists public.partner_withdrawals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  partner_type text not null check (partner_type in ('affiliate','mitra','agen')),
  partner_id uuid not null,
  amount numeric not null check (amount > 0),
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','PROCESSING','PAID','REJECTED','CANCELLED')),
  bank_snapshot jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz,
  rejected_at timestamptz,
  approved_by uuid references auth.users(id),
  provider_ref text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_withdrawals_org_idx on public.partner_withdrawals(org_id);
create index if not exists partner_withdrawals_partner_idx on public.partner_withdrawals(partner_type, partner_id);
create index if not exists partner_withdrawals_status_idx on public.partner_withdrawals(status, requested_at);

drop trigger if exists partner_withdrawals_set_updated_at on public.partner_withdrawals;
create trigger partner_withdrawals_set_updated_at
before update on public.partner_withdrawals
for each row execute function public.set_updated_at();

create table if not exists public.partner_withdrawal_items (
  withdrawal_id uuid not null references public.partner_withdrawals(id) on delete cascade,
  earning_id uuid not null unique references public.partner_earnings(id) on delete restrict,
  amount numeric not null check (amount > 0),
  primary key (withdrawal_id, earning_id)
);

alter table public.agen enable row level security;
alter table public.partner_release_policies enable row level security;
alter table public.partner_earnings enable row level security;
alter table public.partner_withdrawals enable row level security;
alter table public.partner_withdrawal_items enable row level security;

create or replace function public.is_mitra_self(p_mitra_id uuid)
returns boolean language sql security definer stable set search_path = public
as $$
  select exists(select 1 from public.mitra m where m.id = p_mitra_id and m.user_id = auth.uid())
    or public.is_platform_admin();
$$;
grant execute on function public.is_mitra_self(uuid) to authenticated;

create or replace function public.is_agen_self(p_agen_id uuid)
returns boolean language sql security definer stable set search_path = public
as $$
  select exists(select 1 from public.agen a where a.id = p_agen_id and a.user_id = auth.uid())
    or public.is_platform_admin();
$$;
grant execute on function public.is_agen_self(uuid) to authenticated;

create or replace function public.is_partner_self(p_type text, p_id uuid)
returns boolean language sql security definer stable set search_path = public
as $$
  select case p_type
    when 'affiliate' then public.is_affiliate_self(p_id)
    when 'mitra' then public.is_mitra_self(p_id)
    when 'agen' then public.is_agen_self(p_id)
    else false
  end;
$$;
grant execute on function public.is_partner_self(text, uuid) to authenticated;

create policy agen_select on public.agen for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_mitra_self(mitra_id)
    or public.is_org_member(org_id)
    or public.is_platform_admin()
  );
create policy agen_write on public.agen for all to authenticated
  using (public.has_permission(org_id, 'agen.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'agen.manage') or public.is_platform_admin());

create policy partner_release_policies_select on public.partner_release_policies for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());
create policy partner_release_policies_write on public.partner_release_policies for all to authenticated
  using (public.has_permission(org_id, 'settings.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'settings.manage') or public.is_platform_admin());

create policy partner_earnings_select on public.partner_earnings for select to authenticated
  using (
    public.is_partner_self(partner_type, partner_id)
    or public.has_permission(org_id, 'finance.read')
    or public.is_platform_admin()
  );
create policy partner_earnings_write on public.partner_earnings for all to authenticated
  using (public.has_permission(org_id, 'payment.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'payment.manage') or public.is_platform_admin());

create policy partner_withdrawals_select on public.partner_withdrawals for select to authenticated
  using (
    public.is_partner_self(partner_type, partner_id)
    or public.has_permission(org_id, 'finance.read')
    or public.is_platform_admin()
  );
create policy partner_withdrawals_insert on public.partner_withdrawals for insert to authenticated
  with check (
    public.is_partner_self(partner_type, partner_id)
    or public.has_permission(org_id, 'payment.manage')
    or public.is_platform_admin()
  );
create policy partner_withdrawals_update on public.partner_withdrawals for update to authenticated
  using (public.has_permission(org_id, 'payment.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'payment.manage') or public.is_platform_admin());

create policy partner_withdrawal_items_select on public.partner_withdrawal_items for select to authenticated
  using (
    exists (
      select 1 from public.partner_withdrawals w
      where w.id = withdrawal_id
        and (
          public.is_partner_self(w.partner_type, w.partner_id)
          or public.has_permission(w.org_id, 'finance.read')
          or public.is_platform_admin()
        )
    )
  );
create policy partner_withdrawal_items_write on public.partner_withdrawal_items for all to authenticated
  using (
    exists (
      select 1 from public.partner_withdrawals w
      where w.id = withdrawal_id
        and (public.has_permission(w.org_id, 'payment.manage') or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from public.partner_withdrawals w
      where w.id = withdrawal_id
        and (public.has_permission(w.org_id, 'payment.manage') or public.is_platform_admin())
    )
  );
