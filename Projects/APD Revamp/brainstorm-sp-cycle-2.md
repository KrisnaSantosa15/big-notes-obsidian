---
date: 2026-11-17
updated: 2026-11-17
type: plan
tags: [plan, brainstorm, estimation, dicoding, apd]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Revamp APD: Brainstorm SP Card Cycle-2 Krisna

Hasil brainstorm estimasi SP untuk card Revamp APD milik Krisna yang masih di Planning. Lanjutan dari [implementation-backlog.md](implementation-backlog.md). Dokumen ini referensi hidup: keputusan boleh diubah, tulis tanggal dan alasannya di kolom keputusan.

## Aturan estimasi

- 1 SP kira-kira 3 jam, 2 SP kira-kira 1 hari kerja. Card di atas 7-8 SP dipecah.
- SP menghitung waktu coding dan waktu memperbaiki hasil review. Lama menunggu review tidak dihitung.
- Kalibrasi dari card sebelumnya (hari dengan commit, termasuk review dan rebase): card [3] add participants 3 SP selesai sekitar 5 hari, card [4] map Lecturers 4 SP selesai sekitar 8 hari (9 PR). Estimasi lama terlalu kecil, jadi pecah card yang lintas domain + web + CSV.
- Skala Krisna lebih kecil dari hitungan jam Claude: autocomplete yang dihitung sekitar 5,5 jam disepakati 1 SP.

## Ringkasan

| Card | SP | Status brainstorm |
| --- | --- | --- |
| [Email autocomplete in the add-participant form](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257720) | 1 | Selesai |
| [Ops edits a campaign participant](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711) | 4 | Selesai. Edit kategori, periode akses, Program User ID, dan learning path. Keluarkan peserta = `exit_reason` + `accessible_until` + dropout MCT. Daftar field final (P2) diputuskan bersama tim. Bergantung ke card Course progress (tabel learning path) |
| [Map Facilitators to the groups they accompany](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894512) | 2 | Selesai |
| [Ops manages Students' progress status](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257815) | 2 | Selesai. Kalkulasi otomatis. Kolom status dan course "x/y lulus" di daftar peserta admin. AC card perlu ditulis ulang |
| [Course progress is calculated automatically from Dicoding learning data](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257784) | 5 (ditetapkan Krisna) | Selesai. Setup learning path dan course, `learning_path_id` peserta, pemetaan auto-enroll termasuk TODO kategori [6], NEED RENEW, dan freeze. Estimasi Claude 5,5 (lihat bagian 5). Dikerjakan paling awal |
| [Facilitator see the progress of their supervised Students](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765) | 2 (draft) | Di-hold sampai semua dependensi selesai (P16-P19). SP belum diisi di judul card |
| [Admin manages important links](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257862) | 4 | Selesai |
| [Students see important links](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257869) | 2 | Selesai. Terblokir kerangka halaman Student (card Hasbi) dan TODO kategori (masuk card Course progress) |
| **Total** | **22** | Termasuk card Fasilitator (draft) |

SP di judul card Basecamp sudah disamakan dengan tabel ini (2026-11-18), kecuali card Fasilitator yang belum diisi.

### Perubahan assignee (2026-11-17)

- Krisna sempat mengambil card progress status dan melepas [Facilitator see the progress of their supervised Students](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765). Belakangan card Fasilitator **kembali ke Krisna**, jadi Krisna memegang keduanya (8 card aktif Cycle-2, ditambah Map Lecturers In Review).
- Kolom per 2026-11-18: semua card Cycle-2 Krisna di Exploring, kecuali card Fasilitator yang masih di Planning. Map Lecturers di In Review.
- Ketergantungan card Fasilitator yang masih terbuka: [Students see their learning progress in APD](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257746) dan [Ops manages Students' attendance data](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257792), keduanya belum ada assignee. Detail Student di view Fasilitator memakai komponen tampilan Student, jadi card tampilan Student sebaiknya dipegang Krisna juga atau dikerjakan lebih dulu.
- Sumber data card Fasilitator sebagian besar milik Krisna sendiri: course progress (bagian 5), status (bagian 4), dan mapping Fasilitator (C4, C8).

### Keputusan yang menunggu jawaban

Diperbarui 2026-11-18.

| # | Pertanyaan | Bagian | Status |
| --- | --- | --- | --- |
| Q1 | Definisi LB | 4 | ✅ Rumus Ops cukup |
| Q2 | Kelas yang dihitung lulus | 4, 5 | ✅ Course learning path program yang selesai atau di-renew dalam periode |
| Q3 | Status di luar periode | 4 | ✅ Dibekukan setelah `close_at`. Progress sebelum program hanya terhitung kalau < 100% |
| Q4 | Peserta yang dikeluarkan di daftar admin dan Fasilitator | 2, 4, 8 | ✅ Tetap tampil, label "Inactive" |
| Q5 | Filter periode dan NEED RENEW | 5 | ✅ Masuk card Course progress |
| Q6 | Pengakhiran token MCT | 2 | ✅ Dropout penuh. "ENDED saja" tidak mencabut akses kelas |
| Q7 | Pecah card Course progress? | 5 | ✅ Tidak dipecah, SP 5 |
| Q8 | Membedakan Withdraw dan Terminated | 2 | ✅ Kolom `exit_reason`, tanpa fitur pulihkan |
| P2 | Field registrasi free text | 2 | ✅ Tafsiran B. **Daftar field final diputuskan bersama tim** |
| P3 | Program User ID di CSV import | 2 | ✅ Boleh menimpa |
| P4 | `close_at` diedit tidak mengubah `accessible_until` | 2 | Ditunda, di luar card |
| G7 | TODO kategori card [6] | 7 | ✅ Ikut card Course progress |
| G8 | Saklar fitur important links | 7 | ✅ Cukup `importantLinks` |
| P16-P19 | Pertanyaan card Fasilitator | 8 | Ditunda |

**Untuk diskusi tim dan koordinasi:**
- P2: field yang bisa diedit di card Ops edits.
- P4: ke Ops.
- K20 gugur: infokan ke Hasbi.
- Minggu acuan dihitung otomatis dari `open_at`: infokan ke Ops.
- Konfirmasi ke Ops bahwa token "ended" saat withdraw/terminated = halaman dropout MCT.
- Apakah ada kasus Student pindah learning path di tengah program (komentar Krisna di card Ops edits)?

**AC card yang belum sesuai keputusan:** Progress status, Course progress, Ops edits, Students see important links (G8), dan Map Facilitators (C4 dipindah ke card Fasilitator).

Keputusan lain 2026-11-18: K20 gugur. Learning path disimpan di tabel baru per campaign, dan `learning_path_id` disimpan di access list. Setup course memakai combobox tanpa kolom `order`. Detail di bagian 2 dan 5.


### Peta dependensi (2026-11-18)

Pembaruan assignee: [Students see their learning progress in APD](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257746) dan [Ops manages Students' attendance data](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257792) sekarang dipegang **Hasbi** (sebelumnya tanpa assignee). Keduanya masih di Planning.

| Card Krisna | Bergantung ke | Pemilik | Status | Sifat |
| --- | --- | --- | --- | --- |
| Email autocomplete (1) | - | - | - | Mandiri. Form tambah peserta (card [3]) sudah Done |
| Map Facilitators (2) | - | - | - | Mandiri. `ContributorCreation` sudah ada di master, jadi Fasilitator sudah bisa ditambahkan ke campaign walaupun card Alfian (10411894097) masih In progress. Kabari Alfian karena filter role di kode grup miliknya diubah. Koordinasi C3 dengan schedule Ikhlas |
| Course progress (5) | - | - | - | Mandiri. Card [6] (auto-register) dan kategori campaign sudah Done. Card ini jadi blocker card lain |
| Admin manages important links (4) | - | - | - | Mandiri. Pengaturan campaign dan kategori sudah Done |
| Ops edits participant (4) | Course progress | Krisna | Exploring | Blocker milik sendiri (pilihan learning path) |
| Progress status (2) | Course progress | Krisna | Exploring | Blocker milik sendiri (tabel learning path, `target_week`, query kelulusan) |
| Students see important links (2) | [User can Access APD based on their Role](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894672) | Hasbi | Planning | Blocker (kerangka halaman Student/Fasilitator) |
| | Admin manages important links | Krisna | Exploring | Blocker milik sendiri |
| | Course progress (TODO kategori [6]) | Krisna | Exploring | Blocker untuk Student auto-register |
| | Pembaca saklar fitur campaign | Belum jelas (kemungkinan Hasbi) | Belum ada | Koordinasi |
| Facilitator see progress (2, hold) | User can Access APD based on their Role (10411894672) | Hasbi | Planning | Blocker |
| | Students see their learning progress in APD (10493257746) | Hasbi | Planning | Blocker (komponen detail) |
| | Map Facilitators, Course progress, Progress status | Krisna | Exploring | Blocker milik sendiri |
| | [Ops manages Students' attendance data](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257792) | Hasbi | Planning | Isi detail |
| | [Ops manages Students' assignment data](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257805) | Alfian | Exploring | Isi detail |
| | [Ops manages point histories from the campaign admin](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257825) | Alfian | Exploring | Isi detail |

Urutan kerja: (1) card mandiri: Course progress, Email autocomplete, Map Facilitators, Admin important links. (2) Ops edits dan Progress status setelah Course progress. (3) Students see important links setelah kerangka Hasbi ada. (4) Card Fasilitator paling akhir.

## 1. Email autocomplete in the add-participant form (1 SP)

### Kondisi kode saat ini

- Field email di `participant-create-dialog.tsx` masih `<Input type="email">` biasa.
- Combobox (`components/base/combobox`) di APD baru dipakai form schedule (`schedule-create/components/combobox-field`). Item dimuat lengkap dari server lalu difilter di browser, tidak cocok untuk akun Dicoding yang jumlahnya jutaan.
- Acuan search ke server: `AcademicProgramDashboardLecturerShowAction` memakai `inertia()->optional()` untuk `availableStudents`, frontend memanggil `router.reload({ only: ['availableStudents'], data: { student_search } })`, dibatasi `AVAILABLE_STUDENT_LIMIT`.
- `UserSearchAction` + `UserSearchGatewayDB::getByEmail()` tidak dipakai: tanpa limit dan ikut mengirim `headline`, `company`, `unsubscribe_link`, `point`, `xp`, sehingga melanggar AC "hanya nama dan email".
- `users.email` punya index unique, jadi `LIKE 'q%'` memakai index sedangkan `LIKE '%q%'` scan seluruh tabel.

### Keputusan

| # | Keputusan | Tanggal |
| --- | --- | --- |
| A1 | Data diambil lewat Inertia partial reload: prop `accountSuggestions` di action halaman participants dengan `inertia()->optional()`, tanpa route baru. Akses Admin dijaga filter `admin` yang sudah ada. Pakai `preserveUrl` agar query search tidak masuk URL | 2026-11-17 |
| A2 | Pencocokan hanya dari awal email (`users.email LIKE 'q%'`), minimal 3 karakter, limit 10, lewat koneksi replica. Select hanya `id`, `name`, `email` | 2026-11-17 |
| A3 | Akun yang sudah terdaftar di campaign tetap tampil di hasil, ditandai "Sudah terdaftar" dan tidak bisa dipilih. Tidak disembunyikan, supaya Ops tahu alasan akun itu tidak bisa ditambahkan (komentar Krisna di card) | 2026-11-17 |
| A4 | Penanda "Sudah terdaftar" berlaku untuk semua role di campaign itu (`LEFT JOIN` access list), karena email yang terdaftar dengan role lain juga ditolak (K25) | 2026-11-17 |
| A5 | Scope hanya dialog tambah Student, bukan form tambah staff | 2026-11-17 |
| A6 | Frontend: Combobox async dengan debounce sekitar 300 ms, opsi menampilkan nama dan email, email hanya bisa diisi dengan memilih opsi | 2026-11-17 |

### Test

- Integration test query (K34): hasil cocok dari awal email, akun terdaftar ditandai, limit dipatuhi.
- Vitest dialog: debounce, opsi terdaftar disabled, memilih opsi mengisi email.

## 2. Ops edits a campaign participant (4 SP, draft)

### Kondisi kode saat ini

- Aturan update peserta sudah ada di `ParticipantImport::update()` (kategori, Student ID, event `ParticipantWasUpdated`). K27: edit satu peserta memakai aturan yang sama.
- `accessible_from`/`accessible_until` diisi otomatis dari `open_at`/`close_at` campaign saat peserta didaftarkan lewat semua jalur (listener, sync, tambah manual, CSV), lihat K7 dan `ParticipantImport.php:228`. Gate akses sudah memfilter `accessible_until > NOW()` (`AcademicProgramDashboardAccessListGateway.php:278`).
- Halaman Students belum punya aksi per baris dan belum menampilkan periode akses.
- Semua FK ke access list (`group_members`, `supervised_students`, `session_participants`, `session_facilitators`) memakai `onDelete('cascade')`. Access list tidak punya soft delete. Hard delete menghapus keanggotaan grup, mapping Lecturer, dan riwayat sesi.
- Status WITHDRAW ada di card lain, [Ops manages Students' progress status](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257815) (Epic-3, belum ada assignee): status progress AS, IS, LB, NSA, WITHDRAW, dan "Student tetap perlu melihat status ini".
- Export daily check-in ke Firestore (`DailyCheckInFirestoreRouter.php:62`, dokumen per `program_user_id`) hanya jalan untuk program di config `daily_check_ins.projects`, yaitu program APD lama.

### Keputusan

| # | Keputusan | Tanggal |
| --- | --- | --- |
| B1 | CSV import tidak ditambah kolom `accessible_from`/`accessible_until`. Nilainya otomatis dari periode campaign saat peserta didaftarkan. Perubahan per orang lewat aksi edit per baris dari card ini. Kolom CSV baru dibuat kalau Ops meminta perpanjangan massal | 2026-11-17 |
| B2 | Field yang bisa diedit: kategori, `accessible_from`, `accessible_until`, dan Program User ID. Email dan akun Dicoding tidak bisa diedit | 2026-11-17 |
| B3 | Program User ID boleh ditimpa, karena AC card menyebut "Mengubah Program User ID". Larangan K24 berasal dari APD lama (id dokumen Firestore dan token login lama) dan tidak berlaku untuk revamp (tanpa migrasi data, export Firestore hanya untuk program lama). Keunikan tetap dijaga: Student ID yang sama tidak boleh dipakai dua peserta di campaign yang sama (`PROGRAM_USER_ID_ALREADY_USED`) | 2026-11-17 |
| B4 | Aggregate edit dan keluarkan dibuat tanpa cek role: hanya cek admin dan baris milik campaign tersebut. Field yang diedit berlaku sama untuk semua role di access list. UI hanya dipasang di halaman Students dulu; halaman staff nanti tinggal memakai endpoint yang sama | 2026-11-17 |
| B5 | Validasi periode akses hanya `accessible_from < accessible_until`. Boleh di luar `open_at`-`close_at` campaign, karena perpanjangan melewati periode campaign pernah dibutuhkan di APD lama (`UpdateAcademicProgramDashboardAccessibleUntil`) | 2026-11-17 |
| B6 | **Belum diputuskan, perlu diskusi.** Arti "mengeluarkan peserta" dan bedanya dengan withdraw, lihat bagian pertanyaan terbuka | 2026-11-17 |

### Pertanyaan terbuka

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

### Rincian SP (draft)

| Bagian | Isi | SP |
| --- | --- | --- |
| Edit | Aggregate update (pakai aturan import, B3, B5), `PATCH`, menu aksi per baris di halaman Students, dialog edit (kategori, dua tanggal, Program User ID), test | 2 |
| Keluarkan | Bergantung P1. Kalau hard delete: aggregate removal, `DELETE`, dialog konfirmasi cascade, test | 1 |
| Longgarkan K24 di CSV (opsional, P3) | Hapus cek `PROGRAM_USER_ID_ALREADY_SET`, sesuaikan test | 0,5 |
| **Total** | | **3** (3,5 kalau P3 ikut). Bisa berubah kalau P1 memutuskan kolom status |


### Pembaruan 2026-11-17 (komentar card dan jawaban Ops)

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


### Q6: pengakhiran token MCT (dicek 2026-11-18)

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


### Keputusan 2026-11-18

| # | Keputusan |
| --- | --- |
| Q6 | **Dropout penuh** (Krisna). Panggil `MultiCourseTokenDropoutSpecification` yang sudah ada: token ENDED, dan enrollment course di-drop kalau tidak ada token aktif lain |
| Q4 | Peserta yang dikeluarkan **tetap tampil dengan label "Inactive"** di daftar admin dan Fasilitator (Krisna) |
| P3 | **Boleh menimpa Program User ID di CSV import juga**, karena AC menyebut mengubah Program User ID (Krisna). Aturan CSV disamakan dengan edit per baris (K27), +0,5 SP |
| P4 | Ditunda, di luar card (Krisna) |
| Baru | **Learning path peserta bisa diedit** dari form edit (Krisna), menyusul K20 gugur. Pilihan diambil dari learning path campaign (bagian 5) |

### Terjawab (Q8): membedakan Withdraw dan Terminated (2026-11-18)

Kalau hanya memakai `accessible_until = now()`, sistem tidak bisa membedakan Withdraw dan Terminated, dan juga tidak bisa membedakan peserta yang dikeluarkan dari peserta yang aksesnya habis karena program selesai.

Usulan Claude: kolom baru di access list.
- `exit_reason`: string(16) nullable, enum `WITHDRAWN` atau `TERMINATED`.
- Label "Inactive (Withdrawn)" atau "Inactive (Terminated)" diambil dari `exit_reason`, bukan dari perbandingan tanggal.
- Akses tetap dicabut lewat `accessible_until`, jadi 8 pembaca access list di APD lama tidak perlu filter tambahan. Kolom ini hanya informasi.
- Dialog "Keluarkan peserta": pilih alasan (Withdraw atau Terminated), lalu konfirmasi bahwa token MCT akan di-dropout.
- Audit cukup memakai `updated_by` dan `updated_at` access list kalau sudah ada. Kalau belum, perlu dicek.

Alternatif yang ditolak: tabel riwayat terpisah (`participant_exits`). Riwayat lebih lengkap, tapi YAGNI untuk sekarang.

Pertanyaan turunan: perlu fitur **memulihkan** peserta yang sudah dikeluarkan? Dropout MCT tidak bisa dibatalkan (enrollment sudah di-drop), jadi pemulihan berarti Ops harus memberi token baru. Usulan: tidak ada tombol pulihkan di card ini.

### Terjawab sebagian (P2): field registrasi free text (2026-11-18)

Temuan:
- Data registrasi program ada di `scholarship_participants`. Kolom tetapnya `category`, `knows_from`, `disabilities`, dan `scholarship_package_id`.
- Field teks bebas (institusi, jurusan, NIM, dan sejenisnya) disimpan sebagai JSON di `education_info` dan `other_requirements`.
- Bentuk JSON tersebut **berbeda per program**: CodingCamp, IBM, Elevate, Pijak, dan Mastercard masing-masing punya ViewModel registrasi sendiri.

Dua tafsiran komentar Hasbi:
- **A.** Ops bisa mengedit data registrasi free text (institusi, jurusan, dan sejenisnya) dari APD. Konsekuensinya: form per program mengikuti bentuk JSON masing-masing, menyentuh data milik fitur registrasi, dan menambah sekitar 2 SP atau lebih. APD revamp juga belum menampilkan data ini.
- **B.** Di antara field APD, fokus ke field yang dulu diisi sebagai teks bebas sehingga rawan salah ketik, terutama Program User ID. Kategori dan learning path dipilih dari daftar, tapi tetap bisa diedit sesuai AC.

Usulan Claude: B, lalu konfirmasi ke Hasbi.


### Keputusan lanjutan 2026-11-18

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


### Pengecekan MCT, APD lama, dan sheet (2026-11-18)

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


### Komentar Krisna di card (2026-11-18)

- 04:31: perlu diputuskan field apa saja yang bisa diedit.
- 04:48: karena harus ada learning path, card ini **bergantung ke card Course progress** (tabel learning path campaign). Apakah ada kasus Student pindah learning path? Pernah terdengar, tapi belum jelas apakah ditangani tim Ops.
- 06:07: harapan field yang bisa diubah: Kategori, Program User ID, Status Peserta (Withdraw/Terminated), Learning Path(?), field free text.
- 07:10: SP bisa 2-4 tergantung dependensinya, khususnya learning path. Judul card diisi 4.

Ketergantungan baru: **Course progress (bagian 5) harus selesai lebih dulu**, karena pilihan learning path di form edit membaca tabel learning path campaign.

## 3. Map Facilitators to the groups they accompany (2 SP)

### Kondisi kode saat ini

- APD lama: Fasilitator (`MENTOR`) punya field `groups: string[]` yang sama dengan Student (`hosting/src/data/datasources/firestore/users.ts:101` `getMentorByGroup`). Mapping Fasilitator ke grup adalah keanggotaan grup biasa.
- Pivot `academic_program_dashboard_campaign_group_members` (`access_list_id`, `group_id`, unique pasangan) tidak membatasi role.
- Schedule (Ikhlas) sudah membaca Fasilitator dari `group_members` dengan `role = FACILITATOR`: `AcademicProgramDashboardSessionScheduleGateway::getFacilitatorIdsByGroupIds()` dan `getFacilitatorOptionsByProgramCodeAndCampaignId()`.
- Fasilitator sudah bisa ditambahkan ke campaign lewat `ContributorCreation` (Alfian, `/{program_code}/contributors`).
- Semua jalur tulis grup hanya menerima STUDENT lewat `AcademicProgramDashboardCampaignGroupMemberGateway::campaignStudents()`:
  - kandidat dialog tambah peserta: `getStudentCandidatesByGroup()`
  - roster: `CampaignGroupRosterFactory` memakai `getStudentAccessListIds()`
  - CSV anggota grup: `CampaignGroupMemberCsvAssignmentSpecification` memakai `getStudentAccessListIdsByIdentifier()` (identifier `email` atau `user_id`)
- Aggregate `ParticipantGroupAssignment` tidak mengecek role. Penolakan per item ada di `CampaignGroupRoster::rejectionReason()` (`PARTICIPANT_NOT_IN_CAMPAIGN`, `NO_GROUPS`, `GROUP_NOT_IN_CAMPAIGN`).
- `getGroupMembers()` tidak memfilter role, jadi Fasilitator akan tampil sebagai anggota biasa tanpa label.
- Satu Student boleh di lebih dari satu grup: PRD US-1.3 ("satu pengguna dapat tergabung dalam satu grup atau lebih"), pivot `group_members` (K20, Q6), dan `CampaignGroupRoster` tidak punya aturan satu grup. Student APD lama juga menyimpan `groups` sebagai array.
- Lock di APD: `useCase->lock` hanya dipakai jalur yang menulis ke access list (tambah manual, import CSV, sync, tambah contributor), karena access list tidak punya unique key (K14). Jalur grup dan mapping Lecturer (`GroupMemberStore`, `GroupMemberCsvStore`, `GroupMemberDestroy`, `SupervisedStudentStore`, `SupervisedStudentDestroy`) memakai `useCase->run` tanpa lock dan mengandalkan unique key tabel.

### Keputusan

| # | Keputusan | Tanggal |
| --- | --- | --- |
| C1 | Mapping memakai `group_members`: Fasilitator menjadi anggota grup. Tanpa tabel baru dan tanpa migration. Student yang pindah grup otomatis pindah Fasilitator | 2026-11-17 |
| C2 | UI di halaman grup > Atur peserta > Tambah peserta: kandidat juga memuat Fasilitator campaign (diberi badge Fasilitator). Tidak ada UI baru di halaman Contributors karena Fasilitator sudah bisa ditambahkan di sana | 2026-11-17 |
| C3 | Satu grup maksimal satu Fasilitator. Satu Fasilitator boleh mengelola banyak grup | 2026-11-17 |
| C4 | AC "Facilitators can only see Students in the groups they accompany" dipindah ke card [Facilitator see the progress of their supervised Students](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765). Card ini hanya mapping | 2026-11-17 |
| C5 | CSV mapping memakai CSV anggota grup yang sudah ada (per grup, identifier email atau user_id). Setelah filter role diganti, CSV otomatis menerima Fasilitator dan aturan C3 ikut berlaku lewat roster | 2026-11-17 |
| C6 | Ganti Fasilitator: lepas yang lama (hapus anggota yang sudah ada), lalu tambah yang baru. Tidak ada aksi replace | 2026-11-17 |
| C7 | Tanpa lock: `useCase->run`, mengikuti jalur grup dan mapping Lecturer. Risiko diterima: dua admin menambah Fasilitator berbeda ke grup yang sama di detik yang sama bisa lolos keduanya, karena aturan C3 tidak bisa dijaga unique key (role ada di tabel lain) | 2026-11-17 |
| C8 | Student di lebih dari satu grup (kasus merge grup) tidak diberi guard dan tidak diberi penanda grup utama di card ini. Daftar Student binaan Fasilitator = semua Student di grup yang ia dampingi, jadi Student hasil merge terlihat oleh Fasilitator grup lama dan grup baru. Kalau ternyata ini membuat Student masuk dua form feedback Fasilitator, penanda grup utama dibahas di card feedback, bukan dibuat sekarang | 2026-11-17 |
| C9 | Koordinasi dengan schedule (form schedule Ikhlas menerima lebih dari satu Fasilitator per grup) diurus terpisah, di luar card ini | 2026-11-17 |

### Rencana perubahan

| Bagian | Isi |
| --- | --- |
| Gateway | Filter `role = STUDENT` di kandidat, roster, dan CSV menjadi `role IN (STUDENT, FACILITATOR)`. Kandidat dan daftar anggota ikut mengirim `role` |
| Domain | `CampaignGroupRoster` diberi role tiap ID dan Fasilitator yang sudah ada per grup. `rejectionReason()` menolak `GROUP_ALREADY_HAS_FACILITATOR`, termasuk dua Fasilitator untuk grup yang sama dalam satu kiriman |
| UI | Badge Fasilitator di kandidat dan daftar anggota grup. Kandidat Fasilitator di-disable dengan alasan kalau grup sudah punya Fasilitator |
| Test | Unit roster dan aggregate (Fasilitator diterima, grup sudah punya Fasilitator, dua Fasilitator dalam satu kiriman), integration kandidat dan CSV, vitest badge |

### Rincian SP

| Bagian | SP |
| --- | --- |
| Gateway + UI badge + CSV (hanya filter dan tampilan) | 1 |
| Aturan satu Fasilitator per grup di roster + test | 1 |
| **Total** | **2** (1 kalau C3 ditunda) |

### Pertanyaan terbuka

- ~~**P5.** Student di beberapa grup bisa dibina dua Fasilitator.~~ Terjawab 2026-11-17 (C8): normalnya satu Student satu grup. Lebih dari satu grup hanya untuk kasus khusus, yaitu grup dengan sedikit Student dipindah atau di-merge ke grup lain, dan Student tetap tercatat di grup lama supaya datanya di grup lama masih bisa dilihat. Karena itu tidak ada guard satu grup.
- ~~**P6.** Konfirmasi C7 (tanpa lock).~~ Terjawab 2026-11-17: pakai `useCase->run`.

### Koordinasi

- **Alfian:** C1 dan C5 mengubah filter role di `AcademicProgramDashboardCampaignGroupMemberGateway` dan `CampaignGroupRosterFactory` (kode grup milik Alfian). Kabari sebelum mulai.
- **Ikhlas:** schedule sudah membaca Fasilitator dari `group_members` (`getFacilitatorIdsByGroupIds`, `getFacilitatorOptionsByProgramCodeAndCampaignId`). Pastikan aturan C3 (satu Fasilitator per grup) sejalan dengan form schedule, yang saat ini mendukung lebih dari satu Fasilitator per grup.
- Query yang memakai `group_members` untuk Student (misalnya `getGroupStudentsByCampaignIdAndGroupIds`) sudah memfilter `role = STUDENT`, jadi tidak terpengaruh. Query tanpa filter role (`getGroupMembers`) perlu ditinjau.


### Konfirmasi 2026-11-18

- **Tetap sebagai anggota grup** (C1) dan **tetap ditambahkan lewat "Tambah peserta" di halaman detail grup** (C2), kata Krisna. Usulan combobox Fasilitator per grup yang terpisah **ditolak**.
- Akibatnya CSV tetap memakai CSV anggota grup (C5), dan ganti Fasilitator tetap lewat lepas lalu tambah (C6).
- Ringkasan pekerjaan card (Krisna): UI kandidat Fasilitator di dialog Tambah peserta, guard (role FACILITATOR dan satu Fasilitator per grup), dan **kolom nama Fasilitator di tabel daftar grup**. Kolom ini tambahan ke "Rencana perubahan" bagian UI.
- **Pengecekan master (2026-11-18):** `ContributorCreation` (Store dan Index Action, serta test) sudah ada di `origin/master`, jadi Fasilitator sudah bisa ditambahkan ke campaign. Card Alfian [Add Facilitators, Lecturers, and Instructors to a campaign](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894097) masih In progress, tapi **bukan blocker** card ini.
- Jalur grup di master masih STUDENT-only (`AcademicProgramDashboardCampaignGroupMemberGateway::campaignStudents()`, filter `access_lists.role = STUDENT`). UI grup (`features/group-list`, `features/group-members`) belum menyebut Fasilitator. Ini yang diubah card ini.
- SP tetap **2**.

## 4. Ops manages Students' progress status (2 SP, draft, kalkulasi otomatis)

### Kondisi saat ini

- APD lama: sheet Tracker milik Ops (di luar folder kita), kolom "Verdict Progress", diimpor lewat IMPORTRANGE ke "[Prod] DBS 2026 B1 - Cohort Data Importer" (tab Token Data Sheet lalu tab Student Progress Status: `User ID`, `Student Progress`). Apps Script `syncStudentProgressStatus` mengubah kode ke label (AS, IS, LB, NSA, WITHDRAW) lalu menulis ke dokumen user Firestore.
- Token Data Sheet punya kolom terpisah "Withdraw ?" (U) dan "Terminated ?" (V). "Terminated" tidak dipakai di kode APD lama.
- APD lama menyembunyikan Withdraw dari tampilan Student sendiri (`StudentSidebar.vue:95`, `ProfileCard.vue:56`), tidak memblok akses. Member aktif capstone = semua status kecuali Withdraw (`SELECTABLE_ACTIVE_STATUS_VALUES`).
- Rumus verdict (dugaan dari Krisna, 2026-11-17, belum dikonfirmasi Ops): setiap learning path punya timeline mingguan dengan kolom "Target Ideal Jumlah Lulus Kelas" (kumulatif). Jumlah kelas lulus dibandingkan target minggu berjalan: lebih = AS, sama = IS, kurang = LB, jauh kurang = NSA. Withdraw keputusan Ops. Di Token Data Sheet, "Verdict Progress" bersebelahan dengan "Total Kelulusan" dan "Sisa Kelas".
- Komentar Hasbi di card: "konfirmasi perhitungan nilai progress status ke tim ops" dan "withdraw apakah akan berhubungan dengan status student".

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

### Pertanyaan ke Ops (dikirim Krisna 2026-11-17)

1. Cara Ops memberi verdict AS/IS/LB/NSA/Withdraw.
2. Ada rumus/otomasi sheet? Kalau ada: dihitung dari kelas lulus vs "Target Ideal Jumlah Lulus Kelas"? Ambang LB vs NSA? Kelas yang dihitung (matrikulasi ikut)? Dibandingkan sejak awal minggu atau setelah deadline? Frekuensi pembaruan?
3. Verdict hasil rumus pernah diubah manual?
4. Learning path Student selalu sama dengan kategori campaign?
5. Beda Withdraw dan Terminated? Masih boleh akses APD? Kalau tidak, datanya masih perlu terlihat di admin?

### Pertanyaan terbuka internal

- ~~P7. D1 tabel terpisah vs kolom di access list.~~ Gugur 2026-11-18: status dihitung otomatis, tidak disimpan.
- ~~P8. Ops perlu bisa mengosongkan status (kembali ke "-")?~~ Gugur 2026-11-18: tidak ada input manual.

### Rincian SP lama (usang, asumsi input manual)

| Bagian | SP |
| --- | --- |
| Migration, domain, gateway | 1 |
| Set satu per satu | 0,5 |
| CSV | 1 |
| Kolom dan filter | 0,5 |
| **Total** | **3** |


### Jawaban Ops (diterima 2026-11-17)

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

### Desain baru: status dihitung otomatis (usulan 2026-11-17)

Usulan input manual (D1-D9, CSV, audit) **tidak relevan lagi** karena Ops tidak pernah mengubah status secara manual.

**Data yang dibutuhkan rumus:**

| Kebutuhan | Sumber |
| --- | --- |
| Kelas yang sudah lulus beserta tanggalnya | `developer_journey_completions` (`user_id`, `journey_id`, `created_at`). Unique `(user_id, journey_id)` sudah di-drop, jadi renew menambah baris baru |
| Minggu berjalan | `academic_program_dashboard_campaigns.open_at` (wajib sejak migration `2026_10_23_100000`) |
| Learning path Student | K20: `access_list.user_id` + `program_id` ke `scholarship_participants.scholarship_package_id` |
| Course per learning path + target mingguan | **Belum ada.** Memakai tabel konfigurasi Course progress (bagian 5) ditambah kolom `target_week` |

**Tabel bersama (memperluas E1 di bagian 5):** `academic_program_dashboard_learning_path_courses` dengan kolom `campaign_id`, `scholarship_package_id`, `course_id`, `target_week`, dan audit.
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
- Withdraw dan Terminated **keluar dari card ini** dan ditangani card Ops edits participant (bagian 2). Student yang withdraw tidak bisa membuka APD, jadi label Withdraw di halaman Student tidak dibutuhkan.
- AC card masih menyebut input manual satu per satu dan CSV. Card Basecamp tidak diubah dari sini, Krisna yang menyesuaikan.

**Rincian SP (draft baru): 2 SP**

| Bagian | SP |
| --- | --- |
| Kalkulator status (domain murni + unit test kasus AS/IS/LB/NSA dan batas minggu) | 1 |
| Query lulus per Student secara batch + kolom dan filter status di daftar peserta admin | 0,5 |
| Integration test query | 0,5 |
| **Total** | **2** |

Konfigurasi `target_week` dihitung di card Course progress.

### Yang perlu diputuskan (2026-11-17)

- **Q1. Definisi LB.** Apakah `target(N-1) ≤ lulus < target(N)`? Contoh: target minggu lalu 3, minggu ini 5, lulus 4, maka LB. Perlu dicocokkan dengan rumus di link "Referensi perhitungan status progres".
- **Q2. Kelas yang dihitung lulus.** Hanya course di daftar learning path dan yang selesai dalam periode program (`open_at` sampai sekarang)? Sejalan dengan komentar Hasbi di card Course progress.
- **Q3. Status di luar periode.** Sebelum minggu ke-1 dan setelah `close_at`: dibekukan di minggu terakhir, atau tidak ditampilkan?
- **Q4. Peserta withdraw/terminated di daftar admin dan Fasilitator.** Label "Inactive" (dihitung dari `accessible_until` < `close_at`) atau disembunyikan?


### Keputusan 2026-11-18

- **Q1. Rumus: cukup (Krisna).** "Tertinggal X minggu" = minggu berjalan dikurangi minggu terakhir yang targetnya tercapai. Karena target kumulatif selalu naik, ini setara dengan tabel AS/IS/LB/NSA di atas. Contoh: target minggu 1-4 = 2, 4, 4, 6. Di minggu 4, lulus 4 = LB dan lulus 3 = NSA.
- **Detail teknis (ditetapkan Claude, belum ada keberatan):**
  - Minggu ke-1 dihitung sejak `open_at`, per blok 7 hari (bukan Senin kalender). Di minggu ke-1, status paling buruk LB karena target(0) = 0.
  - Di sheet, "minggu acuan" diperbarui manual oleh Ops (jawaban Ops no. 2). Di sistem, minggu acuan dihitung otomatis. Perlu diinformasikan ke Ops.
- **Q2 dan Q3:** lihat bagian 5, "Keputusan 2026-11-18". Kelas lulus = completion atau renew FINISHED dalam periode. Status dibekukan setelah `close_at`.
- `target_week` ada di `academic_program_dashboard_learning_path_courses` (bagian 5). Card ini bergantung ke card setup learning path (kalau jadi dipecah, Q7).


### Komentar Krisna di card (2026-11-18 05:56)

"Kalau memang progress status ini intinya membandingkan progress saat ini dan target mingguan, expected condition di card ini sudah tidak relevan." AC card (input manual satu per satu, CSV, audit) perlu ditulis ulang sesuai desain kalkulasi otomatis.

## 5. Course progress is calculated automatically from Dicoding learning data (5 SP)

### Kondisi saat ini

- APD lama: tab "Course Progress" (`User ID`, `CourseName`, `Progress Status` seperti 100.00%) disinkronkan `syncCourseProgress` ke Firebase, ditampilkan `CourseProgresses.vue`: progress bar per course (merah <35%, kuning <70%, hijau), 3 course pertama lalu bisa dibuka, teks "Last updated", course capstone dipisah lewat `capstoneProgress.courseName`.
- Progress bar halaman kelas Dicoding (`StudentOnCourseVM::getProgressPercentage`, `Dicoding/Web/VM/Academies/Index/StudentOnCourseVM.php:406`) = modul aktif selesai / total modul aktif, dibulatkan ke bawah. Sama persis dengan `CodingCampProgressiveCourseProgressChecker::getPercentages(userIds, courseId)` (batch).
- Pendaftaran AI Camp menyimpan `scholarship_participants.scholarship_package_id` (learning path) dan `category`. Config `scholarships.ai_camp.token_packages` memetakan id learning path ke `lp_name` dan `course_ids` (course token), per program di file config.
- Listener card [6] (`ParticipantEnrollmentSpecification`) masih mendaftarkan Student dengan `categoryId: null` dan TODO "map the registration category to the campaign category once that mapping exists". Event `ScholarshipCohortWasRegistered` hanya membawa `user_id` dan `program_id`.
- Capstone adalah Epic 7 di PRD (Fase 4), di luar card ini.

### Keputusan

Koreksi 2026-11-17 (Krisna): **kategori dan learning path berbeda.** Kategori = jenis Student (misalnya SMK, umum, guru SMK). Learning path = jalur belajar yang ditempuh Student (misalnya AI Engineer, Data Scientist). Daftar course mengikuti learning path, bukan kategori.

| # | Keputusan | Tanggal |
| --- | --- | --- |
| E1 | Konfigurasi course per campaign per **learning path**: `campaign_id`, `scholarship_package_id`, `course_id`, urutan. Dikelola Ops di admin campaign, pilihan learning path dari config program. Learning path tidak disimpan di access list (lihat P9) | 2026-11-17 |
| E2 | Rumus = progress bar halaman kelas (checker yang sudah ada). Tanpa aturan khusus "sudah lulus = 100%" | 2026-11-17 |
| E3 | Dihitung saat dibaca (real-time), query batch per course, tanpa disimpan dan tanpa cron | 2026-11-17 |
| E4 | Kolom progress di halaman Students admin (misalnya "x/y kelas selesai" plus detail per course). Tampilan untuk Student ada di card "Students see their learning progress in APD" | 2026-11-17 |
| E5 | Service juga menyediakan jumlah kelas lulus per Student, untuk card status otomatis nanti | 2026-11-17 |
| E6 | Capstone di luar scope (Epic 7) | 2026-11-17 |

### Pertanyaan terbuka

> Keputusan learning path sudah ada di [implementation-backlog.md](implementation-backlog.md): K3 dan K4 (kolom `learning_path` dan snapshot `lp_name`, dibatalkan) diganti K20 (2026-10-28): learning path dibaca saat dibutuhkan lewat `scholarship_participants.scholarship_package_id` dan lookup config. Card ini mengikuti K20.


- ~~P9. Sumber learning path peserta.~~ Terjawab 2026-11-17 dari komentar card [6] (Revamp APD Done):
  - Hasbi (2026-10-23): "learning path ini ganti2 setiap campaign dan namanya juga bisa beda2 makanya skrg ngambilnya dari config".
  - Krisna (2026-10-28): "untuk learning path jangan disimpan di access list, kalau butuh cukup join aja dengan tabel scholarship_participants lewat scholarship_package_id yang melakukan lookup ke config".
  - Commit terkait: `84534d215ca` (sempat menyimpan learning path di access list), lalu `82a8f118e97`, `35ffb230159`, `330bfa1974c` (dihapus lagi, 2026-10-28).
  - Akibatnya: tanpa kolom baru dan tanpa CRUD. Learning path Student = `access_list.user_id` + `program_id` campaign → `scholarship_participants.scholarship_package_id` → nama dari config program (`token_packages[id].lp_name`). E1 dikaitkan ke `scholarship_package_id`.
- P10. Peserta yang ditambah manual atau CSV (card [3]) dan tidak punya baris `scholarship_participants` tidak punya learning path, jadi course progress-nya kosong. Perlu dipastikan apakah kasus ini ada di campaign nyata.
- P11. Lookup config per program: daftar learning path di form konfigurasi course diambil dari config program campaign (misalnya `scholarships.ai_camp.token_packages`). Perlu dicek cara memetakan campaign ke kunci config programnya.

### Rincian SP (draft)

Rumus progress tidak perlu dibuat (E2, checker yang sudah ada, 0-100 per course). Pekerjaan utama card ini adalah menentukan **course apa saja** per learning path. Lihat bagian "Sumber daftar course" di bawah.

| Bagian | A1 (CSV) | A2 (form sederhana) | A3 (form lengkap) |
| --- | --- | --- | --- |
| Fitur setup course per learning path (migration, domain, gateway, UI, test) | 1 | 1,5 | 2 |
| Service baca (join learning path K20, ambil daftar course, `getPercentages()` batch) | 0,5 | 0,5 | 0,5 |
| Kolom progress di halaman Students admin (E4) | 0,5 | 0,5 | 0,5 |
| **Total** | **2** | **2,5** | **3** |

- Usulan Claude: **A1 = 2 SP**, atau 2,5 dengan buffer (kalibrasi card [3] dan [4]: pekerjaan lintas domain, web, dan CSV cenderung melebihi estimasi). Varian belum diputuskan Krisna (2026-11-17).
- Risiko membengkak: P11. Kalau cukup mendukung bentuk config AI Camp (`lp_name` + id), angka tetap. Kalau harus mendukung semua bentuk `token_packages`, tambah sekitar 0,5.

### Sumber daftar course (2026-11-17)

Temuan:

- `token_packages` di config program berisi course **tes seleksi** (koreksi Krisna), bukan course yang ditempuh Student. Config hanya dipakai untuk mengenali learning path (`scholarship_package_id`, `lp_name`, K20). Bentuk `token_packages` juga berbeda antarprogram (ada yang `lp_name` + `course_ids`, ada yang list id langsung, misalnya paket AWS di `config/scholarships.php:166`).
- APD lama tidak tahu course per peserta. Daftar course = baris yang disusun Ops di sheet olahan (tab "Course Progress": `User ID`, `CourseName`, `Progress`), disalin apa adanya oleh `syncCourseProgress`. Nama course hanya teks, bukan id course Dicoding.
- Dicoding punya katalog `learning_paths` + `learning_path_courses` (berurutan). Dulu `scholarship_participants.chosen_learning_path_id` FK ke katalog, lalu 2024 diganti nama menjadi `scholarship_package_id` dan FK dihapus. Menurut Krisna, learning path program biasanya berbeda dengan learning path katalog.

| Opsi | Cara kerja | Status |
| --- | --- | --- |
| A. Ops mengatur per learning path | Admin campaign: pilih learning path (dari `lp_name` config), tambah course, atur urutan | **Usulan.** Paling aman, sesuai AC "Ops menentukan course yang dihitung". Fitur baru di pengaturan campaign, tapi memang diminta AC |
| B. Dari token kelas Student | `multi_course_token_courses` milik token Student di program itu | Ditunda. Risiko: token seleksi dan token kelas bisa satu program, token bisa diberikan bertahap, Student bisa punya beberapa token |
| C. Dipetakan ke learning path katalog | Course dari `learning_path_courses` | **Gugur**: learning path program berbeda dengan katalog (Krisna, 2026-11-17) |
| D. Dari enrollment selama campaign | Semua course yang di-enroll dalam periode campaign | Gugur: course pribadi ikut tampil, course yang belum di-enroll tidak tampil |

Varian A:

| Varian | Bentuk | SP fitur setup |
| --- | --- | --- |
| A1. CSV saja | Unggah `learning_path, course_id, urutan` di pengaturan campaign, daftar tampil read-only. Unggah ulang menggantikan daftar learning path itu. Pola baris gagal seperti import lain | 1 |
| A2. Form sederhana | Tab "Courses": per learning path input id course (nama tampil setelah validasi), hapus, urutan berupa nomor | 1,5 |
| A3. Form lengkap | A2 + pencarian course (combobox) + drag-and-drop urutan | 2 |

Alasan usulan A1: setup jarang (sekali per campaign, sekitar 10 course per learning path) dan Ops biasanya menyusunnya dari timeline yang sudah berbentuk tabel. A2 bisa ditambah belakangan kalau Ops perlu edit satu per satu di tengah campaign.


### Pembaruan 2026-11-17 (komentar card dan keterkaitan dengan status)

**Komentar Hasbi (2026-11-16):**
- Progress hanya dihitung untuk aktivitas selama program berjalan. Filter ini dibantu dari sistem.
- Student yang sudah menyelesaikan course sebelum campaign dimulai dihitung **0%**, dan harus me-renew course agar dianggap selesai. Request dari Wintari Yasmin: tampilkan **NEED RENEW** (merah), lalu 100% hijau setelah renew selesai.
- Attendance, assignments, dan point histories kemungkinan tetap diisi manual (bukan card ini).

**Komentar Krisna (2026-11-17):** perhitungan progres berdasarkan learning path pendaftar, jadi sistem harus tahu course mana saja per learning path. Learning path diambil dari config (K20). Opsi: daftar course di config, atau Ops mengatur course per learning path saat setup campaign. Card ini saling terkait dengan card progress status, dan learning path kemungkinan perlu disimpan di DB (misalnya `campaign_learning_paths`).

**Usulan:** tabel konfigurasi opsi A (E1) diperluas dengan kolom `target_week` supaya dipakai juga oleh kalkulator status (bagian 4).
- Nama usulan: `academic_program_dashboard_learning_path_courses` (`campaign_id`, `scholarship_package_id`, `course_id`, `target_week`, audit).
- `target_week` menggantikan fungsi `order` untuk urutan tampilan (urut berdasarkan `target_week`, lalu id). Perlu dikonfirmasi apakah `order` terpisah masih dibutuhkan.
- Learning path tetap tidak disimpan di access list (K20). `scholarship_package_id` dipakai sebagai kunci learning path di tabel konfigurasi ini.

**Catatan teknis:**
- `developer_journey_completions.created_at` bisa dipakai untuk membedakan kelulusan sebelum dan selama periode program, termasuk kasus renew (baris baru).
- `CodingCampProgressiveCourseProgressChecker` menghitung modul selesai tanpa batas waktu. Persentase dalam periode program butuh filter tanggal pada data modul, dan ini belum dicek.

**Rincian SP (draft baru): 3 SP**

| Bagian | SP |
| --- | --- |
| Konfigurasi course per learning path di setup campaign (A1) | 2 |
| Kolom `target_week` di form dan tabel | 0,5 |
| Filter periode program + status NEED RENEW | 0,5 |
| **Total** | **3** |

**Yang perlu diputuskan:**
- **Q2.** Kelas yang dihitung lulus hanya course di daftar learning path dan yang selesai dalam periode program? (sama dengan Q2 bagian 4)
- **Q5.** Filter periode program dan NEED RENEW masuk card ini atau ditunda? Kalau ditunda, SP turun ke 2,5.


### Keputusan 2026-11-18 (learning path, course, renew, freeze)

**Kelas yang dihitung (Q2, Krisna):** course dari learning path program yang selesai selama program. Kalau course sudah 100% atau sertifikatnya sudah dicetak sebelum program, Student perlu **renew certificate**. Fitur renew sudah ada di Dicoding.

**Mekanisme renew di Dicoding (dicek 2026-11-18):**
- Renew dicatat di `course_certificate_renewals` (`student_id`, `course_id`, `status`, `finished_at`). Selesai = status FINISHED. Lihat `CourseCertificateRenewalGateway::setAsRenewed`.
- Renew **tidak menambah baris** di `developer_journey_completions`. `MultiCourseTokensGateway` membaca `completions.updated_at` sebagai `renewed_at`.

**Aturan progress per course (Q3 dan Q5, Krisna):**

| Kondisi course di learning path | Progress | Dihitung lulus untuk status? |
| --- | --- | --- |
| Completion di antara `open_at` dan `close_at` | 100% | Ya |
| Completion sebelum `open_at`, lalu renew FINISHED dalam periode | 100% | Ya |
| Completion sebelum `open_at`, belum renew | **NEED RENEW** (merah) | Tidak |
| Belum selesai | % modul dari penghitung yang sudah ada. Modul yang dikerjakan sebelum program tetap terhitung | Tidak |

- Filter tanggal per modul **tidak perlu**. Cukup cek tanggal di completion dan renewal.
- **Freeze (Krisna: ya):** setelah `close_at`, progress dan status dibekukan di kondisi `close_at`. Kelulusan sesudahnya tidak mengubah apa pun. `open_at` dan `close_at` diambil dari tabel `academic_program_dashboard_campaigns`.
- Q5: filter periode dan NEED RENEW **masuk card ini**.

**Setup course (Krisna):** dilakukan di setup campaign dengan input manual. Per learning path, Ops memilih course lewat **combobox** dan mengisi `target_week`. Tidak ada CSV dan tidak ada drag and drop.

**Kolom `order`: tidak dipakai (Krisna).** E1 lama (yang menyertakan `order`) diganti. Urutan tampil = `target_week`, lalu nama course. Perhitungan status hanya butuh `target_week`, karena yang dihitung adalah jumlah kelas lulus.

**Learning path disimpan di tabel baru per campaign (Krisna). K20 gugur:**
- K20 (2026-10-28) melarang learning path disimpan di access list, karena nama learning path berganti per campaign dan diambil dari config.
- Dengan tabel per campaign, alasan itu tidak berlaku lagi.

Desain usulan:

`academic_program_dashboard_campaign_learning_paths`

| Kolom | Keterangan |
| --- | --- |
| `id` | increments |
| `campaign_id` | FK ke campaigns, cascade |
| `name` | Nama learning path di campaign ini, diisi Ops |
| `scholarship_package_id` | nullable. Pemetaan ke pilihan learning path di form registrasi, khusus peserta auto-register. Kosong untuk campaign tanpa registrasi Dicoding |
| `created_by`, `updated_by` | FK users |
| timestamps | |

`academic_program_dashboard_learning_path_courses`

| Kolom | Keterangan |
| --- | --- |
| `id` | increments |
| `learning_path_id` | FK ke campaign learning paths |
| `course_id` | FK ke course Dicoding |
| `target_week` | unsignedTinyInteger, minggu ke-N sejak `open_at` |
| `created_by`, `updated_by` | FK users |
| timestamps | |
| unique `(learning_path_id, course_id)` | |

Access list: tambah `learning_path_id` (nullable FK).
- Peserta manual dan CSV: Ops memilih learning path. Karena itu learning path harus dibuat dulu sebelum menambah peserta (menjawab P10).
- Auto-register (card [6]): dipetakan dari `scholarship_participants.scholarship_package_id` ke `campaign_learning_paths.scholarship_package_id`. Menjawab P11, karena tidak perlu lookup config lagi.

**Alasan `scholarship_package_id` tetap ada:** pendaftar memilih learning path di form registrasi program, dan pilihannya tersimpan sebagai `scholarship_package_id`. Tanpa pemetaan ini, peserta auto-register masuk tanpa learning path, dan Ops harus mengisinya manual untuk ratusan peserta. Mencocokkan nama ke `lp_name` config dianggap rapuh.

**Keterkaitan dengan G7:** pemetaan registrasi ke campaign ini polanya sama dengan TODO kategori card [6] (kategori pendaftaran ke kategori campaign). Keduanya bisa dikerjakan bersama di listener auto-enroll.

**Rincian SP (draft, sebelum pecah):**

| Bagian | SP |
| --- | --- |
| CRUD learning path per campaign + pemetaan `scholarship_package_id` | 1 |
| Course per learning path (combobox + `target_week`) | 1,5 |
| `learning_path_id` di access list + pilihan di form tambah peserta/CSV + auto-enroll | 1 |
| Kalkulasi progress + NEED RENEW + freeze | 1 |
| **Total** | **4,5** |

**Belum diputuskan (Q7):** dipecah menjadi card baru "Ops sets up learning paths and their courses per campaign" (3,5 SP, mungkin plus TODO kategori [6]) dan card Course progress (1 SP, hanya kalkulasi dan tampilan)?


### SP final (2026-11-18): 5 SP, ditetapkan Krisna (sempat 4)

Estimasi Claude 5,5 SP:

| Bagian | SP |
| --- | --- |
| CRUD learning path + pemetaan `scholarship_package_id` | 1 |
| Course per learning path (combobox + `target_week`) | 1,5 |
| `learning_path_id` peserta (form tambah, CSV, auto-enroll) | 1 |
| Kalkulasi progress + NEED RENEW + freeze | 1 |
| TODO kategori [6] (G7), termasuk isian "Kategori registrasi" di form kategori campaign | 1 |

- Kolom course "x/y lulus" di daftar peserta admin dikerjakan di card Progress status, bersama kolom status.
- Krisna menetapkan **4 SP**. Selisih dengan estimasi Claude (sekitar 1,5 SP) menjadi risiko card ini. Kalau melebar, kandidat yang dikeluarkan adalah G7 (card sendiri, sekitar 1 SP).


- **Pembaruan:** Krisna mengubah judul card menjadi [5] (2026-11-18 07:11). Obsidian disamakan menjadi **5 SP**. Selisih dengan estimasi Claude tinggal sekitar 0,5 SP.

## 6. Admin manages important links (4 SP)

"Grup" di card ini adalah **grup link** (judul bagian di halaman Student Portal/Capstone), bukan grup peserta.

### Kondisi APD lama

- Firestore `important-links` (`hosting/src/data/datasources/firestore/important-links.ts`): `label`, `url`, `docType` (`student_portal` | `capstone`), `studentType` (string atau array, campuran kunci kategori dan `"facilitator"`, lihat `important-links-categories.ts`), `order`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy` (hanya diisi saat edit), `deletedAt`, `deletedBy`. `docTypeLabel` dan `studentTypeLabel` dihitung saat dibaca, tidak disimpan.
- Link baru: `order = jumlah link aktif`. Reorder lewat drag, lalu tombol "Save order" menulis ulang `order` semua link. Dibaca dengan `orderBy("order")`, lalu `orderBy("createdAt")`.
- Tidak ada grup: judul bagian dibuat dengan link tanpa URL. Link berlaku per environment (per program), belum per campaign.

### Kondisi APD baru

- Kategori per campaign sudah ada (`academic_program_dashboard_campaign_categories`). Flag `importantLinks` dan `studentPortal` ada di `FeatureKey`.
- Belum ada library drag-and-drop di frontend.
- Tidak ada migrasi data (PRD), jadi nama kolom tidak wajib sama dengan APD lama.

### Keputusan dan usulan

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

### Desain tabel

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

### Pemetaan ke APD lama

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

### Pertanyaan terbuka

Semua terjawab 2026-11-17:

- ~~P12. Drag-and-drop.~~ **Pakai library** `@dnd-kit/sortable` sesuai AC (Krisna). SP card dinaikkan menjadi 4 (Krisna).
- ~~P13. Link untuk semua kategori.~~ **Keputusan (Krisna): ikuti skema APD lama.** Form menampilkan satu daftar checkbox "Terlihat oleh" (semua kategori campaign ditambah Fasilitator), minimal satu dicentang. Tidak ada pilihan "all", flag, atau enum.
  - Opsi yang ditolak: kategori palsu "all" di tabel kategori (mencampur data dengan aturan), flag `is_for_all_categories` (membingungkan: "semua kategori" sudah dicentang tapi link tidak muncul di Fasilitator), enum `student_scope` ALL/SELECTED/NONE (terlalu rumit dan berbeda dari APD lama).
  - Penyimpanan opsi a: `category_ids` (json) + `is_for_facilitator` (boolean). Di UI tetap satu daftar. Opsi b (`audiences` json campuran id kategori dan "facilitator", paling mirip `studentType`) ditolak supaya tipe data rapi.
  - Konsekuensi yang diterima (sama seperti APD lama): kategori yang ditambahkan di tengah campaign tidak otomatis melihat link lama. Admin mencentang ulang.
- ~~P14. Link khusus Fasilitator.~~ APD lama mendukung ("Facilitator" salah satu pilihan `studentType`, `important-links-categories.ts`; mentor membaca link berkategori `"facilitator"`, `ImportantLinks.vue:22`). Tidak ada sheet Important Links (card inventaris Kevin: dikelola lewat Admin UI). **Keputusan (Krisna): harus ada link khusus Fasilitator** (`category_ids = []`, `is_for_facilitator = true`).
- ~~P15. FK kolom audit.~~ Konvensi codebase: `*_by` `unsignedInteger` + FK ke `users` (`certificate_templates.created_by`, `event_attenders.checked_in_by`, `mentoring_booking_reschedules.rescheduled_by`, `email_platform_drafts.admin_id`). **Keputusan (Krisna): FK ke `users`.**

### Rincian SP (draft)

| Bagian | SP |
| --- | --- |
| Grup: migration, domain, CRUD, reorder, UI | 1,5 |
| Link: CRUD, daftar checkbox target (kategori + Fasilitator, minimal satu), validasi URL, soft delete, audit FK `users`, UI | 1,5 |
| Drag-and-drop link dan grup (`@dnd-kit/sortable`, library baru) | 1 |
| **Total** | **4** (disepakati Krisna 2026-11-17) |

## 7. Students see important links (2 SP)

### Kondisi APD lama

- `views/components/studentPortal/ImportantLinks.vue` adalah komponen sidebar "Important Links", dipasang di Student Portal, Facilitator Portal (tipe `student_portal`), dan Capstone Project (tipe `capstone`).
- Kategori dibaca dari user. Mentor diberi kategori `"facilitator"`. Link diambil dengan `array-contains` kategori.
- Saklar fitur: `studentPortal` mengatur menu dan halaman Student Portal (`data/constants/sidebar-nav.ts:74`), `importantLinks` mengatur kotak link di dalam halaman (`ImportantLinks.vue:24`). Di APD lama saklar berlaku per kategori.
- Halaman Student Portal berisi Jumbotron dan konten statis (`SITE_CONTENTS.studentPortal(programName)`), dengan kotak link di sampingnya.

### Kondisi APD baru

- Belum ada halaman atau route Student dan Fasilitator. Kerangka ada di card Hasbi [User can Access APD based on their Role](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894672).
- Saklar fitur di `academic_program_dashboard_campaign_features` per campaign (bukan per kategori).
- Listener card [6] (`ParticipantEnrollmentSpecification`) mendaftarkan Student dengan `categoryId: null` (TODO). Student hasil pendaftaran tidak punya kategori, sehingga tidak akan melihat link apa pun (link dipilih per kategori, bagian 6 P13). Juga berdampak ke announcement per kategori (Hasbi).

### Keputusan dan usulan

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

### Ketergantungan

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

### Rincian SP

| Bagian | SP |
| --- | --- |
| Query baca + gateway + test integration | 0,5 |
| Komponen `ImportantLinks` + vitest | 0,5 |
| Pasang di Student Portal dan Facilitator Portal + cek saklar fitur | 0,5 |
| Buffer | 0,5 |
| **Total** | **2** (disepakati Krisna 2026-11-17). Tidak termasuk kerangka halaman (card Hasbi) dan TODO kategori [6] |


### Keputusan 2026-11-18

- **G7:** TODO kategori card [6] (`ParticipantEnrollmentSpecification` mendaftarkan Student dengan `categoryId: null`) **ikut dikerjakan di card Course progress**, bersamaan dengan pemetaan learning path saat auto-enroll (Krisna). Polanya sama: data registrasi dipetakan ke data campaign. Card Course progress menjadi 5,5 SP.
- **G8:** cukup cek fitur `importantLinks` (Krisna).

## 8. Facilitator see the progress of their supervised Students (2 SP, draft)

Card: [Facilitator see the progress of their supervised Students](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765) (Planning)

### Isi AC
- Fasilitator melihat daftar Student binaannya beserta ringkasan progress masing-masing.
- Dari daftar, Fasilitator membuka progress satu Student dengan bagian yang sama seperti tampilan Student. Di AC tertulis "Lecturer", sisa dari versi card yang lama.
- Student di luar mapping menghasilkan 403/404 (AC C4 yang dipindahkan dari card Map Facilitators).
- Perubahan mapping langsung terlihat di daftar.

### Komentar card
- **Hasbi (2026-11-16):** "perlu ada tabel yang menyimpan informasi profil dosen". Sisa dari versi Lecturer, **tidak relevan** untuk Fasilitator.
- **Krisna (2026-11-17):** depend ke Map Facilitators (grup sebagai mapping), Course progress, Progress status, serta card Attendance, Assignment, dan Point histories.

- **Krisna (2026-11-18 04:40):** card ini di-hold sampai semua dependensinya selesai dikerjakan. SP belum diisi di judul card.

### Kondisi APD lama
`Chooser.vue` adalah pemilih Student, bukan tabel ringkasan:
- Mentor memilih grup (selector muncul kalau punya lebih dari satu grup), lalu memilih satu atau beberapa Student.
- Ada filter status progress (`selectedProgressFilters`).
- Route `/progress` dan `/u/:userId/progress`.

### Usulan keputusan (draft)

| # | Usulan |
| --- | --- |
| H1 | Student binaan = Student (`role = STUDENT`) di semua grup yang Fasilitatornya dia, lewat `group_members` (C1, C8). Di-distinct karena ada kasus merge. Dibaca tiap request, sehingga perubahan mapping langsung terlihat |
| H2 | Daftar berisi nama, email, grup, status progress (kalkulator bagian 4), dan course "x/y selesai" (bagian 5). Filter grup dan status, mengikuti APD lama |
| H3 | Detail per Student (`/{program_code}/facilitator/students/{id}`). Student di luar H1 menghasilkan 404 |
| H4 | Isi detail memakai komponen tampilan progress Student dari card [Students see their learning progress in APD](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257746) (belum ada assignee) |
| H5 | Setiap bagian detail mengikuti saklar fitur campaign, sama dengan tampilan Student |

Pembaruan 2026-11-17: status di kolom ringkasan sekarang dihitung otomatis (bagian 4), jadi card ini cukup memanggil kalkulator yang sama.

### Ketergantungan

| Bergantung ke | Pemilik | Sifat |
| --- | --- | --- |
| Kerangka halaman Fasilitator dan akses per role (10411894672) | Hasbi | Blocker |
| Map Facilitators | Krisna | Blocker milik sendiri |
| Students see their learning progress (komponen detail) | Belum ada assignee | Blocker untuk H4 |
| Progress status, Course progress | Krisna | Untuk kolom ringkasan |
| Attendance | Belum ada assignee | Isi detail |
| Assignments, point histories | Alfian | Isi detail |

### Rincian SP (draft)

| Bagian | SP |
| --- | --- |
| Query Student binaan + daftar + filter grup/status | 1 |
| Halaman detail + otorisasi 404 + membungkus komponen Student | 0,5 |
| Test (integration otorisasi, vitest daftar) | 0,5 |
| **Total** | **2** |

### Pertanyaan terbuka
- **P16.** Kolom ringkasan cukup status dan course "x/y"? Atau perlu juga kehadiran dan tugas (menunggu card attendance dan assignment)?
- **P17.** Detail Student: tunggu komponen dari card tampilan Student (H4), atau sementara tampilkan data milik Krisna dulu (course dan status)?
- **P18.** Pilih banyak Student sekaligus seperti Chooser APD lama, atau cukup satu Student per halaman detail (usulan, sesuai AC)?
- **P19.** Card "Students see their learning progress" sebaiknya diambil Krisna juga?
- **Q4** (Ringkasan): peserta withdraw/terminated di daftar Fasilitator diberi label "Inactive" atau disembunyikan?

**Ditunda (Krisna, 2026-11-18):** P16-P19 dibahas nanti. Usulan Claude yang sudah disampaikan:
- P16: kolom nama, grup, status (atau "Inactive"), dan course "x/y lulus". Kehadiran dan tugas menyusul.
- P17: detail dimulai dari data milik Krisna (course + NEED RENEW + status). Bagian lain menyusul setelah card tampilan Student jadi.
- P18: satu Student per halaman detail.
- P19: card "Students see their learning progress" sebaiknya diambil Krisna, karena isi utamanya data course dan status.
