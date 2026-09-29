create table public.marketplace_ads (
  id uuid primary key default gen_random_uuid(),
  travel_name text not null,
  category text not null,
  title text not null,
  detail text not null,
  price_text text not null,
  href text not null,
  icon text not null default 'building',
  tone text not null default 'blue' check (tone in ('blue','yellow')),
  image_url text,
  active boolean not null default false,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index marketplace_ads_public_idx
  on public.marketplace_ads (active, sort_order, starts_at, ends_at);

create trigger marketplace_ads_set_updated_at
  before update on public.marketplace_ads
  for each row execute function public.set_updated_at();

alter table public.marketplace_ads enable row level security;

create policy marketplace_ads_public_select
  on public.marketplace_ads
  for select to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy marketplace_ads_admin_all
  on public.marketplace_ads
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

insert into storage.buckets (id, name, public)
values ('marketplace-ads', 'marketplace-ads', true)
on conflict (id) do update set public = true;

create policy marketplace_ads_storage_insert
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'marketplace-ads'
    and public.is_platform_admin()
  );

create policy marketplace_ads_storage_update
  on storage.objects
  for update to authenticated
  using (
    bucket_id = 'marketplace-ads'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'marketplace-ads'
    and public.is_platform_admin()
  );

create policy marketplace_ads_storage_delete
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'marketplace-ads'
    and public.is_platform_admin()
  );

do $$
begin
  alter publication supabase_realtime add table public.marketplace_ads;
exception
  when duplicate_object then null;
end $$;
