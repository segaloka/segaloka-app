import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { PageForm } from "./PageForm";
import { updateWebsiteStatusAction, togglePageStatusAction } from "./actions";

export default async function WebsitePage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "website.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin website.manage." />;

  const supabase = await createClient();
  const { data: website } = await supabase.from("websites").select("*").eq("org_id", org.id).maybeSingle();
  const { data: pages } = website
    ? await supabase.from("website_pages").select("*").eq("website_id", website.id).order("created_at", { ascending: false })
    : { data: [] };
  const { count: packageCount } = await supabase.from("packages").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("status", "published");

  return (
    <div>
      <PageHeader
        eyebrow="Website"
        title="Website Travel"
        description="Halaman publik Travel Anda di Segaloka."
        actions={
          <div className="flex items-center gap-2">
            <Badge status={website?.status ?? "draft"} />
            {website?.status !== "published" ? (
              <form action={updateWebsiteStatusAction}>
                <input type="hidden" name="org_slug" value={params.org} />
                <input type="hidden" name="status" value="published" />
                <button disabled={org.status !== "active"} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-50">
                  Publikasikan
                </button>
              </form>
            ) : (
              <form action={updateWebsiteStatusAction}>
                <input type="hidden" name="org_slug" value={params.org} />
                <input type="hidden" name="status" value="draft" />
                <button className="h-9 rounded-md border border-border-strong px-4 text-sm font-semibold text-text-secondary hover:bg-bg">Jadikan Draft</button>
              </form>
            )}
            <LinkButton href={`/travel/${org.slug}`} variant="outline" size="sm">Lihat Halaman Publik</LinkButton>
          </div>
        }
      />

      <div className="rounded-md border border-info/30 bg-info-tint px-3 py-2.5 text-xs text-info">
        Paket yang berstatus "Published" ({packageCount ?? 0} paket) otomatis tampil di website ini dan katalog publik Segaloka — tidak perlu input ulang.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 font-display text-sm font-bold text-text-primary">Halaman Baru</p>
          <PageForm orgSlug={params.org} />
        </div>
        <div>
          <p className="mb-3 font-display text-sm font-bold text-text-primary">Halaman Tersimpan</p>
          {!pages || pages.length === 0 ? (
            <EmptyState title="Belum ada halaman kustom" description="Tambahkan halaman seperti Tentang Kami atau Kontak." />
          ) : (
            <div className="space-y-2">
              {pages.map((p: any) => (
                <div key={p.id} className="rounded-md border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">{p.title}</p>
                    <Badge status={p.status} />
                  </div>
                  <form action={togglePageStatusAction} className="mt-2">
                    <input type="hidden" name="org_slug" value={params.org} />
                    <input type="hidden" name="page_id" value={p.id} />
                    <input type="hidden" name="status" value={p.status === "published" ? "draft" : "published"} />
                    <button className="text-xs font-semibold text-primary hover:underline">
                      {p.status === "published" ? "Jadikan draft" : "Publikasikan halaman"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
