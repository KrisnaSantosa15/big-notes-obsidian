---
date: 2026-11-11
updated: 2026-11-11
type: reference
tags: [reference, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Pijak 2027: Daftar Command

Diperbarui 2026-11-11. Semua command dijalankan lewat `deck art <command>` di local. Di production, jalankan `php artisan <command>`
di server aplikasi. Config yang dipakai ada di blok `scholarships.pijak` (`config/scholarships.php`).

`program_id` Pijak 2027: **2304** di production (PR [#6369](https://github.com/dicoding-dev/dicoding/pull/6369), merged
2026-11-10), **2208** di local (override di `bootstrap/environments/local/scholarships.php`).

## Ringkasan

| Command | Untuk apa | Kapan dipakai |
|---|---|---|
| `feature:toggle enable pijak` | Membuka route `/pijak` (registrasi, administrasi, pengumuman, leaderboard) | Saat pendaftaran dibuka |
| `campaigns:exams:calculate-results pijak` | Menghitung skor Tes Kepribadian (traits) | Sebelum export, supaya kolom Traits Assessment terisi |
| `scholarships:pijak:export-participants` | Export peserta ke Google Sheets (10 sheet) | Terjadwal 07.00 dan 14.00 WIB (item 17), atau manual |
| `scholarships:pijak:sync-referral-leaderboard` | Mengganti snapshot leaderboard referral dari sheet Ops | Manual, setiap kali Ops memperbarui sheet leaderboard |
| `scholarships:pijak:announce-progressive` | Enroll peserta Progresif ke 4 kelas, membuka pengumuman, mengirim email | Per batch, setelah Ops memberikan daftar id |
| `scholarships:pijak:announce-not-selected` | Membuka pengumuman tidak terpilih (akses IBM SkillsBuild hingga 30 Maret 2027) | Sekali di akhir seleksi, setelah Ops memberikan daftar id |
| `scholarships:pijak:remind-cohort-form` | Mengirim pengingat isi Formulir Data Cohort ke peserta yang menerima offering 24 jam lalu dan belum mengisi | Setiap jam lewat cron server (perlu dijadwalkan infra) |
| `academy:notify:mct_deadline` | Menutup token MCT yang mencapai deadline dan mengirim email "program berakhir" (semua program) | Otomatis setiap jam lewat cron server |
| `scholarships:letters:regenerate` | Mencetak ulang PDF surat beasiswa untuk satu user (mis. Surat Komitmen Pijak 2027) | Setelah data peserta dikoreksi, atau surat sebelumnya gagal dibuat |

## 1. Membuka dan menutup route Pijak 2027

```bash
deck art feature:toggle enable pijak
deck art feature:toggle disable pijak
```

Riwayat:
- PR [#6170](https://github.com/dicoding-dev/dicoding/pull/6170) (merged 2026-10-23): route `/pijak2027` dijaga flag `pijak2027`.
- PR [#6330](https://github.com/dicoding-dev/dicoding/pull/6330) (merged 2026-11-09): route dipindah ke `/pijak`, nama route
  `pijak2027.*` menjadi `pijak.*`, dan middleware diganti ke `features:pijak` (commit `f8cac950ddc`). `app/routes/pijak_flash.php`
  dan `pijak_old.php` tidak lagi dimuat di `app/routes.php`.

Route `pijak/*` (`app/routes/pijak.php`) dijaga middleware `features:pijak` (`FeatureRouteFilter`). Kalau feature `pijak` mati,
semua halaman Pijak 2027 diarahkan ke home dengan pesan "Maaf feature ini belum tersedia".

- Flag `pijak2027` tidak dibaca lagi oleh route mana pun.
- Tidak ada redirect dari `/pijak2027/*` ke `/pijak/*`. Route sudah dipindah sebelum pendaftaran dibuka, jadi tidak ada link
  `/pijak2027` di email peserta.
- Feature yang belum punya baris di tabel `toggles` dianggap mati.
- `enable` tanpa `--users` juga menyalakan `admin_status`, jadi tidak bisa dipakai untuk membuka khusus admin. `disable` mematikan
  keduanya.
- QA di production sebelum dibuka:
  - Per user: `deck art feature:toggle enable pijak --users=101,102`. Tutup lagi dengan `disable pijak --users=101,102`.
  - Tanpa login per user: buka halaman dengan `?bypass=lOa9dvWb42T5nr`. Nilainya disimpan di session, jadi berlaku untuk
    halaman `pijak` berikutnya selama flag masih mati.
- `enable` global langsung berlaku untuk semua user. `--users` tidak menghapus cache per user (`features:pijak:user:{id}`,
  60 menit), jadi user QA yang sempat membuka halaman saat flag mati bisa tetap diarahkan ke home sampai 60 menit. Nyalakan flag
  per user sebelum user tersebut membuka halaman.
- Jangan matikan `pijak` setelah pendaftaran dibuka. Tautan di email (offering, Formulir Data Cohort, pengumuman) mengarah ke
  `/pijak/...` dan ikut tertutup.

Cek di DB:

```sql
SELECT feature, status, admin_status FROM toggles WHERE feature = 'pijak';
SELECT user_id, status FROM feature_users WHERE feature = 'pijak';
```

## 2. Export peserta ke Google Sheets

```bash
deck art scholarships:pijak:export-participants
```

- Tanpa argumen. `program_id` diambil dari config.
- Hanya mendorong job `Pijak2027ParticipantsExportHandler` ke queue, jadi export berjalan di background. Email konfirmasi dikirim ke
  `export_recipient_email` setelah selesai.
- Sheet tujuan: `export_google_sheets_id`. Isi tiap sheet dihapus lalu ditulis ulang, jadi sheet selalu menunjukkan kondisi saat
  export, bukan riwayat.
- Di local, queue harus berjalan (`beanstalkd`) supaya job diproses.

### Daftar sheet

Hasilnya 10 sheet: 6 sheet peserta (satu per nilai `scholarship_participants.category`) dan 4 sheet pendukung.

**Sheet peserta.** Kategori awal ditentukan saat peserta submit registrasi
(`PijakParticipantRegistration::determineEligibilityStatus()`). Setelah itu kategori hanya berubah lewat command dengan daftar
id dari Ops.

| Sheet | Kategori | Jalur masuk |
|---|---|---|
| Young Adult | `intensive_eligible` | Registrasi: WNI, tidak sedang sekolah/kuliah, usia 18 sampai 34 |
| Vocational Student | `progressive_eligible` | Registrasi: WNI, sedang sekolah/kuliah jenjang SMK/D1/D2/D3/D4 |
| Not Eligible | `not_eligible` | Registrasi: tidak masuk dua kriteria di atas (kelas Bitt) |
| Young Adult - Not Selected | `intensive_ineligible` | Dari Young Adult lewat `announce-not-selected` (bagian 9) |
| Vocational Student - Not Selected | `progressive_ineligible` | Dari Vocational Student lewat `announce-not-selected` (bagian 9) |
| Vocational Student - Progressive | `progressive_selected` | Dari Vocational Student lewat `announce-progressive` (bagian 4) |

- Sheet jalur Intensif (Young Adult dan Young Adult - Not Selected) punya kolom Zona Waktu, nilai tiap Tes Teknis, General
  Assessment, dan Traits Assessment. Sheet lain hanya berisi kolom dasar.
- **Young Adult - Not Selected:** peserta YA/Intensif yang sudah diumumkan tidak terpilih (misalnya tidak menyelesaikan minimal 1
  kelas IBM SkillsBuild). Hanya peserta yang belum mendapat offering yang bisa diumumkan. Peserta yang sudah mendapat offering
  (diterima, ditolak, atau expired) tetap di sheet Young Adult, dan status offering-nya dilihat di sheet Offering & Cohort Data.
- **Vocational Student - Not Selected:** peserta VS/Progresif yang sudah diumumkan tidak terpilih.
- **Vocational Student - Progressive:** peserta VS yang sudah diumumkan per batch lolos ke Beasiswa Progresif (sudah di-enroll ke 4
  kelas Progresif dan menerima email pengumuman).
- Perpindahan ke tiga sheet di atas baru terlihat pada export berikutnya setelah command dijalankan. Sheet asal hanya berisi peserta
  yang belum diproses. Kalau Ops perlu melihat hasilnya langsung, jalankan export manual setelah command.
- Not Eligible dan tiga sheet hasil pengumuman adalah status akhir. Kedua command menolak peserta di kategori ini.

**Sheet pendukung.**

| Sheet | Isi | Jalur masuk |
|---|---|---|
| Pendaftaran Parsial | UID, nama, email, no. HP | Ada auto-save di `campaign_initial_registrations` tetapi belum submit. Setelah submit, peserta pindah ke salah satu sheet registrasi |
| Surat Komitmen | Letter ID, UID, link SK yang dibuat sistem dan yang sudah ditandatangani | Peserta jalur Intensif (`intensive_eligible` dan `intensive_ineligible`) yang file suratnya sudah dibuat. Peserta YA yang pindah ke Not Selected tetap ada di sheet ini |
| Offering & Cohort Data | Tanggal offering, due date, status, tanggal konfirmasi, kontak darurat | Semua baris `scholarship_offerings` program ini. Offering dikirim admin lewat `/scholarships/offering` (upload CSV), data kontak dari Formulir Data Cohort |
| Re-offer Request | UID, waktu permohonan, status dan due date offering | Peserta yang meminta penawaran ulang setelah offering expired (`other_requirements.reoffer_requested_at`). Ops yang memutuskan offering ulang |

### Kenapa peserta pindah sheet

Campaign lain (Coding Camp, Asah, Pijak 2026) membuka pengumuman dengan satu flag global (`feature:toggle enable
*-final-selection-result`), dan hasil seleksi tiap peserta dihitung saat halaman dibuka. Category peserta tidak berubah setelah
registrasi, jadi export tidak perlu sheet tambahan.

Pijak 2027 berbeda karena Ops mengumumkan Progresif per batch dan daftar tidak terpilih berasal dari Ops, jadi butuh penanda per
peserta. Flag per user sempat dipakai, tetapi bisa dinyalakan sendiri oleh peserta lewat `/features/enabled`, sehingga penanda
dipindah ke kolom `category` (PR #6169 dan #6197). Export membaca peserta per nilai `category`. Tanpa sheet baru, peserta yang sudah
diumumkan hilang dari export, dan `sheetName()` (tanpa `default`) error untuk kategori yang belum dipetakan. Opsi lain, yaitu
menggabungkan semua kategori satu jalur di satu sheet dengan kolom "Hasil Seleksi", dibahas 2026-10-23 dan tidak dipilih.

## 3. Hitung skor Tes Kepribadian (traits)

```bash
deck art campaigns:exams:calculate-results pijak
deck art campaigns:exams:calculate-results pijak --limits=5000
```

- Argumen `pijak` adalah nama blok config. Opsi `--limits` (`-l`) membatasi jumlah peserta per run, default 100.
- Memakai `weighted_exam_calculations[1]`: bobot dari Google Sheet `'Pijak - Assessment Traits'!A2:C`, tutorial traits 45128,
  label skor `pijak_exam_traits`. Hasil disimpan di `campaign_participants_exam_scores`.
- Berjalan lewat queue (`CalculateExamTraitsHandler`), jadi hasilnya tidak langsung ada.
- Tiap peserta hanya dihitung sekali. Peserta yang sudah punya skor dilewati.
- **Butuh PR #6017 merge.** Tanpa config `weighted_exam_calculations`, command ini gagal.
- Jalankan dengan limit cukup besar sebelum export terjadwal, supaya kolom Traits Assessment terisi skor terbaru.

## 4. Pengumuman per batch untuk peserta Progresif

Ditambahkan di PR [#6021](https://github.com/dicoding-dev/dicoding/pull/6021) (merged 2026-10-08).

```bash
deck art scholarships:pijak:announce-progressive --userIds=101,102,103
```

- `--userIds` (`-uid`): daftar user id dari Ops, dipisah koma. Wajib. Id dobel dibuang otomatis.
- Id negatif atau nol menghentikan command sebelum memproses apa pun (`User id must be a positive integer.`).
- Untuk tiap id:
  - Bukan peserta Pijak 2027: dihitung gagal, tidak ada yang ditulis.
  - Kategori sudah `progressive_selected`: dilewati. Jadi menjalankan ulang batch yang sama aman.
  - Kategori selain `progressive_eligible` (`intensive_eligible`, `not_eligible`, `*_ineligible`): dihitung gagal, tidak ada yang ditulis.
  - `progressive_eligible`: token Progresif dibuat dan langsung di-redeem ke kelas `progressive_course_ids` (862, 867, 753, 123) dengan
    masa akses `progressive_token_active_period` (30 hari), owner `token_owner_email`, deskripsi
    `Pijak 2027 in collaboration with IBM SkillsBuild Progressive`. Kolom `scholarship_participants.category` diubah jadi
    `progressive_selected` sehingga halaman pengumuman Progresif terbuka, lalu email
    `emails.scholarships.pijak.progressive-announcement` dikirim. Email bawaan enroll kelas tidak dikirim karena daftar kelas
    sudah ada di email pengumuman.
  - `progressive_eligible` yang sudah punya token Progresif aktif (run sebelumnya gagal setelah token dibuat): token tidak dibuat
    lagi, kategori diubah jadi `progressive_selected`, dan email pengumuman dikirim.
- Setelah diumumkan, step Pengumuman di sidebar peserta ikut ceklis.
- Pengumuman tidak memakai feature flag lagi (sejak PR [#6197](https://github.com/dicoding-dev/dicoding/pull/6197), merged 2026-10-26), jadi peserta tidak bisa membukanya sendiri lewat `/features/enabled`.
- Di local, `progressive_course_ids` diisi `[2, 3, 5, 10]`. Config local digabung per index dengan config dasar, jadi
  isinya harus tetap 4 id supaya tidak tercampur dengan id production (753, 123) yang tidak ada di DB local.
- Peserta YA (`intensive_eligible`) tidak masuk Progresif: yang menolak offering mendapat kartu "Anda Telah Menolak", yang
  expired mendapat jalur penawaran ulang, dan yang tidak terpilih diumumkan lewat bagian 9.
- Contoh output:

  ```
  Announced developer (user_id 5).
  Skipped developer2 (user_id 6), already announced as progressive.
  Failed to announce user_id 7: User 7 with category intensive_eligible cannot be announced as progressive.
  Failed to announce user_id 9999: User 9999 is not a Pijak participant.
  Announced: 1, Skipped: 1, Failed: 2
  ```

- Batas praktis sekitar 16 ribu id per argumen (batas satu argumen CLI Linux 128 KB). Untuk batch lebih besar, pecah jadi
  beberapa run.

## 5. Import daftar email IBM yang sudah pernah dipakai (untuk tim infra)

Bukan command artisan. Data dimasukkan langsung oleh tim infra ke tabel generik `meta_contents` (satu baris per email,
`key` sebagai nama daftar, `value` sebagai email). Peserta yang mengisi email IBM yang ada di daftar ini ditolak di Syarat
Administrasi dengan pesan "Email yang Anda masukkan sudah pernah terdaftar di sistem kami".

Urutan: deploy migration `add_key_value_unique_to_meta_contents_table`, import data, baru pendaftaran dibuka. Tanpa baris
dengan key yang dicek berarti tidak ada email yang ditolak.

- Sebelum migration jalan di production, pastikan tidak ada pasangan `(key, value)` duplikat dan `ROW_FORMAT` tabel
  `meta_contents` adalah `Dynamic`, karena unique `(key, value(255))` butuh 1530 byte.
- Format file dari Ops: CSV satu kolom berisi email, baris pertama header.
- Key yang dicek Pijak 2027 diatur di config `scholarships.pijak.ibm_account_exclusion_keys`, nilai awal
  `['pijak:ibmsb:registered_email']`. Wave berikutnya bisa menambah key lain ke array itu tanpa menyalin ulang data.
- Email wajib dinormalisasi (trim, buang tanda kutip, lowercase) dan duplikat diabaikan. Perintah ini menerima CSV berakhiran
  baris `\n` maupun `\r\n` (diverifikasi di DB local 2026-10-06). Client perlu `--local-infile=1`:

  ```sql
  LOAD DATA LOCAL INFILE '/path/to/ibm_skillsbuild_used.csv'
  IGNORE INTO TABLE meta_contents
  LINES TERMINATED BY '\n'
  IGNORE 1 LINES
  (@email)
  SET `key` = 'pijak:ibmsb:registered_email',
      value = LOWER(TRIM(BOTH '"' FROM TRIM(REPLACE(@email, '\r', '')))),
      created_at = NOW(),
      updated_at = NOW();
  ```

- Cek hasil: `SELECT `key`, COUNT(*) FROM meta_contents WHERE `key` LIKE 'pijak:%' GROUP BY `key`;`
- Kalau Ops mengirim daftar susulan, jalankan perintah yang sama. Email yang sudah ada dilewati karena unique
  `(key, value(255))`.

## 6. Menutup token MCT yang mencapai deadline (bukan khusus Pijak)

```bash
deck art academy:notify:mct_deadline
```

- Command umum untuk semua multi-course token (MCT), bukan khusus Pijak. Tidak perlu dijalankan manual, sudah berjalan
  **setiap jam** lewat cron di server (jadwalnya diatur infra, tidak ada di repo).
- Tanpa argumen. Mengambil token berstatus `USED` yang `deadline_at`-nya jatuh dalam **1 jam terakhir**
  (`MultiCourseTokensGateway::getReachedDeadlineTokensInCurrentHour()`), lalu untuk tiap token:
  - Mengirim email "Masa belajar Anda pada program {nama program} telah berakhir"
    (`emails.developerjourney.multi-course-token-study-deadline`), kecuali kolom `should_send_ended_email` bernilai 0.
  - Mengubah status token menjadi `ENDED`, termasuk token yang emailnya dilewati.
- Karena jendelanya hanya 1 jam ke belakang, token dengan deadline di jam saat cron tidak berjalan tidak ikut diproses.
- Dampak ke token Pijak 2027:

  | Token | Dibuat di | Email "program berakhir" |
  |---|---|---|
  | Tes Seleksi Intensif (887), deadline 7 Feb 2027 (`token_deadline`, PR #6376) | `PijakRegistrationSpecification::autoRedeemToken()` | Tidak dikirim sejak PR [#6038](https://github.com/dicoding-dev/dicoding/pull/6038) |
  | Progresif (862, 867, 753, 123), 30 hari | `PijakProgressiveAnnouncementSpecification` (PR #6021) | Dikirim |

- Not Eligible tidak lagi mendapat token MCT. Auto enroll kelas 570 dihapus di PR #6225 dan diganti kelas Bitt (item 42).
- Kolom `should_send_ended_email` ditambahkan di PR #6032 dan dipakai command ini sejak PR #6034. Token yang dibuat admin
  lewat form MCT bisa mematikannya dengan checkbox "Email Program Berakhir".

## 7. Pengingat isi Formulir Data Cohort 24 jam

Ditambahkan di PR [#6063](https://github.com/dicoding-dev/dicoding/pull/6063) (merged 2026-10-13). Item 19 di backlog.

```bash
deck art scholarships:pijak:remind-cohort-form
```

- Tanpa argumen. `program_id`, `program_name`, dan `cohort_form_deadline` diambil dari config.
- Harus dijadwalkan **setiap jam** lewat cron server (diatur infra, tidak ada di repo). Kalau dijalankan harian, peserta bisa baru
  menerima email 24 sampai 48 jam setelah menerima offering.
- Kalau `cohort_form_deadline` sudah lewat, command berhenti tanpa mengirim apa pun.
- Penerima: peserta Pijak 2027 dengan offering `accepted`, `confirmed_at` paling lambat 24 jam lalu, belum punya baris
  `scholarship_cohorts`, dan belum punya key `cohort_reminder_sent_at` di `scholarship_participants.other_requirements`.
- Email yang dikirim adalah `emails.scholarships.pijak.offering-accepted` (subjek "{nama}, Siap Jadi Peserta Resmi Pijak 2027?
  Lengkapi Data Sekarang!", pengirim `pijak@dicoding.com`). Email ini **tidak lagi dikirim saat peserta klik Terima**, mailer
  `ScholarshipOfferingStatusWasUpdatedMailer` dihapus.
- Setelah email dikirim, `cohort_reminder_sent_at` diisi lewat `JSON_SET`, key lain di `other_requirements` tidak berubah. Jadi
  menjalankan ulang aman, peserta yang sama tidak dikirimi dua kali. Kalau pengiriman gagal sebelum penanda ditulis, peserta itu
  dicoba lagi di run berikutnya.
- Contoh output: `Sent 1 Pijak cohort form reminder(s).`
- Di local:
  - `program_id` Pijak 2027 adalah **2208** (override di `bootstrap/environments/local/scholarships.php`), bukan 2304 seperti
    config dasar.
  - Pastikan tidak ada config cache `testing` di `bootstrap/cache/config.php` (misalnya sisa warm-up paratest). Kalau ada, command
    membaca DB `dicoding_test`. Hapus dengan `deck art config:clear`.
  - Queue `beanstalkd` butuh package `pda/pheanstalk`. Sejak upgrade queue Laravel 13 (`0d33e3186da`) package ini tidak ikut
    terpasang, jadi email gagal masuk queue sampai package dipasang.
  - Untuk uji manual, mundurkan `scholarship_offerings.confirmed_at` lebih dari 24 jam lalu jalankan command.

## 8. Mencetak ulang surat beasiswa (termasuk Surat Komitmen Pijak 2027)

Command umum untuk semua surat beasiswa, bukan khusus Pijak. Dipakai kalau data peserta sudah dikoreksi dan PDF suratnya perlu dibuat ulang,
atau surat sebelumnya gagal dibuat.

```bash
deck art scholarships:letters:regenerate \
  --user-id=12345 \
  --letter-type=pijak_commitment \
  --scholarship-program-id=2304
```

- Semua opsi wajib: `--user-id` (`-uid`), `--letter-type` (`-lt`), `--scholarship-program-id` (`-spid`). Kalau ada yang kosong, command berhenti
  dengan `All options (--user-id, --letter-type, --scholarship-program-id) are required and cannot be empty.`
- Nilai `--letter-type` mengikuti enum `LetterType` (`Dicoding/Domain/Scholarships/Letters/Enums/LetterType.php`). Untuk Pijak 2027:
  `pijak_commitment`. Untuk Pijak 2026 yang lama: `ibm_skillsbuild_commitment` dengan program **1645** — jangan tertukar.
- `--scholarship-program-id` adalah `program_id` di config `scholarships.pijak`: **2304** di production, **2208** di local
  (`bootstrap/environments/local/scholarships.php`), sama seperti catatan di bagian 7.
- Command memanggil `ScholarshipLetterGenerationSpecification` **langsung (sinkron)**, tidak lewat queue, jadi selesai dalam satu run.
- Urutan prosesnya:
  1. Cek user terdaftar sebagai peserta program tersebut (`scholarship_participants`). Kalau tidak, gagal dengan
     `SCHOLARSHIP_LETTER.NOT_A_PARTICIPANT_OF_PROGRAM`.
  2. Cek baris surat di `scholarship_letters` sudah ada. Kalau belum (`generate_progress = NOT_CREATED`), gagal dengan
     `Letter did not created yet.` — **command ini tidak membuat surat baru** (lihat catatan di bawah).
  3. Provider surat divalidasi, PDF dicetak ulang dari data peserta saat ini + `additional_inputs` yang tersimpan, lalu diunggah ke storage.
  4. Baris surat di-update: `filename`, `generate_progress = DONE`, `updated_at`. Kalau prosesnya gagal, `generate_progress = FAILED`.
- Karena ada unique index `unique_user_id_program_id_and_letter_type`, satu user hanya punya satu baris per (user, program, tipe). Regenerate
  menimpa baris itu, tidak menambah duplikat. Objek PDF lama di storage tidak dihapus.
- Data yang dipakai provider Pijak 2027 (`PijakCommitmentScholarshipLetter::validateParams()`) berasal dari
  `scholarship_participants.other_requirements`: `full_name` dari form registrasi (fallback nama akun, sejak PR #6162), `occupation_status`, `institution` (fallback `-`),
  `phone_number`, `city_name`, plus email akun dan `programName`. `fullName`, `registeredEmail`, `activePhoneNumber`, dan `cityName` wajib
  terisi; kalau salah satunya kosong, generation gagal.
- Contoh output sukses: `Scholarship letter regenerated successfully.`
- Contoh output gagal: `Failed to regenerate scholarship letter: Letter did not created yet.`
- Cek hasilnya di DB:

  ```sql
  SELECT l.id, l.user_id, l.program_id, t.type, l.generate_progress, l.filename, l.updated_at
  FROM scholarship_letters l
  JOIN scholarship_letter_types t ON t.id = l.type_id
  WHERE t.type = 'pijak_commitment' AND l.user_id = 12345;
  ```

- Kalau surat belum pernah dibuat: baris surat komitmen Pijak 2027 dibuat otomatis oleh `PijakRegistrationListener` saat peserta kategori
  `intensive_eligible` mendaftar. Untuk memicunya di luar alur itu, pakai `POST /api/v1/scholarships/recommendation-letters` — endpoint yang
  dipakai tombol "Buat Ulang" di halaman peserta saat state `NOT_CREATED`. Endpoint `PUT /api/v1/scholarships/regenerate-letter` adalah padanan
  HTTP dari command ini (state `FAILED`).
- Peserta melihat dan mengunduh hasilnya lewat komponen `retrieve-letter.blade.php` ("Pratinjau dan Unduh Surat Komitmen") di halaman
  pengumuman/administrasi.
- Di production jalankan tanpa `deck`: `php artisan scholarships:letters:regenerate --user-id=12345 --letter-type=pijak_commitment --scholarship-program-id=2304`.

## 9. Pengumuman tidak terpilih (akses IBM SkillsBuild hingga 30 Maret 2027)

Item 44 di backlog, PR [#6169](https://github.com/dicoding-dev/dicoding/pull/6169).

```bash
deck art scholarships:pijak:announce-not-selected --userIds=101,102,103
deck art scholarships:pijak:announce-not-selected -uid=101,102,103
deck art scholarships:pijak:announce-not-selected --help
```

Di production: `php artisan scholarships:pijak:announce-not-selected --userIds=101,102,103`.

- Untuk peserta YA/VS yang tidak terpilih di Intensif maupun Progresif, misalnya karena tidak menyelesaikan minimal satu kelas IBM.
  Daftarnya dari Ops, sistem tidak menentukan sendiri. Berbeda dengan Not Eligible saat daftar (kategori `not_eligible`, kelas Bitt).
- `--userIds` (`-uid`): wajib, dipisah koma. Id dobel dibuang, id negatif atau nol menghentikan command sebelum memproses apa pun.
- Untuk tiap id, kolom `scholarship_participants.category` diubah sesuai jalurnya:

  | Kategori awal | Hasil |
  |---|---|
  | `progressive_eligible` | Diubah jadi `progressive_ineligible` |
  | `intensive_eligible` tanpa offering | Diubah jadi `intensive_ineligible` |
  | `intensive_eligible` yang sudah punya offering (diterima, ditolak, atau expired) | Gagal, tidak ada yang ditulis, kartu offering tetap |
  | `not_eligible`, `progressive_selected`, atau sudah `*_ineligible` | Gagal, tidak ada yang ditulis |
  | Bukan peserta Pijak 2027 | Gagal, tidak ada yang ditulis |

  Halaman pengumuman membaca kategori ini, menampilkan kartu tidak terpilih, dan step Pengumuman di sidebar ikut ceklis
  (selama administrasi sudah selesai; kalau belum, peserta tetap di-redirect ke administrasi).
- Tidak mengirim email (email dikirim Ops) dan tidak membuat token. Menjalankan ulang aman: id yang sudah diumumkan dihitung gagal
  tanpa mengubah apa pun.
- Pengumuman tidak memakai feature flag, jadi peserta tidak bisa membuka atau menyembunyikannya sendiri lewat `/features/enabled`
  atau `/features/disabled`.
- Tanpa `--userIds` sama sekali, nilainya kosong dan command berhenti dengan `User id must be a positive integer.`, tidak ada yang ditulis.
- Export peserta menaruh kategori baru di sheet sendiri: `Young Adult - Not Selected` dan `Vocational Student - Not Selected`
  (dan `Vocational Student - Progressive` untuk bagian 4), lihat bagian 2. Peserta `intensive_ineligible` tetap ikut sheet Surat
  Komitmen (commit `d25f6f62bac`).
- Membatalkan untuk user tertentu (misalnya salah masuk daftar): kembalikan kategorinya lewat DB, misalnya
  `UPDATE scholarship_participants SET category = 'progressive_eligible' WHERE program_id = 2304 AND user_id = 101;`.
- Cek hasil di DB:

  ```sql
  SELECT user_id, category FROM scholarship_participants
  WHERE program_id = 2304 AND category IN ('intensive_ineligible', 'progressive_ineligible') ORDER BY user_id;
  ```

- Contoh output:

  ```
  Announced developer (user_id 5).
  Failed to announce user_id 7: User 7 already has an offering.
  Failed to announce user_id 9999: User 9999 is not a Pijak participant.
  Announced: 1, Failed: 2
  ```

- Di local, akun preview `pijak-menunggu@dicoding.local` (uid 302, password `test12345`) bisa dipakai untuk melihat kartunya.
  Kembalikan kategorinya ke `progressive_eligible` setelah selesai supaya akun itu kembali ke state "Menunggu".

## 10. Sinkronisasi leaderboard referral

Ditambahkan di PR [#6321](https://github.com/dicoding-dev/dicoding/pull/6321) (merged 2026-11-10). Item 39 di backlog.

```bash
deck art scholarships:pijak:sync-referral-leaderboard
deck art scholarships:pijak:sync-referral-leaderboard --allow-empty
```

- Membaca referrer id dan jumlah referral valid dari sheet Ops (`referral_leaderboard_sheet_id`, range
  `referral_leaderboard_sheet_range`, production `'Leaderboard Pijak PathFinder'!A:D`), lalu mengganti seluruh snapshot dalam satu
  transaksi. Peringkat dan nama di sheet hanya data tampilan.
- Dijalankan manual setiap kali Ops memperbarui sheet. Halaman leaderboard menampilkan 50 referrer teratas dan peringkat peserta
  yang login.
- Id yang formatnya salah, dobel, atau bukan peserta membuat sync ditolak. Key `other_requirements` lain milik peserta tidak berubah.
- Sheet tanpa baris peserta ditolak kecuali memakai `--allow-empty`, yang mengosongkan snapshot.
- Hanya satu sync boleh berjalan per program (`A Pijak leaderboard sync is already running.`). Setelah berhasil, cache
  leaderboard dan cache peserta yang berubah dihapus.

## Command legacy yang bukan untuk Pijak 2027

Command berikut membaca config `scholarships.ibm_skillsbuild` (Pijak 2026, program 1645). Jangan dipakai untuk Pijak 2027.

| Command | Keterangan |
|---|---|
| `scholarships:pijak:export` | Export peserta Pijak 2026 |
| `scholarships:pijak:update-final-selection-result` | Pengumuman Progresif Pijak 2026. Menyalakan flag `pijak-final-selection-result` **secara global**, jadi berbahaya kalau dijalankan saat 2027 |
| `scholarships:pijak:send-email-last-chance` | Email kesempatan terakhir Pijak 2026 |
| `scholarships:pijak-flash:participants-export` | Export peserta Pijak Flash |

Flag `pijak-final-selection-result` hanya dibaca halaman Pijak 2026. Halaman Pijak 2027 membaca kolom `category`, jadi menyalakan
flag itu tidak membuka pengumuman Pijak 2027.