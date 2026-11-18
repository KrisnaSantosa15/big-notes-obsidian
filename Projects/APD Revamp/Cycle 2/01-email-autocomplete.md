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
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257720
sp: "1"
status: "Diimplementasikan, PR #6450 open"
pr:
  - 6450
depends-on: []
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Email autocomplete in the add-participant form (1 SP)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257720)

## Kondisi kode saat ini

- Field email di `participant-create-dialog.tsx` masih `<Input type="email">` biasa.
- Combobox (`components/base/combobox`) di APD baru dipakai form schedule (`schedule-create/components/combobox-field`). Item dimuat lengkap dari server lalu difilter di browser, tidak cocok untuk akun Dicoding yang jumlahnya jutaan.
- Acuan search ke server: `AcademicProgramDashboardLecturerShowAction` memakai `inertia()->optional()` untuk `availableStudents`, frontend memanggil `router.reload({ only: ['availableStudents'], data: { student_search } })`, dibatasi `AVAILABLE_STUDENT_LIMIT`.
- `UserSearchAction` + `UserSearchGatewayDB::getByEmail()` tidak dipakai: tanpa limit dan ikut mengirim `headline`, `company`, `unsubscribe_link`, `point`, `xp`, sehingga melanggar AC "hanya nama dan email".
- `users.email` punya index unique, jadi `LIKE 'q%'` memakai index sedangkan `LIKE '%q%'` scan seluruh tabel.

## Keputusan

| # | Keputusan | Tanggal |
| --- | --- | --- |
| A1 | Data diambil lewat Inertia partial reload: prop `accountSuggestions` di action halaman participants dengan `inertia()->optional()`, tanpa route baru. Akses Admin dijaga filter `admin` yang sudah ada. Pakai `preserveUrl` agar query search tidak masuk URL | 2026-11-17 |
| A2 | Pencocokan hanya dari awal email (`users.email LIKE 'q%'`), minimal 3 karakter, limit 10, lewat koneksi replica. Select hanya `id`, `name`, `email` | 2026-11-17 |
| A3 | Akun yang sudah terdaftar di campaign tetap tampil di hasil, ditandai "Sudah terdaftar" dan tidak bisa dipilih. Tidak disembunyikan, supaya Ops tahu alasan akun itu tidak bisa ditambahkan (komentar Krisna di card) | 2026-11-17 |
| A4 | Penanda "Sudah terdaftar" berlaku untuk semua role di campaign itu (`LEFT JOIN` access list), karena email yang terdaftar dengan role lain juga ditolak (K25) | 2026-11-17 |
| A5 | Scope hanya dialog tambah Student, bukan form tambah staff | 2026-11-17 |
| A6 | Frontend: Combobox async dengan debounce sekitar 300 ms, opsi menampilkan nama dan email, email hanya bisa diisi dengan memilih opsi | 2026-11-17 |

## Test

- Integration test query (K34): hasil cocok dari awal email, akun terdaftar ditandai, limit dipatuhi.
- Vitest dialog: debounce, opsi terdaftar disabled, memilih opsi mengisi email.


## Implementasi (2026-11-18)

Combobox email sudah diimplementasikan di PR [#6450](https://github.com/dicoding-dev/dicoding/pull/6450) (`[Feature][APD] Suggest Dicoding accounts in the add student email field`), branch `feature/apd/participant-email-autocomplete`. Risiko medium, jalur review post-merge.

- Field email di dialog Add student menjadi `ComboboxField`. Saran muncul setelah 3 karakter dengan debounce 300 ms, menampilkan email dan nama.
- A3 dan A4 dipakai: akun yang sudah terdaftar di campaign (role apa pun) tetap tampil, ditandai "(Already registered)", dan tidak bisa dipilih.
- A6 diubah: email tetap boleh diketik bebas seperti form Contributor, validasi akhir tetap di server.
- Form Contributor (Alfian) memakai query yang sama, `searchAccountCandidates` (prefix email, limit 10, flag `isRegistered`), dan sekarang juga menandai akun terdaftar dengan "(Sudah terdaftar)". Sudah didiskusikan dengan Alfian.
- Logika pencarian di frontend digabung menjadi hook bersama `useAccountEmailSearch`. `ComboboxField` sekarang mendukung opsi disabled.
- Prop yang menjalankan query (`students`, `categories`, `contributors`) dibungkus closure supaya partial reload pencarian email tidak ikut menjalankan query itu. Lihat [[Knowledge/Inertia Partial Reload dan Closure Props]].
- Tombol "Import CSV" di halaman Students diganti menjadi "Import students" (hasil diskusi UI/UX).
