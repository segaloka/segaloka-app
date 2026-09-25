import { PageHeader } from "@/components/layout/PageHeader";
import { PackageForm } from "./PackageForm";

export default async function PaketBaruPage({ params }: { params: { org: string } }) {
  return (
    <div>
      <PageHeader eyebrow="Produk" title="Paket Baru" description="Lengkapi detail paket perjalanan." />
      <PackageForm orgSlug={params.org} />
    </div>
  );
}
