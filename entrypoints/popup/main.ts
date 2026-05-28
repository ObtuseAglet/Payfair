import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '../../utils/settings';

const enabled = document.querySelector<HTMLInputElement>('#enabled')!;
const modeWarn = document.querySelector<HTMLInputElement>('#mode-warn')!;
const modeHide = document.querySelector<HTMLInputElement>('#mode-hide')!;
const gouge = document.querySelector<HTMLInputElement>('#gouge')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;

function render(settings: Settings): void {
  enabled.checked = settings.enabled;
  modeWarn.checked = settings.mode === 'warn';
  modeHide.checked = settings.mode === 'hide';
  gouge.checked = settings.gougeNotifications;
}

async function persist(): Promise<void> {
  await saveSettings({
    enabled: enabled.checked,
    mode: modeHide.checked ? 'hide' : 'warn',
    gougeNotifications: gouge.checked,
  });
  status.textContent = 'Saved';
  setTimeout(() => (status.textContent = ''), 1200);
}

for (const input of [enabled, modeWarn, modeHide, gouge]) {
  input.addEventListener('change', persist);
}

loadSettings()
  .then(render)
  .catch(() => render(DEFAULT_SETTINGS));
