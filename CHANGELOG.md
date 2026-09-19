# Changelog

All notable changes to the Nextflow IDE for VS Code are documented in this file.

## [Unreleased] 2026-09-??

### feature/multi-root-ui-params

- Added multi-root workspace selection to the Run Pipeline command.
- Added optional comma-separated profile input and params-file input.
- Added a framework-free run-list view model with sorting/status tests.
- Removed the duplicate unused e2e suite entrypoint.
- Updated extension READMEs, implementation plan, backlog, and changelog state.

### feature/run-pipelines (continued)

- Implemented `GetRunHistoryService` with workspace filtering and newest-first sorting.
- Added the `Nextflow Runs` Explorer tree view backed by `RunsTreeDataProvider`.
- Added application coverage for run history ordering.
- Added `.vscode/launch.json` and `.vscode/tasks.json` for Extension Development Host smoke testing.
- Added `examples/minimal-pipeline` as a reproducible local Nextflow fixture.
- Verified the fixture runs successfully with Nextflow 26.04.6 using a temporary work directory.
- Implemented `GetRunDetailsService` and a read-only run details webview.
- Added the `nextflowIde.showRunDetails` command to run tree items.
- Added the dedicated `Nextflow Logs` output channel for stdout and stderr events.
- Implemented `ListArtifactsService` and `WorkspaceArtifactGateway` for report, trace, and timeline discovery.
- Added normalized artifact availability and paths to run details.
- Added `nextflowIde.openArtifact` with validation through `ListArtifactsService` before opening a file.
- Added 2 artifact gateway tests and expanded application coverage to 11 tests.
- Implemented Docker runtime routing and Docker availability preflight.
- Added persistence migration boundary for schema version 1.
- Added explicit empty and error items to the Runs view.
- Added the real `@vscode/test-electron` smoke harness and verified it against the minimal fixture.
- Added quickstart, compatibility matrix, beta checklist, and privacy/telemetry defaults.
- Added the MVP PRD, official-extension coexistence contract, and NFR baseline.
- Added multi-root workspace selection and optional profile/params-file input to `Run Pipeline`.
- Added `nextflowIde.selectWorkspaceRoot` and independent root selection for the Runs view.
- Pinned the default Docker image to the published `nextflow/nextflow:26.04.6` tag after validating Docker Hub availability.
- Fixed Docker invocation to call `nextflow` explicitly through the image entrypoint wrapper.
- Added `workspaceContains:main.nf` project-scoped activation without requiring the official Nextflow extension.
- Completed persistence migration boundary and view-model coverage status in the backlog.
- Synchronized the implementation plan and audit with the completed MVP surfaces.
- Updated application and extension view READMEs, backlog, and technical audit.

### feature/run-pipelines

- Wired the VS Code composition root to application, workspace, state, command-builder, and local-runtime adapters.
- Added the `nextflowIde.runPipeline` command to the extension manifest and activation events.
- Added local run configuration from the first workspace folder and `main.nf` detection.
- Added the `Nextflow IDE` output channel for command previews, runtime logs, statuses, and errors.
- Added `nextflowIde.resumeRun` and `nextflowIde.stopRun` command contributions.
- Implemented `ResumeRunService` and `StopRunService` with persistence, runtime control, and lifecycle events.
- Expanded application coverage to 7 use-case tests.
- Added VS Code API typings and TypeScript project references for the extension package.
- Updated extension READMEs, backlog, implementation plan, and technical audit.

### feature/local-runtime

- Implemented `LocalNextflowRuntime` behind `RuntimeGateway`.
- Added injectable `ProcessLauncher` and `ManagedProcess` abstractions.
- Added `NodeProcessLauncher` for local child-process execution.
- Added Nextflow executable preflight through `nextflow -version`.
- Added stdout/stderr event publication, exit-code status mapping, process tracking, and SIGTERM cancellation.
- Added 3 local runtime tests and verified 6 runtime adapter tests pass in total.
- Updated runtime READMEs, backlog, implementation plan, and technical audit.

### feature/run-repository

- Implemented versioned run persistence through `MementoRunRepository` and the infrastructure-neutral `StateStore` port.
- Added schema version 1 serialization for run-history envelopes.
- Added workspace filtering, run lookup, save, update, invalid-state handling, and unknown-run protection.
- Added 3 persistence tests and a state-adapters Nx test target.
- Updated state adapter READMEs, backlog, and technical audit.

### feature/command-builder

- Implemented `NextflowWorkspaceDetector` with an injected filesystem port.
- Added `NodeWorkspaceFileSystem` for production workspace discovery.
- Detects required `main.nf`, optional `nextflow.config`, and module `.nf` files.
- Implemented `NextflowCommandBuilder` for local and Docker execution modes.
- Added support for profiles, params files, resume, custom arguments, working directories, environment values, and display-safe command previews.
- Added 3 workspace detection tests and 3 command-builder tests.
- Updated adapter READMEs, backlog, implementation plan, and technical audit.

### feature/application-use-cases

- Implemented `DetectWorkspaceService` with typed positive and negative detection results.
- Implemented `RunPipelineService` with command preparation, queued-run persistence, runtime launch, running-state update, and started-event publication.
- Added isolated application tests using fake ports for workspace detection and pipeline launch behavior.
- Added an application Nx test target and verified 4 application tests pass.
- Updated application READMEs, backlog, and technical audit to reflect the implemented use cases and the next adapter work.

### feature/arq-rules

- Implemented recursive architecture checks across all nine Nx packages.
- Enforced the dependency matrix: `domain` has no package dependencies, `application` depends only on `domain`, adapters depend on core contracts, and `vscode-extension` remains the composition root.
- Blocked infrastructure imports from `domain` and `application`, including VS Code, Node.js infrastructure APIs, Docker, and concrete adapters.
- Blocked adapter packages from depending on `vscode-extension`.
- Updated architecture READMEs and the technical audit to document the enforced rules and their validation strategy.
- Marked the architecture-rules backlog item as complete and synchronized the implementation plan and audit status.
- Verified 11 architecture tests, the complete test suite, the global typecheck, and `git diff --check`.

### Product and Architecture

- Defined the MVP workflow: Edit -> Run -> Logs -> Resume.
- Defined the initial runtime scope: local macOS/Linux execution and Docker support.
- Established coexistence with the official Nextflow VS Code extension as an additive integration.
- Documented the product vision, MVP scope, non-goals, phased roadmap, pending decisions, and technical architecture.
- Adopted hexagonal architecture (Ports and Adapters) as a repository-wide constraint.
- Defined dependency direction: domain -> application contracts -> adapters, with the VS Code extension as the composition root.
- Documented the design patterns used by the system: Use Case/Application Service, Strategy, Factory, State Machine, Repository, Anti-Corruption Layer, Observer, and Dependency Injection.
- Added an actionable MVP technical audit with repository readiness findings, package boundaries, implementation order, and acceptance checks.

### Monorepo and Nx Scaffold

- Created the Nx and TypeScript monorepo foundation under `packages/`.
- Added the following Nx projects:
  - `domain`
  - `application`
  - `runtime-adapters`
  - `workspace-adapters`
  - `state-adapters`
  - `lsp-adapters`
  - `ui-contracts`
  - `test-utils`
  - `vscode-extension`
- Added package path aliases and TypeScript project references.
- Added root `build`, `typecheck`, and `test` scripts.
- Added project tags describing core, adapter, shared, test, and extension responsibilities.
- Added a minimal VS Code extension package with activation and composition-root placeholders.
- Removed obsolete empty scaffold directories that did not represent architectural sections.

### Domain and Application Contracts

- Added the canonical domain model for:
  - `WorkspaceProject`
  - `RunConfiguration`
  - `Run`
  - `ArtifactRecord`
  - `RunFailure`
  - `ExecutionEvent`
- Added supported runtime and artifact policies.
- Added run lifecycle statuses and transition validation.
- Added `DomainInvariantError` for invalid state transitions.
- Added typed inbound application ports for workspace detection, run, resume, stop, history, and artifact listing.
- Added typed outbound ports for runtime execution, command creation, persistence, workspace inspection, artifact discovery, event publishing, IDs, and time.
- Centralized artifact kinds in the domain instead of defining them inside an adapter.
- Added TypeScript project references for packages importing the domain contract.

### Testing

- Added Vitest as the unit-test runner.
- Added Nx test targets for the domain and test-utils projects.
- Added domain state-machine tests covering valid transitions, invalid transitions, resumable failures, and terminal statuses.
- Added architecture tests preventing domain and application entrypoints from importing infrastructure APIs.
- Expanded architecture tests to scan all TypeScript source files and enforce the package dependency matrix and composition-root boundary.
- Completed the architecture-rules slice on the `feature/arq-rules` branch with recursive dependency checks for all nine packages.
- Added a Node test environment and ESM-compatible `vitest.config.mts`.
- Verified the initial suite: 6 tests passing.
- Verified the global TypeScript typecheck for all 9 Nx projects.

### Documentation

- Translated project documentation and filenames to English.
- Added package-level READMEs for all 9 Nx projects.
- Added section-level READMEs for domain, application, runtime, workspace, state, LSP, UI, test utility, and extension areas.
- Added Mermaid diagrams describing data flow, dependency direction, state transitions, persistence, adapters, and extension composition.
- Added documentation synchronization rules requiring affected READMEs and governing documents to be updated with every implementation change.
- Updated the README, backlog, implementation plan, technical audit, and pending decisions to match the current repository state.

### Validation

- Confirmed that Nx discovers all 9 projects.
- Confirmed that the complete initial test suite passes.
- Confirmed that the complete typecheck passes.
- Confirmed that the repository diff passes `git diff --check`.
