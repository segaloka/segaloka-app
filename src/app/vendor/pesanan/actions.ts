"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getMyVendor } from "@/lib/vendor";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(formData: FormData) {
  await requireUser();
  const vendor = await getMyVendor();
  if (!vendor) return;
  const orderId = String(formData.get("order_id"));
  const status = String(formData.get("status"));

  const supabase = await createClient();
  await supabase.from("vendor_orders").update({ status }).eq("id", orderId).eq("vendor_id", vendor.id);
  revalidatePath("/vendor/pesanan");
}
