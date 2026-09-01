---
tags:
  - pr-retro
  - theme/domain-modeling
  - severity/medium
prs:
  - "#5335"
  - "#5593"
  - "#5592"
  - "#5630"
status: recurring
---

# Aggregate Design — Behavior Methods Over Constructor Parameters

## The pattern
On a new aggregate (`MonthlyAddOnPurchase`), a single reviewer (agissept) raised four related points in one PR, all pointing at the same underlying instinct gap: letting the constructor/getters passively mirror whatever was passed in, instead of making the aggregate's *behavior* own the decisions and only exposing what it actually computed.

## Evidence

**PR #5335**:
> agissept: "Kenapa perlu getters di sini?" — a getter existed for internal state nothing outside the aggregate needed to read.
> agissept: "Type ini yang dibelinya kan? kalo iya pindahin ke fungsi `purchase`" — which product type was being purchased was passed in externally instead of being determined inside the `purchase()` behavior method.
> agissept: "Ini pasti penambahannya 1 bulan ya? kalo iya ga perlu parameter, langsung aja extend 30 hari di sini" — a parameter existed for a value that is, for every current use, always the same fixed business rule (a 1-month extension).
> agissept: "Langsung aja di sini valuenya berapa" — same instinct on a test setup: hardcode the concrete value instead of adding a parameter for it.
> agissept: "Harusnya di sini ada getter untuk mengambil data yang telah dibuat oleh aggregate" — the flip side: a getter *was* missing for data the aggregate itself derives/produces as an output of its own behavior.

## Why it matters
Read together, these describe one coherent rule: **a getter should expose what the aggregate produced, not echo back what the caller already knows** (it already has the value it just passed in), and **a parameter should only exist for a value that genuinely varies today** — not speculative flexibility nobody has asked for yet (the same YAGNI instinct as Ponytail ladder rung #1). Getting this backwards means the aggregate's public surface leaks internals (getters for everything) while still hiding what callers actually need (computed/derived state), and constructors accumulate parameters for "what if this changes later" instead of encoding the current, actual business rule directly.

## Root cause
Designing the aggregate's constructor/getters around "what data does this class hold" instead of "what decision does this aggregate make, and what does a caller need back from it." Parameters get added defensively for anything that *could* vary, and getters get added defensively for anything that's stored — the same reflex as [[07 Modern PHP Idioms]]'s defensive casts, just at the aggregate-design level instead of the type-system level.

## How to fix
- Before adding a constructor/method parameter for a business-rule value: is this value fixed across every current call site? If yes, hardcode it inside the behavior method (e.g. `purchase()` extends by a literal 30 days) and only promote it to a parameter when a second, genuinely different call site appears.
- Before adding a getter: is this exposing something the caller already gave the aggregate (redundant), or something the aggregate itself computed/decided (needed)? Only the latter earns a getter.
- If a decision (like "which product type was purchased") can be determined from data already flowing into a behavior method, make that method own the decision instead of accepting it as an external parameter.
- For date/time math inside aggregates, see [[06 Test Discipline]] — use `Carbon` consistently so a fixed-duration rule like the one above stays testable without depending on the real wall clock.

## Related
[[00 Index]] · [[07 Modern PHP Idioms]] · [[06 Test Discipline]]


## Evidence (continued)

### 2026-08-24 — PR #5593 (Token Issuance — create domain layer)

AlexzPurewoko flagged aggregate design decisions where parameters or naming should be consolidated:

> "Yang closer dengan term domain aja bang... betul misal new daily add on token atau existing. Atau bisa aja pake pola yang satu object term misalkan daily add on token, tapi id nya dibuat nullable dan bisa dicek di aggregate nya"

> "Seperti pada komentar di PR, ini bisa dijadikan satu value object saja bang" — combining what would otherwise be separate parameters into a single domain concept.

> "tokenOwner ini bisa user atau gimana kah?" — clarifying a domain role/entity before settling on the aggregate's public interface.

> "Btw memang ada kebutuhan untuk cek over quantity ya?" — questioning whether a business rule belongs in the aggregate at all.

### 2026-08-24 — PR #5592 (Keep grant() event raising inside the aggregate)

dimasmds on event sourcing within aggregates:

> "Aggregate tetap raise domain. Yang perlu di-adjust mungkin si aggregate-nya harus bisa mengetahui grant access ini comes-up dari mana, payment atau voucher. Nanti handle event-nya berdasarkan nilai tersebut."

Reinforces [[12 Aggregate Design]]'s core: the aggregate owns the decision-making, including which events to raise and *under what conditions*. When an external input (payment vs voucher) changes how the aggregate behaves, the aggregate should own that context-awareness, not require the caller to route differently.


### 2026-09-01 — PR #5630 (Token Issuance — edit, domain layer)

Two related design decisions while rebasing/refactoring a token-editing aggregate — not from an external reviewer comment this time, but a self-directed refactor decision grounded in the `DailyAddOnTokenCreator` → `DailyAddOnTokensCreation` rename from #5593's review (same root pattern this theme already tracks).

**(a) Aggregate names must be process/outcome nouns, not actor nouns.**

**Salah:**
```php
class DailyAddOnTokenEditor extends Aggregate
class DailyAddOnTokenCreator extends Aggregate
```

**Benar:**
```php
class DailyAddOnTokenUpdate extends Aggregate
class DailyAddOnTokensCreation extends Aggregate
```

Precedent already established elsewhere in the codebase: `MultiCourseTokensCreation`, `MultiCourseTokenDropout`, `MultiCourseTokenDeadlineExtension`, `MultiCourseTokenRedemptionDateUpdate` — all process nouns (`-ion`/`-out`/`-sion`), never `-or`/`-er`. `SubscriptionTokenEditor` even carries its own docblock — `@review should renamed more clearly because aggregate is not actor` — flagging this exact smell years earlier and never fixed. Treat this as a standing rule for any new aggregate, not just this one.

**(b) Constructor must not validate or authorize — only the action method does, through one combined validation step.**

**Salah:**
```php
public function __construct(?ExistingDailyAddOnToken $existingToken)
{
    if ($existingToken === null) {
        throw new InvariantException('DAILY_ADD_ON.TOKEN.EDIT.EMPTY_EXISTING_TOKEN');
    }
    if ($existingToken->isAlreadyUsed()) {
        throw new InvariantException('DAILY_ADD_ON.TOKEN.EDIT.ALREADY_USED');
    }
    $this->existingToken = $existingToken;
}
```

**Benar:**
```php
public function __construct(
    private readonly ?ExistingDailyAddOnToken $existingToken,
) {
}

/** @throws InvariantException */
public function updateToken(Carbon $newExpiredDate, string $newDescription): void
{
    $this->validateEditTokenRules($newExpiredDate);
    $this->updatedToken = $this->existingToken->withNewSelf($newExpiredDate, $newDescription);
}

/** @throws InvariantException */
private function validateEditTokenRules(Carbon $newExpiredDate): void
{
    if ($this->existingToken === null) {
        throw new InvariantException('DAILY_ADD_ON.TOKEN.EDIT.EMPTY_EXISTING_TOKEN');
    }
    if ($this->existingToken->isAlreadyUsed()) {
        throw new InvariantException('DAILY_ADD_ON.TOKEN.EDIT.ALREADY_USED');
    }
    if ($newExpiredDate->lessThan(Asr::toCarbon(Asr::getNowDateTimeImmutable()))) {
        throw new InvariantException('DAILY_ADD_ON.TOKEN.EDIT.INVALID_EXPIRED_DATE');
    }
}
```

All checks grouped into **one** `validateEditTokenRules()` method rather than split across several small ones — matches `MultiCourseTokenDropout::preValidation()`'s style of grouping every pre-check together. Direct consequence for tests: since the constructor no longer throws, a test must construct the aggregate first (`$update = new DailyAddOnTokenUpdate(null);`) and only then call the action method to trigger the exception — not assert on the constructor call itself.

**Correction (2026-09-01, same day):** an earlier draft of this note added `@psalm-assert !null $this->existingToken` on `validateEditTokenRules()`, assuming psalm would otherwise flag `$this->existingToken->withNewSelf(...)` in `updateToken()` as possibly-null. Verified empirically with `deck psalm` (full project scan, "No errors found!") that this annotation changes nothing — this project's `psalm.xml` sets `errorLevel="4"`, and `PossiblyNullPropertyFetch`-family issues default to Psalm severity level 5, above that threshold, so they're never enforced here regardless of the annotation. Don't add `@psalm-assert` for this reason in this codebase — it's a no-op under the current config. (No sibling aggregate in this codebase uses `@psalm-assert` at all — the closest comparable case, `RecipientsConfigStateUpdate`, instead validates in the constructor and re-fetches the now-guaranteed value in the action method behind a plain comment, `// Guaranteed non-null by the constructor guard.` — still the older, constructor-validates pattern, not proof either way for psalm's behavior under the newer no-constructor-validation style.)