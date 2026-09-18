import { createExtensionCompositionRoot } from './composition-root/index.js';

export function activate(): void {
  createExtensionCompositionRoot();
}

export function deactivate(): void {}