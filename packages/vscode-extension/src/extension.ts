import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import * as vscode from 'vscode';
import {
  createExtensionCompositionRoot,
  createWorkspaceDetector
} from './composition-root/index.js';
import {
  RESUME_RUN_COMMAND,
  RUN_PIPELINE_COMMAND,
  STOP_RUN_COMMAND,
  SHOW_RUN_DETAILS_COMMAND,
  OPEN_ARTIFACT_COMMAND,
  SELECT_WORKSPACE_ROOT_COMMAND
} from './commands/index.js';
import { RunsTreeDataProvider } from './views/runs-tree.js';

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('qbiotic-flow');
  const logs = vscode.window.createOutputChannel('qbiotic-flow Logs');
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const compositionRoot = createExtensionCompositionRoot(
    context,
    output,
    logs,
    workspaceRoot ? findSharedStateRoot(workspaceRoot) : context.extensionPath
  );
  const detector = createWorkspaceDetector();
  let selectedWorkspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const runsProvider = new RunsTreeDataProvider(
    compositionRoot.getRunHistory,
    () => selectedWorkspaceRoot,
    async (workspaceRoot) => (await detector.detect(workspaceRoot))?.rootPath ?? workspaceRoot
  );
  compositionRoot.setRunChangedListener(() => runsProvider.refresh());
  for (const workspaceFolder of vscode.workspace.workspaceFolders ?? []) {
    void compositionRoot.recoverInterruptedRuns(workspaceFolder.uri.fsPath).then(() => runsProvider.refresh());
  }

  context.subscriptions.push(
    output,
    logs,
    vscode.window.registerTreeDataProvider('nextflowIde.runs', runsProvider),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      const roots = vscode.workspace.workspaceFolders ?? [];
      if (!roots.some((folder) => folder.uri.fsPath === selectedWorkspaceRoot)) {
        selectedWorkspaceRoot = roots[0]?.uri.fsPath;
        runsProvider.setWorkspaceRoot(selectedWorkspaceRoot);
      }
    }),
    vscode.commands.registerCommand(RUN_PIPELINE_COMMAND, async () => {
      output.show(false);
      output.appendLine('Run Pipeline command invoked.');
      try {
        const workspaceFolder = await selectWorkspaceFolder();
        if (!workspaceFolder) {
          void vscode.window.showWarningMessage('Open a workspace containing a Nextflow pipeline first.');
          output.appendLine('Run aborted: no workspace folder is open.');
          return;
        }

        const project = await detector.detect(workspaceFolder.uri.fsPath);
        if (!project) {
          void vscode.window.showWarningMessage('No main.nf was found in the workspace root.');
          output.appendLine(`Run aborted: no main.nf found in ${workspaceFolder.uri.fsPath}.`);
          return;
        }

        const result = await compositionRoot.runPipeline.execute({
          configuration: {
            workspaceRoot: project.rootPath,
            entrypointPath: await requestEntrypoint(project.entrypointPaths, project.entrypointPath),
            runtimeMode: 'local',
            profileNames: await requestProfiles(project.profileNames),
            paramsFilePath: await requestParamsFile(project.rootPath),
            workingDirectory: project.rootPath,
            resumeEnabled: false,
            args: [],
            environment: {}
          },
          initiatedBy: 'command-palette'
        });
        output.appendLine(`Started ${result.run.id}: ${result.command.displayCommand}`);
        runsProvider.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to start the pipeline.';
        void vscode.window.showErrorMessage(message);
        output.appendLine(`Run failed: ${message}`);
      }
    }),
    vscode.commands.registerCommand(RESUME_RUN_COMMAND, async (runId?: string) => {
      if (!runId) {
        void vscode.window.showWarningMessage('Select a run id to resume.');
        return;
      }

      try {
        const result = await compositionRoot.resumeRun.execute({
          runId,
          initiatedBy: 'command-palette'
        });
        output.show(true);
        output.appendLine(`Resumed ${result.run.id}: ${result.command.displayCommand}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to resume the run.';
        void vscode.window.showErrorMessage(message);
        output.appendLine(`Resume failed: ${message}`);
      }
    }),
    vscode.commands.registerCommand(STOP_RUN_COMMAND, async (runId?: string) => {
      if (!runId) {
        void vscode.window.showWarningMessage('Select a run id to stop.');
        return;
      }

      try {
        const result = await compositionRoot.stopRun.execute({ runId });
        output.show(true);
        output.appendLine(`Stopped ${result.run.id}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to stop the run.';
        void vscode.window.showErrorMessage(message);
        output.appendLine(`Stop failed: ${message}`);
      }
    }),
    vscode.commands.registerCommand(SHOW_RUN_DETAILS_COMMAND, async (runId?: string) => {
      if (!runId) {
        void vscode.window.showWarningMessage('Select a run to inspect.');
        return;
      }

      try {
        const { run } = await compositionRoot.getRunDetails.execute({ runId });
        const { artifacts } = await compositionRoot.listArtifacts.execute({ runId });
        const panel = vscode.window.createWebviewPanel(
          'nextflowIde.runDetails',
          `Run ${run.id}`,
          vscode.ViewColumn.Active,
          { enableScripts: false, enableCommandUris: true }
        );
        panel.webview.html = renderRunDetails(run, artifacts);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load run details.';
        void vscode.window.showErrorMessage(message);
      }
    }),
    vscode.commands.registerCommand(OPEN_ARTIFACT_COMMAND, async (runId?: string, kind?: string) => {
      if (!runId || !kind) {
        void vscode.window.showWarningMessage('Select an artifact to open.');
        return;
      }

      try {
        const { artifacts } = await compositionRoot.listArtifacts.execute({ runId });
        const artifact = artifacts.find(
          (candidate) => candidate.kind === kind && candidate.available && candidate.path
        );
        if (!artifact?.path) {
          void vscode.window.showWarningMessage(`Artifact ${kind} is not available for run ${runId}.`);
          return;
        }

        await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(artifact.path));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to open the artifact.';
        void vscode.window.showErrorMessage(message);
      }
    }),
    vscode.commands.registerCommand(SELECT_WORKSPACE_ROOT_COMMAND, async () => {
      const roots = vscode.workspace.workspaceFolders ?? [];
      if (roots.length < 2) {
        void vscode.window.showInformationMessage('The workspace has only one root folder.');
        return;
      }

      const selection = await vscode.window.showQuickPick(
        roots.map((folder) => ({ label: folder.name, description: folder.uri.fsPath, folder })),
        { placeHolder: 'Select the root used by Nextflow Runs' }
      );
      if (selection) {
        selectedWorkspaceRoot = selection.folder.uri.fsPath;
        runsProvider.setWorkspaceRoot(selectedWorkspaceRoot);
      }
    })
  );
}

function findSharedStateRoot(startPath: string): string {
  let currentPath = startPath;
  while (true) {
    if (existsSync(join(currentPath, '.git'))) return currentPath;
    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) return startPath;
    currentPath = parentPath;
  }
}

async function selectWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length <= 1) {
    return folders[0];
  }

  const selected = await vscode.window.showQuickPick(
    folders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath, folder })),
    { placeHolder: 'Select the Nextflow workspace root' }
  );
  return selected?.folder;
}

async function requestProfiles(defaultProfiles: readonly string[]): Promise<readonly string[]> {
  const value = await vscode.window.showInputBox({
    prompt: 'Nextflow profiles (comma-separated, optional)',
    value: defaultProfiles.join(',')
  });
  return (value ?? defaultProfiles.join(','))
    .split(',')
    .map((profile) => profile.trim())
    .filter(Boolean);
}

async function requestEntrypoint(
  entrypointPaths: readonly string[],
  defaultEntrypoint: string
): Promise<string> {
  const browseLabel = 'Browse for another .nf file...';
  const selection = await vscode.window.showQuickPick(
    [
      ...entrypointPaths.map((path) => ({
        label: basename(path),
        description: path,
        path
      })),
      { label: browseLabel, description: 'Choose a Nextflow file outside the detected project', path: undefined }
    ],
    { title: 'Select Nextflow entrypoint', placeHolder: defaultEntrypoint }
  );

  if (!selection) return defaultEntrypoint;
  if (selection.path) return selection.path;

  const browsed = await vscode.window.showOpenDialog({
    title: 'Select Nextflow entrypoint',
    defaultUri: vscode.Uri.file(defaultEntrypoint),
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: 'Use Entrypoint',
    filters: { 'Nextflow files': ['nf'] }
  });
  return browsed?.[0]?.fsPath ?? defaultEntrypoint;
}

async function requestParamsFile(workspaceRoot: string): Promise<string | undefined> {
  const browseLabel = 'Browse for a params file...';
  const selection = await vscode.window.showQuickPick(
    [
      { label: 'No params file', description: 'Run without a params file', path: undefined },
      { label: browseLabel, description: 'Choose an optional JSON or YAML file', path: browseLabel }
    ],
    { title: 'Select optional params file', placeHolder: 'No params file' }
  );

  if (!selection?.path) return undefined;

  const browsed = await vscode.window.showOpenDialog({
    title: 'Select optional params file',
    defaultUri: vscode.Uri.file(workspaceRoot),
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: 'Use Params File',
    filters: { 'Parameter files': ['json', 'yaml', 'yml'] }
  });
  return browsed?.[0]?.fsPath;
}

function renderRunDetails(
  run: import('@nextflow-ide/domain').Run,
  artifacts: readonly import('@nextflow-ide/domain').ArtifactRecord[]
): string {
  const configuration = run.configuration;
  return `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><title>Run ${escapeHtml(run.id)}</title></head>
  <body>
    <h1>Run ${escapeHtml(run.id)}</h1>
    <dl>
      <dt>Status</dt><dd>${escapeHtml(run.status)}</dd>
      <dt>Runtime</dt><dd>${escapeHtml(configuration.runtimeMode)}</dd>
      <dt>Entrypoint</dt><dd>${escapeHtml(configuration.entrypointPath)}</dd>
      <dt>Created</dt><dd>${escapeHtml(run.timestamps.createdAt)}</dd>
      <dt>Updated</dt><dd>${escapeHtml(run.timestamps.updatedAt)}</dd>
      <dt>Command</dt><dd><code>${escapeHtml(run.commandLine ?? 'Not started')}</code></dd>
      <dt>Artifacts</dt><dd>${artifacts.map((artifact) => artifact.available && artifact.path
        ? `<a href="command:nextflowIde.openArtifact?${encodeURIComponent(JSON.stringify([run.id, artifact.kind]))}">${escapeHtml(artifact.kind)}</a>: ${escapeHtml(artifact.path)}`
        : `${escapeHtml(artifact.kind)}: not found`).join('<br>')}</dd>
    </dl>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function deactivate(): void {}