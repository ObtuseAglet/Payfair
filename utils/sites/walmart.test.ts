// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { walmart } from './walmart';

describe('walmart adapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches walmart.com hostnames', () => {
    expect(walmart.matches('www.walmart.com')).toBe(true);
    expect(walmart.matches('walmart.com')).toBe(true);
    expect(walmart.matches('walmart.ca')).toBe(false);
  });

  it('parses a search result card', () => {
    document.body.innerHTML = `
      <div data-item-id="abc123">
        <span data-automation-id="product-title">Pokemon Surging Sparks Booster Bundle</span>
        <div data-automation-id="product-price">$29.99</div>
      </div>`;
    const node = walmart.findProducts(document)[0]!;
    expect(node.kind).toBe('card');
    expect(node.title).toBe('Pokemon Surging Sparks Booster Bundle');
    expect(node.price).toBe(29.99);
  });

  it('parses a product detail page sold by Walmart', () => {
    document.body.innerHTML = `
      <div>
        <h1 id="main-title">Pokemon Surging Sparks Elite Trainer Box</h1>
        <span itemprop="price">$49.99</span>
        <div data-testid="product-seller-info">Sold and shipped by Walmart.com</div>
        <button data-automation-id="atc">Add to cart</button>
      </div>`;
    const detail = walmart.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(detail.price).toBe(49.99);
    expect(detail.thirdParty).toBe(false);
    expect(detail.cartButton).not.toBeNull();
  });

  it('flags a marketplace seller on the detail page', () => {
    document.body.innerHTML = `
      <div>
        <h1 id="main-title">Pokemon Surging Sparks Booster Box</h1>
        <span itemprop="price">$249.99</span>
        <div data-testid="seller-name">Sold and shipped by ResellerCo</div>
      </div>`;
    const detail = walmart.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.thirdParty).toBe(true);
    expect(detail.sellerName).toBe('ResellerCo');
  });
});
