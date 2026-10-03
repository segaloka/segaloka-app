alter table public.bookings
  alter column departure_id drop not null;

alter table public.bookings
  add column segadeals_offer_id uuid
    references public.segadeals_offers(id) on delete set null,
  add column custom_departure_date date,
  add column custom_package_name text;

create unique index bookings_segadeals_offer_id_uidx
  on public.bookings(segadeals_offer_id)
  where segadeals_offer_id is not null;

alter table public.bookings
  add constraint bookings_source_check
  check (
    departure_id is not null
    or segadeals_offer_id is not null
  );