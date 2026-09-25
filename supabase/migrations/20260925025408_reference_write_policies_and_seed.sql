create policy roles_write on public.roles for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy permissions_write on public.permissions for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy role_permissions_write on public.role_permissions for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy vendor_categories_write on public.vendor_categories for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy subscription_plans_write on public.subscription_plans for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy platform_settings_select on public.platform_settings for select to authenticated using (public.is_platform_admin());
create policy platform_settings_write on public.platform_settings for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Seed roles
insert into public.roles (slug, label, description, scope) values
  ('platform.admin', 'Platform Admin', 'Mengelola seluruh platform Segaloka', 'platform'),
  ('travel.owner', 'Pemilik Travel', 'Pemilik/akun utama organisasi Travel', 'org'),
  ('travel.admin', 'Admin Travel', 'Administrator operasional Travel', 'org'),
  ('travel.finance', 'Finance Travel', 'Mengelola keuangan Travel', 'org'),
  ('travel.sales', 'Sales Travel', 'Mengelola penjualan & CRM', 'org'),
  ('travel.operations', 'Operations Travel', 'Mengelola operasional keberangkatan', 'org'),
  ('travel.branch_manager', 'Manajer Cabang', 'Mengelola cabang tertentu', 'org'),
  ('travel.staff', 'Staff Travel', 'Staff umum Travel', 'org'),
  ('mitra', 'Mitra', 'Mitra eksklusif sebuah Travel', 'org'),
  ('vendor.owner', 'Pemilik Vendor', 'Pemilik akun vendor', 'vendor'),
  ('affiliate', 'Affiliate', 'Affiliate lintas Travel', 'affiliate');

-- Seed permissions
insert into public.permissions (key, label, group_name) values
  ('org.manage', 'Kelola Organisasi', 'Organisasi'),
  ('team.manage', 'Kelola Tim/Staff', 'Organisasi'),
  ('branch.manage', 'Kelola Cabang', 'Organisasi'),
  ('settings.manage', 'Kelola Pengaturan', 'Organisasi'),
  ('package.manage', 'Kelola Paket', 'Produk'),
  ('package.publish', 'Publikasikan Paket', 'Produk'),
  ('booking.create', 'Buat Booking', 'Booking'),
  ('booking.manage', 'Kelola Booking', 'Booking'),
  ('operations.manage', 'Kelola Operasional', 'Booking'),
  ('payment.manage', 'Kelola Pembayaran', 'Keuangan'),
  ('finance.read', 'Lihat Laporan Keuangan', 'Keuangan'),
  ('crm.manage', 'Kelola CRM/Leads', 'CRM'),
  ('vendor.manage', 'Kelola Vendor', 'Ekosistem'),
  ('affiliate.manage', 'Kelola Affiliate', 'Ekosistem'),
  ('mitra.manage', 'Kelola Mitra', 'Ekosistem'),
  ('segadeals.respond', 'Tanggapi SegaDeals', 'Ekosistem'),
  ('website.manage', 'Kelola Website', 'Website'),
  ('org.verify', 'Verifikasi Organisasi', 'Platform'),
  ('vendor.verify', 'Verifikasi Vendor', 'Platform'),
  ('subscription.manage', 'Kelola Langganan', 'Platform');

-- Role -> permission mapping
insert into public.role_permissions (role_slug, permission_key)
select 'travel.owner', key from public.permissions where key in
  ('org.manage','team.manage','branch.manage','settings.manage','package.manage','package.publish',
   'booking.create','booking.manage','operations.manage','payment.manage','finance.read','crm.manage',
   'vendor.manage','affiliate.manage','mitra.manage','segadeals.respond','website.manage');

insert into public.role_permissions (role_slug, permission_key)
select 'travel.admin', key from public.permissions where key in
  ('team.manage','branch.manage','settings.manage','package.manage','package.publish',
   'booking.create','booking.manage','operations.manage','crm.manage','vendor.manage',
   'affiliate.manage','mitra.manage','segadeals.respond','website.manage');

insert into public.role_permissions (role_slug, permission_key)
select 'travel.finance', key from public.permissions where key in
  ('payment.manage','finance.read','booking.manage');

insert into public.role_permissions (role_slug, permission_key)
select 'travel.sales', key from public.permissions where key in
  ('crm.manage','booking.create','booking.manage');

insert into public.role_permissions (role_slug, permission_key)
select 'travel.operations', key from public.permissions where key in
  ('operations.manage','booking.manage');

insert into public.role_permissions (role_slug, permission_key)
select 'travel.branch_manager', key from public.permissions where key in
  ('booking.create','booking.manage','operations.manage','crm.manage');

insert into public.role_permissions (role_slug, permission_key)
select 'travel.staff', key from public.permissions where key in
  ('booking.create');

insert into public.role_permissions (role_slug, permission_key)
select 'platform.admin', key from public.permissions;

-- Seed vendor categories
insert into public.vendor_categories (code, label) values
  ('hotel', 'Hotel'),
  ('transport', 'Transportasi'),
  ('catering', 'Katering'),
  ('handling', 'Handling & Perlengkapan'),
  ('visa', 'Visa & Dokumen'),
  ('other', 'Lainnya');

-- Seed subscription plans
insert into public.subscription_plans (code, name, price_monthly, price_yearly, branch_limit, user_limit, storage_gb, trial_days, modules, is_active) values
  ('starter', 'Starter', 0, 0, 1, 5, 2, 14, '["booking","crm"]', true),
  ('growth', 'Growth', 499000, 4990000, 3, 20, 10, 14, '["booking","crm","affiliate","mitra","website"]', true),
  ('scale', 'Scale', 1499000, 14990000, 10, null, 50, 14, '["booking","crm","affiliate","mitra","website","vendor","segadeals"]', true);
