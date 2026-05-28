import { parsePrice } from '../money';
import { detectSeller, selectAll, selectOne, text } from './common';
import type { ProductNode, SiteAdapter } from './types';

const FIRST_PARTY = ['best buy', 'bestbuy'];

function readCard(el: HTMLElement): ProductNode {
  const titleEl = selectOne(el, [
    '.sku-title a',
    'h4.sku-title a',
    '.sku-title',
    '[data-testid="product-title"]',
  ]);
  const priceEl = selectOne(el, [
    '[data-testid="customer-price"]',
    '.priceView-customer-price span',
    '.priceView-hero-price span',
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
  const titleEl = selectOne(root, ['.sku-title h1', 'h1.heading-5', '.shop-product-title h1']);
  if (!titleEl) return null;

  const priceEl = selectOne(root, [
    '[data-testid="customer-price"]',
    '.priceView-customer-price span',
    '.priceView-hero-price span',
  ]);
  const sellerEl = selectOne(root, [
    '[data-testid="seller-info"]',
    '.fulfillment-fulfillment-summary',
    '.shipping-fulfillment',
  ]);
  const cartButton = selectOne(root, [
    'button.add-to-cart-button',
    '.fulfillment-add-to-cart-button button',
    'button[data-button-state]',
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

export const bestbuy: SiteAdapter = {
  name: 'Best Buy',
  reportUrl: 'https://www.bestbuy.com/site/help-topics/contact-us/pcmcat748302046671.c',
  matches: (host) => /(^|\.)bestbuy\.com$/.test(host),
  findProducts(root) {
    const nodes: ProductNode[] = [];
    for (const card of selectAll(root, [
      'li.sku-item',
      '.product-list-item',
      '[data-testid="product-list-item"]',
    ])) {
      nodes.push(readCard(card));
    }
    const detail = readDetail(root);
    if (detail) nodes.push(detail);
    return nodes;
  },
};
