# Angular update skill

An instruction-first skill for Angular framework/CLI version upgrades. It retrieves
official migration evidence, preserves user work, validates one major at a time
and distinguishes installed packages from completed migrations. No helper scripts
or extra packages are required by the skill itself.

```text
angular-skills/
|-- SKILL.md                 Core workflow and safety rules
|-- references/
|   |-- update-guide.md      Checklist retrieval, phases and evidence
|   |-- git-and-resume.md    Existing changes, isolation and recovery
|   |-- workspace-variants.md Nx, libraries and coordinated dependencies
|   |-- validation.md        Feature-dependent acceptance checks
|   `-- legacy-and-prerelease.md Exceptional version paths
|-- assets/
|   `-- report-template.md   Report fields and execution evidence
`-- README.md                Distribution, usage and evaluation scenarios
```

## Install

Copy the **entire skill bundle**, preserving references and assets, into a folder
named angular-update in the target repository:

```text
<repository-root>/.agents/skills/angular-update/
```

This angular-skills directory is a distribution location; install it in a discovery
directory before use. Keep one authoritative installed copy. Include installed
repository skills in the repository's normal tracking policy so newly copied
untracked files do not unexpectedly block Angular CLI updates. The agent must
still protect any untracked files rather than silently committing or ignoring them.

Codex and Copilot support .agents/skills repository skills; Copilot also supports
.github/skills. For personal installation, use `~/.agents/skills/angular-update`
(Windows: `%USERPROFILE%\.agents\skills\angular-update`); Copilot also supports
`~/.copilot/skills`. Personal installation is local; use repository installation
for teammates or hosted agents. See [Codex skills](https://developers.openai.com/codex/skills/)
and [Copilot agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills).

## Use

In Codex, open the target repository and prompt:

```text
Use $angular-update to upgrade this project to Angular 22.
```

Or request a constrained minor, exact published version or latest stable. Angular
22 is an example, not a hard-coded latest release. The skill detects the source.
For a read-only assessment:

```text
Use $angular-update to plan this upgrade to Angular 22. Do not modify the repository.
```

The description also allows matching version-upgrade requests without explicit
invocation. Standalone conversion and unrelated modernization are separate tasks.
If discovery fails, restart the agent or ask it to read the installed SKILL.md;
keep supporting files beside it.

For Copilot, use an agent experience with repository and terminal access, such as
VS Code agent mode or Copilot CLI, and request the angular-update skill. In Copilot
CLI, check discovery with `/skills list` and invoke `/angular-update`. See
[Copilot CLI skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills).

## Prerequisites and result

Provide official documentation/registry access or sufficient exact-version cached
evidence, the repository package manager, compatible locally activated runtimes,
and available validation prerequisites. Host permissions and explicit user choices
take precedence. The skill does not automatically push, open a PR, commit, change
package managers or install Node globally.

On interruption, retain the worktree and recovery evidence. Resume on the intended
context after resolving the prerequisite; target packages may already be installed
while migrations or validation are unfinished. Reports distinguish requested,
resolved and actual versions, last validated state, partial edits and remaining work.
SUCCESS includes explicit validation evidence; a no-op does not repair the project.

## Evaluate revisions

Use disposable fixtures and the installed bundle, without upgrading a live
repository merely to test the instructions. Static frontmatter/link checks verify
packaging, not migration behavior. Evaluate observable decisions and artifacts:

| Scenario | Expected behavior |
| --- | --- |
| Plan-only or review request | Inspect and explain; no branch, install or migration |
| Exact patch or constrained minor | Preserve the constraint and inspect interval-specific evidence |
| Multi-major update without commit authorization | Separate validated transitions; no implicit commits |
| Dirty tree with unrelated, staged and untracked work | Record and preserve it; establish a safe tooling context |
| Overlapping user edits | Resolve isolation/input choice before mutating those files |
| Installed destination after schematic failure | Recover pending migration work; do not declare a no-op |
| Unsupported initial Node runtime | Activate a source-compatible runtime before the baseline install |
| Nx or custom builder workspace | Choose its supported migration owner and avoid duplicate workflows |
| Guide fetch returns only selectors | Retrieve rendered checklist or official data/logic; disclose fallback |
| Already-current workspace without interruption evidence | Validate a no-op without demanding historical migration logs |
| SSR/localized/library build succeeds but relevant runtime/output checks fail | Report incomplete validation rather than SUCCESS |
| Optional modernization prompt | Preserve supported existing architecture unless scope justifies conversion |

Include negative trigger cases such as standalone conversion or an unrelated
Angular feature change. Assess actual command plans, preserved files, migration
coverage and reported evidence rather than matching prescribed wording.
