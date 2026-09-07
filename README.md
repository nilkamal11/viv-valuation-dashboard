# VIV Portfolio dashboard

Public statement explorer updated from the **23 August 2026** LGT statement (69 PDF pages). All active data files derive from this replacement. The original PDF and client/account identifiers are not included.

- [Dashboard](https://viv-valuation-dashboard.nilkamals463352.chatgpt.site/)
- [Risk analysis](https://viv-valuation-dashboard.nilkamals463352.chatgpt.site/#risk)
- [Itemized risk reduction](https://viv-valuation-dashboard.nilkamals463352.chatgpt.site/#reduce-risk)
- [Exposure overlap](https://viv-valuation-dashboard.nilkamals463352.chatgpt.site/#exposure)
- [Return drivers and benchmark comparison](https://viv-valuation-dashboard.nilkamals463352.chatgpt.site/#return-drivers)
- [GitHub Pages mirror](https://nilkamal11.github.io/viv-valuation-dashboard/)

## Coverage

336 holdings entries across 16 sections reconcile to **USD 8,303,406.26**, including USD 3,652.76 accrued interest. One unavailable valuation remains null. Overview allocation is the bank's fund look-through view, distinct from instrument sections.

The options page covers 147 short positions, expiration scenarios and physical assignment obligations. The statement includes 34 positions whose expiry was already reached; settlement remains unconfirmed. The 113 later-expiry positions include 104 puts and nine explicitly covered calls. Later-expiry put gross strike payments equal USD 3,520,131.15 using statement FX, across different dates, not a simultaneous funding forecast or loss estimate. FUBO1 retains its OCC-adjusted 8-share plus USD 4.40 deliverable and multiplier of 100; the replacement lists two short contracts.

The risk report gives a qualitative **High** assessment based on borrowing, market exposure, contingent purchases and uncertain collateral/contract terms. The reduction page provides seven priorities, a loan repayment illustration and 180 individual position reviews. It separately displays the four accumulators and one currency TARF labeled 2×. Their marked values do not establish remaining obligations or executable exit costs.

Bonds, loans, private-fund commitments and performance are replaced from the new source. The performance end value, USD 8,311,117.32, is USD 7,711.06 higher than the reconciled holdings total; both are preserved. YTD time-weighted return is 17.64% through 23 August. Earlier months reported again in this statement use this replacement's values.

The replacement has **no transaction ledger**. The prior activity file is removed from the current source and bundle. Activity & income explains the gap and shows 144 estimated payments totaling USD 253,275.89, 10 September 2026–13 August 2027. They are estimates, not confirmed receipts. Existing Git history is retained.

## Data and methodology

Exposure overlap maps direct shares, funds, options, structured-note references and accumulators to company or fund identities. It reports 48 underlyings with multiple routes, including partial fund disclosures at their actual dates. It keeps direct values, conditional purchases and whole-note references separate. The return-drivers page compares matched annual returns with an unleveraged global-equity reference and distinguishes bank category attribution from unproven selection skill or strategy-level profit. See [the analysis methodology](docs/exposure-and-return-method.md) for coverage, sources and limitations.

All source references use printed pages; add one for the PDF viewer's physical page. Holdings: pp. 6–57. Options: pp. 35–55. Structured derivatives: pp. 56–57. FX: pp. 57–58. Estimated interest: pp. 59–63. Performance: pp. 2–5.

- `data/holdings.json`: normalized inventory and section reconciliation.
- `data/portfolio.json`: allocation, currencies, performance, source map and coverage.
- `data/options.json`: individual options, source terms, adjusted deliverables and FX audit.
- `data/structured_contracts.json`: five 2× contracts; unavailable obligations are null.
- `data/private_equity.json`, `data/bond_details.json`, `data/interest.json`: supporting schedules.
- `lib/risk.ts`, `lib/options.ts`: shared calculations, with limits explained in the UI.

No live prices, account connection, trading or messages to a lender. Public data omit names of clients, account/IBAN numbers and internal security identifiers. Conventional ISINs and instrument issuers remain. Financial mechanics link to primary investor-education sources in the dashboard.

## Run and validate

Use Node 22.13 or newer; Node 22 is the supported build runtime used in CI.

```text
npm ci
npm run dev
node --experimental-strip-types scripts/check-data.mjs
npx tsc --noEmit
npm run build
```

Checks cover source-date coherence, all section and overall totals, the performance bridge, adjusted option pricing/assignment math, expiry group separation, bond/interest totals, actual risk formulas and removal of obsolete activity. Validation includes PDF extraction, targeted source-page visual review, static checks and HTTP/build checks; it does not claim browser interaction testing.

GitHub Actions builds with `SITE_BASE_PATH=/viv-valuation-dashboard`, exports the prefixed homepage/RSC/assets and deploys GitHub Pages. Sites uses the existing project in `.openai/hosting.json` and a packaged static build. Both publications use the same committed source.
