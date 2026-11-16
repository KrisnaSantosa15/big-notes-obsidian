---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, prp, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Plan: Add-Ons — Phase 5: Checkout/Settlement Integration

## Summary

Add `InvoiceEntities::MONTHLY_ADD_ON`, `MonthlyAddOnSettlementPlugin`, and `MonthlyAddOnCancellationPlugin`, wiring the existing convention-based plugin-discovery factory to the Add-Ons bounded context. On settlement (invoice paid), `MonthlyAddOnSettlementPlugin` drives Phase 1's `MonthlyAddOnPurchase` aggregate through Phase 3's `MonthlyAddOnGateway` to record/extend the purchase, which raises `MonthlyAddOnWasPurchased` and (via Phase 3's listener + Phase 4's `PremiumFeature::enrollUser()` call) grants the entitlement. On cancellation, `MonthlyAddOnCancellationPlugin` mirrors `SubscriptionCancellationPlugin` exactly: flips the invoice to `CANCELLED`, credits points back, raises an event — **no entitlement revocation**.

## User Story

As the platform, when a user completes payment for an add-on invoice, I want the entitlement automatically granted through the same settlement mechanism every other purchasable entity uses, so add-ons don't need a bespoke payment-webhook path.

## Problem → Solution

`InvoiceEntities` has 10 cases today, none for add-ons; `SettlementPluginFactory` resolves a plugin class purely by naming convention off the entity's value (`ucfirst(Str::camel($invoiceEntity->getValue())) . 'SettlementPlugin'`) — so adding the enum case and a correctly-named plugin class is sufficient to wire it in, no factory changes needed.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `../../../docs/domains/daily-add-ons/prd.md` (Phase 5 of 6)
- **PRD Phase**: Checkout/Settlement integration
- **Estimated Files**: 5 (enum update, settlement plugin, cancellation plugin, add-on invoice record creation, 2 test files)

---

## UX Design

N/A — backend payment-webhook integration, no direct UI.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `Dicoding/Domain/Common/Enums/Payments/InvoiceEntities.php` | 1-39 (full) | The enum this phase adds `MONTHLY_ADD_ON` to. Note the `@method static InvoiceEntities X()` PHPDoc list at the top — must add a matching `@method` line, not just the `private const`, or IDE/psalm tooling won't recognize the magic static call (confirm this dual-declaration requirement by checking `MyCLabs\Enum\Enum`'s magic `__callStatic` mechanism, which this class relies on — it's not a native PHP enum). |
| P0 | `Dicoding/Domain/Payment/Settlement/Services/SettlementPlugin.php` | 1-12 (full) | Abstract base every settlement plugin extends: `abstract class SettlementPlugin extends Aggregate { abstract public function run(Invoice $invoice): bool; }`. |
| P0 | `Dicoding/Domain/Payment/Settlement/Services/SettlementPluginFactory.php` | 11-47 | Confirms the naming-convention resolution: `$className = ucfirst(\Str::camel($invoiceEntity->getValue())) . 'SettlementPlugin'`. **The `InvoiceEntities::MONTHLY_ADD_ON` value must produce exactly `MonthlyAddOnSettlementPlugin` through this transform** — verify the exact string picked in Task 1 satisfies this before finalizing it. |
| P0 | `Dicoding/Domain/Payment/Settlement/Services/Plugins/SubscriptionSettlementPlugin.php` | 1-213 (full) | The settlement plugin to mirror structurally: DB transaction wrapping the whole `run()`, updates invoice status to `VERIFIED`, grants entitlement, raises domain event(s), returns `bool`, catches exceptions and rolls back. |
| P0 | `Dicoding/Domain/Payment/Cancellation/Service/Plugins/SubscriptionCancellationPlugin.php` | 1-65 (full) | The cancellation plugin to mirror **exactly** per ADR-0006: flips status to `CANCELLED` (line 43), credits points via `UserPointService::updateUserPoint()` only if `front_payment > 0` (lines 46-52), raises `UserPointWasIncreased` + a refund event (lines 53-61), and critically does **not** call anything that revokes a feature/entitlement. |
| P0 | `Dicoding/DomainServices/Points/UserPointService.php` | full | `updateUserPoint(int $userId, int $deltaPoint, int $entityId, string $entity): void` — the exact signature `MonthlyAddOnCancellationPlugin` calls. |
| P1 | `Dicoding/Domain/Payment/Commons/ValueObjects/Invoice.php` | full (skim) | The `Invoice` VO both plugins receive — read its getters (`getMemberId()`, `getFrontPayment()`, `getEntityId()`) since both new plugins need them. |
| P1 | `Dicoding/Infrastructure/StorageGateways/MonthlyAddOns/MonthlyAddOnGateway.php` (Phase 3) | full | The concrete gateway (not an interface) `MonthlyAddOnSettlementPlugin` drives to grant entitlement. **Phase 3 actually shipped three verb-named methods, not `createAggregate()`/`save()`**: `findPurchaseByUserAndAddonType(int $userId, string $addonType): ?object`, `createPurchase(int $userId, string $addonType, string $expiresAt): void`, `updatePurchaseExpiry(int $userId, string $addonType, string $expiresAt): void`. This plan's settlement plugin must construct the `MonthlyAddOnPurchase` aggregate itself from the gateway's lookup result (or `MonthlyAddOnExpiry::neverPurchased()` if none exists), then call `createPurchase()` or `updatePurchaseExpiry()` depending on whether a row already existed — see Task 2's corrected `run()` body below. Per `docs/guidelines/development/domain-layer.md`, aggregates create/save through the concrete Infrastructure Gateway directly — no Domain-layer repository interface for `MonthlyAddOns`. |
| P1 | `Dicoding/Infrastructure/Repositories/MonthlyAddOns/MonthlyAddOnInvoiceRepository.php` (Phase 5) | full | This phase creates the invoice record in the database — the record created at purchase-initiation time (Phase 2) must carry enough data (`user_id`, `add_on_type`) for `MonthlyAddOnSettlementPlugin::run(Invoice $invoice)` to later reconstruct which user bought which add-on via a lookup gateway. Confirm how `Invoice::getEntityId()` maps back to an add-on-purchase record for other entities (e.g. how `SubscriptionSettlementPlugin` uses `$invoice->getEntityId()` to look up the specific `SubscriptionPurchase` row) and mirror that exactly — **do not invent a new lookup mechanism**. |
| P2 | `app/tests/UnitTests/Domain/Subscriptions/Transactions/SubscriptionSettlementPluginTest.php` | 1-501 (skim) | Test pattern: `BusinessCase`, Prophecy mocks (`$this->prophesize(...)->reveal()`), asserts events raised via `assertDomainEventContains()`. |
| P2 | `app/tests/UnitTests/Domain/Payment/Cancellation/CancellingSubscriptionPaymentTest.php` | 1-170 (skim) | Test pattern for the cancellation plugin, including the `front_payment > 0` conditional-refund test case. |

## External Documentation

No external research needed.

---

## Patterns to Mirror

### SETTLEMENT_PLUGIN_PATTERN
// SOURCE: Dicoding/Domain/Payment/Settlement/Services/Plugins/SubscriptionSettlementPlugin.php (structure, condensed)
```php
class SubscriptionSettlementPlugin extends SettlementPlugin
{
    public function run(Invoice $invoice): bool
    {
        $this->db->beginTransaction();
        try {
            $this->subscriptionGateway->updatePurchaseStatus($invoice->getEntityId(), InvoiceStatus::VERIFIED());
            // ... grant entitlement ...
            $this->raise(new SubscriptionPurchasedWasCompletelyPaid(/* ... */));
            $this->db->commit();
            return true;
        } catch (Exception $exception) {
            $this->db->rollBack();
            return false;
        }
    }
}
```

### CANCELLATION_PLUGIN_PATTERN
// SOURCE: Dicoding/Domain/Payment/Cancellation/Service/Plugins/SubscriptionCancellationPlugin.php:1-65 (condensed)
```php
class SubscriptionCancellationPlugin extends CancellationPlugin // confirm exact base class name
{
    public function run(Invoice $invoice): bool
    {
        $this->subscriptionGateway->updatePurchaseStatus($invoice->getEntityId(), InvoiceStatus::CANCELLED());

        if ($invoice->getFrontPayment() > 0) {
            $this->userPointService->updateUserPoint(
                $invoice->getMemberId(),
                $invoice->getFrontPayment(),
                $invoice->getEntityId(),
                PaymentInvoiceDomain::SUBSCRIPTION_REFUND()->getValue()
            );
            $this->raise(new UserPointWasIncreased([/* ... */]));
            $this->raise(new SubscriptionPaymentWasRefunded(/* ... */));
        }

        return true;
    }
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `Dicoding/Domain/Common/Enums/Payments/InvoiceEntities.php` | UPDATE | Add `@method static InvoiceEntities MONTHLY_ADD_ON()` to the PHPDoc block and `private const string MONTHLY_ADD_ON = 'monthly add on';` to the class body (see Task 1 GOTCHA and `../../../docs/domains/daily-add-ons/adr/0007-monthly-prefix-applied-to-all-class-names.md` for why the value must be this exact space-separated phrase). |
| `Dicoding/Domain/Payment/Settlement/Services/Plugins/MonthlyAddOnSettlementPlugin.php` | CREATE | Grants entitlement on invoice settlement by driving `MonthlyAddOnGateway` (Phase 3) directly — no repository interface per `docs/guidelines/development/domain-layer.md`. |
| `Dicoding/Domain/Payment/Cancellation/Service/Plugins/MonthlyAddOnCancellationPlugin.php` | CREATE | Mirrors `SubscriptionCancellationPlugin` exactly — status flip + conditional point refund + event, no revocation. |
| `Dicoding/Infrastructure/Repositories/MonthlyAddOns/MonthlyAddOnInvoiceRepository.php` | CREATE | Creates an `InvoiceEntities::MONTHLY_ADD_ON` invoice carrying `user_id` + `add_on_type` so `MonthlyAddOnSettlementPlugin::run()` can later resolve them from `$invoice->getEntityId()`. |
| `app/tests/UnitTests/Domain/Payment/Settlement/MonthlyAddOnSettlementPluginTest.php` | CREATE | Prophecy-based unit test (see Testing Strategy). |
| `app/tests/UnitTests/Domain/Payment/Cancellation/CancellingMonthlyAddOnPaymentTest.php` | CREATE | Mirrors `CancellingSubscriptionPaymentTest`'s structure. |

## NOT Building

- Any change to `SettlementPluginFactory` itself — the naming convention already resolves the new plugin automatically once it exists with the right name.
- Entitlement revocation in `MonthlyAddOnCancellationPlugin` — explicitly out of scope per ADR-0006.
- Promo/discount code handling on the add-on invoice (out of scope per PRD).
- Bundled/multi-item invoices (out of scope per PRD — one invoice, one add-on, always).
- **Bundling an add-on purchase with a class/course subscription in one checkout** — explicitly deferred ("next implementation") per ADR-0005. v1 keeps every invoice 1:1 with `PaymentTransaction` (single item per checkout), so buying an add-on alongside a subscription is two separate checkouts.

---

## Step-by-Step Tasks

### Task 1: InvoiceEntities::MONTHLY_ADD_ON
- **ACTION**: Update `Dicoding/Domain/Common/Enums/Payments/InvoiceEntities.php`.
- **IMPLEMENT**:
  ```php
  /**
   * ...
   * @method static InvoiceEntities MONTHLY_ADD_ON()
   */
  class InvoiceEntities extends Enum
  {
      use EnumTraits;

      // ...existing consts...
      private const string MONTHLY_ADD_ON = 'monthly add on';
  }
  ```
- **MIRROR**: existing enum shape.
- **GOTCHA — the enum value is not a free choice, it's derived, and already worked out in ADR-0007**: `SettlementPluginFactory` computes `ucfirst(\Str::camel($invoiceEntity->getValue())) . 'SettlementPlugin'`. `Str::camel()` only capitalizes after a separator (space/underscore/hyphen) — a single contiguous word like `'addon'` or `'monthlyaddon'` would produce `Addon`/`Monthlyaddon` (no capital O in the middle), **not** `MonthlyAddOn`. The value must be the space-separated phrase `'monthly add on'`: `Str::camel('monthly add on')` → `'monthlyAddOn'` → `ucfirst()` → `'MonthlyAddOn'` → `+ 'SettlementPlugin'` = `MonthlyAddOnSettlementPlugin`. See `../../../docs/domains/daily-add-ons/adr/0007-monthly-prefix-applied-to-all-class-names.md` for the full derivation. Still worth an empirical sanity check against a second real example (e.g. confirm `InvoiceEntities::ACADEMY`'s value `'academy payment'` really does back a class literally named `AcademyPaymentSettlementPlugin`) before trusting this in code.
- **VALIDATE**: `deck php vendor/bin/psalm.phar Dicoding/Domain/Common/Enums/Payments/InvoiceEntities.php`

### Task 2: MonthlyAddOnSettlementPlugin
- **ACTION**: Create `Dicoding/Domain/Payment/Settlement/Services/Plugins/MonthlyAddOnSettlementPlugin.php`.
- **IMPLEMENT**:
  ```php
  class MonthlyAddOnSettlementPlugin extends SettlementPlugin
  {
      public function __construct(
          private readonly MonthlyAddOnInvoiceStatusGateway $addOnInvoiceGateway, // resolves invoice entity_id -> (user_id, add_on_type)
          private readonly MonthlyAddOnGateway $addOnGateway,
          private readonly ConnectionInterface $db,
      ) {
      }

      public function run(Invoice $invoice): bool
      {
          $this->db->beginTransaction();
          try {
              [$userId, $addonType] = $this->addOnInvoiceGateway->resolvePurchaseDetails($invoice->getEntityId());
              $this->addOnInvoiceGateway->updateStatus($invoice->getEntityId(), InvoiceStatus::VERIFIED());

              $existingRow = $this->addOnGateway->findPurchaseByUserAndAddonType($userId, $addonType);
              $currentExpiry = $existingRow === null
                  ? MonthlyAddOnExpiry::neverPurchased()
                  : new MonthlyAddOnExpiry(new DateTimeImmutable($existingRow->expires_at));

              $addOnPurchase = new MonthlyAddOnPurchase($userId, MonthlyAddOnType::from($addonType), $currentExpiry);
              $addOnPurchase->purchase(new DateTimeImmutable());
              $this->captureDomainEvents($addOnPurchase);

              $newExpiresAt = $addOnPurchase->getFirstOccurrenceDomainEventObject(MonthlyAddOnWasPurchased::class)->getNewExpiresAt();
              if ($existingRow === null) {
                  $this->addOnGateway->createPurchase($userId, $addonType, $newExpiresAt);
              } else {
                  $this->addOnGateway->updatePurchaseExpiry($userId, $addonType, $newExpiresAt);
              }

              $this->db->commit();
              return true;
          } catch (Exception $exception) {
              $this->db->rollBack();
              return false;
          }
      }
  }
  ```
- **MIRROR**: SETTLEMENT_PLUGIN_PATTERN above.
- **GOTCHA — Gateway shape corrected**: Phase 3's `MonthlyAddOnGateway` does not have `createAggregate()`/`save()`. This plugin owns the "look up existing row, build the aggregate from it, then create-or-update based on whether a row existed" orchestration itself, using the three verb-named Gateway methods directly.
- **IMPORTS**: `Dicoding\Domain\MonthlyAddOns\Enums\MonthlyAddOnType`, `Dicoding\Infrastructure\StorageGateways\MonthlyAddOns\MonthlyAddOnGateway`, `DateTimeImmutable`, plus the Payment domain's `Invoice`/`InvoiceStatus` types.
- **GOTCHA #1**: This plugin needs a small `MonthlyAddOnInvoiceStatusGateway`-equivalent (naming placeholder — match whatever the analogous concept is called for `SubscriptionSettlementPlugin`, which resolves `$invoice->getEntityId()` back to a `SubscriptionPurchase` row via `SubscriptionGateway`) to know **which user bought which `MonthlyAddOnType`** from just the invoice's `entity_id`. Task 4 (`MonthlyAddOnInvoiceRepository`) is what originally creates that row at purchase-initiation time (Phase 2) — this settlement plugin reads it back. Don't skip designing that lookup; without it, `MonthlyAddOnSettlementPlugin` has no way to know the `add_on_type` for the invoice it's settling.
- **GOTCHA #2**: `$this->captureDomainEvents($addOnPurchase)` — confirm this is how a `SettlementPlugin` (which extends `Aggregate`, per `SettlementPlugin.php`) surfaces a child aggregate's raised events as its own, by checking how `SubscriptionSettlementPlugin` bubbles up events raised by any aggregate it touches internally (if it constructs sub-aggregates at all — if it doesn't and raises events directly instead, mirror that simpler shape rather than assuming `captureDomainEvents()` is the right call here).
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnSettlementPluginTest' --testsuite=unit`

### Task 3: MonthlyAddOnCancellationPlugin
- **ACTION**: Create `Dicoding/Domain/Payment/Cancellation/Service/Plugins/MonthlyAddOnCancellationPlugin.php`.
- **IMPLEMENT**:
  ```php
  class MonthlyAddOnCancellationPlugin extends CancellationPlugin // confirm exact base class/namespace by checking SubscriptionCancellationPlugin's parent
  {
      public function __construct(
          private readonly MonthlyAddOnInvoiceStatusGateway $addOnInvoiceGateway,
          private readonly UserPointService $userPointService,
      ) {
      }

      public function run(Invoice $invoice): bool
      {
          $this->addOnInvoiceGateway->updateStatus($invoice->getEntityId(), InvoiceStatus::CANCELLED());

          if ($invoice->getFrontPayment() > 0) {
              $this->userPointService->updateUserPoint(
                  $invoice->getMemberId(),
                  $invoice->getFrontPayment(),
                  $invoice->getEntityId(),
                  PaymentInvoiceDomain::ADDON_REFUND()->getValue(), // confirm/add this enum case alongside SUBSCRIPTION_REFUND
              );
              $this->raise(new UserPointWasIncreased([/* mirror SubscriptionCancellationPlugin's exact payload shape */]));
              $this->raise(new MonthlyAddOnPaymentWasRefunded(/* new event, mirroring SubscriptionPaymentWasRefunded */));
          }

          return true;
      }
  }
  ```
- **MIRROR**: CANCELLATION_PLUGIN_PATTERN above — **exactly**, per ADR-0006's explicit instruction ("build `MonthlyAddOnCancellationPlugin`, matching existing precedent exactly").
- **GOTCHA**: `PaymentInvoiceDomain::ADDON_REFUND()` likely needs a new case added to whatever enum `PaymentInvoiceDomain::SUBSCRIPTION_REFUND()` belongs to — locate that enum (grep `PaymentInvoiceDomain` in `Dicoding/Domain/Payment/`) and add the case as part of this task, following its existing naming pattern exactly.
- **GOTCHA**: **Do not** add any call that touches `MonthlyAddOnGateway` for revocation, `PremiumFeatureService`, or any entitlement-bearing table in this plugin — the entire point of this task, per the PRD, is that cancellation does NOT revoke access. If a reviewer asks "shouldn't we revoke on cancel," the answer is "no, matches the platform-wide precedent, see ADR-0006."
- **VALIDATE**: `deck ai:test --filter='CancellingMonthlyAddOnPaymentTest' --testsuite=unit`

### Task 4: MonthlyAddOnInvoiceRepository (Phase 5 implementation)
- **ACTION**: Create `Dicoding/Infrastructure/Repositories/MonthlyAddOns/MonthlyAddOnInvoiceRepository.php`.
- **IMPLEMENT**: `createMonthlyAddOnInvoice(int $subscriberId, MonthlyAddOnType $addOnType): object` — creates a purchase-intent record (mirroring however `SubscriptionPurchaseRepository::createSubscriptionPurchase()` creates its pre-payment record and eventually surfaces an `Invoice` for the payment gateway) storing `subscriber_id` + `add_on_type`, and returns whatever object type the checkout flow (Phase 6) needs to redirect the user to a payment page. This record is what `MonthlyAddOnSettlementPlugin`/`MonthlyAddOnCancellationPlugin`'s lookup gateway (Task 2/3 GOTCHA) reads by `entity_id`.
- **MIRROR**: `Dicoding/Infrastructure/Repositories/Subscriptions/TrialRegistrationRepository.php` shape, adapted; trace the actual `SubscriptionPurchaseRepository` (not shown in this plan's research — locate it under `Dicoding/Infrastructure/Repositories/Subscriptions/`) for the exact invoice-creation call chain into the Payment bounded context, since that's the mechanism this method must reuse (creating a raw new one instead of reusing the existing invoice-creation entry point would duplicate payment-gateway integration code, which is explicitly against this codebase's existing pattern of one shared invoice-creation path per purchasable entity type).
- **GOTCHA**: This repository class has no interface — per `docs/guidelines/development/domain-layer.md`, the Domain-layer repository-interface pattern was removed codebase-wide. The gateway in Phase 3 already handles the contract.
- **VALIDATE**: `deck php vendor/bin/psalm.phar Dicoding/Infrastructure/Repositories/MonthlyAddOns`

### Task 5: Tests
- **ACTION**: Create the two test files listed in Files to Change.
- **MIRROR**: `SubscriptionSettlementPluginTest` / `CancellingSubscriptionPaymentTest` (both `BusinessCase`, Prophecy mocks).
- **VALIDATE**: both filters below.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Settlement grants entitlement on success | valid invoice for `student-chatbot` | `MonthlyAddOnGateway::save()` called once, invoice status updated to `VERIFIED`, returns `true` | No |
| Settlement rolls back and returns `false` on exception | gateway throws | DB transaction rolled back, returns `false` | Yes |
| Cancellation refunds points when `front_payment > 0` | invoice with `front_payment = 50000` | `UserPointService::updateUserPoint()` called once with `+50000`, `UserPointWasIncreased` + refund event raised | No |
| Cancellation skips refund when `front_payment = 0` | invoice with `front_payment = 0` | `updateUserPoint()` never called, no refund event raised | Yes — mirrors `SubscriptionCancellationPlugin`'s conditional exactly |
| Cancellation never touches entitlement/`PremiumFeatures` | any cancellation | no call to `MonthlyAddOnGateway` (for revocation) or `PremiumFeatureService` anywhere in the plugin | Yes — ADR-0006's explicit no-revocation invariant |

### Edge Cases Checklist
- [x] Settlement success path
- [x] Settlement failure/rollback path
- [x] Cancellation with and without a refundable front payment
- [x] No-revocation invariant explicitly asserted (a negative test — confirms a mock is *never* called)
- [ ] Maximum size input — N/A
- [x] Concurrent access — same DB-transaction wrapping as `SubscriptionSettlementPlugin` inherited as-is; addresses the concurrency risk flagged in Phase 3/4's plans for the settlement path specifically
- [ ] Network failure — out of scope (payment gateway webhook retry behavior is pre-existing platform infrastructure, not touched here)
- [ ] Permission denied — N/A, this runs server-side off a verified payment webhook, not user-facing

---

## Validation Commands

### Static Analysis
```bash
deck php vendor/bin/psalm.phar Dicoding/Domain/Common/Enums/Payments Dicoding/Domain/Payment/Settlement/Services/Plugins Dicoding/Domain/Payment/Cancellation/Service/Plugins Dicoding/Infrastructure/Repositories/MonthlyAddOns
```
EXPECT: Zero type errors

### Unit Tests
```bash
deck ai:test --filter='MonthlyAddOnSettlementPluginTest' --testsuite=unit
deck ai:test --filter='CancellingMonthlyAddOnPaymentTest' --testsuite=unit
```
EXPECT: All tests pass

### Full Test Suite
```bash
deck ai:test --testsuite=unit
```
EXPECT: No regressions in existing `InvoiceEntities`/`SettlementPluginFactory`/other-entity settlement or cancellation tests (adding an enum case must not break any exhaustive-`match`/`switch` over `InvoiceEntities` elsewhere in the codebase — grep for `InvoiceEntities::` usages in `match`/`switch` statements before merging and confirm none need an explicit new arm).

### Database Validation
N/A — this phase reuses the existing `Invoice`/payment tables; no new migration.

### Browser Validation
N/A — no UI in this phase.

### Manual Validation
- [ ] Confirm `SettlementPluginFactory` actually resolves `MonthlyAddOnSettlementPlugin` for `InvoiceEntities::MONTHLY_ADD_ON` by tracing the exact `Str::camel()` transform against the chosen enum value (Task 1 GOTCHA) — write this as a quick throwaway `php artisan tinker`-style check if `deck` exposes one, or as an explicit assertion in the unit test suite.
- [ ] Grep the codebase for any `match (true)`/`switch` over `InvoiceEntities` cases that might need an explicit `MONTHLY_ADD_ON` arm (e.g. admin dashboards listing invoice types).

---

## Acceptance Criteria
- [ ] All 5 tasks completed
- [ ] `deck php vendor/bin/psalm.phar` clean on all four touched directories
- [ ] Both new unit test files green
- [ ] Full unit suite green (no regressions from the new enum case)
- [ ] `MonthlyAddOnSettlementPlugin` resolves correctly through `SettlementPluginFactory`'s naming convention (verified, not assumed)

## Completion Checklist
- [ ] `MonthlyAddOnCancellationPlugin` matches `SubscriptionCancellationPlugin` structurally, one-for-one
- [ ] No entitlement revocation anywhere in the cancellation path
- [ ] Settlement plugin wrapped in a DB transaction, matching existing plugins
- [ ] No changes to `SettlementPluginFactory` itself
- [ ] No repository interfaces in Domain — plugins drive concrete `MonthlyAddOnGateway` directly per `docs/guidelines/development/domain-layer.md`
- [ ] Self-contained — the one open question (Task 1's exact enum-value-to-classname transform) is called out with a concrete verification step, not silently guessed

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Enum value choice doesn't produce the exact expected plugin class name through `SettlementPluginFactory`'s `Str::camel()` transform | Medium | High (silent failure — factory would throw a class-not-found or resolve to nothing) | Task 1's GOTCHA derives the exact value (`'monthly add on'`) from the transform mechanics directly and cites ADR-0007; still worth verifying against a second real example (`ACADEMY = 'academy payment'`'s actual plugin filename) before finalizing the `MONTHLY_ADD_ON` value; Manual Validation step re-confirms it. |
| `MonthlyAddOnInvoiceStatusGateway`-equivalent lookup (invoice entity_id → user_id + add_on_type) doesn't have an obvious existing analog to copy | Medium | Medium | Explicitly flagged in Task 2 GOTCHA #1 with instructions to trace `SubscriptionSettlementPlugin`'s equivalent lookup mechanism rather than invent a new one. |
| New `InvoiceEntities::MONTHLY_ADD_ON` case breaks an exhaustive `match`/`switch` elsewhere that enumerates all entity types | Low | Medium | Explicit grep step in Full Test Suite validation. |
| Repository interface pattern may linger in old code — tests might mock a now-nonexistent `MonthlyAddOnPurchaseRepositoryInterface` | Low | Medium | Audit test scaffolding; any mock of a removed interface should be replaced with a double of the concrete `MonthlyAddOnGateway` class instead. |

## Notes
This phase is the payment-integration seam — it's where `MonthlyAddOns` (Phase 1/3) meets the platform's existing, battle-tested settlement machinery. Resist adding anything add-on-specific to `SettlementPluginFactory` itself; the entire point of the existing convention-based design is that new entity types plug in without touching the factory.

Per ADR-0005, bundling an add-on purchase together with a subscription purchase in one checkout is explicitly OUT OF SCOPE for this phase (deferred to "next implementation"). Every invoice stays 1:1 with `PaymentTransaction` — separate checkouts for separate product types.

> Next step: Run `/prp-implement .claude/PRPs/plans/add-ons-05-checkout-settlement.plan.md`, then proceed to `add-ons-06-web-checkout.plan.md`.
