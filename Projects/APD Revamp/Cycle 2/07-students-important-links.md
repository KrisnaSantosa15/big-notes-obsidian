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
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257869
sp: "2"
status: Brainstorm selesai, terblokir kerangka halaman Student (Hasbi)
pr: []
depends-on:
  - 06-admin-important-links
  - 05-course-progress
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Students see important links (2 SP)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257869)

## Kondisi APD lama

- `views/components/studentPortal/ImportantLinks.vue` adalah komponen sidebar "Important Links", dipasang di Student Portal, Facilitator Portal (tipe `student_portal`), dan Capstone Project (tipe `capstone`).
- Kategori dibaca dari user. Mentor diberi kategori `"facilitator"`. Link diambil dengan `array-contains` kategori.
- Saklar fitur: `studentPortal` mengatur menu dan halaman Student Portal (`data/constants/sidebar-nav.ts:74`), `importantLinks` mengatur kotak link di dalam halaman (`ImportantLinks.vue:24`). Di APD lama saklar berlaku per kategori.
- Halaman Student Portal berisi Jumbotron dan konten statis (`SITE_CONTENTS.studentPortal(programName)`), dengan kotak link di sampingnya.

## Kondisi APD baru

- Belum ada halaman atau route Student dan Fasilitator. Kerangka ada di card Hasbi [User can Access APD based on their Role](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894672).
- Saklar fitur di `academic_program_dashboard_campaign_features` per campaign (bukan per kategori).
- Listener card [6] (`ParticipantEnrollmentSpecification`) mendaftarkan Student dengan `categoryId: null` (TODO). Student hasil pendaftaran tidak punya kategori, sehingga tidak akan melihat link apa pun (link dipilih per kategori, [bagian 6](06-admin-important-links.md) P13). Juga berdampak ke announcement per kategori (Hasbi).

## Keputusan dan usulan

| # | Isi | Status | Tanggal |
| --- | --- | --- | --- |
| G1 | Data lewat prop Inertia dari action halaman, disaring di server: campaign, `doc_type`, kategori user atau `is_for_facilitator`, link dan grup belum dihapus, urut `order` grup lalu `order` link. Tanpa endpoint API baru | Usulan | 2026-11-17 |
| G2 | Grup tanpa link yang bisa diakses user tidak ditampilkan | Dari AC | 2026-11-17 |
| G3 | Komponen React `ImportantLinks`: daftar per grup, tab baru (`target="_blank" rel="noopener noreferrer"`), empty state. Dipakai Student Portal dan Facilitator Portal | Usulan | 2026-11-17 |
| G4 | Tampilan link Capstone ditunda ke Epic 7 (halaman Capstone belum ada) | Usulan | 2026-11-17 |
| G5 | Fasilitator ditentukan dari `role = FACILITATOR` di access list campaign | Usulan | 2026-11-17 |
| G6 | Halaman Student Portal dan Facilitator Portal butuh kerangka bagian Student dulu (card Hasbi). Card ini memasang komponen setelah kerangka ada | **Krisna** | 2026-11-17 |
| G7 | TODO kategori di card [6] harus diselesaikan (memetakan kategori pendaftaran ke kategori campaign). Bentuk pekerjaan (card baru atau gabung) belum ditentukan | **Krisna** | 2026-11-17 |
| G8 | Saklar fitur: ikuti APD lama, link tampil kalau `studentPortal` dan `importantLinks` sama-sama aktif. Card ini cukup cek `importantLinks`, karena halaman tidak ada kalau `studentPortal` mati. AC menulis "atau", jadi perlu dikonfirmasi | Usulan, menunggu konfirmasi Krisna | 2026-11-17 |

## Ketergantungan

G8 diperjelas (Krisna, 2026-11-17): saklar fitur adalah **pengaturan campaign** yang diisi Admin saat setup (`academic_program_dashboard_campaign_features`: `campaign_id`, `feature_key`, `is_enabled`, diisi lewat `CampaignSettingsUpdateSpecification`), bukan feature flag kode. Card ini wajib mengecek baris `importantLinks` campaign di database. Belum ada pembaca saklar untuk sisi Student (baru `enabled_features` untuk form admin di `AcademicProgramDashboardCampaignGateway.php:223`). Pembaca yang sama dibutuhkan menu sidebar (`studentPortal`), announcement, dan newsletter, jadi sebaiknya dibuat sekali dan dipakai bersama.

| # | Bergantung ke | Pemilik | Status | Sifat |
| --- | --- | --- | --- | --- |
| 1 | [User can Access APD based on their Role](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894672) (kerangka halaman Student/Fasilitator, route, akses per role) | Hasbi | Planning | Blocker |
| 2 | [Admin manages important links](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257862) (tabel dan data) | Krisna | Planning | Blocker milik sendiri |
| 3 | TODO kategori card [6] (kategori Student hasil pendaftaran masih `null`) | Krisna | Belum ada card | Blocker untuk Student hasil pendaftaran |
| 4 | Pembaca saklar fitur campaign (`importantLinks`, `studentPortal`) | Belum jelas, kemungkinan Hasbi (kerangka) | Belum ada | Koordinasi agar tidak dibuat dua kali |
| 5 | [Add Facilitators, Lecturers, and Instructors to a campaign](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894097) | Alfian | In progress | Dibutuhkan untuk link Fasilitator. `ContributorCreation` sudah ada di kode |
| 6 | Pengaturan campaign (saklar fitur) dan kategori campaign | Alfian | Done | Sudah tersedia |
| 7 | Halaman Capstone | Epic 7 | Belum | Di luar scope (G4) |

Urutan: Admin important links, lalu TODO kategori [6], lalu tunggu kerangka Hasbi, lalu card ini.

## Rincian SP

| Bagian | SP |
| --- | --- |
| Query baca + gateway + test integration | 0,5 |
| Komponen `ImportantLinks` + vitest | 0,5 |
| Pasang di Student Portal dan Facilitator Portal + cek saklar fitur | 0,5 |
| Buffer | 0,5 |
| **Total** | **2** (disepakati Krisna 2026-11-17). Tidak termasuk kerangka halaman (card Hasbi) dan TODO kategori [6] |


## Keputusan 2026-11-18

- **G7:** TODO kategori card [6] (`ParticipantEnrollmentSpecification` mendaftarkan Student dengan `categoryId: null`) **ikut dikerjakan di card Course progress**, bersamaan dengan pemetaan learning path saat auto-enroll (Krisna). Polanya sama: data registrasi dipetakan ke data campaign. Card Course progress menjadi 5,5 SP.
- **G8:** cukup cek fitur `importantLinks` (Krisna).
