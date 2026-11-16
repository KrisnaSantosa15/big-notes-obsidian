# Forum AI Assist — Backend + Minimal Frontend Integration

## Context

Forum AI Assist is a new opt-in feature on the class Forum Diskusi: Premium students can check "Bantu jawab dengan AI" when posting a question; an external AI service (Python FastAPI, [forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist)) answers asynchronously and the answer renders in a dedicated, non-replyable slot on the discussion page, visible to the whole class. Students give helpful/not-helpful feedback; Admin/Academy Admin/Academy Manager can soft-delete a bad answer. Full requirements: [prd.md](../../domains/forum-ai-assist/prd.md). Domain vocabulary: [context.md](../../domains/forum-ai-assist/context.md). Each numbered decision below is also recorded standalone under [adr/](../../domains/forum-ai-assist/adr/).

> **This is the working plan, not the durable spec.** The stable technical
> reference lives at [specs/technical-addendum.md](../../domains/forum-ai-assist/specs/technical-addendum.md);
> what remains here that the addendum deliberately omits is the PR/branch
> sequencing, which expires once the feature ships. Where the two disagree,
> the addendum wins.

One thing this plan intentionally does **not** cover:
- Final visual design — no designer mockups exist yet (per PRD §8.7, deliverables are still pending). Frontend here is plain/functional, to be restyled later.

**Update — done, not just planned.** The AI service ([forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist)) was originally contract-only for this plan, but two rounds of review required real changes there. All of it is implemented and committed upstream; the full suite passes (367 tests).

*Round 1 — delta indexing.* The indexing endpoints were full-replace-only, which would have forced Dicoding.com to resend a course's *entire* content on every trigger. `POST /index/courses` and `POST /index/discussions` are now upsert (delete-by-key then add, see `app/rag/core/vectorstore.py::upsert_collection`), keyed on `module_id` (courses) / `discussion_id` (discussions) — "module" is that codebase's name for the chunker, `module_id` **is** Dicoding's `tutorial_id` (`developer_journey_tutorials.id`), just renamed to match the file it lives in (`module_chunker.py`). New `DELETE /index/courses` / `DELETE /index/discussions` endpoints handle outright removal. Dicoding.com only ever sends what changed, never the whole course.

*Round 2 — a distinct `not_indexed` error code* (commits `34797e9`, `424fef6`, `2bbcd13`). The `FileNotFoundError` branch used to report `unknown`, indistinguishable from a generic pipeline failure. See the callback section below.

*Attempted and reverted — profanity filtering.* A wordlist/regex implementation was written, tested and then rolled back by team decision: a static list is too brittle (spelling variants, leetspeak, false positives on technical terms). NFR-06 stays half-satisfied and the item stays open — see "Open items" at the end.

**Key discovery informing this plan:** dicoding.com's *existing* AI features (Explain-with-AI, Student Chatbot) run against a **different**, already-deployed service (`chatbot-dcd.dicoding-ai.dev`, code at `~/projects/explain-with-chatbot` / "Chester AI") — confirmed by grepping both repos for the exact endpoint paths dicoding.com calls. [forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist) is a separate, newer service that is **only** wired for Forum AI Assist's contract so far. This plan integrates against the AI service's `/api/v1/forum-ai/answers` + webhook callback — it does not touch the Chester integration.

**Structural rule for this whole plan: mirror Student Chatbot.** It is the newest, cleanest DDD feature in this codebase and covers every layer Forum AI Assist needs (aggregate + per-aggregate Repository + Gateway + Specification + thin Web Action + premium quota). Where this plan names a class or a directory, the shape comes from `Dicoding/{Domain,UseCases,Infrastructure,Web}/StudentChatbot/`. Deviations from that shape are called out explicitly where they occur.

---

## External AI service contract

Verified directly against [forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist) source (`app/main.py`, `app/products/forum/{schemas,router,callback}.py`, `app/products/indexing/router.py`, `app/core/config.py`) — not just docs.

### Auth — applies to *every* endpoint

`main.py` mounts the whole `/api/v1` router behind `Depends(verify_api_key)`:

```python
app.include_router(api_router, prefix=settings.API_V1_STR, dependencies=[Depends(verify_api_key)])
```

So `Authorization: Bearer <API_KEY>` is required on **the answer endpoint, both indexing endpoints, and both DELETE endpoints** — there is no unauthenticated route besides `/` and `/health`. Both of our outbound gateways (`ForumAiAssistApiGateway`, `ForumAiAssistIndexingApiGateway`) must send it, sourced from `config('forum_ai_assist.api_auth_bearer')`.

### Answer request

`POST /api/v1/forum-ai/answers` → `202 {"status":"accepted","request_id":"<uuid>"}` (`router.py`, `@router.post("/answers", status_code=202)`).

Body (`ForumAIRequest`): `discussion_id, course_id, tutorial_id, user_id, title, question (Froala HTML), images[], course_name, levels[], persona?, provider?, model_name?, enable_thinking, reasoning_effort? ("low"|"medium"|"high")`. `tutorial_id` is already on `developer_journey_discussions` — no new column needed to source it.

Rate limiting (per `user_id` + IP, 30/min and 60/min per `config.py`) happens inside the AI service as a secondary safety net; our `PremiumFeature` quota check remains the primary gate.

**No student-facing model/provider selection — confirmed absent from the PRD.** The only "model" mention in the PRD (§8.5 note to Designer) is an instruction to *avoid* the words "model"/"LLM" in user-facing copy, not a feature request. Unlike Student Chatbot (which has `SelectModelAction`/`GetListModelsAction`/a model picker), Forum AI Assist never sends `provider`/`model_name`/`persona`/`reasoning_effort` from PHP at all — these are simply omitted from every outbound request, letting the AI service fall back to `settings.DEFAULT_PROVIDER`/`DEFAULT_MODEL`. No Action, no UI, no per-request choice.

### Webhook callback

`POST /api/v1/forum-ai/callback` — an endpoint we build. The AI service just POSTs to whatever `settings.DICODING_CALLBACK_URL` is set to.

**Decision (revised): the path is `/api/v1/forum-ai/callback`,** matching the AI service's own `config.py` default and its own router prefix exactly — **no upstream change required**. An earlier draft deviated to `/api/v1/forum-ai-assist/callback` so every URL would read identically to the route file/config file/premium feature name/domain namespace; reversed so every **URL** we expose or call mirrors the AI service's `forum-ai` prefix with zero upstream cost. Internal-only names (config file, routes file, premium feature key, domain namespace) keep the fuller `forum-ai-assist` form — only URLs changed.

- Success (`CallbackSuccessPayload`): `discussion_id, status: "answered", answer, model, token_usage: {prompt_tokens, completion_tokens, total_tokens}, sources: [{collection: "courses"|"discussions", chunk_id, score, preview}], web_search_used, latency_ms`. The `collection` enum value is `"courses"`, not `"classes"` (`schemas.py`).
- Error (`CallbackErrorPayload`): `discussion_id, status: "error", error_code: "llm_error"|"content_filtered"|"timeout"|"not_indexed"|"unknown", retry_count, latency_ms`.
- **`discussion_id` is the only correlation key.** `send_callback()` posts `payload.model_dump()` of the Success/Error schema — the `request_id` from the 202 is **not** echoed back (`CallbackRequestPayload` exists in `schemas.py` but is never used for the outbound body). Log the `request_id` when the 202 arrives if useful, but never build logic that expects it in the callback, and do not give it a column.
- **LangFuse correlation is derived, not stored** (ADR-0010). `request_id` is not LangFuse's key either — the AI service pins a deterministic trace id seeded on `discussion_id` (`app/eval/tracing.py::forum_trace_id`, seed `forum:{discussion_id}`), and `Langfuse.create_trace_id(seed)` is just the first 16 bytes of the seed's SHA-256 in hex. So PHP recomputes it from the row alone:

  ```php
  // verified identical to the Python side for forum:12345
  // → ad78994f16f43191559c16b0694eb141
  $traceId = substr(hash('sha256', "forum:{$discussionId}"), 0, 32);
  ```

  Expose it as a helper on the answer VO if a debug link is wanted. The seed format is a cross-repo contract — changing it breaks correlation for every historical trace.
- **Retry semantics are already correct upstream.** The AI service retries the LLM call internally up to `settings.LLM_RETRY_MAX` (= 2, matching FR-13/E-2.6) via `_call_with_retry()`; on final failure it raises `PipelineLLMError(retry_count=max_retries, error_code=...)` and `router.py`'s `except PipelineLLMError` branch forwards the real count. `retry_count` is `0` on the other branches (`FileNotFoundError`, `CallbackDeliveryError`, generic `Exception`), which is correct since those aren't LLM-retry failures. Store/display `retry_count` as-is.
- **`not_indexed` — fixed upstream, was a known limitation.** `FileNotFoundError` (no Chroma collection for the course) used to map to `error_code: "unknown"`, the same as a generic pipeline exception, so the `ERROR` state could not tell the two apart. It now has its own code. Worth knowing when reading it: **Student Chatbot is no guide here** — its `ChatErrorCode` has no equivalent at all and `AiServiceGateway` folds every non-specific case into `SERVICE_UNAVAILABLE`; its own ADR-0007 flags the mirror-image gap (no delete path when a course is unpublished). Also note a `not_indexed` failure produces **no LangFuse trace** — `load_chroma_collection` raises in `router.py` before `run_pipeline` opens `trace_scope` — which is precisely why `error_code` earns a column while the other callback fields do not.
- **NFR-06 is half-satisfied: PII yes, profanity no.** `app/services/guardrails/output_filter.py::filter_output()` — the only output guardrail the forum pipeline runs — checks for system-prompt-leak patterns and calls `redact_pii()` (email/phone/credit-card). **No profanity filter exists on either side.** A wordlist implementation was built and reverted (see the Context section); a different approach is being evaluated. Until then, post-hoc moderation (FR-27) is the only backstop — flag it to the AI Engineer/PM before launch.
- Auth: `Authorization: Bearer <DICODING_CALLBACK_API_KEY>` from the AI service's config, must equal our `forum_ai_assist.callback_auth_bearer`.
- Delivery retry (`callback.py`): the AI service retries **only** on `5xx` or network/timeout, up to `CALLBACK_RETRY_MAX` attempts; any response `< 500` (including 4xx) stops retrying but a 4xx still logs as a failure on their side. So our callback Action returns **`200` with no-op semantics** for an unknown or already-finalized `discussion_id` — not a 4xx — to keep both sides' logs clean and stay truly idempotent.
- **We persist almost none of this.** `model`, `token_usage`, `sources`, `web_search_used` and `retry_count` keep arriving and are simply ignored — the schema was cut back to what the PRD actually needs (see Aggregate 1's migration). Do not add a column just because a field is in the payload.

### Indexing endpoints — multipart, not JSON

This is the part most easily got wrong, so it is spelled out in full. From `app/products/indexing/router.py`:

```python
@router.post("/courses")
async def index_courses(
    request: Request,
    file: UploadFile = File(...),
    courseId: int = Form(...),
    environment: str = Form(...),
): ...
```

- **`POST /api/v1/index/courses` and `POST /api/v1/index/discussions` are `multipart/form-data`** with exactly three required fields: `file` (the ZIP), `courseId`, `environment`. Posting a JSON body returns `422`.
- **`environment`** is required and free-form on the Python side (it is only logged), but in *this* codebase the established values are `production|staging` — see `UpdateCourseVectorEmbeddingSpecification::$dataValidationRules` (`'environment' => 'required|in:production,staging'`) and the derivation in `UpdateAIVectorEmbeddingListener::getEnvironment()`. Reuse that derivation verbatim.
- **The multipart shape to copy is already in this repo:** `ExplainWithAIApiService::uploadCourseContentToVectorEmbedding()` builds exactly this request — same three field names (`courseId`, `environment`, `file`), same `Content-Type: application/zip` on the file part. Copy it; only the base URL, the path, and the bearer source change.
- **HTTP `200` (not 202), and it means "queued", not "indexed":** `{"status":"queued","job_id":"<uuid>","course_id":…,"environment":…,"queue_position":N}`. A single global async worker processes one job at a time, and everything that can actually fail — malformed ZIP, embedding error, OOM — happens *after* this response and surfaces only via `GET /api/v1/index/{courses,discussions}/status/{job_id}`. **We poll it** (ADR-0011) — see Aggregate 0's verification step.
- **`DELETE /api/v1/index/courses` and `DELETE /api/v1/index/discussions`** take a **JSON body** `{course_id: int, ids: int[]}` and run synchronously. Guzzle handles DELETE-with-body via `->delete($url, ['json' => …])` — the same shape `ExplainWithAIApiService::deleteFromVectorStore()` already uses.

### Filename convention inside the ZIP

- `/index/courses`: each file must be named `module_{module_id}.<ext>` (e.g. `module_421.txt`). That exact pattern is how the upsert key is parsed (`module_chunker.py::_parse_module_id`, regex `^module_(\d+)$`, matched against the file **stem**). A bare `421.txt` or a slugified name still indexes, just without an upsert/delete key — re-sending it adds a duplicate instead of replacing.
- `extract_zip_flat()` flattens all directories, so a nested entry like `course_184/module_421.txt` lands as `module_421.txt` and parses fine. Nesting is harmless but pointless — write files at the ZIP root.
- `/index/discussions`: each file named `discussion_{discussion_id}.json` by convention (cosmetic only — the AI service reads `discussion_id` from the JSON body, not the filename — but keep it consistent with the courses side for readability).

---

## Resolved decisions (verified against actual code, not assumed)

Each decision that has architectural weight also lives as a standalone ADR. Map: #1 → [ADR-0004](../../domains/forum-ai-assist/adr/0004-quota-via-premium-feature-academy-subscription.md), #2 → [ADR-0003](../../domains/forum-ai-assist/adr/0003-quota-gated-at-web-layer-consumed-on-callback.md), #3 → [ADR-0005](../../domains/forum-ai-assist/adr/0005-non-premium-optin-drops-the-flag.md), #4 → [ADR-0002](../../domains/forum-ai-assist/adr/0002-dispatch-triggers-on-academy-discussion-was-created.md), #5 → [ADR-0001](../../domains/forum-ai-assist/adr/0001-dedicated-bounded-context-and-answer-table.md). Decisions #6–#9 are naming/layout conventions with no ADR. Five further ADRs cover material outside this list: [ADR-0006](../../domains/forum-ai-assist/adr/0006-callback-path-and-bearer-auth.md) (callback path + bearer), [ADR-0007](../../domains/forum-ai-assist/adr/0007-indexing-pushed-by-dicoding-keyed-on-module-id.md) (Aggregate 0's push model), [ADR-0008](../../domains/forum-ai-assist/adr/0008-event-payload-widening-decided-by-raiser-count.md) (widen an event vs. look it up), [ADR-0009](../../domains/forum-ai-assist/adr/0009-no-student-facing-model-selection.md) (no model selection), [ADR-0010](../../domains/forum-ai-assist/adr/0010-langfuse-correlation-derived-not-stored.md) (LangFuse correlation derived from `discussion_id`), [ADR-0011](../../domains/forum-ai-assist/adr/0011-indexing-verified-by-bounded-polling.md) (indexing verified by bounded polling).

1. **Quota mechanism → the existing generic `PremiumFeatures` system**, not a bespoke usage table. Features register in `app/config/premium_feature_configs.php` with `limits` (per `FeatureMode`: SUBSCRIPTION/TRIAL/INTERNAL), `reset_period`, `reset_every`, `unit_measurement`, `feature_subscribed_to`. `student-chatbot`'s entry is the closest precedent (INTERNAL-first rollout) — add `forum-ai-assist` the same way. This is what `PremiumFeature::isEnabled()/isLimitExhausted()/consume()` (`Dicoding/Web/Utils/PremiumFeature.php`) reads.
   - **`feature_subscribed_to` → `SubscriptionType::ACADEMY_SUBSCRIPTION`** (decided). Matches `explain-with-ai` and the PRD glossary ("Premium = siswa berlangganan berbayar di Dicoding"). **No new `SubscriptionType` case, no `DailyAddOnType` mapping** — unlike `student-chatbot`/`sabak`, this is a class benefit, not a separately-sold add-on.
   - **`unit_measurement` → `REQUEST`, flat rate `1` per successful answer.** Diverges from `student-chatbot`'s `CREDIT` deliberately: credits exist there to price different model tiers, and Forum AI Assist has no model selection at all (see the contract section). Follows `explain-with-ai` instead.
   - **Limit numbers are placeholders** pending Product, exactly as `student-chatbot`'s entry documents for itself. PRD E-6.1/NFR-08 only require that they live in config and change without redeploy — which this satisfies.
2. **Quota is validated at the Web layer and consumed after success — never inside a queued Specification.** `PremiumFeature::isEnabled()` and `isLimitExhausted()` both begin with `\Auth::guest()`/`\Auth::id()`; `SpecificationQueueRunnerHandler::push()` is `\Queue::push`, so a queued Specification has no session and **every** call would evaluate as "not enabled / limit exhausted". Student Chatbot's precedent is exactly this split: the gate is `beforeFilter('premium:student-chatbot')` on the Action (`SendMessageAction.php`; filter registered `app/filters.php:135`), and `PremiumFeature::consume(Auth::id(), 'student-chatbot', $rate)` runs in the Action after the reply finalizes. Forum AI Assist follows the same split, with one adaptation: the discussion-create route is *not* premium-only, so the gate is an inline check in `AcademyDiscussionStoreAction` rather than a `beforeFilter`. Consumption moves to the callback path (Aggregate 2), where `consume()` takes an explicit `$studentId` and is therefore queue/webhook-safe.
3. **A non-Premium or quota-exhausted student who submits `ai_assist_enabled=true` still gets their discussion — the flag is dropped** (decided). The row persists `ai_assist_enabled = false`, no `forum_ai_assist_answers` row is created, no queue job is pushed. This satisfies FR-03/E-1.2 #4 ("server menolak request yang mencoba mem-bypass client-side gating") while preserving FR-04 and Flow 5 (creating a discussion without opt-in is always allowed). Rejecting the whole request with a 403 was considered and rejected: a FE bug or a quota that runs out between form render and submit would cost the student their typed draft.
4. **Dispatch triggers on `AcademyDiscussionWasCreated`, not `NewCourseDiscussionWasCreated`.** This is a correction to an earlier draft. `NewCourseDiscussionWasCreated` is raised **inside the aggregate before the insert** (`NewDiscussion.php:76`, from `$this->createdDiscussion->toArray()`), so the row has no id yet — the event carries only `course_id, tutorial_id, creator_id, title` and no getters. Since `discussion_id` is the correlation key for this entire feature (request body, callback, unique FK), that event is unusable. `AcademyDiscussionWasCreated(discussionId)` (`Dicoding/Domain/DeveloperJourney/Events/`) is raised by `NewDiscussionRepository::saveNewDiscussion()` *after* the insert returns the id, and currently has **zero listeners** — we are the first. It carries only the id, so the listener looks the row up, which is cheaper anyway: one query yields `ai_assist_enabled`, `course_id`, `tutorial_id`, `creator_id`, `title`, and `question` together.
5. **Domain namespace → top-level `Dicoding/Domain/ForumAiAssist/`**, not nested under `DeveloperJourney`. `StudentChatbot` is its own top-level domain even though it is also course/discussion-adjacent.
6. **Web namespace → top-level `Dicoding/Web/ForumAiAssist/`** with per-concern subdirectories, mirroring `Dicoding/Web/StudentChatbot/{MessageActions,FeedbackActions,SessionActions}/`. This is a correction to an earlier draft that put actions under `Web/Api/V1/ForumAiAssist/`; `Web/Api/V1/` does exist, but Student Chatbot — the precedent this plan follows everywhere else — does not live there.
7. **Routes file → dedicated `app/routes/forum-ai-assist.php`**, required from `app/routes.php`, wrapped in `Route::cache(__FILE__, function () { … })` exactly like `app/routes/student-chatbot.php`. Route URIs still start with `api/v1/…`; the file location and the URI prefix are independent.
8. **Audit trail → domain events, not a separate audit_log table.** Matches `DiscussionCommentWasDeleted`; `deleted_at` + `deleted_by` columns plus the raised event is sufficient.
9. **Class naming follows Student Chatbot's `<AggregateName>` / `<AggregateName>Repository` / `<AggregateName>Specification` convention** (e.g. `ChatbotReplyFinalization` → `ChatbotReplyFinalizationRepository` → `ChatbotReplyFinalizationSpecification`), *not* verb-first (`FinalizeXSpecification`). Aggregate 0 is the sole exception: it has no domain aggregate and follows its own precedent, `UpdateCourseVectorEmbeddingSpecification` (verb-first).

---

## Aggregate 0 — Content Indexing (Courses + Discussions)

Covers: feeding the AI service's indexing endpoints so a course actually has retrievable content before any student opts in on it. **Independent of Aggregates 1–4** — it never touches `forum_ai_assist_answers`, so it can be built in parallel with the answer-dispatch stack.

**Why this exists:** an earlier draft assumed indexing "is a separate existing pipeline" — wrong. The endpoints exist and work, but nothing calls them: no DB connection to dicoding.com, no cron, no puller of any kind. Someone has to POST a ZIP. The only precedent for "someone" being dicoding.com is Explain-with-AI's `UpdateAIVectorEmbeddingListener` → `UpdateCourseVectorEmbeddingSpecification`, which does this exact shape of work for a *different* AI backend.

**Why the merge key is `module_id`, not a filename:** `chatbot-dcd`'s `update_vector_store()` matches purely on filename (`vectordb.get(where={"source": filename})`), and `UpdateCourseVectorEmbeddingSpecification` derives that filename from **slugified names** (`{course_name}_{tutorial_name}.txt`). That is a live bug: edit a tutorial's title and its slug changes, so the next update writes chunks under a *new* filename while the old-titled chunks are never matched for deletion — they orphan forever. The AI service keys on `module_id` (Dicoding's `tutorial_id`), which survives a title edit.

### 0a — Course Materi Indexing

- New listener `Infrastructure/GlobalDomainEventHandlers/ForumAiAssist/ForumAiAssistCourseIndexingListener.php`, registered in `GlobalDomainEventServiceProvider`.
- **Publish trigger → `CourseTutorialWasSetAsPublished`** — the same event Explain-with-AI's `UpdateAIVectorEmbeddingListener` reacts to, but a new handler class scoped to `ForumAiAssist`. Both `courseId`/`tutorialId` come straight off the event's getters; no lookup needed.
- **Editing an already-published tutorial re-triggers this, no gap:** `CourseTutorialUpdate::raiseDomainEvents()` (`.../Aggregates/CourseTutorialUpdate.php:148-161`) raises exactly one of `CourseTutorialWasSetAsPublished` / `CourseTutorialWasSetAsReady` on **every** `update()` call, chosen purely by the *new target* `ModuleStatus` — not by the previous status. A content-only edit that keeps status `PUBLISHED` still fires `CourseTutorialWasSetAsPublished`, correctly triggering a re-upsert.
- **Unpublish trigger → `CourseTutorialWasSetAsReady`, which must first be given a `courseId`** (decided). Today the event is `__construct(int $tutorialId)` with **no `course_id` and no getters at all** — so the planned `deleteCourseContent($courseId, [$tutorialId])` call is impossible as-is. Change it to `__construct(int $courseId, int $tutorialId)` with `getCourseId()`/`getTutorialId()`, matching its sibling `CourseTutorialWasSetAsPublished` exactly. Blast radius is small and verified: **one raiser** (`CourseTutorialUpdate.php:160`, where `$this->currentTutorial->getCourseId()` is already in scope — the sibling branch two lines up uses it) and **zero test changes** (the 5 assertions across `SetExamDraftAsReadyIntegrationTest`, `SetInteractiveVideoDraftAsReadyIntegrationTest`, `SetTutorialArticleDraftAsReadyIntegrationTest`, `AcademyTutorialUpdateTest` only assert the event *class*, never its payload).
  - Note this event fires on **every** non-PUBLISHED status transition, including drafts that were never published. Most resulting DELETE calls will be no-ops (`delete_items` no-ops on missing keys). Harmless, but expect the log noise.
- New `UseCases/ForumAiAssist/IndexForumAiAssistCourseContentSpecification.php` — reuses `ExplainWithAIGateway::retrieveTutorialContentByChunkAndReturnCount($courseId, [$tutorialId], …)` (already filters to the changed tutorial via `whereIn('djt.id', $tutorialIds)`), zips just that one tutorial as `module_{tutorialId}.txt`, POSTs to `POST /api/v1/index/courses` via a new `ForumAiAssistIndexingApiGateway`.
- **Must skip the upload entirely when the chunk count is `0`** — do not throw, do not POST an empty ZIP. The reused gateway filters to `djt.type = ARTICLE`, `djt.status = PUBLISHED`, and `dj.type = REGULER`, but `CourseTutorialWasSetAsPublished` fires for quizzes, exams, submissions and interactive videos, and on non-reguler courses too — all of which legitimately yield 0 rows. `UpdateCourseVectorEmbeddingSpecification` throws `InvariantException` in that case, which is wrong for us (it would report a failure on a perfectly normal quiz publish). Return a successful no-op payload instead.
  - Posting an empty ZIP would be actively harmful, not merely useless: `extract_zip_flat()` calls `shutil.rmtree(target_dir)` *before* extracting, so an empty ZIP wipes `data/courses/raw/course_{id}/`. The vectors survive (`index_modules` returns early on zero docs and never reaches `upsert_collection`), but the raw mirror is destroyed.
- **Known upstream quirk — `raw/` is not a mirror.** Because of that same `rmtree`, `data/courses/raw/course_{id}/` only ever holds the files from the *most recent* job. Under this plan's delta-send model that means one file. Chroma is the source of truth so retrieval is unaffected, and nothing in this plan rebuilds from `raw/` — but do not treat that directory as a backup. Fixing it is an upstream change, out of scope here.
- New `Infrastructure/WebServices/ForumAiAssist/ForumAiAssistIndexingApiGateway.php` with `indexCourseContent()` / `deleteCourseContent()` / `getJobStatus()`. Sends `Authorization: Bearer` on all three. Multipart shape copied from `ExplainWithAIApiService::uploadCourseContentToVectorEmbedding()`; `environment` derived exactly as `UpdateAIVectorEmbeddingListener::getEnvironment()` does.
- **Verify the job, don't fire and forget** (ADR-0011). After the POST returns a `job_id`, the Specification polls `getJobStatus()` with backoff — 2s → 4s → 8s → 16s, ~30s total:
  - `done` → log the chunk count, finish.
  - `error` → `reportError()`. This is a real failure.
  - still `queued`/`processing` when the budget runs out → log as *unverified* and finish. **Not an alarm** — the AI service has one global index worker, so a bulk publish legitimately queues our job for a while, and an alarm that fires on every backlog gets muted within a week.

  Blocking ~30s costs nothing: the Specification already runs on beanstalkd with no user waiting. The residual gap — a job that dies after we stop watching — is closed from the other end by `error_code: "not_indexed"`, which fires the moment a student actually asks on a course with no collection. A periodic reconciliation job diffing all published tutorials against the index is deliberately **not** built; `not_indexed` showing up in practice is the signal that would justify it.
- Queue via plain `SpecificationQueueRunnerHandler::push(...)` — **not** `pushLaterOnce`. The batching/debounce rationale behind Explain-with-AI's weekly `pushLaterOnce(startAt: next Monday 04:00)` no longer applies: each trigger is a cheap single-item upsert, not a full-collection rebuild, so there is nothing expensive to collapse.
- **Pass a `$dependsFeature` flag to `push()`.** `SpecificationQueueRunnerHandler::push()` accepts one and short-circuits when the feature is disabled. Aggregate 0 otherwise has no off-switch — if indexing starts misbehaving in production the only alternative is a deploy. **Gotcha found while implementing Aggregate 1:** `Feature::isDisabled($name)` defaults to `true` (disabled) when no `toggles` row exists for that name yet — so this flag must ship together with a pre-seeded `toggles` row, or every push silently no-ops from day one. Verify this before merging 0a/0b.
- **No backfill for existing published tutorials/solved discussions** — deliberate. Forum AI Assist is pre-launch, so there is no usage that needs historical content retroactively indexed. If this ships after real courses already carry old content, a one-off backfill command is needed then.

### 0b — Discussion Q&A Indexing

- **"Answer" maps to an existing column, no new product decision.** `course_discussion_comments_new.is_selected_answer` (`DiscussionComment.php:40,199,222`; queried via `->where('is_selected_answer', 1)` in `DiscussionCommentGateway.php:312,325`). A solved discussion's `answer` is the comment where `is_selected_answer = 1`.
- Trigger: `AcademyDiscussionWasUpdated` filtered to payload `solved === 1` (raised by `DiscussionResolveUpdater`). New `IndexForumAiAssistDiscussionContentSpecification` fetches just that one discussion — joining to the `is_selected_answer = 1` comment — builds one `discussion_{discussionId}.json` (`{discussion_id, question, answer, tutorial_id?, title?}`), zips, POSTs to `POST /api/v1/index/discussions`.
- **`AcademyDiscussionWasUpdated` carries no `course_id` and has no getters** — its payload is `(updaterId, discussionId, ['solved' => …])`, read via `getEventData()`. Unlike 0a's tutorial event, **do the lookup here rather than changing the event**: it has three raisers (`DiscussionResolveUpdater`, `DiscussionUpdate`, `DiscussionStateUpdater`), so widening the constructor is a materially bigger change than the single-raiser `CourseTutorialWasSetAsReady` case above. Query `AcademyDiscussionGateway` for the discussion's `course_id` before calling the indexing gateway.
- Removal triggers (call `ForumAiAssistIndexingApiGateway::deleteDiscussionContent($courseId, [$discussionId])`): `AcademyDiscussionWasUpdated` with `solved === 0` (un-solved), and `DiscussionCommentWasDeleted` when the deleted comment was the `is_selected_answer` one for its discussion. Both need the same `course_id` lookup.
- Same plain `push()` + `$dependsFeature` reasoning as 0a.

### Verification (Aggregate 0)

- The AI-service side of the upsert/delete contract (`upsert_collection`, `delete_items`, both `DELETE` routes, `module_id` parsing) already has coverage upstream (367 tests passing). PHP-side tests only verify the Dicoding.com boundary — right event → right listener → right payload — not the AI service's internals.
- Integration tests: listener → queue-push assertion for the publish, unpublish, solve and un-solve triggers; Specification tests with a mocked `ForumAiAssistIndexingApiGateway` covering the upsert path, the delete path, **the zero-chunk skip path** (assert no HTTP call is made), and **the three polling outcomes** — `done` finishes clean, `error` reports, and a still-`queued` budget exhaustion logs unverified without reporting an error.
- Unit test for the widened `CourseTutorialWasSetAsReady`: assert `getCourseId()`/`getTutorialId()` round-trip, and that `CourseTutorialUpdate` populates both.
- Manual: publish one tutorial / solve one discussion on a test course, confirm only that item's job is queued (`GET /api/v1/index/{courses,discussions}/status/{job_id}` → `done`), then confirm an opt-in on that course no longer hits the AI service's `FileNotFoundError` branch. Unpublish a tutorial / un-solve a discussion, confirm the matching `DELETE` fires. Publish a **quiz** and confirm no HTTP call happens at all.

### Branch/PR structure (Aggregate 0)

No Domain/Infra 2-PR split — there is no `Domain/ForumAiAssist/Aggregates/…` class here (no invariant to guard; it is event listener → Specification → WebService Gateway), so there is no stub-then-fill Gateway body to stage across two PRs. Two PRs, **both off `master`**, not stacked on each other or on Aggregates 1–4:

- `feature/forum-ai-assist/course-indexing` (0a) — listener, `IndexForumAiAssistCourseContentSpecification`, `ForumAiAssistIndexingApiGateway` with `indexCourseContent()`/`deleteCourseContent()`, the `CourseTutorialWasSetAsReady` widening, integration tests.
- `feature/forum-ai-assist/discussion-indexing` (0b) — listener, `IndexForumAiAssistDiscussionContentSpecification`, adds `indexDiscussionContent()`/`deleteDiscussionContent()` to the *same* `ForumAiAssistIndexingApiGateway`, integration tests.

Either order, or in parallel. The one shared file (`ForumAiAssistIndexingApiGateway`) means whichever merges second should rebase onto the first.

**Commit granularity within 0a:** the `CourseTutorialWasSetAsReady` change touches a shared `DeveloperJourney` domain file consumed outside this feature — it gets its own commit, separate from the `ForumAiAssist`-scoped files.

---

## Branching Strategy — per-aggregate, 2 PRs each

Aggregate 0 is a separate, parallel track (above). The remaining four aggregates each ship as a **pair** of stacked branches/PRs, one aggregate completed before the next starts:

1. **PR "Domain"** — enums, events, aggregate, value objects, per-aggregate Repository, Storage/WebService Gateway **with method bodies stubbed** (signatures only — `throw new \LogicException('not implemented')`), unit tests. Creating the Repository + Gateway shell here is fine even though nothing calls it yet — the aggregate's unit tests exercise it via a fake/mock, not the real body.
2. **PR "Infrastructure + Web + Spec"** — fills in the Gateway bodies, adds the Specification, the Action, the Blade/API response, that aggregate's migrations, and integration tests.

**Why this order (dependency-driven):** Finalization, Deletion and Feedback all read or write the same `forum_ai_assist_answers` row that Dispatch creates, so each aggregate's branches stack on the *previous aggregate's* Infra PR (where the table and gateway body already work), not on `master`. **Deletion ships before Feedback** (swapped from the original order): Deletion only needs the soft-delete columns Aggregate 1 already migrated — no new table — while Feedback introduces its own. Shipping Deletion first also means Feedback's Blade/gateway code is written *already aware* of the `DELETED` status (PRD §8.6 edge case #8: a deleted answer must hide its feedback control), instead of needing a retrofit.

```
master
  ├─ feature/forum-ai-assist/course-indexing         (Aggregate 0a — independent)
  ├─ feature/forum-ai-assist/discussion-indexing     (Aggregate 0b — independent)
  └─ feature/forum-ai-assist/answer-dispatch-domain
       └─ feature/forum-ai-assist/answer-dispatch-infra        (table + gateway body exist from here on)
            └─ feature/forum-ai-assist/answer-finalization-domain
                 └─ feature/forum-ai-assist/answer-finalization-infra
                      └─ feature/forum-ai-assist/deletion-domain
                           └─ feature/forum-ai-assist/deletion-infra
                                └─ feature/forum-ai-assist/feedback-domain
                                     └─ feature/forum-ai-assist/feedback-infra
```

Each Domain PR only *adds new stub methods* to the Gateway class the prior aggregate already created (e.g. Finalization's Domain PR adds an empty `updateStatus()` to `ForumAiAssistAnswerGateway`) — it never needs the prior Infra PR *merged*, only its branch tip stable enough to build on.

---

## Aggregate 1 — Answer Dispatch

Covers: student opts in on discussion creation → request queued to the AI service.

### PR 1a — Domain (`feature/forum-ai-assist/answer-dispatch-domain`, off `master`)

- `Domain/ForumAiAssist/Aggregates/ForumAiAssistAnswerDispatch.php` — guard: one in-flight AI request per discussion, status-agnostic (blocks re-dispatch regardless of the existing answer's status — `PENDING`/`ANSWERED`/`ERROR`/`DELETED` all block equally, since retry lives inside the AI service, not here). Also mirrors `ChatbotMessageDispatch`'s `authorize()` step: takes a `CommonActor` + `StudentCourseEnrollmentStatus` and rejects `ACCOUNT_NOT_VERIFIED` / `NOT_ENROLLED` before the dispatch guard runs. **Deliberately does not mirror `ChatbotMessageDispatch`'s `CONTENT_REQUIRED` (empty/whitespace input) check** — that guards live per-message text arriving with no prior validation; this aggregate has no text input at all (title/question live on the discussion row, already `required` on `NewCourseDiscussion` at creation time, an existing feature this one doesn't re-validate). Raises `ForumAiAssistAnswerWasRequested`.
- `Domain/ForumAiAssist/Events/ForumAiAssistAnswerWasRequested.php`.
- `Domain/ForumAiAssist/ValueObjects/ForumAiAssistAnswer.php` — shared VO reused by every later aggregate (discussion_id, student_id, course_id, status, content, error_code). Mirrors the trimmed table below — no `model`/`token_usage`/`sources`/`web_search_used`/`retry_count`/`latency_ms`.
- `Domain/ForumAiAssist/Enums/ForumAiAssistAnswerStatus.php` — `PENDING | ANSWERED | ERROR | DELETED` (all four defined now, since the enum is shared even though only `PENDING` is used yet).
- `Infrastructure/Repositories/ForumAiAssist/ForumAiAssistFactoryRepository.php` — shared factory that hydrates VOs/aggregates from the gateway, mirroring `ChatbotFactoryRepository`. Every later aggregate's Repository composes it.
- `Infrastructure/Repositories/ForumAiAssist/ForumAiAssistAnswerDispatchRepository.php` — `createAggregate()` + `save()`, mirroring `ChatbotMessageDispatchRepository`. Composes `CommonActorFactoryInterface` + `StudyProgressFactoryInterface` (same two factories Chatbot's dispatch repository uses) to resolve the actor/enrollment status the aggregate's `authorize()` needs — **no `PremiumFeatureRepositoryInterface`/`UserStatus`**, unlike Chatbot's version, since Resolved Decision #2 keeps this feature's quota/Premium check out of anything queue-side.
- `Infrastructure/StorageGateways/ForumAiAssist/ForumAiAssistAnswerGateway.php` — shell with `saveAnswer()` **stubbed**.
- Tests: `ForumAiAssistAnswerDispatchTest` (unit, `BusinessCase` parent) with a fake/mock Gateway — covers the `authorize()` guards, the status-agnostic `ALREADY_DISPATCHED` guard (all four `ForumAiAssistAnswerStatus` cases), and the happy path. `ForumAiAssistAnswerDispatchRepositoryTest` (unit) mirrors `ChatbotMessageDispatchRepositoryTest` — Prophecy-mocked Gateway/factories, verifies `createAggregate()` → `dispatch()` → `save()` wiring.
- **Deliberately does *not* create `ForumAiAssistApiGateway.php` yet** — held until PR 1b, where `config('forum_ai_assist.*')` first exists. A stub with no config to read and no caller in PR 1a is scaffolding with nothing to scaffold.
- **Deliberately does *not* touch `NewCourseDiscussion`/`NewDiscussion` yet** (an earlier draft did) — moved to PR 1b, see below. Without PR 1b's migration and Web Action, an `ai_assist_enabled` field on the VO would be permanently inert (always `false`, nothing can ever set it), so touching a shared cross-domain file for a no-op has no justification in this PR.

### PR 1b — Infrastructure + Web + Spec (`feature/forum-ai-assist/answer-dispatch-infra`, off 1a)

- Migrations:
  - `…_add_ai_assist_enabled_to_developer_journey_discussions_table.php`
  - `…_create_forum_ai_assist_answers_table.php` — **11 columns, each mapped to a PRD need:** `id`, `discussion_id` (unique FK), `student_id`, `course_id`, `status`, `content`, `error_code` (nullable), `deleted_at`, `deleted_by`, `created_at`, `updated_at`.

    An earlier draft had 17, the extra six taken straight from the callback payload rather than from any requirement. NFR-09 asks for exactly four things — *user, kelas, status, durasi* — which are `student_id`, `course_id`, `status`, `latency_ms`. Dropped, with the reason each one failed to justify itself:

    | Dropped | Why |
    | --- | --- |
    | `model` | PRD §8.5 forbids the word "model" in user-facing copy, so it is never displayed; LangFuse holds it per generation |
    | `token_usage` | LangFuse records tokens **and** cost via the LLM callback handler. "Monitoring actual cost bulanan" (PRD §9) is a LangFuse dashboard, not a MySQL query |
    | `web_search_used` | FR-11/E-2.5 only require that the AI *can* web-search; nothing requires showing whether it did |
    | `retry_count` | Zero PRD mentions. Purely the AI service's internal business |
    | `sources` | PRD §8.6 edge case #5 only says "*pertimbangkan* bagaimana menampilkan referensi" — a Designer consideration whose deliverable does not exist yet (§8.7) |
    | `latency_ms` | Same argument as `token_usage`: LangFuse already times every generation via the callback handler, so "durasi" (NFR-09) is answered by the trace, not a stored column. Not persisted anywhere in `forum_ai_assist_answers` — **the AI service's callback payload still includes it (§ below); we just never write it to this row.** |

    `error_code` survives the same argument for one specific reason: `not_indexed` originates from a `FileNotFoundError` thrown before `trace_scope` opens, so that failure has no LangFuse trace at all — this row is the only place the signal exists. This is also the one gap in the `latency_ms` reasoning above: a request that fails before `trace_scope` opens has no LangFuse-recorded duration either, so "durasi" for that specific failure class is unrecoverable from either source. Accepted as out of scope for MVP — `error_code` alone still satisfies the "status" part of NFR-09 for that case.

    Add-back triggers, each a trivial migration: `sources` once the design settles how references render; `model` + `token_usage` if a cost question turns up that needs joining against Dicoding tables; `latency_ms` if a product need surfaces for querying duration outside LangFuse (e.g. a Dicoding-side dashboard or alert).
- Touches two existing domain files together — `ai_assist_enabled` only actually works if both change:
  - `Domain/DeveloperJourney/Discussions/ValueObjects/NewCourseDiscussion.php` — add `ai_assist_enabled` (bool, default false) to `$rules` + a getter.
  - `Domain/DeveloperJourney/Discussions/Aggregates/NewDiscussion.php::processCreation()` — **must also add** `'ai_assist_enabled' => $newDiscussionData['ai_assist_enabled'] ?? false` to the array literal it builds. This aggregate hand-picks keys rather than passing `$newDiscussionData` through, so touching the VO alone would silently never carry the flag — found by reading the aggregate, not assumed.

  **Own commit**, separate from the `ForumAiAssist`-scoped files (shared cross-domain files).
- Config:
  - `app/config/forum_ai_assist.php` — `api_base_url`, `api_auth_bearer`, `callback_auth_bearer`. **No `default_provider`/`default_model` keys** — PHP never sends those fields.
  - `'forum-ai-assist'` entry in `app/config/premium_feature_configs.php` — INTERNAL-first like `student-chatbot`, but `unit_measurement: REQUEST` and `feature_subscribed_to: [SubscriptionType::ACADEMY_SUBSCRIPTION]` (Resolved Decision #1).
- Fill in `ForumAiAssistAnswerGateway::saveAnswer()`, and create `Infrastructure/WebServices/ForumAiAssist/ForumAiAssistApiGateway.php` with `requestAnswer()` (real Guzzle POST to `/api/v1/forum-ai/answers`, following `WebServices/StudentChatbot/AiServiceGateway.php`'s config-driven client shape but non-streaming). `discussion_id, course_id, tutorial_id, user_id, title, question, images[]` come off the just-created discussion row; `course_name`/`levels[]` are sourced from whatever existing course service already backs the discussion show page (identify the concrete class during implementation rather than adding a new one — `SendMessageAction` uses `AcademyGateway` for exactly this, start there); `persona`/`provider`/`model_name`/`reasoning_effort` are always omitted.
- `UseCases/ForumAiAssist/ForumAiAssistAnswerDispatchSpecification.php` — calls the aggregate, calls both gateways. **Contains no `PremiumFeature` call of any kind** — neither `isEnabled()`/`isLimitExhausted()` (they would always fail here; Resolved Decision #2) nor `consume()` (that belongs on the success path, Aggregate 2). It receives an already-gated payload.
- `Infrastructure/StorageGateways/Academies/Discussions/AcademyDiscussionGateway.php::saveNewCourseDiscussion()` — persist the new `ai_assist_enabled` column.
- `Infrastructure/GlobalDomainEventHandlers/ForumAiAssist/ForumAiAssistAnswerWasRequestedListener.php` — on **`AcademyDiscussionWasCreated`** (Resolved Decision #4), read `discussion_id` from `getEventData()`, look the discussion row up, return early unless `ai_assist_enabled` is set, otherwise `SpecificationQueueRunnerHandler::push(ForumAiAssistAnswerDispatchSpecification::class, ['discussion_id' => …])` — **no `$dependsFeature`.** `Feature::isDisabled($name)` defaults to **disabled** when no `toggles` row exists for that name yet (`forNonAuthUser()`/`forAuthUser()` both fall back to `false` on a missing row) — passing one here without a pre-seeded toggle would silently no-op every dispatch, which is exactly the bug this plan hit during implementation (found via an integration test, not by inspection). Add a `$dependsFeature` off-switch later, deliberately, once someone actually seeds the corresponding `toggles` row as part of that change. Non-blocking per NFR-01/FR-06; pattern from `GlobalDomainEventHandlers/Academies/UpdateAIVectorEmbeddingListener.php`. Register in `GlobalDomainEventServiceProvider`.
  - The lookup lives in the listener, not the Specification, so that **non-opt-in discussions never enqueue a job at all** — they are the large majority.
- Web/Action: `Dicoding/Web/Http/Academies/Discussion/AcademyDiscussionStoreAction.php` — extend `only()` to accept `ai_assist_enabled`, and gate it inline before it reaches the Specification (Resolved Decisions #2 and #3):

  ```php
  'ai_assist_enabled' => (bool) $this->request->input('ai_assist_enabled')
      && PremiumFeature::isEnabled('forum-ai-assist')
      && !PremiumFeature::isLimitExhausted('forum-ai-assist'),
  ```

  A `beforeFilter('premium:forum-ai-assist')` is deliberately *not* used here (unlike `SendMessageAction`): this route serves all discussion creation, and gating the whole route would break FR-04 for non-Premium students. The Action stays thin — this is a boolean, not orchestration. `PremiumFeature` is a `Web\Utils` class, so calling it from the Web layer is correct; calling it from `UseCases` would not be.
- Blade: opt-in checkbox in `app/views/ui/newacademies/discussions/create.blade.php`. **Do not reuse `tools.blade.php`'s `@if($isEnabled) … @endif` hide/show** — that would make the checkbox vanish for non-Premium students and defeat FR-02/E-1.2's passive-discovery goal. The checkbox **always renders**, in one of three states:
  1. Premium + quota available → enabled, unchecked.
  2. Premium + quota exhausted → disabled, with "Kuota bantuan AI harian Anda sudah habis. Kuota akan tersedia kembali besok." (FR-05/E-1.3).
  3. Non-Premium → disabled, with "Bantuan jawaban AI hanya tersedia untuk siswa berlangganan (Premium)." **and** an "Upgrade ke Premium" CTA linking to the subscription page (FR-02/E-1.2). This state also backs the Upsell CTA CTR and Premium Conversion metrics in PRD §3.2, so give the CTA a distinguishable click target — wiring the actual click/UTM tracking is outside this plan's scope.

  Server-side enforcement (FR-03) lives in the Action gate above, independent of this view logic.
- New `app/routes/forum-ai-assist.php` (empty placeholder at this point — real routes land in later PRs), wrapped in `Route::cache(__FILE__, function () { … })`, required from `app/routes.php`.
- Tests: integration (`IntegrationTest` parent) for the gateway DB write, the API gateway HTTP call (mocked HTTP), the Specification, and discussion-creation → `AcademyDiscussionWasCreated` → queue push end-to-end. **Include a case per Resolved Decision #3:** a non-Premium student POSTing `ai_assist_enabled=true` gets a created discussion, `ai_assist_enabled = 0`, and **no** queue push.

---

## Aggregate 2 — Answer Finalization

Covers: the AI service's webhook callback lands, answer transitions to answered/error.

### PR 2a — Domain (`feature/forum-ai-assist/answer-finalization-domain`, off 1b)

- `Domain/ForumAiAssist/Aggregates/ForumAiAssistAnswerFinalization.php` — guard: answer must still be `PENDING` (mirrors `ChatbotReplyFinalization`). Raises `ForumAiAssistAnswerWasCompleted` or `ForumAiAssistAnswerWasFailed`.
- `Domain/ForumAiAssist/Events/ForumAiAssistAnswerWasCompleted.php`, `ForumAiAssistAnswerWasFailed.php`.
- `Domain/ForumAiAssist/Enums/ForumAiAssistErrorCode.php` — `LLM_ERROR | CONTENT_FILTERED | TIMEOUT | NOT_INDEXED | UNKNOWN`, matching `CallbackErrorPayload`'s Literal set exactly (mirrors `ChatErrorCode`). All five, or a callback carrying an unknown value gets rejected before it can be stored.
- `Infrastructure/Repositories/ForumAiAssist/ForumAiAssistAnswerFinalizationRepository.php` — `createAggregate()` + `save()`, mirroring `ChatbotReplyFinalizationRepository`.
- Add stub `ForumAiAssistAnswerGateway::updateStatus()` (empty body) to the Gateway from Aggregate 1.
- Tests: `ForumAiAssistAnswerFinalizationTest` (unit) with a fake Gateway.

### PR 2b — Infrastructure + Web + Spec (`feature/forum-ai-assist/answer-finalization-infra`, off 2a)

- Fill in `ForumAiAssistAnswerGateway::updateStatus()`.
- `UseCases/ForumAiAssist/ForumAiAssistAnswerFinalizationSpecification.php` — processes the callback payload, calls the aggregate, updates the row. Mirrors `ChatbotReplyFinalizationSpecification`, including returning the consumption rate in its payload via `withSuccessfulDomainPayload($aggregate, ['consumption_rate' => …])` — but the rate is a flat `1` on success and `0` on failure, since there is no model catalog to price (Resolved Decision #1).
- `Web/ForumAiAssist/CallbackActions/ForumAiAssistCallbackAction.php`:
  - Validates `Authorization: Bearer` against `config('forum_ai_assist.callback_auth_bearer')`.
  - Returns **`200`** even for an unknown or already-finalized `discussion_id` (log + no-op, never `500`) — the AI service retries 5xx up to `CALLBACK_RETRY_MAX`, so a 5xx on a genuinely-unknown id would just retry forever.
  - On the success path only, calls `PremiumFeature::consume($studentId, 'forum-ai-assist', $consumptionRate)` with the `student_id` **read from the `forum_ai_assist_answers` row**, not `Auth::id()` — this request is authenticated as the AI service, not as the student. This mirrors `SendMessageAction`'s "consume in the Action, after finalization succeeds" placement; only the id source differs. A failed answer never costs the student quota (PRD E-6.2).
- Add the callback route to `app/routes/forum-ai-assist.php`: `Route::post('api/v1/forum-ai/callback', …)` with **no `auth`/`csrf` filter** — the bearer is checked in the Action. This matches `DICODING_CALLBACK_URL`'s existing upstream default exactly, so **no AI-service-side change is needed** (ADR-0006, revised).
- Response/Blade: AI-answer block in `app/views/ui/v3/discussions/show.blade.php` (pending/answered/error states — no SSE, webhook-driven, so state renders server-side on load/refresh per FR-16); extend the discussion detail View Model (likely under `Dicoding/Web/VM/Discussions/`) with `hasAiAssistOptIn()` and `getAiAnswer()`.
- Tests: integration for the callback Action (bearer auth pass/fail, idempotency on a re-delivered callback, `200` on unknown `discussion_id`, quota consumed on success, quota **not** consumed on error), the Specification, and the gateway round-trip.

---

## Aggregate 3 — Moderator Deletion

Covers: Admin/Academy Admin/Academy Manager soft-deletes a bad answer. Ships before Feedback (see Branching Strategy) since it only needs the soft-delete columns Aggregate 1 already migrated. Satisfies FR-27–FR-30.

### PR 3a — Domain (`feature/forum-ai-assist/deletion-domain`, off 2b)

- `Domain/ForumAiAssist/Aggregates/ForumAiAssistAnswerDeletion.php` — guard: deleter holds `academy_admin`/`academy_manager`/admin role (`Domain/User/Enums/MembershipExtraRoles.php`), answer not already deleted. Raises `ForumAiAssistAnswerWasDeleted` (answer_id, discussion_id, deleted_by, deleted_at) — this event *is* the audit trail (Resolved Decision #8, satisfies FR-29).
- `Domain/ForumAiAssist/Events/ForumAiAssistAnswerWasDeleted.php`.
- `Infrastructure/Repositories/ForumAiAssist/ForumAiAssistAnswerDeletionRepository.php`.
- Add stub `ForumAiAssistAnswerGateway::softDeleteAnswer()` (empty body).
- Tests: `ForumAiAssistAnswerDeletionTest` (unit).

### PR 3b — Infrastructure + Web + Spec (`feature/forum-ai-assist/deletion-infra`, off 3a)

- Fill in `ForumAiAssistAnswerGateway::softDeleteAnswer()`.
- `UseCases/ForumAiAssist/ForumAiAssistAnswerDeletionSpecification.php`.
- `Web/ForumAiAssist/AnswerActions/DeleteAnswerAction.php` — `DELETE /api/v1/forum-ai/{discussionId}/answer`. Filters `academy_admin` and `academy_manager` are both registered (`app/filters.php:89-90`) but `beforeFilter` composes as AND, not OR — so confirm during implementation whether a combined filter exists; if not, apply `beforeFilter('auth')` and do the role OR-check in the aggregate's guard, where it is already specified. Route added to `app/routes/forum-ai-assist.php`.
- Response/Blade: moderator delete button (role-gated) + confirm dialog + "deleted by moderator" state in the AI-answer block (FR-28). Deleting must not touch the discussion or human replies (FR-30) — the aggregate only ever writes to `forum_ai_assist_answers`, never to `developer_journey_discussions`/`course_discussion_comments_new`, so this is structurally guaranteed rather than something to test defensively.
- Tests: integration for the delete Action, role gating (each allowed role passes, a plain student gets rejected), and the gateway soft-delete.

---

## Aggregate 4 — Feedback Submission

Covers: student marks an answer helpful/not-helpful (+ optional qualitative text). Ships last, so it can render the `DELETED` state correctly from day one.

### PR 4a — Domain (`feature/forum-ai-assist/feedback-domain`, off 3b)

- `Domain/ForumAiAssist/Aggregates/ForumAiAssistFeedbackSubmission.php` — guard: answer must be `ANSWERED` (not `PENDING`/`ERROR`/`DELETED`); one feedback per student per answer, replaceable (FR-24). Raises `ForumAiAssistFeedbackWasSubmitted`. Mirrors `ChatbotFeedbackSubmission`.
- `Domain/ForumAiAssist/Events/ForumAiAssistFeedbackWasSubmitted.php`.
- `Domain/ForumAiAssist/Enums/ForumAiAssistFeedbackSentiment.php` — `HELPFUL | NOT_HELPFUL` (mirrors `FeedbackSentiment`).
- `Infrastructure/Repositories/ForumAiAssist/ForumAiAssistFeedbackSubmissionRepository.php`.
- `Infrastructure/StorageGateways/ForumAiAssist/ForumAiAssistFeedbackGateway.php` — **a separate gateway class**, with `upsertFeedback()` stubbed. Mirrors the `ChatbotMessageGateway` / `ChatbotFeedbackGateway` split rather than piling feedback onto `ForumAiAssistAnswerGateway` (a correction to an earlier draft).
- Tests: `ForumAiAssistFeedbackSubmissionTest` (unit).

### PR 4b — Infrastructure + Web + Spec (`feature/forum-ai-assist/feedback-infra`, off 4a)

- Migration: `…_create_forum_ai_assist_feedback_table.php` — `answer_id` (unique FK), `student_id`, `sentiment`, `qualitative_text` (nullable text), timestamps. Mirrors `student_chatbot_feedback` (`2026_06_18_000001_…`) plus `qualitative_text`, which that table does not have — the addition is required by FR-23.
- Fill in `ForumAiAssistFeedbackGateway::upsertFeedback()` using `ChatbotFeedbackGateway::upsertFeedback()`'s select-then-update-or-insert shape verbatim. Qualitative text is internal-only per FR-23 — stored for team evaluation, never rendered publicly.
- `UseCases/ForumAiAssist/ForumAiAssistFeedbackSubmissionSpecification.php`.
- `Web/ForumAiAssist/FeedbackActions/SubmitFeedbackAction.php` — `PUT /api/v1/forum-ai/{discussionId}/feedback`, body `{sentiment: helpful|not_helpful, qualitative_text?}`. Route added.
- Response/Blade: helpful/not-helpful buttons + qualitative textarea (shown only when "not helpful" is picked, per FR-23/E-4.2) inside the AI-answer block from Aggregate 2, hidden entirely when the answer is `DELETED` (PRD §8.6 edge case #8). Plain fetch-based submit (button-binding idea only from `frontend/src/pages/student-chatbot/chatbot/renderers.ts`, not its streaming machinery). FR-25's aggregate helpful/not-helpful count display is Low priority/optional — add only if trivial once `upsertFeedback()` exists, otherwise explicitly defer.
- Tests: integration for the feedback Action and the gateway upsert (including replacing an existing feedback, and rejection when the answer is `DELETED`).

---

## Verification

- Every PR: `deck ai:psalm <paths>` on its new/changed PHP files before opening it.
- Every "Domain" PR (Aggregates 1–4 only — Aggregate 0 has none): `deck ai:test --filter='<Aggregate>' --testsuite=unit`.
- Every "Infrastructure + Web + Spec" PR, **and both of Aggregate 0's PRs** (0a/0b are infra-only): `deck ai:test --filter='ForumAiAssist' --testsuite=integration`.
- Aggregate 0a additionally re-runs the touched shared-domain tests after widening `CourseTutorialWasSetAsReady`: `deck ai:test --filter='AcademyTutorialUpdate' --testsuite=unit` and `deck ai:test --filter='SetReady' --testsuite=integration`.
- Manual end-to-end (after PR 4b lands): create a discussion with the checkbox on (Premium test student), confirm the non-blocking redirect, then simulate the callback with `curl` against `POST /api/v1/forum-ai/callback` (configured bearer, no real AI service needed) to confirm pending → answered and that quota was consumed exactly once. Repeat with an error payload and confirm quota was **not** consumed. Then confirm feedback submit, moderator delete, and the non-Premium disabled-checkbox state.
- Regression check (PRD §5.6, no new code expected — just confirm untouched): "Tandai Diskusi Selesai" (FR-31) still works on an opt-in discussion; existing forum reply notifications (FR-32) still fire for human replies and nothing extra fires for the AI answer.
- NFR-09 (observability — every AI request logged with user/course/status/duration) is satisfied by a mix of the `forum_ai_assist_answers` row and LangFuse: `student_id`/`course_id`/`status` are the stored row (see `latency_ms` drop above — no `duration` column); "durasi" comes from the LangFuse trace, not this table. Anything deeper (prompt, tokens, cost, retrieved documents) also lives in LangFuse, reachable from the row without a stored id. No separate logging table; confirm during PR 1b/2b integration tests rather than adding infrastructure. Known gap: a request that errors before `trace_scope` opens has no LangFuse duration either (see `error_code` note above) — accepted for MVP.

## Open items to raise before launch

1. **Profanity filter** (NFR-06) — still not implemented on either side. A wordlist/regex pass was built and **rolled back by team decision**: static lists are brittle against spelling variants and leetspeak, and false-positive on technical terms. A different approach (classifier, or a model-level guardrail) is being evaluated. Until it lands, FR-27 post-hoc moderation is the only backstop. Owner: AI Engineer / PM.
2. **Final quota numbers** for `forum-ai-assist` in `premium_feature_configs.php` — currently placeholders. Not a blocker for implementation; must be filled before student rollout. Changing them needs no redeploy (E-6.1/NFR-08 satisfied). Owner: Product.
3. **FR-25** (aggregate helpful/not-helpful counts) — Low priority/optional, deferred. Revisit once `upsertFeedback()` exists and there is real feedback data. Owner: Product / BE.
4. **No retry path for a student after a final `ERROR` state.** Confirmed against the PRD: FR-13/E-2.6's 2x retry happens *inside* the AI service before the callback ever arrives, so by the time dicoding.com sees `status: "error"` retries are already exhausted. FR-19/E-3.4 and the §8.5 error microcopy only specify a static "AI tidak dapat menjawab" message — no "coba lagi"/regenerate action anywhere in scope, and §4.2 explicitly defers "Auto-regenerate setelah feedback 'not helpful'" to a future phase, the same design stance. Structurally, `ForumAiAssistAnswerDispatch`'s `ALREADY_DISPATCHED` guard blocks re-dispatch for that discussion regardless of status, so a failed request can never be retried in place — a student's only option is opening a brand-new discussion (a fresh question, not a retry of the failed one). Quota is not charged on failure (E-6.2, consume() only fires on the success path — PR 2b), so this isn't a cost problem, but it may be a UX gap worth a product call before launch: does a failed AI answer need any student-facing recovery action beyond "ask a new question"? Owner: Product.

**Closed since the first draft:** `not_indexed` error code (shipped upstream); indexing verification (bounded polling, ADR-0011); LangFuse correlation without a stored `request_id` (ADR-0010); the over-wide answer table (17 → 12 columns).
