---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "Quota is validated at the Web layer and consumed on the callback, never inside a queued Specification"
tags: [adr, decision, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Quota is validated at the Web layer and consumed on the callback, never inside a queued Specification

`PremiumFeature::isEnabled()` / `isLimitExhausted()` are called from `AcademyDiscussionStoreAction` while the student's session is live. `PremiumFeature::consume()` is called from the webhook callback Action, on the success path only, with the `student_id` read from the `forum_ai_assist_answers` row.

Putting the gate in `ForumAiAssistAnswerDispatchSpecification` looks correct — validation belongs in the use-case layer — and would have failed 100% of requests. Both read methods begin with `\Auth::guest()` / `\Auth::id()`, and `SpecificationQueueRunnerHandler::push()` is `\Queue::push`, so the Specification runs on beanstalkd with no session: `isEnabled()` returns false and `isLimitExhausted()` returns true, always. Student Chatbot already encodes the correct split — `beforeFilter('premium:student-chatbot')` on the Action, `PremiumFeature::consume(Auth::id(), ...)` in the Action after the stream finalizes — and this feature follows it.

Two adaptations to that precedent. First, the gate is an inline boolean in the Action rather than a `beforeFilter`, because the discussion-create route serves all discussion creation and gating the whole route would break FR-04 for non-Premium students. Second, consumption moves to the callback rather than the originating request, because the answer completes asynchronously — and `consume()` takes an explicit `$userId`, so it is safe there even though the caller is authenticated as the AI service, not as the student. The consequence is exactly what PRD E-6.2 asks for: a failed answer costs no quota, and a pending one costs none either.
