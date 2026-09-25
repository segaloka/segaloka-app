import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { findAdminLeafByHref } from "@/lib/admin-nav";
import { isPlatformAdmin } from "@/lib/auth";

// Fallback for Control Center menu entries whose real page is not built yet.
// Keeps all 101 menu links working. Replace one module at a time by creating
// the concrete route (e.g. src/app/admin/approval/page.tsx) — a specific
// route always wins over this catch-all. Design reference for every module:
// design/README.md and design/canvas/AdminApp.dc.html (spec table "S").
export default async function AdminModulePlaceholder({ params }: { params: { slug: string[] } }) {
  const href = "/admin/" + params.slug.join("/");
  const leaf = findAdminLeafByHref(href);
  if (!leaf) notFound();
  if (!(await isPlatformAdmin())) notFound();

  const trail = [leaf.group.label, leaf.parent?.label, leaf.label].filter(Boolean).join(" › ");

  return (
    <div>
      <PageHeader eyebrow={trail} title={leaf.label} description={leaf.desc} />
      <EmptyState
        title="Modul sedang dikembangkan"
        description="Desain halaman ini sudah tersedia (Control Center, papan SA-00). Menu dan izin akses sudah terpasang; tampilan data menyusul."
        action={<Link href="/admin" className="text-sm font-semibold text-primary hover:underline">Kembali ke Overview</Link>}
      />
    </div>
  );
}
