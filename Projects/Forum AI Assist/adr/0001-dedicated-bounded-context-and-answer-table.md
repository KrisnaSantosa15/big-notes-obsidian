---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "Forum AI Assist is its own bounded context with its own answer table"
tags: [adr, decision, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Forum AI Assist is its own bounded context with its own answer table

The AI answer lives in a dedicated `forum_ai_assist_answers` table under a top-level `Dicoding/Domain/ForumAiAssist/` namespace — not as a row in `course_discussion_comments_new`, and not nested under `Dicoding/Domain/DeveloperJourney/`.

Reusing `DiscussionComment` was the obvious shortcut and was rejected on four counts: comments nest via `parent_id`, so a comment is repliable by construction while the answer must never be (FR-18); the comment status enum is active/deleted/spam while the answer needs `PENDING`/`ANSWERED`/`ERROR`/`DELETED`; feedback shape differs (helpful/not-helpful + qualitative text vs. upvote/downvote); and cardinality differs (at most one answer per discussion vs. many comments). Placing the domain under `DeveloperJourney` was rejected on precedent: `ExplainWithAI` is nested there but is thin (two aggregates, one page), while `StudentChatbot` is top-level despite being just as course-tied, because it is a full bounded context with quota, an external AI gateway and its own lifecycle. Forum AI Assist's scope matches StudentChatbot's shape, not ExplainWithAI's.

The seam is `discussion_id` and nothing else: `ForumAiAssist` never reads or writes `developer_journey_discussions` or `course_discussion_comments_new`. That is what makes FR-30 ("deleting an AI answer must not touch the discussion or human replies") structurally guaranteed rather than a behaviour to test defensively.
