// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { amazon } from './amazon';

describe('amazon adapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches amazon.com hostnames', () => {
    expect(amazon.matches('www.amazon.com')).toBe(true);
    expect(amazon.matches('smile.amazon.com')).toBe(true);
    expect(amazon.matches('amazon.com')).toBe(true);
    expect(amazon.matches('amazon.de')).toBe(false);
    expect(amazon.matches('notamazon.com')).toBe(false);
  });

  it('parses a search result card', () => {
    document.body.innerHTML = `
      <div data-component-type="s-search-result">
        <h2><a href="#"><span>Pokemon Surging Sparks Booster Bundle</span></a></h2>
        <span class="a-price"><span class="a-offscreen">$34.99</span></span>
      </div>`;
    const node = amazon.findProducts(document)[0]!;
    expect(node.kind).toBe('card');
    expect(node.title).toBe('Pokemon Surging Sparks Booster Bundle');
    expect(node.price).toBe(34.99);
  });

  it('parses a product detail page sold by Amazon', () => {
    document.body.innerHTML = `
      <div>
        <h1 id="productTitle">Pokemon Surging Sparks Elite Trainer Box</h1>
        <div id="corePriceDisplay_desktop_feature_div">
          <span class="a-offscreen">$49.99</span>
        </div>
        <div id="merchant-info">Ships from Amazon Sold by Amazon</div>
        <input id="add-to-cart-button" type="submit" />
      </div>`;
    const detail = amazon.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.title).toBe('Pokemon Surging Sparks Elite Trainer Box');
    expect(detail.price).toBe(49.99);
    expect(detail.thirdParty).toBe(false);
    expect(detail.sellerName).toBe('Amazon');
    expect(detail.cartButton).not.toBeNull();
  });

  it('flags a third-party seller on the detail page', () => {
    document.body.innerHTML = `
      <div>
        <h1 id="productTitle">Pokemon Surging Sparks Booster Box</h1>
        <span class="a-price"><span class="a-offscreen">$249.99</span></span>
        <div id="merchant-info">Sold by AwesomeCardShop</div>
      </div>`;
    const detail = amazon.findProducts(document).find((n) => n.kind === 'detail')!;
    expect(detail.thirdParty).toBe(true);
    expect(detail.sellerName).toBe('AwesomeCardShop');
  });
});
