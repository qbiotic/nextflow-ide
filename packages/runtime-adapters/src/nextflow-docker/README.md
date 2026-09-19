# Docker Nextflow Adapter

Implements the runtime strategy for launching Nextflow through Docker.

Responsibilities include image selection, workspace path mapping, Docker availability checks, and translating container process output.

```mermaid
flowchart LR
  C[Prepared command] --> D[Docker strategy]
  D --> M[Mounted workspace]
  D --> P[Container process]
  P --> E[Normalized execution events]
```

Docker-specific flags remain inside this adapter.

`DockerNextflowRuntime` performs Docker preflight, launches the prepared Docker command, streams output, maps terminal states, and supports cancellation.
