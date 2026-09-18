import type { RuntimeMode } from '../policies/index.js';

export const ARTIFACT_KINDS = ['report', 'trace', 'timeline'] as const;

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export type RunStatus =
  | 'queued'
  | 'starting'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'resumable';

export interface WorkspaceProject {
  rootPath: string;
  entrypointPath: string;
  configPath?: string;
  profileNames: readonly string[];
  modulePaths: readonly string[];
}

export interface RunConfiguration {
  workspaceRoot: string;
  entrypointPath: string;
  runtimeMode: RuntimeMode;
  profileNames: readonly string[];
  paramsFilePath?: string;
  workingDirectory?: string;
  outputDirectory?: string;
  resumeEnabled: boolean;
  args: readonly string[];
  environment: Readonly<Record<string, string>>;
}

export interface RunTimestamps {
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface RunFailure {
  message: string;
  code?: string | number;
  recoverable: boolean;
}

export interface ArtifactRecord {
  kind: ArtifactKind;
  available: boolean;
  path?: string;
}

export interface Run {
  id: string;
  configuration: RunConfiguration;
  status: RunStatus;
  commandLine?: string;
  artifacts: readonly ArtifactRecord[];
  timestamps: RunTimestamps;
  failure?: RunFailure;
}