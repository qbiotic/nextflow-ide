# MVP Non-Functional Requirements

| Area | MVP baseline |
|---|---|
| Supported local OS | macOS and Linux |
| Supported runtime | Nextflow on PATH; Docker when selected |
| VS Code | Version 1.104 or newer |
| Activation | Command-scoped; no expensive project scan at startup |
| Run launch | Register the run before process launch and surface failures immediately |
| Logs | Stream stdout/stderr without shell-string execution |
| Persistence | Versioned workspace state; invalid data must not crash activation |
| Security | Use argument arrays, validate artifact paths, and keep process APIs at adapters |
| Privacy | Telemetry disabled by default; no pipeline content leaves the machine |
| Remote workspaces | Explicitly out of MVP release scope |
