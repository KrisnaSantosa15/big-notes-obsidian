---
tags:
  - pr-retro
  - theme/process
  - severity/medium
prs:
  - "#5077"
  - "#5224"
  - "#5033"
  - "#5132"
  - "#5769"
  - "#5779"
  - "#6030"
  - "#6141"
  - "#6230"
  - "#6256"
  - "#6286"
  - "#6299"
  - "#6385"
status: recurring
---

# PR & Team Process Hygiene

## The pattern
Four related process misses, none about code correctness: scope creep inside a PR, staying stale relative to `master`, and introducing team-wide conventions unilaterally instead of socializing them first.

## Evidence

**Scope creep — unrelated changes bundled into a differently-titled PR:**
- **PR #5077**, titled "Rename student dashboard tests," also touched `guidelines/rest-api.md`. agissept: "judul PRnya kan Rename student dashboard tests, tapi di changesnya ada perubahan terkait convention yang tidak terkait dengan test, apakah ini intended?"
- **PR #5224**: "Query ini kayanya ga relevan dengan PR ini."

**Introducing a new team convention without buy-in:**
- **PR #5033** added `guidelines/rest-api.md` with prescriptive routing rules the team hadn't actually agreed to:
> "Btw ini merefer ke dokumentasi yang mana kah bang? Soalnya sampai sekarang pun kita tidak mengadopsi rule ini, dan akupun baru tahu ada rule khusus seperti ini."
The same doc also had internal inconsistencies caught in review (`/bank-accounts/me` vs the doc's own stated pattern, a duplicated rule line, a rule stated without an example). The reviewer's resolution was pragmatic, not a rejection: "yang di doc ini bisa diedit di next PR aja" — but the underlying issue (documenting a convention as if already adopted) is the one worth fixing at the source.

**Stale branch / not rebasing before requesting merge:**
- **PR #5077**: "minta tolong di rebase dulu ya"
- **PR #5132**: "Coba di rebase dulu"


### 2026-11-18 — PR #5769, #5779, #6030, #6141, #6230, #6256, #6385 + conflict pings (incremental sync)

**Recurring.** Three sub-patterns:

**1. One Specification per PR; draft until ready.** PR [#6256](https://github.com/dicoding-dev/dicoding/pull/6256) — agissept:
> "Ini kalo aku liat ada 3 specification dalam 1 PR, yang mana harusnya 1 PR hanya ada 1 specification. Tolong diperbaiki dulu ya." / "kalo belum ready bisa di draft dulu"

**2. Stale branches and build churn.** Reviewers had to ask for a rebase or conflict fix on #5671, #5851, #6190, #6230, #6249 (twice), #6256 (twice), #6299 (twice), #6326. PR [#6230](https://github.com/dicoding-dev/dicoding/pull/6230) — AlexzPurewoko: "Karena file buildnya wow, bisakah rebase dulu sekali lagi buat di merge terlebih dahulu bang?" Habit: rebase and rebuild right before requesting review.

**3. Confirm with stakeholders, fill the QA checklist, discuss naming before the PR.**
- QA checklist: PR [#5769](https://github.com/dicoding-dev/dicoding/pull/5769) / [#5779](https://github.com/dicoding-dev/dicoding/pull/5779) — dimasmds: "jangan lupa next untuk PR QA checklist diisi, walau implementasi di gateway saat ini baru stub."
- Discuss first: PR [#6030](https://github.com/dicoding-dev/dicoding/pull/6030) — dimasmds: "Menurutku bisa raise diskusi dulu sebelum PR sih bang. Campaign ada kebutuhan aaaa, masalahnya bbbb, propose-ku cccc, alasannya dddd."
- Stakeholder confirmation: PR [#6385](https://github.com/dicoding-dev/dicoding/pull/6385) — dimasmds: "timezone fallback ke WIB ini perlu dikonfirmasi ke stakeholder, biar terinfo." PR [#6141](https://github.com/dicoding-dev/dicoding/pull/6141) — Najibsaurus: "need confirm: 1000 itu batas anggota grup WA-nya, atau batas berapa orang yang sanggup didampingi satu fasil?" PR #6286 — "Mungkin bisa ditanyakan ke stakeholder contoh kayak aku yang lulusan Madrasah Aliyah pilihnya apa?~"

## Why it matters
None of these are hard to fix — they're all about a final pre-submit pass most PRs here were missing. Scope creep forces reviewers to context-switch onto something the PR title didn't prepare them for, and makes `git blame`/PR history misleading later (a rename PR that quietly changes conventions makes both harder to find). A convention doc merged without team consensus creates a false "this is policy" signal for anyone who reads it later, exactly what tripped up the reviewer here (`akupun baru tahu`).

## How to fix
- Before opening a PR: diff review against the PR title — does every changed file trace back to what the title says? If not, split it out or update the title to be honest about full scope.
- New guideline/convention docs (`guidelines/*.md`, ADRs) are a proposal, not a fact — land them as a draft PR explicitly asking for team sign-off (or raise it in the team channel first), don't merge prescriptive "rules" as a side effect of an unrelated feature PR.
- Rebase against `master` before asking for a final review pass, not after — a stale branch adds a review round-trip that's pure overhead.
- Note the culture context from #5268 worth carrying forward explicitly: this team practices **continuous refactoring** — improvements happen inline when you spot them, not batched into a separate "cleanup" pass. That's a green light for [[07 Modern PHP Idioms]]-style fixes as you touch a file, but it does *not* extend to unilaterally landing new team-wide conventions — those still need consensus, per the point above.

## Related
[[00 Index]] · [[11 Entity Boundaries Case Study]]
