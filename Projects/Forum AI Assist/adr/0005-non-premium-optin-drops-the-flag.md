# A rejected opt-in drops the flag; it never rejects the discussion

When a non-Premium student, or a Premium student whose quota is exhausted, submits a discussion with `ai_assist_enabled=true`, the discussion is created normally with `ai_assist_enabled` persisted as false. No `forum_ai_assist_answers` row, no queue job, no error.

PRD FR-03 and E-1.2 #4 say the server must reject a request that bypasses the client-side gating, which reads naturally as a 403. We rejected that reading. FR-04 and Flow 5 both state that creating a discussion without opt-in is always allowed, so the only thing that legitimately needs rejecting is the *opt-in*, not the post. A hard 403 also has a real failure mode with no upside: a FE bug, a stale cached form, or a quota that runs out between form render and submit would cost the student their typed draft — punishing an honest user for a race, in order to inconvenience an attacker who gains nothing either way.

The security property FR-03 actually wants is preserved in full: a bypassed checkbox never triggers an AI request and never consumes quota. The enforcement lives in the Action gate (ADR-0003), independent of the Blade view logic, so client-side tampering cannot reach it. A warning field in the response was considered and deferred — it is additional FE work for a state that only occurs on tampering or on a narrow race.
