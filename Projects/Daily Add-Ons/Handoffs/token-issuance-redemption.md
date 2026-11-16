---
date: 2026-10-13
updated: 2026-10-13
type: handoff
tags: [handoff, dicoding, daily-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Handoff — Daily Add-On Token Issuance/Redemption: PR #0–#3 done, #4–#8 remaining

**Date:** 2026-08-24
**Branch chain (each stacked on the previous):**
`feature/daily-add-ons/token-issuance-domain` (PR #1) → `feature/daily-add-ons/token-issuance-infra` (PR #2) → `feature/daily-add-ons/token-issuance-edit-domain` (PR #3, current HEAD)
**Plan:** [docs/domains/daily-add-ons/specs/daily-add-on-token-redemption.md](../../domains/daily-add-ons/specs/daily-add-on-token-redemption.md) — **wins on disagreement**, has been kept up to date with every review-driven change below. Read its "PR #0" through "PR #8" sections before starting the next PR.
**Basecamp:** 9 cards on the **Classroom** board — 4 in **In Review** (done), 5 in **Planning** (remaining), all tagged `[Add-ons][LX35]`.

## What this feature is

Admin-issued redemption tokens for daily add-ons (Sabak, Student-Chatbot), redeemable through the existing `/tokens/activation` page alongside single-course/multi-course/subscription tokens. Mirrors the existing `SubscriptionToken*` issuance pattern closely (explicit decision in the spec doc), with several deliberate divergences — see below.

## Done — PR #0 through #3

| PR | Capability / Layer | Branch | Status |
|---|---|---|---|
| #0 | Prep — redesign `grant()` event | (base, not part of this chain) | [#5592](https://github.com/dicoding-dev/dicoding/pull/5592) — OPEN |
| #1 | Issuance: Create — Domain | `token-issuance-domain` | [#5593](https://github.com/dicoding-dev/dicoding/pull/5593) — OPEN |
| #2 | Issuance: Create — Infra + Web/UI | `token-issuance-infra` | [#5626](https://github.com/dicoding-dev/dicoding/pull/5626) — OPEN |
| #3 | Issuance: Edit — Domain | `token-issuance-edit-domain` | [#5630](https://github.com/dicoding-dev/dicoding/pull/5630) — OPEN |

None are merged yet — all still open for review, stacked in this exact order. Do not rebase #1 onto latest master without re-checking #2/#3 still apply cleanly.

## Decisions worth knowing before continuing

- **VO naming: `New`/`Existing` pair, not `WithoutID`.** PR #1 originally added `DailyAddOnTokenWithoutID` (mirroring `SubscriptionTokenWithoutID`). Review on #5593 asked for a name closer to domain language than the technical "has an ID or not" distinction — renamed to **`NewDailyAddOnToken`**. PR #3 then added the "with ID, read from DB" counterpart as **`ExistingDailyAddOnToken`** (not `DailyAddOnToken` as the original plan draft said) to keep the New/Existing pairing consistent. If you're hunting for "the token VO", it's one of these two, never a bare `DailyAddOnToken`.
- **`DailyAddOnTokenCreator`'s input is one VO, not split params.** Also from #5593 review: constructor only takes `CommonActor $generator` (admin check); `createTokens(DailyAddOnTokenCreationRequest $request)` takes a single request VO bundling `add_on_type`/`days`/`expired_date`/`quantity`/`description`/`token_owner` — not separate constructor + method params like `SubscriptionTokenCreator` still does. This is a deliberate divergence from that sibling, not an oversight.
- **Dates are `Carbon`, not `DateTimeImmutable`, everywhere in this feature's new code** (`NewDailyAddOnToken`, `ExistingDailyAddOnToken`, `DailyAddOnTokenCreationRequest`, the aggregates' "now" checks — via `Asr::toCarbon(Asr::getNowDateTimeImmutable())`). This matches `CurrentDailyAddOn`/`DailyAddOnEntitlement` (same domain), **not** `SubscriptionToken*` (which stays `DateTimeImmutable`, untouched). Follow Carbon for any further additions to this feature.
- **Web\Http Action+Response merged into one invokable class.** `DailyAddOnTokenCreateAction`/`DailyAddOnTokenStoreAction` (#5626) use `public function __invoke()` returning the final `View`/`RedirectResponse` directly — no separate `XxxResponse implements Responsable`. This matches the newer `DailyAddOnPurchaseStoreAction` convention in this same domain, not the older `SubscriptionTokenStoreAction`+`SubscriptionTokenStoreResponse` split. Keep using one class per action for the Edit/Index/Export PRs unless the response-shaping logic turns out to be genuinely complex.
- **Integration test count stayed intentionally thin.** `CreateDailyAddOnTokenIntegrationTest` (#5626) ended up as **one test** — the full success round-trip (HTTP → use case → aggregate → repository → gateway → real DB row → redirect). Earlier drafts had 8, then 5, then 1: negative cases that duplicated `DailyAddOnTokenCreatorTest` (unit) were cut, and even "one representative failure case" / admin-gate / view-render checks were cut once traced back to what already guarantees the same outcome (unit test, or a framework mechanism proven elsewhere in the codebase). Don't reflexively re-add those when writing the Edit/Index/Export/Redemption integration tests — ask "what does this prove that isn't already guaranteed elsewhere" first.
- **`grant()`'s event choice is a `match()` over `DailyAddOnGrantSource`, only `PAYMENT` exists so far.** PR #0 (#5592) redesigned `DailyAddOnEntitlement::grant()` to `match ($this->source) { DailyAddOnGrantSource::PAYMENT => ... }` — no `default` arm. **PR #7 (Redemption: Domain) has an open, unresolved design question**: since `match()` without `default` throws `UnhandledMatchError` on an unknown case, redeeming a token and calling `grant()` requires either (a) a new enum case + a new arm that raises some event (which event — reuse `DailyAddOnTokenWasRedeemed` from the token aggregate, or something else — and whether that double-raises with the token aggregate's own event), or (b) restructuring `grant()` to conditionally `raise()` only for arms that have an event. This is genuinely undecided — read the "Redesain event `grant()`" section of the spec doc in full before starting PR #7, don't assume either option.
- **Composer autoload gotcha after switching branches.** `deck artisan migrate` can fail with `BindingResolutionException: Target class [SomeClass] does not exist` even though the file is right there on disk — this is a stale Composer classmap after a branch switch, not a real bug. Fix: `deck composer dump-autoload`, then retry. Don't manually patch the DB schema around it (tried once this session, reverted — the user explicitly wants the real fix, not a raw-SQL workaround).
- **Migrations need running on both DBs separately:** `deck artisan migrate` (dev, `dicoding`) and `deck artisan migrate --env=testing` (test, `dicoding_test`) — the integration test suite reads from the latter.
- **Route names use underscores, URLs use hyphens.** `daily_add_ons.tokens.create`/`.store` (route name) vs `dashboard/administrations/daily-add-ons/tokens` (URL path) — matches the existing `daily_add_ons.purchases.store`/`daily_add_ons.checkout.index` convention already in `app/routes.php`. Don't "fix" this to be consistent; it's the established pattern.
- **No lang file entries needed for Domain-only PRs.** PR #1 and #3 introduced `InvariantException` messages (`DAILY_ADD_ON.TOKEN.CREATE.*`, `DAILY_ADD_ON.TOKEN.EDIT.*`) as raw dot-notation keys with no corresponding `app/lang/{id,en}/exception.php` entries yet — those get added in the matching Infra+Web PR (#2 added the CREATE.* keys; #4 needs to add the EDIT.* keys), since that's when a human actually sees the translated message.
- **Editable fields on an existing token: only `expired_date` and `description`.** Confirmed against `EditSubscriptionTokensSpecification` (`token_id`, `expired_date`, `description` — nothing else). `add_on_type`/`quantity`/`owner_id` are create-time-only decisions, never edited afterward. `DailyAddOnTokenEditor::updateToken(Carbon $newExpiredDate, string $newDescription)` matches this scope exactly — don't add more editable fields without checking with the user first.
- **`ExistingDailyAddOnToken::withNewSelf()` is the immutable-update pattern** — the VO never mutates itself; `updateToken()` produces a brand-new instance via `withNewSelf()`, copying every unchanged field (`id`, `token`, `add_on_type`, `days`, `owner_id`, `used_by`) from the old instance. Mirrors `SubscriptionToken::withNewSelf()`.
- **`DailyAddOnTokenGateway` grows one file at a time across PRs, always stacked.** It started as a skeleton (#5593, only `createTokens()` stub), got its `createTokens()` body filled in #5626, then got `getById()`/`updateToken()` stubbed in #5630 (this PR). Every future PR that touches this file **must** stack on top of the last one that touched it, or the two PRs will conflict on merge.

## Remaining — PR #4 through #8

All stacked sequentially, matching the spec doc's PR table:

| PR | Capability / Layer | Base branch (once created) |
|---|---|---|
| #4 | Issuance: Edit — Infra + Web/UI | `feature/daily-add-ons/token-issuance-edit-domain` (this branch) |
| #5 | Issuance: Index (admin listing) | PR #4's branch |
| #6 | Issuance: Export (admin, async) | PR #5's branch |
| #7 | Redemption — Domain | PR #6's branch |
| #8 | Redemption — Infra + Web + Spec | PR #7's branch |

PR #4 fills in `DailyAddOnTokenGateway::getById()`/`updateToken()` (currently stubbed in this branch), adds `EditDailyAddOnTokensSpecification`, an edit form + update action, routes, the `DAILY_ADD_ON.TOKEN.EDIT.*` lang entries, and an integration test (one success-path test, per the thinned-testing lesson above, plus judgment on whether any failure case earns its keep here too).

## Links

| What | Where |
| --- | --- |
| Spec doc (durable, wins on disagreement) | [docs/domains/daily-add-ons/specs/daily-add-on-token-redemption.md](../../domains/daily-add-ons/specs/daily-add-on-token-redemption.md) |
| PR #0 — Prep | https://github.com/dicoding-dev/dicoding/pull/5592 |
| PR #1 — Create, Domain | https://github.com/dicoding-dev/dicoding/pull/5593 |
| PR #2 — Create, Infra+Web/UI | https://github.com/dicoding-dev/dicoding/pull/5626 |
| PR #3 — Edit, Domain | https://github.com/dicoding-dev/dicoding/pull/5630 |
| Basecamp board | Classroom (project 44666023, board 10042394817) — 4 cards in *In Review*, 5 in *Planning*, all `[Add-ons][LX35]` |
