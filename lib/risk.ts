import holdingsData from '@/data/holdings.json';
import optionsData from '@/data/options.json';
import structuredData from '@/data/structured_contracts.json';
import portfolio from '@/data/portfolio.json';
import { optionTerms, type OptionPosition } from './options';

export const holdings = holdingsData.holdings;
export const options = optionsData.options as OptionPosition[];
export const structured = structuredData.contracts;
export const snapshot = portfolio.summary.date;
export const nav = portfolio.summary.net;
export const sum = (values: number[]) => values.reduce((a,b)=>a+b,0);
export const loans = holdings.filter(h=>h.section==='Fixed advances (Credit)');
export const cash = holdings.filter(h=>h.section==='Accounts (Liquidity)');
export const notes = holdings.filter(h=>h.section==='Structured products equities (Equities)');
export const privateFunds = holdings.filter(h=>h.section==='Private equity');
export const expiryReached = (o:OptionPosition)=>o.expiration<=snapshot;
export const laterOptions = options.filter(o=>!expiryReached(o));
export const reachedOptions = options.filter(expiryReached);
export const laterPuts = laterOptions.filter(o=>o.type==='Put');
export const laterCalls = laterOptions.filter(o=>o.type==='Call');
export const totalValue = (rows:typeof holdings)=>sum(rows.map(h=>(h.value_usd??0)+h.accrued_interest_usd));
export const grossPutCash = (rows:OptionPosition[])=>sum(rows.filter(o=>o.type==='Put').map(o=>optionTerms(o).grossStrikeCash*o.usd_per_currency));
export const metrics = {
  advances: -totalValue(loans),
  overdraftPrincipal: -sum(cash.filter(h=>(h.value_usd??0)<0).map(h=>h.value_usd??0)),
  positiveCash: sum(cash.filter(h=>(h.total_value_usd??0)>0).map(h=>h.total_value_usd??0)),
  negativeCash: -sum(cash.filter(h=>(h.total_value_usd??0)<0).map(h=>h.total_value_usd??0)),
  netCash: totalValue(cash),
  equity: portfolio.allocation.find(a=>a.name==='Equities')!.value,
  notes: totalValue(notes),
  privateFunds: totalValue(privateFunds),
  futurePutCash: grossPutCash(laterPuts),
  reachedPutCash: grossPutCash(reachedOptions),
  structuredMark: sum(structured.map(s=>s.statement_mark_usd)),
};
export function equityStress(declinePct:number) {
  const loss=metrics.equity*declinePct/100;
  return {loss,remaining:nav-loss,navDeclinePct:loss/nav*100};
}
export function repaymentIllustration(amount:number) {
  const repayment=Math.min(Math.max(amount,0),metrics.advances);
  return {repayment,remainingAdvances:metrics.advances-repayment,ratio:(metrics.advances-repayment)/nav*100};
}
export const money=(n:number,currency='USD',digits=0)=>new Intl.NumberFormat('en-US',{style:'currency',currency,currencyDisplay:currency==='USD'?'symbol':'code',maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n);
export const percent=(n:number)=>`${(n/nav*100).toFixed(2)}%`;
export const date=(s:string)=>new Date(`${s}T12:00:00Z`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
