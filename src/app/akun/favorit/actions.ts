"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function removeWishlistAction(formData: FormData) {
  const user = await requireUser();
  const packageId = String(formData.get("package_id") ?? "");
  const supabase = await createClient();
  await supabase.from("wishlists").delete().eq("user_id", user.id).eq("package_id", packageId);
  revalidatePath("/akun/favorit");
}
