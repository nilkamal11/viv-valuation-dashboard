import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {optionTerms,expirationScenario,parseScenarioPrice} from '../lib/options.ts';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
const h=read('holdings'),o=read('options'),p=read('portfolio'),s=read('structured_contracts'),i=read('interest'),b=read('bond_details'),pe=read('private_equity');
const {summary,allocation,currencies,components}=p;
const cents=n=>Math.round(n*100),sum=a=>a.reduce((n,v)=>n+v,0);
for(const data of [h,o,s,i,b,pe])assert.equal(data.statement_date,'2026-08-23');
assert.equal(summary.date,'2026-08-23');assert.equal(summary.net,8303406.26);
assert.equal(h.holdings.length,336);assert.equal(new Set(h.holdings.map(x=>x.id)).size,336);
assert.equal(h.section_reconciliation.length,16);
for(const section of h.section_reconciliation){const rows=h.holdings.filter(x=>x.section===section.section);assert.equal(rows.length,section.rows);assert.equal(sum(rows.map(x=>cents(x.value_usd??0))),cents(section.statement_total_usd));assert.equal(sum(rows.map(x=>cents(x.accrued_interest_usd))),cents(section.accrued_interest_usd));}
assert.equal(sum(h.holdings.map(x=>cents(x.value_usd??0)+cents(x.accrued_interest_usd))),cents(summary.net));
assert.equal(h.holdings.filter(x=>x.value_usd===null).length,1);
assert.equal(h.holdings.find(x=>x.value_usd===null).total_value_usd,null);
assert.equal(sum(allocation.map(x=>cents(x.value))),cents(summary.net));
assert.equal(sum(currencies.map(x=>cents(x.value))),cents(summary.net));
assert.equal(cents(summary.start)+cents(summary.deposits)+cents(summary.withdrawals)+cents(summary.investmentChange),cents(summary.performanceEnd));
assert.equal(sum(components.map(x=>cents(x.value))),cents(summary.investmentChange));
assert.equal(cents(summary.performanceEnd)-cents(summary.net),771106);
assert.equal(p.months.length,8);assert.equal(p.months[4].end,8300391.2);assert.equal(p.months[6].pct,-3.48);assert.equal(p.months[7].pct,9.18);
assert.equal(o.options.length,147);assert.equal(o.options.filter(x=>x.type==='Put').length,135);
assert.equal(sum(o.options.map(x=>cents(x.statement_mark_usd))),-40963579);
assert.deepEqual(o.options.map(x=>x.id).sort(),h.holdings.filter(x=>x.section==='Options (Derivatives)').map(x=>x.id).sort());
for(const option of o.options){const source=h.holdings.find(x=>x.id===option.id);assert.equal(option.signed_contracts,source.quantity);assert.equal(option.statement_mark_usd,source.value_usd);assert.equal(option.expiration,source.maturity_date);assert.ok(option.signed_contracts<0);assert.equal(cents(option.signed_contracts*option.quoted_option_price*option.strike_multiplier*option.usd_per_currency),cents(option.statement_mark_usd));const terms=optionTerms(option);assert.equal(expirationScenario(option,terms.threshold).signedValue,0);const low=expirationScenario(option,terms.threshold*.8),high=expirationScenario(option,terms.threshold*1.2);assert.ok(option.type==='Put'?low.signedValue<0&&high.signedValue===0:high.signedValue<0&&low.signedValue===0);}
const fubo=o.options.find(x=>x.underlying==='FUBO1');assert.equal(fubo.signed_contracts,-2);assert.equal(fubo.shares_per_contract,8);assert.equal(fubo.strike_multiplier,100);assert.equal(fubo.cash_per_contract,4.4);assert.equal(optionTerms(fubo).deliverableCash,8.8);assert.equal(expirationScenario(fubo,0).intrinsic,optionTerms(fubo).grossStrikeCash-8.8);
assert.equal(parseScenarioPrice(''),null);assert.equal(parseScenarioPrice('-1'),null);assert.equal(parseScenarioPrice('0'),0);assert.equal(parseScenarioPrice('Infinity'),null);
assert.equal(i.rows.length,144);assert.equal(sum(i.rows.map(r=>cents(r.statement_amount_usd))),25327589);assert.equal(i.rows.filter(r=>r.isin===b.holdings[0].isin).length,4);assert.equal(b.holdings[0].current_price_pct,106.47);assert.equal(b.holdings[0].total_value_usd,294370.87);
assert.equal(s.contracts.length,5);assert.equal(sum(s.contracts.map(x=>cents(x.statement_mark_usd))),-2813733);for(const c of s.contracts){assert.equal(c.leverage,2);assert.equal(c.remaining_obligation,null);assert.equal(h.holdings.find(x=>x.id===c.id).value_usd,c.statement_mark_usd);}
assert.equal(p.coverage.transaction_history_included,false);assert.ok(!fs.existsSync(new URL('../data/activity.json',import.meta.url)));
// Run the actual shared risk functions with the source JSON injected, avoiding bundler-only aliases in Node.
const riskSource=fs.readFileSync(new URL('../lib/risk.ts',import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'');
const bindings=`const holdingsData=${JSON.stringify(h)},optionsData=${JSON.stringify(o)},structuredData=${JSON.stringify(s)},portfolio=${JSON.stringify(p)};const optionTerms=${optionTerms.toString()};`;
const js=ts.transpileModule(bindings+riskSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const risk=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.equal(risk.loans.length,8);assert.equal(risk.loans.filter(x=>x.currency==='GBP').length,2);
assert.equal(cents(risk.metrics.advances),480039312);assert.equal(cents(risk.metrics.netCash),129679791);assert.equal(cents(risk.metrics.overdraftPrincipal),15823923);
assert.equal(risk.laterOptions.length,113);assert.equal(risk.reachedOptions.length,34);assert.equal(risk.laterPuts.length,104);assert.equal(risk.laterCalls.filter(x=>x.coverage_remark).length,9);
assert.equal(cents(risk.metrics.futurePutCash),352013115);assert.equal(cents(risk.metrics.reachedPutCash),92130810);
assert.equal(cents(risk.equityStress(20).loss),184988306);assert.equal(risk.equityStress(0).remaining,summary.net);assert.equal(cents(risk.repaymentIllustration(1000000).remainingAdvances),380039312);
assert.equal(risk.repaymentIllustration(-1).repayment,0);assert.equal(risk.repaymentIllustration(1e9).remainingAdvances,0);
const publicText=['app/page.tsx','app/options.tsx','app/bonds.tsx','app/activity.tsx','app/risk.tsx','app/reduce-risk.tsx','app/layout.tsx'].map(f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8')).join('\n');
assert.ok(!/30 July 2026|30 Jul 2026|110 positions|302<|279299\.95|121\.11%/.test(publicText));
for(const marker of ['value="risk"','value="reduce-risk"','hashchange'])assert.ok(publicText.includes(marker));
console.log('PASS: replacement snapshot, 16 section totals, income, option pricing/expiry groups, adjusted FUBO delivery, risk formulas and stale-data checks.');
