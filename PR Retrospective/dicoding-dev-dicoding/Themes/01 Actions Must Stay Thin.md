---
tags:
  - pr-retro
  - theme/architecture
  - severity/high
prs:
  - "#5104"
  - "#5078"
  - "#5033"
  - "#5324"
  - "#5626"
status: recurring
---

# Actions Must Stay Thin (DDD Layering)

## The pattern
Business rules kept leaking into `Web/Api/*Action` classes instead of living in a `UseCases` Specification, and Actions called Gateways/repositories directly instead of going through a Specification. This directly contradicts the project rule in `CLAUDE.md`:

> Actions must be thin — delegate to UseCases immediately.
> 4 layers: Web -> UseCases -> Domain -> Infrastructure.

## Evidence

**PR #5104** (Daily Check-In API) — two independent reviewers flagged the same Action twice:

> mochammadkevin: "ini kayaknya better dibuatin specification sendiri, soalnya business logic harusnya bukan di action. saranku, coba pindahin validasi enrollmentnya ke spec, biar di action cukup nerusin `courseId` sama `Auth::id()` nya ajaa"

> hasbi-ashshidiq23: "better spec yg diatas return semua data yg dibutuhkan (termasuk data checkin ini) biar action ga langsung manggil gateway. jadi layernya itu web (action) -> usecase (spec) -> gateway"

**PR #5078** (Academy Progress API) — inverse smell, logic pushed into the Web layer around the Specification instead of a ViewModel:

> agissept: "Api ini kan get doang ya? harusnya gak perlu specification mungkin cukup view model aja"
> agissept: "ini harusnya bisa dimasukkan ke vm atau objectnya aja, jadi di sini bisa langsung get data"

**PR #5033** — routes still used `'@action'` controller-method string binding instead of the invokable-action convention the codebase had already adopted:

> AlexzPurewoko: "Sebenarnya, tidak perlu menggunakan '@action' disini mengingat kita sudah mengadopsi invokable Action... Kemudian define functional `__invoke()` dalam public function dari action-nya"

**PR #5324** — same "which layer owns this" question, but for a class that isn't an Action or Specification at all: a non-transactional business-rule class (`BootcampAsahPromotionEligibilityChecker`) was placed under the `UseCases` namespace instead of `Infrastructure Services`:

> dimasmds: "BTW kenapa checker ada di use case namespace ya? Sorry aku miss di awalnya"
> dimasmds: "Karena berkas `BootcampAsahPromotionEligibilityChecker` bukan usecase dan seharusnya memang bukan usecase. Usecase itu ada kontrak dengan `UseCaseSpecification` dan behavior-nya ngaruh ke transaction db yang ter-locking."

Fixed in the immediate follow-up PR #5325 ("Move promotion eligibility checkers to Infrastructure Services").

## Why it matters
Two failure directions, same root cause — **not stopping to ask "which layer owns this decision?" before writing code**:
1. Action calling Gateway directly = business rule (e.g. enrollment validation) becomes untestable in isolation and invisible to anyone reading the Specification layer.
2. Specification used for a pure read = unnecessary ceremony, and per agissept's counter-argument in the same thread, a read-only Specification **can't be unit tested** the way a ViewModel can — it forces the team into slower integration tests for every future read endpoint. This turned into a live team debate (`agissept` vs `mochammadkevin` in #5104) that ended unresolved ("Gimana @dicoding-dev/developer apakah kita agree dengan konsekuensi ini?") — worth resurfacing with the team once this vault exists.

## Root cause
Deciding the shape of Action → UseCase wiring *while* writing the Action, instead of first asking: is this a read or a write? Does this rule need to be reused/unit-tested independently? The codebase already documents the decision path for this in `docs/domains/*/adr/` and the DDD skill.

## How to fix
- Before writing an Action: name the business rule out loud. If it's a decision/validation → Specification. If it's a pure shape-the-response query → ViewModel.
- Grep for an existing Specification/ViewModel in the same domain first (see [[03 Reuse Before You Build]]) — `Dicoding/UseCases/{Domain}` and `Dicoding/Web/VM/{Domain}` are the two candidate homes.
- When scaffolding, use the `make-ddd` skill (`make:ddd`) — it generates the Action/Specification/Gateway split already wired to the 4-layer rule, removing the temptation to shortcut it by hand.
- If genuinely unsure which layer owns a rule, ask in PR description proactively rather than let two reviewers debate it after the fact — see [[10 PR and Team Process Hygiene]].
- A class isn't automatically a UseCase just because it lives near one — dimasmds's litmus test from #5324: a real UseCase has a `UseCaseSpecification` contract and its behavior affects a locked DB transaction. If a business-rule class does neither, it likely belongs in Infrastructure Services instead.

## Related
[[00 Index]] · [[05 Self-Documenting Code]] · [[10 PR and Team Process Hygiene]]


### 2026-09-01 — PR #5626 (Token Issuance — create infra + web/UI)

Same root instinct — "which layer owns this decision" — but for a Domain-VO vs Infrastructure-Gateway boundary instead of Web-Action vs UseCases-Specification.

AlexzPurewoko:
> "Btw menurutku mending mapping disini, karena ValueObject itukan domain object, yang relatenya ke hal yang berkaitan dengan domain."

**Salah** (Gateway leans on the domain VO's `toArray()` to shape the DB row):
```php
$this->db->table(self::DAILY_ADD_ON_TOKENS_TABLE)->insert(array_map(
    static fn (NewDailyAddOnToken $token) => array_merge($token->toArray(), [
        'created_at' => $now,
        'updated_at' => $now,
    ]),
    $tokens,
));
```

**Benar** (Gateway builds the row explicitly via getters):
```php
$this->db->table(self::DAILY_ADD_ON_TOKENS_TABLE)->insert(array_map(
    static fn (NewDailyAddOnToken $token) => [
        'token' => $token->getToken(),
        'add_on_type' => $token->getAddOnType()->value,
        'days' => $token->getDays(),
        'description' => $token->getDescription(),
        'owner_id' => $token->getOwnerId(),
        'expired_date' => $token->getExpiredDate()->format('Y-m-d H:i:s'),
        'created_at' => $now,
        'updated_at' => $now,
    ],
    $tokens,
));
```

Confirmed against two sibling gateways: `SubscriptionTokenGateway::createTokens()` (older) still does the `toArray()`-then-merge shortcut; `MultiCourseTokensGateway::createTokens()` (newer — the same aggregate family this domain's naming convention was aligned to, see [[12 Aggregate Design]]) already builds the row fully explicit via getters. So this fix moves toward the newer convention, not away from an established one.

`toArray()` itself can't be deleted from the VO — `Dicoding\Domain\Common\ValueObject` declares it `abstract`. It turns out to have a real (different) consumer: `Dicoding\Web\Transformers\Traits\NormalizePayloadStructureTrait::convertObjectToSnakeCaseArray()` duck-types on `method_exists($value, 'toArray')` to serialize domain objects into API/response payloads. That's the actual reason every VO must implement it — output serialization, not DB row-shaping. The two needs happen to both produce "an array," which is what made the Gateway's shortcut look reasonable, but they're unrelated concerns.