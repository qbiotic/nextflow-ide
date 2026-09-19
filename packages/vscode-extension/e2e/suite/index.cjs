const assert = require('node:assert/strict');
const vscode = require('vscode');

async function run() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder);
  assert.match(workspaceFolder.uri.fsPath, /minimal-pipeline$/);

  await vscode.commands.executeCommand('nextflowIde.runPipeline');
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const commands = await vscode.commands.getCommands(true);
  for (const command of [
    'nextflowIde.runPipeline',
    'nextflowIde.resumeRun',
    'nextflowIde.stopRun',
    'nextflowIde.showRunDetails',
    'nextflowIde.openArtifact'
  ]) {
    assert.ok(commands.includes(command), `Expected command ${command} to be registered.`);
  }
}

module.exports = { run };