export interface RunPipelineRequest {
  workspaceRoot: string;
  entrypointPath: string;
  runtimeMode: 'local' | 'docker';
}

export interface ResumeRunRequest {
  runId: string;
}

export interface StopRunRequest {
  runId: string;
}