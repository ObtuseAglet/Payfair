// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { target } from './target';

describe('target adapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches target.com hostnames', () => {
    expect(target.matches('www.target.com')).toBe(true);
    expect(target.matches('target.com')).toBe(true);
    expect(target.matches('target.com.au')).toBe(false);
  });

  it('parses a search result card', () => {
    document.body.innerHTML = `
      <div data-test="product-card">
        <a data-test="product-title">Pokemon Surging Sparks Booster Bundle</a>
        <div data-test="product-price">$29.99</div>
      </div>`;
    const node = target.findProducts(document)[0]!;
    expect(node.kind).toBe('card');
    expect(node.title).toBe('Pokemon Surging Sparks Booster Bundle');
    expect(node.price).toBe(29.99);
  });

  it('parses a product detail page sold by Target', () => {
    document.body.innerHTML = `
      <div>
        <h1 data-test="product-title">Pokemon Surging Sparks Elite Trainer Box</h1>
        <div data-test="product-price">$49.99</div>
        <div data-test="sellerName">Sold and shipped by Target</div>
        <button data-test="addToCartButton">Add to cart</button>
      </div>`;
    const detail = target.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(detail.price).toBe(49.99);
    expect(detail.thirdParty).toBe(false);
    expect(detail.cartButton).not.toBeNull();
  });

  it('flags a Target Plus partner as third-party', () => {
    document.body.innerHTML = `
      <div>
        <h1 data-test="product-title">Pokemon Booster Box</h1>
        <div data-test="product-price">$249.99</div>
        <div data-test="sellerName">Sold and shipped by Bargain Cards</div>
      </div>`;
    const detail = target.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.thirdParty).toBe(true);
    expect(detail.sellerName).toBe('Bargain Cards');
  });
});
