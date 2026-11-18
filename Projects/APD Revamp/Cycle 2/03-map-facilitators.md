---
date: 2026-11-17
updated: 2026-11-18
type: plan
tags: [plan, brainstorm, estimation, dicoding, apd]
card: https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894512
sp: "2"
status: "Brainstorm selesai, belum dikerjakan"
pr: []
depends-on: []
index: "[[brainstorm-sp-cycle-2]]"
related-people: ["[[People/Krisna]]"]
---
# Map Facilitators to the groups they accompany (2 SP)

[Index Cycle 2](../brainstorm-sp-cycle-2.md) · [Card Basecamp](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894512)

## Kondisi kode saat ini

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

## Keputusan

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

## Rencana perubahan

| Bagian | Isi |
| --- | --- |
| Gateway | Filter `role = STUDENT` di kandidat, roster, dan CSV menjadi `role IN (STUDENT, FACILITATOR)`. Kandidat dan daftar anggota ikut mengirim `role` |
| Domain | `CampaignGroupRoster` diberi role tiap ID dan Fasilitator yang sudah ada per grup. `rejectionReason()` menolak `GROUP_ALREADY_HAS_FACILITATOR`, termasuk dua Fasilitator untuk grup yang sama dalam satu kiriman |
| UI | Badge Fasilitator di kandidat dan daftar anggota grup. Kandidat Fasilitator di-disable dengan alasan kalau grup sudah punya Fasilitator |
| Test | Unit roster dan aggregate (Fasilitator diterima, grup sudah punya Fasilitator, dua Fasilitator dalam satu kiriman), integration kandidat dan CSV, vitest badge |

## Rincian SP

| Bagian | SP |
| --- | --- |
| Gateway + UI badge + CSV (hanya filter dan tampilan) | 1 |
| Aturan satu Fasilitator per grup di roster + test | 1 |
| **Total** | **2** (1 kalau C3 ditunda) |

## Pertanyaan terbuka

- ~~**P5.** Student di beberapa grup bisa dibina dua Fasilitator.~~ Terjawab 2026-11-17 (C8): normalnya satu Student satu grup. Lebih dari satu grup hanya untuk kasus khusus, yaitu grup dengan sedikit Student dipindah atau di-merge ke grup lain, dan Student tetap tercatat di grup lama supaya datanya di grup lama masih bisa dilihat. Karena itu tidak ada guard satu grup.
- ~~**P6.** Konfirmasi C7 (tanpa lock).~~ Terjawab 2026-11-17: pakai `useCase->run`.

## Koordinasi

- **Alfian:** C1 dan C5 mengubah filter role di `AcademicProgramDashboardCampaignGroupMemberGateway` dan `CampaignGroupRosterFactory` (kode grup milik Alfian). Kabari sebelum mulai.
- **Ikhlas:** schedule sudah membaca Fasilitator dari `group_members` (`getFacilitatorIdsByGroupIds`, `getFacilitatorOptionsByProgramCodeAndCampaignId`). Pastikan aturan C3 (satu Fasilitator per grup) sejalan dengan form schedule, yang saat ini mendukung lebih dari satu Fasilitator per grup.
- Query yang memakai `group_members` untuk Student (misalnya `getGroupStudentsByCampaignIdAndGroupIds`) sudah memfilter `role = STUDENT`, jadi tidak terpengaruh. Query tanpa filter role (`getGroupMembers`) perlu ditinjau.


## Konfirmasi 2026-11-18

- **Tetap sebagai anggota grup** (C1) dan **tetap ditambahkan lewat "Tambah peserta" di halaman detail grup** (C2), kata Krisna. Usulan combobox Fasilitator per grup yang terpisah **ditolak**.
- Akibatnya CSV tetap memakai CSV anggota grup (C5), dan ganti Fasilitator tetap lewat lepas lalu tambah (C6).
- Ringkasan pekerjaan card (Krisna): UI kandidat Fasilitator di dialog Tambah peserta, guard (role FACILITATOR dan satu Fasilitator per grup), dan **kolom nama Fasilitator di tabel daftar grup**. Kolom ini tambahan ke "Rencana perubahan" bagian UI.
- **Pengecekan master (2026-11-18):** `ContributorCreation` (Store dan Index Action, serta test) sudah ada di `origin/master`, jadi Fasilitator sudah bisa ditambahkan ke campaign. Card Alfian [Add Facilitators, Lecturers, and Instructors to a campaign](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894097) masih In progress, tapi **bukan blocker** card ini.
- Jalur grup di master masih STUDENT-only (`AcademicProgramDashboardCampaignGroupMemberGateway::campaignStudents()`, filter `access_lists.role = STUDENT`). UI grup (`features/group-list`, `features/group-members`) belum menyebut Fasilitator. Ini yang diubah card ini.
- SP tetap **2**.
