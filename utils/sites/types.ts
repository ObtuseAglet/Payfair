export type ProductKind = 'card' | 'detail';

// A single product surfaced on the page: a search-result card or a product
// detail page. All fields are read eagerly so the content script can stay free
// of site-specific DOM knowledge.
export interface ProductNode {
  el: HTMLElement;
  kind: ProductKind;
  title: string | null;
  price: number | null;
  thirdParty: boolean | null;
  sellerName: string | null;
  cartButton: HTMLElement | null;
}

export interface SiteAdapter {
  name: string;
  reportUrl: string;
  matches(host: string): boolean;
  findProducts(root: ParentNode): ProductNode[];
}
