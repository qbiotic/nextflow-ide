import type {
  ExecutionEvent,
  Run,
  RunConfiguration,
  WorkspaceProject
} from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import type { PreparedRunCommand } from '../src/dto/index.js';
import { DetectWorkspaceService } from '../src/use-cases/detect-workspace.js';
import { RunPipelineService } from '../src/use-cases/run-pipeline.js';
import type {
  Clock,
  EventPublisher,
  IdGenerator,
  RunRepository,
  RuntimeCommandFactory,
  RuntimeGateway,
  WorkspaceProjectGateway
} from '../src/ports/outbound/index.js';

const configuration: RunConfiguration = {
  workspaceRoot: '/workspace/pipeline',
  entrypointPath: '/workspace/pipeline/main.nf',
  runtimeMode: 'local',
  profileNames: [],
  resumeEnabled: false,
  args: [],
  environment: {}
};

const command: PreparedRunCommand = {
  executable: 'nextflow',
  args: ['run', '/workspace/pipeline/main.nf'],
  workingDirectory: '/workspace/pipeline',
  environment: {},
  displayCommand: 'nextflow run /workspace/pipeline/main.nf'
};

class FixedClock implements Clock {
  public now(): string {
    return '2026-09-18T23:00:00.000Z';
  }
}

class FixedIdGenerator implements IdGenerator {
  public next(): string {
    return 'run-001';
  }
}

class RecordingRepository implements RunRepository {
  public saved: Run[] = [];
  public updated: Run[] = [];

  public async getById(): Promise<Run | null> {
    return this.saved[0] ?? null;
  }

  public async listByWorkspace(): Promise<readonly Run[]> {
    return this.saved;
  }

  public async save(run: Run): Promise<void> {
    this.saved.push(run);
  }

  public async update(run: Run): Promise<void> {
    this.updated.push(run);
  }
}

class RecordingRuntimeCommandFactory implements RuntimeCommandFactory {
  public async prepareRunCommand(): Promise<PreparedRunCommand> {
    return command;
  }

  public async prepareResumeCommand(): Promise<PreparedRunCommand> {
    return command;
  }
}

class RecordingRuntimeGateway implements RuntimeGateway {
  public started: Run[] = [];

  public async startRun(run: Run): Promise<{ runId: string; startedAt: string }> {
    this.started.push(run);
    return { runId: run.id, startedAt: '2026-09-18T23:00:01.000Z' };
  }

  public async resumeRun(): Promise<{ runId: string; startedAt: string }> {
    return { runId: 'run-001', startedAt: '2026-09-18T23:00:01.000Z' };
  }

  public async stopRun(): Promise<{ runId: string; acknowledgedAt: string }> {
    return { runId: 'run-001', acknowledgedAt: '2026-09-18T23:00:01.000Z' };
  }
}

class RecordingEventPublisher implements EventPublisher {
  public events: ExecutionEvent[] = [];

  public async publish(event: ExecutionEvent): Promise<void> {
    this.events.push(event);
  }
}

class FixedWorkspaceGateway implements WorkspaceProjectGateway {
  public constructor(private readonly project: WorkspaceProject | null) {}

  public async detect(): Promise<WorkspaceProject | null> {
    return this.project;
  }
}

describe('DetectWorkspaceService', () => {
  it('returns the detected project through the application boundary', async () => {
    const project: WorkspaceProject = {
      rootPath: '/workspace/pipeline',
      entrypointPath: '/workspace/pipeline/main.nf',
      profileNames: ['standard'],
      modulePaths: []
    };

    const service = new DetectWorkspaceService(new FixedWorkspaceGateway(project));

    await expect(service.execute({ workspaceRoot: project.rootPath })).resolves.toEqual({
      project
    });
  });

  it('returns a typed reason when no project is found', async () => {
    const service = new DetectWorkspaceService(new FixedWorkspaceGateway(null));

    await expect(service.execute({ workspaceRoot: '/workspace/empty' })).resolves.toEqual({
      project: null,
      reason: 'not-nextflow-workspace'
    });
  });
});

describe('RunPipelineService', () => {
  it('persists a queued run, starts it, and publishes its running event', async () => {
    const repository = new RecordingRepository();
    const runtime = new RecordingRuntimeGateway();
    const publisher = new RecordingEventPublisher();
    const service = new RunPipelineService({
      clock: new FixedClock(),
      eventPublisher: publisher,
      idGenerator: new FixedIdGenerator(),
      runRepository: repository,
      runtimeCommandFactory: new RecordingRuntimeCommandFactory(),
      runtimeGateway: runtime
    });

    const result = await service.execute({
      configuration,
      initiatedBy: 'command-palette'
    });

    expect(repository.saved[0]?.status).toBe('queued');
    expect(runtime.started[0]?.id).toBe('run-001');
    expect(repository.updated[0]).toMatchObject({
      id: 'run-001',
      status: 'running',
      commandLine: command.displayCommand
    });
    expect(publisher.events[0]).toMatchObject({
      kind: 'started',
      runId: 'run-001',
      status: 'running'
    });
    expect(result.run.status).toBe('running');
    expect(result.command).toEqual(command);
  });

  it('does not persist a run when command preparation fails', async () => {
    const repository = new RecordingRepository();
    const service = new RunPipelineService({
      clock: new FixedClock(),
      eventPublisher: new RecordingEventPublisher(),
      idGenerator: new FixedIdGenerator(),
      runRepository: repository,
      runtimeCommandFactory: {
        prepareRunCommand: async () => {
          throw new Error('nextflow is unavailable');
        },
        prepareResumeCommand: async () => command
      },
      runtimeGateway: new RecordingRuntimeGateway()
    });

    await expect(
      service.execute({ configuration, initiatedBy: 'command-palette' })
    ).rejects.toThrow('nextflow is unavailable');
    expect(repository.saved).toHaveLength(0);
  });
});