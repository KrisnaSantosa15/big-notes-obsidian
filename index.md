# Vault Index

Catalog of all notes in this vault, grouped by folder. Claude reads this file first when navigating - cheaper and faster than searching. Regenerated fresh on each `/obsidian-init` run; always reflects current vault state as of the date below.

*Last generated: 2026-07-14*

## PR Retrospective

Maintained by the separate `pr-retrospective` skill, not `/obsidian-*`. Personal engineering-mistake retrospective built from GitHub PR review comments.

- [[PR Retrospective/00 Index]] - global index across all tracked repos; currently tracks one repo, `dicoding-dev/dicoding` (#5017-#5286, synced 2026-07-02)
- [[PR Retrospective/_shared/Personal Engineering Habits]] - cross-repo patterns that generalize beyond one codebase (silent fallbacks, reuse-before-build, trust the type system, readable response shapes, test discipline, PR hygiene, naming)

### dicoding-dev/dicoding
- [[PR Retrospective/dicoding-dev-dicoding/00 Index]] - severity-tiered index of 17 authored PRs, 107 human review comments
- [[PR Retrospective/dicoding-dev-dicoding/Action Plan]] - condensed pre-PR self-review checklist, ordered by historical cost
- [[PR Retrospective/dicoding-dev-dicoding/PR Log]] - raw PR-by-PR source data and reviewer frequency
- [[PR Retrospective/dicoding-dev-dicoding/_state]] - sync state (last synced 2026-07-02, last PR #5286) - not a content note, used by the skill to scope incremental syncs

### dicoding-dev/dicoding - Themes (by severity)
- [[PR Retrospective/dicoding-dev-dicoding/Themes/01 Actions Must Stay Thin]] - High - business logic leaking into Actions instead of Specifications/ViewModels
- [[PR Retrospective/dicoding-dev-dicoding/Themes/02 Explicit Failure Over Silent Fallbacks]] - High - `?? ''` / `?? false` silent fallbacks; shipped a production bug (#5268)
- [[PR Retrospective/dicoding-dev-dicoding/Themes/06 Test Discipline]] - High - test scope, assertion strength, missing logged-out-user test case
- [[PR Retrospective/dicoding-dev-dicoding/Themes/03 Reuse Before You Build]] - Medium - rebuilding VOs/test helpers that already existed
- [[PR Retrospective/dicoding-dev-dicoding/Themes/04 Query Efficiency]] - Medium - N+1s, redundant queries, subquery-vs-join
- [[PR Retrospective/dicoding-dev-dicoding/Themes/05 Self-Documenting Code]] - Medium - response shapes requiring multi-function tracing to understand
- [[PR Retrospective/dicoding-dev-dicoding/Themes/09 OAuth Scopes Mental Model]] - Medium - scope/filter mistakes, hit 3 times across 3 PRs
- [[PR Retrospective/dicoding-dev-dicoding/Themes/10 PR and Team Process Hygiene]] - Medium - scope creep, stale branches, unilateral convention docs
- [[PR Retrospective/dicoding-dev-dicoding/Themes/11 Entity Boundaries Case Study]] - Medium - Bootcamp/Asah merge trade-off
- [[PR Retrospective/dicoding-dev-dicoding/Themes/07 Modern PHP Idioms]] - Low - constructor promotion, trusting the type system
- [[PR Retrospective/dicoding-dev-dicoding/Themes/08 Naming and File Organization]] - Low - naming/placement misses

## Research

Folder exists, currently empty - no research command has been run yet.

## Logs

Vault operations log, one file per day.

- [[Logs/2026-07-14]] - today's log, init entry

## Projects

Active and archived projects.

- [[Projects/Dicoding Platform]] - dicoding-dev/dicoding codebase architecture + canonical DDD/TDD/Clean Code reference example (EmailDraftCreation), verified green 2026-07-15

## People

One note per person.

- [[People/Krisna]] - vault owner; studying DDD/TDD/Clean Code via the Dicoding codebase (as of 2026-07-15)

## Companies

Employers / orgs referenced.

- [[Companies/Dicoding]] - Indonesian tech-education platform; repo `dicoding-dev/dicoding`

## Daily

One note per day, `YYYY-MM-DD.md`.

- [[Daily/2026-07-15]] - Dicoding codebase study session; canonical clean-code example identified

## Dev Logs

Work/dev session logs, `Dev Logs/YYYY-MM-DD - Project Name.md`.

- [[Dev Logs/2026-07-15 - Dicoding Platform]] - codebase architecture study; EmailDraftCreation verified green

## Root files

- [[_CLAUDE.md]] - Claude operating manual for this vault (this init generated it)
- [[index]] - this file
- [[log]] - pointer file explaining the per-day log structure
