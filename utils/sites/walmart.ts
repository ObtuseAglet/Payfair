import { parsePrice } from '../money';
import { detectSeller, selectAll, selectOne, text } from './common';
import type { ProductNode, SiteAdapter } from './types';

const FIRST_PARTY = ['walmart'];

function readCard(el: HTMLElement): ProductNode {
  const titleEl = selectOne(el, [
    'span[data-automation-id="product-title"]',
    '[data-automation-id="product-title"]',
    'a[link-identifier] span',
  ]);
  const priceEl = selectOne(el, [
    'div[data-automation-id="product-price"]',
    '[data-automation-id="product-price"]',
    '[itemprop="price"]',
  ]);
  const seller = detectSeller(el, FIRST_PARTY);
  return {
    el,
    kind: 'card',
    title: text(titleEl),
    price: parsePrice(priceEl?.textContent),
    thirdParty: seller.thirdParty,
    sellerName: seller.sellerName,
    cartButton: null,
  };
}

function readDetail(root: ParentNode): ProductNode | null {
  const titleEl = selectOne(root, ['#main-title', 'h1[itemprop="name"]', 'h1[id*="main-title"]']);
  if (!titleEl) return null;

  const priceEl = selectOne(root, [
    '[data-testid="price-wrap"] [itemprop="price"]',
    '[data-automation-id="buybox-price"] [itemprop="price"]',
    'span[itemprop="price"]',
    '[data-automation-id="product-price"]',
  ]);
  const sellerEl = selectOne(root, [
    '[data-testid="product-seller-info"]',
    '[data-testid="seller-name"]',
    '[data-automation-id="seller-name"]',
  ]);
  const cartButton = selectOne(root, [
    '[data-automation-id="atc"]',
    '[data-testid="add-to-cart"]',
    'button[aria-label*="Add to cart" i]',
  ]);
  const seller = detectSeller(sellerEl, FIRST_PARTY);

  return {
    el: cartButton?.parentElement ?? titleEl.parentElement ?? titleEl,
    kind: 'detail',
    title: text(titleEl),
    price: parsePrice(priceEl?.textContent),
    thirdParty: seller.thirdParty,
    sellerName: seller.sellerName,
    cartButton,
  };
}

export const walmart: SiteAdapter = {
  name: 'Walmart',
  reportUrl: 'https://help.walmart.com/',
  matches: (host) => /(^|\.)walmart\.com$/.test(host),
  findProducts(root) {
    const nodes: ProductNode[] = [];
    for (const card of selectAll(root, ['div[data-item-id]'])) {
      nodes.push(readCard(card));
    }
    const detail = readDetail(root);
    if (detail) nodes.push(detail);
    return nodes;
  },
};
