import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { StateStore } from './index.js';

export class FileStateStore implements StateStore {
  private readonly filePath: string;

  public constructor(rootPath: string) {
    this.filePath = join(rootPath, '.qbiotic-flow', 'state.json');
  }

  public async read<T>(key: string): Promise<T | undefined> {
    try {
      const contents = await readFile(this.filePath, 'utf8');
      const state = JSON.parse(contents) as Record<string, unknown>;
      return state[key] as T | undefined;
    } catch {
      return undefined;
    }
  }

  public async write<T>(key: string, value: T): Promise<void> {
    let state: Record<string, unknown> = {};
    try {
      state = JSON.parse(await readFile(this.filePath, 'utf8')) as Record<string, unknown>;
    } catch {
      state = {};
    }
    state[key] = value;
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(state), 'utf8');
  }
}