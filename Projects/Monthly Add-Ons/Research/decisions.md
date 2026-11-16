---
date: 2026-10-13
updated: 2026-10-13
type: research
tags: [research, dicoding, monthly-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Add-Ons — Decision Log

Running log of decisions and open questions from the Add-Ons grilling session. Not a spec — captures *what was decided/parked and why*, in the order it came up.

## Resolved

- **Canonical naming**: "Student Chatbot" is the engineering term; "Learning with AI" is the customer-facing/commercial name for the same feature and credit pool. See `context.md`.
- **Entitlement shapes differ per product** — Add-on is a commercial umbrella (one SKU/checkout concept), not a single generic mechanism:
  - **Learning with AI**: Rp 50,000/month grants a **recurring 30-credits-per-day** allowance (resets daily, does not roll over), for the duration of the 1-month membership. ~~Originally described as a one-time 30-credit lump expiring after 1 month~~ — corrected: it's daily-resetting, not a depleting balance. Structurally close to how `explain-with-ai` already works (`reset_period: DAY`).
  - **Sabak**: Rp 250,000/month grants **up to 4 hours of activity-based access per day** (resets daily), for the duration of the 1-month membership. ~~Originally described as a flat 1-month unlimited access window~~ — corrected: it's a daily cap, not unlimited monthly access.
  - When the free-trial 20 lifetime chatbot credits run out (or hit 5 remaining), a CTA/popup should prompt purchase of the Learning with AI add-on — ties into the existing `onApproachingLimits`/warning-threshold mechanism already built into `premium-feature.ts`.
- **Extensibility is a goal, not a non-goal**: the add-on mechanism should be built generically (config-driven, pluggable entitlement shape) so future add-on products can be added without a new bespoke system each time — even though only Sabak and Learning with AI ship at launch.

## Agreed, pending team follow-up

- **Add-ons as its own bounded context** (`Dicoding/Domain/Addons/`), separate from `PremiumFeatures`, mirroring the existing `Subscriptions` → `PremiumFeatures` event-driven seam (e.g. `AddonWasPurchased` feeding into feature-gating rather than living inside `PremiumFeatures`). Agreed in direction; needs confirmation from the rest of the team before locking in.
- **Checkout integration**: new `InvoiceEntities::ADDON` + `AddonSettlementPlugin` (following the existing 7-plugin settlement pattern, contract `run(Invoice): bool`), plus a config-driven catalog `app/config/addon_configs.php` (mirroring `premium_feature_configs.php`) listing price, entitlement shape, duration, and target feature per add-on product. Agreed; bundling multiple add-ons into one invoice vs. always single-item invoices still open.

## Resolved (2)

- **Single-item-per-invoice, no bundling**: confirmed every payment transaction in the codebase is strictly 1:1 with one Invoice (no cart/multi-invoice concept exists anywhere — `PaymentTransaction` holds a single invoice, Xendit maps one external invoice to one Dicoding invoice). Buying Sabak + Learning with AI together means two separate checkout flows/payment pages, same as buying two courses today. Building bundled-cart checkout would be a novel platform-wide capability with no precedent — out of scope for this feature.
- **Discovery surface confirmed**: Add-ons will live on the existing `/subscriptions/purchases` page (`SubscriptionPurchaseCreateAction` → `SubscriptionPurchaseViewModel` → `app/views/ui/v3/subscriptions/purchases/index.blade.php`), which marketing will revamp alongside a refresh of the existing Plus/Learning Path subscription tiers shown there today. Confirmed via codebase — this page currently has zero add-on integration; pricing there is DB/config-driven through the ViewModel, not an API catalog.
- **Separate checkout backend, shared page**: a new sibling `AddonPurchaseCreateAction` + its own ViewModel section renders into the same Blade page as the existing subscriptions widget, but submits to its own route producing `InvoiceEntities::ADDON` invoices via `AddonSettlementPlugin`. `SubscriptionPurchaseViewModel` stays scoped to Plus/Learning Path only, matching how every other purchasable type in the codebase already gets its own checkout aggregate.
- **Promo/discount codes**: explicitly out of scope for v1. `SubscriptionPromotionCodeGateway`/flash-sale eligibility stays subscription-only; add-ons launch at flat list price. Revisit as a follow-up if marketing requests it later.

## Resolved (3)

- **Refunds/cancellation — build `AddonCancellationPlugin`, matching existing precedent exactly (no entitlement revocation).**
  Codebase finding: "refund" platform-wide means crediting back the user's internal **points** balance (`UserPointService`) — there is no gateway-level (Xendit) refund/chargeback anywhere, and no self-service refund API (admin-only via `PaymentCancellationAction`/`EventRefundAction`). Critically, **no existing cancellation plugin revokes feature/entitlement access** — not even `SubscriptionCancellationPlugin` touches `PremiumFeature`; a cancelled subscriber keeps access until natural expiry. `PremiumFeature` has no `unenroll()`/`revoke()` method at all.
  **Decision**: `AddonCancellationPlugin` does the same narrow thing every other cancellation plugin does — flip invoice status to `CANCELLED`, credit points back, raise a domain event. It does **not** revoke the add-on entitlement; the entitlement lapses on its own natural expiry (1 month), same tradeoff the platform already accepts for subscriptions. Chosen for consistency with existing precedent over building a first-of-its-kind revocation mechanism.

## Exploration input (unpinned) — from another engineer

- Anticipated impact areas: checkout page, checkout/payment business logic, and a new API to persist add-on state that must be **accessible from `premium-feature` so it can notice/consume it**. Independently corroborates the layered-entitlement direction (parked, above) and the Add-ons-as-own-bounded-context direction (agreed-pending-team, above) — no contradiction, treat as supporting signal rather than a new decision.

## Open / Parked

_(none remaining as of this round — see Resolved #5 and #6)_

- **Entitlement model — RESOLVED, see Resolved #5.** (Two-bucket priority consumption, add-on drawn first, built inside `PremiumFeatures` core, not Chatbot's code. Sabak stays single-bucket. No subscriber-stacking case exists today.)

## Resolved (6)

- **Repurchase mechanics — RESOLVED: single rolling expiry, no balance to track.**
  Simplified by the daily-reset correction (Resolved #4): since neither product carries a depleting monthly balance anymore (both are "N units/day while membership is active"), there's nothing to sum on repurchase — only the **expiry date** is affected. Rule: `new_expiry = max(now, current_expiry) + 1 month`, applied identically to both Sabak and Learning with AI. Buying again before or after the current window lapses just extends forward from whichever is later — no separate parallel windows, no per-purchase batch ledger.

## Resolved (4)

- **Sabak 4h/day cap applies to 100% of Sabak's userbase**, because Sabak is **add-on-only, never a subscription benefit** — no Plus/Single Course/Learning Path subscription grants Sabak access. The current `feature_subscribed_to: [ACADEMY_SUBSCRIPTION]` entry for `sabak` in `premium_feature_configs.php` is therefore stale/incorrect relative to this decision. Both `sabak` and `student-chatbot` are confirmed still `INTERNAL`-only/testing-phase today (no real subscriber has live access via either path), so this is a clean no-op, not a migration — **deliberately left as-is for now**; will be removed/commented out once the `Addons` integration is built and ready to test, not before.
- **Zero changes to Sabak/Chatbot business logic required — holds for Sabak, but see Resolved #5 for a correction on Chatbot's case.** The eligibility-injection point (`PremiumFeatureGateway::getSubscriptions()` + a `feature_subscribed_to` config entry) is enough for Sabak, which has only one bucket. Chatbot needs more than eligibility — see below.

## Resolved (5)

- **Entitlement model — settled: two-bucket priority consumption, add-on drawn first, built entirely inside `PremiumFeatures` core (not inside Chatbot's code).**
  Confirmed **not additive stacking**. Chatbot's actual rule: a user's 20 lifetime trial credits deplete normally (e.g. down to 5 remaining) → a CTA prompts buying the add-on → once purchased, the add-on's 30/day bucket is drawn **first** each day, and the trial's remaining balance (frozen at whatever it was, e.g. 5) is only touched once the add-on's daily 30 is exhausted for that day → trial continues depleting from there down to 0 on overflow days. Today's `PremiumFeatureService`/`FeatureUsage`/`LimitConfig` only supports one limit + one reset window per user per feature, so this genuinely needs new logic — **not** a config-only trick.
  **Where it lives**: entirely inside shared `PremiumFeatures` core (`FeatureConsumption`/`checkUsage()`), so the single call site `PremiumFeature::consume($userId, 'student-chatbot', $amount)` in `ChatbotReplyFinalizationSpecification` never changes. This corrects the earlier "Resolved #4" claim that a config/eligibility tweak alone was sufficient for Chatbot — it undersold the work; the priority-bucket mechanism is new, just confined to shared platform code, never touching Sabak/Chatbot's own domain files.
  **No subscriber-stacking case exists today**: confirmed via the actual current subscription pricing/benefits sheet (Single Course, Learning Path, Plus) — none list Chatbot/Learning with AI as a benefit, only "Kuota 50 per hari Explain with AI." So subscription status plays no role in Chatbot access today; every user is either on the trial bucket or the add-on bucket, regardless of subscription tier. The "subscriber also buys add-on, do limits combine differently" question is moot for now — deferred as future/out-of-scope unless a subscription tier later adds a Chatbot benefit.
  **Sabak stays simple**: only one bucket ever (add-on), no priority logic needed, since Sabak has no trial/base tier at all.
