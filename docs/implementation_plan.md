## Plan: Nextflow IDE MVP for VS Code

Build a VS Code extension focused on local Nextflow operations for a clearly defined primary user (technical bioinformatician/researcher), while keeping architecture extensible for teams later. The MVP delivers one complete loop: edit pipeline, run with basic inputs, monitor logs, and resume failed runs. Integration with the official Nextflow extension is optional and additive.

**Steps**
1. Phase 0 - Product Lock (blocks all coding): finalize MVP scope and acceptance criteria in a one-page PRD with explicit in/out, target persona, and success metrics. Include explicit non-goals for platform/DevOps use cases. (*blocks steps 2-8*)
2. Phase 0 - Integration Contract (depends on 1): define coexistence model with the official Nextflow extension (activation, commands, views, conflicts, fallback behavior if missing).
3. Phase 1 - Workspace Detection & Activation (depends on 2): implement robust Nextflow project detection and extension activation strategy for multi-root workspaces.
4. Phase 1 - Runtime Adapter (parallel with 5, depends on 2): design a runtime abstraction and implement local macOS/Linux execution first, plus Docker mode support with deterministic command construction.
5. Phase 1 - State Model (parallel with 4, depends on 2): define run entity schema, persistence boundaries (workspace vs user), run lifecycle states, and retention policy.
6. Phase 2 - Core MVP Workflow (depends on 3,4,5): deliver the E2E flow Edit -> Run -> Logs -> Resume, including failure states and actionable error messages.
7. Phase 2 - Minimal UX Surfaces (parallel within phase 2, depends on 6): add command palette entry points, run list, run details, and log stream view with clear loading/empty/error states.
8. Phase 2 - Artifacts Baseline (depends on 6): provide minimal artifacts access (report/trace/timeline if present) and resilient file discovery per run.
9. Phase 3 - Quality Gate (depends on 7,8): add tests for command-building, state transitions, persistence migration safety, and integration smoke tests.
10. Phase 3 - Release Readiness (depends on 9): prepare beta checklist, telemetry/privacy defaults, docs, and a small pilot validation loop.

**Relevant files**
- /Users/CAE9/nextflow-ide/README.md - source of project positioning, architecture intent, and monorepo structure assumptions.
- /Users/CAE9/nextflow-ide/docs/plan_ide_nextflow_vscode.md - primary phased roadmap and module decomposition to mirror in implementation backlog.
- /Users/CAE9/nextflow-ide/docs/arquitectura_tecnica_plugin_nextflow_vscode.md - technical architecture patterns for extension host, execution, UI/webview boundaries, and integration concerns.
- /Users/CAE9/nextflow-ide/docs/definiciones_pendientes_ide_nextflow_vscode.md - unresolved decisions that must become concrete acceptance criteria before coding.
- /Users/CAE9/nextflow-ide/packages - target area to instantiate workspace packages once phase 0 is closed.

**Verification**
1. Product review checklist: PRD contains persona, MVP in/out, coexistence rules, and measurable success criteria.
2. Technical design review: runtime abstraction and persistence model approved against remote/local constraints.
3. Automated tests: run unit + integration smoke suite for the MVP flow and failure paths.
4. Manual scenarios: validate on macOS and Linux with local and Docker execution paths.
5. Compatibility check: verify behavior with and without the official Nextflow extension installed.

**Decisions**
- Primary user now: technical bioinformatician/researcher running and iterating pipelines locally.
- Secondary user later: small research/bioinformatics teams; DevOps/platform users are out of MVP scope.
- MVP flow chosen: Edit + Run + Logs + Resume.
- Official extension strategy: optional complement; do not hard-depend for core runtime flow.
- Runtime priority: local host (macOS/Linux) plus Docker support.
- Documentation and UI copy language: English.

**Further Considerations**
1. Run parameter UX strategy: Option A initial JSON/editor-based launch profile, Option B guided form for common flags, Option C hybrid; recommendation: start with A then evolve to C.
2. Persistence backend choice: Option A VS Code Memento + workspaceState, Option B local lightweight DB (SQLite), Option C file-based JSONL; recommendation: start with A for MVP simplicity.
3. Artifact normalization: define a canonical per-run metadata record to avoid brittle file probing across pipeline variants.
