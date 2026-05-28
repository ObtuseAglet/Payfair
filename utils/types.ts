export type ProductCategory =
  | 'booster-pack'
  | 'blister-3pack'
  | 'booster-bundle'
  | 'booster-box'
  | 'build-battle-box'
  | 'elite-trainer-box'
  | 'collection-box'
  | 'super-premium-collection'
  | 'ultra-premium-collection'
  | 'tin'
  | 'mini-tin'
  | 'battle-deck'
  | 'binder-collection';

export interface MsrpEntry {
  category: ProductCategory;
  label: string;
  msrp: number;
  keywords: string[];
}

export interface ProductInfo {
  title: string;
  price: number | null;
  thirdParty: boolean | null;
  sellerName?: string | null;
}

export type EvaluationStatus = 'ok' | 'over-msrp' | 'gouging';

export interface Evaluation {
  status: EvaluationStatus;
  product: ProductInfo;
  match: MsrpEntry;
  msrp: number;
  ratio: number;
}

export interface GougeMessage {
  type: 'payfair:gouge';
  title: string;
  price: number;
  msrp: number;
  retailer: string;
  reportUrl: string;
}
