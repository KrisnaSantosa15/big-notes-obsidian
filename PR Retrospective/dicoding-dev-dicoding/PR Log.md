---
tags: [pr-retro, appendix]
---

# PR Log (Source Data)

Raw inventory this retrospective is built from — `krisnasantosa15`'s authored PRs in `dicoding-dev/dicoding`, pulled via `gh pr list` + `gh api .../comments`, `.../reviews`, `.../issues/comments`. Bot-generated comments (`github-actions[bot]` QA checklists, sandbox status) were excluded from analysis. 107 human review comments across 6 reviewers were read in full.

| PR | Title | State | Reviewers who commented | Themes touched |
|----|-------|-------|--------------------------|-----------------|
| [#5286](https://github.com/dicoding-dev/dicoding/pull/5286) | [Feature][Developer Tools] Add make:ddd generator and docs site | OPEN | — (no comments yet) | — |
| [#5282](https://github.com/dicoding-dev/dicoding/pull/5282) | [Improvements][Dashboard] Replace isDeveloper() checks with beforeFilter('developer') | OPEN | dimasmds, AlexzPurewoko | [[08 Naming and File Organization]] (DRY constant) |
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
- agissept — 58
- AlexzPurewoko — 25
- hasbi-ashshidiq23 — 11
- mochammadkevin — 9
- dimasmds — 4

Note the concentration: `agissept` alone accounts for over half of all review comments, and single-handedly drove nearly all of #5224's query-efficiency and readability feedback plus the #5268 postmortem. Worth pairing more closely on architecture/query-review specifically before opening a PR, given that's where the density of feedback sits.

## Related
[[00 Index]]
