import { describe, expect, it } from 'vitest';
import {
  NextflowWorkspaceDetector,
  type WorkspaceFileSystem
} from '../src/project-detection/index.js';

class FakeWorkspaceFileSystem implements WorkspaceFileSystem {
  public constructor(
    private readonly files: ReadonlySet<string>,
    private readonly matches: readonly string[] = []
  ) {}

  public async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  public async findFiles(): Promise<readonly string[]> {
    return this.matches;
  }
}

describe('NextflowWorkspaceDetector', () => {
  it('detects a project entrypoint, config, and module files', async () => {
    const rootPath = '/workspace/pipeline';
    const entrypointPath = `${rootPath}/main.nf`;
    const modulePath = `${rootPath}/modules/align.nf`;
    const detector = new NextflowWorkspaceDetector(
      new FakeWorkspaceFileSystem(
        new Set([entrypointPath, `${rootPath}/nextflow.config`]),
        [entrypointPath, modulePath]
      )
    );

    await expect(detector.detect(rootPath)).resolves.toEqual({
      rootPath,
      entrypointPath,
      configPath: `${rootPath}/nextflow.config`,
      profileNames: [],
      modulePaths: [modulePath]
    });
  });

  it('returns no project when main.nf is absent', async () => {
    const detector = new NextflowWorkspaceDetector(new FakeWorkspaceFileSystem(new Set()));

    await expect(detector.detect('/workspace/empty')).resolves.toBeNull();
  });

  it('allows a project without nextflow.config', async () => {
    const rootPath = '/workspace/minimal';
    const entrypointPath = `${rootPath}/main.nf`;
    const detector = new NextflowWorkspaceDetector(
      new FakeWorkspaceFileSystem(new Set([entrypointPath]), [entrypointPath])
    );

    await expect(detector.detect(rootPath)).resolves.toMatchObject({
      rootPath,
      entrypointPath,
      profileNames: [],
      modulePaths: []
    });
  });
});