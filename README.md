# Payfair

A free, open-source browser extension that flags **Pokémon TCG** listings sold
**above MSRP** by marketplace / third-party sellers on major retailers — and
warns you before they end up in your cart.

Built with [WXT](https://wxt.dev).

## What it does

- Scans search results and product pages on supported retailers.
- Matches Pokémon TCG products (booster bundles, ETBs, booster boxes, tins,
  collections, etc.) against hard-coded manufacturer pricing.
- For listings priced above MSRP it either **warns** you with an inline badge
  or **hides** the listing (your choice).
- On product pages it asks for confirmation before an above-MSRP item is added
  to your cart.
- When a price hits **150% of MSRP or more**, it surfaces a price-gouging
  notification with a one-click link to report the listing to the marketplace.

Listings confirmed to be sold by the first-party retailer are left alone — the
extension targets marketplace and third-party sellers.

## Supported sites

Amazon, Walmart, Target, Best Buy, and GameStop (`*.amazon.com`,
`*.walmart.com`, `*.target.com`, `*.bestbuy.com`, `*.gamestop.com`).

## Development

```bash
pnpm install        # also runs `wxt prepare`
pnpm icons          # regenerate the icon set (optional)
pnpm dev            # launch Chrome with the extension loaded
pnpm dev:firefox    # launch Firefox
pnpm build          # production build into .output/
pnpm zip            # packaged zip for store upload
pnpm compile        # type-check only
```

## Project layout

```
entrypoints/
  background.ts        notifications for price gouging
  content.ts           page scanning, badges, cart guard
  popup/               settings UI
utils/
  msrp.ts              hard-coded MSRP table (edit me)
  matcher.ts           product matching + price evaluation
  money.ts             price parsing/formatting
  settings.ts          synced user settings
  ui.ts                badge rendering
  sites/               per-retailer DOM adapters
```

## Updating prices and selectors

- **Prices:** edit the `MSRP_TABLE` in [`utils/msrp.ts`](utils/msrp.ts). Each
  entry has a category, label, MSRP, and the title keywords that map to it.
- **Site selectors:** retailer markup changes often. Each adapter in
  [`utils/sites`](utils/sites) lists CSS selectors from most to least specific;
  add fallbacks there when a site changes.

## Notes

- MSRP values are an initial, hard-coded baseline and are easy to extend.
- Seller detection and DOM selectors are best-effort; when a seller can't be
  confirmed, an above-MSRP price is itself treated as the marketplace signal.

## License

MIT — see [LICENSE](LICENSE).
