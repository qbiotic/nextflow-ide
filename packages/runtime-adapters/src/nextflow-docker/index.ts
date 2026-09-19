import type { PreparedRunCommand, RuntimeGateway, RuntimeLaunchResult, RuntimeControlResult, EventPublisher } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';
import type { RuntimePreflightCheck } from '../preflight/index.js';
import type { ManagedProcess, ProcessLauncher } from '../process-monitor/index.js';

export interface DockerRuntimeAdapter {
  kind: 'docker';
}

export interface DockerRuntimeDependencies {
  clock: { now(): string };
  eventPublisher: EventPublisher;
  launcher: ProcessLauncher;
  preflight: RuntimePreflightCheck;
}

export class DockerNextflowRuntime implements RuntimeGateway {
  private readonly processes = new Map<string, ManagedProcess>();

  public constructor(private readonly dependencies: DockerRuntimeDependencies) {}

  public startRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    return this.launch(run, command);
  }

  public resumeRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    return this.launch(run, command);
  }

  public async stopRun(run: Run): Promise<RuntimeControlResult> {
    this.processes.get(run.id)?.kill('SIGTERM');
    this.processes.delete(run.id);
    const acknowledgedAt = this.dependencies.clock.now();
    await this.dependencies.eventPublisher.publish({
      kind: 'status-changed',
      runId: run.id,
      status: 'canceled',
      occurredAt: acknowledgedAt,
      message: 'Docker run cancellation requested.'
    });
    return { runId: run.id, acknowledgedAt };
  }

  private async launch(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    if (!(await this.dependencies.preflight.validate())) {
      throw new Error('Docker preflight failed. Ensure Docker is running.');
    }
    const process = this.dependencies.launcher.launch(command.executable, command.args, {
      cwd: command.workingDirectory,
      env: command.environment
    });
    const startedAt = this.dependencies.clock.now();
    this.processes.set(run.id, process);
    process.onOutput((chunk) => void this.dependencies.eventPublisher.publish({
      kind: 'log', runId: run.id, stream: chunk.stream, message: chunk.text,
      occurredAt: this.dependencies.clock.now()
    }));
    process.onExit((exitCode, signal) => {
      this.processes.delete(run.id);
      void this.dependencies.eventPublisher.publish({
        kind: 'status-changed', runId: run.id,
        status: exitCode === 0 ? 'succeeded' : signal === 'SIGTERM' ? 'canceled' : 'failed',
        occurredAt: this.dependencies.clock.now(),
        message: signal ? `Docker exited with signal ${signal}.` : `Docker exited with code ${exitCode}.`
      });
    });
    return { runId: run.id, startedAt, processId: process.pid };
  }
}