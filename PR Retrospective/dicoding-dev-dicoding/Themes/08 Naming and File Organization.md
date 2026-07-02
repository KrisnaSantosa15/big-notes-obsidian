---
tags: [pr-retro, theme/naming, severity/low]
prs: ["#5017", "#5061", "#5078", "#5219", "#5033"]
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

## Why it matters
None of these block functionality, which is exactly why they're worth collecting in one place — they're pure "does this match how the rest of the team reads code" signal, and they're cheap to self-check before opening a PR (unlike architecture calls, which need judgment).

## How to fix
Before opening a PR, a 2-minute self-check pass:
- Any variable holding domain state before *and* after a change? Name both sides explicitly (`old`/`new`, `existing`/`updated`).
- Any new file? Check where its sibling types already live (`Dicoding/Web/Transformers`, `Dicoding/Web/VM/{Domain}`, etc.) before creating a new folder/namespace.
- Any boolean-returning function? Name it as the predicate (`isEligible()`), not as a getter (`getEligible()`).
- Any casing that looks different from the three surrounding lines? That's the tell — match the file, not a personal habit.

## Related
[[00 Index]] · [[01 Actions Must Stay Thin]] · [[03 Reuse Before You Build]]
