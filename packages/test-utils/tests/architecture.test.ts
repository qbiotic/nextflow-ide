import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '../../..');

function readTypeScriptFiles(relativeDirectory: string): string[] {
  const directory = resolve(repositoryRoot, relativeDirectory);
  return readFileSync(resolve(directory, 'index.ts'), 'utf8').split('\n');
}

describe('hexagonal dependency rules', () => {
  it('keeps domain entrypoints free from infrastructure imports', () => {
    const lines = readTypeScriptFiles('packages/domain/src');
    const forbiddenImport = /from ['"](?:vscode|node:child_process|node:fs|@nextflow-ide\/.*-adapters)/;

    expect(lines.some((line) => forbiddenImport.test(line))).toBe(false);
  });

  it('keeps application entrypoints free from infrastructure imports', () => {
    const lines = readTypeScriptFiles('packages/application/src');
    const forbiddenImport = /from ['"](?:vscode|node:child_process|node:fs|docker)/;

    expect(lines.some((line) => forbiddenImport.test(line))).toBe(false);
  });
});