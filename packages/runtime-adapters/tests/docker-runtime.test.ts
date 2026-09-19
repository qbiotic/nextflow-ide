import type { EventPublisher } from '@nextflow-ide/application';
import type { ExecutionEvent, Run } from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import { DockerNextflowRuntime } from '../src/nextflow-docker/index.js';
import type { ManagedProcess, ProcessLauncher } from '../src/process-monitor/index.js';

class FakeProcess implements ManagedProcess {
  public readonly pid = 88;
  public onOutput(): void {}
  public onExit(): void {}
  public kill(): void {}
}

class FakeLauncher implements ProcessLauncher {
  public launch(): ManagedProcess {
    return new FakeProcess();
  }
}

class Publisher implements EventPublisher {
  public events: ExecutionEvent[] = [];
  public async publish(event: ExecutionEvent): Promise<void> {
    this.events.push(event);
  }
}

const run: Run = {
  id: 'docker-run',
  configuration: {
    workspaceRoot: '/workspace',
    entrypointPath: '/workspace/main.nf',
    runtimeMode: 'docker',
    profileNames: [],
    resumeEnabled: false,
    args: [],
    environment: {}
  },
  status: 'queued',
  artifacts: [],
  timestamps: { createdAt: '2026-09-19T00:00:00.000Z', updatedAt: '2026-09-19T00:00:00.000Z' }
};

const command = {
  executable: 'docker',
  args: ['run', '--rm', 'nextflow/nextflow:latest'],
  workingDirectory: '/workspace',
  environment: {},
  displayCommand: 'docker run --rm nextflow/nextflow:latest'
};

describe('DockerNextflowRuntime', () => {
  it('runs after Docker preflight succeeds', async () => {
    const runtime = new DockerNextflowRuntime({
      clock: { now: () => '2026-09-19T00:00:01.000Z' },
      eventPublisher: new Publisher(),
      launcher: new FakeLauncher(),
      preflight: { name: 'docker', validate: async () => true }
    });

    await expect(runtime.startRun(run, command)).resolves.toMatchObject({ runId: run.id, processId: 88 });
  });

  it('rejects execution when Docker is unavailable', async () => {
    const runtime = new DockerNextflowRuntime({
      clock: { now: () => '2026-09-19T00:00:01.000Z' },
      eventPublisher: new Publisher(),
      launcher: new FakeLauncher(),
      preflight: { name: 'docker', validate: async () => false }
    });

    await expect(runtime.startRun(run, command)).rejects.toThrow('Docker preflight failed');
  });
});
