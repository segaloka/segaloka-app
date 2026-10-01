"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/FileUpload";
import { DocumentLink } from "@/components/ui/DocumentLink";
import { useToast } from "@/components/ui/Toast";
import { submitPaymentProofAction } from "./actions";

export function PaymentProof({
  bookingId,
  userId,
  existing,
}: {
  bookingId: string;
  userId: string;
  existing: {
    id: string;
    file_url: string;
    file_name: string | null;
    status: string;
    created_at: string;
  }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const handleUploaded = async (path: string, fileName: string) => {
    if (saving) return;
    setSaving(true);

    try {
      const result = await submitPaymentProofAction({
        bookingId,
        path,
        fileName,
      });

      if (!result.ok) {
        toast.push({
          title: "Gagal menyimpan bukti",
          description: result.error,
          tone: "error",
        });
        return;
      }

      toast.push({
        title: "Bukti transfer terkirim",
        description: "Menunggu verifikasi tim keuangan Travel.",
        tone: "success",
      });
      router.refresh();
    } catch {
      toast.push({
        title: "Gagal menyimpan bukti",
        description: "Terjadi gangguan saat memproses bukti pembayaran. Silakan coba lagi.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {existing.length > 0 && (
        <div className="space-y-2">
          {existing.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
            >
              <DocumentLink
                path={document.file_url}
                name={document.file_name ?? "Bukti transfer"}
              />
              <span className="shrink-0 text-xs capitalize text-muted">
                {document.status.replaceAll("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {saving && (
        <p className="text-xs text-muted">Menyimpan bukti pembayaran...</p>
      )}

      <FileUpload
        pathPrefix={`${userId}/booking/${bookingId}`}
        onUploaded={handleUploaded}
        label="Unggah bukti transfer"
      />
    </div>
  );
}
