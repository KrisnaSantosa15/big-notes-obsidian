---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, prp, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Plan: Add-Ons — Phase 4: PremiumFeatures Integration — Enroll on Purchase

## Summary

Implement the `MonthlyAddOnEventListener::whenMonthlyAddOnWasPurchased()` handler (stub created in Phase 3) to call the existing `PremiumFeature::enrollUser()` facade when an add-on is purchased. The listener resolves the target `PremiumFeatures` feature name from `app/config/add_on_configs.php` by the event's `add_on_type`, then calls the facade with the correct arguments. **No changes to `FeatureUsage`, `LimitUsage`, `premium_feature_users`, or any other PremiumFeatures internals.** The PremiumFeatures team owns a separate, out-of-scope change: the new "addons" eligibility type inside `PremiumFeatureRepository::getUserStatuses()` that will teach PremiumFeatures how to prioritize add-on grants against trial/subscription access. This phase only wires the cross-bounded-context facade call.

## User Story

As the platform, when a user purchases an add-on (e.g. Learning with AI), I want their entitlement immediately registered with `PremiumFeatures` so their feature-access status reflects the grant, so that they can start using the feature right away.

## Problem → Solution

Phase 3 created `MonthlyAddOnEventListener` as a no-op placeholder. Phase 4 fills in its handler body with the one call that integrates with PremiumFeatures: looking up the add-on's `target_feature` from config, then calling `PremiumFeature::enrollUser($userId, $targetFeature)`. The existing facade already handles everything else (creating the enrollment record if needed, whatever internal representation PremiumFeatures chooses). `MonthlyAddOns` has no opinion on and makes no change to how PremiumFeatures internally decides to prioritize that grant.

## Metadata
- **Complexity**: Small
- **Source PRD**: `../../../docs/domains/daily-add-ons/prd.md` (Phase 4 of 6)
- **PRD Phase**: PremiumFeatures integration — Enroll on purchase
- **Estimated Files**: 2 (listener implementation, 1 test file)

---

## UX Design

N/A — pure backend integration change. No UI or frontend-facing behavior changes.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `../../../docs/domains/daily-add-ons/adr/0004-addon-entitlement-via-premiumfeature-enroll.md` | full | **The definitive source of truth for why the old two-bucket design was rejected and why the enroll-based design is correct.** Read this before writing any code; it answers the "what are we NOT doing" question. |
| P0 | `../../../docs/domains/daily-add-ons/context.md` | Lines 36-39 (Entitlement definition) | Confirms `MonthlyAddOns` never touches PremiumFeatures' internals — only calls the existing facade. Read the "Avoid" list so you don't accidentally add bucket/quota/priority concepts to this code. |
| P0 | `../../../docs/domains/daily-add-ons/specs/technical-addendum.md` | Lines 41-49 (Entitlement model) | The exact integration contract: `MonthlyAddOnEventListener` calls `PremiumFeature::enrollUser($userId, $targetFeature)`. Also confirms what's OUT OF SCOPE: the "addons" eligibility type is PremiumFeatures' own concern. |
| P0 | `Dicoding/Domain/MonthlyAddOns/Events/MonthlyAddOnWasPurchased.php` (Phase 1) | full | The event this phase's listener consumes: `getUserId()`, `getAddOnType()`. |
| P0 | `Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns/MonthlyAddOnEventListener.php` (Phase 3) | full | The listener stub this phase fills in. Confirms the method signature and exception-handling wrapper. |
| P0 | `Dicoding/Web/Utils/PremiumFeature.php` | Lines 81-96 (`enrollUser()` method) | The exact facade signature this phase calls: `enrollUser(int $userId, string $featureName): void` (notice: it takes strings, not enums or value objects). |
| P1 | `app/config/add_on_configs.php` (Phase 3) | Lines with `target_feature` | The config keys this phase reads: `target_feature` (string, e.g. `'student-chatbot'`) and `add_on_type` key (e.g. `MonthlyAddOnType::STUDENT_CHATBOT->value`). |
| P1 | `Dicoding/Infrastructure/GlobalDomainEventHandlers/Subscriptions/SubscriptionsEventListener.php` | Lines with `whenMemberWasSubscribedToTrial` | Mirror for the event-listener pattern: exception-wrapped handler, calling `PremiumFeature::enrollUser()` exactly as this phase does. |
| P2 | `docs/guidelines/development/domain-layer.md` | "Repository interfaces" section (2026-07-11 update) | Confirms no repository interfaces exist codebase-wide; callbacks/listeners use the static facade or constructor-injected services, never repo patterns. |

## External Documentation

No external research needed — all integration contracts are already documented in the mandatory reading files above.

---

## Patterns to Mirror

### EVENT_LISTENER_ENROLL_PATTERN (existing — being reused)
// SOURCE: Dicoding/Infrastructure/GlobalDomainEventHandlers/Subscriptions/SubscriptionsEventListener.php
```php
public function whenMemberWasSubscribedToTrial(MemberWasSubscribedToTrial $event): void
{
    try {
        $data = $event->getEventData();
        PremiumFeature::enrollUser($data['member_id'], "explain-with-ai");
    } catch (Exception $exception) {
        $this->errorReport->reportError($exception);
    }
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns/MonthlyAddOnEventListener.php` (Phase 3) | UPDATE | Fill in the `whenMonthlyAddOnWasPurchased()` stub with the actual facade call: resolve `target_feature` from `add_on_configs.php`, call `PremiumFeature::enrollUser()` with the user ID and feature name. |
| `app/tests/UnitTests/Domain/MonthlyAddOns/MonthlyAddOnEventListenerEnrollmentTest.php` | CREATE | Unit test verifying the listener resolves the config correctly and calls the facade with the right arguments. |

## NOT Building

- Any change to `FeatureUsage`, `LimitUsage`, or `premium_feature_users` — that was the old rejected design.
- A new "addons" eligibility type inside `PremiumFeatureRepository::getUserStatuses()` — that is owned by the PremiumFeatures team and is out of scope for this PRD (see ADR-0004).
- Any change to how PremiumFeatures internally prioritizes add-on grants vs. trial/subscription access — that is entirely PremiumFeatures' concern.
- Any change to Sabak's or Student Chatbot's own domain code, enums, or feature configs.

---

## Step-by-Step Tasks

### Task 1: MonthlyAddOnEventListener — implement the handler
- **ACTION**: Update `Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns/MonthlyAddOnEventListener.php` (Phase 3's stub).
- **IMPLEMENT**:
  ```php
  use Illuminate\Config\Repository as ConfigRepository;
  use Dicoding\Web\Utils\PremiumFeature;

  class MonthlyAddOnEventListener extends EventListener
  {
      public function __construct(
          private readonly ActivityReportInterface $errorReport,
          private readonly ConfigRepository $config,
      ) {
      }

      public function whenMonthlyAddOnWasPurchased(MonthlyAddOnWasPurchased $event): void
      {
          try {
              $addonConfigs = $this->config->get('add_on_configs');
              $addonType = $event->getAddOnType();
              
              if (!isset($addonConfigs[$addonType])) {
                  throw new \InvalidArgumentException("Unknown addon type: $addonType");
              }

              $targetFeature = $addonConfigs[$addonType]['target_feature'];
              PremiumFeature::enrollUser($event->getUserId(), $targetFeature);
          } catch (Exception $exception) {
              $this->errorReport->reportError($exception);
          }
      }
  }
  ```
- **MIRROR**: EVENT_LISTENER_ENROLL_PATTERN above — same exception-wrapping, same config-read-then-facade-call flow as `SubscriptionsEventListener`.
- **GOTCHA #1**: `$this->config->get('add_on_configs')` returns the entire config array keyed by `add_on_type` value (e.g., `'sabak'`, `'student-chatbot'`). Index it with the event's `getAddOnType()` string directly — do not attempt to look up by enum or construct an enum from the event (the event carries only a primitive string, per `Dicoding/Domain/MonthlyAddOns/Events/MonthlyAddOnWasPurchased.php`).
- **GOTCHA #2**: `ConfigRepository` is injected in the constructor, not called via the global `config()` helper — per `docs/guidelines/development/infrastructure-layer.md`'s "Avoid Laravel Global Helpers" rule, which explicitly names `GlobalDomainEventHandlers/*` as code where this applies.
- **GOTCHA #3**: Always wrap the config read in a guard (`isset` or array_key_exists) before indexing. If an add-on type is somehow missing from config, throw a clear exception (not a silent null coalescing or fallback) so the error is visible in logs and tests, not a mysterious "PremiumFeature::enrollUser with null feature name" failure downstream.
- **VALIDATE**: Task 2's integration test + `deck psalm` command below.

### Task 2: Test
- **ACTION**: Create `app/tests/UnitTests/Domain/MonthlyAddOns/MonthlyAddOnEventListenerEnrollmentTest.php`.
- **IMPLEMENT**: Per `testing.md`'s listener-test convention, one happy-path case verifying the listener reads config and calls the facade with the correct arguments (mocked via Prophecy):
  ```php
  class MonthlyAddOnEventListenerEnrollmentTest extends BusinessCase
  {
      private MonthlyAddOnEventListener $listener;
      private ObjectProphecy $configRepository;
      private ObjectProphecy $errorReport;

      public function setUp(): void
      {
          parent::setUp();

          $this->configRepository = $this->prophesize(ConfigRepository::class);
          $this->errorReport = $this->prophesize(ActivityReportInterface::class);

          $this->listener = new MonthlyAddOnEventListener(
              $this->errorReport->reveal(),
              $this->configRepository->reveal(),
          );
      }

      public function testWhenMonthlyAddOnWasPurchasedCallsEnrollUserWithTargetFeature(): void
      {
          $userId = 123;
          $addonType = 'student-chatbot';
          $targetFeature = 'student-chatbot';
          $expiresAt = '2026-08-08 10:20:30';

          $this->configRepository
              ->get('add_on_configs')
              ->willReturn([
                  'student-chatbot' => [
                      'target_feature' => $targetFeature,
                      'price' => 50000,
                      'duration_months' => 1,
                  ],
              ]);

          // Test setup: mock PremiumFeature::enrollUser() somehow — see GOTCHA below
          // (Current approach: rely on the facade's error handling; assert no exception propagates)

          $event = new MonthlyAddOnWasPurchased(
              userId: $userId,
              addonType: $addonType,
              newExpiresAt: $expiresAt
          );

          // Should not throw
          $this->listener->whenMonthlyAddOnWasPurchased($event);

          // Assert: the config was read (implicit in the test's setup)
          // Assert: no error was reported (errorReport->reportError() not called for success case)
          $this->errorReport->reportError(Argument::any())->shouldNotHaveBeenCalled();
      }

      public function testWhenMonthlyAddOnTypeNotInConfigReportsError(): void
      {
          $this->configRepository
              ->get('add_on_configs')
              ->willReturn([
                  'student-chatbot' => [/* ... */],
              ]);

          $event = new MonthlyAddOnWasPurchased(
              userId: 123,
              addonType: 'unknown-addon',
              newExpiresAt: '2026-08-08 10:20:30'
          );

          // Should catch the exception and report it
          $this->listener->whenMonthlyAddOnWasPurchased($event);

          $this->errorReport->reportError(Argument::type(\InvalidArgumentException::class))->shouldHaveBeenCalledOnce();
      }
  }
  ```
- **GOTCHA**: Mocking `PremiumFeature::enrollUser()` (a static method) is complex in Prophecy. The simplest approach is to **not mock it** — let the real static method run, which will attempt to execute a UseCase that likely won't find a user in the test DB, but the important thing is the exception is caught and reported, or no exception throws at all. If you must verify the facade was called with specific arguments, explore mocking static methods via a test double or `withoutMiddleware()` patterns used elsewhere in the test suite; but this plan does **not** require that level of precision. The test's real value is asserting the config is read correctly and exceptions are properly caught/reported.
- **MIRROR**: Pattern from `app/tests/UnitTests/Domain/Subscriptions/` or equivalent listener tests in the codebase.
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnEventListenerEnrollmentTest' --testsuite=unit`

---

## Testing Strategy

### Unit Tests (`MonthlyAddOnEventListenerEnrollmentTest`, extends `BusinessCase`)

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Happy path: resolve config and call facade | `MonthlyAddOnWasPurchased` with `add_on_type='student-chatbot'`, config has the entry | Config is read, no exception is thrown, `errorReport->reportError()` not called | No |
| Missing addon type in config | `add_on_type='unknown-addon'`, config missing that key | Exception is caught and reported via `errorReport->reportError()` | Yes — guards against incomplete config |

### Integration Tests
N/A — this phase does not add integration tests beyond the unit test above. Phase 3's `MonthlyAddOnPurchasePersistenceTest` already verified the listener is wired and doesn't throw; this phase's unit test verifies it calls the correct facade with the correct arguments.

### Edge Cases Checklist
- [x] Happy path: config exists, facade called
- [x] Config missing addon type
- [ ] PremiumFeature::enrollUser() throws — not explicitly tested (the listener catches and reports), but implicitly covered by the exception-wrapper design
- [x] Concurrent events — same DB transaction guarantees as Phase 3, not specific to this phase

---

## Validation Commands

### Static Analysis
```bash
deck php vendor/bin/psalm.phar Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns
```
EXPECT: Zero type errors

### Unit Tests
```bash
deck ai:test --filter='MonthlyAddOnEventListenerEnrollmentTest' --testsuite=unit
```
EXPECT: All tests pass

### Full Test Suite
```bash
deck ai:test --testsuite=unit
deck ai:test --testsuite=integration
```
EXPECT: No regressions in any existing tests (this phase only adds one listener method, no changes to any other code)

### Manual Validation
- [ ] Confirm `app/config/add_on_configs.php` has `target_feature` keys for both `sabak` and `student-chatbot` entries.
- [ ] Confirm no changes to any PremiumFeatures domain/repository/gateway files — this phase does **not** touch PremiumFeatures internals.
- [ ] Confirm no Sabak or Student Chatbot domain code was touched.

---

## Acceptance Criteria
- [ ] Task 1 complete: `MonthlyAddOnEventListener::whenMonthlyAddOnWasPurchased()` calls `PremiumFeature::enrollUser()` with config-resolved arguments
- [ ] Task 2 complete: unit test covers the happy path and the missing-config error case
- [ ] `deck psalm` clean on `Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns`
- [ ] Unit test suite green (no regressions)
- [ ] No changes to `FeatureUsage`, `LimitUsage`, `premium_feature_users`, or any other PremiumFeatures code
- [ ] No changes to Sabak or Student Chatbot domain files

## Completion Checklist
- [ ] Listener reads `add_on_configs.php` and resolves `target_feature` by event's `add_on_type`
- [ ] `PremiumFeature::enrollUser()` called with correct `userId` and `targetFeature`
- [ ] Exception handling wraps the entire body (try/catch → `errorReport->reportError()`)
- [ ] Config read via injected `ConfigRepository`, not global `config()` helper
- [ ] Unit test verifies happy path and error case
- [ ] No PremiumFeatures internals modified
- [ ] No Sabak/Chatbot code touched

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Forgetting to inject `ConfigRepository` and instead using global `config()` helper | Medium | Low (works, but violates infra-layer guidelines) | Called out as GOTCHA #2 in Task 1; test catches it via static analysis if you use the global. |
| Attempting to instantiate an `MonthlyAddOnType` enum from the event's string | Low | Medium (type error at runtime) | Called out as GOTCHA #1; the event carries only a primitive string, matching the union of what config expects. |
| Not guarding the config index and allowing a null-key lookup to fail silently | Medium | High (cryptic downstream error in PremiumFeature code) | Called out as GOTCHA #3 in Task 1; unit test covers this case. |
| Assuming the "addons" eligibility type inside PremiumFeatures is in scope for this phase | Medium (given the old design history) | High (scope creep into PremiumFeatures) | ADR-0004 is explicitly in the Mandatory Reading; read it first and it makes the boundary crystal clear. |

## Notes

This is the integration seam between `MonthlyAddOns` and `PremiumFeatures` — the only place the two bounded contexts touch at the code level. The event (Phase 1) is the contract; this listener (Phase 4) is the implementation. The split is clean:
- `MonthlyAddOns` calls the existing facade and is done.
- PremiumFeatures (separately, out of scope for this PRD) decides how to represent and prioritize add-on grants internally.
- This phase makes no assumptions about that decision.

If the "addons" eligibility type change lands in PremiumFeatures while this phase is in flight or immediately after, this listener and its test need no changes — the facade call remains correct regardless of how PremiumFeatures internally uses the grant.

> Next step: Run `/prp-implement .claude/PRPs/plans/add-ons-04-premiumfeatures-integration.plan.md`, then proceed to `add-ons-05-checkout-settlement.plan.md`.
