---
tags: [pr-retro, theme/auth, severity/medium]
prs: ["#5104", "#5033", "#5132"]
status: recurring
---

# OAuth Scopes — Practical Mental Model

## The pattern
Recurring confusion about the project's OAuth scope model: what `readonly` vs `readwrite` actually mean, where scopes get registered, and what happens when a route's filters are changed without understanding both filters' roles.

## Evidence
- **Misapplying scope, PR #5104** (twice): "Btw ini harusnya pake scope readonly aja" / "Ini juga pake scope readonly" — `readwrite` used on endpoints that only read data.
- **Scope hierarchy misunderstanding, PR #5104**: "walaupun defined yang ada di konfig oauth scopes itu readwrite, si readwrite ini bisa dua operasi: readonly, readwrite. Ini juga menandakan bahwa operasi dari API ini hanya read aja." — i.e. `readwrite` scope holders can call `readonly` endpoints, so the endpoint itself should still declare the narrower `readonly` scope it actually needs.
- **Missing scope registration, PR #5033**: "perlu setup oauth scopes nanti di `oauth_server_scopes.php`... setelah setup server scope, bisa ditambahkan di filter spt ini: `$this->beforeFilter('oauth2:dashboard:students:readonly');`" — a new scope was used without being registered first.
- **Dropping a required filter accidentally, PR #5132**: "jadi 2 filternya, yang oauth jangan dihapus, btw conflict" — removing what looked like a redundant filter actually removed a required one, causing a merge conflict/regression.

## Why it matters
OAuth scope + route filter mistakes are the kind of thing that either fail loudly in a shared client's integration (annoying, visible) or fail silently by being *more* permissive than intended (a real security-adjacent risk, even if none of these specific instances were exploited). This is a good candidate for a short onboarding note, since it bit the same author three separate times across three PRs.

## How to fix
- Mental model to memorize: a route declares the **narrowest** scope its handler actually needs (`readonly` if it only reads), regardless of what scope tier a given client happens to hold. `readwrite` clients naturally satisfy `readonly` checks — the inverse is never true.
- New scope string → it must exist in `oauth_server_scopes.php` before it can be used in a `beforeFilter('oauth2:...')` call. Grep that config file first if a scope you want doesn't look already registered.
- Multiple filters on one route usually aren't redundant with each other (e.g. an `oauth2` filter and a session/`auth` filter can both be required for different reasons) — before deleting one, understand what it *specifically* guards, not just "it looks like the other filter also blocks unauthenticated users."

## Related
[[00 Index]] · [[01 Actions Must Stay Thin]]
