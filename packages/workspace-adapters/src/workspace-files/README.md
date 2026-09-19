# Workspace Files

Provides filesystem-backed reads and existence checks for workspace detection and artifact discovery.

This is an outbound adapter boundary: application code requests normalized metadata and never receives filesystem handles.

`NodeWorkspaceFileSystem` is the production implementation. Tests inject a fake implementation so project detection remains deterministic.

```mermaid
flowchart LR
  A[Application port] --> F[Workspace file adapter]
  F --> FS[Filesystem]
  FS --> F
  F --> A
```
