create table if not exists public.travel_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  traveler_user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.travel_reviews enable row level security;

drop policy if exists "travel_reviews_public_read" on public.travel_reviews;
create policy "travel_reviews_public_read"
on public.travel_reviews for select
using (true);

revoke insert, update, delete on public.travel_reviews from anon, authenticated;
grant select on public.travel_reviews to anon, authenticated;

create or replace function public.get_travel_rating(p_org_id uuid)
returns table(average_rating numeric, review_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    round(avg(rating)::numeric, 1) as average_rating,
    count(*)::bigint as review_count
  from public.travel_reviews
  where org_id = p_org_id;
$$;

grant execute on function public.get_travel_rating(uuid) to anon, authenticated;
