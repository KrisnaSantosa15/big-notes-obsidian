---
tags: [pr-retro, theme/business-rules, severity/medium]
prs: ["#5966", "#6021", "#6126", "#6169", "#6286"]
status: new 2026-11-18, already recurring (5 PRs, 4 reviewers)
---

# Enforce Business Rules on the Server

## The pattern
A business rule (who gets an announcement, when registration opens, age limit, allowed education values) is enforced only in a place the user can influence: the frontend, a per-user feature toggle, or a config date the UI reads. The server accepts anything a crafted request sends.

## Evidence

### 2026-11-18 — PR #6021, #6169, #6126, #5966, #6286 (incremental sync)

**Feature toggles used as business state. Flagged by two reviewers on two PRs.**

PR [#6021](https://github.com/dicoding-dev/dicoding/pull/6021) (`PijakProgressiveAnnouncementSpecification`) — AlexzPurewoko:
> "Btw ada reason khusus kah dalam menggunakan feature toggle per user ini untuk announcement ? Btw ngga pake implementasi dalam record registrasi saja? Soalnya kalau pake feature:toggle, itu selain memang digunakan untuk A/B test atau memang ujicoba, mekanisme toggle ini bisa diaktivasi untuk ditarget global (semua) user sih"

PR [#6169](https://github.com/dicoding-dev/dicoding/pull/6169) (`PijakNotSelectedAnnouncementSpecification`) — dimasmds:
> "Kenapa pendekatannya pakai feature flag bang? Apakah ini mereferensi dari campaign sebelumnya? Soalnya kalo pakai feature flag, bukannya bisa dikontrol dari sisi user juga? ada URL khusus untuk nyalain/matiin flag-nya."

**Date gates only in the UI.** PR [#6126](https://github.com/dicoding-dev/dicoding/pull/6126) (`config/scholarships.php`) — Najibsaurus:
> "Registrasinya kan dibuka pada tanggal 12 November nih ya. Apa yang terjadi ketika halaman dibuka? ini aturan rule atau cuma adjustment untuk UI saja?" ... "Dulu sih cuma FE-nya aja yang ditutup. kalo kebuka ya bolong. engga ada guard setelahnya."

He also told a story about an earlier time-gated feature that showed activity in monitoring before its open time.

**Client-only validation.** PR [#5966](https://github.com/dicoding-dev/dicoding/pull/5966) (`birth-date-warning.ts`) — dimasmds: "kalo di backend apakah ada pengecekan umur juga?"

PR [#6286](https://github.com/dicoding-dev/dicoding/pull/6286) — mochammadkevin (merged with nits):
> "Education level validation (`PijakRegistrationData.php:32`): The server currently only validates that `last_education_level` is a string, without checking whether its value matches one of the available form options. It also accepts and stores the `last_education_*` fields from manually crafted requests..."

## Why it matters
Feature toggles in this codebase can be flipped per user through a URL, so using one as "who is selected" or "who sees the announcement" is a rule anyone can switch on for themselves. A date or option list enforced only in JS is a suggestion; a direct POST skips it.

## Root cause
Treating the UI as the system boundary. The real boundary is the request the server receives.

## How to fix
- Business state (selected or not, announced or not) lives in a domain record (the registration row), not a feature toggle. Toggles are for rollout/A-B only.
- Every date/time gate, age limit, or allowed-values list shown in the UI has a matching server check (spec validation rule like `in:`/`enum:`, or an aggregate invariant), plus a test that posts a crafted request.
- Self-check before a PR: "if I `curl` this endpoint directly with bad values or outside the window, what happens?"

## Related
[[00 Index]] · [[02 Explicit Failure Over Silent Fallbacks]] · [[06 Test Discipline]]
