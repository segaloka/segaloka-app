-- Canonical Agen status mutation.

create or replace function public.set_agen_status(
  p_agen_id uuid,
  p_status text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_org uuid;
  v_mitra uuid;
begin
  if v_actor is null then raise exception 'Tidak terautentikasi.'; end if;
  if p_status not in ('active','inactive','suspended') then
    raise exception 'Status Agen tidak valid.';
  end if;

  select a.org_id, a.mitra_id into v_org, v_mitra
  from public.agen a where a.id = p_agen_id;
  if v_org is null then return json_build_object('ok',false,'reason','agen_not_found'); end if;

  if not (
    public.has_permission(v_org, 'agen.manage')
    or public.is_mitra_self(v_mitra)
    or public.is_platform_admin()
  ) then
    raise exception 'Anda tidak memiliki izin mengubah Agen ini.';
  end if;

  update public.agen
  set status=p_status
  where id=p_agen_id;

  return json_build_object('ok',true,'agen_id',p_agen_id,'status',p_status);
end;
$$;

revoke all on function public.set_agen_status(uuid,text) from public, anon;
grant execute on function public.set_agen_status(uuid,text) to authenticated;
