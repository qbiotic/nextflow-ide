# MVP Product Requirements

## Persona

The primary user is a technical bioinformatician or researcher iterating on Nextflow pipelines locally.

## MVP Outcome

The user can open a pipeline, run it locally or through Docker, inspect logs, resume a failed run, inspect run history, and open available artifacts without leaving VS Code.

## In Scope

- Single-root local workflow with first-root behavior for multi-root workspaces.
- `main.nf` detection and optional `nextflow.config`.
- Local and Docker command construction and execution.
- Run persistence, status lifecycle, logs, resume, stop, details, and artifacts.
- Optional coexistence with the official Nextflow extension.

## Out of Scope

- Remote orchestration and cloud scheduling.
- Multi-user collaboration and organizational governance.
- DAG editing and general-purpose visual pipeline authoring.
- Seqera Platform integration.
- Advanced parameter schema inference.

## Success Criteria

- A user can complete the local smoke flow from Run to logs, history, details, and artifacts.
- A failed/resumable run can be resumed without leaving VS Code.
- The extension works when the official Nextflow extension is absent.
- Unit, architecture, and VS Code smoke tests pass.
