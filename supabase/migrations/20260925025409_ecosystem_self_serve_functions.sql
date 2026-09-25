create or replace function invite_staff_by_email(
  p_org_id uuid,
  p_email text,
  p_role_slug text,
  p_branch_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_target_user uuid;
  v_membership_id uuid;
begin
  if v_actor is null then
    raise exception 'Tidak terautentikasi.';
  end if;
  if not has_permission(p_org_id, 'team.manage') then
    raise exception 'Anda tidak memiliki izin team.manage untuk organisasi ini.';
  end if;
  select id into v_target_user from auth.users where lower(email) = lower(p_email) limit 1;
  if v_target_user is null then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;
  if exists (select 1 from memberships where user_id = v_target_user and org_id = p_org_id) then
    return json_build_object('ok', false, 'reason', 'already_member');
  end if;
  insert into memberships (user_id, org_id, branch_id, role_slug, status, invited_email)
  values (v_target_user, p_org_id, p_branch_id, p_role_slug, 'active', p_email)
  returning id into v_membership_id;
  insert into notifications (user_id, org_id, category, title, body, priority)
  values (v_target_user, p_org_id, 'system', 'Anda ditambahkan sebagai staff', 'Anda telah ditambahkan sebagai staff dengan role ' || p_role_slug || '.', 'normal');
  return json_build_object('ok', true, 'membership_id', v_membership_id);
end;
$$;
grant execute on function invite_staff_by_email(uuid, text, text, uuid) to authenticated;

create or replace function register_vendor(
  p_name text,
  p_legal_name text,
  p_category_code text,
  p_contact_email text,
  p_contact_phone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_vendor_id uuid;
begin
  if v_user is null then
    raise exception 'Tidak terautentikasi.';
  end if;
  if exists (select 1 from memberships where user_id = v_user and vendor_id is not null) then
    raise exception 'Akun Anda sudah terdaftar sebagai vendor.';
  end if;
  insert into vendors (category_code, name, legal_name, contact_email, contact_phone, created_by)
  values (p_category_code, p_name, p_legal_name, p_contact_email, p_contact_phone, v_user)
  returning id into v_vendor_id;
  insert into memberships (user_id, vendor_id, role_slug, status)
  values (v_user, v_vendor_id, 'vendor.owner', 'active');
  return v_vendor_id;
end;
$$;
grant execute on function register_vendor(text, text, text, text, text) to authenticated;

create or replace function register_affiliate()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_affiliate_id uuid;
  v_code text;
begin
  if v_user is null then
    raise exception 'Tidak terautentikasi.';
  end if;
  if exists (select 1 from affiliates where user_id = v_user) then
    select id into v_affiliate_id from affiliates where user_id = v_user;
    return v_affiliate_id;
  end if;
  v_code := 'AFF-' || upper(substring(md5(v_user::text || now()::text) from 1 for 6));
  insert into affiliates (user_id, code, status)
  values (v_user, v_code, 'pending_verification')
  returning id into v_affiliate_id;
  insert into memberships (user_id, role_slug, status)
  values (v_user, 'affiliate', 'active');
  return v_affiliate_id;
end;
$$;
grant execute on function register_affiliate() to authenticated;

create or replace function link_affiliate_to_org(p_org_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_affiliate_id uuid;
  v_org_id uuid;
begin
  if v_user is null then
    raise exception 'Tidak terautentikasi.';
  end if;
  select id into v_affiliate_id from affiliates where user_id = v_user;
  if v_affiliate_id is null then
    return json_build_object('ok', false, 'reason', 'not_affiliate');
  end if;
  select id into v_org_id from organizations where slug = p_org_slug and status = 'active';
  if v_org_id is null then
    return json_build_object('ok', false, 'reason', 'org_not_found');
  end if;
  if exists (select 1 from affiliate_org_links where affiliate_id = v_affiliate_id and org_id = v_org_id) then
    return json_build_object('ok', false, 'reason', 'already_linked');
  end if;
  insert into affiliate_org_links (affiliate_id, org_id, commission_type, commission_value, status)
  values (v_affiliate_id, v_org_id, 'percentage', 2.5, 'active');
  return json_build_object('ok', true);
end;
$$;
grant execute on function link_affiliate_to_org(text) to authenticated;

create or replace function invite_mitra_by_email(
  p_org_id uuid,
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
  v_mitra_id uuid;
begin
  if v_actor is null then
    raise exception 'Tidak terautentikasi.';
  end if;
  if not has_permission(p_org_id, 'mitra.manage') then
    raise exception 'Anda tidak memiliki izin mitra.manage untuk organisasi ini.';
  end if;
  select id into v_target_user from auth.users where lower(email) = lower(p_email) limit 1;
  if v_target_user is null then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;
  if exists (select 1 from mitra where user_id = v_target_user) then
    return json_build_object('ok', false, 'reason', 'already_mitra');
  end if;
  insert into mitra (user_id, org_id, commission_type, commission_value, status)
  values (v_target_user, p_org_id, p_commission_type, p_commission_value, 'active')
  returning id into v_mitra_id;
  insert into memberships (user_id, org_id, role_slug, status)
  values (v_target_user, p_org_id, 'mitra', 'active');
  insert into notifications (user_id, org_id, category, title, body, priority)
  values (v_target_user, p_org_id, 'system', 'Anda diundang sebagai Mitra', 'Anda telah ditambahkan sebagai Mitra eksklusif.', 'normal');
  return json_build_object('ok', true, 'mitra_id', v_mitra_id);
end;
$$;
grant execute on function invite_mitra_by_email(uuid, text, text, numeric) to authenticated;
