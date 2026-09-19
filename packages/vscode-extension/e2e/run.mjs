import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const extensionDevelopmentPath = path.resolve(currentDirectory, '..');
const extensionTestsPath = path.resolve(currentDirectory, 'suite/index.cjs');
const fixturePath = path.resolve(currentDirectory, '../../../examples/minimal-pipeline');

try {
  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [fixturePath]
  });
} catch (error) {
  console.error('VS Code extension smoke test failed.', error);
  process.exitCode = 1;
}
