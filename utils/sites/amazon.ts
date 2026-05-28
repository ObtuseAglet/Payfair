import { parsePrice } from '../money';
import { detectSeller, selectAll, selectOne, text } from './common';
import type { ProductNode, SiteAdapter } from './types';

const FIRST_PARTY = ['amazon'];

function readCard(el: HTMLElement): ProductNode {
  const titleEl = selectOne(el, ['h2 a span', 'h2 span', '.a-size-medium.a-text-normal', 'h2']);
  const priceEl = selectOne(el, ['.a-price .a-offscreen', '.a-price', '.a-color-price']);
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
  const titleEl = root.querySelector<HTMLElement>('#productTitle');
  if (!titleEl) return null;

  const priceEl = selectOne(root, [
    '#corePriceDisplay_desktop_feature_div .a-offscreen',
    '#corePrice_feature_div .a-offscreen',
    '#price .a-offscreen',
    '.a-price .a-offscreen',
  ]);
  const sellerEl = selectOne(root, [
    '#merchant-info',
    '#tabular-buybox',
    '#sellerProfileTriggerId',
    '#desktop_buybox',
  ]);
  const cartButton = selectOne(root, [
    '#add-to-cart-button',
    'input[name="submit.add-to-cart"]',
    '#buy-now-button',
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

export const amazon: SiteAdapter = {
  name: 'Amazon',
  reportUrl: 'https://www.amazon.com/gp/help/customer/contact-us/',
  matches: (host) => /(^|\.)amazon\.com$/.test(host),
  findProducts(root) {
    const nodes: ProductNode[] = [];
    for (const card of selectAll(root, ['div[data-component-type="s-search-result"]'])) {
      nodes.push(readCard(card));
    }
    const detail = readDetail(root);
    if (detail) nodes.push(detail);
    return nodes;
  },
};
