import type { ArtifactRecord, Run, RunConfiguration, WorkspaceProject } from '@nextflow-ide/domain';

export interface DetectWorkspaceRequest {
  workspaceRoot: string;
}

export interface DetectWorkspaceResult {
  project: WorkspaceProject | null;
  reason?: 'not-nextflow-workspace' | 'multiple-entrypoints-unresolved';
}

export interface PreparedRunCommand {
  executable: string;
  args: readonly string[];
  workingDirectory: string;
  environment: Readonly<Record<string, string>>;
  displayCommand: string;
}

export interface RunPipelineRequest {
  configuration: RunConfiguration;
  initiatedBy: 'command-palette' | 'webview' | 'rerun';
}

export interface RunPipelineResult {
  run: Run;
  command: PreparedRunCommand;
}

export interface ResumeRunRequest {
  runId: string;
  initiatedBy: 'command-palette' | 'webview' | 'rerun';
}

export interface ResumeRunResult {
  run: Run;
  command: PreparedRunCommand;
}

export interface StopRunRequest {
  runId: string;
}

export interface StopRunResult {
  run: Run;
}

export interface GetRunHistoryRequest {
  workspaceRoot: string;
}

export interface GetRunHistoryResult {
  runs: readonly Run[];
}

export interface ListArtifactsRequest {
  runId: string;
}

export interface ListArtifactsResult {
  run: Run;
  artifacts: readonly ArtifactRecord[];
}