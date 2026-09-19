import { dirname, join } from 'node:path';
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
  readText(path: string): Promise<string | undefined>;
}

export class NextflowWorkspaceDetector implements WorkspaceProjectGateway {
  public constructor(private readonly fileSystem: WorkspaceFileSystem) {}

  public async detect(workspaceRoot: string): Promise<WorkspaceProject | null> {
    const entrypointPath = join(workspaceRoot, 'main.nf');
    if (!(await this.fileSystem.exists(entrypointPath))) {
      return null;
    }

    const configPath = join(workspaceRoot, 'nextflow.config');
    const scriptPaths = await this.fileSystem.findFiles(workspaceRoot, '*.nf');
    const entrypointPaths = scriptPaths.filter((path) => dirname(path) === workspaceRoot);
    const selectedEntrypoint = entrypointPaths.includes(entrypointPath)
      ? entrypointPath
      : entrypointPaths[0] ?? entrypointPath;
    const configText = await this.fileSystem.readText(configPath);

    return {
      rootPath: workspaceRoot,
      entrypointPath: selectedEntrypoint,
      entrypointPaths: entrypointPaths.length > 0 ? entrypointPaths : [entrypointPath],
      ...(await this.fileSystem.exists(configPath) ? { configPath } : {}),
      profileNames: extractProfileNames(configText ?? ''),
      modulePaths: scriptPaths.filter((path) => !entrypointPaths.includes(path))
    };
  }
}

function extractProfileNames(configText: string): string[] {
  const profilesStart = configText.search(/\bprofiles\s*\{/m);
  if (profilesStart < 0) return [];
  const openingBrace = configText.indexOf('{', profilesStart);
  let depth = 0;
  let body = '';
  for (let index = openingBrace + 1; index < configText.length; index += 1) {
    const character = configText[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      if (depth === 0) break;
      depth -= 1;
    }
    body += character;
  }
  return [...body.matchAll(/^\s*([A-Za-z][\w-]*)\s*\{/gm)].map((match) => match[1]);
}