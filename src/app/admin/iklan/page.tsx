import Link from "next/link";
import { requirePlatformAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";

export default async function AdminAdsOverviewPage() {
  await requirePlatformAccess();
  const supabase = await createClient();
  const [{ count: total }, { count: active }] = await Promise.all([
    supabase.from("marketplace_ads").select("id", { count: "exact", head: true }),
    supabase.from("marketplace_ads").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Iklan & Promosi"
        title="Overview Iklan"
        description="Pantau materi iklan Marketplace dan kelola publikasi dari satu tempat."
        actions={<Link href="/admin/iklan/iklan" className="h-10 rounded-md bg-primary px-4 py-2.5 text-xs font-bold text-primary-fg hover:bg-primary-hover">Kelola Iklan</Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Total Iklan" value={String(total ?? 0)} />
        <StatTile label="Iklan Aktif" value={String(active ?? 0)} />
      </div>
    </div>
  );
}
