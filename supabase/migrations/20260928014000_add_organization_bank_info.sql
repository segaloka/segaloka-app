alter table public.organizations
  add column bank_info jsonb;

alter table public.organizations
  add constraint organizations_bank_info_check
  check (
    bank_info is null
    or (
      jsonb_typeof(bank_info) = 'object'
      and bank_info ? 'bank_name'
      and bank_info ? 'account_number'
      and bank_info ? 'account_name'
      and jsonb_typeof(bank_info -> 'bank_name') = 'string'
      and jsonb_typeof(bank_info -> 'account_number') = 'string'
      and jsonb_typeof(bank_info -> 'account_name') = 'string'
      and length(trim(bank_info ->> 'bank_name')) > 0
      and length(trim(bank_info ->> 'account_number')) > 0
      and length(trim(bank_info ->> 'account_name')) > 0
    )
  );

drop policy if exists organizations_update
  on public.organizations;

create policy organizations_update
  on public.organizations
  for update
  to authenticated
  using (
    public.has_permission(id, 'org.manage')
    or public.has_permission(id, 'settings.manage')
    or public.is_platform_admin()
  )
  with check (
    public.has_permission(id, 'org.manage')
    or public.has_permission(id, 'settings.manage')
    or public.is_platform_admin()
  );