# Application Ports

## Purpose

Ports are the stable hexagonal boundaries of the application layer.

## Direction

- Inbound ports expose actions the user or extension can request.
- Outbound ports describe capabilities the application requires from infrastructure.

```mermaid
flowchart LR
  I[Inbound adapters] --> IN[Inbound ports]
  IN --> U[Use cases]
  U --> OUT[Outbound ports]
  OUT --> O[Outbound adapters]
```

Concrete implementations belong outside this package.
