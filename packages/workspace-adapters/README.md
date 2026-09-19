# Workspace Adapters

## Purpose

This package adapts VS Code workspace and filesystem concerns to stable application ports.

## Responsibilities

- Detect Nextflow entrypoints and configuration files.
- Support single-root and multi-root workspace decisions.
- Read workspace file metadata.
- Discover and normalize report, trace, and timeline artifacts.
- Provide the Node filesystem adapter used by the extension composition root.

## Dependency Rules

Only this adapter package knows filesystem details. Domain and application receive normalized values through ports.

```mermaid
flowchart LR
  W[VS Code workspace] --> D[Project detection]
  D --> P[WorkspaceProjectGateway]
  P --> A[Application use case]
  A --> R[ArtifactGateway]
  R --> X[Normalized artifact records]
```

## Testing

Use fixture directories for representative Nextflow projects, missing files, multiple entrypoints, and artifact combinations. The current detector requires `main.nf`, treats `nextflow.config` as optional, and defers profile parsing.
