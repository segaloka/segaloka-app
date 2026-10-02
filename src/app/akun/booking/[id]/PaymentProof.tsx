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
  language,
}: {
  bookingId: string;
  userId: string;
  language: "id" | "en" | "ar";
  existing: {
    id: string;
    file_url: string;
    file_name: string | null;
    status: string;
    created_at: string;
  }[];
}) {
  const copy = {
    id:{saveFail:"Gagal menyimpan bukti",sent:"Bukti transfer terkirim",waiting:"Menunggu verifikasi tim keuangan Travel.",genericError:"Terjadi gangguan saat memproses bukti pembayaran. Silakan coba lagi.",proof:"Bukti transfer",saving:"Menyimpan bukti pembayaran...",upload:"Unggah bukti transfer",statuses:{pending:"Menunggu",pending_review:"Menunggu verifikasi",verified:"Terverifikasi",approved:"Disetujui",rejected:"Ditolak"}},
    en:{saveFail:"Failed to save proof",sent:"Transfer proof submitted",waiting:"Waiting for verification by the Travel finance team.",genericError:"There was a problem processing the payment proof. Please try again.",proof:"Transfer proof",saving:"Saving payment proof...",upload:"Upload transfer proof",statuses:{pending:"Pending",pending_review:"Pending verification",verified:"Verified",approved:"Approved",rejected:"Rejected"}},
    ar:{saveFail:"تعذر حفظ الإثبات",sent:"تم إرسال إثبات التحويل",waiting:"بانتظار التحقق من فريق المالية لدى شركة السفر.",genericError:"حدثت مشكلة أثناء معالجة إثبات الدفع. يرجى المحاولة مرة أخرى.",proof:"إثبات التحويل",saving:"جارٍ حفظ إثبات الدفع...",upload:"رفع إثبات التحويل",statuses:{pending:"قيد الانتظار",pending_review:"بانتظار التحقق",verified:"تم التحقق",approved:"تمت الموافقة",rejected:"مرفوض"}}
  } as const;
  const t = copy[language];
  const statusLabel = (status: string) => t.statuses[status as keyof typeof t.statuses] ?? status.replaceAll("_", " ");
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
          title: t.saveFail,
          description: result.error,
          tone: "error",
        });
        return;
      }

      toast.push({
        title: t.sent,
        description: t.waiting,
        tone: "success",
      });
      router.refresh();
    } catch {
      toast.push({
        title: t.saveFail,
        description: t.genericError,
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
                name={document.file_name ?? t.proof}
              />
              <span className="shrink-0 text-xs capitalize text-muted">
                {statusLabel(document.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      {saving && (
        <p className="text-xs text-muted">{t.saving}</p>
      )}

      <FileUpload
        pathPrefix={`${userId}/booking/${bookingId}`}
        onUploaded={handleUploaded}
        label={t.upload}
      />
    </div>
  );
}
