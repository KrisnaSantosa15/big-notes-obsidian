---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "Aggregate-raised domain events are never auto-dispatched outside a UseCase Command Bus flow"
tags: [adr, decision, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Aggregate-raised domain events are never auto-dispatched outside a UseCase Command Bus flow

`DailyAddOnEntitlement::grant(int $days)` (`Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnEntitlement.php:22`) raises `DailyAddOnPurchaseWasCompletelyPaid` via `$this->raise(...)`. `raise()` (from `Laracasts\Commander\Events\EventGenerator`, used through `Dicoding\Domain\Common\EventRaisableObject`) only buffers the event into the aggregate's internal `pendingEvents()` array — it never touches Laravel's event dispatcher. The event only reaches listeners (`DailyAddOnEventMailer`, `DailyAddOnEventListener`) once something explicitly does:

```php
$dispatcher->dispatch($entitlement->releaseEvents());
```

On the normal Sabak/Student-Chatbot purchase flow this happens for free: `grant()` is called from inside a `UseCaseSpecification` (e.g. `GrantDailyAddOnEntitlementSpecification`), and `Dicoding/UseCases/Contracts/UseCase.php:290-298` (`dispatchAnyEvents()`) automatically calls `releaseEvents()` + dispatch after every Specification runs through the Command Bus. Nothing about `grant()` itself hints that this step is required — it's a property of *how the aggregate is invoked*, not of the aggregate.

## Bug this caused

Bundling Sabak into the Plus subscription (`SubscriptionsEventListener::whenMemberWasSubscribed()`) called `grant()` + `save()` directly on the aggregate, bypassing the Command Bus entirely. Result:

- `current_add_ons` updated correctly — `save()` writes straight to the gateway (`upsertExpiry()`), a plain DB write with no event involved.
- The activation email ("Selamat, Add-on ... Anda telah aktif") **never sent** — confirmed empty via Mailcatcher.
- The `sabak` row in `premium_feature_users` **never refreshed** — confirmed via direct MySQL query: `updated_at` stayed pinned to an earlier standalone purchase instead of the new subscription.

All three side effects are wired to the same event, and that event was never released.

## Fix

Inject `Laracasts\Commander\Events\EventDispatcher` (the exact dispatcher `UseCase.php:298` uses) and call it manually after `save()`:

```php
$entitlement->grant(30);
$this->dailyAddOnEntitlementRepository->save($entitlement);
$this->eventDispatcher->dispatch($entitlement->releaseEvents());
```

## Generalization

Not specific to `DailyAddOnEntitlement`. Any aggregate that gets `raise()`-called outside `UseCase::run($specification, ...)` needs this same manual `releaseEvents()` + dispatch, or its events silently vanish when the object goes out of scope — no error, no visible failure. Check this before reusing any aggregate method from outside a Specification.
