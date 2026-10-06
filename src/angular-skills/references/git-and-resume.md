# Git context and interrupted upgrades

Read this for dirty worktrees, worktree isolation or resuming an upgrade.

## Establish the starting state

Record repository/worktree root, active branch, starting HEAD and Git operation
state. Inspect staged and unstaged diffs plus untracked paths, including nested
repositories/submodules in scope. Capture enough content or hashes in temporary
local evidence to distinguish user changes from later tooling changes and to
verify preservation; retain the distinction between index and working-tree state.
Do not include secrets or user-file contents in external logs or reports.

Stop an overlapping migration when unresolved merge/rebase conflicts or user edits
cannot be protected. Do not resolve unrelated Git operations, switch the user to a
different base, fetch/merge remote changes or commit their work merely to start.
Use the current HEAD as the base unless the user or repository workflow specifies
another base, and inspect the chosen base before branching.

Create or reuse the intended upgrade context. A linked worktree can isolate
committed inputs without switching the user's active branch; choose a new path
within host permissions and inspect existing worktree assignments. It does not
include the original index, untracked files or uncommitted dependency/source edits.
If those inputs matter, resolve which state to migrate rather than silently
omitting or copying them. Do not share writable node_modules between worktrees.

Never force branch creation, checkout or worktree replacement. Inspect a naming
collision and reuse only the intended upgrade context, otherwise choose a unique
name. Report its branch and path. A branch pointer saves commits, not uncommitted
changes: leave those in place and report them accurately when interrupted.

## Before every migration command

Check status again after installs, baseline checks and previous migrations.
Account for unrelated user files, untracked installed skill files and generated
artifacts as well as migration changes. Confirm expected schematic/lifecycle
effects before allowing a dirty tree. Avoid changing ignore rules or committing
unrelated files merely to satisfy the CLI.

Angular CLI documents `--allow-dirty`; verify availability in the executing CLI's
help/versioned documentation. It bypasses the repository cleanliness check and
does not protect files. Use it only when the existing edits are known, overlapping
user changes are protected or excluded by the documented tooling scope, and
preservation can be checked afterward. If safety remains uncertain, use an
appropriate isolated context or ask the user to resolve the specific overlap.
Keep the option explicit on each applicable command rather than assuming a prior
decision covers new changes. Never substitute Git force/discard flags.

Check automatic Git behavior in all selected tooling, including CLI
`--create-commits` and Nx migration configuration/agentic flows. Disable automatic
commits unless already authorized or required by applicable repository instructions.
Do not enable another agent flow just to make a migration run. If checkpoint
commits are authorized, stage only reviewed upgrade changes and preserve the
user's index and unrelated work.

## Record and resume

Keep a recovery record in host task notes or a local temporary location outside
the deliverable. Record its location in interruption reports when available.
Capture original resolved versions per migrated package, requested/resolved target,
guide evidence, runner/runtime, command results, completed and pending migrations,
manual steps, changed paths and the last validated versions. Update it after
installation, migration completion and validation; installation and validation
are separate milestones. Do not invent a prior milestone from package.json.

Reuse verified source baseline results. Changed manifests describe a planned or
partial destination, not a fresh source installation. Do not restore old packages
or reinstall against those manifests to reconstruct the source baseline. If its
evidence is missing, record that limitation and assess a reliable starting point
from the original inputs; use an isolated original-state check only when those
inputs can be established safely. Do not silently classify current failures as
pre-existing or reset the live upgrade workspace to manufacture a baseline.

On resume, including a generated migration plan with installation still pending,
inspect the existing branch/worktree, record, package/lockfile/installed versions
and migration output. Distinguish incomplete installation, failed
schematics, pending manual work and validation failures. Reconcile any subsequent
user edits. Do not create another branch or rerun already completed steps by default.

For a failed Angular schematic after packages were installed, establish the true
pre-update version and identify unfinished migrations. Consult the installed
package's official migration collection and the executing CLI's supported flags.
When appropriate, invoke local `ng update <one-package> --migrate-only` with
verified `--from`, `--to` and/or `--name` options. These options have version-specific
constraints; do not pass two packages to a single-package recovery command.
Assess rerun safety and partially applied files before retrying. Do not assume all
schematics are idempotent. For Nx, recover from its retained migration plan and
actual completed entries rather than generating a new plan from installed versions.

If original versions or migration completion cannot be established from task
evidence, Git changes and official metadata, report the missing recovery evidence.
Do not label the upgrade a no-op merely because its target packages are installed.
An ordinary already-current workspace without interruption evidence can be
validated as a no-op; do not demand nonexistent historical migration logs.
