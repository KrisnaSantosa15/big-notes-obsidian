# Naming brainstorm: singular vs plural for "Add-On(s)"

Personal learning notes — not part of the committed domain docs. Captures the reasoning behind why `MonthlyAddOns` (plural bounded context) contains singular entities like `MonthlyAddOnPurchase`, and an open question about `EventListener` naming that came out of checking real precedent in this codebase instead of just theorizing.

## The core question

For a product line like Add-Ons (Sabak, Learning-with-AI, and future products), when should code identifiers be **plural** (`AddOns`) vs **singular** (`AddOn`)?

## The pattern that turned out to be correct

| Level | Form | Example | Why |
|---|---|---|---|
| Bounded context / namespace | **Plural** | `MonthlyAddOns` | It's a *category* with multiple members — same reasoning as this codebase's own `Subscriptions`, `PremiumFeatures`, `Scholarships`, `Notifications` |
| Aggregate / event / enum / VO | **Singular** | `MonthlyAddOnPurchase`, `MonthlyAddOnWasPurchased`, `MonthlyAddOnType`, `MonthlyAddOnExpiry` | Each instance represents *one* operation on *one* add-on — matches `SubscriptionPurchase` (not `SubscriptionsPurchase`), enum conventions like `OrderStatus`, and Laravel's Eloquent convention (singular model, plural table) |
| Gateway / persistence class | **Singular** | `MonthlyAddOnGateway` | Mirrors `UserRepository`/`User` model convention — the class represents "the thing," not "the collection" |
| Table | **Plural** | `monthly_add_on_purchases` | Standard SQL/Eloquent convention — a table always holds many rows |
| Config catalog | **Plural container, singular qualifier** | `add_on_configs.php` | Matches the existing `premium_feature_configs.php` exactly — singular "feature"/"add_on" describes *what kind*, plural "configs" describes *the collection* |

**The general rule this reflects**: plural for the collection/context, singular for one instance of the thing inside it. This is the standard DDD + REST-collection pattern — and it happens to already match this codebase's dominant style, not just abstract theory.

## Where checking real precedent overturned my own "fix"

Earlier in this work I renamed `AddOnsEventListener` → `MonthlyAddOnEventListener` (singular), reasoning by analogy from the aggregate-naming rule above. That was a mistake made *without* checking the actual codebase first.

Real precedent, found by grepping `Dicoding/Infrastructure/GlobalDomainEventHandlers/`:

```
Subscriptions/SubscriptionsEventListener.php    — PLURAL, matches its plural folder
Users/UsersEventListener.php                     — PLURAL, matches its plural folder
PremiumFeatures/PremiumFeatureEventListener.php  — SINGULAR, does NOT match its plural folder
```

Two out of three bounded-context-level "catchall" event listeners use the **plural** form matching their folder name, not the singular entity-instance rule. And the strongest analogy — `Subscriptions` — is the exact sibling context this whole Add-Ons design has been mirroring throughout the PRD. That's a better precedent to follow than treating `PremiumFeatures` (the outlier) as the tiebreaker.

**Lesson**: when a codebase has an established sibling pattern to mirror, check the sibling's actual file names before applying a "clean" rule derived by analogy. The analogy can be right in general and still wrong for one specific identifier that has a closer, more literal precedent sitting right next to it.

**Still undecided as of this writing**: whether to revert `MonthlyAddOnEventListener` back to `MonthlyAddOnsEventListener` (plural, matching `Subscriptions`) or keep it singular (matching the aggregate/event singular convention). Genuinely a 2-1 split in the existing codebase, not a clean rule — a judgment call, not a fact to look up.

## Linguistics note

"Add-on" is a phrasal-verb-derived compound noun (from "to add on" → "an add-on"). Its dictionary-standard plural is "add-ons" — regular pluralization applied to the whole compound, the same way "checkup" → "checkups" or "workout" → "workouts" (not an irregular or ambiguous plural).

The hyphen is correct in prose/product naming (`Add-On` / `Add-Ons`) but naturally drops in PascalCase (`AddOn` / `AddOns`, since hyphens aren't valid in most languages' identifiers) and becomes an underscore in snake_case (`add_on` / `add_ons`). This is just standard casing-convention translation, not a separate naming decision — the hyphen, no-hyphen, and underscore forms are all "the same word," just written for different contexts (prose vs PascalCase vs snake_case).
