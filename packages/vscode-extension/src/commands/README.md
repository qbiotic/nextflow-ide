# VS Code Commands

Inbound adapters translate command-palette and context-menu actions into application port requests.

Commands must validate input, delegate immediately, and avoid business logic.

```mermaid
flowchart LR
  C[VS Code command] --> A[Command adapter]
  A --> P[Inbound port]
  P --> U[Use case]
```
