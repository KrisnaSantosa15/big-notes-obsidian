---
date: 2026-07-15
type: devlog
tags: [devlog, dicoding, ddd, tdd, clean-code, learning]
project: "[[Projects/Dicoding Platform]]"
related-people: ["[[People/Krisna]]"]
ai-first: true
---

## For future Claude

Dev log for 2026-07-15 about [[Projects/Dicoding Platform]]. A codebase-study / learning session: mapped the 4-layer architecture from the repo's own `docs/guidelines/development/` docs, then hunted for a single feature that perfectly demonstrates DDD + TDD + Clean Code, and verified it green. File paths and test results are preserved verbatim for re-verification.

## What was worked on

- Read `docs/guidelines/development/{architecture,web-layer,usecases-layer,domain-layer,infrastructure-layer,testing}.md` and `docs/getting-started/04-your-first-feature.md` to extract the architecture rules.
- Surveyed candidate features (Bootcamp Installment Invoice Regeneration, DevCert, email-platform) for DDD/TDD/Clean-Code completeness.
- Selected `EmailDraftCreation` (email-platform, API V1) as the canonical example. It has: action-named aggregate, nested VO, primitive-only event, thin Action with `::class` route, constructor-injected Infra, aggregate unit test (7 tests) + ONE repository happy-path unit test, and a full integration test.
- Verified green:
  - `deck ai:test --filter='EmailDraftCreationTest' --testsuite=unit` -> 7 tests, 14 assertions, OK
  - `deck ai:test --filter='EmailDraftCreationRepositoryTest' --testsuite=unit` -> 1 test, 4 assertions, OK
  - `deck ai:psalm "Dicoding/Domain/EmailPlatforms/Aggregates/EmailDraftCreation.php"` -> exit 0, no errors

## Problems encountered

- None. The feature matched every convention in the guidelines without deviation.

## Decisions made

- Recorded in [[Projects/Dicoding Platform]] Key Decisions: `EmailDraftCreation` is the reference example for DDD+TDD+Clean Code in this repo.

## Next steps

- Krisna may want a line-by-line walkthrough of `withPersistedDraftId()` (the aggregate state-machine / guard-method pattern) or a from-scratch TDD demo of a similar feature.
