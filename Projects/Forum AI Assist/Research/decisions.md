---
date: 2026-10-13
updated: 2026-10-13
type: research
tags: [research, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Forum AI Assist — Decision Log

> **Superseded — historical record only.** These decisions have been promoted to `docs/domains/forum-ai-assist/adr/`, where several were revised after the implementation plan was verified against the codebase. Where the two disagree, the ADRs win. Notably: the trigger event is `AcademyDiscussionWasCreated`, not a discussion-created-with-opt-in event (ADR-0002); the callback path is `/api/v1/forum-ai-assist/callback` (ADR-0006); and the table is `forum_ai_assist_answers` (ADR-0001).

Running log of decisions and open questions from the Forum AI Assist grilling session. Not a spec — captures *what was decided/parked and why*, in the order it came up. References `docs/domains/forum-ai-assist/prd.md` (product spec) and the AI-service-side implementation in [forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist) (already largely built — see prior session summary).

## Resolved

- **Naming**: keep "Forum AI Assist" as the canonical name everywhere (code + docs). Do not reuse "bot"/"Discussion Bot" terminology — that's an unrelated legacy feature (pre-submission suggestion + feedback, no AI generation) and stays untouched. See `context.md`.
- **Data model — dedicated entity, not a `DiscussionComment`.** The AI answer gets its own table (e.g. `forum_ai_answers`), separate from `course_discussion_comments_new`. Reasons: comments are inherently repliable via `parent_id` nesting (AI answer must never be repliable, FR-18); comments' status enum is active/deleted/spam only, AI answer needs `processing/answered/error` + moderator-deleted; feedback shape differs (helpful/not-helpful + qualitative text vs. upvote/downvote); at most one AI answer per discussion vs. many comments (FR-20 — AI never answers thread replies).
- **Module placement — top-level `Dicoding/Domain/ForumAiAssist`, not nested under `DeveloperJourney`.** Precedent split: `ExplainWithAI` is nested under `DeveloperJourney` but is thin (2 aggregates, one tutorial page). `StudentChatbot` is top-level despite being just as course/module-tied as Discussions, because it's a full bounded context (sessions, quota, external AI gateway) that references `Classroom` only by ID. Forum AI Assist's scope (quota, async callback receiver, feedback, moderation + audit log, AI service gateway) matches StudentChatbot's shape, not ExplainWithAI's. `ForumAiAssist` references `Discussion` only by `discussion_id`, same seam.

- **Trigger mechanism — `ShouldQueue` listener on a discussion-created-with-opt-in event, mirroring `NewDiscussionCommentNotification` (`Dicoding/Infrastructure/NotificationV2/Listeners/Academies/NewDiscussionCommentNotification.php`), not an inline call inside the create-discussion request.** By the time the listener fires (on beanstalkd), the discussion is already committed, so a failed/slow AI Service call can't fail discussion creation (NFR-03) and the create-discussion request returns immediately (NFR-01). The listener's own HTTP call to `/forum-ai/process` is itself fast (AI Service returns `202` and processes async internally) so the queue worker isn't tied up.

- **Callback auth — shared-secret Bearer token, not open like the Xendit webhook precedent.** Not actually a live choice: the AI Service side (`app/products/forum/callback.py:38-41`) already sends `Authorization: Bearer {DICODING_CALLBACK_API_KEY}` on every callback attempt. dicoding.com's `/api/v1/forum-ai/callback` receiver must validate that header against a matching config value (e.g. `forum_ai_assist.callback_api_key`) — the mirror of the existing outbound `explain_with_ai.dcd_auth_bearer` pattern. Checked `XenditNotificationAction`/`XenditNotificationSpecification` first (closest inbound-webhook precedent) and found no signature/token verification at all — deliberately not copying that gap here since the AI Service already expects a Bearer check on this endpoint.

## Open / Parked

(none yet — interview in progress)
