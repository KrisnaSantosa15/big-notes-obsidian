---
date: 2026-11-27
updated: 2026-11-27
type: plan
tags:
  - plan
  - brainstorm
  - estimation
  - dicoding
  - apd
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10545178127
sp: "4"
status: "PR domain & web selesai lokal dan lolos preflight, menunggu ack dan push (Basecamp: In progress)"
pr: []
depends-on: []
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-projects:
  - "[[Projects/Dicoding Platform]]"
related-people:
  - "[[People/Krisna]]"
ai-first: true
---

## For future agent

Note ini mencatat spesifikasi, keputusan, dan status preflight untuk card Cycle-2 [[People/Krisna]] mengenai bulk Withdraw/Terminated peserta campaign di [[Projects/Dicoding Platform]] (APD Revamp), yang dipisah dari [[Projects/APD Revamp/Cycle 2/02-ops-edits-participant]] pada 2026-11-25. Implementasi mencakup kolom `dropout_type`/`dropout_reason`, pencabutan `accessible_until = now()`, dan dropout token MCT secara sinkron dalam satu transaksi. Per 2026-11-27, PR domain (`feature/apd/participant-dropout-domain`) dan PR web (`feature/apd/participant-dropout`) sudah selesai lokal dan lolos preflight, menunggu author acknowledgement untuk push dan create PR.

# Ops withdraws or terminates campaign participants in bulk (4 SP)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10545178127) · [02-ops-edits-participant](02-ops-edits-participant.md)

## Background & Expected Conditions

Ops perlu mengeluarkan peserta dengan status **Withdraw** (mengundurkan diri sendiri) atau **Terminated** (dihentikan penyelenggara, misalnya tidak memenuhi Mandatory Achievement). Di sheet lama, proses Terminate dilakukan per batch dengan satu alasan dan tanggal yang sama untuk ratusan peserta.

Expected conditions di Basecamp:
1. Admin memilih peserta lewat checkbox per baris di daftar peserta; pilihan tetap tersimpan saat pindah halaman atau mengganti filter.
2. Tombol di samping Add participant menampilkan jumlah peserta terpilih dan membuka dialog berisi daftar peserta terpilih (bisa dilepas satu per satu), radio Withdraw/Terminated, alasan wajib (satu untuk semua peserta terpilih), satu tombol konfirmasi berlabel jumlah peserta, Cancel, dan close.
3. Saat dikonfirmasi, dalam satu transaksi: `accessible_until = now()`, `dropout_type` (`WITHDRAWN`/`TERMINATED`) dan `dropout_reason` tersimpan, dan token MCT peserta untuk program campaign di-dropout memakai `MultiCourseTokenDropoutSpecification`.
4. Status keluar final dan tidak bisa dipulihkan. Peserta tetap tampil dengan badge Withdrawn/Terminated dan checkbox-nya nonaktif.
5. Impor CSV untuk keluar massal ada di AC card, namun ditunda (K-W5/K-W6) sampai Ops benar-benar meminta.
6. Hanya Admin yang dapat mengeluarkan peserta.

## Keputusan

Sumber keputusan awal ada di [[Projects/APD Revamp/Cycle 2/02-ops-edits-participant]] (`K-W1`–`K-W9`, 2026-11-25 s.d. 2026-11-26):

| # | Keputusan | Tanggal |
| --- | --- | --- |
| K-W1 | Alasan wajib, teks bebas, satu alasan untuk semua peserta yang dipilih. Tanpa upload surat, tanpa field tanggal (`accessible_until = now()`) | 2026-11-25 |
| K-W2 | Status keluar final, tidak bisa dipulihkan karena token MCT sudah di-dropout. Peserta keluar diberi badge Withdrawn/Terminated dan checkbox-nya nonaktif | 2026-11-25 |
| K-W3 | Dialog berisi daftar peserta terpilih, radio Withdraw/Terminated, field alasan, satu tombol konfirmasi berlabel jumlah, Cancel, dan close | 2026-11-25 |
| K-W4 | Checkbox per baris; pilihan tetap tersimpan saat pindah halaman atau ganti filter (per user ID di state halaman). Tombol di samping Add participant menampilkan jumlah terpilih | 2026-11-25 |
| K-W5 / K-W6 | Import CSV keluar massal tidak dibuat sekarang (baru dibuat jika Ops meminta). AC card Basecamp masih menyebut CSV dan perlu disesuaikan | 2026-11-25 |
| K-W7 | Kolom baru di `academic_program_dashboard_access_lists`: `dropout_type` (`WITHDRAWN` atau `TERMINATED`, nullable) dan `dropout_reason` (teks alasan, nullable). Akses tetap dicabut lewat `accessible_until = now()` | 2026-11-25 / 2026-11-26 |
| K-W8 | Direvisi 2026-11-26: setiap peserta APD pasti punya token MCT di program itu, jadi guard & test peserta tanpa token dihapus. Jika seluruh batch tidak punya token, domain MCT menolak dengan `TOKENS_EMPTY` dan transaksi di-rollback | 2026-11-26 |
| K-W9 | Untuk peserta yang sudah keluar, tombol Edit dan checkbox dinonaktifkan | 2026-11-25 |

**Keputusan penamaan & teknis (2026-11-26):**
- Nama fitur memakai **participant dropout** (bukan `participant exit`) agar selaras dengan `MultiCourseTokenDropout` dan status enrollment `DROPOUT`.
- Kolom dan field menggunakan `dropout_type` (enum `ParticipantDropoutType`: `WITHDRAWN`/`TERMINATED`) dan `dropout_reason` (label UI `"Reason"`).
- Event memakai `ParticipantsWereDroppedOut` (`user_ids` bertipe `list<int>`).
- Route POST `participants/dropout`, diproses sinkron dalam satu transaksi `UseCase::run` bersama `MultiCourseTokenDropoutRepository`.
- Token diambil dalam satu query: `MultiCourseTokensGateway::getTokensByStudentIdsAndProgramCode`.

## Status Branch Lokal & Preflight (2026-11-26)

1. **PR Domain (`feature/apd/participant-dropout-domain`, base `master`)**
   - Risk ([[People/Krisna]]): **high** (`"add dropout (withdrawn/terminated) feature"`), route pre-merge.
   - Direview di `4a41b5cb88c`. HEAD final: `8518c626b2d`. Digest: `d96127b04f40d5777f00c196a605bc32e5b89c6922a02dbcbc75eb735cbc26ed`.
   - Temuan: `D-R1` (nit urutan import gateway) diperbaiki di `eb83e0eefde` & `8518c626b2d`; `D-S1` (VO cukup bool) dibiarkan agar enum tetap dipakai.
   - Cek: diff bersih, psalm 7 file bersih, unit test 9 lolos (41 assertion).

2. **PR Web (`feature/apd/participant-dropout`, base PR domain)**
   - Risk ([[People/Krisna]]): **medium** (`"allow ops to dropout campaign participants with reason"`), route post-merge.
   - Direview di `7deaa5cef18`. HEAD final: `6b663613fcc` (merge branch domain). Digest: `414e38f520eefb989dc4b2fa1180957201d757ab84ad2fb526f0af5adf4b5414`.
   - Temuan:
     - `W-S1` (should-fix): dua penanda program → cukup `program_code` (`b1fc8e621f0`).
     - `W-S2` (nit) & `W-R2`: validasi reason diserahkan ke domain, spec `present|string` (`5e570b67b28`).
     - `W-S3` (nit): satu konstanta `DROPOUT_TYPES` di `student-list.constants.ts` (`a24c01bf926`), bundle di-rebuild (`dd06cab76d7`).
     - `W-R1` (question): event `MultiCourseTokenWasDroppedOut` tidak di-dispatch, dibiarkan karena `ParticipantsWereDroppedOut` sudah menjadi audit.
   - Cek: build lolos & bundle identik, diff bersih, psalm 6 file bersih (migration di luar scope psalm), integration test 5 lolos (28 assertion), unit test 9 lolos, vitest 29/29, eslint bersih.

**Status saat ini (2026-11-27):** Menunggu acknowledgement dari [[People/Krisna]] untuk kedua digest. Belum push, belum ada PR.
- Report: `/tmp/claude-1000/pf-dropout-domain/report.json`, `/tmp/claude-1000/pf-dropout-web/report.json`.
- Worktree domain: `scratchpad/wt-pd-domain`.

**Lanjutan:**
- Search multi-email (input chips, beberapa kata kunci dipisah koma dan tetap `LIKE`), dijadikan card terpisah.
- Nonaktifkan tombol Edit untuk peserta yang sudah dropout, setelah PR edit (`feature/apd/participant-edit`) merge.
- Hapus backup: `backup/participant-exit-domain-pre-*` dan dua stash backup rename.
