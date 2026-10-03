"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/layout/Icon";
import { cx } from "@/lib/utils";

export function WishlistButton({ packageId, initialSaved }: { packageId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
        return;
      }
      if (saved) {
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("package_id", packageId);
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, package_id: packageId });
      }
      setSaved(!saved);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cx(
        "flex h-10 w-10 items-center justify-center rounded-md border transition-colors",
        saved ? "border-danger/40 bg-danger-tint text-danger" : "border-border-strong bg-surface text-text-secondary hover:text-danger"
      )}
      aria-label={saved ? "Hapus dari favorit" : "Simpan ke favorit"}
    >
      <Icon name="heart" size={18} />
    </button>
  );
}
