import { browser, defineBackground } from '#imports';
import { formatPrice } from '../utils/money';
import type { GougeMessage } from '../utils/types';

export default defineBackground(() => {
  const reportUrls = new Map<string, string>();

  browser.runtime.onMessage.addListener((message: unknown) => {
    const gouge = message as GougeMessage;
    if (!gouge || gouge.type !== 'payfair:gouge') return;

    const id = `payfair-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    reportUrls.set(id, gouge.reportUrl);
    browser.notifications.create(id, {
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title: 'Payfair — possible price gouging',
      message:
        `${gouge.title}\n` +
        `Listed at ${formatPrice(gouge.price)} — over 150% of the ` +
        `${formatPrice(gouge.msrp)} MSRP on ${gouge.retailer}. Click to report.`,
    });
  });

  browser.notifications.onClicked.addListener((id) => {
    const url = reportUrls.get(id);
    if (!url) return;
    browser.tabs.create({ url });
    reportUrls.delete(id);
    browser.notifications.clear(id);
  });
});
