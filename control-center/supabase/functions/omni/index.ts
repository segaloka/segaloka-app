// SEGALOKA Omnichannel gateway — Supabase Edge Function "omni"
// Routes (base: https://<project>.supabase.co/functions/v1/omni):
//   GET  /meta                      Meta webhook verification (hub.challenge)
//   POST /meta                      Meta webhook: WhatsApp Cloud API, Messenger, Instagram DM (signed X-Hub-Signature-256)
//   POST /telegram                  Telegram bot webhook (X-Telegram-Bot-Api-Secret-Token)
//   POST /internal/send             outbox row -> provider API   (called by DB trigger, header x-sg-key)
//   POST /internal/validate         check credentials + register webhook (called by DB trigger, header x-sg-key)
// Data lives in schema control_center (channel_accounts, outbox, conversations, audit_log).
import postgres from "npm:postgres@3.4.4";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 3, prepare: false });
const GRAPH = "https://graph.facebook.com/v21.0";
const FN_BASE = (Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "") + "/functions/v1/omni";
const CH = { whatsapp: "wa", messenger: "fb", instagram: "ig", telegram: "tg" } as const;

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
const rid = (p: string) => p + "-" + crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

async function hookKey(): Promise<string> {
  const r = await sql`select value from control_center.omni_secrets where key = 'hook_key'`;
  return r[0]?.value ?? "";
}
async function account(channel: string) {
  const r = await sql`select * from control_center.channel_accounts where id = ${channel}`;
  return r[0] ?? null;
}
async function audit(action: string, resource: string, result: string, after?: string) {
  await sql`insert into control_center.audit_log (id, ts, actor, action, resource, result, source, after, is_demo)
            values (${rid("AUD")}, now(), 'Omni Gateway', ${action}, ${resource}, ${result}, 'Edge Function omni', ${after ?? null}, false)`;
}
async function markAccount(channel: string, patch: { status?: string; last_error?: string | null; config?: Record<string, unknown>; event?: boolean }) {
  await sql`update control_center.channel_accounts set
      status = coalesce(${patch.status ?? null}, status),
      last_error = ${patch.last_error === undefined ? sql`last_error` : patch.last_error},
      config = config || ${sql.json(patch.config ?? {})},
      last_event_at = case when ${!!patch.event} then now() else last_event_at end,
      updated_at = now()
    where id = ${channel}`;
}

// Append an inbound message to the conversation for (channel, sender); create it if new.
async function inbound(channel: string, sender: string, name: string, text: string, ts: number, extId: string, extra: Record<string, unknown> = {}) {
  const convId = "CNV-" + channel.toUpperCase() + "-" + sender.replace(/[^A-Za-z0-9]/g, "").slice(-24);
  const msg = { dir: "in", text, ts, ext: extId, ...extra };
  const acc = await account(channel);
  const queue = acc?.config?.queue ?? "Default";
  const base = { id: convId, channel, contact: name || sender, handle: sender, traveler: null, booking: null, travel: null, campaign: null, kind: "lead", status: "open", assignee: null, unread: 1, tags: ["Lead"], sla: null, queue, messages: [msg], ts };
  await sql`
    insert into control_center.conversations (id, data, is_demo) values (${convId}, ${sql.json(base)}, false)
    on conflict (id) do update set
      data = case when exists (select 1 from jsonb_array_elements(control_center.conversations.data->'messages') m where m->>'ext' = ${extId})
        then control_center.conversations.data
        else control_center.conversations.data
          || jsonb_build_object(
               'messages', coalesce(control_center.conversations.data->'messages', '[]'::jsonb) || jsonb_build_array(${sql.json(msg)}::jsonb),
               'ts', ${ts}::bigint,
               'unread', coalesce((control_center.conversations.data->>'unread')::int, 0) + 1,
               'status', case when control_center.conversations.data->>'status' in ('resolved','closed','pending') then 'open' else control_center.conversations.data->>'status' end,
               'contact', coalesce(nullif(control_center.conversations.data->>'contact', ''), ${name || sender}))
        end,
      updated_at = now()`;
  await markAccount(channel, { event: true });
}

async function statusUpdate(providerId: string, status: string, error?: string) {
  await sql`update control_center.outbox set status = ${status}, error = coalesce(${error ?? null}, error), updated_at = now() where provider_msg_id = ${providerId}`;
}

// ---------- Meta signature ----------
async function validSignature(raw: string, header: string | null): Promise<boolean> {
  const secrets = (await sql`select secrets->>'app_secret' as s from control_center.channel_accounts where id in ('wa','fb','ig') and coalesce(secrets->>'app_secret','') <> ''`).map((r) => r.s as string);
  if (!secrets.length) return false; // refuse unsigned traffic until an App Secret is configured
  if (!header?.startsWith("sha256=")) return false;
  const want = header.slice(7);
  for (const s of secrets) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(s), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
    const hex = [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hex.length === want.length && hex === want) return true;
  }
  return false;
}

async function handleMeta(body: any) {
  if (body.object === "whatsapp_business_account") {
    for (const e of body.entry ?? []) for (const ch of e.changes ?? []) {
      const v = ch.value ?? {};
      const names: Record<string, string> = {};
      for (const c of v.contacts ?? []) names[c.wa_id] = c.profile?.name ?? "";
      for (const m of v.messages ?? []) {
        const text = m.type === "text" ? m.text?.body : m.type === "button" ? m.button?.text : m.type === "interactive" ? (m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title) : `[${m.type}]`;
        await inbound("wa", m.from, names[m.from] ?? "", text ?? "", Number(m.timestamp) * 1000, m.id, { phone: "+" + m.from });
      }
      for (const s of v.statuses ?? []) await statusUpdate(s.id, s.status, s.errors?.[0]?.title);
    }
  } else if (body.object === "page" || body.object === "instagram") {
    const channel = body.object === "page" ? "fb" : "ig";
    for (const e of body.entry ?? []) for (const ev of e.messaging ?? []) {
      if (ev.message && !ev.message.is_echo) {
        const text = ev.message.text ?? (ev.message.attachments?.length ? `[${ev.message.attachments[0].type}]` : "");
        await inbound(channel, ev.sender.id, "", text, ev.timestamp ?? Date.now(), ev.message.mid);
      }
      if (ev.delivery) for (const mid of ev.delivery.mids ?? []) await statusUpdate(mid, "delivered");
      if (ev.read && ev.read.mid) await statusUpdate(ev.read.mid, "read");
    }
  }
}

// ---------- sending ----------
async function send(outboxId: string) {
  const r = await sql`select * from control_center.outbox where id = ${outboxId}`;
  const o = r[0]; if (!o || o.status !== "queued") return { skipped: true };
  const acc = await account(o.channel);
  const fail = async (err: string) => { await sql`update control_center.outbox set status = 'failed', error = ${err}, updated_at = now() where id = ${outboxId}`; await audit("omni.send", "Outbox/" + outboxId, "failed", err); return { ok: false, err }; };
  if (!acc || acc.status !== "active") return fail("Channel belum terhubung");
  const sec = acc.secrets ?? {}; const cfg = acc.config ?? {};
  let res: Response, pid = "";
  try {
    if (o.channel === "wa") {
      res = await fetch(`${GRAPH}/${cfg.phone_number_id}/messages`, { method: "POST", headers: { authorization: "Bearer " + sec.access_token, "content-type": "application/json" },
        body: JSON.stringify(o.template ? { messaging_product: "whatsapp", to: o.recipient, type: "template", template: o.template } : { messaging_product: "whatsapp", to: o.recipient, type: "text", text: { body: o.text } }) });
      const j = await res.json(); if (!res.ok) return fail(j.error?.message ?? res.statusText); pid = j.messages?.[0]?.id ?? "";
    } else if (o.channel === "fb" || o.channel === "ig") {
      res = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(sec.page_token)}`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipient: { id: o.recipient }, message: { text: o.text }, messaging_type: "RESPONSE" }) });
      const j = await res.json(); if (!res.ok) return fail(j.error?.message ?? res.statusText); pid = j.message_id ?? "";
    } else if (o.channel === "tg") {
      res = await fetch(`https://api.telegram.org/bot${sec.bot_token}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: o.recipient, text: o.text }) });
      const j = await res.json(); if (!j.ok) return fail(j.description ?? "Telegram error"); pid = "tg-" + j.result?.message_id;
    } else return fail("Channel tidak didukung: " + o.channel);
  } catch (e) { return fail(String((e as Error).message ?? e)); }
  await sql`update control_center.outbox set status = 'sent', provider_msg_id = ${pid}, error = null, updated_at = now() where id = ${outboxId}`;
  return { ok: true, pid };
}

// ---------- credential validation ----------
async function validate(channel: string) {
  const acc = await account(channel); if (!acc) return { ok: false };
  const sec = acc.secrets ?? {}; const cfg = acc.config ?? {};
  const bad = async (m: string) => { await markAccount(channel, { status: "error", last_error: m }); await audit("channel.validate", "Channel/" + channel, "failed", m); return { ok: false, error: m }; };
  try {
    if (channel === "wa") {
      if (!cfg.phone_number_id || !sec.access_token) return bad("Phone Number ID dan Access Token wajib diisi");
      const r = await fetch(`${GRAPH}/${cfg.phone_number_id}?fields=display_phone_number,verified_name,quality_rating`, { headers: { authorization: "Bearer " + sec.access_token } });
      const j = await r.json(); if (!r.ok) return bad(j.error?.message ?? "Token ditolak Meta");
      if (cfg.waba_id) await fetch(`${GRAPH}/${cfg.waba_id}/subscribed_apps`, { method: "POST", headers: { authorization: "Bearer " + sec.access_token } });
      await markAccount(channel, { status: "active", last_error: null, config: { display: `${j.display_phone_number} · ${j.verified_name}`, quality: j.quality_rating ?? null } });
    } else if (channel === "fb" || channel === "ig") {
      if (!sec.page_token) return bad("Page Access Token wajib diisi");
      const r = await fetch(`${GRAPH}/me?fields=id,name,instagram_business_account{username}&access_token=${encodeURIComponent(sec.page_token)}`);
      const j = await r.json(); if (!r.ok) return bad(j.error?.message ?? "Token ditolak Meta");
      if (channel === "ig" && !j.instagram_business_account) return bad("Page ini belum tertaut ke akun Instagram Business");
      await fetch(`${GRAPH}/${j.id}/subscribed_apps?subscribed_fields=messages,message_deliveries,message_reads,messaging_postbacks&access_token=${encodeURIComponent(sec.page_token)}`, { method: "POST" });
      await markAccount(channel, { status: "active", last_error: null, config: { page_id: j.id, display: channel === "ig" ? "@" + j.instagram_business_account.username + " · via " + j.name : j.name + " · Messenger" } });
    } else if (channel === "tg") {
      if (!sec.bot_token) return bad("Bot Token wajib diisi");
      const me = await (await fetch(`https://api.telegram.org/bot${sec.bot_token}/getMe`)).json();
      if (!me.ok) return bad(me.description ?? "Bot token tidak valid");
      const hook = await (await fetch(`https://api.telegram.org/bot${sec.bot_token}/setWebhook`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: FN_BASE + "/telegram", secret_token: acc.verify_token, allowed_updates: ["message"] }) })).json();
      if (!hook.ok) return bad(hook.description ?? "setWebhook gagal");
      await markAccount(channel, { status: "active", last_error: null, config: { display: "@" + me.result.username } });
    } else return bad("Channel tidak didukung");
  } catch (e) { return bad(String((e as Error).message ?? e)); }
  await audit("channel.validate", "Channel/" + channel, "success");
  return { ok: true };
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/omni/, "") || "/";
  try {
    if (path === "/meta" && req.method === "GET") {
      const mode = url.searchParams.get("hub.mode"), token = url.searchParams.get("hub.verify_token"), challenge = url.searchParams.get("hub.challenge");
      const ok = (await sql`select 1 from control_center.channel_accounts where id in ('wa','fb','ig') and verify_token = ${token ?? ""}`).length > 0;
      return mode === "subscribe" && ok ? new Response(challenge ?? "", { status: 200 }) : new Response("forbidden", { status: 403 });
    }
    if (path === "/meta" && req.method === "POST") {
      const raw = await req.text();
      if (!(await validSignature(raw, req.headers.get("x-hub-signature-256")))) return new Response("bad signature", { status: 401 });
      await handleMeta(JSON.parse(raw));
      return json({ ok: true });
    }
    if (path === "/telegram" && req.method === "POST") {
      const acc = await account("tg");
      if (!acc || req.headers.get("x-telegram-bot-api-secret-token") !== acc.verify_token) return new Response("forbidden", { status: 403 });
      const u = await req.json(); const m = u.message;
      if (m?.chat) await inbound("tg", String(m.chat.id), [m.from?.first_name, m.from?.last_name].filter(Boolean).join(" ") || m.from?.username || "", m.text ?? "[media]", (m.date ?? 0) * 1000 || Date.now(), "tg-" + m.message_id);
      return json({ ok: true });
    }
    if (path.startsWith("/internal/")) {
      const key = await hookKey();
      if (!key || req.headers.get("x-sg-key") !== key) return new Response("forbidden", { status: 403 });
      const b = await req.json();
      if (path === "/internal/send") return json(await send(b.id));
      if (path === "/internal/validate") return json(await validate(b.id));
    }
    return new Response("not found", { status: 404 });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: String((e as Error).message ?? e) }, 500);
  }
});
