const assert = require('node:assert/strict');
const vscode = require('vscode');

suite('Nextflow IDE extension smoke tests', () => {
  test('registers MVP commands in an Extension Development Host', async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes('nextflowIde.runPipeline'));
    assert.ok(commands.includes('nextflowIde.resumeRun'));
    assert.ok(commands.includes('nextflowIde.stopRun'));
    assert.ok(commands.includes('nextflowIde.showRunDetails'));
    assert.ok(commands.includes('nextflowIde.openArtifact'));
  });

  test('executes the local Run Pipeline command for the fixture workspace', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder);
    assert.match(workspaceFolder.uri.fsPath, /minimal-pipeline$/);

    await vscode.commands.executeCommand('nextflowIde.runPipeline');
    await new Promise((resolve) => setTimeout(resolve, 2500));
  });
});