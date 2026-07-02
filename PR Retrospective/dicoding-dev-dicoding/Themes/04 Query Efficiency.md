---
tags: [pr-retro, theme/performance, severity/medium]
prs: ["#5061", "#5224", "#5200"]
status: recurring
---

# Query Efficiency & Database Access Patterns

## The pattern
Looping a per-row DB call instead of one batched query, calling a gateway function that already recomputes something a sibling function just fetched, or reaching for a subquery where a join (or an existing hash-based helper) already solves it elsewhere in the same domain.

## Evidence

**PR #5061** — N+1 pattern in a console command:
> AlexzPurewoko: "Ini daripada manggil satu satu database, mending langsung jadi satu query aja bang"

**PR #5224** (heaviest query review in the whole dataset — one PR, ~10 distinct query comments from agissept):
- Redundant computation: *"Di fungsi `getActiveCoursesWithModules` udah ada fungsi `getUserActivities`, kenapa perlu dipanggil lagi ya?"*
- Wrong scope fetched: *"ini querynya kan buat ngambil list module di suatu kelas... tapi secara query dia mengambil module untuk semua kelas yang di enroll."*
- Prefer a join over two queries + array filter: *"query ini bisa dijoin dengan table `developer_journey_tutorials`... jadi ga perlu 2 query dan array filter"*
- Subquery vs. join judgment call, with a concrete existing pattern to imitate: *"untuk yang `developer_journey_trackings` coba manfaatkan `developer_journey_status_hash` seperti yang ada di `AcademyTrackingGateway::getCompletedTutorialIds`"* — and pointed out the "we use subquery because Laravel 4.2" justification wasn't actually backed by a technical reason when challenged.
- Unrelated query change smuggled into an unrelated PR: *"Query ini kayanya ga relevan dengan PR ini"* (see [[10 PR and Team Process Hygiene]]).

**PR #5200** — caching consideration flagged proactively by the reviewer, not by Krisna:
> "Fungsi ini ada banyak query, termasuk query yang di looping. Kira-kira akan seberapa sering di akses? kalo sering maka hasil dari logic ini bisa dicache aja"

## Why it matters
None of these are exotic — they're the standard "read the query plan before writing the loop" discipline. The #5224 thread in particular shows a pattern: writing the query that answers "get me data shaped like X" without first checking whether a **sibling gateway method in the same class already computes the input you need**, or whether the codebase has a **named convention for this exact join** (`developer_journey_status_hash`) that should be reused rather than re-derived.

## Root cause
Writing the gateway query against the immediate need of the current Action, without first reading the rest of the Gateway class or a sibling Gateway in the same domain for an existing, already-optimized version of the same access pattern.

## How to fix
- Before adding a new Gateway method, read the whole Gateway class (and one sibling Gateway in the same bounded context) for a method that already returns most of what you need.
- Default to a join; only reach for a subquery with a stated technical reason (and be ready to defend it with an `EXPLAIN`, not "because Laravel 4.2").
- If a loop calls the DB per-iteration, that's the signal to batch it into one query before the PR goes up — not something to wait for a reviewer to catch.
- If access frequency is unknown and the query is non-trivial, say so in the PR description proactively (cache candidate, expected QPS) instead of waiting to be asked — ties into [[10 PR and Team Process Hygiene]].

## Related
[[00 Index]] · [[05 Self-Documenting Code]] · [[10 PR and Team Process Hygiene]]
