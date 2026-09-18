import type { ExecutionEvent, Run, WorkspaceProject, ArtifactRecord } from '@nextflow-ide/domain';
import type { PreparedRunCommand } from '../../dto/index.js';

export interface RuntimeLaunchResult {
  runId: string;
  startedAt: string;
  processId?: number;
}

export interface RuntimeControlResult {
  runId: string;
  acknowledgedAt: string;
}

export interface RuntimeCommandFactory {
  prepareRunCommand(configuration: Run['configuration']): Promise<PreparedRunCommand>;
  prepareResumeCommand(run: Run): Promise<PreparedRunCommand>;
}

export interface RuntimeGateway {
  startRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult>;
  resumeRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult>;
  stopRun(run: Run): Promise<RuntimeControlResult>;
}

export interface RunRepository {
  getById(runId: string): Promise<Run | null>;
  listByWorkspace(workspaceRoot: string): Promise<readonly Run[]>;
  save(run: Run): Promise<void>;
  update(run: Run): Promise<void>;
}

export interface WorkspaceProjectGateway {
  detect(workspaceRoot: string): Promise<WorkspaceProject | null>;
}

export interface ArtifactGateway {
  listForRun(run: Run): Promise<readonly ArtifactRecord[]>;
}

export interface EventPublisher {
  publish(event: ExecutionEvent): Promise<void>;
}

export interface IdGenerator {
  next(): string;
}

export interface Clock {
  now(): string;
}