# Extension E2E Smoke Test

The smoke test uses `@vscode/test-electron` to launch an Extension Development Host with `examples/minimal-pipeline` as the workspace. The suite exports the `run()` contract expected by VS Code 1.138's extension test runner.

Run it from the repository root with:

```bash
pnpm run test:e2e
```

The test verifies that the MVP commands are registered and invokes `nextflowIde.runPipeline` against the local fixture. It is intentionally separate from the fast Vitest suite because it starts a real VS Code instance.
