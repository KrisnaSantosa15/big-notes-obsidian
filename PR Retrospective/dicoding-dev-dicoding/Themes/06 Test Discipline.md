---
tags:
  - pr-retro
  - theme/testing
  - severity/high
prs:
  - "#5078"
  - "#5033"
  - "#5104"
  - "#5132"
  - "#5268"
  - "#5335"
  - "#6359"
  - "#5635"
  - "#5769"
  - "#5947"
  - "#6021"
  - "#6030"
  - "#6141"
  - "#6301"
  - "#6312"
  - "#6326"
status: recurring
---

# Test Discipline (Scope, Assertions, Hygiene)

## The pattern
Multiple distinct sub-issues, all under "what should this test actually cover, and how should it prove it":

### 1. Integration tests covering edge cases that belong in unit tests
**PR #5078**:
> "harusnya test ini ga perlu karena integration test tujuannya untuk flow utama, bukan edge case secara spesifik... kita tidak bisa cover keseluruhan case dengan integration test karena integration test ini suatu hal yang cukup mahal, soalnya butuh resource yang lumayan"

### 2. Re-testing things the framework already guarantees
**PR #5078 / #5033** — retesting the OAuth filter's reject behavior inside a feature's integration test, when a dedicated `OAuthFilterIntegrationTest` already covers it:
> "untuk oauth ini bisa hindari aja, karena kita udah percaya terhadap filter oauth2, karena resource yang digunakan untuk oauth ini lumayan besar"
> "karena sudah menggunakan filter oauth, sebenarnya tidak perlu ditest. Penerapan test reject dari oauth filter sudah ada di integration test yang berbeda."

### 3. Weak assertions instead of whole-object comparison
**PR #5078** (said twice, plus once on a different test in the same PR):
> "Bagusnya ini pake `assertEqual` untuk mebandingkan keseluruhan object, kalo satu satu gini agak bingung juga apakah semua property udah tercover assertion"
> "ini bisa menggunakan assert equal kah? supaya expected valuenya bisa keliatan"

### 4. Unjustified mocking / unnecessary setup
**PR #5033**:
> "Btw ini kenapa perlu di mock yah bang? Soalnya tidak ada method special yang perlu di override/stub di test ini"
> "Sebenarnya tidak perlu delete data oauth disini. Mengingat setiap operasi menjalankan test case ini datanya akan di create dan di delete setiap awal dan akhir test..."

### 5. Housekeeping: unused imports, naming, ordering
**PR #5104 / #5132** (twice): `"remove unused import"`, `"Ini bisa dibiasain untuk diimport aja bang"` (use `use`, don't inline-reference).
**PR #5033**: redundant naming (`it_successfully_transform_dashboard_payload` → drop "dashboard payload", already implied by the file); *"untuk negative test case sebaiknya berada di awal ya."*

### 6. The conversation-resolve norm (process, not code, but testing-adjacent)
**PR #5104** — hasbi-ashshidiq23 quoted the team's actual written guideline back to Krisna after a comment was resolved without confirming the reviewer was satisfied:
> "Ideally, a conversation should be marked as resolved by its starter... When you aren't the conversation starter: Make sure that they have no other concerns... Confirm them that you may resolve the conversation." Follow-up: "kalau resolve itu ga masuk notif sih, jadi kadang aku ga aware kalo commentnya udh di resolve — jadi lebih aman mention lagi aja kalo udah beres."

### 7. Hard-to-mock time source
**PR #5335** — agissept: "Coba di ganti ke Carbon semua supaya bisa di-mock" — native `DateTime`/timestamp calls mixed into domain code that should consistently use `Carbon`, so tests can freeze or mock the current time instead of depending on the wall clock.


### 8. Action hidden in `beforeEach` (break AAA structure)
**PR #6359** (`frontend/src/pages/campaigns/pijak/institution-field.test.ts`) — dimasmds:
> "Aku sempat bingung tadi baca test ini. Sempat mengira test ini gak valid karena di scenario testingnya gak terlihat kode production yang dijalankan, eh ternyata ada di sini. Kalo bisa next strukturkan action di test dengan jelas. Testing yang baik itu strukturnya AAA."
> "action dari test ini yang aku pahami ada di `setupInstitutionField()` jadi kalo bisa pemanggilan itu ditulis aja di body testingnya jangan di beforeEach (gak kelihatan dan biasanya digunakan untuk prep)."

AAA = **Arrange** (siapkan data/DOM pendukung skenario) → **Act** (jalankan kode production yang ditest) → **Assert** (validasi efeknya). `beforeEach` hanya untuk Arrange bersama; pemanggilan kode yang ditest harus terlihat di body tiap test. Ref: https://semaphore.io/blog/aaa-pattern-test-automation


### 9. Evidence 2026-11-18 — PR #5635, #5769, #5947, #6021, #6030, #6141, #6301, #6312, #6326 (incremental sync)

**Recurring.** Main gaps: tests that don't prove the claim, unneeded setup, and missing negative cases.

**Assert the exact message, not just that an error exists.** PR [#6301](https://github.com/dicoding-dev/dicoding/pull/6301): `assertSessionHasErrors('supervised_student')` passed even while the user saw the generic "Maaf, kami mengalami kegagalan..." text, because the `InvariantException` wasn't caught (see [[02 Explicit Failure Over Silent Fallbacks]]). Asserting the translated text exposed it.

**Prove the claim the PR description makes.** PR [#6312](https://github.com/dicoding-dev/dicoding/pull/6312) — Najibsaurus:
> "Pada deskripsi PR ini aku membaca kalimat \"Other search errors keep their previous 200 response, so the existing pages behave the same.\" Tapi apakah testnya perlu ada juga di sini utk membuktikan klaim tersebut?"

**Cover the negative inputs.** PR [#6326](https://github.com/dicoding-dev/dicoding/pull/6326) — Najibsaurus: "Apakah perlu ada test untuk kasus null atau kode tidak terdaftar, dan kode valid?" PR [#6141](https://github.com/dicoding-dev/dicoding/pull/6141): "Another case: apakah mentee dari program lain bisa mengambil qouta fasilitator? ... kalo engga bisa karena rule-nya seperti itu bisa dibuat testnya~"

**No unneeded setup.** PR [#5635](https://github.com/dicoding-dev/dicoding/pull/5635) — AlexzPurewoko: "Untuk test case dibawah ini karena tidak berfokus pada testing filter, maka ini tidak diperlukan bang" (`Route::enableFilters()`). PR [#6030](https://github.com/dicoding-dev/dicoding/pull/6030) — dimasmds: "Kenapa dibuat beda dengan konfigurasi production saat ini? Kalo memang belum muncul skenario multiple keys exclusion, menurutku belum perlu ditambahkan dulu." / "case ini juga jadi gak perlu kalo memang belum dibutuhkan."

**Test file hygiene.** PR [#6021](https://github.com/dicoding-dev/dicoding/pull/6021) — AlexzPurewoko: "Better pake prefix test_* atau tambahin attribute `#[Test]`". PR [#5769](https://github.com/dicoding-dev/dicoding/pull/5769) — dimasmds: "Fungsi helper-helper gini bisa disimpan di bawah biar bisa langsung baca skenario testing"

**Run the full suite after a rebase.** PR [#5947](https://github.com/dicoding-dev/dicoding/pull/5947) — agissept: "rebase terus jalanin semua unit test dan integration test dulu coba". (Seen again on #6301: a master middleware change turned a "no campaign" test into a 404 after the rebase.)

## Why it matters
Sub-issues 1–2 waste CI time and reviewer attention on cases the test pyramid already handles elsewhere (unit tests for logic branches, one shared `OAuthFilterIntegrationTest` for auth rejection). Sub-issue 3 is a false sense of coverage — asserting fields one at a time silently lets a new, untested field slip through. Sub-issue 4 adds noise that makes reviewers ask "why does this exist" instead of reviewing the actual behavior under test. Sub-issue 6 is a real, named team norm — resolving it wrong repeatedly erodes trust that concerns were actually addressed. Note also [[02 Explicit Failure Over Silent Fallbacks]]: the #5268 bug (logged-out user path never tested) is this same "what should the test actually cover" question, just with a bigger blast radius.

## How to fix
- Ask "is this edge case reachable in normal flow, or am I testing a branch?" — branches go to a unit test on the Specification/VM, not a new integration test method.
- If a cross-cutting concern (auth, oauth scope rejection) already has a dedicated integration test class, don't re-prove it per feature — link to it in a comment if reviewers ask.
- Default to `assertEqual($expected, $actual)` / `assertObjectHasPropertyStructure()` (exists at `app/tests/ExtraAssertions.php:177`, see [[03 Reuse Before You Build]]) over field-by-field asserts, unless the object is large enough that a diff would be noise.
- Every mock/stub/manual cleanup should have a one-line reason attached (in a comment or just in your own head) — "what does this simulate that the real object/behavior can't." If there's no answer, delete it.
- On resolving a review conversation you didn't start: reply once, then let the starter resolve it — or explicitly say "resolved, ping if you still have concerns" so it surfaces without relying on the (non-notifying) resolve button.
- **Explicit checklist item for logged-out / anonymous flows**: whenever a feature touches something conditionally available to authenticated users, add a test case for the unauthenticated path before shipping — this is the direct lesson from #5268.
- Any domain code that reads the current time: use `Carbon` consistently (not native `DateTime`/`time()`), so tests can freeze or mock it — see #5335.

- Structure every test as AAA: `beforeEach`/`setUp` is for shared **Arrange** only; the **Act** call (the production function under test, e.g. `setupInstitutionField()`) goes in the test body so a reader sees what is exercised without scrolling up — see #6359.

## Related
[[00 Index]] · [[02 Explicit Failure Over Silent Fallbacks]] · [[03 Reuse Before You Build]] · [[10 PR and Team Process Hygiene]]
