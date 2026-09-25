import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export async function getMyAffiliate() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return null;
  const { data } = await supabase.from("affiliates").select("*").eq("user_id", user.id).maybeSingle();
  return data;
}
