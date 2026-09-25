import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { InviteStaffForm } from "./InviteStaffForm";
import { updateStaffStatusAction } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  "travel.owner": "Owner",
  "travel.admin": "Admin",
  "travel.finance": "Finance",
  "travel.sales": "Sales",
  "travel.operations": "Operasional",
  "travel.branch_manager": "Manajer Cabang",
  "travel.staff": "Staff",
};

export default async function TeamPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "team.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin team.manage." />;

  const supabase = await createClient();
  const [{ data: memberships }, { data: branches }] = await Promise.all([
    supabase.from("memberships").select("id, role_slug, status, branch_id, profiles(full_name), branches(name)").eq("org_id", org.id).order("created_at"),
    supabase.from("branches").select("id, name").eq("org_id", org.id).eq("status", "active"),
  ]);

  return (
    <div>
      <PageHeader eyebrow="Tim" title="Staff & Role" description="Kelola anggota tim dan role akses mereka di organisasi Anda." />

      <InviteStaffForm orgSlug={params.org} branches={branches ?? []} />

      <div className="mt-4">
        {!memberships || memberships.length === 0 ? (
          <EmptyState title="Belum ada staff" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Cabang</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {memberships.map((m: any) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold text-text-primary">{m.profiles?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">{ROLE_LABEL[m.role_slug] ?? m.role_slug}</td>
                    <td className="px-4 py-3">{m.branches?.name ?? "Semua cabang"}</td>
                    <td className="px-4 py-3"><Badge status={m.status} /></td>
                    <td className="px-4 py-3">
                      {m.role_slug !== "travel.owner" && (
                        <form action={updateStaffStatusAction}>
                          <input type="hidden" name="org_slug" value={params.org} />
                          <input type="hidden" name="membership_id" value={m.id} />
                          <input type="hidden" name="status" value={m.status === "active" ? "suspended" : "active"} />
                          <button className="text-xs font-semibold text-primary hover:underline">
                            {m.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
