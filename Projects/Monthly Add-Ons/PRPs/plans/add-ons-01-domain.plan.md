---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, prp, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Plan: Add-Ons — Phase 1: Domain Layer

## Summary

Create the pure domain core of the new `MonthlyAddOns` bounded context: an `MonthlyAddOnType` enum, an `MonthlyAddOnPurchase` aggregate that encodes the repurchase-expiry math (`new_expiry = max(now, current_expiry) + 1 month`), an `MonthlyAddOnWasPurchased` domain event. Zero framework/DB dependencies — this phase is unit-testable in complete isolation and has no runtime effect until later phases wire it up.

## User Story

As the platform, I want a pure domain model for add-on entitlements (independent of any subscription), so that later phases (use cases, infrastructure, settlement, web) have a single, framework-free source of truth for "what does purchasing/repurchasing an add-on do to a user's expiry."

## Problem → Solution

Today there is no domain concept of a standalone, subscription-independent purchasable entitlement — `PremiumFeatures` only knows `TRIAL`/`INTERNAL`/`SUBSCRIPTION` modes tied to `SubscriptionType`. → Introduce `Dicoding/Domain/MonthlyAddOns/` as a new bounded context, mirroring `Dicoding/Domain/Subscriptions/`'s aggregate/event/value-object conventions exactly, so it's indistinguishable in style from existing domain code.

## Metadata
- **Complexity**: Small
- **Source PRD**: `../../../docs/domains/daily-add-ons/prd.md` (Phase 1 of 6)
- **PRD Phase**: Domain — MonthlyAddOns bounded context core
- **Estimated Files**: 5 (1 enum, 1 VO, 1 aggregate, 1 event, 1 unit test — see Files to Change)

---

## UX Design

N/A — pure backend domain change, no UX surface.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `../../../docs/domains/daily-add-ons/context.md` | full | The bounded context's code-level glossary, per `docs/guidelines/development/domain-layer.md`'s Ubiquitous Language rule — every identifier this plan introduces (`MonthlyAddOnPurchase`, `MonthlyAddOnExpiry`, `entitlement`, `target feature`) is pinned there. If a task below needs a name not covered by this glossary, stop and extend it rather than inventing one inline. |
| P0 | `Dicoding/Domain/Subscriptions/Registrations/Aggregates/TrialRegistration.php` | 1-87 | The aggregate pattern to mirror exactly: extends `Aggregate`, constructor takes value objects, public method validates then raises an event, has a `hasSuccessfullyRegisteredToTrial()`-style query method backed by `containsDomainEvent()`. |
| P0 | `Dicoding/Domain/Common/Aggregate.php` | 7-28 | Base class every new aggregate must extend. Provides `EventRaisableObject` (raise/containsDomainEvent) + `Validatorable`. |
| P0 | `Dicoding/Domain/Common/ValueObject.php` | 1-10 | Base class for any new value object. Single abstract method `toArray(): array`. |
| P0 | `Dicoding/Support/Traits/Validatorable.php` | 1-48 | `validateData()` — throws `InvariantException` on failed validation. Used by both `Aggregate` and `ValueObject`. |
| P0 | `Dicoding/Domain/Subscriptions/Events/MemberWasSubscribedToTrial.php` | full | Event pattern to mirror: extends `ApplicationEvent`, constructor stores **only primitives** into `$this->eventData`. |
| P1 | `Dicoding/Support/Contract/ApplicationEvent.php` | full | Base class every domain event extends. |
| P1 | `Dicoding/Domain/PremiumFeatures/Enums/FeatureMode.php` | full | Current house style for enums: **native PHP 8.1+ backed `enum`**, not the older `MyCLabs\Enum\Enum` style — use this style for `MonthlyAddOnType`, not the `InvoiceEntities`-style class enum (that one predates this convention). |
| P1 | `docs/guidelines/development/domain-layer.md` | 25-35 | Repository interface pattern is REMOVED codebase-wide — this bounded context has no repository interface layer. |
| P2 | `app/tests/UnitTests/Domain/PremiumFeatures/FeatureConsumptionTest.php` | 18-200 | Test style to mirror for the aggregate unit test: extends `BusinessCase`, uses `assertObjectRaisedDomainEvent()` / `assertDomainEventContains()`. |

## External Documentation

No external research needed — feature uses established internal DDD patterns already present in this codebase (mirrors `Subscriptions`).

---

## Patterns to Mirror

### AGGREGATE_PATTERN
// SOURCE: Dicoding/Domain/Subscriptions/Registrations/Aggregates/TrialRegistration.php:13-87
```php
class TrialRegistration extends Aggregate
{
    private CommonActor $registrant;
    private MemberSubscriptionInformation $memberSubscriptionInformation;

    public function __construct(
        CommonActor $registrant,
        MemberSubscriptionInformation $memberSubscriptionInformation
    ) {
        $this->registrant = $registrant;
        $this->memberSubscriptionInformation = $memberSubscriptionInformation;
    }

    public function registerAsTrial(): void
    {
        $this->validateRegistration();
        $this->register();
    }

    private function register(): void
    {
        $this->raise(new MemberWasSubscribedToTrial(
            $this->registrant->getId(),
            15
        ));
    }

    public function hasSuccessfullyRegisteredToTrial(): bool
    {
        return $this->containsDomainEvent(MemberWasSubscribedToTrial::class);
    }
}
```

### VALUE_OBJECT_PATTERN
// SOURCE: Dicoding/Domain/Common/ValueObject.php:1-10, Dicoding/Domain/Subscriptions/Referrals/ValueObjects/BankAccount.php
```php
abstract class ValueObject
{
    use \Dicoding\Support\Traits\Validatorable;
    abstract public function toArray(): array;
}

// concrete example:
class BankAccount extends ValueObject
{
    protected static array $rules = [
        'bank_name' => 'required|string',
    ];
    private array $data;

    public function __construct(array $data)
    {
        $this->validateData($data, static::$rules);
        $this->data = $data;
    }

    public function toArray(): array { return $this->data; }
}
```

### EVENT_PATTERN (primitives only in eventData)
// SOURCE: Dicoding/Domain/Subscriptions/Events/MemberWasSubscribedToTrial.php
```php
class MemberWasSubscribedToTrial extends ApplicationEvent
{
    public function __construct(int $memberId, int $trialActiveDays)
    {
        $this->eventData = [
            'member_id'         => $memberId,
            'trial_active_days' => $trialActiveDays,
        ];
    }
}
```

### ENUM_PATTERN (current house style — native backed enum)
// SOURCE: Dicoding/Domain/PremiumFeatures/Enums/FeatureMode.php
```php
enum FeatureMode: string
{
    use EnumTraits;

    case DISABLED = "disabled";
    case INTERNAL = "internal";
    case TRIAL = "trial";
    case SUBSCRIPTION = "subscription";
}
```

### TEST_STRUCTURE
// SOURCE: app/tests/UnitTests/Domain/PremiumFeatures/FeatureConsumptionTest.php:18-65 (extends BusinessCase)
```php
class FeatureConsumptionTest extends BusinessCase
{
    /** @test */
    public function it_raises_event_on_consume(): void
    {
        $aggregate = ...; // build via constructor / helper
        $aggregate->consume();

        $this->assertObjectRaisedDomainEvent($aggregate, FeatureWasConsumed::class);
        $this->assertDomainEventContains($aggregate, FeatureWasConsumed::class, [
            'expected_key' => 'expected_value',
        ]);
    }
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `Dicoding/Domain/MonthlyAddOns/Enums/MonthlyAddOnType.php` | CREATE | Backed enum identifying which add-on product (`SABAK`, `STUDENT_CHATBOT`) — native enum style per `FeatureMode` precedent. |
| `Dicoding/Domain/MonthlyAddOns/ValueObjects/MonthlyAddOnExpiry.php` | CREATE | Immutable VO wrapping the expiry `DateTimeImmutable`, with the `extend()` method implementing `max(now, current) + 1 month`. Keeps the date-math out of the aggregate so it's independently unit-testable. |
| `Dicoding/Domain/MonthlyAddOns/Events/MonthlyAddOnWasPurchased.php` | CREATE | Event raised when an add-on purchase/repurchase completes. Primitives only: `user_id` (int), `add_on_type` (string), `new_expires_at` (string, ISO-8601). This is the contract Phase 3's event listener and Phase 4's `PremiumFeatures` core react to — **do not change its shape without updating those phases.** |
| `Dicoding/Domain/MonthlyAddOns/Aggregates/MonthlyAddOnPurchase.php` | CREATE | Aggregate root. Constructor takes `UserId`, `MonthlyAddOnType`, current `MonthlyAddOnExpiry` (nullable — null means never purchased). Method `purchase(): void` computes the new expiry via `MonthlyAddOnExpiry::extend()` and raises `MonthlyAddOnWasPurchased`. |
| `app/tests/UnitTests/Domain/MonthlyAddOns/MonthlyAddOnPurchaseTest.php` | CREATE | Unit tests for the aggregate (extends `BusinessCase`) — see Testing Strategy. |

## NOT Building

- Any Infrastructure implementation or Gateway for `MonthlyAddOnPurchase` (Phase 3).
- Any UseCase/Specification (Phase 2).
- Any change to `PremiumFeatures` (Phase 4).
- Any change to `InvoiceEntities`, settlement, or cancellation plugins (Phase 5).
- Any web/UI code (Phase 6).
- A `getExpiry()`/query method beyond what `MonthlyAddOnPurchaseTest` needs to assert the raised event's payload — don't build a full read-model here; Phase 3/4 read state from the DB, not by re-hydrating and querying this aggregate.

---

## Step-by-Step Tasks

**Implementation order (red-green-refactor):** Tasks below are listed by artifact, in dependency order, for reference — but `docs/guidelines/development/domain-layer.md`'s Design Order and `testing.md`'s DDD ordering both specify designing/testing **top-down from the aggregate**, not building supporting pieces first. Follow this sequence instead of the task numbering when implementing:
1. Sketch `MonthlyAddOnPurchase`'s constructor/action-method signature (Task 4) — this determines what `MonthlyAddOnType`, `MonthlyAddOnExpiry`, and `MonthlyAddOnWasPurchased` need to look like; don't finalize their internals yet.
2. Write `MonthlyAddOnPurchaseTest` (Task 5) against that sketch — it will not compile/pass yet. That's the "red" state.
3. Implement `MonthlyAddOnType` (Task 1), `MonthlyAddOnExpiry` (Task 2), `MonthlyAddOnWasPurchased` (Task 3) — the minimum needed to make the aggregate compile.
4. Implement `MonthlyAddOnPurchase` (Task 4) to make the test suite pass — "green."

### Task 1: MonthlyAddOnType enum
- **ACTION**: Create `Dicoding/Domain/MonthlyAddOns/Enums/MonthlyAddOnType.php`.
- **IMPLEMENT**:
  ```php
  <?php

  namespace Dicoding\Domain\MonthlyAddOns\Enums;

  use Dicoding\Utils\EnumTraits;

  enum MonthlyAddOnType: string
  {
      use EnumTraits;

      case SABAK = 'sabak';
      case STUDENT_CHATBOT = 'student-chatbot';
  }
  ```
- **MIRROR**: ENUM_PATTERN above (`FeatureMode`).
- **IMPORTS**: `Dicoding\Utils\EnumTraits`.
- **GOTCHA**: The `STUDENT_CHATBOT` value is `'student-chatbot'`, matching the target feature name in `PremiumFeatures` exactly (per `../../../docs/domains/daily-add-ons/context.md`, line 19). There is no separate "Learning with AI" enum case — that is a product/UI name only; the code-level identifier is `student-chatbot`. Similarly, there is no `SABAK_TRIAL` case — Sabak's trial is handled entirely by `PremiumFeatures`' `FeatureMode::TRIAL`, not by this enum.
- **VALIDATE**: `deck php vendor/bin/psalm.phar Dicoding/Domain/MonthlyAddOns/Enums/MonthlyAddOnType.php`

### Task 2: MonthlyAddOnExpiry value object
- **ACTION**: Create `Dicoding/Domain/MonthlyAddOns/ValueObjects/MonthlyAddOnExpiry.php`.
- **IMPLEMENT**:
  ```php
  <?php

  namespace Dicoding\Domain\MonthlyAddOns\ValueObjects;

  use DateTimeImmutable;
  use DateInterval;
  use Dicoding\Domain\Common\ValueObject;

  final class MonthlyAddOnExpiry extends ValueObject
  {
      public function __construct(private readonly DateTimeImmutable $expiresAt)
      {
      }

      public static function neverPurchased(): self
      {
          return new self(new DateTimeImmutable('@0'));
      }

      public function extend(DateTimeImmutable $now): self
      {
          $base = $now > $this->expiresAt ? $now : $this->expiresAt;

          return new self($base->add(new DateInterval('P1M')));
      }

      public function toDateTimeImmutable(): DateTimeImmutable
      {
          return $this->expiresAt;
      }

      public function toArray(): array
      {
          return ['expires_at' => $this->expiresAt->format(DATE_ATOM)];
      }
  }
  ```
- **MIRROR**: VALUE_OBJECT_PATTERN above, adapted — `domain-layer.md`'s Rules explicitly say "Do NOT skip validation in value objects," so this isn't a free pass, it's a deliberate call: `LimitUsage` (`Dicoding/Domain/PremiumFeatures/ValueObjects/LimitUsage.php`) is the closest precedent for a state-holding VO with typed constructor properties (not the `private array $data` shape), and it still calls `validateData()` against an assembled array because it guards a meaningful business constraint (usage/limit can't be negative). `MonthlyAddOnExpiry` has no equivalent business constraint beyond "is a valid `DateTimeImmutable`" — which the constructor's type declaration already enforces at the language level, so a `validateData()` call would only re-check what PHP's type system guarantees. If a business rule ever constrains valid expiry values (e.g., "expiry must be in the future"), add a `validateData()` call then, following `LimitUsage`'s pattern — don't add one pre-emptively for a constraint that doesn't exist.
- Do NOT store internal data in a `private array $data` for this VO — there's exactly one field, and wrapping it in a generic array only to immediately unwrap it via a getter adds indirection `LimitUsage`'s typed-property style avoids.
- **IMPORTS**: `DateTimeImmutable`, `DateInterval`, `Dicoding\Domain\Common\ValueObject`.
- **GOTCHA**: `new DateInterval('P1M')` on a Jan 31 date rolls into March in PHP (31 Jan + 1 month = 3 Mar, since Feb has no 31st) — this is standard PHP `DateInterval` behavior, not a bug. Confirmed acceptable for this domain (a few extra days once a year is not a stated concern in the PRD); do not add month-clamping logic that isn't requested.
- **VALIDATE**: covered by Task 5's unit tests exercising `extend()` through the aggregate.

### Task 3: MonthlyAddOnWasPurchased event
- **ACTION**: Create `Dicoding/Domain/MonthlyAddOns/Events/MonthlyAddOnWasPurchased.php`.
- **IMPLEMENT**:
  ```php
  <?php

  namespace Dicoding\Domain\MonthlyAddOns\Events;

  use Dicoding\Support\Contract\ApplicationEvent;

  class MonthlyAddOnWasPurchased extends ApplicationEvent
  {
      public function __construct(int $userId, string $addonType, string $newExpiresAt)
      {
          $this->eventData = [
              'user_id'        => $userId,
              'add_on_type'     => $addonType,
              'new_expires_at' => $newExpiresAt,
          ];
      }

      public function getUserId(): int
      {
          return $this->eventData['user_id'];
      }

      public function getAddOnType(): string
      {
          return $this->eventData['add_on_type'];
      }

      public function getNewExpiresAt(): string
      {
          return $this->eventData['new_expires_at'];
      }
  }
  ```
- **MIRROR**: EVENT_PATTERN above (`MemberWasSubscribedToTrial`, `SubscriptionPurchasedWasCompletelyPaid` for the accessor-methods style).
- **IMPORTS**: `Dicoding\Support\Contract\ApplicationEvent`.
- **GOTCHA**: Store `add_on_type` as the **string** `->value` of `MonthlyAddOnType`, not the enum instance — events must hold only primitives (project-wide rule, confirmed by every existing event in `Subscriptions`).
- **VALIDATE**: covered by Task 4.

### Task 4: MonthlyAddOnPurchase aggregate
- **ACTION**: Create `Dicoding/Domain/MonthlyAddOns/Aggregates/MonthlyAddOnPurchase.php`.
- **IMPLEMENT**:
  ```php
  <?php

  namespace Dicoding\Domain\MonthlyAddOns\Aggregates;

  use DateTimeImmutable;
  use Dicoding\Domain\MonthlyAddOns\Enums\MonthlyAddOnType;
  use Dicoding\Domain\MonthlyAddOns\Events\MonthlyAddOnWasPurchased;
  use Dicoding\Domain\MonthlyAddOns\ValueObjects\MonthlyAddOnExpiry;
  use Dicoding\Domain\Common\Aggregate;

  class MonthlyAddOnPurchase extends Aggregate
  {
      public function __construct(
          private readonly int $userId,
          private readonly MonthlyAddOnType $addonType,
          private readonly MonthlyAddOnExpiry $currentExpiry,
      ) {
      }

      public function purchase(DateTimeImmutable $now): void
      {
          $newExpiry = $this->currentExpiry->extend($now);

          $this->raise(new MonthlyAddOnWasPurchased(
              $this->userId,
              $this->addonType->value,
              $newExpiry->toDateTimeImmutable()->format(DATE_ATOM),
          ));
      }

      public function hasSuccessfullyPurchased(): bool
      {
          return $this->containsDomainEvent(MonthlyAddOnWasPurchased::class);
      }
  }
  ```
- **MIRROR**: AGGREGATE_PATTERN above (`TrialRegistration`) — validate-then-raise, plus a boolean query method backed by `containsDomainEvent()`.
- **IMPORTS**: as listed; `DateTimeImmutable` passed in by the caller (Phase 2's use case), not constructed internally — keeps the aggregate free of hidden `new DateTimeImmutable()` clock calls, matching the project rule to use `Asr::getNowDateTimeStringInDefaultTimeZone()` at the orchestration boundary, not inside pure domain objects. Domain stays clock-free and fully deterministic for tests.
- **GOTCHA**: No explicit `validateRegistration()`-equivalent guard is needed here — there is no invalid state for "purchase an add-on" (unlike trial registration, which can fail eligibility checks). If a future phase adds an eligibility rule (e.g., a max active-add-ons cap), add the guard inside `purchase()` before the `raise()` call, following the same throw-`InvariantException`-via-`Validatorable` pattern as other aggregates — don't build it now, it isn't in scope per the PRD.
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnPurchaseTest' --testsuite=unit`

### Task 5: Unit tests
- **ACTION**: Create `app/tests/UnitTests/Domain/MonthlyAddOns/MonthlyAddOnPurchaseTest.php`.
- **IMPLEMENT**: Cover the cases in the Testing Strategy table below, using Prophecy for nothing (this aggregate has no injected collaborators) — pure input/output assertions plus event assertions.
- **MIRROR**: TEST_STRUCTURE above (`FeatureConsumptionTest`, extends `BusinessCase`).
- **IMPORTS**: `Dicoding\Domain\MonthlyAddOns\Aggregates\MonthlyAddOnPurchase`, `Dicoding\Domain\MonthlyAddOns\Enums\MonthlyAddOnType`, `Dicoding\Domain\MonthlyAddOns\Events\MonthlyAddOnWasPurchased`, `Dicoding\Domain\MonthlyAddOns\ValueObjects\MonthlyAddOnExpiry`, `DateTimeImmutable`.
- **GOTCHA**: Use a fixed `DateTimeImmutable` instance for `$now` in every test (e.g. `new DateTimeImmutable('2026-07-11T00:00:00+00:00')`) — never `new DateTimeImmutable()` with no argument, or the "extend from now" vs "extend from current expiry" branches become non-deterministic and flaky.
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnPurchaseTest' --testsuite=unit`

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Purchase when never purchased before | `currentExpiry = MonthlyAddOnExpiry::neverPurchased()`, `now = 2026-07-11` | `MonthlyAddOnWasPurchased` raised with `new_expires_at = 2026-08-11` (now + 1 month) | No |
| Repurchase before current expiry lapses | `currentExpiry = 2026-07-20`, `now = 2026-07-11` | `new_expires_at = 2026-08-20` (extends from current expiry, not now) | Yes — this is the `max(now, current_expiry)` branch that must NOT just add from `now` |
| Repurchase after current expiry has lapsed | `currentExpiry = 2026-06-01`, `now = 2026-07-11` | `new_expires_at = 2026-08-11` (extends from now, since now > current expiry) | Yes — the other branch of `max()` |
| `add_on_type` stored as raw string, not enum instance | `MonthlyAddOnType::SABAK` | event's `add_on_type` eventData entry === `'sabak'` (string) | Yes — guards the "primitives only in eventData" rule |
| `hasSuccessfullyPurchased()` reflects raised event | after calling `purchase()` | returns `true` | No |

### Edge Cases Checklist
- [x] Never-purchased state (`MonthlyAddOnExpiry::neverPurchased()`)
- [x] Repurchase before expiry (extend-from-current-expiry branch)
- [x] Repurchase after expiry (extend-from-now branch)
- [ ] Maximum size input — N/A, no unbounded input in this phase
- [ ] Concurrent access — N/A, pure domain object, no shared state; concurrency is Phase 3's (DB-transaction) concern
- [ ] Network failure — N/A, no I/O in this phase
- [ ] Permission denied — N/A, no auth concern in pure domain

---

## Validation Commands

### Static Analysis
```bash
deck php vendor/bin/psalm.phar Dicoding/Domain/MonthlyAddOns
```
EXPECT: Zero type errors

### Unit Tests
```bash
deck ai:test --filter='MonthlyAddOnPurchaseTest' --testsuite=unit
```
EXPECT: All tests pass

### Full Test Suite
Not required for this phase — pure new code, no existing code touched, so no regression surface. Run once Phase 3/4 land and integrate this aggregate end-to-end.

### Database Validation
N/A — no DB in this phase.

### Browser Validation
N/A — no UI in this phase.

### Manual Validation
- [ ] Confirm `MonthlyAddOnPurchase`, `MonthlyAddOnType`, `MonthlyAddOnExpiry`, `MonthlyAddOnWasPurchased` compile and have zero references to any Laravel/Eloquent/DB class (grep for `use Illuminate`, `use DB`, `extends Model` — must return nothing under `Dicoding/Domain/MonthlyAddOns/`).

---

## Acceptance Criteria
- [ ] All 5 tasks completed
- [ ] `deck php vendor/bin/psalm.phar Dicoding/Domain/MonthlyAddOns` clean
- [ ] `deck ai:test --filter='MonthlyAddOnPurchaseTest' --testsuite=unit` green
- [ ] No lint errors
- [ ] Matches UX design — N/A, no UX in this phase

## Completion Checklist
- [ ] Code follows discovered patterns (Aggregate/ValueObject/ApplicationEvent/native backed enum)
- [ ] Error handling matches codebase style (no ad-hoc exceptions; `InvariantException` only if a guard is later added)
- [ ] Logging follows codebase conventions — N/A, no logging in pure domain
- [ ] Tests follow `BusinessCase` unit-test pattern
- [ ] No hardcoded values beyond the `P1M` interval and enum string values, both intentional per the PRD
- [ ] Documentation updated — N/A beyond this plan + the PRD
- [ ] No unnecessary scope additions (no repository interface, no gateway implementation, no use case, no config catalog — those are later phases)
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `DateInterval('P1M')` month-rollover edge case (e.g. Jan 31 → Mar 3) surprises someone later | Low | Low | Documented explicitly in Task 2's GOTCHA; matches how the rest of the platform already handles month-based expiries (no existing month-clamping utility found in the codebase to reuse). |
| Someone stores the `MonthlyAddOnType` enum instance (not `->value`) in the event, breaking the "primitives only" rule | Low | Medium | Called out explicitly in Task 3's GOTCHA and covered by a dedicated unit test. |
| Someone tries to create a repository interface to match the old pattern codebase-wide | Low | Low | All removal of repository interfaces is documented in `docs/guidelines/development/domain-layer.md` and the PRD; this is the correct pattern per review feedback. |

## Notes
This phase intentionally produces code with no live call site — it is inert until Phase 2 (UseCases) and Phase 3 (Infrastructure) wire it up. That is expected and correct for a "small as possible, one layer per branch" sequencing; do not add speculative wiring to make it "feel" connected.

Per PR #5316, this phase no longer includes a repository interface — the pattern was removed codebase-wide. Phase 3 will implement an Infrastructure Gateway class to handle persistence; Phase 2's use case will call it directly from the aggregate if needed.

> Next step: Run `/prp-implement .claude/PRPs/plans/add-ons-01-domain.plan.md` to execute this plan, then proceed to `add-ons-02-usecases.plan.md`.
