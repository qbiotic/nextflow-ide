import * as vscode from 'vscode';
import type { GetRunHistoryUseCase } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';

export class RunsTreeDataProvider implements vscode.TreeDataProvider<RunTreeItem | RunsMessageItem> {
  private readonly changeEmitter = new vscode.EventEmitter<RunTreeItem | RunsMessageItem | undefined | void>();
  public readonly onDidChangeTreeData = this.changeEmitter.event;

  public constructor(
    private readonly getRunHistory: GetRunHistoryUseCase,
    private readonly workspaceRoot: () => string | undefined
  ) {}

  public refresh(): void {
    this.changeEmitter.fire();
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
      const result = await this.getRunHistory.execute({ workspaceRoot });
      return result.runs.length > 0
        ? result.runs.map((run) => new RunTreeItem(run))
        : [new RunsMessageItem('No runs yet.')];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load runs.';
      return [new RunsMessageItem(`Error: ${message}`)];
    }
  }
}

export class RunsMessageItem extends vscode.TreeItem {
  public constructor(message: string) {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'nextflowRuns.message';
    this.iconPath = new vscode.ThemeIcon('info');
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