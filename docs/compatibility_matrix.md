# Compatibility Matrix

| Scenario | MVP behavior | Validation |
|---|---|---|
| Official Nextflow extension installed | Additive coexistence; this extension owns execution commands and Runs view. | Manual and architecture contract |
| Official Nextflow extension absent | Core local execution, persistence, logs, runs, and artifacts remain available. | E2E fixture and adapter tests |
| macOS local runtime | Supported through `nextflow` on `PATH`. | Current development environment |
| Linux local runtime | Supported by the Node process adapter and POSIX-compatible command arrays. | Required beta scenario |
| Docker runtime | Supported through Docker command strategy and Docker preflight. | Unit tests; manual Docker validation required |
| Multi-root workspace | User selects the root for Run and independently selects the root used by Runs view. | Unit coverage for detector and view model |
| Remote VS Code workspace | Not a release target for this MVP. | Explicit non-goal |

qbiotic-flow complements the official extension when installed, but no core use case imports or requires its implementation types.
