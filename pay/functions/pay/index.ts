// SEGALOKA Payment Gateway — Supabase Edge Function "pay"
//   POST /pay/create              dipanggil trigger pay_outbox (header x-sg-key) -> buat transaksi di gateway
//   POST /pay/webhook/midtrans    notifikasi Midtrans (signature SHA512 diverifikasi)
//   POST /pay/webhook/xendit      callback Xendit Invoice (header x-callback-token diverifikasi)
// Pembayaran MASUK (booking, deposit SegaDeals, subscription) dikonfirmasi otomatis lewat
// control_center.sg_gateway_paid(). Pembayaran KELUAR (refund, withdrawal) tetap manual.
import postgres from "npm:postgres@3.4.4";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 3 });
const cache = new Map<string, { v: string | null; t: number }>();
async function secret(name: string): Promise<string | null> {
  const env = Deno.env.get(name.toUpperCase());
  if (env) return env;
  const c = cache.get(name);
  if (c && Date.now() - c.t < 60_000) return c.v;
  const r = await sql`select decrypted_secret from vault.decrypted_secrets where name = ${name === "sg_omni_key" ? name : "pay_" + name}`;
  const v = r[0]?.decrypted_secret ?? null;
  cache.set(name, { v, t: Date.now() });
  return v;
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
async function cfg(): Promise<{ provider: string; mode: string }> {
  const r = await sql`select value from control_center.settings where key = 'pay_gateway'`;
  const v = r[0]?.value || {};
  return { provider: v.provider || "midtrans", mode: v.mode || "sandbox" };
}
async function sha512hex(s: string) {
  const d = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEq(a: string, b: string) { if (a.length !== b.length) return false; let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; }

async function targetInfo(kind: string, id: string) {
  if (kind === "payment") {
    const r = await sql`select p.data as p, b.data as b, t.data as tv from control_center.payments p
      left join control_center.bookings b on b.id = p.data->>'booking' left join control_center.travelers t on t.id = b.data->>'traveler' where p.id = ${id}`;
    if (!r.length) return null;
    const { p, b, tv } = r[0];
    if (p.status !== "pending") return { done: true };
    return { amount: Number(p.amount), desc: `Booking ${b?.id || ""} · ${p.id}`, name: tv?.name || "Jamaah", email: tv?.email && tv.email !== "—" ? tv.email : undefined, phone: tv?.phone };
  }
  if (kind === "subscription") {
    const t = await sql`select data from control_center.travels where id = ${id}`;
    if (!t.length) return null;
    const d = t[0].data;
    return { amount: Number(d.sub?.price || 0), desc: `Subscription ${d.sub?.plan || ""} · ${d.name}`, name: d.contact?.name || d.name, email: d.contact?.email && d.contact.email !== "—" ? d.contact.email : undefined, phone: d.contact?.phone };
  }
  const r = await sql`select data from control_center.records where collection = 'sd_ledger' and id = ${id}`;
  if (!r.length) return null;
  const d = r[0].data;
  if (d.state !== "pending") return { done: true };
  const t = await sql`select data from control_center.travels where id = ${d.travel}`;
  return { amount: Number(d.amount), desc: `Deposit SegaDeals ${d.id}`, name: t[0]?.data?.name || "Travel", email: undefined, phone: t[0]?.data?.contact?.phone };
}

async function create(id: string) {
  const r = await sql`select * from control_center.pay_outbox where id = ${id}`;
  if (!r.length) return { ok: false, error: "outbox not found" };
  const ob = r[0];
  const { provider, mode } = await cfg();
  const fail = async (e: string) => { await sql`update control_center.pay_outbox set status = 'failed', error = ${e}, provider = ${provider}, updated_at = now() where id = ${id}`; return { ok: false, error: e }; };
  const info: any = await targetInfo(ob.target_kind, ob.target_id);
  if (!info) return fail("target not found");
  if (info.done) return fail("already paid / not pending");
  const amount = Math.round(info.amount);
  if (!(amount > 0)) return fail("invalid amount");
  const orderId = `${ob.target_id}-${Date.now().toString(36).toUpperCase()}`;
  let url = "", ref = "";
  try {
    if (provider === "xendit") {
      const key = await secret("xendit_secret_key"); if (!key) return fail("Xendit secret key belum diisi");
      const res = await fetch("https://api.xendit.co/v2/invoices", { method: "POST", headers: { "content-type": "application/json", authorization: "Basic " + btoa(key + ":") },
        body: JSON.stringify({ external_id: orderId, amount, description: info.desc, currency: "IDR", customer: { given_names: info.name, email: info.email, mobile_number: info.phone } }) });
      const j = await res.json(); if (!res.ok) return fail("Xendit: " + (j.message || res.status));
      url = j.invoice_url; ref = j.id;
    } else {
      const key = await secret("midtrans_server_key"); if (!key) return fail("Midtrans server key belum diisi");
      const host = mode === "production" ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
      const res = await fetch(host + "/snap/v1/transactions", { method: "POST", headers: { "content-type": "application/json", accept: "application/json", authorization: "Basic " + btoa(key + ":") },
        body: JSON.stringify({ transaction_details: { order_id: orderId, gross_amount: amount }, item_details: [{ id: ob.target_id, price: amount, quantity: 1, name: info.desc.slice(0, 50) }], customer_details: { first_name: info.name, email: info.email, phone: info.phone } }) });
      const j = await res.json(); if (!res.ok) return fail("Midtrans: " + ((j.error_messages || []).join("; ") || res.status));
      url = j.redirect_url; ref = j.token;
    }
  } catch (e) { return fail(String(e)); }
  await sql`update control_center.pay_outbox set status = 'created', order_id = ${orderId}, provider = ${provider}, checkout_url = ${url}, updated_at = now() where id = ${id}`;
  if (ob.target_kind === "payment") await sql`update control_center.payments set data = data || ${sql.json({ checkoutUrl: url, orderId, gateway: provider, gatewayToken: ref })}, updated_at = now() where id = ${ob.target_id}`;
  else if (ob.target_kind === "sd_ledger") await sql`update control_center.records set data = data || ${sql.json({ checkoutUrl: url, orderId, gateway: provider })}, updated_at = now() where collection = 'sd_ledger' and id = ${ob.target_id}`;
  return { ok: true, url };
}

async function byOrder(orderId: string) {
  const r = await sql`select target_kind, target_id, amount from control_center.pay_outbox where order_id = ${orderId}`;
  return r[0] || null;
}

Deno.serve(async (req) => {
  const path = new URL(req.url).pathname.replace(/^.*\/pay/, "");
  try {
    if (req.method === "POST" && path === "/create") {
      const k = await secret("sg_omni_key");
      if (!k || !safeEq(req.headers.get("x-sg-key") || "", k)) return json({ error: "unauthorized" }, 401);
      const { id } = await req.json();
      return json(await create(id));
    }
    if (req.method === "POST" && path === "/webhook/midtrans") {
      const b = await req.json();
      const key = await secret("midtrans_server_key"); if (!key) return json({ error: "not configured" }, 503);
      const sig = await sha512hex(`${b.order_id}${b.status_code}${b.gross_amount}${key}`);
      if (!b.signature_key || !safeEq(sig, String(b.signature_key))) return json({ error: "bad signature" }, 401);
      const t = await byOrder(b.order_id); if (!t) return json({ ok: true, ignored: "unknown order" });
      const st = b.transaction_status; const fraud = b.fraud_status;
      if ((st === "settlement" || (st === "capture" && fraud !== "deny")) && b.status_code === "200") {
        const res = await sql`select control_center.sg_gateway_paid(${t.target_kind}, ${t.target_id}, ${Number(b.gross_amount)}, ${b.transaction_id || b.order_id}, ${"Midtrans · " + (b.payment_type || "")}) as r`;
        return json({ ok: true, result: res[0].r });
      }
      if (["expire", "cancel", "deny", "failure"].includes(st)) await sql`select control_center.sg_gateway_failed(${t.target_kind}, ${t.target_id}, ${st})`;
      return json({ ok: true, status: st });
    }
    if (req.method === "POST" && path === "/webhook/xendit") {
      const tok = await secret("xendit_callback_token"); if (!tok) return json({ error: "not configured" }, 503);
      if (!safeEq(req.headers.get("x-callback-token") || "", tok)) return json({ error: "bad token" }, 401);
      const b = await req.json();
      const t = await byOrder(b.external_id); if (!t) return json({ ok: true, ignored: "unknown order" });
      if (b.status === "PAID" || b.status === "SETTLED") {
        const res = await sql`select control_center.sg_gateway_paid(${t.target_kind}, ${t.target_id}, ${Number(b.paid_amount || b.amount)}, ${b.id || b.external_id}, ${"Xendit · " + (b.payment_channel || b.payment_method || "")}) as r`;
        return json({ ok: true, result: res[0].r });
      }
      if (b.status === "EXPIRED") await sql`select control_center.sg_gateway_failed(${t.target_kind}, ${t.target_id}, 'expired')`;
      return json({ ok: true, status: b.status });
    }
    return json({ error: "not found" }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
