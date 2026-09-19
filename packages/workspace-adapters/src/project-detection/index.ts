import { join } from 'node:path';
import type { WorkspaceProject } from '@nextflow-ide/domain';
import type { WorkspaceProjectGateway } from '@nextflow-ide/application';

export interface DetectedNextflowWorkspace {
  rootPath: string;
  entrypointPath?: string;
  configPath?: string;
}

export interface WorkspaceFileSystem {
  exists(path: string): Promise<boolean>;
  findFiles(rootPath: string, fileName: string): Promise<readonly string[]>;
}

export class NextflowWorkspaceDetector implements WorkspaceProjectGateway {
  public constructor(private readonly fileSystem: WorkspaceFileSystem) {}

  public async detect(workspaceRoot: string): Promise<WorkspaceProject | null> {
    const entrypointPath = join(workspaceRoot, 'main.nf');
    if (!(await this.fileSystem.exists(entrypointPath))) {
      return null;
    }

    const configPath = join(workspaceRoot, 'nextflow.config');
    const modulePaths = await this.fileSystem.findFiles(workspaceRoot, '*.nf');

    return {
      rootPath: workspaceRoot,
      entrypointPath,
      ...(await this.fileSystem.exists(configPath) ? { configPath } : {}),
      profileNames: [],
      modulePaths: modulePaths.filter((path) => path !== entrypointPath)
    };
  }
}