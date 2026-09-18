import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const packageAliases = [
  'application',
  'domain',
  'lsp-adapters',
  'runtime-adapters',
  'state-adapters',
  'test-utils',
  'ui-contracts',
  'vscode-extension',
  'workspace-adapters'
] as const;

type PackageName = (typeof packageAliases)[number];

const allowedDependencies: Readonly<Record<PackageName, readonly PackageName[]>> = {
  application: ['domain'],
  domain: [],
  'lsp-adapters': ['application', 'domain'],
  'runtime-adapters': ['application', 'domain'],
  'state-adapters': ['application', 'domain'],
  'test-utils': ['application', 'domain'],
  'ui-contracts': ['application'],
  'vscode-extension': [
    'application',
    'domain',
    'lsp-adapters',
    'runtime-adapters',
    'state-adapters',
    'test-utils',
    'ui-contracts',
    'workspace-adapters'
  ],
  'workspace-adapters': ['application', 'domain']
};

function readTypeScriptFiles(relativeDirectory: string): string[] {
  const directory = resolve(repositoryRoot, relativeDirectory);
  const files: string[] = [];

  function visit(currentDirectory: string): void {
    for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = resolve(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(readFileSync(entryPath, 'utf8'));
      }
    }
  }

  visit(directory);
  return files;
}

function importedPackages(source: string): PackageName[] {
  const imports = source.matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g);
  return [...imports]
    .map((match) => match[1])
    .flatMap((specifier) => {
      const packageName = packageAliases.find(
        (candidate) => specifier === `@nextflow-ide/${candidate}`
      );
      return packageName ? [packageName] : [];
    });
}

describe('hexagonal dependency rules', () => {
  it.each(packageAliases)('enforces allowed dependencies for %s', (packageName) => {
    const sources = readTypeScriptFiles(`packages/${packageName}/src`);
    const dependencies = sources.flatMap(importedPackages);
    const forbiddenDependencies = dependencies.filter(
      (dependency) => !allowedDependencies[packageName].includes(dependency)
    );

    expect(forbiddenDependencies).toEqual([]);
  });

  it('keeps domain and application free from infrastructure APIs', () => {
    for (const packageName of ['domain', 'application'] as const) {
      const sources = readTypeScriptFiles(`packages/${packageName}/src`);
      const forbiddenImport = /(?:from|import\()\s*['"](?:vscode(?:\/|['"])|node:|docker(?:\/|['"]))/;

      expect(sources.some((source) => forbiddenImport.test(source))).toBe(false);
    }
  });

  it('keeps concrete adapter assembly in the extension package', () => {
    for (const packageName of [
      'lsp-adapters',
      'runtime-adapters',
      'state-adapters',
      'workspace-adapters'
    ] as const) {
      const sources = readTypeScriptFiles(`packages/${packageName}/src`);
      const importsExtension = sources.some((source) =>
        source.includes('@nextflow-ide/vscode-extension')
      );

      expect(importsExtension).toBe(false);
    }
  });
});