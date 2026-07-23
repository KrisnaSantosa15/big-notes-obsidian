---
date: 2026-07-23
type: concept
tags: [concept, ddd, architecture, dicoding]
related-projects: ["[[Projects/Dicoding Platform]]"]
ai-first: true
---

## For future Claude

Catatan konsep, disimpan 2026-07-23: arsitektur DDD 4-layer yang dipakai di codebase `dicoding-dev/dicoding` (lihat [[Projects/Dicoding Platform]]), beserta aturan praktis kapan membuat tiap building block (aggregate vs action vs query repository/VM) dan bagaimana PR biasanya dipecah. Ini catatan kerja Krisna sendiri yang dirapikan, bukan sumber eksternal - tidak perlu sitasi. Melengkapi Overview singkat yang sudah ada di [[Projects/Dicoding Platform]]; catatan ini lebih dalam soal aturan "kapan bikin X" dan konvensi testing.

## Apa itu DDD (dalam konteks ini)

DDD (Domain-Driven Design): pemisahan antara **strategic design** (logika bisnis) dan **tactical design** (teknis pembuatan kode dari logika tersebut).

## 4 Layer

Arah dependency: `Web -> UseCases -> Domain <- Infrastructure` (Domain adalah inti yang murni; layer lain bergantung padanya, bukan sebaliknya).

### 1. Domain Layer
Business logic, acceptance scenario, unit test untuk aggregate.

- **Aggregate** - logika bisnis dari fitur itu sendiri (misalnya alur/fungsi `purchase`).
- **Enums** - konsistensi nilai kategorisasi.
- **Events** - di-raise (atau di-return) ketika sebuah proses selesai dilakukan. Di DDD "murni" event tidak wajib ada, tapi di Dicoding event tetap dibuat karena ada kebutuhan logging.
- **Value Objects (VO)** - membungkus (encapsulate) kumpulan data primitif (tipe data bawaan bahasa pemrograman yang tidak punya fungsi bawaan, misalnya integer, float, boolean - berbeda dengan tipe data composite: array, list, object, class) beserta validasi dari data primitif tersebut. VO tidak selalu dibuat - buat ketika ada banyak parameter primitif yang harus di-pass bersamaan ke sebuah fungsi.
- **Domain Services** - dibuat ketika butuh operasi yang melibatkan aggregate lain, atau ketika aturan bisnisnya banyak/kompleks (bukan cuma CRUD).
- **Unit Test** - test acceptance scenario untuk aggregate. Lokasi: `app/tests/UnitTests/Domain/...`.

### 2. Infrastructure Layer
Menangani detail teknis: persistence data, pemanggilan HTTP client eksternal, pengiriman email, serta queueing.

- **Migration** - membuat tabel/skema database.
- **Gateway** - query builder, interaksi langsung dengan DB.
- **Event Handlers** - menangkap event yang sudah di-raise oleh domain.
- **Repository** - create & save aggregate; jembatan antara infrastructure dan domain.

### 3. Use Case Layer (Spec)
Mengorkestrasi workflow aplikasi - mengoordinasikan pemanggilan Domain Services, Gateways, Repositories, dan menyusun payload keluaran.

- **Specification** - meng-orchestrate alur (flow).

### 4. Web Layer
Menangani protokol HTTP: routing, request parsing, session HTTP, authorization middleware, dan mengembalikan HTTP response (JSON/HTML).

- Integration Test
- Routing
- Action
- View
- Response

## Aturan Keputusan: Butuh Layer/Building Block Apa?

- **Butuh perubahan data?** -> buat aggregate.
- **Butuh data readonly, satu sumber?** -> cukup ditangani di Action, panggil gateway langsung dari sana. Tidak perlu aggregate.
- **Butuh data readonly dari banyak sumber/gateway?** -> pindahkan ke query repository atau ViewModel (VM). Query repository dan VM dianggap setara/bisa dipertukarkan di sini.

## Konvensi Testing

Unit test berlaku untuk: aggregate, repository, dan VO (hanya jika VO-nya kompleks - jarang terjadi karena VO kompleks memang jarang).

- **Unit test aggregate** - menguji logika bisnis.
- **Unit test repository** - menguji apakah berhasil mensimulasikan kebutuhan specification (simulasi "happy path"), bukan pengujian query yang menyeluruh.
- **Unit test VO** - kasus langka; VO kompleks jarang terjadi sehingga jarang ditulis.

Secara default, satu file unit test menggabungkan test aggregate dan repository. Kalau keduanya dipisah jadi file berbeda, biasanya artinya pemisahan itu masih menyentuh domain layer, bukan urusan infra yang sesungguhnya.

Test repository biasanya digabung sekalian dalam PR yang sama dengan aggregate - asalkan tidak ada query baru yang dibuat di situ.

**Integration test** dibuat ketika Action dibangun, dan berada di Web layer.

## Konvensi Pemecahan PR (pola dari Agis)

Pengerjaan fitur biasanya dipecah jadi 2 PR:

1. **PR Domain** - enums, events, aggregate, value objects, repository, gateway (method gateway dikosongkan/di-stub dulu), unit test. Boleh sekalian bikin aggregate + repository + gateway di PR ini, dengan isi method gateway diisi belakangan.
2. **PR Infrastructure + Web + Spec** - integration test, specification (orkestrasi use case), dan mengisi body method gateway yang di-stub di PR 1.

## Contoh Referensi

Fitur **Mentoring**, diimplementasikan awal 2022 (sebelum era development yang banyak dibantu AI di 2025), disebut sebagai contoh yang sudah mengikuti struktur DDD ini dengan benar. (confidence: stated - penilaian Krisna sendiri, belum diverifikasi ulang langsung terhadap kode per tanggal catatan ini)
