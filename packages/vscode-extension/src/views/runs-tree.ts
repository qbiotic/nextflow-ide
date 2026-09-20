import * as vscode from 'vscode';
import type { GetRunHistoryUseCase } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';
import { toRunListItems } from './run-list-model.js';

export class RunsTreeDataProvider implements vscode.TreeDataProvider<RunTreeItem | RunsMessageItem> {
  private readonly changeEmitter = new vscode.EventEmitter<RunTreeItem | RunsMessageItem | undefined | void>();
  public readonly onDidChangeTreeData = this.changeEmitter.event;

  public constructor(
    private readonly getRunHistory: GetRunHistoryUseCase,
    private workspaceRoot: () => string | undefined,
    private readonly resolveProjectRoot: (workspaceRoot: string) => Promise<string>
  ) {}

  public refresh(): void {
    this.changeEmitter.fire();
  }

  public setWorkspaceRoot(workspaceRoot: string | undefined): void {
    this.workspaceRoot = () => workspaceRoot;
    this.refresh();
  }

  public getTreeItem(element: RunTreeItem | RunsMessageItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(): Promise<Array<RunTreeItem | RunsMessageItem>> {
    const workspaceRoot = this.workspaceRoot();
    if (!workspaceRoot) {
      return [new RunsMessageItem('Open a workspace to view runs.')];
    }

    try {
      const projectRoot = await this.resolveProjectRoot(workspaceRoot);
      const result = await this.getRunHistory.execute({ workspaceRoot: projectRoot });
      return result.runs.length > 0
        ? toRunListItems(result.runs).map(({ id }) => new RunTreeItem(result.runs.find((run) => run.id === id)!))
        : [new RunsMessageItem('No runs yet.')];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load runs.';
      return [new RunsMessageItem(`Error: ${message}`)];
    }
  }
}

export class RunsMessageItem extends vscode.TreeItem {
  public constructor(message: string, command?: string) {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'qbioticFlowRuns.message';
    this.iconPath = new vscode.ThemeIcon('info');
    if (command) {
      this.command = { command, title: 'Run Pipeline' };
    }
  }
}

export class RunTreeItem extends vscode.TreeItem {
  public constructor(public readonly run: Run) {
    super(run.id, vscode.TreeItemCollapsibleState.None);
    this.description = run.status;
    this.tooltip = run.commandLine ?? run.configuration.entrypointPath;
    this.contextValue = `nextflowRun.${run.status}`;
    this.command = {
      command: 'nextflowIde.showRunDetails',
      title: 'Show Run Details',
      arguments: [run.id]
    };
  }
}