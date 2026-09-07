# VIV Portfolio Statement Explorer

A public, descriptive dashboard for understanding the supplied LGT statement of assets dated 30 July 2026, in USD.

The dashboard provides allocation, searchable holdings, dedicated Bonds and Options sections, cash and borrowing, reported performance, sanitized activity and a reading guide. It does not use live prices or recommend transactions.

## Source and coverage

The source PDF has 302 physical pages (printed pages 0–301). References throughout use the printed numbering. The original PDF and raw extraction are intentionally excluded from this repository.

- 309 inventory entries across 16 detailed sections, including cash, loans and zero balances.
- 2,302 dated activity entries, represented by 2,365 currency-leg rows. These are not unique trade counts.
- 157 estimated interest payments in the source schedule. These are estimates as of the statement date, not confirmed receipts.
- Allocation and performance are transcribed from printed pages 1–4. Fund look-through allocation differs from the detailed instrument categories.

Every detailed section subtotal reconciles to the cent. Known market/principal values of $7,719,886.64 plus $5,214.55 accrued interest reconcile to $7,725,101.19. An unavailable NORILSK NICKEL valuation remains null, not zero. The performance section uses $7,721,187.37; its $3,913.82 difference from the asset total is displayed without an invented explanation.

Client and account numbers, IBANs, private payment names, internal transaction references, and nonstandard internal security identifiers are excluded. Public security identifiers and instrument names are retained. Financial figures are public by the owner's explicit request.

## Run

Use Node.js 22 LTS (22.13 or newer within 22.x). The Windows Node.js 24 runtime encountered a native shutdown assertion after static rendering; Node.js 22 completes successfully. Install with `npm ci`, start with `npm run dev`, and build with `npm run build`. `node --experimental-strip-types scripts/check-data.mjs` checks arithmetic, source counts, null handling and public-data patterns. `npx tsc --noEmit` checks types.

Source records are in `data/holdings.json` and `data/activity.json`. Summary values and source-page map are in `lib/portfolio.ts`. Do not replace unavailable values with zero or combine native-currency amounts. Keep separately listed accrued interest distinct from principal.

## Options

`data/options.json` expands all 110 entries from the printed Options section (pp. 36–50): 102 short puts and 8 short calls, totaling 649 contracts and a signed statement mark of -$394,831.31. All eight calls have explicit source coverage remarks. A coverage remark is historical; no inference is made about later coverage or put collateral. Exact applied FX comes from printed p. 53. Every option quote multiplied by its signed quantity, valuation multiplier and FX reconciles to the source mark to the cent.

The Options tab includes contract terms, the dated option quote/position mark, editable expiration scenarios, an option-liability chart, full-assignment cash/share obligations, filters, an expiration schedule and gross put strike payments separated by currency. Scenario prices are optional, per contract and temporary. No underlying spot or live quote is invented, and actual outcomes after July 30 are unknown. Warrants and structured products are outside this ordinary-option calculator.

`lib/options.ts` keeps strike/premium multipliers separate from share deliverables. The expiration calculation compares the aggregate strike payment with the value of delivered shares plus any fixed deliverable cash, applies the call/put direction, floors intrinsic value at zero, and gives short positions a negative signed option value. The threshold is an intrinsic-value threshold, not a premium-adjusted break-even price. Calculations exclude opening premium, fees, taxes, dividends, collateral offsets and subsequent FX changes; they are not total trade P/L or margin requirements.

FUBO1 is adjusted: each contract has multiplier 100 and delivers 8 FUBO shares plus $4.40 fixed cash, per [OCC memo 58712, April 6, 2026](https://infomemo.theocc.com/infomemos?number=58712). The 13 short $2.50 puts therefore require $3,250 gross cash on full assignment, receiving 104 shares and $57.20 cash. Their intrinsic threshold is a $30.70 FUBO share price. The displayed suffix 8 must not be used as the strike multiplier. GIVN uses 10 shares, and HK9999 uses 500.

General mechanics are referenced to the [OIC pricing guide](https://www.optionseducation.org/optionsoverview/options-pricing), [OIC exercise/assignment guide](https://www.optionseducation.org/optionsoverview/exercising-options), [Eurex Givaudan specifications](https://www.eurex.com/ex-en/markets/equ/equ-opt/options/Givaudan-952004) and [HKEX stock option specifications](https://www.hkex.com.hk/Products/Listed-Derivatives/Single-Stock/Stock-Options?sc_lang=en). Source rows do not specify each series' exercise style. Assignment figures model physical delivery from the printed contract sizes, with the documented FUBO1 adjustment. They do not claim to predict assignment or verify subsequent contract amendments. At-the-money or out-of-the-money status does not rule out assignment.

The data checks cover every option's source identity, quantities, dates and quote reconstruction; direction and threshold behavior for all 110 contracts; adjusted FUBO1 cash/share accounting; GIVN/HK size exceptions; and invalid scenario inputs. Independent formula review also covered standard puts/calls and zero-price outcomes.

The UI uses Vinext, React and the generated Shadcn/Base UI components. Sites hosting settings are in `.openai/hosting.json`. Static output is generated by the framework. The optional `SITE_BASE_PATH` environment variable supports hosting below a repository path.

## Validation limits

Data checks include section totals, page counts, sampled source comparisons and identifier patterns. Sampled PDF pages were visually inspected. This is not a visual check of every source row. The full sustainability graphics, original contract terms, full bank footnotes remain in the source document.

An optional `explore_portfolio_holdings` WebMCP tool uses the same search and section controls. Its browser contract has not been tested in a supported WebMCP context.
