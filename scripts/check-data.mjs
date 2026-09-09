import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
const h=read('holdings'),o=read('options'),p=read('portfolio'),s=read('structured_contracts'),b=read('bond_details'),pe=read('private_equity'),funds=read('fund-map'),map=read('underlying-map'),baskets=read('debt-baskets');
const cents=n=>Math.round(n*100),sum=a=>a.reduce((n,v)=>n+v,0),ids=new Set(h.holdings.map(x=>x.id));
for(const data of [h,o,s,b,pe])assert.equal(data.statement_date,'2026-09-07');
assert.equal(p.summary.date,'2026-09-07');assert.equal(p.summary.net,8209050.84);assert.equal(p.summary.performanceEnd,p.summary.net);
assert.equal(h.holdings.length,298);assert.equal(ids.size,298);assert.equal(h.section_reconciliation.length,16);
for(const section of h.section_reconciliation){const rows=h.holdings.filter(x=>x.section===section.section);assert.equal(rows.length,section.rows);assert.equal(cents(sum(rows.map(x=>x.value_usd??0))),cents(section.statement_total_usd));assert.equal(cents(sum(rows.map(x=>x.accrued_interest_usd))),cents(section.accrued_interest_usd));assert.equal(cents(section.difference_usd),0);}
assert.equal(cents(sum(h.holdings.map(x=>(x.value_usd??0)+x.accrued_interest_usd))),cents(p.summary.net));assert.equal(h.holdings.filter(x=>x.value_usd===null).length,1);
assert.equal(cents(sum(p.allocation.map(x=>x.value))),cents(p.summary.net));assert.equal(cents(sum(p.currencies.map(x=>x.value))),cents(p.summary.net));assert.equal(cents(p.summary.start+p.summary.deposits+p.summary.withdrawals+p.summary.investmentChange),cents(p.summary.performanceEnd));
assert.equal(o.options.length,106);assert.equal(o.options.filter(x=>x.type==='Put').length,96);assert.equal(o.options.filter(x=>x.type==='Call').length,10);assert.equal(o.options.filter(x=>x.signed_contracts>0).length,1);assert.equal(cents(sum(o.options.map(x=>x.statement_mark_usd))),cents(o.checks.source_options_subtotal_usd));
assert.deepEqual(o.options.map(x=>x.id).sort(),h.holdings.filter(x=>x.section==='Options (Derivatives)').map(x=>x.id).sort());
assert.equal(s.contracts.length,4);assert.equal(cents(sum(s.contracts.map(x=>x.statement_mark_usd))),cents(s.checks.source_subtotal_usd));assert.ok(s.contracts.every(x=>x.leverage===2&&x.remaining_obligation===null));
assert.equal(b.holdings.length,1);assert.equal(b.holdings[0].total_value_usd,291749.47);assert.equal(pe.holdings.length,3);
assert.equal(funds.funds.length,32);assert.ok(funds.funds.every(f=>f.holdings_ids.every(id=>ids.has(id))));assert.equal(map.positions.length,268);assert.ok(map.positions.every(x=>ids.has(x.id)));
for(const basket of baskets){assert.equal(sum(basket.sales.map(x=>x.illustrative_sale_target_usd)),basket.sale_target_usd);assert.equal(basket.sale_target_usd+basket.cash_use_usd,2000000);assert.ok(basket.sales.every(x=>x.illustrative_sale_target_usd<=h.holdings.find(y=>y.id===x.id).value_usd));}
const publicText=['app/page.tsx','app/options.tsx','app/bonds.tsx','app/activity.tsx','app/risk.tsx','app/reduce-risk.tsx','app/reduce-borrowing.tsx','app/layout.tsx'].map(f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8')).join('\n');
assert.ok(!/23 August 2026|23 Aug 2026|111\.39%|57\.81%|five leveraged contracts|four accumulators/.test(publicText));
assert.ok(!/GFS0000121FI00|720830173|vipinshah|Lower Kabete|Vipinchandra/i.test(publicText+JSON.stringify(h)+JSON.stringify(o)));
console.log('PASS: 7 September snapshot, 298 holdings, 16 section reconciliations, 106 options, four 2x contracts, current exposure map and $2m funding baskets.');
