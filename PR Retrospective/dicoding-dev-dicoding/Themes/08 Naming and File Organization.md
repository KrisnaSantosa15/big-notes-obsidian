---
tags: [pr-retro, theme/naming, severity/medium]
prs: ["#5017", "#5061", "#5078", "#5219", "#5033", "#5286", "#5316", "#5324"]
status: recurring
---

# Naming & File Organization

## The pattern
Small, individually minor naming/placement misses that kept recurring across different PRs and reviewers.

## Evidence
- **Ambiguous variable name for domain state** (#5017): `$subscriptions` was ambiguous about "before or after the change" — reviewer suggested `oldSubscriptions`/`existingSubscriptions` to make the temporal state explicit.
- **Generic parameter name for a specific concept** (#5061): "Untuk parameternya, bisa dispesifikkan ke `userId` ya" — a generic name used where the domain concept was known.
- **Boolean getter prefix** (#5078): "kalo functionya boolean gini biasanya gak pake get, tapi langsung nama valuenya" — `isX()`/`hasX()` convention over `getX()` for booleans.
- **Casing convention break** (#5219): "Kenapa jadi CapitalCase? coba pake yang sesuai di codebase aja" — introduced a casing style inconsistent with the surrounding file.
- **Transformer file placement** (#5033, said twice): a new Transformer was placed inline under the API action folder instead of the shared `Dicoding/Web/Transformers` namespace: "Transformers nanti taruh di folder atau namespace Transformers aja yak" / "Kesini aja bang `Dicoding/Web/Transformer` biar ada temennya."
- **Transformer naming should state its actual transform** (#5033): "Karena ini hasilnya adalah transformed dari camelCase ke snakeCase, lebih spesifik aja namanya."
- **Redundant words in test names** (#5033): dropping words already implied by the file/class context (see [[06 Test Discipline]]).
- **Non-doc asset misplaced in a docs folder** (#5286): a JS asset for mkdocs customization was placed directly under the docs tree — AlexzPurewoko: "Btw ini buat assets di mkdocs-nya ya? Better buat folder baru aja bang, kurang cocok karena ini bukan docs..." — same root habit as the #5033 Transformer placement, just for a docs repo instead of app code.
- **Domain name too generic** (#5316): dimasmds flagged `Domain/Addons` as underspecified for a reader without context — "Ketika baca 'Domain/Addons' terasa masih terlalu general... Usul untuk nama domain yang lebih spesifik lagi... `MonthlyAddOns` atau `AddOnTransactions`" — same instinct as #5061's generic-parameter finding, scaled up to a whole bounded-context name.
- **Compound-term casing convention, undocumented but expected** (#5316): dimasmds spelled out the exact casing rule for "add-ons" across cases — "camelCase: add-ons → addOns; PascalCase: add-ons → AddOns; snake_case: add-ons → add_ons" — worth treating as a standing rule for any multi-word domain term, not just this one.
- **UI-facing term vs backend/domain term drift** (#5316, two independent reviewers): the feature was named "Learning with AI" in product docs but already existed as `student-chatbot` in the Premium Feature system — AlexzPurewoko: "Learning with AI ini sebenarnya adalah student chatbot istilah di premium feature. Better disamakan ya"; dimasmds, separately, on the `AddonType` enum value: "Better AddonType-nya juga `student-chatbot` saja biar gak ada gap naming di-codebase backend." Two reviewers catching the same UI-vs-backend synonym gap independently is a stronger signal than either instance alone.
- **Reintroducing an already-superseded domain term** (#5324): AlexzPurewoko — "Pakai termnya `*_course_*` karena term kelas di kita adalah course" — `kelas`/"class" was used where the codebase's established term is `course`.

## Why it matters
None of these block functionality, which is exactly why they're worth collecting in one place — they're pure "does this match how the rest of the team reads code" signal, and they're cheap to self-check before opening a PR (unlike architecture calls, which need judgment). **Severity bumped low → medium on 2026-07-14**: this is now the most frequently recurring theme in the vault (8 PRs), and the 2026-07 batch adds a new sub-pattern — naming drift between product/UI language and backend/domain code — caught by two different reviewers independently in the same PR (#5316), suggesting it's an easy miss even for reviewers, not just authors.

## How to fix
Before opening a PR, a 2-minute self-check pass:
- Any variable holding domain state before *and* after a change? Name both sides explicitly (`old`/`new`, `existing`/`updated`).
- Any new file? Check where its sibling types already live (`Dicoding/Web/Transformers`, `Dicoding/Web/VM/{Domain}`, etc.) before creating a new folder/namespace.
- Any boolean-returning function? Name it as the predicate (`isEligible()`), not as a getter (`getEligible()`).
- Any casing that looks different from the three surrounding lines? That's the tell — match the file, not a personal habit.
- Naming a new domain/bounded-context/enum value? Grep for the term the *rest of the codebase* already uses for this concept (an existing enum, an existing UI copy string) before picking a name — especially check whether product/marketing language ("Learning with AI") and backend code ("student-chatbot") already disagree.

## Related
[[00 Index]] · [[01 Actions Must Stay Thin]] · [[03 Reuse Before You Build]]
