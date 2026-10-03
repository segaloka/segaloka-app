import { requirePlatformAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { MarketplaceAdsManager } from "@/components/admin/MarketplaceAdsManager";

export default async function AdminMarketplaceAdsPage() {
  await requirePlatformAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_ads")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Gagal memuat iklan Marketplace: ${error.message}`);

  return (
    <div>
      <PageHeader
        eyebrow="Iklan & Promosi"
        title="Iklan Marketplace"
        description="Kelola card iklan yang tampil di homepage Marketplace. Perubahan aktif akan tersinkron otomatis ke pengunjung."
      />
      <MarketplaceAdsManager initialAds={data ?? []} />
    </div>
  );
}
