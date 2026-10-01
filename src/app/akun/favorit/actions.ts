"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function removeWishlistAction(formData: FormData) {
  const user = await requireUser();
  const packageId = String(formData.get("package_id") ?? "").trim();

  if (!packageId) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("package_id", packageId);

  if (error) {
    console.error("removeWishlistAction failed", {
      userId: user.id,
      packageId,
      message: error.message,
    });
    return;
  }

  revalidatePath("/akun/favorit");
}
