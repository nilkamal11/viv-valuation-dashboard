import {cash,loans,nav,metrics} from './risk';
import portfolio from '@/data/portfolio.json';
import basketData from '@/data/debt-baskets.json';
import holdingsData from '@/data/holdings.json';

export const target=2_000_000;
export const fixedPrincipal=-loans.reduce((s,h)=>s+(h.value_usd??0),0);
export const overdraftPrincipal=metrics.overdraftPrincipal;
export const principal=fixedPrincipal+overdraftPrincipal;
export const accrued=-[...loans,...cash].reduce((s,h)=>s+h.accrued_interest_usd,0);
export const positiveCash=cash.reduce((s,h)=>s+Math.max(h.value_usd??0,0),0);
export const remainingPrincipal=principal-target;
export const fundingPlans=[
 {id:'sales',name:'Sell $2m of shares and funds',cashUsed:0,sales:target,external:0,why:'Preserves the existing cash balance and reduces market exposure as well as debt.',tradeoff:'Largest reduction in invested assets. Realized gains, losses, taxes and lost dividends depend on the positions and tax lots chosen.'},
 {id:'blend',name:'Use $500k cash + sell $1.5m',cashUsed:500_000,sales:1_500_000,external:0,why:'Sells fewer investments while retaining about $956k of positive cash balances before accrued interest and costs.',tradeoff:'Reduces the cash available for assignments and capital calls. The remaining balance is not a verified adequate reserve.'},
 {id:'external',name:'Bring in $2m of outside cash',cashUsed:0,sales:0,external:target,why:'Preserves the existing investment positions and account cash, if unborrowed outside funds are available.',tradeoff:'Uses liquidity held elsewhere. Replacing LGT debt with another loan moves the debt rather than reducing total household borrowing.'},
];
export const baskets=basketData.map(b=>({...b,sales:b.sales.map(s=>({...s,holding:holdingsData.holdings.find(h=>h.id===s.id)!}))}));
export function fundingResult(plan:typeof fundingPlans[number]) {
 const net=nav+plan.external;
 return {net,positiveCash:positiveCash-plan.cashUsed,netCash:metrics.netCash+overdraftPrincipal-plan.cashUsed,remainingDebt:remainingPrincipal+accrued,debtToNet:(remainingPrincipal+accrued)/net*100};
}

// Both plans clear the two principal overdrafts first, then reduce fixed advances.
export function repaymentPlan(order:string[],caps:Record<string,number>={}) {
 let left=target-overdraftPrincipal;
 return order.map(id=>{const h=loans.find(h=>h.id===id)!;const balance=-(h.value_usd??0);const repayment=Math.min(balance,left,caps[id]??Infinity);left=Math.max(0,left-repayment);const fx=portfolio.fxRates.find(r=>r.currency===h.currency)!.usd_per_currency;return {...h,principal:balance,repayment,remaining:balance-repayment,nativeRepayment:repayment===balance?Math.abs(h.balance_in_currency??0):repayment/fx,annualSaving:repayment*(h.interest_rate_pct??0)/100};});
}
export const ratePlan=repaymentPlan(['holding-028','holding-029','holding-030','holding-027','holding-024','holding-026','holding-031','holding-025']);
export const currencyPlan=repaymentPlan(['holding-024','holding-031','holding-028','holding-029','holding-030','holding-027','holding-026','holding-025'],{'holding-024':1_175_292.25,'holding-031':523_740.41-125_813.86});
