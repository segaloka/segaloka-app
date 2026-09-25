import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatIDR, formatDate } from "@/lib/utils";
import { OrgProfileForm } from "./OrgProfileForm";
import { BankInfoForm } from "./BankInfoForm";

export default async function SettingsPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = (await hasPermission(org.id, "org.manage")) || (await hasPermission(org.id, "settings.manage"));
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin org.manage / settings.manage." />;

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(name, price_monthly, branch_limit)")
    .eq("org_id", org.id)
    .maybeSingle();

  const bank = (org.bank_info as any) ?? {};

  return (
    <div>
      <PageHeader eyebrow="Pengaturan" title="Profil Organisasi" description="Identitas, legalitas, dan konfigurasi dasar Travel Anda." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><p className="font-display font-bold text-text-primary">Informasi Umum</p></CardHeader>
          <CardBody>
            <OrgProfileForm orgSlug={params.org} name={org.name} supportEmail={org.support_email ?? ""} supportPhone={org.support_phone ?? ""} address={org.address ?? ""} />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">Legalitas</p></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Status</span><Badge status={org.status} /></div>
              <div className="flex justify-between"><span className="text-text-secondary">Jenis Izin</span><span className="font-semibold text-text-primary">{org.license_type}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">No. Izin</span><span className="font-semibold text-text-primary">{org.license_number ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Kadaluarsa</span><span className="font-semibold text-text-primary">{org.license_expiry ? formatDate(org.license_expiry) : "—"}</span></div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">Subscription</p></CardHeader>
            <CardBody className="space-y-2 text-sm">
              {subscription ? (
                <>
                  <div className="flex justify-between"><span className="text-text-secondary">Paket</span><span className="font-semibold text-text-primary">{(subscription.subscription_plans as any)?.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Status</span><Badge status={subscription.status} /></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Biaya/Bulan</span><span className="font-semibold text-text-primary">{formatIDR((subscription.subscription_plans as any)?.price_monthly)}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Limit Cabang</span><span className="font-semibold text-text-primary">{subscription.branch_limit_override ?? (subscription.subscription_plans as any)?.branch_limit}</span></div>
                </>
              ) : (
                <p className="text-xs text-muted">Belum ada langganan aktif.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card className="max-w-xl">
          <CardHeader><p className="font-display font-bold text-text-primary">Rekening Bank</p></CardHeader>
          <CardBody>
            <BankInfoForm orgSlug={params.org} bankName={bank.bank_name ?? ""} accountNumber={bank.account_number ?? ""} accountName={bank.account_name ?? ""} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
