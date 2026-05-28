import { parsePrice } from '../money';
import { detectSeller, selectAll, selectOne, text } from './common';
import type { ProductNode, SiteAdapter } from './types';

const FIRST_PARTY = ['target'];

function readCard(el: HTMLElement): ProductNode {
  const titleEl = selectOne(el, ['[data-test="product-title"]', 'a[data-test="product-title"]']);
  const priceEl = selectOne(el, ['[data-test="product-price"]']);
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
  const titleEl = root.querySelector<HTMLElement>('h1[data-test="product-title"]');
  if (!titleEl) return null;

  const priceEl = selectOne(root, ['[data-test="product-price"]']);
  const sellerEl = selectOne(root, [
    '[data-test="sellerName"]',
    '[data-test="fulfillment-cell"]',
    '[data-test="@web/Fulfillment"]',
  ]);
  const cartButton = selectOne(root, [
    'button[data-test="addToCartButton"]',
    '[data-test="shippingButton"]',
    '[data-test="orderPickupButton"]',
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

export const target: SiteAdapter = {
  name: 'Target',
  reportUrl: 'https://help.target.com/',
  matches: (host) => /(^|\.)target\.com$/.test(host),
  findProducts(root) {
    const nodes: ProductNode[] = [];
    for (const card of selectAll(root, [
      '[data-test="@web/site-top-of-funnel/ProductCardWrapper"]',
      '[data-test="product-card"]',
    ])) {
      nodes.push(readCard(card));
    }
    const detail = readDetail(root);
    if (detail) nodes.push(detail);
    return nodes;
  },
};
