import * as vscode from 'vscode';
import type { GetRunHistoryUseCase } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';

export class RunsTreeDataProvider implements vscode.TreeDataProvider<RunTreeItem> {
  private readonly changeEmitter = new vscode.EventEmitter<RunTreeItem | undefined | void>();
  public readonly onDidChangeTreeData = this.changeEmitter.event;

  public constructor(
    private readonly getRunHistory: GetRunHistoryUseCase,
    private readonly workspaceRoot: () => string | undefined
  ) {}

  public refresh(): void {
    this.changeEmitter.fire();
  }

  public getTreeItem(element: RunTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(): Promise<RunTreeItem[]> {
    const workspaceRoot = this.workspaceRoot();
    if (!workspaceRoot) {
      return [];
    }

    const result = await this.getRunHistory.execute({ workspaceRoot });
    return result.runs.map((run) => new RunTreeItem(run));
  }
}

export class RunTreeItem extends vscode.TreeItem {
  public constructor(public readonly run: Run) {
    super(run.id, vscode.TreeItemCollapsibleState.None);
    this.description = run.status;
    this.tooltip = run.commandLine ?? run.configuration.entrypointPath;
    this.contextValue = `nextflowRun.${run.status}`;
  }
}