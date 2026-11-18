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
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765
sp: 2 (draft)
status: Di-hold sampai dependensi selesai (P16-P19)
pr: []
depends-on:
  - 03-map-facilitators
  - 04-progress-status
  - 05-course-progress
index: "[[Projects/APD Revamp/Cycle 2/index]]"
related-people:
  - "[[People/Krisna]]"
---
# Facilitator see the progress of their supervised Students (2 SP, draft)

[Index Cycle 2](index.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765)

Card: [Facilitator see the progress of their supervised Students](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257765) (Planning)

## Isi AC
- Fasilitator melihat daftar Student binaannya beserta ringkasan progress masing-masing.
- Dari daftar, Fasilitator membuka progress satu Student dengan bagian yang sama seperti tampilan Student. Di AC tertulis "Lecturer", sisa dari versi card yang lama.
- Student di luar mapping menghasilkan 403/404 (AC C4 yang dipindahkan dari card Map Facilitators).
- Perubahan mapping langsung terlihat di daftar.

## Komentar card
- **Hasbi (2026-11-16):** "perlu ada tabel yang menyimpan informasi profil dosen". Sisa dari versi Lecturer, **tidak relevan** untuk Fasilitator.
- **Krisna (2026-11-17):** depend ke Map Facilitators (grup sebagai mapping), Course progress, Progress status, serta card Attendance, Assignment, dan Point histories.

- **Krisna (2026-11-18 04:40):** card ini di-hold sampai semua dependensinya selesai dikerjakan. SP belum diisi di judul card.

## Kondisi APD lama
`Chooser.vue` adalah pemilih Student, bukan tabel ringkasan:
- Mentor memilih grup (selector muncul kalau punya lebih dari satu grup), lalu memilih satu atau beberapa Student.
- Ada filter status progress (`selectedProgressFilters`).
- Route `/progress` dan `/u/:userId/progress`.

## Usulan keputusan (draft)

| # | Usulan |
| --- | --- |
| H1 | Student binaan = Student (`role = STUDENT`) di semua grup yang Fasilitatornya dia, lewat `group_members` (C1, C8). Di-distinct karena ada kasus merge. Dibaca tiap request, sehingga perubahan mapping langsung terlihat |
| H2 | Daftar berisi nama, email, grup, status progress (kalkulator [bagian 4](04-progress-status.md)), dan course "x/y selesai" ([bagian 5](05-course-progress.md)). Filter grup dan status, mengikuti APD lama |
| H3 | Detail per Student (`/{program_code}/facilitator/students/{id}`). Student di luar H1 menghasilkan 404 |
| H4 | Isi detail memakai komponen tampilan progress Student dari card [Students see their learning progress in APD](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257746) (belum ada assignee) |
| H5 | Setiap bagian detail mengikuti saklar fitur campaign, sama dengan tampilan Student |

Pembaruan 2026-11-17: status di kolom ringkasan sekarang dihitung otomatis ([bagian 4](04-progress-status.md)), jadi card ini cukup memanggil kalkulator yang sama.

## Ketergantungan

| Bergantung ke | Pemilik | Sifat |
| --- | --- | --- |
| Kerangka halaman Fasilitator dan akses per role (10411894672) | Hasbi | Blocker |
| Map Facilitators | Krisna | Blocker milik sendiri |
| Students see their learning progress (komponen detail) | Belum ada assignee | Blocker untuk H4 |
| Progress status, Course progress | Krisna | Untuk kolom ringkasan |
| Attendance | Belum ada assignee | Isi detail |
| Assignments, point histories | Alfian | Isi detail |

## Rincian SP (draft)

| Bagian | SP |
| --- | --- |
| Query Student binaan + daftar + filter grup/status | 1 |
| Halaman detail + otorisasi 404 + membungkus komponen Student | 0,5 |
| Test (integration otorisasi, vitest daftar) | 0,5 |
| **Total** | **2** |

## Pertanyaan terbuka
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
