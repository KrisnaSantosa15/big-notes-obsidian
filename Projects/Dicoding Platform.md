---
date: 2026-07-15
updated: 2026-07-15
type: project
status: active
tags: [project, dicoding, ddd, tdd, clean-code, php, laravel, monthly-add-ons]
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

- **2026-07-15** - Adopt `EmailDraftCreation` as THE reference example when teaching/demonstrating DDD+TDD+Clean Code in this repo. Rationale: it is the only feature observed that satisfies all three practices simultaneously AND is verified green. (confidence: high - verified directly)

## Monthly Add-Ons Feature (PR #5335 / #5340 / #5344)

Three-phase stacked PRs implementing entitlement add-ons purchase and settlement.

### Phase 1 (PR #5335 - domain layer) — Key decisions

- **Aggregate constructor signature** (2026-07-15, requested by reviewer [[People/AlexzPurewoko]]): Changed from `MonthlyAddOnPurchase(int $userId, MonthlyAddOnType $addonType, MonthlyAddOnExpiry $currentExpiry)` to `MonthlyAddOnPurchase(CommonActor $actor, ExistingMonthlyAddOn $existingAddOn)`. Rationale: mirrors sibling `SubscriptionPurchase` aggregate's `CommonActor` precedent for consistency across domain layer. (confidence: high)

- **Value Object consolidation** (2026-07-15, requested by [[People/AlexzPurewoko]]): Renamed `MonthlyAddOnExpiry` → `ExistingMonthlyAddOn`, bundling `MonthlyAddOnType` + expiry `DateTimeImmutable` into one VO. `purchase()` method now takes zero parameters, reads addon type from the injected VO. Date-math uses `Carbon` transiently only at aggregate boundary to keep VO on pure stdlib `DateTimeImmutable`. (confidence: high)

- **Business logic placement** (2026-07-15, requested by reviewer [[People/agissept]]): Moved `max(now, current)+1 month` date-math OUT of the VO and INTO the aggregate itself. Rationale: DDD doctrine that aggregates own business rules, VOs stay simple copy-like objects. Note: reverses original Phase 1 plan which documented the math in the VO "so it's independently unit-testable" — trade-off decided in favor of reviewer's DDD stance. Technique: when review comment is ambiguous, grep downstream code + re-check original design doc before committing to API changes. (confidence: high)

- **Dead code** (2026-07-15, flagged by [[People/agissept]]): `hasSuccessfullyPurchased()` is unused across all three branches — candidate for removal.

### Phase 6 (web-checkout) — Integration test pattern discovery

Two critical bugs fixed via pattern-matching against existing tests:

1. **Route-level filter bypass** (2026-07-15): IntegrationTest HTTP requests bypass 'auth' filters because test setup was missing `Route::enableFilters()`. Pattern found in `AsahReferralRegistrationIntegrationTest`. (confidence: high — verified in working test)

2. **Payment redirect silent fallback** (2026-07-15): Purchase→redirect flow makes two separate Xendit API calls (create invoice, then lookup). Test mocked only (1), missing (2) `mockExistingXenditPayment()`. Solution pattern in `NewPurchaseSubscriptionIntegrationTest`. (confidence: high — verified in working test)

**General lesson:** When integration test fails for unclear reasons, grep sibling feature's test and diff setup. Fix is usually "the working test does X that this one doesn't", not a deep bug.

### Open decisions

- **Event-listener vs. sync enrollment** (identified 2026-07-15, deferred to PR #5340): Current design uses event-listener (`MonthlyAddOnWasPurchased` → `MonthlyAddOnEventListener` → `PremiumFeature::enrollUser()`). Risk: purchase succeeds while enrollment silently fails (two separate, non-atomic steps). Reviewer [[People/agissept]] suggested sync-inline enrollment instead, but explicitly deferred final choice to implementer. Needs real decision based on enrollment-service uptime SLA and rollback feasibility. (confidence: medium — tradeoff is clear, choice depends on ops constraints)

### Cross-branch risk pattern

When a PRD is split into stacked phases (#5335 domain → #5340 usecases → #5344 settlement), and a later reviewer forces API redesign in base branch, downstream branches don't auto-signal — they'll silently break on rebase. GitHub doesn't surface this. **Always grep sibling/dependent branches after API changes in shared base, not just fix-forward the current branch.**

## Recent Activity

- 2026-07-15 - Architecture mapped, canonical example identified & verified. See [[Dev Logs/2026-07-15 - Dicoding Platform]].
- 2026-07-15 - Monthly Add-Ons Phase 1 review feedback resolved (API redesign), Phase 6 integration tests debugged. See [[Dev Logs/2026-07-15 - Monthly Add-Ons Phase 6]].
