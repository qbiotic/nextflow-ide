import type {
  DetectWorkspaceRequest,
  DetectWorkspaceResult,
  GetRunHistoryRequest,
  GetRunHistoryResult,
  GetRunDetailsRequest,
  GetRunDetailsResult,
  ListArtifactsRequest,
  ListArtifactsResult,
  ResumeRunRequest,
  ResumeRunResult,
  RunPipelineRequest,
  RunPipelineResult,
  StopRunRequest,
  StopRunResult
} from '../../dto/index.js';

export interface RunPipelineUseCase {
  execute(request: RunPipelineRequest): Promise<RunPipelineResult>;
}

export interface ResumeRunUseCase {
  execute(request: ResumeRunRequest): Promise<ResumeRunResult>;
}

export interface StopRunUseCase {
  execute(request: StopRunRequest): Promise<StopRunResult>;
}

export interface DetectWorkspaceUseCase {
  execute(request: DetectWorkspaceRequest): Promise<DetectWorkspaceResult>;
}

export interface GetRunHistoryUseCase {
  execute(request: GetRunHistoryRequest): Promise<GetRunHistoryResult>;
}

export interface GetRunDetailsUseCase {
  execute(request: GetRunDetailsRequest): Promise<GetRunDetailsResult>;
}

export interface ListArtifactsUseCase {
  execute(request: ListArtifactsRequest): Promise<ListArtifactsResult>;
}