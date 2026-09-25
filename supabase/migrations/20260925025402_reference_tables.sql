create table public.roles (
  slug text primary key,
  label text not null,
  description text,
  scope text not null check (scope in ('platform','org','vendor','affiliate'))
);

create table public.permissions (
  key text primary key,
  label text not null,
  group_name text not null
);

create table public.role_permissions (
  role_slug text not null references public.roles(slug) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role_slug, permission_key)
);

create table public.vendor_categories (
  code text primary key,
  label text not null
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price_monthly numeric not null default 0,
  price_yearly numeric not null default 0,
  branch_limit integer not null default 1,
  user_limit integer,
  storage_gb integer not null default 5,
  trial_days integer not null default 14,
  modules jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.vendor_categories enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.platform_settings enable row level security;

create policy roles_select_all on public.roles for select to authenticated using (true);
create policy permissions_select_all on public.permissions for select to authenticated using (true);
create policy role_permissions_select_all on public.role_permissions for select to authenticated using (true);
create policy vendor_categories_select_all on public.vendor_categories for select to authenticated using (true);
create policy subscription_plans_select_all on public.subscription_plans for select to authenticated using (true);
