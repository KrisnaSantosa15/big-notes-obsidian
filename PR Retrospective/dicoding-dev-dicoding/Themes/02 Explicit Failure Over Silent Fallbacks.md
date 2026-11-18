---
tags:
  - pr-retro
  - theme/error-handling
  - severity/high
prs:
  - "#5181"
  - "#5268"
  - "#6207"
  - "#6249"
  - "#6300"
  - "#6301"
  - "#6312"
  - "#6402"
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


### 2026-11-18 — PR #6301, #6300, #6402, #6249, #6312, #6207 (incremental sync)

**Third+ occurrence of the root behavior** ("the unhappy path silently does the wrong thing"), see also #5181, #5268. This round it showed up as *unhandled exception types* and *edge-case inputs*, not `??` fallbacks.

**PR [#6301](https://github.com/dicoding-dev/dicoding/pull/6301)** (`SupervisedStudentRemovalSpecification`) — agissept:
> "`InvariantException` belum di catch"

The aggregate throws `InvariantException` (`NOT_SUPERVISED`, `NO_STUDENTS`) but the spec only caught `AuthorizationException`/`ObjectNotFoundException`, so it fell through to `catch (Exception)` → `withExceptionPayload`: admin saw the generic "Maaf, kami mengalami kegagalan..." instead of the translated rule message, and the status became `FAILURE` (system error) instead of `ERROR` (business rule). Fix: add `catch (InvariantException) → withInvariantExceptionPayload`, and the integration test now asserts the translated message (it failed with the generic text first, proving the bug). **Lesson: for every exception type the aggregate can throw, the spec needs a matching catch; assert the message text, not just `assertSessionHasErrors('key')`.**

**PR [#6301](https://github.com/dicoding-dev/dicoding/pull/6301)** (`AcademicProgramDashboardSupervisedStudentGateway::deleteSupervisedStudents`) — agissept:
> "Query ini bahaya kalo dipanggil dengan empty array, karena jadinya gak ada `where`nya"

The only WHERE conditions were built inside `->where(function ($q) { foreach ($list as $x) { $q->orWhere(...) } })`. With `[]` the loop never runs, the nested builder has zero wheres, and Laravel's `Builder::addNestedWhereQuery()` skips it (`if (count($query->wheres))`) because `WHERE ()` is invalid SQL, so the query became `DELETE FROM academic_program_dashboard_supervised_students` (whole table). Domain guards (`NO_STUDENTS`, request validation `min:1`) prevented it *today*, but the gateway method itself was unsafe for any future caller. Fix: `->where('lecturer_id', $lecturerId)->whereIn('student_id', $studentIds)`; the fixed condition sits outside any loop, and `whereIn([])` compiles to `0 = 1` (deletes nothing). **Lesson: a destructive query must be safe on its own for empty input; never let all WHERE conditions come from a loop.** Checklist: for any `delete()`/`update()`, ask "what SQL does this produce with an empty array?"

**PR [#6300](https://github.com/dicoding-dev/dicoding/pull/6300)** (`SupervisedStudentRemovalRepository`) — agissept:
> "Di sini banyak throw `ObjectNotFoundException`, make sure aja menggunakan response code 404 dengan tepat. Tidak semua yang not found responsenya 404."

**PR [#6402](https://github.com/dicoding-dev/dicoding/pull/6402)** (`DeveloperWasRegisteredToPijakMailer`) — dimasmds:
> "harusnya ini bisa masuk ke block try."

**PR [#6249](https://github.com/dicoding-dev/dicoding/pull/6249)** (`AcademicProgramDashboardParticipantStoreAction`) — AlexzPurewoko:
> "email ini optional atau required bang? Kalau email ini nullable, potensi bisa kelock semisal ada user dengan ID yang lain sedang request ke programcode ini"

**PR [#6312](https://github.com/dicoding-dev/dicoding/pull/6312)** (`UserSearchAction`) — Najibsaurus:
> "Apakah ini sengaja tidak mengembalikan pesannya kayak gini abangkuu? `'message' => $ex->getMessage()`"

**PR [#6207](https://github.com/dicoding-dev/dicoding/pull/6207)** (`AcademicProgramDashboardCampaignGateway`) — Najibsaurus, on an implicit `first()`:
> "ini asumsinya bahwa sebuah `partner_program_id` hanya memiliki satu campaign, kan?"

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
