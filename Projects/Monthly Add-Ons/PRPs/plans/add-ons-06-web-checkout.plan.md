---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, prp, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Plan: Add-Ons — Phase 6: Web/Checkout UI

## Summary

Add `MonthlyAddOnPurchaseViewModel` + a rendered "Add-Ons" section into the existing `/subscriptions/purchases` Blade page, and `MonthlyAddOnPurchaseStoreAction` (POST, delegates to Phase 2's `PurchaseMonthlyAddOnSpecification`) + its route. `SubscriptionPurchaseCreateAction`/`SubscriptionPurchaseViewModel` are extended only enough to also pass the add-on ViewModel into the same view — `SubscriptionPurchaseViewModel` itself stays scoped to Plus/Learning Path only, per the PRD's discovery-surface decision.

## User Story

As a logged-in user browsing `/subscriptions/purchases`, I want to see and buy Sabak or Learning-with-AI add-ons alongside the existing subscription plans, so I don't need a separate page or flow to purchase them.

## Problem → Solution

The purchases page today only renders subscription widgets (`app/views/ui/v3/subscriptions/purchases/index.blade.php`'s `@include('ui.v3.subscriptions.purchases.widgets.subscriptions')`); there is no add-on widget or submission path. → Add a sibling widget include backed by a new `MonthlyAddOnPurchaseViewModel`, and a new POST route/Action that calls Phase 2's use case — exactly the "separate checkout backend, shared page" shape the PRD's decisions.md already settled on.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `../../../docs/domains/daily-add-ons/prd.md` (Phase 6 of 6, final)
- **PRD Phase**: Web/checkout UI
- **Estimated Files**: 6 (ViewModel, Action, Blade widget, route registration, 1 Blade include-point edit, 1 integration test)

---

## UX Design

### Before
```
┌───────────────────────────────────────────┐
│  /subscriptions/purchases                  │
│  - Promo banner                            │
│  - Learning Path package selector          │
│  - Plus subscription package selector      │
│  - Single Course CTA                       │
│  - Testimonies / FAQ                       │
│  (no add-ons anywhere)                     │
└───────────────────────────────────────────┘
```

### After
```
┌───────────────────────────────────────────┐
│  /subscriptions/purchases                  │
│  - Promo banner                            │
│  - Learning Path package selector          │
│  - Plus subscription package selector      │
│  - Single Course CTA                       │
│  - NEW: Add-Ons section                    │
│      · Sabak — Rp 250,000/mo  [Buy]        │
│      · Learning with AI — Rp 50,000/mo [Buy]│
│  - Testimonies / FAQ                       │
└───────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| `/subscriptions/purchases` page | No add-on content | New "Add-Ons" widget section, positioned after the existing subscription packages widget, before testimonies | Matches PRD's "renders into the existing page" decision |
| Buy button per add-on | N/A | POSTs to `add_ons.purchases.store`, redirects to payment page on success (mirrors `subscriptions.purchases.store`'s redirect behavior) | New route |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `Dicoding/Web/Http/Subscriptions/Transactions/SubscriptionPurchaseCreateAction.php` | full | The exact Action pattern: thin, injects a ViewModel, wraps in try/catch dispatching to `payloadFactory`. This phase's `MonthlyAddOnPurchaseStoreAction` (POST) additionally delegates to a UseCase — see the GOTCHA below on the difference between this GET action (view-rendering only) and the POST action this phase adds. |
| P0 | `Dicoding/Web/VM/Subscriptions/SubscriptionPurchaseViewModel.php` | full | ViewModel pattern to mirror: constructor-injected gateways/repositories, lazy-caching getters exposed to Blade. |
| P0 | `app/views/ui/v3/subscriptions/purchases/index.blade.php` | full | The page this phase inserts a new `@include` into — locate the exact line between the subscriptions widget (`@include('ui.v3.subscriptions.purchases.widgets.subscriptions')`) and the testimonies widget to insert the new add-ons widget include. |
| P0 | `app/views/ui/v3/subscriptions/purchases/widgets/subscriptions.blade.php` | full (214 lines) | Structural/markup pattern to mirror for the new `widgets/add_ons.blade.php` — package-selector-and-price-pill shape, CSS class conventions, `data-*` attributes the existing `resources/components/subscriptionpurchases/script.js` reads. |
| P1 | `app/routes.php` | around 979-982 (`subscriptions.purchases.create`), around 3889-3892 (`subscriptions.purchases.store`) | Route registration pattern: `Route::get(...)`/`Route::post(...)` with `'as' => ..., 'uses' => 'Namespace\Class@method'`. |
| P1 | `Dicoding/Web/HttpStatus/PayloadResponseStatus.php` | full | How a failure `PayloadInterface` maps to an HTTP status code — used identically by the new `MonthlyAddOnPurchaseStoreAction`. |
| P1 | `Dicoding/UseCases/MonthlyAddOns/Transactions/PurchaseMonthlyAddOnSpecification.php` (Phase 2) | full | The use case `MonthlyAddOnPurchaseStoreAction` delegates to. Input shape: `subscriber_id`, `add_on_type`. |
| P1 | `app/config/add_on_configs.php` (Phase 3/4) | full | Source of the price/product list the new ViewModel reads to render each add-on's card (price, and by extension which `MonthlyAddOnType` values exist) — **do not hardcode the two products' prices in the ViewModel or Blade**, read them from this config so a future third add-on needs no template change beyond the config entry. |
| P2 | `app/tests/IntegrationTests/Specifications/Subscriptions/Registrations/RegisterToTrialSubscriptionIntegrationTest.php` | full | HTTP-level integration test pattern: `$this->be(DicodingUser::find(...))`, `$this->post(route(...))`, DB/response assertions. |

## External Documentation

No external research needed.

---

## Patterns to Mirror

### THIN_ACTION_PATTERN (GET, view-rendering)
// SOURCE: Dicoding/Web/Http/Subscriptions/Transactions/SubscriptionPurchaseCreateAction.php
```php
class SubscriptionPurchaseCreateAction extends BaseController
{
    public function __construct(
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly ActivityReportInterface $activityReport,
        private readonly SubscriptionPurchaseViewModel $viewModel,
    ) {
        parent::__construct();
    }

    public function action(): PayloadInterface
    {
        Vite::enable();
        try {
            return $this->payloadFactory->withSuccessfulPayload(['viewModel' => $this->viewModel]);
        } catch (InvariantException $exception) {
            return $this->payloadFactory->withInvariantExceptionPayload($exception);
        } catch (Exception $exception) {
            $this->activityReport->reportError($exception);
            return $this->payloadFactory->withExceptionPayload($exception);
        }
    }
}
```

### VIEWMODEL_PATTERN
// SOURCE: Dicoding/Web/VM/Subscriptions/SubscriptionPurchaseViewModel.php
```php
class SubscriptionPurchaseViewModel implements ViewModel
{
    private ?array $cachedSomething = null;

    public function __construct(
        private readonly SomeGateway $gateway,
    ) {
    }

    public function getSomething(): array
    {
        if ($this->cachedSomething === null) {
            $this->cachedSomething = /* compute from gateway */;
        }
        return $this->cachedSomething;
    }
}
```

### ROUTE_REGISTRATION_PATTERN
// SOURCE: app/routes.php (subscriptions.purchases.create / .store)
```php
Route::get('subscriptions/purchases', [
    'as' => 'subscriptions.purchases.create',
    'uses' => 'Dicoding\Web\Http\Subscriptions\Transactions\SubscriptionPurchaseCreateAction@action',
]);

Route::post('subscriptions/purchases', [
    'as' => 'subscriptions.purchases.store',
    'uses' => 'Dicoding\Web\Http\Subscriptions\Transactions\SubscriptionPurchaseStoreAction@action',
]);
```

**Legacy pattern vs. documented convention:** the sibling routes above use a plain `'uses' => 'FQCN@action'` string and an `action()` method. `docs/guidelines/development/web-layer.md`'s Route Rules document a different, newer convention for all new code: `'uses' => \Dicoding\Web\Http\X\Action::class` (inline FQCN with `::class`, no `use` import for the Action class in the route file) paired with `public function __invoke(): JsonResponse` on the Action. Since this plan is **new** code, `MonthlyAddOnPurchaseStoreAction` and its route registration (Task 4) follow the documented `::class`/`__invoke()` convention, not the older `@action` string style shown above — even though it renders into the same Blade page as the legacy-style sibling. The two coexisting on one page is fine; they're independent routes with independent Actions, and new code should match the current documented standard rather than propagate a pattern predating it.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `Dicoding/Web/VM/MonthlyAddOns/MonthlyAddOnPurchaseViewModel.php` | CREATE | `getAvailableAddOns(): array` reads `add_on_configs.php`, returns each add-on's display data (name, price, `MonthlyAddOnType` value) for the Blade widget. |
| `Dicoding/Web/Http/MonthlyAddOns/Transactions/MonthlyAddOnPurchaseStoreAction.php` | CREATE | POST action: validates the authenticated user, delegates to `PurchaseMonthlyAddOnSpecification` (Phase 2), redirects to the resulting invoice's payment page on success (mirror `SubscriptionPurchaseStoreAction`'s redirect target — locate that file to confirm the exact redirect helper/route it uses). |
| `Dicoding/Web/Http/Subscriptions/Transactions/SubscriptionPurchaseCreateAction.php` | UPDATE | Inject `MonthlyAddOnPurchaseViewModel` alongside the existing `SubscriptionPurchaseViewModel` and pass both to the view payload (e.g. `'addOnViewModel' => $this->addOnViewModel`). This is the only change to an existing Subscriptions file in this entire PRD — a one-line-of-intent addition, not a rewrite. |
| `app/views/ui/v3/subscriptions/purchases/index.blade.php` | UPDATE | Insert `@include('ui.v3.subscriptions.purchases.widgets.addons')` between the subscriptions widget include and the testimonies widget include. |
| `app/views/ui/v3/subscriptions/purchases/widgets/add_ons.blade.php` | CREATE | Renders `$addOnViewModel->getAvailableAddOns()` as a card/list with a "Buy" button per add-on, each submitting a form (or JS-driven POST) to `route('add_ons.purchases.store')` with the chosen `add_on_type`. |
| `app/routes.php` | UPDATE | Add `Route::post('addons/purchases', ['as' => 'add_ons.purchases.store', 'uses' => \Dicoding\Web\Http\MonthlyAddOns\Transactions\MonthlyAddOnPurchaseStoreAction::class])` near the existing `subscriptions.purchases.store` registration — `::class`, not a string, and no `use` import for the Action, per `web-layer.md`'s Route Rules. |
| `app/tests/IntegrationTests/Specifications/MonthlyAddOns/MonthlyAddOnPurchaseStoreActionTest.php` | CREATE | HTTP-level integration test (see Testing Strategy). |

## NOT Building

- A dedicated `/add-ons/purchases` GET page — add-ons render into the existing subscriptions purchases page only, per the PRD's discovery-surface decision. No new standalone route for viewing.
- Any JSON/API (`Dicoding/Web/Api/V1/`) endpoint for add-on purchase — the existing subscription purchase flow is purely server-rendered form POST, and this phase matches that, not the JSON-API style used for flash-sale/referral endpoints.
- Any promo/discount code UI on the add-ons widget (out of scope per PRD).
- Any change to `SubscriptionPurchaseViewModel` itself — it must remain scoped to Plus/Learning Path only, per the PRD's explicit decision. Only the Action that constructs both ViewModels changes.
- New Vite frontend bundle/entry unless the existing `subscription-purchases` Vite page's `index.ts` cannot be extended with a small add-ons form handler — reuse the existing bundle first (ladder: don't add a new entry point for a "Buy" button that can be a plain form POST or a few lines added to the existing page script).

---

## Step-by-Step Tasks

### Task 1: MonthlyAddOnPurchaseViewModel
- **ACTION**: Create `Dicoding/Web/VM/MonthlyAddOns/MonthlyAddOnPurchaseViewModel.php`.
- **IMPLEMENT**:
  ```php
  class MonthlyAddOnPurchaseViewModel implements ViewModel
  {
      private ?array $availableAddOns = null;

      public function getAvailableAddOns(): array
      {
          if ($this->availableAddons === null) {
              $this->availableAddons = collect(config('add_on_configs'))
                  ->map(fn ($config, $addonType) => (object) [
                      'type' => $addonType,
                      'price' => $config['price'],
                      'daily_limit' => $config['daily_limit'],
                  ])
                  ->values()
                  ->all();
          }
          return $this->availableAddons;
      }
  }
  ```
- **MIRROR**: VIEWMODEL_PATTERN above.
- **GOTCHA**: Confirm whether `config('add_on_configs')` is how `app/config/add_on_configs.php` is actually loaded elsewhere in this codebase (Laravel 4.2's config loading may differ from modern Laravel — check how `premium_feature_configs.php` is read, e.g. in `PremiumFeatureRepository::getConfig()`, and use the exact same mechanism here for consistency, not a guessed `config()` helper call).
- **VALIDATE**: `deck php vendor/bin/psalm.phar Dicoding/Web/VM/MonthlyAddOns`

### Task 2: MonthlyAddOnPurchaseStoreAction
- **ACTION**: Create `Dicoding/Web/Http/MonthlyAddOns/Transactions/MonthlyAddOnPurchaseStoreAction.php`.
- **IMPLEMENT**:
  ```php
  class MonthlyAddOnPurchaseStoreAction extends BaseController
  {
      public function __construct(
          private readonly PayloadFactoryInterface $payloadFactory,
          private readonly ActivityReportInterface $activityReport,
      ) {
          parent::__construct();
          $this->beforeFilter('auth');
          $this->beforeFilter('csrf');
      }

      public function __invoke(): PayloadInterface
      {
          try {
              $payload = ExecuteSpecification::execute(PurchaseMonthlyAddOnSpecification::class, [
                  'subscriber_id' => Auth::id(),
                  'add_on_type' => Request::input('add_on_type'),
              ]);
              return $payload; // mirror SubscriptionPurchaseStoreAction's exact redirect/response shape once located
          } catch (InvariantException $exception) {
              return $this->payloadFactory->withInvariantExceptionPayload($exception);
          } catch (Exception $exception) {
              $this->activityReport->reportError($exception);
              return $this->payloadFactory->withExceptionPayload($exception);
          }
      }
  }
  ```
- **MIRROR**: THIN_ACTION_PATTERN above, adapted for POST + UseCase delegation (per CLAUDE.md: "Actions must be thin — delegate to UseCases immediately"). Uses `__invoke()` (not `action()`) and will be wired via `'uses' => \FQCN::class` (Task 4) per `web-layer.md`'s documented Action/Route Pattern — see the note after ROUTE_REGISTRATION_PATTERN above for why this diverges from the legacy sibling routes it renders alongside.
- **GOTCHA #1**: `beforeFilter('auth')` + `beforeFilter('csrf')` in the constructor are not optional here — `web-layer.md`'s Rules require `auth` on any endpoint that requires authentication and `csrf` on any state-changing POST from a form, and an add-on purchase must not be reachable by a guest. Confirm the exact filter names/aliases against `subscriptions.purchases.store`'s actual middleware before finalizing, but do not ship this Action without an explicit auth guard.
- **GOTCHA #2**: This plan's sketch returns the spec's raw payload — **before implementing, locate `SubscriptionPurchaseStoreAction`** (referenced but not read in this PRD's research; grep `Dicoding/Web/Http/Subscriptions/Transactions/`) and copy its exact success-path response shape (likely a redirect to a payment/checkout page derived from the created invoice, not a bare JSON payload — this is a server-rendered flow, not an API). Do not invent a different response contract for add-ons than what subscriptions already do for the same "invoice created, redirect to pay" step.
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnPurchaseStoreActionTest' --testsuite=integration`

### Task 3: Wire into SubscriptionPurchaseCreateAction + Blade
- **ACTION**: Update `Dicoding/Web/Http/Subscriptions/Transactions/SubscriptionPurchaseCreateAction.php`, `app/views/ui/v3/subscriptions/purchases/index.blade.php`, create `app/views/ui/v3/subscriptions/purchases/widgets/add_ons.blade.php`.
- **IMPLEMENT**: Add `private readonly MonthlyAddOnPurchaseViewModel $addOnViewModel` to the Action's constructor; add `'addOnViewModel' => $this->addOnViewModel` to the successful payload array. In the Blade page, insert the new widget include after the subscriptions widget:
  ```blade
  @include('ui.v3.subscriptions.purchases.widgets.subscriptions')
  @include('ui.v3.subscriptions.purchases.widgets.addons')
  @include('ui.v3.subscriptions.purchases.widgets.testimonies')
  ```
  In `widgets/add_ons.blade.php`, loop `$addOnViewModel->getAvailableAddOns()` rendering a card + a form posting to `route('add_ons.purchases.store')` per add-on, mirroring `widgets/subscriptions.blade.php`'s markup/CSS conventions closely enough that it looks native to the page, not bolted on.
- **MIRROR**: `widgets/subscriptions.blade.php`'s card/price-pill structure.
- **GOTCHA**: This is the **only** edit to `SubscriptionPurchaseCreateAction.php` and `SubscriptionPurchaseViewModel` stays completely untouched — confirm the diff on this task touches exactly the constructor and the returned array, nothing in `SubscriptionPurchaseViewModel.php` itself, per the PRD's explicit "`SubscriptionPurchaseViewModel` stays scoped to Plus/Learning Path only" decision.
- **VALIDATE**: manual browser check (see Manual Validation) + Task 4's integration test.

### Task 4: Route + integration test
- **ACTION**: Add the route in `app/routes.php`; create `app/tests/IntegrationTests/Specifications/MonthlyAddOns/MonthlyAddOnPurchaseStoreActionTest.php`.
- **IMPLEMENT**:
  ```php
  Route::post('addons/purchases', [
      'as' => 'add_ons.purchases.store',
      'uses' => \Dicoding\Web\Http\MonthlyAddOns\Transactions\MonthlyAddOnPurchaseStoreAction::class,
  ]);
  ```
  POST only — no GET route for add-ons per NOT Building. Test: authenticate a user, POST to `route('add_ons.purchases.store')` with a valid `add_on_type`, assert the response/redirect and that an invoice row exists (via whatever assertion `RegisterToTrialSubscriptionIntegrationTest`-style tests use for DB state).
- **MIRROR**: `web-layer.md`'s Route Rules (`::class`, no `use` import, never grouped under `'namespace'`) — **not** the legacy `'FQCN@action'` string style the sibling `subscriptions.purchases.*` routes use; see the note under ROUTE_REGISTRATION_PATTERN. TEST_STRUCTURE from earlier phases (`IntegrationTest`, `$this->be(...)`, `$this->post(route(...))`).
- **VALIDATE**: `deck ai:test --filter='MonthlyAddOnPurchaseStoreActionTest' --testsuite=integration`

---

## Testing Strategy

### Integration Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Authenticated purchase request | valid `add_on_type`, logged-in user | Invoice created, response redirects to payment page (or whatever `SubscriptionPurchaseStoreAction`'s equivalent success shape is) | No |
| Guest attempts purchase | no authenticated session | Redirected to login / 401, no invoice created | Yes — auth guard |
| Invalid `add_on_type` | `add_on_type: 'bogus'` | Validation-failure response (bubbles up from Phase 2's `PurchaseMonthlyAddOnSpecification`), no invoice created | Yes |
| GET `/add-ons/purchases` (no such route) | — | 404 — confirms this phase deliberately did not add a standalone GET route | Yes — scope guard |

### Edge Cases Checklist
- [x] Guest/unauthenticated request
- [x] Invalid add_on_type
- [x] Confirms no standalone GET route exists (scope guard)
- [ ] Maximum size input — N/A
- [ ] Concurrent access — N/A at this layer (handled upstream in Phase 4/5)
- [ ] Network failure — N/A, payment gateway redirect is pre-existing infrastructure
- [ ] Permission denied — covered by the guest-request test above

---

## Validation Commands

### Static Analysis
```bash
deck php vendor/bin/psalm.phar Dicoding/Web/VM/MonthlyAddOns Dicoding/Web/Http/MonthlyAddOns
```
EXPECT: Zero type errors

### Unit Tests
```bash
deck ai:test --filter='MonthlyAddOnPurchaseStoreActionTest' --testsuite=integration
```
EXPECT: All tests pass

### Full Test Suite
```bash
deck ai:test --testsuite=integration
```
EXPECT: No regressions on the existing `subscriptions.purchases.create`/`.store` routes (confirms `SubscriptionPurchaseCreateAction`'s edit in Task 3 didn't break the subscriptions widget rendering).

### Database Validation
N/A — no new migration in this phase.

### Browser Validation
```bash
# start the dev server per this repo's existing workflow (see docs/README.md's "Working on the Docs Site" analog for the app itself, or the project's standard local-dev command)
```
EXPECT: Visiting `/subscriptions/purchases` as a logged-in user shows the new Add-Ons section with both products' prices from `add_on_configs.php`, and clicking "Buy" submits to `add_ons.purchases.store` and redirects toward payment.

### Manual Validation
- [ ] Visit `/subscriptions/purchases` logged in and logged out — confirm the Add-Ons section renders in both cases (browsing is public, purchase is gated) or exactly matches whatever visibility rule the existing subscriptions widgets use.
- [ ] Confirm `SubscriptionPurchaseViewModel.php`'s diff is empty (git diff shows zero changes to that file).
- [ ] Confirm the Vite bundle for `subscription-purchases` still builds if the widget's markup needs any script hook (per NOT Building, prefer plain form POST over adding JS — verify this is sufficient before reaching for a script change).

---

## Acceptance Criteria
- [ ] All 4 tasks completed
- [ ] `deck php vendor/bin/psalm.phar` clean on both new directories
- [ ] `MonthlyAddOnPurchaseStoreActionTest` green
- [ ] Full integration suite green (no regression on the subscriptions purchases page)
- [ ] Manual browser check confirms the Add-Ons section renders and submits correctly
- [ ] PRD's top-level acceptance criterion satisfied: "A user can purchase Sabak or Learning-with-AI independently of any subscription, via `/subscriptions/purchases`."

## Completion Checklist
- [ ] Action stays thin, delegates immediately to `PurchaseMonthlyAddOnSpecification`
- [ ] `SubscriptionPurchaseViewModel` untouched
- [ ] No new GET route/page for add-ons
- [ ] No new JSON/API endpoint added
- [ ] Prices/products read from `add_on_configs.php`, never hardcoded in the ViewModel or Blade
- [ ] Tests follow `IntegrationTest` HTTP-level pattern
- [ ] Self-contained — the one open lookup (exact `SubscriptionPurchaseStoreAction` response shape) is flagged with an explicit "locate and copy" instruction, not guessed

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `MonthlyAddOnPurchaseStoreAction`'s response shape diverges from `SubscriptionPurchaseStoreAction`'s (e.g. JSON vs redirect), confusing the payment-continuation flow | Medium | Medium | Explicit GOTCHA in Task 2 requiring the implementer to locate and copy the sibling action's exact response contract before writing this one. |
| Blade widget markup doesn't match the existing page's visual language, looking bolted-on | Low | Low (cosmetic, easy to iterate) | Explicit instruction to mirror `widgets/subscriptions.blade.php`'s structure closely. |
| Auth/middleware on the new POST route doesn't match the existing purchase route's guard, allowing guest purchases | Low | Medium | Explicit GOTCHA in Task 2 plus a dedicated guest-request integration test. |

## Notes
This is the last phase of the six-phase PRD — after this lands, the full acceptance-criteria checklist in `../../../docs/domains/daily-add-ons/prd.md` should be verifiable end-to-end: a real user can browse to `/subscriptions/purchases`, buy an add-on, have it settle via Phase 5's plugin, get the entitlement via Phase 4's `PremiumFeature::enrollUser()` call, all without a single line of Sabak's or Student Chatbot's own code having changed.

> This completes the Add-Ons PRD's 6-phase roadmap (`../../../docs/domains/daily-add-ons/prd.md`). No further plan file follows.
