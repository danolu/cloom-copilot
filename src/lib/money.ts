// Display-only money formatting: stored amounts keep their ISO currency code
// (e.g. USD), but the UI shows the symbol (e.g. $4,210 instead of USD 4210).
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  $: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: '₵',
  KES: 'KSh ',
  ZAR: 'R',
};

export function formatMoney(amount: number, currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}
