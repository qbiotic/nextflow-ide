import type { Run } from '@nextflow-ide/domain';
import type { StopRunRequest, StopRunResult } from '../dto/index.js';
import type { StopRunUseCase } from '../ports/inbound/index.js';
import type { Clock, EventPublisher, RunRepository, RuntimeGateway } from '../ports/outbound/index.js';

export interface StopRunDependencies {
  clock: Clock;
  eventPublisher: EventPublisher;
  runRepository: RunRepository;
  runtimeGateway: RuntimeGateway;
}

export class StopRunService implements StopRunUseCase {
  public constructor(private readonly dependencies: StopRunDependencies) {}

  public async execute(request: StopRunRequest): Promise<StopRunResult> {
    const run = await this.dependencies.runRepository.getById(request.runId);
    if (!run) {
      throw new Error(`Cannot stop unknown run ${request.runId}.`);
    }
    if (!['queued', 'starting', 'running', 'resumable'].includes(run.status)) {
      throw new Error(`Run ${run.id} cannot be stopped from status ${run.status}.`);
    }

    const control = await this.dependencies.runtimeGateway.stopRun(run);
    const stoppedRun: Run = {
      ...run,
      status: 'canceled',
      timestamps: {
        ...run.timestamps,
        updatedAt: control.acknowledgedAt,
        completedAt: control.acknowledgedAt
      }
    };

    await this.dependencies.runRepository.update(stoppedRun);
    await this.dependencies.eventPublisher.publish({
      kind: 'status-changed',
      runId: stoppedRun.id,
      status: 'canceled',
      occurredAt: control.acknowledgedAt,
      message: 'Run stopped.'
    });

    return { run: stoppedRun };
  }
}