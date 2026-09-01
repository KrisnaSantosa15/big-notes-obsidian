---
tags: [pr-retro, theme/naming, severity/medium]
prs: ["#5017", "#5061", "#5078", "#5219", "#5033", "#5286", "#5316", "#5324", "#5596", "#5593"]
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


## 2026-08-24 Evidence (continued)

### PR #5596 (Update plan copy) — UI Copy Naming

dimasmds on em dashes in product copy:

> "em dash ini indentik dengan AI sekali, better jangan pakai em dash. Alternatif rewrite jadi `- Coba Dulu 1 Hari` / `- 1 Hari: Coba Dulu`"

This continues the [[08 Naming and File Organization]] pattern but applies it to user-visible copy, not code. Even in templates, consistency in punctuation and naming patterns across UI surfaces matters for product coherence. Em dashes risk confusion with AI-generated content when the feature is not AI-related.

### PR #5593 (Token Issuance — create domain layer) — Domain Term Consolidation

AlexzPurewoko on aggregate naming and term consistency:

> "Yang closer dengan term domain aja bang... betul misal new daily add on token atau existing"

> "Btw ini kalau pake object-mu yang ada sekarang gimana kah? Atau menurutku buat object baru sih dan satukan dengan input yang ada di L40 saja, karena merupakan input dari user"

Reinforces the theme: pick domain terms first, then consistently apply them to parameters, class names, and value objects. Don't invent separate names for the same concept.

### PR #5286 (Add mkdocs documentation site) — Documentation Asset Placement

AlexzPurewoko on file organization in the docs tree:

> "Btw ini buat assets di mkdocs-nya ya? Better buat folder baru aja bang, kurang cocok karena ini bukan docs..."

> "Oh iya baru ngeh dia ngambil patokan relativenya adalah main 'docs'. Kalau gitu, mending masukin ke `docs/mkdocs-customization/ai-assistant.{ts,js}`"

Same root issue as #5033's Transformer placement: assets that aren't docs get misplaced in the docs folder. The fix is the same too — establish a folder hierarchy that groups by *type* (Transformers, AI customizations) not by *proximity to where they're used*.
