---
tags: [pr-retro, appendix]
---

# PR Log (Source Data)

Raw inventory this retrospective is built from — `krisnasantosa15`'s authored PRs in `dicoding-dev/dicoding`, pulled via `gh pr list` + `gh api .../comments`, `.../reviews`, `.../issues/comments`. Bot-generated comments (`github-actions[bot]` QA checklists, sandbox status) were excluded from analysis. 162 human review comments across 5 reviewers were read in full (107 from the initial 2026-07-02 retrospective + 55 new in the 2026-07-14 incremental sync).

| PR | Title | State | Reviewers who commented | Themes touched |
|----|-------|-------|--------------------------|-----------------|
| [#5344](https://github.com/dicoding-dev/dicoding/pull/5344) | [Feature][Monthly Add-Ons] Add checkout/settlement integration | OPEN | — (only author's own note-to-self so far) | — |
| [#5340](https://github.com/dicoding-dev/dicoding/pull/5340) | [Feature][Monthly Add-Ons] Implement purchase initiation, persistence, and feature enrollment | OPEN | — (no comments yet) | — |
| [#5335](https://github.com/dicoding-dev/dicoding/pull/5335) | [Feature][Monthly Add-Ons] Add Phase 1 domain layer | OPEN | agissept | [[12 Aggregate Design]] (new theme), [[06 Test Discipline]] (mockable time) |
| [#5325](https://github.com/dicoding-dev/dicoding/pull/5325) | [Improvements][Campaigns] Move promotion eligibility checkers to Infrastructure Services | MERGED | — (no comments; fix PR for #5324's finding) | [[01 Actions Must Stay Thin]] |
| [#5324](https://github.com/dicoding-dev/dicoding/pull/5324) | [Feature][Campaigns] Exclude classes from bootcamp asah classroom popup | MERGED | AlexzPurewoko, dimasmds | [[01 Actions Must Stay Thin]] (UseCase vs Infrastructure Services), [[08 Naming and File Organization]], [[07 Modern PHP Idioms]] |
| [#5316](https://github.com/dicoding-dev/dicoding/pull/5316) | [Feature][Monthly Add-Ons] Add domain docs for entitlement add-ons (Sabak, Learning with AI) | MERGED | AlexzPurewoko, dimasmds | [[08 Naming and File Organization]], [[03 Reuse Before You Build]] |
| [#5290](https://github.com/dicoding-dev/dicoding/pull/5290) | [Feature][Developer Tools] Add make:ddd boilerplate generator | OPEN | AlexzPurewoko (brief) | [[01 Actions Must Stay Thin]] (continuation of #5286's generator/Specification-scope debate) |
| [#5286](https://github.com/dicoding-dev/dicoding/pull/5286) | [Feature][Developer Tools] Add make:ddd generator and docs site | MERGED | AlexzPurewoko, hasbi-ashshidiq23 | [[08 Naming and File Organization]], [[03 Reuse Before You Build]], [[07 Modern PHP Idioms]], [[01 Actions Must Stay Thin]] |
| [#5282](https://github.com/dicoding-dev/dicoding/pull/5282) | [Improvements][Dashboard] Replace isDeveloper() checks with beforeFilter('developer') | MERGED | dimasmds, AlexzPurewoko | [[08 Naming and File Organization]] (DRY constant) |
| [#5280](https://github.com/dicoding-dev/dicoding/pull/5280) | [Improvements][Dashboard] Replace Auth::guest() with beforeFilter auth | MERGED | dimasmds | follow-up scoping (JSON support for `developer` filter, deferred to another PR) |
| [#5268](https://github.com/dicoding-dev/dicoding/pull/5268) | [Bugfix][Bootcamp Asah] Restore empty check for asah modal and flags | MERGED | agissept, hasbi-ashshidiq23 | [[02 Explicit Failure Over Silent Fallbacks]], [[11 Entity Boundaries Case Study]] |
| [#5224](https://github.com/dicoding-dev/dicoding/pull/5224) | [Refactor][Academies] Replace daily check-in read Specifications with direct gateway reads | MERGED | agissept | [[04 Query Efficiency]], [[05 Self-Documenting Code]], [[07 Modern PHP Idioms]], [[10 PR and Team Process Hygiene]] |
| [#5219](https://github.com/dicoding-dev/dicoding/pull/5219) | [Feature][Campaigns] Frontend popup UI for BootcampAsah | MERGED | mochammadkevin, agissept | [[08 Naming and File Organization]] |
| [#5200](https://github.com/dicoding-dev/dicoding/pull/5200) | [Feature][Campaigns] Backend popup logic for BootcampAsah | MERGED | agissept | [[04 Query Efficiency]] |
| [#5181](https://github.com/dicoding-dev/dicoding/pull/5181) | [Feature][Daily Check-In] Make course name optional in goals | MERGED | mochammadkevin | [[02 Explicit Failure Over Silent Fallbacks]] |
| [#5175](https://github.com/dicoding-dev/dicoding/pull/5175) | [Feature][Daily Check-In] Expose milestones endpoints | MERGED | AlexzPurewoko, hasbi-ashshidiq23 | minor (type safety on request params) |
| [#5132](https://github.com/dicoding-dev/dicoding/pull/5132) | [Feature][Subscriptions] expose student subscriptions API | MERGED | agissept, hasbi-ashshidiq23 | [[07 Modern PHP Idioms]], [[09 OAuth Scopes Mental Model]], [[10 PR and Team Process Hygiene]] |
| [#5104](https://github.com/dicoding-dev/dicoding/pull/5104) | [Feature][Daily Check-In] Expose student daily check-in API | MERGED | mochammadkevin, hasbi-ashshidiq23, AlexzPurewoko, agissept | [[01 Actions Must Stay Thin]], [[06 Test Discipline]], [[09 OAuth Scopes Mental Model]] |
| [#5078](https://github.com/dicoding-dev/dicoding/pull/5078) | [Improvements][Academies] Expose student progress API | MERGED | agissept | [[01 Actions Must Stay Thin]], [[05 Self-Documenting Code]], [[06 Test Discipline]], [[08 Naming and File Organization]] |
| [#5077](https://github.com/dicoding-dev/dicoding/pull/5077) | [Improvements][Dashboards] Rename student dashboard tests | MERGED | agissept | [[10 PR and Team Process Hygiene]] |
| [#5061](https://github.com/dicoding-dev/dicoding/pull/5061) | [Feature][Commands] Add list commands for simple and premium toggles | MERGED | AlexzPurewoko | [[04 Query Efficiency]], [[08 Naming and File Organization]] |
| [#5034](https://github.com/dicoding-dev/dicoding/pull/5034) | [Improvements][Email Subscriptions] Refactor update flow and preserve unsubscribe behavior | MERGED | AlexzPurewoko | clean (approval only) |
| [#5033](https://github.com/dicoding-dev/dicoding/pull/5033) | [Feature][Dashboard] expose student dashboard api | MERGED | AlexzPurewoko, hasbi-ashshidiq23 | [[01 Actions Must Stay Thin]], [[03 Reuse Before You Build]], [[06 Test Discipline]], [[07 Modern PHP Idioms]], [[08 Naming and File Organization]], [[09 OAuth Scopes Mental Model]], [[10 PR and Team Process Hygiene]] |
| [#5017](https://github.com/dicoding-dev/dicoding/pull/5017) | [Improvement][Email Subscription] Enrich email subscription update event payload for logging | MERGED | AlexzPurewoko | [[01 Actions Must Stay Thin]] (VO reuse), [[03 Reuse Before You Build]], [[07 Modern PHP Idioms]], [[08 Naming and File Organization]] |

## Reviewer frequency (human comments, bot excluded)
- agissept — 64
- AlexzPurewoko — 56
- dimasmds — 18
- hasbi-ashshidiq23 — 15
- mochammadkevin — 9

Note the concentration: `agissept` still leads overall (drove nearly all of #5224's query-efficiency/readability feedback, the #5268 postmortem, and the new #5335 aggregate-design theme), but AlexzPurewoko closed most of the gap in the 2026-07-14 sync — driving the bulk of #5286/#5290/#5316's architecture and reuse feedback. dimasmds also jumped from the least-frequent reviewer to third, entirely from naming/layering catches in #5316 and #5324 — worth noting as a newer source of naming/architecture signal, not just agissept.

## Related
[[00 Index]]
