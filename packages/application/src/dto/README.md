# Application DTOs

## Purpose

DTOs define the input and output shapes of application use cases without exposing adapter implementations.

## Current Contracts

Requests and results exist for workspace detection, run, resume, stop, run history, artifact listing, and command previews.

```mermaid
flowchart LR
  I[Inbound adapter] --> Q[Request DTO]
  Q --> U[Use case]
  U --> R[Result DTO]
  R --> O[Inbound adapter response]
```

DTOs should remain serializable and should not contain VS Code, Node, Docker, or process instances.
