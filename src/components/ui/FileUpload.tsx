"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./Toast";
import { Icon } from "@/components/layout/Icon";

export function FileUpload({
  pathPrefix,
  onUploaded,
  accept = "image/*,application/pdf",
  label = "Unggah berkas",
}: {
  pathPrefix: string;
  onUploaded: (path: string, fileName: string) => void;
  accept?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handleFile = async (file: File) => {
    setBusy(true);
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${pathPrefix}/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: false });
    setBusy(false);
    if (error) {
      toast.push({ title: "Unggah gagal", description: error.message, tone: "error" });
      return;
    }
    toast.push({ title: "Berkas terunggah", tone: "success" });
    onUploaded(path, file.name);
  };

  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-bg px-4 py-3 text-sm text-text-secondary hover:border-primary">
      <Icon name="doc" size={16} />
      {busy ? "Mengunggah…" : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export async function openSignedFile(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 120);
  if (!error && data?.signedUrl) window.open(data.signedUrl, "_blank");
}
