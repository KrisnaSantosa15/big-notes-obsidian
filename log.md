# Vault Log

Pointer file. Log entries are NOT stored here - they live in per-day files under `Logs/`, one file per day named `Logs/YYYY-MM-DD.md`, append-only.

## Why per-day files

A single growing `log.md` gets expensive to read as it accumulates. Per-day files let Claude read just today's (or a specific day's) entries instead of the whole history.

## Structure of a per-day file

Frontmatter:
```yaml
---
type: log
date: YYYY-MM-DD
ai-first: true
---
```

Followed by append-only entries, one per line:
```
**HH:MM** - action | description
```

`action` is a short verb tag (`init`, `capture`, `task`, `project`, `sync`, `daily`, etc.) naming what kind of vault operation happened. `description` is a one-line plain-English summary.

## Finding a day's log

- Today's log: `Logs/<today's date, YYYY-MM-DD>.md`
- All logs: browse the `Logs/` folder, or check `[[index]]` for a partial list
- This is the vault-operations log (what Claude did to the vault), distinct from `Dev Logs/` or work journals about the user's own project work
