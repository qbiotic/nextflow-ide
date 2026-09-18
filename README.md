# Nextflow IDE for VS Code

A developer-focused IDE experience for **Nextflow** built on top of **Visual Studio Code** and organized as an **Nx monorepo**.

This project aims to turn VS Code into a dedicated environment for developing, configuring, running, debugging, and inspecting Nextflow pipelines locally. Nextflow already has official VS Code language support for diagnostics, navigation, formatting, schema checks, and DAG previews; this project focuses on the missing operational layer: local execution UX, run management, artifact access, and developer workflows. [web:166][web:202][web:240]

## Goals

- Provide a smooth local development experience for Nextflow pipelines.
- Reduce friction between editing code and running pipelines.
- Add a visual workflow for configuring runs, starting executions, monitoring logs, and opening artifacts.
- Build on VS Code conventions instead of creating a separate desktop app.
- Keep the architecture modular and scalable using Nx and TypeScript. [web:228][web:224]

## Scope

This repository is intended to host:

- A VS Code extension for Nextflow local execution workflows.
- Shared TypeScript libraries for domain models, runtime contracts, and messaging.
- Webview-based UI modules for run configuration, history, artifacts, and diagnostics.
- Tooling and infrastructure for building, testing, and packaging the extension.

This project does **not** aim to replace the official Nextflow VS Code extension. Instead, it is designed to complement it with execution-oriented workflows and a richer local IDE experience. [web:166][web:202]

## Why Nx

Nx is used to structure the codebase as a monorepo with clear boundaries between applications and shared packages. Nx is particularly well suited for TypeScript monorepos, supports project references, caching, and scalable task execution, and works well with custom workspace structures. [web:228][web:224][web:237]

Expected benefits:

- Clear separation between extension code, UI code, and shared libraries.
- Easier reuse of contracts and domain logic.
- Faster builds and test execution through caching.
- Better long-term maintainability as the plugin grows. [web:228][web:238]

## Planned features

The initial product direction includes:

- Workspace detection for Nextflow projects.
- Guided run configuration from within VS Code.
- One-click local execution and resume flows.
- Live log streaming.
- Run history and saved presets.
- Artifact discovery for reports, traces, timelines, DAGs, and work directories.
- A richer debugging workflow for failed runs.

Related ecosystems already provide parts of this experience: the official Nextflow extension provides language intelligence and project views, while community tools such as Nextflow Sandbox add utilities for running and inspecting pipelines. This project aims to unify and extend those workflows into a more complete IDE-style experience. [web:166][web:173][web:176]

## High-level architecture

The planned architecture has four major parts:

1. **VS Code extension host** for commands, workspace integration, process orchestration, and state management.
2. **Nextflow runtime integration** for launching and tracking local CLI executions.
3. **Webview UI** for parameter forms, run dashboards, history, and artifacts.
4. **Language intelligence integration** through the official Nextflow language server and extension ecosystem. [web:187][web:162][web:166]

## Monorepo layout

A likely structure for this workspace is:

```text
apps/
  vscode-extension/
  webview-shell/

packages/
  shared-types/
  domain-model/
  runtime/
  ui-contracts/
  test-utils/
