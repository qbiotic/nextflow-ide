import type { Run } from '@nextflow-ide/domain';

export interface RunListItemModel {
  id: string;
  status: Run['status'];
  description: string;
}

export function toRunListItems(runs: readonly Run[]): RunListItemModel[] {
  return [...runs]
    .sort((left, right) => right.timestamps.updatedAt.localeCompare(left.timestamps.updatedAt))
    .map((run) => ({
      id: run.id,
      status: run.status,
      description: run.status
    }));
}
