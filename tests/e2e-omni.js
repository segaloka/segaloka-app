// E2E mode produksi: database berisi seed demo lama -> dicadangkan & dikosongkan -> seluruh ekosistem
// diisi dari nol lewat UI di beberapa layar (Admin, Travel, Vendor, Affiliate, Pengguna), realtime.
// Butuh Postgres lokal (socket /tmp/pgd, port 55432) yang meniru connector Supabase.
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const path = require('path');
const PG = ['-h', '/tmp/pgd', '-p', '55432', '-U', 'postgres', '-d', 'postgres'];
const run = q => { const sel = /^\s*select/i.test(q) && !/;\s*\S/.test(q.trim().replace(/;\s*$/, '')); const sqlq = sel ? `select coalesce(json_agg(_sgq),'[]'::json) from (${q}) _sgq` : q; try { const out = execFileSync('psql', [...PG, '-At', '-v', 'ON_ERROR_STOP=1', '-q'], { input: sqlq, maxBuffer: 1e8, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim(); const tag = 'untrusted-data-abc'; return { ok: true, payload: { result: `Below <${tag}> x.\n\n<${tag}>\n${sel ? out : '[]'}\n</${tag}>\n\nUse` } }; } catch (e) { return { ok: false, message: (e.stderr || '').toString() }; } };
const q = s => execFileSync('psql', [...PG, '-At', '-c', s]).toString().trim();
const V5 = process.env.V5_HTML || path.join(__dirname, 'v5.html'), V6 = path.join(__dirname, '..', 'segaloka-control-center.html');
const W = +(process.env.W || 1440);
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) { fails++; process.exitCode = 1; } };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (file, hash, w) => { const ctx = await b.newContext({ viewport: { width: w || W, height: 900 } }); await ctx.exposeBinding('pgq', (src, x) => run(x)); await ctx.addInitScript(() => { const mcp = { callTool: async (s, t, i) => { const r = await window.pgq(i.query); if (!r.ok) throw { code: 'tool_error', message: r.message }; return { content: [], payload: r.payload }; } }; window.claude = { use: async n => n === 'mcp' ? mcp : null }; }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(hash + ' :: ' + e.message)); await p.goto('file://' + file + '#' + hash); await p.waitForFunction(() => SB.on === true, null, { timeout: 120000 }); return p; };
  const go = (p, h) => p.evaluate(h => { closeOverlays(); location.hash = h; }, h).then(() => p.waitForTimeout(250));
  // klik aksi, lalu selesaikan dialog konfirmasi (isi alasan bila diminta)
  const act = async (p, sel) => { await p.waitForSelector(sel, { state: 'attached', timeout: 20000 }); if (!(await p.isVisible(sel))) { const id = await p.$eval(sel, e => e.dataset.id); const op = await p.$(`[data-act="res-open"][data-id="${id}"]:visible`); if (op) { await op.click(); await p.waitForTimeout(200); sel = '#ovl ' + sel; } } await p.click(sel); await p.waitForTimeout(150); const hasOk = await p.$('#ovl [data-act="confirm-ok"]'); if (hasOk) { await p.evaluate(() => document.querySelectorAll('#ovl textarea, #ovl input[type=text]').forEach(x => { if (!x.value) x.value = 'Uji E2E produksi'; })); await p.click('#ovl [data-act="confirm-ok"]'); } await settle(p); };
  const settle = async p => { await p.waitForTimeout(900); await p.waitForFunction(() => !SB.busy && !SB.again, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(200); };
  const fill = async (p, vals) => { for (const [k, v] of Object.entries(vals)) { const el = await p.$('#' + k); if (!el) throw new Error('field #' + k + ' tidak ada'); const tag = await el.evaluate(e => e.tagName + (e.type || '')); if (/SELECT/.test(tag)) await p.selectOption('#' + k, v); else if (/checkbox/.test(tag)) { if (v) await el.check(); } else await p.fill('#' + k, String(v)); } };
  const wait = (p, fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 25000 });

  q('drop schema if exists control_center cascade');
  const A = await mk(V6, '/overview'); await A.waitForTimeout(1200);
  execFileSync('psql', [...PG, '-q', '-f', '' + require('path').join(__dirname, 'omni_local_stub.sql') + '']);
  const t0 = Date.now();
  // 1) halaman channel WhatsApp: tidak ada data palsu, status belum terhubung
  await go(A, '/omni/channel/whatsapp'); await wait(A, () => !!document.querySelector('#omni-live [data-act="omni-ping"]'));
  const txt = await A.evaluate(() => document.getElementById('work').innerText);
  ok(!/811 7000 1448|BSP terverifikasi|delivered/.test(txt), 'no fake account/delivery text');
  ok(await A.evaluate(() => !omniConnected('wa')), 'WA shows not connected before setup');
  // 2) simpan ID
  await fill(A, { 'ocfg-phoneNumberId': '109876543210', 'ocfg-wabaId': '555666777', 'ocfg-display': '+62 811 0000 1111' }); await act(A, '[data-act="omni-cfg"][data-id="wa"]');
  ok(q("select data->'cfg'->>'phoneNumberId' from control_center.records where collection='channels' and id='wa'") === '109876543210', 'channel IDs persisted');
  // 3) token ke vault, tidak pernah tampil lagi
  await A.fill('#osec-meta_access_token', 'EAAG-TEST-TOKEN-123'); await A.click('[data-act="omni-sec"][data-k="meta_access_token"]'); await A.waitForTimeout(900);
  ok(q("select secret from control_center._vault_stub where name='omni_meta_access_token'") === 'EAAG-TEST-TOKEN-123', 'token stored via sg_omni_set_secret');
  ok(await A.evaluate(() => !document.body.innerHTML.includes('EAAG-TEST-TOKEN-123') && /tersimpan|stored/.test(document.getElementById('omni-live').innerText)), 'token not echoed; shown as stored');
  ok(+q("select count(*) from control_center.audit_log where action='channel.secret.set' and coalesce(after,'') not like '%EAAG%'") === 1, 'token set audited without value');
  await A.click('[data-act="omni-gen"][data-k="meta_verify_token"]'); await A.waitForTimeout(900);
  const vt = q("select secret from control_center._vault_stub where name='omni_meta_verify_token'");
  ok(/^sg_[0-9a-f]{48}$/.test(vt) && await A.evaluate(v => document.getElementById('omni-live').innerText.includes(v), vt), 'verify token generated and shown once');
  ok(await A.evaluate(() => document.getElementById('ohook').value.endsWith('/functions/v1/omni/webhook/meta')), 'callback URL shown');
  // 4) pesan masuk (seperti yang ditulis Edge Function) -> realtime di Inbox
  const now = Date.now();
  q(`insert into control_center.conversations (id, data) values ('CNV-E2EWA', '${JSON.stringify({ id: 'CNV-E2EWA', channel: 'wa', extId: '6281200001111', contact: 'Ibu Aminah', status: 'open', assignee: null, unread: 1, ts: now, lastIn: now, queue: 'Default', kind: 'lead', source: 'webhook', messages: [{ dir: 'in', text: 'Info umrah Januari?', ts: now, extId: 'wamid.X1' }] })}'::jsonb)`);
  await wait(A, () => CONVERSATIONS.some(c => c.id === 'CNV-E2EWA'), null, 30000); ok(true, 'inbound WA conversation appears in admin (realtime)');
  // 5) balas dari Inbox -> outbox
  await go(A, '/omni/inbox/CNV-E2EWA'); await A.waitForSelector('#cv-text'); await A.fill('#cv-text', 'Waalaikumsalam, ada paket 12 Januari.'); await A.click('[data-act="cv-send"]'); await settle(A); await A.waitForTimeout(800);
  const ob = JSON.parse(q("select row_to_json(o) from control_center.omni_outbox o where conv_id='CNV-E2EWA'") || 'null');
  ok(ob && ob.channel === 'wa' && ob.to_addr === '6281200001111' && ob.body.text.startsWith('Waalaikumsalam') && ob.status === 'queued', 'reply queued to outbox for WhatsApp');
  ok(q("select m->>'status' from control_center.conversations, jsonb_array_elements(data->'messages') m where id='CNV-E2EWA' and m->>'dir'='out'") === 'queued', 'message saved with status queued');
  ok(await A.evaluate(() => /antre|queued/.test(document.getElementById('chat').innerText) && !document.getElementById('chat').innerText.includes('✓✓')), 'inbox shows real status, no fake ticks');
  // 6) status dari provider (seperti Edge Function) -> tampil di Inbox
  q(`update control_center.conversations set data = jsonb_set(data, '{messages,1,status}', '"delivered"'), updated_at = now() where id='CNV-E2EWA'`);
  await wait(A, () => ((CONVERSATIONS.find(c => c.id === 'CNV-E2EWA') || {}).messages || []).some(m => m.status === 'delivered'), null, 30000);
  await A.evaluate(() => rerender()); await A.waitForTimeout(300);
  ok(await A.evaluate(() => /sampai|delivered/.test(document.getElementById('chat').innerText)), 'delivery status from provider shown');
  // 7) jendela 24 jam
  const old = now - 2 * 86400000;
  q(`insert into control_center.conversations (id, data) values ('CNV-E2EOLD', '${JSON.stringify({ id: 'CNV-E2EOLD', channel: 'wa', extId: '6281299990000', contact: 'Pak Lama', status: 'open', unread: 0, ts: old, lastIn: old, messages: [{ dir: 'in', text: 'halo', ts: old }] })}'::jsonb)`);
  await wait(A, () => CONVERSATIONS.some(c => c.id === 'CNV-E2EOLD'), null, 30000);
  await go(A, '/omni/inbox/CNV-E2EOLD'); await A.waitForSelector('#cv-text'); await A.fill('#cv-text', 'tes'); await A.click('[data-act="cv-send"]'); await A.waitForTimeout(1200);
  ok(+q("select count(*) from control_center.omni_outbox where conv_id='CNV-E2EOLD'") === 0, 'outside 24h window: blocked, nothing queued');
  // 7b) kanal internal Pesan Aplikasi: kontak pribadi disensor, tidak lewat provider
  q(`insert into control_center.conversations (id, data) values ('CNV-E2EAPP', '${JSON.stringify({ id: 'CNV-E2EAPP', channel: 'app', contact: 'Jamaah App', status: 'open', unread: 1, ts: now, lastIn: now, messages: [{ dir: 'in', text: 'Halo admin', ts: now }] })}'::jsonb)`);
  await wait(A, () => CONVERSATIONS.some(c => c.id === 'CNV-E2EAPP'), null, 30000);
  await go(A, '/omni/inbox/CNV-E2EAPP'); await A.waitForSelector('#cv-text'); await A.fill('#cv-text', 'Silakan WA saya 0812-3456-7890 atau wa.me/6281234567890'); await A.click('[data-act="cv-send"]'); await settle(A);
  const appMsg = q("select m->>'text' from control_center.conversations, jsonb_array_elements(data->'messages') m where id='CNV-E2EAPP' and m->>'dir'='out'");
  ok(!/0812|wa\.me/.test(appMsg) && /disensor/.test(appMsg), 'in-app message masks phone & wa.me: ' + appMsg);
  ok(+q("select count(*) from control_center.omni_outbox where conv_id='CNV-E2EAPP'") === 0, 'internal channel not sent to external provider');
  for (const k of ['aplikasi', 'dashboard', 'push']) { await go(A, '/omni/channel/' + k); ok(await A.evaluate(() => document.getElementById('work').innerText.length > 100 && !document.getElementById('omni-live')), 'internal channel page ' + k); }
  // 8) channel lain tersedia
  for (const [k, id] of [['instagram', 'ig'], ['facebook', 'fb'], ['email', 'email'], ['telegram', 'tg']]) { await go(A, '/omni/channel/' + k); ok(await A.evaluate(id => !!document.querySelector(`#omni-live[data-ch="${id}"] [data-act="omni-ping"]`), id), 'channel page ' + k); }
  ok(await A.evaluate(() => !!NAVIDX.om_tg && NAVIDX.om_tg.r === '/omni/channel/telegram' && activeNavId('/omni/channel/telegram') === 'om_tg'), 'Telegram in navigation');
  // 9) mode demo tidak mengirim apa pun
  const Dm = await (async () => { const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto('file://' + V6 + '?demo#/omni/channel/whatsapp'); await p.waitForTimeout(700); return p; })();
  ok(await Dm.evaluate(() => /Mode demo|Demo mode/.test(document.getElementById('work').innerText)), 'demo mode: connection panel disabled');
  const real = errs.filter(e => !/ERR_TUNNEL|Failed to load resource/.test(e));
  ok(real.length === 0, 'no JS errors' + (real.length ? ': ' + real.slice(0, 5).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED', '·', Math.round((Date.now() - t0) / 1000) + 's');
  await b.close();
})().catch(e => { console.error('CRASH', e); process.exit(2); });
