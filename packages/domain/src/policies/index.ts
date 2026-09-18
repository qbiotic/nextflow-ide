export const SUPPORTED_RUNTIME_MODES = ['local', 'docker'] as const;

export type RuntimeMode = (typeof SUPPORTED_RUNTIME_MODES)[number];