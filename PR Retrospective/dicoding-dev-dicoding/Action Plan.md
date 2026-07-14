---
tags: [pr-retro, action-plan]
---

# Action Plan — Pre-PR Checklist

A self-review pass to run **before** opening a PR, ordered by how much a miss here has historically cost (highest first). Each line links to the full theme note.

## Before writing code
- [ ] Named the business rule for this change out loud — is it a decision/validation (→ Specification) or a pure read (→ ViewModel)? [[01 Actions Must Stay Thin]]
- [ ] Grepped the domain folder (`Dicoding/Domain/{Domain}`) and shared test bases (`ExtraAssertions.php`, `ExtraIntegrationTestHelpers.php`, `TestHelpers/*`) for an existing VO/helper before writing a new one. [[03 Reuse Before You Build]]
- [ ] Read the whole Gateway class (+ one sibling Gateway) before adding a new query method — is the data already fetched somewhere nearby? [[04 Query Efficiency]]
- [ ] New aggregate: does every constructor/method parameter vary today (not just hypothetically), and does every getter expose something the aggregate computed rather than echo an input back? [[12 Aggregate Design]]

## While writing code
- [ ] Every `?? X` / `empty()` fallback: is this a real default, or am I hiding a "precondition failed" branch that should throw or be explicit instead? [[02 Explicit Failure Over Silent Fallbacks]]
- [ ] Every cast / `is_array()` / `is_string()` guard: checked the declared type one line above — is the guard actually redundant? [[07 Modern PHP Idioms]]
- [ ] Cold-read the Action/Transformer top-level body only — can I state the response shape without diving into called functions? [[05 Self-Documenting Code]]
- [ ] Any endpoint touching auth: does it declare the *narrowest* OAuth scope it needs, and is that scope already registered in `oauth_server_scopes.php`? [[09 OAuth Scopes Mental Model]]
- [ ] Any feature conditionally available to logged-in users: added a test for the **logged-out** path? [[06 Test Discipline]] · [[02 Explicit Failure Over Silent Fallbacks]]

## Before opening the PR
- [ ] Diffed changed files against the PR title — does every file trace back to what the title says? Split out anything that doesn't. [[10 PR and Team Process Hygiene]]
- [ ] Rebased against `master`.
- [ ] New guideline/convention doc? Land it as its own PR asking for explicit sign-off, not bundled into a feature PR. [[10 PR and Team Process Hygiene]]
- [ ] Naming self-check: temporal state (`old`/`new`), boolean predicates (no `get` prefix), file placement matches sibling types, and — if naming a new domain/enum concept — does product/UI copy already use a different term for the same thing? [[08 Naming and File Organization]]
- [ ] Test self-check: no re-testing of framework-guaranteed behavior (OAuth filter rejection), `assertEqual`/`assertObjectHasPropertyStructure` over field-by-field asserts, no unexplained mocks, negative cases first, no unused imports. [[06 Test Discipline]]

## During review
- [ ] If a reviewer's concern is addressed, reply and let them resolve the thread — or explicitly say "resolved, ping if you still have concerns" instead of silently clicking resolve (it doesn't notify them). [[06 Test Discipline]]
- [ ] If merging two similar-looking features/entities to avoid duplication, state in the PR description what would trigger splitting them later — don't let "they overlap right now" go undocumented. [[11 Entity Boundaries Case Study]]

## Open question worth resurfacing with the team
[[01 Actions Must Stay Thin]] documents an unresolved disagreement from #5104 between `agissept` and `mochammadkevin` about whether read-only business rules (e.g. enrollment checks) belong in a Specification (consistent layering, costlier integration-test-only coverage) or a ViewModel (unit-testable, less consistent). Worth a deliberate team decision rather than re-litigating per PR.

## Related
[[00 Index]]
