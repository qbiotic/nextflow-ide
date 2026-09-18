export interface PersistenceMigration {
  fromVersion: number;
  toVersion: number;
}