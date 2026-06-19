const PRICE_PATTERN = /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;

export function parsePrice(input: string | null | undefined): number | null {
  if (!input) return null;
  const match = input.replace(/\s+/g, ' ').match(PRICE_PATTERN);
  if (!match?.[1]) return null;
  const value = Number.parseFloat(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

export function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
