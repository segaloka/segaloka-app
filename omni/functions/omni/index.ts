// SEGALOKA Omnichannel — Supabase Edge Function "omni"
//   GET  /omni/webhook/meta        verifikasi webhook Meta (hub.challenge)
//   POST /omni/webhook/meta        pesan & status WhatsApp Cloud API, Messenger, Instagram DM
//   POST /omni/webhook/telegram    update Telegram Bot API
//   POST /omni/webhook/email       email masuk (format Postmark / Resend inbound / JSON umum)
//   POST /omni/send                dipanggil trigger outbox (header x-sg-key) -> kirim ke provider
// Token dibaca dari env (Edge Function secrets) atau Supabase Vault (nama omni_<nama>).
import postgres from "npm:postgres@3.4.4";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 3 });
const GRAPH = "https://graph.facebook.com/v21.0";
const FN_URL = "https://lcfjqhnimbigwiqkrapm.supabase.co/functions/v1/omni";
const cache = new Map<string, { v: string | null; t: number }>();

async function secret(name: string): Promise<string | null> {
  const env = Deno.env.get(name.toUpperCase());
  if (env) return env;
  const c = cache.get(name);
  if (c && Date.now() - c.t < 60_000) return c.v;
  const r = await sql`select decrypted_secret from vault.decrypted_secrets where name = ${name === "sg_omni_key" ? name : "omni_" + name}`;
  const v = r[0]?.decrypted_secret ?? null;
  cache.set(name, { v, t: Date.now() });
  return v;
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
const now = () => Date.now();
const uid = (p: string) => p + "-" + now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

async function logEvent(channel: string, kind: string, payload: unknown, ok = true, error: string | null = null) {
  await sql`insert into control_center.omni_events (channel, kind, payload, ok, error) values (${channel}, ${kind}, ${sql.json(payload as any)}, ${ok}, ${error})`;
}
async function channelCfg(id: string): Promise<Record<string, any>> {
  const r = await sql`select data from control_center.records where collection = 'channels' and id = ${id}`;
  return r[0]?.data ?? {};
}

// ---------- percakapan: cari yang terbuka untuk kontak ini atau buat baru, lalu tambahkan pesan ----------
async function appendInbound(channel: string, extId: string, name: string, text: string, extra: Record<string, unknown> = {}) {
  const cfg = await channelCfg(channel);
  const msg = { dir: "in", text: text || "(lampiran)", ts: now(), extId: extra.msgId ?? null, ...(extra.media ? { media: extra.media } : {}) };
  await sql.begin(async (tx) => {
    const r = await tx`select id, data from control_center.conversations
      where data->>'channel' = ${channel} and data->>'extId' = ${extId} and data->>'status' <> 'closed'
      order by updated_at desc limit 1 for update`;
    if (r.length) {
      const d = r[0].data;
      if (msg.extId && (d.messages || []).some((m: any) => m.extId === msg.extId)) return; // duplikat webhook
      d.messages = [...(d.messages || []), msg];
      d.ts = msg.ts; d.unread = (d.unread || 0) + 1; d.lastIn = msg.ts;
      if (d.status === "resolved" || d.status === "pending") d.status = "open";
      if (name && (!d.contact || d.contact === extId)) d.contact = name;
      await tx`update control_center.conversations set data = ${tx.json(d)}, updated_at = now() where id = ${r[0].id}`;
    } else {
      const id = uid("CNV");
      const d = { id, channel, extId, contact: name || extId, status: "open", assignee: null, unread: 1, ts: msg.ts, lastIn: msg.ts,
        queue: cfg?.cfg?.queue || "Default", kind: "lead", source: "webhook", tags: [], messages: [msg], sla: null };
      await tx`insert into control_center.conversations (id, data) values (${id}, ${tx.json(d)})`;
    }
  });
}

// status pengiriman dari provider -> outbox + pesan di percakapan
async function applyStatus(providerId: string, status: string, error: string | null = null) {
  const map: Record<string, string> = { sent: "sent", delivered: "delivered", read: "read", failed: "failed" };
  const st = map[status]; if (!st) return;
  const r = await sql`update control_center.omni_outbox set status = ${st}, error = coalesce(${error}, error), updated_at = now()
    where provider_id = ${providerId} returning conv_id, msg_ts`;
  if (r[0]?.conv_id) await setMsgStatus(r[0].conv_id, Number(r[0].msg_ts), st, error);
}
async function setMsgStatus(convId: string, ts: number, st: string, error: string | null) {
  await sql.begin(async (tx) => {
    const c = await tx`select data from control_center.conversations where id = ${convId} for update`;
    if (!c.length) return;
    const d = c[0].data; let hit = false;
    d.messages = (d.messages || []).map((m: any) => (m.dir === "out" && m.ts === ts ? (hit = true, { ...m, status: st, ...(error ? { error } : {}) }) : m));
    if (hit) await tx`update control_center.conversations set data = ${tx.json(d)}, updated_at = now() where id = ${convId}`;
  });
}

// ---------- webhook Meta ----------
async function verifySig(req: Request, raw: string): Promise<boolean> {
  const secretVal = await secret("meta_app_secret");
  if (!secretVal) return false; // wajib: tanpa App Secret, pesan tidak bisa dipastikan berasal dari Meta
  const sig = req.headers.get("x-hub-signature-256") || "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secretVal), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = "sha256=" + [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== sig.length) return false;
  let diff = 0; for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
async function metaWebhook(req: Request) {
  if (req.method === "GET") {
    const u = new URL(req.url);
    const want = await secret("meta_verify_token");
    const ok = !!want && u.searchParams.get("hub.mode") === "subscribe" && u.searchParams.get("hub.verify_token") === want;
    await logEvent("meta", "verify", { ok }, ok, ok ? null : "verify_token tidak cocok / belum diisi");
    return ok ? new Response(u.searchParams.get("hub.challenge") || "", { status: 200 }) : new Response("forbidden", { status: 403 });
  }
  const raw = await req.text();
  if (!(await verifySig(req, raw))) { const has = !!(await secret("meta_app_secret")); await logEvent("meta", "signature", null, false, has ? "X-Hub-Signature-256 tidak valid" : "App Secret belum diisi — webhook ditolak"); return new Response("bad signature", { status: 401 }); }
  const body = JSON.parse(raw || "{}");
  try {
    if (body.object === "whatsapp_business_account") {
      for (const e of body.entry || []) for (const ch of e.changes || []) {
        const v = ch.value || {};
        const names: Record<string, string> = {};
        for (const c of v.contacts || []) names[c.wa_id] = c.profile?.name || c.wa_id;
        for (const m of v.messages || []) {
          const text = m.text?.body ?? m.button?.text ?? m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title
            ?? m.image?.caption ?? m.document?.caption ?? (m.location ? `Lokasi: ${m.location.latitude},${m.location.longitude}` : `(${m.type})`);
          await appendInbound("wa", m.from, names[m.from] || m.from, text, { msgId: m.id, media: m.image?.id || m.document?.id || m.audio?.id || null });
        }
        for (const s of v.statuses || []) await applyStatus(s.id, s.status, s.errors?.[0]?.title ?? null);
      }
      await logEvent("wa", "webhook", body);
    } else if (body.object === "page" || body.object === "instagram") {
      const chId = body.object === "page" ? "fb" : "ig";
      for (const e of body.entry || []) for (const ev of e.messaging || []) {
        if (ev.message?.is_echo) continue;
        if (ev.message) {
          const att = ev.message.attachments?.[0];
          await appendInbound(chId, ev.sender.id, await profileName(chId, ev.sender.id), ev.message.text || (att ? `(${att.type})` : ""), { msgId: ev.message.mid, media: att?.payload?.url || null });
        }
        if (ev.delivery) for (const mid of ev.delivery.mids || []) await applyStatus(mid, "delivered");
        if (ev.read) { /* read watermark: tandai terbaca di level percakapan */ }
      }
      await logEvent(chId, "webhook", body);
    } else await logEvent("meta", "unknown", body, false, "object tidak dikenal: " + body.object);
  } catch (err) { await logEvent("meta", "error", body, false, String(err)); }
  return new Response("EVENT_RECEIVED", { status: 200 }); // Meta butuh 200 cepat
}
async function profileName(ch: string, psid: string): Promise<string> {
  const tok = await secret(ch === "ig" ? "meta_ig_token" : "meta_page_token") || await secret("meta_page_token");
  if (!tok) return psid;
  try {
    const f = ch === "ig" ? "name,username" : "first_name,last_name";
    const r = await fetch(`${GRAPH}/${psid}?fields=${f}&access_token=${tok}`);
    const j = await r.json();
    return j.username ? `@${j.username}` : [j.first_name, j.last_name, j.name].filter(Boolean).join(" ") || psid;
  } catch { return psid; }
}

// ---------- webhook Telegram ----------
async function telegramWebhook(req: Request) {
  const want = await secret("telegram_webhook_secret");
  if (!want || req.headers.get("x-telegram-bot-api-secret-token") !== want) return new Response("forbidden", { status: 403 });
  const u = await req.json();
  const m = u.message || u.edited_message;
  if (m) {
    const name = [m.from?.first_name, m.from?.last_name].filter(Boolean).join(" ") || (m.from?.username ? "@" + m.from.username : String(m.chat.id));
    await appendInbound("tg", String(m.chat.id), name, m.text || m.caption || "(lampiran)", { msgId: String(m.message_id) });
  }
  await logEvent("tg", "webhook", u);
  return json({ ok: true });
}

// ---------- email masuk ----------
async function emailWebhook(req: Request) {
  const key = await secret("email_inbound_key");
  const got = new URL(req.url).searchParams.get("key") || req.headers.get("x-sg-key");
  if (!key || got !== key) return new Response("forbidden", { status: 403 });
  const b = await req.json();
  const d = b.data || b; // Resend inbound membungkus di data
  const from = d.FromFull?.Email || d.from?.email || d.from || "";
  const name = d.FromFull?.Name || d.from?.name || from;
  const subject = d.Subject || d.subject || "";
  const text = d.StrippedTextReply || d.TextBody || d.text || (d.html ? String(d.html).replace(/<[^>]+>/g, " ") : "");
  const addr = String(from).replace(/^.*<([^>]+)>.*$/, "$1").toLowerCase();
  await appendInbound("email", addr, name, (subject ? `[${subject}] ` : "") + String(text).trim().slice(0, 4000), { msgId: d.MessageID || d.message_id || null });
  await logEvent("email", "inbound", { from: addr, subject });
  return json({ ok: true });
}

// ---------- kirim (outbox) ----------
async function send(req: Request) {
  if (req.headers.get("x-sg-key") !== (await secret("sg_omni_key"))) return new Response("forbidden", { status: 403 });
  const { id } = await req.json();
  const rows = await sql`update control_center.omni_outbox set status = 'sending', attempts = attempts + 1, updated_at = now()
    where id = ${id} and status in ('queued','failed') returning *`;
  const o = rows[0]; if (!o) return json({ skipped: true });
  if (o.kind === "ping") return ping(o);
  const cfg = (await channelCfg(o.channel)).cfg || {};
  const text: string = o.body?.text ?? "";
  let res: Response, pid: string | null = null, err: string | null = null;
  try {
    if (o.channel === "wa") {
      const tok = await secret("meta_access_token"); if (!tok) throw new Error("Token WhatsApp (meta_access_token) belum diisi");
      if (!cfg.phoneNumberId) throw new Error("Phone Number ID belum diisi di konfigurasi channel");
      const payload = o.kind === "template"
        ? { messaging_product: "whatsapp", to: o.to_addr, type: "template", template: { name: o.body.template, language: { code: o.body.lang || "id" }, components: o.body.components || [] } }
        : { messaging_product: "whatsapp", to: o.to_addr, type: "text", text: { body: text, preview_url: true } };
      res = await fetch(`${GRAPH}/${cfg.phoneNumberId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json(); if (!res.ok) throw new Error(j.error?.message || res.statusText); pid = j.messages?.[0]?.id ?? null;
    } else if (o.channel === "fb" || o.channel === "ig") {
      const tok = o.channel === "ig" ? (await secret("meta_ig_token")) || (await secret("meta_page_token")) : await secret("meta_page_token");
      if (!tok) throw new Error("Page access token (meta_page_token) belum diisi");
      const node = o.channel === "ig" ? (cfg.igUserId || "me") : (cfg.pageId || "me");
      res = await fetch(`${GRAPH}/${node}/messages?access_token=${encodeURIComponent(tok)}`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: { id: o.to_addr }, messaging_type: "RESPONSE", message: { text } }) });
      const j = await res.json(); if (!res.ok) throw new Error(j.error?.message || res.statusText); pid = j.message_id ?? null;
    } else if (o.channel === "email") {
      const key = await secret("resend_api_key"); if (!key) throw new Error("Resend API key belum diisi");
      if (!cfg.from) throw new Error("Alamat pengirim (from) belum diisi");
      res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: cfg.from, to: [o.to_addr], subject: o.body.subject || "SEGALOKA", text, reply_to: cfg.replyTo || undefined }) });
      const j = await res.json(); if (!res.ok) throw new Error(j.message || res.statusText); pid = j.id ?? null;
    } else if (o.channel === "tg") {
      const tok = await secret("telegram_bot_token"); if (!tok) throw new Error("Telegram bot token belum diisi");
      res = await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: o.to_addr, text }) });
      const j = await res.json(); if (!j.ok) throw new Error(j.description || "telegram error"); pid = String(j.result?.message_id ?? "");
    } else throw new Error("channel tidak didukung: " + o.channel);
  } catch (e) { err = String((e as Error).message || e); }
  const st = err ? "failed" : "sent";
  await sql`update control_center.omni_outbox set status = ${st}, provider_id = ${pid}, error = ${err}, updated_at = now() where id = ${o.id}`;
  if (o.conv_id) await setMsgStatus(o.conv_id, Number(o.msg_ts), st, err);
  return json({ id: o.id, status: st, error: err });
}

// cek kesiapan: token apa saja yang ada + validasi ringan ke provider
async function ping(o: any) {
  const out: Record<string, unknown> = { at: now() };
  const has = async (n: string) => !!(await secret(n));
  out.secrets = Object.fromEntries(await Promise.all(["meta_access_token", "meta_page_token", "meta_ig_token", "meta_app_secret", "meta_verify_token", "resend_api_key", "telegram_bot_token", "telegram_webhook_secret", "email_inbound_key"].map(async (n) => [n, await has(n)])));
  const checks: Record<string, unknown> = {};
  try {
    const wa = (await channelCfg("wa")).cfg || {}; const tok = await secret("meta_access_token");
    if (tok && wa.phoneNumberId) { const r = await fetch(`${GRAPH}/${wa.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating&access_token=${tok}`); checks.wa = await r.json(); }
    const pt = await secret("meta_page_token");
    if (pt) { const r = await fetch(`${GRAPH}/me?fields=id,name,instagram_business_account{id,username}&access_token=${pt}`); checks.page = await r.json(); }
    const tg = await secret("telegram_bot_token");
    if (tg) {
      const r = await fetch(`https://api.telegram.org/bot${tg}/getMe`); const j = await r.json(); checks.tg = { ok: j.ok, username: j.result?.username };
      const sec = await secret("telegram_webhook_secret");
      if (j.ok && sec) {
        const w = await fetch(`https://api.telegram.org/bot${tg}/setWebhook`, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: FN_URL + "/webhook/telegram", secret_token: sec, allowed_updates: ["message", "edited_message"] }) });
        checks.tgWebhook = !!(await w.json()).ok;
      }
    }
  } catch (e) { checks.error = String(e); }
  out.checks = checks;
  await sql`insert into control_center.settings (key, value) values ('omni_health', ${sql.json(out as any)}) on conflict (key) do update set value = excluded.value, updated_at = now()`;
  await sql`update control_center.omni_outbox set status = 'sent', updated_at = now() where id = ${o.id}`;
  return json(out);
}

Deno.serve(async (req) => {
  const p = new URL(req.url).pathname.replace(/^\/(functions\/v1\/)?omni/, "");
  try {
    if (p.startsWith("/webhook/meta")) return await metaWebhook(req);
    if (p.startsWith("/webhook/telegram")) return await telegramWebhook(req);
    if (p.startsWith("/webhook/email")) return await emailWebhook(req);
    if (p.startsWith("/send")) return await send(req);
    return json({ service: "segaloka-omni", ok: true });
  } catch (e) {
    try { await logEvent("omni", "error", { path: p }, false, String(e)); } catch { /* ignore */ }
    return json({ error: String(e) }, 500);
  }
});
