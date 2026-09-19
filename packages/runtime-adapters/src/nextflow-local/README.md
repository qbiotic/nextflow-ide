# Local Nextflow Adapter

Runs the Nextflow CLI on the host machine through the runtime outbound ports.

```mermaid
sequenceDiagram
  participant U as Use case
  participant A as Local adapter
  participant N as Nextflow CLI
  U->>A: startRun(command)
  A->>N: spawn executable
  N-->>A: stdout/stderr/exit code
  A-->>U: normalized events
```

This adapter owns Node process details; those details must not cross into domain or application contracts.

`LocalNextflowRuntime` now performs preflight, launches through the injected `ProcessLauncher`, publishes stdout/stderr and terminal status events, and supports SIGTERM cancellation. The Docker strategy and real VS Code wiring remain separate.
