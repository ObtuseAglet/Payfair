// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { bestbuy } from './bestbuy';

describe('bestbuy adapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches bestbuy.com hostnames', () => {
    expect(bestbuy.matches('www.bestbuy.com')).toBe(true);
    expect(bestbuy.matches('bestbuy.com')).toBe(true);
    expect(bestbuy.matches('bestbuy.ca')).toBe(false);
  });

  it('parses a search result card', () => {
    document.body.innerHTML = `
      <ol>
        <li class="sku-item">
          <h4 class="sku-title"><a href="#">Pokemon Surging Sparks Elite Trainer Box</a></h4>
          <div data-testid="customer-price">$49.99</div>
        </li>
      </ol>`;
    const node = bestbuy.findProducts(document)[0]!;
    expect(node.kind).toBe('card');
    expect(node.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(node.price).toBe(49.99);
  });

  it('parses a product detail page sold by Best Buy', () => {
    document.body.innerHTML = `
      <div>
        <div class="sku-title"><h1>Pokemon Surging Sparks Elite Trainer Box</h1></div>
        <div data-testid="customer-price">$49.99</div>
        <div data-testid="seller-info">Sold by Best Buy</div>
        <button class="add-to-cart-button">Add to cart</button>
      </div>`;
    const detail = bestbuy.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(detail.price).toBe(49.99);
    expect(detail.thirdParty).toBe(false);
    expect(detail.cartButton).not.toBeNull();
  });

  it('flags a marketplace seller on the detail page', () => {
    document.body.innerHTML = `
      <div>
        <div class="sku-title"><h1>Pokemon Booster Box</h1></div>
        <div data-testid="customer-price">$299.99</div>
        <div data-testid="seller-info">Sold by Card Universe</div>
      </div>`;
    const detail = bestbuy.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.thirdParty).toBe(true);
    expect(detail.sellerName).toBe('Card Universe');
  });
});
