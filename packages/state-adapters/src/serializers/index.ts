import type { Run } from '@nextflow-ide/domain';
import type { StoredRunEnvelope } from '../vscode-memento/index.js';

export interface SerializedRunRecord {
  runId: string;
  content: string;
}

export function serializeRuns(runs: readonly Run[]): StoredRunEnvelope {
  return {
    schemaVersion: 1,
    payload: { runs }
  };
}

export function deserializeRuns(value: unknown): readonly Run[] {
  if (!isStoredRunEnvelope(value)) {
    return [];
  }

  return value.payload.runs;
}

function isStoredRunEnvelope(value: unknown): value is StoredRunEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const envelope = value as Partial<StoredRunEnvelope>;
  return (
    envelope.schemaVersion === 1 &&
    typeof envelope.payload === 'object' &&
    envelope.payload !== null &&
    Array.isArray(envelope.payload.runs)
  );
}