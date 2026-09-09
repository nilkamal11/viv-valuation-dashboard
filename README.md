# VIV Portfolio Statement Explorer

Public dashboard updated from the **7 September 2026** LGT statement (57 pages). The original PDF and private client, account, and payment identifiers are not included.

## Current LGT snapshot

- Net portfolio value: **USD 8,209,050.84**
- Bank-reported 2026 return through 7 September: **16.01%**
- Credit/borrowing allocation: **USD -4,936,055.97**
- Equity allocation: **USD 9,353,298.78**, or **113.94%** of net value
- 298 detailed holdings across 16 instrument sections
- 106 listed options: 96 puts and 10 calls; one call is long
- Four 2x structured contracts: three equity accumulators and one USD/JPY TARF

Every instrument-section subtotal reconciles to the statement. Known values plus accrued interest equal the same USD 8,209,050.84 ending value reported in the performance section. One NORILSK NICKEL valuation remains unavailable rather than being treated as zero.

The replacement statement does not include a transaction ledger, future-interest schedule, historical annual-return table, or holding-level performance attribution. The dashboard marks those areas as not supplied and does not carry forward older statement values.

## Pages

The dashboard includes the LGT overview, holdings, bonds, options, borrowing, performance, risk analysis, exposure overlap, return-driver questions, an itemized risk-reduction plan, and a USD 2 million borrowing-reduction illustration. Separate Standard Chartered and TCG QCAM pages remain isolated from the LGT totals.

Source references use the statement’s printed page numbers. Detailed holdings and borrowing are on pp. 4–52; options on pp. 36–50; leveraged structured contracts on pp. 51–52; performance on pp. 2–3.

Run `node scripts/check-data.mjs` and `npx tsc --noEmit` to verify the current dataset and application types.
