create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  license_type text not null,
  license_number text,
  license_expiry date,
  settlement_model text not null default 'direct',
  status text not null default 'active',
  support_email text,
  support_phone text,
  address text,
  primary_color text,
  secondary_color text,
  logo_light_url text,
  logo_dark_url text,
  favicon_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  category_code text references public.vendor_categories(code),
  contact_email text,
  contact_phone text,
  status text not null default 'pending_verification',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_hq boolean not null default false,
  address text,
  city text,
  phone text,
  pic_name text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete cascade,
  role_slug text not null references public.roles(slug),
  status text not null default 'active',
  invited_email text,
  created_at timestamptz not null default now()
);
create index memberships_user_idx on public.memberships(user_id);
create index memberships_org_idx on public.memberships(org_id);
create index memberships_vendor_idx on public.memberships(vendor_id);

create or replace function public.is_platform_admin()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.role_slug = 'platform.admin' and m.status = 'active'
  );
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.org_id = p_org_id and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_role_slugs text[])
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.org_id = p_org_id and m.status = 'active'
      and m.role_slug = any(p_role_slugs)
  );
$$;

create or replace function public.has_permission(p_org_id uuid, p_permission_key text)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    join public.role_permissions rp on rp.role_slug = m.role_slug
    where m.user_id = auth.uid() and m.org_id = p_org_id and m.status = 'active'
      and rp.permission_key = p_permission_key
  ) or public.is_platform_admin();
$$;

create or replace function public.has_platform_permission(p_permission_key text)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    join public.roles r on r.slug = m.role_slug
    join public.role_permissions rp on rp.role_slug = m.role_slug
    where m.user_id = auth.uid() and m.status = 'active' and r.scope = 'platform'
      and rp.permission_key = p_permission_key
  );
$$;

create or replace function public.is_vendor_member(p_vendor_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.vendor_id = p_vendor_id and m.status = 'active'
  ) or public.is_platform_admin();
$$;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;
grant execute on function public.has_platform_permission(text) to authenticated;
grant execute on function public.is_vendor_member(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.vendors enable row level security;
alter table public.branches enable row level security;
alter table public.memberships enable row level security;

create policy organizations_select on public.organizations for select to public
  using (status = 'active' or public.is_org_member(id) or public.is_platform_admin());
create policy organizations_insert on public.organizations for insert to authenticated
  with check (public.is_platform_admin());
create policy organizations_update on public.organizations for update to authenticated
  using (public.has_permission(id, 'org.manage') or public.is_platform_admin())
  with check (public.has_permission(id, 'org.manage') or public.is_platform_admin());

create policy vendors_select on public.vendors for select to authenticated
  using (status = 'active' or public.is_vendor_member(id) or public.is_platform_admin());
create policy vendors_insert on public.vendors for insert to authenticated
  with check (public.is_platform_admin());
create policy vendors_update on public.vendors for update to authenticated
  using (public.is_vendor_member(id) or public.is_platform_admin())
  with check (public.is_vendor_member(id) or public.is_platform_admin());

create policy branches_select on public.branches for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());
create policy branches_write on public.branches for all to authenticated
  using (public.has_permission(org_id, 'branch.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'branch.manage') or public.is_platform_admin());

create policy memberships_select on public.memberships for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(org_id) or public.is_vendor_member(vendor_id) or public.is_platform_admin());
create policy memberships_insert on public.memberships for insert to authenticated
  with check ((org_id is not null and public.has_permission(org_id, 'team.manage')) or public.is_platform_admin());
create policy memberships_update on public.memberships for update to authenticated
  using ((org_id is not null and public.has_permission(org_id, 'team.manage')) or public.is_platform_admin())
  with check ((org_id is not null and public.has_permission(org_id, 'team.manage')) or public.is_platform_admin());

create or replace function public.create_organization(p_name text, p_legal_name text, p_license_type text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_org_id uuid;
  v_slug text;
  v_plan_id uuid;
begin
  if v_user is null then
    raise exception 'Tidak terautentikasi.';
  end if;

  v_slug := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then v_slug := 'travel'; end if;
  while exists (select 1 from public.organizations where slug = v_slug) loop
    v_slug := v_slug || '-' || substring(md5(random()::text) from 1 for 5);
  end loop;

  insert into public.organizations (name, legal_name, license_type, slug, status, created_by)
  values (p_name, p_legal_name, p_license_type, v_slug, 'active', v_user)
  returning id into v_org_id;

  insert into public.memberships (user_id, org_id, role_slug, status)
  values (v_user, v_org_id, 'travel.owner', 'active');

  select id into v_plan_id from public.subscription_plans where code = 'starter' limit 1;
  if v_plan_id is not null then
    insert into public.subscriptions (org_id, plan_id, status, trial_ends_at, current_period_end)
    values (v_org_id, v_plan_id, 'trialing', now() + interval '14 days', now() + interval '14 days');
  end if;

  return v_org_id;
end;
$$;
grant execute on function public.create_organization(text, text, text) to authenticated;
