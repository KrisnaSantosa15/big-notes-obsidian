# ADR-0001: Where Should Daily Add-On Package Label Lookup Live?

- **Status:** Proposed
- **Date:** 12 August 2026

---

## Context

`app/config/daily_add_on_configs.php` is the only source of a purchased add-on's human-readable
identity — `label` (e.g. `"Learning with AI"`, `"Akses Sabak 30 Hari"`) and `receipt_item_name`
(e.g. `"Add-ons Fitur Sabak 30 Hari"`), keyed by `[add_on_type][packages][days]`. Nothing in the
`daily_add_on_purchases` or `payment_invoices` tables carries this text — only the raw
`add_on_type` string and `days` integer are persisted. Unlike `subscription_purchases`, which
`JOIN`s a real `subscriptions` DB table to get `name` in one SQL query, a daily-add-on's display
name can only be resolved in PHP, against the config array.

Three places already re-derive this exact lookup independently, each with its own shape and
failure-handling philosophy:

1. **`DailyAddOnInvoiceService::createInvoice()`** (`Dicoding/Domain/DailyAddOns/Services/`) —
   reads the full package array (`price` only, no label needed) to compute `points_to_pay`. Direct
   array access, no fallback: trusts `assertPackageIsConfigured()` (called earlier, at purchase
   time) already proved the combo exists.
2. **`PointEventMailer::whenPaymentWasVerified()`** (`Dicoding/Infrastructure/Emailing/Point/`) —
   reads `label` and `receipt_item_name` to build the receipt PDF description. Also trusts config
   directly (no `??` fallback) — deliberately, after a prior discussion concluded the failure mode
   (an uncaught `TypeError` if `string $description` received `null`) was an acceptable, rare risk
   given `assertPackageIsConfigured()`'s guarantee at purchase time.
3. **`MySubscriptionAction::getDailyAddOnPurchasesWithLabel()`** (`Dicoding/Web/Http/Subscriptions/Dashboards/`,
   added for the `/academies/subscriptions` transaction history) — reads `label` only, **with** a
   `?? $purchase->add_on_type` fallback, because this is a display-only context where a slightly
   degraded label is preferable to a crash.

A fourth, related-but-distinct class already exists: **`DailyAddOnPurchaseViewModel`**
(`Dicoding/Web/VM/DailyAddOns/`), used exclusively by the **checkout** page
(`DailyAddOnCheckoutIndexAction`). Its `loadAddOns()` builds the *entire* catalog — every
`add_on_type` with *all* of its packages — into typed objects, for rendering a package picker UI.
It is not scoped to resolving one specific `(add_on_type, days)` pair for an *already-made*
purchase, and reusing it for history/receipt purposes would misuse a class whose name and scope
are checkout-specific (confirmed: `SubscriptionPurchaseViewModel` follows the identical
"`Purchase`-suffixed VM = checkout-only" convention in this codebase).

A separate, unrelated `resolvePackage()` exists in PR #5542
(`PurchaseDailyAddOnSpecification`, not yet merged) — it hydrates a `DailyAddOnPackage`
ValueObject carrying `price` / `allow_point_payment` / `point_currency_conversion` for the
points-payment business logic that PR introduces. It has no `label` field and is a private,
non-reusable method. It solves a pricing/validation problem, not a display problem — not
applicable here.

---

## Decision Needed

Where should the shared "resolve a purchased package's display text from config" concern live,
if anywhere?

## Options Considered

**A. Leave it in the calling Action** (current state for `MySubscriptionAction`)

Keep `getDailyAddOnPurchasesWithLabel()` as a private method on the Action, matching how
`MySubscriptionAction` already does other display-shaping in place (e.g. its
`extra_package_with_no_address` `array_filter`). No new file, no new abstraction.

- *For:* Zero new code. Consistent with this specific Action's existing style — it uses no
  ViewModel at all today, for any of its other gateways either.
- *Against:* Does not address the fact that the same lookup is now duplicated a fourth time
  (Mailer, Domain Service, Action, and the checkout VM's `loadAddOns()`/`mapPackages()`).

**B. A new, dedicated ViewModel for history/receipt display**

E.g. `DailyAddOnPurchaseHistoryViewModel`, separate from the checkout-scoped
`DailyAddOnPurchaseViewModel`.

- *For:* "Correct" DDD layering — presentation-shaping belongs in `Web/VM`, not a Domain
  service or a controller Action.
- *Against:* **Yes, this duplicates `loadAddOns()`.** Both classes would independently walk the
  same `daily_add_on_configs` shape into near-identical package objects — one indexed by
  `[type]->packages[]` (checkout, needs *all* packages of *a* type), one needing a lookup by
  `(type, days)` (history/receipt, needs *one specific* package). Building a second VM without
  also sharing the underlying parsing just relocates the duplication instead of removing it — it
  would still need to solve the same problem Option C solves, just with an extra class in
  between.

**C. Extract a shared resolver/service** (e.g. `DailyAddOnPackageResolver`, `Dicoding/Domain/DailyAddOns/Services/`)

A small class with one method, `resolve(string $addOnType, int $days): ?array`, centralizing only
the raw config-path lookup. Each of the four call sites keeps its own post-processing and its own
choice of strictness on top:

```php
final class DailyAddOnPackageResolver
{
    public function __construct(private readonly ConfigRepository $config) {}

    public function resolve(string $addOnType, int $days): ?array
    {
        return $this->config->get('daily_add_on_configs')[$addOnType]['packages'][$days] ?? null;
    }
}
```

- Mailer / Domain Service keep trusting config (no behavior change: `resolve(...)['label']` on a
  `null` result still warns/`TypeError`s exactly as today).
- The history Action keeps its `?? $purchase->add_on_type` fallback on top of the call.
- `DailyAddOnPurchaseViewModel::mapPackages()` *could* call this per-package instead of reading
  `$package['label']` etc. directly, removing its share of the duplication too — though its
  "walk every package of every type" access pattern means it would still need its own iteration
  around the resolver, just no longer duplicating the *path*.
- *For:* Removes the actual duplicated logic (the config path), not just relocates it. Placing it
  in `Dicoding\Domain\DailyAddOns\Services` is precedented — `DailyAddOnInvoiceService` already
  injects `ConfigRepository` directly in that same namespace, and Domain services are legitimately
  consumable from Infrastructure and Web layers.
- *Against:* Touches two already-stable, unrelated files (`DailyAddOnInvoiceService`,
  `PointEventMailer`) if adopted everywhere, not just the history feature currently in progress —
  larger diff than strictly required for the history page alone.

---

## Leaning

Option C, but scoped incrementally: introduce `DailyAddOnPackageResolver` and wire it into
`MySubscriptionAction` now (replacing the private method), without touching
`DailyAddOnInvoiceService` / `PointEventMailer` / `DailyAddOnPurchaseViewModel` in the same
change. Migrating the other three call sites to the shared resolver is worth doing but is a
separate, larger refactor across stable files, not a side effect of shipping the history page.

Not yet decided — recorded here so the trade-off is written down once instead of re-derived on
the next call site.
