// Shared DOM helpers for the site adapters. Selectors live in each adapter and
// are best-effort: retailer markup changes often, so keep them centralized and
// list fallbacks from most to least specific.

export function text(el: Element | null | undefined): string | null {
  const value = el?.textContent?.replace(/\s+/g, ' ').trim();
  return value || null;
}

export function selectOne(root: ParentNode, selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const el = root.querySelector<HTMLElement>(selector);
    if (el) return el;
  }
  return null;
}

export function selectAll(root: ParentNode, selectors: string[]): HTMLElement[] {
  for (const selector of selectors) {
    const els = root.querySelectorAll<HTMLElement>(selector);
    if (els.length) return Array.from(els);
  }
  return [];
}

const SOLD_BY_PATTERNS = [
  'sold and shipped by',
  'sold & shipped by',
  'ships from and sold by',
  'sold by',
];

// Best-effort parse of a "Sold by <seller>" string. Returns thirdParty=false
// when the seller is the retailer itself, true for a named marketplace seller,
// and null when no seller information is present.
export function detectSeller(
  container: Element | null,
  firstPartyAliases: string[],
): { thirdParty: boolean | null; sellerName: string | null } {
  if (!container) return { thirdParty: null, sellerName: null };

  const raw = (container.textContent || '').replace(/\s+/g, ' ').trim();
  const lower = raw.toLowerCase();

  for (const pattern of SOLD_BY_PATTERNS) {
    const idx = lower.indexOf(pattern);
    if (idx === -1) continue;

    const after = raw.slice(idx + pattern.length).replace(/^[:\s]+/, '');
    const sellerName = after.split(/[.,|\n•·]| and | & /i)[0]?.trim().slice(0, 60) || null;
    if (!sellerName) return { thirdParty: null, sellerName: null };

    const sellerLower = sellerName.toLowerCase();
    const firstParty = firstPartyAliases.some((alias) => sellerLower.startsWith(alias));
    return { thirdParty: !firstParty, sellerName };
  }

  return { thirdParty: null, sellerName: null };
}
