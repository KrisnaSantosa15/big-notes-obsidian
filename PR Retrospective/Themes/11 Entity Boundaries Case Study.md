---
tags: [pr-retro, theme/domain-modeling, severity/medium]
prs: ["#5268"]
status: unresolved debate
---

# Entity Boundaries: Bootcamp vs Asah (Case Study)

## The pattern
A single PR (#5268) surfaced a genuine architecture judgment call, not a clear-cut mistake: Bootcamp and Asah were implemented as one merged concept (shared components, shared style, shared eligibility logic) even though two reviewers independently read them as different entities.

## Evidence
> hasbi-ashshidiq23: "aku mau nanya secara general kenapa bootcamp dan asah ini di gabungkan... aku nangkepnya bootcamp dan asah ini adalah entitas yang berbeda... concernnya ketika nanti ada perubahan terkait requirement bootcamp only atau asah only, ini jadi nyangkut ke dua2nya"

Krisna's stated rationale: "Ini sebetulnya sengaja... karena kebanyakan overlaping isinya. Jadi bayanganku daripada bikin banyak hal yang isinya sama-sama aja lebih baik disatukan."

Pushback on the *precedent* this sets: "dijadiin general aja sekalian kalo concernnya kebanyakan overlapping, kalo gini jadinya nambah 1 tambahan overlapping lagi yg asalnya ada pijak, elevate, sekarang ditambah bootcamp-asah" — i.e. this is the third program merged this way, and each merge makes the *next* separation harder.

agissept's resolution reframed it as the team's continuous-refactoring norm: unify now because the overlap is real today; if a genuine `bootcamp-only` or `asah-only` requirement shows up later, split it then — **don't preserve unnecessary duplication now to hedge against a divergence that hasn't happened yet.**

## Why this is worth its own note
This is not a "Krisna did it wrong" case — it's a real trade-off (YAGNI-style consolidation vs. premature coupling) that the team resolved through discussion rather than a rule. It's included here because the *same* pattern (two logically separate promotional programs sharing one code path) recurred within the same PR's sibling bug (see [[02 Explicit Failure Over Silent Fallbacks]]): the shared `isEmpty`/`?? false` fix for one program's flag risked leaking into the other's behavior, which is exactly the coupling risk hasbi flagged.

## How to apply next time
- When merging two things because "the overlap is big right now," name the overlap explicitly in the PR description and state what would trigger a split (a concrete future requirement, not just "if they diverge").
- Prefer merging at the *presentation* layer (shared Blade partial, shared CSS) over merging at the *domain/eligibility-logic* layer — UI overlap is cheap to duplicate later; business-rule coupling is not.
- If a reviewer names a "this makes the Nth thing merged into one bucket" pattern (pijak, elevate, now bootcamp-asah), that's a signal worth taking seriously even if the immediate PR's merge is still the right call — track it, don't dismiss it as scope creep.

## Related
[[00 Index]] · [[02 Explicit Failure Over Silent Fallbacks]] · [[10 PR and Team Process Hygiene]]
