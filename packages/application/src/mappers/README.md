# Application Mappers

## Purpose

Mappers will translate between domain entities, persistence records, runtime events, and UI-facing DTOs.

## Current State

The directory is intentionally empty except for its public entrypoint. Mappers should be added only when a concrete boundary needs translation; this avoids speculative abstractions.

```mermaid
flowchart LR
  A[External record] --> M[Mapper]
  M --> D[Domain or application DTO]
```
