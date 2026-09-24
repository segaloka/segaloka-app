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
  // 1) kondisi awal = database lama berisi seed demo
  const P = await mk(V5, '/overview'); await P.waitForTimeout(1500); await P.context().close();
  const coreBefore = +q("select (select count(*) from control_center.travels)+(select count(*) from control_center.bookings)+(select count(*) from control_center.payments)");
  ok(coreBefore > 50, 'precondition: demo seed present (' + coreBefore + ' core rows)');

  // 2) buka versi produksi -> cadangkan & kosongkan
  const A = await mk(V6, '/overview'); await A.waitForTimeout(1500);
  ok(+q("select count(*) from control_center.travels") > 0 && await A.evaluate(() => SB.needPurge === true && !!document.querySelector('[data-act="sb-purge"]')), 'no automatic purge: owner confirmation banner shown');
  await act(A, '[data-act="sb-purge"]');
  ok(q("select value #>> '{}' from control_center.settings where key='data_mode'") === 'production', 'data_mode = production');
  ok(+q("select count(*) from control_center.demo_backup where tbl in ('travels','bookings','payments')") === coreBefore, 'demo rows backed up to demo_backup');
  ok(+q("select (select count(*) from control_center.travels)+(select count(*) from control_center.bookings)+(select count(*) from control_center.payments)+(select count(*) from control_center.approvals)") === 0, 'core entity tables emptied');
  ok(+q("select count(*) from control_center.records where collection in ('sd_requests','commissions','branches','contacts','deposits')") === 0, 'entity records emptied');
  ok(+q("select count(*) from control_center.records where collection in ('placements','fees','plans','templates')") > 0, 'configuration kept');
  ok(await A.evaluate(() => TRAVELS.length === 0 && BOOKINGS.length === 0 && SERIES.every(d => d.gmv === 0)), 'UI shows no fake entities / series');
  const ovText = await A.evaluate(() => document.getElementById('work').innerText);
  ok(!/48[.,]213|4m 12s|91,2%|1[.,]284/.test(ovText), 'overview has no hardcoded figures');
  const t0 = Date.now();
  const A2 = await mk(V6, '/overview'); await A2.context().close();
  ok(+q("select count(*) from control_center.audit_log where action='database.production'") === 1, 'purge runs once (idempotent)');

  // 3) Travel mendaftar lewat portal (layar B) -> muncul realtime di Admin
  const B = await mk(V6, '/p/travel');
  await fill(B, { 'ob-name': 'PT Amanah Wisata E2E', 'ob-contact': 'Budi', 'ob-phone': '0812000111' }); await act(B, '[data-act="ob-save"][data-ws="travel"]');
  const tid = await B.evaluate(() => TRAVELS[0] && TRAVELS[0].id);
  ok(!!tid && q(`select data->>'op' from control_center.travels where id='${tid}'`) === 'review', 'travel registered from portal: ' + tid);
  await wait(A, tid => APPROVALS.some(a => a.type === 'travel_verif' && a.reqRef === tid), tid); ok(true, 'verification approval appeared on admin (realtime)');
  const apid = await A.evaluate(tid => APPROVALS.find(a => a.reqRef === tid).id, tid);
  await go(A, '/approval/' + apid); await act(A, `[data-act="ap-decide"][data-id="${apid}"][data-v="approved"]`);
  ok(q(`select data->>'op' || '/' || (data->>'legal') from control_center.travels where id='${tid}'`) === 'active/verified', 'admin approval activates travel');

  // 4) Travel membuat paket -> moderasi admin -> published
  await wait(B, tid => (TRAVELS.find(t => t.id === tid) || {}).op === 'active', tid); ok(true, 'travel portal sees activation (realtime)');
  await go(B, '/p/travel/packages'); await act(B, '[data-act="tp-new"]'); await fill(B, { 'tp-name': 'Umrah Hemat E2E', 'tp-price': 30000000, 'tp-seats': 40 }); await act(B, '[data-act="tp-save"]');
  const pid = await B.evaluate(() => PACKAGES[0].id); await act(B, `[data-act="tp-set"][data-id="${pid}"][data-v="review"]`);
  await wait(A, pid => (PACKAGES.find(p => p.id === pid) || {}).state === 'review', pid);
  await go(A, '/marketplace/moderation'); await act(A, `[data-act="res-act"][data-id="${pid}"][data-a="Publish"]`);
  ok(q(`select data->>'state' from control_center.packages where id='${pid}'`) === 'published', 'package published after moderation: ' + pid);

  // 5) Affiliate mendaftar (layar C)
  const C = await mk(V6, '/p/affiliate'); await fill(C, { 'ob-name': 'Komunitas Hijrah' }); await act(C, '[data-act="ob-save"][data-ws="affiliate"]');
  const aff = await C.evaluate(() => ({ id: AFFILIATES[0].id, code: AFFILIATES[0].code })); ok(!!aff.code, 'affiliate registered with code ' + aff.code);

  // 6) Pengguna mendaftar, booking dengan kode referral, lalu bayar (layar D, mobile)
  const Dp = await mk(V6, '/p/traveler', 390); await fill(Dp, { 'ob-name': 'Siti Aminah', 'ob-phone': '0813000222' }); await act(Dp, '[data-act="ob-save"][data-ws="traveler"]');
  await wait(Dp, pid => PACKAGES.some(p => p.id === pid && p.state === 'published') && AFFILIATES.length > 0, pid);
  await go(Dp, '/p/traveler/pkg/' + pid); await fill(Dp, { 'u-pax': 2, 'u-ref': aff.code }); await act(Dp, `[data-act="u-book"][data-id="${pid}"]`);
  const bk = JSON.parse(q(`select data from control_center.bookings where data->>'pkg'='${pid}'`) || 'null');
  ok(bk && bk.total === 60000000 && bk.aff === aff.id && bk.source === 'Affiliate', 'booking with referral: ' + (bk && bk.id));
  ok(+q(`select (data->>'amount')::bigint from control_center.payments where data->>'booking'='${bk.id}'`) === 18000000, 'DP 30% invoice');
  ok(+q(`select (data->>'amount')::bigint from control_center.records where collection='commissions' and data->>'booking'='${bk.id}' and data->>'state'='pending'`) === 1500000, 'pending affiliate commission 2.5%');
  await go(Dp, '/p/traveler/bookings/' + bk.id); await act(Dp, `[data-act="u-pay"][data-id="${bk.id}"]`);
  ok(+q(`select count(*) from control_center.payments where data->>'booking'='${bk.id}' and data->>'status'='paid'`) === 1, 'payment marked paid');

  // 7) Angka di admin dihitung dari transaksi nyata
  await wait(A, bid => BOOKINGS.some(b => b.id === bid && b.paid > 0), bk.id);
  const nums = await A.evaluate(tid => { recompute(); const tr = travelById(tid); const a = AFFILIATES[0]; return { gmv30: tr.gmv30, book30: tr.book30, seriesGmv: SERIES.reduce((s, d) => s + d.gmv, 0), affConv: a.conv, affComm: a.commission, bal: tr.balance, pay: tr.payMode }; }, tid);
  ok(nums.gmv30 === 18000000 && nums.seriesGmv === 18000000, 'GMV derived from real payment: ' + JSON.stringify(nums));
  ok(nums.book30 === 1 && nums.affConv === 1 && nums.affComm === 1500000, 'bookings & affiliate stats derived');
  ok(nums.pay !== 'VIA_SEGALOKA' || nums.bal > 0, 'travel balance derived from paid payments');

  // 8) Vendor: daftar -> verifikasi -> produk -> dipesan Travel -> selesai -> saldo vendor
  const E = await mk(V6, '/p/vendor'); await fill(E, { 'ob-name': 'Hotel Makkah Sejahtera' }); await act(E, '[data-act="ob-save"][data-ws="vendor"]');
  const vid = await E.evaluate(() => VENDORS[0].id);
  await go(E, '/p/vendor/documents'); const docs = await E.evaluate(() => [...document.querySelectorAll('[data-act="vd-up"]')].map(e => e.dataset.n)); for (const n of docs) { const [fc] = await Promise.all([E.waitForEvent('filechooser'), E.evaluate(n => [...document.querySelectorAll('[data-act="vd-up"]')].find(e => e.dataset.n === n).click(), n)]); await fc.setFiles('/tmp/claude-0/doc.pdf'); await E.waitForTimeout(300); }
  await act(E, '[data-act="vd-submit"]');
  await wait(A, vid => APPROVALS.some(a => a.type === 'vendor_verif' && a.reqRef === vid), vid);
  const vap = await A.evaluate(vid => APPROVALS.find(a => a.type === 'vendor_verif' && a.reqRef === vid).id, vid);
  await go(A, '/approval/' + vap); await act(A, `[data-act="ap-decide"][data-id="${vap}"][data-v="approved"]`);
  ok(q(`select data->>'verif' from control_center.vendors where id='${vid}'`) === 'verified', 'vendor verified by admin');
  await wait(E, vid => (VENDORS.find(v => v.id === vid) || {}).verif === 'verified', vid);
  await go(E, '/p/vendor/products'); await act(E, '[data-act="vp-new"]'); await fill(E, { 'vp-name': 'Kamar Quad 1 malam', 'vp-price': 1500000, 'vp-allot': 100 }); await act(E, '[data-act="vp-save"]');
  const vpid = await E.evaluate(() => VPRODUCTS[0].id); await act(E, `[data-act="vp-set"][data-id="${vpid}"][data-v="review"]`);
  await wait(A, vpid => (VPRODUCTS.find(p => p.id === vpid) || {}).state === 'review', vpid);
  await go(A, '/marketplace/moderation'); const modSel = `[data-act="res-act"][data-id="${vpid}"][data-a="Publish"]`; ok(!!(await A.$(modSel)), 'vendor product in moderation queue'); await act(A, modSel);
  ok(q(`select data->>'state' from control_center.records where collection='vendor_products' and id='${vpid}'`) === 'published', 'vendor product published');
  await wait(B, vpid => VPRODUCTS.some(p => p.id === vpid && p.state === 'published'), vpid);
  await go(B, '/p/travel/vendors'); await act(B, `[data-act="to-new"][data-id="${vpid}"]`); await fill(B, { 'to-qty': 4 }); await act(B, `[data-act="to-save"][data-id="${vpid}"]`);
  const po = JSON.parse(q(`select data from control_center.records where collection='vendor_orders' limit 1`) || 'null');
  ok(po && po.value === 6000000 && po.state === 'pending' && po.travel === tid, 'travel ordered vendor service: ' + (po && po.id));
  await wait(E, poid => VORDERS.some(o => o.id === poid), po.id); await go(E, '/p/vendor/orders');
  await act(E, `[data-act="vo-set"][data-id="${po.id}"][data-v="confirmed"]`); await act(E, `[data-act="vo-set"][data-id="${po.id}"][data-v="completed"]`);
  ok(q(`select data->>'state' from control_center.records where collection='vendor_orders' and id='${po.id}'`) === 'completed', 'vendor completed order');
  await wait(A, poid => VORDERS.some(o => o.id === poid && o.state === 'completed'), po.id);
  const vb = await A.evaluate(vid => { recompute(); return VENDORS.find(v => v.id === vid).balance; }, vid);
  ok(vb === 5700000, 'vendor balance derived (order − 5% fee): ' + vb);

  // 9) SegaDeals end-to-end
  await go(Dp, '/p/traveler/segadeals/new'); await Dp.selectOption('#sd-type', 'Umrah'); await fill(Dp, { 'sd-dest': 'Umrah Ramadhan E2E', 'sd-month': '2027-03', 'sd-pax': 2, 'sd-budget': 40000000 }); await act(Dp, '[data-act="sd-submit"]');
  const rid = await Dp.evaluate(() => SD_REQ[0].id);
  await go(B, '/p/travel/segadeals'); await wait(B, rid => !!document.querySelector(`[data-act="sd-offer"][data-id="${rid}"]`) || (rerender(), false), rid, 30000);
  await B.click(`[data-act="sd-offer"][data-id="${rid}"]`); await fill(B, { 'so-price': 29500000 }); await act(B, '[data-act="sd-offer-go"]');
  const oid = await B.evaluate(() => SD_OFF[0].id);
  await go(Dp, '/p/traveler/segadeals/' + rid); await wait(Dp, oid => !!document.querySelector(`[data-act="sd-accept"][data-id="${oid}"]`) || (rerender(), false), oid, 30000);
  await act(Dp, `[data-act="sd-accept"][data-id="${oid}"]`);
  ok(q(`select data->>'state' from control_center.records where collection='sd_requests' and id='${rid}'`) === 'accepted', 'SegaDeals request accepted -> booking');

  // 10) audit & kebersihan
  ok(+q("select count(*) from control_center.audit_log where not is_demo") >= 15, 'all actions audited (' + q("select count(*) from control_center.audit_log where not is_demo") + ')');
  ok(+q("select count(*) from control_center.travels where is_demo")+ +q("select count(*) from control_center.records where is_demo and collection in ('vendor_orders','commissions','sd_requests')") === 0, 'no new rows flagged demo');
  const real = errs.filter(e => !/ERR_TUNNEL|Failed to load resource/.test(e));
  ok(real.length === 0, 'no JS errors' + (real.length ? ': ' + real.slice(0, 5).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED', '·', Math.round((Date.now() - t0) / 1000) + 's');
  await b.close();
})().catch(e => { console.error('CRASH', e); process.exit(2); });
