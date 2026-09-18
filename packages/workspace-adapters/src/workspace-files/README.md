# Workspace Files

Provides filesystem-backed reads and existence checks for workspace detection and artifact discovery.

This is an outbound adapter boundary: application code requests normalized metadata and never receives filesystem handles.

```mermaid
flowchart LR
  A[Application port] --> F[Workspace file adapter]
  F --> FS[Filesystem]
  FS --> F
  F --> A
```
