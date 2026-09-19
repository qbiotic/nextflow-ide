import * as vscode from 'vscode';
import {
  createExtensionCompositionRoot,
  createWorkspaceDetector
} from './composition-root/index.js';
import {
  RESUME_RUN_COMMAND,
  RUN_PIPELINE_COMMAND,
  STOP_RUN_COMMAND,
  SHOW_RUN_DETAILS_COMMAND
} from './commands/index.js';
import { RunsTreeDataProvider } from './views/runs-tree.js';

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Nextflow IDE');
  const logs = vscode.window.createOutputChannel('Nextflow Logs');
  const compositionRoot = createExtensionCompositionRoot(context, output, logs);
  const runsProvider = new RunsTreeDataProvider(
    compositionRoot.getRunHistory,
    () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  );

  context.subscriptions.push(
    output,
    logs,
    vscode.window.registerTreeDataProvider('nextflowIde.runs', runsProvider),
    vscode.commands.registerCommand(RUN_PIPELINE_COMMAND, async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        void vscode.window.showWarningMessage('Open a workspace containing a Nextflow pipeline first.');
        return;
      }

      const detector = createWorkspaceDetector();
      const project = await detector.detect(workspaceFolder.uri.fsPath);
      if (!project) {
        void vscode.window.showWarningMessage('No main.nf was found in the workspace root.');
        return;
      }

      output.show(true);
      try {
        const result = await compositionRoot.runPipeline.execute({
          configuration: {
            workspaceRoot: project.rootPath,
            entrypointPath: project.entrypointPath,
            runtimeMode: 'local',
            profileNames: project.profileNames,
            workingDirectory: project.rootPath,
            resumeEnabled: false,
            args: [],
            environment: {}
          },
          initiatedBy: 'command-palette'
        });
        output.appendLine(`Started ${result.run.id}: ${result.command.displayCommand}`);
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
          { enableScripts: false }
        );
        panel.webview.html = renderRunDetails(run, artifacts);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load run details.';
        void vscode.window.showErrorMessage(message);
      }
    })
  );
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
      <dt>Artifacts</dt><dd>${artifacts.map((artifact) => `${escapeHtml(artifact.kind)}: ${artifact.available ? escapeHtml(artifact.path ?? 'available') : 'not found'}`).join('<br>')}</dd>
    </dl>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function deactivate(): void {}