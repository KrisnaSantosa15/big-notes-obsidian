---
date: 2026-11-05
updated: 2026-11-05
type: plan
tags: [plan, backlog, dicoding, apd]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Revamp APD: Backlog Implementasi Krisna

Dibuat 2026-10-23 dari brainstorming card APD milik Krisna, terakhir diperbarui 2026-10-29. Dokumen ini snapshot:
verifikasi ulang terhadap kode, PRD ([PRD Revamp APD.md](../PRD%20Revamp%20APD.md)), dan card Basecamp sebelum mengerjakan
tiap item.

Sumber rujukan:

- PRD: `docs/domains/academic-program-dashboard/PRD Revamp APD.md` (US-1.2 baris 47-57).
- Codebase APD lama (Firebase dan Apps Script): `~/projects/academic-program-dashboard/`.
- Data APD lama (export Google Sheets, berisi PII, hanya boleh dibaca agregatnya): `~/projects/apd-data/`.
- Board Basecamp "Revamp APD 21 Okt - 4 Nov" (project Engineering).

## 1. Card milik Krisna

| Card | SP | Status | Branch / PR |
| --- | --- | --- | --- |
| [[6][P1] Participants registered through Dicoding appear in APD automatically](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411893988) | 6 | Selesai: #6190, #6207, #6218, #6230 merged (per 2026-11-04) | [#6190](https://github.com/dicoding-dev/dicoding/pull/6190), [#6207](https://github.com/dicoding-dev/dicoding/pull/6207), [#6218](https://github.com/dicoding-dev/dicoding/pull/6218), [#6230](https://github.com/dicoding-dev/dicoding/pull/6230) |
| [[3][P1] Add campaign participants manually, one at a time or via CSV](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894049) | 3 | In review, lihat bagian 5. #6248 merged; #6249, #6254, #6256 open (stack, di-rebase ke master 2026-11-03) | [#6248](https://github.com/dicoding-dev/dicoding/pull/6248), [#6249](https://github.com/dicoding-dev/dicoding/pull/6249), [#6254](https://github.com/dicoding-dev/dicoding/pull/6254), [#6256](https://github.com/dicoding-dev/dicoding/pull/6256) |
| [[4][P1] Map Lecturers to their supervised Students](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894288) | 4 | In review, lihat bagian 6. Tujuh PR draft (stack lurus di atas #6256), CI clean per 2026-11-04 | [#6297](https://github.com/dicoding-dev/dicoding/pull/6297) sampai [#6303](https://github.com/dicoding-dev/dicoding/pull/6303) |

Card terkait milik orang lain:

| Card | Pemilik | Kaitan |
| --- | --- | --- |
| [[P1][6] Admin page for managing APD campaigns](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411893925) | Alfian | Tabel `academic_program_dashboard_campaigns` (`open_at`, `close_at`) menjadi sumber periode akses |
| [[P1][4] Manage groups and categories per campaign](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894168) | Alfian | Tabel kategori menjadi target FK `category_id` di access list. Keanggotaan grup memakai tabel `academic_program_dashboard_campaign_group_members` (#6238). CSV pembuatan grup: #6233, #6234, #6235 |
| US-1.6 Akses sesuai role | Hasbi | Gate akses membaca access list |

PR APD yang sudah ada (per 2026-10-23): merged #6155, #6156, #6158, #6160, #6171, #6173, #6182; open #6176, #6180.
Per 2026-10-29 tambahan merged: #6183, #6184, #6196, #6204, #6206, #6208, #6238. Open milik orang lain: #6189 (settings
edit, risk high), #6193 dan #6247 (schedule, Ikhlas), #6212 (halaman Groups), #6233 sampai #6235 (CSV grup, draft).

## 2. Keputusan

| # | Keputusan | Tanggal | Status |
| --- | --- | --- | --- |
| K1 | Peserta yang masuk APD hanya yang sudah mengisi cohort form. Trigger: listener `ScholarshipCohortWasRegistered(user_id, program_code, program_id)`, generik untuk semua program | 2026-10-23 | Final |
| K2 | Tidak membuat tabel peserta baru. Semua role memakai `academic_program_dashboard_access_lists`. Perubahan skema hanya additive dan nullable karena tabel ini masih dipakai APD lama di production | 2026-10-23 | Final |
| K3 | ~~Kolom baru di access list: `group_id`, `category_id`, `learning_path`~~. Diganti 2026-10-28 (K20): access list hanya mendapat `category_id` (nullable, dari #6204). `group_id` dihapus (#6207) dan `learning_path` tidak disimpan | 2026-10-28 | Diganti K20 |
| K4 | ~~`learning_path` disimpan sebagai snapshot `lp_name`~~. Diganti 2026-10-28 (K20): learning path dibaca saat dibutuhkan lewat `scholarship_participants.scholarship_package_id` dan lookup `config/scholarships.php` `<program>.token_packages` | 2026-10-28 | Diganti K20 |
| K5 | ~~Manual add dan CSV wajib mengisi learning path yang cocok dengan `lp_name`~~. Gugur 2026-10-28 karena learning path tidak disimpan di access list (K20). AC card [3] juga tidak meminta learning path | 2026-10-28 | Gugur |
| K6 | `program_user_id` digenerate deterministik. Pola sementara `{program_code}-{user_id}` (contoh `ai_camp-42`) sampai Ops mengonfirmasi pola final. Pola hanya ada di satu tempat (aggregate) supaya mudah diganti. 2026-10-26: Ops belum menjawab, pola sementara tetap dipakai dan tidak menahan PR. **Diganti 2026-10-26:** `program_user_id` dibuat nullable dan enrollment tidak mengisinya. Format Student ID (lihat Q1) bergantung pada data Ops (kode kampus, nomor urut, jenis kelamin) dan bisa berubah antar batch, jadi pembuatannya tetap di Ops. Kosong berarti belum diberi ID; ID diisi lewat CSV card [3] (K19). Unique `(program_user_id, user_id, program_code)` tetap aman karena MariaDB mengizinkan banyak NULL | 2026-10-26 | Final, cek Q11 |
| K7 | `accessible_from` dan `accessible_until` diambil dari `open_at` dan `close_at` campaign | 2026-10-23 | Sementara, menunggu Q2 |
| K8 | ~~`program_id` dibuat sekarang, berdampingan dengan `program_code`~~. Dibatalkan 2026-10-26: `program_id` tidak perlu karena `academic_program_dashboard_campaigns.partner_program_id` sudah ada dan `partner_programs.program_code` unique, jadi campaign bisa dicapai dari `program_code`. VO `Participant` tidak menyimpan `programId`, event `ParticipantWasEnrolled` membawa `program_code` | 2026-10-26 | Final |
| K9 | Student yang sudah terdaftar di campaign yang sama ditolak dengan exception `ALREADY_ENROLLED`, tidak di-skip diam-diam. Listener dan sync command menangani kasus ini secara eksplisit | 2026-10-23 | Final |
| K10 | Aggregate tidak menolak enrollment setelah `close_at` lewat. Deadline pendaftaran sudah dijaga `ScholarshipCohortRegistration` (cohort form deadline per kategori), dan akses setelah campaign berakhir dijaga filter `accessible_until > NOW()` | 2026-10-23 | Final, kecuali Ops meminta lain (Q3) |
| K11 | Tidak memakai interface (repository, generator, maupun service). Pembagian PR: PR Domain (tanpa migration, gateway dengan body TODO), PR Infra + Spec (migration, isi gateway, listener, sync, integration test), PR Web | 2026-10-23 | Final |
| K12 | ~~Halaman admin daftar peserta mengikuti pola React island dari Blade di `/program-campaigns`~~. Diganti 2026-10-26: `/program-campaigns` khusus admin Dicoding (pengelolaan campaign). Pengelolaan peserta (daftar, CSV card [3], tombol sync) ada di area admin APD berbasis Inertia, `/academic-program-dashboard/{program_code}/...` dengan filter `admin` dan menu sidebar **Administration**, mengikuti pola halaman Groups Alfian (#6212) | 2026-10-26 | Final |
| K13 | `close_at` campaign seharusnya NOT NULL. Perubahan migration, rule VO `Campaign` (`required`), property `?string $closeAt` menjadi `string`, dan form create/edit campaign dikerjakan Alfian. Merge lewat #6191. Sisi Krisna sudah menyusul di #6190 (commit `refactor(apd): rely on the required campaign period during enrollment`) | 2026-10-26 | Selesai |
| K14 | Tidak menambah unique `(user_id, program_code)` maupun unique `program_user_id`. Data production punya duplikat sah (peserta Asah ikut dua batch dengan `program_code` sama) dan sisa sync Sheets yang mengganti `program_user_id`. Diskusi tim (Ikhlas, Kevin, Alfian, Hasbi) sepakat `program_user_id` as is dan FK tabel lain (schedule) memakai row id access list. Duplikat dari enrollment dicegah `isParticipantEnrolled` via write connection | 2026-10-26 | Final |
| K15 | Kategori ditunda: PR 2a mengirim `categoryId` null sampai tabel kategori ada (Q4/Q5). PR 2 dipecah: 2a listener + spec + gateway + migration `learning_path`, 2b sync command backfill. PR 2a di-stack di atas #6190 | 2026-10-26 | Final |
| K16 | Enrollment tidak menerima grup. `groupId` dihapus dari `enrollStudent()`, VO `Participant`, dan insert gateway (#6190, commit `43eecb3f7c7`). Listener cohort dan tombol sync admin selalu tanpa grup; penugasan grup (termasuk CSV card [3] untuk peserta yang sudah ada) adalah use case terpisah. `Participant` adalah hasil enrollment, bukan model "full participant": daftar peserta memakai read model, penugasan grup memakai aggregate sendiri. 2026-10-28: penugasan grup menulis ke tabel `group_members` (K20), bukan kolom access list | 2026-10-26 | Final |
| K17 | ~~Kolom `category_id` ditambahkan oleh Krisna di PR 2a~~. Diganti 2026-10-26: Alfian sudah merge kolom `category_id` di #6204 (`2026_10_26_100001_alter_academic_program_dashboard_access_lists_add_category_id`). Migration PR 2a hanya `program_user_id` nullable (K6) dan, sejak 2026-10-28, drop `group_id` (K20); `learning_path` tidak lagi ditambahkan. Catatan lama: kolom `category_id` (FK ke `academic_program_dashboard_campaign_categories` dari Alfian #6204, `restrict`) ditambahkan oleh Krisna di migration PR 2a `2026_10_26_100001_..._add_learning_path_and_category_id` (digeser dari `100000` agar berjalan setelah tabel kategori). Kategori di #6204 free text tanpa key; mapping kategori pendaftaran ke `category_id` dikerjakan Alfian di PR terpisah, sampai itu spec mengirim null dengan TODO | 2026-10-26 | Final |
| K18 | Sync (PR 2b) berupa tombol tanpa input di area admin APD Inertia (K12), bukan `/program-campaigns`, sehingga tidak bentrok dengan #6189. **Diganti 2026-10-27:** tanpa queue. Sync hanya cadangan kalau event cohort gagal, jadi kandidatnya sedikit; diproses langsung di request dan admin melihat jumlah berhasil dan gagal di toast. Setiap user didaftarkan lewat `useCase->lock(ParticipantEnrollmentSpecification, "{program_code}:{user_id}")` agar klik ganda tidak membuat baris dobel. Kalau suatu saat sync perlu backfill ribuan cohort dan request timeout, klik ulang melanjutkan sisanya (anti-join) | 2026-10-27 | Final |
| K20 | Access list tidak menyimpan `learning_path` dan `group_id`. Learning path di-join dari `scholarship_participants` (K4). Keanggotaan grup memakai tabel aggregate `academic_program_dashboard_campaign_group_members` (`access_list_id`, `group_id`, unique pasangan keduanya, VO `CampaignGroupMember`) dari Alfian #6238, sehingga satu peserta bisa di lebih dari satu grup. Stack card [6] sudah mengikuti: `enrollStudent(categoryId)` tanpa learning path (#6190), migration drop `group_id` (#6207), halaman participants tanpa kolom learning path dan grup (#6218), sync tanpa lookup learning path (#6230) | 2026-10-28 | Final |
| K21 | Penambahan peserta manual (card [3]) memakai email akun Dicoding saja, bukan user ID. Salah ketik user ID bisa diam-diam menambahkan orang lain, sedangkan salah ketik email ditolak sebagai akun tidak ditemukan. Lock anti-dobel memakai `"{program_code}:{email}"`. Mempersempit AC card [3] ("email atau user ID"); rencana CSV (PR D) mengikuti | 2026-10-29 | Aktif |
| K22 | Penambahan manual (card [3]) menerima Student ID (`program_user_id`) opsional yang diketik admin. Sistem tetap tidak membuat ID (K6); kosong tetap NULL. Student ID yang sudah dipakai peserta lain di campaign yang sama ditolak (`PROGRAM_USER_ID_ALREADY_USED`) karena token login APD lama memakai `program_user_id`. Listener dan sync tetap tidak mengisi. Q11 (apakah Student ID dipakai di revamp) masih terbuka | 2026-10-29 | Aktif |
| K19 | CSV card [3] bersifat upsert dan menjadi jalur Ops untuk mengisi grup, kategori, dan Student ID. Campaign diambil dari halaman tempat CSV diunggah, bukan kolom CSV. Orang dicocokkan lewat `dicoding_user_id` (kolom yang sudah ada di sheet Ops; email boleh sebagai alternatif, gagal kalau keduanya menunjuk orang berbeda). Kunci: `(user_id, program_code)` campaign, bukan `program_user_id`, karena ID itu justru nilai yang diisi atau diubah (sync Sheets lama memakai `program_user_id` sebagai kunci sehingga ID berubah menjadi baris dobel). Ada baris: update; tidak ada: insert lewat `ParticipantEnrollment`. Sel kosong berarti tidak diubah, bukan dihapus. Lebih dari satu baris untuk user dan campaign yang sama: baris CSV gagal dengan alasan data ganda | 2026-10-26 | Diubah K23 |
| K23 | Revisi K19 (2026-10-29). CSV card [3] berkolom `email, category, student_id`: orang dicocokkan lewat email saja (K21), kolom grup dihapus karena penugasan grup milik card "Assign participants to groups" (Alfian, CSV `email, group[,group...]`), sehingga Q12 tidak lagi menyangkut card [3]. Upsert langsung dikerjakan walaupun AC card [3] menulis "sudah terdaftar ditolak", karena tanpa upsert Student ID peserta dari listener, sync, dan tambah manual tidak bisa diisi (dijanjikan di body #6190, diminta Hasbi di card [3]). Belum terdaftar: insert. Sudah terdaftar sebagai STUDENT: update kolom yang diisi (sel kosong tidak diubah). Isi sama persis: dilewati tanpa event | 2026-10-29 | Aktif |
| K24 | Student ID di CSV hanya boleh mengisi yang masih kosong. Menimpa Student ID yang sudah terisi dengan nilai lain ditolak per baris (`PROGRAM_USER_ID_ALREADY_SET`): di APD lama Student ID adalah id dokumen Firestore `users/{id}` dan bagian kunci `upsertRecords`, jadi mengganti ID sama dengan membuat identitas baru dan data lama (daily check-in, feeds) tertinggal. Student ID yang masih dipakai peserta lain di DB ditolak per baris tanpa melihat isi file (tukar ID dalam satu file butuh dua kali upload) | 2026-10-29 | Aktif |
| K25 | CSV card [3] khusus STUDENT. Staff (Fasilitator, Lecturer, Instructor) ditambah dan dihapus lewat card "Add Facilitators, Lecturers, and Instructors to a campaign" (Alfian), tetap di access list. Baris yang emailnya sudah terdaftar dengan role lain di campaign itu (termasuk baris lama `ADMIN`) ditolak per baris; role tidak bisa diganti lewat CSV. Bentuk aggregate dan VO `Participant` bisa dipakai ulang Alfian | 2026-10-29 | Aktif |
| K26 | Import CSV dan tambah manual memakai lock yang sama per campaign (`"{program_code}"`) supaya keduanya saling mengunci; lock per email dan per Student ID di #6249 diganti. Preview hanya di sisi klien: browser membaca CSV dan menampilkan baris apa adanya tanpa validasi, sedangkan server tidak punya preview. Tombol Import selalu menyimpan di bawah `useCase->lock(spec, program_code)`; baris valid tetap disimpan walaupun ada baris gagal, dan baris gagal dilaporkan setelah penyimpanan (pola sama dengan unggah CSV grup). **Revisi mekanisme 2026-10-29:** identifier `useCase->lock()` di-hash bersama nama class spec, jadi key `{program_code}` hanya mengunci spec yang sama (submit ganda, pesan IN_PROGRESS). Import vs tambah manual tidak saling mengunci: row lock (`lockForUpdate` di repository) sempat dicoba lalu dibuang karena belum ada precedent (convention utama `useCase->lock`, 119 pemakaian). Sisa risiko diterima: baris dobel kalau dua admin import dan tambah manual orang yang sama di detik yang sama | 2026-10-29 | Aktif |
| K27 | Edit satu peserta (kategori, Student ID) dari halaman participants tidak ada di PRD maupun card, tetapi akan dibuat menyusul sebagai pekerjaan terpisah. Memakai aturan update yang sama dengan upsert CSV (K23, K24) supaya aturan tidak dobel | 2026-10-29 | Aktif |
| K28 | Lecturer tetap disimpan di access list dengan role `LECTURER` (enum `ParticipantRole::LECTURER`), walaupun datanya berasal dari cohort form. Di cohort form lecturer hanya teks, bukan akun, jadi baris access list yang menjadi identitas peserta yang sah | 2026-10-30 | Aktif |
| K29 | Mapping card [4] memakai VO `SupervisedStudent(lecturerId, studentId, isVisibleOnStudentProfile)` dan aggregate `SupervisedStudentCreation::create(isVisibleOnStudentProfile)`, mengikuti `lecturer-has-students` APD lama (kolom `visibilityOnStudentProfile`). `lecturerId` dan `studentId` berisi `academic_program_dashboard_access_lists.id`, bukan `users.id`, karena satu user bisa punya beberapa baris access list (program dan role berbeda). Nama dipilih `lecturerId`/`studentId` (bukan `...AccessListId`) agar sama dengan PRD dan APD lama; migration PR 2 wajib memberi foreign key `lecturer_id`/`student_id` ke `academic_program_dashboard_access_lists.id` agar tidak tertukar dengan `users.id`. Event `SupervisedStudentWasCreated` tetap memakai `users.id` (`lecturer_user_id`, `student_user_id`) | 2026-10-30 | Aktif |
| K30 | Lecturer atau student yang tidak terdaftar di campaign dilempar `ObjectNotFoundException` dari repository (convention 48 repository, gaya `if (... === null) { throw ... }`), bukan parameter nullable di aggregate. Aggregate hanya memeriksa admin (`authorize()`), lalu role (`NOT_LECTURER`, `NOT_STUDENT`) dan mapping ganda (`ALREADY_SUPERVISED`) di `validate()`, mengikuti `ParticipantCreation` | 2026-10-30 | Aktif |
| K31 | Input mapping card [4] (repository, spec, action) memakai access list ID (`lecturer_id`, `student_id`), bukan `users.id`, seragam dengan group membership Alfian (#6262, `items.*.access_list_id`). Repository membaca lewat `getEnrolledParticipantsByAccessListIds(programCode, ids)` sehingga ID dari program lain tidak ditemukan. Bulk CSV nanti tetap memakai email (K21) di file, lalu spec bulk menerjemahkan email ke access list ID sebelum masuk aggregate | 2026-10-30 | Aktif |
| K32 | Satu Student boleh dipetakan ke banyak Lecturer (unique hanya per pasangan), sama dengan APD lama: `student-has-lecturers` menyimpan `lecturerFromInstitution[]` (`show`, tampil di profil) dan `lecturerFromNonInstitution[]` (`hide`). Profil lama menampilkan semua lecturer institusi; export lama hanya memakai `lecturerFromInstitution[0]`. Kandidat aturan lanjutan (belum dibuat): maksimal satu lecturer tampil di profil per Student, tunggu konfirmasi Ops | 2026-10-30 | Aktif |
| K33 | Program tanpa campaign ditolak repository (`ObjectNotFoundException`, konvensi tim poin 8: resource 404-style dicek di repository), bukan `abort(404)` di action tulis (Store, Destroy, Update card [4]). Mengikuti review agissept di #6256 untuk `ParticipantImportAction` (`6ad74d33683`). Respons untuk program tanpa campaign menjadi redirect back dengan error. `ParticipantStoreAction` (#6249) belum disamakan | 2026-11-03 | Aktif |
| K34 | Integration test hanya untuk data dan query server (yang disimpan, diubah, dihapus, ditolak, atau dibaca dari DB). Perilaku halaman saja (render, 404 halaman, bentuk props untuk tampilan) cukup dites di vitest. Test search student yang belum dipetakan tetap di integration karena menguji query | 2026-11-03 | Aktif |
| K35 | Props halaman APD memakai camelCase (`studentCount`, `programUserId`, `isVisibleOnStudentProfile`), mengikuti refactor master `9c3c0bcd8a8`. Field body request tetap snake_case (`lecturer_id`, `student_ids`, `is_visible_on_student_profile`). Frontend memakai satu nama yang sama dengan props, tanpa rename di normalizer | 2026-11-04 | Aktif |
| K36 | Konvensi diambil dari mayoritas codebase di luar APD (survei 2026-11-04): `ObjectNotFoundException::create()` (395 file, dibanding 71 dengan key terjemahan), form memakai React Hook Form + Zod, tiap fitur punya `*.hooks.ts`, subkomponen bersarang di `features/x/components/y/`. Akibatnya pesan not-found mentah untuk mapping yang sudah hilang diterima | 2026-11-04 | Aktif |
| K37 | Bulk CSV mapping card [4] dibuat terpisah di halaman Lecturers (bukan kolom tambahan di CSV Students card [3], lihat K25). Kolom `lecturer_email, student_email, is_visible_on_student_profile`; orang dicocokkan lewat email (K21) lalu diterjemahkan ke access list ID (K31). Aggregate baru `SupervisedStudentImport::import(rowsByNumber)`: `NOT_ADMIN` dan `NO_ROWS` membatalkan semua, selebihnya gagal per baris (`DUPLICATE_MAPPING_IN_FILE`, `NOT_LECTURER`, `NOT_STUDENT`, `INVALID_PROFILE_VISIBILITY`, `ALREADY_SUPERVISED`), baris lain tetap disimpan (PRD US-1.4). Event per baris memakai `SupervisedStudentWasCreated` | 2026-11-05 | Aktif |
| K38 | Visibility di CSV hanya `true`/`false` (tidak peka huruf besar-kecil, jadi `TRUE`/`FALSE` dari Google Sheets diterima). Sel kosong gagal per baris, tidak dianggap `false`. VO baris menyimpan teks mentah (`getIsVisibleOnStudentProfile(): string`), aggregate yang mengubahnya ke `bool` (`parseProfileVisibility`), jadi tidak ada `?bool`. Pasangan yang sudah dipetakan gagal `ALREADY_SUPERVISED`, bukan upsert visibility (ubah visibility tetap lewat checkbox #6303). Bisa diubah ke upsert kalau Ops minta | 2026-11-05 | Aktif |
| K39 | VO APD wajib punya `$rules` untuk field wajib (pola `CampaignGroupMember`), kecuali VO baris import (`ParticipantImportRow`, `SupervisedStudentImportRow`) karena throw di constructor menggagalkan seluruh file, sedangkan PRD minta gagal per baris. Survei 2026-11-05: 334 dari 511 VO domain memakai rules; Certificate (rules di row VO, all-or-nothing), Mentoring (rules bentuk baris di spec + `array_merge` kegagalan), CampaignGroup dan ParticipantImport (cek di aggregate). VO tanpa rules yang belum disesuaikan: `SupervisedStudent`, `EnrolledParticipant`, `Participant`, `ParticipantUser` | 2026-11-05 | Aktif, belum dikerjakan |
| K40 | Exception message ditulis lengkap di tiap throw dan assertion test (`'ACADEMIC_PROGRAM_DASHBOARD.SUPERVISED_STUDENT_IMPORT.NO_ROWS'`), tidak disambung dari konstanta `self::ERROR . 'NO_ROWS'`, supaya key dari `lang/*/exception.php` bisa dicari di IDE (konvensi Obsidian poin 23). Sudah diterapkan di `SupervisedStudentImport`. Masih memakai konstanta: `SupervisedStudentCreation` + test (#6297), `SupervisedStudentRemoval` (#6300), `SupervisedStudentVisibilityUpdate` (#6302) | 2026-11-05 | Aktif, sisa belum dikerjakan |

## 3. Pertanyaan terbuka

### Ops

- **Q1. Format cohort ID** (contoh `CACC004D6X0590`). Arti tiap segmen, nomor urut dihitung per apa, apakah ada segmen yang
  bergantung pada grup (grup baru diatur belakangan), di mana cohort ID dipakai, apakah boleh format sederhana asal unik, dan
  pattern untuk Fasilitator, Lecturer, dan Instructor (`FACIL-...`, `SPV...`, `SC12-...`). Pesan sudah dikirim, menunggu jawaban.
  Dua jawaban yang paling menentukan desain: (a) apakah segmen akhir (`0590`) nomor urut, karena itu berarti aggregate butuh
  input sequence dari repository dan penanganan race; (b) apakah ada segmen yang bergantung pada grup (data lama: prefix
  `CFCC123...` sama dengan prefix grup `CFC-12`), karena grup baru diatur belakangan sehingga ID tidak bisa final saat enrollment.
  Jawaban 2026-10-26 (contoh Asah `AE001B6Y1350`): `AE` kode learning path, `001` kode kampus dari data Ops, `B`/`D` periode
  (D batch 1 Januari sampai Juni, B batch 2 Juli sampai Desember), `6` tahun, `X`/`Y` jenis kelamin (wanita/laki-laki), 4 digit
  terakhir nomor urut. Berlaku "jika tidak ada perubahan"; pola lecturer, fasilitator, dan instruktur tergantung program.
  Karena itu ID dibuat Ops (K6).
- **Q11.** PRD tidak menyebut Student ID sama sekali ("informasi yang belum tersedia di Dicoding hanya grup"). Apakah Student ID
  masih dipakai di APD revamp (tampil di dashboard, ekspor) atau cukup data Ops? Termasuk daily check-in:
  `DailyCheckInFirestoreRouter` memakai `program_user_id` sebagai id dokumen Firestore, jadi NULL akan bermasalah kalau program
  revamp ikut memakai daily check-in Firestore (tanya juga ke Alfian).
- **Q2. Periode akses.** Di APD lama, Accessible From/Until diisi manual per baris di sheet "Users - Student", tetapi nilainya sama
  untuk semua peserta (DBS 2026 B1: 12 Jan sampai 14 Agu 2026, untuk college, vocational, dan vocational_lecturer). Ada juga
  command `UpdateAcademicProgramDashboardAccessibleUntil` untuk perpanjangan massal. Pertanyaan: apakah ada peserta yang aksesnya
  perlu berbeda atau diperpanjang, dan kalau tanggal tutup campaign diubah, apakah akses semua peserta ikut berubah?
- **Q3.** Apakah Ops boleh menambahkan peserta susulan setelah campaign tutup?

- **Q10.** Apakah batch baru sebuah program selalu dibuat sebagai partner program baru (seperti `pijak_2027`)? Data production
  2026-10-26: 45 user Asah punya dua baris `program_code = asah` (batch 2025 `...d5...` dan 2026 `...b6...`), 9 user bootcamp juga
  dobel. Kalau batch berikutnya tetap di partner program yang sama, satu campaign tidak bisa menampung dua periode dan
  `ALREADY_ENROLLED` menolak peserta yang ikut ulang.

### Alfian

- **Q4.** ~~Nama dan struktur tabel grup dan kategori~~. Terjawab: `academic_program_dashboard_campaign_groups` (#6196),
  `academic_program_dashboard_campaign_categories` (`id`, `campaign_id`, `name`, #6204), dan
  `academic_program_dashboard_campaign_group_members` (#6238).
- **Q5.** Kategori campaign tidak di-seed dari config, melainkan dikelola admin per campaign (free text, tambah/ubah/hapus di
  halaman edit campaign settings, #6183/#6184/#6189). Masih terbuka: siapa dan kapan mapping `scholarship_participants.category`
  ke `category_id` dikerjakan (spec enrollment masih mengirim null dengan TODO).
- **Q6.** ~~Student cukup satu grup per campaign?~~ Terjawab lewat skema: `group_members` adalah pivot dengan unique
  `(access_list_id, group_id)`, jadi satu peserta bisa di lebih dari satu grup (K20).
- **Q12.** ~~Siapa yang membuat aggregate penugasan peserta ke grup (menulis `group_members`) dan import anggota grup lewat CSV?~~
  Terjawab 2026-10-29: card "[P1][3] Assign participants to groups, one at a time or via CSV" milik Alfian (In progress). Kolom grup
  dihapus dari CSV card [3] (K23).
- **Q7.** ~~Apakah `close_at` sebaiknya wajib saat membuat campaign?~~ Terjawab 2026-10-23: ya, `close_at` harus NOT NULL (K13, merge di #6191).
  Masih terbuka: kalau `close_at` campaign diedit, apakah perlu sinkronisasi ulang `accessible_until` peserta (lihat Q2)?

### Hasbi

- **Q8.** Apakah gate akses (middleware dan dashboard) akan memakai `category_id` atau keanggotaan `group_members`? Saat ini
  gate hanya mengecek `program_code`, dan role `STUDENT` masih hardcoded.

### Tim (saat PR)

- **Q9.** ~~Apakah `program_code` diganti total dengan `program_id` setelah APD lama dimatikan?~~ Tidak relevan lagi sejak K8 dibatalkan 2026-10-26. Semua pemakai saat ini (login APD
  lama, middleware, dashboard, daily check-in, API, sync Sheets) masih memakai `program_code`.

## 4. Rencana PR card [6]

| PR | Isi | Status |
| --- | --- | --- |
| PR 1 Domain | Aggregate `ParticipantEnrollment`, VO `Participant`, enum `ParticipantRole` (`STUDENT`), event `ParticipantWasEnrolled`, getter `getOpenAt()`/`getCloseAt()` di VO `Campaign`, repository `ParticipantEnrollmentRepository`, method gateway dengan body TODO, translasi `ACADEMIC_PROGRAM_DASHBOARD.PARTICIPANT_ENROLLMENT.*`, unit test aggregate + repository dalam satu file. Tanpa `programId` (K8), grup (K16), dan Student ID (K6) | PR [#6190](https://github.com/dicoding-dev/dicoding/pull/6190), risk medium (post-merge review). 2026-10-26: rebase ke master (konflik lang dengan #6196), Student ID dihapus dari enrollment, preflight baru (R1 di-dismiss sesuai keputusan sebelumnya), ack dan push `407fcf0951d`. 2026-10-28: learning path dan grup dikeluarkan dari enrollment (K20), Hasbi minta konflik dibereskan, sudah di-rebase (head `82a8f118e97`). Status merge BLOCKED: menunggu approval |
| PR 2a Infra + Spec | Migration `2026_10_26_120000_..._make_program_user_id_nullable` dan `2026_10_28_120000_..._drop_group_id` (`category_id` sudah dari #6204), tanpa unique key (K14), isi body gateway, specification, listener `ScholarshipCohortWasRegistered`, `category_id` null dengan TODO, log enrollment gagal, integration test sukses | Draft [#6207](https://github.com/dicoding-dev/dicoding/pull/6207), stacked di atas #6190, merge setelah #6190. Risk medium. Head `d689dafe8be` (2026-10-28) berubah sejak ack `cffb6d3c901`, jadi perlu preflight dan ack ulang sebelum ready |
| PR 3 Web: daftar peserta | `GET /academic-program-dashboard/{program_code}/participants` (filter `admin`, menu sidebar Administration > Participants, K12). Read model: nama, email, role, kategori, pencarian, filter kategori. Learning path dan grup ditampilkan menyusul lewat join (K20) | Draft [#6218](https://github.com/dicoding-dev/dicoding/pull/6218), stacked di atas #6207. Head `9c96840f301` |
| PR 2b Sync | `POST /academic-program-dashboard/{program_code}/participants/sync`: tombol tanpa input di halaman participants, tanpa queue (K18), lewat use case specification, enroll user `scholarship_cohorts` program campaign yang belum terdaftar (anti-join), gagal per user dicatat di log, toast menampilkan jumlah berhasil dan gagal, wajib CSRF token. Tanpa lookup learning path (K20). Tanpa sync otomatis saat `CampaignWasCreated` (keputusan 2026-10-26) | Draft [#6230](https://github.com/dicoding-dev/dicoding/pull/6230), stacked di atas #6218. Head `eda2ee23236` |

Aturan aggregate `ParticipantEnrollment::enrollStudent(categoryId)` (urutan cek):

1. Program tidak punya campaign APD: `CAMPAIGN_NOT_FOUND`.
2. Program tidak punya program code: `PROGRAM_CODE_NOT_SET`.
3. Student sudah terdaftar di campaign yang sama: `ALREADY_ENROLLED`.
4. Berhasil: membuat `Participant` dan raise `ParticipantWasEnrolled`.

Follow-up close_at NOT NULL (K13): selesai 2026-10-26 di #6190. `getOpenAt()`/`getCloseAt()` mengembalikan `Carbon`,
cek `CAMPAIGN_CLOSE_DATE_NOT_SET` beserta test dan translasinya dihapus, dan `Participant::accessibleFrom` tidak lagi nullable.

Cakupan PRD dan AC card [6]:

| PRD / AC | Dicakup di |
| --- | --- |
| Peserta otomatis masuk APD | Test sukses (PR 1), listener (PR 2) |
| Kategori dari registrasi tercatat | `categoryId` di VO (PR 1), mapping kategori (PR 2, menunggu Q5) |
| Grup belum ada, diatur belakangan | Enrollment tanpa grup (K16), penugasan lewat `group_members` (K20) |
| Satu orang bisa ikut lebih dari satu campaign | Test "already in another campaign" (PR 1) |
| Tidak ada duplikat dalam satu campaign | Test "same campaign twice" (PR 1) |
| Daftar peserta bisa dicari dan difilter | PR 3 |

## 5. Rencana card [3] (manual add dan CSV)

AC card [3]: tambah satu peserta lewat email akun Dicoding beserta kategori (K21: user ID tidak dipakai); tambah massal lewat CSV
(email, kategori, grup); baris ditolak dengan alasan kalau akun tidak ada, kategori tidak valid, atau sudah terdaftar;
tidak ada duplikat.

- Insert memakai aggregate terpisah per jalur (`ParticipantCreation` untuk satu orang, `ParticipantBulkCreation` untuk CSV), mengikuti pola `CampaignGroupCreation`/`CampaignGroupBulkCreation`. VO `Participant` dan
  event `ParticipantWasEnrolled` dipakai bersama `ParticipantEnrollment` (listener tanpa guard admin).
- Validasi tambahan: akun Dicoding harus ada, kategori harus milik campaign tersebut (tabel kategori #6204). Learning path
  tidak divalidasi (K5 gugur).
- Baris gagal ditampilkan beserta alasannya, baris lain tetap diproses. Pola rujukan terbaru: `CampaignGroupBulkCreation`
  milik Alfian (#6233: aggregate admin-only, list kosong ditolak, gagal per baris dengan nomor baris dan alasan, dibagi PR domain,
  infra/web, UI), selain `MentoringPackageBulkCreationSpecification`.
- CSV berkolom `email, category, student_id`, tanpa grup (K23). Upsert untuk peserta yang sudah ada: memperbarui kategori dan
  mengisi Student ID yang masih kosong (K23, K24). Khusus STUDENT (K25). Lock per campaign dan preview hanya di klien (K26).
- Nama tetap `ParticipantBulkCreation` dengan `createMany(rowsByNumber)` walaupun berisi update, mengikuti
  `CertificateRecipientBulkCreation` (satu-satunya aggregate bulk dengan upsert, event `...WasInserted`/`...WasUpdated` per baris).
  Gagal per baris mengikuti `CampaignGroupBulkCreation`. Event: `ParticipantWasCreated` untuk insert, `ParticipantWasUpdated` baru untuk update.
- Command sheet lama `ImportAcademicProgramDashboardAccessLists` jangan dipakai untuk program revamp: kuncinya memakai
  `program_user_id`, sehingga peserta revamp yang ID-nya NULL akan menjadi baris dobel.

| PR | Isi | Status |
| --- | --- | --- |
| Card 3 PR A Domain: tambah satu per satu | Aggregate terpisah `ParticipantCreation(actor, userId, campaign, programCode, isAlreadyEnrolled, campaignCategoryIds)::create(categoryId)` dengan cek `NOT_ADMIN`, `CAMPAIGN_NOT_FOUND`, `PROGRAM_CODE_NOT_SET`, `CATEGORY_NOT_IN_CAMPAIGN`, `ALREADY_ENROLLED`; memakai VO `Participant` dan event `ParticipantWasEnrolled`. `ParticipantCreationRepository`, gateway `findCampaignById` (TODO), translasi `PARTICIPANT_CREATION.*`, unit test. Akun tidak ditemukan ditangani spec saat lookup email/user ID | [#6248](https://github.com/dicoding-dev/dicoding/pull/6248) merged. Final: `userId` di constructor, `create(?int categoryId)`, repository hanya menerima `programCode` (stub `findCampaignByProgramCode`, `getCategoryIdsByProgramCode`); khusus STUDENT, role staff menyusul saat enum staff (#6193 Ikhlas) dan card [4] Alfian membutuhkannya |
| Card 3 PR B Infra + Web: tambah satu per satu | Isi body gateway `findCampaignByProgramCode` dan `getCategoryIdsByProgramCode` (stub dari #6248), spec manual add (lookup user lewat email, akun tidak ada ditolak, K21) dijalankan lewat `useCase->lock(spec, "{program_code}:{email}")` agar klik ganda tidak membuat baris dobel (access list tanpa unique key, K14), action `POST /academic-program-dashboard/{program_code}/participants`, form/dialog di halaman participants, integration test sukses | [#6249](https://github.com/dicoding-dev/dicoding/pull/6249) open (base master), menunggu review per 2026-11-04 |
| Card 3 PR C Domain: CSV | Aggregate `ParticipantBulkCreation::createMany(rowsByNumber)`: `NOT_ADMIN` dan `NO_ROWS` membatalkan semua, gagal per baris (akun tidak ada, kategori di luar campaign, role lain, email atau Student ID ganda dalam file, Student ID dipakai orang lain, Student ID sudah terisi), insert atau update (K23 sampai K25), event `ParticipantWasCreated`/`ParticipantWasUpdated`, repository + gateway stub, translasi, unit test | [#6254](https://github.com/dicoding-dev/dicoding/pull/6254) open (menunggu review per 2026-11-04), base #6249, risk medium (post-merge), preflight + ack `b5b0e54cf86` (digest `091c92f9`). Temuan KY-1 (email dan Student ID masuk dua kali) diperbaiki: repository membaca lookup dari baris yang sama, normalisasi hanya di aggregate. Lookup email pindah ke gateway access list (`getUserIdsByEmail`), `MemberGateway` tidak disentuh. CI 2026-10-29: clean |
| Card 3 PR D Infra + Web + UI: CSV | `POST /academic-program-dashboard/{program_code}/participants/import` (`participants_csv`): selalu `useCase->lock(spec, program_code)` lalu save, tanpa preview di server. Preview hanya di klien (browser membaca CSV dan menampilkan baris tanpa validasi); baris gagal dilaporkan setelah penyimpanan. Aggregate mencatat email di tiap baris gagal, spec hanya menerjemahkan alasan. Flash `participantImport` (`created_count`, `updated_count`, `failed_rows` row/email/reason). Isi 4 stub gateway, lock tambah manual jadi per campaign (K26), dialog import di halaman participants | [#6256](https://github.com/dicoding-dev/dicoding/pull/6256) open (base #6254), menunggu review per 2026-11-04. Urusan domain dipindah ke #6254, web di #6256; copy impor CSV bahasa Inggris |
| Follow-up: edit satu peserta | Ubah kategori dan isi Student ID dari halaman participants (K27) | Setelah PR D |

Catatan 2026-10-29: #6248 sengaja berbasis `master`, bukan stacked, karena dependensinya (#6190) sudah merge dan PR ini tidak memakai apa pun dari #6207, #6218, #6230. Merge #6248 dengan #6207 bersih; dengan #6230 hanya konflik `public/bundle/*` karena #6230 tertinggal dari master (rebuild saat rebase).

Ditunggu dari pihak lain: mapping kategori pendaftaran ke `category_id` (Q5), merge #6212 halaman Groups (Alfian), Q10 dan Q11 (Ops).

## 6. Rencana card [4] (mapping Lecturer ke Student)

AC card [4]: Ops menghubungkan Lecturer dengan Student yang dibinanya (PRD US-1.4); satu Lecturer bisa membina banyak Student;
Lecturer hanya melihat Student di mapping-nya.

| PR | Isi | Status |
| --- | --- | --- |
| Card 4 PR 1 Domain | Enum `LECTURER` (K28), VO `SupervisedStudent`, event `SupervisedStudentWasCreated`, aggregate bulk `SupervisedStudentCreation` (satu lecturer, banyak student, satu flag profil per batch, validasi all-or-nothing), repository, gateway stub | [#6297](https://github.com/dicoding-dev/dicoding/pull/6297) draft, risk low |
| Card 4 PR 2 Infra + Web | Migration `academic_program_dashboard_supervised_students` (FK ke access list, unique pasangan), gateway, spec, `POST /{program_code}/supervised-students` (`lecturer_id`, `student_ids[]`, `is_visible_on_student_profile`), program tanpa campaign ditolak repository (K33) | [#6298](https://github.com/dicoding-dev/dicoding/pull/6298) draft, risk medium |
| Card 4 PR 3 UI | Halaman Lecturers dan Manage students (React Hook Form + Zod), kolom Lecturer di Students, sidebar, props camelCase (K35), integration test hanya data (K34) | [#6299](https://github.com/dicoding-dev/dicoding/pull/6299) draft, risk medium |
| Card 4 PR 4 Domain lepas | `SupervisedStudentRemoval`, event `SupervisedStudentWasRemoved`, mapping tidak ada = `ObjectNotFoundException` (K30) | [#6300](https://github.com/dicoding-dev/dicoding/pull/6300) draft, risk medium |
| Card 4 PR 5 Web lepas | `DELETE /{program_code}/supervised-students`, tombol Unmap per baris di Manage students | [#6301](https://github.com/dicoding-dev/dicoding/pull/6301) draft, risk medium |
| Card 4 PR 6 Domain flag | `SupervisedStudentVisibilityUpdate`, event `SupervisedStudentVisibilityWasUpdated`, boleh lebih dari satu lecturer tampil (K32) | [#6302](https://github.com/dicoding-dev/dicoding/pull/6302) draft, risk medium |
| Card 4 PR 7 Web flag | `PATCH /{program_code}/supervised-students`, checkbox tampil di profil per baris | [#6303](https://github.com/dicoding-dev/dicoding/pull/6303) draft, risk medium |
| Card 4 PR 8 Domain import CSV | VO `SupervisedStudentImportRow`, aggregate `SupervisedStudentImport` (gagal per baris, K37, K38), `SupervisedStudentImportRepository`, stub gateway `getEnrolledParticipantsByEmail` (access list) dan `getSupervisedStudentsByAccessListIds` (supervised student), translasi `SUPERVISED_STUDENT_IMPORT.*`, 11 unit test | Branch `feature/apd/supervised-student-import-domain` di atas #6303, 4 commit lokal (`361e4c68479` sampai `92a3acddaff`), belum di-push dan belum ada PR |
| Card 4 PR 9 Web + UI import CSV | Implementasi dua gateway, `SupervisedStudentImportSpecification` (pola `ParticipantImportSpecification`, `useCase->lock` per program), action `POST /{program_code}/supervised-students/import` (baca CSV pola `ParticipantImportAction`, header wajib `lecturer_email`), dialog Import di halaman Lecturers dengan preview klien dan tabel baris gagal (pola `participant-import-dialog`), integration test data, vitest, rebuild bundle | Belum dimulai. Branch rencana `feature/apd/supervised-student-import-web` di atas PR 8 |
| Card 4 PR 3b Tampilan Lecturer | Form mapping di halaman participants, Lecturer hanya melihat Student di mapping-nya | Setelah PR 2. Bergantung card "Add Facilitators, Lecturers, and Instructors to a campaign" (Alfian) untuk menambahkan Lecturer ke access list |

## 7. Temuan penting

- `scholarship_participants.scholarship_package_id` bukan id tabel `learning_paths`. Kolom ini dulu bernama `chosen_learning_path_id`
  dan FK-nya dicabut di PR #3357. Sekarang nilainya adalah key `token_packages` per program di `config/scholarships.php`. Id yang
  sama punya arti berbeda di tiap program. Program dengan satu package (Pijak, BangunNegeri, AWS, IBM, Mastercard) selalu
  mengisi `1` sebagai placeholder.
- AI Camp (program 2301): `token_packages` 1 = AI Engineer, 2 = Data Scientist. Kategori: `vhs` (SMK), `college` (Universitas),
  `vhs_teacher` (Guru SMK). Ini setara dengan kategori APD lama (`vocational`, `college`, `vocational_lecturer`).
- Untuk Pijak, `scholarship_participants.category` berisi hasil seleksi (`intensive_eligible`, `not_eligible`), bukan kategori peserta.
- Pemakai `academic_program_dashboard_access_lists` saat ini: `AcademicProgramDashboardLoginUrlGenerator` (token login APD lama
  memakai `program_user_id`), `HandleAcademicProgramDashboardInertiaRequests`, `HomeDashboardSpecification`, `StudentDashboardShellVM`,
  `DailyCheckInGateway`, `AcademicProgramsIndexAction`, `AcademicProgramDashboardAccessSyncSpecification`,
  `UpdateAcademicProgramDashboardAccessibleUntil`.
- Unique key access list: `(program_user_id, user_id, program_code)`.
- Data APD lama (DBS 2026 B1): student ID seperti `CFCC123D4Y5678`, prefix-nya sama dengan prefix grup (`CFC-12`). Mentor `FACIL-...`,
  Lecturer `SPV...`, Instructor `SC12-...`.


## Catatan lintas card (2026-11-17)

- K20 (learning path tidak disimpan di access list) dipakai card Cycle-2 [Course progress is calculated automatically from Dicoding learning data](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257784): konfigurasi course dikaitkan ke `scholarship_package_id`, learning path Student dibaca lewat join `scholarship_participants`. Detail di [Cycle 2/05-course-progress.md](../Cycle%202/05-course-progress.md) (E1, P9 sampai P11).
- Kategori dan learning path adalah dua hal berbeda: kategori = jenis Student (SMK, umum, guru SMK), learning path = jalur belajar (AI Engineer, Data Scientist). Konfigurasi course mengikuti learning path.

### K20 gugur (2026-11-18)

- Learning path sekarang disimpan per campaign di tabel baru `academic_program_dashboard_campaign_learning_paths` (`campaign_id`, `name`, `scholarship_package_id` nullable, audit). Access list mendapat kolom `learning_path_id` (nullable FK).
- Alasan K20 dulu (nama learning path berganti per campaign dan diambil dari config) tidak berlaku lagi dengan tabel per campaign. Disetujui Krisna 2026-11-18.
- Auto-register memetakan `scholarship_participants.scholarship_package_id` ke `campaign_learning_paths.scholarship_package_id`. Peserta manual dan CSV memilih learning path di form.
- Detail di [Cycle 2/05-course-progress.md](../Cycle%202/05-course-progress.md), "Keputusan 2026-11-18".
