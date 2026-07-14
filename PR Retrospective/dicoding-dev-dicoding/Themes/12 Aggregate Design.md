---
tags: [pr-retro, theme/domain-modeling, severity/medium]
prs: ["#5335"]
status: new
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
