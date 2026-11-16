---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "Indexing success is verified by bounded polling, with not_indexed as the backstop"
tags: [adr, decision, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Indexing success is verified by bounded polling, with not_indexed as the backstop

After `POST /index/...` returns a `job_id`, the queued Specification polls `GET /api/v1/index/{type}/status/{job_id}` with backoff (2s → 4s → 8s → 16s, ~30s total). `done` logs the chunk count; `error` is reported as a real failure; still `queued`/`processing` at the end of the budget is logged as *unverified* and is explicitly not an alarm.

Fire-and-forget was the original plan and is wrong for a reason that only became clear once the endpoint's semantics were read carefully: a `200` from the index endpoint means "job accepted into the queue", not "content is indexed". Everything that can actually go wrong — a malformed ZIP, an embedding failure, an OOM mid-build — happens *after* that response, inside the worker, and surfaces nowhere except the status endpoint. Polling costs nothing here because the Specification already runs on beanstalkd with no user waiting.

Treating a timeout as failure would have been the naive version and would have made the check useless. The AI service runs **one global index worker**, one job at a time; during a bulk publish our job can sit in the queue for a long while with nothing wrong. An alarm that fires on every backlog gets muted within a week. So the poll distinguishes `error` (definitely broken) from `queued`/`processing` (still fine), and only the former is reported.

That leaves the gap of a job that dies after we stop watching. It is closed from the other end rather than by widening the poll: `error_code: "not_indexed"` (added to the callback contract at the same time) fires the moment a student actually asks a question on a course whose collection is missing. Proactive polling catches failures early; the reactive error code catches whatever slips past. A periodic reconciliation job that diffs all published tutorials against the index was considered and rejected as speculative — there is no evidence of index drift yet, and `not_indexed` is the signal that would justify building one.
