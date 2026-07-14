---
tags: [pr-retro, moc, shared]
scope: cross-repo
---

# Personal Engineering Habits (cross-repo)

Patterns from PR review feedback that aren't specific to one stack or
codebase — they showed up first in `dicoding-dev/dicoding`, but the
underlying habit is general enough to watch for in any repo. Each entry
links back to the full evidence (quotes, PR links) in the repo where it was
first observed. When the same habit recurs in a *different* repo, add a
dated bullet here rather than duplicating the full write-up.

## Make the missing case explicit, don't default it away
`?? ''`, `?? false`, `empty()`-style fallbacks turn a "why is this missing?"
question into a silently-accepted default. This is the single highest-cost
habit observed so far — it shipped a real production bug in one repo
(logged-out users silently got a broken UI state instead of an explicit
`false`). Watch for: any nullable-coalesce or `empty()` check where the real
question is "should this even be reachable?"
→ full evidence: [[dicoding-dev-dicoding/Themes/02 Explicit Failure Over Silent Fallbacks]]

## Search before you build
New Value Objects, test helpers, and assertions were repeatedly hand-rolled
when an equivalent already existed in the codebase, just not searched for
first. Cheap habit to fix: grep the domain/shared-helper layer for the
concept name before writing a new implementation of it.
→ full evidence: [[dicoding-dev-dicoding/Themes/03 Reuse Before You Build]]

## Trust the type system, delete the redundant guard
Casts and `is_array`/`is_string` checks added out of habit where a
declared return/param type already guarantees the shape. Harmless alone,
compounds into review noise — every instance makes a reader re-verify
"is this doing anything."
→ full evidence: [[dicoding-dev-dicoding/Themes/07 Modern PHP Idioms]]

## Make the response shape readable from the top of the file
If understanding what a function/endpoint returns requires tracing two or
three nested calls across files, that's a readability debt, not just a
style nit. A cold read of just the top-level body should be enough to state
the output shape.
→ full evidence: [[dicoding-dev-dicoding/Themes/05 Self-Documenting Code]]

## Test the branch, not just the happy path — especially "not logged in"
The costliest test gap observed was never testing the logged-out/anonymous
version of a feature that behaves differently for authenticated users. Also
recurring: integration tests covering edge cases that belong in unit tests,
and re-testing framework guarantees (auth filter rejection) instead of
trusting the shared test for it.
→ full evidence: [[dicoding-dev-dicoding/Themes/06 Test Discipline]]

## PR scope discipline
Unrelated changes bundled into a differently-titled PR, new team-wide
convention docs merged without socializing them first, stale branches not
rebased before requesting final review. All cheap to self-check right before
opening a PR.
→ full evidence: [[dicoding-dev-dicoding/Themes/10 PR and Team Process Hygiene]]

## Naming: make temporal/boolean state explicit
Ambiguous names for "before vs after" state, generic names where the domain
concept was known, `getX()` for boolean predicates instead of `isX()`/`hasX()`.
→ full evidence: [[dicoding-dev-dicoding/Themes/08 Naming and File Organization]]
- 2026-07-14: recurred 3x in dicoding-dev/dicoding (#5286, #5316, #5324) —
  new sub-pattern: product/UI terminology drifting from the backend/domain
  term for the same concept, caught by two reviewers independently in one
  PR. Severity bumped Low → Medium in that repo given the frequency.

## Related
[[00 Index]]
