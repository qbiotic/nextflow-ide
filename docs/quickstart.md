# qbiotic-flow Quickstart

## Prerequisites

- VS Code 1.104 or newer.
- Nextflow available on `PATH` for local runs.
- Docker Desktop or Docker Engine running for Docker runs.
- The default Docker image is `nextflow/nextflow:26.04.6`.
- The Docker command explicitly invokes `nextflow` inside the image.

## Run the Smoke Fixture

1. Open this repository in VS Code.
2. Start `Run qbiotic-flow Extension` from Run and Debug.
3. In the Extension Development Host, open `qbiotic-flow Runs`.
4. Open the qbiotic-flow icon in the Activity Bar if the view is not already visible.
5. Run `qbiotic-flow: Run Pipeline` from the Command Palette.
6. Inspect status messages in `qbiotic-flow` and process output in `qbiotic-flow Logs`.
7. Select a run to inspect details and available artifacts.

The fixture is `examples/minimal-pipeline` and is intentionally self-contained.

## Commands

- `qbiotic-flow: Run Pipeline`: starts a local run from the workspace `main.nf`.
- `qbiotic-flow: Resume Run`: resumes a failed or resumable run by id.
- `qbiotic-flow: Stop Run`: requests cancellation for an active run.
- `qbiotic-flow: Show Run Details`: opens the run configuration, status, timestamps, and artifact state.
- `qbiotic-flow: Open Artifact`: opens a discovered report, trace, or timeline after validation.

## Troubleshooting

- Missing `nextflow`: verify `nextflow -version` works in the same environment as VS Code.
- Docker unavailable: verify `docker info` succeeds before selecting Docker mode.
- No runs visible: open a workspace containing `main.nf` and refresh the Runs view.
- Artifact missing: verify the configured output directory contains `report.html`, `trace.txt`, or `timeline.html`.
