# Fake Ports

Provides in-memory implementations of outbound ports for application unit tests.

```mermaid
flowchart LR
  U[Use case] --> F[Fake port]
  F --> S[Recorded calls and state]
  S --> A[Test assertions]
```
