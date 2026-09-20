import { describe, expect, it } from 'vitest';
import {
  NextflowWorkspaceDetector,
  type WorkspaceFileSystem
} from '../src/project-detection/index.js';

class FakeWorkspaceFileSystem implements WorkspaceFileSystem {
  public constructor(
    private readonly files: ReadonlySet<string>,
    private readonly matches: readonly string[] = [],
    private readonly configText?: string
  ) {}

  public async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  public async readText(): Promise<string | undefined> {
    return this.configText;
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
      entrypointPaths: [entrypointPath],
      configPath: `${rootPath}/nextflow.config`,
      profileNames: [],
      modulePaths: [modulePath]
    });
  });

  it('returns no project when main.nf is absent', async () => {
    const detector = new NextflowWorkspaceDetector(new FakeWorkspaceFileSystem(new Set()));

    await expect(detector.detect('/workspace/empty')).resolves.toBeNull();
  });

  it('detects a nested pipeline when the workspace root has no main.nf', async () => {
    const workspaceRoot = '/workspace/repo';
    const rootPath = `${workspaceRoot}/examples/minimal-pipeline`;
    const entrypointPath = `${rootPath}/main.nf`;
    const detector = new NextflowWorkspaceDetector(
      new FakeWorkspaceFileSystem(new Set([entrypointPath]), [entrypointPath])
    );

    await expect(detector.detect(workspaceRoot)).resolves.toEqual({
      rootPath,
      entrypointPath,
      entrypointPaths: [entrypointPath],
      profileNames: [],
      modulePaths: []
    });
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
      entrypointPaths: [entrypointPath],
      profileNames: [],
      modulePaths: []
    });
  });

  it('discovers root entrypoints and profiles from nextflow.config', async () => {
    const rootPath = '/workspace/multi';
    const mainPath = `${rootPath}/main.nf`;
    const secondaryPath = `${rootPath}/secondary.nf`;
    const config = `profiles {\n  standard { process.executor = 'local' }\n  docker { process.container = 'ubuntu' }\n}`;
    const detector = new NextflowWorkspaceDetector(new FakeWorkspaceFileSystem(
      new Set([mainPath, `${rootPath}/nextflow.config`]),
      [mainPath, secondaryPath, `${rootPath}/modules/tool.nf`],
      config
    ));

    await expect(detector.detect(rootPath)).resolves.toEqual({
      rootPath,
      entrypointPath: mainPath,
      entrypointPaths: [mainPath, secondaryPath],
      configPath: `${rootPath}/nextflow.config`,
      profileNames: ['standard', 'docker'],
      modulePaths: [`${rootPath}/modules/tool.nf`]
    });
  });
});