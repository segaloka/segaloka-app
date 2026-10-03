-- Marketplace Ads multi-placement
-- Existing advertisements remain in the current top placement.

alter table public.marketplace_ads
  add column if not exists placement text;

update public.marketplace_ads
set placement = 'hero'
where placement is null;

alter table public.marketplace_ads
  alter column placement set default 'hero';

alter table public.marketplace_ads
  alter column placement set not null;

alter table public.marketplace_ads
  drop constraint if exists marketplace_ads_placement_check;

alter table public.marketplace_ads
  add constraint marketplace_ads_placement_check
  check (
    placement in (
      'hero',
      'after_packages',
      'after_domestic',
      'after_world',
      'lower_home'
    )
  );

create index if not exists marketplace_ads_public_placement_idx
  on public.marketplace_ads (
    placement,
    active,
    sort_order,
    created_at desc
  );

comment on column public.marketplace_ads.placement is
  'Homepage ad slot: hero, after_packages, after_domestic, after_world, lower_home.';