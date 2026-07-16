---
date: 2026-07-15
type: devlog
tags: [devlog, dicoding, ddd, tdd, monthly-add-ons, php, feature-development]
project: "[[Projects/Dicoding Platform]]"
prs: ["#5335", "#5340", "#5344"]
related-people: [["[[People/Krisna]]"], ["[[People/agissept]]"], ["[[People/AlexzPurewoko]]"]]
ai-first: true
---

## For future Claude

Dev log for phase-6 Monthly Add-Ons feature development (2026-07-15). Three critical bugs found and fixed across two branches; review feedback on PR #5335 (domain layer) resolved via API redesign; cross-branch coordination risk identified as a general pattern. Key decisions documented in [[Projects/Dicoding Platform]] under "Monthly Add-Ons".

## What was worked on

### Phase 6 (web-checkout branch): two integration-test bugs fixed

1. **Guest-auth bypass bug** — IntegrationTest HTTP requests were not running route-level filters ('auth') because the test setup was missing `Route::enableFilters()`. Pattern found by diffing against passing test `AsahReferralRegistrationIntegrationTest`, which already called it. This is specific to this Laravel-4-fork codebase.

2. **Payment redirect silent fallback bug** — The purchase→redirect flow makes TWO separate Xendit API calls: (1) create invoice, (2) lookup for redirect URL. The failing test mocked only (1) via `mockNewXenditPayment()`, missing (2) `mockExistingXenditPayment()`. Solution: grep sibling test `NewPurchaseSubscriptionIntegrationTest`, which mocks both, and apply the pattern. ✓ verified green

Lesson: when test failure is unclear in this codebase, grep sibling feature's test and diff the setup — the fix is almost always "the working test does X that this one doesn't", not a deep architectural bug.

### PR #5335 (Monthly Add-Ons Phase 1 domain layer) — review resolution

**API signature change (requested by reviewer AlexzPurewoko):**
- Old: `MonthlyAddOnPurchase(int $userId, MonthlyAddOnType $addonType, MonthlyAddOnExpiry $currentExpiry)`
- New: `MonthlyAddOnPurchase(CommonActor $actor, ExistingMonthlyAddOn $existingAddOn)`
- Rationale: mirrors sibling `SubscriptionPurchase` aggregate's `CommonActor` precedent for consistency.

**VO consolidation (reviewer AlexzPurewoko request):**
- Renamed `MonthlyAddOnExpiry` → `ExistingMonthlyAddOn`, bundling `MonthlyAddOnType` + expiry `DateTimeImmutable` into one VO.
- `purchase()` now takes zero parameters, reads addon type from the injected VO.
- Date-math transiently uses `Carbon` only at aggregate boundary (`Carbon::now()->toDateTimeImmutable()`) to keep VO on pure stdlib `DateTimeImmutable`, matching codebase convention.

**Business logic relocation (requested by reviewer agissept):**
- Moved `max(now, current)+1 month` date-math OUT of the VO and INTO the aggregate itself (DDD stance: aggregates own rules, VOs stay simple `with...`-style copies).
- Note: this reverses the original Phase 1 plan, which documented the math in the VO "so it's independently unit-testable." Trade-off decided in favor of reviewer's DDD stance.
- Technique: when review comment is ambiguous, grep downstream consumers' code (even in not-yet-merged branches) to see real API usage, and check the original plan doc for documented rationale before agreeing to change.

**Dead code flagged:**
- `hasSuccessfullyPurchased()` confirmed via cross-branch grep (all 3 stacked branches) to be completely unused outside its own definition.
- Reviewer agissept flagged as candidate for removal.

## Problems encountered

**Cross-branch coordination risk (identified, not yet mitigated):**

When a PRD is split into "one phase per branch" stacked PRs (#5335 domain → #5340 usecases → #5344 settlement), and a later reviewer forces an API redesign in the base branch, the downstream branches don't auto-signal — they keep referencing the old API and will silently break on rebase. GitHub doesn't surface this. 

General lesson: **always grep sibling/dependent branches after an API change in a shared base branch, not just fix-forward in the branch you're on.**

**Open architecture decision (not yet resolved):**

Event-listener-based feature enrollment (current design: `MonthlyAddOnWasPurchased` event → `MonthlyAddOnEventListener` → `PremiumFeature::enrollUser()`) risks a purchase succeeding while enrollment silently fails, since they're two separate steps/transactions with no rollback path.

Reviewer agissept suggested calling the enrollment service synchronously inline instead (one atomic step), but explicitly left the final call to the implementer. This needs a real decision when picking up PR #5340. Confidence: medium — the tradeoff is clear, but the choice depends on enrollment-service uptime SLA and whether rollback-on-failure is feasible.

## Decisions made

- Moved date-math from VO to aggregate (requested by agissept, reverses original design doc)
- Kept `CommonActor` + `ExistingMonthlyAddOn` aggregate constructor signature (consistency with `SubscriptionPurchase`)
- Documented cross-branch coordination risk as a general pattern (non-blocking for this session, but worth remembering for stacked PRs)
- Deferred event-listener vs. sync-enrollment decision to PR #5340 pickup

## Next steps

- Resolve event-listener architecture question when starting PR #5340
- Grep all downstream branches for API surface changes before committing to base-layer changes in future stacked PRs
- Verify Phase 6 tests + psalm before rebase/merge
