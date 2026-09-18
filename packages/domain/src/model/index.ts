export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | 'resumable';

export interface WorkspaceProject {
  rootPath: string;
  entrypointPath: string;
  configPath?: string;
}

export interface RunRecord {
  id: string;
  workspaceRoot: string;
  entrypointPath: string;
  status: RunStatus;
}

export interface ArtifactRecord {
  kind: 'report' | 'trace' | 'timeline';
  path: string;
  available: boolean;
}