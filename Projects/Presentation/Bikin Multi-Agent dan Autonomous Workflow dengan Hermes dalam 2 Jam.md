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
	![[Pasted image 20260810092801.png]]
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

### Obsidian

Apa knowledge atau informasi yang disimpan secara sengaja untuk dijadikan sebagai sumber agent

- Nah ada juga obsidian yang digunakan sebagai second brain, ini juga biasanya digunakan oleh banyak orang sebagai knowledge. Jadi bukan memory native atau tambahan tapi lebih ke tempat penyimpanan segala hal yang ingin kita simpan.
- Misalkan kita sedang mengerjakan project x, kemudian menyuruh hermes menyimpan ini ke obsidian, maka dia akan menyimpan dan menjadikan sebagai informasi tambahan.
- Kita juga harus secara ekspllisit bilang simpan ke obsidian atau second brain atau hal yang relate kesana baru hermes akan simpan ini, beda dengan memory native atau memory tambahan tadi. Meskipun sebetulnya bisa saja kita konfigurasi setiap pre-tool-call maka cek obsidian, tapi bukan secara alami dari kapabilitas obsidian.

- handons pake supermemory
