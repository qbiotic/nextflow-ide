import type { Run } from '@nextflow-ide/domain';

export interface StoredRunEnvelope {
  schemaVersion: 1;
  payload: {
    runs: readonly Run[];
  };
}

export interface StateStore {
  read<T>(key: string): Promise<T | undefined>;
  write<T>(key: string, value: T): Promise<void>;
}