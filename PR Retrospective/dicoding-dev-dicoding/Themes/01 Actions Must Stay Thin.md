---
tags: [pr-retro, theme/architecture, severity/high]
prs: ["#5104", "#5078", "#5033"]
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

## Related
[[00 Index]] · [[05 Self-Documenting Code]] · [[10 PR and Team Process Hygiene]]
