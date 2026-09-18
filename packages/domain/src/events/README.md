# Domain Events

## Purpose

Defines stable execution events exchanged between the domain-facing application layer and adapters or projections.

## Event Kinds

- `started`
- `log`
- `status-changed`
- `artifacts-discovered`

```mermaid
sequenceDiagram
  participant R as Runtime adapter
  participant P as EventPublisher
  participant V as View projection
  R->>P: ExecutionEvent
  P-->>V: normalized event
```

Events contain a run identifier and occurrence timestamp so consumers can correlate asynchronous process output.
