import type { ListArtifactsRequest, ListArtifactsResult } from '../dto/index.js';
import type { ListArtifactsUseCase } from '../ports/inbound/index.js';
import type { ArtifactGateway, RunRepository } from '../ports/outbound/index.js';

export class ListArtifactsService implements ListArtifactsUseCase {
  public constructor(
    private readonly runRepository: RunRepository,
    private readonly artifactGateway: ArtifactGateway
  ) {}

  public async execute(request: ListArtifactsRequest): Promise<ListArtifactsResult> {
    const run = await this.runRepository.getById(request.runId);
    if (!run) {
      throw new Error(`Run ${request.runId} was not found.`);
    }

    const artifacts = await this.artifactGateway.listForRun(run);
    return { run, artifacts };
  }
}