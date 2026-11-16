# Handoff: APD card [4] mapping Lecturer ke Student

Terakhir diperbarui 2026-11-05. Rujukan utama: [implementation-backlog.md](../../domains/academic-program-dashboard/implementation-backlog.md)
(K28 sampai K40). Verifikasi ulang status PR dengan `gh pr view` sebelum lanjut.

## Status stack di remote (2026-11-04)

Stack lurus di atas #6256 (card [3]), semua sudah di-push. #6249, #6254 dan #6256 di-rebase ke master `64ca542fc20`
dan di-force-push 2026-11-03.

| PR | Branch | Head | Isi | Risk | Status |
| --- | --- | --- | --- | --- | --- |
| [#6297](https://github.com/dicoding-dev/dicoding/pull/6297) | `feature/apd/lecturer-student-mapping` | `69890beea40` | Domain bulk: enum `LECTURER`, VO `SupervisedStudent`, event `SupervisedStudentWasCreated`, aggregate `SupervisedStudentCreation` (all-or-nothing: `NOT_ADMIN`, `NOT_LECTURER`, `NO_STUDENTS`, `NOT_STUDENT`, `ALREADY_SUPERVISED`), repository, gateway stub | low | Draft, CI clean |
| [#6298](https://github.com/dicoding-dev/dicoding/pull/6298) | `feature/apd/lecturer-student-mapping-web` | `3b783e3c99f` | Migration `academic_program_dashboard_supervised_students`, gateway, spec, `POST /{program_code}/supervised-students` | medium | Draft, CI clean |
| [#6299](https://github.com/dicoding-dev/dicoding/pull/6299) | `feature/apd/lecturer-student-mapping-ui` | `b9d22d12eb5` | Halaman Lecturers (`useLecturers`), Manage students `/participants/lecturers/{lecturer_id}` dengan dialog Add students (React Hook Form + Zod), kolom Lecturer di Students, sidebar | medium | Draft, CI clean |
| [#6300](https://github.com/dicoding-dev/dicoding/pull/6300) | `feature/apd/supervised-student-removal` | `e7dcb7ec0b5` | Domain lepas mapping: `SupervisedStudentRemoval`, event `SupervisedStudentWasRemoved` | medium | Draft, CI clean |
| [#6301](https://github.com/dicoding-dev/dicoding/pull/6301) | `feature/apd/supervised-student-removal-web` | `bd4b7b3d77c` | `DELETE /{program_code}/supervised-students`, tombol Unmap per baris + konfirmasi | medium | Draft, CI clean |
| [#6302](https://github.com/dicoding-dev/dicoding/pull/6302) | `feature/apd/supervised-student-visibility-update` | `d61c79709ae` | Domain ubah flag: `SupervisedStudentVisibilityUpdate`, event `SupervisedStudentVisibilityWasUpdated` | medium | Draft, CI clean |
| [#6303](https://github.com/dicoding-dev/dicoding/pull/6303) | `feature/apd/supervised-student-visibility-update-web` | `18455f4c783` | `PATCH /{program_code}/supervised-students`, checkbox tampil di profil per baris (langsung PATCH, toast) | medium | Draft, CI clean |

## Lanjutan 2026-11-05: bulk CSV mapping (PR 8 dan PR 9)

Card dan PRD US-1.4 meminta import mapping lewat CSV; stack di atas belum punya. Keputusan di K37 sampai K40.

- **PR 8 domain: [#6318](https://github.com/dicoding-dev/dicoding/pull/6318) draft, risk medium, preflight lengkap (0 temuan) dan di-ack 2026-11-05.** Detail awal: branch `feature/apd/supervised-student-import-domain` di atas #6303 (`18455f4c783`),
  4 commit, belum di-push, belum ada PR, belum preflight:
  - `361e4c68479` VO `SupervisedStudentImportRow`
  - `049e4ee5d14` stub gateway `getEnrolledParticipantsByEmail`, `getSupervisedStudentsByAccessListIds`
  - `2c9cc80e253` translasi id/en `SUPERVISED_STUDENT_IMPORT.*`
  - `92a3acddaff` aggregate `SupervisedStudentImport`, repository, `SupervisedStudentImportTest` (11 test lulus, psalm bersih)
- **PR 9 web + UI: PR draft dibuat 2026-11-05 (lihat `gh pr list --head feature/apd/supervised-student-import-web`), base #6318, HEAD `dfad3439300`, risk medium, preflight 0 temuan dan di-ack.** Detail awal: branch `feature/apd/supervised-student-import-web` di atas PR 8
  (`92a3acddaff`). Route `POST /{program_code}/supervised-students/import`, field file `supervised_students_csv`, flash
  `supervisedStudentImport`, translasi baru `INVALID_FILE`/`IN_PROGRESS`, dialog Import di Lecturers. Verifikasi: 4 integration
  baru, unit APD 199, integration APD 125, vitest APD 55, psalm/tsc/eslint bersih, bundle di-rebuild. Rencana awal: Isi: implementasi dua
  gateway (email dicocokkan huruf kecil, hanya baris access list program ini; mapping yang lecturer dan student-nya
  sama-sama ada di daftar ID), `SupervisedStudentImportSpecification`, action import + route, dialog Import di halaman
  Lecturers, integration test data saja (K34), vitest, rebuild bundle. Pola rujukan: `ParticipantImportSpecification`,
  `AcademicProgramDashboardParticipantImportAction`, `participant-import-dialog.tsx`.
- **Menunggu keputusan Krisna:** (a) samakan exception message lengkap (K40) di #6297, #6300, #6302 lalu restack;
  (b) tambah `$rules` ke VO APD lama (K39); (c) konfirmasi Ops: CSV untuk pasangan yang sudah ada cukup gagal, atau
  harus upsert visibility (K38); PRD baris 84 (mapping per Student atau per grup) juga masih terbuka.

Semua review route post-merge. Risk ditulis Krisna; level PR 3 sampai PR 7 dinaikkan ke medium oleh Krisna 2026-11-04.

## Preflight

- PR 1 dan PR 2: preflight lengkap (dua reviewer, check, ack). PR 1 S1 (cek campaign di repository) dismissed (K33);
  PR 2 S1 (query `getEnrolledParticipantsByAccessListIds` duplikat `getEnrolledParticipants`) ditunda.
- PR 3 sampai PR 7: preflight baru di head pasca-restack 2026-11-04 (dua reviewer per PR). Temuan yang diperbaiki
  (atas keputusan Krisna, tanpa rerun reviewer, cukup unit + integration + psalm):
  - PR 3: R1 test data `supervisedStudents` (`c2d12795609`), S2 satu nama `isVisibleOnStudentProfile` (`d9bc437594b`),
    R3 hook + normalizer Lecturers (`cbeebb3bd5b`), R2 React Hook Form + Zod (`31355ab8893`).
  - PR 4: S1 helper test tanpa parameter `null` (`e7dcb7ec0b5`).
  - Dismissed: PR 3 R4/S1/S3, PR 4 S2, PR 5 R1 (K36) dan R2. Ditunda: PR 3 S1 (salinan `csrfToken`).
- Diff PR 5 sampai PR 7 setelah restack dicek sama dengan yang di-review (PR 6 identik, PR 5 hanya konteks bergeser,
  PR 7 hanya rename `isShownOnProfile`). Detail di deskripsi tiap PR.
- Report preflight lokal (sementara, `/tmp`): PR 1 `dicoding-pr-preflight.GM2Wux`, PR 2 `GA0H7a`, PR 3 sampai PR 7
  `OLZIsZ`, `zNTH2X`, `VJQm6X`, `EVkeqF`, `98JgjL`.

## Verifikasi terakhir (tip PR 7, 2026-11-04)

psalm bersih; unit APD 66; integration APD 121; vitest APD 50/50; tsc dan eslint APD bersih; bundle di-rebuild di tiap
branch yang punya perubahan frontend.

## Temuan QA lama

- (a) Error "Choose at least one student." tetap tampil setelah memilih student: selesai dengan React Hook Form di #6299.
- (b) Query `student_search` tertinggal di URL setelah Add (redirect back): belum diperbaiki.

## Sisa

- `student-list.test.ts`: pindahkan test import sukses ke paling akhir (guideline `frontend-inertia.md:308`, happy path last), di luar PR 9.
- Saat PR di bawahnya merge dan base pindah, restack stack di atasnya (force-push oleh Krisna, `--force-with-lease`).
- PR 3b lama (Lecturer hanya melihat Student di mapping-nya) menunggu card Alfian yang menambah Lecturer ke access list.
- Tanya Ops: pernah ada Student dengan lebih dari satu lecturer tampil di profil? (K32)
- `ParticipantStoreAction` (#6249) masih punya `abort(404)` untuk program tanpa campaign; belum disamakan dengan K33.
- Stash `stash@{0}` "apd-participants-by-role-wip" dan branch `backup/apd-*` boleh dihapus setelah Krisna setuju.
  Branch lama `feature/apd/supervised-student-creation-domain` (salinan lama #6256) juga tidak dipakai.

## Data simulasi lokal (DB `dicoding`, bukan kode)

- `academic_program_dashboard_access_lists` id 48 (user 73) dan 49 (user 74), role `LECTURER`, program `pijak_2027`.
- Mapping di `academic_program_dashboard_supervised_students` hasil QA 2026-11-02 (lecturer 49). Hapus kalau tidak dipakai lagi.
