import { parsePrice } from '../money';
import { detectSeller, selectAll, selectOne, text } from './common';
import type { ProductNode, SiteAdapter } from './types';

const FIRST_PARTY = ['gamestop'];

function readCard(el: HTMLElement): ProductNode {
  const titleEl = selectOne(el, [
    '.product-tile-name',
    '.link-name',
    '.product-name',
    'a.product-grid-tile-link',
  ]);
  const priceEl = selectOne(el, [
    '.actual-price',
    '.product-tile-price .actual-price',
    '.price .value',
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
  const titleEl = selectOne(root, ['h1.product-name', '.product-name h1', 'h1[itemprop="name"]']);
  if (!titleEl) return null;

  const priceEl = selectOne(root, ['.actual-price', '[itemprop="price"]', '.price .value']);
  const sellerEl = selectOne(root, ['.product-seller', '.sold-by', '.marketplace-seller']);
  const cartButton = selectOne(root, ['#add-to-cart', 'button.add-to-cart', '.add-to-cart']);
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

export const gamestop: SiteAdapter = {
  name: 'GameStop',
  reportUrl: 'https://www.gamestop.com/customer-service',
  matches: (host) => /(^|\.)gamestop\.com$/.test(host),
  findProducts(root) {
    const nodes: ProductNode[] = [];
    for (const card of selectAll(root, [
      '.product-grid .product',
      '.product-tile',
      '[data-testid="product-tile"]',
    ])) {
      nodes.push(readCard(card));
    }
    const detail = readDetail(root);
    if (detail) nodes.push(detail);
    return nodes;
  },
};
