import { describe, expect, it } from 'vitest';
import { GOUGE_RATIO, evaluate, isPokemonTcg, matchProduct, shouldAct } from './matcher';
import type { ProductInfo } from './types';

describe('isPokemonTcg', () => {
  it('matches Pokémon with the accent', () => {
    expect(isPokemonTcg('Pokémon TCG: Surging Sparks Booster Bundle')).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(isPokemonTcg('POKEMON Booster Box')).toBe(true);
  });

  it('rejects unrelated products', () => {
    expect(isPokemonTcg('Logitech Wireless Mouse')).toBe(false);
  });
});

describe('matchProduct', () => {
  it('matches an Elite Trainer Box by its full name', () => {
    expect(matchProduct('Pokemon Scarlet & Violet Elite Trainer Box')?.category).toBe(
      'elite-trainer-box',
    );
  });

  it('matches by the ETB abbreviation', () => {
    expect(matchProduct('Pokemon Surging Sparks ETB')?.category).toBe('elite-trainer-box');
  });

  it('prefers Ultra Premium Collection over the generic collection-box entry', () => {
    expect(matchProduct('Pokemon Ultra Premium Collection Box')?.category).toBe(
      'ultra-premium-collection',
    );
  });

  it('prefers Super Premium Collection over Premium Collection', () => {
    expect(matchProduct('Pokemon Super Premium Collection')?.category).toBe(
      'super-premium-collection',
    );
  });

  it('distinguishes Booster Box from Booster Bundle', () => {
    expect(matchProduct('Pokemon Surging Sparks Booster Box')?.category).toBe('booster-box');
    expect(matchProduct('Pokemon Surging Sparks Booster Bundle')?.category).toBe(
      'booster-bundle',
    );
  });

  it('prefers Mini Tin over Tin', () => {
    expect(matchProduct('Pokemon Mini Tin')?.category).toBe('mini-tin');
  });

  it('returns null when no product type matches', () => {
    expect(matchProduct('Pokemon Plush Pikachu Toy')).toBeNull();
  });
});

describe('evaluate', () => {
  const MSRP = 26.94; // Booster Bundle
  const sample = (multiplier: number, title = 'Pokemon Booster Bundle'): ProductInfo => ({
    title,
    price: MSRP * multiplier,
    thirdParty: null,
  });

  it('returns ok when priced at MSRP', () => {
    expect(evaluate(sample(1))?.status).toBe('ok');
  });

  it('returns over-msrp when priced just above MSRP', () => {
    expect(evaluate(sample(1.1))?.status).toBe('over-msrp');
  });

  it('flags gouging at exactly the 150% threshold', () => {
    expect(evaluate(sample(GOUGE_RATIO))?.status).toBe('gouging');
  });

  it('computes the correct ratio', () => {
    expect(evaluate(sample(2))?.ratio).toBeCloseTo(2);
  });

  it('returns null for non-Pokémon titles', () => {
    expect(evaluate({ title: 'Booster Bundle', price: 999, thirdParty: null })).toBeNull();
  });

  it('returns null when no MSRP entry matches', () => {
    expect(evaluate({ title: 'Pokemon Plush Pikachu', price: 999, thirdParty: null })).toBeNull();
  });

  it('returns null when price is missing', () => {
    expect(
      evaluate({ title: 'Pokemon Booster Bundle', price: null, thirdParty: null }),
    ).toBeNull();
  });
});

describe('shouldAct', () => {
  const base: ProductInfo = { title: 'Pokemon Booster Bundle', price: 50, thirdParty: null };

  it('acts when over MSRP and the seller is unknown', () => {
    expect(shouldAct(evaluate(base)!)).toBe(true);
  });

  it('acts when over MSRP and the seller is confirmed third-party', () => {
    expect(shouldAct(evaluate({ ...base, thirdParty: true })!)).toBe(true);
  });

  it('does not act when the seller is confirmed first-party', () => {
    expect(shouldAct(evaluate({ ...base, thirdParty: false })!)).toBe(false);
  });

  it('does not act when status is ok', () => {
    expect(shouldAct(evaluate({ ...base, price: 26.94 })!)).toBe(false);
  });
});
