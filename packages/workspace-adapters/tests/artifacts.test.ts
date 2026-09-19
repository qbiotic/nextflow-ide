import type { Run } from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import { WorkspaceArtifactGateway } from '../src/artifacts/index.js';
import type { WorkspaceFileSystem } from '../src/project-detection/index.js';

class FakeWorkspaceFileSystem implements WorkspaceFileSystem {
  public constructor(private readonly existing: ReadonlySet<string>) {}

  public async exists(path: string): Promise<boolean> {
    return this.existing.has(path);
  }

  public async findFiles(): Promise<readonly string[]> {
    return [];
  }
}

const run: Run = {
  id: 'run-001',
  configuration: {
    workspaceRoot: '/workspace/pipeline',
    entrypointPath: '/workspace/pipeline/main.nf',
    runtimeMode: 'local',
    profileNames: [],
    outputDirectory: '/workspace/pipeline/results',
    resumeEnabled: false,
    args: [],
    environment: {}
  },
  status: 'succeeded',
  artifacts: [],
  timestamps: {
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: '2026-09-19T00:00:00.000Z'
  }
};

describe('WorkspaceArtifactGateway', () => {
  it('discovers available artifacts relative to the run output directory', async () => {
    const gateway = new WorkspaceArtifactGateway(
      new FakeWorkspaceFileSystem(new Set(['/workspace/pipeline/results/report.html', '/workspace/pipeline/results/trace.txt']))
    );

    await expect(gateway.listForRun(run)).resolves.toEqual([
      { kind: 'report', available: true, path: '/workspace/pipeline/results/report.html' },
      { kind: 'trace', available: true, path: '/workspace/pipeline/results/trace.txt' },
      { kind: 'timeline', available: false }
    ]);
  });

  it('falls back to the workspace root when no output directory is configured', async () => {
    const gateway = new WorkspaceArtifactGateway(
      new FakeWorkspaceFileSystem(new Set(['/workspace/pipeline/timeline.html']))
    );

    await expect(gateway.listForRun({
      ...run,
      configuration: { ...run.configuration, outputDirectory: undefined }
    })).resolves.toContainEqual({
      kind: 'timeline',
      available: true,
      path: '/workspace/pipeline/timeline.html'
    });
  });
});
