# Workspace and dependency variants

Read the relevant section when the workspace uses Nx, custom builders, publishable
libraries or coordinated dependency changes. Preserve the package manager and
workspace boundaries; do not treat every package.json as an independent install root.

## Package manager and package inventory

Reconcile `packageManager`, manager configuration, lockfile, CI and Angular CLI's
configured package manager. Inspect workspaces, overrides/resolutions, patches,
aliases and file/link dependencies that alter effective resolution. Resolve
conflicting signals before installing. Do not delete a lockfile to bypass peers.
Use reproducible installs for the baseline and final consistency check where
supported; dependency updates need the manager's documented lockfile update mode.

Discover installed framework packages and their update groups, including optional
localize, elements, upgrade, service-worker, SSR and language-service packages.
Identify compiler-cli, CLI/devkit/build packages, actual workspace builders,
Material/CDK and other packages with migration collections. Check framework
alignment and duplicate Angular runtimes without imposing one patch number on
packages with independent releases. Consult official package metadata for exact
peer/engine ranges and coordinated package groups.

Resolve and record exact destination versions within user constraints. Execute
through the repository's verified local tooling (for example the manager's local
exec command or a verified project binary). Do not use an invocation that silently
downloads current tooling when the local executable is missing. Where an official
transition requires a temporary CLI, choose its published version explicitly and
account for its engines and its supported source/target path.

## Nx or custom migration owners

For Nx, consult [the Angular/Nx matrix](https://nx.dev/docs/kb/angular-nx-version-matrix)
and [the official update workflow](https://nx.dev/docs/features/automate-updating-dependencies)
for the installed/target Nx versions. Nx and Angular have distinct major numbers;
plan compatible checkpoints for both. Preserve Nx plugin alignment.

Use the supported Nx migration planner, inspect package changes and the generated
migration plan, install with the workspace manager, then execute that plan.
Account for Angular/CLI/Material migrations included or omitted by the plan.
Do not additionally run an independent `ng update` unless official guidance
identifies a missing step. Retain recovery evidence and verify commit/prompt/agent
behavior before execution. Current Nx documentation may describe features absent
from older installed Nx versions; use matching help and release documentation.

For custom builders or non-CLI workspaces, identify their official update route
and supported Angular versions. Do not convert to standard CLI builders or create
angular.json merely to force this skill's default workflow. If migration execution
is unavailable, explain the missing route rather than only editing versions and
claiming migrations ran.

## Libraries

Inspect each affected library's manifest, Angular peer dependencies, ng-package
configuration, entry points, TypeScript settings and packaging-tool compatibility
(including ng-packagr). Build dependencies in workspace order.

Validate production library packaging and the consuming application, not just
source compilation through development path mappings. Check partial/full Ivy
format and the declared consumer Angular range against
[official library guidance](https://angular.dev/tools/libraries/creating-libraries).
Do not broaden published peer support without evidence or accidentally bundle a
second Angular runtime. Rebuild local/link dependencies under the destination
toolchain. Historical View Engine/ngcc constraints require exceptional-path guidance.

## Coordinated dependency transitions

Resolve supported releases and required migrations for Material/CDK, SSR,
ngUpgrade, test/lint plugins and affected third-party peers before invoking updates.
For CDK without Material, use its applicable migration route; do not add Material.
Run documented third-party update schematics where available instead of only
bumping package versions. Inspect Material theme/DOM changes and migration TODOs.

Plan ordering for packages that support only the source or only the destination.
Use a documented joint update or compatible bridge release where available;
upgrading a peer first can itself make the source un-installable. If no supported
transition exists, report the package/version/constraint and alternatives within
scope instead of cycling installs or replacing a library without authorization.

Distinguish stale declared peer metadata from demonstrated runtime incompatibility.
Use `--force` only for an identified mismatch with supporting compatibility
evidence, explained residual risk and no safer supported route, with authorization
when a material user choice remains. Do not treat it as fixing incompatibility or
silently combine it with package-manager peer bypasses. Preserve warnings and
validate the affected runtime behavior.
