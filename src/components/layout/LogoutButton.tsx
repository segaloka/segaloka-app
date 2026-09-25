"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const onClick = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button onClick={onClick} className={className ?? "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-tint"}>
      <Icon name="logout" size={16} /> Keluar
    </button>
  );
}
