# Extension Source

The source is organized as inbound adapters plus the composition root:

- `activation`: lifecycle and workspace activation.
- `commands`: command-palette and context actions.
- `views`: native VS Code presentation surfaces.
- `composition-root`: dependency injection and concrete adapter assembly.
- `extension.ts`: public activate/deactivate entrypoints.

All behavior must delegate to application ports.
