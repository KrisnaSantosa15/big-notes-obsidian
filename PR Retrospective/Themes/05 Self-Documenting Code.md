---
tags: [pr-retro, theme/readability, severity/medium]
prs: ["#5224", "#5078"]
status: recurring
---

# Self-Documenting Code & Response Shapes

## The pattern
Writing response-building code where a reader has to open two or three nested function calls to figure out what an API actually returns, or writing a Transformer with enough branching logic that it stopped being obviously correct at a glance.

## Evidence

**PR #5224** — agissept flagged this three separate times on the same PR:
> "Sebisa mungkin, ketika developer baca response action ini, developer bisa langsung tau struktur data yang di kembalikan itu seperti apa. Jadi ga perlu dive ke masing-masing fungsi dan menebak-nebak struktur responsenya."

> "Makudnya gimana biar developer itu bisa cepat recognize struktur data `submodules` dan `all_modules_completed`... kalo gini kan developer perlu dive dalem banget... liat method `getSubmodulesForCourse`, memahami isi fungsinya, terus liat lagi method `getActiveCoursesWithModules`... itu prosesnya panjang."

> On a Gateway method returning something reusable: "kalo bikin fungsi di gateway harus expect akan digunakan orang lain, dan pastikan orang lain bisa pake dengan mudah."

**PR #5078** — same complaint aimed at a Transformer class:
> "Class ini sebenarnya sulit untuk dimegerti oleh orang lain, bisakah dibuat lebih mudah dibaca dengan menghilangkan logic yang rumit?"

And a concrete extract-method suggestion on a trait doing multiple unrelated conversions inline:
> "Ini bisa diextract ke beberapa function, misal `convertToScalar`, `convertToDate`, dll"

## Why it matters
This is a different axis from correctness — the code worked, but the *shape of the response* wasn't discoverable without executing it mentally across multiple files. In an API layer specifically, the Action/Transformer is the contract other developers (and frontend engineers) read to understand what they're consuming — if that contract requires tracing three private methods across two classes, it stops functioning as documentation.

## Root cause
Building the response bottom-up (compute what's needed, wire it together) without a final pass asking "if I only read this Action/Transformer's top-level body, could I state the shape of the response out loud?"

## How to fix
- After wiring an Action/Transformer, do a cold read of just that file (not the functions it calls) and try to state the output shape. If you can't, name/extract the pieces until you can — one function per concern (`convertToScalar`, `convertToDate` is the exact bar agissept set).
- A Gateway method is a public contract for the whole domain, not just today's caller — write its name and return shape assuming a stranger will call it next month without reading its body.
- This pairs directly with [[01 Actions Must Stay Thin]]: an Action that only orchestrates a well-named Specification/ViewModel call is naturally self-documenting, because there's nothing left to hide.

## Related
[[00 Index]] · [[01 Actions Must Stay Thin]] · [[04 Query Efficiency]]
