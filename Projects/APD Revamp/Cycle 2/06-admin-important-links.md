---
date: 2026-11-17
updated: 2026-11-18
type: plan
tags:
  - plan
  - brainstorm
  - estimation
  - dicoding
  - apd
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257862
sp: "4"
status: Brainstorm selesai, belum dikerjakan
pr: []
depends-on: []
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Admin manages important links (4 SP)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257862)

"Grup" di card ini adalah **grup link** (judul bagian di halaman Student Portal/Capstone), bukan grup peserta.

## Kondisi APD lama

- Firestore `important-links` (`hosting/src/data/datasources/firestore/important-links.ts`): `label`, `url`, `docType` (`student_portal` | `capstone`), `studentType` (string atau array, campuran kunci kategori dan `"facilitator"`, lihat `important-links-categories.ts`), `order`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy` (hanya diisi saat edit), `deletedAt`, `deletedBy`. `docTypeLabel` dan `studentTypeLabel` dihitung saat dibaca, tidak disimpan.
- Link baru: `order = jumlah link aktif`. Reorder lewat drag, lalu tombol "Save order" menulis ulang `order` semua link. Dibaca dengan `orderBy("order")`, lalu `orderBy("createdAt")`.
- Tidak ada grup: judul bagian dibuat dengan link tanpa URL. Link berlaku per environment (per program), belum per campaign.

## Kondisi APD baru

- Kategori per campaign sudah ada (`academic_program_dashboard_campaign_categories`). Flag `importantLinks` dan `studentPortal` ada di `FeatureKey`.
- Belum ada library drag-and-drop di frontend.
- Tidak ada migrasi data (PRD), jadi nama kolom tidak wajib sama dengan APD lama.

## Keputusan dan usulan

| # | Isi | Status | Tanggal |
| --- | --- | --- | --- |
| F1 | Dua tabel: grup link dan link. Target Student berupa kolom di tabel link, tanpa pivot | Usulan (desain diminta Krisna) | 2026-11-17 |
| F2 | Kolom urutan bernama **`order`** (sama dengan APD lama, mudah dipahami). Konsekuensi: `order` kata kunci SQL, jadi selalu di-quote di query | **Sepakat (Krisna)** | 2026-11-17 |
| F3 | Target Student: `category_ids` (JSON) + `is_for_facilitator` (boolean), bukan array campuran seperti `studentType` lama | Usulan | 2026-11-17 |
| F4 | `doc_type` di tabel grup, enum `STUDENT_PORTAL` dan `CAPSTONE`. Link Capstone sudah bisa dikelola walaupun halamannya baru di Epic 7 | Usulan | 2026-11-17 |
| F5 | Link baru: `order` = max `order` aktif di grup + 1, pakai `useCase->lock` per grup agar tidak ganda | Usulan | 2026-11-17 |
| F6 | Reorder: frontend mengirim array id berurutan, backend menulis ulang semua `order` dalam satu transaksi. Semua id harus milik grup itu dan masih aktif | Usulan | 2026-11-17 |
| F7 | Pindah grup lewat field grup di form edit (masuk urutan terakhir grup tujuan). Drag hanya untuk mengurutkan di dalam grup | Usulan | 2026-11-17 |
| F8 | URL wajib dan harus `http(s)` valid | Dari AC | 2026-11-17 |
| F9 | Grup juga di-soft delete, hanya boleh kalau tidak punya link aktif | Usulan | 2026-11-17 |
| F10 | UI: tab "Important Links" di admin campaign, sub-tab Student Portal dan Capstone, daftar grup beserta link, dialog tambah/edit link dan grup, konfirmasi hapus | Usulan | 2026-11-17 |

## Desain tabel

`academic_program_dashboard_important_link_groups`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | increments | |
| `campaign_id` | unsignedInteger, FK ke `academic_program_dashboard_campaigns` (cascade) | |
| `doc_type` | string(32) | Enum `STUDENT_PORTAL`, `CAPSTONE` |
| `title` | string | Judul bagian |
| `order` | unsignedSmallInteger | Urutan grup per campaign + `doc_type`. Selalu di-quote di query |
| `created_by`, `updated_by` | unsignedInteger, FK ke `users` | |
| `deleted_by` | unsignedInteger nullable, FK ke `users` | |
| `created_at`, `updated_at` | dateTime | |
| `deleted_at` | dateTime nullable | Soft delete |

Index `(campaign_id, doc_type, order)`.

`academic_program_dashboard_important_links`

| Kolom                                    | Tipe                                              | Keterangan                                                              |
| ---------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `id`                                     | increments                                        |                                                                         |
| `group_id`                               | unsignedInteger, FK ke link groups, tanpa cascade | Campaign dan `doc_type` diambil dari grup                               |
| `label`                                  | string                                            |                                                                         |
| `url`                                    | string(2048)                                      | Wajib, http(s)                                                          |
| `order`                                  | unsignedSmallInteger                              | Urutan di dalam grup. Selalu di-quote di query                          |
| `category_ids`                           | json, tidak nullable                              | Id kategori campaign yang dicentang. `[]` untuk link khusus Fasilitator |
| `is_for_facilitator`                     | boolean                                           | Checkbox Fasilitator                                                    |
| `created_by`, `updated_by`               | unsignedInteger, FK ke `users`                    |                                                                         |
| `deleted_by`                             | unsignedInteger nullable, FK ke `users`           |                                                                         |
| `created_at`, `updated_at`, `deleted_at` | dateTime (`deleted_at` nullable)                  | Soft delete                                                             |


Index `(group_id, order)`. Aturan domain: minimal satu target dicentang (`category_ids` tidak kosong atau `is_for_facilitator = true`). Query Student: `JSON_CONTAINS(category_ids, kategori user)`. Query Fasilitator: `is_for_facilitator = 1`.

Alasan:
- Link tidak menyimpan `campaign_id` dan `doc_type` supaya tidak ada data yang saling bertentangan. Pindah grup otomatis pindah tipe dokumen.
- Tanpa unique `(group_id, order)` dan tanpa unique judul grup, karena soft delete dan reorder bisa bentrok sementara. Ganda dicegah lewat F5, F6, dan cek domain.
- FK link ke grup tanpa cascade karena grup tidak pernah di-hard delete.
- Kolom audit mengikuti konvensi codebase `*_by` + FK `users` (P15).
- Target mengikuti skema APD lama (P13): satu daftar checkbox di UI, disimpan sebagai `category_ids` + `is_for_facilitator`.

## Pemetaan ke APD lama

| APD lama | Baru |
| --- | --- |
| id dokumen (uuid) | `id` |
| `label`, `url` | `label`, `url` (URL sekarang wajib) |
| `docType` | `doc_type` di tabel grup |
| `studentType` | `category_ids` + `is_for_facilitator` (id kategori campaign, bukan kunci teks) |
| `order` | `order` (sekarang per grup) |
| `createdAt/By`, `updatedAt/By`, `deletedAt/By` | `created_at/by`, `updated_at/by`, `deleted_at/by` |
| `docTypeLabel`, `studentTypeLabel` | Tidak disimpan (lama juga dihitung saat dibaca) |
| (tidak ada) | `group_id`, tabel grup, scope per campaign |

## Pertanyaan terbuka

Semua terjawab 2026-11-17:

- ~~P12. Drag-and-drop.~~ **Pakai library** `@dnd-kit/sortable` sesuai AC (Krisna). SP card dinaikkan menjadi 4 (Krisna).
- ~~P13. Link untuk semua kategori.~~ **Keputusan (Krisna): ikuti skema APD lama.** Form menampilkan satu daftar checkbox "Terlihat oleh" (semua kategori campaign ditambah Fasilitator), minimal satu dicentang. Tidak ada pilihan "all", flag, atau enum.
  - Opsi yang ditolak: kategori palsu "all" di tabel kategori (mencampur data dengan aturan), flag `is_for_all_categories` (membingungkan: "semua kategori" sudah dicentang tapi link tidak muncul di Fasilitator), enum `student_scope` ALL/SELECTED/NONE (terlalu rumit dan berbeda dari APD lama).
  - Penyimpanan opsi a: `category_ids` (json) + `is_for_facilitator` (boolean). Di UI tetap satu daftar. Opsi b (`audiences` json campuran id kategori dan "facilitator", paling mirip `studentType`) ditolak supaya tipe data rapi.
  - Konsekuensi yang diterima (sama seperti APD lama): kategori yang ditambahkan di tengah campaign tidak otomatis melihat link lama. Admin mencentang ulang.
- ~~P14. Link khusus Fasilitator.~~ APD lama mendukung ("Facilitator" salah satu pilihan `studentType`, `important-links-categories.ts`; mentor membaca link berkategori `"facilitator"`, `ImportantLinks.vue:22`). Tidak ada sheet Important Links (card inventaris Kevin: dikelola lewat Admin UI). **Keputusan (Krisna): harus ada link khusus Fasilitator** (`category_ids = []`, `is_for_facilitator = true`).
- ~~P15. FK kolom audit.~~ Konvensi codebase: `*_by` `unsignedInteger` + FK ke `users` (`certificate_templates.created_by`, `event_attenders.checked_in_by`, `mentoring_booking_reschedules.rescheduled_by`, `email_platform_drafts.admin_id`). **Keputusan (Krisna): FK ke `users`.**

## Rincian SP (draft)

| Bagian | SP |
| --- | --- |
| Grup: migration, domain, CRUD, reorder, UI | 1,5 |
| Link: CRUD, daftar checkbox target (kategori + Fasilitator, minimal satu), validasi URL, soft delete, audit FK `users`, UI | 1,5 |
| Drag-and-drop link dan grup (`@dnd-kit/sortable`, library baru) | 1 |
| **Total** | **4** (disepakati Krisna 2026-11-17) |
