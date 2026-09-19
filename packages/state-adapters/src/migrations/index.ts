export interface PersistenceMigration {
  fromVersion: number;
  toVersion: number;
}

export const CURRENT_PERSISTENCE_VERSION = 1 as const;