create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique,
  status text not null default 'pending_verification',
  created_at timestamptz not null default now()
);

create table public.affiliate_org_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  commission_type text not null default 'percentage',
  commission_value numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (affiliate_id, org_id)
);

create table public.mitra (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  commission_type text not null default 'percentage',
  commission_value numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create or replace function public.is_affiliate_self(p_affiliate_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.affiliates a where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) or public.is_platform_admin();
$$;
grant execute on function public.is_affiliate_self(uuid) to authenticated;

alter table public.affiliates enable row level security;
alter table public.affiliate_org_links enable row level security;
alter table public.mitra enable row level security;

create policy affiliates_select on public.affiliates for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin()
    or exists (select 1 from public.affiliate_org_links l where l.affiliate_id = affiliates.id and public.is_org_member(l.org_id)));
create policy affiliates_insert on public.affiliates for insert to authenticated
  with check (user_id = auth.uid() or public.is_platform_admin());
create policy affiliates_update on public.affiliates for update to authenticated
  using (user_id = auth.uid() or public.is_platform_admin())
  with check (user_id = auth.uid() or public.is_platform_admin());

create policy affiliate_org_links_select on public.affiliate_org_links for select to authenticated
  using (public.is_affiliate_self(affiliate_id) or public.is_org_member(org_id) or public.is_platform_admin());
create policy affiliate_org_links_insert on public.affiliate_org_links for insert to authenticated
  with check (public.is_affiliate_self(affiliate_id) or public.is_platform_admin());
create policy affiliate_org_links_update on public.affiliate_org_links for update to authenticated
  using (public.has_permission(org_id, 'affiliate.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'affiliate.manage') or public.is_platform_admin());

create policy mitra_select on public.mitra for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(org_id) or public.is_platform_admin());
create policy mitra_insert on public.mitra for insert to authenticated
  with check (public.has_permission(org_id, 'mitra.manage') or public.is_platform_admin());
create policy mitra_update on public.mitra for update to authenticated
  using (public.has_permission(org_id, 'mitra.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'mitra.manage') or public.is_platform_admin());
