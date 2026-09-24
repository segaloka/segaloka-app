// Crawl every route and click every data-act control; report page errors.
const { chromium } = require('playwright');
const FILE = 'file://' + (process.env.HTML || require('path').join(__dirname, '..', 'segaloka-control-center.html'));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +(process.env.W || 1440), height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const p = await ctx.newPage(); const errs = []; let cur = '';
  p.on('pageerror', e => errs.push(cur + ' :: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(cur + ' :: console ' + m.text()); });
  p.on('dialog', d => d.dismiss());
  await p.goto(FILE + (process.env.Q || '') + '#/overview'); await p.waitForTimeout(500); if (process.env.LANGX) await p.evaluate(l => { S.lang = l; applyLang(); renderShell(); render(); }, process.env.LANGX);
  const routes = await p.evaluate(() => {
    const out = new Set(Object.values(NAVIDX).filter(n => n.r).map(n => n.r));
    const sample = { id: null };
    ROUTES.forEach(rt => { if (!rt.keys.length) out.add(rt.pattern); });
    const f0 = (a, m) => a[0] ? [m(a[0])] : [];
    const g = f => { try { return f(); } catch (e) { return []; } }; const T = ['overview','branches','packages','bookings','finance','legal','subscription','mitra','marketplace','website','audit'];
    const ids = { '/travel/:id/:tab': g(() => T.map(t => '/travel/' + TRAVELS[0].id + '/' + t)), '/approval/:id': g(() => ['/approval/' + APPROVALS[0].id]), '/booking/:id': g(() => ['/booking/' + BOOKINGS[0].id]), '/finance/payment/:id': g(() => ['/finance/payment/' + PAYMENTS[0].id]),
      '/ads/campaign/:id/:tab': g(() => ['performance','audience','creative','placement','attribution','activity'].map(t => '/ads/campaign/' + CAMPAIGNS[0].id + '/' + t)),
      '/omni/inbox/:id': g(() => ['/omni/inbox/' + CONVERSATIONS[0].id]), '/p/traveler/pkg/:id': g(() => ['/p/traveler/pkg/' + PACKAGES.find(x => x.state === 'published').id]),
      '/p/traveler/bookings/:id': [], '/travel/:id': g(() => ['/travel/' + TRAVELS[0].id]), '/ads/campaign/:id': g(() => ['/ads/campaign/' + CAMPAIGNS[0].id]), '/vendor/:id': g(() => ['/vendor/' + VENDORS[0].id]), '/vendor/:id/:tab': g(() => ['overview','products','orders','finance','documents','audit'].map(t => '/vendor/' + VENDORS[0].id + '/' + t)), '/p/travel/bookings/:id': [], '/p/traveler/segadeals/:id': [] };
    ROUTES.forEach(rt => { if (rt.keys.length && ids[rt.pattern]) ids[rt.pattern].forEach(x => out.add(x)); });
    return [...out];
  });
  const unknown = routes.filter(r => r.startsWith('?')); const list = routes.filter(r => !r.startsWith('?'));
  // dynamic param routes for portals
  const dyn = await p.evaluate(() => { try { const u = me('traveler'); const tb = BOOKINGS.find(b => b.traveler === u.id) || BOOKINGS[0]; const tr = me('travel'); const bk = BOOKINGS.find(b => b.travel === tr.id); const r = SD_REQ.find(x => x.traveler === u.id); return ['/p/traveler/bookings/' + tb.id, bk ? '/p/travel/bookings/' + bk.id : '/p/travel/bookings', r ? '/p/traveler/segadeals/' + r.id : '/p/traveler/segadeals']; } catch (e) { return []; } });
  list.push(...dyn);
  console.log('routes', list.length, 'param patterns w/o sample:', unknown.join(' '));
  let clicks = 0; const bad = [];
  for (const r of list) {
    cur = r;
    await p.evaluate(r => { closeOverlays(); location.hash = r; }, r); await p.waitForTimeout(40);
    const txt = await p.evaluate(() => document.getElementById('work').innerText);
    if (/\bundefined\b|\bNaN\b|\[object Object\]/.test(txt)) bad.push(r + ' :: text contains ' + (txt.match(/.{0,40}(undefined|NaN|\[object Object\]).{0,20}/) || [''])[0]);
    if (txt.length < 40) bad.push(r + ' :: near-empty page');
    const ov = await p.evaluate(() => { const w = innerWidth; const o = [...document.querySelectorAll('#work *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > w + 2) && !e.closest('.tbl-wrap,.tabs,.life,.cmd-scopes,.wiz-steps,[style*="overflow"]'); }).slice(0, 2).map(e => e.tagName + '.' + (e.className || '').toString().slice(0, 30)); return { sw: document.documentElement.scrollWidth, w, o }; });
    if (ov.sw > ov.w + 2 || ov.o.length) bad.push(r + ' :: overflow ' + JSON.stringify(ov));
    const n = await p.evaluate(() => [...document.querySelectorAll('#work [data-act], #top [data-act]')].length);
    for (let i = 0; i < Math.min(n, +(process.env.MAXC || 60)); i++) {
      await p.evaluate(r => { closeOverlays(); if (location.hash.slice(1) !== r) location.hash = r; else rerender(); }, r); await p.waitForTimeout(15);
      const res = await p.evaluate(i => { const el = [...document.querySelectorAll('#work [data-act], #top [data-act]')][i]; if (!el) return null; const act = el.dataset.act; if (['signout', 'sync-retry'].includes(act) || el.getAttribute('aria-disabled') === 'true' || el.disabled) return 'skip:' + act; if (el.tagName === 'SELECT' || el.dataset.actChange) return 'skip:' + act; el.click(); return act; }, i);
      if (!res || String(res).startsWith('skip')) continue; clicks++;
      await p.waitForTimeout(15);
      // complete any dialog: fill inputs and press the primary button
      await p.evaluate(() => { for (let k = 0; k < 3; k++) { const ov = document.getElementById('ovl'); if (!ov || !ov.innerHTML) return; ov.querySelectorAll('input:not([type=checkbox]):not([type=file]),textarea').forEach(x => { if (!x.value) x.value = x.type === 'number' ? (x.min && +x.min > 10 ? x.min : '5') : x.type === 'date' ? '2026-12-01' : x.type === 'month' ? '2027-01' : x.type === 'email' ? 'uji@segaloka.id' : 'uji otomatis'; }); const btn = ov.querySelector('[data-act="confirm-ok"]') || [...ov.querySelectorAll('.modal-f .btn.primary, .drawer-f .btn.primary, .foot .btn.primary, button.btn.primary')].filter(b => !b.disabled && b.getAttribute('aria-disabled') !== 'true').pop(); if (!btn) return; const before = ov.innerHTML; btn.click(); if (ov.innerHTML === before) return; } });
      await p.waitForTimeout(10);
    }
  }
  console.log('clicks', clicks);
  console.log('ERRORS', errs.length); [...new Set(errs)].slice(0, 60).forEach(e => console.log('  ' + e));
  console.log('TEXT ISSUES', bad.length); bad.slice(0, 40).forEach(e => console.log('  ' + e));
  await b.close();
})();
