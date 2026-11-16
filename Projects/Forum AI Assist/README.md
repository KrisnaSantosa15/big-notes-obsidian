---
date: 2026-10-13
updated: 2026-10-13
type: reference
tags: [reference, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Forum AI Assist

Durable documentation for the Forum AI Assist domain — an opt-in, asynchronous AI-generated first response on class forum discussions. Premium students tick "Bantu jawab dengan AI" when posting a question; an external AI service answers via webhook and the answer renders in a dedicated, non-replyable slot visible to the whole class.

Code-level bounded context: `Dicoding/Domain/ForumAiAssist/` (see [ADR-0001](./adr/0001-dedicated-bounded-context-and-answer-table.md)).

## Canonical Docs

- [Context](./context.md)
- [PRD](./prd.md)
- [Technical addendum](./specs/technical-addendum.md)
- [ADRs](./adr/)

## Related

- [FAA Codebase](https://github.com/dicodingacademy/forum-ai-assist) — the external AI service that answers forum questions. Owned by the AI Engineer; its contract is pinned in the technical addendum.
- `docs/domains/student-chatbot/` — the structural precedent this domain mirrors at every layer (aggregate, per-aggregate repository, gateway, specification, thin Web action, premium quota). Its own vocabulary and specs live there, not here.
