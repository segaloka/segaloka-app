-- Canonical refund, settlement and approval workflows for Segaloka.
-- Additive migration. Existing control_center collections remain untouched for later migration.

insert into public.permissions (key, label, group_name) values
  ('refund.manage', 'Kelola Refund', 'Keuangan'),
  ('settlement.manage', 'Kelola Settlement', 'Keuangan'),
  ('approval.manage', 'Kelola Approval', 'Operasional')
on conflict (key) do nothing;

insert into public.role_permissions (role_slug, permission_key)
select r.slug, p.key
from public.roles r
cross join public.permissions p
where r.slug = 'travel.owner'
  and p.key in ('refund.manage','settlement.manage','approval.manage')
on conflict do nothing;

insert into public.role_permissions (role_slug, permission_key)
select r.slug, p.key
from public.roles r
cross join public.permissions p
where r.slug = 'travel.finance'
  and p.key in ('refund.manage','settlement.manage')
on conflict do nothing;

insert into public.role_permissions (role_slug, permission_key)
select r.slug, p.key
from public.roles r
cross join public.permissions p
where r.slug = 'travel.admin'
  and p.key in ('approval.manage')
on conflict do nothing;

insert into public.role_permissions (role_slug, permission_key)
select 'platform.admin', p.key
from public.permissions p
where p.key in ('refund.manage','settlement.manage','approval.manage')
on conflict do nothing;

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  requested_by uuid references auth.users(id),
  request_type text not null default 'refund'
    check (request_type in ('cancel_refund','partial_refund','refund')),
  reason text,
  requested_amount numeric not null check (requested_amount > 0),
  approved_amount numeric check (approved_amount is null or approved_amount >= 0),
  fee_amount numeric not null default 0 check (fee_amount >= 0),
  net_refund_amount numeric generated always as
    (greatest(coalesce(approved_amount, 0) - fee_amount, 0)) stored,
  status text not null default 'REQUESTED'
    check (status in ('REQUESTED','UNDER_REVIEW','APPROVED','REJECTED','PROCESSING','REFUNDED','FAILED','CANCELLED')),
  provider text,
  provider_ref text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  processed_at timestamptz,
  completed_at timestamptz,
  policy_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists refunds_org_idx on public.refunds(org_id);
create index if not exists refunds_booking_idx on public.refunds(booking_id);
create index if not exists refunds_status_idx on public.refunds(status, created_at);

create or replace function public.enforce_refund_booking_org()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_org uuid;
  v_payment_booking uuid;
begin
  select b.org_id into v_org from public.bookings b where b.id = new.booking_id;
  if v_org is null or v_org <> new.org_id then
    raise exception 'Refund wajib menggunakan Travel dari booking yang sama';
  end if;
  if new.payment_id is not null then
    select p.booking_id into v_payment_booking from public.payments p where p.id = new.payment_id;
    if v_payment_booking is null or v_payment_booking <> new.booking_id then
      raise exception 'Payment refund wajib berasal dari booking yang sama';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists refunds_booking_org_guard on public.refunds;
create trigger refunds_booking_org_guard
before insert or update of org_id, booking_id, payment_id on public.refunds
for each row execute function public.enforce_refund_booking_org();

drop trigger if exists refunds_set_updated_at on public.refunds;
create trigger refunds_set_updated_at
before update on public.refunds
for each row execute function public.set_updated_at();

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  settlement_type text not null
    check (settlement_type in ('travel','vendor','platform','partner')),
  beneficiary_type text not null
    check (beneficiary_type in ('organization','vendor','affiliate','mitra','agen','platform')),
  beneficiary_id uuid,
  period_start date,
  period_end date,
  gross_amount numeric not null default 0 check (gross_amount >= 0),
  fee_amount numeric not null default 0 check (fee_amount >= 0),
  reserve_amount numeric not null default 0 check (reserve_amount >= 0),
  net_amount numeric generated always as
    (greatest(gross_amount - fee_amount - reserve_amount, 0)) stored,
  status text not null default 'PENDING'
    check (status in ('PENDING','HELD','APPROVED','PROCESSING','PAID','FAILED','REVERSED')),
  scheduled_at timestamptz,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  paid_at timestamptz,
  provider text,
  provider_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists settlements_org_idx on public.settlements(org_id);
create index if not exists settlements_beneficiary_idx on public.settlements(beneficiary_type, beneficiary_id);
create index if not exists settlements_status_idx on public.settlements(status, scheduled_at);

drop trigger if exists settlements_set_updated_at on public.settlements;
create trigger settlements_set_updated_at
before update on public.settlements
for each row execute function public.set_updated_at();

create table if not exists public.settlement_items (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.settlements(id) on delete cascade,
  ref_type text not null
    check (ref_type in ('payment','vendor_order','partner_withdrawal','refund','ledger')),
  ref_id uuid not null,
  gross_amount numeric not null default 0 check (gross_amount >= 0),
  fee_amount numeric not null default 0 check (fee_amount >= 0),
  net_amount numeric generated always as
    (greatest(gross_amount - fee_amount, 0)) stored,
  created_at timestamptz not null default now(),
  unique (settlement_id, ref_type, ref_id)
);

create or replace function public.enforce_settlement_item_org()
returns trigger
language plpgsql
set search_path = public
as $
declare
  v_org uuid;
  v_item_org uuid;
begin
  select s.org_id into v_org from public.settlements s where s.id = new.settlement_id;
  if v_org is null then
    raise exception 'Settlement tidak ditemukan';
  end if;

  if new.ref_type = 'payment' then
    select b.org_id into v_item_org
    from public.payments p
    join public.bookings b on b.id = p.booking_id
    where p.id = new.ref_id;
  elsif new.ref_type = 'refund' then
    select r.org_id into v_item_org from public.refunds r where r.id = new.ref_id;
  elsif new.ref_type = 'partner_withdrawal' then
    select w.org_id into v_item_org from public.partner_withdrawals w where w.id = new.ref_id;
  elsif new.ref_type = 'vendor_order' then
    select vo.org_id into v_item_org from public.vendor_orders vo where vo.id = new.ref_id;
  elsif new.ref_type = 'ledger' then
    select le.org_id into v_item_org from public.ledger_entries le where le.id = new.ref_id;
  end if;

  if v_item_org is null then
    raise exception 'Referensi settlement tidak ditemukan';
  end if;
  if v_item_org <> v_org then
    raise exception 'Item settlement wajib berasal dari Travel yang sama';
  end if;
  return new;
end;
$;

drop trigger if exists settlement_item_org_guard on public.settlement_items;
create trigger settlement_item_org_guard
before insert or update of settlement_id, ref_type, ref_id on public.settlement_items
for each row execute function public.enforce_settlement_item_org();

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('refund','settlement','partner_withdrawal','organization','vendor','document','other')),
  entity_id uuid not null,
  action text not null,
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  requested_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  reason text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists approvals_org_idx on public.approvals(org_id);
create index if not exists approvals_entity_idx on public.approvals(entity_type, entity_id);
create index if not exists approvals_status_idx on public.approvals(status, requested_at);

drop trigger if exists approvals_set_updated_at on public.approvals;
create trigger approvals_set_updated_at
before update on public.approvals
for each row execute function public.set_updated_at();

alter table public.refunds enable row level security;
alter table public.settlements enable row level security;
alter table public.settlement_items enable row level security;
alter table public.approvals enable row level security;

create policy refunds_select on public.refunds for select to authenticated
  using (
    public.is_org_member(org_id)
    or public.is_platform_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.traveler_user_id = auth.uid()
    )
  );
create policy refunds_insert on public.refunds for insert to authenticated
  with check (
    public.has_permission(org_id, 'refund.manage')
    or public.is_platform_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.traveler_user_id = auth.uid()
    )
  );
create policy refunds_update on public.refunds for update to authenticated
  using (public.has_permission(org_id, 'refund.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'refund.manage') or public.is_platform_admin());

create policy settlements_select on public.settlements for select to authenticated
  using (public.has_permission(org_id, 'finance.read') or public.is_platform_admin());
create policy settlements_write on public.settlements for all to authenticated
  using (public.has_permission(org_id, 'settlement.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'settlement.manage') or public.is_platform_admin());

create policy settlement_items_select on public.settlement_items for select to authenticated
  using (
    exists (
      select 1 from public.settlements s
      where s.id = settlement_id
        and (public.has_permission(s.org_id, 'finance.read') or public.is_platform_admin())
    )
  );
create policy settlement_items_write on public.settlement_items for all to authenticated
  using (
    exists (
      select 1 from public.settlements s
      where s.id = settlement_id
        and (public.has_permission(s.org_id, 'settlement.manage') or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from public.settlements s
      where s.id = settlement_id
        and (public.has_permission(s.org_id, 'settlement.manage') or public.is_platform_admin())
    )
  );

create policy approvals_select on public.approvals for select to authenticated
  using (
    requested_by = auth.uid()
    or (org_id is not null and public.is_org_member(org_id))
    or public.is_platform_admin()
  );
create policy approvals_insert on public.approvals for insert to authenticated
  with check (
    requested_by = auth.uid()
    or (org_id is not null and public.is_org_member(org_id))
    or public.is_platform_admin()
  );
create policy approvals_update on public.approvals for update to authenticated
  using (
    public.is_platform_admin()
    or (org_id is not null and public.has_permission(org_id, 'approval.manage'))
  )
  with check (
    public.is_platform_admin()
    or (org_id is not null and public.has_permission(org_id, 'approval.manage'))
  );
