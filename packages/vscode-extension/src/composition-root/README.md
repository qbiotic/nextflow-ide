# Composition Root

The composition root is the only place where concrete adapters are instantiated and connected to application use cases.

```mermaid
flowchart TB
  C[Composition root] --> A[Application services]
  C --> R[Runtime adapters]
  C --> W[Workspace adapters]
  C --> S[State adapters]
  C --> L[LSP adapters]
```

It must not contain domain rules. Its responsibility is dependency injection and lifecycle ownership.
