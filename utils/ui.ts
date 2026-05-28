import { formatPrice } from './money';
import type { Evaluation } from './types';
import type { ProductNode } from './sites/types';

const PROCESSED_ATTR = 'data-payfair';
const BADGE_ATTR = 'data-payfair-badge';

export function isProcessed(el: HTMLElement): boolean {
  return el.hasAttribute(PROCESSED_ATTR);
}

export function markProcessed(el: HTMLElement): void {
  el.setAttribute(PROCESSED_ATTR, '1');
}

export function clearAnnotations(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(`[${PROCESSED_ATTR}]`).forEach((el) => {
    el.removeAttribute(PROCESSED_ATTR);
    el.style.removeProperty('display');
  });
  root.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => el.remove());
}

export function hideCard(el: HTMLElement): void {
  el.style.setProperty('display', 'none', 'important');
}

export function buildBadge(
  evaluation: Evaluation,
  retailer: string,
  onReport: () => void,
): HTMLElement {
  const gouging = evaluation.status === 'gouging';
  const badge = document.createElement('div');
  badge.setAttribute(BADGE_ATTR, '1');
  Object.assign(badge.style, {
    display: 'block',
    margin: '6px 0',
    padding: '6px 10px',
    borderRadius: '8px',
    font: '600 12px/1.4 system-ui, -apple-system, sans-serif',
    color: gouging ? '#7f1d1d' : '#7c2d12',
    background: gouging ? '#fee2e2' : '#ffedd5',
    border: `1px solid ${gouging ? '#fca5a5' : '#fdba74'}`,
  });

  const multiplier = evaluation.ratio.toFixed(2).replace(/\.?0+$/, '');
  const headline = gouging ? 'Possible price gouging' : 'Above MSRP';
  badge.append(
    `Payfair — ${headline}: ${formatPrice(evaluation.product.price ?? 0)} ` +
      `(${multiplier}× the ${formatPrice(evaluation.msrp)} MSRP for ${evaluation.match.label})`,
  );

  if (gouging) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Report to ${retailer}`;
    Object.assign(button.style, {
      marginLeft: '8px',
      padding: '2px 8px',
      cursor: 'pointer',
      borderRadius: '6px',
      border: '1px solid #b91c1c',
      background: '#b91c1c',
      color: '#fff',
      font: '600 12px system-ui, sans-serif',
    });
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onReport();
    });
    badge.appendChild(button);
  }

  return badge;
}

export function placeBadge(node: ProductNode, badge: HTMLElement): void {
  if (node.kind === 'detail' && node.cartButton?.parentElement) {
    node.cartButton.parentElement.insertBefore(badge, node.cartButton);
  } else {
    node.el.prepend(badge);
  }
}
