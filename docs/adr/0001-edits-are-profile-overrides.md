# Edits are profile overrides

An edit to a shipped mode is written as an override of that mode's row in the profile's `cordis.patch.yml`, through DSH's config editor, which validates, saves, and reloads it; modes the user creates live in one container row. Nothing in DSH's installed files changes, so a DSH upgrade replaces the shipped modes and the overrides still apply on top of them.

## Consequences

- An override holds the mode's whole plugin list, so DSH's later changes to that list have to be merged in (ADR 0002).
