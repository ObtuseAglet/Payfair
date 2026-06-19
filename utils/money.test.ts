import { describe, expect, it } from 'vitest';
import { formatPrice, parsePrice } from './money';

describe('parsePrice', () => {
  it('parses a plain dollar amount', () => {
    expect(parsePrice('$26.94')).toBe(26.94);
  });

  it('parses thousands separators', () => {
    expect(parsePrice('$1,234.56')).toBe(1234.56);
  });

  it('picks the first price in surrounding text', () => {
    expect(parsePrice('Current price: $49.99 (was $99.99)')).toBe(49.99);
  });

  it('handles bare numbers without a dollar sign', () => {
    expect(parsePrice('Price 14.99 USD')).toBe(14.99);
  });

  it('handles whole-dollar amounts', () => {
    expect(parsePrice('$50')).toBe(50);
  });

  it('returns null for empty or missing input', () => {
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('no price here')).toBeNull();
  });
});

describe('formatPrice', () => {
  it('formats USD with two decimals', () => {
    expect(formatPrice(26.94)).toBe('$26.94');
    expect(formatPrice(1234.5)).toBe('$1,234.50');
  });
});
