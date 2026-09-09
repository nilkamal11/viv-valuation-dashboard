'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import optionsData from '@/data/options.json';
import { expirationScenario, optionTerms, parseScenarioPrice, type OptionPosition } from '@/lib/options';

const options = optionsData.options as OptionPosition[];
const money = (n: number, currency = 'USD', digits = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
const number = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 4 });
const date = (s: string) => new Date(`${s}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const optionLabel = (o: OptionPosition) => `${o.underlying} · ${o.type.toLowerCase()} · ${number(o.strike)} ${o.currency} · ${date(o.expiration)}`;
const puts = options.filter(o => o.type === 'Put');
const calls = options.filter(o => o.type === 'Call');
const shortPuts = puts.filter(o=>o.signed_contracts<0);
const shortCalls = calls.filter(o=>o.signed_contracts<0);
const longOptions = options.filter(o=>o.signed_contracts>0);
const currencyList = [...new Set(options.map(o => o.currency))].sort();
const expiryList = [...new Set(options.map(o => o.expiration))].sort();
const pageSize = 15;

function Picker({ label, value, onChange, choices }: { label: string; value: string; onChange: (v: string) => void; choices: { value: string; label: string }[] }) {
  return <div className="picker"><span className="fieldlabel">{label}</span><Select value={value} onValueChange={v => { if (v) onChange(v); }}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{choices.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>;
}

function LiabilityChart({ option, price }: { option: OptionPosition; price: number | null }) {
  const terms = optionTerms(option);
  const xmax = Math.max(terms.threshold * 2, (price ?? 0) * 1.15, 1);
  const ymax = Math.max(expirationScenario(option, 0).intrinsic, expirationScenario(option, xmax).intrinsic, 1);
  const x = (s: number) => 86 + s / xmax * 414;
  const y = (v: number) => 195 - v / ymax * 160;
  const points = [...new Set([0, Math.max(0, terms.threshold), xmax])].sort((a, b) => a - b).map(s => `${x(s)},${y(expirationScenario(option, s).intrinsic)}`).join(' ');
  return <figure className="option-chart"><svg viewBox="0 0 540 258" aria-label={`${option.underlying} ${option.signed_contracts<0?'short':'long'} ${option.type.toLowerCase()} expiration value in ${option.currency}.`}>
    <text x="86" y="18" fontSize="13">Option {option.signed_contracts<0?'liability':'value'} · {option.currency}</text>
    {[0, .5, 1].map(f => <g key={f}><line x1="86" x2="500" y1={y(ymax * f)} y2={y(ymax * f)} stroke="#dbe3ec" /><text x="77" y={y(ymax * f) + 4} textAnchor="end" fontSize="12">{number(Math.round(ymax * f))}</text></g>)}
    <polyline points={points} fill="none" stroke="#b45460" strokeWidth="3" />
    {[0, terms.threshold, xmax].map((s, i) => <text key={i} x={x(s)} y="217" textAnchor="middle" fontSize="12">{number(s)}</text>)}
    <text x="293" y="244" textAnchor="middle" fontSize="13">{option.deliverable_symbol} share price at expiration · {option.currency}</text>
    {price !== null && <circle cx={x(price)} cy={y(expirationScenario(option, price).intrinsic)} r="6" fill="#087e74" stroke="white" strokeWidth="2" />}
  </svg><figcaption className="note">Intrinsic option {option.signed_contracts<0?'liability':'value'} only, before premiums and fees. The dot marks your assumed price. The line is an illustration, not a forecast.</figcaption></figure>;
}

export default function OptionsSection() {
  const [selectedId, setSelectedId] = useState(options[0].id);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [expiry, setExpiry] = useState('All');
  const [currency, setCurrency] = useState('All');
  const [page, setPage] = useState(0);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const selected = options.find(o => o.id === selectedId)!;
  const terms = optionTerms(selected);
  const input = prices[selected.id] ?? '';
  const price = parseScenarioPrice(input);
  const scenario = price === null ? null : expirationScenario(selected, price);
  const filtered = useMemo(() => options.filter(o => (type === 'All' || o.type === type) && (expiry === 'All' || o.expiration === expiry) && (currency === 'All' || o.currency === currency) && `${o.underlying} ${o.deliverable_symbol} ${o.type} ${o.strike} ${o.currency} ${o.coverage_remark ?? ''}`.toLowerCase().includes(query.toLowerCase())), [query, type, expiry, currency]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const selectOption = (id: string, scroll = false) => {
    setSelectedId(id);
    if (scroll) requestAnimationFrame(() => { detailHeading.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); detailHeading.current?.focus({ preventScroll: true }); });
  };
  const setPrice = (value: string) => setPrices(p => ({ ...p, [selected.id]: value }));
  return <div className="stack">
    <section className="panel">
      <p className="eyebrow">OPTIONS · PRINTED PP. 36–50</p><h2>{options.length} positions: {options.length-longOptions.length} short and {longOptions.length} long</h2>
      <p className="subtitle">A short put can require buying shares; a short call can require delivering them. A long option is a purchased right and does not create the same assignment liability.</p>
      <div className="option-metrics">
        <article><span>Option value in the statement</span><strong>{money(options.reduce((s, o) => s + o.statement_mark_usd, 0))}</strong><p>Net signed mark · 7 September 2026</p></article>
        <article><span>Short puts</span><strong>{shortPuts.length} positions</strong><p>{number(shortPuts.reduce((s, o) => s + Math.abs(o.signed_contracts), 0))} contracts · potential share purchases</p></article>
        <article><span>Calls</span><strong>{shortCalls.length} short · {longOptions.filter(o=>o.type==='Call').length} long</strong><p>{shortCalls.filter(o=>o.coverage_remark).length} short-call positions marked “Covered” by the bank</p></article>
      </div>
      <div className="callout risk-callout"><h3>Every listed expiry falls after the statement date</h3><p>The contracts expire from 18 September 2026 through 21 January 2028. Their status after 7 September is not known. <a href="#risk">See the separate risk totals →</a></p></div><div className="callout below"><h3>“Value now” versus value at expiration</h3><p>The latest value available here is the bank’s <strong>7 September 2026</strong> mark. Live quotes and later account activity are not connected. At expiration, intrinsic value depends on the underlying price. Select any contract below to calculate that scenario.</p></div>
      <p className="note below">This section covers the {options.length} entries under “Options (Derivatives).” Warrants and structured products remain in Holdings and are not modeled as ordinary options.</p>
    </section>

    <section className="panel option-detail" aria-labelledby="option-detail-heading">
      <div className="panelhead"><div><p className="eyebrow">CONTRACT EXPLAINER</p><h2 id="option-detail-heading" tabIndex={-1} ref={detailHeading}>{optionLabel(selected)}</h2></div><span className="small-label">Source p. {selected.printed_page}</span></div>
      <div className="option-selector"><Picker label="Choose any option" value={selectedId} onChange={id => selectOption(id)} choices={options.map(o => ({ value: o.id, label: optionLabel(o) }))} /></div>
      <div className="option-detail-grid below">
        <div>
          <span className="option-tag">{selected.signed_contracts<0?'Short':'Long'} {selected.type.toLowerCase()}{selected.adjustment_source ? ' · adjusted contract' : ''}</span>
          <dl className="bond-facts">
            <div><dt>Underlying symbol</dt><dd>{selected.deliverable_symbol}{selected.adjustment_source ? ` (contract ${selected.underlying})` : ''}</dd></div>
            <div><dt>Expiration</dt><dd>{date(selected.expiration)}</dd></div><div><dt>Status at statement date</dt><dd>{selected.expiration<=optionsData.statement_date?'Expiry reached; settlement unconfirmed':'Later expiry; subsequent status unknown'}</dd></div>
            <div><dt>Contracts sold</dt><dd>{number(terms.contracts)}</dd></div>
            <div><dt>Strike as quoted</dt><dd>{money(selected.strike, selected.currency)}</dd></div>
            <div><dt>Strike / premium multiplier</dt><dd>{number(selected.strike_multiplier)}</dd></div>
            <div><dt>Shares per contract</dt><dd>{number(selected.shares_per_contract)}{selected.cash_per_contract > 0 ? ` + ${money(selected.cash_per_contract, selected.currency)} cash` : ''}</dd></div>
            <div><dt>Statement option quote</dt><dd>{money(selected.quoted_option_price, selected.currency, 4)}</dd></div>
            <div><dt>Position value · {date(selected.price_date)}</dt><dd className="negative-text">{money(selected.statement_mark_usd)}</dd></div>
          </dl>
          <p className="note">The option quote × multiplier × signed contract count gives the native position mark, converted to USD at the statement rate. The quote is an option price, not a share price or the original premium received. Statement market label: {selected.market_label}{selected.market_label === 'OCC' ? ' (clearinghouse)' : ''}.</p>
          {selected.adjustment_source && <div className="callout below"><h3>FUBO1 has an adjusted deliverable</h3><p>Each contract delivers 8 FUBO shares plus USD 4.40 cash. Its strike and quoted option premium still use a multiplier of 100. The share-price threshold is {money(terms.threshold, selected.currency)}, not the quoted strike of {money(selected.strike, selected.currency)}.</p><a className="note" href={selected.adjustment_source} target="_blank" rel="noreferrer">OCC adjustment memo · 6 April 2026 ↗</a></div>}
        </div>
        <div className="option-scenario">
          <p className="eyebrow">WHAT IF AT EXPIRATION?</p><h3>Set an assumed {selected.deliverable_symbol} share price</h3>
          <label className="scenario-input" htmlFor="option-scenario-price"><span className="fieldlabel">Share price in {selected.currency} · {date(selected.expiration)}</span><Input id="option-scenario-price" type="number" inputMode="decimal" min="0" max="1000000000" step="any" value={input} onChange={e => setPrice(e.target.value)} placeholder="Enter a hypothetical share price" aria-describedby="scenario-help" aria-invalid={input !== '' && price === null} /></label>
          <p id="scenario-help" className="note">These are assumed prices, not live quotes. The intrinsic-value threshold is {money(terms.threshold, selected.currency)} per share; it is not a break-even price after premiums.{selected.adjustment_source ? ' Enter the actual FUBO share price, not the adjusted FUBO1 quote.' : ''}</p>
          <div className="scenario-presets">{[.8, 1, 1.2].map(f => <Button key={f} variant="outline" onClick={() => setPrice(String(Number((terms.threshold * f).toFixed(4))))}>{f === 1 ? 'At threshold' : f < 1 ? '20% below threshold' : '20% above threshold'}</Button>)}<Button variant="ghost" onClick={() => setPrice('')}>Clear</Button></div>
          {input !== '' && price === null && <p role="alert" className="negative-text note">Enter a number from 0 to 1,000,000,000.</p>}
          <div className="scenario-result" aria-live="polite">
            <span>Option {selected.signed_contracts<0?'liability':'intrinsic value'} at expiration · all {number(terms.contracts)} contracts</span>
            <strong>{scenario ? money(scenario.intrinsic, selected.currency) : 'Depends on the share price'}</strong>
            {scenario ? <><p>Signed option value: <b>{money(scenario.signedValue, selected.currency)}</b>{selected.currency !== 'USD' ? ` ≈ ${money(scenario.signedValueUsd)} using statement FX` : ''}.</p><p>{scenario.inTheMoney ? 'This scenario is in the money: the option has intrinsic value.' : 'This scenario has zero intrinsic value. That alone does not guarantee no assignment.'}</p></> : <p>Enter a price or choose an illustration above to see the result.</p>}
          </div>
          <LiabilityChart option={selected} price={price} />
          <p className="note">The amount is the option’s intrinsic obligation, not the full cash or share delivery below. It excludes original premium, fees, taxes and changes in FX, so it is not total trade profit or loss.</p>
        </div>
      </div>
      <div className="option-assignment below">
        <p className="eyebrow">IF ALL {number(terms.contracts)} CONTRACTS ARE EXERCISED OR ASSIGNED</p>
        <h3>{selected.signed_contracts>0?(selected.type==='Call'?`Right to pay ${money(terms.grossStrikeCash, selected.currency)} and receive ${number(terms.shares)} ${selected.deliverable_symbol} shares`:`Right to deliver ${number(terms.shares)} shares and receive ${money(terms.grossStrikeCash, selected.currency)}`):(selected.type === 'Put' ? `Pay ${money(terms.grossStrikeCash, selected.currency)} to buy ${number(terms.shares)} ${selected.deliverable_symbol} shares` : `Deliver ${number(terms.shares)} ${selected.deliverable_symbol} shares and receive ${money(terms.grossStrikeCash, selected.currency)}`)}</h3>
        {terms.deliverableCash > 0 && <p>Also {selected.type === 'Put' ? 'receive' : 'deliver'} {money(terms.deliverableCash, selected.currency)} in fixed cash. Net cash {selected.type === 'Put' ? 'paid' : 'received'}: {money(terms.grossStrikeCash - terms.deliverableCash, selected.currency)}, before premiums and fees.</p>}
        <p>{selected.signed_contracts>0?'This long option is a right, not an obligation to exercise. Its loss is generally limited to the amount paid for the option, but that original premium is not established here.':selected.type === 'Put' ? `The cash buys an asset. It is not all an economic loss: the received shares have a value that depends on their market price. At a share price of zero, the maximum option-only intrinsic liability is ${money(expirationScenario(selected, 0).intrinsic, selected.currency)}, before premium.` : 'The obligation is to deliver shares. If the position is covered, assignment transfers those shares and limits further upside in them. The short call on its own has no finite upper liability as the share price rises.'}</p>
        <p><strong>Coverage in the statement: </strong>{selected.coverage_remark ? `“${selected.coverage_remark}.” This is the bank’s dated note; continuing coverage is not verified.` : 'No coverage or cash-reserve note is shown for this position. This does not establish whether collateral was reserved elsewhere.'}</p>
        <p className="note">Amounts assume full physical assignment using the stated contract size, with the documented FUBO1 adjustment. Partial assignment scales by the contracts assigned. These are gross settlement obligations, not margin requirements, a cash call forecast, or confirmation of assignment.</p>
      </div>
    </section>

    <section className="panel">
      <p className="eyebrow">EVERY OPTION · SEARCH AND COMPARE</p><h2>Contract-by-contract breakdown</h2>
      <p className="subtitle">Choose “Explain” to see that contract’s calculator, coverage note and full assignment terms. Scenario prices stay with each contract while this section remains open.</p>
      <div className="filters option-filters"><label className="searchfield" htmlFor="option-search"><span className="fieldlabel">Find an option</span><Input id="option-search" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Underlying symbol, strike or coverage note" /></label>
        <Picker label="Option type" value={type} onChange={v => { setType(v); setPage(0); }} choices={['All', 'Put', 'Call'].map(value => ({ value, label: value === 'All' ? 'All types' : `Short ${value.toLowerCase()}s` }))} />
        <Picker label="Expiration" value={expiry} onChange={v => { setExpiry(v); setPage(0); }} choices={[{ value: 'All', label: 'All expirations' }, ...expiryList.map(value => ({ value, label: date(value) }))]} />
        <Picker label="Currency" value={currency} onChange={v => { setCurrency(v); setPage(0); }} choices={['All', ...currencyList].map(value => ({ value, label: value === 'All' ? 'All currencies' : value }))} />
        <Button variant="outline" onClick={() => { setQuery(''); setType('All'); setExpiry('All'); setCurrency('All'); setPage(0); }}>Reset filters</Button>
      </div>
      <div className="result-summary"><b>{filtered.length} matching positions</b><span>Signed statement value: {money(filtered.reduce((s, o) => s + o.statement_mark_usd, 0))}</span></div>
      <Table><TableHeader><TableRow><TableHead>Option / expiration</TableHead><TableHead>Type / size</TableHead><TableHead className="num">Strike</TableHead><TableHead className="num">Statement value<br />7 Sep 2026 · USD</TableHead><TableHead>Value at expiration</TableHead><TableHead>If fully exercised / assigned</TableHead><TableHead><span className="sr-only">Details</span></TableHead></TableRow></TableHeader><TableBody>
        {filtered.slice(page * pageSize, (page + 1) * pageSize).map(o => { const t = optionTerms(o); const p = parseScenarioPrice(prices[o.id] ?? ''); const s = p === null ? null : expirationScenario(o, p); return <TableRow key={o.id} className={o.id === selectedId ? 'option-selected' : ''}>
          <TableCell className="option-name"><strong>{o.underlying}{o.adjustment_source ? ' · adjusted' : ''}</strong><span>{date(o.expiration)}</span>{o.expiration<=optionsData.statement_date&&<span className="negative-text">Expiry reached · settlement unconfirmed</span>}<span>{o.market_label} · p. {o.printed_page}</span></TableCell>
          <TableCell className="wrap">{o.signed_contracts<0?'Short':'Long'} {o.type.toLowerCase()}<span className="option-sub">{number(t.contracts)} × {number(o.shares_per_contract)} shares</span>{o.cash_per_contract > 0 && <span className="option-sub">+ cash adjustment</span>}{o.coverage_remark && <span className="option-sub">Marked covered</span>}</TableCell>
          <TableCell className="num">{money(o.strike, o.currency)}</TableCell><TableCell className="num negative-text">{money(o.statement_mark_usd)}</TableCell>
          <TableCell className="wrap option-table-detail">{s ? <><strong>{money(s.signedValue, o.currency)}</strong><span className="option-sub">At assumed share price {money(p!, o.currency)}</span></> : <><strong>Price-dependent</strong><span className="option-sub">Zero intrinsic at {o.type === 'Put' ? 'or above' : 'or below'} {money(t.threshold, o.currency)}</span></>}</TableCell>
          <TableCell className="wrap option-table-detail">{o.signed_contracts>0?'Holder may exercise':o.type === 'Put' ? 'Pay' : 'Receive'} {o.signed_contracts>0?'':money(t.grossStrikeCash, o.currency)}<span className="option-sub">{o.signed_contracts>0?'No assignment liability for the holder':`${o.type === 'Put' ? 'Receive' : 'Deliver'} ${number(t.shares)} ${o.deliverable_symbol} shares${o.cash_per_contract > 0 ? ` + ${money(t.deliverableCash, o.currency)} cash` : ''}`}</span></TableCell>
          <TableCell><Button variant="outline" onClick={() => selectOption(o.id, true)} aria-label={`Explain ${optionLabel(o)}`}>Explain</Button></TableCell>
        </TableRow>; })}
      </TableBody></Table>
      {filtered.length === 0 && <p className="empty">No options match. Try another symbol or reset the filters.</p>}
      <div className="paginationbar"><p aria-live="polite">{filtered.length ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} of ${filtered.length} positions` : 'No matching positions'}</p><div className="option-paging"><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button><span>{page + 1} / {pages}</span><Button variant="outline" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next</Button></div></div>
    </section>

    <div className="option-detail-grid">
      <section className="panel"><p className="eyebrow">PUT ASSIGNMENT · GROSS CASH BY CURRENCY</p><h2>All {shortPuts.length} listed short puts</h2><p className="subtitle">Full strike payments if every short put were assigned. This is a contractual scale measure, not a forecast that all positions will be assigned together. Calls are excluded.</p>
        <Table><TableHeader><TableRow><TableHead>Currency</TableHead><TableHead className="num">Put positions</TableHead><TableHead className="num">Gross strike payments</TableHead></TableRow></TableHeader><TableBody>{currencyList.map(c => { const rows = puts.filter(o => o.currency === c); return <TableRow key={c}><TableCell>{c}</TableCell><TableCell className="num">{rows.length}</TableCell><TableCell className="num">{money(rows.reduce((s, o) => s + optionTerms(o).grossStrikeCash, 0), c)}</TableCell></TableRow>; })}</TableBody></Table>
        <p className="note below">These are separate currencies, not one combined cash bill. They do not net against cash holdings, collateral, stock values or premiums. This is not a maximum portfolio loss or a simultaneous funding forecast.</p>
      </section>
      <section className="panel"><p className="eyebrow">DATES IN THE STATEMENT</p><h2>Expiration schedule</h2><Table><TableHeader><TableRow><TableHead>Expiration</TableHead><TableHead className="num">Puts</TableHead><TableHead className="num">Calls</TableHead><TableHead className="num">Contracts</TableHead></TableRow></TableHeader><TableBody>{expiryList.map(e => { const rows = options.filter(o => o.expiration === e); return <TableRow key={e}><TableCell>{date(e)}</TableCell><TableCell className="num">{rows.filter(o => o.type === 'Put').length}</TableCell><TableCell className="num">{rows.filter(o => o.type === 'Call').length}</TableCell><TableCell className="num">{number(rows.reduce((s, o) => s + Math.abs(o.signed_contracts), 0))}</TableCell></TableRow>; })}</TableBody></Table><p className="note below">Puts and calls count positions; contracts count absolute units. These are original expiry dates, not evidence the positions remained open until then.</p></section>
    </div>
    <section className="panel"><p className="eyebrow">HOW THE CALCULATIONS WORK</p><h2>Value, delivery and assignment are different</h2><div className="guidegrid">
      <div><h3>Expiration value</h3><p>Compare the strike payment with the value of the deliverable. A put has intrinsic value when the deliverable is worth less; a call when it is worth more. Multiply by the contract count and show a negative value for a short position. <a href="https://www.optionseducation.org/optionsoverview/options-pricing" target="_blank" rel="noreferrer">OIC pricing ↗</a></p></div>
      <div><h3>Assignment timing</h3><p>An American-style option can be exercised before expiration. In-the-money status does not guarantee assignment, and zero intrinsic value does not rule it out. The statement does not specify each series’ exercise style. <a href="https://www.optionseducation.org/optionsoverview/exercising-options" target="_blank" rel="noreferrer">OIC exercise and assignment ↗</a></p></div>
      <div><h3>Contract sizes and FX</h3><p>Sizes come from the source descriptions and reconcile to the option subtotal. <a href="https://www.eurex.com/ex-en/markets/equ/equ-opt/options/Givaudan-952004" target="_blank" rel="noreferrer">Eurex GIVN ↗</a> uses 10 shares; <a href="https://www.hkex.com.hk/Products/Listed-Derivatives/Single-Stock/Stock-Options?sc_lang=en" target="_blank" rel="noreferrer">HKEX ↗</a> sizes vary. USD scenario equivalents hold the statement’s printed exchange rates fixed.</p></div>
    </div></section>
  </div>;
}

