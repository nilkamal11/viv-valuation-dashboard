# Updated holdings extraction and reconciliation

Statement: 23 August 2026. Inventory source: printed pages 6-57 (physical PDF pages 7-58) of the 69-page replacement statement. Source document and all intermediate files remain outside the public dashboard.

336 rows are included: 23 cash accounts, 8 fixed advances, 299 securities/instruments and 6 precious-metal accounts. Newly assigned holding IDs follow source order and replace the prior snapshot IDs.

All 16 detailed section totals reconcile exactly to the cent. Principal/market values total USD 8,299,753.50; separately reported accrued interest totals USD 3,652.76; combined net total USD 8,303,406.26 matches the statement portfolio total.

| Detailed section | Rows | Principal / market value USD | Accrued interest USD | Difference from printed section subtotal USD |
|---|---:|---:|---:|---:|
| Accounts (Liquidity) | 23 | 1,297,906.02 | -1,108.11 | 0.00 |
| Fixed advances (Credit) | 8 | -4,799,636.16 | -756.96 | 0.00 |
| Bonds | 1 | 290,092.17 | 4,278.70 | 0.00 |
| Bond funds | 2 | 419,012.88 | 0.00 | 0.00 |
| Equities | 94 | 4,592,421.89 | 0.00 | 0.00 |
| Equity funds | 19 | 1,913,930.50 | 0.00 | 0.00 |
| Structured products equities (Equities) | 18 | 2,569,895.39 | 1,239.13 | 0.00 |
| Hedge funds | 2 | 448,978.97 | 0.00 | 0.00 |
| Private equity | 3 | 1,019,249.33 | 0.00 | 0.00 |
| Real estate investment fund (Real estate participations) | 1 | 249,008.00 | 0.00 | 0.00 |
| Precious metal accounts (Commodities/metals) | 6 | 0.00 | 0.00 | 0.00 |
| Commodities fund (Commodities/metals) | 3 | 150,491.04 | 0.00 | 0.00 |
| Options (Derivatives) | 147 | -409,635.79 | 0.00 | 0.00 |
| Warrants (Derivatives) | 2 | 7,086.79 | 0.00 | 0.00 |
| Structured products | 5 | -28,137.33 | 0.00 | 0.00 |
| Mixed investment funds (Others) | 2 | 579,089.80 | 0.00 | 0.00 |

## Field definitions and boundaries

- `section` follows the detailed instrument sections, which are distinct from the statement overview fund/look-through allocation.
- `value_usd` is principal or market value before separately reported accrued interest. `total_value_usd` adds that interest and reconciles to the portfolio net total.
- Source n.a. valuations remain null. No zero price or zero weight is used to replace a missing valuation.
- `statement_weight_pct` preserves printed rounded weights; it is not a recalculation from principal alone.
- `quantity_basis` preserves Units, Nominal value, or Units / nominal value. Structured derivative quantities do not establish a daily share count or maximum future obligation.
- `price_date` is the date shown below Current price. `maturity_date` is read directly from Final maturity or Expiry. Source dates are preserved even where prices predate the statement or loan terms begin after its date.
- Cash/loan entries omit account identifiers; repeated generic names represent separate source rows. Conventional public ISINs are retained, but internal/nonstandard YY/XD identifiers are omitted.

## Missing data and validation

- No unparsed holding rows were identified. Mining and Metallurgical Company NORILSK NICKEL PJSC on printed p20 retains its n.a. value, 2,500 units and price date 26 December 2025. It has null `value_usd` and `total_value_usd`.
- All rows have source weight values. All securities/instruments have current-price dates. Every options, warrants, equity-structured-note and structured-derivative row has a source maturity/expiry date.
- Every included conventional ISIN passes its check digit. Public JSON passes scans for client/account/IBAN and internal security identifiers.
- Financial validation: all 16 section subtotals, all four separately printed interest totals, and the net portfolio total reconcile.
- Visual validation: both loan pages (including two separate GBP advances), the three private-equity rows, unavailable-value equity row, the revised structured derivative rows, and the Barclays bond row were reviewed from the PDF.

## Material replacement details for downstream components

- Eight loan rows, including two GBP advances; 147 option rows; 18 equity-linked structured notes; five structured derivatives (four accumulators plus one FX TARF).
- GLD accumulator now states level 368.1259, KO 425.4641 and maturity 7 September 2027. The previous snapshot MSFT accumulator with level 400.136 / KO 462 is not present.
- Climate Impact private fund reports EUR 207,519 called, 69.17% of the EUR 300,000 initial commitment; see newprivate_equity.json. No remaining callable commitment is inferred.
- Barclays current quote is 106.47%, dated 21 August 2026; modified duration 4.08 and Ytm/ytc 6.74%; see bond_details.json. Historical hardcoded quote/duration/yield values must be replaced.

## Output files

- newholdings.json: full normalized replacement inventory and reconciliation checks.
- newprivate_equity.json: source commitment/called/distribution fields with explicit n.a. versus blank status.
- bond_details.json: exact current source Barclays quote, coupon, nominal amount, ratings, yield and duration.
