# Forum AI Assist sends no provider, model, persona or reasoning hint

Every outbound request to `POST /api/v1/forum-ai/answers` omits `provider`, `model_name`, `persona` and `reasoning_effort`, letting the AI service fall back to its own `DEFAULT_PROVIDER` / `DEFAULT_MODEL`. There is no model picker, no `SelectModelAction`, no config key for a default model on the PHP side.

The AI service's request schema accepts all four fields, and Student Chatbot — the precedent this domain otherwise mirrors closely — has a full model-selection stack (`SelectModelAction`, `GetListModelsAction`, a per-session `model` column, a FE picker). Mirroring it here would have been the path of least thought. The PRD does not ask for it: its only mention of "model" is an instruction to *avoid* the words "model" and "LLM" in user-facing copy, which is the opposite of a feature request.

Two consequences worth stating. Model choice becomes an AI-service deployment concern, changeable without a dicoding.com release — appropriate, since nobody on the product side has expressed an opinion about it. And quota can be a flat one-request-per-answer rather than a fractional credit rate (ADR-0004), because there are no tiers to price against each other. If per-model pricing or student-facing selection is ever wanted, both of those unwind together.
