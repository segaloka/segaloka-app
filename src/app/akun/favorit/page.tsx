import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { formatIDR } from "@/lib/utils";
import { removeWishlistAction } from "./actions";

export default async function FavoritPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlists")
    .select("id, packages(id, name, slug, base_price, duration_days, organizations(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []).filter((r: any) => r.packages);

  return (
    <div>
      <PageHeader eyebrow="Traveler" title="Favorit" description="Paket yang Anda simpan untuk dilihat kembali." />
      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada favorit"
          description="Tambahkan paket ke favorit saat menjelajahi katalog."
          action={<LinkButton href="/paket/umrah" size="sm">Jelajahi Paket</LinkButton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border bg-surface shadow-card">
              <Link href={`/paket/detail/${r.packages.slug}`} className="block">
                <div className="aspect-[16/10] rounded-t-xl bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{r.packages.organizations?.name}</p>
                  <p className="mt-1 font-display text-sm font-bold text-text-primary">{r.packages.name}</p>
                  <p className="mt-2 text-sm font-bold text-primary">{formatIDR(r.packages.base_price)}</p>
                </div>
              </Link>
              <form action={removeWishlistAction} className="border-t border-border px-4 py-2.5">
                <input type="hidden" name="package_id" value={r.packages.id} />
                <button className="text-xs font-semibold text-danger hover:underline">Hapus dari favorit</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
