import * as vscode from 'vscode';
import {
  createExtensionCompositionRoot,
  createWorkspaceDetector
} from './composition-root/index.js';
import {
  RESUME_RUN_COMMAND,
  RUN_PIPELINE_COMMAND,
  STOP_RUN_COMMAND
} from './commands/index.js';
import { RunsTreeDataProvider } from './views/runs-tree.js';

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Nextflow IDE');
  const compositionRoot = createExtensionCompositionRoot(context, output);
  const runsProvider = new RunsTreeDataProvider(
    compositionRoot.getRunHistory,
    () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  );

  context.subscriptions.push(
    output,
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
    })
  );
}

export function deactivate(): void {}