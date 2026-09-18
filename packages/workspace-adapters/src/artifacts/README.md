# Artifact Discovery

Locates and normalizes report, trace, and timeline files associated with a run.

```mermaid
flowchart LR
  R[Run metadata] --> D[Artifact discovery]
  D --> A[ArtifactLocation]
  A --> M[ArtifactRecord]
```

The adapter reports availability without moving artifact ownership into the filesystem layer. Paths must be normalized relative to the run context where possible.
