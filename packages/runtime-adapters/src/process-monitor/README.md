# Process Monitor

Converts process output and lifecycle signals into normalized execution events.

It owns stdout/stderr listeners, cancellation handles, exit-code mapping, and cleanup after completion.

`ProcessLauncher` and `ManagedProcess` keep Node child-process details injectable. `NodeProcessLauncher` is the production implementation; tests use a fake process.

```mermaid
stateDiagram-v2
  [*] --> spawned
  spawned --> running
  running --> succeeded
  running --> failed
  running --> canceled
```
