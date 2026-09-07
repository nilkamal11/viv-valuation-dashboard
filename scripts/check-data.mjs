import assert from 'node:assert/strict';
import fs from 'node:fs';
import { summary, allocation, currencies, components } from '../lib/portfolio.ts';
const h=JSON.parse(fs.readFileSync(new URL('../data/holdings.json',import.meta.url)));
const a=JSON.parse(fs.readFileSync(new URL('../data/activity.json',import.meta.url)));
const cents=n=>Math.round(n*100);
const sum=arr=>arr.reduce((n,v)=>n+v,0);
assert.equal(h.statement_date,summary.date);
assert.equal(h.holdings.length,309);
assert.equal(new Set(h.holdings.map(x=>x.id)).size,309);
assert.equal(h.section_reconciliation.length,16);
for(const s of h.section_reconciliation){const rows=h.holdings.filter(x=>x.section===s.section);assert.equal(rows.length,s.rows);assert.equal(sum(rows.map(x=>cents(x.value_usd??0))),cents(s.statement_total_usd),s.section);assert.equal(sum(rows.map(x=>cents(x.accrued_interest_usd))),cents(s.accrued_interest_usd));}
assert.equal(sum(h.holdings.map(x=>cents(x.value_usd??0)+cents(x.accrued_interest_usd))),cents(summary.net));
assert.equal(h.holdings.filter(x=>x.value_usd===null).length,1);
assert.match(h.holdings.find(x=>x.value_usd===null).name,/NORILSK/);
assert.equal(h.holdings.find(x=>x.value_usd===null).total_value_usd,null);
for(const [currency,rate] of Object.entries({CAD:3.25,CHF:1.10,DKK:2.98,EUR:3.40,GBP:4.89,HKD:3.86,JPY:2.00})){const loan=h.holdings.find(x=>x.section==='Fixed advances (Credit)'&&x.currency===currency);assert.equal(loan.interest_rate_pct,rate);assert.match(loan.maturity_date,/^2026-08-0[4-7]$/);assert.ok(loan.value_usd<0);}
assert.equal(sum(allocation.map(x=>cents(x.value))),cents(summary.net));
assert.equal(sum(currencies.map(x=>cents(x.value))),cents(summary.net));
assert.equal(cents(summary.start)+cents(summary.deposits)+cents(summary.withdrawals)+cents(summary.investmentChange),cents(summary.performanceEnd));
assert.equal(sum(components.map(x=>cents(x.value))),cents(summary.investmentChange));
assert.equal(cents(summary.net)-cents(summary.performanceEnd),391382);
const bondRows=h.holdings.filter(x=>['Bonds','Bond funds'].includes(x.section));
assert.equal(bondRows.length,3);
assert.equal(sum(bondRows.map(x=>cents(x.value_usd)+cents(x.accrued_interest_usd))),70466742);
assert.equal(cents(allocation.find(x=>x.name==='Bonds').value)-70466742,24634368);
const bondCoupons=a.estimated_interest.rows.filter(x=>x.instrument==='FLR Barclays WFM');
assert.equal(bondCoupons.length,4);
assert.equal(sum(bondCoupons.map(x=>cents(x.amount))),1675000);
assert.equal(sum(bondCoupons.map(x=>cents(x.statement_amount_usd))),2249192);
assert.equal(a.rows.length,2365);assert.equal(a.dated_entry_count,2302);
assert.equal(sum(a.type_counts.map(x=>x.dated_entries)),2302);
assert.equal(sum(a.month_counts.map(x=>x.dated_entries)),2302);
assert.equal(sum(a.currency_counts.map(x=>x.currency_legs)),2365);
for(const t of a.type_counts){assert.equal(a.rows.filter(x=>x.type===t.type).length,t.dated_entries*(['Foreign exchange','OTC'].includes(t.type)?2:1));}
for(const r of a.reconciliation)assert.equal(cents(r.calculated_statement_usd),cents(r.printed_total_usd));
assert.equal(a.estimated_interest.rows.length,157);
assert.equal(sum(a.estimated_interest.rows.map(x=>cents(x.statement_amount_usd))),27929995);
for(const r of a.rows){assert.ok(r.date>='2026-01-01'&&r.date<='2026-07-30');assert.match(r.currency,/^[A-Z]{3}$/);assert.ok(Number.isFinite(r.amount));assert.ok(r.printed_page>=61&&r.printed_page<=297);if(['Buys','Withdrawals'].includes(r.type))assert.ok(r.amount<=0);if(['Sells','Deposits'].includes(r.type))assert.ok(r.amount>=0);if(['Deposits','Withdrawals'].includes(r.type))assert.equal(r.instrument,'Payment');}
for(const raw of [JSON.stringify(h),JSON.stringify(a)]){assert.doesNotMatch(raw,/\bLI\d{2}(?:[ -]?\d){17}\b/i,'IBAN');assert.doesNotMatch(raw,/\b\d{7}\.\d{3}\b/,'account reference');assert.doesNotMatch(raw,/\b(?:YY|XD)\d{8,}\b/,'internal security ID');assert.doesNotMatch(raw,/C:\\|Operations Dropbox|OneDrive|@/,'local path or email');}
console.log('PASS: holdings, allocation, cash-flow bridge, loan rates, transaction counts, currency legs, estimates and public-data patterns.');
