# Claude Operating Manual - Krisna's Vault

> Read this file before doing anything in this vault.
> This is the single source of truth for how Claude operates here.

---

## Section 0 - AI-First Vault Rule (read first, applies to every note)

This vault is designed for **future-Claude** to read and reason over, not for human review. The owner rarely reads notes directly - they call Claude to retrieve, synthesize, and connect dots across accumulated knowledge.

**Every note Claude writes to this vault must follow these rules:**

1. **Self-contained context** - Each note must explain itself. Future-Claude may pull this single note via search with no surrounding context. Don't rely on backlinks alone for meaning.
2. **"For future Claude" preamble** - Every note begins with a 2-3 sentence summary in plain English so Claude can decide relevance in 10 seconds before parsing the structured data.
3. **Rich, consistent frontmatter** - Filterable metadata (`type`, `date`, `topic`, `tags`, `related-people`, `related-projects`, `sources`, `confidence`). Different note types may have different schemas, but every note has machine-readable frontmatter.
4. **Recency markers per claim** - When stating external facts, attach the date: "Mem0 raised $24M (as of 2026-04)" so future-Claude knows what to verify before trusting.
5. **Sources preserved verbatim** - Every external claim has its source URL inline so it can be re-verified or refreshed.
6. **Cross-links are mandatory** - Every person, project, idea, decision, or concept referenced uses `[[wikilinks]]` so the graph is traversable.
7. **Confidence levels** - Where applicable, mark claims as `stated | high | medium | speculation` so future-Claude knows what to trust vs verify.

Full spec: `references/ai-first-rules.md` (bundled with the obsidian-second-brain skill). This rule applies to all `/obsidian-*` and `/research*` commands, all scheduled agents, and any direct vault writes.

---

## Section 0.5 - Verify Live State Before Acting

Before declaring a bug, drafting a fix, or writing architecture: read the actual code, schema, deployed branch, env, or live data. Speculation from stale context burns hours and produces drafts that contradict reality.

Specific cues:
- Read the schema or types before declaring a bug (real field names live in the code, not in memory)
- `git fetch origin` and read the deployed branch, not local `main`
- Grep the live file before any anchor-based patch
- Fetch live time, dates, and rates (never infer from training data)
- Verify env vars in the running process before blaming code
- Mock tests miss schema drift: read one real payload before declaring "done"

---

## Vault Identity

- **Owner:** Krisna
- **Primary purpose:** Software-engineering practice vault - PR review retrospectives and research notes, centered on work at Dicoding (`dicoding-dev/dicoding` repo). TBD whether this grows into a broader Life-OS vault; currently narrow in scope.
- **Last updated:** 2026-07-14

---

## Folder Map

This vault is **Obsidian-style** (no `wiki/` folder at root). Only two folders exist today; the rest are standard defaults per `references/folder-map.md` - Claude creates them on first use, don't pre-scaffold empty ones.

| Folder | Purpose | Status |
|---|---|---|
| `PR Retrospective/` | Personal PR-feedback retrospective, maintained by the separate `pr-retrospective` skill (not `/obsidian-*`). See `PR Retrospective/00 Index.md`. Never edited by `/obsidian-*` commands - only that skill's SYNC mode touches it. | Exists |
| `Research/` | Research command outputs (`/research`, `/research-deep`, `/x-read`, `/x-pulse`, `/youtube`, `/podcast`, NotebookLM) | Exists, empty |
| `Logs/` | Vault operations log, one file per day (`YYYY-MM-DD.md`) | Exists (created this init) |
| `Bases/` | Obsidian Base views (Projects, People, Tasks, Daily) | Exists (created this init) |
| `Daily/` | One note per day, `YYYY-MM-DD.md` | Exists (`Daily/2026-07-15.md`) |
| `Projects/` | Active and archived projects | Exists (`Projects/Dicoding Platform.md`) |
| `People/` | One note per person | Exists (`People/Krisna.md`) |
| `Tasks/` | Standalone task notes | Not yet created |
| `Ideas/` | Captured ideas (`/obsidian-capture`) | Not yet created |
| `Knowledge/` | Reference material, ADRs | Not yet created |
| `Boards/` | Kanban boards | Not yet created |
| `Templates/` | Note templates | Not yet created |

`.opencode/` at the vault root is the OpenCode build of the obsidian-second-brain skill itself (commands, scripts, references) - not vault content. `AGENTS.md` is its OpenCode-side operating manual, mirroring this file for OpenCode sessions.

---

## Key Files

- **Vault catalog:** `[[index]]` - full list of notes by folder, read this first when navigating
- **Vault log:** `[[log]]` - pointer to `Logs/YYYY-MM-DD.md`, the per-day operations log
- **PR Retrospective index:** `[[PR Retrospective/00 Index]]` - severity-tiered engineering-mistake themes from GitHub PR review comments
- **Cross-repo habits:** `[[PR Retrospective/_shared/Personal Engineering Habits]]` - patterns general enough to watch for in any repo
- **Dashboard:** none yet (no `Home.md`) - `index.md` serves as the navigation entry point until one is requested

---

## Active Context

> Update this section at the start of each major project or focus period.

**Current top priority:** TBD - not yet stated in conversation or vault
**Current job:** Dicoding (inferred from vault name `dicoding-vault`, email domain, and `dicoding-dev/dicoding` repo tracked in PR Retrospective) - role TBD
**Manager:** TBD
**Key colleagues:** see People to Know below - names sourced from PR Retrospective reviewer data, not yet confirmed as full person notes

---

## Auto-Save Rules

Claude should auto-save the following **without asking**:
- Decisions made in conversation -> relevant project note + daily note
- New people mentioned -> `People/` (create stub if needed)
- Tasks assigned or committed to -> kanban board + `Tasks/` note
- Dev work done -> `Logs/` + project note + daily note
- Completed tasks -> move on kanban to Done

Claude should **ask before saving**:
- Anything touching finances or personal financial data
- Anything private/sensitive the user hasn't explicitly asked to log
- Anything that involves deleting or archiving an existing note
- Anything that would write into `PR Retrospective/` outside the `pr-retrospective` skill's own SYNC mode

---

## Naming Conventions

- Daily notes: `YYYY-MM-DD.md`
- Dev/work logs: `Logs/YYYY-MM-DD.md` (per-day, append-only, see `log.md`)
- Tasks: Descriptive title, no date prefix
- People: Full name (e.g. `Jane Smith.md`, not `Jane.md`)
- PR Retrospective per-repo folders: `{owner}-{repo}/` (e.g. `dicoding-dev-dicoding/`)

---

## Frontmatter Requirements

Every note must have at minimum:
```yaml
---
date: YYYY-MM-DD
type: <note-type>
tags: [<note-type>, ...]
ai-first: true
---
```

Full type schemas (project, person, idea, task, decision, devlog, review, research, adr, etc.) are documented in `references/ai-first-rules.md`. `PR Retrospective/` notes are the one documented exception - they predate this vault's `/obsidian-*` init and use their own schema (`tags: [pr-retro, ...]`), maintained solely by the `pr-retrospective` skill.

---

## Kanban Convention

No boards exist yet. When one is created, use the standard convention:

Columns: `Backlog` - `This Week` - `In Progress` - `Waiting On` - `Done`

Priority: red = critical, yellow = important, green = low

Item format:
```
- [ ] **Title** - @{YYYY-MM-DD}
	Description. [[Related Project]] [[Person]]
```

---

## People to Know

> Sourced from `PR Retrospective/dicoding-dev-dicoding/PR Log.md` reviewer frequency data (as of 2026-07-02 sync). Not yet full `People/` notes - stubs would need creating on first real mention.

| Person | Role | Notes |
|---|---|---|
| agissept | PR reviewer, dicoding-dev/dicoding | 58 review comments - heaviest reviewer, drove #5224 query-efficiency feedback and #5268 postmortem |
| AlexzPurewoko | PR reviewer, dicoding-dev/dicoding | 25 review comments |
| hasbi-ashshidiq23 | PR reviewer, dicoding-dev/dicoding | 11 review comments |
| mochammadkevin | PR reviewer, dicoding-dev/dicoding | 9 review comments |
| dimasmds | PR reviewer, dicoding-dev/dicoding | 4 review comments |

---

## Projects Currently Active

> - [[Projects/Dicoding Platform]] (status: active, created 2026-07-15) - the `dicoding-dev/dicoding` codebase studied as a DDD/TDD/Clean Code reference; holds the canonical `EmailDraftCreation` example.

---

## Do Not Touch

- `PR Retrospective/` - Owned by the separate `pr-retrospective` skill; only its SYNC mode writes here, `/obsidian-*` commands should read but never edit it directly
- `.opencode/` - The OpenCode build of the skill itself, not vault content
- `Templates/` - Never modify templates during normal vault operations (once created)

---

*This file was generated by the obsidian-second-brain skill on 2026-07-14.*
*Regenerate with: "Claude, update my `_CLAUDE.md`."*
