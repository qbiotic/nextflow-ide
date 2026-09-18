# Project Detection

Detects Nextflow workspaces from entrypoints such as `main.nf`, configuration files, modules, and multi-root folder context.

```mermaid
flowchart TD
  W[Workspace folders] --> S[Scan candidates]
  S --> Q{Nextflow markers?}
  Q -->|yes| P[WorkspaceProject]
  Q -->|no| N[No project]
```

The adapter returns normalized project data through `WorkspaceProjectGateway`.
