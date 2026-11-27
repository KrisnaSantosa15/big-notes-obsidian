# Obsidian Second Brain - Agent Operating Manual

This workspace is an Obsidian vault managed with **obsidian-second-brain** in an agent-agnostic layout (`.agents/skills/` for Agent Skills harnesses such as Google Antigravity, Codex CLI, OpenCode, and GitHub Copilot CLI; alongside native Claude Code plugin support via `_CLAUDE.md`).

## How to operate

1. Resolve the vault root: `$OBSIDIAN_VAULT_PATH` if set, else this workspace root (`/home/dicoding/big-notes/dicoding-vault`).
2. Read `_CLAUDE.md` at the vault root first, if present, for vault conventions, folder map, and auto-save rules.
3. Prefer the installed `.agents/skills/` skills for vault actions (`obsidian-save`, `obsidian-find`, `obsidian-daily`, `obsidian-ingest`, `obsidian-capture`, `obsidian-log`, `obsidian-decide`, `research`, `obsidian-health`, etc.).
4. Treat the AI-first vault rule as non-negotiable for every note you write:
   `## For future agent` (or `## For future Claude`) preamble, rich frontmatter (`type`, `date`, `tags`, `ai-first: true`), `[[wikilinks]]` for every person/project/concept, recency markers per external claim, sources verbatim, and confidence levels where applicable. The full spec is `.agents/skills/obsidian-core/references/ai-first-rules.md` (relative to the vault root). If it does not resolve from your working directory, search upward for it. If you still cannot read it, say so before writing - the seven requirements above still apply, and a note written while the spec was unreachable must never look the same as one written with it in hand.
