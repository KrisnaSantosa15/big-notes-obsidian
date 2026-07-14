# Obsidian Second Brain - OpenCode Operating Manual

This vault runs the **obsidian-second-brain** skill. The skill ships a set of
*commands*: each one is a multi-step instruction file that you (the OpenCode
agent) should follow when the user's request matches its trigger phrase.

## How to operate

1. Read `_CLAUDE.md` in the vault root, if it exists, to learn the user's
   vault conventions.
2. When the user's request matches a trigger in the tables below, read the
   matching file under `.opencode/commands/<name>.md` and follow its
   instructions step by step.
3. Treat the AI-first vault rule (`references/ai-first-rules.md`) as
   non-negotiable for every note you write: `## For future Claude` preamble,
   rich frontmatter (`type`, `date`, `tags`, `ai-first: true`), `[[wikilinks]]`
   for every person/project/concept, recency markers per external claim,
   sources verbatim, confidence levels where applicable.

## Command routing tables (grouped by category)

### Vault - daily writing, capture, find

| Command | What it does | Read this file |
|---|---|---|
| `/obsidian-board-hygiene` | Bulk-triage a kanban board - surface stale items and archive, reschedule, or mark them done in one pass | `.opencode/commands/obsidian-board-hygiene.md` |
| `/obsidian-board` | Show or update a kanban board - flags overdue items, updates from conversation | `.opencode/commands/obsidian-board.md` |
| `/obsidian-capture` | Quick idea capture - zero friction, saves to your ideas folder and mentions in daily note | `.opencode/commands/obsidian-capture.md` |
| `/obsidian-catchup` | Review and process everything captured on the go from the Telegram journal bot - voice, text, images, PDFs, links - waiting in the catchup queue. You pull it when you are back at the laptop; nothing is processed autonomously. | `.opencode/commands/obsidian-catchup.md` |
| `/obsidian-daily` | Create or update today's daily note - pulls calendar events, overdue tasks, and conversation context | `.opencode/commands/obsidian-daily.md` |
| `/obsidian-find` | Smart vault search - returns results with context, not just filenames | `.opencode/commands/obsidian-find.md` |
| `/obsidian-log` | Log this work or dev session to the vault - infers project from context | `.opencode/commands/obsidian-log.md` |
| `/obsidian-person` | Create or update a person note from conversation context | `.opencode/commands/obsidian-person.md` |
| `/obsidian-project` | Create or update a project note - adds to board and daily note automatically | `.opencode/commands/obsidian-project.md` |
| `/obsidian-projects` | Live project status from git + local docs - infers all context from vault notes, no config required | `.opencode/commands/obsidian-projects.md` |
| `/obsidian-recap` | Summarize a time period from the vault - today, week, or month | `.opencode/commands/obsidian-recap.md` |
| `/obsidian-recurring` | Track a recurring obligation (payment, filing, ops) with a cadence and a computed next-due date | `.opencode/commands/obsidian-recurring.md` |
| `/obsidian-save` | Save everything worth keeping from this conversation to the vault | `.opencode/commands/obsidian-save.md` |
| `/obsidian-task` | Add a task to the right kanban board with inferred priority and due date | `.opencode/commands/obsidian-task.md` |
| `/obsidian-world` | Load your identity, values, priorities, and current state in one shot - with progressive context levels to avoid burning tokens | `.opencode/commands/obsidian-world.md` |

### Thinking - synthesis, decisions, learning, reviews

| Command | What it does | Read this file |
|---|---|---|
| `/idea-discovery` | Surface 3-5 next-direction candidates by reading ungraduated ideas, open project questions, and orphan research notes - what is worth working on next | `.opencode/commands/idea-discovery.md` |
| `/obsidian-challenge` | Red-team your current idea against your own vault history - finds contradictions, past failures, and flawed assumptions | `.opencode/commands/obsidian-challenge.md` |
| `/obsidian-connect` | Bridge two unrelated domains using your vault's link graph - forces creative friction to spark new ideas | `.opencode/commands/obsidian-connect.md` |
| `/obsidian-decide` | Record decisions - lightweight by default (logged to project notes), or a full ADR record with --formal | `.opencode/commands/obsidian-decide.md` |
| `/obsidian-distill` | Condense a long note or source into key claims, each tagged with provenance back to the exact source block it came from | `.opencode/commands/obsidian-distill.md` |
| `/obsidian-emerge` | Surface unnamed patterns from your recent notes - recurring themes, hidden connections, and conclusions you haven't explicitly stated | `.opencode/commands/obsidian-emerge.md` |
| `/obsidian-graduate` | Promote an idea fragment into a full project spec with tasks, board entries, and structure | `.opencode/commands/obsidian-graduate.md` |
| `/obsidian-learn` | Review vault learnings, prune stale ones, surface active patterns - the vault's lessons compound or expire | `.opencode/commands/obsidian-learn.md` |
| `/obsidian-panel` | Convene a panel of distinct perspectives on a decision - one independent verdict per lens, then a synthesis. A multi-persona complement to /obsidian-challenge | `.opencode/commands/obsidian-panel.md` |
| `/obsidian-reconcile` | Find and resolve contradictions in the vault - the vault maintains its own truth | `.opencode/commands/obsidian-reconcile.md` |
| `/obsidian-review` | Generate a structured weekly or monthly review note from vault history | `.opencode/commands/obsidian-review.md` |
| `/obsidian-synthesize` | Automatic synthesis - scans the vault for unnamed patterns and writes synthesis pages without being asked | `.opencode/commands/obsidian-synthesize.md` |
| `/vault-deep-synthesis` | Deep cross-reference of everything the vault knows about one topic - agreements, contradictions, stale claims, and coverage gaps. Pure vault, no network | `.opencode/commands/vault-deep-synthesis.md` |

### Research - bring external sources into the vault

| Command | What it does | Read this file |
|---|---|---|
| `/notebooklm` | Vault-first source-grounded research via Gemini File Search. One command, no browser. The grounded parallel to /research-deep (which is open-web via Perplexity). | `.opencode/commands/notebooklm.md` |
| `/obsidian-ingest` | Ingest a source into the vault - the vault rewrites itself around new knowledge. Every ingest updates entities, rewrites stale claims, synthesizes new concepts, and resolves contradictions. | `.opencode/commands/obsidian-ingest.md` |
| `/podcast` | Extract metadata, transcript, and summary from a podcast episode, saved as an AI-first note in the vault | `.opencode/commands/podcast.md` |
| `/research-deep` | Vault-first deep research - scans the vault, fills gaps (Perplexity + Grok when keyed, free key-less sources otherwise), synthesizes a delta, then propagates updates across people/projects/ideas via /obsidian-save | `.opencode/commands/research-deep.md` |
| `/research` | Web research with citations - Perplexity Sonar when an API key is set, free key-less sources (Wikipedia, HackerNews, arXiv, Reddit, and more) otherwise. Deep dossier with summary, facts, timeline, players, contrarian views, open questions | `.opencode/commands/research.md` |
| `/x-pulse` | Scan X for what's trending in a topic - themes, voices, hooks, and post ideas powered by Grok + Live Search | `.opencode/commands/x-pulse.md` |
| `/x-read` | Deep-read an X (Twitter) post via Grok + Live Search - verbatim post, thread, TL;DR, claims, reply sentiment, voices to watch | `.opencode/commands/x-read.md` |
| `/youtube` | Extract transcript, metadata, and top comments from a YouTube video - summarized via Grok and saved to vault. Add --visual to also read the video's frames (scene detection) | `.opencode/commands/youtube.md` |

### Meta - vault setup, health, structure

| Command | What it does | Read this file |
|---|---|---|
| `/create-command` | Create a new obsidian-second-brain command via interview - zero markdown editing required | `.opencode/commands/create-command.md` |
| `/obsidian-architect` | Scan a codebase and write a maintained set of architecture notes into the vault - overview, per-module notes, key decisions. Re-run to refresh without clobbering your edits | `.opencode/commands/obsidian-architect.md` |
| `/obsidian-export` | Export a clean structured snapshot of the vault that any agent or tool can consume - flat JSON, markdown index, or an OKF (Open Knowledge Format) bundle | `.opencode/commands/obsidian-export.md` |
| `/obsidian-health` | Run a vault health check - grouped by severity, detects contradictions, concept gaps, stale claims, and structural issues | `.opencode/commands/obsidian-health.md` |
| `/obsidian-init` | Scan your vault and generate a _CLAUDE.md operating manual, index.md catalog, and log.md pointer | `.opencode/commands/obsidian-init.md` |
| `/obsidian-retrieval-eval` | Measure how well vault search finds the right note for a natural-language question - recall@k and MRR, with the concrete failures | `.opencode/commands/obsidian-retrieval-eval.md` |
| `/obsidian-visualize` | Generate a visual canvas map of your vault - see the shape of your second brain and how knowledge connects | `.opencode/commands/obsidian-visualize.md` |

## Trigger phrases

When the user says any of the phrases below (or a close paraphrase), follow the matching command file.

### English (`en`)


**Vault - daily writing, capture, find**

- `/obsidian-board-hygiene` - "clean up my board", "triage my board", "board hygiene", "archive stale tasks", "my board is a mess"
- `/obsidian-board` - "show board", "kanban", "what is on my board", "update board"
- `/obsidian-capture` - "capture this idea", "save this idea", "quick note", "drop a thought"
- `/obsidian-catchup` - "catch up", "catchup", "what did I dump from telegram", "process my captures", "go through my telegram dumps", "anything new from the phone", "process my catchup", "review what I captured", "what did I capture on the go"
- `/obsidian-daily` - "todays note", "create todays daily", "open daily", "today daily note"
- `/obsidian-find` - "find in vault", "search my notes", "where is", "what did I write about"
- `/obsidian-log` - "log this work", "log this session", "log this dev session", "obsidian log"
- `/obsidian-person` - "save this person", "add person", "new contact note", "create person note"
- `/obsidian-project` - "new project", "create project note", "project setup", "start a project"
- `/obsidian-projects` - "projects overview", "project status", "what am I working on", "show projects"
- `/obsidian-recap` - "recap today", "recap the week", "summarize the week", "month recap"
- `/obsidian-recurring` - "recurring task", "monthly obligation", "remind me every month", "recurring payment", "track a recurring"
- `/obsidian-save` - "save this", "save the conversation", "save to vault", "obsidian save"
- `/obsidian-task` - "add task", "new todo", "track this", "remind me"
- `/obsidian-world` - "load context", "what is going on", "where am I", "load my world"

**Thinking - synthesis, decisions, learning, reviews**

- `/idea-discovery` - "what should I work on next", "idea discovery", "surface next directions", "what's worth pursuing"
- `/obsidian-challenge` - "challenge this", "grill me on this", "red team my idea", "stress test this"
- `/obsidian-connect` - "connect domains", "cross-pollinate", "bridge ideas", "find an unexpected link"
- `/obsidian-decide` - "extract decisions", "log decisions", "what did we decide", "log this decision", "ADR", "record decision", "decision record"
- `/obsidian-distill` - "distill this", "condense this note", "summarize with sources", "distill this source", "boil this down with provenance"
- `/obsidian-emerge` - "find patterns", "what is emerging", "surface themes", "unnamed patterns"
- `/obsidian-graduate` - "promote idea", "graduate this to project", "make a project from this", "elevate idea"
- `/obsidian-learn` - "review learnings", "what have I learned", "show lessons", "prune learnings"
- `/obsidian-panel` - "convene a panel", "advisor panel", "get multiple perspectives on", "panel review", "what would the experts say about"
- `/obsidian-reconcile` - "find contradictions", "reconcile vault", "fix conflicts", "vault contradictions"
- `/obsidian-review` - "weekly review", "monthly review", "review my week", "review my month"
- `/obsidian-synthesize` - "synthesize", "auto-synthesis", "make synthesis notes", "find unnamed patterns"
- `/vault-deep-synthesis` - "synthesize what I know about", "deep synthesis on", "cross-reference my notes on", "what does my vault say about"

**Research - bring external sources into the vault**

- `/notebooklm` - "notebooklm", "research grounded", "ground research in vault", "ask my notebook", "source-grounded research"
- `/obsidian-ingest` - "ingest this source", "add this article", "import this", "absorb this"
- `/podcast` - "summarize this podcast", "podcast episode summary", "extract podcast", "what's in this episode"
- `/research-deep` - "deep research", "thorough research", "vault-first research", "research gaps"
- `/research` - "research this", "look up", "find information about", "perplexity research"
- `/x-pulse` - "x pulse", "what is trending on twitter", "scan x for", "twitter pulse"
- `/x-read` - "read this x post", "deep read this tweet", "analyze this tweet", "read this thread"
- `/youtube` - "summarize youtube", "youtube transcript", "extract video", "youtube to vault", "watch this video", "what's on screen in this video"

**Meta - vault setup, health, structure**

- `/create-command` - "create command", "new command", "add a command", "scaffold a command"
- `/obsidian-architect` - "document this codebase", "architect this project", "map this code into my vault", "generate architecture notes", "refresh architecture docs"
- `/obsidian-export` - "export vault", "snapshot vault", "dump vault", "vault export"
- `/obsidian-health` - "vault health", "check vault", "audit vault", "vault diagnostics"
- `/obsidian-init` - "init vault", "bootstrap vault", "setup vault", "scan vault"
- `/obsidian-retrieval-eval` - "evaluate retrieval", "how good is my vault search", "retrieval eval", "test vault search quality", "measure find quality"
- `/obsidian-visualize` - "visualize vault", "vault map", "canvas of vault", "show me the vault shape"

### Español (`es`)


**Vault - daily writing, capture, find**

- `/obsidian-board-hygiene` - "limpia mi tablero", "haz triaje de mi tablero", "ordena el tablero", "archiva las tareas viejas", "mi tablero es un desastre"
- `/obsidian-board` - "muestra el tablero", "kanban", "qué hay en mi tablero", "actualiza el tablero"
- `/obsidian-capture` - "captura esta idea", "guarda esta idea", "nota rápida", "apunta esto"
- `/obsidian-catchup` - "ponme al día", "qué mandé por telegram", "procesa mis capturas", "revisa lo que capturé desde el móvil", "hay algo nuevo del móvil", "repasa mi cola de capturas"
- `/obsidian-daily` - "nota de hoy", "crea la diaria de hoy", "abre mi diaria", "la nota diaria de hoy"
- `/obsidian-find` - "busca en el vault", "busca en mis notas", "dónde está", "qué escribí sobre"
- `/obsidian-log` - "registra este trabajo", "registra esta sesión", "registra esta sesión de desarrollo", "obsidian log"
- `/obsidian-person` - "guarda a esta persona", "añade una persona", "nueva nota de contacto", "crea una nota de persona"
- `/obsidian-project` - "nuevo proyecto", "crea una nota de proyecto", "configura el proyecto", "arranca un proyecto"
- `/obsidian-projects` - "resumen de proyectos", "estado de los proyectos", "en qué estoy trabajando", "muéstrame los proyectos"
- `/obsidian-recap` - "resumen de hoy", "resumen de la semana", "resume la semana", "resumen del mes"
- `/obsidian-recurring` - "tarea recurrente", "obligación mensual", "recuérdamelo cada mes", "pago recurrente", "haz seguimiento de algo recurrente"
- `/obsidian-save` - "guarda esto", "guarda la conversación", "guarda al vault"
- `/obsidian-task` - "añade una tarea", "nuevo pendiente", "haz seguimiento de esto", "recuérdamelo"
- `/obsidian-world` - "carga el contexto", "qué está pasando", "dónde estoy", "carga mi mundo"

**Thinking - synthesis, decisions, learning, reviews**

- `/idea-discovery` - "¿en qué debería trabajar ahora?", "descubre ideas para seguir", "qué rumbos tomar", "qué vale la pena perseguir"
- `/obsidian-challenge` - "cuestiona esta idea", "ponme a prueba con esto", "haz de abogado del diablo con mi idea", "pon esto a prueba"
- `/obsidian-connect` - "conecta estos dos temas", "cruza ideas de distintos mundos", "tiende un puente entre ideas", "busca una conexión inesperada"
- `/obsidian-decide` - "saca las decisiones de esta conversación", "registra las decisiones", "¿qué decidimos?", "anota esta decisión", "ADR", "acta de decisión formal"
- `/obsidian-distill` - "destila esto", "condensa esta nota", "resúmelo con fuentes", "destila esta fuente", "resume esto sin perder la trazabilidad"
- `/obsidian-emerge` - "busca patrones", "qué está emergiendo", "saca a la luz los temas recurrentes", "patrones que no he nombrado"
- `/obsidian-graduate` - "promociona esta idea", "convierte esto en proyecto", "haz un proyecto de esto", "eleva esta idea"
- `/obsidian-learn` - "revisa los aprendizajes", "qué he aprendido", "muéstrame las lecciones", "poda los aprendizajes"
- `/obsidian-panel` - "convoca un panel", "panel de asesores", "dame varias perspectivas sobre esto", "revisión en panel", "qué dirían los expertos sobre esto"
- `/obsidian-reconcile` - "busca contradicciones", "concilia el vault", "resuelve los conflictos", "contradicciones en el vault"
- `/obsidian-review` - "revisión semanal", "revisión mensual", "revisa mi semana", "revisa mi mes"
- `/obsidian-synthesize` - "sintetiza", "síntesis automática", "crea notas de síntesis", "busca patrones sin nombrar"
- `/vault-deep-synthesis` - "sintetiza lo que sé sobre", "síntesis profunda sobre", "cruza mis notas sobre", "qué dice mi vault sobre"

**Research - bring external sources into the vault**

- `/notebooklm` - "notebooklm", "investigación fundamentada en mis notas", "basa esto en mi vault", "pregúntale a mis notas", "investigación con fuentes propias"
- `/obsidian-ingest` - "haz una ingesta de esta fuente", "añade este artículo", "importa esto", "absorbe esto"
- `/podcast` - "resume este pódcast", "resumen del episodio", "extrae este pódcast", "qué dice este episodio"
- `/research-deep` - "investigación profunda", "investiga a fondo", "investigación basada en mi vault", "rellena los huecos de información"
- `/research` - "investiga esto", "búscalo", "busca información sobre", "investigación con perplexity"
- `/x-pulse` - "x pulse", "qué es tendencia en twitter", "escanea x en busca de", "pulso de twitter"
- `/x-read` - "léeme este post de x", "profundiza en este tweet", "analiza este tweet", "léeme este hilo"
- `/youtube` - "resume este vídeo de youtube", "transcripción de youtube", "extrae este vídeo", "youtube al vault", "mira este vídeo", "qué se ve en este vídeo"

**Meta - vault setup, health, structure**

- `/create-command` - "crea un comando", "nuevo comando", "añade un comando", "monta un comando"
- `/obsidian-architect` - "documenta este código", "analiza la arquitectura de este proyecto", "lleva este código a mi vault", "genera notas de arquitectura", "actualiza la documentación de arquitectura"
- `/obsidian-export` - "exporta el vault", "haz una foto del vault", "vuelca el vault", "exportación del vault"
- `/obsidian-health` - "salud del vault", "revisa el vault", "audita el vault", "diagnóstico del vault"
- `/obsidian-init` - "inicializa el vault", "arranca el vault", "configura el vault", "escanea el vault"
- `/obsidian-retrieval-eval` - "evalúa la búsqueda", "qué tal funciona la búsqueda de mi vault", "evaluación de recuperación", "prueba la calidad de la búsqueda", "comprueba si encuentra bien mis notas"
- `/obsidian-visualize` - "visualiza el vault", "mapa del vault", "canvas del vault", "muéstrame la forma de mi vault"

---

*Generated by adapters/opencode/adapter.sh - do not edit manually.*
