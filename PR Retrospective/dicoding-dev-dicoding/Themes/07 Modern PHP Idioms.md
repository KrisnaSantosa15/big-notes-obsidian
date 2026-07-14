---
tags: [pr-retro, theme/php-idioms, severity/low]
prs: ["#5017", "#5033", "#5132", "#5224", "#5286", "#5324"]
status: recurring
---

# Modern PHP Idioms & Trusting the Type System

## The pattern
Two related habits: (a) not using PHP 8 constructor property promotion where it removes boilerplate, and (b) adding defensive `is_array()` checks or manual casts where the method's own return/param type already guarantees the value's shape.

## Evidence

**Constructor promotion, PR #5017** (said on two different classes in the same PR):
> "sebenarnya, di PHP sekarang, parameter constructor sudah bisa dijadikan member dari sebuah class, sehingga tidak perlu redefine lagi dengan nama yang sama... `public function __construct(private readonly EmailSubscription $existingSubscriptions) {}`"
> "Ini bisa kita sederhanakan menggunakan constructor property... sehingga tidak perlu recreate (di L15) dan assign (di L21) ini."

**Redundant re-derivation instead of using the promoted property directly, same PR:**
> "Karena kita sudah memiliki field `existingSubscriptions` sebagai member, maka penerapan ini bisa langsung seperti ini, tidak perlu recreate: `$this->newSubscriptions = $this->existingSubscriptions->withSubscribed($subscriptions);`"

**Trusting types, PR #5132**:
> "Harusnya ga perlu casting lagi, karena ketika masuk ke parameter yang integer sudah di casting"

**Trusting types, PR #5224** (twice):
> "ga perlu casting, karena auto casting dengan adanya return type array"
> "kenapa ga langsung Integer aja?" (generic/loose type used where a specific type hint was available)

**PR #5033** — same idea applied to test doubles: *"Karena sudah pasti array, maka tidak perlu pengecekan `is_array` lagi"*, and *"Spesifik string kan? Gunakan type spesifik aja."*

**Dead/redundant code left in, PR #5286 / #5324** — same family, one step earlier than a redundant guard (code that does nothing at all, not just an unnecessary check):
> hasbi-ashshidiq23: "ini perlu kah? di import tapi tidak digunakan" (unused import)
> hasbi-ashshidiq23: "kenapa ini cek 2 port yg sama?" (the same condition checked twice)
> AlexzPurewoko: "Property ini sudah tidak digunakan lagi" (unused property left after a refactor)

## Why it matters
Every instance here is dead code that exists purely because the author didn't trust (or didn't check) a guarantee the type system already enforces. It's harmless individually, but it compounds into noise: a reader has to verify "is this cast/check actually doing something" every time they hit one, which is wasted cognitive load multiplied across the whole diff.

## Root cause
Writing defensively out of habit rather than checking the actual declared type of the value one line above. This is muscle memory from looser-typed PHP/JS code, not yet updated for a PHP 8.2 codebase with real scalar/return types.

## How to fix
- Before adding a cast or an `is_array`/`is_string` guard, check the declared type of the source (method return type, param type hint, property type). If it's already guaranteed, delete the guard.
- Default to constructor property promotion (`private readonly Type $name`) for any dependency/value that's just stored and read — only fall back to a manual property + assignment when you need extra logic in the constructor body.
- When a promoted property already models the exact value you're about to recompute, call the property/its methods directly instead of rebuilding an equivalent — this is the same instinct as [[03 Reuse Before You Build]], just scoped to "reuse the class's own state."

## Related
[[00 Index]] · [[03 Reuse Before You Build]]
