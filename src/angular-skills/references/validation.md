# Select validation that matches the workspace

Read this for final npm installation verification or projects with libraries,
SSR/hydration, PWA, localization, custom builders or deployment-sensitive changes. Derive checks from repository/CI
commands and actual features. Keep scope proportional to the affected projects.

## Baseline and reproducibility

Run source checks under the source-supported Node and package-manager versions.
Record exact commands, configuration, environment and meaningful failure evidence.
Do not label the same error message "unchanged baseline" if upgraded code or
dependencies now cause it differently. Build failures that prevent a reliable
migration starting point need an explained repair or blocker.

Validate installation against the resulting manifest/lockfile and effective
package tree. Reproducible workspace installs are preliminary evidence; for npm,
complete the final clean-directory check below before claiming SUCCESS.
Run affected production builds, configured tests and lint in non-watch modes;
include required libraries and configurations rather than only the default app.
Do not install an unrelated linter/test framework when none is configured.

After a fix, rerun checks whose results it invalidated. A test-only fix need not
repeat unrelated builds; a shared dependency/configuration fix can invalidate
builds and multiple test targets. Do not advance on unresolved upgrade-caused
failures. Use existing tests and focused checks rather than creating a broad new
test suite merely for the upgrade.

## Final clean-directory npm verification

An `npm ci` run in a workspace with existing node_modules can pass despite
incomplete lockfile entries, including missing nested dependencies that fail in a
fresh CI checkout. Before SUCCESS for an npm workspace, including a no-op, verify
the final install inputs independently of the existing installation:

1. Create a fresh temporary directory outside the live workspace, within host
   permissions. Copy final package.json and package-lock.json (or npm-shrinkwrap.json),
   plus installation-relevant configuration such as .npmrc, workspace manifests,
   local dependencies/archives, patches and lifecycle-script inputs. Preserve their
   required relative layout.
   Start with no node_modules anywhere in the copied inputs; do not reuse the live
   dependency tree or point copied local dependencies back at the live workspace.
2. Activate the project's supported Node version and CI's npm version. Determine
   the actual CI version from its configuration/runtime rather than assuming the
   host default or latest npm. Match CI's installation flags and environment that
   affect dependency resolution. Keep authentication out of reports.
3. Run a real `npm ci --ignore-scripts=false --dry-run=false` inside the temporary
   copy, with any required CI flags. Confirm lifecycle scripts are enabled under
   the effective configuration and their inputs are available. Do not disable
   scripts to hide a failure. A dry run, lockfile-only operation or successful
   install in the existing workspace does not satisfy this gate. Inspect scripts
   and copy their inputs so they cannot modify user files or the live installation.
4. Record the exact command, Node/npm versions, OS/platform and architecture,
   lifecycle-script execution setting, exit status and result. Identify the final
   inputs verified; later installation-relevant changes invalidate this evidence.
   Prefer the native CI platform when available. Otherwise run the available
   clean-directory check and disclose that native CI-platform verification was
   unavailable; do not describe a different-platform result as native CI evidence.
   If native verification is a required project check, its absence still prevents
   SUCCESS.

If verification fails, retain the error and classify it before fixing it. Repair
lockfile defects using the repository package manager's supported generation
workflow in an isolated copy so the existing workspace installation is preserved.
Review the resulting diff for unintended version, resolution or dependency changes
before applying the repair in the protected upgrade context. Do not bypass peers
or silently introduce unrelated dependency updates to obtain a pass.

If the lockfile is demonstrably defective and targeted repair still fails the
fresh-directory install, allow controlled full regeneration:

- Save the failed lockfile for comparison. Prepare another isolated copy of the
  final installation inputs with no node_modules, and remove only its copied
  lockfile. Preserve the original workspace installation and user files.
- Run a real `npm install --ignore-scripts=false --dry-run=false` there with the
  supported Node version, CI's npm version and applicable CI configuration/flags.
  Preserve the requested Angular target and other declared version constraints.
  This rebuilds the dependency resolution; record that full regeneration was used.
- Compare the regenerated lockfile with the saved one. Review added nested entries
  and all version, integrity, registry/resolution and dependency-tree changes.
  Preserve unrelated resolutions where practical; explain any necessary changes
  and verify coordinated package compatibility before applying the reviewed lockfile.
- Rerun affected builds/tests/checks against the regenerated dependency graph in
  isolation. Results from the previous workspace installation do not validate
  dependencies whose resolution changed.

For either repair route, recopy the final reviewed inputs into another fresh
directory with no node_modules and repeat the real npm ci. Lockfile generation
with npm install is recovery work; it does not replace that final verification.
Report regeneration and meaningful dependency changes with the validation evidence.
If installation still fails, diagnose the remaining error and retain recovery
evidence rather than repeatedly discarding lockfiles.

A failed check ends an apparent no-op: any in-scope repair must first establish
the protected mutation context. Honor explicit read-only requests and report a
blocker if repair or required verification is outside scope/unavailable. Preserve
user files and the original installation throughout. Keep other package managers
on their supported workflow; this npm-specific gate does not authorize a conversion.
Use the executing npm version's [official npm ci guidance](https://docs.npmjs.com/cli/commands/npm-ci).

## Feature-driven acceptance

- **Browser behavior:** Exercise representative startup, routing, forms and async
  UI updates when changed APIs/defaults affect them. Check console/runtime errors.
  Preserve the established zone/zoneless mode and component change-detection
  behavior unless a change is required or requested; verify migration output.
  A new-project default does not by itself justify changing an existing app.
- **SSR/hydration/prerender:** Run the actual server or applicable rendering checks,
  verify expected rendered HTML and hydration without new errors, and check
  relevant routes/host configuration. A successful server build or HTTP response
  can still hide fallback to client rendering. Test prerendered output when used.
- **PWA:** Verify service-worker generation, asset/output paths, registration and
  important offline/update behavior when migrations affect them. Use the existing
  local PWA harness where available; distinguish generation from runtime validation.
- **i18n:** Include affected localized production configurations and
  @angular/localize compatibility. Check translation errors, generated locale
  paths and base URLs consumed by deployment.
- **Material/CDK:** Inspect affected themes, overlays and interactions; review
  migration TODOs and visual differences. Do not accept regenerated golden files
  without reviewing whether the change is intended.
- **Libraries:** Validate production packages/entry points and an appropriate
  consumer build against their declared compatibility. Source aliases can conceal
  packaging or peer-dependency problems.
- **Deployment/custom builders:** Check changed output layout, server entry point,
  assets, baseHref, stylesheet processing, custom build features and scripts that
  consume them. Required compatibility changes include deployment configuration
  when a migration changes the artifact contract. Do not deploy merely to validate.
- **Supported browsers:** Compare the repository's required browsers/Browserslist
  with the target's [official browser support](https://angular.dev/reference/versions).
  Report a removed required browser as a scope/compatibility decision rather than
  silently changing support or adding speculative polyfills.

Use applicable official release notes to choose these checks. New change-detection
defaults, security patches, removed builders and preview API changes can require
runtime checks even when TypeScript compiles.

## Failed or unavailable checks

Do not hide errors, disable compiler/lint checks, skip assertions, loosen budgets
or remove coverage merely to obtain a pass. If official guidance offers a fallback
that weakens checking or changes behavior, assess its scope, document the reason
and seek a user choice only when material risk or intended behavior is unresolved.

Distinguish pass, fail, unchanged baseline failure, not configured and not run with
reason. Explain unavailable browsers, credentials or infrastructure and run useful
local checks. Missing a required build/runtime check yields incomplete evidence;
an optional expensive check need not block when its omission is justified. A no-op
keeps the live installation and user files untouched, but still needs the isolated
npm verification above. Missing prerequisites or an unsuccessful required clean
install prevent SUCCESS; any repair follows the protected mutation/recovery rules.
