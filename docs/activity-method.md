# Activity extraction notes

This is an inventory of the statement as of **30 July 2026**, not an investment assessment. `activity.json` is the sanitized dashboard input. Raw extracts and the original PDF are not public dashboard inputs.

## Coverage and counts

The transaction section covers printed pages 61-297 and states a period of 1 January-30 July 2026. The first actual dated entry is 2 January; the last is 30 July. Printed page 65 contains only footnotes.

There are **2,302 dated statement entries**. This is not a count of unique transaction events: a corporate action can occupy several dated rows. There are **2,365 currency-leg rows** in the published-ready `rows` array because each of the 61 foreign-exchange and 2 OTC entries has two legs.

| Statement category | Dated entries |
|---|---:|
| Deposits | 9 |
| Withdrawals | 5 |
| Deliveries in/out | 190 |
| Buys | 129 |
| Sells | 476 |
| Foreign exchange | 61 |
| OTC | 2 |
| Credit | 410 |
| Corporate actions | 1,020 |

Month counts are January 347, February 209, March 343, April 306, May 293, June 459, and July 345. These count dated entries, not currency legs.

Currency-leg counts are USD 1,734; EUR 136; HKD 113; JPY 100; CHF 96; GBP 87; CAD 79; DKK 18; SEK 1; AUD 1.

## Validation

- All 236 transaction-bearing pages have identical date-anchor counts in the independent layout-text and PDF-coordinate extractions.
- Each dated entry has exactly one native-currency amount, except FX and OTC, where each has exactly two currency/amount legs.
- Eight printed transaction section totals reconcile exactly in the statement's displayed USD-equivalent column: deposits, withdrawals, deliveries, buys, sells, OTC, credit, and corporate actions. There was no printed section total identified for foreign exchange. All available differences are $0.00.
- Buys and withdrawals have no positive native amounts; sells and deposits have no negative native amounts.
- Entries with zero cash amounts are retained. They may represent security deliveries, expirations, assignments, or other corporate-action bookkeeping.

## Further information and interest estimate

Printed page 53 contains the end of the mixed-investment-fund holdings table, followed by exchange rates and duration. Duration continues on page 54. Pages 55-59 contain estimated interest payments; page 60 contains sustainability analysis and explanatory text.

The estimated-interest table contains **157 scheduled payments** from 6 August 2026 through 14 July 2027. Its displayed USD-equivalent total **$279,299.95** matches the printed total exactly. The native amounts, kept separate, are USD 253,549.93 (150 rows), GBP 16,750.00 (4), and HKD 25,555.56 (3). The estimate is as of the statement date, not realized income or guaranteed payment. Identical printed designations can identify different securities; `instrument_designation_count` counts labels, not unique instruments.

No loan-maturity, commitment, or capital-call schedule was found in pages 53-60. This does not establish that no such obligations exist elsewhere. Credit activity does not establish current loan maturities. Sustainability chart values were not reliably available in extracted text and are not inferred or scored.

## Public data boundaries and interpretation

The transaction `rows` objects contain only date, statement category, sanitized instrument text, currency, native amount, and printed source page. Payment counterparties and all accompanying addresses are omitted; payment instruments read `Payment`. Credit instruments read `Fixed advance`, with contract numbers and date ranges omitted. Order numbers, account/client identifiers, IBANs, and internal security-change references are omitted. A final scan found none of the known private-name tokens, protected identifier labels, or long numeric reference tokens in instrument text.

Amounts are signed ledger amounts. Currency totals are kept separate and must not be treated as returns, profit, current exposure, or unique events. Statement USD equivalents are used for extraction reconciliation and estimated-interest presentation. The statement explains that transaction-time exchange rates are for performance-evaluation purposes and may differ from actual conversion rates.

The methods were structural PDF-coordinate extraction, independent text-count comparison, arithmetic reconciliation, and sampled column inspection. This was not a visual review of every transaction row.
