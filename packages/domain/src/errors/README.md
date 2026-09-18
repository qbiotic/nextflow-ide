# Domain Errors

## Purpose

Contains errors representing violated domain invariants, independent of transport or UI concerns.

`DomainInvariantError` is used when a state transition or future domain validation rule is invalid.

```mermaid
flowchart LR
  R[Domain rule] -->|invalid| E[DomainInvariantError]
  E --> A[Application error mapping]
  A --> U[UI or command response]
```

Adapters must translate external errors separately; they must not overload this error for process, filesystem, or VS Code failures.
