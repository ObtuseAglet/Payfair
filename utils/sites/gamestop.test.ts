// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { gamestop } from './gamestop';

describe('gamestop adapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches gamestop.com hostnames', () => {
    expect(gamestop.matches('www.gamestop.com')).toBe(true);
    expect(gamestop.matches('gamestop.com')).toBe(true);
    expect(gamestop.matches('gamestop.de')).toBe(false);
  });

  it('parses a search result tile', () => {
    document.body.innerHTML = `
      <div class="product-tile">
        <div class="product-tile-name">Pokemon Surging Sparks Elite Trainer Box</div>
        <span class="actual-price">$49.99</span>
      </div>`;
    const node = gamestop.findProducts(document)[0]!;
    expect(node.kind).toBe('card');
    expect(node.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(node.price).toBe(49.99);
  });

  it('parses a product detail page sold by GameStop', () => {
    document.body.innerHTML = `
      <div>
        <h1 class="product-name">Pokemon Surging Sparks Elite Trainer Box</h1>
        <span class="actual-price">$49.99</span>
        <div class="product-seller">Sold by GameStop</div>
        <button id="add-to-cart">Add to cart</button>
      </div>`;
    const detail = gamestop.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(detail.price).toBe(49.99);
    expect(detail.thirdParty).toBe(false);
    expect(detail.cartButton).not.toBeNull();
  });

  it('flags a marketplace seller on the detail page', () => {
    document.body.innerHTML = `
      <div>
        <h1 class="product-name">Pokemon Booster Box</h1>
        <span class="actual-price">$249.99</span>
        <div class="product-seller">Sold by FlipsAndCards</div>
      </div>`;
    const detail = gamestop.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.thirdParty).toBe(true);
    expect(detail.sellerName).toBe('FlipsAndCards');
  });
});
