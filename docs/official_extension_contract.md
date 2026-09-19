# Official Nextflow Extension Contract for qbiotic-flow

The qbiotic-flow extension is additive and does not depend on the official Nextflow extension for its core execution workflow.

## Ownership

- Official extension: language intelligence, diagnostics, navigation, formatting, and its own project capabilities.
- qbiotic-flow: local/Docker execution, run history, logs, resume/stop, details, and artifacts.

## Coexistence

- Commands use the `nextflowIde.*` namespace.
- The user-facing Runs view uses the `qbiotic-flow Runs` name and retains `nextflowIde.*` ids for internal compatibility.
- No official-extension implementation types are imported by domain or application.
- If the official extension is missing, all core execution workflows remain available.
- If both are installed, the IDE does not replace or duplicate language features.

## Fallback

Missing official extension support is not an error. The IDE relies on filesystem detection and the Nextflow CLI for its MVP workflow.
