-- Canonical Agen onboarding, aligned with existing staff/Mitra self-serve flows.

create or replace function public.invite_agen_by_email(
  p_org_id uuid,
  p_mitra_id uuid,
  p_email text,
  p_commission_type text,
  p_commission_value numeric
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_target_user uuid;
  v_agen_id uuid;
  v_mitra_org uuid;
begin
  if v_actor is null then
    raise exception 'Tidak terautentikasi.';
  end if;
  if not public.has_permission(p_org_id, 'agen.manage') then
    raise exception 'Anda tidak memiliki izin agen.manage untuk organisasi ini.';
  end if;
  if p_commission_type not in ('percentage','nominal') then
    raise exception 'Tipe komisi Agen tidak valid.';
  end if;
  if p_commission_value < 0 then
    raise exception 'Nilai komisi Agen tidak boleh negatif.';
  end if;

  select m.org_id into v_mitra_org
  from public.mitra m
  where m.id = p_mitra_id and m.status = 'active';

  if v_mitra_org is null then
    return json_build_object('ok', false, 'reason', 'mitra_not_found');
  end if;
  if v_mitra_org <> p_org_id then
    return json_build_object('ok', false, 'reason', 'mitra_wrong_org');
  end if;

  select id into v_target_user
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_target_user is null then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;
  if exists (select 1 from public.agen where user_id = v_target_user) then
    return json_build_object('ok', false, 'reason', 'already_agen');
  end if;

  insert into public.agen (
    user_id, mitra_id, org_id, commission_type, commission_value, status
  ) values (
    v_target_user, p_mitra_id, p_org_id, p_commission_type, p_commission_value, 'active'
  )
  returning id into v_agen_id;

  insert into public.memberships (user_id, org_id, role_slug, status, invited_email)
  values (v_target_user, p_org_id, 'agen', 'active', lower(trim(p_email)));

  insert into public.notifications (user_id, org_id, category, title, body, priority)
  values (
    v_target_user,
    p_org_id,
    'system',
    'Anda ditambahkan sebagai Agen',
    'Akun Anda telah ditambahkan sebagai Agen di jaringan Mitra Travel.',
    'normal'
  );

  return json_build_object('ok', true, 'agen_id', v_agen_id);
end;
$$;

revoke all on function public.invite_agen_by_email(uuid, uuid, text, text, numeric) from public, anon;
grant execute on function public.invite_agen_by_email(uuid, uuid, text, text, numeric) to authenticated;
