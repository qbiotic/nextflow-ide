import type { GetRunDetailsRequest, GetRunDetailsResult } from '../dto/index.js';
import type { GetRunDetailsUseCase } from '../ports/inbound/index.js';
import type { RunRepository } from '../ports/outbound/index.js';

export class GetRunDetailsService implements GetRunDetailsUseCase {
  public constructor(private readonly runRepository: RunRepository) {}

  public async execute(request: GetRunDetailsRequest): Promise<GetRunDetailsResult> {
    const run = await this.runRepository.getById(request.runId);
    if (!run) {
      throw new Error(`Run ${request.runId} was not found.`);
    }

    return { run };
  }
}