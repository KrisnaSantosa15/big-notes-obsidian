---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, prp, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Plan: Add-Ons — Phase 2: UseCases Layer (Purchase Initiation)

## Summary

Add the `PurchaseMonthlyAddOnSpecification` use case that a web Action (Phase 6) calls to initiate an add-on purchase: validates the requested `add_on_type`, loads its price/duration from the Phase 3 config catalog, and creates an `InvoiceEntities::MONTHLY_ADD_ON` invoice via the existing invoice-creation path — mirroring `PurchaseSubscriptionSpecification`. This phase does **not** grant entitlement; entitlement is granted later when the invoice settles (Phase 5), same separation the platform already has for subscriptions (creating a subscription purchase invoice vs. `SubscriptionSettlementPlugin` activating it on payment).

## User Story

As a logged-in user, I want to initiate a purchase of an add-on (Sabak or Learning with AI), so that I receive a payable invoice I can complete through the existing payment flow.

## Problem → Solution

There's no use case today that creates an invoice for a standalone add-on product. → Add `PurchaseMonthlyAddOnSpecification` under `Dicoding/UseCases/MonthlyAddOns/Transactions/`, following the `UseCaseSpecification` contract used by every other purchase flow in the codebase.

## Metadata
- **Complexity**: Small
- **Source PRD**: `../../../docs/domains/daily-add-ons/prd.md` (Phase 2 of 6)
- **PRD Phase**: UseCases — Purchase initiation
- **Estimated Files**: 2 (1 use case, 1 integration test)

---

## UX Design

N/A — this phase has no UI; it's the orchestration layer a future Action (Phase 6) calls.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `Dicoding/UseCases/Subscriptions/Transactions/PurchaseSubscriptionSpecification.php` | 22-125 | The exact use case to mirror: `$dataValidationRules` static prop, constructor-injected repository + `PayloadFactoryInterface`, `runSpecification()` wrapped in try/catch dispatching to `payloadFactory->withSuccessfulDomainPayload` / `withInvariantExceptionPayload` / `withExceptionPayload`. |
| P0 | `Dicoding/UseCases/Subscriptions/Registrations/TrialRegistrationSpecification.php` | full | Simpler version of the same pattern — read this first if `PurchaseSubscriptionSpecification` feels dense. |
| P0 | `Dicoding/Domain/MonthlyAddOns/Aggregates/MonthlyAddOnPurchase.php` (Phase 1) | full | Read to understand the domain aggregate's structure — not directly called by this use case, but useful context on the bounded context's core logic. |
| P0 | `../../../docs/domains/daily-add-ons/prd.md` + `docs/guidelines/development/domain-layer.md` | "Repository interfaces" section | Confirms this codebase removed the repository-interface pattern; aggregates create/save through Infrastructure Gateways directly. `PurchaseMonthlyAddOnSpecification` will depend on the concrete `MonthlyAddOnGateway` (built in Phase 3), not an interface. |
| P0 | `Dicoding/Domain/MonthlyAddOns/Enums/MonthlyAddOnType.php` (Phase 1) | full | The enum this use case validates the incoming `add_on_type` string against. |
| P1 | `Dicoding/Domain/Common/Enums/Payments/InvoiceEntities.php` | 1-39 | Existing 10-case enum. Phase 5 adds the `MONTHLY_ADD_ON` case here — this phase must not reference `InvoiceEntities` directly (see Task 2 GOTCHA #2). |
| P1 | `app/config/premium_feature_configs.php` | 1-93 | Structure precedent for the Phase 3 `add_on_configs.php` catalog. |
| P2 | `app/tests/IntegrationTests/Specifications/Subscriptions/Registrations/RegisterToTrialSubscriptionIntegrationTest.php` | full | Integration test pattern: extends `IntegrationTest`, posts to a route, asserts DB row + event fired. |

## External Documentation

No external research needed.

---

## Patterns to Mirror

### USECASE_SPECIFICATION_PATTERN
// SOURCE: Dicoding/UseCases/Subscriptions/Registrations/TrialRegistrationSpecification.php
```php
class TrialRegistrationSpecification extends UseCaseSpecification
{
    protected static $dataValidationRules = [
        'registrant_id' => 'required'
    ];

    public function __construct(
        private TrialRegistrationRepositoryInterface $trialRegistrationRepository,
        private PayloadFactoryInterface $payloadFactory
    ) {
    }

    public function runSpecification(array $useCaseData = []): PayloadInterface
    {
        try {
            return $this->payloadFactory->withSuccessfulDomainPayload(
                $this->runRegistration($useCaseData),
                $useCaseData
            );
        } catch (InvariantException $exception) {
            return $this->payloadFactory->withInvariantExceptionPayload($exception, $useCaseData);
        } catch (Exception $exception) {
            return $this->payloadFactory->withExceptionPayload($exception, $useCaseData);
        }
    }

    private function runRegistration(array $useCaseData): TrialRegistration
    {
        $trialRegistration = $this->trialRegistrationRepository->createTrialRegistration(
            (int) $useCaseData['registrant_id']
        );
        $trialRegistration->registerAsTrial();
        $this->trialRegistrationRepository->saveRegistration($trialRegistration);
        return $trialRegistration;
    }
}
```

### TEST_STRUCTURE (integration, through HTTP)
// SOURCE: app/tests/IntegrationTests/Specifications/Subscriptions/Registrations/RegisterToTrialSubscriptionIntegrationTest.php
```php
class RegisterToTrialSubscriptionIntegrationTest extends IntegrationTest
{
    #[\Override]
    public function register(): void
    {
        $this->mockDicodingEventLogger();
        $this->be(DicodingUser::find(5));
        $this->post(route('subscriptions.trials', [...]));
        $this->assertSingleRecordExists('current_subscription_plans', [...]);
        $this->verifyEventLogged('Dicoding.Domain.Subscriptions.Events.MemberWasSubscribedToTrial');
    }
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `Dicoding/UseCases/MonthlyAddOns/Transactions/PurchaseMonthlyAddOnSpecification.php` | CREATE | Validates `subscriber_id` + `add_on_type`, creates an add-on invoice via the concrete `MonthlyAddOnGateway` class, returns `PayloadInterface`. |
| `app/tests/IntegrationTests/Specifications/MonthlyAddOns/PurchaseMonthlyAddOnSpecificationTest.php` | CREATE | Integration test exercising the use case end to end via a Prophecy double for `MonthlyAddOnGateway` (see Task 2 GOTCHA). |

## NOT Building

- Any entitlement-granting logic (Phase 5's `MonthlyAddOnSettlementPlugin`, triggered when the invoice this use case creates gets paid).
- The concrete `MonthlyAddOnGateway` implementation (Phase 3/5) — this phase only consumes it through a Prophecy double in tests.
- Web Action/route (Phase 6).
- The config catalog file itself (Phase 3) — this phase's tests must not depend on that file existing.

---

## Step-by-Step Tasks

### Task 1: PurchaseMonthlyAddOnSpecification
- **ACTION**: Create `Dicoding/UseCases/MonthlyAddOns/Transactions/PurchaseMonthlyAddOnSpecification.php`.
- **IMPLEMENT**:
  ```php
  <?php

  namespace Dicoding\UseCases\MonthlyAddOns\Transactions;

  use Dicoding\Domain\MonthlyAddOns\Enums\MonthlyAddOnType;
  use Dicoding\Infrastructure\StorageGateways\MonthlyAddOns\MonthlyAddOnGateway;
  use Dicoding\Domain\Payloads\PayloadFactoryInterface;
  use Dicoding\Exception\InvariantException;
  use Dicoding\UseCases\UseCaseSpecification;
  use Aura\Payload_Interface\PayloadInterface;
  use Exception;

  class PurchaseMonthlyAddOnSpecification extends UseCaseSpecification
  {
      protected static $dataValidationRules = [
          'subscriber_id' => 'required|integer',
          'add_on_type'    => 'required|string|in:sabak,student-chatbot',
      ];

      public function __construct(
          private readonly MonthlyAddOnGateway $addOnGateway,
          private readonly PayloadFactoryInterface $payloadFactory,
      ) {
      }

      public function runSpecification(array $useCaseData = []): PayloadInterface
      {
          try {
              $invoice = $this->addOnGateway->createMonthlyAddOnInvoice(
                  (int) $useCaseData['subscriber_id'],
                  MonthlyAddOnType::from($useCaseData['add_on_type']),
              );

              return $this->payloadFactory->withSuccessfulDomainPayload($invoice, $useCaseData);
          } catch (InvariantException $exception) {
              return $this->payloadFactory->withInvariantExceptionPayload($exception, $useCaseData);
          } catch (Exception $exception) {
              return $this->payloadFactory->withExceptionPayload($exception, $useCaseData);
          }
      }
  }
  ```
- **MIRROR**: USECASE_SPECIFICATION_PATTERN above.
- **IMPORTS**: as listed. Note: `MonthlyAddOnGateway` is imported directly from Infrastructure, replacing the now-removed interface pattern per `docs/guidelines/development/domain-layer.md`.
- **ENUM VALUES**: The `in:` rule lists the actual `MonthlyAddOnType` enum cases: `sabak` and `student-chatbot` (not "learning-with-ai" — that's the UI label in `app/config/add_on_configs.php`).
- **GOTCHA #1**: The `in:sabak,student-chatbot` validation rule runs **before** `runSpecification()`'s body (base `UseCaseSpecification` validates `$dataValidationRules` first — confirm this ordering against `UseCaseSpecification`'s base implementation before assuming it). This means `MonthlyAddOnType::from()` inside `runSpecification()` will only ever receive an already-valid string, so its native `\ValueError` (which extends `Error`, not `Exception` — **not** caught by either `catch` block here) never actually triggers in practice. Keep the declarative `in:` rule as the real guard; do not rely on catching `MonthlyAddOnType::from()` failures.
- **GOTCHA #2**: `InvoiceEntities::MONTHLY_ADD_ON` does not exist until Phase 5. This use case never references `InvoiceEntities` directly — that enum case is only consumed inside the (not-yet-written) concrete `MonthlyAddOnGateway` implementation. Do not add a premature `InvoiceEntities::MONTHLY_ADD_ON` reference here.
- **VALIDATE**: `deck ai:test --filter='PurchaseMonthlyAddOnSpecificationTest' --testsuite=integration`

### Task 2: Integration test
- **ACTION**: Create `app/tests/IntegrationTests/Specifications/MonthlyAddOns/PurchaseMonthlyAddOnSpecificationTest.php`.
- **IMPLEMENT**: Use `ExecuteSpecification::execute(PurchaseMonthlyAddOnSpecification::class, [...])` (grep an existing spec test using this helper, e.g. `LogFeatureDailyUsageStatSpecificationTest`, for the exact call signature) with a Prophecy double bound in the container for `MonthlyAddOnGateway`, since no concrete implementation exists until Phase 3.
- **MIRROR**: TEST_STRUCTURE above, adapted to spec-level (not HTTP-level, since there's no route until Phase 6).
- **GOTCHA**: Because `MonthlyAddOnGateway` has no bound implementation yet, bind a Prophecy double explicitly via the container (grep `IntegrationTest.php` for `App::instance` precedent) rather than relying on auto-wiring, which will fail with an unresolvable-binding error. The double should mock the `createMonthlyAddOnInvoice(int $subscriberId, MonthlyAddOnType $type)` method.
- **VALIDATE**: `deck ai:test --filter='PurchaseMonthlyAddOnSpecificationTest' --testsuite=integration`

---

## Testing Strategy

This phase's only class with branching logic (`PurchaseMonthlyAddOnSpecification`) is covered at the integration level, matching how `PurchaseSubscriptionSpecification` itself is tested (orchestration classes with no independent invariants are tested through the spec runner, not as isolated units).

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Valid purchase request | `subscriber_id: 5, add_on_type: 'sabak'` | `PayloadStatus::SUCCESS`, gateway's `createMonthlyAddOnInvoice` called once with `MonthlyAddOnType::SABAK` | No |
| Invalid add_on_type string | `add_on_type: 'not-a-real-addon'` | Validation-failure payload, gateway never called | Yes — Task 1 GOTCHA #1 |
| Missing subscriber_id | `{}` | Validation failure payload before gateway is touched | Yes |

### Edge Cases Checklist
- [x] Invalid enum-like string input
- [x] Missing required field
- [ ] Maximum size input — N/A, fixed small payload
- [ ] Concurrent access — deferred to Phase 3/5 (DB transaction concern)
- [ ] Network failure — deferred to Phase 5 (payment gateway concern)
- [ ] Permission denied — deferred to Phase 6 (auth guard on the route)

---

## Validation Commands

### Static Analysis
```bash
deck php vendor/bin/psalm.phar Dicoding/UseCases/MonthlyAddOns
```
EXPECT: Zero type errors

### Unit Tests
```bash
deck ai:test --filter='PurchaseMonthlyAddOnSpecificationTest' --testsuite=integration
```
EXPECT: All tests pass

### Full Test Suite
Not required — new code only, no existing call site touched yet.

### Database Validation
N/A — invoice persistence is Phase 3/5's concern; this phase only calls the interface.

### Browser Validation
N/A — no UI in this phase.

### Manual Validation
- [ ] Confirm `PurchaseMonthlyAddOnSpecification` never imports anything from `Dicoding\Domain\Payment\*` directly — it only depends on the concrete `MonthlyAddOnGateway` class, keeping the use-case layer decoupled from the concrete settlement mechanism Phase 5 will build.

---

## Acceptance Criteria
- [ ] All 2 tasks completed
- [ ] `deck php vendor/bin/psalm.phar Dicoding/UseCases/MonthlyAddOns` clean
- [ ] `deck ai:test --filter='PurchaseMonthlyAddOnSpecificationTest' --testsuite=integration` green
- [ ] No lint errors

## Completion Checklist
- [ ] Code follows `UseCaseSpecification` pattern exactly
- [ ] Error handling matches codebase style (`InvariantException` vs generic `Exception` split)
- [ ] Tests follow `IntegrationTest` + `ExecuteSpecification` pattern with concrete gateway mock
- [ ] No hardcoded add-on prices/durations in this layer (belongs in Phase 3's config catalog)
- [ ] No repository interfaces created — `MonthlyAddOnGateway` dependency is concrete (per updated `domain-layer.md`)
- [ ] No unnecessary scope additions (no entitlement logic, no route, no settlement)
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Validation-ordering assumption (declarative rule runs before `runSpecification()` body) turns out wrong for this base class | Low | Low | Flagged explicitly in Task 1 GOTCHA #1 — implementer should confirm against `UseCaseSpecification`'s base class before relying on it. |
| `MonthlyAddOnGateway` method signature doesn't match what Phase 3 actually builds | Low | Low | Phase 3's task plan will define the concrete gateway's API — this phase's test doubles the method `createMonthlyAddOnInvoice(int $subscriberId, MonthlyAddOnType $type)` which can be adjusted if needed. |

## Notes
This phase deliberately stops at "invoice created," matching the platform-wide separation between *initiating* a purchase and *settling* it (Phase 5). Resist granting entitlement directly here — that would duplicate `MonthlyAddOnSettlementPlugin` and break the single-settlement-path invariant every other purchasable entity relies on.

Repository interfaces have been removed from this codebase per the updated `domain-layer.md`; this phase depends directly on the concrete `MonthlyAddOnGateway` class (built in Phase 3). The gateway's interface is defined here through the test doubles and the actual implementation is Phase 3's responsibility.

> Next step: Run `/prp-implement .claude/PRPs/plans/add-ons-02-usecases.plan.md`, then proceed to `add-ons-03-infrastructure.plan.md`.
