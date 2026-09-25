create table public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text not null default 'website',
  interest_type text,
  stage text not null default 'new',
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger leads_set_updated_at before update on public.leads for each row execute function public.set_updated_at();

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null,
  body text,
  due_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  number text not null unique,
  amount numeric not null,
  due_date date,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'manual',
  method text,
  gross_amount numeric not null,
  fee_amount numeric not null default 0,
  net_amount numeric not null,
  external_ref text,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  account text not null,
  direction text not null,
  amount numeric not null,
  ref_type text not null,
  ref_id uuid,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  commission_amount numeric,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.affiliate_referrals enable row level security;

create policy leads_select on public.leads for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());
create policy leads_write on public.leads for all to authenticated
  using (public.has_permission(org_id, 'crm.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'crm.manage') or public.is_platform_admin());

create policy lead_activities_select on public.lead_activities for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_activities.lead_id and (public.is_org_member(l.org_id) or public.is_platform_admin())));
create policy lead_activities_write on public.lead_activities for all to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_activities.lead_id and (public.has_permission(l.org_id, 'crm.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.leads l where l.id = lead_activities.lead_id and (public.has_permission(l.org_id, 'crm.manage') or public.is_platform_admin())));

create policy invoices_select on public.invoices for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = invoices.booking_id
    and (b.traveler_user_id = auth.uid() or public.is_org_member(b.org_id) or public.is_platform_admin())));
create policy invoices_write on public.invoices for all to authenticated
  using (exists (select 1 from public.bookings b where b.id = invoices.booking_id and (public.has_permission(b.org_id, 'payment.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.bookings b where b.id = invoices.booking_id and (public.has_permission(b.org_id, 'payment.manage') or public.is_platform_admin())));

create policy payments_select on public.payments for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = payments.booking_id
    and (b.traveler_user_id = auth.uid() or public.is_org_member(b.org_id) or public.is_platform_admin())));
create policy payments_write on public.payments for all to authenticated
  using (exists (select 1 from public.bookings b where b.id = payments.booking_id and (public.has_permission(b.org_id, 'payment.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.bookings b where b.id = payments.booking_id and (public.has_permission(b.org_id, 'payment.manage') or public.is_platform_admin())));

create policy ledger_entries_select on public.ledger_entries for select to authenticated
  using (public.has_permission(org_id, 'finance.read') or public.is_platform_admin());
create policy ledger_entries_write on public.ledger_entries for all to authenticated
  using (public.has_permission(org_id, 'payment.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'payment.manage') or public.is_platform_admin());

create policy affiliate_referrals_select on public.affiliate_referrals for select to authenticated
  using (public.is_affiliate_self(affiliate_id) or public.is_org_member(org_id) or public.is_platform_admin());
create policy affiliate_referrals_write on public.affiliate_referrals for all to authenticated
  using (public.has_permission(org_id, 'affiliate.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'affiliate.manage') or public.is_platform_admin());
