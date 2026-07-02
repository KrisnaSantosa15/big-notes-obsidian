---
tags: [pr-retro, moc]
created: 2026-07-02
scope: "17 PRs authored by krisnasantosa15 in dicoding-dev/dicoding, #5017-#5286"
---

# PR Retrospective — Index

A retrospective built from every human review comment (107 total, bot noise excluded) across your last 17 pull requests in `dicoding-dev/dicoding`. Goal: turn scattered review feedback into a small set of durable habits, grounded in this codebase's actual conventions — not generic advice.

Start here, then open whichever theme is most relevant to what you're about to build. **→ [[Action Plan]] is the condensed, actionable version — check that before opening your next PR.**

## By severity

### 🔴 High — caused or nearly caused real problems
- [[01 Actions Must Stay Thin]] — business logic leaking into Actions instead of Specifications/ViewModels. Direct violation of the `CLAUDE.md` 4-layer rule.
- [[02 Explicit Failure Over Silent Fallbacks]] — `?? ''` / `?? false` silent fallbacks. **This one shipped a production bug** (#5268).
- [[06 Test Discipline]] — test scope, assertion strength, and the missing logged-out-user test case that let #5268 through.

### 🟡 Medium — real cost, not yet a fire
- [[03 Reuse Before You Build]] — rebuilding VOs/test helpers that already existed.
- [[04 Query Efficiency]] — N+1s, redundant queries, subquery-vs-join calls.
- [[05 Self-Documenting Code]] — response shapes that require diving through 3 functions to understand.
- [[09 OAuth Scopes Mental Model]] — scope/filter mistakes, hit 3 times across 3 PRs.
- [[10 PR and Team Process Hygiene]] — scope creep, stale branches, unilateral convention docs.
- [[11 Entity Boundaries Case Study]] — Bootcamp/Asah merge, a genuine trade-off worth a documented decision.

### 🟢 Low — cheap to self-check, still worth fixing
- [[07 Modern PHP Idioms]] — constructor promotion, trusting the type system.
- [[08 Naming and File Organization]] — naming/placement misses.

## By theme (all notes)
```dataview
table status, prs
from #pr-retro and -"PR Retrospective/00 Index" and -"PR Retrospective/Action Plan" and -"PR Retrospective/PR Log"
sort file.name asc
```
*(If the Dataview plugin isn't installed, see the table below or just browse [[PR Log]] for the same PR→theme mapping.)*

| Theme | Severity | PRs |
|---|---|---|
| [[01 Actions Must Stay Thin]] | High | #5104, #5078, #5033 |
| [[02 Explicit Failure Over Silent Fallbacks]] | High | #5181, #5268 |
| [[03 Reuse Before You Build]] | Medium | #5017, #5033 |
| [[04 Query Efficiency]] | Medium | #5061, #5224, #5200 |
| [[05 Self-Documenting Code]] | Medium | #5224, #5078 |
| [[06 Test Discipline]] | High | #5078, #5033, #5104, #5132, #5268 |
| [[07 Modern PHP Idioms]] | Low | #5017, #5033, #5132, #5224 |
| [[08 Naming and File Organization]] | Low | #5017, #5061, #5078, #5219, #5033 |
| [[09 OAuth Scopes Mental Model]] | Medium | #5104, #5033, #5132 |
| [[10 PR and Team Process Hygiene]] | Medium | #5077, #5224, #5033, #5132 |
| [[11 Entity Boundaries Case Study]] | Medium | #5268 |

## The one thing to internalize first
Almost every High-severity finding traces back to the same root instinct gap: **collapsing an unknown or a branch decision into a convenient default, instead of making it explicit.** `?? false` instead of an explicit assignment. An Action reaching into a Gateway instead of asking which layer owns the decision. A test skipping the "what if this precondition fails" case. Fix that one instinct — pause and ask "am I deciding this, or dodging the decision?" — and a large fraction of both the High and Medium items in this vault stop recurring.

## Data provenance
See [[PR Log]] for the full PR-by-PR source table, reviewer frequency, and methodology notes.

## Suggested vault hygiene
- New PR feedback worth remembering → add it to the matching theme note under a new `## Evidence` bullet (with PR link + quote), don't create a new note unless it's a genuinely new pattern.
- Revisit [[Action Plan]] monthly and prune checklist items that have stopped triggering — that's a sign the habit stuck.
