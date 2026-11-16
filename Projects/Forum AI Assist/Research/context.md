# Forum AI Assist — Context

Domain language for the Forum AI Assist exploration: an opt-in, async AI-generated first response on class forum discussions, built by a separate AI Service and integrated into dicoding.com's forum feature. This is a research/exploration doc — nothing here is final until the feature is implemented; treat it as a running decision log for the grilling session, not a spec. **Superseded** by `docs/domains/forum-ai-assist/context.md`, which carries this vocabulary forward in full; keep this file only as a record of the exploration. PRD: `docs/domains/forum-ai-assist/prd.md`.

## Language

**Forum AI Assist**:
The canonical name for this feature, in both code and docs. Covers the opt-in checkbox, the async AI-generated answer, its slot on the discussion page, feedback, and moderation.
_Avoid_: "Bot", "Discussion Bot", "AI Bot" — the codebase already has an unrelated legacy feature literally named **Discussion Bot** (`discussion_bot_feedbacks` table, `AcademyDiscussionBotFeedbackStoreSpecification`, 2020) that shows a pre-submission suggestion and records helpful/not-helpful feedback on it — it does not generate an AI answer and is not touched by this feature. Reusing "bot" terminology for Forum AI Assist would collide with this existing concept in engineers' heads. The PRD's own copywriting guide (§8.5) independently avoids "bot" in user-facing text for the same reason (consistency with other AI features), which reinforces keeping it out of code/docs too.
