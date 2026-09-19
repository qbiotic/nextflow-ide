import type { ArtifactKind } from '@nextflow-ide/domain';
import { join } from 'node:path';
import type { ArtifactGateway } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';
import type { WorkspaceFileSystem } from '../project-detection/index.js';

export interface ArtifactLocation {
  kind: ArtifactKind;
  path: string;
  exists: boolean;
}

const ARTIFACT_FILES: Readonly<Record<ArtifactKind, string>> = {
  report: 'report.html',
  trace: 'trace.txt',
  timeline: 'timeline.html'
};

export class WorkspaceArtifactGateway implements ArtifactGateway {
  public constructor(private readonly fileSystem: WorkspaceFileSystem) {}

  public async listForRun(run: Run) {
    const rootPath = run.configuration.outputDirectory ?? run.configuration.workspaceRoot;
    return Promise.all(
      (Object.entries(ARTIFACT_FILES) as [ArtifactKind, string][]).map(async ([kind, fileName]) => {
        const path = join(rootPath, fileName);
        const available = await this.fileSystem.exists(path);
        return { kind, available, ...(available ? { path } : {}) };
      })
    );
  }
}