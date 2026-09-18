# UI View Models

Defines presentation-safe read models for run lists, run details, logs, artifacts, loading states, and errors.

View models may be reshaped for UI needs but must not contain VS Code handles or domain mutation methods.

```mermaid
flowchart LR
  D[Domain/application result] --> P[Projection]
  P --> V[View model]
  V --> U[Webview]
```
