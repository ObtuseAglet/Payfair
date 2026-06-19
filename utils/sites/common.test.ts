// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { detectSeller } from './common';

function div(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

describe('detectSeller', () => {
  it('returns null when the container is null', () => {
    expect(detectSeller(null, ['amazon'])).toEqual({ thirdParty: null, sellerName: null });
  });

  it('returns null when no "sold by" phrase is present', () => {
    expect(detectSeller(div('Fast shipping available'), ['amazon'])).toEqual({
      thirdParty: null,
      sellerName: null,
    });
  });

  it('recognizes a first-party seller from "Sold by Amazon"', () => {
    expect(detectSeller(div('Ships from Amazon Sold by Amazon'), ['amazon'])).toEqual({
      thirdParty: false,
      sellerName: 'Amazon',
    });
  });

  it('flags a third-party seller', () => {
    expect(detectSeller(div('Sold by AwesomeCardShop'), ['amazon'])).toEqual({
      thirdParty: true,
      sellerName: 'AwesomeCardShop',
    });
  });

  it('handles "Sold and shipped by Walmart.com" as first-party', () => {
    expect(detectSeller(div('Sold and shipped by Walmart.com'), ['walmart'])).toEqual({
      thirdParty: false,
      sellerName: 'Walmart',
    });
  });

  it('handles "Ships from and sold by" pattern', () => {
    expect(detectSeller(div('Ships from and sold by Amazon'), ['amazon'])).toEqual({
      thirdParty: false,
      sellerName: 'Amazon',
    });
  });

  it('flags Best Buy marketplace sellers when alias does not match', () => {
    expect(detectSeller(div('Sold by Card Universe'), ['best buy', 'bestbuy'])).toEqual({
      thirdParty: true,
      sellerName: 'Card Universe',
    });
  });
});
