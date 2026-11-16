---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "The callback lives at /api/v1/forum-ai/callback and authenticates by shared bearer"
tags: [adr, decision, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# The callback lives at /api/v1/forum-ai/callback and authenticates by shared bearer

dicoding.com exposes `POST /api/v1/forum-ai/callback`, with no `auth` or `csrf` filter; the Action validates `Authorization: Bearer` against `config('forum_ai_assist.callback_auth_bearer')`.

**Revision:** an earlier draft of this ADR deviated to `/api/v1/forum-ai-assist/callback` so every URL, the config file, the routes file, the premium feature name and the domain namespace would read identically — which would have required a one-line upstream change to the AI service's `DICODING_CALLBACK_URL` default (`config.py` defaults to `/api/v1/forum-ai/callback`, matching its own router prefix). Decided against: every **URL** we expose or call mirrors the AI service's own `forum-ai` router prefix exactly, with zero upstream changes required. Internal-only names — the config file (`forum_ai_assist.php`), the routes file (`app/routes/forum-ai-assist.php`), the premium feature key (`forum-ai-assist`), the domain namespace (`ForumAiAssist`) — keep the fuller name; only URLs got pulled back to `forum-ai`.

Bearer auth was not really a choice — `callback.py` already sends `Authorization: Bearer {DICODING_CALLBACK_API_KEY}` on every attempt, so the receiver only has to check it. We deliberately did *not* copy the closest inbound-webhook precedent in this codebase: `XenditNotificationAction` performs no signature or token verification at all, a gap worth not propagating.

The Action returns `200` for an unknown or already-finalized `discussion_id` — logged as a no-op, never a 4xx or 5xx. This is dictated by the sender: `callback.py` retries only on 5xx and network errors, so a 5xx on a genuinely unknown id would retry until exhaustion, while a 4xx stops retrying but still logs a failure on their side. `200` is the only response that is both idempotent and quiet in both logs.
