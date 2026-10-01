"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markReadAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("markReadAction failed", {
      userId: user.id,
      notificationId: id,
      message: error.message,
    });
    return;
  }

  revalidatePath("/akun/notifikasi");
  revalidatePath("/akun");
}

export async function markAllReadAction() {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error("markAllReadAction failed", {
      userId: user.id,
      message: error.message,
    });
    return;
  }

  revalidatePath("/akun/notifikasi");
  revalidatePath("/akun");
}
