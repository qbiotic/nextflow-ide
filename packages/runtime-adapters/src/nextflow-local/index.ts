import type {
  PreparedRunCommand
} from '@nextflow-ide/application';
import type {
  EventPublisher,
  RuntimeGateway,
  RuntimeLaunchResult,
  RuntimeControlResult
} from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';
import type { RuntimePreflightCheck } from '../preflight/index.js';
import type { ManagedProcess, ProcessLauncher } from '../process-monitor/index.js';

export interface LocalRuntimeAdapter {
  kind: 'local';
}

export interface LocalRuntimeDependencies {
  clock: { now(): string };
  eventPublisher: EventPublisher;
  launcher: ProcessLauncher;
  preflight: RuntimePreflightCheck;
}

export class LocalNextflowRuntime implements RuntimeGateway {
  private readonly processes = new Map<string, ManagedProcess>();

  public constructor(private readonly dependencies: LocalRuntimeDependencies) {}

  public async startRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    return this.launch(run, command);
  }

  public async resumeRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    return this.launch(run, command);
  }

  public async stopRun(run: Run): Promise<RuntimeControlResult> {
    const process = this.processes.get(run.id);
    if (process) {
      process.kill('SIGTERM');
      this.processes.delete(run.id);
    }

    const acknowledgedAt = this.dependencies.clock.now();
    await this.dependencies.eventPublisher.publish({
      kind: 'status-changed',
      runId: run.id,
      status: 'canceled',
      occurredAt: acknowledgedAt,
      message: 'Run cancellation requested.'
    });

    return { runId: run.id, acknowledgedAt };
  }

  private async launch(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    if (!(await this.dependencies.preflight.validate())) {
      throw new Error('Nextflow executable preflight failed.');
    }

    const process = this.dependencies.launcher.launch(command.executable, command.args, {
      cwd: command.workingDirectory,
      env: command.environment
    });
    const startedAt = this.dependencies.clock.now();
    this.processes.set(run.id, process);
    process.onOutput((chunk) => {
      void this.dependencies.eventPublisher.publish({
        kind: 'log',
        runId: run.id,
        stream: chunk.stream,
        message: chunk.text,
        occurredAt: this.dependencies.clock.now()
      });
    });
    process.onExit((exitCode, signal) => {
      this.processes.delete(run.id);
      void this.dependencies.eventPublisher.publish({
        kind: 'status-changed',
        runId: run.id,
        status: exitCode === 0 ? 'succeeded' : signal === 'SIGTERM' ? 'canceled' : 'failed',
        occurredAt: this.dependencies.clock.now(),
        message: signal ? `Process exited with signal ${signal}.` : `Process exited with code ${exitCode}.`
      });
    });

    return { runId: run.id, startedAt, processId: process.pid };
  }
}