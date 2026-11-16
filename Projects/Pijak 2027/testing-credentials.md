---
date: 2026-10-13
updated: 2026-10-13
type: reference
tags: [reference, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Pijak 2027 — Local Testing Credentials

Local dev only (dicoding.local). All verified against the DB at time of writing.

## Test accounts (reset — no active Pijak 2027 registration)

All 6 accounts below have had their Pijak 2027 (`program_id=2208`) data wiped
(`campaign_initial_registrations`, `scholarship_participants`, `scholarship_letters`) so
registration can be tested from Step 1 onward. Password pattern: the email's local part
(before `@`) + `12345`.

| Email | Password | user_id | Notes |
|---|---|---|---|
| intensive@dicoding.local | intensive12345 | 299 | Pre-existing Dicoding user, password reset for this round of testing. |
| progressive@dicoding.local | progressive12345 | 300 | Newly created this round (`users`/`points`/`xps` rows inserted). |
| noteligible@dicoding.local | noteligible12345 | 301 | Newly created this round (`users`/`points`/`xps` rows inserted). |
| pijakintensive@dicoding.local | pijakintensive12345 | 296 | Pre-existing, previously used this session; Pijak 2027 data wiped and password reset. |
| pijakprogressive@dicoding.local | pijakprogressive12345 | 297 | Pre-existing, previously used this session; Pijak 2027 data wiped and password reset. |
| pijaknoteligible@dicoding.local | pijaknoteligible12345 | 298 | Pre-existing, previously used this session; Pijak 2027 data wiped and password reset. |

Any brand-new user created for this purpose needs `points`/`xps` rows (value=0) inserted
manually — without them, the global nav's user submenu throws
`Attempt to read property "value" on null` on **any** page load, not just Pijak's.

## Other pre-existing accounts (not part of the 6, left as-is)

| Email | Password | user_id | Category | Notes |
|---|---|---|---|---|
| admin@dicodinglocal.com | admin123 | 2 | `progressive` | Stale enum value from before the `PROGRESSIVE`→`PROGRESSIVE_ELIGIBLE` rename. Still reads as "not Intensive" everywhere, but doesn't match the current `progressive_eligible` string — cosmetic mismatch, not a live bug. |
| ayub@dicodinglocal.com | test12345 | 3 | `intensive_eligible` | Correct current enum value, but no `city_name` in `other_requirements` (see known issue below). |
| test@dicoding.local | test12345 | 284 | *(not registered for Pijak 2027)* | Has `campaign_initial_registrations` rows for other programs but none for program_id 2208. Visiting `/pijak2027/registration` shows the empty form. |

## Administration-step staged-submit accounts (2026-09-29)

Used to verify the 3-stage reveal on `/pijak2027/registration/administration` (IBM account, then
IBM course question, then assessment test + commitment letter for intensive).

| Email | Password | user_id | State | Notes |
|---|---|---|---|---|
| pijak-intensive-2027@dicoding.local | pijak-intensive-202712345 | 312 | Intensive, IBM account and course question both saved (course answer `0`) | Password reset on 2026-09-29 (original was unknown). To re-test from stage 1, remove the keys `ibm_account_email`, `ibm_account_org_agreement`, `has_completed_at_least_one_ibm_course` from `scholarship_participants.other_requirements` for `program_id=2208`. |
| pijakprogressive@dicoding.local | pijakprogressive12345 | 297 | Progressive, IBM account and course question both saved (course answer `1`) | Submitted by hand on 2026-09-29, so it is no longer a "clean" account despite the section above. |

Stage gates: stage 2 (course question) is stored as the presence of `has_completed_at_least_one_ibm_course`,
so answering "Tidak" (`'0'`) also unlocks the next stage.

## Program config reference (`scholarships.pijak` in `app/config/local/scholarships.php`)

- `program_id`: 2208
- `age_reference_date`: 2027-02-01 (used for the Intensive age 18-34 check)
- `registration_closed_at`: 2026-12-31 23:59:59
- `token_packages[1].course_ids`: `[86]` — local stand-in for the assessment/exam course (production id is 887)

## Known issue: `city_name` missing on older test participants blocks commitment-letter generation

`PijakCommitmentScholarshipLetter::validateParams()` requires `city_name` (derived from
`city_id` by `PijakGateway::saveRegistration()` at registration time) to generate the
commitment letter. Several *older* local participant rows (registered before this was
wired correctly) have `city_id` but no `city_name`, which makes the "Buat Ulang" button on
the Step 1 preview page fail forever with "Maaf, surat belum dibuat." Confirmed via
`deck artisan logs:read` (`InvariantException: city name wajib diisi.`). Not a bug in
current code — any of the 6 reset accounts above, registering fresh through the real form,
will get `city_name` populated correctly.

## Scenario mapping for E2E test run (2026-09-22)

Re-verified via direct DB query (`campaign_initial_registrations`/`scholarship_participants`,
`program_id=2208`) right before this round: all 9 accounts below (the 6 reset + `admin`/`ayub`/`test`)
have **zero rows** for Pijak 2027 — the 6 reset accounts are confirmed still clean, matching this
file's existing claim.

| Role | Scenario | Account | user_id | Notes |
|---|---|---|---|---|
| A | Intensive — accept offering, full happy path | intensive@dicoding.local | 299 | |
| B | Progressive (VS-eligible) | progressive@dicoding.local | 300 | |
| C | Not Eligible | noteligible@dicoding.local | 301 | |
| D | Intensive — reject/ignore offering (fallback to Progresif) | pijakintensive@dicoding.local | 296 | Separate from A so accept-path and reject-path don't collide on the same user. |
| E | Referrer — must stay unregistered for Pijak 2027 throughout | test@dicoding.local | 284 | Confirmed via DB: no `campaign_initial_registrations` row for program 2208. Do **not** register this account during the test run — its entire purpose is staying unregistered. |
| F | Referral registrant — registers via `?ref={user_id of E}` | pijakprogressive@dicoding.local | 297 | Category choice doesn't matter for this test (only `referrer_id` capture is being verified); registering with a Progressive-eligible combo is fine. |
| Admin | Creates the Offering for A/D via CSV upload (admin panel) | admin@dicodinglocal.com | 2 | Has admin role; its own stale Pijak `category=progressive` value is irrelevant to its admin capability. |
| Spare | Unused backup | pijaknoteligible@dicoding.local | 298 | Reserve in case any of the 6 needs a redo without re-wiping. |

Recommended run order (fewest admin-dependent steps first): **C → B → F (referral, using E as referrer) → A → D**.
A and D both require an admin-created Offering (CSV upload) partway through, so they're sequenced last.

## Announcement-page state preview accounts (2026-09-24)

Created for visually QA-ing every state of `/pijak2027/registration/announcement`
without re-registering or manually flipping DB fields each time. All password:
`test12345`. All `category=progressive_eligible` (used as a shortcut regardless of
label, since the `offering/*` blades never actually check category — see
`implementation-gathering.md` §22 for why this matters) except where noted.

| Email | user_id | State | Setup notes |
|---|---|---|---|
| pijak-menunggu@dicoding.local | 302 | Menunggu Hasil Seleksi | No `scholarship_offerings` row |
| pijak-noteligible@dicoding.local | 303 | Not Eligible — final rejection | `category=not_eligible` |
| pijak-dapatoffering@dicoding.local | 304 | Dapat Offering (Terima/Tolak buttons) | `scholarship_offerings.status=not_confirmed`, `due_date` +2 days |
| pijak-terimaoffering@dicoding.local | 305 | Terima Offering (Cohort Data form, not yet submitted) | `status=accepted`, no `scholarship_cohorts` row |
| pijak-tolakoffering@dicoding.local | 306 | Tolak Offering | `status=rejected` |
| pijak-diterima@dicoding.local | 307 | Progressive — Menunggu (correct baseline, see implementation-gathering.md §22) | Deliberately **no** offering/cohort row. To temporarily demo `accepted.blade.php`: insert a `scholarship_cohorts` row + `deck artisan feature:toggle enable pijak-final-selection-result --users=307`, then **delete the cohort row and disable the toggle again afterward** — this is a demo-only workaround for a known structural gap, not a real state |
| pijak-offeringexpired@dicoding.local | 308 | Offering Kadaluarsa | `status=not_confirmed`, `due_date` in the past |
| pijak-cohortsubmitted@dicoding.local | 309 | After submitting Cohort Data form | `status=accepted` + `scholarship_cohorts` row exists |

Each account also needs `points`/`xps` rows (value=0) and a `campaign_initial_registrations`
row (`is_completed=1`) — see the general note above about the global nav crash without
`points`/`xps`. `other_requirements` includes `ibm_account_email` +
`has_completed_at_least_one_ibm_course=1` so the administration step auto-completes.

**Switching accounts across tabs**: all tabs in the same browser context share the session
cookie. Log out/in on the specific tab you want to change; do **not** reload any other tab
that's already showing a different state, since a reload re-fetches with whichever account
is currently logged in.

## Known bug: "Salin tautan" (copy referral link) button doesn't respond to real clicks

The click handler is confirmed present and correctly wired in the built bundle
(`setupCopyReferralLink()`, verified by inspecting the minified output), and clicking it via
a manually re-attached listener with identical logic works correctly (clipboard write
succeeds, class toggles). But clicking the actual page's button via a real user-trusted
click does **not** toggle the `.copied` class on either the Intensive or Progressive preview
pages. Something likely replaces or detaches the button from the DOM between
`DOMContentLoaded` (when the listener attaches) and when the user can click it — root cause
not identified, needs further investigation.
