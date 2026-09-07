import underlyingData from '@/data/underlying-map.json';
import fundData from '@/data/fund-map.json';
import {holdings,options,snapshot,nav} from './risk';
import {optionTerms} from './options';

export type Entity={key:string;name:string;type:string;aliases?:string[]};
export type Mapping={id:string;route:string;underlying_keys:string[];issuer_key:string|null;printed_page:number;resolution_status:string;evidence:unknown;unresolved:unknown};
export type Fund={holding_id:string;holding_ids:string[];key:string;name:string;isin:string|null;ticker:string|null;theme_keys:string[];theme:string;coverage:string;as_of:string|null;holdings_as_of:string|null;sources:{title:string;url:string;as_of:string|null;kind:string}[];named_constituents:{underlying_key:string;name:string;weight_pct:number|null;as_of:string|null;source_url:string;exposure_basis:string}[];notes:unknown};
export const mapping=underlyingData.positions as Mapping[];
export const funds=(fundData.funds as unknown as (Omit<Fund,'holding_ids'>&{holdings_ids:string[]})[]).map(f=>({...f,holding_ids:f.holdings_ids??[f.holding_id]}));
const entitySeed=underlyingData.entities as Entity[];
export const entities=[...entitySeed,...funds.flatMap(f=>f.named_constituents).filter((c,i,all)=>!entitySeed.some(e=>e.key===c.underlying_key)&&all.findIndex(a=>a.underlying_key===c.underlying_key)===i).map(c=>({key:c.underlying_key,name:c.name,type:'company',aliases:[]}))];
export const holdingById=new Map(holdings.map(h=>[h.id,h]));
export const optionById=new Map(options.map(o=>[o.id,o]));
export const entityByKey=new Map(entities.map(e=>[e.key,e]));
export const fundIds=new Set(funds.flatMap(f=>f.holding_ids??[f.holding_id]));
export const fullValue=(id:string)=>holdingById.get(id)?.total_value_usd??0;
export const sum=(a:number[])=>a.reduce((s,n)=>s+n,0);
export function kind(id:string){const h=holdingById.get(id)!;const o=optionById.get(id);if(o)return o.type==='Put'?'puts':'calls';if(h.section==='Equities')return 'shares';if(fundIds.has(id))return 'funds';if(h.section==='Structured products equities (Equities)')return 'notes';if(h.section==='Warrants (Derivatives)')return 'warrants';if(h.section==='Structured products')return h.description?.includes('Accumulator')?'accumulators':'fx';return 'other'}
export const kindLabels:Record<string,string>={shares:'Direct shares',funds:'Fund units',puts:'Short puts',calls:'Short calls',notes:'Structured notes',accumulators:'Accumulators',warrants:'Warrants',fx:'FX contract',other:'Other'};
export const isExpired=(id:string)=>{const o=optionById.get(id);return !!o&&o.expiration<=snapshot};
export const isUnresolved=(key:string)=>/unknown|unresolved|unnamed/i.test(key)||/unknown|unresolved|unnamed/i.test(entityByKey.get(key)?.type??'');
export type FundLink={fund:Fund;name:string;weight:number|null;asOf:string|null;source:string;basis:string};
export function report(includeExpired=false){return entities.filter(e=>mapping.some(p=>p.underlying_keys.includes(e.key))||funds.some(f=>f.named_constituents.some(c=>c.underlying_key===e.key))).map(entity=>{
 const positions=mapping.filter(p=>p.underlying_keys.includes(entity.key)&&(includeExpired||!isExpired(p.id)));
 const fundLinks:FundLink[]=funds.flatMap(f=>f.named_constituents.filter(c=>c.underlying_key===entity.key).map(c=>({fund:f,name:c.name,weight:c.weight_pct,asOf:c.as_of,source:c.source_url,basis:c.exposure_basis})));
 const routes=[...new Set([...positions.map(p=>kind(p.id)),...(fundLinks.length?['lookthrough']:[])])];
 const idsOf=(k:string)=>positions.filter(p=>kind(p.id)===k).map(p=>p.id);
 const directIds=positions.filter(p=>['shares','funds'].includes(kind(p.id))).map(p=>p.id);
 const putIds=idsOf('puts');const callIds=idsOf('calls');const noteIds=idsOf('notes');const accumulatorIds=idsOf('accumulators');
 const putCash=sum(putIds.map(id=>{const o=optionById.get(id)!;return optionTerms(o).grossStrikeCash*o.usd_per_currency}));
 const directValue=sum(directIds.map(fullValue));const directUnavailable=directIds.filter(id=>holdingById.get(id)?.total_value_usd===null).length;const noteValue=sum(noteIds.map(fullValue));
 const laterPutCash=sum(putIds.filter(id=>!isExpired(id)).map(id=>{const o=optionById.get(id)!;return optionTerms(o).grossStrikeCash*o.usd_per_currency}));
 const expiredCount=mapping.filter(p=>p.underlying_keys.includes(entity.key)&&isExpired(p.id)).length;
 return {entity,positions,fundLinks,routes,directIds,putIds,callIds,noteIds,accumulatorIds,directValue,directUnavailable,noteValue,putCash,laterPutCash,expiredCount,unresolved:isUnresolved(entity.key),repeated:routes.length>=2};
 }).filter(r=>r.positions.length||r.fundLinks.length).sort((a,b)=>b.routes.length-a.routes.length||b.directValue-a.directValue||a.entity.name.localeCompare(b.entity.name));}
export type ExposureRow=ReturnType<typeof report>[number];
export const defaultReport=report();
export const opaqueNotes=mapping.filter(p=>kind(p.id)==='notes'&&(p.underlying_keys.length===0||p.underlying_keys.some(isUnresolved)));
export const issuerRows=[...new Set(mapping.filter(p=>kind(p.id)==='notes'&&p.issuer_key).map(p=>p.issuer_key!))].map(key=>{const rows=mapping.filter(p=>kind(p.id)==='notes'&&p.issuer_key===key);return {key,name:entityByKey.get(key)?.name??key,rows,value:sum(rows.map(p=>fullValue(p.id)))}}).sort((a,b)=>b.value-a.value);
export const themeDefinitions=[
 {key:'semiconductors',name:'Semiconductors',names:/NVIDIA|Broadcom|Advanced Micro|Intel\b|Micron|Taiwan Semiconductor|SK Hynix|Samsung Electr|Sandisk|ASML|Photronics/i,fundWords:/semiconductor/i,note:'SOXX and SMH share a sector mandate; chip companies also appear directly and inside note baskets. Fund constituent weights vary.'},
 {key:'software-cloud',name:'Software, cloud & AI',names:/Microsoft|\bSAP\b|Salesforce|Oracle|ServiceNow|Palantir|Adobe|CoreWeave/i,fundWords:/software/i,note:'Direct companies, software funds and conditional contracts can respond to the same technology cycle. This is an analyst-defined review group, not a complete sector allocation.'},
 {key:'china-tech',name:'China technology',names:/Tencent|Alibaba|NetEase|Meituan|Baidu|JD\.com|Xiaomi|Hang Seng TECH/i,fundWords:/china.*tech|hang.seng.tech|china-technology/i,note:'The 3033 fund and 3033 accumulator reference the same vehicle. Tencent and Alibaba also occur elsewhere; full historical fund look-through is incomplete.'},
 {key:'precious-metals',name:'Precious metals & miners',names:/Gold|Silver|Platinum|Barrick|Newmont|Agnico|Alamos|SSR Mining/i,fundWords:/gold|silver|platinum|precious-metal/i,note:'Bullion, futures and miners are different investments, but all can carry precious-metal risk. A miner adds business and equity-market risks; these are not interchangeable gold holdings.'},
 {key:'us-small-cap',name:'US small companies',names:/Russell 2000/i,fundWords:/russell.2000/i,note:'Vanguard Russell 2000 and iShares Russell 2000 are separate funds with a shared small-company index exposure. A note linked to IWM can repeat risk already present in the Vanguard fund.'},
 {key:'real-estate',name:'Listed real estate',names:/Real Estate/i,fundWords:/real.estate/i,note:'The Vanguard real-estate fund and the Real Estate Select Sector reference in a structured note are distinct products exposed to related property and interest-rate risks.'},
];
export const themes=themeDefinitions.map(t=>{const keys=new Set(entities.filter(e=>t.names.test(e.name)).map(e=>e.key));for(const f of funds.filter(f=>t.fundWords.test(`${f.name} ${f.theme} ${f.theme_keys.join(' ')}`))){for(const p of mapping.filter(p=>f.holding_ids.includes(p.id)))for(const k of p.underlying_keys)keys.add(k)}const rows=mapping.filter(p=>p.underlying_keys.some(k=>keys.has(k))&&!isExpired(p.id));const unique=[...new Set(rows.map(p=>p.id))];return {...t,keys:[...keys],ids:unique,directValue:sum(unique.filter(id=>['shares','funds'].includes(kind(id))).map(fullValue)),noteValue:sum(unique.filter(id=>kind(id)==='notes').map(fullValue)),putCash:sum(unique.filter(id=>kind(id)==='puts').map(id=>{const o=optionById.get(id)!;return optionTerms(o).grossStrikeCash*o.usd_per_currency})),accumulatorCount:unique.filter(id=>kind(id)==='accumulators').length}});
export const pctNav=(n:number)=>`${(n/nav*100).toFixed(2)}%`;

