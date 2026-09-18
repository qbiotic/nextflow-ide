import type { Run, RunConfiguration } from '@nextflow-ide/domain';
import type { RunPipelineRequest, RunPipelineResult } from '../dto/index.js';
import type { RunPipelineUseCase } from '../ports/inbound/index.js';
import type {
  Clock,
  EventPublisher,
  IdGenerator,
  RunRepository,
  RuntimeCommandFactory,
  RuntimeGateway
} from '../ports/outbound/index.js';

export interface RunPipelineDependencies {
  clock: Clock;
  eventPublisher: EventPublisher;
  idGenerator: IdGenerator;
  runRepository: RunRepository;
  runtimeCommandFactory: RuntimeCommandFactory;
  runtimeGateway: RuntimeGateway;
}

export class RunPipelineService implements RunPipelineUseCase {
  public constructor(private readonly dependencies: RunPipelineDependencies) {}

  public async execute(request: RunPipelineRequest): Promise<RunPipelineResult> {
    const { configuration } = request;
    const command = await this.dependencies.runtimeCommandFactory.prepareRunCommand(configuration);
    const createdAt = this.dependencies.clock.now();
    const queuedRun = this.createQueuedRun(configuration, createdAt);

    await this.dependencies.runRepository.save(queuedRun);

    const launch = await this.dependencies.runtimeGateway.startRun(queuedRun, command);
    const runningRun: Run = {
      ...queuedRun,
      status: 'running',
      commandLine: command.displayCommand,
      timestamps: {
        ...queuedRun.timestamps,
        startedAt: launch.startedAt,
        updatedAt: launch.startedAt
      }
    };

    await this.dependencies.runRepository.update(runningRun);
    await this.dependencies.eventPublisher.publish({
      kind: 'started',
      runId: runningRun.id,
      status: 'running',
      commandLine: command.displayCommand,
      occurredAt: launch.startedAt
    });

    return { run: runningRun, command };
  }

  private createQueuedRun(configuration: RunConfiguration, createdAt: string): Run {
    return {
      id: this.dependencies.idGenerator.next(),
      configuration,
      status: 'queued',
      artifacts: [],
      timestamps: {
        createdAt,
        updatedAt: createdAt
      }
    };
  }
}