---
tags: [apd-revamp, cycle-2, pr-preflight]
parent: "[[05-course-progress]]"
updated: 2026-11-24
---

# Preflight PR course progress

Hasil PR preflight untuk stack learning path (card [[05-course-progress]]). Setiap PR direview dua reviewer (rules dan simplicity) satu kali, risiko ditulis Krisna sebelum review. 1a dan 1b sudah di-ack dan di-push (2026-11-24). 3a, 2a, dan 2c menyusul sebagai draft di atas 1b (2026-11-24, push dari main tree dengan hook Psalm). Sisanya belum, push bertahap supaya reviewer tidak kewalahan.

**Catatan push:** push dari `git worktree` tidak menjalankan pre-push hook, karena `.husky/_` tidak ada di worktree. Psalm penuh dijalankan manual setelahnya di `00f8c2785b9` dan `8ba5aa4986a`, keduanya lolos. Push berikutnya dari working tree utama.

Report asli disalin ke `preflight-reports/` di folder ini, karena salinan di `/tmp` hilang kalau mesin di-restart. Untuk validasi ulang, arahkan `--report` ke file di folder itu.

## Ringkasan

| PR | Branch | Base | HEAD final | Risiko | Temuan | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1a | `feature/apd/campaign-learning-path-domain` | `origin/master` | `00f8c2785b9` | medium | 1 diperbaiki | Ack 2026-11-24, PR [#6494](https://github.com/dicoding-dev/dicoding/pull/6494) |
| 1b | `feature/apd/campaign-learning-path-creation` | 1a | `8ba5aa4986a` | medium | 6 diperbaiki, 1 ditutup | Ack 2026-11-24, PR draft [#6495](https://github.com/dicoding-dev/dicoding/pull/6495) |
| 3a | `feature/apd/participant-learning-path-auto-enroll` | 1b | `f8c0cefe769` | low | 1 ditutup | Ack 2026-11-24, PR draft [#6500](https://github.com/dicoding-dev/dicoding/pull/6500) |
| 4a + backfill | `feature/apd/participant-learning-path-auto-enroll-storage` | 3a | `d8cd70bbbbd` | medium | 2 ditutup | Valid, menunggu ack |
| 3c | `feature/apd/participant-learning-path-creation-domain` | 4a | `f5a2fff749c` | low | 0 | Valid, menunggu ack |
| 4c | `feature/apd/participant-learning-path-creation` | 3c | `65057e7eb60` | medium | 0 | Valid, menunggu ack |
| 3d | `feature/apd/participant-learning-path-import-domain` | 4c | `864e0381db7` | low | 2 ditutup | Valid, menunggu ack |
| 4d | `feature/apd/participant-learning-path-import` | 3d | `9596b200e52` | low | 0 | Valid, menunggu ack |
| 2a | `feature/apd/campaign-learning-path-update-domain` | 1b | `efee467a87a` | medium | 0 | Ack 2026-11-24, PR draft [#6501](https://github.com/dicoding-dev/dicoding/pull/6501) |
| 2c | `feature/apd/campaign-learning-path-removal-domain` | 1b | `4df7169fc0f` | medium | 1 ditutup | Ack 2026-11-24, PR draft [#6502](https://github.com/dicoding-dev/dicoding/pull/6502) |
| 2b | `feature/apd/campaign-learning-path-update` | 4a (+ merge 2a) | `9c6520748ff` | low | 2 diperbaiki | Valid, menunggu ack |
| 2d | `feature/apd/campaign-learning-path-removal` | 2b (+ merge 2c) | `152700c4a2b` | medium | 1 ditutup | Valid, menunggu ack |
| 5 | `feature/apd/campaign-course-progress` | 4d | `46fc87d683f` | low | 1 ditutup | Valid, menunggu ack |
| 6 | `feature/apd/campaign-course-progress-view` | 5 | `05cf691e1aa` | medium | 1 diperbaiki, 2 ditutup | Valid, menunggu ack |
| 8 | `feature/apd/campaign-progress-status-view` | 6 | `515000fdbf4` | medium | 3 diperbaiki, 2 ditutup | Valid, menunggu ack |

PR stacked harus memakai `--base <branch di bawahnya>` di setiap perintah helper (`validate-risk`, `validate`, `digest`, `refresh`). Tanpa itu helper membandingkan ke `origin/master` dan melaporkan snapshot basi.

## Kapan preflight perlu diulang

- **Ack belum diberikan:** tidak perlu preflight ulang. Ack diberikan tepat sebelum push, untuk digest dan HEAD yang tercatat.
- **Branch tidak berubah:** report, check, dan ack tetap berlaku walaupun master maju.
- **Base di-merge ke branch:** jalankan `refresh`, ulangi check, ack lagi. Review tidak diulang.
- **Rebase atau riwayat ditulis ulang:** preflight baru. Karena itu perbaikan di PR bawah dibawa ke atas dengan merge, bukan rebase.

## 1a. Domain create learning path

- Report: `preflight-reports/1a-report.json`
- Review di `8d55ead764e`, HEAD final `00f8c2785b9`
- Digest: `fafd3edeba2b968558cb17618728369b19696de24f509bc0a6ce0e9055324512`
- Risiko (medium, review setelah merge): "add domain for creating campaign learning path"

**Temuan**

- **1a-S1 (should-fix, diperbaiki di `00f8c2785b9`):** campaign id dikirim dua kali, di dalam learning path dan sebagai parameter terpisah. `createAggregate` sekarang mengambil campaign id dari learning path; cek `CAMPAIGN_MISMATCH`, key terjemahannya, dan test-nya dihapus.

**Check:** diff bersih, psalm bersih, 11 unit test lulus.

## 1b. Infra + web create learning path

- Report: `preflight-reports/1b-report.json`
- Review di `ae68ddba7dd`, HEAD final `8ba5aa4986a`
- Digest: `f071396f28ca475adfcff4d5756c1c5fd4c7462f144acb705d9f261e4af33c9d`
- Risiko (medium, review setelah merge): "add ui for creating campaign learning path"
- 1a di-merge ke 1b (bukan rebase) supaya review tetap berlaku.

**Temuan**

- **1b-S1 (nit, diperbaiki di `8d959fa1e64`):** `array_unique` di `isEveryCourseFound` berlebihan, rule distinct di VO sudah menolak duplikat.
- **1b-S2 (nit, diperbaiki di `660a42d8da2`):** `refine` kelas ganda di zod berlebihan, UI menyembunyikan kelas terpilih dan server menolak duplikat.
- **1b-S3 (nit, diperbaiki di `660a42d8da2`):** cek `old.courses` untuk memilih tab berlebihan, redirect selalu membawa `#learning-paths`.
- **1b-S4 (nit, diperbaiki di `8d959fa1e64`):** default `input('courses', [])` dan `?? null` tidak dibutuhkan.
- **1b-S5 (pertanyaan, ditutup):** label cadangan "Paket N" ada di backend dan frontend. Dibiarkan karena menangani kasus berbeda: backend untuk paket tanpa `lp_name` di config, frontend untuk learning path yang paketnya sudah tidak punya pendaftar.
- **1b-C1 (blocker dari koordinator, diperbaiki di `1ac32cfa0c4`):** setelah perbaikan 1a-S1 di-merge, Specification masih mengirim argumen `campaignId` yang sudah dihapus.
- **1b-C2 (nit dari koordinator, diperbaiki di `8ba5aa4986a`):** `whereNotNull` pada `scholarship_participants.scholarship_package_id` berlebihan karena kolomnya NOT NULL.
- Label validasi "Minggu target" di spec dibiarkan karena dipakai di kalimat pesan error.

**Check:** diff bersih, psalm bersih, 2 integration test dan 11 unit test lulus, eslint bersih (tsc punya 653 error lama, 0 di file campaign-edit), build ulang identik dengan bundle yang di-commit.

## 3a. Domain auto-enroll

- Report: `preflight-reports/3a-report.json`
- Review dan HEAD final `f8c0cefe769`, tanpa commit perbaikan
- Digest: `8f708015cf481027b6693bd8888d663235b843c3b457e358145f5795da530b05`
- Risiko (low, review setelah merge): "nambah learningpathid ketika enroll peserta ke campaign"

**Temuan**

- **3a-KY1 (pertanyaan, ditutup atas persetujuan Krisna):** `learningPathId` sampai ke `Participant` tapi `createParticipant(s)` belum menulis kolomnya. Dijawab dari bukti: kolom dan penulisannya ada di PR 4a (`39a3ade7ff6`, `3eb1a9a0732`), PR domain tidak membawa migration. Sebutkan di deskripsi PR.

**Check:** diff bersih, psalm bersih (8 file), 47 unit test lulus.

## 4a + backfill. Infra auto-enroll dan backfill

- Report: `preflight-reports/4a-report.json`
- Review dan HEAD final `d8cd70bbbbd`, tanpa commit perbaikan
- Digest: `265a363336394ad5bf0a35e6df820e3a574eef4348a0ef046055ae0105a9dc19`
- Risiko (medium, review setelah merge, teks diperbarui 16:30): "nambah kolom lerning path id dan ketika bikin lp dengan paket beasiswa yang sudah ada pesertanya langsung backfill biar langsung termapping"

**Temuan**

- **4a-Q1 (pertanyaan, ditutup atas persetujuan Krisna):** repository `CampaignLearningPathCreationRepository::save` memutuskan backfill hanya kalau learning path punya paket, dan meng-update tabel access list.
  - Konvensi codebase: pola ini umum. `RequestBookingRepository::saveBookingRequest` menyimpan booking, lalu bercabang `hasVoucher()` atau `hasPackageId()` dan menulis ke tabel lain memakai id booking yang baru. `PlagiarismAppealStatusUpdateRepository::save` bercabang `isAccepted()` lalu meng-update laporan plagiarisme dan masa suspensi. Repository yang menyimpan aggregate lalu menulis data turunan berdasarkan isi VO adalah praktik yang sudah ada.
  - Ditutup tanpa perubahan kode.
- **4a-Q2 (pertanyaan, ditutup atas persetujuan Krisna):** test memakai user id 6 dan 7. `dicoding_test.users` punya id 5, 6, dan 7, jadi aman.
- Catatan reviewer simplicity: backfill tidak memanggil `flushUserCache`. Tidak perlu, cache user hanya menyimpan id, `program_user_id`, `program_code`, role, dan periode akses, tanpa `learning_path_id`.

**Check:** diff bersih; psalm bersih untuk 3 file di `Dicoding/` (migration di luar cakupan psalm.xml, error facade `Schema` sama dengan semua migration lama); 11 unit test dan 5 integration test lulus.

## 3c. Domain tambah peserta manual

- Report: `preflight-reports/3c-report.json`
- Review dan HEAD final `f5a2fff749c`, tanpa commit perbaikan
- Digest: `a65ed896c3aaae668ef4e86dcba831923171c816e71cea2b00a0c29792720c47`
- Risiko (low, review setelah merge): "nambah learning path id ketika tambah peserta manual"

**Temuan:** tidak ada dari kedua reviewer.

**Check:** diff bersih, psalm bersih (4 file), 13 unit test dan 5 integration test lulus.

## 4c. Infra + web tambah peserta manual

- Report: `preflight-reports/4c-report.json`
- Review dan HEAD final `65057e7eb60`, tanpa commit perbaikan. Reviewer membaca diff tanpa bundle `public/`.
- Digest: `84b5cd949978352fccf6e3c498a19cc0f0bb616146e2bcfdd5ac9c0874015563`
- Risiko (medium, review setelah merge): "ui nambah pilihan learning path ketika tambah peserta manual"

**Temuan:** tidak ada dari kedua reviewer. Catatan reviewer rules: tidak ada integration test yang mengirim learning path milik campaign lain lewat query asli; aturan penolakannya sudah dicakup unit test domain di 3c, jadi sesuai konvensi tidak dijadikan temuan.

**Check:** diff bersih, psalm bersih (3 file), 10 integration test lulus, 22 vitest lulus, eslint bersih, build ulang identik dengan bundle yang di-commit.

## 3d. Domain impor CSV dengan learning path

- Report: `preflight-reports/3d-report.json`
- Review dan HEAD final `864e0381db7`, tanpa commit perbaikan
- Digest: `ee86da184421b3433854166c14ff13c5e24748293a24101e6cd874226a11c525`
- Risiko (low, review setelah merge, teks diperbarui): "nambah learning path ketika import dengan aturan jika kolom di db masih kosong akan update, jika sudah ada maka ditolak". Catatan: di kode, nama yang sama untuk peserta yang sudah punya learning path dilewati tanpa error; hanya nama berbeda yang ditolak.

**Temuan**

- **3d-R1 (pertanyaan, ditutup atas persetujuan Krisna):** `update()` membawa `learningPathId` tapi `updateParticipant()` belum menulis kolomnya. Ditangani di 4d (`0a675fccfe8`) beserta integration test; di 3d stub masih mengembalikan `[]` sehingga belum bisa terjadi.
- **3d-KY1 (nit, ditutup atas persetujuan Krisna):** setelah 4d, `getLearningPathIdsByProgramCode` dan `getLearningPathNamesByProgramCode` memakai join yang sama. Tetap dua method mengikuti konvensi gateway: satu method per bentuk hasil (kategori punya pasangan `getCategoryIdsByProgramCode` dan `getCategoriesByProgramCode` dengan join identik), dan tidak ada repository di codebase yang memanggil `array_keys` pada hasil gateway.

**Check:** diff bersih, psalm bersih, 54 unit test dan 5 integration test lulus.

## 4d. Infra + web impor CSV dengan learning path

- Report: `preflight-reports/4d-report.json`
- Review dan HEAD final `9596b200e52`, tanpa commit perbaikan. Reviewer membaca diff tanpa bundle `public/`.
- Digest: `786e86867a178c8f9f047ac1fefd1ff9ef1e5e4bb1102507ed9dccb0c400a92b`
- Risiko (low, review setelah merge): "tambah learning path id untuk import"

**Temuan:** tidak ada dari kedua reviewer. Catatan reviewer simplicity: `getEnrolledParticipantsByEmail` di access list gateway masih stub. Dicek dari kode: method itu hanya dipakai `SupervisedStudentImportRepository` (impor mapping, stub sudah ada di master); impor peserta memakai `getEnrolledParticipants`, dan test membuktikan `updated_count` 1 untuk peserta terdaftar.

**Check:** diff bersih, psalm bersih (2 file), 5 integration test lulus, eslint bersih, build ulang identik dengan bundle yang di-commit.

## 2a. Domain update learning path

- Report: `preflight-reports/2a-report.json`
- Review dan HEAD final `efee467a87a`, tanpa commit perbaikan
- Digest: `88f7d2d9da65c1b5e9c03d81dc75a53f9e357bd7fcd320ccd3f330586a14ecf5`
- Risiko (medium, review setelah merge): "tambah kapabilitas untuk edit campaign learning path"
- Base 1b, bukan ujung stack, supaya stack tetap dangkal. Commit `f55cf0e3d82` memindahkan cek minggu target ke `CampaignLearningPath::fitsCampaignPeriod` dan ikut mengubah aggregate create dari 1a; sebutkan di deskripsi PR.

**Temuan:** tidak ada dari kedua reviewer.

**Check:** diff bersih, psalm bersih (9 file), 25 unit test lulus (11 create, 14 update).

## 2c. Domain hapus learning path

- Report: `preflight-reports/2c-report.json`
- Review dan HEAD final `4df7169fc0f`, tanpa commit perbaikan
- Digest: `367d20934cae9db1a36a8aa8291100718059e388d459e3d00dbf386cf50218dd`
- Risiko (medium, review setelah merge): "tambah domain untuk remove campaign learning path"
- Base 1b. Stub `findLearningPath` dan `hasStudents` identik dengan 2a, jadi saat bertemu hanya konflik penambahan di posisi yang sama (gateway dan file terjemahan).

**Temuan**

- **2c-KY1 (nit, ditutup atas persetujuan Krisna):** repository removal hanya mengecek `findLearningPath` null, `scholarship_package_id` tidak dipakai. Dibiarkan: repository update di 2a membaca kolom itu, dan satu method gateway untuk aturan "learning path milik campaign" lebih sederhana daripada method bool kedua dengan query yang hampir sama.

**Check:** diff bersih, psalm bersih (7 file), 6 unit test lulus.

## 2b. Infra + web update learning path

- Report: `preflight-reports/2b-report.json`
- Review di `d21b0ced3d3`, HEAD final `9c6520748ff`
- Digest: `bb61198eb131a5ac0b77d8423d54dc4d671faccf2794e195f804dab17fbf4c58`
- Risiko (low, review setelah merge): "namabh UI untuk edit campaign learning path dan perbaiki UI table biar lebih terbaca"
- Base 4a (`feature/apd/participant-learning-path-auto-enroll-storage`) dengan `--base` di setiap perintah helper. Diff ikut membawa file 2a lewat merge `50758b929d6`, jadi reviewer juga mencakup file domain 2a. 2a harus merge lebih dulu.

**Temuan**

- pr-rules: tidak ada.
- **2b-KY1 (nit, diperbaiki di `4c621a3ec3e`):** `updateLearningPath` mengulang blok insert course dari `createLearningPath`. Dipindah ke private `insertCourses`, mengikuti `AcademicProgramDashboardSessionScheduleGateway::insertFacilitators` yang dipakai `createSchedule` dan `updateSchedule`.
- **2b-KY2 (nit, diperbaiki di `e76144f495e`):** `weeksOf` memakai `.sort` yang tidak berpengaruh dan `filter` per minggu. Diganti satu `reduce` ke `Map` dengan urutan dari server. Bundle di-build ulang di `9c6520748ff`.

Reviewer tidak dijalankan ulang setelah perbaikan; hanya dicek bahwa commit perbaikan menjawab temuan.

**Check:** diff bersih, psalm bersih (9 file), unit 25 test / 84 assertion, integration 7 test / 38 assertion, eslint dan tsc bersih di file yang berubah, vite build sukses.

## 2d. Infra + web hapus learning path

- Report: `preflight-reports/2d-report.json`
- Review dan HEAD final `152700c4a2b`, tanpa commit perbaikan
- Digest: `df9e39a362a8e22e56b8044926f41a10d63deed93ae965e5545546fec916b6ca`
- Risiko (medium, review setelah merge): "tambah fitur hapus campaign learning paths beserta course didalamnya"
- Base 2b (`feature/apd/campaign-learning-path-update`) dengan `--base` di setiap perintah helper. Diff ikut membawa file 2c lewat merge `160973cdf3f`. 2b harus merge lebih dulu.

**Temuan**

- pr-simplicity: tidak ada.
- **2d-Q1 (question, ditutup atas persetujuan Krisna):** `hasStudents` hanya menghitung role STUDENT, sedangkan FK `access_lists.learning_path_id` RESTRICT berlaku untuk semua role. Ditutup tanpa perubahan: semua jalur tulis hanya memberi `learning_path_id` ke STUDENT (ParticipantCreation 4c, ParticipantEnrollment 4a, ParticipantImport 4d menolak role lain, ContributorCreation null, backfill filter STUDENT); data lokal 21 baris, semua STUDENT.

**Check:** diff bersih, psalm bersih (7 file), unit 6 test / 23 assertion, integration 10 test / 49 assertion, eslint dan tsc bersih, vite build sukses.

## 5. Hitung course progress

- Base `feature/apd/participant-learning-path-import` (`9596b200e52`), HEAD `46fc87d683f`, digest `141b9af5b25e50db91dbed8bc367ae4d463425b988d33407ca57ba9002d7774c`.
- Risiko (Krisna, low): "tambah gateway untuk ambil progress course".
- Rules: 0 temuan. Simplicity: 1 nit (hash di SQL vs PHP), ditutup Krisna: tetap SQL supaya tidak perlu komentar `nosemgrep`.
- Validasi dari worktree branch ini dengan `--base feature/apd/participant-learning-path-import`. Report: `preflight-reports/5-report.json`.

## 6. Tampilan course progress

- Base `feature/apd/campaign-course-progress` (`46fc87d683f`), direview di `340f2fbdec3`, HEAD final `05cf691e1aa`, digest `865678e9b87ad121f7fd37b7f66b3cc00dd1104995759f13ce373c7d2cb7d44f`.
- Risiko (Krisna, medium): "tampilkan learning path dan course progress setiap peserta".
- Temuan: learning path dimuat dua kali (diperbaiki di `05cf691e1aa`), campaign dicari dua kali (ditutup, butuh `ExistingCampaign`), page factory (ditutup).
- Validasi dengan `--base feature/apd/campaign-course-progress`. Report: `preflight-reports/6-report.json`.


## 8. Progress status (AS, IS, LB, NSA)

Card [[04-progress-status]]. Domain dan web digabung satu PR: domain hanya VO murni dan enum, tanpa gateway, migration, atau aggregate.

- Base `feature/apd/campaign-course-progress-view` (`05cf691e1aa`), direview di `ac369ac1913`, HEAD final `515000fdbf4`, digest `c0019b95f1767aa231251d5bdef7cad312af2a9321f8bcafce47cf512f9dafec`.
- Risiko (Krisna, medium): "tambahkan verdict status peserta (AS,IS,LB,NSA) berdasarkan progress dan target week per learning path".
- Checks di `515000fdbf4`: psalm exit 0, unit 8/8 (14/14 dengan `CourseProgressTest`), integration 6/6, vitest APD 100/100, ESLint bersih, build mereproduksi bundle.

| ID | Tingkat | Temuan | Keputusan |
| --- | --- | --- | --- |
| P8-R1 | should-fix | Map label status ada di `.helpers.ts` | Diperbaiki `1dc2d4caac1`: `PROGRESS_STATUSES` di `student-list.constants.ts` |
| P8-S2 | nit | `courseCount` sama dengan `courses.length` | Diperbaiki `07d22aba36c` |
| P8-S3 | nit | Dua `array_map` atas course yang sama | Diperbaiki `08ace49fe1a`: VO menerima `target_weeks` dan `passed_count` |
| P8-S1 | nit | `toArray()` dan getter menyusun field yang sama | Ditutup Krisna: `toArray()` wajib dari `ValueObject`, action memakai getter seperti `CourseProgress` |
| P8-R2 | question | Action membangun VO sendiri | Ditutup Krisna: codebase tidak punya UseCase baca, contoh `AcademyEditAction::createUserInterest()` |

- Validasi dengan `--base feature/apd/campaign-course-progress-view`. Report: `preflight-reports/8-report.json`.
