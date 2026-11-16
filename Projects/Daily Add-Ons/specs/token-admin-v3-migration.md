---
date: 2026-10-13
updated: 2026-10-13
type: spec
tags: [spec, dicoding, daily-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Daily Add-On Token Admin — v3 UI Migration Plan

Migrate the daily-add-on token admin pages (`index`/`create`/`edit`) from the
current Bootstrap/legacy-widget markup to match the newer `dcd-*` design
system already used by `app/views/ui/v3/dashboards/academies/multicoursetokens/*`
— including route path, sidebar entry, and the widgets underneath each form
field. Reference implementation throughout: `multicoursetokens/index.blade.php`
and `multicoursetokens/create.blade.php`.

## Blocked by — do not start any task below yet

**Wait until PR #5638 (`token-issuance-index`) AND #5651 (`token-issuance-export`)
are both merged to master.** Confirmed via `gh pr list --search "daily-add-ons"
--state all --json number,title,headRefName,baseRefName,state`:

- `#5638` (index, base master) — currently **under active review**
- `#5651` (export, base `#5638`) — stacked directly on it, also touches
  `index.blade.php` and adds a route to `routes.php`

Both touch the exact files (`index.blade.php`, `routes.php`) this migration
rewrites. Restructuring them mid-review invalidates the reviewer's
line-anchored comments and forces `#5651` to rebase/conflict. `#5666`
(redemption-domain) and `#5671` (redemption-infra) do **not** touch any view
or route file for this feature (verified by diff) — they don't block this
plan and can keep moving in parallel.

Explicit user decision (2026-09-03): hold **every** task below — including
the standalone datepicker bugfix (#2), which is technically independent of
`#5638`/`#5651` since it only touches already-merged `create.blade.php`/
`edit.blade.php` — until the whole gate above clears, to keep this as one
clean follow-up piece of work rather than splitting it further.

See memory `project_daily_addons_v3_migration_sequencing` for the full
reasoning; re-check PR state before starting.

## Already done

- ✅ Search dropdown on `index.blade.php` migrated from `.js-search-chosen-criteria`
  / `data-search-criteria` / `data-search-label` / `data-input-helper` to the
  `data-criteria-dropdown` / `data-criteria-option` / `data-criteria-value` /
  `data-criteria-text` / `data-criteria-input` / `data-criteria-toggle`
  contract used by `frontend/src/pages/commons/scripts/widgets/searching.ts`.
  Committed on `feature/daily-add-ons/token-issuance-index`
  (`fix(daily-add-ons): migrate token search dropdown to data-criteria attributes`).
  This was safe to land immediately because the branch it's on IS the open
  PR being reviewed, not a downstream dependent.

## Tasks

| # | Item | File(s) | Notes |
|---|---|---|---|
| 1 | ~~Search dropdown → `data-criteria-*`~~ | `index.blade.php` | **Done**, see above |
| 2 | Datepicker is dead on these forms — `.js-datetime-widget`'s only implementation lives in `public/build/app.js`, which is loaded exclusively by the legacy `ui.layouts.app` layout, never by `ui.v3.layouts.dashboards` (what `ui.layouts.dashboards.admins` resolves to). Not a Vite regression — broken since these forms were built. Fix: drop the wrapper `<div class="js-datetime-widget">`, apply `.js-date-widget` (`frontend/src/pages/commons/scripts/widgets/newdatepicker.js`, already loaded via `commons/index.ts`) directly on the `<input>` | `create.blade.php` (expired_date), `edit.blade.php` (expired_date) | Same latent bug affects ~19 other blade views platform-wide (e.g. `membersubscriptions/dashboards/tokens/create.blade.php`, `v3/dashboards/redeemcodes/admin/create.blade.php`) — out of scope here, only fix daily-add-ons' own two files |
| 3 | Owner select: `.js-basic-id-emails` (selectize, `newdashboards` bundle-only) → `data-select-two` (select2, shared `commons` bundle, tema `semicolon`) + page-specific ajax wiring to `/idemails` (same endpoint, new script) | `create.blade.php`, new `frontend/src/pages/daily-add-ons-tokens-create/...` (or similar) page script | Mirrors `multi-course-tokens-create/utils.ts:10-20` |
| 4 | Add header/breadcrumb widget — currently missing entirely on all 3 views | `index.blade.php`, `create.blade.php`, `edit.blade.php` | Use `ui.newdashboards.widget.admin.header` (admin-domain equivalent of `academy.header`), with `parents` breadcrumb back to index on create/edit |
| 5 | Buttons: `btn btn-lg btn-primary/secondary shadow` → `dcd-btn dcd-btn-primary`/`dcd-btn-secondary` (no `btn-lg`, no `shadow`) | `index.blade.php`, `create.blade.php`, `edit.blade.php` | |
| 6 | Form grid breakpoints: `col-sm-3 col-lg-2` (label) → `col-lg-2`; `col-sm-9 col-lg-10` (input) → `col-lg-8 col-xl-6`; wrapper `col-md-12` → `col-lg-12` | `create.blade.php`, `edit.blade.php` | |
| 7 | Table: `table table-hover` → `table table-hover table-striped`; wrap pagination in `<div class="d-block scroll-horizontal mt-4">` | `index.blade.php` | |
| 8 | Route URL: `dashboard/administrations/daily-add-ons/tokens*` → `daily-add-on/tokens*` (index/create/store/edit/update + export once #5651 lands). **Keep the route names unchanged** (`daily_add_ons.tokens.*`) — only edit the literal path string in `Route::get/post/put(...)` — so every existing `route('daily_add_ons.tokens.*')` call site keeps working with zero ripple | `app/routes.php:4054-4077` (+ export route) | Not in any URL-prefix group, so this is a self-contained per-route edit |
| 9 | Add sidebar entry — currently **none exists** for daily-add-ons tokens in any sidebar partial | `app/views/ui/v3/navigations/dashboard/sidebar/admin.blade.php` | New `<dcd-dashboard-menu-item-collapse label="Daily Add-On">` group (or a sub-item under an existing group), gated `@if($userRoleCheck->isAdmin())`, mirroring the "Langganan" group's shape (`admin.blade.php:65-85`) |

## Explicitly deferred / optional — decide later, not required for parity

- **File relocation** to `app/views/ui/v3/dashboards/daily-add-ons/tokens/*`
  (matching where `multicoursetokens` lives). Purely organizational — both
  `ui.layouts.dashboards.admins` and `ui.layouts.dashboards.academies` are thin
  wrappers over the same `ui.v3.layouts.dashboards`, so this has zero effect
  on Vite/JS behavior. If done, update the view-name string in every Action
  class that calls `viewFactory->make('ui.dailyaddons.dashboards.tokens.*', ...)`.
- **"Batal" cancel link** — daily-add-ons create/edit has one, multicoursetokens
  create doesn't (relies on breadcrumb back-link instead). Keep as-is unless
  asked to match exactly.
- Client-side pattern validation on the description field (multicoursetokens
  has one) — cosmetic UX addition, not required.

## Not in this plan

- Any Domain/UseCase/Infrastructure/Gateway change — this is purely
  Web/Http route path literals + View markup + Navigation partial.
- Fixing `.js-datetime-widget` on the other ~19 affected blade views outside
  daily-add-ons — separate, platform-wide cleanup, its own track.
- `#5666`/`#5671` (redemption domain/infra) — independent of this plan.
