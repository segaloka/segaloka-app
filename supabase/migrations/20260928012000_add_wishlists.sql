create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, package_id)
);

create index wishlists_user_id_idx
  on public.wishlists(user_id);

create index wishlists_package_id_idx
  on public.wishlists(package_id);

alter table public.wishlists enable row level security;

create policy wishlists_select
  on public.wishlists
  for select
  to authenticated
  using (user_id = auth.uid());

create policy wishlists_insert
  on public.wishlists
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy wishlists_delete
  on public.wishlists
  for delete
  to authenticated
  using (user_id = auth.uid());