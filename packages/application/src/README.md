# Application Source

The application source is organized around contracts and orchestration:

- `dto`: serializable requests and results.
- `mappers`: explicit boundary translations when needed.
- `ports`: inbound and outbound hexagonal contracts.
- `use-cases`: application services that coordinate domain behavior.

No source file here may depend on VS Code, Node process APIs, Docker SDKs, or concrete adapters.
