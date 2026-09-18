# State Adapters

## Purpose

This package persists and restores application state using VS Code workspace and global state mechanisms.

## Responsibilities

- Store run records and configuration snapshots.
- Serialize and deserialize versioned envelopes.
- Apply migrations between persistence schema versions.
- Keep persistence details outside domain and application code.

```mermaid
sequenceDiagram
  participant U as Use case
  participant R as RunRepository
  participant S as VS Code state
  U->>R: save(run)
  R->>S: write versioned envelope
  S-->>R: acknowledgement
  R-->>U: persisted result
```

## Testing

Repository tests use an in-memory state fake and verify round trips, corrupted data handling, retention, and migrations.
