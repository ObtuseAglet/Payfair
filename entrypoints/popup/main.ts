import { MSRP_TABLE } from '../../utils/msrp';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '../../utils/settings';
import type { MsrpOverrides, ProductCategory } from '../../utils/types';

const enabled = document.querySelector<HTMLInputElement>('#enabled')!;
const modeWarn = document.querySelector<HTMLInputElement>('#mode-warn')!;
const modeHide = document.querySelector<HTMLInputElement>('#mode-hide')!;
const gouge = document.querySelector<HTMLInputElement>('#gouge')!;
const msrpList = document.querySelector<HTMLDivElement>('#msrp-list')!;
const msrpReset = document.querySelector<HTMLButtonElement>('#msrp-reset')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;

let current: Settings = DEFAULT_SETTINGS;

function renderOverrides(overrides: MsrpOverrides): void {
  msrpList.replaceChildren();
  for (const entry of MSRP_TABLE) {
    const row = document.createElement('label');
    row.className = 'msrp-row';

    const label = document.createElement('span');
    label.className = 'msrp-label';
    label.textContent = entry.label;

    const inputs = document.createElement('span');
    inputs.className = 'msrp-input';

    const defaultBadge = document.createElement('span');
    defaultBadge.className = 'msrp-default';
    defaultBadge.textContent = `default $${entry.msrp.toFixed(2)}`;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.inputMode = 'decimal';
    input.placeholder = entry.msrp.toFixed(2);
    input.dataset.category = entry.category;
    const override = overrides[entry.category];
    if (override != null) input.value = override.toFixed(2);

    inputs.append(defaultBadge, input);
    row.append(label, inputs);
    msrpList.append(row);
  }
}

function render(settings: Settings): void {
  current = settings;
  enabled.checked = settings.enabled;
  modeWarn.checked = settings.mode === 'warn';
  modeHide.checked = settings.mode === 'hide';
  gouge.checked = settings.gougeNotifications;
  renderOverrides(settings.msrpOverrides);
}

async function persist(): Promise<void> {
  await saveSettings(current);
  status.textContent = 'Saved';
  setTimeout(() => (status.textContent = ''), 1200);
}

function syncTopLevelControls(): void {
  current = {
    ...current,
    enabled: enabled.checked,
    mode: modeHide.checked ? 'hide' : 'warn',
    gougeNotifications: gouge.checked,
  };
  void persist();
}

for (const input of [enabled, modeWarn, modeHide, gouge]) {
  input.addEventListener('change', syncTopLevelControls);
}

msrpList.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement;
  const category = input.dataset.category as ProductCategory | undefined;
  if (!category) return;

  const next: MsrpOverrides = { ...current.msrpOverrides };
  const value = Number.parseFloat(input.value);
  if (input.value.trim() === '' || !Number.isFinite(value) || value < 0) {
    delete next[category];
  } else {
    next[category] = Math.round(value * 100) / 100;
  }
  current = { ...current, msrpOverrides: next };
  void persist();
});

msrpReset.addEventListener('click', () => {
  current = { ...current, msrpOverrides: {} };
  renderOverrides({});
  void persist();
});

loadSettings()
  .then(render)
  .catch(() => render(DEFAULT_SETTINGS));
