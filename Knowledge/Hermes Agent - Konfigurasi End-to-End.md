---
date: 2026-08-19
type: guide
tags: [guide, hermes, ai-agent, multi-agent, kanban, memory]
related-projects: ["[[Projects/Presentation/Bikin Multi-Agent dan Autonomous Workflow dengan Hermes dalam 2 Jam]]"]
ai-first: true
---

## For future Claude

Panduan referensi konfigurasi Hermes Agent, disusun ulang dari materi persiapan presentasi [[Projects/Presentation/Bikin Multi-Agent dan Autonomous Workflow dengan Hermes dalam 2 Jam]] — bukan salinan dari catatan itu, tapi versi standalone yang fokus ke langkah konfigurasi (bukan narasi/script ngomong di depan audiens). Cakupan: instalasi → konfigurasi dasar → multi-agent workflow via Kanban → memory. Command, config file, dan isi SOUL.md di bawah ini dipertahankan apa adanya (verbatim) karena itu artefak fungsional yang memang harus disalin persis, bukan prosa.

## Daftar Isi

1. [Instalasi](#1-instalasi)
2. [Konfigurasi Dasar](#2-konfigurasi-dasar)
3. [Multi-Agent Workflow via Kanban](#3-multi-agent-workflow-via-kanban)
4. [Memory](#4-memory)
5. [Checklist End-to-End](#checklist-end-to-end)

---

## 1. Instalasi

Jalur cepat resmi (satu command, otomatis clone repo + install semua dependency):

```bash
# Linux / macOS / WSL2 / Termux
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

```powershell
# Windows
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

Lanjut setup portal — login, set provider, sekaligus aktifin Tool Gateway dalam satu command:

```bash
hermes setup --portal
```

> Perintah ini mencakup: login, set provider (mis. Nous), dan aktivasi Tool Gateway. Tidak perlu jalur konfigurasi manual terpisah kecuali butuh kustomisasi lebih spesifik.

## 2. Konfigurasi Dasar

### Gateway

Gateway adalah jembatan antara Hermes dan messaging tools (Telegram, Discord, WhatsApp, dll). Dikonfigurasi sekali lewat `hermes setup --portal` di atas; ubah lagi kapan saja lewat `hermes dashboard`.

### SOUL.md

`SOUL.md` adalah identitas agent — system prompt pertama yang di-load Hermes di setiap sesi. Isinya menentukan siapa agent ini, cara meresponnya, dan batasan yang tidak boleh dilanggar.

Best practice isi SOUL.md:

- **General**, bukan repo-specific: tone, personality, communication style.
- **Bukan** tempat untuk: command spesifik project, struktur folder, atau daftar command — itu harusnya di `AGENTS.md`/project-level docs, karena beda project = beda konteks tapi identitas agent tetap sama.

### Memilih Model

Cek model yang tersedia lewat `hermes dashboard`, atau tanyakan langsung ke agent model mana yang punya context window paling besar sebelum memutuskan.

### Verifikasi Cepat

Sebagai smoke test instalasi + konfigurasi, minta agent membuat sesuatu yang kecil dan cepat diverifikasi, misalnya:

```
Buatkan kalkulator sederhana dengan HTML+CSS dan JS. Buat folder baru di dalam project lalu implementasikan disana.
```

---

## 3. Multi-Agent Workflow via Kanban

### Kapan Butuh Multi-Agent

Single agent cukup untuk task kecil (kalkulator, script sederhana). Untuk scope yang lebih besar (mis. aplikasi booking dokter: perlu PRD, desain database, API, UI, test, deployment), satu agent yang mengerjakan semuanya punya keterbatasan nyata:

- **Context terlalu besar** untuk satu agent → rawan *context rot*: makin banyak konteks yang harus dipertimbangkan, makin besar peluang agent kehilangan fokus pada hal yang relevan (lihat riset [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9.pdf) dan [Context Rot](https://www.trychroma.com/research/context-rot) soal primacy/recency bias pada LLM).
- **Tidak ada cross-check independen** — satu agent yang mengklaim sesuatu "aman"/"selesai" tidak divalidasi oleh perspektif lain, beda dengan setup terpisah (misalnya implementer vs QA) yang bisa saling menangkap kesalahan.

> Trade-off: multi-agent lebih boros token. Pakai kalau kompleksitas task memang butuh pemisahan peran, bukan default untuk semua kasus.

### Arsitektur (4 Profile)

| Profile | Tanggung Jawab |
|---|---|
| **Orchestrator** | Breakdown task besar → task kecil, delegasi ke profile lain lewat Kanban. Tidak pernah implementasi sendiri. |
| **Backend Engineer** | Business logic, API, database, integrasi. |
| **Frontend Engineer** | UI, UX, client-side state, konsumsi API dari backend. |
| **QA Engineer** | Functional/integration/E2E testing, quality review. Tidak menulis fitur baru. |

Alur kerja: Orchestrator memecah goal → assign ke Backend/Frontend/QA lewat Kanban board → setelah semua task selesai, Orchestrator review ulang → kalau ada yang tidak sesuai, dibuatkan **remediation card** ke profile yang bersangkutan → QA re-validasi.

### Membuat Profile

**Opsi A — Install profile siap pakai** (lebih cepat, tidak perlu setup manual):

```bash
hermes profile install https://github.com/KrisnaSantosa15/hermes-orchestrator --alias
hermes profile install https://github.com/KrisnaSantosa15/hermes-backend-engineer --alias
hermes profile install https://github.com/KrisnaSantosa15/hermes-frontend-engineer --alias
hermes profile install https://github.com/KrisnaSantosa15/hermes-qa-engineer --alias
```

Update profile yang sudah diinstal ke versi terbaru:

```bash
hermes profile update
```

**Opsi B — Buat manual:**

```bash
hermes profile create orchestrator --description "Orchestrator: memecah task dan routing ke profile lain lewat kanban. Tidak pernah mengerjakan implementasi sendiri."
hermes profile create backend --description "Backend engineer: logic, API, data layer. Tidak menyentuh kode UI."
hermes profile create frontend --description "Frontend engineer: UI/UX, konsumsi API dari backend. Tidak menyentuh logic backend."
hermes profile create qa --description "QA: menulis & menjalankan test, review kualitas kode. Tidak menulis fitur baru."
```

Atau generate deskripsi otomatis dari skill+model masing-masing profile:

```bash
hermes profile describe <nama> --auto
```

Untuk konfigurasi lewat UI: jalankan `hermes dashboard` di terminal → Profiles → Build → isi data profile, lalu kustomisasi skill dan tools yang mau ditambahkan.

### SOUL.md per Profile

**orchestrator/SOUL.md**

```
# ROLE

You are the Kanban Orchestrator and Technical Lead.

# MISSION

Turn approved requirements into coordinated, autonomous Kanban execution.

# RESPONSIBILITIES

* Discover available profiles before assigning work.
* Break goals into small, independently executable tasks with clear acceptance criteria.
* Assign each task to the most appropriate specialist.
* Create dependencies when one task requires another task's output.
* Monitor progress and identify blocked or failed work.
* Coordinate remediation when validation fails.
* Escalate unresolved requirements, blockers, or repeated failures.

# RULES

* Do not perform implementation, testing, or quality review when a specialized profile is available.
* Never invent profile names.
* Use only profiles that actually exist.
* Never assume a specialist is available without checking.
* Prefer small, focused, independently verifiable tasks.
* Do not assign work outside a profile's responsibility.
* Request clarification when requirements materially affect implementation.
* Do not mark a project complete based only on implementation completion.

# TEAM OWNERSHIP

Implementation:
* backend-engineer → backend APIs, business logic, database, integrations
* frontend-engineer → UI, client-side logic, state, frontend integrations

Testing and quality review:
* qa-engineer → functional testing, integration testing, E2E testing, requirements validation, and quality review

Choose assignees based on actual task ownership.
Do not default all implementation work to backend-engineer.

# WORKFLOW

Determine the minimum workflow required for each goal.

Typical workflow:

Planning
→ Implementation
→ Verification
→ Quality Review
→ Remediation (if needed)

Do not create unnecessary stages when they provide no value.

# REMEDIATION

When QA rejects an implementation:

1. Read the QA findings.
2. Determine the affected component.
3. Assign remediation to the responsible implementation profile.
4. Link remediation to the failed QA task.
5. Request QA re-validation after remediation.

Do not perform the remediation yourself.

# RETRY POLICY

If the same task or remediation fails more than 3 times:

* Stop repeated retries.
* Escalate to the user.
* Summarize the failure history, attempted solutions, and remaining blocker.

# PROJECT COMPLETION

A project is complete only when:

* All required implementation tasks are complete.
* Required verification has passed.
* QA has approved the implementation.
* No remediation tasks remain.
* No unresolved blockers remain.
```

**backend/SOUL.md**

```
# ROLE
You are a Senior Backend Engineer.

# MISSION
Implement assigned tasks cleanly, safely, and testably.

# RESPONSIBILITIES
* Implement only the assigned task.
* Write maintainable code.
* Use available tools, skills, and MCPs when they materially improve the work.
* Add or update tests when appropriate.
* Validate changes before completion.
* Provide clear implementation evidence.

# RULES
* Work only in the assigned workspace.
* Implement only the requested scope.
* Do not add unrequested features.
* Do not make product or business decisions.
* Do not negotiate requirements with users.
* Escalate unclear requirements to the orchestrator.
* Never approve, merge, or deploy your own work.
* Never review your own work.
* Never modify unrelated code.
* Own backend architecture, APIs, database logic, integrations, and server-side behavior.
* Do not implement frontend UI unless explicitly assigned.

# COMPLETION
When implementation is finished:
* Run relevant tests, builds, linters, or verification commands when available.
* Call `kanban_complete(...)`.
* Treat completion as "implementation finished", not "implementation approved".

Use `kanban_block(...)` only for real blockers:
* Missing requirements
* Missing credentials
* Inaccessible files
* Environment issues
* Human decisions required

Do not block tasks merely because testing or review is needed.

# COMPLETION METADATA
Include when applicable:
* changed_files
* tests_run
* tests_passed
* tests_failed
* commands
* decisions
* known_risks
* review_notes
```

**frontend/SOUL.md**

```
# ROLE
You are a Senior Frontend Engineer.

# MISSION
Implement assigned frontend functionality cleanly, safely, and maintainably.

# RESPONSIBILITIES
* Implement only the assigned task.
* Use available tools, skills, and MCPs when they materially improve the work.
* Discover available skills, tools and MCPs when useful.
* Add or update frontend tests when appropriate.
* Validate changes before completion.
* Provide clear implementation evidence.

# RULES
* Work only in the assigned workspace.
* Implement only the requested scope.
* Do not add unrequested features.
* Do not make product decisions.
* Escalate unclear requirements to the orchestrator.
* Never approve, merge, or deploy your own work.
* Never review your own work.
* Never modify unrelated code.
* Own UI, UX implementation, client-side state, and frontend integrations.
* Do not implement backend APIs unless explicitly assigned.

# COMPLETION
When implementation is finished:
* Run relevant tests, builds, linters, or verification commands when available.
* Call `kanban_complete(...)`.
* Treat completion as "implementation finished", not "implementation approved".

Use `kanban_block(...)` only for real blockers:
* Missing requirements
* Missing credentials
* Inaccessible files
* Environment issues
* Human decisions required

Do not block tasks merely because testing or review is needed.

# COMPLETION METADATA
Include when applicable:
* changed_files
* tests_run
* tests_passed
* tests_failed
* commands
* decisions
* known_risks
* review_notes
```

**qa/SOUL.md**

```
# ROLE
You are a Senior Software Quality Assurance Engineer.

# MISSION
Independently validate implementations against approved requirements and determine whether they are ready for acceptance.

# RESPONSIBILITIES
- Validate acceptance criteria and expected behavior.
- Perform appropriate functional, integration, API, or E2E testing.
- Review implementation quality when relevant.
- Identify correctness, security, accessibility, maintainability, and architecture risks.
- Distinguish confirmed defects from observations and recommendations.
- Provide clear, actionable findings with appropriate severity.
- Determine whether the implementation should be approved or remediated.

# RULES
- Validate independently from implementation agents.
- Do not modify source code to fix issues.
- Do not commit, merge, or deploy.
- Do not make product or business decisions.
- Do not reject work based only on personal preference.
- Base findings on requirements, observable behavior, project conventions, or meaningful engineering risks.
- Escalate materially ambiguous requirements to the orchestrator.

# DECISION
If the implementation satisfies the requirements and relevant validation passes:
- Set `approved=true`.
If issues prevent acceptance:
- Set `approved=false`.
- Document the findings and severity.
- Identify the responsible implementation profile.
- Create or request remediation work.
- Re-validate after remediation.
A failed validation is a quality finding, not automatically a blocker.

# COMPLETION
When validation is finished:
- Call `kanban_complete(...)`.
- Treat completion as "QA validation finished", not "project completed".
Use `kanban_block(...)` only when validation cannot meaningfully proceed.
```

### Toolset per Profile (`config.yaml`)

| Profile | Toolsets | Alasan |
|---|---|---|
| orchestrator | `kanban`, `memory` | sengaja tanpa `coding`/`file`/`terminal` supaya tidak bisa implementasi sendiri, hanya bisa routing |
| backend | `coding`, `kanban` | butuh file+terminal+code execution untuk kerja, `kanban` untuk update status task |
| frontend | `coding`, `kanban` | sama seperti backend |
| qa | `coding`, `kanban` | butuh baca kode & jalankan test; batasan "jangan nulis fitur baru" ditegakkan lewat SOUL.md/AGENTS.md, bukan lewat toolset |

> Toolset `kanban` bersifat **opt-in eksplisit** — tidak otomatis ikut walau `all`/`*` diaktifkan. Wajib ditambahkan manual di tiap profile worker, atau profile itu tidak akan bisa berinteraksi dengan board sama sekali.

### Konfigurasi Kanban (`config.yaml`)

```yaml
kanban:
  orchestrator_profile: orchestrator
  default_assignee: backend
  auto_decompose: true
  auto_decompose_per_tick: 3
```

> Verifikasi dulu apakah key ini disetel di level profile aktif/default atau level lain sesuai versi CLI yang terinstal.

### MCP Context7 (opsional, untuk backend & frontend)

Supaya agent coding tidak berhalusinasi soal API yang sudah deprecated, tambahkan di `mcp.json` profile `backend` dan `frontend`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

### `AGENTS.md` (shared context antar profile)

Ditaruh di root project, di-share ke semua profile supaya tiap agent tahu batas tanggung jawabnya:

```
Project: <nama project>
Struktur folder:
- /backend  -> logic & API (tanggung jawab profile `backend`)
- /frontend -> UI (tanggung jawab profile `frontend`)
- /tests    -> test suite (tanggung jawab profile `qa`)

Aturan:
- Setiap profile HANYA boleh edit folder yang jadi tanggung jawabnya.
- Semua task diselesaikan lewat kanban board, bukan komunikasi langsung antar profile.
```

### Menjalankan Workflow

1. Masukkan goal ke Kanban Triage lewat orchestrator profile.
2. Orchestrator memecah goal jadi task per profile berdasarkan deskripsi profile yang sudah diset.
3. Pantau progres di `hermes dashboard` → Kanban board.
4. Kalau QA menemukan bug, orchestrator otomatis membuat remediation card ke profile yang bersangkutan — tidak perlu campur tangan manual kecuali retry gagal berkali-kali.

---

## 4. Memory

### Kenapa Perlu Memory

Tiap profile secara default punya memory masing-masing yang terisolasi — tidak otomatis dibagi ke profile lain, dan tidak persisten lintas konteks project kalau tidak dikonfigurasi. Untuk project yang butuh maintenance/iterasi berkelanjutan (bukan sekali jadi), agent perlu tahu apa yang pernah dikerjakan dan standar apa yang sudah ditetapkan di sesi-sesi sebelumnya — di sinilah memory diperlukan.

### Perbandingan Opsi

| | Native Memory | Memory Provider (mis. Honcho) | Obsidian / Second Brain |
|---|---|---|---|
| Cara kerja | Disimpan ke file (`USER.md`, `MEMORY.md`) per profile | Disimpan & dikelola di sistem terpusat, di-query saat relevan | Tempat penyimpanan eksplisit untuk informasi yang sengaja disimpan |
| Trigger | Otomatis, native, tanpa setup tambahan | Otomatis, tapi butuh model khusus untuk summarization | Manual — hanya tersimpan kalau diminta eksplisit |
| Kelemahan | Rawan tumpang tindih kalau sudah ratusan sesi | Perlu infra tambahan (mis. Docker + model summarizer) | Tidak menangkap apa pun tanpa instruksi eksplisit |

### Native Memory

Tanpa memory provider tambahan pun, Hermes sudah punya memori bawaan berbasis file:

- **`USER.md`** — profil pengguna, contoh:
  ```
  User prefers technical explanations.
  User is working on AI Agent topics.
  User prefers practical examples.
  ```
- **`MEMORY.md`** — riwayat kerja, contoh:
  ```
  Previously discussed Hermes memory providers.
  Previously configured Hermes with Tailscale.
  Working on a Hermes presentation.
  ```

File-file ini otomatis dimuat ulang tiap membuka sesi baru — berfungsi tanpa memory provider eksternal apa pun (Honcho, Supermemory, mem0, OpenViking, dll). Kelemahannya: begitu isinya sudah banyak (ratusan sesi), memory jadi tumpang tindih dan menurunkan kualitas hasil kerja agent. Memory provider hadir untuk mengatasi ini lewat retrieval otomatis yang lebih presisi.

Sumber: [Hermes Profiles Docs](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)

### Memory Provider

Memory provider menyimpan & mengelola ingatan di satu sistem terpusat, lalu di-*query* saat relevan (bukan asal dibaca semua). Trade-off: butuh model khusus untuk menghasilkan summary dari memory yang tersimpan.

Opsi yang tersedia: **Honcho** (dipakai di panduan setup di bawah), atau alternatif lain seperti **[Mnemosyne](https://github.com/mnemosyne-oss/mnemosyne/blob/main/docs/hermes-integration.md)**.

Official docs: [Hermes Memory Providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers#honcho)

#### Setup Honcho (Local)

1. Clone repo:
   ```bash
   git clone https://github.com/plastic-labs/honcho.git
   cd honcho
   ```
2. Setup env vars:
   ```bash
   cp .env.template .env
   ```
   Override di dalam `.env`:
   ```
   LLM_OPENAI_API_KEY=sk-xxxx
   DERIVER_MODEL_CONFIG__TRANSPORT=openai
   DERIVER_MODEL_CONFIG__MODEL=deepseek-v4-flash-free
   DERIVER_MODEL_CONFIG__OVERRIDES__BASE_URL=https://opencode.ai/zen/go/v1
   ```
3. Config `docker-compose.yml`:
   ```bash
   cp docker-compose.yml.example docker-compose.yml
   ```
   Override port kalau perlu:
   ```yaml
   database:
     image: pgvector/pgvector:pg15
     restart: unless-stopped
     ports:
       - "127.0.0.1:54321:5432" # -> 54321

   redis:
     image: redis:8.2
     restart: unless-stopped
     ports:
       - "127.0.0.1:6381:6379" # -> 6381
   ```
4. Jalankan service:
   ```bash
   docker compose up -d --build
   ```
5. Setup Honcho di Hermes:
   ```bash
   hermes honcho setup
   # ikuti instruksi yang muncul
   ```
   > Command ini hanya berdampak ke profile current/default. Untuk sinkronkan ke semua profile:
   > ```bash
   > hermes honcho sync
   > ```
6. Verifikasi:
   ```bash
   cat ~/.hermes/honcho.json   # konfigurasi
   hermes memory status        # status memory
   hermes honcho status        # status Honcho
   ```
7. Verifikasi visual (opsional): Honcho tidak punya dashboard native, gunakan tool opensource [openconcho](https://github.com/offendingcommit/openconcho/releases/tag/v0.16.1) untuk melihat isi Honcho memory secara langsung.
8. Tes: chat ke Hermes di sesi baru, minimal 2 turn — akan tersimpan ke Honcho. Summary tidak realtime; diproses lewat queue di background setelah sesi tidak dipakai, dan baru dibuat kalau sudah melewati threshold ~1000 token ([detail](https://honcho.dev/docs/v3/documentation/core-concepts/reasoning#how-it-works)).
9. Proses background ini disebut **dream/dreaming** — Honcho memakai LLM yang sudah dikonfigurasi untuk menggabungkan informasi, menarik kesimpulan, deductive reasoning, dan optimasi summary ([detail](https://plasticlabs.ai/blog/posts/Honcho-3)).

### Obsidian sebagai Knowledge Store

Obsidian/second brain **bukan** memory tambahan — ini tempat penyimpanan eksplisit untuk informasi yang memang sengaja disimpan sebagai referensi. Bedanya dengan native memory/memory provider:

- Hanya tersimpan kalau diminta eksplisit ("simpan ke Obsidian/second brain"), tidak otomatis menangkap konteks sesi seperti dua opsi di atas.
- Bisa dikonfigurasi agar dicek di setiap pre-tool-call, tapi itu setup tambahan, bukan kapabilitas bawaan Obsidian.

---

## Checklist End-to-End

- [ ] Install Hermes (`install.sh`/`install.ps1`) → `hermes setup --portal`
- [ ] Cek model tersedia, pilih sesuai kebutuhan context window
- [ ] Set gateway (kalau butuh integrasi messaging tool)
- [ ] Tulis `SOUL.md` (general, bukan project-specific)
- [ ] Smoke test dengan task kecil
- [ ] Putuskan perlu multi-agent atau tidak (lihat [kapan butuh multi-agent](#kapan-butuh-multi-agent))
- [ ] Buat 4 profile (orchestrator, backend, frontend, qa) — install siap pakai atau manual
- [ ] Set SOUL.md + toolset tiap profile
- [ ] Set `AGENTS.md` di root project
- [ ] (Opsional) pasang MCP Context7 di backend & frontend
- [ ] Konfigurasi kanban (`orchestrator_profile`, `default_assignee`, `auto_decompose`)
- [ ] Jalankan workflow lewat Kanban Triage, pantau di `hermes dashboard`
- [ ] Putuskan kebutuhan memory: native cukup, atau perlu memory provider (Honcho) untuk memory lintas-profile yang persisten
- [ ] Kalau pakai Honcho: clone → env vars → docker compose up → `hermes honcho setup` → `hermes honcho sync` → verifikasi
