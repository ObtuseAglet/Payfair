import { browser } from '#imports';
import type { MsrpOverrides } from './types';

export type DetectionMode = 'warn' | 'hide';

export interface Settings {
  enabled: boolean;
  mode: DetectionMode;
  gougeNotifications: boolean;
  msrpOverrides: MsrpOverrides;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  mode: 'warn',
  gougeNotifications: true,
  msrpOverrides: {},
};

const STORAGE_KEY = 'payfair:settings';

export async function loadSettings(): Promise<Settings> {
  const stored = await browser.storage.sync.get(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[STORAGE_KEY] as Partial<Settings> | undefined) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEY]: settings });
}

type StorageChange = { newValue?: unknown; oldValue?: unknown };

export function watchSettings(callback: (settings: Settings) => void): () => void {
  const listener = (changes: Record<string, StorageChange>, area: string) => {
    if (area !== 'sync' || !changes[STORAGE_KEY]) return;
    callback({ ...DEFAULT_SETTINGS, ...(changes[STORAGE_KEY].newValue as Partial<Settings>) });
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
