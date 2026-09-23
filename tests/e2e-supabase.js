const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
const PG=['-h','/tmp/pgd','-p','55432','-U','postgres','-d','postgres'];
const run = q => { const sel = /^\s*select/i.test(q) && !/;\s*\S/.test(q.trim().replace(/;\s*$/,'')); const sqlq = sel ? `select coalesce(json_agg(_sgq),'[]'::json) from (${q}) _sgq` : q; try { const out = execFileSync('psql',[...PG,'-At','-v','ON_ERROR_STOP=1','-q'],{input:sqlq,maxBuffer:1e8,stdio:['pipe','pipe','pipe']}).toString().trim(); const tag='untrusted-data-abc'; return {ok:true,payload:{result:`Below <${tag}> x.\n\n<${tag}>\n${sel?out:'[]'}\n</${tag}>\n\nUse`}}; } catch(e) { return {ok:false,message:(e.stderr||'').toString()}; } };
const q = s => execFileSync('psql',[...PG,'-At','-c',s]).toString().trim();
// V5_HTML: build lama (untuk menguji migrasi). V6: build saat ini.
const path=require('path'); const V5=process.env.V5_HTML||path.join(__dirname,'v5.html'), V6=path.join(__dirname,'..','segaloka-control-center.html');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c) process.exitCode=1;};
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async(file,hash)=>{const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.exposeBinding('pgq',(src,x)=>run(x));await ctx.addInitScript(()=>{const mcp={callTool:async(s,t,i)=>{const r=await window.pgq(i.query);if(!r.ok)throw{code:'tool_error',message:r.message};return{content:[],payload:r.payload};}};window.claude={use:async n=>n==='mcp'?mcp:null};});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+file+'#'+hash);await p.waitForFunction(()=>SB.on===true,null,{timeout:120000});return p;};
q('drop schema if exists control_center cascade');
// 1. old v5 seeds the DB (state of the real project today)
let P=await mk(V5,'/overview'); await P.waitForTimeout(1500); await P.context().close();
ok(+q("select count(*) from control_center.campaigns where data->>'channels' like '%Meta Ads%' or data->>'channels' like '%TikTok%'")>0,'v5 DB has external channels (precondition)');
// 2. v6 opens -> migration + SegaDeals seed
const A=await mk(V6,'/overview'); await A.waitForTimeout(2500);
ok(+q("select count(*) from control_center.campaigns where data->>'channels' ~ '(Meta|Google|TikTok) Ads|WhatsApp Click|\"Email\"|Marketplace Placement'")===0,'campaign channels migrated to Segaloka inventory');
ok(+q("select count(*) from control_center.records where collection='adsets' and data->>'channel' !~ '^(Web|App) · '")===0,'adsets migrated');
ok(q("select string_agg(data->>'name',',' order by id) from control_center.records where collection='placements'").split(',').every(x=>/^(Web|App) · /.test(x)),'placements are web/app only');
ok(+q("select count(*) from control_center.records where collection='trackers' and data::text ~ 'Meta|Google|TikTok'")===0,'no external trackers');
ok(+q("select count(*) from control_center.records where collection='integrations' and data->>'name' ~ 'Google Ads|TikTok|Meta \\('")===0,'no external ad integrations');
ok(+q("select count(*) from control_center.records where data::text ~ 'Click-to-Chat|Meta Ads|Google Ads|TikTok'")===0,'no external ad references in any record');
ok(+q("select count(*) from control_center.records where collection='sd_requests' and is_demo")===12,'SegaDeals requests seeded (is_demo)');
ok(+q("select count(*) from control_center.records where collection='sd_offers'")>0,'SegaDeals offers seeded');
// idempotent: second open changes nothing
const before=q("select max(updated_at) from control_center.records");
const B=await mk(V6,'/marketplace/segadeals'); await B.waitForTimeout(2500);
ok(q("select max(updated_at) from control_center.records")===before,'migration idempotent on second open');
// 3. Traveler submits a SegaDeals request through the UI
await A.evaluate(()=>{PENT.traveler=TRAVELERS[5].id;location.hash='/p/traveler/segadeals/new'}); await A.waitForTimeout(200);
await A.selectOption('#sd-type','Umrah'); await A.fill('#sd-dest','Umrah Plus Turki E2E'); await A.fill('#sd-month','2027-02'); await A.fill('#sd-pax','3'); await A.fill('#sd-budget','35000000'); await A.fill('#sd-notes','Uji E2E');
await A.click('[data-act="sd-submit"]'); await A.waitForTimeout(1800);
const rid=await A.evaluate(()=>SD_REQ[0].id); console.log(await A.evaluate(()=>JSON.stringify({st:SB.state,err:SB.err&&String(SB.err.stack||SB.err.message).slice(0,900),hash:location.hash,n:SD_REQ.length,first:SD_REQ[0]})));
ok(q(`select data->>'state' from control_center.records where collection='sd_requests' and id='${rid}'`)==='open','request persisted as open: '+rid);
// 4. Travel (screen B) sees it in realtime and sends an offer via UI
const tid=await B.evaluate(()=>{const tr=TRAVELS.find(t=>t.op==='active'&&licOk(t,'Umrah')&&sdBasePkgs(t,'Umrah').length);PENT.travel=tr.id;location.hash='/p/travel/segadeals';return tr.id;});
await B.waitForTimeout(15000); console.log(await B.evaluate(rid=>JSON.stringify({st:SB.state,err:SB.err&&String(SB.err.message||SB.err).slice(0,200),has:SD_REQ.some(r=>r.id===rid),hidden:document.hidden,hash:location.hash,btn:[...document.querySelectorAll('[data-id]')].filter(x=>x.dataset.id===rid).map(x=>x.outerHTML.slice(0,200))}),rid));await B.waitForFunction(rid=>!!document.querySelector(`[data-act="sd-offer"][data-id="${rid}"]`),rid,{timeout:20000}); ok(true,'request appeared on Travel portal (realtime)');
await B.click(`[data-act="sd-offer"][data-id="${rid}"]`); await B.fill('#so-price','34500000'); await B.fill('#so-note','Termasuk city tour Istanbul'); await B.click('[data-act="sd-offer-go"]'); await B.waitForTimeout(1800);
const oid=await B.evaluate(()=>SD_OFF[0].id);
ok(q(`select data->>'state' from control_center.records where collection='sd_requests' and id='${rid}'`)==='offered','request -> offered');
// unlicensed travel cannot bid
const blocked=await B.evaluate(rid=>{const tr=TRAVELS.find(t=>t.op==='active'&&!licOk(t,'Umrah'));if(!tr)return 'none';PENT.travel=tr.id;rerender();const el=document.querySelector(`#work tr button[aria-disabled="true"]`);return !!el&&!document.querySelector(`[data-act="sd-offer"][data-id="${rid}"]`);},rid);
ok(blocked===true||blocked==='none','unlicensed Travel cannot send offer');
// 5. Traveler sees offer and accepts -> booking
await A.evaluate(rid=>{location.hash='/p/traveler/segadeals/'+rid},rid);
await A.waitForFunction(oid=>!!document.querySelector(`[data-act="sd-accept"][data-id="${oid}"]`),oid,{timeout:20000}); ok(true,'offer appeared in traveler app (realtime)');
await A.click(`[data-act="sd-accept"][data-id="${oid}"]`); await A.click('[data-act="confirm-ok"]'); await A.waitForTimeout(2000);
const bk=JSON.parse(q(`select data from control_center.bookings where data->>'sdRequest'='${rid}'`)||'null');
ok(bk&&bk.source==='SegaDeals'&&bk.total===34500000*3&&bk.travel===tid,'booking created from offer: '+(bk&&bk.id)+' total '+(bk&&bk.total));
ok(+q(`select (data->>'amount')::bigint from control_center.payments where data->>'booking'='${bk.id}'`)===Math.round(34500000*3*.3/1000)*1000,'DP 30% invoice created');
ok(q(`select data->>'state' from control_center.records where collection='sd_offers' and id='${oid}'`)==='accepted','offer accepted');
ok(q(`select data->>'state' from control_center.records where collection='sd_requests' and id='${rid}'`)==='accepted','request accepted');
ok(+q(`select count(*) from control_center.audit_log where resource like '%${oid}%'`)>=2,'audited');
// 6. Admin sees it
await B.evaluate(()=>{location.hash='/marketplace/segadeals'}); await B.waitForTimeout(8000); await B.evaluate(()=>rerender());
ok(await B.evaluate(rid=>document.getElementById('work').innerText.includes('Umrah Plus Turki E2E')||TBL.sdreq.rows().some(r=>r.id===rid&&r.state==='accepted'),rid),'admin sees accepted request');
// 7. Ads wizard only offers Segaloka inventory; creating a campaign persists internal channels
await A.evaluate(()=>{location.hash='/ads';}); await A.waitForTimeout(200); await A.click('[data-act="wizard"]'); for(let i=0;i<3;i++){await A.click('.modal [data-act="wz-go"].primary, [data-act="wz-go"].btn.primary');}
const opts=await A.evaluate(()=>[...document.querySelectorAll('[data-act="wz-toggle"][data-f="placement"]')].map(x=>x.dataset.v));
ok(opts.length===8&&opts.every(x=>/^(Web|App) · /.test(x)),'wizard placement = 8 Segaloka slots');
const land=await A.evaluate(()=>[...document.querySelectorAll('#wz-land option')].map(o=>o.textContent).join(' | ')); ok(!/WhatsApp|Website Travel/.test(land),'landing internal only: '+land);
await A.click('[data-act="wz-toggle"][data-v="App · Banner Beranda"]'); for(let i=0;i<3;i++){await A.click('[data-act="wz-go"].btn.primary');} await A.click('[data-act="wz-submit"]'); await A.waitForTimeout(1800);
const ch=q("select data->>'channels' from control_center.campaigns order by updated_at desc limit 1"); ok(/App · Banner Beranda/.test(ch)&&!/Meta|Google|TikTok/.test(ch),'new campaign channels: '+ch);
console.log('page errors:',errs.length? errs:'none'); await b.close();})();
