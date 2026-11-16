# Sabak Checkout Card Restyle — Implementation Plan

Restyle Sabak's package picker on `daily-add-ons-checkout.blade.php` from a plain
radio list to the card layout shown in the new Figma design (2 cards: "Akses Sabak
1 Hari" / "Akses Sabak 30 Hari", icon + description + price, still clickable to
select).

This was explicitly **out of scope** for PR #5453 —
`docs/handoffs/daily-add-ons/upgrade-modal-figma-plan.md` §3/§7 decided
"Sabak is untouched... Sabak keeps its current flow until its own trigger/entry
point is designed separately." This plan is that follow-up. Not related to the
next-PR items in `pr-5453-task-breakdown.md` (#10/#11/#12) — those are their own
tracks (security, guest-checkout, design-system standardization).

## Decisions (from brainstorm)

- Cards **replace** the radio picker (same clickable-to-select behavior as the
  current `<label><input type=radio>`), not an additional widget alongside it.
- `icon` is a **required** per-package config field — no code fallback. Every
  package must declare its own icon filename explicitly.
- The existing `public/img/daily-add-ons/add-on-icon.png` is actually
  student-chatbot's icon, misnamed generically. Rename it — don't reuse it as a
  Sabak fallback.
- The mock's "/ hari" price caption is wrong: Sabak's config price is a flat
  per-package amount (`1 => 20000`, `30 => 250000`), not a daily rate. Drop the
  misleading suffix.

## Tasks

`pr-5453-task-breakdown.md` #10 ("don't trust `days` from the form") turned out
to be **already resolved server-side** — verified by reading
`PurchaseDailyAddOnSpecification::assertPackageIsConfigured()` (rejects any
`days` not present as a package key in `daily_add_on_configs` for that
`add_on_type`) and `DailyAddOnInvoiceService::createInvoice()` (price is always
looked up from config via the validated `days`, never read from the request).
A form field is unavoidably client-controlled — the only real guarantee is
server-side validation against config, which already exists. No backend change
needed; the existing `Form::hidden('days', ...)` + `@if($hasSinglePackage)`
guard stays as-is. This removes the dependency 5/6 had on a "task 0".

| # | Item | File | Blocked by |
|---|---|---|---|
| 1 | Rename `add-on-icon.png` → `student-chatbot-icon.png` (grep for other references first) | `public/img/daily-add-ons/` | none |
| 2 | Fix header subtitle hardcoded to AI-credit wording — wrong when add-on is Sabak | `daily-add-ons-checkout.blade.php:49-50` | none |
| 3 | Config: add `icon` (required, all 3 packages) + `description` (both `sabak` packages, copy from mock) | `app/config/daily_add_on_configs.php` | Sabak's 2 icon filenames — waiting on your Figma export |
| 4 | `mapPackages()`: map `icon`, no `??` fallback; update docblock/type | `DailyAddOnPurchaseViewModel.php` | #3 |
| 5 | Convert Sabak's `@foreach` radio list into clickable cards (icon, label, description, price, no "/hari") — keep submitting `days` via the radio `value`, same as today | `daily-add-ons-checkout.blade.php:74-93` | #4 |
| 6 | Bill summary: add item-name row + JS update for the non-`hasSinglePackage` path (today only price updates on selection) | `daily-add-ons-checkout.blade.php:112-117,172-177` | #5 |

## Not in this plan

- Genuine cross-sell (recommending a *different* add-on during checkout) —
  deferred as fast-follow since `upgrade-modal-figma-plan.md` §7 decision #4,
  still unscoped.
- `pr-5453-task-breakdown.md` next-PR items #10/#11/#12 — independent tracks.
