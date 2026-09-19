# Beta Release Checklist

## Build and Tests

- [ ] `pnpm install --frozen-lockfile` succeeds.
- [ ] `pnpm run typecheck` succeeds for all Nx projects.
- [ ] `pnpm test` succeeds.
- [ ] `pnpm run test:e2e` succeeds on the release machine.
- [ ] Manual local Nextflow smoke run succeeds.
- [ ] Manual Docker smoke run succeeds.

## Product

- [ ] Run, Resume, Stop, Logs, Runs, Details, and artifact actions work.
- [ ] Missing Nextflow and unavailable Docker show actionable errors.
- [ ] Behavior is verified with and without the official Nextflow extension.
- [ ] Empty, loading, error, and completed states are understandable.

## Documentation and Privacy

- [ ] Quickstart and compatibility matrix are current.
- [ ] Changelog contains the branch summary under `Unreleased`.
- [ ] Telemetry is disabled by default for the beta.
- [ ] No pipeline paths, parameters, logs, or artifact contents leave the local machine.
- [ ] Feedback channel and support owner are defined.
