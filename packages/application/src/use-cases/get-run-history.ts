import type { GetRunHistoryRequest, GetRunHistoryResult } from '../dto/index.js';
import type { GetRunHistoryUseCase } from '../ports/inbound/index.js';
import type { RunRepository } from '../ports/outbound/index.js';

export class GetRunHistoryService implements GetRunHistoryUseCase {
  public constructor(private readonly runRepository: RunRepository) {}

  public async execute(request: GetRunHistoryRequest): Promise<GetRunHistoryResult> {
    const runs = await this.runRepository.listByWorkspace(request.workspaceRoot);
    return {
      runs: [...runs].sort((left, right) =>
        right.timestamps.updatedAt.localeCompare(left.timestamps.updatedAt)
      )
    };
  }
}