create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_platform_admin() from public, anon;
revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.has_org_role(uuid, text[]) from public, anon;
revoke execute on function public.has_permission(uuid, text) from public, anon;
revoke execute on function public.has_platform_permission(text) from public, anon;
revoke execute on function public.is_vendor_member(uuid) from public, anon;
revoke execute on function public.is_affiliate_self(uuid) from public, anon;
revoke execute on function public.create_organization(text, text, text) from public, anon;
revoke execute on function public.invite_staff_by_email(uuid, text, text, uuid) from public, anon;
revoke execute on function public.register_vendor(text, text, text, text, text) from public, anon;
revoke execute on function public.register_affiliate() from public, anon;
revoke execute on function public.link_affiliate_to_org(text) from public, anon;
revoke execute on function public.invite_mitra_by_email(uuid, text, text, numeric) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;
grant execute on function public.has_platform_permission(text) to authenticated;
grant execute on function public.is_vendor_member(uuid) to authenticated;
grant execute on function public.is_affiliate_self(uuid) to authenticated;
grant execute on function public.create_organization(text, text, text) to authenticated;
grant execute on function public.invite_staff_by_email(uuid, text, text, uuid) to authenticated;
grant execute on function public.register_vendor(text, text, text, text, text) to authenticated;
grant execute on function public.register_affiliate() to authenticated;
grant execute on function public.link_affiliate_to_org(text) to authenticated;
grant execute on function public.invite_mitra_by_email(uuid, text, text, numeric) to authenticated;
