import type { ResumeRunRequest, RunPipelineRequest, StopRunRequest } from '../../dto/index.js';

export interface RunPipelineUseCase {
  execute(request: RunPipelineRequest): Promise<void>;
}

export interface ResumeRunUseCase {
  execute(request: ResumeRunRequest): Promise<void>;
}

export interface StopRunUseCase {
  execute(request: StopRunRequest): Promise<void>;
}

export interface DetectWorkspaceUseCase {
  execute(workspaceRoot: string): Promise<void>;
}