import type { MsrpEntry } from './types';

// Hard-coded manufacturer-established retail prices (USD) for Pokémon TCG
// products. Values are intentionally easy to edit and extend. Keyword phrases
// are matched against a normalized (lower-cased, accent-stripped) product title;
// the longest matched phrase wins, so more specific entries take precedence.
export const MSRP_TABLE: MsrpEntry[] = [
  {
    category: 'ultra-premium-collection',
    label: 'Ultra Premium Collection',
    msrp: 119.99,
    keywords: ['ultra premium collection'],
  },
  {
    category: 'super-premium-collection',
    label: 'Super Premium Collection',
    msrp: 79.99,
    keywords: ['super premium collection'],
  },
  {
    category: 'elite-trainer-box',
    label: 'Elite Trainer Box',
    msrp: 49.99,
    keywords: ['elite trainer box', 'etb'],
  },
  {
    category: 'booster-box',
    label: 'Booster Box',
    msrp: 161.64,
    keywords: ['booster box', 'booster display', '36 pack', '36-pack'],
  },
  {
    category: 'booster-bundle',
    label: 'Booster Bundle',
    msrp: 26.94,
    keywords: ['booster bundle', '6 booster packs', '6-pack booster'],
  },
  {
    category: 'build-battle-box',
    label: 'Build & Battle Box',
    msrp: 24.99,
    keywords: ['build & battle box', 'build and battle box', 'build & battle'],
  },
  {
    category: 'collection-box',
    label: 'Collection Box',
    msrp: 29.99,
    keywords: ['collection box', 'premium collection', 'special collection'],
  },
  {
    category: 'tin',
    label: 'Collector Tin',
    msrp: 24.99,
    keywords: ['collector tin', 'pokeball tin', 'poke ball tin', 'tin'],
  },
  {
    category: 'mini-tin',
    label: 'Mini Tin',
    msrp: 11.99,
    keywords: ['mini tin'],
  },
  {
    category: 'blister-3pack',
    label: '3-Pack Blister',
    msrp: 13.99,
    keywords: ['3 booster packs', '3-pack blister', 'three booster', 'checklane blister'],
  },
  {
    category: 'battle-deck',
    label: 'Battle Deck',
    msrp: 14.99,
    keywords: ['battle deck'],
  },
  {
    category: 'binder-collection',
    label: 'Binder Collection',
    msrp: 29.99,
    keywords: ['binder collection'],
  },
  {
    category: 'booster-pack',
    label: 'Booster Pack',
    msrp: 4.49,
    keywords: ['booster pack', 'booster packs'],
  },
];
