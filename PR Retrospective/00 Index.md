---
tags: [pr-retro, moc, global]
---

# PR Retrospective — Global Index

Personal engineering-mistake retrospective, built from GitHub PR review
comments and maintained by the `pr-retrospective` skill
(`~/.claude/skills/pr-retrospective/SKILL.md`). Any agent working in a repo
below can read the relevant per-repo folder for known patterns before
finishing a change; this vault never gets edited directly by an agent's code
changes, only via the skill's SYNC mode.

## Cross-repo
[[_shared/Personal Engineering Habits]] — patterns that showed up in one repo
but generalize to any codebase (silent fallbacks, reuse-before-build, trust
the type system, readable response shapes, test discipline, PR hygiene,
naming). Read this one regardless of which repo you're in.

## Tracked repos

| Repo | Last synced | PRs covered | Index |
|---|---|---|---|
| `dicoding-dev/dicoding` | 2026-07-02 | #5017–#5286 (16 with feedback, 1 open/unreviewed) | [[dicoding-dev-dicoding/00 Index]] |

To add a new repo: run the `pr-retrospective` skill from inside that repo.
It creates `PR Retrospective/{owner}-{repo}/` and adds a row here
automatically on first sync.

## How to use this vault

**As the user:** ask to "sync my PR feedback" (incremental) or "run a full
PR retrospective" (rescans everything) any time. Browse a repo's `00 Index.md`
for a severity-tiered view, or `Action Plan.md` for the condensed checklist.

**As an agent working on code:** you may proactively read the relevant
repo's `Action Plan.md` (or `_shared/Personal Engineering Habits.md` if the
repo isn't tracked yet) after making a nontrivial change, and flag anything
that matches a known pattern — cite the specific note. This is always
informational, never blocking, and never an automatic edit; the user reviews
and decides. Don't run a full GitHub sync unprompted — that's the user's call.
