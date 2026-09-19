# Extension Views

Owns native tree views, output channels, panels, and future webview hosts.

Views consume application results and UI contracts. They do not launch processes or access persistence directly.

The current native view is `Nextflow Runs`, backed by `RunsTreeDataProvider` and `GetRunHistoryService`. It lists runs for the first workspace folder and displays status as the item description. Selecting an item opens a read-only run details webview through `GetRunDetailsService`.

Runtime stdout and stderr are published to the dedicated `Nextflow Logs` output channel.

The Runs view renders explicit empty and error items instead of failing silently when no workspace, no runs, or a repository error is present.

```mermaid
flowchart LR
  U[Application event] --> P[View projection]
  P --> V[Tree, output, or webview]
```
