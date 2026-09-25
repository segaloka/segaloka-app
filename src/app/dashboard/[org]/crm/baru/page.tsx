import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "./LeadForm";

export default async function LeadBaruPage({ params }: { params: { org: string } }) {
  return (
    <div>
      <PageHeader eyebrow="CRM" title="Lead Baru" description="Tambahkan prospek baru ke pipeline." />
      <LeadForm orgSlug={params.org} />
    </div>
  );
}
