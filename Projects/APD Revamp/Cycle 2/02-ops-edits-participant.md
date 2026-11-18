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
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711
sp: "4"
status: Brainstorm selesai, belum dikerjakan
pr: []
depends-on:
  - 05-course-progress
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Ops edits a campaign participant (4 SP, draft)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711)

## Kondisi kode saat ini

- Aturan update peserta sudah ada di `ParticipantImport::update()` (kategori, Student ID, event `ParticipantWasUpdated`). K27: edit satu peserta memakai aturan yang sama.
- `accessible_from`/`accessible_until` diisi otomatis dari `open_at`/`close_at` campaign saat peserta didaftarkan lewat semua jalur (listener, sync, tambah manual, CSV), lihat K7 dan `ParticipantImport.php:228`. Gate akses sudah memfilter `accessible_until > NOW()` (`AcademicProgramDashboardAccessListGateway.php:278`).
- Halaman Students belum punya aksi per baris dan belum menampilkan periode akses.
- Semua FK ke access list (`group_members`, `supervised_students`, `session_participants`, `session_facilitators`) memakai `onDelete('cascade')`. Access list tidak punya soft delete. Hard delete menghapus keanggotaan grup, mapping Lecturer, dan riwayat sesi.
- Status WITHDRAW ada di card lain, [Ops manages Students' progress status](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257815) (Epic-3, belum ada assignee): status progress AS, IS, LB, NSA, WITHDRAW, dan "Student tetap perlu melihat status ini".
- Export daily check-in ke Firestore (`DailyCheckInFirestoreRouter.php:62`, dokumen per `program_user_id`) hanya jalan untuk program di config `daily_check_ins.projects`, yaitu program APD lama.

## Keputusan

| # | Keputusan | Tanggal |
| --- | --- | --- |
| B1 | CSV import tidak ditambah kolom `accessible_from`/`accessible_until`. Nilainya otomatis dari periode campaign saat peserta didaftarkan. Perubahan per orang lewat aksi edit per baris dari card ini. Kolom CSV baru dibuat kalau Ops meminta perpanjangan massal | 2026-11-17 |
| B2 | Field yang bisa diedit: kategori, `accessible_from`, `accessible_until`, dan Program User ID. Email dan akun Dicoding tidak bisa diedit | 2026-11-17 |
| B3 | Program User ID boleh ditimpa, karena AC card menyebut "Mengubah Program User ID". Larangan K24 berasal dari APD lama (id dokumen Firestore dan token login lama) dan tidak berlaku untuk revamp (tanpa migrasi data, export Firestore hanya untuk program lama). Keunikan tetap dijaga: Student ID yang sama tidak boleh dipakai dua peserta di campaign yang sama (`PROGRAM_USER_ID_ALREADY_USED`) | 2026-11-17 |
| B4 | Aggregate edit dan keluarkan dibuat tanpa cek role: hanya cek admin dan baris milik campaign tersebut. Field yang diedit berlaku sama untuk semua role di access list. UI hanya dipasang di halaman Students dulu; halaman staff nanti tinggal memakai endpoint yang sama | 2026-11-17 |
| B5 | Validasi periode akses hanya `accessible_from < accessible_until`. Boleh di luar `open_at`-`close_at` campaign, karena perpanjangan melewati periode campaign pernah dibutuhkan di APD lama (`UpdateAcademicProgramDashboardAccessibleUntil`) | 2026-11-17 |
| B6 | **Belum diputuskan, perlu diskusi.** Arti "mengeluarkan peserta" dan bedanya dengan withdraw, lihat bagian pertanyaan terbuka | 2026-11-17 |

## Pertanyaan terbuka

- **P1 (B6). Mengeluarkan peserta vs withdraw.** Sudah dikomentari Krisna di card (2026-11-17). Yang perlu dikonfirmasi:
  - Kenapa peserta perlu dikeluarkan: koreksi salah input, atau mekanisme withdraw?
  - Apakah Student yang WITHDRAW masih bisa mengakses APD? Card progress status bilang "Student tetap perlu melihat status ini", tapi belum jelas apakah termasuk WITHDRAW.
  - Kalau withdraw tidak sama dengan dikeluarkan: Claude mengusulkan keluarkan = hard delete (untuk salah input) dengan dialog konfirmasi yang menyebut data yang ikut terhapus, withdraw lewat status progress, dan cabut akses tanpa hapus data lewat edit `accessible_until` ke hari ini.
  - Kalau withdraw sama dengan dikeluarkan: perlu kolom status di access list.
  - Pilihan tampilan peserta yang aksesnya dicabut: tetap tampil dengan label Inactive, atau tidak ditampilkan.
  - Risiko soft delete atau kolom status: access list masih dipakai APD lama di production oleh sekitar 8 pembaca (login URL, middleware, daily check-in, dashboard, dan lain-lain). Semuanya perlu filter tambahan, dan yang terlewat membuat peserta yang dikeluarkan tetap bisa masuk.
- **P2. Komentar Hasbi di card (2026-11-16):** "fokuskan yang bisa diedit itu field yang di registrasi adalah free text". Perlu dicek field registrasi mana yang free text dan apakah mengubah B2.
- **P3. Aturan K24 di CSV import.** Edit per baris boleh menimpa Program User ID (B3), sedangkan CSV import masih menolak (`PROGRAM_USER_ID_ALREADY_SET`). Usulan Claude: longgarkan juga di card ini supaya aturannya sama (K27), tambahan sekitar 0,5 SP. Belum diputuskan.
- **P4.** Kalau `close_at` campaign diedit, `accessible_until` peserta tidak ikut berubah (Q7 di backlog). Di luar card ini, perlu ditanyakan ke Ops.

## Rincian SP (draft)

| Bagian | Isi | SP |
| --- | --- | --- |
| Edit | Aggregate update (pakai aturan import, B3, B5), `PATCH`, menu aksi per baris di halaman Students, dialog edit (kategori, dua tanggal, Program User ID), test | 2 |
| Keluarkan | Bergantung P1. Kalau hard delete: aggregate removal, `DELETE`, dialog konfirmasi cascade, test | 1 |
| Longgarkan K24 di CSV (opsional, P3) | Hapus cek `PROGRAM_USER_ID_ALREADY_SET`, sesuaikan test | 0,5 |
| **Total** | | **3** (3,5 kalau P3 ikut). Bisa berubah kalau P1 memutuskan kolom status |


## Pembaruan 2026-11-17 (komentar card dan jawaban Ops)

- **Hasbi (06:15):** withdraw bisa karena diajukan peserta atau karena tidak memenuhi mandatory achievement. Di APD lama peserta tidak dihapus, yang diubah adalah tanggal aksesnya.
- **Hasbi (06:20):** terminated/withdraw perlu dikonfirmasi ke tim cohort. Contoh model di ASAH dilampirkan sebagai gambar.
- **Jawaban Ops no. 4:** Withdraw = peserta mengundurkan diri sendiri. Terminated = keikutsertaan dihentikan penyelenggara, misalnya tidak memenuhi Mandatory Achievement (MA).
- **Krisna (10:38, di card progress status):** Withdraw dan Terminated berbeda, tapi **diperlakukan sama oleh sistem**:
  - `accessible_until` diubah menjadi `now()`.
  - Token kelas MCT yang diberikan ke Student tersebut diubah statusnya menjadi *ended*.
- **Dampak ke P1 (B6): terjawab.** "Mengeluarkan peserta" = withdraw/terminated, tanpa hapus data, tanpa kolom status, tanpa soft delete. Risiko 8 pembaca access list di APD lama hilang karena mereka sudah memeriksa periode akses.
- **Dampak ke SP:** mengakhiri token MCT menyentuh domain MultiCourseTokens. Kalau use case-nya sudah ada, cukup dipanggil (3 SP). Kalau belum, perlu dibuat (4 SP). Lihat Q6 di Ringkasan.
- **Belum diputuskan:**
  - Q4: tampilan peserta yang sudah dikeluarkan di daftar admin dan Fasilitator (label "Inactive" atau disembunyikan).
  - Q6: use case pengakhiran token MCT.
  - P2 (field registrasi free text) masih terbuka.


## Q6: pengakhiran token MCT (dicek 2026-11-18)

Fitur **dropout MCT sudah ada** dan dipakai admin:
- `MultiCourseTokenDropoutAction` dan `MultiCourseTokenDropoutIndexAction`, halaman `dashboards/academies/multicoursetokens/dropout`.
- `MultiCourseTokenDropoutSpecification`, aggregate `MultiCourseTokenDropout` (menerima daftar kode token), dan job `DropoutMultiCourseTokenBatchHandler`.
- `MultiCourseTokensGateway::dropoutRedeemedToken`:
  - Mengubah token menjadi ENDED dan memperpendek `deadline_at`.
  - Untuk setiap course, **men-drop enrollment** kalau tidak ada token aktif lain yang mencakup course itu. Kalau ada, deadline enrollment disesuaikan.
  - Wajib dipanggil di dalam transaksi.
- Ada juga `setTokenStatusAsEnded` yang hanya mengubah status, tanpa menyentuh enrollment.

Usulan: card ini mencari token MCT Student untuk program campaign tersebut, lalu memanggil spesifikasi dropout yang sudah ada. SP 3, atau 3,5 kalau pencarian token per program perlu query baru.

**Perlu konfirmasi:** withdraw/terminated ikut men-drop enrollment course (dropout penuh, Student kehilangan akses kelas), atau cukup status ENDED tanpa menyentuh enrollment (`setTokenStatusAsEnded`)?


## Keputusan 2026-11-18

| # | Keputusan |
| --- | --- |
| Q6 | **Dropout penuh** (Krisna). Panggil `MultiCourseTokenDropoutSpecification` yang sudah ada: token ENDED, dan enrollment course di-drop kalau tidak ada token aktif lain |
| Q4 | Peserta yang dikeluarkan **tetap tampil dengan label "Inactive"** di daftar admin dan Fasilitator (Krisna) |
| P3 | **Boleh menimpa Program User ID di CSV import juga**, karena AC menyebut mengubah Program User ID (Krisna). Aturan CSV disamakan dengan edit per baris (K27), +0,5 SP |
| P4 | Ditunda, di luar card (Krisna) |
| Baru | **Learning path peserta bisa diedit** dari form edit (Krisna), menyusul K20 gugur. Pilihan diambil dari learning path campaign ([bagian 5](05-course-progress.md)) |

## Terjawab (Q8): membedakan Withdraw dan Terminated (2026-11-18)

Kalau hanya memakai `accessible_until = now()`, sistem tidak bisa membedakan Withdraw dan Terminated, dan juga tidak bisa membedakan peserta yang dikeluarkan dari peserta yang aksesnya habis karena program selesai.

Usulan Claude: kolom baru di access list.
- `exit_reason`: string(16) nullable, enum `WITHDRAWN` atau `TERMINATED`.
- Label "Inactive (Withdrawn)" atau "Inactive (Terminated)" diambil dari `exit_reason`, bukan dari perbandingan tanggal.
- Akses tetap dicabut lewat `accessible_until`, jadi 8 pembaca access list di APD lama tidak perlu filter tambahan. Kolom ini hanya informasi.
- Dialog "Keluarkan peserta": pilih alasan (Withdraw atau Terminated), lalu konfirmasi bahwa token MCT akan di-dropout.
- Audit cukup memakai `updated_by` dan `updated_at` access list kalau sudah ada. Kalau belum, perlu dicek.

Alternatif yang ditolak: tabel riwayat terpisah (`participant_exits`). Riwayat lebih lengkap, tapi YAGNI untuk sekarang.

Pertanyaan turunan: perlu fitur **memulihkan** peserta yang sudah dikeluarkan? Dropout MCT tidak bisa dibatalkan (enrollment sudah di-drop), jadi pemulihan berarti Ops harus memberi token baru. Usulan: tidak ada tombol pulihkan di card ini.

## Terjawab sebagian (P2): field registrasi free text (2026-11-18)

Temuan:
- Data registrasi program ada di `scholarship_participants`. Kolom tetapnya `category`, `knows_from`, `disabilities`, dan `scholarship_package_id`.
- Field teks bebas (institusi, jurusan, NIM, dan sejenisnya) disimpan sebagai JSON di `education_info` dan `other_requirements`.
- Bentuk JSON tersebut **berbeda per program**: CodingCamp, IBM, Elevate, Pijak, dan Mastercard masing-masing punya ViewModel registrasi sendiri.

Dua tafsiran komentar Hasbi:
- **A.** Ops bisa mengedit data registrasi free text (institusi, jurusan, dan sejenisnya) dari APD. Konsekuensinya: form per program mengikuti bentuk JSON masing-masing, menyentuh data milik fitur registrasi, dan menambah sekitar 2 SP atau lebih. APD revamp juga belum menampilkan data ini.
- **B.** Di antara field APD, fokus ke field yang dulu diisi sebagai teks bebas sehingga rawan salah ketik, terutama Program User ID. Kategori dan learning path dipilih dari daftar, tapi tetap bisa diedit sesuai AC.

Usulan Claude: B, lalu konfirmasi ke Hasbi.


## Keputusan lanjutan 2026-11-18

- **Q8: kolom `exit_reason`** (nullable, `WITHDRAWN` atau `TERMINATED`) di access list. **Tanpa fitur pulihkan** (Krisna).
- **P2: tafsiran B** (fokus ke field APD yang rawan salah ketik, terutama Program User ID). Daftar field final **diputuskan bersama tim** (Krisna). Bawa ke diskusi tim, termasuk konfirmasi ke Hasbi.

**Rincian SP (draft): 4 SP**

| Bagian | SP |
| --- | --- |
| Edit kategori, periode akses, Program User ID, learning path | 1,5 |
| Keluarkan peserta (`exit_reason` + `accessible_until` + dropout MCT) | 1 |
| CSV import boleh menimpa Program User ID (P3) | 0,5 |
| Test | 1 |
| **Total** | **4** |


## Pengecekan MCT, APD lama, dan sheet (2026-11-18)

**Mencari token MCT milik campaign: langsung, tanpa risiko.**
- `multi_course_tokens` punya `program_id` (FK `partner_programs`) dan `student_id`. Campaign punya `partner_program_id`.
- Query: `program_id = campaign.partner_program_id AND student_id = user_id`. Token yang sudah habis (misalnya token tes seleksi) otomatis ditandai tidak eligible oleh `MultiCourseTokenDropout::classifyToken` ("Masa belajar sudah berakhir"), jadi aman ikut terkirim.

**"Token jadi ENDED" ada dua cara, efeknya berbeda:**

| Cara | Dipakai oleh | Efek ke akses kelas |
| --- | --- | --- |
| `setTokenStatusAsEnded` (status saja) | Hanya cron `NotifyMultiCourseTokenStudyDeadline`, saat deadline token **sudah lewat secara alami** | Tidak mencabut apa pun. `course_enrollments.deadline_at` tetap, jadi kalau dipanggil di tengah program, Student **masih bisa belajar** |
| Dropout (`dropoutRedeemedToken`) | Halaman admin `multicoursetokens/dropout` (dibuat 2026-02-14) | Token ENDED, `deadline_at` diperpendek, enrollment menjadi DROPOUT (atau deadline disesuaikan kalau ada token aktif lain). Akses kelas benar-benar berhenti |

Kesimpulan: "token jadi ENDED" di tengah program yang dimaksud Krisna dan Ops **secara efektif adalah dropout**. Status ENDED yang terlihat di admin sama ("Masa Belajar Berakhir"). Keputusan Q6 (dropout penuh) tetap.

**APD lama:**
- Tidak ada logika MCT sama sekali.
- Withdraw hanya nilai `progressStatus` dari sheet (`cohort-data-importer/data/firestore.ts:86`). Efeknya: badge progress di sidebar Student disembunyikan (`StudentSidebar.vue:95`), muncul di filter Chooser, dan Student ditandai tidak aktif di pembentukan grup Capstone (`CapstoneManualGroup.spec.ts:156`).
- Terminated tidak dikenal di APD lama.
- Akses dicabut lewat `accessible_until` di access list Dicoding (komentar Hasbi).

**Sheet Token Data Sheet:** kolom `Withdraw ?` dan `Terminated ?` berupa penanda 0/1 yang terpisah. Di 400 baris pertama ada sekitar 2 Withdraw dan sekitar 19 Terminated. Tidak ada jejak token yang diakhiri di sheet.

**Dampak:**
- Alur "keluarkan peserta" = `exit_reason` + `accessible_until = now()` + dropout token MCT program itu, dalam satu transaksi. Konsisten dengan sheet (dua penanda terpisah) dan APD lama (akses lewat tanggal).
- **Catatan untuk Epic Capstone:** APD lama mengecualikan Withdraw dari pembentukan grup Capstone. Di sistem baru, gunakan `exit_reason` (WITHDRAWN atau TERMINATED).
- **SP tetap 4.** Pencarian token cukup satu query, dan spesifikasi dropout tinggal dipakai ulang.


## Komentar Krisna di card (2026-11-18)

- 04:31: perlu diputuskan field apa saja yang bisa diedit.
- 04:48: karena harus ada learning path, card ini **bergantung ke card Course progress** (tabel learning path campaign). Apakah ada kasus Student pindah learning path? Pernah terdengar, tapi belum jelas apakah ditangani tim Ops.
- 06:07: harapan field yang bisa diubah: Kategori, Program User ID, Status Peserta (Withdraw/Terminated), Learning Path(?), field free text.
- 07:10: SP bisa 2-4 tergantung dependensinya, khususnya learning path. Judul card diisi 4.

Ketergantungan baru: **Course progress ([bagian 5](05-course-progress.md)) harus selesai lebih dulu**, karena pilihan learning path di form edit membaca tabel learning path campaign.
