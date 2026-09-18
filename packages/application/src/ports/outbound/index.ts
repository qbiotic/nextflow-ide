export interface RuntimeGateway {
  prepare(): Promise<void>;
}

export interface RunRepository {
  save(): Promise<void>;
}

export interface WorkspaceProjectGateway {
  inspect(): Promise<void>;
}

export interface ArtifactGateway {
  discover(): Promise<void>;
}