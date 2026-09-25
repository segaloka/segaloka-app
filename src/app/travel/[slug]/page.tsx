import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";

export default async function TravelStorefrontPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!org) notFound();

  const { data: website } = await supabase.from("websites").select("*, website_pages(*)").eq("org_id", org.id).eq("status", "published").maybeSingle();
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, slug, type, base_price, duration_days")
    .eq("org_id", org.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const publishedPages = ((website?.website_pages as any[]) ?? []).filter((p) => p.status === "published");

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{org.license_type}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">{org.name}</h1>
          {org.address && <p className="mt-2 text-sm text-text-secondary">{org.address}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-secondary">
            {org.support_phone && <span>Telp: {org.support_phone}</span>}
            {org.support_email && <span>Email: {org.support_email}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-xl font-bold text-text-primary">Paket Tersedia</h2>
        {!packages || packages.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Belum ada paket yang dipublikasikan" description="Travel ini belum mempublikasikan paket ke website." />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <Link key={p.id} href={`/paket/detail/${p.slug}`} className="rounded-xl border border-border bg-surface p-4 shadow-card hover:border-primary/40">
                <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />
                <p className="mt-3 font-display text-sm font-bold text-text-primary">{p.name}</p>
                <p className="text-xs text-text-secondary">{p.duration_days} hari</p>
                <p className="mt-2 font-display text-base font-bold text-primary">{formatIDR(p.base_price)}</p>
              </Link>
            ))}
          </div>
        )}

        {publishedPages.length > 0 && (
          <div className="mt-12 space-y-8">
            {publishedPages.map((p: any) => (
              <div key={p.id}>
                <h3 className="font-display text-lg font-bold text-text-primary">{p.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{p.sections?.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
