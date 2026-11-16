---
date: 2026-10-13
updated: 2026-10-13
type: adr
decision: "Quota uses the PremiumFeature system under ACADEMY_SUBSCRIPTION, measured in requests"
tags: [adr, decision, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Quota uses the PremiumFeature system under ACADEMY_SUBSCRIPTION, measured in requests

Forum AI Assist registers in `app/config/premium_feature_configs.php` as `forum-ai-assist`, with `feature_subscribed_to: [SubscriptionType::ACADEMY_SUBSCRIPTION]` and `unit_measurement: REQUEST` at a flat rate of 1 per successful answer. No bespoke usage table, no new `SubscriptionType` case, no `DailyAddOnType` mapping.

`ACADEMY_SUBSCRIPTION` follows `explain-with-ai` rather than `student-chatbot`. Student Chatbot and Sabak each declare a dedicated add-on case because they are sold separately; Forum AI Assist is a benefit of the class subscription itself, which is also how the PRD glossary defines Premium ("siswa berlangganan berbayar di Dicoding"). Introducing an add-on case for a product that is not sold as an add-on would create an entitlement nobody can grant.

`REQUEST` also diverges from Student Chatbot deliberately. Credits exist there to price different model tiers against each other; Forum AI Assist exposes no model selection at all (ADR-0009), so every answer costs the same and a fractional rate would encode a distinction that does not exist. Limit numbers stay placeholders pending Product — PRD E-6.1 and NFR-08 only require that they live in config and change without a redeploy, which this satisfies. Note the platform-wide consequence carried over from Student Chatbot's ADR-0003: PremiumFeature resets on a rolling 24h window from `last_reset_at`, not calendar-aligned to 00:00 WIB, so the "kuota reset besok" microcopy must be derived per user rather than hard-coded to a clock time.
