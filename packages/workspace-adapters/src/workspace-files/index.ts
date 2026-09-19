import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { WorkspaceFileSystem } from '../project-detection/index.js';

export interface WorkspaceFileSnapshot {
  path: string;
  exists: boolean;
}

export class NodeWorkspaceFileSystem implements WorkspaceFileSystem {
  public async readText(path: string): Promise<string | undefined> {
    try {
      return await readFile(path, 'utf8');
    } catch {
      return undefined;
    }
  }

  public async exists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }

  public async findFiles(rootPath: string, fileName: string): Promise<readonly string[]> {
    const matches: string[] = [];
    await this.collectFiles(rootPath, fileName, matches);
    return matches;
  }

  private async collectFiles(
    directoryPath: string,
    fileName: string,
    matches: string[]
  ): Promise<void> {
    let entries;
    try {
      entries = await readdir(directoryPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        await this.collectFiles(entryPath, fileName, matches);
      } else if (fileName === '*.nf' && entry.name.endsWith('.nf')) {
        matches.push(entryPath);
      } else if (entry.name === fileName) {
        matches.push(entryPath);
      }
    }
  }
}