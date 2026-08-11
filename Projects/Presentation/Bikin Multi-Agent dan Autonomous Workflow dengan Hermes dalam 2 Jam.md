# Bikin Multi-Agent dan Autonomous Workflow dengan Hermes dalam 2 Jam

> awal-awal kita konfigurasi seperti sesi sebelumnya tapi tidak menyentuh teori apa itu agent bedanya dengan chatbot, beda openclaw & hermes tapi langsung ke instalasi secara cepat, aku akan bilang cek video sebelumnya agar lebih detial. setelah itu aku mulai coba hasil konfigurasi itu secar singkat, mungkin minta calculator sederhana, kemudian buka studi kasus yang membutuhkan beberapa agent seperti Backend, Frontend, Orchestrator, Tester dan Reviewer, kemudian coba hal yang sederhana menggunakan multi agent tersebut.

## Opening (5 menit)

> Validasi pengalaman peserta dari sesi sebelumnya: "siapa yang udah coba install Hermes tapi masih ngerasa itu cuma chatbot yang lebih pinter dikit?" Lanjut janjikan outcome konkret sesi ini: "2 jam dari sekarang, kalian bakal punya tim agent sendiri (backend, frontend, tester, reviewer) yang kerja otomatis lewat kanban board, dan udah dikasih memory biar gak mulai dari nol tiap sesi."

## Outline

1. Quick Setup & Warm Up (20 menit)
2. Dari Single Agent ke Multi-Agent (25 menit)
3. Membangun Autonomous Workflow dengan Kanban Board (40 menit)
4. Giving Your Agent a Memory (25 menit)
5. Buffer & Q&A (5 menit)

> Total 120 menit (termasuk Opening 5 menit di atas).

## 1. Quick Setup & Warm Up (20 menit)

- Membahas Instalasi
	- Jalur cepat resmi: installer one-liner (`curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash` di Linux/macOS/WSL2/Termux, atau `iex (irm https://hermes-agent.nousresearch.com/install.ps1)` di Windows) sudah otomatis clone repo + install semua dependency, lanjut `hermes setup --portal` buat login, set provider Nous, dan aktifin Tool Gateway dalam satu command - skip opsi-opsi manual biar hemat waktu
- Konfigurasi sederhana
- Coba task membuat kalkulator sederhana

## 2. Dari Single Agent ke Multi-Agent (25 menit)

- raise issue/kenapa single agent tidak cukup? dan membutuhkan multi agent?
- Jawaban: Karena membutuhkan peran berbeda agar terhindar dari bias, kita sebagai manusia aja selalu ada bias
- Jelaskan Keuntungan multi agent: terhindar dari bias, kekurangan: boros token, apalgi untuk task sederhana seperti membuat kalkulator
- Demo built aplikasi kalkulator sederhana

## 3. Membangun Autonomous Workflow dengan Kanban Board (40 menit)

- Membuat profile: orchestrator, backend engineer, frontend engineer, reviewer, tester
	- Opsi cepat: siapin 1 profile yang udah jadi (kelima role sekaligus) di GitHub sendiri pake fitur Profile Distributions sebelum sesi (`.gitignore` buat exclude auth.json/.env/memories/sessions, plus manifest `distribution.yaml`), peserta tinggal `hermes profile install github.com/<username>/<nama-profile>` - gak perlu configure 5 profile dari nol pas hands-on
- Konfigurasi setiap profile (model, description, SOUL.md, available tools[context 7])
- Coba membuat kalkulator sederhana tapi dengan multi agent workflow
- Lihat kanban board

## 4. Giving Your Agent a Memory (25 menit)

Nah tadi kita sudah membuat project kalkulator sederhana, tapi coba bayangin kalo besok kita minta hermes nambahin fitur baru ke kalkulator itu - apakah backend engineer masih inget arsitektur yang kemarin dipakai? Apakah reviewer masih inget standar yang kemarin ditetapkan? Defaultnya enggak, karena tiap sesi baru itu mulai dari nol. Makanya kita butuh memory.

- Kenapa AI butuh memory?
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

Ingatan Hermes tentang kita yang disimpan dan dikelola dalam satu sistem, lebih canggih

- Disini hermes bisa melakukan query ke memory provider untuk mencari ingatan yang ada, misalkan kita pernah bilang bahwa "Saya lebih suka bahasa pemrograman python daripada PHP", 6 bulan kemudian kita bilang "saya ingin membuat software X" maka si hermes akan retrieve memory tadi dan menghasilkan Relevant Memory: User prefers Python than PHP
- Jadi dengan adanya memory provider ini, hermes bisa mencari memory yang relevan jauh lebih baik dibandingkan native memory dia yang biasanya acak-acakan.

### Obsidian

Apa knowledge atau informasi yang disimpan secara sengaja untuk dijadikan sebagai sumber agent

- Nah ada juga obsidian yang digunakan sebagai second brain, ini juga biasanya digunakan oleh banyak orang sebagai knowledge. Jadi bukan memory native atau tambahan tapi lebih ke tempat penyimpanan segala hal yang ingin kita simpan.
- Misalkan kita sedang mengerjakan project x, kemudian menyuruh hermes menyimpan ini ke obsidian, maka dia akan menyimpan dan menjadikan sebagai informasi tambahan.
- Kita juga harus secara ekspllisit bilang simpan ke obsidian atau second brain atau hal yang relate kesana baru hermes akan simpan ini, beda dengan memory native atau memory tambahan tadi. Meskipun sebetulnya bisa saja kita konfigurasi setiap pre-tool-call maka cek obsidian, tapi bukan secara alami dari kapabilitas obsidian.

- handons pake supermemory

## Buffer & Q&A (5 menit)

- Slot cadangan kalau ada section yang molor (paling rawan: section 3)
- Recap singkat + tanya jawab

---

## Draft Referensi: Konfigurasi 4 Profile untuk Section 3

> Keputusan: pakai 4 profile (bukan 5) - `tester` dan `reviewer` digabung jadi satu profile `qa` biar setup live gak makan waktu section 3. Roster final: **orchestrator, backend, frontend, qa**.

### Roster & Deskripsi (buat kanban routing)

```
hermes profile create orchestrator --description "Orchestrator: memecah task dan routing ke profile lain lewat kanban. Tidak pernah mengerjakan implementasi sendiri."
hermes profile create backend --description "Backend engineer: logic, API, data layer. Tidak menyentuh kode UI."
hermes profile create frontend --description "Frontend engineer: UI/UX, konsumsi API dari backend. Tidak menyentuh logic backend."
hermes profile create qa --description "QA: menulis & menjalankan test, review kualitas kode. Tidak menulis fitur baru."
```

Atau kalau mau cepat, ganti `--description "..."` manual dengan `hermes profile describe <nama> --auto` biar di-generate LLM dari skill+model masing-masing.

### SOUL.md per profile (persona/identitas - durable, ikut kemanapun profile dipakai)

**orchestrator/SOUL.md**
```
Kamu adalah orchestrator. Gayamu ringkas dan terstruktur.
Tugasmu murni memecah task jadi bagian kecil dan routing ke profile yang tepat lewat kanban board.
Kamu TIDAK PERNAH menulis kode, mengedit file, atau menjalankan implementasi sendiri - itu bukan tugasmu.
```

**backend/SOUL.md**
```
Kamu adalah backend engineer yang pragmatis dan to the point.
Prioritaskan correctness dan kesederhanaan logic dibanding fitur tambahan yang tidak diminta.
Kamu hanya bertanggung jawab atas logic, API, dan data layer.
```

**frontend/SOUL.md**
```
Kamu adalah frontend engineer yang detail terhadap UX kecil (label, error message, feedback ke user).
Kamu hanya bertanggung jawab atas UI dan cara mengonsumsi API yang disediakan backend.
```

**qa/SOUL.md**
```
Kamu adalah QA engineer yang skeptis secara konstruktif - selalu cari cara bikin sesuatu gagal sebelum bilang "aman".
Tugasmu menulis & menjalankan test, serta review kualitas kode.
Kamu TIDAK menulis fitur baru - kalau nemu bug, laporkan lewat komentar kanban, jangan diperbaiki sendiri.
```

### AGENTS.md (taruh di folder project kalkulator, di-share ke semua profile)

```
Project: Kalkulator sederhana untuk demo multi-agent workshop.
Struktur folder:
- /backend  -> logic & API (tanggung jawab profile `backend`)
- /frontend -> UI (tanggung jawab profile `frontend`)
- /tests    -> test suite (tanggung jawab profile `qa`)

Aturan:
- Setiap profile HANYA boleh edit folder yang jadi tanggung jawabnya.
- Semua task diselesaikan lewat kanban board, bukan komunikasi langsung antar profile.
```

### Toolset per profile (config.yaml)

| Profile | Toolsets | Alasan |
|---|---|---|
| orchestrator | `kanban`, `memory` | sengaja TIDAK dikasih `coding`/`file`/`terminal` biar gak bisa ngerjain sendiri, cuma bisa routing |
| backend | `coding`, `kanban` | butuh file+terminal+code_execution buat kerja, `kanban` buat update status task |
| frontend | `coding`, `kanban` | sama seperti backend |
| qa | `coding`, `kanban` | butuh baca kode & jalanin test; batasan "jangan nulis fitur baru" ditegakkan lewat SOUL.md/AGENTS.md, bukan lewat toolset (karena tetap butuh akses file buat nulis test) |

Catatan: toolset `kanban` itu **opt-in eksplisit** - gak otomatis ikut kalau enable `all`/`*`, jadi wajib ditambahkan manual di tiap profile worker atau mereka gak akan bisa interaksi ke board sama sekali.

### Config kanban (config.yaml)

```yaml
kanban:
  orchestrator_profile: orchestrator
  default_assignee: backend
  auto_decompose: true
  auto_decompose_per_tick: 3
```

*(Belum terverifikasi 100% apakah key ini disetel di profile aktif/default atau level lain - test langsung sebelum sesi.)*

### MCP Context7 (opsional, buat backend & frontend saja)

Biar agent coding gak halusinasi API yang sudah deprecated, tambahkan di `mcp.json` profile `backend` dan `frontend`:

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

### Opsi hemat waktu (dari section 3 di atas)

Kalau mau lebih cepat lagi, bungkus 4 profile ini jadi satu **Profile Distribution** di GitHub sebelum sesi, biar peserta tinggal `hermes profile install github.com/<username>/<nama-profile>` alih-alih menjalankan semua command di atas satu-satu secara live.

---

## Opsi Demo Alternatif: Rock-Paper-Scissors (RPS)

> Alternatif/pendamping kalkulator di section 1-3 - lebih seru ditonton audiens live, tetap cepat dibangun. Kalau dipakai, sesuaikan `AGENTS.md` di draft profile di atas (ganti "Kalkulator sederhana" jadi "Rock-Paper-Scissors").

### Prompt untuk Section 1 (Warm Up, single agent, tes instalasi)

```
Buatkan aplikasi web sederhana Rock-Paper-Scissors: user pilih batu/gunting/kertas lewat 3 tombol, lawan komputer yang milih random, tampilkan hasil menang/kalah/seri di layar. Simpan dalam satu file HTML+JS saja biar cepat dites.
```

### Prompt untuk Section 2 (Demo single-agent - bukti kenapa butuh multi-agent)

```
Buatkan aplikasi web Rock-Paper-Scissors lengkap: backend API buat logic menang-kalah, frontend buat UI-nya, dan sertakan beberapa test buat mastiin logic-nya benar. Kerjakan semuanya sendiri dari awal sampai akhir.
```

Tujuannya nunjukkin satu agent ngerjain backend+frontend+test sekaligus - biasanya hasilnya kurang rapi atau ada yang kelewat (logic, UI, atau test-nya), jadi bahan diskusi soal bias/keterbatasan single agent.

### Prompt untuk Section 3 (Multi-agent workflow lewat Kanban)

Task yang dimasukkan ke kanban Triage (lewat orchestrator):

```
Buat aplikasi web Rock-Paper-Scissors: user vs komputer (pilihan komputer random), 3 tombol pilihan (batu/gunting/kertas), tampilkan hasil menang/kalah/seri, dan sertakan test otomatis yang membuktikan logic menang-kalah benar untuk semua kombinasi.
```

Decomposer bakal mecah task ini ke masing-masing profile (backend bikin logic, frontend bikin UI, qa bikin test) secara otomatis berdasarkan deskripsi profile yang sudah di-set sebelumnya.

### Bonus: prompt buat sengaja nyuntik edge case (biar QA kelihatan "nangkep" sesuatu)

Tambahkan requirement ini ke prompt section 3 kalau mau ada bug yang sengaja lolos di demo single-agent tapi ketangkep di multi-agent:

```
Pastikan input pilihan user tidak case-sensitive (misal "Batu", "batu", "BATU" semua dianggap sama).
```

Ini gampang kelewat kalau backend nulis perbandingan string apa adanya (`"Batu" === "batu"` hasilnya `false`) - jadi bahan bagus buat QA nangkep pas demo section 3, sekaligus jadi bukti konkret value dari role terpisah (bukan cuma soal "boros token").
