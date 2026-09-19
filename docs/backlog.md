## Backlog: Nextflow IDE for VS Code (MVP-first)

Prioritized backlog aligned with the approved MVP scope (Edit + Run + Logs + Resume), optional coexistence with the official Nextflow extension, and runtime support for local macOS/Linux plus Docker.

**Legend**
- Priority: P0 (must), P1 (should), P2 (could)
- Status: TODO
- Type: Feature, Tech, UX, Test, Docs

**Epic 0 - Product and Contract Baseline**
1. P0 | DONE | Docs: Create one-page MVP PRD (persona, in/out scope, success metrics, explicit non-goals).
2. P0 | DONE | Tech: Define official-extension coexistence contract (activation, command namespace, fallback behavior).
3. P0 | DONE | Docs: Define NFR baseline (startup latency target, run launch responsiveness, supported OS matrix).
4. P1 | DONE | Docs: Define telemetry and privacy defaults for beta.
5. P0 | DONE | Docs: Keep README, package READMEs, backlog, implementation plan, technical audit, and pending decisions synchronized with each implementation change.

**Testing and Documentation Standards**
- P0 | DONE | Test: Select Vitest for unit and architecture tests, with Nx `test` targets.
- P0 | DONE | Docs: Add a README to every package and architectural source section, including Mermaid diagrams and testing guidance.

**Architecture constraint - Hexagonal Design**
- P0 | DONE | Tech: Define domain model and inbound/outbound port contracts before implementing adapters.
- P0 | DONE | Tech: Define the extension composition root and dependency direction checks.
- P1 | DONE | Test: Add architecture tests preventing domain/application imports from VS Code, Node process APIs, Docker, or adapter modules.
- P0 | DONE | Test: Add initial domain state-machine tests and architecture dependency tests.

**Epic 1 - Extension Skeleton and Activation**
6. P0 | DONE | Tech: Create extension entrypoint module boundaries (activation, command registration, service container).
7. P0 | DONE | Tech: Scaffold Nx packages for domain, application, adapters, UI contracts, test utilities, and the VS Code extension.
8. P0 | DONE | Feature: Implement Nextflow workspace detection for single-root and multi-root.
9. P0 | DONE | Feature: Add activation event for the first Nextflow run command.
10. P1 | DONE | Test: Add detection tests for representative project layouts.

**Epic 2 - Runtime Adapter (Local + Docker)**
9. P0 | DONE | Tech: Define runtime adapter interface (prepare command, launch, monitor, stop, resume).
10. P0 | DONE | Feature: Implement local runtime provider (macOS/Linux).
11. P0 | DONE | Feature: Implement Docker runtime provider.
12. P0 | DONE | Tech: Add deterministic command builder with safe argument escaping.
13. P1 | DONE | Test: Unit test command builder edge cases (paths with spaces, env vars, profiles).
14. P1 | DONE | Tech: Add preflight checks for Nextflow and Docker.

**Epic 3 - Run State and Persistence**
15. P0 | DONE | Tech: Define run lifecycle states (queued/running/succeeded/failed/canceled/resumable).
16. P0 | DONE | Tech: Design run metadata schema (id, command, params snapshot, timestamps, workspace context).
17. P0 | DONE | Feature: Persist run records in workspace/user state with version tag.
18. P1 | DONE | Tech: Add migration mechanism for persisted schema versions.
19. P1 | DONE | Test: Add state-transition tests and persistence compatibility tests.

**Epic 4 - MVP User Workflow (Edit -> Run -> Logs -> Resume)**
20. P0 | DONE | Feature: Add Run command from command palette with basic local launch input.
21. P0 | DONE | Feature: Launch run and register it in state immediately through the application use case.
22. P0 | DONE | Feature: Stream logs in dedicated output view with clear progress and completion status.
23. P0 | DONE | Feature: Add Resume command for failed/resumable runs.
24. P0 | DONE | UX: Define and implement empty/loading/error states across core views.
25. P1 | DONE | UX: Improve actionable errors (missing binary, invalid params, docker not running).

**Epic 5 - Runs List and Detail Surfaces**
26. P0 | DONE | Feature: Implement Runs list view (recent runs with status badges).
27. P0 | DONE | Feature: Implement Run details view (config snapshot, timestamps, execution mode).
28. P1 | DONE | UX: Add quick actions (open logs, resume, open artifacts).
29. P1 | DONE | Test: Add view-model tests for sorting/filtering/status rendering.

**Epic 6 - Artifact Baseline**
30. P0 | DONE | Feature: Detect and expose report/trace/timeline artifacts when available.
31. P0 | DONE | Tech: Normalize artifact paths per run to avoid brittle lookups.
32. P1 | DONE | UX: Add artifact status indicators (available/missing/failed to generate).
33. P1 | DONE | Test: Add artifact discovery tests for different pipeline outputs.

**Epic 7 - Quality, Packaging, and Beta Readiness**
39. P0 | DONE | Tech: Add Extension Development Host launch configuration and minimal Nextflow smoke fixture.
34. P0 | DONE | Test: Add end-to-end smoke test for full MVP loop.
35. P0 | DONE | Docs: Write user quickstart and troubleshooting guide.
36. P0 | DONE | Docs: Write compatibility matrix (with/without official extension).
37. P1 | DONE | Tech: Define beta telemetry/privacy defaults without collecting data by default.
38. P1 | DONE | Docs: Prepare beta release checklist and feedback template.

**Definition of Done (MVP)**
1. User can run a Nextflow pipeline from VS Code in local or Docker mode.
2. User can inspect logs during execution and after completion.
3. User can resume failed/resumable runs.
4. User can access available core artifacts (report/trace/timeline).
5. Behavior is valid with and without the official Nextflow extension installed.
6. Automated tests cover command construction, state transitions, and MVP smoke path.
7. Domain and application code are independent of VS Code, Node process APIs, Docker, and concrete persistence adapters.
8. Runtime selection, persistence, and external integrations are replaceable through explicit ports.
9. README, package READMEs, backlog, implementation plan, technical audit, and pending decisions documents reflect the current repository state after each implementation step.
