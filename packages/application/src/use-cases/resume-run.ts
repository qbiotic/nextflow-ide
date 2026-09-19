import type { Run } from '@nextflow-ide/domain';
import type { ResumeRunRequest, ResumeRunResult } from '../dto/index.js';
import type { ResumeRunUseCase } from '../ports/inbound/index.js';
import type { Clock, EventPublisher, RunRepository, RuntimeCommandFactory, RuntimeGateway } from '../ports/outbound/index.js';

export interface ResumeRunDependencies {
  clock: Clock;
  eventPublisher: EventPublisher;
  runRepository: RunRepository;
  runtimeCommandFactory: RuntimeCommandFactory;
  runtimeGateway: RuntimeGateway;
}

export class ResumeRunService implements ResumeRunUseCase {
  public constructor(private readonly dependencies: ResumeRunDependencies) {}

  public async execute(request: ResumeRunRequest): Promise<ResumeRunResult> {
    const run = await this.dependencies.runRepository.getById(request.runId);
    if (!run) {
      throw new Error(`Cannot resume unknown run ${request.runId}.`);
    }
    if (run.status !== 'failed' && run.status !== 'resumable') {
      throw new Error(`Run ${run.id} is not resumable from status ${run.status}.`);
    }

    const command = await this.dependencies.runtimeCommandFactory.prepareResumeCommand(run);
    const launch = await this.dependencies.runtimeGateway.resumeRun(run, command);
    const resumedRun: Run = {
      ...run,
      status: 'running',
      commandLine: command.displayCommand,
      failure: undefined,
      timestamps: {
        ...run.timestamps,
        updatedAt: launch.startedAt,
        startedAt: launch.startedAt,
        completedAt: undefined
      }
    };

    await this.dependencies.runRepository.update(resumedRun);
    await this.dependencies.eventPublisher.publish({
      kind: 'started',
      runId: resumedRun.id,
      status: 'running',
      commandLine: command.displayCommand,
      occurredAt: launch.startedAt
    });

    return { run: resumedRun, command };
  }
}