# Exposure overlap and return drivers

Statement date: 23 August 2026. Research date: 7 September 2026. The underlying statement data are unchanged.

## Company and fund identities

`underlying-map.json` maps 299 security/instrument rows. The other 37 account, advance and precious-metal-account rows are explicitly excluded from the company map. All 336 statement rows remain accounted for. Public tickers, ISINs and source description evidence support the identities. Distinct share classes and ADRs can share a company key, but raw share quantities are never aggregated across them. APQ maps to SAP, ASM2 to ASML and 2FE to Ferrari using exchange evidence. Fund vehicles remain distinct even where they track similar markets: for example IWM versus VTWO and SLV versus SIVR.

The report's default option scope is expiration after the statement date: 113 options. The optional historical view includes the 34 expiry-reached rows without claiming they remain open. Put columns show gross conditional strike cash at statement FX, not current delta exposure, loss or a simultaneous funding requirement. Calls remain delivery obligations and are not treated as full-share-value hedges.

Direct share/fund values, put purchase cash, whole-note values and accumulator counts are separate measures. A note referencing three companies is linked to all three; its entire value is context for that link and is not allocated to each company or summed across company rows. Issuer totals count each structured note once, separately from reference-underlying exposures. The two unnamed baskets remain unresolved and together carry $293,030 in note value. Nornickel's unavailable valuation remains unavailable in the UI.

The default map identifies 48 names with multiple routes and 17 with at least three routes. These counts include documented, partial fund links at their actual disclosure dates. They are not a comprehensive statement-date concentration or diversification score. The six selected theme clusters are analyst-defined review groups, not complete sector allocations; they count a position once within a group but can overlap across groups. Only the explicitly software-focused fund is included as a whole fund in the software cluster, avoiding allocation of a broad technology fund entirely to software.

## Fund disclosure coverage

`fund-map.json` covers all 32 pooled vehicles, with statement values totaling $4,779,760.52. Four have 38 named constituent/issuer entries from dated official disclosures:

- Vanguard S&P 500 ETF: ten security entries, 36.31% of fund NAV, 30 June 2026.
- CSOP Hang Seng TECH ETF: ten holdings, 70.24% of fund NAV, 31 December 2025.
- Blue Whale: ten named holdings, 60.3% combined, 31 December 2025; no invented individual weights.
- Franklin Income: eight company issuers, 14.33% of fund assets, 31 July 2026. These mixed-instrument issuer weights are explicitly not equity-only weights. Other government issuers in its disclosure are not represented as companies.

The remaining 28 vehicles have no named constituents in this report. No post-statement fund weights are used, and no old fund weight is multiplied by the statement's fund value and added to direct shares. Missing constituents are unknown, not zero. Source URLs, dates, coverage and instrument-basis qualifications remain in the public data.

## Return attribution and benchmark

`return-analysis.json` preserves official iShares ACWI ETF USD NAV total returns for 2019–2025 and H1 2026. This is one consistent conventional, unleveraged global-equity reference series after fund expenses and reinvested distributions. It excludes personal tax, brokerage and investor advisory/custody charges. It is a reference for context, not the portfolio's agreed mixed-asset benchmark or a measure of alpha.

Every compared period matches exactly. H1 2026 compares the statement's 30 June cumulative return of 11.63% with 11.64% for ACWI. No August-end benchmark is compared with the statement's 23 August cutoff. Growth charts compound the rounded annual returns and exclude external deposits and withdrawals; they are hypothetical values, not historical account balances.

The bank's 2026 asset-class contributions add to 17.64 percentage points. Equities contribute 12.79 points; derivatives 4.33; credit minus 0.81; FX minus 1.88. The page separately reconciles the $1,318,979.31 dollar investment gain. Neither view isolates stock selection, the incremental effect of borrowing, or short-put trading profit. Debit interest and the stated expense line are already deducted; adding them back is not an unleveraged counterfactual. Current leverage cannot reconstruct historical financed exposures.

The 2022 loss is an annual return, not peak-to-trough drawdown. Its cause requires historical positions, financing, cash flows and trades. The global-equity comparison shows outcomes while preserving those attribution limits.

## Validation

Checks cover source identity, mapping coverage, canonical fund keys, later-expiry put reconciliation, note issuer totals, unavailable values, nonadditive basket treatment, theme membership, benchmark periods and compounded returns. Independent review checked the financial interpretation. Server rendering was checked for the new pages; no browser interaction testing is claimed.
