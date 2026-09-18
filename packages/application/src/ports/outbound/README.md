# Outbound Ports

## Purpose

Outbound ports describe infrastructure capabilities required by use cases.

## Current Ports

- `RuntimeGateway`
- `RuntimeCommandFactory`
- `RunRepository`
- `WorkspaceProjectGateway`
- `ArtifactGateway`
- `EventPublisher`
- `IdGenerator`
- `Clock`

```mermaid
flowchart TB
  U[Application use case] --> R[Runtime ports]
  U --> S[State ports]
  U --> W[Workspace ports]
  U --> E[Event ports]
```

Ports contain no concrete process, filesystem, Docker, or VS Code types.
