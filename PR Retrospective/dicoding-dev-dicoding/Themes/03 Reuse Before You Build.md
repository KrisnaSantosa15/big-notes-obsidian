---
tags: [pr-retro, theme/reuse, severity/medium]
prs: ["#5017", "#5033"]
status: recurring
---

# Reuse Before You Build

## The pattern
Writing a new implementation (a hand-rolled aggregate, a bespoke test setup, a from-scratch assertion) when an equivalent already existed in the codebase — because it wasn't searched for first.

## Evidence

**PR #5017** — a whole aggregate was rebuilt when a Value Object already covered it:

> AlexzPurewoko: "Agar lebih pas secara ddd, menurutku ini bisa di refactor menjadi satu value objects saja. Dan ini ternyata sudah ada VO-nya, yakni `EmailSubscription`."

Same PR, test setup duplicated existing helper logic instead of calling it:

> "Ini bisa pake helper `updateExistingData()` aja bang" — confirmed to exist at `app/tests/ExtraIntegrationTestHelpers.php:189`.

**PR #5033** — this happened *repeatedly* in one PR, all confirmed to exist in the codebase already:
- `$this->assertObjectHasPropertyStructure(...)` for shape assertions (`app/tests/ExtraAssertions.php:177`) — a bespoke property-by-property assertion was written instead.
- `oauthAuthenticateUserAndGetAccessToken()` / `setUpOauthClient()` already accept an optional `scopes` parameter (`app/tests/TestHelpers/WithOauthRequest.php:68,115`) — reviewer: *"Daripada membuat ulang methodnya spesifik, akan lebih baik jika memodifikasi method existing."*
- A concrete `createInvoice()` test factory existed instead of a hand-built Prophecy mock for a Value Object: *"untuk meng override full VO, overkill... object ini bisa dibuat menggunakan helper `createInvoice()`."*

## Why it matters
This is the exact failure mode the Ponytail ladder rung #2 exists to prevent ("Already in this codebase? A helper, util, type, or pattern that already lives here → reuse it"). Every instance here wasn't a hard problem — it was a **search-first miss**. The cost compounds: reviewers spend their comment budget pointing at existing code instead of reviewing the actual new logic, and duplicate helpers/aggregates now exist for the next person to be confused by.

## Root cause
Writing the test/aggregate top-down from "what do I need to prove" instead of first grepping the domain folder (`Dicoding/Domain/{Domain}`) and the shared test-helper base classes (`app/tests/ExtraAssertions.php`, `app/tests/ExtraIntegrationTestHelpers.php`, `app/tests/TestHelpers/*`) for something that already does 80% of it.

## How to fix
- Before writing a new VO/aggregate: `grep -rn` the domain's `Domain/{Domain}` folder for a class with the same concept name (`EmailSubscription`, `Invoice`, etc.).
- Before writing test setup/assertion code: check the three shared bases first — `ExtraAssertions.php`, `ExtraIntegrationTestHelpers.php`, `TestHelpers/*` — these are the project's "does stdlib already do it" layer for tests.
- If an existing helper is close but not quite enough (like `setUpOauthClient` needing scopes), prefer **extending it with an optional parameter** over forking a parallel one-off method — keeps a single source of truth other developers will actually find.

## Related
[[00 Index]] · [[06 Test Discipline]] · [[07 Modern PHP Idioms]]
