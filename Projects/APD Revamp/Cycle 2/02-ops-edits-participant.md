---
date: 2026-11-17
updated: 2026-11-27
type: plan
tags:
  - plan
  - brainstorm
  - estimation
  - dicoding
  - apd
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711
sp: "4"
status: "PR #6534 (domain) open; PR web selesai lokal (menunggu ack & merge domain)"
pr:
  - 6534
depends-on: []
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Ops edits a campaign participant (4 SP, draft)

> **Pembaruan 2026-11-19:** card ini **tidak lagi bergantung ke Course progress**. Learning path tidak diedit, dan Program User ID tidak boleh diubah. Lihat [Keputusan 2026-11-19](#keputusan-2026-11-19-komentar-card-dan-meeting-ops). Keputusan B2, B3, P3, dan baris "Learning path bisa diedit" di bawah sudah diganti.

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

~~Ketergantungan baru: Course progress harus selesai lebih dulu.~~ Gugur 2026-11-19, learning path tidak diedit.


## Keputusan 2026-11-19 (komentar card dan meeting Ops)

Sumber: komentar Krisna di card, 2026-11-18 07:42 sampai 2026-11-19 09:05.

| # | Keputusan | Menggantikan |
| --- | --- | --- |
| L1 | **Learning path tidak diedit** ("learning path berarti gak perlu", 2026-11-19 04:03). Card ini lepas dari card Course progress | "Baru" 2026-11-18, ketergantungan di `depends-on` |
| L2 | **Program User ID tidak boleh diubah.** "Kalau salah ya salah aja", kesepakatan meeting revamp APD bersama tim Ops (2026-11-19 09:05) | B3, sebagian B2 |
| L3 | **CSV import tetap menolak Program User ID yang sudah ada** (`PROGRAM_USER_ID_ALREADY_SET`), mengikuti L2 | P3 (+0,5 SP dihapus) |
| L4 | **Field registrasi free text ikut diedit:** Jurusan, NIM, institusi, prodi, dari `scholarship_participants` dan `scholarship_cohorts` (2026-11-18 07:42). P2 bergeser ke **tafsiran A** | P2 tafsiran B |

Field yang bisa diedit sekarang: kategori, `accessible_from`/`accessible_until`, dan data registrasi free text (L4). Keluarkan peserta (`exit_reason` + `accessible_until` + dropout MCT) tetap.

**Catatan untuk nanti, bukan scope card ini (2026-11-18 07:46):** import peserta diharapkan sekaligus mengisi access list, grup, mapping Lecturer, dan learning path. Ditunda supaya fokus per fitur dulu.

**Yang perlu dicek sebelum implementasi:**
- Bentuk field free text berbeda per program (JSON `education_info`/`other_requirements`, ViewModel registrasi per program, lihat P2 di atas). Perlu dipastikan field mana di `scholarship_cohorts` dan apakah form edit dibuat generik atau per program.
- **SP perlu dihitung ulang.** Berkurang: edit Program User ID dan learning path, P3 (0,5). Bertambah: tafsiran A, yang sebelumnya diperkirakan sekitar 2 SP atau lebih.



## Revisi 2026-11-24: learning path boleh diisi dari kosong

**L1 direvisi (Krisna, 2026-11-24):** learning path peserta **boleh diedit dari kosong ke X**, tetapi **tidak boleh dari X ke Y**. Aturan ini sama dengan impor CSV (`ParticipantImport::resolveLearningPathId`, error `LEARNING_PATH_ALREADY_SET`). Pilihan learning path diambil dari learning path campaign. Card ini kembali bergantung ke tabel learning path campaign (stack Course progress).

> Krisna (2026-11-24): "opsi edit diperbolehkan untuk LP tapi asalakan dari kosong ke X, bukan dari X ke Y."

## Masalah: peserta manual tidak punya baris `scholarship_participants` (2026-11-24)

> Krisna (2026-11-24): "jika peserta yang ditambahkan manual oleh ops tidak masuk ke scholarship_participants nanti ketika edit profile seperti jurusan dan lain sebagainya tidak bisa dong karena dia tidak punya row di scholarship participant"

**Fakta (dicek di kode):**
- Tambah manual dan impor CSV APD hanya menulis `academic_program_dashboard_access_lists`.
- Baris `scholarship_participants` hanya ada kalau user mendaftar sendiri lewat form beasiswa program itu.
- Field registrasi free text (L4: jurusan, NIM, institusi, prodi) ada di `scholarship_participants.education_info` dan `other_requirements` (JSON), jadi peserta manual tanpa pendaftaran memang tidak punya data itu untuk diedit.

**Usulan Claude: tampilkan sebagai "tidak ada data registrasi", jangan buat baris `scholarship_participants` dari APD.**
- **Form edit:** bagian field registrasi hanya muncul kalau baris `scholarship_participants` ada. Peserta tanpa baris mendapat teks "Peserta ini tidak mendaftar lewat form registrasi, jadi tidak ada data registrasi". Ini memang kondisi datanya, bukan error.
- **Kenapa tidak membuat baris baru:** baris `scholarship_participants` berarti "user mendaftar program beasiswa". Ada 17 gateway di `master` yang membacanya, misalnya offering (`ScholarshipOfferingGateway`), leaderboard referral Pijak, export peserta, mailer, dan gateway per program. Baris buatan APD bisa ikut terhitung sebagai pendaftar, ikut offering, atau mengubah statistik. Baris itu juga memicu backfill learning path kalau diberi paket.
- **Kalau Ops tetap perlu mengisi jurusan dan sejenisnya untuk peserta manual,** tanyakan dulu kasus nyatanya (misalnya daftar dari partner). Opsinya simpan data profil APD terpisah di access list (kolom JSON sendiri), dengan konsekuensi ada dua sumber data profil. Jangan dibuat sebelum ada kebutuhan nyata (YAGNI).
- **Perlu dikonfirmasi ke Ops:** seberapa sering peserta ditambah manual tanpa pernah mendaftar, dan apakah mereka butuh field registrasi.


## Keputusan 2026-11-25: scope edit, peserta manual, dan bulk Withdraw/Terminated

Sumber: diskusi Krisna dengan Claude (2026-11-25), sheet `[Asah 2026] Final Cohort` (hanya dibaca), branch Alfian `feature/apd/student-profile-backend`.

**Profil peserta terpisah dari card ini.** Ada dua jenis profil: yang diedit Student sendiri (onboarding), dan yang hanya bisa diubah Ops lewat request form. Card ini mengerjakan jenis kedua di halaman admin.

**Field yang bisa diedit, per tabel:**

| Field | Tabel | Status |
| --- | --- | --- |
| Kategori, Withdraw/Terminated | `academic_program_dashboard_access_lists` (+ dropout MCT) | Siap dikerjakan |
| Institusi, Jurusan/Prodi, NIM | `scholarship_participants` / `scholarship_cohorts` (JSON) | Siap dikerjakan |
| Nama, Nomor WhatsApp | `academic_program_dashboard_student_profiles` (Alfian) | Menunggu branch Alfian di-merge. Profil Dicoding tidak boleh ditimpa (aturan Ops) |
| Lecturer/supervisor, WA, email | Belum jelas, menunggu jalur masuk lecturer dari Alfian | Ditunda |

**Data revisi Asah (tab Revisi Cohort Data):** sekitar 470 permintaan. Sekitar 437 soal supervisor, sekitar 33 soal data pribadi (WA 12, nama 11, institusi 6, NIM 3, jurusan 2). Ops selalu mencatat data lama dan baru (tab Student Update History), jadi event edit menyimpan nilai lama, nilai baru, aktor, dan waktu.

**K-M1. Field tanpa row sumber ditampilkan read-only dengan alasannya** (Krisna setuju).
- Field registrasi hanya bisa diedit kalau row `scholarship_participants`/`scholarship_cohorts` ada **dan** program punya field tersebut. Contoh teks: "Not registered through the registration form".
- Nama/WA hanya bisa diedit kalau row student profile ada (dibuat saat onboarding). Contoh teks: "Onboarding not completed yet".
- APD tidak membuat row baru di tabel registrasi (17 gateway membacanya).
- Key JSON per program di config `scholarships.<program>`, mengikuti pola `AsahGateway::updateParticipantFinalData`:

| Program | Institusi | Jurusan | NIM |
| --- | --- | --- | --- |
| Asah | `school_name` | `study_major` | `student_identity_number` |
| AI Camp kuliah | tidak ada | `major` | `student_identity_number` |
| AI Camp SMK | `school_name` | `school_major` | `student_identity_number` |
| Pijak | `last_education_institution` | tidak ada | tidak ada |

**Bulk Withdraw/Terminated:**

Data sheet (dicek 2026-11-25):
- Tab Terminated: 137 baris, Alasan terisi semua, semuanya `TERMINATED MA #2` dengan tanggal sama. Terminate dilakukan per batch.
- Tab Withdraw: 6 baris, Alasan terisi semua (4 `Withdraw after LoA`, 2 alasan pribadi teks bebas). Kolom Surat Pengunduran diri kosong semua.

| # | Keputusan |
| --- | --- |
| K-W1 | Alasan **wajib**, teks bebas, satu alasan untuk semua peserta yang dipilih. Tanpa upload surat, tanpa field tanggal (waktu = saat aksi, `accessible_until = now()`) |
| K-W2 | Status keluar **final**, tidak bisa dipulihkan, karena MCT sudah di-dropout. Peserta keluar diberi badge Withdrawn/Terminated dan checkbox-nya nonaktif |
| K-W3 | Dialog: daftar peserta terpilih, radio Withdraw atau Terminated, field alasan, satu tombol konfirmasi berlabel jumlah (misalnya "Terminate 137 students"), Cancel, dan close di kanan atas |
| K-W4 | Checkbox per baris; **pilihan tetap tersimpan saat pindah halaman atau ganti filter** (per user ID di state halaman). Tombol di samping Add participant menampilkan jumlah terpilih. Peserta bisa dilepas dari daftar di dialog |
| K-W5 | Import CSV untuk keluar massal tidak dibuat sekarang, baru kalau Ops meminta |

**Masih terbuka:**
- Edit `accessible_from`/`accessible_until` manual dan pengisian learning path dari kosong (revisi L1 2026-11-24) tidak disebut di daftar field 2026-11-25. Perlu konfirmasi apakah masih masuk card ini.
- Penyimpanan teks alasan: usulan kolom `exit_note` di access list di samping `exit_reason`.

**Pemisahan card (2026-11-25):** Withdraw/Terminated (termasuk bulk lewat checkbox dan CSV) dipindah ke card baru [[4][P1] Ops withdraws or terminates campaign participants in bulk](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10545178127). Keputusan K-W1 sampai K-W5 di atas berlaku untuk card itu. Card ini fokus ke edit. Urutan PR card ini: domain edit kategori (base master), infra + web edit kategori, field registrasi, lalu nama/WA setelah branch Alfian di-merge. Lihat catatan terpisah: [[Projects/APD Revamp/Cycle 2/09-ops-withdraws-terminates-participants]] ([09-ops-withdraws-terminates-participants](09-ops-withdraws-terminates-participants.md)).

**Scope final (komentar card 2026-11-25):** kategori, learning path (kosong ke X saja), institusi/jurusan/NIM, nama/WA (setelah tabel Alfian). Periode akses **tidak** diedit dari card ini: pencabutan lewat card Withdraw/Terminated, perpanjangan dibuat kalau Ops meminta. Program User ID tidak bisa diubah. [Komentar](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711#__recording_10545190286).


## Progres PR 1 dan cek konvensi (2026-11-25, ditunda)

**Status:** PR 1 sudah dikerjakan dengan TDD di branch `feature/apd/participant-edit-domain` (dari master `042dfe13892`), lalu disimpan di `git stash` dengan pesan `apd participant-edit-domain wip`. Desainnya perlu di-refactor sebelum commit.

**Yang sudah ditulis (di stash):**
- `ParticipantCategoryUpdate` (aggregate), `ParticipantCategoryWasUpdated` (event, `previous_category_id` + `category_id`), `ParticipantCategoryUpdateRepository`.
- `ParticipantCategoryUpdateTest`: 6 test hijau, psalm bersih.
- Terjemahan en/id `ACADEMIC_PROGRAM_DASHBOARD.PARTICIPANT_CATEGORY_UPDATE.*` (PARTICIPANT_NOT_FOUND, NOT_ADMIN, CATEGORY_NOT_IN_CAMPAIGN).
- Tanpa stub gateway: cukup `getEnrolledParticipantsByAccessListIds`, `getCategoriesByProgramCode`, `updateParticipant` yang sudah ada.
- Kategori tidak bisa dikosongkan (`update(int $categoryId)`, sama seperti import CSV).

**Koreksi Krisna:** edit tidak boleh dipecah per tabel, karena satu dialog edit mengubah beberapa tabel sekaligus.

**Konvensi codebase (dicek 2026-11-25):**
- Aggregate dipisah **per aksi user, bukan per tabel**:
  - `CampaignSettingsUpdate`: satu form, dua tabel. `save()` memanggil `updateCampaignSettings` dan `syncCampaignCategories`.
  - `DicodingProgramUpdate`, `DicodingProgramStatusUpdate`, `DicodingProgramPositionUpdate`: tiga aggregate karena ada tiga aksi UI.
- Transaksi sudah ditangani: `UseCase::run()` (`Dicoding/UseCases/Contracts/UseCase.php:213`) membungkus Specification dalam transaksi DB.
- Nilai lama di event memakai field datar `previous_*` (`MentoringPackageWasUpdated`). Precedent lain: `old_*`/`new_*` (`MentoringPackageMenteeWasUpdated`), `before`/`after` (`EmailSubscriptionWasUpdated`). Tidak ada precedent `changes: {field: {old, new}}`.
- Data existing masuk lewat VO di constructor (`ExistingMentoringPackage`), data baru lewat argumen `update(...)`. `EnrolledParticipant` sudah berperan sebagai VO existing.

**Rencana refactor:**
- Rename menjadi `ParticipantUpdate` dengan `update(int $categoryId)`. Parameter bertambah per PR: learning path, field registrasi, lalu nama/WA.
- Key error menjadi `ACADEMIC_PROGRAM_DASHBOARD.PARTICIPANT_UPDATE.*`.
- Event memakai semua field baru plus `previous_*`.

**Belum diputuskan: nama event.** `ParticipantWasUpdated` sudah dipakai import CSV (`category_id`, `program_user_id`).
- **A.** Pakai ulang `ParticipantWasUpdated` + `previous_category_id`, dan import ikut mengisinya. Kekurangannya: event import ikut berubah dan membawa field registrasi yang selalu null.
- **B.** Event baru khusus form edit admin dengan pola `previous_*`, misalnya `ParticipantWasEditedByAdmin`. Import tidak tersentuh.
- Usulan Claude: **B**, karena bentuk data import dan form edit makin berbeda setelah field registrasi masuk.

**Cara melanjutkan:** `git checkout feature/apd/participant-edit-domain && git stash list`, lalu `git stash pop` untuk stash `apd participant-edit-domain wip`, putuskan A/B, refactor, jalankan `deck ai:test --filter='ParticipantUpdateTest' --testsuite=unit` dan `deck ai:psalm`.


## Lanjutan PR 1 (2026-11-25): desain final domain

**Status:** 5 commit di `feature/apd/participant-edit-domain` (belum push, belum PR, atas permintaan Krisna):
`0691e8ca165` VO `ParticipantRegistration`, `bac55689eca` event dengan nilai lama, `c37c12a941e` terjemahan, `6dd82cf63d9` stub gateway registrasi, `c0eff18843a` aggregate `ParticipantUpdate` + repository + test.

**Keputusan:**
- **Satu aggregate per aksi user:** `ParticipantUpdate::update(int $categoryId, array $registrationFields)`. Kategori dan field registrasi digabung di satu PR domain (sekitar 470 baris). Learning path menunggu stack #6494/#6495, nama/WA menunggu tabel Alfian.
- **Event mengikuti konvensi satu event per fakta:** `ParticipantWasUpdated` dipakai bersama oleh import CSV dan edit manual (precedent: `ParticipantWasCreated`, `SupervisedStudentWasCreated`, `CampaignGroupWasCreated`). Constructor menerima VO lama dan baru (precedent `SubscriptionPromotionCodesWasUpdated`), `eventData` berisi `previous_*` untuk kategori, Program User ID, `school_name`, `study_major`, `student_identity_number`. Import mengirim registrasi `null`.
- **Nilai lama cukup di event** (log domain event `AcademicProgramDashboard/`, tanpa rotasi hapus). Tabel riwayat baru dibuat kalau Ops minta melihat riwayat di UI.
- **Nama field domain = key standar codebase:** `school_name`, `study_major`, `student_identity_number` (sama dengan `ParticipantEducationInfo` dan kode generik seperti `ScholarshipParticipantGateway::getEducationInfoValue`).
- **VO `ParticipantRegistration`:** `null` = tidak mendaftar lewat form (`REGISTRATION_NOT_FOUND`); key tidak ada = field tidak tersedia (`REGISTRATION_FIELD_NOT_AVAILABLE`).

## Riset pemetaan key registrasi (2026-11-25)

**Fokus ke AI Camp dulu**, karena APD revamp pertama kali dipakai AI Camp (Krisna). Asah dan program lain menyusul. **Pijak ditunda** (data tersebar di `education_info` dan `other_requirements`).

**Tanpa config mapping.** Precedent: kode generik membaca key standar langsung; pengetahuan key per program ada di gateway program itu (`AsahGateway`, `CodingCampGateway`), bukan di config.

**Key AI Camp** (`CodingCampRegistrationData::toEducationInfo`, `CodingCampRegistrationData.php:335-382`, config `scholarships.ai_camp`):

| Field domain | SMK | Kuliah (D1-S1, sedang kuliah) |
| --- | --- | --- |
| `school_name` | `school_name` (atau `abroad_school_name` kalau luar negeri) | sama |
| `study_major` | `school_major` | `major` |
| `student_identity_number` | `student_identity_number` (NISN) | `student_identity_number` (NIM) |

Koreksi tabel 2026-11-25 sebelumnya: AI Camp kuliah **punya** `school_name` (diisi kalau tidak kosong). Key `study_major` tidak dipakai AI Camp sama sekali.

**Rencana gateway PR 2:** konstanta kandidat key di gateway registrasi APD (`school_name` → `school_name`, `abroad_school_name`; `study_major` → `major`, `school_major`; `student_identity_number` → `student_identity_number`). Baca key pertama yang ada di `education_info` user, tulis kembali ke key yang sama, mengikuti pola decode/merge/encode `AsahGateway::updateParticipantFinalData`. Key yang tidak ada berarti field read-only.

**Catatan untuk nanti:** Asah memakai `study_major` (perlu ditambah ke kandidat saat campaign Asah memakai APD revamp). Pijak: `other_requirements.institution` atau `education_info.last_education_institution`, tergantung `is_currently_studying`.


## Lanjutan PR 2 (2026-11-25): Program User ID masuk, sisanya menyusul

**Program User ID ditambahkan ke edit** (Krisna, 2026-11-25). Aturannya sama dengan import CSV (`ParticipantImport::resolveProgramUserId`): kosong ke X boleh, X ke Y ditolak (`PROGRAM_USER_ID_ALREADY_SET`), dan ID yang sudah dipakai peserta lain di campaign yang sama ditolak (`PROGRAM_USER_ID_ALREADY_USED`). Di dialog: input kalau masih kosong, read-only kalau sudah terisi. Ini memperjelas L2: "tidak boleh diubah" berarti X ke Y.

**Menyusul, PR terpisah setelah dependensinya merge:**
- **Learning path (kosong ke X saja):** menunggu stack #6494 → #6495 → `participant-learning-path-*` (kolom learning path peserta dan `LEARNING_PATH_ALREADY_SET` belum ada di master). Satu PR kecil yang menambah pilihan learning path campaign di dialog edit.
- **Lecturer/supervisor:** menunggu jalur masuk lecturer dari Alfian.
- **Profil onboarding (nama, WA):** menunggu tabel `academic_program_dashboard_student_profiles` dari Alfian di-merge. Read-only dengan alasan "Onboarding not completed yet" kalau row belum ada.

**Data lokal untuk cek browser (2026-11-25):** 4 peserta `aicamp_2026` (`scholarship_participants` 166-169, user 12-15) diisi `education_info` fiktif yang eligible offering: S1 dan D3 (`major`), dua SMK (`school_major`, NISN). `other_requirements` hanya `is_indonesian_citizen`, `current_country`, `timezone`.


## Uji skenario edit (2026-11-25)

Diuji lewat PUT sungguhan dari halaman Students `aicamp_2026` lokal (CSRF + header Inertia), lalu dicek di DB.

**Lolos:**

| Skenario | Hasil |
| --- | --- |
| Program User ID dipakai peserta lain di campaign | Ditolak `PROGRAM_USER_ID_ALREADY_USED` |
| Mengganti Program User ID yang sudah terisi | Ditolak `PROGRAM_USER_ID_ALREADY_SET` |
| Isi Program User ID kosong + ganti Major SMK | Tersimpan, key lain `education_info` tetap |
| Kategori dari campaign lain (Pijak) | Ditolak `CATEGORY_NOT_IN_CAMPAIGN` |
| Kategori tidak dikirim | Ditolak validasi |
| Program User ID atau Major > 255 karakter | Ditolak validasi |
| Key registrasi di luar whitelist (`gpa`) | Ditolak `REGISTRATION_FIELD_NOT_AVAILABLE` |
| Peserta program lain lewat URL AI Camp, ID tidak ada | Ditolak `PARTICIPANT_NOT_FOUND` |
| UI: Program User ID kosong bisa diisi, terisi jadi read-only | Sesuai |

**Bug ditemukan:**
1. Program User ID tidak di-trim di server (import CSV trim di `ParticipantImportRow`). `"   "` tersimpan dan mengunci peserta (`ALREADY_SET`). Dari UI aman karena frontend trim.
2. Field registrasi bisa dikosongkan: menghapus isi School di UI lalu Save menyimpan `school_name: ""`. Spasi saja juga diterima.
3. Minor: label atribut validasi ("Study major", "Student identity number") beda dengan label UI ("Major", "Student ID number").

**Perbaikan (Krisna setuju):** aggregate trim Program User ID (kosong = tidak diubah, sama dengan import) dan nilai registrasi; spec `registration_fields.*` jadi `sometimes|filled|string|max:255`; frontend mewajibkan field registrasi yang tampil; label atribut disamakan dengan UI. Dilipat ke commit asal (branch belum di-push).

Catatan teknis uji: `fetch` dengan `redirect: 'follow'` pada PUT membuat error flash tampak kosong; pakai `redirect: 'manual'` lalu GET halaman untuk membaca `props.errors`.


## Perbaikan dialog dan preflight (2026-11-25)

### Dua masalah kecil di dialog, sudah beres
- `?participant_id` tertinggal di URL: `router.reload` sekarang memakai `preserveUrl: true`. Percobaan pertama dengan `router.replace` gagal, karena Inertia melewati `replaceState` kalau page tujuan sama dengan state history saat ini (dialog dibuka kedua kali).
- Spinner muncul saat dialog menutup: data peserta disimpan di state hook (diisi dari `onSuccess` reload), lalu dibuka/tutup lewat `isEditOpen`. Props tidak dibaca langsung lagi, karena redirect back setelah PUT menghapus optional prop.
- Catatan uji browser: di tab background animasi tertahan, jadi `[role=dialog]` yang sedang menutup masih ada di DOM dan membuat script salah membaca hasil. Untuk uji buka ulang, pakai klik MCP sungguhan.

### Preflight
- Risiko dari author, sama untuk kedua PR: "add capability to edit student campaign", level medium, review post-merge.
- PR domain `feature/apd/participant-edit-domain`, base master.
  - Commit yang direview: `fe3c38ac8af`. SHA final: `bc70a979775`.
  - Digest: `90a1859e9a5b3ba8a5adac62486c76ef6a21525048cec171e9abfe39a4d9bdb9`
- PR web `feature/apd/participant-edit`, base branch domain.
  - Commit yang direview: `5957c66`. SHA final: `1ac001ec372`.
  - Digest: `2d53515e270744410625ba870d8837dd1eca284e00ebcd0bf15558abc3caf59f`
- Report: `/tmp/claude-1000/pf-domain/report.json` dan `/tmp/claude-1000/pf-web/report.json`. Kalau `/tmp` terhapus, preflight harus diulang dari awal.
- Temuan reviewer dan penyelesaiannya:
  - Domain S1 (should-fix, diperbaiki atas pilihan author): Program User ID dikirim dua kali. Sekarang hanya lewat `createAggregate()`, lalu diteruskan ke constructor bersama id pemiliknya. `update(categoryId, registrationFields)` tidak lagi menerimanya.
  - Domain S2 ditolak: `toArray()` dipakai di PR web.
  - Domain S3 ditolak: event dipakai bersama oleh import dan edit, jadi bentuk payload-nya sama.
  - Web R1 (should-fix, diperbaiki atas pilihan author): update action memakai `lock()` dengan pesan `PARTICIPANT_UPDATE.IN_PROGRESS`.
  - Web R2: shape `@return` dilengkapi `programUserId`.
  - Web R3 dan S2: nilai form edit dan opsi kategori sekarang dibentuk di `normalizers/student.ts`.
  - Web S1: prop `registration` diisi `null`, tidak lagi `undefined`.
- Penting soal R1: kunci `lock()` dibuat dari nama class Specification ditambah programCode. Akibatnya yang dicegah hanya dua edit bersamaan. Race antara edit dan create atau import tetap ada, karena DB hanya punya unique index pada `(program_user_id, user_id, program_code)`.
- Riwayat branch web: domain di-merge (`ad51354`), tidak di-rebase, supaya hasil review tetap berlaku.
- Checks di SHA final: lulus semua.
  - Domain: psalm 6 file, unit 33 test.
  - Web: psalm 4 file, integration 11, unit 33, vitest 29, eslint, build. tsc tidak menemukan error di file yang diubah.

### Status
- **PR Domain ([#6534](https://github.com/dicoding-dev/dicoding/pull/6534)) open (2026-11-27):** `feature/apd/participant-edit-domain`, HEAD `9e7b50c1c01` (perbaikan R1 `EMPTY_REGISTRATION_FIELD`), risk medium (`post-merge`). Report preflight: `preflight-reports/edit-domain-report.json`.
- **PR Web (`feature/apd/participant-edit`) belum di-push:** perlu merge `feature/apd/participant-edit-domain` (`9e7b50c1c01`) ke dalamnya lalu preflight & ack ulang sebelum push/create PR.


## Card Withdraw/Terminated (dipindah)

Catatan implementasi, keputusan teknis (`K-W1`–`K-W9`), dan hasil preflight untuk branch `feature/apd/participant-dropout-domain` serta `feature/apd/participant-dropout` telah dipindahkan ke note terpisah: [[Projects/APD Revamp/Cycle 2/09-ops-withdraws-terminates-participants]] ([09-ops-withdraws-terminates-participants](09-ops-withdraws-terminates-participants.md)).
