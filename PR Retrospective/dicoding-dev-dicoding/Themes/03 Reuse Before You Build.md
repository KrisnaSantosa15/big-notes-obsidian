---
tags: [pr-retro, theme/reuse, severity/medium]
prs: ["#5017", "#5033", "#5286", "#5316"]
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

**PR #5286** — documentation duplicated content that already existed as a runnable command, instead of linking to it:
> AlexzPurewoko: "sepertinya command cheat sheet ini tidak perlu di dokumentasi mengingat dia hanya copy of `deck help`... Better dari engineer langsung akses `deck help` instead dari dokumentasi"
> AlexzPurewoko, on the `make-ddd` skill doc: "Ini bisa disingkat aja langsung merefer ke deck skill..."

**PR #5316** — a domain spec proposed re-specifying things the codebase had already decided or already owned elsewhere:
> AlexzPurewoko: "Kita sudah tidak memerlukan repository interface untuk membuat dan save aggregate yah" — the draft spec's guideline still called for a repository interface the team had already dropped.
> AlexzPurewoko, on quota/reset display: "Itu sudah dihandle oleh premium feature bang. Ceki: `docs/guidelines/premium-feature.md`" — the new domain doc was about to re-specify something the Premium Feature system already owned.

## Why it matters
This is the exact failure mode the Ponytail ladder rung #2 exists to prevent ("Already in this codebase? A helper, util, type, or pattern that already lives here → reuse it"). Every instance here wasn't a hard problem — it was a **search-first miss**. The cost compounds: reviewers spend their comment budget pointing at existing code instead of reviewing the actual new logic, and duplicate helpers/aggregates now exist for the next person to be confused by. The 2026-07 batch (#5286, #5316) shows the same instinct gap applies to **docs and specs, not just code** — a design doc that re-proposes a convention the codebase already moved past costs the same reviewer attention as a duplicated helper.

## Root cause
Writing the test/aggregate top-down from "what do I need to prove" instead of first grepping the domain folder (`Dicoding/Domain/{Domain}`) and the shared test-helper base classes (`app/tests/ExtraAssertions.php`, `app/tests/ExtraIntegrationTestHelpers.php`, `app/tests/TestHelpers/*`) for something that already does 80% of it.

## How to fix
- Before writing a new VO/aggregate: `grep -rn` the domain's `Domain/{Domain}` folder for a class with the same concept name (`EmailSubscription`, `Invoice`, etc.).
- Before writing test setup/assertion code: check the three shared bases first — `ExtraAssertions.php`, `ExtraIntegrationTestHelpers.php`, `TestHelpers/*` — these are the project's "does stdlib already do it" layer for tests.
- If an existing helper is close but not quite enough (like `setUpOauthClient` needing scopes), prefer **extending it with an optional parameter** over forking a parallel one-off method — keeps a single source of truth other developers will actually find.
- Before writing a domain spec/PRD/guideline doc: check the existing guideline docs (`docs/guidelines/*.md`) and adjacent subsystems (e.g. Premium Feature) for something that already owns the concept you're about to re-describe — same instinct, applied to documentation instead of code.

## Related
[[00 Index]] · [[06 Test Discipline]] · [[07 Modern PHP Idioms]]
