import type { RunRepository } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';
import { deserializeRuns, serializeRuns } from '../serializers/index.js';
import type { StateStore } from './index.js';

export const RUN_HISTORY_STATE_KEY = 'nextflow-ide.run-history';

export class MementoRunRepository implements RunRepository {
  public constructor(
    private readonly stateStore: StateStore,
    private readonly stateKey = RUN_HISTORY_STATE_KEY
  ) {}

  public async getById(runId: string): Promise<Run | null> {
    const runs = await this.readRuns();
    return runs.find((run) => run.id === runId) ?? null;
  }

  public async listByWorkspace(workspaceRoot: string): Promise<readonly Run[]> {
    const runs = await this.readRuns();
    return runs.filter((run) => run.configuration.workspaceRoot === workspaceRoot);
  }

  public async save(run: Run): Promise<void> {
    const runs = await this.readRuns();
    await this.writeRuns([...runs.filter((candidate) => candidate.id !== run.id), run]);
  }

  public async update(run: Run): Promise<void> {
    const runs = await this.readRuns();
    const existing = runs.some((candidate) => candidate.id === run.id);
    if (!existing) {
      throw new Error(`Cannot update unknown run ${run.id}.`);
    }

    await this.writeRuns(runs.map((candidate) => (candidate.id === run.id ? run : candidate)));
  }

  private async readRuns(): Promise<readonly Run[]> {
    return deserializeRuns(await this.stateStore.read<unknown>(this.stateKey));
  }

  private async writeRuns(runs: readonly Run[]): Promise<void> {
    await this.stateStore.write(this.stateKey, serializeRuns(runs));
  }
}