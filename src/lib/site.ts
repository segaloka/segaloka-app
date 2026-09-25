import { headers } from "next/headers";

// Base URL of the site the user is actually on (e.g. the production domain),
// derived from the incoming request. Used for Supabase email links so they
// never point at a per-deployment VERCEL_URL. Each domain used here must also
// be listed under Supabase → Auth → URL Configuration → Redirect URLs.
export function getSiteUrl(): string {
  const h = headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

// Only allow same-site relative paths as post-login destinations
// (blocks "//evil.com" and "@evil.com" style open redirects).
export function safeNextPath(next: string | null | undefined, fallback = "/akun"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
