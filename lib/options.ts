export type OptionPosition = {
  id: string;
  underlying: string;
  deliverable_symbol: string;
  type: 'Put' | 'Call';
  signed_contracts: number;
  strike: number;
  expiration: string;
  currency: string;
  shares_per_contract: number;
  strike_multiplier: number;
  cash_per_contract: number;
  statement_mark_usd: number;
  quoted_option_price: number;
  price_date: string;
  usd_per_currency: number;
  market_label: string;
  printed_page: number;
  coverage_remark: string | null;
  adjustment_source: string | null;
};

// Keep the strike/premium multiplier separate from the delivered share count.
// FUBO1 delivers 8 shares plus $4.40, while strike and premium use 100.
export function optionTerms(option: OptionPosition) {
  const contracts = Math.abs(option.signed_contracts);
  const shares = contracts * option.shares_per_contract;
  const grossStrikeCash = contracts * option.strike * option.strike_multiplier;
  const deliverableCash = contracts * option.cash_per_contract;
  const threshold = (option.strike * option.strike_multiplier - option.cash_per_contract) / option.shares_per_contract;
  return { contracts, shares, grossStrikeCash, deliverableCash, threshold };
}

export function expirationScenario(option: OptionPosition, sharePrice: number) {
  if (!Number.isFinite(sharePrice) || sharePrice < 0) throw new Error('Enter a finite, nonnegative share price.');
  const terms = optionTerms(option);
  const deliverableValue = terms.shares * sharePrice + terms.deliverableCash;
  const difference = option.type === 'Put'
    ? terms.grossStrikeCash - deliverableValue
    : deliverableValue - terms.grossStrikeCash;
  // Avoid a floating-point residual at the exact exercise threshold.
  const intrinsic = Math.max(0, Math.abs(difference) < 1e-8 ? 0 : difference);
  const signedValue = option.signed_contracts < 0 ? -intrinsic : intrinsic;
  return {
    ...terms,
    intrinsic,
    signedValue: signedValue === 0 ? 0 : signedValue,
    signedValueUsd: signedValue === 0 ? 0 : signedValue * option.usd_per_currency,
    inTheMoney: intrinsic > 0,
    deliverableValue,
  };
}

export function parseScenarioPrice(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1e9 ? number : null;
}
