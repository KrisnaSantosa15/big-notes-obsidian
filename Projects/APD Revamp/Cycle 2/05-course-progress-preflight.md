---
tags: [apd-revamp, cycle-2, pr-preflight]
parent: "[[05-course-progress]]"
updated: 2026-11-23
---

# Preflight PR course progress

Hasil PR preflight untuk stack learning path (card [[05-course-progress]]). Setiap PR direview dua reviewer (rules dan simplicity) satu kali, risiko ditulis Krisna sebelum review. Belum ada PR yang di-ack atau di-push.

Report asli disalin ke `preflight-reports/` di folder ini, karena salinan di `/tmp` hilang kalau mesin di-restart. Untuk validasi ulang, arahkan `--report` ke file di folder itu.

## Ringkasan

| PR | Branch | Base | HEAD final | Risiko | Temuan | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1a | `feature/apd/campaign-learning-path-domain` | `origin/master` | `00f8c2785b9` | medium | 1 diperbaiki | Valid, menunggu ack |
| 1b | `feature/apd/campaign-learning-path-creation` | 1a | `8ba5aa4986a` | medium | 6 diperbaiki, 1 ditutup | Valid, menunggu ack |
| 3a | `feature/apd/participant-learning-path-auto-enroll` | 1b | `f8c0cefe769` | low | 1 ditutup | Valid, menunggu ack |
| 4a + backfill | `feature/apd/participant-learning-path-auto-enroll-storage` | 3a | `d8cd70bbbbd` | medium | 2 ditutup | Valid, menunggu ack |
| 3c | `feature/apd/participant-learning-path-creation-domain` | 4a | `f5a2fff749c` | low | 0 | Valid, menunggu ack |
| 4c | `feature/apd/participant-learning-path-creation` | 3c | `65057e7eb60` | medium | 0 | Valid, menunggu ack |
| 3d | `feature/apd/participant-learning-path-import-domain` | 4c | `864e0381db7` | low | 2 ditutup | Valid, menunggu ack |
| 4d | `feature/apd/participant-learning-path-import` | 3d | | | | Belum |

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
