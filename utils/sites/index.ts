import { amazon } from './amazon';
import { bestbuy } from './bestbuy';
import { gamestop } from './gamestop';
import { target } from './target';
import { walmart } from './walmart';
import type { SiteAdapter } from './types';

export const ADAPTERS: SiteAdapter[] = [amazon, walmart, target, bestbuy, gamestop];

export function getAdapter(host: string): SiteAdapter | null {
  return ADAPTERS.find((adapter) => adapter.matches(host)) ?? null;
}
