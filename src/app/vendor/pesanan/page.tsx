import { createClient } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/vendor";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatIDR, formatDate } from "@/lib/utils";
import { StatusSelect } from "./StatusSelect";

export default async function VendorOrdersPage() {
  const vendor = await requireVendor();
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendor_orders")
    .select("id, item, amount, status, created_at, organizations(name)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "org", header: "Travel", render: (r: any) => r.organizations?.name },
    { key: "item", header: "Item", render: (r) => r.item },
    { key: "amount", header: "Jumlah", render: (r) => formatIDR(r.amount) },
    { key: "date", header: "Tanggal", render: (r) => formatDate(r.created_at) },
    { key: "status", header: "Status", render: (r) => <StatusSelect orderId={r.id} status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader eyebrow="Vendor" title="Pesanan Masuk" description="Kelola status pesanan dari Travel yang terhubung dengan Anda." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r: any) => `${r.organizations?.name ?? ""} ${r.item}`}
        emptyTitle="Belum ada pesanan"
        emptyDescription="Pesanan dari Travel yang terhubung akan muncul di sini."
      />
    </div>
  );
}
