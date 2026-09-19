# Nextflow IDE Quickstart

## Prerequisites

- VS Code 1.104 or newer.
- Nextflow available on `PATH` for local runs.
- Docker Desktop or Docker Engine running for Docker runs.

## Run the Smoke Fixture

1. Open this repository in VS Code.
2. Start `Run Nextflow IDE Extension` from Run and Debug.
3. In the Extension Development Host, open `Nextflow Runs`.
4. Run `Nextflow: Run Pipeline` from the Command Palette.
5. Inspect status messages in `Nextflow IDE` and process output in `Nextflow Logs`.
6. Select a run to inspect details and available artifacts.

The fixture is `examples/minimal-pipeline` and is intentionally self-contained.

## Commands

- `Nextflow: Run Pipeline`: starts a local run from the workspace `main.nf`.
- `Nextflow: Resume Run`: resumes a failed or resumable run by id.
- `Nextflow: Stop Run`: requests cancellation for an active run.
- `Nextflow: Show Run Details`: opens the run configuration, status, timestamps, and artifact state.
- `Nextflow: Open Artifact`: opens a discovered report, trace, or timeline after validation.

## Troubleshooting

- Missing `nextflow`: verify `nextflow -version` works in the same environment as VS Code.
- Docker unavailable: verify `docker info` succeeds before selecting Docker mode.
- No runs visible: open a workspace containing `main.nf` and refresh the Runs view.
- Artifact missing: verify the configured output directory contains `report.html`, `trace.txt`, or `timeline.html`.
