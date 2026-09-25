create table public.packages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  type text not null,
  description text,
  duration_days integer not null,
  base_price numeric not null default 0,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);
create trigger packages_set_updated_at before update on public.packages for each row execute function public.set_updated_at();

create table public.departures (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  departure_date date not null,
  return_date date,
  quota integer not null,
  filled integer not null default 0,
  flight_info jsonb not null default '{}'::jsonb,
  hotel_info jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  departure_id uuid not null references public.departures(id),
  code text not null unique,
  traveler_user_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  pax_count integer not null default 1,
  total_amount numeric not null default 0,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger bookings_set_updated_at before update on public.bookings for each row execute function public.set_updated_at();

create table public.booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  gender text,
  dob date,
  id_number text,
  passport_number text,
  passport_expiry date,
  relation text,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references public.departures(id) on delete cascade,
  hotel_name text,
  room_number text,
  room_type text,
  capacity integer not null default 2,
  created_at timestamptz not null default now()
);

create table public.room_occupants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  booking_passenger_id uuid not null references public.booking_passengers(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.manifests (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null unique references public.departures(id) on delete cascade,
  template_type text not null default 'standard',
  fields_schema jsonb not null default '{}'::jsonb,
  generated_by uuid references auth.users(id),
  generated_at timestamptz not null default now()
);

create table public.manifest_entries (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.manifests(id) on delete cascade,
  booking_passenger_id uuid not null references public.booking_passengers(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.packages enable row level security;
alter table public.departures enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.rooms enable row level security;
alter table public.room_occupants enable row level security;
alter table public.manifests enable row level security;
alter table public.manifest_entries enable row level security;

create policy packages_select on public.packages for select to public
  using (status = 'published' or public.is_org_member(org_id) or public.is_platform_admin());
create policy packages_write on public.packages for all to authenticated
  using (public.has_permission(org_id, 'package.manage') or public.has_permission(org_id, 'package.publish') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'package.manage') or public.has_permission(org_id, 'package.publish') or public.is_platform_admin());

create policy departures_select on public.departures for select to public
  using (exists (select 1 from public.packages p where p.id = departures.package_id
    and (p.status = 'published' or public.is_org_member(p.org_id) or public.is_platform_admin())));
create policy departures_write on public.departures for all to authenticated
  using (exists (select 1 from public.packages p where p.id = departures.package_id
    and (public.has_permission(p.org_id, 'package.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.packages p where p.id = departures.package_id
    and (public.has_permission(p.org_id, 'package.manage') or public.is_platform_admin())));

create policy bookings_select on public.bookings for select to authenticated
  using (traveler_user_id = auth.uid() or created_by = auth.uid() or public.is_org_member(org_id) or public.is_platform_admin());
create policy bookings_insert on public.bookings for insert to authenticated
  with check (traveler_user_id = auth.uid() or public.has_permission(org_id, 'booking.create') or public.is_platform_admin());
create policy bookings_update on public.bookings for update to authenticated
  using (public.has_permission(org_id, 'booking.manage') or public.is_platform_admin())
  with check (public.has_permission(org_id, 'booking.manage') or public.is_platform_admin());

create policy booking_passengers_select on public.booking_passengers for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_passengers.booking_id
    and (b.traveler_user_id = auth.uid() or b.created_by = auth.uid() or public.is_org_member(b.org_id) or public.is_platform_admin())));
create policy booking_passengers_write on public.booking_passengers for all to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_passengers.booking_id
    and (b.created_by = auth.uid() or b.traveler_user_id = auth.uid() or public.has_permission(b.org_id, 'booking.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.bookings b where b.id = booking_passengers.booking_id
    and (b.created_by = auth.uid() or b.traveler_user_id = auth.uid() or public.has_permission(b.org_id, 'booking.manage') or public.is_platform_admin())));

create policy rooms_select on public.rooms for select to authenticated
  using (exists (select 1 from public.departures d join public.packages p on p.id = d.package_id
    where d.id = rooms.departure_id and (public.is_org_member(p.org_id) or public.is_platform_admin())));
create policy rooms_write on public.rooms for all to authenticated
  using (exists (select 1 from public.departures d join public.packages p on p.id = d.package_id
    where d.id = rooms.departure_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.departures d join public.packages p on p.id = d.package_id
    where d.id = rooms.departure_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())));

create policy room_occupants_select on public.room_occupants for select to authenticated
  using (exists (select 1 from public.rooms r join public.departures d on d.id = r.departure_id join public.packages p on p.id = d.package_id
    where r.id = room_occupants.room_id and (public.is_org_member(p.org_id) or public.is_platform_admin())));
create policy room_occupants_write on public.room_occupants for all to authenticated
  using (exists (select 1 from public.rooms r join public.departures d on d.id = r.departure_id join public.packages p on p.id = d.package_id
    where r.id = room_occupants.room_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.rooms r join public.departures d on d.id = r.departure_id join public.packages p on p.id = d.package_id
    where r.id = room_occupants.room_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())));

create policy manifests_select on public.manifests for select to authenticated
  using (exists (select 1 from public.departures d join public.packages p on p.id = d.package_id
    where d.id = manifests.departure_id and (public.is_org_member(p.org_id) or public.is_platform_admin())));
create policy manifests_write on public.manifests for all to authenticated
  using (exists (select 1 from public.departures d join public.packages p on p.id = d.package_id
    where d.id = manifests.departure_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.departures d join public.packages p on p.id = d.package_id
    where d.id = manifests.departure_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())));

create policy manifest_entries_select on public.manifest_entries for select to authenticated
  using (exists (select 1 from public.manifests mf join public.departures d on d.id = mf.departure_id join public.packages p on p.id = d.package_id
    where mf.id = manifest_entries.manifest_id and (public.is_org_member(p.org_id) or public.is_platform_admin())));
create policy manifest_entries_write on public.manifest_entries for all to authenticated
  using (exists (select 1 from public.manifests mf join public.departures d on d.id = mf.departure_id join public.packages p on p.id = d.package_id
    where mf.id = manifest_entries.manifest_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())))
  with check (exists (select 1 from public.manifests mf join public.departures d on d.id = mf.departure_id join public.packages p on p.id = d.package_id
    where mf.id = manifest_entries.manifest_id and (public.has_permission(p.org_id, 'operations.manage') or public.is_platform_admin())));
