# Official Nextflow Extension Contract

The Nextflow IDE extension is additive and does not depend on the official Nextflow extension for its core execution workflow.

## Ownership

- Official extension: language intelligence, diagnostics, navigation, formatting, and its own project capabilities.
- Nextflow IDE: local/Docker execution, run history, logs, resume/stop, details, and artifacts.

## Coexistence

- Commands use the `nextflowIde.*` namespace.
- Views use the `Nextflow Runs` name and `nextflowIde.*` ids.
- No official-extension implementation types are imported by domain or application.
- If the official extension is missing, all core execution workflows remain available.
- If both are installed, the IDE does not replace or duplicate language features.

## Fallback

Missing official extension support is not an error. The IDE relies on filesystem detection and the Nextflow CLI for its MVP workflow.
