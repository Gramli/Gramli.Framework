---
name: angular-update
description: Upgrade Angular framework and CLI versions in an existing Angular workspace. Excludes standalone conversion and unrelated Angular modernization.
---

# Angular update

Upgrade to the requested version using official guidance and validate each major
transition. Keep changes focused on compatibility and preserve existing behavior.
Explicit user instructions take precedence over these defaults; host tools and
permissions still apply. For review, planning, or dry-run requests,
remain read-only and report the proposed work without installing or migrating.

## 1. Inspect and resolve

- Read applicable repository instructions. Identify the Git root, intended
  workspace, resolved Angular versions, package manager/version, lockfile and CI.
  Reconcile manifests, lockfiles and any installed packages; do not mistake a
  declared range or stale node_modules for the migration source.
- Discover Angular packages, builders, apps/libraries, third-party peers and
  runtime constraints. Use [workspace variants](references/workspace-variants.md)
  for Nx, custom tooling, publishable libraries or dependency conflicts.
- Obtain the target if missing. Resolve a major to its latest stable release, a
  minor to its latest stable patch, and preserve an exact requested version.
  Verify published releases; record exact compatible versions for core, CLI and
  coordinated packages independently. Do not assume identical patch numbers exist.
- Plan one major at a time, normally using the latest stable patch of each
  intermediate major. Preserve the final target constraint. Downgrades and pure
  AngularJS migrations are outside this workflow. For historical or explicitly
  requested prerelease paths, read [exceptional paths](references/legacy-and-prerelease.md).
- Read [guide retrieval](references/update-guide.md) to obtain the actual selected
  checklist and supporting compatibility evidence. Record applicable steps and
  phases; supplement coarse guide versions for minor/patch changes.
- Check for an interrupted upgrade or already-prepared migration plan before
  declaring a no-op. Read [Git and recovery](references/git-and-resume.md) when
  resuming or completion is uncertain. Installed target packages do not prove completion.

Present the resolved source/target, migration owner (Angular CLI, Nx or documented
custom tooling), intermediate steps, runtime transitions and validation scope.
Proceed with authorized routine work; clarify only choices that affect scope or safety.

## 2. Protect the starting state

For an eligible no-op, check the existing runtime and installation, then validate
and report through section 5. Skip branch creation, baseline installation and
upgrade transitions. The final isolated npm verification below still applies.
Leave the live installation and user files untouched; a required lockfile repair
ends the no-op path and must follow the protected mutation workflow.

Record the starting branch/HEAD and staged, unstaged and untracked changes. Before
project mutations, establish and verify an upgrade branch/worktree unless the
user explicitly chooses another safe context. Reuse an existing intended context
when safe; otherwise follow repository naming conventions or use
`chore/update-angular-<source>-to-<target>`. Never overwrite an existing branch.
Temporary evidence and tool caches do not require creating a project branch.

A branch does not isolate or save uncommitted files. For dirty worktrees, worktree
creation or interrupted work, read [Git and recovery](references/git-and-resume.md).
Protect existing user changes and the index. Never automatically stash, reset,
clean, restore user files or rewrite history. Do not implicitly commit, push or
open a PR; honor explicit authorization and applicable repository instructions.

## 3. Establish the baseline

Before installation or executing project tooling, activate Node and a package
manager compatible with the source workspace. Check complete official ranges,
including upper bounds, and project engine constraints. Use the existing runtime
manager; do not make arbitrary machine-wide changes. If activation is unavailable,
report the required runtime before changing dependencies.

On resume or with already-changed migration manifests, reuse the original baseline
evidence and follow recovery. Do not reinstall source packages into the changed
workspace or treat its partial destination as a new baseline.

For a fresh upgrade, install or verify source dependencies using the repository
manager and reproducible lockfile mode where supported. Inspect lifecycle scripts that could affect user
files or Git state. Select build, test and configured lint commands for affected
projects in non-watch modes; use [validation](references/validation.md) for
feature-dependent checks. Record commands, environments and baseline failures.
Resolve a migration-blocking baseline problem within scope or report the blocker.

## 4. Complete each transition

1. Record the exact source versions, resolved destination, pending migrations and
   last validated state in host task notes or a local record outside the deliverable.
   Keep the record available on resume without adding an unsolicited tracked file.
2. Execute required **before-upgrade** steps under their supported runtime. Establish
   the runtime for the migration runner and destination; use a shared compatible
   Node version where possible, otherwise follow the documented transition. Check
   activation scope against user constraints. Update project runtime pins (.nvmrc,
   .node-version, Volta, devcontainer or CI) where required for the destination.
3. Execute the planned **during-upgrade** sequence, rechecking dirty-tree safety
   before every migration command, including the first. Use the selected migration
   owner and verified local executable. For Angular CLI,
   invoke `ng update` through the repository manager with resolved package versions.
   Do not use bare global `ng` or auto-download latest tooling to inspect versions.
   Any required temporary CLI must be versioned and supported for this transition.
   For Nx/custom tooling, follow its official migration plan rather than also
   running an independent Angular update. Apply the **during-upgrade** steps in order.
4. At their planned point in that sequence, coordinate Material/CDK (including
   CDK-only projects), SSR and other required dependencies with their migrations. For conflicts, use
   [workspace variants](references/workspace-variants.md); avoid trial-and-error
   package installs. Never silently use `--force`, `--legacy-peer-deps` or ignore errors.
5. Complete required **after-upgrade** work and inspect automated changes. Separate
   required compatibility work from optional modernization. Decline optional
   builder, standalone or test-runner conversions when the target supports the
   existing setup, unless requested or justified by the agreed scope. Determine
   prompt answers before running interactive or noninteractive tooling.
6. Verify installed/resolved versions and run the selected validation. Compare the
   diff and new artifacts against the recorded starting state. Do not disable
   checks, skip tests, loosen assertions, raise budgets or regenerate snapshots
   merely to obtain a pass. Explain any justified validation configuration change.
7. Fix upgrade-caused failures within scope and rerun checks invalidated by the fix.
   Advance only after migrations, dependency checks and required validation for
   this step are complete. Keep unchanged baseline failures and unavailable checks
   separate. Update the recovery record after migrations and validation.

On failure, preserve the working-tree changes and consult
[Git and recovery](references/git-and-resume.md) before retrying. Do not reinterpret
a failed transition's installed destination as a successfully migrated source.

## 5. Complete and report

Use SUCCESS only when the requested target is satisfied, coordinated packages and
actual Node/TypeScript/RxJS meet supported ranges, required migrations are complete,
user changes are preserved, installation/required builds and runtime checks pass,
and configured tests/lint pass or have demonstrably unchanged baseline failures.
For npm workspaces, SUCCESS also requires the [final clean-directory npm check](references/validation.md#final-clean-directory-npm-verification),
using supported Node, CI's npm version and enabled lifecycle scripts. This includes
no-op checks: dry runs and installs in the existing workspace are insufficient.
Repair a failing lockfile with the repository manager. If targeted repair fails,
use the validation reference's controlled full-regeneration fallback in an isolated
copy. Review dependency changes, rerun affected checks against the repaired graph,
and repeat fresh-directory npm ci while preserving the live installation.
A missing build, required runtime check or clean npm check prevents success.
Label a validated no-op explicitly.
Use PARTIAL when a validated transition completed but the target or required
evidence remains incomplete; otherwise use BLOCKED and disclose any partial edits.

Report source/requested/actual versions, branch/worktree and uncommitted state,
completed path, last validated state, meaningful changes, validation evidence,
remaining work and official sources with guide selections/fallback. For the clean
npm check, report its command, Node/npm versions, platform and result; disclose
unavailable native CI-platform verification. Adapt
[the report template](assets/report-template.md) when composing the response;
respect the user's requested output format.
