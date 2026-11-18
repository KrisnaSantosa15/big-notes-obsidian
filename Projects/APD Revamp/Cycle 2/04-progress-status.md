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
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257815
sp: "2"
status: Brainstorm selesai, belum dikerjakan
pr: []
depends-on:
  - 05-course-progress
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Ops manages Students' progress status (2 SP, draft, kalkulasi otomatis)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257815)

## Kondisi saat ini

- APD lama: sheet Tracker milik Ops (di luar folder kita), kolom "Verdict Progress", diimpor lewat IMPORTRANGE ke "[Prod] DBS 2026 B1 - Cohort Data Importer" (tab Token Data Sheet lalu tab Student Progress Status: `User ID`, `Student Progress`). Apps Script `syncStudentProgressStatus` mengubah kode ke label (AS, IS, LB, NSA, WITHDRAW) lalu menulis ke dokumen user Firestore.
- Token Data Sheet punya kolom terpisah "Withdraw ?" (U) dan "Terminated ?" (V). "Terminated" tidak dipakai di kode APD lama.
- APD lama menyembunyikan Withdraw dari tampilan Student sendiri (`StudentSidebar.vue:95`, `ProfileCard.vue:56`), tidak memblok akses. Member aktif capstone = semua status kecuali Withdraw (`SELECTABLE_ACTIVE_STATUS_VALUES`).
- Rumus verdict (dugaan dari Krisna, 2026-11-17, belum dikonfirmasi Ops): setiap learning path punya timeline mingguan dengan kolom "Target Ideal Jumlah Lulus Kelas" (kumulatif). Jumlah kelas lulus dibandingkan target minggu berjalan: lebih = AS, sama = IS, kurang = LB, jauh kurang = NSA. Withdraw keputusan Ops. Di Token Data Sheet, "Verdict Progress" bersebelahan dengan "Total Kelulusan" dan "Sisa Kelas".
- Komentar Hasbi di card: "konfirmasi perhitungan nilai progress status ke tim ops" dan "withdraw apakah akan berhubungan dengan status student".

## Pertanyaan ke Ops (dikirim Krisna 2026-11-17)

1. Cara Ops memberi verdict AS/IS/LB/NSA/Withdraw.
2. Ada rumus/otomasi sheet? Kalau ada: dihitung dari kelas lulus vs "Target Ideal Jumlah Lulus Kelas"? Ambang LB vs NSA? Kelas yang dihitung (matrikulasi ikut)? Dibandingkan sejak awal minggu atau setelah deadline? Frekuensi pembaruan?
3. Verdict hasil rumus pernah diubah manual?
4. Learning path Student selalu sama dengan kategori campaign?
5. Beda Withdraw dan Terminated? Masih boleh akses APD? Kalau tidak, datanya masih perlu terlihat di admin?

## Pertanyaan terbuka internal

- ~~P7. D1 tabel terpisah vs kolom di access list.~~ Gugur 2026-11-18: status dihitung otomatis, tidak disimpan.
- ~~P8. Ops perlu bisa mengosongkan status (kembali ke "-")?~~ Gugur 2026-11-18: tidak ada input manual.

## Jawaban Ops (diterima 2026-11-17)

1. **Cara menentukan status:** jumlah kelas yang sudah diluluskan peserta dibandingkan dengan target penyelesaian kelas mingguan sesuai learning path. Alur Ops: terima ekspor MCT, olah data (tanggal kelulusan, status progres, submission, ketentuan perpanjangan akses), tetapkan target mingguan, bandingkan.
   - **AS:** kelas yang diluluskan melebihi target minggu berjalan.
   - **IS:** sesuai target minggu berjalan.
   - **LB:** tertinggal satu minggu dari target.
   - **NSA:** tertinggal dua minggu atau lebih dari target.
   - **Withdraw:** peserta mengundurkan diri. Bukan hasil perbandingan progres mingguan.
2. **Automation:** AS/IS/LB/NSA ditentukan otomatis oleh rumus Google Sheets dari jumlah kelas lulus dan target mingguan. Ada link "Contoh pengolahan data" dan "Referensi perhitungan status progres" yang **belum ikut ter-paste**.
3. **Perubahan manual:** tidak pernah. Status selalu mengikuti rumus.
4. **Withdraw vs Terminated:** Withdraw = keputusan peserta sendiri. Terminated = dihentikan penyelenggara (misalnya tidak memenuhi MA).
5. **Cara Ops menyambungkan ke APD:** membuat list Student Progress Status dan list Course Progress, lalu minta auto sync ke tim product. Keluhan Ops: data di-update ke bawah dan perlu lookup satu per satu, sering kena limit.

Komentar Krisna di card (2026-11-17):
- Ops menetapkan target mingguan per learning path, lalu sistem membandingkan progres peserta dengan target itu.
- Contoh: learning path AI menargetkan 4 course di minggu ke-2. Peserta baru lulus 3 course (target minggu ke-1), jadi statusnya LB.
- Pertanyaan Krisna: target kelas disimpan di mana? Usulannya, saat setup APD Ops memilih learning path, course Dicoding per learning path, dan tenggat setiap course.

## Desain baru: status dihitung otomatis (usulan 2026-11-17)

Usulan input manual (D1-D9, CSV, audit) **tidak relevan lagi** karena Ops tidak pernah mengubah status secara manual.

**Data yang dibutuhkan rumus:**

| Kebutuhan | Sumber |
| --- | --- |
| Kelas yang sudah lulus beserta tanggalnya | `developer_journey_completions` (`user_id`, `journey_id`, `created_at`). Unique `(user_id, journey_id)` sudah di-drop, jadi renew menambah baris baru |
| Minggu berjalan | `academic_program_dashboard_campaigns.open_at` (wajib sejak migration `2026_10_23_100000`) |
| Learning path Student | K20: `access_list.user_id` + `program_id` ke `scholarship_participants.scholarship_package_id` |
| Course per learning path + target mingguan | **Belum ada.** Memakai tabel konfigurasi Course progress ([bagian 5](05-course-progress.md)) ditambah kolom `target_week` |

**Tabel bersama (memperluas E1 di [bagian 5](05-course-progress.md)):** `academic_program_dashboard_learning_path_courses` dengan kolom `campaign_id`, `scholarship_package_id`, `course_id`, `target_week`, dan audit.
- Course progress memakai daftar course-nya.
- Status memakai target: **target(N) = jumlah course dengan `target_week ≤ N`**. Bentuknya sama dengan kolom kumulatif "Target Ideal Jumlah Lulus Kelas" di sheet Ops.

**Rumus (dihitung saat dibaca, tidak disimpan):**
- N = minggu berjalan sejak `open_at`.
- Lulus = jumlah course di learning path tersebut yang selesai dalam periode program.

| Kondisi | Status |
| --- | --- |
| Lulus > target(N) | AS |
| Lulus = target(N) | IS |
| target(N-1) ≤ Lulus < target(N) | LB |
| Lulus < target(N-1) | NSA |

**Konsekuensi:**
- Tidak perlu tabel status, CSV, maupun audit perubahan. Status selalu dihitung ulang, jadi keluhan sinkronisasi Ops (jawaban no. 5) hilang dengan sendirinya.
- Withdraw dan Terminated **keluar dari card ini** dan ditangani card Ops edits participant ([bagian 2](02-ops-edits-participant.md)). Student yang withdraw tidak bisa membuka APD, jadi label Withdraw di halaman Student tidak dibutuhkan.
- AC card masih menyebut input manual satu per satu dan CSV. Card Basecamp tidak diubah dari sini, Krisna yang menyesuaikan.

**Rincian SP (draft baru): 2 SP**

| Bagian | SP |
| --- | --- |
| Kalkulator status (domain murni + unit test kasus AS/IS/LB/NSA dan batas minggu) | 1 |
| Query lulus per Student secara batch + kolom dan filter status di daftar peserta admin | 0,5 |
| Integration test query | 0,5 |
| **Total** | **2** |

Konfigurasi `target_week` dihitung di card Course progress.

## Yang perlu diputuskan (2026-11-17)

- **Q1. Definisi LB.** Apakah `target(N-1) ≤ lulus < target(N)`? Contoh: target minggu lalu 3, minggu ini 5, lulus 4, maka LB. Perlu dicocokkan dengan rumus di link "Referensi perhitungan status progres".
- **Q2. Kelas yang dihitung lulus.** Hanya course di daftar learning path dan yang selesai dalam periode program (`open_at` sampai sekarang)? Sejalan dengan komentar Hasbi di card Course progress.
- **Q3. Status di luar periode.** Sebelum minggu ke-1 dan setelah `close_at`: dibekukan di minggu terakhir, atau tidak ditampilkan?
- **Q4. Peserta withdraw/terminated di daftar admin dan Fasilitator.** Label "Inactive" (dihitung dari `accessible_until` < `close_at`) atau disembunyikan?


## Keputusan 2026-11-18

- **Q1. Rumus: cukup (Krisna).** "Tertinggal X minggu" = minggu berjalan dikurangi minggu terakhir yang targetnya tercapai. Karena target kumulatif selalu naik, ini setara dengan tabel AS/IS/LB/NSA di atas. Contoh: target minggu 1-4 = 2, 4, 4, 6. Di minggu 4, lulus 4 = LB dan lulus 3 = NSA.
- **Detail teknis (ditetapkan Claude, belum ada keberatan):**
  - Minggu ke-1 dihitung sejak `open_at`, per blok 7 hari (bukan Senin kalender). Di minggu ke-1, status paling buruk LB karena target(0) = 0.
  - Di sheet, "minggu acuan" diperbarui manual oleh Ops (jawaban Ops no. 2). Di sistem, minggu acuan dihitung otomatis. Perlu diinformasikan ke Ops.
- **Q2 dan Q3:** lihat [bagian 5](05-course-progress.md), "Keputusan 2026-11-18". Kelas lulus = completion atau renew FINISHED dalam periode. Status dibekukan setelah `close_at`.
- `target_week` ada di `academic_program_dashboard_learning_path_courses` ([bagian 5](05-course-progress.md)). Card ini bergantung ke card setup learning path (kalau jadi dipecah, Q7).


## Komentar Krisna di card (2026-11-18 05:56)

"Kalau memang progress status ini intinya membandingkan progress saat ini dan target mingguan, expected condition di card ini sudah tidak relevan." AC card (input manual satu per satu, CSV, audit) perlu ditulis ulang sesuai desain kalkulasi otomatis.

## Arsip

Bagian di bawah sudah usang dan hanya disimpan sebagai riwayat. Jangan dipakai sebagai keputusan terkini.

### Usulan keputusan D1-D9 (usang sejak 2026-11-17, diganti kalkulasi otomatis)

| # | Usulan | Tanggal |
| --- | --- | --- |
| D1 | Tabel terpisah `..._student_progress_statuses` (`access_list_id` unique, FK cascade, `status`, `updated_by`, timestamps). Status hanya relevan untuk Student, access list dipakai bersama APD lama | 2026-11-17 |
| D2 | Audit cukup perubahan terakhir (`updated_by`, `updated_at`), tanpa tabel riwayat | 2026-11-17 |
| D3 | Enum `ProgressStatus`: AS, IS, LB, NSA, WITHDRAW, label Inggris seperti APD lama | 2026-11-17 |
| D4 | Belum ada status tampil "-", bukan default IS | 2026-11-17 |
| D5 | Set satu per satu lewat aksi per baris di halaman Students, dialog terpisah dari edit peserta | 2026-11-17 |
| D6 | CSV pola group member CSV (identifier email atau user_id). Ditolak per baris: tidak ditemukan, bukan Student di campaign, status kosong, status tidak valid. Kode tidak peka huruf besar/kecil | 2026-11-17 |
| D7 | Kolom status dan filter status di halaman Students | 2026-11-17 |
| D8 | Withdraw hanya label, tidak mencabut akses. Dikeluarkan (B6) adalah hal berbeda | 2026-11-17 |
| D9 | `useCase->run` tanpa lock | 2026-11-17 |

Arah scope: card ini input manual (mengganti jalur sinkronisasi sheet ke APD). Perhitungan otomatis dari timeline learning path dijadikan card lanjutan (perkiraan sekitar 5 SP: konfigurasi timeline 2, kalkulator 2, integrasi 1) setelah card Course progress, kalau rumus dari Ops jelas. Tabel, enum, set manual, kolom dan filter tetap dipakai versi otomatis (override Withdraw).

### Rincian SP lama (usang, asumsi input manual)

| Bagian | SP |
| --- | --- |
| Migration, domain, gateway | 1 |
| Set satu per satu | 0,5 |
| CSV | 1 |
| Kolom dan filter | 0,5 |
| **Total** | **3** |
