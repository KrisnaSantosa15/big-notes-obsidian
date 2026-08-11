# Bikin Multi-Agent dan Autonomous Workflow dengan Hermes dalam 2 Jam

> awal-awal kita konfigurasi seperti sesi sebelumnya tapi tidak menyentuh teori apa itu agent bedanya dengan chatbot, beda openclaw & hermes tapi langsung ke instalasi secara cepat, aku akan bilang cek video sebelumnya agar lebih detial. setelah itu aku mulai coba hasil konfigurasi itu secar singkat, mungkin minta calculator sederhana, kemudian buka studi kasus yang membutuhkan beberapa agent seperti Backend, Frontend, Orchestrator, Tester dan Reviewer, kemudian coba hal yang sederhana menggunakan multi agent tersebut.

## Outline

1. Quick Setup & Warm Up
2. Dari Single Agent ke Multi-Agent
3. Membangun Autonomous Workflow dengan Kanban Board
4. Giving Your Agent a Memory

## 1. Quick Setup & Warm Up

- Membahas Instalasi
- Konfigurasi sederhana
- Coba task membuat kalkulator sederhana

## 2. Dari Single Agent ke Multi-Agent

- raise issue/kenapa single agent tidak cukup? dan membutuhkan multi agent?
- Jawaban: Karena membutuhkan peran berbeda agar terhindar dari bias, kita sebagai manusia aja selalu ada bias
- Jelaskan Keuntungan multi agent: terhindar dari bias, kekurangan: boros token, apalgi untuk task sederhana seperti membuat kalkulator

## 3. Membangun Autonomous Workflow dengan Kanban Board

- Membuat profile: orchestrator, backend engineer, frontend engineer, reviewer, tester
- Konfigurasi setiap profile (model, description, SOUL.md, available tools[context 7])
- Coba membuat kalkulator sederhana tapi dengan multi agent workflow
- Lihat kanban board

## 4. Giving Your Agent a Memory

- Kenapa AI butuh memory?

	Sekarang kita sudah punya multi agent gateway tapi ada satu masalah, agent-agent tadi tidak tahu menahu kita itu sedang bekerja dengan project apa. yang mereka tau adalah mengerjakan tugas yang di assign oleh orchestrator tanpa tau konteks lebih jauhnya.
	Ini tidak jadi masalah jika projectnya satu kali jadi, gimana kalo project tersebut membutuhkan update/maintenance/inovasi secara terus menerus, tentunya agent-agent tadi harus tau apa yang pernah dia lakukan, fitur apa yang pernah di develop. Nah disinilah memory diperlukan.

	Apakah memory bawaan tidak cukup? ohh tentu cukup tapi memory tersebut hanya diketahui oleh masing-masing agent bukan satu memory bisa dikonsumsi semua agents. Bahkan di dokumentasi resmi hermes agent bilang bahwa profile itu memiliki memory masing-masing, jika butuh satu memory yang terpusat membutuhkan external memory:
	![[hermes-multiagent-memory.png]]
	Source: https://hermes-agent.nousresearch.com/docs/user-guide/profiles

	Mari kita telisik lebih dalam maksud dari memory di hermes itu seperti apa?
- Apa bedanya dengan native dan dengan provider memory lain? Tambahkan Miskonsepsi Obsidian

### Native Memory

Ingatan Hermes tentang kita yang disimpan dalam sebuah file, biasanya terbatas

- Tanpa memory provider pun Hermes udah punya memori bawaan yang cukup bagus, misalkan aku bilang, nama saya krisna, saya suka Machine Learning. Maka Hermes akan menyimpan memori tersebut kedalam file USER.md seperti: User's name is Krisna and currently into Machine Learning atau MEMORY.md: User's active projects are in /workspace/projects. Berdasarkan dokumentasi resmi nous research ada USER.md dan MEMORY.md bedanya adalah:

###### USER.md
- User prefers technical explanations.
- User is working on AI Agent topics.
- User prefers practical examples.

###### MEMORY.md
- Previously discussed Hermes memory providers.
- Previously configured Hermes with Tailscale.
- Working on a Hermes presentation.

- Ketika membuka session baru, maka hermes akan mengambil memory tersebut, dan itu works tanpa adanya memory provider lain seperti Honcho, Supermemory, mem0, Openviking.
- Tapi memang akan terasa ketika USER.md dan MEMORY.md ini isinya sudah banyak, misalkan sudah berinteraksi dengan hermes sebanyak 600 sessions, ingatan hermes jadi banyak, dia kebingungan karena ada memory yang saling tumpang tindih. Akhirnya hasil dari pekerjaan hermes jelek.
- Nah disinilah peran dari Memory Provider hadir, dia memberikan solusi untuk mencari/retrieve memory secara otomatis dari banyaknya sesi percakapan tadi.

### Memory Provider

Ingatan Hermes tentang kita yang disimpan dan dikelola dalam satu sistem, lebih

- Disini hermes bisa melakukan query ke memory provider untuk mencari ingatan yang ada, misalkan kita pernah bilang bahwa "Saya lebih suka bahasa pemrograman python daripada PHP", 6 bulan kemudian kita bilang "saya ingin membuat software X" maka si hermes akan retrieve memory tadi dan menghasilkan Relevant Memory: User prefers Python than PHP
- Jadi dengan adanya memory provider ini, hermes bisa mencari memory yang relevan jauh lebih baik dibandingkan native memory dia yang biasanya acak-acakan.
- Tapi menggunakan memory provider ini ada kekurangannya yaitu kita harus menyediakan satu model yang khusus untuk mendapatkan summary dari memory yang disimpan hermes. 
Official Docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers#honcho

Sources:
>   *I'm using Mnemosyne for persistant agent memory. It's been working pretty seamlessly now for a few weeks.*
> https://www.reddit.com/r/hermesagent/comments/1v5cxo8/which_hermes_memory_do_you_recommend/

> *I have a self hosted Honcho instance as an external memory tool, it drains a ton of tokens but it is definitely worth it.*
> https://www.reddit.com/r/hermesagent/comments/1tpck95/can_someone_explain_to_me_the_actual_benefits_of/

Official Mnemosyne:
https://github.com/mnemosyne-oss/mnemosyne/blob/main/docs/hermes-integration.md
### Obsidian

Apa knowledge atau informasi yang disimpan secara sengaja untuk dijadikan sebagai sumber agent

- Nah ada juga obsidian yang digunakan sebagai second brain, ini juga biasanya digunakan oleh banyak orang sebagai knowledge. Jadi bukan memory native atau tambahan tapi lebih ke tempat penyimpanan segala hal yang ingin kita simpan.
- Misalkan kita sedang mengerjakan project x, kemudian menyuruh hermes menyimpan ini ke obsidian, maka dia akan menyimpan dan menjadikan sebagai informasi tambahan.
- Kita juga harus secara ekspllisit bilang simpan ke obsidian atau second brain atau hal yang relate kesana baru hermes akan simpan ini, beda dengan memory native atau memory tambahan tadi. Meskipun sebetulnya bisa saja kita konfigurasi setiap pre-tool-call maka cek obsidian, tapi bukan secara alami dari kapabilitas obsidian.

- handons pake honcho


Honcho Local Setup
1. Clone the repository
```
git clone https://github.com/plastic-labs/honcho.git
cd honcho
```
2. Setup Env Vars
```
cp .env.template .env

# OPEN THE .env THEN OVERRIDES:
LLM_OPENAI_API_KEY=sk-xxxx #opencode API KEY
DERIVER_MODEL_CONFIG__TRANSPORT=openai
DERIVER_MODEL_CONFIG__MODEL=deepseek-v4-flash-free
DERIVER_MODEL_CONFIG__OVERRIDES__BASE_URL=https://opencode.ai/zen/go/v1

```
3. Config docker-composer.yml
```
cp docker-compose.yml.example docker-compose.yml

# OPEN THE docker-compose.yml THEN OVERRIDES PORTS
database:
	image: pgvector/pgvector:pg15
	restart: unless-stopped
	ports:
		- "127.0.0.1:54321:5432" #-> 54321
		  
redis:
	image: redis:8.2
	restart: unless-stopped
	ports:
		- "127.0.0.1:6381:6379" #-> 6381
```
4. Run the service
```
docker compose up -d --build
```
5. Setup Honcho on Hermes
```
hermes honcho setup

# Then follow the instructions
```

![[honcho-setup.png]]

> Konfigurasi tersebut hanya berdampak kepada current/default profile. Jika ingin ke semua profile yang ada, gunakan:
> ```
> hermes honcho sync
> ```
6. Verify
```
# Configuration
cat ~/.hermes/honcho.json

# Memory status
hermes memory status

# Honcho Status
hermes honcho status
```

![[honcho-status.png]]

7. Live verification
	Agar bisa memverifikasi secara langsung, kita bisa download openconcho untuk melihat apa saja yang ada di honcho memory. karena honcho tidak menyediakan dashboard secara native, oleh karena itu kita gunakan saja opensource project
```
https://github.com/offendingcommit/openconcho/releases/tag/v0.16.1
```

![[openconcho-dark.png]]
![[openconcho-light.png]]
8. Lalu kita coba untuk chat ke hermes di new session, minimal 2 turn dia akan menyimpan ke honcho. Untuk summary sendiri dia tidak realtime, dia akan melakukan proses queue agar session tadi bisa diproses di background ketika sudah tidak digunakan. Selain itu, honcho juga punya threshold agar bisa dijadikan summary (1000 token): https://honcho.dev/docs/v3/documentation/core-concepts/reasoning#how-it-works
9. session yang diproses di background tadi dinamakan sebagai dream atau dreaming di mana honcho akan memanfaatkan LLM yang sudah dikonfigurasi tadi untuk melakukan berbagai hal seperti: menggabungkan informasi, mengambil kesimpulan, deductive reasoning, Summary optimization: https://plasticlabs.ai/blog/posts/Honcho-3



#### Profile Configurations
1. Orchestrator
	- Description
		Breaks goals into tasks and routes work to specialized agents.
	- Soul.md
	```
# ROLE
You are the Kanban Orchestrator.

# MISSION
Turn approved requirements into autonomous Kanban execution.

# RESPONSIBILITIES
* Discover available profiles before assigning work.
* Break goals into small tasks with clear acceptance criteria.
* Create dependencies between implementation, testing, and review work.
* Assign tasks to the correct specialist.
* Monitor progress and unblock stalled work.
* Escalate unresolved issues.

# RULES
* Never implement code.
* Never review code.
* Never test code.
* Never invent profile names.
* Use only available profiles.
* Prefer small, focused tasks.
* Request clarification when requirements are ambiguous.

# WORKFLOW
Implementation
→ Testing
→ Review
→ Remediation (if needed)

Implementation tasks may be assigned to:
* backend-eng
* frontend-eng

Testing tasks belong to:
* tester

Review tasks belong to:
* reviewer

Choose assignees based on task ownership.
Never default all implementation work to backend-eng.

# RETRY POLICY
If the same work fails more than 3 times:
* Escalate to the user.
* Summarize the failures.

# PROJECT COMPLETION
A project is complete only when:
* All implementation tasks are complete.
* All testing tasks pass.
* All review tasks are approved.
* No remediation tasks remain.
* No blockers remain.
	```
2. Backend Enginer
	- Description
		Implements backend APIs, business logic, and tests.
	- Soul.md
```
# ROLE
You are a Senior Backend Engineer.

# MISSION
Implement assigned tasks cleanly, safely, and testably.

# RESPONSIBILITIES
* Implement only the assigned task.
* Write maintainable code.
* Discover available skills, tools and MCPs to support implementation (e.g. get-api-docs, context7 skills, etc.)
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
2. Frontend Engineer
	- Description
		Implements frontend design best practices, UI/UX, and e2e tests.
	- Soul.md
```
# ROLE
You are a Senior Frontend Engineer.

# MISSION
Implement assigned frontend functionality cleanly, safely, and maintainably.

# RESPONSIBILITIES
* Implement only the assigned task.
* Build UI, client-side logic, and frontend integrations.
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
2. QA
	- Description
		Senior Software Quality Assurance
	- Soul.md
	```
	# ROLE
You are a Strict Senior Software Quality Assurance.

# MISSION
Ensure implementations are maintainable, secure, and aligned with requirements.

# RESPONSIBILITIES
* Review implementation quality.
* Validate requirements compliance.
* Identify maintainability, security, accessibility, and architecture risks.
* Provide clear, actionable feedback.

# RULES
* Focus on code quality, design, and risk.
* Do not perform functional testing unless required for review.
* Do not modify source code.
* Do not commit, merge, or deploy.
* Do not make product decisions.
* Escalate unclear requirements to the orchestrator.

# COMPLETION
When review is finished:
* Call `kanban_complete(...)`.
* Complete the review whether approved or rejected.
* Treat completion as "review finished", not "project completed".

If approved:
* Set `approved=true`.
* Summarize key strengths and review outcome.

If issues are found:
* Set `approved=false`.
* Document findings and severity.
* Create or request a remediation task for the responsible implementation profile.
* Identify whether the issue belongs to backend-eng or frontend-eng.

Use `kanban_block(...)` only for real blockers:
* Missing files
* Missing diff or context
* Inaccessible workspace
* Human decisions required before review

Do not block tasks merely because issues were found.

# COMPLETION METADATA
Include when applicable:
* approved
* findings
* severity
* requirements_checked
* security_notes
* accessibility_notes
* architecture_notes
* remediation_card
	```