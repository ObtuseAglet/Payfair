import { MSRP_TABLE } from './msrp';
import type { Evaluation, MsrpEntry, MsrpOverrides, ProductInfo } from './types';

export const GOUGE_RATIO = 1.5;

// A small grace so tax-inclusive rounding or a few cents don't trip the warning.
const OVER_EPSILON = 0.005;

function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function isPokemonTcg(title: string): boolean {
  return normalize(title).includes('pokemon');
}

export function matchProduct(title: string): MsrpEntry | null {
  const normalized = normalize(title);
  let best: MsrpEntry | null = null;
  let bestLength = 0;
  let bestCount = 0;

  for (const entry of MSRP_TABLE) {
    let longest = 0;
    let count = 0;
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        count++;
        if (keyword.length > longest) longest = keyword.length;
      }
    }
    if (longest === 0) continue;
    if (longest > bestLength || (longest === bestLength && count > bestCount)) {
      best = entry;
      bestLength = longest;
      bestCount = count;
    }
  }

  return best;
}

export function evaluate(product: ProductInfo, overrides: MsrpOverrides = {}): Evaluation | null {
  if (product.price == null) return null;
  if (!isPokemonTcg(product.title)) return null;

  const match = matchProduct(product.title);
  if (!match) return null;

  const msrp = overrides[match.category] ?? match.msrp;
  const ratio = product.price / msrp;
  let status: Evaluation['status'] = 'ok';
  if (ratio >= GOUGE_RATIO) status = 'gouging';
  else if (ratio > 1 + OVER_EPSILON) status = 'over-msrp';

  return { status, product, match, msrp, ratio };
}

// Act on anything priced above MSRP, except listings we can confirm are sold by
// the first-party retailer. Marketplace/third-party listings (or unknown
// sellers) above MSRP are exactly what we want to surface.
export function shouldAct(evaluation: Evaluation): boolean {
  return evaluation.status !== 'ok' && evaluation.product.thirdParty !== false;
}
