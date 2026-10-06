# Historical and prerelease paths

Read this only when a requested path involves unsupported historical releases,
old CLI/Nx tooling or an explicitly requested prerelease. The normal path targets
released stable Angular versions using their supported migration tooling.

## Historical releases

Check current support policy and available historical documentation. A package
still being downloadable does not make its migration officially supported today.
Explain the support status of historical intermediate releases and the evidence
for a best-effort local transition; do not equate tooling availability with a
guaranteed supported upgrade. Do not skip majors just because their support ended.

Establish the source's actual framework/CLI pairing and configuration format;
historic core/CLI majors were not always aligned. Pre-v6 paths do not universally
offer the current ng update workflow. Use official archived instructions and
versioned package/tool metadata for each transition. If a usable documented path
cannot be established, report it rather than inventing modern commands for old tools.

Plan Node and package-manager transitions, including older engines and native
dependencies, with local runtime isolation. Do not install obsolete runtimes
globally or overwrite modern machine configuration. Preserve user files and
report unavailable artifacts or registries rather than deleting the lockfile.

Inspect transition-specific prerequisites in the official evidence: View Engine
libraries and ngcc removal, RxJS compatibility layers, legacy Material/MDC APIs,
Angular Universal/SSR packaging and old custom builders. Complete prerequisite
migrations before the release that removes the needed API/tooling. Do not copy a
static catalog of historical commands into this reference; verify the actual path.

Pure AngularJS-to-Angular migration is a separate task. Existing hybrid ngUpgrade
workspaces are in scope when their Angular version is being upgraded.

## Prerelease and preview features

Target a prerelease only when explicitly requested. Verify the requested published
version and preserve its precision; an unconstrained `--next` is not equivalent
to a requested exact RC. Use matching official preview/release documentation,
migration collections and peer/engine metadata. Record when stable compatibility
tables do not cover it and what published evidence establishes the transition.

For prerelease-to-stable or prerelease-to-prerelease paths, inspect the actual
schematic ranges: semantic ordering and already-run prerelease migrations can
change which migrations execute. Do not assume reinstalling stable packages reruns
them or that previously applied schematics are safe to repeat. Use recovery
evidence and the package's documented migration behavior.

Identify experimental/developer-preview APIs used by the project even in stable
framework releases. Consult changes across the exact minor/patch interval; stable
package versioning does not guarantee those APIs remain compatible. Keep optional
adoption of preview features outside an ordinary version upgrade.
