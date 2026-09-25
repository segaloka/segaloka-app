import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config";
import type { Database } from "@/lib/database.types";

// Server Component / Server Action client. Auth is enforced by Postgres Row
// Level Security using the caller's JWT — this client never uses a service
// role key, so every read/write here is subject to the same authorization
// rules as the browser client.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions)
          );
        } catch {
          // Called from a Server Component that can't set cookies — the
          // middleware below refreshes the session instead.
        }
      },
    },
  });
}
