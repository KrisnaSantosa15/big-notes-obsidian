---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "Whether to widen a shared event or look its data up is decided by raiser count"
tags: [adr, decision, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Whether to widen a shared event or look its data up is decided by raiser count

Two existing events needed a `course_id` they do not carry, and we resolved them in opposite directions. `CourseTutorialWasSetAsReady` gains a `courseId` constructor argument plus getters. `AcademyDiscussionWasUpdated` is left alone and the listener queries for `course_id` instead.

The asymmetry is not inconsistency — it is the same rule applied to different facts. `CourseTutorialWasSetAsReady` has exactly one raiser (`CourseTutorialUpdate.php:160`, where `getCourseId()` is already in scope because the sibling branch two lines above uses it) and zero tests that assert its payload — the five existing assertions check only the event class. Widening it is a handful of lines and makes it structurally identical to its sibling `CourseTutorialWasSetAsPublished`, which is a net improvement to the shared domain regardless of this feature. `AcademyDiscussionWasUpdated` has three raisers (`DiscussionResolveUpdater`, `DiscussionUpdate`, `DiscussionStateUpdater`), so widening it means touching three aggregates outside this bounded context to serve one listener inside it — a worse trade than one query.

The general rule, for the next time this comes up: prefer widening when the event has a single raiser and the data is already in scope there; prefer looking up when the blast radius crosses aggregates you otherwise have no reason to open. In both cases the change to a shared `DeveloperJourney` file is committed separately from the `ForumAiAssist`-scoped work.
