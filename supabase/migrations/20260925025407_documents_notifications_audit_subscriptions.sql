create table public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  owner_type text not null,
  owner_id uuid not null,
  category text not null,
  file_url text not null,
  file_name text,
  status text not null default 'valid',
  expires_at date,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  category text not null,
  title text not null,
  body text,
  priority text not null default 'normal',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.organizations(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id),
  status text not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  branch_limit_override integer,
  additional_branch_price numeric,
  created_at timestamptz not null default now()
);

create table public.vendor_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  item text not null,
  amount numeric not null default 0,
  status text not null default 'pending',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.vendor_org_links (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  fee_type text not null default 'percentage',
  fee_value numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (vendor_id, org_id)
);

create table public.segadeals_requests (
  id uuid primary key default gen_random_uuid(),
  traveler_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  origin_city text,
  destination text,
  date_from date,
  date_to date,
  flex_days integer not null default 0,
  pax integer not null default 1,
  budget_min numeric,
  budget_max numeric,
  room_config text,
  hotel_pref text,
  airline_pref text,
  additional_request text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.segadeals_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.segadeals_requests(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  price numeric not null,
  notes text,
  status text not null default 'offered',
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.segadeals_deposits (
  org_id uuid primary key references public.organizations(id) on delete cascade,
  balance numeric not null default 0,
  min_required numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table public.websites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.organizations(id) on delete cascade,
  domain text,
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.website_pages (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  slug text not null,
  title text not null,
  sections jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  unique (website_id, slug)
);

alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.vendor_orders enable row level security;
alter table public.vendor_org_links enable row level security;
alter table public.segadeals_requests enable row level security;
alter table public.segadeals_offers enable row level security;
alter table public.segadeals_deposits enable row level security;
alter table public.websites enable row level security;
alter table public.website_pages enable row level security;

create policy documents_select on public.documents for select to authenticated
  using (owner_id = auth.uid() or (org_id is not null and (public.is_org_member(org_id) or public.is_platform_admin())));
create policy documents_write on public.documents for all to authenticated
  using (owner_id = auth.uid() or (org_id is not null and (public.has_permission(org_id, 'operations.manage') or public.is_platform_admin())))
  with check (owner_id = auth.uid() or (org_id is not null and (public.has_permission(org_id, 'operations.manage') or public.is_platform_admin())));

create policy notifications_select on public.notifications for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_insert on public.notifications for insert to authenticated
  with check (public.is_platform_admin() or (org_id is not null and public.has_permission(org_id, 'team.manage')));

create policy audit_logs_select on public.audit_logs for select to authenticated
  using (public.is_platform_admin() or (org_id is not null and public.has_permission(org_id, 'settings.manage')));
create policy audit_logs_insert on public.audit_logs for insert to authenticated
  with check (actor_user_id = auth.uid() or public.is_platform_admin());

create policy subscriptions_select on public.subscriptions for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());
create policy subscriptions_write on public.subscriptions for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy vendor_orders_select on public.vendor_orders for select to authenticated
  using (public.is_org_member(org_id) or public.is_vendor_member(vendor_id) or public.is_platform_admin());
create policy vendor_orders_write on public.vendor_orders for all to authenticated
  using (public.has_permission(org_id, 'vendor.manage') or public.is_vendor_member(vendor_id) or public.is_platform_admin())
  with check (public.has_permission(org_id, 'vendor.manage') or public.is_vendor_member(vendor_id) or public.is_platform_admin());

create policy vendor_org_links_select on public.vendor_org_links for select to authenticated
  using (public.is_org_member(org_id) or public.is_vendor_member(vendor_id) or public.is_platform_admin());
create policy vendor_org_links_write on public.vendor_org_links for all to authenticated
  using (public.has_permission(org_id, 'vendor.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'vendor.manage') or public.is_platform_admin());

create policy segadeals_requests_select on public.segadeals_requests for select to authenticated
  using (traveler_user_id = auth.uid() or status = 'open' or public.is_platform_admin());
create policy segadeals_requests_insert on public.segadeals_requests for insert to authenticated
  with check (traveler_user_id = auth.uid());
create policy segadeals_requests_update on public.segadeals_requests for update to authenticated
  using (traveler_user_id = auth.uid() or public.is_platform_admin())
  with check (traveler_user_id = auth.uid() or public.is_platform_admin());

create policy segadeals_offers_select on public.segadeals_offers for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin()
    or exists (select 1 from public.segadeals_requests r where r.id = segadeals_offers.request_id and r.traveler_user_id = auth.uid()));
create policy segadeals_offers_write on public.segadeals_offers for all to authenticated
  using (public.has_permission(org_id, 'segadeals.respond') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'segadeals.respond') or public.is_platform_admin());

create policy segadeals_deposits_select on public.segadeals_deposits for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());
create policy segadeals_deposits_write on public.segadeals_deposits for all to authenticated
  using (public.has_permission(org_id, 'payment.manage') or public.has_permission(org_id, 'segadeals.respond') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'payment.manage') or public.has_permission(org_id, 'segadeals.respond') or public.is_platform_admin());

create policy websites_select on public.websites for select to public
  using (status = 'published' or public.is_org_member(org_id) or public.is_platform_admin());
create policy websites_write on public.websites for all to authenticated
  using (public.has_permission(org_id, 'website.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'website.manage') or public.is_platform_admin());

create policy website_pages_select on public.website_pages for select to public
  using (exists (select 1 from public.websites w where w.id = website_pages.website_id
    and (w.status = 'published' or public.is_org_member(w.org_id) or public.is_platform_admin())));
create policy website_pages_write on public.website_pages for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_pages.website_id and (public.has_permission(w.org_id, 'website.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.websites w where w.id = website_pages.website_id and (public.has_permission(w.org_id, 'website.manage') or public.is_platform_admin())));
