# Minimal Pipeline Fixture

This fixture is the smallest runnable Nextflow project used for manual Extension Development Host checks.

## Contents

- `main.nf`: DSL2 pipeline with one process that writes `greeting.txt`.

## Manual Smoke Flow

1. Open the repository in VS Code.
2. Start the `Run Nextflow IDE Extension` launch configuration.
3. In the Extension Development Host, open the `Nextflow Runs` view.
4. Run `Nextflow: Run Pipeline` from the Command Palette.
5. Confirm that a run appears and logs are written to the `Nextflow IDE` output channel.

The fixture intentionally avoids profiles, params files, Docker, and external inputs. Those scenarios are covered by adapter tests and later manual checks.
