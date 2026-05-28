import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: ({ browser }) => ({
    name: 'Payfair',
    description:
      'Flags Pokémon TCG listings sold above MSRP by third-party and marketplace sellers on major retailers.',
    permissions: ['storage', 'notifications'],
    // Payfair sends no data anywhere; declare that for Firefox submissions.
    ...(browser === 'firefox'
      ? { browser_specific_settings: { gecko: { data_collection_permissions: { required: ['none'] } } } }
      : {}),
  }),
});
