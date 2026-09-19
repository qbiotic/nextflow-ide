import type { Run } from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import {
  MementoRunRepository,
  type StateStore
} from '../src/index.js';

class InMemoryStateStore implements StateStore {
  private readonly values = new Map<string, unknown>();

  public async read<T>(key: string): Promise<T | undefined> {
    return this.values.get(key) as T | undefined;
  }

  public async write<T>(key: string, value: T): Promise<void> {
    this.values.set(key, value);
  }
}

function createRun(id: string, workspaceRoot: string): Run {
  return {
    id,
    configuration: {
      workspaceRoot,
      entrypointPath: `${workspaceRoot}/main.nf`,
      runtimeMode: 'local',
      profileNames: [],
      resumeEnabled: false,
      args: [],
      environment: {}
    },
    status: 'queued',
    artifacts: [],
    timestamps: {
      createdAt: '2026-09-19T00:00:00.000Z',
      updatedAt: '2026-09-19T00:00:00.000Z'
    }
  };
}

describe('MementoRunRepository', () => {
  it('persists, reads, updates, and filters runs by workspace', async () => {
    const repository = new MementoRunRepository(new InMemoryStateStore());
    const firstRun = createRun('run-001', '/workspace/one');
    const secondRun = createRun('run-002', '/workspace/two');

    await repository.save(firstRun);
    await repository.save(secondRun);
    await repository.update({ ...firstRun, status: 'running' });

    await expect(repository.getById('run-001')).resolves.toMatchObject({ status: 'running' });
    await expect(repository.listByWorkspace('/workspace/one')).resolves.toHaveLength(1);
    await expect(repository.listByWorkspace('/workspace/two')).resolves.toEqual([secondRun]);
  });

  it('returns an empty history for missing or invalid persisted state', async () => {
    const stateStore = new InMemoryStateStore();
    const repository = new MementoRunRepository(stateStore);

    await expect(repository.listByWorkspace('/workspace/one')).resolves.toEqual([]);
    await stateStore.write('nextflow-ide.run-history', { schemaVersion: 99 });
    await expect(repository.listByWorkspace('/workspace/one')).resolves.toEqual([]);
  });

  it('rejects updates for unknown runs', async () => {
    const repository = new MementoRunRepository(new InMemoryStateStore());

    await expect(repository.update(createRun('missing', '/workspace/one'))).rejects.toThrow(
      'Cannot update unknown run missing.'
    );
  });
});