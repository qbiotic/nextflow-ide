import type * as vscode from 'vscode';
import { GetRunHistoryService, ResumeRunService, RunPipelineService, StopRunService } from '@nextflow-ide/application';
import type { ExecutionEvent } from '@nextflow-ide/domain';
import { NextflowCommandBuilder, LocalNextflowRuntime, NextflowExecutablePreflight, NodeProcessLauncher } from '@nextflow-ide/runtime-adapters';
import { MementoRunRepository } from '@nextflow-ide/state-adapters';
import { NodeWorkspaceFileSystem, NextflowWorkspaceDetector } from '@nextflow-ide/workspace-adapters';

export interface ExtensionCompositionRoot {
  runPipeline: RunPipelineService;
  resumeRun: ResumeRunService;
  stopRun: StopRunService;
  getRunHistory: GetRunHistoryService;
}

export function createExtensionCompositionRoot(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel
): ExtensionCompositionRoot {
  const stateStore = {
    read: async <T>(key: string): Promise<T | undefined> => context.workspaceState.get<T>(key),
    write: async <T>(key: string, value: T): Promise<void> => {
      await context.workspaceState.update(key, value);
    }
  };
  const eventPublisher = {
    publish: async (event: ExecutionEvent): Promise<void> => {
      const status = 'status' in event ? ` ${event.status}` : '';
      const message = 'message' in event ? ` ${event.message}` : '';
      output.appendLine(`[${event.kind}] ${event.runId}${status}${message}`);
    }
  };
  const clock = { now: (): string => new Date().toISOString() };
  const idGenerator = { next: (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  const commandBuilder = new NextflowCommandBuilder();
  const runtime = new LocalNextflowRuntime({
    clock,
    eventPublisher,
    launcher: new NodeProcessLauncher(),
    preflight: new NextflowExecutablePreflight('nextflow')
  });
  const runRepository = new MementoRunRepository(stateStore);
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
    getRunHistory: new GetRunHistoryService(runRepository)
  };
}

export function createWorkspaceDetector(): NextflowWorkspaceDetector {
  return new NextflowWorkspaceDetector(new NodeWorkspaceFileSystem());
}