import type {
  DetectWorkspaceRequest,
  DetectWorkspaceResult
} from '../dto/index.js';
import type { DetectWorkspaceUseCase } from '../ports/inbound/index.js';
import type { WorkspaceProjectGateway } from '../ports/outbound/index.js';

export class DetectWorkspaceService implements DetectWorkspaceUseCase {
  public constructor(private readonly workspaceProjectGateway: WorkspaceProjectGateway) {}

  public async execute(request: DetectWorkspaceRequest): Promise<DetectWorkspaceResult> {
    const project = await this.workspaceProjectGateway.detect(request.workspaceRoot);

    return project
      ? { project }
      : { project: null, reason: 'not-nextflow-workspace' };
  }
}