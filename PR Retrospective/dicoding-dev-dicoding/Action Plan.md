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


*Added 2026-11-18 sync:*
- [ ] **Destructive query + empty input:** for every `delete()`/`update()`, what SQL does it produce with `[]`? Never let all WHERE conditions come from a loop; keep a fixed `where(...)` outside it and prefer `whereIn` (empty becomes `0 = 1`). → [[02 Explicit Failure Over Silent Fallbacks]] (#6301)
- [ ] **One catch per exception the aggregate throws:** `InvariantException` → `withInvariantExceptionPayload`, otherwise the user gets the generic "Maaf..." text. → [[02 Explicit Failure Over Silent Fallbacks]] (#6301)
- [ ] **Rules on the server:** no feature toggle as business state; every UI date gate, age limit, or option list has a server check. → [[13 Enforce Business Rules on the Server]] (#6021, #6169, #6126)
- [ ] **Aggregate inputs non-null; repository = create + save only; aggregate owns its output.** → [[12 Aggregate Design]] (#5630, #5671, #6256)
- [ ] **Bulk insert, one query for validation, no leading `%` LIKE.** → [[04 Query Efficiency]] (#6254, #6256, #5638)

## Before opening the PR
- [ ] Diffed changed files against the PR title — does every file trace back to what the title says? Split out anything that doesn't. [[10 PR and Team Process Hygiene]]
- [ ] Rebased against `master`.
- [ ] New guideline/convention doc? Land it as its own PR asking for explicit sign-off, not bundled into a feature PR. [[10 PR and Team Process Hygiene]]
- [ ] Naming self-check: temporal state (`old`/`new`), boolean predicates (no `get` prefix), file placement matches sibling types, and — if naming a new domain/enum concept — does product/UI copy already use a different term for the same thing? [[08 Naming and File Organization]]
- [ ] Test self-check: no re-testing of framework-guaranteed behavior (OAuth filter rejection), `assertEqual`/`assertObjectHasPropertyStructure` over field-by-field asserts, no unexplained mocks, negative cases first, no unused imports. [[06 Test Discipline]]

- [ ] AAA check: every test body visibly calls the production code under test (Act); `beforeEach`/`setUp` holds only shared Arrange. [[06 Test Discipline]]


*Added 2026-11-18 sync:*
- [ ] **One Specification per PR**; open it as a draft if it isn't ready. → [[10 PR and Team Process Hygiene]] (#6256)
- [ ] **Rebase + rebuild + run the full suite** right before requesting review (10+ conflict pings this period). → [[10 PR and Team Process Hygiene]], [[06 Test Discipline]] (#5947)
- [ ] **Assert exact error text**, and add a test for every claim in the PR description. → [[06 Test Discipline]] (#6301, #6312)
- [ ] **Seeded test users** (ADMINID=2, developer 5/6), not `createDicodingUser()`. → [[03 Reuse Before You Build]] (#5626, #5635, #5671)

## During review
- [ ] If a reviewer's concern is addressed, reply and let them resolve the thread — or explicitly say "resolved, ping if you still have concerns" instead of silently clicking resolve (it doesn't notify them). [[06 Test Discipline]]
- [ ] If merging two similar-looking features/entities to avoid duplication, state in the PR description what would trigger splitting them later — don't let "they overlap right now" go undocumented. [[11 Entity Boundaries Case Study]]

## Open question worth resurfacing with the team
[[01 Actions Must Stay Thin]] documents an unresolved disagreement from #5104 between `agissept` and `mochammadkevin` about whether read-only business rules (e.g. enrollment checks) belong in a Specification (consistent layering, costlier integration-test-only coverage) or a ViewModel (unit-testable, less consistent). Worth a deliberate team decision rather than re-litigating per PR.

## Related
[[00 Index]]
