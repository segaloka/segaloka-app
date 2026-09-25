"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileUpload } from "@/components/ui/FileUpload";
import { DocumentLink } from "@/components/ui/DocumentLink";
import { useToast } from "@/components/ui/Toast";

export function PaymentProof({
  bookingId,
  userId,
  existing,
}: {
  bookingId: string;
  userId: string;
  existing: { id: string; file_url: string; file_name: string | null; status: string; created_at: string }[];
}) {
  const router = useRouter();
  const toast = useToast();

  const handleUploaded = async (path: string, fileName: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("documents").insert({
      owner_type: "booking",
      owner_id: bookingId,
      category: "bukti_transfer",
      file_url: path,
      file_name: fileName,
      uploaded_by: userId,
    });
    if (error) {
      toast.push({ title: "Gagal menyimpan bukti", description: error.message, tone: "error" });
      return;
    }
    toast.push({ title: "Bukti transfer terkirim", description: "Menunggu verifikasi tim keuangan Travel.", tone: "success" });
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {existing.length > 0 && (
        <div className="space-y-2">
          {existing.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <DocumentLink path={d.file_url} name={d.file_name ?? "Bukti transfer"} />
              <span className="text-xs capitalize text-muted">{d.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      )}
      <FileUpload pathPrefix={`${userId}/booking/${bookingId}`} onUploaded={handleUploaded} label="Unggah bukti transfer" />
    </div>
  );
}
