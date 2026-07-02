---
tags: [pr-retro, theme/error-handling, severity/high]
prs: ["#5181", "#5268"]
status: recurring, caused a production bug
---

# Explicit Failure Over Silent Fallbacks

## The pattern
Using `?? ''`, `?? false`, or `isEmpty()`-style checks to paper over a value that "shouldn't" be missing, instead of either throwing or making the variable's true state explicit. This is the single most important recurring pattern in the whole review history because **it directly caused a shipped bug**.

## Evidence

**PR #5181** (`DailyCheckInRepository`) — mochammadkevin flagged `$courseNames[$courseId] ?? ''`:

> "concern utamanya sebenernya bukan di situ, tapi lebih ke `?? ''` itu silent failure. Kalau entah kedepannya ada edge case apapun terjadi, data kotor masuk DB tanpa ada error trace sama sekali. Lebih aman throw exception supaya failure-nya eksplisit"

**PR #5268** (Bootcamp Asah bugfix) — the bug this PR was fixing *was* a silent-fallback failure: `should_show_bootcamp_asah_modal` was `null` for logged-out users because the backend only ever set it when `member_id` existed. Krisna's own postmortem comment in the thread:

> "Sudah ketemu akar masalahnya... backend tidak pernah mengirimkannya karena di set hanya mengirimkan ketika member_id itu ada. Aku melakukan testing hanya untuk skenario user yang login aja, ini jadi pelajaran buatku untuk testing beberapa skenario testing di halaman-halaman publik."

The proposed fix used `!empty(...)`, and agissept pushed back on the *fix itself* repeating the same anti-pattern:

> "`$should_show_bootcamp_asah_modal ?? false` kode ini menunjukan bahwa variable tersebut tidak confidence akan valuenya, ini sebenernya sama aja kaya menggunakan `isEmpty`... akan lebih mudah menjawab pertanyaan kapan variable ... akan `false`, karena bisa di search."

## Why it matters
`?? ''` / `?? false` / `empty()` all answer "what do I show if I don't know?" — they never answer "why don't I know?". Two consequences seen in the data:
1. Corrupted/incomplete data slides into the DB with no trace (#5181).
2. A whole class of users (logged-out) silently gets `null` instead of an explicit `false`, and the bug ships to production before anyone notices — because `null` and `false` both look "falsy enough" in a Blade `@if`. It was found by a stakeholder-facing report, not a test.

## Root cause
Treating "handle the missing case" as equivalent to "make it not crash," when the actual job is "make the missing case impossible to misread." A `??` fallback is a *value* decision hiding a *control-flow* decision.

## How to fix
- When you reach for `?? X`, ask: is this genuinely a valid default, or am I avoiding deciding what happens when the precondition fails? If the latter → throw (`InvariantException`) or make the variable's real tri-state (`true`/`false`/`unknown`) explicit in the type instead of collapsing it into a boolean.
- For booleans specifically: set the concrete `false` at the source of the branch that produces "no," rather than defaulting a nullable at the read site. `agissept`'s test is a good one to internalize: *"kapan variable X akan false, karena bisa di search"* — a searchable, explicit assignment beats an implicit fallback every time someone greps the codebase later.
- Add a test for the "precondition not met" branch explicitly (logged-out user, missing record, etc.) — not just the happy path. This is the concrete gap that caused #5268; pair with [[06 Test Discipline]].

## Related
[[00 Index]] · [[06 Test Discipline]] · [[11 Entity Boundaries Case Study]]
