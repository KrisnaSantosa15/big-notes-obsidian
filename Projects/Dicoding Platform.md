---
date: 2026-07-15
updated: 2026-07-15
type: project
status: active
tags: [project, dicoding, ddd, tdd, clean-code, php, laravel]
related-people: ["[[People/Krisna]]"]
related-projects: []
ai-first: true
---

## For future Claude

The `dicoding-dev/dicoding` codebase (Dicoding learning platform) studied by [[People/Krisna]] as a reference for DDD, TDD, and Clean Code. This note captures the architecture layering and, importantly, the single canonical feature that best demonstrates all three practices end-to-end - so future-Claude can point to it instead of re-deriving. Last updated 2026-07-15; verified green (unit tests + Psalm) on that date.

## Overview

Customized Laravel 4.2 (PHP 8.2+) rebuilt with DDD + Clean Architecture, organized into bounded contexts. 4 layers, dependencies point inward:

```
Web (HTTP/UI) --> UseCases (orchestration) --> Domain (pure business logic) <-- Infrastructure (DB / external)
```

- Web: thin Actions, routes, ViewModels. No business logic.
- UseCases: Specifications - validate input shape, orchestrate, return Payload.
- Domain: pure - Aggregates (action-named), Value Objects, Domain Events, Enums. No framework/DB.
- Infrastructure: Gateways (SQL/JSON), Repositories (Domain<->DB bridge), event handlers.

Full rules: `docs/guidelines/development/*.md` in the repo. End-to-end walkthrough: `docs/getting-started/04-your-first-feature.md`.

## Canonical clean-code reference example (VERIFIED)

**`EmailDraftCreation`** (email-platform domain, API V1) is the single best demonstration of DDD + TDD + Clean Code in this repo. Identified and verified green on 2026-07-15: 8 unit tests / 18 assertions pass, `deck ai:psalm` exits 0 with no errors.

Why it is canonical:

- **DDD**: Aggregate named by action (`EmailDraftCreation`, not `EmailDraft`); `authorize` in constructor, `create()` then `withPersistedDraftId()` raises the event (state machine: composed -> persisted -> raise). VO `NewEmailDraft` nests `EmailIdentity`, validates via `enum:` and `object:` rules. Event `EmailDraftWasCreated` stores only primitives.
- **Clean Code**: Action is thin (input in, JSON out, zero logic). Route uses inline `::class`. Infra uses constructor injection (`ConnectionInterface`, factory) - no Laravel globals.
- **TDD**: Domain-first - aggregate unit test written first (7 tests covering auth + every guard + event raise). Repository unit test is exactly ONE happy path. Integration test closes the loop (POST -> 201 -> event logged -> row exists).

| Layer | File (verbatim path) |
|---|---|
| Web Action | `Dicoding/Web/Api/V1/EmailPlatforms/Drafts/CreateEmailDraftAction.php` |
| UseCases Spec | `Dicoding/UseCases/EmailPlatforms/EmailDraftCreationSpecification.php` |
| Domain Aggregate | `Dicoding/Domain/EmailPlatforms/Aggregates/EmailDraftCreation.php` |
| Domain VO | `Dicoding/Domain/EmailPlatforms/ValueObjects/NewEmailDraft.php` |
| Domain Event | `Dicoding/Domain/EmailPlatforms/Events/EmailDraftWasCreated.php` |
| Infra Repository | `Dicoding/Infrastructure/Repositories/EmailPlatforms/EmailDraftCreationRepository.php` |
| Infra Gateway | `Dicoding/Infrastructure/StorageGateways/EmailPlatforms/EmailDraftGateway.php` |
| Unit test (Aggregate) | `app/tests/UnitTests/Domain/EmailPlatforms/Aggregates/EmailDraftCreationTest.php` |
| Unit test (Repository) | `app/tests/UnitTests/Domain/EmailPlatforms/Repositories/EmailDraftCreationRepositoryTest.php` |
| Integration test | `app/tests/IntegrationTests/Specifications/EmailPlatforms/Drafts/CreateEmailDraftIntegrationTest.php` |
| Route | `app/routes/email-platform.php` |

## Key Decisions

- **2026-07-15** - Adopt `EmailDraftCreation` as THE reference example when teaching/k demonstrating DDD+TDD+Clean Code in this repo. Rationale: it is the only feature observed that satisfies all three practices simultaneously AND is verified green. (confidence: high - verified directly)

## Recent Activity

- 2026-07-15 - Architecture mapped, canonical example identified & verified. See [[Dev Logs/2026-07-15 - Dicoding Platform]].
