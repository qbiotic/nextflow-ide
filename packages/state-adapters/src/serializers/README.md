# State Serializers

Converts domain run records to versioned persistence-safe records and back.

Serializers must handle optional fields, unknown future fields, and invalid stored content without exposing raw persistence formats to the domain.

```mermaid
flowchart LR
  R[Run] --> S[Serializer]
  S --> J[Stored record]
  J --> S
  S --> R2[Run]
```
