---
date: 2026-11-17
updated: 2026-11-18
type: plan
tags: [plan, brainstorm, estimation, dicoding, apd]
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257784
sp: "5"
status: "Brainstorm selesai, belum dikerjakan"
pr: []
depends-on: []
index: "[[brainstorm-sp-cycle-2]]"
related-people: ["[[People/Krisna]]"]
---
# Course progress is calculated automatically from Dicoding learning data (5 SP)

[Index Cycle 2](../brainstorm-sp-cycle-2.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257784)

## Kondisi saat ini

- APD lama: tab "Course Progress" (`User ID`, `CourseName`, `Progress Status` seperti 100.00%) disinkronkan `syncCourseProgress` ke Firebase, ditampilkan `CourseProgresses.vue`: progress bar per course (merah <35%, kuning <70%, hijau), 3 course pertama lalu bisa dibuka, teks "Last updated", course capstone dipisah lewat `capstoneProgress.courseName`.
- Progress bar halaman kelas Dicoding (`StudentOnCourseVM::getProgressPercentage`, `Dicoding/Web/VM/Academies/Index/StudentOnCourseVM.php:406`) = modul aktif selesai / total modul aktif, dibulatkan ke bawah. Sama persis dengan `CodingCampProgressiveCourseProgressChecker::getPercentages(userIds, courseId)` (batch).
- Pendaftaran AI Camp menyimpan `scholarship_participants.scholarship_package_id` (learning path) dan `category`. Config `scholarships.ai_camp.token_packages` memetakan id learning path ke `lp_name` dan `course_ids` (course token), per program di file config.
- Listener card [6] (`ParticipantEnrollmentSpecification`) masih mendaftarkan Student dengan `categoryId: null` dan TODO "map the registration category to the campaign category once that mapping exists". Event `ScholarshipCohortWasRegistered` hanya membawa `user_id` dan `program_id`.
- Capstone adalah Epic 7 di PRD (Fase 4), di luar card ini.

## Keputusan

Koreksi 2026-11-17 (Krisna): **kategori dan learning path berbeda.** Kategori = jenis Student (misalnya SMK, umum, guru SMK). Learning path = jalur belajar yang ditempuh Student (misalnya AI Engineer, Data Scientist). Daftar course mengikuti learning path, bukan kategori.

| # | Keputusan | Tanggal |
| --- | --- | --- |
| E1 | Konfigurasi course per campaign per **learning path**: `campaign_id`, `scholarship_package_id`, `course_id`, urutan. Dikelola Ops di admin campaign, pilihan learning path dari config program. Learning path tidak disimpan di access list (lihat P9) | 2026-11-17 |
| E2 | Rumus = progress bar halaman kelas (checker yang sudah ada). Tanpa aturan khusus "sudah lulus = 100%" | 2026-11-17 |
| E3 | Dihitung saat dibaca (real-time), query batch per course, tanpa disimpan dan tanpa cron | 2026-11-17 |
| E4 | Kolom progress di halaman Students admin (misalnya "x/y kelas selesai" plus detail per course). Tampilan untuk Student ada di card "Students see their learning progress in APD" | 2026-11-17 |
| E5 | Service juga menyediakan jumlah kelas lulus per Student, untuk card status otomatis nanti | 2026-11-17 |
| E6 | Capstone di luar scope (Epic 7) | 2026-11-17 |

## Pertanyaan terbuka

> Keputusan learning path sudah ada di [implementation-backlog.md](implementation-backlog.md): K3 dan K4 (kolom `learning_path` dan snapshot `lp_name`, dibatalkan) diganti K20 (2026-10-28): learning path dibaca saat dibutuhkan lewat `scholarship_participants.scholarship_package_id` dan lookup config. Card ini mengikuti K20.


- ~~P9. Sumber learning path peserta.~~ Terjawab 2026-11-17 dari komentar card [6] (Revamp APD Done):
  - Hasbi (2026-10-23): "learning path ini ganti2 setiap campaign dan namanya juga bisa beda2 makanya skrg ngambilnya dari config".
  - Krisna (2026-10-28): "untuk learning path jangan disimpan di access list, kalau butuh cukup join aja dengan tabel scholarship_participants lewat scholarship_package_id yang melakukan lookup ke config".
  - Commit terkait: `84534d215ca` (sempat menyimpan learning path di access list), lalu `82a8f118e97`, `35ffb230159`, `330bfa1974c` (dihapus lagi, 2026-10-28).
  - Akibatnya: tanpa kolom baru dan tanpa CRUD. Learning path Student = `access_list.user_id` + `program_id` campaign → `scholarship_participants.scholarship_package_id` → nama dari config program (`token_packages[id].lp_name`). E1 dikaitkan ke `scholarship_package_id`.
- P10. Peserta yang ditambah manual atau CSV (card [3]) dan tidak punya baris `scholarship_participants` tidak punya learning path, jadi course progress-nya kosong. Perlu dipastikan apakah kasus ini ada di campaign nyata.
- P11. Lookup config per program: daftar learning path di form konfigurasi course diambil dari config program campaign (misalnya `scholarships.ai_camp.token_packages`). Perlu dicek cara memetakan campaign ke kunci config programnya.

## Rincian SP (draft)

Rumus progress tidak perlu dibuat (E2, checker yang sudah ada, 0-100 per course). Pekerjaan utama card ini adalah menentukan **course apa saja** per learning path. Lihat bagian "Sumber daftar course" di bawah.

| Bagian | A1 (CSV) | A2 (form sederhana) | A3 (form lengkap) |
| --- | --- | --- | --- |
| Fitur setup course per learning path (migration, domain, gateway, UI, test) | 1 | 1,5 | 2 |
| Service baca (join learning path K20, ambil daftar course, `getPercentages()` batch) | 0,5 | 0,5 | 0,5 |
| Kolom progress di halaman Students admin (E4) | 0,5 | 0,5 | 0,5 |
| **Total** | **2** | **2,5** | **3** |

- Usulan Claude: **A1 = 2 SP**, atau 2,5 dengan buffer (kalibrasi card [3] dan [4]: pekerjaan lintas domain, web, dan CSV cenderung melebihi estimasi). Varian belum diputuskan Krisna (2026-11-17).
- Risiko membengkak: P11. Kalau cukup mendukung bentuk config AI Camp (`lp_name` + id), angka tetap. Kalau harus mendukung semua bentuk `token_packages`, tambah sekitar 0,5.

## Sumber daftar course (2026-11-17)

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


## Pembaruan 2026-11-17 (komentar card dan keterkaitan dengan status)

**Komentar Hasbi (2026-11-16):**
- Progress hanya dihitung untuk aktivitas selama program berjalan. Filter ini dibantu dari sistem.
- Student yang sudah menyelesaikan course sebelum campaign dimulai dihitung **0%**, dan harus me-renew course agar dianggap selesai. Request dari Wintari Yasmin: tampilkan **NEED RENEW** (merah), lalu 100% hijau setelah renew selesai.
- Attendance, assignments, dan point histories kemungkinan tetap diisi manual (bukan card ini).

**Komentar Krisna (2026-11-17):** perhitungan progres berdasarkan learning path pendaftar, jadi sistem harus tahu course mana saja per learning path. Learning path diambil dari config (K20). Opsi: daftar course di config, atau Ops mengatur course per learning path saat setup campaign. Card ini saling terkait dengan card progress status, dan learning path kemungkinan perlu disimpan di DB (misalnya `campaign_learning_paths`).

**Usulan:** tabel konfigurasi opsi A (E1) diperluas dengan kolom `target_week` supaya dipakai juga oleh kalkulator status ([bagian 4](04-progress-status.md)).
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
- **Q2.** Kelas yang dihitung lulus hanya course di daftar learning path dan yang selesai dalam periode program? (sama dengan Q2 [bagian 4](04-progress-status.md))
- **Q5.** Filter periode program dan NEED RENEW masuk card ini atau ditunda? Kalau ditunda, SP turun ke 2,5.


## Keputusan 2026-11-18 (learning path, course, renew, freeze)

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


## SP final (2026-11-18): 5 SP, ditetapkan Krisna (sempat 4)

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
