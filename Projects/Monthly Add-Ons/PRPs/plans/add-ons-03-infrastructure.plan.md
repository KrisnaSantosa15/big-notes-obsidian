# Plan: Add-Ons — Phase 3: Infrastructure & Config Catalog

## Summary

Implement the Phase 1 `MonthlyAddOnPurchase` aggregate's persistence via a new `monthly_add_on_purchases` table and `Dicoding/Infrastructure/StorageGateways/MonthlyAddOns/MonthlyAddOnGateway` (the sole persistence interface — no repository layer per the codebase-wide removal of the repository-interface pattern), add the `app/config/add_on_configs.php` catalog (price, duration_months, target_feature per add-on — mirroring `premium_feature_configs.php`'s shape but simpler: no quota/limit fields), and add `MonthlyAddOnEventListener` (`Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns/`) that reacts to `MonthlyAddOnWasPurchased` with a stub handler (Phase 4 fills in the real logic). This phase makes Phase 1's domain code durable and queryable but still does **not** touch `PremiumFeatures` core (that's Phase 4) or checkout (Phase 5).

## User Story

As the platform, I want an add-on's purchase/repurchase to be durably persisted and discoverable by user, so that later phases (PremiumFeatures core, settlement, web) can read "is this user currently entitled to this add-on, and until when."

## Problem → Solution

Phase 1's `MonthlyAddOnPurchase` aggregate and `MonthlyAddOnWasPurchased` event exist but have nowhere to live. → Add a `monthly_add_on_purchases` table + `MonthlyAddOnGateway` (raw DB access), with the aggregate and settlement/cancellation plugins calling the Gateway directly — no repository layer (per the `docs/guidelines/development/domain-layer.md` update removing the repository-interface pattern codebase-wide).

## Metadata
- **Complexity**: Medium
- **Source PRD**: `../../../docs/domains/daily-add-ons/prd.md` (Phase 3 of 6)
- **PRD Phase**: Infrastructure — Persistence & config catalog
- **Estimated Files**: 5 (migration, gateway, config file, event listener, integration test)

---

## UX Design

N/A — pure backend persistence change.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `../../../docs/domains/daily-add-ons/context.md` | full | Confirms `monthly_add_on_purchases` as the table name (matches the `MonthlyAddOnPurchase` aggregate it backs), `MonthlyAddOnType` enum cases, and the absence of a `MonthlyAddOnPurchaseRepositoryInterface` — this phase's migration/gateway names all derive from it. |
| P0 | `../../../docs/domains/daily-add-ons/prd.md` | Phase 3 row and Phase 4 row | Phase 3 row confirms the Gateway exists; Phase 4 row confirms what `MonthlyAddOnEventListener` must do (call `PremiumFeature::enrollUser()`) — this phase's listener is just the wiring, Phase 4 fills the body. |
| P0 | `docs/guidelines/development/domain-layer.md` | 25-37 (Aggregates section) | Confirms no repository-interface pattern: "Aggregates create/save through the Infrastructure Gateway directly." This phase creates only the Gateway, not a separate Repository class. |
| P0 | `docs/guidelines/development/infrastructure-layer.md` | 71-79 (Gateway Method Naming) | Confirms the verb-named method pattern (`find{Entity}By{Criteria}`, `create{Entity}`, `update{Field}`) this phase's `MonthlyAddOnGateway` follows. |
| P0 | `Dicoding/Domain/MonthlyAddOns/Events/MonthlyAddOnWasPurchased.php` (Phase 1) | full | The event `MonthlyAddOnEventListener` subscribes to. Its `eventData` shape (`user_id`, `add_on_type`, `new_expires_at`) is what gets persisted. |
| P0 | `Dicoding/Infrastructure/StorageGateways/PremiumFeatures/PremiumFeatureGateway.php` | 154-175 (`insertNewUserRecord`), 86-99 (`updateUserFeatureUsage`) | Confirms the codebase's real insert/update split for a per-user upsert: **separate, verb-named methods**, without a Router deciding which to call based on whether a row already existed — not a single generic `upsert*()` method. `MonthlyAddOnGateway` mirrors this split. |
| P0 | `Dicoding/Infrastructure/StorageGateways/Subscriptions/SubscriptionOrderDestinationGateway.php` | 30-54 | StorageGateway pattern: raw `$this->db->table(...)` queries, uses `Asr::getNowDateTimeStringInDefaultTimeZone()` for `created_at`/`updated_at`. |
| P0 | `Dicoding/Infrastructure/GlobalDomainEventHandlers/Subscriptions/SubscriptionsEventListener.php` | full | Event listener pattern: extends `EventListener` (Laracasts Commander), method naming `when{EventClassName}(Event $event)`, wraps body in try/catch reporting via `ActivityReportInterface`, calls into other bounded contexts (e.g. `PremiumFeature::enrollUser(...)`). |
| P1 | `app/database/migrations/2026_02_20_132257_create-premium_feature_users-table.php` | 15-36 | Migration style precedent: single unique-constrained row per `(user_id, feature_id)` — this phase's `monthly_add_on_purchases` table follows the same unique-per-user-per-addon-type shape. |
| P1 | `app/config/premium_feature_configs.php` | 1-93 | Top-level structure to mirror for `add_on_configs.php` — but this phase's version is much simpler: only `price`, `duration_months`, and `target_feature` per entry, no quota/limit fields. |
| P2 | `app/tests/IntegrationTests/Domain/Subscriptions/SaveUserEnrollmentWhenSubscribingTest.php` | full | Test pattern for asserting an event listener's side effect on the DB: `Event::fire('Dicoding.Domain....Events.X', new X(...))` then `assertSingleRecordExists(...)`. |

## External Documentation

No external research needed.

---

## Patterns to Mirror

### STORAGE_GATEWAY_PATTERN
// SOURCE: Dicoding/Infrastructure/StorageGateways/Subscriptions/SubscriptionOrderDestinationGateway.php:30-54
```php
class SubscriptionOrderDestinationGateway
{
    private static $tableName = 'subscription_order_destinations';

    public function __construct(private ConnectionInterface $db) {}

    public function addNew(...): void
    {
        $this->db->table(self::$tableName)->insert([
            // ...
            'created_at' => $now = Asr::getNowDateTimeStringInDefaultTimeZone(),
            'updated_at' => $now,
        ]);
    }
}
```

### EVENT_LISTENER_PATTERN
// SOURCE: Dicoding/Infrastructure/GlobalDomainEventHandlers/Subscriptions/SubscriptionsEventListener.php
```php
class SubscriptionsEventListener extends EventListener
{
    public function __construct(
        private readonly ActivityReportInterface $errorReport,
        // ...other collaborators
    ) {
    }

    public function whenMemberWasSubscribedToTrial(MemberWasSubscribedToTrial $event): void
    {
        $data = $event->getEventData();
        // side effects, wrapped in try/catch in the more complex handlers
        PremiumFeature::enrollUser($data['member_id'], "explain-with-ai");
    }
}
```

### CONFIG_CATALOG_PATTERN
// SOURCE: app/config/add_on_configs.php (simplified: no quota/limit fields per ADR-0004)
```php
'sabak' => [
    'price' => 250000,
    'duration_months' => 1,
    'target_feature' => 'sabak',
],
'student-chatbot' => [
    'price' => 50000,
    'duration_months' => 1,
    'target_feature' => 'student-chatbot',
],
```

### TEST_STRUCTURE (event → DB assertion)
// SOURCE: app/tests/IntegrationTests/Domain/Subscriptions/SaveUserEnrollmentWhenSubscribingTest.php
```php
class SaveUserEnrollmentWhenSubscribingTest extends IntegrationTest
{
    #[\Override]
    public function subscribe_plus(): void
    {
        Event::fire(
            'Dicoding.Domain.Subscriptions.Events.MemberWasSubscribed',
            new MemberWasSubscribed(5, SubscriptionType::PLUS->value, new DateTimeImmutable('+30 days'))
        );

        $this->assertSingleRecordExists('subscriber_course_enrollments', [/* ... */]);
    }
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `app/database/migrations/{timestamp}_create-monthly_add_on_purchases-table.php` | CREATE | New table: `id`, `user_id` (int, indexed), `add_on_type` (string), `expires_at` (datetime), `created_at`/`updated_at`. Unique constraint on `(user_id, add_on_type)` — one row per user per add-on product, matching `premium_feature_users`' one-row-per-`(user_id, feature_id)` shape. |
| `Dicoding/Infrastructure/StorageGateways/MonthlyAddOns/MonthlyAddOnGateway.php` | CREATE | Raw DB reads/writes against `monthly_add_on_purchases`: `findPurchaseByUserAndAddonType(int $userId, string $addonType): ?object`, `createPurchase(...)`, `updatePurchaseExpiry(...)` — three verb-named methods per `infrastructure-layer.md`'s Gateway Method Naming table, not a single generic upsert. Called directly by `MonthlyAddOnPurchase` aggregate (Phase 1) and settlement/cancellation plugins (Phase 5) — no separate Repository layer. |
| `app/config/add_on_configs.php` | CREATE | Catalog keyed by `MonthlyAddOnType` enum value (`sabak`, `student-chatbot`): `price` (int, IDR), `duration_months` (int, always `1`), `target_feature` (string — the `PremiumFeatures` feature name this add-on unlocks: `sabak` → `sabak`, `student-chatbot` → `student-chatbot`). No quota/limit fields — daily usage and reset timing are entirely `PremiumFeatures`' concern (ADR-0004). |
| `Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns/MonthlyAddOnEventListener.php` | CREATE | `whenMonthlyAddOnWasPurchased(MonthlyAddOnWasPurchased $event)` — this phase's listener body is a stub (try/catch + logging only) since Phase 4 fills in the actual `PremiumFeature::enrollUser($userId, $targetFeature)` call (see Phase 4 plan — it edits this file, does not create a new one). |
| `app/tests/IntegrationTests/Domain/MonthlyAddOns/MonthlyAddOnPurchasePersistenceTest.php` | CREATE | Fires `MonthlyAddOnWasPurchased` and asserts the `monthly_add_on_purchases` row, per TEST_STRUCTURE above. |

## NOT Building

- Any `PremiumFeatures` core change (Phase 4 edits `MonthlyAddOnEventListener::whenMonthlyAddOnWasPurchased()` to add the actual `PremiumFeature::enrollUser()` call — this phase's version is a stub plus logging).
- `InvoiceEntities::MONTHLY_ADD_ON`, settlement, or cancellation plugins (Phase 5).
- Web/UI (Phase 6).
- A generic "get all add-ons a user owns" query method beyond what Phase 4/5/6 explicitly need — add read methods on `MonthlyAddOnGateway` only when a concrete caller requires them.

---

## Step-by-Step Tasks

### Task 1: Migration
- **ACTION**: Create `app/database/migrations/{timestamp}_create-monthly_add_on_purchases-table.php`.
- **IMPLEMENT**:
  ```php
  Schema::create('monthly_add_on_purchases', function (Blueprint $table) {
      $table->increments('id');
      $table->integer('user_id')->unsigned()->index();
      $table->string('add_on_type');
      $table->dateTime('expires_at');
      $table->timestamps();
      $table->unique(['user_id', 'add_on_type']);
  });
  ```
- **MIRROR**: `app/database/migrations/2026_02_20_132257_create-premium_feature_users-table.php:15-36` (unique-constrained per-user-per-thing shape).
- **GOTCHA**: Use `$table->unique(['user_id', 'add_on_type'])`, not a single-column unique — a user can hold both Sabak and Learning-with-AI simultaneously (two separate rows), only one row per `(user_id, add_on_type)` pair.
- **VALIDATE**: `deck composer dump-autoload` only. Per `docs/guidelines/development/infrastructure-layer.md`: **do NOT run the migration itself** (`deck artisan migrate`) — that is the developer/operator's call, made when and against whichever database they choose. This task's job ends at "the migration class exists and the autoloader picked it up."

### Task 2: MonthlyAddOnGateway
- **ACTION**: Create `Dicoding/Infrastructure/StorageGateways/MonthlyAddOns/MonthlyAddOnGateway.php`.
- **IMPLEMENT**: Three verb-named methods, matching `infrastructure-layer.md`'s Gateway Method Naming table (`find{Entity}By{Criteria}`, `create{Entity}`, `update{Field}`) instead of one generic upsert:
  ```php
  class MonthlyAddOnGateway
  {
      private const string MONTHLY_ADD_ON_PURCHASES_TABLE = 'monthly_add_on_purchases';

      public function __construct(private readonly ConnectionInterface $db) {}

      public function findPurchaseByUserAndAddonType(int $userId, string $addonType): ?object
      {
          return $this->db->table(self::MONTHLY_ADD_ON_PURCHASES_TABLE)
              ->where('user_id', $userId)
              ->where('add_on_type', $addonType)
              ->first();
      }

      public function createPurchase(int $userId, string $addonType, string $expiresAt): void
      {
          $now = Asr::getNowDateTimeStringInDefaultTimeZone();
          $this->db->table(self::MONTHLY_ADD_ON_PURCHASES_TABLE)->insert([
              'user_id' => $userId,
              'add_on_type' => $addonType,
              'expires_at' => $expiresAt,
              'created_at' => $now,
              'updated_at' => $now,
          ]);
      }

      public function updatePurchaseExpiry(int $userId, string $addonType, string $expiresAt): void
      {
          $this->db->table(self::MONTHLY_ADD_ON_PURCHASES_TABLE)
              ->where('user_id', $userId)
              ->where('add_on_type', $addonType)
              ->update([
                  'expires_at' => $expiresAt,
                  'updated_at' => Asr::getNowDateTimeStringInDefaultTimeZone(),
              ]);
      }
  }
  ```
- **GOTCHA — table-identifier style corrected**: the STORAGE_GATEWAY_PATTERN citation above (`SubscriptionOrderDestinationGateway`) uses a mutable `private static $tableName` property, but that's an outlier — only 2 of 242 Gateway classes in this codebase use that style. The dominant convention (38/242, whenever a class-level identifier is used at all) is an immutable `private const string {DESCRIPTIVE_NAME}_TABLE`, e.g. `PremiumFeatureGateway::PREMIUM_FEATURES_TABLE`. Use `const`, not `$tableName`.
- **MIRROR**: `PremiumFeatureGateway::insertNewUserRecord()` / `updateUserFeatureUsage()` — separate insert/update methods, decision made by the caller (the aggregate, Phase 1, or the settlement plugin, Phase 5), not inside the Gateway.
- **IMPORTS**: `Illuminate\Database\ConnectionInterface`, `DicodingUtils\TimeZone\Asr`.
- **GOTCHA**: Always set `updated_at` (and `created_at` only on insert) via `Asr::getNowDateTimeStringInDefaultTimeZone()` — never `now()`/`Carbon::now()` directly, per project convention.
- **VALIDATE**: `deck php vendor/bin/psalm.phar Dicoding/Infrastructure/StorageGateways/MonthlyAddOns`

### Task 3: add_on_configs.php catalog
- **ACTION**: Create `app/config/add_on_configs.php`.
- **IMPLEMENT**:
  ```php
  <?php

  use Dicoding\Domain\MonthlyAddOns\Enums\MonthlyAddOnType;

  return [
      MonthlyAddOnType::SABAK->value => [
          'price' => 250000,
          'duration_months' => 1,
          'target_feature' => 'sabak',
      ],
      MonthlyAddOnType::STUDENT_CHATBOT->value => [
          'price' => 50000,
          'duration_months' => 1,
          'target_feature' => 'student-chatbot',
      ],
  ];
  ```
- **MIRROR**: CONFIG_CATALOG_PATTERN above (simplified: no quota/limit/unit_measurement fields per ADR-0004).
- **GOTCHA**: `target_feature` is the bridge Phase 4 uses to know which `PremiumFeatures` feature name to enroll against via `PremiumFeature::enrollUser($userId, $targetFeature)` — keep this key name stable, Phase 4's plan references it by this exact name.
- **VALIDATE**: `php -l app/config/add_on_configs.php` (syntax check) — no dedicated test needed for a static config array; Phase 4/5's tests exercise it indirectly.

### Task 4: MonthlyAddOnEventListener + wiring
- **ACTION**: Create `Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns/MonthlyAddOnEventListener.php` and register it the same way `SubscriptionsEventListener` is registered (grep the service provider / event-subscriber registration list for `SubscriptionsEventListener::class` and add the new listener alongside it).
- **IMPLEMENT**:
  ```php
  class MonthlyAddOnEventListener extends EventListener
  {
      public function __construct(private readonly ActivityReportInterface $errorReport) {}

      public function whenMonthlyAddOnWasPurchased(MonthlyAddOnWasPurchased $event): void
      {
          try {
              // Phase 4 adds the PremiumFeature::enrollUser($userId, $targetFeature) call here.
          } catch (Exception $exception) {
              $this->errorReport->reportError($exception);
          }
      }
  }
  ```
- **MIRROR**: EVENT_LISTENER_PATTERN above.
- **GOTCHA**: This phase's handler body is intentionally a stub (try/catch + empty) — do not skip creating it just because it "does nothing yet." Registering the listener now (with the correct method-naming convention `when{EventClassName}`) means Phase 4 only has to add the method body, not wire up event-subscription plumbing, keeping Phase 4's diff minimal.
- **VALIDATE**: covered by Task 5's integration test (confirms the listener fires without throwing).

### Task 5: Integration test
- **ACTION**: Create `app/tests/IntegrationTests/Domain/MonthlyAddOns/MonthlyAddOnPurchasePersistenceTest.php`.
- **IMPLEMENT**: Per `testing.md`'s "Repository unit test — ONE full happy-path case" rule, this is **not** the place to re-verify the expiry-math branches (never-purchased / repurchase-before / repurchase-after) — Phase 1's `MonthlyAddOnPurchaseTest` already proves those at the aggregate level. This test covers only what's genuinely new at the persistence boundary:
  1. ONE happy-path case: aggregate fires event → `MonthlyAddOnEventListener` receives it → assert the `monthly_add_on_purchases` row exists with the expected `expires_at` (proves the Gateway persistence works end-to-end, nothing more). The aggregate itself already tested the purchase logic; this test only covers the Infrastructure seam (Gateway + listener wiring).
  2. The composite-key case: purchasing `sabak` then `student-chatbot` for the same user produces two distinct rows — this is a persistence-specific concern (the unique key shape), not a duplicate of any aggregate test.
  3. `MonthlyAddOnEventListener` doesn't throw when `MonthlyAddOnWasPurchased` fires — confirms the listener is registered and wired, via `Event::fire(...)` per TEST_STRUCTURE.
- **MIRROR**: TEST_STRUCTURE above; `testing.md`'s Repository-test scope rule.
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnPurchasePersistenceTest' --testsuite=integration`

---

## Testing Strategy

### Unit Tests
N/A at this layer beyond what Phase 1 already unit-tests — `MonthlyAddOnGateway` is integration-tested against a real test DB per project convention for Infrastructure classes (see `LogFeatureDailyUsageStatSpecificationTest` precedent — infra-touching code is tested via `IntegrationTest`, not `BusinessCase`).

### Integration Tests

Deliberately narrow, per `testing.md`'s Gateway-test scope rule — the expiry-math branches are Phase 1's job, not this layer's:

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Happy path: purchase persists | no existing row, aggregate fires event, `now = 2026-07-08` | `monthly_add_on_purchases` row exists with `expires_at = 2026-08-08` | No — this is the ONE full happy-path case the Gateway/listener test owns |
| Two add-ons, same user | purchase `sabak` then `student-chatbot` | Two distinct rows for the same `user_id` | Yes — a genuinely persistence-specific concern (the composite unique key), not an aggregate-logic duplicate |
| `MonthlyAddOnEventListener` doesn't throw | fire `MonthlyAddOnWasPurchased` directly | No exception propagates | No |

### Edge Cases Checklist
- [x] Gateway/listener wiring happy path
- [x] Multiple add-on types per user (composite key correctness)
- [ ] Repurchase expiry-math branches — intentionally NOT re-tested here, see Phase 1's `MonthlyAddOnPurchaseTest`
- [ ] Maximum size input — N/A
- [x] Concurrent access — flagged as a risk below, not solved in this phase (see Risks)
- [ ] Network failure — N/A, local DB only
- [ ] Permission denied — N/A, no auth layer here

---

## Validation Commands

### Static Analysis
```bash
deck php vendor/bin/psalm.phar Dicoding/Infrastructure/StorageGateways/MonthlyAddOns Dicoding/Infrastructure/GlobalDomainEventHandlers/MonthlyAddOns
```
EXPECT: Zero type errors

### Integration Tests
```bash
deck ai:test --filter='MonthlyAddOnPurchasePersistenceTest' --testsuite=integration
```
EXPECT: All tests pass

### Full Test Suite
Not required — new table/code only, no existing migration or config file modified.

### Database Validation
```bash
deck composer dump-autoload
```
EXPECT: migration class autoloads cleanly. Per `infrastructure-layer.md`, **do not run `deck artisan migrate`** — applying the migration is the developer/operator's decision, not this task's. (A developer running it separately should see the `monthly_add_on_purchases` table created with the `(user_id, add_on_type)` unique index.)

### Browser Validation
N/A — no UI in this phase.

### Manual Validation
- [ ] `php -l app/config/add_on_configs.php` passes.
- [ ] Confirm `MonthlyAddOnEventListener` appears in whatever registration list `SubscriptionsEventListener` appears in (service provider / event map).

---

## Acceptance Criteria
- [ ] All 5 tasks completed
- [ ] `deck php vendor/bin/psalm.phar` clean on both new Infrastructure directories
- [ ] `deck ai:test --filter='MonthlyAddOnPurchasePersistenceTest' --testsuite=integration` green
- [ ] Migration class exists and `deck composer dump-autoload` succeeds (actually running it is left to the developer)

## Completion Checklist
- [ ] Code calls `MonthlyAddOnGateway` directly from aggregate (Phase 1) and settlement plugin (Phase 5) — no separate Repository layer
- [ ] Timestamps via `Asr::getNowDateTimeStringInDefaultTimeZone()`, never `now()`/`Carbon::now()`
- [ ] Event listener method naming (`when{EventClassName}`) matches convention
- [ ] Event listener handler is stub only — Phase 4 fills in the `PremiumFeature::enrollUser()` call
- [ ] Tests follow `IntegrationTest` pattern
- [ ] No `PremiumFeatures` core code touched
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Concurrent repurchase (two requests racing on the same `(user_id, add_on_type)` row) could read-then-write stale state in `MonthlyAddOnPurchase` | Low (repurchase is rare, not a hot path) | Medium | Not solved in this phase — flagged here for Phase 5, which should wrap the settlement plugin's call to the aggregate in the same DB transaction pattern `SubscriptionSettlementPlugin` already uses (it wraps its whole `run()` in a transaction). Don't add locking here; it belongs at the settlement boundary where the invoice-paid webhook is the actual concurrency-sensitive entry point. |

## Notes
`MonthlyAddOnEventListener`'s Task 4 body is a deliberate stub — Phase 4 edits this exact file to add the real `PremiumFeature::enrollUser($userId, $targetFeature)` call. This is the one place where a later phase modifies a file this phase creates, by design (it's the seam between the two bounded contexts, same as `SubscriptionsEventListener::whenMemberWasSubscribedToTrial()` calling into `PremiumFeature::enrollUser()` today).

> Next step: Run `/prp-implement .claude/PRPs/plans/add-ons-03-infrastructure.plan.md`, then proceed to `add-ons-04-premiumfeatures-integration.plan.md`.
