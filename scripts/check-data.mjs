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
const mappingData=read('underlying-map'),fundData=read('fund-map'),returns=read('return-analysis');
assert.equal(mappingData.statement_date,summary.date);assert.equal(fundData.statement_date,summary.date);assert.equal(returns.statement_date,summary.date);
assert.equal(mappingData.positions.length,299);assert.equal(mappingData.excluded_positions.length,37);assert.equal(new Set([...mappingData.positions,...mappingData.excluded_positions].map(p=>p.id)).size,336);
for(const p of mappingData.positions){assert.ok(h.holdings.some(x=>x.id===p.id));for(const k of p.underlying_keys)assert.ok(mappingData.entities.some(e=>e.key===k));}
assert.equal(fundData.funds.length,32);assert.equal(new Set(fundData.funds.flatMap(f=>f.holdings_ids)).size,32);
for(const f of fundData.funds){for(const id of f.holdings_ids)assert.ok(mappingData.positions.find(p=>p.id===id).underlying_keys.includes(f.key));for(const c of f.named_constituents){assert.ok(c.as_of<=summary.date);assert.ok(c.exposure_basis);assert.ok(mappingData.entities.some(e=>e.key===c.underlying_key));}}
const exposureSource=fs.readFileSync(new URL('../lib/exposure.ts',import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'');
const exposureBindings=`const underlyingData=${JSON.stringify(mappingData)},fundData=${JSON.stringify(fundData)},holdings=${JSON.stringify(h.holdings)},options=${JSON.stringify(o.options)},snapshot=${JSON.stringify(summary.date)},nav=${summary.net};const optionTerms=${optionTerms.toString()};`;
const exposureJs=ts.transpileModule(exposureBindings+exposureSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const exposure=await import('data:text/javascript;base64,'+Buffer.from(exposureJs).toString('base64'));
assert.equal(exposure.opaqueNotes.length,2);assert.equal(cents(sum(exposure.opaqueNotes.map(p=>exposure.fullValue(p.id)))),29303000);assert.equal(cents(sum(exposure.issuerRows.map(r=>r.value))),257113452);
assert.equal(cents(sum(exposure.defaultReport.map(r=>r.laterPutCash))),352013115);
for(const [key,direct,put,note] of [['company:microsoft',134340.72,0,200219.13],['company:alphabet',68350,0,200219.13],['company:nvidia',64416,44000,292970],['company:sap',191910.67,236362.05,0],['fund:spdr-gold-trust',16511.04,0,200460]]){const r=exposure.defaultReport.find(r=>r.entity.key===key);assert.equal(cents(r.directValue),cents(direct));assert.equal(cents(r.putCash),cents(put));assert.equal(cents(r.noteValue),cents(note));}
assert.equal(exposure.defaultReport.find(r=>/NORILSK/i.test(r.entity.name)).directUnavailable,1);
const software=exposure.themes.find(t=>t.key==='software-cloud');assert.ok(software.ids.includes('holding-136'));assert.ok(!software.ids.includes('holding-138'));assert.ok(!software.ids.includes('holding-131'));
assert.equal(exposure.defaultReport.filter(r=>r.repeated&&!r.unresolved).length,48);assert.equal(exposure.defaultReport.filter(r=>r.routes.length>=3&&!r.unresolved).length,17);
assert.equal(returns.benchmarks.length,8);
for(const r of returns.benchmarks){assert.ok(r.source_url.startsWith('https://www.ishares.com/'));assert.equal(cents(r.portfolio_return_pct-r.reference_return_pct),cents(r.gap_pp));if(/^20\d\d$/.test(r.label)){assert.equal(r.period_start,r.label+'-01-01');assert.equal(r.period_end,r.label+'-12-31');assert.equal(r.portfolio_return_pct,p.history.find(h=>h.label===r.label).pct);}}
const half=returns.benchmarks.find(r=>r.label==='H1 2026');assert.equal(half.period_end,'2026-06-30');assert.equal(half.portfolio_return_pct,p.months[5].cumulative);assert.equal(half.reference_return_pct,11.64);
const years=returns.benchmarks.filter(r=>/^20\d\d$/.test(r.label));const grow=(rows,key)=>rows.reduce((v,r)=>v*(1+r[key]/100),100);
assert.equal(cents(grow(years,'portfolio_return_pct')),11910);assert.equal(cents(grow(years,'reference_return_pct')),25064);assert.equal(cents(grow(years.filter(r=>r.label>='2022'),'portfolio_return_pct')),9054);assert.equal(cents(grow(years.filter(r=>r.label>='2022'),'reference_return_pct')),14359);
assert.equal(cents(sum(p.performanceContributions.map(c=>c.contribution_pp))),1764);
console.log('PASS: company/fund mappings, nonadditive note links, expiry separation, missing valuations, theme membership and matched benchmark periods.');
// Principal repayment and funding examples must reconcile independently of accrued interest.
const debtBasket=read('debt-baskets');
const debtSource=fs.readFileSync(new URL('../lib/debt.ts',import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'');
const debtBindings=`const cash=${JSON.stringify(risk.cash)},loans=${JSON.stringify(risk.loans)},nav=${summary.net},metrics=${JSON.stringify(risk.metrics)},portfolio=${JSON.stringify(p)},basketData=${JSON.stringify(debtBasket)},holdingsData=${JSON.stringify(h)};`;
const debtJs=ts.transpileModule(debtBindings+debtSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const debt=await import('data:text/javascript;base64,'+Buffer.from(debtJs).toString('base64'));
assert.equal(cents(debt.principal),495787539);assert.equal(cents(debt.accrued),186507);assert.equal(cents(debt.positiveCash),145614525);assert.equal(cents(debt.remainingPrincipal),295787539);
for(const plan of [debt.ratePlan,debt.currencyPlan]){assert.equal(cents(sum(plan.map(r=>r.repayment))+debt.overdraftPrincipal),200000000);assert.equal(cents(sum(plan.map(r=>r.remaining))),295787539);for(const r of plan){assert.ok(r.repayment>=0&&r.remaining>=0);assert.equal(cents(r.repayment+r.remaining),cents(r.principal));}}
assert.equal(cents(sum(debt.ratePlan.map(r=>r.annualSaving))),6685118);assert.equal(cents(sum(debt.currencyPlan.map(r=>r.annualSaving))),5957932);
for(const plan of debt.fundingPlans){assert.equal(plan.cashUsed+plan.sales+plan.external,2000000);const r=debt.fundingResult(plan);assert.equal(cents(r.net),cents(summary.net+plan.external));assert.equal(cents(r.remainingDebt),295974046);assert.equal(cents(r.positiveCash),cents(debt.positiveCash-plan.cashUsed));}
assert.equal(cents(debt.fundingResult(debt.fundingPlans[1]).netCash),95503714);
for(const b of debt.baskets){assert.equal(sum(b.sales.map(s=>s.illustrative_sale_target_usd)),b.sale_target_usd);assert.equal(b.sale_target_usd+b.cash_use_usd,2000000);assert.equal(new Set(b.sales.map(s=>s.id)).size,b.sales.length);for(const s of b.sales){assert.ok(s.holding);assert.ok(['Equities','Equity funds','Real estate investment fund (Real estate participations)'].includes(s.holding.section));assert.ok(s.illustrative_sale_target_usd>0&&s.illustrative_sale_target_usd<=s.holding.value_usd);const m=mappingData.positions.find(p=>p.id===s.id);for(const key of m.underlying_keys){const linked=mappingData.positions.filter(p=>p.underlying_keys.includes(key));assert.ok(!linked.some(p=>p.route==='accumulator'));assert.ok(!linked.some(p=>o.options.find(x=>x.id===p.id&&x.type==='Call')));}}}
const debtPage=fs.readFileSync(new URL('../app/reduce-borrowing.tsx',import.meta.url),'utf8');assert.ok(debtPage.includes('Funding choice')&&debtPage.includes('Repayment priority')&&debtPage.includes('SaleBasket'));assert.ok(fs.readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8').includes('value="reduce-borrowing"'));
console.log('PASS: exact $2m principal reduction, interest separation, funding/net-worth changes, sale limits, contract exclusions and both repayment priorities.');
const sc=read('standard-chartered'),scGuide=read('standard-chartered-fund-guide');
assert.equal(sc.funds.length,10);assert.equal(new Set(sc.funds.map(f=>f.id)).size,10);assert.equal(cents(sc.reported_total_value_usd),396688408);assert.equal(cents(sc.reported_unrealized_gain_usd),20615787);assert.equal(sc.reported_unrealized_gain_pct,5.48);
assert.equal(sc.as_of_date,'2026-09-08');assert.equal(sc.device_date_text,'Mon 7 Sep');assert.equal(sc.date_conflict,true);
assert.equal(sc.funds.filter(f=>f.value_usd!==null).length,8);assert.equal(sc.funds.filter(f=>f.unrealized_gain_usd!==null).length,9);
assert.equal(sum(sc.funds.map(f=>cents(f.value_usd??0))),316760524);assert.equal(sum(sc.funds.map(f=>cents(f.unrealized_gain_usd??0))),19503508);assert.equal(cents(sc.reported_total_value_usd)-316760524,cents(sc.reconciliation.combined_value_residual_for_two_obscured_rows_usd));assert.equal(cents(sc.reported_unrealized_gain_usd)-19503508,cents(sc.reconciliation.unreadable_bgf_gain_residual_usd));
assert.equal(sc.funds.find(f=>f.id==='sc-fund-05').value_usd,null);assert.equal(sc.funds.find(f=>f.id==='sc-fund-07').value_usd,null);assert.equal(sc.funds.find(f=>f.id==='sc-fund-08').unrealized_gain_usd,null);assert.equal(sc.funds.find(f=>f.id==='sc-fund-08').unrealized_gain_pct,null);assert.equal(sum(sc.reported_allocation.map(a=>cents(a.weight_pct))),10000);
assert.deepEqual(scGuide.map(g=>g.id).sort(),sc.funds.map(f=>f.id).sort());for(const g of scGuide)assert.ok(g.url.startsWith('https://'));
const scPage=fs.readFileSync(new URL('../app/standard-chartered.tsx',import.meta.url),'utf8'),homePage=fs.readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
assert.ok(homePage.includes('value="standard-chartered"')&&homePage.includes("{tab==='standard-chartered'?"));assert.ok(scPage.includes('not added to the LGT totals')&&scPage.includes('Not legible'));assert.ok(!/retail\.sc\.com|IBAN|OTP|\br=/.test(JSON.stringify(sc)+scPage));
assert.equal(cents(p.summary.net),830340626);assert.equal(h.holdings.length,336);
console.log('PASS: ten SC screenshot funds, aggregate figures, nulls for obscured readings, date discrepancy, source coverage and separation from LGT.');
