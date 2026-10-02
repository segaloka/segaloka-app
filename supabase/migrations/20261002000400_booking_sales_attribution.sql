-- Canonical sales attribution for bookings created through Segaloka partners.
-- Keeps booking core neutral while preserving Travel -> Mitra -> Agen and Affiliate attribution.

create table if not exists public.booking_sales_attributions (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  source text not null check (source in ('travel','mitra','agen','affiliate','marketplace','website','admin')),
  mitra_id uuid references public.mitra(id) on delete set null,
  agen_id uuid references public.agen(id) on delete set null,
  affiliate_id uuid references public.affiliates(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (source = 'mitra' and mitra_id is not null and agen_id is null and affiliate_id is null)
    or (source = 'agen' and mitra_id is not null and agen_id is not null and affiliate_id is null)
    or (source = 'affiliate' and affiliate_id is not null and mitra_id is null and agen_id is null)
    or (source in ('travel','marketplace','website','admin') and mitra_id is null and agen_id is null and affiliate_id is null)
  )
);

create index if not exists booking_sales_attributions_org_idx
  on public.booking_sales_attributions(org_id);
create index if not exists booking_sales_attributions_mitra_idx
  on public.booking_sales_attributions(mitra_id) where mitra_id is not null;
create index if not exists booking_sales_attributions_agen_idx
  on public.booking_sales_attributions(agen_id) where agen_id is not null;
create index if not exists booking_sales_attributions_affiliate_idx
  on public.booking_sales_attributions(affiliate_id) where affiliate_id is not null;

create or replace function public.enforce_booking_sales_attribution()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_booking_org uuid;
  v_mitra_org uuid;
  v_agen_org uuid;
  v_agen_mitra uuid;
begin
  select b.org_id into v_booking_org from public.bookings b where b.id = new.booking_id;
  if v_booking_org is null or v_booking_org <> new.org_id then
    raise exception 'Attribution wajib berada pada Travel booking yang sama';
  end if;

  if new.mitra_id is not null then
    select m.org_id into v_mitra_org from public.mitra m where m.id = new.mitra_id;
    if v_mitra_org is null or v_mitra_org <> new.org_id then
      raise exception 'Mitra attribution tidak berada pada Travel booking';
    end if;
  end if;

  if new.agen_id is not null then
    select a.org_id, a.mitra_id into v_agen_org, v_agen_mitra from public.agen a where a.id = new.agen_id;
    if v_agen_org is null or v_agen_org <> new.org_id or v_agen_mitra is distinct from new.mitra_id then
      raise exception 'Agen attribution tidak sesuai hierarki Mitra/Travel';
    end if;
  end if;

  if new.affiliate_id is not null and not exists (
    select 1 from public.affiliate_org_links l
    where l.affiliate_id = new.affiliate_id and l.org_id = new.org_id and l.status = 'active'
  ) then
    raise exception 'Affiliate tidak aktif pada Travel booking';
  end if;

  return new;
end;
$$;

drop trigger if exists booking_sales_attribution_guard on public.booking_sales_attributions;
create trigger booking_sales_attribution_guard
before insert or update on public.booking_sales_attributions
for each row execute function public.enforce_booking_sales_attribution();

alter table public.booking_sales_attributions enable row level security;

create policy booking_sales_attributions_select on public.booking_sales_attributions
for select to authenticated
using (
  public.is_org_member(org_id)
  or (mitra_id is not null and public.is_mitra_self(mitra_id))
  or (agen_id is not null and public.is_agen_self(agen_id))
  or (affiliate_id is not null and public.is_affiliate_self(affiliate_id))
  or public.is_platform_admin()
);

create policy booking_sales_attributions_insert on public.booking_sales_attributions
for insert to authenticated
with check (
  created_by = auth.uid()
  and (
    public.has_permission(org_id, 'booking.create')
    or (mitra_id is not null and public.is_mitra_self(mitra_id))
    or (agen_id is not null and public.is_agen_self(agen_id))
    or (affiliate_id is not null and public.is_affiliate_self(affiliate_id))
    or public.is_platform_admin()
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='booking_sales_attributions'
  ) then
    alter publication supabase_realtime add table public.booking_sales_attributions;
  end if;
end $$;

drop trigger if exists sg_domain_event on public.booking_sales_attributions;
create trigger sg_domain_event
after insert or update or delete on public.booking_sales_attributions
for each row execute function public.sg_emit_domain_event();
