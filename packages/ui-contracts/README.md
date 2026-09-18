# UI Contracts

## Purpose

This package defines the typed protocol between the extension host and future webview clients.

## Responsibilities

- Define inbound UI command messages.
- Define outbound UI event messages.
- Define stable view models for runs, logs, artifacts, and errors.
- Keep UI transport details out of the application core.

```mermaid
sequenceDiagram
  participant V as Webview
  participant H as Extension host
  participant A as Application
  V->>H: typed command message
  H->>A: inbound port request
  A-->>H: result or event
  H-->>V: typed view model event
```

## Testing

Contract tests should reject unknown message types and verify serialization-compatible payloads.
