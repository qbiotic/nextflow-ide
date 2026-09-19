import type { EventPublisher } from '@nextflow-ide/application';
import type { ExecutionEvent, Run } from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import { LocalNextflowRuntime } from '../src/nextflow-local/index.js';
import type { ManagedProcess, ProcessLauncher } from '../src/process-monitor/index.js';

class FakeProcess implements ManagedProcess {
  public readonly pid = 42;
  private outputListener?: (chunk: { stream: 'stdout' | 'stderr'; text: string }) => void;
  private exitListener?: (exitCode: number | null, signal: string | null) => void;
  public killedWith?: NodeJS.Signals;

  public onOutput(listener: typeof this.outputListener): void {
    this.outputListener = listener;
  }

  public onExit(listener: typeof this.exitListener): void {
    this.exitListener = listener;
  }

  public kill(signal: NodeJS.Signals = 'SIGTERM'): void {
    this.killedWith = signal;
  }

  public emitOutput(text: string, stream: 'stdout' | 'stderr' = 'stdout'): void {
    this.outputListener?.({ stream, text });
  }

  public emitExit(exitCode: number | null, signal: string | null = null): void {
    this.exitListener?.(exitCode, signal);
  }
}

class FakeLauncher implements ProcessLauncher {
  public readonly process = new FakeProcess();

  public launch(): ManagedProcess {
    return this.process;
  }
}

class RecordingPublisher implements EventPublisher {
  public readonly events: ExecutionEvent[] = [];

  public async publish(event: ExecutionEvent): Promise<void> {
    this.events.push(event);
  }
}

const run: Run = {
  id: 'run-001',
  configuration: {
    workspaceRoot: '/workspace',
    entrypointPath: '/workspace/main.nf',
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

const command = {
  executable: 'nextflow',
  args: ['run', '/workspace/main.nf'],
  workingDirectory: '/workspace',
  environment: {},
  displayCommand: 'nextflow run /workspace/main.nf'
};

describe('LocalNextflowRuntime', () => {
  it('launches a process and publishes logs and successful completion', async () => {
    const launcher = new FakeLauncher();
    const publisher = new RecordingPublisher();
    const runtime = new LocalNextflowRuntime({
      clock: { now: () => '2026-09-19T00:00:01.000Z' },
      eventPublisher: publisher,
      launcher,
      preflight: { name: 'fake', validate: async () => true }
    });

    await expect(runtime.startRun(run, command)).resolves.toMatchObject({
      runId: 'run-001',
      processId: 42
    });
    launcher.process.emitOutput('hello\n');
    launcher.process.emitExit(0);
    await Promise.resolve();

    expect(publisher.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'log', message: 'hello\n' }),
        expect.objectContaining({ kind: 'status-changed', status: 'succeeded' })
      ])
    );
  });

  it('fails before launching when preflight fails', async () => {
    const launcher = new FakeLauncher();
    const runtime = new LocalNextflowRuntime({
      clock: { now: () => '2026-09-19T00:00:01.000Z' },
      eventPublisher: new RecordingPublisher(),
      launcher,
      preflight: { name: 'fake', validate: async () => false }
    });

    await expect(runtime.startRun(run, command)).rejects.toThrow('preflight failed');
    expect(launcher.process.killedWith).toBeUndefined();
  });

  it('requests cancellation and publishes canceled status', async () => {
    const launcher = new FakeLauncher();
    const publisher = new RecordingPublisher();
    const runtime = new LocalNextflowRuntime({
      clock: { now: () => '2026-09-19T00:00:01.000Z' },
      eventPublisher: publisher,
      launcher,
      preflight: { name: 'fake', validate: async () => true }
    });

    await runtime.startRun(run, command);
    await runtime.stopRun(run);

    expect(launcher.process.killedWith).toBe('SIGTERM');
    expect(publisher.events).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'canceled' })])
    );
  });
});