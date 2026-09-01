---
tags:
  - pr-retro
  - moc
created: 2026-07-02
updated: '"2026-09-01"'
scope: "24 PRs authored by krisnasantosa15 in dicoding-dev/dicoding, #5017-#5344"
---

# PR Retrospective — Index

A retrospective built from every human review comment (162 total, bot noise excluded) across your last 24 pull requests in `dicoding-dev/dicoding`. Goal: turn scattered review feedback into a small set of durable habits, grounded in this codebase's actual conventions — not generic advice.

Start here, then open whichever theme is most relevant to what you're about to build. **→ [[Action Plan]] is the condensed, actionable version — check that before opening your next PR.**

## By severity

### 🔴 High — caused or nearly caused real problems
- [[01 Actions Must Stay Thin]] — business logic leaking into Actions instead of Specifications/ViewModels. Direct violation of the `CLAUDE.md` 4-layer rule.
- [[02 Explicit Failure Over Silent Fallbacks]] — `?? ''` / `?? false` silent fallbacks. **This one shipped a production bug** (#5268).
- [[06 Test Discipline]] — test scope, assertion strength, and the missing logged-out-user test case that let #5268 through.

### 🟡 Medium — real cost, not yet a fire
- [[03 Reuse Before You Build]] — rebuilding VOs/test helpers/specs/docs that already existed.
- [[04 Query Efficiency]] — N+1s, redundant queries, subquery-vs-join calls.
- [[05 Self-Documenting Code]] — response shapes that require diving through 3 functions to understand.
- [[08 Naming and File Organization]] — naming/placement misses. **Bumped from Low on 2026-07-14** — now the most-recurring theme in the vault (8 PRs), including a UI-vs-backend terminology drift caught by two reviewers independently.
- [[09 OAuth Scopes Mental Model]] — scope/filter mistakes, hit 3 times across 3 PRs.
- [[10 PR and Team Process Hygiene]] — scope creep, stale branches, unilateral convention docs.
- [[11 Entity Boundaries Case Study]] — Bootcamp/Asah merge, a genuine trade-off worth a documented decision.
- [[12 Aggregate Design]] — new (2026-07-14): getters should expose computed output, not echo inputs; don't parameterize a business rule that's currently fixed.

### 🟢 Low — cheap to self-check, still worth fixing
- [[07 Modern PHP Idioms]] — constructor promotion, trusting the type system, dead/unused code.

## By theme (all notes)
```dataview
table status, prs
from #pr-retro and -"PR Retrospective/00 Index" and -"PR Retrospective/Action Plan" and -"PR Retrospective/PR Log"
sort file.name asc
```
*(If the Dataview plugin isn't installed, see the table below or just browse [[PR Log]] for the same PR→theme mapping.)*

| Theme | Severity | PRs |
|---|---|---|
| [[01 Actions Must Stay Thin]] | High | #5104, #5078, #5033, #5324 |
| [[02 Explicit Failure Over Silent Fallbacks]] | High | #5181, #5268 |
| [[03 Reuse Before You Build]] | Medium | #5017, #5033, #5286, #5316 |
| [[04 Query Efficiency]] | Medium | #5061, #5224, #5200 |
| [[05 Self-Documenting Code]] | Medium | #5224, #5078 |
| [[06 Test Discipline]] | High | #5078, #5033, #5104, #5132, #5268, #5335 |
| [[07 Modern PHP Idioms]] | Low | #5017, #5033, #5132, #5224, #5286, #5324 |
| [[08 Naming and File Organization]] | Medium | #5017, #5061, #5078, #5219, #5033, #5286, #5316, #5324 |
| [[09 OAuth Scopes Mental Model]] | Medium | #5104, #5033, #5132 |
| [[10 PR and Team Process Hygiene]] | Medium | #5077, #5224, #5033, #5132 |
| [[11 Entity Boundaries Case Study]] | Medium | #5268 |
| [[12 Aggregate Design]] | Medium | #5335 |

## The one thing to internalize first
Almost every High-severity finding traces back to the same root instinct gap: **collapsing an unknown or a branch decision into a convenient default, instead of making it explicit.** `?? false` instead of an explicit assignment. An Action reaching into a Gateway instead of asking which layer owns the decision. A test skipping the "what if this precondition fails" case. Fix that one instinct — pause and ask "am I deciding this, or dodging the decision?" — and a large fraction of both the High and Medium items in this vault stop recurring.

## Data provenance
See [[PR Log]] for the full PR-by-PR source table, reviewer frequency, and methodology notes.

## Suggested vault hygiene
- New PR feedback worth remembering → add it to the matching theme note under a new `## Evidence` bullet (with PR link + quote), don't create a new note unless it's a genuinely new pattern.
- Revisit [[Action Plan]] monthly and prune checklist items that have stopped triggering — that's a sign the habit stuck.


---

## 2026-08-24 Update: Full Rescan

Completed full rescan of all 33 PRs authored by @KrisnaSantosa15. Added evidence to 4 existing themes with new PR data:

| Theme | New PRs | Update |
|-------|---------|--------|
| [[12 Aggregate Design]] | #5593, #5592 | Now recurring (was new). Reinforced core: aggregates own decisions & event-raising; parameters should be fixed today, not speculative. |
| [[08 Naming and File Organization]] | #5596, #5593, #5286 | Bumped to 10 total PRs (was 8). Added UI copy consistency + domain term consolidation patterns. |
| [[07 Modern PHP Idioms]] | #5588 | Now 7 PRs. Added Carbon DateTime preference signal. |
| [[03 Reuse Before You Build]] | #5593, #5282 | Now 6 PRs. Reinforced consolidation of domain concepts into VOs + documentation reuse. |

**Reviewers in 2026-08-24 batch:** dimasmds (4 comments across 4 PRs) and AlexzPurewoko (5 comments across 2 PRs). dimasmds continues to signal on naming/layering; AlexzPurewoko on aggregate/reuse decisions.

**No new themes created** — all feedback fit existing patterns. Severity levels unchanged.


---

## 2026-09-01 Update: PR #5626 rebase + review, #5630 aggregate refactor

`token-issuance-domain` (#5593) merged; rebasing the stacked branches on top surfaced 3 more review points, plus a self-directed aggregate-naming fix:

| Theme | New PR | Update |
|-------|--------|--------|
| [[07 Modern PHP Idioms]] | #5626 | Redundant `\|string` before `\|enum:X::class` in validation rules — enum rule already type-checks via `tryFrom()`. |
| [[01 Actions Must Stay Thin]] | #5626 | Domain-VO vs Infra-Gateway boundary: Gateway should map to a DB row via getters, not `$vo->toArray()` — `toArray()`'s real consumer is `NormalizePayloadStructureTrait` (API output), not persistence. |
| [[12 Aggregate Design]] | #5630 | Aggregate actor-noun naming (`Editor`→`Update`, matching `MultiCourseTokens*` process-noun convention) + constructor-must-not-validate, consolidated into one `validate*Rules()` method. |

**No new themes created** — all 3 points fit existing patterns.