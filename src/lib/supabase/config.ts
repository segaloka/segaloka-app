// Public Supabase project values. The anon/publishable key is designed to be
// exposed client-side — every table it can touch is protected by Row Level
// Security policies (see supabase/migrations). This project has no mechanism
// available to inject Vercel environment variables, so these are inlined
// deliberately rather than left as unset env vars that would silently break
// the deployed build.
export const SUPABASE_URL = "https://ikdkqtxidyrzjdutsold.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_taOC6vzJMHLOiQ-7j1zVoA_cxUbZxgr";
