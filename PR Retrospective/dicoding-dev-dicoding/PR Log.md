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


## 2026-08-24 Update

Full rescan added 11 new PRs with reviewer feedback:

| [#5621](https://github.com/dicoding-dev/dicoding/pull/5621) | [Bugfix][Daily Add-Ons] Remove em dashes from sabak checkout labels | MERGED | — (no comments) | — |
| [#5620](https://github.com/dicoding-dev/dicoding/pull/5620) | [Bugfix][Daily Add-Ons] Send activation email for promo bundle grants | MERGED | AlexzPurewoko | feature scope |
| [#5612](https://github.com/dicoding-dev/dicoding/pull/5612) | [Feature][Subscriptions] Add SABAKPLUS30 promo bundle code | MERGED | dimasmds | [[10 PR and Team Process Hygiene]] |
| [#5596](https://github.com/dicoding-dev/dicoding/pull/5596) | [Improvements][Sabak] Update plan copy | MERGED | dimasmds | [[08 Naming and File Organization]] |
| [#5593](https://github.com/dicoding-dev/dicoding/pull/5593) | [Feature][Daily Add-Ons] Token issuance — create domain layer | OPEN | AlexzPurewoko | [[12 Aggregate Design]], [[03 Reuse Before You Build]], [[08 Naming and File Organization]] |
| [#5592](https://github.com/dicoding-dev/dicoding/pull/5592) | [Improvements][Daily Add-Ons] Keep grant() event raising inside the aggregate | MERGED | dimasmds | [[12 Aggregate Design]] |
| [#5588](https://github.com/dicoding-dev/dicoding/pull/5588) | [Feature][Daily Add-Ons] Bundle add-on entitlement via promo code | MERGED | dimasmds | [[07 Modern PHP Idioms]] |

Plus 4 PRs with no substantive comments (#5621, #5598, #5582, #5539) — added for completeness.

Updated frontmatter for themes: [[12 Aggregate Design]] (new: #5593, #5592), [[08 Naming and File Organization]] (new: #5596, #5593), [[07 Modern PHP Idioms]] (new: #5588), [[03 Reuse Before You Build]] (new: #5593, #5282).


---

## 2026-09-01 Update

| PR | Title | State | Reviewers who commented | Themes touched |
|----|-------|-------|--------------------------|-----------------|
| [#5630](https://github.com/dicoding-dev/dicoding/pull/5630) | [Feature][Daily Add-Ons] Token issuance — edit, domain layer | OPEN | — (self-directed refactor, no new external comments this round) | [[12 Aggregate Design]] |
| [#5626](https://github.com/dicoding-dev/dicoding/pull/5626) | [Feature][Daily Add-Ons] Token issuance — create, infra + web/UI | OPEN | AlexzPurewoko | [[07 Modern PHP Idioms]], [[01 Actions Must Stay Thin]] |

Updated frontmatter for themes: [[07 Modern PHP Idioms]] (new: #5626), [[01 Actions Must Stay Thin]] (new: #5626), [[12 Aggregate Design]] (new: #5630).


---

## 2026-11-18 Update (incremental, 109 PRs updated since 2026-08-24)

Only PRs with substantive human feedback are listed. The rest (approval-only "lgtm"/"GGWP", conflict pings, or no comments) were scanned but touched no theme.

| PR | Title | State | Reviewers | Themes touched |
|----|-------|-------|-----------|----------------|
| [#6402](https://github.com/dicoding-dev/dicoding/pull/6402) | Record failed registration confirmation emails in failed_jobs | MERGED | dimasmds | [[02 Explicit Failure Over Silent Fallbacks]] |
| [#6385](https://github.com/dicoding-dev/dicoding/pull/6385) | Keep Indonesian citizens living abroad eligible | MERGED | dimasmds | [[10 PR and Team Process Hygiene]] |
| [#6356](https://github.com/dicoding-dev/dicoding/pull/6356) | Update the registration email copy | MERGED | mochammadkevin | [[08 Naming and File Organization]] |
| [#6326](https://github.com/dicoding-dev/dicoding/pull/6326) | Send offerings from the React admin page again | MERGED | Najibsaurus | [[06 Test Discipline]] |
| [#6318](https://github.com/dicoding-dev/dicoding/pull/6318) | Add the domain for importing lecturer mappings from CSV | MERGED | Najibsaurus | [[08 Naming and File Organization]] |
| [#6312](https://github.com/dicoding-dev/dicoding/pull/6312) | Forbid users without privileges from searching users | MERGED | Najibsaurus | [[06 Test Discipline]], [[02 Explicit Failure Over Silent Fallbacks]] |
| [#6301](https://github.com/dicoding-dev/dicoding/pull/6301) | Let admins remove students from a lecturer | MERGED | agissept | [[02 Explicit Failure Over Silent Fallbacks]], [[04 Query Efficiency]], [[06 Test Discipline]] |
| [#6300](https://github.com/dicoding-dev/dicoding/pull/6300) | Add the domain for unmapping a student from a lecturer | MERGED | agissept | [[12 Aggregate Design]], [[04 Query Efficiency]], [[02 Explicit Failure Over Silent Fallbacks]] |
| [#6286](https://github.com/dicoding-dev/dicoding/pull/6286) | Add IT background and last education questions | MERGED | Najibsaurus, mochammadkevin | [[13 Enforce Business Rules on the Server]], [[10 PR and Team Process Hygiene]] |
| [#6256](https://github.com/dicoding-dev/dicoding/pull/6256) | Import participants from a CSV with a preview | MERGED | agissept | [[10 PR and Team Process Hygiene]], [[12 Aggregate Design]], [[04 Query Efficiency]], [[07 Modern PHP Idioms]], [[01 Actions Must Stay Thin]] |
| [#6254](https://github.com/dicoding-dev/dicoding/pull/6254) | Add the domain for importing students from a CSV | MERGED | AlexzPurewoko | [[08 Naming and File Organization]], [[12 Aggregate Design]], [[04 Query Efficiency]], [[05 Self-Documenting Code]] |
| [#6249](https://github.com/dicoding-dev/dicoding/pull/6249) | Let admins add a student to a campaign by email | MERGED | AlexzPurewoko, hasbi-ashshidiq23 | [[02 Explicit Failure Over Silent Fallbacks]], [[07 Modern PHP Idioms]], [[03 Reuse Before You Build]] |
| [#6248](https://github.com/dicoding-dev/dicoding/pull/6248) | Add the domain for adding a student to a campaign | MERGED | AlexzPurewoko | [[08 Naming and File Organization]], [[03 Reuse Before You Build]] |
| [#6241](https://github.com/dicoding-dev/dicoding/pull/6241) | Shorten announcement copy and localize welcome image | MERGED | Najibsaurus, dimasmds, mochammadkevin | [[03 Reuse Before You Build]] (CDN) |
| [#6230](https://github.com/dicoding-dev/dicoding/pull/6230) | Sync cohort students missing from the campaign | MERGED | AlexzPurewoko, hasbi-ashshidiq23 | [[01 Actions Must Stay Thin]], [[08 Naming and File Organization]], [[03 Reuse Before You Build]], [[10 PR and Team Process Hygiene]] |
| [#6218](https://github.com/dicoding-dev/dicoding/pull/6218) | Add the participants page to the program dashboard | MERGED | dimasmds | [[05 Self-Documenting Code]] |
| [#6207](https://github.com/dicoding-dev/dicoding/pull/6207) | Enroll students into the APD campaign after the cohort form | MERGED | Najibsaurus, hasbi-ashshidiq23, alfianyusufabdullah | [[02 Explicit Failure Over Silent Fallbacks]] |
| [#6190](https://github.com/dicoding-dev/dicoding/pull/6190) | Add the participant enrollment domain | MERGED | hasbi-ashshidiq23 | clarification only |
| [#6170](https://github.com/dicoding-dev/dicoding/pull/6170) | Guard Pijak 2027 routes with pijak2027 flag | MERGED | agissept | [[03 Reuse Before You Build]] |
| [#6169](https://github.com/dicoding-dev/dicoding/pull/6169) | Announce not selected participants via command | MERGED | dimasmds | [[13 Enforce Business Rules on the Server]] |
| [#6141](https://github.com/dicoding-dev/dicoding/pull/6141) | Assign registrants to a facilitator WhatsApp group | MERGED | Najibsaurus | [[06 Test Discipline]], [[04 Query Efficiency]], [[10 PR and Team Process Hygiene]] |
| [#6126](https://github.com/dicoding-dev/dicoding/pull/6126) | Show when registration opens before it opens | MERGED | Najibsaurus | [[13 Enforce Business Rules on the Server]] |
| [#6031](https://github.com/dicoding-dev/dicoding/pull/6031) | Re-offer request domain rules | MERGED | agissept | [[12 Aggregate Design]] |
| [#6030](https://github.com/dicoding-dev/dicoding/pull/6030) | Reject IBM account emails that were used before | MERGED | dimasmds | [[08 Naming and File Organization]], [[06 Test Discipline]], [[10 PR and Team Process Hygiene]] |
| [#6023](https://github.com/dicoding-dev/dicoding/pull/6023) | Fix unauthenticated registration page layout parity | MERGED | alfianyusufabdullah | [[01 Actions Must Stay Thin]] |
| [#6021](https://github.com/dicoding-dev/dicoding/pull/6021) | Announce progressive participants per batch | MERGED | AlexzPurewoko | [[13 Enforce Business Rules on the Server]], [[06 Test Discipline]] |
| [#5966](https://github.com/dicoding-dev/dicoding/pull/5966) | Timezone input, birth date warning, and source label | MERGED | dimasmds | [[13 Enforce Business Rules on the Server]] |
| [#5963](https://github.com/dicoding-dev/dicoding/pull/5963) | Conditional institution field by participant status | MERGED | dimasmds | [[07 Modern PHP Idioms]] (JS) |
| [#5947](https://github.com/dicoding-dev/dicoding/pull/5947) | Submit administration requirements in stages | MERGED | agissept | [[06 Test Discipline]] |
| [#5941](https://github.com/dicoding-dev/dicoding/pull/5941) | Restyle administration step as checklist cards | MERGED | AlexzPurewoko | [[07 Modern PHP Idioms]] (`@class`) |
| [#5937](https://github.com/dicoding-dev/dicoding/pull/5937) | Registration form quick fixes | MERGED | dimasmds | [[07 Modern PHP Idioms]] (JS) |
| [#5851](https://github.com/dicoding-dev/dicoding/pull/5851) | Redesign announcement emails to match approved draft | MERGED | AlexzPurewoko | [[03 Reuse Before You Build]] (cdnPath), email inline-style caution |
| [#5793](https://github.com/dicoding-dev/dicoding/pull/5793) | (Pijak registration) | MERGED | dimasmds | [[08 Naming and File Organization]], [[05 Self-Documenting Code]] |
| [#5790](https://github.com/dicoding-dev/dicoding/pull/5790) | (Pijak administrative requirement) | MERGED | dimasmds | [[12 Aggregate Design]] |
| [#5780](https://github.com/dicoding-dev/dicoding/pull/5780) | (Pijak form validator) | MERGED | dimasmds | [[05 Self-Documenting Code]], [[07 Modern PHP Idioms]] |
| [#5779](https://github.com/dicoding-dev/dicoding/pull/5779) / [#5769](https://github.com/dicoding-dev/dicoding/pull/5769) | (Pijak registration domain) | MERGED | dimasmds, AlexzPurewoko | [[10 PR and Team Process Hygiene]], [[06 Test Discipline]] |
| [#5671](https://github.com/dicoding-dev/dicoding/pull/5671) | (Daily Add-Ons token redemption) | MERGED | AlexzPurewoko | [[12 Aggregate Design]], [[03 Reuse Before You Build]], [[07 Modern PHP Idioms]] |
| [#5666](https://github.com/dicoding-dev/dicoding/pull/5666) | (Daily Add-Ons token redemption domain) | MERGED | AlexzPurewoko, dimasmds, hasbi-ashshidiq23 | [[12 Aggregate Design]], [[05 Self-Documenting Code]] |
| [#5638](https://github.com/dicoding-dev/dicoding/pull/5638) | (Daily Add-Ons token index) | MERGED | AlexzPurewoko | [[04 Query Efficiency]], [[07 Modern PHP Idioms]] |
| [#5635](https://github.com/dicoding-dev/dicoding/pull/5635) | (Daily Add-Ons token edit web) | MERGED | AlexzPurewoko | [[08 Naming and File Organization]], [[06 Test Discipline]], [[03 Reuse Before You Build]] |
| [#5630](https://github.com/dicoding-dev/dicoding/pull/5630) | Token issuance, edit domain | MERGED | AlexzPurewoko | [[12 Aggregate Design]], [[01 Actions Must Stay Thin]] |
| [#5626](https://github.com/dicoding-dev/dicoding/pull/5626) | Token issuance, create infra + web | MERGED | AlexzPurewoko, dimasmds | [[03 Reuse Before You Build]], [[07 Modern PHP Idioms]] (rest logged 2026-09-01) |

## Reviewer frequency, 2026-11-18 batch (human comments, bot excluded)
- AlexzPurewoko 74, dimasmds 63, Najibsaurus 34, agissept 21, hasbi-ashshidiq23 17, mochammadkevin 7, alfianyusufabdullah 3, ikhlas-dicoding 2, furqoncreative 1.

dimasmds became the second most frequent reviewer (mostly Pijak work), and Najibsaurus is new this period with a distinct focus: business-rule edge cases and server-side guards (drove most of [[13 Enforce Business Rules on the Server]]).
