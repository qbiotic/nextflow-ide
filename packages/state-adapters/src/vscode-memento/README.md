# VS Code Memento Adapter

Persists run history through VS Code workspace and global state APIs.

`StateStore` is the infrastructure-neutral port. `MementoRunRepository` uses it to persist a versioned run-history envelope without importing the VS Code API directly.

```mermaid
sequenceDiagram
  participant R as RunRepository
  participant M as Memento adapter
  participant V as VS Code state
  R->>M: save(run)
  M->>V: update(key, envelope)
  V-->>M: stored
  M-->>R: acknowledgement
```
