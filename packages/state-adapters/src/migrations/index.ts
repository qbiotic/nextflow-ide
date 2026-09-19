export interface PersistenceMigration {
  fromVersion: number;
  toVersion: number;
}

export const CURRENT_PERSISTENCE_VERSION = 1 as const;

export function migratePersistence(value: unknown): unknown {
  if (
    typeof value === 'object' &&
    value !== null &&
    'schemaVersion' in value &&
    value.schemaVersion === CURRENT_PERSISTENCE_VERSION
  ) {
    return value;
  }

  return undefined;
}