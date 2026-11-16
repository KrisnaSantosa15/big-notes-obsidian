---
date: 2026-10-13
updated: 2026-10-13
type: spec
tags: [spec, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Add-Ons — Post-Payment Follow-Ups (Email, Redirect, History)

Implementation plan for three gaps raised in code review of the `feature/monthly-add-ons/upgrade-modal-ui`
PR (2026-08-06): the purchase flow itself works end-to-end, but three post-payment concerns are
unaddressed. None of the three were in scope of the original 6-phase PRD (`../prd.md`) — this is
follow-up work, sequenced as three more phases on top of it.

**Naming caveat:** this domain's PRD/`context.md`/ADR-0001–0006 describe the bounded context as
`MonthlyAddOns` (fixed 1-month cycle, no `days` parameter). The domain later pivoted Monthly → Daily
(see `../../../handoffs/monthly-add-ons/purchase-replan.md`) — the actual code today is
`Dicoding\Domain\DailyAddOns\...`, `DailyAddOnType`, `InvoiceEntities::DAILY_ADD_ON`,
`app/config/daily_add_on_configs.php` with per-`days` `packages`. This doc uses the **current, real**
naming throughout. The older docs in this folder have not been updated to reflect the pivot — treat
them as historical record of the pre-pivot design, not a live source of truth for class names.

## Current state (as-is)

| Concern | What happens today |
|---|---|
| Email invoice | Nothing. `DailyAddOnEventListener::whenDailyAddOnPurchaseWasCompletelyPaid()` only calls `PremiumFeature::enrollUser()`. `PointEventMailer::whenPaymentWasVerified()` branches on entity type but has no `DAILY_ADD_ON` case, so any invoice-verified mail for this entity silently falls through to the legacy point template path. |
| Post-payment redirect | Falls through to the generic `dashboard` route — `CreateXenditDirectRedirecationUrlSpecification::getDirectRedirectionUrl()` has no `DAILY_ADD_ON` branch. |
| Payment status / history | No mechanism at all. `daily_add_on_purchases` has no query joining `payment_invoices` (unlike `SubscriptionGateway::getAllSubscriptionPurchasesByMember()`), and there's no route/page. |

No migration is needed for any of the three — `DailyAddOnInvoiceService::createInvoice()` already writes
`entity = InvoiceEntities::DAILY_ADD_ON()` and `entity_id = $purchaseId` onto `payment_invoices`
(`Dicoding/Domain/DailyAddOns/Services/DailyAddOnInvoiceService.php:58-63`), so the join key already exists.

## Phase 7 — Invoice email

**Files:**

| File | Action |
|---|---|
| `Dicoding/Infrastructure/Emailing/Point/PointEventMailer.php` | UPDATE — add `InvoiceEntities::DAILY_ADD_ON()` branch in `whenPaymentWasVerified()` |
| `app/views/emails/dailyaddons/PaymentDailyAddOnWasVerified.blade.php` | CREATE |

**Pattern to mirror** — the existing `SUBSCRIPTION` branch (`PointEventMailer.php:267-286`):

```php
if ($invoice->getEntity()?->is(InvoiceEntities::DAILY_ADD_ON())) {
    $purchase = $this->dailyAddOnGateway->findPurchaseById($invoice->getEntityId());
    $addOnLabel = $this->config->get('daily_add_on_configs')[$purchase->add_on_type]['packages'][$purchase->days]['label']
        ?? $purchase->add_on_type;

    $this->sendMail(
        $invoice->getMemberName(),
        $invoice->getMemberEmail(),
        'Pembayaran Anda Telah Terverifikasi',
        'emails.dailyaddons.PaymentDailyAddOnWasVerified',
        [
            'invoiceId' => $invoice->getInvoiceToken(),
            'purchaserName' => $invoice->getMemberName(),
            'totalInCurrency' => 'Rp' . \Str::numberFormat($invoice->getPointsToPayInCurrency(), thousands_separator: '.'),
            'addOnPackage' => $addOnLabel,
        ]
    );
    $job->delete();
    return;
}
```

- `DailyAddOnGateway` needs to be injected into `PointEventMailer`'s constructor (it isn't today) — one new
  constructor param.
- No PDF receipt attachment unless product wants one; the subscription branch generates one via
  `createPDFReceiptForSubscription()` (`PointEventMailer.php:111-...`) — reuse that helper's *shape* only if
  a receipt PDF is actually wanted, otherwise skip it (subscription's is print-formatted for a legal
  receipt; add-ons may not need that weight).
- Template: copy `app/views/emails/membersubscriptions/PaymentSubscriptionWasVerified.blade.php`'s
  structure (base-v2 layout), swap "Paket Langganan" copy for the add-on's label. Do **not** copy
  `emails/point/PaymentWasVerified.blade.php` — that's the legacy template being replaced.

**Validate:** `deck ai:psalm Dicoding/Infrastructure/Emailing/Point` + a unit/integration test asserting the
`DAILY_ADD_ON` branch calls `sendMail` with the new template name (mirror however the existing
`SUBSCRIPTION` branch is tested, if it is).

## Phase 8 — Post-payment redirect

**Files:**

| File | Action |
|---|---|
| `Dicoding/UseCases/WebIntegrations/CreateXenditDirectRedirecationUrlSpecification.php` | UPDATE |

**Decision needed before implementing** (product/reviewer call, not a code question):

- **Option A — back to the last learning page.** Mirrors the existing `subscribe_from_classroom` session
  pattern (`CreateXenditDirectRedirecationUrlSpecification.php:68-74`): whatever screen/modal triggers an
  add-on checkout (`upgrade-premium-modal.blade.php` / `sabak-modal.blade.php`) stashes
  `Session::put('addon_purchase_from_tutorial_id', ...)` before redirecting to checkout; the spec reads and
  pulls it back here. Needs one small edit to the modal's trigger action in addition to the spec.
- **Option B — to the add-on payment list.** `return $this->dicodingRoute->route('daily_add_ons.my');` —
  zero extra files, but only works once Phase 9 exists (the route doesn't exist yet).

Recommend building **Phase 9 first**, then wiring Option B here — it's the smaller diff and gives users a
durable place to land regardless of which page they purchased from. Option A can be layered in later as a
"smarter" enhancement if product still wants it.

```php
if (InvoiceEntities::DAILY_ADD_ON()->equals($invoice->getEntity())) {
    return $this->dicodingRoute->route('daily_add_ons.my');
}
```

Insert this branch before the `dashboard` default (currently line 105).

**Validate:** `deck ai:psalm Dicoding/UseCases/WebIntegrations` + extend the existing
`CreateXenditDirectRedirectionUrlTest` (referenced at the top of the spec file's docblock) with a
`DAILY_ADD_ON` case.

## Phase 9 — Payment status & transaction history

**Files:**

| File | Action |
|---|---|
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnGateway.php` | UPDATE — add `getAllPurchasesByMember(int $userId): array` |
| `Dicoding/Web/Http/DailyAddOns/Dashboards/MyDailyAddOnAction.php` | CREATE |
| `Dicoding/Web/Http/DailyAddOns/Dashboards/MyDailyAddOnResponse.php` | CREATE |
| `app/views/ui/.../daily-add-ons/my.blade.php` (exact path TBD — mirror wherever `subscriptions/my` lives) | CREATE |
| `app/routes.php` | UPDATE — new `GET /daily-add-ons/purchases` as `daily_add_ons.my` |

**Gateway method** — mirrors `SubscriptionGateway::getAllSubscriptionPurchasesByMember()`
(`Dicoding/Infrastructure/StorageGateways/Subscriptions/SubscriptionGateway.php:436-454`):

```php
public function getAllPurchasesByMember(int $userId): array
{
    return $this->db->table(self::DAILY_ADD_ON_PURCHASES_TABLE)
        ->selectRaw(<<<SELECT
daily_add_on_purchases.*,
payment_invoices.id as invoice_id, payment_invoices.invoice_token,
payment_invoices.status, payment_invoices.points, payment_invoices.currency
SELECT)
        ->leftJoin('payment_invoices', function (JoinClause $join) {
            $join->on('payment_invoices.entity_id', '=', 'daily_add_on_purchases.id')
                ->where('payment_invoices.entity', '=', InvoiceEntities::DAILY_ADD_ON()->getValue());
        })
        ->where('user_id', $userId)
        ->orderByDesc('daily_add_on_purchases.created_at')
        ->get();
}
```

Confirm the exact `entity` string stored on `payment_invoices` matches `InvoiceEntities::DAILY_ADD_ON()`'s
value (per ADR-0007's amendment, this should be `'daily add on'`) before hardcoding the join condition.

**Action/Response**: follow `MySubscriptionAction`/`MySubscriptionResponse`
(`Dicoding/Web/Http/Subscriptions/Dashboards/`) — much smaller since there's only one gateway call, not
the five `MySubscriptionAction` makes. View just needs a table: package label, days, price, status
(from `payment_invoices.status`), purchase date, invoice token.

**Validate:** `deck ai:psalm Dicoding/Infrastructure/StorageGateways/DailyAddOns
Dicoding/Web/Http/DailyAddOns` + one new integration test hitting the route as an authenticated user with
existing purchases, asserting the response contains the expected rows.

## Suggested build order

**9 → 8 → 7**, or 7 in parallel with 9 (no file overlap between them). 8 depends on 9 only if Option B is
picked for the redirect target; if Option A is picked instead, 7/8/9 are fully independent and can ship in
any order or as separate small PRs.

## Out of scope

- Any change to `PremiumFeatures`' entitlement/eligibility logic (same boundary the original PRD drew).
- Backfilling a history view for the two "next steps" PRs (#5344, #5361) mentioned in the handoff doc if
  they land with different intermediate shapes — this plan targets whatever `DailyAddOnGateway` and
  `payment_invoices` actually look like once `upgrade-modal-ui` merges, not any older parked branch state.
- Reconciling the stale `Monthly`-naming docs in this folder with the current `Daily` code — flagged above,
  not fixed here.
