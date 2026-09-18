export interface ExtensionCompositionRoot {
  commands: readonly string[];
}

export function createExtensionCompositionRoot(): ExtensionCompositionRoot {
  return {
    commands: []
  };
}