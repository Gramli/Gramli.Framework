# Retrieve the selected Angular Update Guide

Read this when resolving an upgrade path. Use current official evidence:

- [Update Guide](https://angular.dev/update-guide)
- [Version compatibility](https://angular.dev/reference/versions)
- [Release policy and support](https://angular.dev/reference/releases)
- [ng update](https://angular.dev/cli/update)
- Official framework, CLI and relevant library release notes and package metadata.

## Verify checklist retrieval

An HTTP success or a page containing only version selectors and "Show me how to
update" is not a retrieved checklist. Obtain the rendered recommendations for the
selected transition using browser tooling if available. Choose Advanced complexity
to inspect all candidate steps, then assess actual API/configuration usage.
Set Material, ngUpgrade and OS options to match the project and execution shell;
the browser service's OS may differ from the agent's terminal.

Use version/complexity query parameters only when supported by the current guide.
Do not assume feature toggles survive a shared URL or that it accepts every
minor/patch version. Record selections separately from the URL. Confirm the
rendered source/target and the recommendations, including their phases.

If rendered access does not expose them, retrieve Angular's official source:

- [Recommendation data](https://github.com/angular/angular/blob/main/adev/src/app/features/update/recommendations.ts)
- [Selection and phase logic](https://github.com/angular/angular/blob/main/adev/src/app/features/update/update.component.ts)

These paths are discovery starting points, not a permanent API. If they move,
locate their replacements in the official repository. Read the data and current
logic; do not execute downloaded TypeScript to obtain recommendations. Record the
retrieved revision/date and relevant step identifiers or descriptions. Prefer
release-specific evidence when main contains unreleased changes.

The current data uses `possibleIn`, `necessaryAsOf`, complexity and feature flags;
interpret them with the matching selection logic, not guessed version arithmetic
or a filter that only matches the target major. Schema fields may not correspond
to active UI controls. Preserve before/during/after classification. A checklist's
"after" section can include recommendations whose removal deadline lies beyond
the chosen target: distinguish mandatory work from deferrable preparation.

## Resolve evidence conflicts and precision

Check full Node/TypeScript/RxJS ranges in the compatibility table and effective
package peer/engine constraints. Broad guide statements such as "TypeScript X or
newer" do not remove upper bounds. Resolve differing evidence against the exact
released packages, versioned official documentation and release notes; report
unresolved conflicts before an incompatible install.

For major-only guide selections, record the mapping from actual versions to the
guide versions. Check release notes, migration metadata and security advisories
for the actual minor/patch interval too. An empty same-major guide checklist does
not establish that no action is needed. Inspect core and CLI changes independently,
including updates with SSR, preview APIs or backported behavior changes.

Classify candidate actions as required compatibility work, optional modernization
or inapplicable, with concise evidence for exclusions. Avoid rerunning automated
migrations simply because their outcomes also appear in the manual checklist.

## Fallback and offline operation

Report whether recommendations came from a rendered guide or official source
reconstruction. Generic compatibility tables, published peer ranges and CLI logs
alone do not establish coverage of manual migrations. If neither checklist nor
equivalent release-specific manual migration evidence can be obtained, stop before
dependency changes and identify the missing evidence.

Offline, use supplied/cached official material only when sufficient for the exact
transition and available package artifacts. State its revision and limitations.
Do not claim to resolve current "latest" from stale caches. Never substitute
remembered steps or third-party advice for missing official evidence.
