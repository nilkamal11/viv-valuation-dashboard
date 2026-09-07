# Holdings extraction and reconciliation

Source: statement of assets dated 30 July 2026, reference currency USD. Inventory covers printed pages 5-53 (physical PDF pages 6-54), ending before Exchange rates applied. The first mixed investment fund on page 52 continues with one additional fund and the section subtotal on page 53.

309 source rows were retained: 23 cash accounts, 7 fixed advances, 273 security/instrument rows and 6 precious-metal accounts. Original account, client and portfolio identifiers, IBANs and internal/nonstandard YY/XD security identifiers are omitted. The original PDF and raw extraction remain outside the public site. Generic holding IDs are newly generated sequential IDs.

## Verified reconciliation

Every one of the 16 detailed section subtotals matches exactly to the cent. Numeric principal/market values sum to USD 7,719,886.64; separately reported accrued interest adds USD 5,214.55; combined total is USD 7,725,101.19, matching the asset allocation/portfolio overview total.

| Detailed section | Rows | Principal / market value USD | Accrued interest USD | Subtotal difference USD |
|---|---:|---:|---:|---:|
| Accounts (Liquidity) | 23 | 616,105.64 | -1,107.78 | 0.00 |
| Fixed advances (Credit) | 7 | -4,719,719.39 | -123.68 | 0.00 |
| Bonds | 1 | 284,456.07 | 2,750.36 | 0.00 |
| Bond funds | 2 | 417,460.99 | 0.00 | 0.00 |
| Equities | 104 | 4,626,323.99 | 0.00 | 0.00 |
| Equity funds | 18 | 1,685,799.24 | 0.00 | 0.00 |
| Structured products equities (Equities) | 19 | 2,866,589.49 | 3,695.65 | 0.00 |
| Hedge funds | 2 | 451,362.81 | 0.00 | 0.00 |
| Private equity | 3 | 979,466.37 | 0.00 | 0.00 |
| Real estate investment fund (Real estate participations) | 1 | 251,510.72 | 0.00 | 0.00 |
| Precious metal accounts (Commodities/metals) | 6 | 0.00 | 0.00 | 0.00 |
| Commodities fund (Commodities/metals) | 3 | 123,506.04 | 0.00 | 0.00 |
| Options (Derivatives) | 110 | -394,831.31 | 0.00 | 0.00 |
| Warrants (Derivatives) | 2 | 6,107.92 | 0.00 | 0.00 |
| Structured products | 6 | -50,775.08 | 0.00 | 0.00 |
| Mixed investment funds (Others) | 2 | 576,523.14 | 0.00 | 0.00 |

## Field definitions and limits

- `section` reproduces the detailed instrument section. These categories differ from the statement overview, which applies fund allocations/look-through. Do not label sums of these sections as the overview asset allocation.
- `value_usd` is the reported principal or market value before separately reported accrued interest. `total_value_usd` adds `accrued_interest_usd` and is the field that reconciles to the overview net total. Retain null for unavailable value.
- `statement_weight_pct` is transcribed as printed; weights are rounded and can reflect accrued interest. It is not recomputed from principal alone.
- `quantity` and `quantity_basis` reproduce units or nominal amount. Do not treat nominal amounts on bonds/structured products as share counts. Cash and loans instead have `balance_in_currency`.
- `price_date` is the date under Current price, not the purchase date, report generation date, or statement date. 36 cash, loan and metal-account rows have no price date. Some fund and security prices predate 30 July 2026.
- `maturity_date` and loan `term_start` are terms as stated in this historical snapshot. They do not imply the position remained open or matured as scheduled after the statement date.
- Names follow the statement, with line-wrap hyphens repaired. `description` retains full instrument detail such as classes, contract terms and underlyings. Search/display descriptions to distinguish instruments that share an issuer.
- Conventional ISINs were retained and all included ISIN check digits passed. This checks identifier structure, not external identity or the bank valuation.

## Data gaps

- No unparsed holding/loan rows were identified within the inventory pages. One equity has a reported n.a. value: Mining and Metallurgical Company NORILSK NICKEL PJSC, 2,500 units, printed page 20, price date 26 December 2025. It is retained with `value_usd: null`, `total_value_usd: null`, and the printed weight 0.00%. It must appear as unavailable, not a verified zero.
- Private/nonstandard internal security identifiers for OCC contracts, structured derivatives and one hedge fund are intentionally omitted. Contract descriptions still distinguish those holdings.
- Transaction history, return evaluation, scenario analysis, purchase prices, private-equity capital commitments and look-through calculations are outside this inventory extract.

## Validation performed

Coordinate-based extraction from each inventory page; complete section and net-total arithmetic; visual inspection of a representative equity page and cropped loan, unavailable-value and private-equity evidence; full readable-name/date review; seven loan rates and terms checked against source columns; ISIN check digits; privacy pattern scan of the public JSON. Loan rates are CAD 3.25%, CHF 1.10%, DKK 2.98%, EUR 3.40%, GBP 4.89%, HKD 3.86%, and JPY 2.00%.
