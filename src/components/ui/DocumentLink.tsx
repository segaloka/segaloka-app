"use client";

import { openSignedFile } from "./FileUpload";
import { Icon } from "@/components/layout/Icon";

export function DocumentLink({ path, name }: { path: string; name?: string }) {
  return (
    <button
      onClick={() => openSignedFile(path)}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
    >
      <Icon name="doc" size={14} /> {name ?? "Lihat berkas"}
    </button>
  );
}
