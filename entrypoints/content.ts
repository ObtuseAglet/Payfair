import { browser, defineContentScript } from '#imports';
import { evaluate, shouldAct } from '../utils/matcher';
import { formatPrice } from '../utils/money';
import { loadSettings, watchSettings, type Settings } from '../utils/settings';
import { getAdapter } from '../utils/sites';
import type { ProductNode } from '../utils/sites/types';
import type { Evaluation, GougeMessage } from '../utils/types';
import {
  buildBadge,
  clearAnnotations,
  hideCard,
  isProcessed,
  markProcessed,
  placeBadge,
} from '../utils/ui';

export default defineContentScript({
  matches: [
    '*://*.amazon.com/*',
    '*://*.walmart.com/*',
    '*://*.target.com/*',
    '*://*.bestbuy.com/*',
    '*://*.gamestop.com/*',
  ],
  runAt: 'document_idle',
  main(ctx) {
    const adapter = getAdapter(location.hostname);
    if (!adapter) return;

    let settings: Settings | null = null;
    const notified = new Set<string>();

    function openReport(): void {
      window.open(adapter!.reportUrl, '_blank', 'noopener');
    }

    function guardCart(node: ProductNode, evaluation: Evaluation): void {
      const button = node.cartButton;
      if (!button || button.dataset.payfairGuard) return;
      button.dataset.payfairGuard = '1';

      let bypass = false;
      button.addEventListener(
        'click',
        (event) => {
          if (bypass) {
            bypass = false;
            return;
          }
          if (!settings?.enabled) return;

          const confirmed = window.confirm(
            `Payfair warning\n\n${node.title}\n\n` +
              `Listed at ${formatPrice(node.price ?? 0)} — ` +
              `${evaluation.ratio.toFixed(2)}× the ${formatPrice(evaluation.msrp)} MSRP.\n\n` +
              'Add to cart anyway?',
          );
          if (confirmed) {
            bypass = true;
          } else {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        true,
      );
    }

    function notifyGouge(node: ProductNode, evaluation: Evaluation): void {
      const key = `${node.title}|${node.price}`;
      if (notified.has(key)) return;
      notified.add(key);
      if (!settings?.gougeNotifications) return;

      const message: GougeMessage = {
        type: 'payfair:gouge',
        title: node.title ?? 'Listing',
        price: node.price ?? 0,
        msrp: evaluation.msrp,
        retailer: adapter!.name,
        reportUrl: adapter!.reportUrl,
      };
      browser.runtime.sendMessage(message).catch(() => {});
    }

    function process(): void {
      if (!settings?.enabled) return;

      for (const node of adapter!.findProducts(document)) {
        if (!node.title || node.price == null || isProcessed(node.el)) continue;
        markProcessed(node.el);

        const evaluation = evaluate(
          {
            title: node.title,
            price: node.price,
            thirdParty: node.thirdParty,
            sellerName: node.sellerName,
          },
          settings.msrpOverrides,
        );
        if (!evaluation || !shouldAct(evaluation)) continue;

        if (settings.mode === 'hide' && node.kind === 'card') {
          hideCard(node.el);
        } else {
          placeBadge(node, buildBadge(evaluation, adapter!.name, openReport));
          if (node.kind === 'detail') guardCart(node, evaluation);
        }

        if (evaluation.status === 'gouging') notifyGouge(node, evaluation);
      }
    }

    const scan = debounce(process, 400);

    void (async () => {
      settings = await loadSettings();
      process();

      const observer = new MutationObserver(scan);
      observer.observe(document.body, { childList: true, subtree: true });
      ctx.onInvalidated(() => observer.disconnect());

      watchSettings((next) => {
        settings = next;
        clearAnnotations(document);
        process();
      });
    })();
  },
});

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}
