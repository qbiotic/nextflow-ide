# MVP Technical Audit

## Executive Summary

The repository has completed the foundational scaffold for the MVP and is now ready to begin implementing the first real application slice.

What is already in place:

- Clear product direction for the MVP: Edit -> Run -> Logs -> Resume.
- A documented requirement to use hexagonal architecture and explicit design patterns.
- An Nx and TypeScript workspace with the first package boundaries already scaffolded.
- A prioritized backlog and phased implementation plan.
- A nine-project monorepo skeleton under `packages/` aligned to the intended architecture.
- Canonical run, artifact, and workspace contracts in `domain` and typed MVP ports in `application`.
- Vitest configured through Nx for domain unit tests and architecture tests.
- Recursive architecture tests enforce the package dependency matrix and composition-root boundary.
- Package and section READMEs established as implementation deliverables.
- MVP PRD, official-extension contract, NFR baseline, compatibility matrix, quickstart, and beta checklist are documented.

What is still missing:

- Rich project-scoped multi-root activation and broader view polish.
- Manual Docker and official-extension compatibility validation on release machines.
- Release hardening, packaging, and beta feedback operations.

The MVP implementation now includes workspace detection, deterministic local/Docker commands, versioned persistence, local/Docker runtime routing, Run/Resume/Stop commands, Runs tree view, run details, dedicated logs, artifact discovery/opening, explicit empty/error states, and a real VS Code Extension Development Host smoke test. The remaining work is release hardening, richer multi-root activation, and a manual Docker/official-extension compatibility pass.

## Current State Assessment

### Verified facts

- `pnpm nx show projects` returns nine projects.
- `packages/` now contains the core, adapter, test, and extension package skeletons.
- `pnpm-workspace.yaml` keeps the workspace scoped to `packages/*`.
- `pnpm run typecheck`, `pnpm run build`, `pnpm test`, and `pnpm run test:e2e` pass for the current MVP slice.

### Audit Findings

1. The executable monorepo structure and MVP execution path now exist; remaining work is release hardening and broader compatibility.
2. The repository has crossed the scaffolding threshold and must now prevent drift between code and documentation on every step.
3. The package-first layout under `packages/*` is now the canonical repository structure and should replace any older `apps/` sketches.
4. The MVP run model, runtime ports, local/Docker adapters, and composition root are implemented.
5. The extension composition root is wired to the MVP use cases and adapters.
6. Architecture tests now enforce forbidden imports, package dependency direction, and the composition-root boundary.
7. The repository now has enough canonical contracts to start implementing the first use cases without reopening structural decisions.
8. Tests and documentation now have an explicit toolchain and ownership boundary, but coverage must expand with each implementation slice.

### Readiness Verdict

- Ready for Sprint 0 foundation work: Completed.
- Ready for feature implementation of Run/Resume/Logs: Yes, starting from the domain and application core.
- Main blocker category: implementation depth and architecture enforcement, not repository scaffolding.

## Recommended Folder Structure

The workspace now keeps all first-class Nx projects under `packages/`, which matches `pnpm-workspace.yaml` and avoids widening the repository before a concrete need exists.

```text
packages/
  vscode-extension/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      extension.ts
      composition-root/
      commands/
      views/
      activation/

  domain/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      model/
      services/
      policies/
      events/
      errors/
      index.ts

  application/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      ports/
        inbound/
        outbound/
      use-cases/
      dto/
      mappers/
      index.ts

  runtime-adapters/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      nextflow-local/
      nextflow-docker/
      process-monitor/
      command-builder/
      preflight/
      index.ts

  workspace-adapters/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      project-detection/
      workspace-files/
      artifacts/
      index.ts

  state-adapters/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      vscode-memento/
      serializers/
      migrations/
      index.ts

  lsp-adapters/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      nextflow-extension/
      project-model/
      index.ts

  ui-contracts/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      messages/
      view-models/
      index.ts

  test-utils/
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    src/
      fixtures/
      builders/
      fake-ports/
      index.ts
```

## Recommended Nx Project Map

Current scaffold status:

- `domain`: scaffolded
- `application`: scaffolded
- `runtime-adapters`: scaffolded
- `workspace-adapters`: scaffolded
- `state-adapters`: scaffolded
- `lsp-adapters`: scaffolded
- `ui-contracts`: scaffolded
- `test-utils`: scaffolded
- `vscode-extension`: scaffolded

### 1. `@nextflow-ide/domain`

Responsibility:

- Pure domain model.
- Run state machine.
- Validation policies.
- Artifact and run entities.

Allowed dependencies:

- None beyond TypeScript and standard utility packages already accepted by the core.

Forbidden dependencies:

- VS Code APIs.
- Node child process APIs.
- Docker libraries.
- Filesystem adapters.

### 2. `@nextflow-ide/application`

Responsibility:

- Inbound and outbound ports.
- MVP use cases such as `DetectWorkspace`, `RunPipeline`, `ResumeRun`, `StopRun`, `GetRunHistory`, and `ListArtifacts`.
- DTOs exchanged with adapters.

Allowed dependencies:

- `@nextflow-ide/domain`

### 3. `@nextflow-ide/runtime-adapters`

Responsibility:

- Local Nextflow runtime strategy.
- Docker runtime strategy.
- Deterministic command builder.
- Process monitoring and log chunk translation.
- Preflight checks.

Allowed dependencies:

- `@nextflow-ide/application`
- `@nextflow-ide/domain`

### 4. `@nextflow-ide/workspace-adapters`

Responsibility:

- Workspace detection.
- Entry-point discovery.
- Artifact path discovery and normalization.
- File-system-backed project reads.

Allowed dependencies:

- `@nextflow-ide/application`
- `@nextflow-ide/domain`

### 5. `@nextflow-ide/state-adapters`

Responsibility:

- `workspaceState` and `globalState` repositories.
- Schema versioning and migrations.
- Persistence serialization.

Allowed dependencies:

- `@nextflow-ide/application`
- `@nextflow-ide/domain`

### 6. `@nextflow-ide/lsp-adapters`

Responsibility:

- Anti-corruption layer around the official Nextflow extension or LSP metadata.
- Translation into the internal project model.

Allowed dependencies:

- `@nextflow-ide/application`
- `@nextflow-ide/domain`

### 7. `@nextflow-ide/ui-contracts`

Responsibility:

- Typed message contracts between extension host and webviews.
- View-model contracts shared by inbound adapters and UI.

Allowed dependencies:

- `@nextflow-ide/application`

### 8. `@nextflow-ide/test-utils`

Responsibility:

- Builders, fixtures, and fake adapters for tests.

Allowed dependencies:

- `@nextflow-ide/domain`
- `@nextflow-ide/application`

### 9. `@nextflow-ide/vscode-extension`

Responsibility:

- Extension manifest and activation.
- Composition root.
- Command registration.
- Tree views, log output channel, and webview lifecycle.

Allowed dependencies:

- All adapter packages.
- `@nextflow-ide/application`
- `@nextflow-ide/ui-contracts`

## Dependency Rules

The exact dependency direction should be:

```text
vscode-extension -> application
vscode-extension -> ui-contracts
vscode-extension -> runtime-adapters
vscode-extension -> workspace-adapters
vscode-extension -> state-adapters
vscode-extension -> lsp-adapters

runtime-adapters -> application -> domain
workspace-adapters -> application -> domain
state-adapters -> application -> domain
lsp-adapters -> application -> domain
ui-contracts -> application
test-utils -> application -> domain
```

Hard rule:

- `domain` imports nothing from any adapter.
- `application` imports nothing from `vscode`, `node:child_process`, `node:fs`, Docker tooling, or extension-specific code.
- Only `vscode-extension` knows how concrete adapters are instantiated.

## Nx Generators and Project Types

Use Nx libraries for all core and adapter packages, and one package for the extension entrypoint.

Recommended initial project types:

- `domain`: buildable TypeScript library.
- `application`: buildable TypeScript library.
- `runtime-adapters`: buildable TypeScript library.
- `workspace-adapters`: buildable TypeScript library.
- `state-adapters`: buildable TypeScript library.
- `lsp-adapters`: buildable TypeScript library.
- `ui-contracts`: buildable TypeScript library.
- `test-utils`: non-publishable internal TypeScript library.
- `vscode-extension`: buildable TypeScript package with VS Code packaging scripts.

Pragmatic note:

- Treat the extension as a package inside `packages/` for now.
- Do not introduce an `apps/` folder until there is a strong reason to widen the workspace layout.

## Exact MVP Implementation Order

This is the recommended implementation order with the dependency chain intentionally minimized.

### Step 1. Create the Nx project skeleton

Status: done.

Deliverables:

- All nine Nx projects created.
- Root scripts for `build`, `typecheck`, and `test`.
- TypeScript project references wired.

Acceptance check:

- `pnpm nx show projects` lists all projects.
- `pnpm nx run-many -t typecheck` passes.

### Step 2. Lock architecture rules

Status: done.

Deliverables:

- Path aliases for each package.
- Import boundaries or architecture tests.
- Composition root folder in the extension package.

Acceptance check:

- An intentional forbidden import from `domain` to `vscode-extension` would fail validation.

### Step 3. Implement the domain core

Status: done for the current run model and transition rules.

Deliverables:

- `Run`, `RunConfiguration`, `Artifact`, `WorkspaceProject`, `ExecutionEvent`.
- Run state machine and invariants.
- Domain errors and validation policies.

Acceptance check:

- Unit tests cover legal and illegal state transitions.

### Step 4. Implement application ports and use cases

Status: in progress; `DetectWorkspace` and `RunPipeline` are implemented.

Deliverables:

- Inbound ports for run, resume, stop, detect workspace, list history, list artifacts.
- Outbound ports for runtime, persistence, workspace inspection, artifact discovery, and event publishing.
- Use case services with DTOs.

Acceptance check:

- Use cases run against fake ports with no VS Code or filesystem dependencies.

### Step 5. Implement deterministic command building

Deliverables:

- Command factory for local and Docker runtime modes.
- Escaping and argument normalization.
- Command preview model for UX confirmation.

Acceptance check:

- Tests cover spaces in paths, profile combinations, params files, and resume flags.

### Step 6. Implement workspace detection

Deliverables:

- Adapter that detects `main.nf`, `nextflow.config`, profiles, and likely entrypoints.
- Multi-root workspace selection rules.

Acceptance check:

- Tests cover representative project layouts and non-Nextflow folders.

### Step 7. Implement state persistence

Deliverables:

- Run repository over VS Code state.
- Versioned serialization.
- Migration stub for schema evolution.

Acceptance check:

- Stored runs survive extension restart in tests or adapter-level simulations.

### Step 8. Implement local runtime adapter

Deliverables:

- Preflight for `nextflow` presence.
- Process launch, stdout/stderr capture, cancellation, and exit mapping.
- Event translation into domain/application events.

Acceptance check:

- Adapter tests prove lifecycle transitions from queued to running to terminal states.

### Step 9. Implement Docker runtime adapter

Deliverables:

- Docker strategy with preflight.
- Mapping of workspace paths and runtime flags needed for MVP.

Acceptance check:

- Command tests prove Docker mode selection without modifying core use cases.

### Step 10. Implement the extension composition root and commands

Deliverables:

- `extension.ts` activation.
- Command registration for Run, Resume, Stop, and Show Runs.
- Output channel or log surface wiring.

Acceptance check:

- Extension activates in a Nextflow workspace and exposes commands.

### Step 11. Implement MVP read-model views

Deliverables:

- Runs tree view.
- Run details view or command-driven details output.
- Log streaming presentation.

Acceptance check:

- Starting a run updates visible state immediately.

### Step 12. Implement artifact discovery and quick actions

Deliverables:

- Detection for report, trace, and timeline artifacts.
- Quick actions to open artifacts and relevant folders.

Acceptance check:

- Completed runs show artifact status and open actions.

### Step 13. Add end-to-end smoke coverage

Deliverables:

- Small sample workspace fixture.
- Smoke test for detect -> run -> logs -> finish -> resume.

Acceptance check:

- MVP smoke path passes in CI for the supported local environment.

## First Sprint Scope

The current first implementation sprint should stop after Step 5.

That means Sprint 0 plus Sprint 1 should produce:

- Nx projects.
- Architecture enforcement.
- Domain model.
- Application ports and use cases.
- Command builder.

This is the smallest slice that creates a stable core while still producing executable value through tests.

## What Not To Build Yet

Do not build these before the first smoke path exists:

- Rich parameter webviews.
- DAG viewers.
- Seqera Platform integration.
- Advanced remote execution.
- General-purpose pipeline introspection beyond the MVP contract.
- Any adapter that depends on inferred schema extraction unless a concrete pipeline fixture requires it.

## Immediate Next Actions

1. Implement versioned run persistence behind `RunRepository`.
2. Add the remaining run lifecycle use cases on top of the existing ports.
3. Implement the local process runtime and event translation.
4. Add `@vscode/test-electron` when the first executable extension command exists.
5. Update root, package, and section READMEs plus backlog, plan, and this audit in the same change set as each implementation slice.

## Decision

The MVP should be implemented as a package-first Nx monorepo under `packages/`, with the VS Code extension as the outermost composition root and all business logic isolated in `domain` and `application`. That structure is the shortest path to an MVP that can be extended without architectural rework.