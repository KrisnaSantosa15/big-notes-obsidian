---
date: 2026-10-13
updated: 2026-10-13
type: reference
tags: [reference, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Forum AI Assist — Context

Domain language for the Forum AI Assist feature ([prd.md](./prd.md) + [specs/technical-addendum.md](./specs/technical-addendum.md)). This is a bounded context within the Dicoding platform; terms here may differ from the broader Dicoding domain.

## Language

**Forum AI Assist**:
The canonical name for this feature, in both code and docs.
_Avoid_: "Bot", "Discussion Bot", "AI Bot" — the codebase already has an unrelated legacy feature literally named **Discussion Bot** (`discussion_bot_feedbacks` table, `AcademyDiscussionBotFeedbackStoreSpecification`, 2020) that shows a pre-submission suggestion and records helpful/not-helpful feedback on it. It generates no AI answer and is not touched by this feature. Reusing "bot" terminology would collide with that concept in engineers' heads. The PRD's own copywriting guide (§8.5) independently avoids "bot" in user-facing text.

**Discussion**:
A student-authored question thread in a class forum (`developer_journey_discussions`). Forum AI Assist references it only by `discussion_id` — that id is the correlation key for the entire feature: the AI request body, the webhook callback, and the unique FK on `forum_ai_assist_answers`.

**Opt-in**:
The per-**Discussion** choice to request an AI answer, captured by the "Bantu jawab dengan AI" checkbox at creation time and stored as `developer_journey_discussions.ai_assist_enabled`. Opt-in is decided once, at creation — it cannot be turned on for an existing **Discussion**, and it never applies to thread replies (FR-20).

**Answer**:
The single AI-generated response to a **Discussion**, stored in its own `forum_ai_assist_answers` row — never as a `DiscussionComment` (ADR-0001). At most one **Answer** exists per **Discussion**. It is not repliable (FR-18); students interact with it only through **Feedback**.
_Avoid_: "Comment", "Reply" (those mean human replies in `course_discussion_comments_new`)

**Answer Status**:
The **Answer**'s lifecycle state — one of `PENDING` / `ANSWERED` / `ERROR` / `DELETED`. Rendered server-side on page load; there is no SSE or polling, since the feature is webhook-driven (FR-16).

**Pending**:
The AI request has been accepted by **Layanan AI** (HTTP `202`) but no callback has landed yet. The discussion page shows a placeholder. Quota is **not** consumed in this state.

**Answered**:
The success callback landed. The content and its latency are final. This is the only state that consumes quota and the only state in which **Feedback** may be submitted (ADR-0003). The callback also reports model, token usage, sources and web-search use; none of it is persisted — LangFuse already holds it, reachable from the row without a stored id (ADR-0010).

**Error**:
A failure callback landed (`llm_error` / `content_filtered` / `timeout` / `not_indexed` / `unknown`). The **Discussion** itself is unaffected and stays published (NFR-03). No quota is consumed. `not_indexed` is the one worth separating in triage: it means **Indexing** never succeeded for that course, not that generation broke.

**Deleted**:
A moderator soft-deleted a bad **Answer** (`deleted_at` + `deleted_by` set). The **Discussion** and its human replies are untouched (FR-30). The **Feedback** control is hidden in this state.

**Feedback**:
A student's helpful / not-helpful verdict on an **Answered** **Answer**, plus optional qualitative text when not-helpful. One **Feedback** per student per **Answer**, replaceable (FR-24). Qualitative text is internal-only — stored for team evaluation, never rendered publicly (FR-23).

**Quota**:
The student's daily allowance of successful AI requests, administered by the platform's generic `PremiumFeatures` system under feature name `forum-ai-assist` (ADR-0004). Validated at the Web layer before dispatch, consumed only when an **Answer** reaches **Answered** (ADR-0003).

**Premium**:
A student holding an academy subscription. Only Premium students can trigger an **Opt-in**; every student — Premium or not — can read an **Answer** and submit **Feedback** on it.

**Layanan AI** (AI Service):
The external FastAPI service at [forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist) that produces **Answers**. Owned by the AI Engineer. It holds the persona, prompts, retrieval and content guardrails; dicoding.com only sends the question plus course metadata and receives a callback. Distinct from **Chester AI** (`chatbot-dcd.dicoding-ai.dev`), the *different* service that backs Explain-with-AI and Student Chatbot — the two are never called by the same gateway.

**Module**:
A unit of learning content in a course (`developer_journey_tutorials`). Dicoding calls this a **tutorial**; **Layanan AI**'s indexing code calls the same thing a **module** and keys its vector store on `module_id`. They are the same integer id (ADR-0007). Both names appear in the codebase — prefer **tutorial** on the PHP side, **module** when discussing the AI service's index.

**Indexing**:
Pushing course **Module** content and solved **Discussion** Q&A pairs into **Layanan AI**'s vector store so an **Answer** has something to ground on. dicoding.com pushes; the AI service never pulls (ADR-0007). Sends are deltas — only what changed — never a whole course.

**Solved Discussion**:
A **Discussion** marked resolved with one comment flagged `is_selected_answer = 1`. Its question + selected answer pair is what **Indexing** feeds to the discussions collection.

## Relationships

- A **Discussion** has at most one **Answer**; an **Answer** belongs to exactly one **Discussion**.
- An **Answer** has many **Feedback** rows, at most one per student.
- **Opt-in** lives on the **Discussion**, not the **Answer** — a **Discussion** can be opted in and still have no **Answer** row yet (the dispatch job has not run) or forever (the dispatch failed before insert).
- A **Discussion**'s human replies (`course_discussion_comments_new`) and its **Answer** are entirely independent: deleting one never touches the other.
- **Indexing** is scoped per course and is independent of every **Answer** — it can be built, deployed and broken without affecting the answer pipeline, and vice versa.

## Dev/expert dialogue

> **Dev:** "The AI answer is just a comment with a flag, right? Reuse `course_discussion_comments_new`."
> **Expert (BE):** "No. Comments nest via `parent_id`, so a comment is repliable by construction — FR-18 says the **Answer** must never be. Their status enum is active/deleted/spam; we need processing/answered/error. Feedback shape differs too. Own table."
> *(ADR-0001.)*

> **Dev:** "Listen to `NewCourseDiscussionWasCreated` and fire the AI request?"
> **Expert (BE):** "That event is raised inside the aggregate *before* the insert — there is no `discussion_id` yet, and `discussion_id` is the only correlation key the callback gives us back. Use `AcademyDiscussionWasCreated`, which the repository raises after the insert returns the id."
> *(ADR-0002.)*

> **Dev:** "Put the `PremiumFeature::isEnabled()` check in the dispatch Specification — that's the use-case layer, it belongs there."
> **Expert (BE):** "It would reject every single request. That Specification runs on beanstalkd, and `isEnabled()`/`isLimitExhausted()` both start with `\Auth::guest()`. No session in a queue worker. Gate at the Web layer like Student Chatbot does, and consume later with an explicit `$studentId`."
> *(ADR-0003.)*

> **Dev:** "A non-Premium student POSTs `ai_assist_enabled=true` with curl. 403?"
> **Expert (PM):** "No — they still get their discussion, we just drop the flag. FR-04 says creating a discussion without opt-in is always allowed, and a quota that runs out between form render and submit would otherwise cost a student their typed draft for no reason."
> *(ADR-0005.)*

> **Dev:** "Why does the AI service need us to push content? Can't it read our database?"
> **Expert (AI Engineer):** "It has no DB connection to dicoding.com and no cron. The indexing endpoints exist but nothing calls them — someone has to POST a ZIP. That someone is us, on tutorial-publish and discussion-solved events."
> *(ADR-0007.)*

## Flagged ambiguities

- PRD FR-03 / E-1.2 #4 says "server menolak request yang mencoba mem-bypass client-side gating", which reads as a hard rejection. **Resolved**: the *opt-in* is rejected, not the request — the discussion is still created (ADR-0005).
- "Course" vs "Classroom" vs "Kelas" used interchangeably in the Dicoding domain. **Resolved**: prefer **course** here (matches `course_id` on every column and on the AI service's contract). "Kelas" is fine in user-facing copy.
- PRD NFR-06 requires the answer to be free of PII *and* profanity. **Resolved as partial**: PII redaction exists in the AI service (`redact_pii()`); profanity filtering does not. A wordlist implementation was built and then rolled back — a static list is too brittle to rely on, and a different approach is being evaluated. Tracked as an open item in the technical addendum, not a solved constraint.
