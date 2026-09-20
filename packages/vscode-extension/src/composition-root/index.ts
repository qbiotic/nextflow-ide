import type * as vscode from 'vscode';
import { GetRunDetailsService, GetRunHistoryService, ListArtifactsService, ResumeRunService, RunPipelineService, StopRunService } from '@nextflow-ide/application';
import type { ExecutionEvent } from '@nextflow-ide/domain';
import { DockerExecutablePreflight, DockerNextflowRuntime, NextflowCommandBuilder, LocalNextflowRuntime, NextflowExecutablePreflight, NodeProcessLauncher, RuntimeRouter } from '@nextflow-ide/runtime-adapters';
import { FileStateStore, MementoRunRepository } from '@nextflow-ide/state-adapters';
import { NodeWorkspaceFileSystem, NextflowWorkspaceDetector, WorkspaceArtifactGateway } from '@nextflow-ide/workspace-adapters';

export interface ExtensionCompositionRoot {
  runPipeline: RunPipelineService;
  resumeRun: ResumeRunService;
  stopRun: StopRunService;
  getRunHistory: GetRunHistoryService;
  getRunDetails: GetRunDetailsService;
  listArtifacts: ListArtifactsService;
  recoverInterruptedRuns(workspaceRoot: string): Promise<void>;
  setRunChangedListener(listener: () => void): void;
}

export function createExtensionCompositionRoot(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel,
  logs: vscode.OutputChannel,
  sharedStateRoot: string
): ExtensionCompositionRoot {
  const legacyStateStore = {
    read: async <T>(key: string): Promise<T | undefined> => context.workspaceState.get<T>(key),
    write: async <T>(key: string, value: T): Promise<void> => {
      await context.workspaceState.update(key, value);
    }
  };
  const fileStateStore = new FileStateStore(sharedStateRoot);
  const stateStore = {
    read: async <T>(key: string): Promise<T | undefined> =>
      (await fileStateStore.read<T>(key)) ?? legacyStateStore.read<T>(key),
    write: async <T>(key: string, value: T): Promise<void> => {
      await Promise.all([fileStateStore.write(key, value), legacyStateStore.write(key, value)]);
    }
  };
  const runRepository = new MementoRunRepository(stateStore);
  let runChangedListener = (): void => {};
  const pendingTerminalEvents = new Map<string, ExecutionEvent & { kind: 'status-changed' }>();
  const eventPublisher = {
    publish: async (event: ExecutionEvent): Promise<void> => {
      const status = 'status' in event ? ` ${event.status}` : '';
      const message = 'message' in event ? ` ${event.message}` : '';
      output.appendLine(`[${event.kind}] ${event.runId}${status}${message}`);
      if (event.kind === 'log') {
        logs.appendLine(`[${event.stream}] ${event.message}`);
      }
      if (event.kind === 'started') {
        const pendingEvent = pendingTerminalEvents.get(event.runId);
        if (pendingEvent) {
          pendingTerminalEvents.delete(event.runId);
          const run = await runRepository.getById(event.runId);
          if (run) {
            const terminal = pendingEvent.status === 'succeeded' || pendingEvent.status === 'failed' || pendingEvent.status === 'canceled';
            await runRepository.update({
              ...run,
              status: pendingEvent.status,
              timestamps: {
                ...run.timestamps,
                updatedAt: pendingEvent.occurredAt,
                ...(terminal ? { completedAt: pendingEvent.occurredAt } : {})
              },
              ...(pendingEvent.status === 'failed'
                ? { failure: { message: pendingEvent.message ?? 'The process failed.', recoverable: true } }
                : { failure: undefined })
            });
            runChangedListener();
          }
        }
      }
      if (event.kind === 'status-changed') {
        const run = await runRepository.getById(event.runId);
        if (!run) return;

        pendingTerminalEvents.set(event.runId, event);

        const terminal = event.status === 'succeeded' || event.status === 'failed' || event.status === 'canceled';
        await runRepository.update({
          ...run,
          status: event.status,
          timestamps: {
            ...run.timestamps,
            updatedAt: event.occurredAt,
            ...(terminal ? { completedAt: event.occurredAt } : {})
          },
          ...(event.status === 'failed'
            ? { failure: { message: event.message ?? 'The process failed.', recoverable: true } }
            : { failure: undefined })
        });
        runChangedListener();
      }
    }
  };
  const clock = { now: (): string => new Date().toISOString() };
  const idGenerator = { next: (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  const commandBuilder = new NextflowCommandBuilder();
  const localRuntime = new LocalNextflowRuntime({
    clock,
    eventPublisher,
    launcher: new NodeProcessLauncher(),
    preflight: new NextflowExecutablePreflight('nextflow')
  });
  const dockerRuntime = new DockerNextflowRuntime({
    clock,
    eventPublisher,
    launcher: new NodeProcessLauncher(),
    preflight: new DockerExecutablePreflight()
  });
  const runtime = new RuntimeRouter(localRuntime, dockerRuntime);
  const workspaceFileSystem = new NodeWorkspaceFileSystem();
  const sharedRuntimeDependencies = {
    eventPublisher,
    runtimeCommandFactory: commandBuilder,
    runtimeGateway: runtime
  };

  return {
    runPipeline: new RunPipelineService({
      clock,
      idGenerator,
      runRepository,
      ...sharedRuntimeDependencies
    }),
    resumeRun: new ResumeRunService({
      clock,
      runRepository,
      ...sharedRuntimeDependencies
    }),
    stopRun: new StopRunService({
      clock,
      eventPublisher,
      runRepository,
      runtimeGateway: runtime
    }),
    getRunHistory: new GetRunHistoryService(runRepository),
    getRunDetails: new GetRunDetailsService(runRepository),
    listArtifacts: new ListArtifactsService(
      runRepository,
      new WorkspaceArtifactGateway(workspaceFileSystem)
    ),
    setRunChangedListener(listener: () => void): void {
      runChangedListener = listener;
    },
    async recoverInterruptedRuns(workspaceRoot: string): Promise<void> {
      const runs = await runRepository.listByWorkspace(workspaceRoot);
      const interruptedAt = clock.now();
      await Promise.all(runs
        .filter((run) => run.status === 'queued' || run.status === 'starting' || run.status === 'running')
        .map((run) => runRepository.update({
          ...run,
          status: 'canceled',
          timestamps: {
            ...run.timestamps,
            updatedAt: interruptedAt,
            completedAt: interruptedAt
          },
          failure: {
            message: 'Run interrupted when qbiotic-flow was reloaded.',
            recoverable: true
          }
        })));
    }
  };
}

export function createWorkspaceDetector(): NextflowWorkspaceDetector {
  return new NextflowWorkspaceDetector(new NodeWorkspaceFileSystem());
}