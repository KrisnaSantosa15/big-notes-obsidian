---
date: 2026-11-11
updated: 2026-11-11
type: plan
tags: [plan, backlog, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Pijak 2027: Backlog Implementasi dan Bahan Cross Check

Dibuat 2026-10-01 dari pembacaan enam dokumen sumber dan pengecekan langsung ke kode. Dokumen ini snapshot: verifikasi ulang
terhadap kode dan dokumen sumber sebelum mengerjakan tiap item. Branch saat dibuat:
`improvements/pijak/uat-timezone-birthyear-source-label`.

Fokus saat ini: kode. Semua cek dan konfirmasi ke Ops yang bukan blocker ditunda sampai sebelum rilis production (lihat bagian
"Cek dan konfirmasi sebelum rilis production"). Nilai config production ditunda ke "Langkah terakhir".

Pembaruan 2026-10-01 (sore): keputusan dari Krisna dan hasil cek kode dicatat di bagian "Langkah terakhir: isi config
production" dan di baris item terkait. Semua nilai yang hanya berupa isi config production ditunda ke langkah terakhir.

Pembaruan 2026-10-01 (malam): item 7, 9, dan 12 dikerjakan dan di-PR sebagai
[#5990](https://github.com/dicoding-dev/dicoding/pull/5990) dari branch `improvements/pijak/pre-launch-small-fixes`
(dari `master` 2026-10-01). PR belum merge. Pre-push hook, dua reviewer preflight, dan cek akhir lolos. Test Twibbon baru dan
test frontend `form-validator` sengaja tidak ikut PR. Item 8 sampai 11 serta 13 dan seterusnya belum disentuh.

Pembaruan 2026-10-01 (malam kedua): atas arahan Krisna, item 1 (Merge stack UAT) dan item 8 (Cek narasi pengumuman Menunggu)
ditunda dulu. Struktur backlog diurutkan ulang: item yang sudah selesai dan item urgent/aktif yang dapat dikerjakan sekarang
diletakkan di bagian atas, sedangkan seluruh item yang ditunda (ditunda saat ini, langkah terakhir config, konfirmasi Ops,
dan Wave 2) dipindahkan ke bagian bawah.

Pembaruan 2026-10-05: item 15 (config traits) dan item 16 (export assessment dan 3 subsheet) selesai dan di-PR sebagai
[#6017](https://github.com/dicoding-dev/dicoding/pull/6017) dari branch `improvements/pijak/export-and-traits-assessment`
(dari `master`). PR belum merge. Risk medium (post-merge review). Dua reviewer preflight, satu pass fixer, pre-push Psalm, dan
integration test lolos. Export dan `campaigns:exams:calculate-results pijak` diverifikasi manual di local (program 2208).
Bagian 3.4 poin 6 dan 7 serta tabel 3.6 ikut diperbarui.

Pembaruan 2026-10-05 (malam): item 14 (pengumuman per batch Progressive) selesai dan di-PR sebagai
[#6021](https://github.com/dicoding-dev/dicoding/pull/6021) dari branch `feature/pijak/announce-progressive` (dari `master`).
PR belum merge. Risk medium (post-merge review). Dua reviewer preflight (R1 docblock `@throws`, S1 konstanta jadi `private`,
keduanya diperbaiki), Psalm penuh, 39 integration test Pijak, dan cek base-compatibility terhadap upgrade framework 4.2.121 lolos.
Daftar command dan cara menjalankannya ada di [commands.md](commands.md). PR yang sama ikut memperbaiki dua bug di master:

- **Email konfirmasi registrasi Intensif/Progresif tidak terkirim.** Commit `2f44726` (konversi echo L4.2 ke v13) tanpa sengaja
  mengembalikan `registration-confirmation.blade.php` ke versi lama yang memanggil `components.step-number` (sudah dihapus di
  `fc27eaa`) dan class `dcd-*` (CSS-nya dihapus di `1a896d0`). Render gagal `View not found`, mailer menelan error-nya. Kini dipulihkan
  ke versi inline style `1a896d0` dengan isi dari master. Test registrasi Intensif dan Progresif sekarang mengecek emailnya.
- **Ceklis sidebar Pengumuman tidak muncul** untuk Not Eligible dan Progressive yang sudah diumumkan, karena status step hanya
  diturunkan dari offering. `PijakViewModel::getStepStatus()` kini menganggap step selesai untuk Not Eligible dan untuk peserta
  dengan pengumuman final terbuka; yang masih menunggu tetap belum ceklis.

E2E di local (Chrome DevTools, 3 user baru 316 sampai 318, satu per kategori) lolos sampai status akhir: Intensif sampai "Menunggu
Hasil Seleksi" (form, 1a, 1b, tes, unggah surat), Progressive diumumkan lewat command (rerun `Skipped`), Not Eligible langsung ke
pengumuman. Referral dan Twibbon ikut teruji. Catatan dari E2E yang belum ditindaklanjuti:

1. Di halaman administrasi, peserta Intensif membaca "Proses seleksi lainnya untuk beasiswa Progresif adalah penyelesaian minimal
   1 course". Masuk ke konfirmasi copy item 10. **Diperbaiki 2026-10-12:** copy diganti menjadi "beasiswa Intensif/Progresif" sesuai BRIEF baris 123.
2. Kartu "Unggah File Surat" tidak memuat link unduh surat; teksnya merujuk ke "halaman sebelumnya". Belum dites. **Tidak perlu (keputusan Krisna 2026-10-12):** surat yang sudah diunggah bisa diklik dan langsung terbuka di tab baru.
3. Typo format tanggal di halaman hasil ujian kelas (bukan Pijak): `+07:00ukul`.
4. Config local: array config local digabung per index dengan config dasar (`array_replace_recursive`), jadi
   `progressive_course_ids` local harus berisi 4 id (`[2, 3, 5, 10]`), bukan 2.

Pembaruan 2026-10-06: **launch Pijak 2027 diundur ke awal November 2026** (tanggal pasti belum ada). Beberapa item jadi tidak
urgent, dan ada waktu untuk mengerjakan Extramiles (bagian 4) sebelum launch. Tanggal di bagian 0 yang bergantung pada launch
(pembukaan pendaftaran, mulai Twibbon) perlu dikonfirmasi ulang ke Ops. Tanggal penutupan (31 Des 2026) dan pengumuman belum ada
info perubahan. Status PR per hari ini: #5937, #5941, #5947, #5990 sudah merge; #5963, #5966 (stack UAT), #6017, #6021 (draft),
dan #6023 (layout halaman registrasi untuk user yang belum login) masih terbuka.

Pembaruan 2026-10-06 (sore): status PR dicek ulang di GitHub. Tambahan sejak pagi: #6030 (validasi email IBM, item 11 dan 28)
open dengan risk high, #6031 dan #6033 (re-offer, item 27) draft dan stacked di atas #6017. Item 30 dikerjakan Dimas lewat
[#6032](https://github.com/dicoding-dev/dicoding/pull/6032) (merged) dan [#6034](https://github.com/dicoding-dev/dicoding/pull/6034)
(open), lihat baris item 30.

Pembaruan 2026-10-07: #6034 sudah merge (2026-10-06). Dimas membuka
[#6038](https://github.com/dicoding-dev/dicoding/pull/6038) yang mematikan email "program berakhir" untuk token Tes Seleksi
Pijak. Sudah dicek Krisna, sesuai. Pertanyaan email untuk token Not Eligible jadi urusan Krisna, lihat baris item 30.

Pembaruan 2026-10-07 (verifikasi ulang kode dan PR): seluruh status di dokumen ini dicek ulang terhadap `origin/master` dan daftar PR
per 2026-10-07 pagi. Yang bergerak: [#6017](https://github.com/dicoding-dev/dicoding/pull/6017),
[#5963](https://github.com/dicoding-dev/dicoding/pull/5963), dan [#6023](https://github.com/dicoding-dev/dicoding/pull/6023) sudah merge,
jadi item 15 dan 16 kini ada di master dan sisa item 1 tinggal
[#5966](https://github.com/dicoding-dev/dicoding/pull/5966) yang basisnya sudah `master` (MERGEABLE, tetapi BLOCKED menunggu review).
Enam PR berisi kode selesai yang belum merge dan masih BLOCKED: #5966,
[#6021](https://github.com/dicoding-dev/dicoding/pull/6021) (item 14),
[#6030](https://github.com/dicoding-dev/dicoding/pull/6030) (item 11 dan 28, risk high sehingga wajib review dan approval sebelum merge),
[#6031](https://github.com/dicoding-dev/dicoding/pull/6031) dan [#6033](https://github.com/dicoding-dev/dicoding/pull/6033) (item 27), serta
[#6038](https://github.com/dicoding-dev/dicoding/pull/6038) (sisa item 30). Basis #6031 sudah pindah ke `master`, sedangkan #6033 masih di
atas #6031 dan sekarang CONFLICTING. Rincian per item ada di bagian 2.2.

Bukti di `origin/master`: item 5, 7, 9, 15, dan 16 terverifikasi ada di kode; #6032 dan #6034 sudah merge (migrasi
`2026_10_06_120226_add_should_send_ended_email_to_multi_course_tokens_table.php` dan `should_send_ended_email` dipakai di
`MultiCourseTokensCreation` serta `NotifyMultiCourseTokenStudyDeadline`). Yang belum ada di master: cutover route (item 2 masih memakai
`pijak_2027.php` dan `pijak_flash.php`), tanggal offering masih `2027-01-01` dan `2027-01-15` (item 6), `progressive_course_ids` hanya
ada di branch #6021 (item 4), dan `PijakRegistrationSpecification::autoRedeemToken()` belum punya `should_send_ended_email` (item 30)
maupun `custom_deadline_info` (item 22).

Dua koreksi: config Pijak 2027 ada di `config/scholarships.php` dengan override local di
`bootstrap/environments/local/scholarships.php`, bukan `app/config/scholarships.php`. Nilai `not_eligible_token_active_period` di master
adalah **30**, bukan 14 seperti yang tertulis di item 30.

Struktur bagian 2 dirapikan pada pembaruan yang sama: item yang sifatnya cek dan konfirmasi ke Ops atau pihak lain dipisah ke
bagian 2.3 supaya tidak tercampur dengan daftar yang belum dikerjakan. Isinya item 6, 8, 10, 20, 21, 24, dan 25. Baris item 11,
27, dan 28 dihapus dari daftar tunda karena kodenya sudah selesai dan dilacak di 2.2.

Pembaruan 2026-10-07 (kedua): item 26 (narasi dan gambar LinkedIn) dan 29 (preview dan edit data LoA) dipindah dari 2.3 ke 2.4
karena dikerjakan tim sendiri, bukan diserahkan ke Ops. Duplikasi dihapus supaya tiap nomor item muncul di satu bagian saja: item
1 dan 14 kini hanya di 2.2, item 30 hanya di 2.5. Komposisi akhir: 2.1 6 item, 2.2 5 item (5 PR), 2.3 7 item, 2.4 12 item, dan
2.5 3 item.

Pembaruan 2026-10-08: item 26 (narasi dan gambar LinkedIn) selesai dan di-PR sebagai
[#6057](https://github.com/dicoding-dev/dicoding/pull/6057), dipindah dari 2.4 ke 2.2. Komposisi: 2.2 6 item (6 PR), 2.4 11 item.

Pembaruan 2026-10-08 (kedua): item 22 (token habis dan deadline token Tes Seleksi) dikonfirmasi Krisna sama dengan item 30,
yaitu email "program selesai" yang ditangani Dimas lewat #6038. Item 22 dipindah dari 2.4 A ke 2.5 di bawah item 30, subbagian
2.4 A dihapus. Komposisi: 2.4 10 item, 2.5 4 item.

Pembaruan 2026-10-12: item 34 (integrasi landing page Pijak 2027) ditambahkan ke 2.4 D. Landing page dibuat di Framer oleh
UI/UX designer dan belum diintegrasikan. Komposisi: 2.4 11 item. Total 34 item.

Pembaruan 2026-10-12 (kedua): item 20, 24, 25, 31, dan 32 diputuskan Krisna tidak diimplementasikan dan dipindah ke bagian 2.6
beserta alasannya. Komposisi: 2.3 4 item, 2.4 9 item, 2.6 5 item.

Pembaruan 2026-10-12 (ketiga): sisa item 30 diputuskan Krisna. Email "masa belajar berakhir" untuk token Not Eligible dan
Progressive dibiarkan karena bukan token tes asesmen. Catatan E2E nomor 2 (link unduh surat di kartu "Unggah File Surat") tidak
perlu ditindaklanjuti karena surat yang diunggah bisa dibuka di tab baru.

Pembaruan 2026-10-12 (keempat): item 10 dipecah jadi tiga bagian. Copy kartu IBM diganti ke "beasiswa Intensif/Progresif",
angka 70 menit sudah sesuai BRIEF, dan email pengumuman Progressive menunggu HTML dari tim Registrasi.

Pembaruan 2026-10-13: status PR dicek ulang di GitHub. Semua PR Pijak sudah merge kecuali
[#6030](https://github.com/dicoding-dev/dicoding/pull/6030) (item 11 dan 28, draft, risk high, BLOCKED). Yang merge sejak 2026-10-07:
#5966 (2026-10-07, item 1), #6021 (2026-10-08, item 14), #6031 (2026-10-08) dan #6033 (2026-10-12) untuk item 27, #6038 (2026-10-08,
item 30), #6057 (2026-10-08, item 26), serta #6063 (2026-10-13, item 19). PR baru yang sudah merge 2026-10-13:
[#6080](https://github.com/dicoding-dev/dicoding/pull/6080) (modal LinkedIn di form cohort, lanjutan item 26),
[#6083](https://github.com/dicoding-dev/dicoding/pull/6083) (copy kartu IBM, item 10 bagian 1), dan
[#6090](https://github.com/dicoding-dev/dicoding/pull/6090) (guard re-offer tanpa offering dan pesan dot notation, lanjutan item 27).
Item 1, 14, 19, 26, dan 27 dipindah ke 2.1. Komposisi: 2.1 11 item, 2.2 2 item (1 PR), 2.4 8 item. Temuan 4.1 yang masih terbuka:
`pda/pheanstalk` masih belum ada di `composer.json` master.

Pembaruan 2026-10-13 (kedua): item 35 (leaderboard referral) ditambahkan ke 2.4 D. Hitungan memakai semua pendaftar lewat link
referral, route di grup `pijak2027` dulu. Komposisi: 2.4 9 item. Total 35 item.

Pembaruan 2026-10-16: status PR dicek ulang di GitHub. [#6098](https://github.com/dicoding-dev/dicoding/pull/6098) (item 35)
sudah merge 2026-10-14, item 35 dipindah ke 2.1. [#6030](https://github.com/dicoding-dev/dicoding/pull/6030) (item 11 dan 28)
masih open, bukan draft lagi, REVIEW_REQUIRED. Desainnya berubah: tabel `excluded_emails` dan `ExcludedEmailGateway` dihapus,
pengecekan pindah ke tabel `meta_contents` (lihat 4.2). Temuan 4.1 `pda/pheanstalk` ditutup karena queue server pindah ke SQS,
diverifikasi di local dengan emulator SQS (lihat 4.1). Komposisi: 2.1 12 item, 2.4 8 item.

Pembaruan 2026-10-16 (kedua): item 36 (tanggal buka pendaftaran) ditambahkan ke 2.2. Config Pijak 2027 sebelumnya hanya punya
`registration_closed_at`, padahal route `pijak_2027.php` sudah aktif, jadi pendaftaran terbuka sejak deploy. Total 36 item.

Pembaruan 2026-10-16 (ketiga): item 36 di-PR sebagai [#6126](https://github.com/dicoding-dev/dicoding/pull/6126) dari branch
`feature/pijak/registration-opened-at` (dari `master`), open, risk low (post-merge review). Tanggal buka production ditetapkan
Krisna `2026-11-12 00:00:00`, sehingga tanggal launch di bagian 0 ikut diperbarui. Halaman "Pendaftaran Belum Dibuka" memakai copy
Mastercard; hitung mundur "Waktu terbatas" di hero tetap tampil sebelum pendaftaran dibuka, sama seperti AI Camp dan CodingCamp
Progressive (keputusan Krisna). Tanpa integration test, sama seperti campaign lain; dicek manual di Chrome DevTools. Dua reviewer
preflight tanpa temuan, Psalm, pre-push Psalm, dan 84 integration test Pijak lolos. #6030 masih open, REVIEW_REQUIRED.
Komposisi: 2.2 3 item (2 PR).

Pembaruan 2026-10-19: hasil sync dengan tim Ops 15 Oktober 2026 ([sync-pijak-150ct2026.md](sync-pijak-150ct2026.md), kode SYNC)
dicatat. Kutipan dari SYNC disalin apa adanya tanpa mengubah narasi, termasuk typo dan tanggal yang tampak tidak konsisten; hal yang
tidak konsisten dicatat sebagai konflik K9 sampai K14, tidak dikoreksi. Jawaban untuk item yang sudah ada ditambahkan sebagai catatan
**Sync Ops 2026-10-15** di baris item 2, 4, 5, 6, 8, 10, 12, 19, 34, dan 35 tanpa mengubah teks lama. Item baru 37 sampai 43
ditambahkan di 2.4 F. Status #6030 dan #6126 dicek ulang 2026-10-19: masih open, REVIEW_REQUIRED. Komposisi: 2.4 15 item. Total 43 item.

Pembaruan 2026-10-19 (kedua): keputusan Krisna atas konflik K9 sampai K14 dan perubahan SYNC dicatat. SYNC diperbarui Krisna
(batas 1000 mentee per fasil, narasi cohort nomor 5, dua jenis Not Eligible, tahun 2027 di offering opened at), dan anotasi
"1 februari" di narasi Menunggu Hasil Seleksi serta Diterima - Masuk Intensif diganti "31 januari 2027" sesuai keputusan K10. K9,
K10, dan K14 selesai; K11 sampai K13 diputuskan arahnya. Item 6 dan 8 dipindah dari 2.3 ke 2.4 F karena sudah dijawab dan
pekerjaannya dilanjutkan di item 40 dan 43. Item 44 (pengumuman Not Eligible IBM) ditambahkan. Bagian 0 disesuaikan dengan tanggal
SYNC. Komposisi: 2.3 2 item, 2.4 18 item. Total 44 item.

Pembaruan 2026-10-19 (ketiga): card Basecamp dibuat di board Campaigns kolom Planning, tanpa assignee: item 40 Date Gimmick
[10417100089](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100089) (2 SP, desain key config gimmick),
item 42 kelas Bitt [10417100099](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100099) (3 SP), item 38
Referral dan Twibbon [10417100117](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100117) (2 SP), item 43
komponen pengumuman [10417100133](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100133) (3 SP), dan item
44 Not Eligible IBM [10417100155](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100155) (3 SP). Item 37
memakai card lama [10412178308](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10412178308), belum diperbarui.
Fasil Mentee Grouping (item 37) berbeda dengan Facilitator di Revamp APD, tidak saling bergantung.

Pembaruan 2026-10-19 (keempat): card item 37 [10412178308](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10412178308)
diperbarui (judul user story 5 SP, deskripsi lama dipertahankan, ditambah Expected Conditions dan hal yang perlu diperhatikan). Card baru
di Planning tanpa assignee: item 39 leaderboard [10417267737](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267737)
(5 SP), item 34 Framer [10417267757](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267757) (2 SP), item 29 LoA
[10417267780](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267780) (1 SP, eksplorasi), item 10 bagian 3 email
Progresif [10417267801](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267801) (1 SP), dan persiapan production
[10417267880](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267880) (2 SP, 6 steps) yang menggabungkan item 2,
3, 4 (2.4 B), 17, dan cron item 19.

Pembaruan 2026-10-19 (kelima): item 40 (Date Gimmick) selesai dan di-PR sebagai [#6138](https://github.com/dicoding-dev/dicoding/pull/6138) dari branch
`feature/pijak/date-gimmick` (dari `master`), open, risk medium (post-merge review). Item 40 dipindah dari 2.4 F ke 2.2 beserta kutipan
SYNC dan keputusannya. Offering yang sudah jatuh tempo 13 Januari tidak diperpanjang otomatis, diselesaikan lewat re-offer (keputusan
Krisna). #6030 dan #6126 masih open, REVIEW_REQUIRED. Catatan environment local: `.env.local.php` sempat berisi `QUEUE` `sqs` tanpa
emulator SQS, sehingga queue worker gagal terus (error `Aws\Exception\CredentialsException`) dan surat komitmen tidak tergenerate;
dikembalikan ke `redis` seperti `.env.php`. Komposisi: 2.2 4 item (3 PR), 2.4 17 item.

Pembaruan 2026-10-19 (keenam): item 37 (Mentee Grouping) selesai dan di-PR sebagai [#6141](https://github.com/dicoding-dev/dicoding/pull/6141) dari branch
`feature/pijak/mentee-grouping` (dari `master`), open, risk high (review kode dan approval sebelum merge). Item 37 dipindah dari 2.4 F ke 2.2.
Peserta Intensif dan Progresif ditempatkan ke fasil saat registrasi: referral fasil yang belum penuh masuk ke fasil itu, selain itu ke fasil
dengan mentee paling sedikit (seri ikut urutan config), tetap begitu walau semua fasil penuh; fasil yang mendaftar masuk grupnya sendiri (jawaban Ops).
Email konfirmasi menampilkan tombol grup WhatsApp. Menunggu dari Ops: daftar uid fasil production dan narasi email. Komposisi: 2.2 5 item (4 PR), 2.4 16 item.

Pembaruan 2026-10-20: status PR dicek ulang di GitHub. #6030 (item 11 dan 28), #6126 (item 36), #6138 (item 40), dan #6141 (item 37)
masih open, REVIEW_REQUIRED, belum ada yang merge. Belum ada perubahan komposisi: 2.2 5 item (4 PR), 2.3 2 item, 2.4 16 item.
Item yang bisa dikerjakan tanpa menunggu pihak lain tinggal item 43 dan 44; item 41 butuh keputusan Krisna.

Pembaruan 2026-10-20 (kedua): item 43 (dan item 8 yang dijawabnya) selesai dan di-PR sebagai [#6143](https://github.com/dicoding-dev/dicoding/pull/6143) dari branch
`feature/pijak/announcement-narrative`, ditumpuk di atas #6138 (base `feature/pijak/date-gimmick`, retarget ke `master` setelah #6138 merge), open, risk low
(post-merge review). Item 8 dan 43 dipindah dari 2.4 F ke 2.2. Kartu Not Eligible dari awal (bagian pengumuman item 42) ikut di #6143 dengan placeholder Bitt;
integrasi Bitt tetap di item 42. **Keputusan Krisna 2026-10-20:** item 42 mengikuti alur Bitt AI Camp; kartu Not Eligible IBM dibuat bersama logikanya di item 44
(PR terpisah), tidak dibuat duluan sebagai placeholder. Komposisi: 2.2 7 item (5 PR), 2.4 14 item.

Pembaruan 2026-10-21: feedback QA 21 Oktober (23 poin, Nabila dan Putri) dicatat beserta status, keputusan, dan rencana PR di
[follow-up-21-oct-2026.md](follow-up-21-oct-2026.md) bagian "Status dan keputusan". Ringkasnya: perbaikan form (A), surat komitmen dan
administrasi (B), dan email versi 2 YA dan VS (D) jadi pekerjaan baru; poin 30 Maret masuk item 44 dan email Not Eligible Bitt masuk item 42.
Perbaikan form (A1, A3, A4, A6) di-PR sebagai [#6159](https://github.com/dicoding-dev/dicoding/pull/6159), open, risk low (post-merge). Surat komitmen dan administrasi (B1, B2, B3) di-PR sebagai [#6162](https://github.com/dicoding-dev/dicoding/pull/6162), open, risk low (post-merge). PR 3 sampai 5 masih menunggu keputusan atau data dari Ops.

Pembaruan 2026-10-22: status PR dicek ulang di GitHub. Sudah merge: #6126 (item 36, 2026-10-20), #6030 (item 11 dan 28, 2026-10-21), #6138 (item 40, 2026-10-21),
#6141 (item 37, 2026-10-22, setelah di-rebase ke master 2026-10-21), #6159 dan #6162 (perbaikan QA A dan B, 2026-10-22). Masih open: #6143 (item 8 dan 43).
Email versi 2 YA dan VS (QA D1 sampai D5) di-PR sebagai [#6167](https://github.com/dicoding-dev/dicoding/pull/6167) dari branch `feature/pijak/registration-email-v2`
(base `master`), open, risk medium (post-merge). Email konfirmasi menampilkan nama fasil (dari `users`, `name` lalu `display_name`) dan Kode Fasilitator berupa
user id (keputusan Krisna 2026-10-21), menggantikan kartu WhatsApp sementara dari #6141; narasi email fasil yang ditunggu di item 37 terjawab oleh versi 2.
Detail di [follow-up-21-oct-2026.md](follow-up-21-oct-2026.md) bagian "Progres". Daftar uid fasil production (`facilitator_user_ids`) masih ditunggu dari Ops.

Pembaruan 2026-10-22 (kedua): tabel dirapikan. Item 11/28, 36, 40, dan 37 dipindah dari 2.2 ke 2.1. Item 44 dipindah dari 2.4 F ke 2.2
karena sudah di-PR sebagai [#6169](https://github.com/dicoding-dev/dicoding/pull/6169) (base #6143). #6167 dicatat di 2.2 sebagai follow-up QA D.
Item 38 diluruskan (info baru dari Krisna): bukan pemisahan halaman, tetapi menambah narasi "Kunjungi dicoding.com/pijak/twibbon untuk
informasi lengkapnya." di bagian Twibbon, karena sekarang hanya bagian Referral yang punya kalimat "Kunjungi ...". Sumber nama fasil di email
dibahas ulang dengan Ops, lihat catatan nama fasil di follow-up 21 Okt. Komposisi: 2.1 17 item, 2.2 3 item dan 1 follow-up QA (3 PR), 2.4 13 item.

Pembaruan 2026-10-22 (ketiga): item 41 diputuskan (flag baru `pijak2027`) dan di-PR sebagai [#6170](https://github.com/dicoding-dev/dicoding/pull/6170) dari branch `improvements/pijak/pijak2027-feature-flag`, open, risk low (post-merge). Item 41 dipindah dari 2.4 F ke 2.2. Command flag dicatat di `commands.md` bagian 1. Komposisi: 2.2 4 item dan 1 follow-up QA (4 PR), 2.4 12 item.

Pembaruan 2026-10-22 (keempat): item 38 di-PR sebagai [#6174](https://github.com/dicoding-dev/dicoding/pull/6174) dari branch `improvements/pijak/referral-twibbon-narration`, open, risk low (post-merge), tanpa preflight. Item 38 dipindah dari 2.4 F ke 2.2. Item 39 (Leaderboard) dan 42 (kelas Bitt) dikerjakan Deden. Komposisi: 2.2 5 item dan 1 follow-up QA (5 PR), 2.4 11 item.

Pembaruan 2026-10-22 (kelima): catatan reviewer #6159 (section Intensif hanya disembunyikan) diverifikasi di browser: isian Intensif ikut tampil di preview konfirmasi dan tersimpan di draft auto-save. Diperbaiki dan di-PR sebagai [#6177](https://github.com/dicoding-dev/dicoding/pull/6177) dari branch `bugfix/pijak/disable-hidden-intensive-fields`, open, risk low (post-merge), preflight lengkap. Ditambahkan ke 2.2 sebagai follow-up QA A7. Dua temuan baru dari cek ulang dokumen: Registration Draft (21 Okt) sudah memuat email pengumuman Progresif versi resmi (item 10 bagian 3), dan redirect `/pijak2027/*` ke `/pijak/*` saat cutover (item 2). Komposisi: 2.2 5 item dan 2 follow-up QA (6 PR), 2.4 11 item.

Pembaruan 2026-10-26: status PR dicek ulang di GitHub. Semua PR di 2.2 sudah merge: #6167, #6143, #6170, #6174 (2026-10-23), #6177 (2026-10-23), dan #6169 (2026-10-26). Di luar backlog ikut merge #6186 (nama LP token package) dan #6197 (pengumuman Progresif lewat status, item 45). #6169 berubah sebelum merge: penanda tidak terpilih bukan lagi flag per user `pijak-not-selected`, tetapi status `scholarship_participants.category` (`progressive_ineligible` atau `intensive_ineligible`), karena flag per user bisa dinyalakan peserta sendiri lewat `/features/enabled`. #6197 menerapkan hal yang sama ke Progresif (`progressive_selected`). Semua item 2.2 dipindah ke 2.1, sehingga tidak ada PR Pijak yang open. Email registrasi versi 2 (YA dan VS) di `emails.md` (salinan Registration Draft, diperbarui 2026-10-26) dibandingkan dengan `registration-confirmation.blade.php`; hasilnya dicatat sebagai item 46 di 2.4 D. Komposisi: 2.1 24 item, 2.2 kosong, 2.3 3 item (item 47 baru), 2.4 12 item (item 46 baru).

Pembaruan 2026-11-05: status PR dicek ulang di GitHub. Sudah merge: #6225 (email mengikuti desain final, 2026-10-27; menutup item 46 dan bagian (3) item 10, serta menghapus auto enroll Not Eligible), #6241 (copy pengumuman dan gambar welcome lokal, 2026-10-30), #6285 dan #6286 (perbaikan UAT 2, 2026-11-02 dan 2026-11-04), #6290 (kelas Bitt Not Eligible, item 42, 2026-11-04), dan #6304 (kotak Bitt di email Not Eligible, 2026-11-04). Item 10, 42, 46, dan UAT 2 dipindah ke 2.1. Item 39 (Leaderboard) dipindah ke 2.2 karena sudah di-PR sebagai #6321 (draft). Temuan baru: URL Bitt production (item 48) dan tombol "Kirim Offering" admin yang tidak men-submit form (item 49). Persiapan production (item 2, 3, 4, 17, cron reminder cohort) dilacak di card [10417267880](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267880); pendaftaran dibuka 2026-11-12. Item 49 di-PR sebagai #6326 dan dipindah ke 2.2 bersama bug kedua (`category_code` kosong). Komposisi: 2.2 2 item, 2.3 3 item, 2.4 9 item.

Pembaruan 2026-11-05 (kedua): diputuskan migrasi route `pijak2027` ke `pijak` (item 2) dan pengisian config production (item 3, 4, 47, 48, link grup `https://dicoding.id/p27-gr-%d`) dikerjakan sebagai dua PR terpisah. Rencana, keputusan, dan kondisi kode dicatat di [handoff route migration dan launch config](../../handoffs/pijak2027/route-migration-and-launch-config.md).

Pembaruan 2026-11-11: semua kode Pijak 2027 sudah di master dan production. Status di bawah menggantikan kolom status item terkait
di bagian 2 yang belum diperbarui.

Selesai sejak 2026-11-05:

| # | Item | PR |
|---|---|---|
| 39 | Leaderboard referral dari sheet Ops (`scholarships:pijak:sync-referral-leaderboard`, `commands.md` bagian 10) | [#6321](https://github.com/dicoding-dev/dicoding/pull/6321) merged 2026-11-10, navigasi dan footer [#6375](https://github.com/dicoding-dev/dicoding/pull/6375), link route [#6373](https://github.com/dicoding-dev/dicoding/pull/6373) |
| 49 | Kirim offering dari halaman admin React | [#6326](https://github.com/dicoding-dev/dicoding/pull/6326) merged 2026-11-09 |
| 2 | Cutover route ke `/pijak`, nama route `pijak.*`, middleware `features:pijak` (bukan `pijak2027`), `pijak_flash.php` dan `pijak_old.php` tidak dimuat. Tanpa redirect `/pijak2027` | [#6330](https://github.com/dicoding-dev/dicoding/pull/6330) merged 2026-11-09 |
| 3, 47, 48 | Config production: `program_id` **2304** (bukan 2250), `export_google_sheets_id`, `referral_leaderboard_sheet_id`, `facilitator_user_ids` terisi, `bitt.login_url` ke `https://bitt.id` | [#6369](https://github.com/dicoding-dev/dicoding/pull/6369) merged 2026-11-10 |
| 34 (sebagian) | Halaman Framer twibbon, sessions, dan blog, serta copy registrasi | [#6381](https://github.com/dicoding-dev/dicoding/pull/6381) |
| - | Penutupan registrasi dan token Tes Seleksi 7 Feb 2027, teks "menunggu seleksi" ikut tanggal itu | [#6376](https://github.com/dicoding-dev/dicoding/pull/6376) |
| - | WNI yang tinggal di luar negeri tetap eligible YA/VS (zona waktu WIB, negara di surat komitmen dan export) | [#6385](https://github.com/dicoding-dev/dicoding/pull/6385) |

Sisa pekerjaan (status production belum diverifikasi engineer, tandai saat sudah dicek):

- Sebelum pendaftaran dibuka 12 Nov 00:00 WIB:
  - [ ] Toggle `pijak` menyala global di production (`commands.md` bagian 1).
  - [ ] Row `partner_programs` untuk `program_id` 2304 ada di production.
  - [ ] Import email IBM yang sudah dipakai ke `meta_contents` setelah migration unique (`commands.md` bagian 5, infra).
  - [ ] Sheet export sudah di-share ke service account; export manual sekali menghasilkan 10 sheet dan email ke `pijak@dicoding.com`.
  - [ ] Smoke test akun uji per jalur (YA, VS, Not Eligible, WNI luar negeri): email registrasi, kotak fasil, link Bitt production, auto enroll 887.
  - [ ] Verifikasi id course production: 887, Progresif 862/867/753/123, Bitt 99/85.
- Cron (infra, item 17 dan 19):
  - [ ] `campaigns:exams:calculate-results pijak` sebelum tiap export.
  - [ ] `scholarships:pijak:export-participants` 07.00 dan 14.00 WIB.
  - [ ] `scholarships:pijak:remind-cohort-form` setiap jam, paling lambat sebelum offering pertama 13 Jan 2027.
- Command manual sesuai jadwal Ops: offering dan `announce-progressive` batch 1 (13 Jan 2027), `announce-not-selected` setelah
  offering diproses, `announce-progressive` batch 2 (10 Feb 2027), `sync-referral-leaderboard` setiap sheet Ops diperbarui.
- Masih terbuka:
  - Penutupan dashboard registrasi 1 Mar 2027: belum diimplementasi, bentuknya perlu dikonfirmasi ke Ops.
  - Item 33 (Wave 2, sebelum Feb 2027): `excluded_program_ids` diisi **2304**. Komentar di `config/scholarships.php` masih menyebut
    2208 (id local).
  - Item 29 (preview dan edit LoA): tanyakan maksudnya ke Dimas Saputra.
  - Item 4: id course kurikulum Intensif belum dicari.
  - Item 21: konfirmasi daftar 8 course IBM. Item 47: konfirmasi apakah nama akun Dicoding fasil boleh dipakai di email
    (uid sudah terisi).
  - Item 23: dashboard Metabase.
  - Item 34: integrasi landing page Framer di luar halaman yang sudah dilayani #6381 perlu dicek ulang.

## 0. Konteks waktu

| Tanggal | Kejadian | Sumber |
|---|---|---|
| 2026-10-01 | Tanggal pembuatan dokumen ini | |
| ~~6/7/8 Okt 2026~~ 12 Nov 2026 00:00 WIB | Pendaftaran Wave 1 dibuka. Diundur per 2026-10-06; tanggal 12 Nov ditetapkan Krisna 2026-10-16 dan dipasang di config `registration_opened_at` (PR #6126) | NOTES baris 12, info Krisna 2026-10-06 dan 2026-10-16 |
| ~~6 Okt~~ - 31 Des 2026 | Periode Twibbon Challenge. Tanggal mulai perlu dikonfirmasi ulang karena launch diundur | BRIEF baris 436 |
| 31 Des 2026 23:59 WIB | ~~Registrasi dan deadline token ditutup~~ Tulisan gimmick "registrasi ditutup". Mulai 1 Jan 2027 tulisan pindah ke ~~31 Jan~~ 7 Feb 2027 (item 40) | BRIEF baris 67, SYNC Date Gimmick, Ops 2026-11-11 |
| 13 Jan 2027 | Pengumuman Final Intensif (email dan LoA oleh Ops) dan Progresif batch 1 (email otomatis). Juga tanggal gimmick offering opened at, offering deadline, dan teks "menunggu seleksi"; mulai 14 Jan batas offering pindah ke 31 Jan 2027, teks "menunggu seleksi" pindah ke 7 Feb 2027 (ikut `registration_closed_at`) | BRIEF baris 284, SYNC Date Gimmick, Ops 2026-11-11 |
| ~~20 Jan~~ 16 Jan 2027 | Tanggal gimmick batas isi cohort form. Mulai 17 Jan tulisan pindah ke 31 Jan 2027 (item 40, K14) | config `cohort_form_deadline`, SYNC Date Gimmick |
| 31 Jan 2027 23:59 WIB | Batas asli offering dan cohort form | SYNC Date Gimmick |
| 7 Feb 2027 23:59 WIB | Penutupan final registrasi dan batas token Tes Seleksi (tanpa gimmick) | Ops 2026-11-11 |
| 10 Feb 2027 | Pengumuman Progresif batch 2, jalankan ulang `scholarships:pijak:announce-progressive --userIds=...` | Ops 2026-11-11 |
| 1 Mar 2027 | Penutupan dashboard registrasi (platform). Belum diimplementasi, perlu konfirmasi bentuknya | Ops 2026-11-11 |
| Feb 2027 | Wave 2 dibuka (hanya Progressive) | BRIEF baris 568-575, NOTES baris 20 |

## 1. Sumber dokumen untuk cross check

Semua file ada di `docs/domains/pijak2027/` kecuali disebut lain. Nomor baris mengacu ke isi file per 2026-10-01 dan bisa
bergeser kalau file diedit.

| Kode | File | Isi | Bagian yang sering dirujuk |
|---|---|---|---|
| BRIEF | `Pijak 2027 - Brief Landing Page & Registration.md` | Acuan produk: landing page, form registrasi, syarat administrasi, offering, pengumuman, referral, timeline, export | Form registrasi baris 29. Kelas Assessment baris 57. Kelas Intensif, Progresif, Not Eligible baris 70, 74, 90. Syarat Administrasi baris 94. **2a Tes Penilaian baris 150.** 2b Unggah Surat baris 165. Cara mengetahui organisasi IBM baris 176. Offering baris 191. Menolak dan tidak mengonfirmasi offering baris 209 dan 217. Pengumuman baris 278 (Menunggu 282, Intensif 295, Progresif 312, Tidak Eligible 323). Twibbon dan Referral baris 337. TL;DR dan timeline baris 566. Syarat Eligible baris 609. Extramiles baris 623. **Automate Export dan Metabase baris 664.** Bagian ARCHIVED baris 696 |
| GATH | `implementation-gathering.md` | Riwayat analisis, matriks reuse, keputusan terkunci, status PR, temuan E2E | §5 pertanyaan ke Ops dan statusnya. §6 keputusan terkunci. §9 cara `program_id` dibuat. §10 Extramiles. §13 sampai §16 revisi domain model dan eligibility. §19.5 status per 2026-10-01. §20 temuan E2E. §21 Not Eligible. §22 gap Progressive |
| UAT | `specs/uat-registration-fixes.md` | 12 temuan UAT 2026-09-28 dan pembagian PR (#5937, #5941, #5947, #5963, #5966) | Tabel ringkasan, bagian Pembagian PR |
| WIP | `WIP-pijak.md` | Coretan kerja: 13 poin, state pengumuman, TODO sandbox, temuan, catatan, daftar test | Poin 1 sampai 13, STATE PENGUMUMAN, TODO in sandbox, TEMUAN, CATATAN |
| NARASI | `Narasi Filtering & Promotion Pijak 2026.md` | Sumber narasi email dan WA siklus Pijak 2026 (marketing, sosialisasi, threads) | Heading: Filtering baris 7, Marketing baris 59, Sosialisasi baris 96, Threads baris 511. Dipakai GATH §3 poin 5 sebagai sumber 5 email autoreply. Hanya heading yang saya baca, isinya belum |
| NOTES | `Notes - Diskusi terkait registration flow Pijak X AI Camp.md` | Notulen rapat 7 Sep 2026: wave, syarat administrasi, offering, twibbon, request LoA dan WABA | Flow Regis Pijak baris 7, Request Saat atau Setelah Registrasi baris 60 |
| REF | `export_references/` | Contoh export CodingCamp (CSV dan XLSX) dan sheet bobot skor | Lihat bagian 3.5 |
| SYNC | `sync-pijak-150ct2026.md`, versi online [Google Docs](https://docs.google.com/document/d/1nLyQ7TX0WeODx_AcpLRX7jFLE-4ATQ0OTfCmJvvzWDk/edit?tab=t.0) (pakai link ini untuk card Basecamp) | Hasil sync dengan tim Ops 15 Oktober 2026: request baru, perbaikan, dan narasi pengumuman per kategori | Request Baru (Mentee Grouping, Pemisahan Halaman Referral dan Twibbon, Leaderboard, Date Gimmick, Frammer Integration), Perbaikan, Narasi Pengumuman |

### Konflik antar dokumen yang sudah diketahui

Cek bagian ini dulu saat mengerjakan item terkait.

| # | Konflik | Rujukan |
|---|---|---|
| K1 | WIP poin 10 menyebut ketiga kategori punya nilai assessment, tetapi BRIEF 2a menyebut Tes Penilaian **khusus YA** | WIP poin 10, BRIEF baris 150 |
| K2 | `offering_deadline` di config `2027-01-15`, BRIEF menyebut offering terakhir 31 Des 2026. `offering_opened_at` di config `2027-01-01`, jatuh sesudah batas itu. **Ditunda ke langkah terakhir**, jangan diubah sebelum Ops menjawab | `config/scholarships.php`, BRIEF offering, GATH §5.D4 |
| K3 | **Selesai.** Email penerima export diputuskan `pijak@dicoding.com`, sudah sama dengan config. BRIEF baris 666 yang menyebut `pijak@student.devacademy.id` dianggap usang | config, BRIEF baris 666 |
| K4 | **Selesai diputuskan 887.** Course assessment dipastikan Course 887 ("Tes Seleksi Pijak 2027 in collaboration with IBM SkillsBuild") dengan 5 modul teknis (48636, 48639, 48642, 48645, 48648) dan 1 modul traits (45128). `token_packages[1]['course_ids']` diganti ke 887. | BRIEF baris 61, konfirmasi UI modul 2026-10-02 |
| K5 | Kelas Not Eligible: BRIEF menyebut masih akan didiskusikan dengan tim LD soal Bitt, config punya `not_eligible_course_ids` `[570]`, WIP menyebut fokus 1 kelas Dicoding. **Tetap 570 untuk sekarang, diverifikasi di langkah terakhir** | BRIEF baris 90, config, WIP CATATAN 6 |
| K6 | Rencana GATH §22 menambah penyimpanan hasil baru, padahal mekanisme per user `feature:toggle --users` sudah ada | GATH §22, WIP poin 11 |
| K7 | Ringkasan BRIEF menyamakan alur Intensif dan Progresif, tetapi section "Kelas untuk Eligible (Progresif)" menyebut auto-enroll mandiri oleh tim Cohort | BRIEF baris 25 dan 74, GATH §22 |
| K8 | GATH menyebut "8 course" untuk kedua track, kurikulum riil BRIEF dan GATH §5.A7 berbeda (Intensif 7 teknis, 2 bonus, 6 non-teknis, Progresif 4 course) | GATH §5.A7 |
| K9 | **Selesai.** SYNC dulu menulis offering opened at pindah ke "31 januari 2026". Diputuskan Krisna 2027, SYNC sudah diperbaiki | SYNC Date Gimmick |
| K10 | **Selesai.** Tanggal pengganti gimmick sempat berbeda (31 Januari di Date Gimmick, "1 februari" di narasi pengumuman). Diputuskan Krisna 31 Januari 2027 untuk semuanya, anotasi narasi di SYNC sudah disamakan | SYNC Date Gimmick, Narasi Pengumuman |
| K11 | **Diputuskan arahnya.** Kategori "Tidak Eligible Syarat Progresif" tidak ditentukan sistem: Ops memberikan daftar user id peserta yang tidak menyelesaikan minimal satu kelas IBM (data registrasi bisa tidak jujur, dan IBM tidak menyediakan API, item 25). Dikerjakan di item 44 | SYNC Perbaikan, item 25, item 44 |
| K12 | **Diputuskan arahnya.** Ada dua Not Eligible yang harus dibedakan: (a) Not Eligible saat daftar, langsung dapat email dan pengumuman tidak lolos dengan benefit 2 kelas Bitt (item 42), menggantikan auto enroll kelas 570 (K5, item 5, item 30 ikut berubah); (b) Not Eligible di pengumuman karena tidak menyelesaikan kelas IBM, dari daftar Ops, dengan akses IBM SkillsBuild hingga 30 Maret 2027 (item 44) | SYNC Perbaikan, K5, item 5, item 30 |
| K13 | **Diputuskan arahnya.** Leaderboard dirombak: narasi, desain, dan logika (item 39), menggantikan perilaku item 35 | SYNC Leaderboard, item 35 |
| K14 | **Selesai.** Batas cohort form: tulisan gimmick 16 Januari 2027 di narasi baru nomor 5 cohort data, mulai 17 Januari tulisan pindah ke 31 Januari 2027. Nilai config 20 Januari tidak dipakai lagi (item 40) | SYNC Date Gimmick, bagian 0 |

## 2. Backlog berurutan urgensi

Total 44 item. Dokumen ini diurutkan ulang per 2026-10-01 (malam kedua): item yang sudah selesai dan item yang **urgent / aktif
dapat dikerjakan sekarang** diletakkan di bagian atas. Seluruh item yang **ditunda** (termasuk item 1 dan 8 atas arahan Krisna,
langkah terakhir config production, konfirmasi ke Ops, dan Wave 2) dikumpulkan di bagian bawah.

Pembaruan 2026-10-07 (struktur bagian 2): item yang sifatnya cek dan konfirmasi ke Ops atau pihak lain dipisah ke bagian 2.3
tersendiri, tidak lagi tercampur di daftar yang belum dikerjakan. Bagian "yang belum dikerjakan" menjadi 2.4 dan "di luar sistem
ini" menjadi 2.5.

Pembaruan 2026-10-05: item 17 (cron export), 23 (dashboard Metabase), dan 30 (email "program selesai") dipindah dari 2.2 ke
bagian 2.4 paling akhir atas arahan Krisna, karena di luar sistem ini (tugas infra, query dashboard, dan dikerjakan Dimas). Bagian itu sekarang bernomor 2.5.

Pembaruan 2026-10-05 (riset lanjutan): hasil riset item 22, 14, 13, 18 dan bagian 3 dicatat di baris terkait. Keputusan Krisna:
item 22 ditunda dulu (pindah ke 2.3 A, sekarang 2.4 A); item 14 butuh command baru tanpa validasi kategori, sistem percaya daftar id dari Ops;
item 13 dan 18 diserahkan ke Ops tanpa perubahan kode, sama seperti campaign lain; label export, hitung ulang traits, konstanta
`5.77`, dan pembulatan dibiarkan.

### 2.1 Sudah selesai dan sudah ada di master (27 item dan perbaikan UAT 2)

| # | Item | Deskripsi singkat | Status | Sumber |
|---|---|---|---|---|
| 7 | Instansi kosong di Surat Komitmen | Instansi kosong di surat komitmen juga kosong bukan -, harusnya "-" jika user tidak mengisi. **Selesai di PR #5990 (merged).** Terbukti: instansi yang dikosongkan tersimpan `""` sehingga `?? '-'` tidak bekerja, kini `$otherRequirements->institution ?: '-'` dan PDF menampilkan `Instansi : -`. | Selesai (PR #5990 merged) | WIP poin 8, GATH §20.3b |
| 9 | Narasi modal akun IBM | Tambahkan narasi ini di modal cara mengetahui akun organisasi IBM SkillsBuild di bawah gambar: "Bagaimana Jika Belum Terdaftar di \"Yayasan Dicoding Indonesia\"" lalu "Daftar ulang dengan email baru melalui: dicoding.id/Pijak-AksesIBM". **Selesai di PR #5990 (merged).** | Selesai (PR #5990 merged) | WIP poin 13, BRIEF baris 176-190 |
| 12 | Kesiapan Twibbon dan Referral | Twibbon Challenge dimulai 6 Okt. Ops menyiapkan mekanisme 2 minggu sebelum launch. Referral sudah teruji E2E, termasuk referrer yang belum daftar. **Diverifikasi manual di browser 2026-10-01.** Submit Twibbon Challenge dikonfirmasi sudah berfungsi oleh Krisna (2026-10-05). **Sync Ops 2026-10-15:** narasi Referral dan Twibbon diganti dan bagian Twibbon mendapat kalimat "Kunjungi dicoding.com/pijak/twibbon", lihat item 38. | Terverifikasi (referral 2026-10-01, Twibbon 2026-10-05) | BRIEF baris 337-550, NOTES poin 5, GATH §20.3f |
| 5 | ~~Email Not Eligible, placeholder Bitt~~ **Selesai** | Dicek 2026-10-01: tidak ada lagi `[Nama Kelas Bitt]`, `[XX hari]`, atau link `bitt.id` di `registration-confirmation.blade.php`. Nama kelas, link, dan masa akses diambil dari config. **Sync Ops 2026-10-15:** benefit Not Eligible berubah ke kelas Bitt, lihat item 42 dan K12. | Selesai di master | GATH §21, §20.4 |
| 15 | Perhitungan traits: config dan jadwal | Tambah `weighted_exam_calculations` di `scholarships.pijak` (key 1: sheet bobot, range `'Pijak - Assessment Traits'!A2:C`, label `pijak_exam_traits`, `traits_tutorial_id` 45128, `start_calculation_after` '2026-10-01 00:00:00') dan `technical_tutorial_ids` (5 modul: 48636, 48639, 48642, 48645, 48648) di `config/scholarships.php` dan `bootstrap/environments/local/scholarships.php`. `token_packages[1]['course_ids']` diganti ke 887 (K4). Command `campaigns:exams:calculate-results pijak` berjalan sukses via queue (diverifikasi local 2026-10-05). | **Selesai, PR [#6017](https://github.com/dicoding-dev/dicoding/pull/6017) merged 2026-10-06 (`ba298c09705`), terverifikasi di master 2026-10-07** | Bagian 3 |
| 16 | Export dengan nilai assessment traits/teknis & 3 subsheet tambahan | Handler `Pijak2027ParticipantsExportHandler`: sheet Young Adult (Intensive Eligible) menampilkan nilai per modul Tes Teknis (kolom per `technical_tutorial_ids`), `General Assessment` (rata-rata modul teknis dibagi jumlah modul di config), dan `Traits Assessment` (skor `pijak_exam_traits`). Status ujian dipetakan lewat `ExamStateStatus`. Kolom checkbox diringkas jadi satu sel per pertanyaan, ditambah `Email Akun IBM SkillsBuild`. 3 subsheet baru: `Pendaftaran Parsial`, `Surat Komitmen` (link generated dan signed; kegagalan link di-log lalu export lanjut), `Offering & Cohort Data`. Integration test, Psalm, dan run export manual di local lolos. | **Selesai, PR [#6017](https://github.com/dicoding-dev/dicoding/pull/6017) merged 2026-10-06 (`ba298c09705`), 6 sheet terverifikasi di master 2026-10-07** | WIP poin 10, BRIEF baris 664, bagian 3 |
| 1 | Sisa stack UAT | Stack UAT selesai: #5937, #5941, #5947, #5963, #5966, #5990, dan #6023 sudah merge. | **Selesai, PR [#5966](https://github.com/dicoding-dev/dicoding/pull/5966) merged 2026-10-07** | UAT |
| 14 | Pengumuman per batch untuk peserta Progressive | Fitur pengumuman per batch untuk peserta progressive (nanti list nya diberikan oleh tim ops) mendapatkan email+buka pengumuman+auto enroll per batch. Entah lewat command+user id dari stdin, atau command+sheet terpisah yang diberikan oleh tim ops per batch per sheet. Ini harus nunggu data dari tim ops, bukan by system. Seberapa banyak argumen yang bisa diberikan? Jika ada limitasi, apa harus pakai google sheet? Sudah ada command pijak lawas `deck art feature:toggle enable pijak-final-selection-result --users=123,11...`, belum tahu bisa dipakai ulang atau tidak. Belum ada kodenya. **Riset 2026-10-05:** `feature:toggle enable pijak-final-selection-result --users=` (`app/commands/FeatureToggle.php`) hanya menulis flag per user ke `feature_users`, dan flag itu sudah membuka halaman `progressive-accepted` 2027 (`PijakViewModel::shouldDisplayFinalAnnouncement()`, `announcement/index.blade.php:30-34`). Command itu tidak mengirim email, tidak enroll, dan tidak memvalidasi id. Command legacy `PijakUpdateFinalSelectionResultCommand` (program 1645) yang dulu mengirim email dan enroll, tapi menyalakan flag global dan tidak idempotent. Jadi perlu **command baru**. **Keputusan Krisna:** tidak ada validasi kategori, sistem percaya daftar user id dari Ops (termasuk Intensive yang jatuh ke Progressive). **Desain yang disepakati (belum diimplementasi):** `scholarships:pijak:announce-progressive --userIds=... [--dry-run]`; validasi hanya id integer >= 1 dan dedup; per user: skip kalau token Progressive sudah ada, `autoRedeem` token Progressive (pola `autoRedeemNotEligibleToken`), `FeatureUsersGateway::enableForUser` untuk flag per user, dispatch event baru `PijakProgressiveParticipantWasAnnounced` dengan mailer `{Event}Mailer`; config baru `progressive_course_ids` dan `progressive_token_active_period` (30 hari); ringkasan sukses/skip/gagal. Batas `--userIds` sekitar 16 ribu id per argumen (Linux 128 KB). Menunggu Ops: copy dan subjek email, course id Progresif production, jumlah id per batch. **Pembaruan 2026-10-05 (benefit dari Krisna):** kelas Progresif 862 (AI Praktis untuk Produktivitas), 867 (Belajar Penggunaan Generative AI), 753 (Prompt Engineering untuk Software Developer), 123 (Belajar Dasar Pemrograman Web). Token: owner `pijak@dicoding.com`, nama program `Pijak 2027 in collaboration with IBM SkillsBuild`, deskripsi `Pijak 2027 in collaboration with IBM SkillsBuild Progressive`, deadline 30 hari setelah bulk auto enroll. **Keputusan Krisna (K7):** enroll tetap lewat command ini (bukan tool terpisah Cohort), command dijalankan per batch atas daftar Ops/Cohort. Email pengumuman memakai **view baru** dengan layout `emails.scholarships.pijak.layout` (bukan cabang di `registration-confirmation.blade.php`, yang dikirim saat pendaftaran). **Implementasi 2026-10-05** di branch `feature/pijak/announce-progressive` (dari `master`), PR [#6021](https://github.com/dicoding-dev/dicoding/pull/6021): `PijakAnnounceProgressiveCommand`, `PijakProgressiveAnnouncementSpecification`, event `PijakProgressiveParticipantWasAnnounced` dan mailernya, view `emails.scholarships.pijak.progressive-announcement`, config `progressive_course_ids` dan `progressive_token_active_period`. Deskripsi token diturunkan dari `program_name` + " Progressive". User yang bukan peserta program dihitung gagal. `--dry-run` tidak dibuat. Integration test, Psalm, preflight, dan E2E local lolos. **Placeholder:** copy di `app/views/emails/scholarships/pijak/progressive-announcement.blade.php` masih draft sementara dan **wajib dikonfirmasi ke tim Ops sebelum rilis** (masuk lingkup item 10). | **Selesai, PR [#6021](https://github.com/dicoding-dev/dicoding/pull/6021) merged 2026-10-08.** Command, config `progressive_course_ids`, dan `progressive_token_active_period` kini ada di master. Copy email masih draft (item 10 bagian 3) | WIP poin 11, GATH §22 |
| 26 | Narasi dan gambar bagikan ke LinkedIn | Gambar `public/img/pijak/appreciation-card-linkedin.png` diganti (file yang sama juga dipakai halaman pengumuman Pijak lawas/IBM) dan `postCaption` di view pengumuman 2027 diganti menjadi narasi baru dari Krisna: "Perjalanan menjadi talenta IT berawal dari tekad dan kemampuan yang terus diasah. Saya ambil langkah untuk jadi bagian dari generasi AI Indonesia yang maju, dan sekarang saya terpilih belajar AI-Powered Development with IBM Agentic Coding. Giliranmu untuk memajukan AI bersama Indonesia!" Ajakan ke dicoding.com/pijak2027 tidak lagi ada di caption. Lanjutan: [#6080](https://github.com/dicoding-dev/dicoding/pull/6080) (merged 2026-10-13) menampilkan modal "Bagikan Pencapaianmu di LinkedIn" sekali saat form cohort terbuka, sama seperti IBM SkillsBuild dan AI Camp. | **Selesai, PR [#6057](https://github.com/dicoding-dev/dicoding/pull/6057) merged 2026-10-08 dan [#6080](https://github.com/dicoding-dev/dicoding/pull/6080) merged 2026-10-13** | Info Krisna |
| 27 | Tombol re-offer | Tombol mencatat permintaan `reoffer_requested_at`, Ops re-offer lewat admin, plus sheet `Re-offer Request` di export. Perbaikan lanjutan [#6090](https://github.com/dicoding-dev/dicoding/pull/6090): guard re-offer tanpa offering dan pesan Pijak (re-offer, Twibbon) jadi key terjemahan dot notation. | **Selesai, PR [#6031](https://github.com/dicoding-dev/dicoding/pull/6031) merged 2026-10-08, [#6033](https://github.com/dicoding-dev/dicoding/pull/6033) merged 2026-10-12, [#6090](https://github.com/dicoding-dev/dicoding/pull/6090) merged 2026-10-13** | Bagian 4.3 |
| 19 | Reminder pengisian cohort data 24 jam | Reminder pengisian cohort data jika dalam 24 jam belum diisi oleh peserta. Email reminder ketika user klik tombol menerima offering tidak boleh langsung dikirimkan, tapi tunggu sampai 24 jam, jika lewat dari itu maka kirimkan emailnya. Bisa dengan artisan command, tapi harus ditrack kapan user klik tombol terima offering. Kalau command jalan 24 jam sekali, user yang klik 3 jam setelah command jalan baru dapat email 48 jam kemudian. Cek kode: `confirmed_at` sudah terisi. **Brainstorm 2026-10-06:** lihat bagian 4.1. **Implementasi 2026-10-08** di branch `feature/pijak/cohort-data-reminder`, PR [#6063](https://github.com/dicoding-dev/dicoding/pull/6063) (draft): pendekatan 6 dari 4.1, command `scholarships:pijak:remind-cohort-form` dengan penanda `cohort_reminder_sent_at` di `scholarship_participants.other_requirements`, mailer `ScholarshipOfferingStatusWasUpdatedMailer` dihapus (keputusan Krisna: email tidak dikirim lagi saat klik terima). Integration test, Psalm, preflight (risk high), dan E2E local lolos. Detail pemakaian di `commands.md` bagian 7. **Menunggu:** cron per jam dijadwalkan infra. | **Selesai, PR [#6063](https://github.com/dicoding-dev/dicoding/pull/6063) merged 2026-10-13.** Tinggal cron per jam `scholarships:pijak:remind-cohort-form` dijadwalkan infra. **Sync Ops 2026-10-15:** batas cohort form berubah (gimmick 16 Januari, asli 31 Januari), lihat item 40 dan K14 | Draft, risk high (review kode dan approval sebelum merge) |
| 35 | Leaderboard referral | Halaman "Top 25 Referral Program Pijak 2027 in collaboration with IBM SkillsBuild" di `/pijak2027/leaderboard` (route `pijak2027.referral-leaderboard.index`): `PijakGateway::getTopReferrerLeaderboard()` (limit 25) dan `getReferralProgressByUserId()`, `PijakReferralLeaderboardAction`, view `pijak/referral-leaderboard.blade.php`, data di-cache 12 jam. Hitungan memakai semua pendaftar lewat link referral yang melengkapi formulir; syarat course IBM divalidasi manual Ops. Pemindahan ke `/pijak/leaderboard` ikut cutover item 2. **Sync Ops 2026-10-15:** desain dan syarat masuk leaderboard berubah, lihat item 39 dan K13. | **Selesai, PR [#6098](https://github.com/dicoding-dev/dicoding/pull/6098) merged 2026-10-14** | BRIEF bagian Leaderboard Referral, info Krisna 2026-10-13 |
| 11, 28 | Validasi email IBM SkillsBuild (item 11) dan list SkillsBuild 2026 (item 28) | Tolak email IBM yang sudah pernah dipakai di program IBM sebelumnya. Per 2026-10-16 dicek lewat tabel `meta_contents` (key dari config `ibm_account_exclusion_keys`, isi `['pijak:ibmsb:registered_email']`) dengan `MetaContentGateway::hasValueInKeys()`, plus unique index `(key, value(255))`. Tabel `excluded_emails` tidak dipakai lagi. Data diimpor tim infra. | **Selesai, PR [#6030](https://github.com/dicoding-dev/dicoding/pull/6030) merged 2026-10-21.** Data `meta_contents` diimpor tim infra | Bagian 4.2 |
| 36 | Tanggal buka pendaftaran | Config `registration_opened_at` di blok `pijak` (production `2026-11-12 00:00:00` sesuai keputusan Krisna 2026-10-16; override local `2026-10-01 00:00:00`). `PijakGateway::getProgramRegistrationOpenedAt()`, `PijakViewModel::isRegistrationNotYetOpen()` dan `getFormattedRegistrationOpenedAt()`. Sebelum tanggal buka, `PijakRegistrationIndexAction` menampilkan halaman welcome "Pendaftaran Belum Dibuka" dengan tanggal buka, pola Mastercard dan AI Camp. Keputusan Krisna 2026-10-16: guard hanya di tampilan, tidak di aggregate, sama seperti campaign lain. Tanpa integration test, sama seperti campaign lain (tidak ada yang menguji halaman belum dibuka); dicek manual di browser 2026-10-16 (belum dibuka dan sudah dibuka). Psalm dan 86 integration test Pijak lolos. | **Selesai, PR [#6126](https://github.com/dicoding-dev/dicoding/pull/6126) merged 2026-10-20.** Tanggal buka production `2026-11-12 00:00:00` | Info Krisna 2026-10-16 |
| 40 | Date Gimmick | "Registration closed date -> 31 januari 2027 ini aslinya, tapi ada gimmick bahwa registrasi ditutup 31 desember 2026. Jadi nanti setelah 1 januari tulisan otomatis pindah jadi 31 januari 2027."<br>"Token deadline: batas pengerjaan assessment test -> 31 januari 2027 23.59, tidak ada gimmick"<br>"Offering opened at -> 13 Januari 2027 (gimmick tulisan), cuman display/tulisan aja. Aslinya sebisa mungkin cepat-cepat kasih offering by tim ops. Setelah 14 januari langsung pindah jadi 31 januari 2027 tulisannya"<br>"Offering deadline: batas konfirmasi offering -> 13 Januari 2027 (gimmick juga, aslinya mah 31 januari, tapi untuk yang dapat offering di 13 januari harus tetap narasi emailnya di hari itu bukan yang 48 jam) bisa extend ke 31 januari (harus pindah jadi 31 januari setelah gimmick berakhir)."<br>"Cohort form deadline. 16 januari (gimmick juga, aslinya mah 31 januari) tapi nanti bisa extend ke 31 januari, sama seperti offering deadline."<br>"Sekarang akan ada narasi baru di nomor 5 bagian cohort data terkait deadline pengisian cohort data. Ini narasinya: \"Batas maksimum pengisian formulir ini hanya sampai dengan 16 Januari 2027. Apabila Anda tidak mengisi sesuai dengan batas waktu, Anda dinyatakan tidak lolos Beasiswa Intensif Pijak 2027.\""<br><br>Menjawab item 6. **Keputusan Krisna 2026-10-19:** (1) Offering opened at hanya untuk tampilan di halaman pengumuman. Pijak tidak memakai narasi rentang "offering opened at hingga offering deadline" seperti campaign lain, tetapi langsung "diinfokan selambatnya pada 13 Januari 2027", yaitu tanggal gimmick offering deadline. Mulai 14 Januari tulisan pindah ke 31 Januari 2027. (2) Gimmick 13 Januari diperlakukan sebagai batas akhir offering: offering yang diberikan 13 Januari mendapat email 24 jam ("hari terakhir"), bukan 48 jam. Offering yang diberikan mulai 14 Januari memakai batas 31 Januari. (3) Cohort form: narasi nomor 5 menulis 16 Januari 2027, mulai 17 Januari tulisan pindah ke 31 Januari 2027. Semua tanggal pengganti 31 Januari 2027 (K10). **Cek kode 2026-10-19:** email 24 jam sudah ada. `ScholarshipOfferingWasCreatedMailer::isLastDayOffering()` memilih subjek "Hanya Hari Ini" kalau tanggal offering sama dengan due date, dan due date dihitung `min(now + 2 hari, offeringDeadline)` di `ScholarshipOfferingCreation`. Jadi email 24 jam otomatis muncul kalau `offering_deadline` yang berlaku pada 13 Januari adalah 13 Januari 23:59. Karena admin ditolak membuat offering setelah `offeringDeadline` lewat, batas offering yang berlaku harus berganti dari 13 ke 31 Januari mulai 14 Januari, bukan hanya teksnya. Hal yang sama berlaku untuk `registration_closed_at` (tulisan 31 Des, batas asli 31 Jan) dan `cohort_form_deadline` (tulisan 16 Jan, batas asli 31 Jan). `token_deadline` cukup diganti ke 31 Januari 2027 23:59. **Keputusan Krisna 2026-10-19 (desain config):** tanggal gimmick disimpan sebagai key config baru di samping batas asli yang sudah ada (`registration_closed_at`, `offering_deadline`, `cohort_form_deadline` bernilai 31 Januari 2027; key gimmick 31 Desember 2026, 13 Januari 2027, 16 Januari 2027; nama key ditentukan saat implementasi). Satu aturan untuk tanggal yang ditampilkan: tanggal gimmick selama belum lewat, setelah itu batas asli, tanpa deploy. **Hal yang perlu diperhatikan:** (a) registrasi dan cohort form: gimmick hanya tulisan, sistem tetap menerima sampai batas asli; (b) offering tidak cukup tulisan: batas yang dipakai sistem ikut aturan yang sama (13 Januari sampai lewat, lalu 31 Januari), karena due date `min(now + 2 hari, offeringDeadline)` menentukan email 24 jam lewat `ScholarshipOfferingWasCreatedMailer::isLastDayOffering()`, dan admin ditolak memberi offering setelah `offeringDeadline` lewat; (c) `offering_deadline` dibaca di `ScholarshipsOfferingIndexAction` yang dipakai bersama program lain, perubahannya hanya "pakai key gimmick kalau ada dan belum lewat", pastikan program lain tidak terpengaruh dengan test. Tulisan "diinfokan selambatnya pada 13 Januari 2027" di pengumuman dikerjakan di item 43 supaya tidak dobel. Card [10417100089](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100089), 2 SP. **Implementasi 2026-10-19** di branch `feature/pijak/date-gimmick` (dari `master`), PR [#6138](https://github.com/dicoding-dev/dicoding/pull/6138): key config baru `registration_closed_at_gimmick` (`2026-12-31 23:59:59`), `offering_deadline_gimmick` (`2027-01-13 23:59:59`), dan `cohort_form_deadline_gimmick` (`2027-01-16 23:59:59`); `registration_closed_at`, `token_deadline`, `offering_deadline`, dan `cohort_form_deadline` menjadi `2027-01-31 23:59:59` (config production dan override local). Aturannya satu method private `PijakGateway::getAnnouncedDeadline()`; key gimmick wajib ada di config Pijak. `getProgramOfferingDeadline()` kini mengembalikan batas efektif (dipakai `isOfferingClosed()` dan re-offer). `getAnnouncedRegistrationClosedAt()` dipakai hitung mundur navbar dan banner email konfirmasi registrasi (sebelumnya di-hardcode `31 Desember 2026`). `getAnnouncedCohortFormDeadline()` dipakai instruksi cohort nomor 5 dan email `scholarships:pijak:remind-cohort-form`. `isRegistrationClosed()`, `isCohortFormClosed()`, dan guard command reminder tetap memakai batas asli. `ScholarshipOfferingCreationRepository` (dipakai bersama) memakai `offering_deadline_gimmick` hanya kalau key ada dan belum lewat, jadi program lain tidak berubah. Poin (c) disederhanakan: `ScholarshipsOfferingIndexAction` tidak diubah, halaman admin offering tetap menampilkan batas asli 31 Januari. Value object terpisah sempat dibuat lalu dihapus atas arahan Krisna (cukup method private di gateway). **Keputusan Krisna 2026-10-19:** offering yang sudah jatuh tempo 13 Januari tidak diperpanjang otomatis ke 31 Januari; peserta yang telat mengajukan re-offer dan Ops memberi offering ulang. `offering_opened_at` tidak diubah; tulisan "selambatnya 13 Januari 2027" tetap di item 43. Integration test (91, termasuk 3 test baru), Psalm, preflight (dua reviewer tanpa temuan), dan verifikasi browser local 10 skenario (gimmick belum lewat, hari gimmick offering, dan gimmick lewat) lolos. Re-offer hanya tercakup integration test. | **Selesai, PR [#6138](https://github.com/dicoding-dev/dicoding/pull/6138) merged 2026-10-21** | SYNC Date Gimmick, item 6 |
| 37 | Mentee Grouping | "Tim ops ingin agar peserta yang menggunakan link referral fasilitator ketika mendaftar maka dia akan langsung diberikan email hasil registrasi yang berbeda."<br>"Ada 3 use case:"<br>"- Jika peserta pijak2027 daftar pake link referral yang ternyata itu referral dari seorang fasil maka peserta tadi di assign jadi mentee fasil tersebut melalui link group whatsapp yang disediakan di email. Jika fasilitator tersebut ternyata sudah memiliki max 1000 mentee maka yang ke 1001 akan diassign ke fasil lain."<br>"- Jika peserta pijak2027 daftar pake link referral yang bukan referral seoarang fasil, maka peserta tersebut di assign ke fasilitator yang masih kurang pesertanya melalui link group WA yang disediakan di email juga."<br>"- Jika peserta pijak2027 daftar tanpa link referral maka peserta tersebut di assign ke fasilitator yang masih kurang pesertanya melalui link group WA yang disediakan di email juga."<br>"Notes tambahan dan masih brainstorm: Jika mencapai 1000 referrer untuk seorang fasil maka sistem harus flag di other requirements bahwa fasil tersebut sudah max dan tidak bisa dikirimkan link group yang sama lagi (harus di assign ke fasil lain)"<br><br>**Keputusan dan catatan:** Usulan shortlink `dicoding.id/group-whatsapp-{UID-fasil}` dan daftar user id fasil di config ada di SYNC. **Usulan engineer (belum diputuskan):** simpan fasil yang ditugaskan di sisi mentee (key baru di `other_requirements` peserta), lalu hitung jumlah mentee per fasil dengan query. Yang dihitung jumlah mentee, bukan jumlah referral, karena peserta tanpa referral fasil juga dibagikan ke fasil. Flag "fasil sudah max" di sisi fasil jadi tidak perlu karena bisa diturunkan dari hitungan, dan fasil belum tentu peserta program sehingga belum tentu punya `other_requirements`. "Fasil yang masih kurang" = fasil di config dengan mentee paling sedikit dan di bawah 1000. **Diskusi 2026-10-19:** model data disetujui arahnya: key uid fasil di `other_requirements` mentee, kuota dihitung dari jumlah mentee dengan uid fasil yang sama, tanpa flag kuota di sisi fasil. Pemerataan: peserta tanpa referral fasil (dan mentee ke 1001 dari fasil penuh) selalu diberikan ke fasil dengan mentee paling sedikit, seri dipecah dengan urutan config, sehingga selisih antar fasil paling banyak 1 untuk bagian yang dibagikan sistem. Yang bisa membuat tidak merata hanya mentee lewat referral fasil, dan itu memang permintaan Ops. Jumlah per fasil sebaiknya ikut di export supaya Ops bisa memantau. **Jawaban Ops 2026-10-19:** "Sepertinya dari segi detik less likely buat ada yang sama persis waktu daftarnya", "Kenapa di 1000? Sebenarnya biar si fasil-fasil ini yang bawa banyak orang bisa berbagi ke fasil lain biar bisa diclaim progressnya oleh fasil lain", "Karena bayaran hadiah mereka berdasarkan capaian fasil bisa membuat peserta berprogress". Jadi 1000 adalah batas bisnis untuk membagi peserta antar fasil, bukan batas teknis grup WhatsApp. **Usulan engineer:** tanpa lock. Kelebihan 1 mentee saat pendaftaran bersamaan jarang terjadi dan tidak merusak apa pun. Karena hadiah fasil dihitung dari progres mentee, uid fasil di `other_requirements` mentee menjadi data dasar perhitungan hadiah: ditetapkan sekali saat registrasi, tidak dipindah otomatis setelahnya, dan perlu ikut di export bersama progres mentee. Email konfirmasi registrasi perlu cabang baru berisi link grup.<br><br>**Keputusan Krisna dan Ops 2026-10-19 (implementasi):** fasil yang ikut mendaftar mendapat grupnya sendiri (jawaban Ops: "Dapat link grup dia sendiri aja"). Kalau semua fasil penuh, peserta tetap masuk ke fasil dengan mentee paling sedikit walau melewati 1000; peserta hanya tanpa fasil kalau daftar fasil kosong. Not Eligible tidak mendapat fasil. Export kolom fasil ditunda (YAGNI). **Implementasi 2026-10-19** di branch `feature/pijak/mentee-grouping` (dari `master`), PR [#6141](https://github.com/dicoding-dev/dicoding/pull/6141): aturan di method private `PijakGateway::findFacilitatorId()` dan `getMenteeCountsByFacilitatorId()` (tanpa domain/VO, tanpa lock), dipanggil di `saveRegistration()` untuk Intensif dan Progresif; uid fasil disimpan sekali sebagai `facilitator_id` di `other_requirements`. Config baru `facilitator_user_ids` (production `[]` sampai daftar dari Ops, local dummy `[2, 3, 4]`), `facilitator_mentee_quota` (1000), `facilitator_group_link_format` (`https://dicoding.id/group-whatsapp-%d`), ditulis eksplisit juga di override local. Email konfirmasi registrasi menampilkan kartu hijau "Gabung Grup WhatsApp Pendampingan" dengan tombol ke link grup hanya kalau `facilitator_id` ada; copy masih sementara, **menunggu narasi email dari Ops**. Integration test (92, termasuk 8 test baru), Psalm, preflight (rules tanpa temuan, simplicity 2 nit diperbaiki), dan E2E local 7 skenario lewat akun baru yang didaftarkan via UI Dicoding (A sampai G) lolos. **Menunggu dari Ops:** daftar uid fasil production dan narasi email link grup. Catatan local: rate limit verifikasi email (`usermailverification`) tersimpan di Redis key `{ip}:{method}:{path}`, hapus key itu kalau E2E terhambat. | **Selesai, PR [#6141](https://github.com/dicoding-dev/dicoding/pull/6141) merged 2026-10-22.** Narasi email fasil di [#6167](https://github.com/dicoding-dev/dicoding/pull/6167). Menunggu data fasil production dari Ops (lihat follow-up 21 Okt, catatan nama fasil) | SYNC Mentee Grouping |
| 8, 43 | Komponen narasi pengumuman Pijak (menjawab item 8) | "Narasi pengumuman pengen berbeda dengan campaign lain, jadi sepertinya harus bikin komponen sendiri. (untuk tulisan 13 januari adalah gimmick tulisan aja dan harus dinamis ketika 14 januari harus pindah jadi 31 januari 2027). Ini narasinya dibagi per kategori, jika sudah sesuai jangan bikin lagi. bisa cek di https://docs.google.com/document/d/1sBJF9kF10arM3EpLV6qDq5dji4-0a-IXCAy-5gUAh1I/edit?tab=t.3dlvost3884w"<br><br>**Cek browser 2026-10-20:** state Intensif sebelumnya memakai komponen bersama `components/offering/*` (waiting, confirmation, has-rejected, cohort-form, cohort-form/submitted); Pijak hanya punya not-eligible, progressive-accepted, dan offering-expired. **Keputusan Krisna 2026-10-20:** yang diganti hanya state Menunggu dan state setelah cohort form terkirim; state offering, tolak, cohort form, dan expired tetap. Menunggu tanpa alert info, teks biasa. **Implementasi 2026-10-20** di branch `feature/pijak/announcement-narrative` (di atas `feature/pijak/date-gimmick`), PR [#6143](https://github.com/dicoding-dev/dicoding/pull/6143): `pijak/.../announcement/waiting.blade.php` lewat parameter `waitingView` yang sudah ada (komponen bersama tidak diubah); `intensive-accepted.blade.php` tampil kalau `hasCohortFormSubmitted()`, menggantikan "Formulir Cohort Data Terkirim"; tanggal dari `getProgramOfferingDeadline()` (gimmick 13 Januari lalu 31 Januari) dengan format `j F Y`. Salam penutup di kartu Progresif dan Not Eligible. Kartu Not Eligible dari awal memakai narasi Bitt (item 42) dengan tombol "Siapkan Akun Bitt" (warna brand, `href="#"`), dua tautan kelas `#`, dan teks `[tanggal berakhir]` sebagai placeholder bertanda `@todo`. `getProgramOfferingOpenedAt()` dihapus dari `PijakViewModel` dan `PijakGateway` karena tidak dipakai lagi (key config `offering_opened_at` dibiarkan). Kartu Not Eligible IBM tidak dibuat di sini (item 44). Tanggal di `PijakAnnouncementIntegrationTest` dibuat relatif terhadap `now()`; test juga lolos dengan `Carbon::setTestNow` 2027-01-14 dan 2027-02-01. Unit (9279), integration Pijak (90), Psalm, paratest (2 flaky tidak terkait), preflight (2 nit diperbaiki), dan cek browser local lolos. | **Selesai, PR [#6143](https://github.com/dicoding-dev/dicoding/pull/6143) merged 2026-10-23** | Info Krisna 2026-10-20 |
| 44 | Pengumuman Not Eligible karena tidak menyelesaikan kelas IBM | "- Not eligible karena dia tidak menyelesaikan minimal satu kelas ibm: ini akan diberikan datanya oleh tim ops dan pengumumannya berisi \"Untuk melanjutkan semangat Anda, Anda dapat tetap mengakses pembelajaran di IBM SkillsBuild hingga 30 Maret 2027.\""<br><br>Not Eligible jenis (b) di K12. **Keputusan Krisna 2026-10-19:** datanya dari Ops karena peserta bisa tidak jujur di form registrasi (K11). Email dikirim tim Ops. **Usulan engineer (belum diputuskan):** command per batch dengan pola item 14, misalnya `scholarships:pijak:announce-not-eligible --userIds=...`, yang hanya membuka pengumuman (flag per user `pijak-final-selection-result`) dan menyimpan penanda kategori di `other_requirements` supaya halaman tahu kartu mana yang tampil. Tanpa mailer, karena email dari Ops; mailer baru ditambahkan kalau nanti desain email ini diminta dikirim lewat sistem. Ada tidaknya email untuk kategori ini dan isinya urusan Ops (Krisna 2026-10-19). Narasi: SYNC bagian "Tidak Eligible (Non YA/VS) atau Tidak Eligible Syarat Progresif". **Keputusan Krisna 2026-10-20:** PR terpisah dari #6143; kartunya dibuat bersama command dan penanda kategori, tidak duluan sebagai placeholder. **Keputusan Krisna 2026-10-22:** penanda berupa feature flag per user `pijak-not-selected`, diisi lewat command khusus `scholarships:pijak:announce-not-selected --userIds=...` (bukan `feature:toggle`, yang bisa menyala global kalau lupa `--users`). Tanpa aturan skip, tanpa email, tanpa token. Nama "not selected" karena kategori peserta ini YA/VS. **Implementasi 2026-10-22** di branch `feature/pijak/announce-not-selected` (di atas #6143): `PijakAnnounceNotSelectedCommand`, `PijakNotSelectedAnnouncementSpecification`, kartu `announcement/not-selected.blade.php` dicek sebelum kartu Progresif, ceklis sidebar Pengumuman. Detail di `commands.md` bagian 9. PR [#6169](https://github.com/dicoding-dev/dicoding/pull/6169) (open 2026-10-22, base #6143, risk medium post-merge). **Diubah sebelum merge:** penanda memakai status `scholarship_participants.category`, bukan flag per user. `progressive_eligible` menjadi `progressive_ineligible`, `intensive_eligible` tanpa offering menjadi `intensive_ineligible`; status lain, peserta yang sudah punya offering, dan bukan peserta dihitung gagal. Export menaruh status baru di sheet sendiri, dan sheet Surat Komitmen tetap memuat peserta Intensif yang tidak terpilih. | **Selesai, PR [#6169](https://github.com/dicoding-dev/dicoding/pull/6169) merged 2026-10-26** | SYNC |
| 41 | Feature flag Pijak 2027 | "Saat ini, kita menggunakan feature flag pijak untuk pijak2027, di production flag Pijak itu sudah aktif dan otomatis jika dibuka pijak2027/registration itu bisa dibuka, better disable toggle pijak atau untuk pijak 2027 ini bikin flag baru tapi route nya nanti tetap pijak/registration bukan pijak2027/registration"<br><br>**Keputusan Krisna 2026-10-22:** flag baru `pijak2027`; flag `pijak` tetap menyala untuk Pijak Flash (`/pijak`). **Implementasi 2026-10-22** di branch `improvements/pijak/pijak2027-feature-flag` (dari `master`): middleware grup `pijak2027/*` di `app/routes/pijak_2027.php` diganti dari `pijak` (`PijakRouteFilter`) ke `features:pijak2027` (`FeatureRouteFilter`, sudah dipakai `ddc`, `dbn`, dan lainnya). `PijakRouteFilter` tidak diubah. Toggle di `setUp` tiga integration test (Announcement, OfferingAndCohort, ReofferRequest) diganti ke `pijak2027`, tanpa test baru. Flag yang belum ada di tabel `toggles` dianggap mati, jadi setelah deploy `/pijak2027` tertutup sampai `feature:toggle enable pijak2027` dijalankan (detail QA per user dan `?bypass` di `commands.md` bagian 1). Integration test Pijak (76), Psalm, preflight (dua reviewer tanpa temuan), dan cek browser local (flag mati, per user, global; `/pijak` tetap terbuka) lolos. Saat cutover item 2, prefix pindah ke `pijak` dengan middleware `features:pijak2027` tetap dibawa. Setelah deploy, `/pijak2027` tertutup sampai `php artisan feature:toggle enable pijak2027` dijalankan. | **Selesai, PR [#6170](https://github.com/dicoding-dev/dicoding/pull/6170) merged 2026-10-23** | SYNC |
| QA D | Email versi 2 YA dan VS (follow-up QA 21 Okt, D1 sampai D5) | Detail di [follow-up-21-oct-2026.md](follow-up-21-oct-2026.md) bagian D dan Progres PR 3. Sisa: sumber nama fasil (nama akun Dicoding atau nama lengkap dari sheet Ops) dan isi `facilitator_user_ids` production, lihat 2.3 item 47. | **Selesai, PR [#6167](https://github.com/dicoding-dev/dicoding/pull/6167) merged 2026-10-23** | Follow-up QA 21 Okt |
| 38 | Narasi Referral dan Twibbon | "Pisahkan halaman Twibbon dan Referral"<br>"Update Narasi Referral dan Twibbon:" | **Selesai, PR [#6174](https://github.com/dicoding-dev/dicoding/pull/6174) merged 2026-10-23** | SYNC |
| QA A7 | Isian Intensif yang tersembunyi ikut terkirim (catatan reviewer #6159) | `#intensiveOnlyFields` dan `#commitmentAccordion` hanya disembunyikan, sehingga perangkat, komitmen, nama KTP, `violation_agree`, dan timezone yang diisi sebelum kriteria berubah tetap masuk preview, draft auto-save, dan submit. Sekarang memakai `toggleConditionalSection()`, yang hanya mengubah field ber-`name` supaya `timezone_display` tetap disabled. | **Selesai, PR [#6177](https://github.com/dicoding-dev/dicoding/pull/6177) merged 2026-10-23** | Follow-up QA 21 Okt |
| 45 | Pengumuman Progresif lewat status | `scholarships:pijak:announce-progressive` kini mengubah status peserta menjadi `progressive_selected` setelah kelas Progresif di-enroll, dan halaman pengumuman serta sidebar membaca status itu, bukan flag per user `pijak-final-selection-result` yang bisa dinyalakan peserta sendiri lewat `/features/enabled`. Hanya `progressive_eligible` yang diumumkan; rerun melewati yang sudah `progressive_selected`; kalau token sudah dibuat tetapi status belum berubah, run berikutnya mengubah status dan mengirim email tanpa membuat token kedua. Export menaruh `progressive_selected` di sheet sendiri. Detail di `commands.md` bagian 4. | **Selesai, PR [#6197](https://github.com/dicoding-dev/dicoding/pull/6197) merged 2026-10-26** | Lanjutan #6169 |
| 10 | Narasi email dan pengumuman | Tiga bagian, diputuskan Krisna 2026-10-12. (1) Copy kartu "Selesaikan Course IBM SkillsBuild" di `pijak/registration/administration/index.blade.php` diganti dari "beasiswa Progresif" menjadi "beasiswa Intensif/Progresif" sesuai BRIEF baris 123. **Selesai, PR [#6083](https://github.com/dicoding-dev/dicoding/pull/6083) merged 2026-10-13.** (2) Angka "sekitar 70 menit" di kartu Tes Penilaian dan email konfirmasi pendaftaran sudah sesuai BRIEF, tidak ada perubahan. (3) Copy `app/views/emails/scholarships/pijak/progressive-announcement.blade.php` (item 14) masih draft engineering. Menurut BRIEF, HTML email ini dibuat tim Registrasi, jadi **menunggu HTML dari tim Registrasi** lalu ganti isi view. **Sync Ops 2026-10-15:** "Email pengumuman progressive perlu update, nunggu desain dari tim Ops" **Cek 2026-10-22:** `Pijak 2027 - Registration Draft.md` (diperbarui 21 Okt) sudah memuat versi resminya di bagian "Eligible Young Adult atau Vocational Students – Progressive" (subject "Anda Diterima di Beasiswa Progresif Pijak 2027, Mulai Belajar Hari Ini!", HTML lengkap, `{{Email}}`, dan `{{Tanggal Akses Berakhir}}` berupa tanggal, bukan jumlah hari); action item Notes Sync 14 Okt untuk draft email ini sudah dicentang. Bisa dikerjakan di atas #6167 (layout email bersama). Card [10417267801](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267801). | **Selesai.** Bagian (1) lewat #6083. Bagian (3) email Progressive mengikuti desain resmi lewat PR [#6225](https://github.com/dicoding-dev/dicoding/pull/6225) merged 2026-10-27 (`progressive-announcement.blade.php`, `PijakProgressiveParticipantWasAnnouncedMailer`) | WIP poin 3 dan 5, BRIEF baris 67-68, 123, dan 150-163, GATH §3 poin 5 |
| 46 | Samakan email registrasi dengan versi 2 di `emails.md` | Dibandingkan 2026-10-26: "[VERSI 2] Eligible Young Adult – Intensive" dan "HTML Versi 2" Vocational Students dengan `registration-confirmation.blade.php` (cabang `$is_eligible`). Subject keduanya sudah sama. **YA dan VS:** (1) Tombol grup di dalam kotak abu-abu detail fasil (setelah tabel, `margin-top: 16px`), lebar penuh (`display: block; width: 100%; text-align: center; padding: 12px 0; border-radius: 6px; font-size: 14px`, tanpa shadow), teks "Join Grup Fasilitator". Sekarang tombol di luar kotak, inline, teks "Join Grup Sekarang". (2) Banner batas waktu: label huruf kapital (`text-transform: uppercase; letter-spacing: 1px`, "⏳ BATAS WAKTU PENYELESAIAN"); komponen `deadline-banner` belum punya ini. Komponen dipakai juga oleh email offering dan Cohort Data, jadi ubah lewat parameter atau khusus email registrasi. (3) Penutup: garis `<hr>` lalu "Salam, Tim Pijak ..." di dalam padding konten, gambar footer di dalam padding (`margin-top: 35px; border-radius: 4px`). Layout bersama sekarang memakai `border-top` dan gambar selebar email; sama dengan poin 2, layout dipakai email Pijak lain. **YA saja:** (4) bullet kedua "Informasi terkait tes seleksi program & surat komitmen." (sekarang "& administrasi."). (5) Ukuran banner lebih kecil: padding `18px 20px`, `margin-bottom: 24px`, label `12.5px` margin `0 0 4px`, isi `14.5px`, tanggal `17px` margin-top `2px`, catatan `13px` (komponen: `20px`, `13px`, `15px`, `18px`, `14px`). **VS saja:** (6) tidak ada kotak "🚀 Langkah-langkah Mengikuti Pembelajaran di IBM SkillsBuild"; langkah 1 dan 2 masing-masing kotak sendiri dengan gaya email lama: lingkaran nomor `32px` (`font-size: 15px`), judul `16px` `line-height: 32px` `margin: 0 0 10px`, judul langkah 1 "Buat Akun dan Selesaikan IBM SkillsBuild Course" (kapital), paragraf `margin: 0 0 18px` (langkah 2 `0 0 15px`), tombol "Buat Akun IBM SkillsBuild" `padding: 12px 24px; font-size: 14px` dengan wrapper `margin-bottom: 18px`, tabel course `cellpadding="10"`, nama course `14px`, kolom tombol `width="90"`, tombol "Kerjakan" `padding: 6px 14px`. (7) Pembuka "Pendaftaran Anda pada program" (huruf kecil). (8) Banner ukuran lama: padding `20px`, `margin-bottom: 30px`, catatan `13.5px` (komponen `14px`, margin `24px`). (9) Paragraf FAQ diawali "Setelah seluruh langkah di atas diselesaikan, silakan menunggu pengumuman lebih lanjut dari kami. " dan salam "Terima kasih, semangat belajar dan sukses selalu! ✨". **Sudah sama:** teks dan gaya pembuka, daftar bullet (kecuali poin 4), 8 course IBM dan link-nya, kotak Tes Seleksi dan Surat Komitmen YA, isi kotak fasil (nama, kode, catatan), kotak Pathfinder, header, footer © 2026/2027. `{{Link FAQ}}` sudah diisi `https://dicoding.id/pijak2027-faq`. | **Selesai, PR [#6225](https://github.com/dicoding-dev/dicoding/pull/6225) merged 2026-10-27.** Layout bersama (hr, salam, gambar footer di dalam padding), `deadline-banner`, email registrasi YA/VS/Not Eligible, offering (normal dan hari terakhir), dan reminder cohort mengikuti desain final. Kode fasilitator tidak lagi ditampilkan, hanya nama fasil dan kotak catatan | `emails.md` versi 2 YA dan VS, 2026-10-26 |
| 42 | Not Eligible saat daftar: kelas Bitt | "Email peserta not eligible ketika daftar akan dapat benefit kelas bitt, tidak lagi kelas dicoding yang auto enroll itu. List kelas Bitt nya adalah:"<br>"- \"Saring Sebelum Sharing, Tetap Kritis dan Beretika di Dunia AI (Bitt AI Series)\" dan"<br>"- \"Jangan Menyerah pada Keadaan (Bitt Inspirational Series)\""<br>"- Desain Email nunggu dari tim Ops"<br>"- Not eligible dari awal karena tidak masuk syarat progressive/intensive: langsung diberikan email dan buka pengumuman bahwa dia tidak lolos dan benefitnya adalah kelas bitt"<br><br>Not Eligible jenis (a) di K12, beda dengan item 44. Mengganti auto enroll kelas 570: item 5, config `not_eligible_course_ids`, token Not Eligible, dan keputusan email item 30 ikut berubah. Narasi pengumuman: SYNC bagian "Tidak Eligible (Non YA/VS) - Mendapatkan Kelas Bitt". Menunggu desain email dari tim Ops. **Keputusan Krisna 2026-10-20:** akses kelas Bitt mengikuti alur Bitt AI Camp (`BittService`: cek akun, SSO Dicoding, `join` course). `BittService` masih terikat config `scholarships.ai_camp.bitt` (`campaign_code`, error key `SCHOLARSHIP.AI_CAMP.*`), jadi perlu kode campaign Bitt untuk Pijak dan ID course Bitt kedua kelas. **Kartu pengumuman sudah di #6143** (item 43) dengan placeholder `@todo`: tombol "Siapkan Akun Bitt", dua tautan kelas, dan `[tanggal berakhir]`. Titik awal 30 hari belum diputuskan (tanggal daftar atau tanggal akun Bitt terhubung), ditunda ke implementasi item ini. **Dikerjakan Deden** (card [10417100099](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100099)). Komentar card: Krisna 2026-10-21 "ini bakal auto enroll jadi gaperlu sync"; desain email Not Eligible kelas Bitt sudah dikirim ke Deden 2026-10-22 ([doc](https://docs.google.com/document/d/10leJ3w4B_BDsH2WTsfw7l4OltT8pKV6sCO9bmJwpqL8/edit?tab=t.0#heading=h.bdzy8eo9u0gw)). | **Selesai.** [#6225](https://github.com/dicoding-dev/dicoding/pull/6225) (2026-10-27) menghapus auto enroll Not Eligible dan `not_eligible_course_ids`, `not_eligible_token_active_period` diganti `bitt_access_period`. [#6290](https://github.com/dicoding-dev/dicoding/pull/6290) (Deden, merged 2026-11-04) menghubungkan akun Bitt dan klaim otomatis dua kelas (id 99 dan 85) dari halaman pengumuman, `BittService` menerima `campaign_code` per campaign. [#6304](https://github.com/dicoding-dev/dicoding/pull/6304) (2026-11-04) merapikan kotak Bitt di email Not Eligible. Sisa: `bitt.login_url` production, lihat 2.3 item 48 | SYNC Perbaikan, Narasi Pengumuman |
| UAT 2 | Perbaikan UAT 2 (2026-11-02) | Narasi dan link Bitt, tombol email Not Eligible, surat komitmen, navbar, tombol preview Cohort Data, serta pertanyaan background IT dan pendidikan terakhir. Detail di [specs/uat-2-fixes.md](specs/uat-2-fixes.md) | **Selesai.** PR [#6285](https://github.com/dicoding-dev/dicoding/pull/6285) merged 2026-11-02 dan [#6286](https://github.com/dicoding-dev/dicoding/pull/6286) merged 2026-11-04 | UAT 2 |

### 2.2 Aktif: kode selesai, menunggu review dan merge (2 item)

Per 2026-11-05 PR yang masih open: #6321 (item 39) dan #6326 (item 49).

| # | Item | Dari SYNC | Keputusan dan catatan | Sumber |
|---|---|---|---|---|
| 39 | Leaderboard: rombak narasi, desain, dan logika | "Update Design Leaderboard tapi harus nunggu Design Leaderboard dari Leo: https://www.figma.com/design/XtkHWTzXi48Dq55hcZXXpG/Pijak?node-id=177-4717&t=ZDtT8l7OUEV3Pqre-0"<br>"Yang leaderboard referral butuh minimum 50 orang dibawa dan menyelesaikan minimal 1 course untuk masuk leaderboard karena biar balik modal."<br>"Usulan solusi:"<br>"Bikin command baru untuk read data dari sheet tim ops terkait leaderboard yang ada user id nya. Isinya cohort yang sudah eligible untuk masuk leaderboard"<br>"Cocokan user id yang ada di sheet dengan participant scholarships lalu simpan ke other requirements di scholarship participant."<br>"Lalu nanti untuk display di leaderboard page nya sort by count referrer" | **Keputusan Krisna 2026-10-19:** dirombak, termasuk narasi, desain, dan logika (K13). Menggantikan perilaku item 35 (#6098). SYNC menyebut contoh baca dari sheet di Digdaya (`campaigns/digdayabi`). Menunggu desain dari Leo. **Dikerjakan Deden** (card [10417267737](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267737), Planning per 2026-10-22).<br><br>**Status 2026-11-05:** di-PR Deden sebagai [#6321](https://github.com/dicoding-dev/dicoding/pull/6321) (`feature/pijak/referral-leaderboard`), masih draft, risk medium (post-merge). Command sync manual membaca sheet Ops berisi jumlah referral valid, mengganti snapshot dalam transaksi, lalu me-refresh cache. Leaderboard menampilkan top 50 peserta dengan minimal 50 referral valid dan peringkat peserta yang sedang login. | SYNC Leaderboard |
| 49 | Kirim offering dari halaman admin React gagal | **Ditemukan UAT 2 (2026-11-02), ditelusuri 2026-11-05.** Dua bug berurutan, hanya terjadi jika flag `offering_dashboard_react` aktif (lokal aktif; staging `pijak2027-sb` memakai halaman Blade lama dan normal, diverifikasi 2026-11-05). (1) Tombol "Kirim Offering" tidak men-submit: sejak #6086 (2026-10-12) `Button` memakai `@base-ui/react/button` yang default `type="button"`, sedangkan `offering-import-form.tsx` tidak menulis `type="submit"`. (2) Halaman React selalu mengirim `category_code=''`; sejak #6138 (gimmick deadline, 2026-10-21) `ScholarshipOfferingCreationRepository` memakai `$categoryCode !== null`, sehingga `''` dianggap kode kategori dan program tanpa kategori (Pijak, Asah, IBM SkillsBuild) gagal dengan `Undefined array key "categories"`. Sebelumnya cek truthy `$categoryCode ?` menganggap `''` tidak ada kategori. Test lama tidak menangkap karena form Blade tidak mengirim `category_code` (nilainya `null`). Dibuktikan di staging: request yang sama hanya berbeda `category_code` (tanpa field: lolos ke cek kandidat; `''`: error umum). | **Di-PR sebagai [#6326](https://github.com/dicoding-dev/dicoding/pull/6326)** (`bugfix/offering/submit-button-type`, risk low, post-merge): `type="submit"` pada tombol, `!empty($categoryCode)` di repository, test integration yang mem-POST `category_code=''`, dan rebuild bundle. Status flag `offering_dashboard_react` di production belum dicek. | UAT 2, [specs/uat-2-fixes.md](specs/uat-2-fixes.md) |

### 2.3 Cek dan konfirmasi sebelum rilis production (3 item)

Per 2026-11-05 item 10 selesai (pindah ke 2.1) dan item 48 ditambahkan.

Bukan pekerjaan membangun kode. Isinya cek dan konfirmasi ke Ops atau pihak lain yang jawabannya menentukan bentuk akhir kode,
config, atau copy. Bukan blocker pembukaan pendaftaran, jadi kumpulkan dan kirim sekaligus sebelum rilis production. Kolom
"Pengaruh ke kode" menunjukkan apa yang menunggu jawabannya. Item 6 dan 8 sudah dijawab SYNC dan dipindah ke 2.4 F
(2026-10-19).

| # | Yang dicek dan dikonfirmasi | Deskripsi singkat | Pengaruh ke kode | Sumber |
|---|---|---|---|---|
| 21 | Kode/list courses IBM | Cek dan konfirmasi Kode/list courses IBM. Apakah 8 link sama untuk kedua track (YA dan VS)? Komentar Wintari belum dijawab. **Cek 2026-10-26:** email YA dan VS versi 2 di `emails.md` memakai 8 link yang sama, dan sama dengan daftar di `registration-confirmation.blade.php`. | Isi config dan copy | GATH §5.A2 |
| 47 | Nama fasil di email dan daftar fasil production | Email konfirmasi (#6167) mengambil nama fasil dari `users` (`name` lalu `display_name`). Ops (Putri) akan memberi sheet berisi nama lengkap fasil dan email akun Dicoding; nama akun bisa berbeda dengan nama lengkap. Krisna masih menanyakan ke Ops apakah nama akun Dicoding boleh dipakai. Kalau tidak boleh, `facilitator_user_ids` diganti peta `uid => nama lengkap` di config. `facilitator_user_ids` production masih `[]`, jadi email terkirim tanpa kotak fasil sampai diisi. Detail di follow-up 21 Okt bagian D. | Bentuk config fasil dan isi uid production | Follow-up QA 21 Okt D |
| 48 | URL Bitt production | **Ditemukan 2026-11-05:** `scholarships.pijak.bitt.login_url` di `config/scholarships.php` masih `https://bitt-webapp-sbx.dicoding.space/login?state=pijak-registration` (sandbox), dan tidak ada override production di `bootstrap/environments/`. AI Camp (`explore_url`, `login_url`) sudah dipindah ke `https://bitt.id` lewat #6324 (merged 2026-11-05), tetapi blok `pijak` belum ikut diubah. Peserta Not Eligible yang mendaftar sejak 12 Nov akan diarahkan ke Bitt sandbox. Tanyakan URL Bitt production ke tim Bitt/Deden, termasuk apakah ID kelas 99 dan 85 sama di production. | Isi `bitt.login_url` (dan ID kelas jika berbeda) | Cek config 2026-11-05 |

### 2.4 Yang belum dikerjakan (9 item)

Sisa item yang bukan cek dan konfirmasi: masih perlu keputusan internal, kode, atau pembuatan aset. Item 29 ikut ke sini karena
dikerjakan tim sendiri, bukan diserahkan ke Ops. Item 26 dan 19 selesai dan pindah ke 2.1. Item 22 ternyata sama dengan item 30 (#6038)
dan pindah ke 2.5. Per 2026-11-05 item 42 dan 46 selesai (pindah ke 2.1) dan item 39 pindah ke 2.2.

#### B. Langkah terakhir: isi config production & cutover route (3 item)

Semua item di bawah hanya soal nilai konfigurasi atau data production, bisa diperbaiki di satu tempat, jadi dikerjakan paling akhir
setelah pekerjaan kode lain selesai. Isi `config/scholarships.php` (blok `pijak`); `bootstrap/environments/local/scholarships.php` hanya override local, jangan dijadikan acuan production.

| # | Item | Deskripsi singkat | Status / Keputusan | Sumber |
|---|---|---|---|---|
| 2 | Cutover route | Ganti `pijak_2027.php` ke `pijak.php`, putuskan nasib `pijak_flash.php`. Setelah semua PR merge. **Notes Sync 14 Okt (dicek 2026-10-22):** "link kode referral fasilitator harus merujuk langsung ke dicoding.com/pijak/registration" dan "beberes route h-3". `getReferralUrl()` dibangun dari route sehingga link baru otomatis benar, tetapi link `?ref=` yang sudah dibagikan dan link di email yang terkirim sebelum cutover masih ke `/pijak2027/...`, jadi saat cutover tambahkan redirect 301 `/pijak2027/*` ke `/pijak/*` yang membawa query string. **Sync Ops 2026-10-15:** route tetap `pijak/registration`, lihat item 41 (feature flag `pijak2027`, #6170: saat cutover middleware `features:pijak2027` tetap dibawa ke prefix `pijak`) dan item 34 (route Framer). | Ditunda ke langkah terakhir | GATH §12 (Strategi Route File), §19.4 |
| 3 | Kesiapan program production | Row `partner_programs` untuk `program_id` 2250 harus ada di production. Cek `export_google_sheets_id`, `export_recipient_email`, tanggal config. Checklist sandbox: config scholarship, service account Google untuk export, `partner_programs` baru, toggle `--users`, Mailpit. | Ditunda ke langkah terakhir: production belum ada, jadi row, sheet id, dan penerima export ikut diisi saat itu | GATH §9, WIP TODO sandbox |
| 4 | ID course production | Assessment: diputuskan 887, sudah ada di `config/scholarships.php` dan override local setelah PR #6017 merge (K4). Progresif: course 862, 867, 753, 123 sudah ada di master lewat PR #6021 (merged 2026-10-08). Not Eligible: tetap 570 dulu, verifikasi nanti (K5). Kurikulum Intensif belum dicari. **Sync Ops 2026-10-15:** Not Eligible mendapat kelas Bitt, bukan kelas Dicoding yang di-auto enroll, lihat item 42 dan K12. | Ditunda ke langkah terakhir | BRIEF 57-90, GATH §5.A7, §21 |

##### Detail nilai config production (Langkah terakhir):

| Nilai | Keputusan atau status | Item terkait |
|---|---|---|
| `token_packages[1]['course_ids']` (course Tes Seleksi) | Ganti dari `[240]` ke `[887]`. Sudah di `config/scholarships.php` dan override local lewat PR #6017 (merged 2026-10-06) | 4, K4 |
| `not_eligible_course_ids` | Dihapus di #6225 (2026-10-27); Not Eligible mendapat kelas Bitt lewat `bitt.courses` (99, 85) | 4, 42 |
| `bitt.login_url` | Masih URL sandbox, ganti ke URL production | 48 |
| `facilitator_user_ids` | Masih `[]`, menunggu sheet fasil dari Ops | 47 |
| `registration_opened_at` | `2026-11-12 00:00:00` (PR #6126) | 36 |
| `offering_opened_at`, `offering_deadline` | Dijawab SYNC dan diterapkan lewat item 40 (#6138): `offering_opened_at` `2027-01-01`, `offering_deadline` `2027-01-31 23:59:59`, `offering_deadline_gimmick` `2027-01-13 23:59:59` | 6, 40, K2 |
| `export_recipient_email` | `pijak@dicoding.com`, sudah sama dengan config | 17, K3 |
| `export_google_sheets_id` | Production belum ada, isi saat sheet production dibuat | 3 |
| Row `partner_programs` untuk `program_id` 2250 | Production belum ada, buat saat itu | 3 |
| Course Progresif (862, 867, 753, 123) | Sudah di config 2027 lewat PR #6021 (merged 2026-10-08), verifikasi id production | 4 |
| Kurikulum Intensif | Belum dicari | 4 |
| Cutover route `pijak_2027.php` ke `pijak.php` | Setelah semua PR merge | 2 |

#### C. Sudah diputuskan, tanpa kode (2 item)

| # | Item | Deskripsi singkat | Keputusan | Sumber |
|---|---|---|---|---|
| 13 | Progressive fallback dari Intensive | Setelah peserta intensive menolak offering apakah langsung jadi peserta progressive? Nanti ada email+pengumuman berubah+auto enroll seperti progressive juga? Kategori Progressive fallback dari intensive: menolak offering, offeringnya kadaluarsa, tidak melengkapi cohort data. Cek kode: mereka tetap `intensive_eligible` di DB. Konfirmasi ke Ops bahwa mereka masuk lewat daftar manual, ini menentukan lingkup item 14. **Keputusan Krisna 2026-10-05:** diserahkan ke Ops. Siapa yang menerima, menolak, atau kedaluwarsa terlihat di sheet export `Offering & Cohort Data`, dan Ops memasukkan id mereka sendiri ke daftar batch item 14 (command tidak memvalidasi kategori). | Diserahkan ke Ops, tanpa kode | WIP poin 12, CATATAN 4 dan 7, GATH §20.3e |
| 18 | Offering ke user yang belum lengkap | Cek bagaimana jika user belum menyelesaikan tes pelatihan dan unggah file surat tapi diberikan offering. Apakah tetap harus menyelesaikan atau malah bisa bypass ke pengumuman untuk terima/tolak offering? Cek kode: halaman Pengumuman di-gate sampai Syarat Administrasi 1a, 1b, 2a, 2b lengkap, dan offering hanya 2 hari. **Riset 2026-10-05 (dicoba di local):** UI menggate Pengumuman, tetapi `PUT scholarships/pijak/offering/accepted` tetap menerima offering walau 2a/2b belum lengkap (`ScholarshipOfferingStatusUpdate::validate()` tidak mengecek syarat). Due date 2 hari tetap berjalan selama peserta terblokir, dan upload CSV offering admin tidak mengecek syarat. Celah ini sama di semua program yang memakai offering (Asah, IBM legacy, CodingCamp, Pijak 2027): semuanya hanya menggate di UI dan mengandalkan Ops memfilter CSV. **Keputusan Krisna:** sama seperti campaign lain, andalkan Ops memfilter kandidat dari export, tanpa perubahan kode. | Diputuskan tanpa kode (andalkan Ops) | WIP TEMUAN, GATH §20.3e |

#### D. Masih harus dibangun atau dibuat (2 item)

| # | Item | Deskripsi singkat | Rencana | Sumber |
|---|---|---|---|---|
| 29 | Preview dan edit data LoA | Preview data LoA dan edit jika ada yang tidak sesuai secara mandiri oleh Cohort. Belum paham apa maksudnya, tanyakan dulu ke Dimas Saputra. | Dikerjakan (fitur cohort admin) | WIP Extramiles |
| 34 | Integrasi landing page Pijak 2027 | Landing page Pijak 2027 dibuat di Framer oleh UI/UX designer dan belum diintegrasikan ke platform. Cara integrasi (domain atau path, dan tautan ke halaman registrasi) belum diputuskan. **Sync Ops 2026-10-15:** "Landing Page, Referral Page dan Story page akan disediakan oleh Leo melalui Frammer, engineer harus tau route frammernya biar nanti tinggal ganti di route" **Cek 2026-11-05:** pola `framer_page_path` sudah ada di `app/routes/pijak.php` (`pijak` dan `pijak/referral`), jadi kemungkinan cukup mengganti path. Narasi Twibbon di platform merujuk ke `dicoding.com/pijak/twibbon`, tetapi route GET itu belum ada (hanya `POST pijak/registration/twibbon`); pastikan halaman Twibbon juga dibuat di Framer. Card [10417267757](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267757). | Integrasi landing page Framer. Minta route Framer ke Leo | Info Krisna 2026-10-12, SYNC Frammer Integration |

#### E. Berdasarkan jadwal fase berikutnya (1 item)

| # | Item | Deskripsi singkat | Target jadwal | Sumber |
|---|---|---|---|---|
| 33 | Kesiapan Wave 2 | Row `partner_programs` baru, isi `excluded_program_ids` dengan program Wave 1, teks yang menegaskan hanya peserta baru yang boleh mendaftar. Sebelum Feb 2027. | Sebelum Feb 2027 | NOTES baris 9-11, GATH §5.A0, config `excluded_program_ids` |

#### F. Dari sync Ops 15 Oktober 2026 (1 item)

Kolom "Dari SYNC" dikutip apa adanya dari [sync-pijak-150ct2026.md](sync-pijak-150ct2026.md) per 2026-10-19. Narasi panjang
(Referral dan Twibbon, Narasi Pengumuman) tidak disalin ke sini; saat implementasi, salin langsung dari SYNC tanpa mengubah kata.
Kolom "Keputusan dan catatan" berisi keputusan Krisna 2026-10-19 dan hasil pembacaan engineer, bukan bagian dari SYNC.

Item lama yang dijawab SYNC dan dilanjutkan di item 40 (dipindah dari 2.3 pada 2026-10-19; item 8 dipindah ke 2.2 bersama item 43 pada 2026-10-20):

| # | Item | Deskripsi singkat | Pengaruh ke kode | Sumber |
|---|---|---|---|---|
| 6 | Konfirmasi tanggal offering (D4) | Putuskan `offering_deadline` dan `offering_opened_at` (K2). Jangan ubah config sebelum Ops menjawab. **Sync Ops 2026-10-15 (dijawab):** "Offering opened at -> 13 Januari 2027 (gimmick tulisan), cuman display/tulisan aja. Aslinya sebisa mungkin cepat-cepat kasih offering by tim ops. Setelah 14 januari langsung pindah jadi 31 januari 2027 tulisannya" dan "Offering deadline: batas konfirmasi offering -> 13 Januari 2027 (gimmick juga, aslinya mah 31 januari, tapi untuk yang dapat offering di 13 januari harus tetap narasi emailnya di hari itu bukan yang 48 jam) bisa extend ke 31 januari (harus pindah jadi 31 januari setelah gimmick berakhir)." Dikerjakan di item 40. | Dilanjutkan di item 40 | GATH §5.D4, §19.3 |

Item baru dari SYNC sudah habis per 2026-11-05: item 42 selesai (pindah ke 2.1) dan item 39 sedang di-PR (pindah ke 2.2).

### 2.5 Di luar sistem ini, dikerjakan paling akhir (4 item)

Item di bawah ini dikerjakan di luar alur backlog ini (tugas infra, query dashboard, dan card yang dipegang Dimas), jadi
diletakkan paling akhir atas arahan Krisna (2026-10-05). Kode item 30 (#6038) sudah merge 2026-10-08. Item 22 sama dengan item 30 dan ikut selesai lewat #6038.

| # | Item | Deskripsi singkat | Jenis | Sumber |
|---|---|---|---|---|
| 17 | Cron job export | Tambahkan Cron job untuk export setiap jam 07.00 WIB pagi & 14.00 siang (ketika sudah live di production). Tidak ada jadwal di repo, ini tugas infra. Penerima sudah diputuskan `pijak@dicoding.com` (K3). Perhitungan traits (`campaigns:exams:calculate-results pijak`) perlu dijadwalkan lebih dulu supaya kolom Traits Assessment memakai skor terbaru. PR #6017 sudah merge (2026-10-06), jadi tinggal menjadwalkan. | Tugas infra | WIP poin 6, BRIEF baris 664-683 |
| 23 | Dashboard Metabase | Target peserta, jenis kelamin, tren pendaftaran, disabilitas, keterbatasan ekonomi, user status, provinsi, referral. Bergantung pada export dan data yang tersedia. | Query dashboard | BRIEF baris 684 dan seterusnya |
| 30 | Email "program selesai" misleading | Email miss-leading "program selesai" ketika token MCT untuk kelas filtering habis. Card ini sudah diambil oleh bang Dimas ([Basecamp](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10285196202)). **Status 2026-10-06:** (1) [#6032](https://github.com/dicoding-dev/dicoding/pull/6032) **merged**: migration kolom `should_send_ended_email` (`tinyint(1) NOT NULL DEFAULT 1`) di `multi_course_tokens`. (2) [#6034](https://github.com/dicoding-dev/dicoding/pull/6034) **merged** (2026-10-06): flag diteruskan saat pembuatan MCT, `academy:notify:mct_deadline` melewati email untuk token yang opt-out tapi tetap menandai `ENDED`, checkbox "Email Program Berakhir" di form admin MCT. (3) [#6038](https://github.com/dicoding-dev/dicoding/pull/6038) **open** (risk low): token Tes Seleksi Pijak (887) dibuat dengan `should_send_ended_email => false` di `PijakRegistrationSpecification::autoRedeemToken()`, jadi tanggal 31 Des 2026 akses ditutup tanpa email. Dicek Krisna 2026-10-07: sesuai, flag sampai ke DB lewat `MultiCourseTokenAutoRedemptionService::autoRedeem()` dan `MultiCourseTokensCreation`, hanya command itu yang mengirim email berakhir, dan tidak ada jalur lain yang membuat token assessment Pijak 2027. **Sisa (urusan Krisna):** token Not Eligible (570, aktif 30 hari sesuai `not_eligible_token_active_period` di master) dan Progressive (#6021, 30 hari) tetap mengirim email "Masa belajar Anda pada program Pijak 2027 in collaboration with IBM SkillsBuild telah berakhir". Untuk Not Eligible, kalimat ini bisa terbaca seolah seluruh Pijak selesai. **Keputusan Krisna 2026-10-12: dibiarkan.** Email tetap dikirim untuk token Not Eligible dan Progressive, karena keduanya bukan token tes asesmen; masalah email menyesatkan hanya muncul pada token Tes Seleksi (887) yang sudah ditangani #6038. | Selesai. #6032, #6034, dan #6038 merged (#6038 pada 2026-10-08); `autoRedeemToken()` di master sudah memakai flag ini. Not Eligible dan Progressive: diputuskan tetap mengirim email | WIP Extramiles, GATH §10 poin 2 |
| 22 | Token habis dan deadline token Tes Seleksi | Non-aktifkan pesan token habis dan informasi deadline token Tes Seleksi agar tidak membuat panik. **Konfirmasi Krisna 2026-10-08:** sama dengan item 30. "Pesan token habis" adalah email "Masa belajar Anda pada program ... telah berakhir" yang dikirim saat token Tes Asesmen (kelas 887) mencapai deadline, dan ditangani Dimas lewat [#6038](https://github.com/dicoding-dev/dicoding/pull/6038) (`should_send_ended_email => false` di `PijakRegistrationSpecification::autoRedeemToken()`). Tidak ada pekerjaan terpisah. | Sama dengan item 30 (#6038, Dimas) | BRIEF baris 67-68 dan 656, NOTES baris 79 |

### 2.6 Tidak diimplementasikan (5 item)

Diputuskan Krisna 2026-10-12. Item di bawah ini tidak perlu dibangun di sistem ini.

| # | Item | Alasan tidak diimplementasikan | Sumber |
|---|---|---|---|
| 20 | LoA generate otomatis | LoA biasanya dibuat di luar sistem, bukan lewat sistem. | GATH §19.4 poin 12, NOTES baris 62 |
| 24 | Referral sebelum submit Step 1 (A5) | Link referral yang ada sudah bisa digunakan dan sudah diverifikasi. | GATH §5.A5 |
| 25 | API IBM SkillsBuild untuk tracking kelulusan kelas | IBM tidak bisa menyediakan API ([komentar di dokumen](https://docs.google.com/document/d/1sBJF9kF10arM3EpLV6qDq5dji4-0a-IXCAy-5gUAh1I/edit?disco=AAACHftWgX0)). Penyelesaian kelas tetap self-report. | WIP CATATAN 10 |
| 31 | Integrasi WABA lewat Mekari Qontak | Di luar sistem ini, WABA sudah tersedia. | NOTES baris 65-75, GATH §8 |
| 32 | Reminder otomatis lewat Email Platform atau Sendportal | Tidak perlu diimplementasikan. | NOTES baris 77, GATH §8 |

Di luar scope dokumen ini: alur registrasi AI Camp (NOTES baris 45-58), alur Pijak Flash lama, dan Wave 3 sampai 4.

## 3. Analisis export dan assessment traits

Bagian ini hasil membaca `PijakParticipantsExportHandler`, gateway, spesifikasi perhitungan, config, dan isi `export_references/`.
Tidak ada query yang dijalankan terhadap database.

### 3.1 Tes Penilaian yang berlaku di Pijak 2027

Menurut BRIEF baris 150-163 dan konfirmasi per 2026-10-02, 2a Tes Penilaian **khusus YA** (Intensif) bertempat di Course 887 ("Tes Seleksi Pijak 2027 in collaboration with IBM SkillsBuild") dan terdiri dari:

1. **Tes Teknis (Technical Assessment) — 5 Modul Ujian**:
   - *Logical reasoning & computational thinking*: `https://www.dicoding.com/academies/887/tutorials/48636` (tutorial ID: `48636`)
   - *Programming Fundamentals*: `https://www.dicoding.com/academies/887/tutorials/48639` (tutorial ID: `48639`)
   - *Data & System Foundations*: `https://www.dicoding.com/academies/887/tutorials/48642` (tutorial ID: `48642`)
   - *Frontend / Client-side*: `https://www.dicoding.com/academies/887/tutorials/48645` (tutorial ID: `48645`)
   - *Backend / Server-side*: `https://www.dicoding.com/academies/887/tutorials/48648` (tutorial ID: `48648`)
   - **Aturan perhitungan Tim Ops**: Nilai kelima modul teknis ini digabung menjadi satu skor tunggal: jumlah nilai dari 5 tes teknis tersebut dibagi 5 (rata-rata):
     $$\text{Skor Teknis} = \frac{\text{skor}_{48636} + \text{skor}_{48639} + \text{skor}_{48642} + \text{skor}_{48645} + \text{skor}_{48648}}{5}$$

2. **Tes Kepribadian (Traits Assessment) — 1 Modul Ujian**:
   - *Traits*: `https://www.dicoding.com/academies/887/tutorials/45128` (tutorial ID: `45128`)
   - **Aturan perhitungan**: Tetap seperti sekarang, dihitung berdasar bobot Google Sheets `1sMQKMTY9Xd6M0gjHfl1S07kshckvWCrIQaAOQmq4TRU` via `CalculateExamTraitsHandler` dan disimpan di `campaign_participants_exam_scores` dengan label `pijak_exam_traits`.

Ujian hanya bisa dikerjakan satu kali, ada batas waktu, dan tidak bisa dibatalkan setelah mulai. Progressive dan Not Eligible tidak mengerjakan tes ini (konflik K1 dengan WIP).


### 3.2 Alur perhitungan traits

| Langkah | Apa yang terjadi | Lokasi |
|---|---|---|
| 1 | Peserta mengerjakan ujian traits. Jawaban tersimpan di `exam_answer_trackings`. Untuk soal multi-pilihan hanya pilihan pertama yang dihitung (`GREATEST(exam_multiple_choice_id, ids[0])`). | `ExamResultGateway::scanExamResultForCampaign` |
| 2 | Bobot dibaca langsung dari Google Sheet `1sMQKMTY9Xd6M0gjHfl1S07kshckvWCrIQaAOQmq4TRU`, tab `'Pijak - Assessment Traits'!A2:C`. Hanya kolom A sampai C. Kolom D `Combined IDs` tidak dipakai kode. Pasangan soal dan pilihan yang tidak ada di sheet bernilai 0. | `WeightScoresFromGoogleSheetsRepository` |
| 3 | Skor = jumlah bobot semua jawaban, lalu `floor(total / 5.77)`. | `ExamTraitsCalculationSpecification` |
| 4 | Hasil ditulis ke `campaign_participants_exam_scores` (participant_id, label, score). Label legacy `pijak_exam_traits`. | `ExamResultGateway::saveResult` |
| 5 | Dipicu `campaigns:exams:calculate-results <program> --limits=N` lewat queue `CalculateExamTraitsHandler`. Default limit 100. | `CalculateCampaignExamResultsCommand` |
| 6 | Export membaca skor jadi lewat `exportParticipantsByProgramIdAndCategoryWithAssessmentScore`. General dan LP dari `exam_results.score`, traits dari tabel di langkah 4. Tutorial id ditulis langsung di handler legacy. | `ScholarshipParticipantGateway` baris 538 |

Peserta yang ikut dihitung: `program_id` sesuai config, `scholarship_package_id` sama dengan key config, `created_at` sesudah
`start_calculation_after`, ujian traits terakhir berstatus selesai, dan belum punya baris skor.

### 3.3 Data bobot

Dari `Weight Scoring Campaigns - Pijak - Assessment Traits.csv`:

- 540 baris, 87 soal. Pilihan per soal: 7 pilihan (54 soal), 4 (14 soal), 6 (11 soal), 5 (8 soal).
- Bobot berkisar 0 sampai 7. Sebaran: 0 (12 baris), 1 (84), 2 (65), 3 (84), 4 (73), 5 (84), 6 (65), 7 (73).
- Kolom `Combined IDs` selalu `Question ID#Choice ID`.
- Jumlah bobot tertinggi dari semua soal = 577. `577 / 5.77` persis 100, jadi skor traits adalah bilangan bulat 0 sampai 100.
- Konstanta `5.77` ditulis tetap dan dipakai semua program. Cocok untuk sheet Pijak ini. Kalau soal atau bobot berubah,
  konstanta ikut berubah. Belum dicek apakah program lain punya total yang sama.

### 3.4 Temuan dan risiko

1. **Config 2027 belum punya `weighted_exam_calculations`.** Hanya config legacy `ibm_skillsbuild`, Asah, dan CodingCamp yang punya. Menjalankan
   `campaigns:exams:calculate-results pijak` sekarang akan gagal karena `CalculateExamTraitsHandler` memakai `array_keys` dari config null.
   **Selesai di PR #6017** (config ditambahkan, command sukses di local 2026-10-05).
2. **Perhitungan 100 peserta per run dan tidak terjadwal di repo.** Command hanya didaftarkan di `app/start/artisan.php`. Untuk ribuan
   peserta perlu dijadwalkan dengan limit besar dan harus selesai sebelum export, kalau tidak kolom traits kosong. Perhitungan
   berjalan lewat queue, jadi selesainya tidak sinkron. **Riset 2026-10-05:** campaign lain (CodingCamp, Asah, IBM SkillsBuild)
   juga memakai default 100 tanpa chunking, dan tidak ada jadwal di repo untuk campaign mana pun. Jadwal dan limit diatur di infra
   (lihat item 17).
3. **Hanya dihitung sekali per peserta.** Peserta yang sudah punya baris skor dilewati. Ujian yang diulang atau jawaban yang diperbaiki
   tidak dihitung ulang kecuali barisnya dihapus. **Riset 2026-10-05:** tidak ada mekanisme hitung ulang di campaign mana pun
   (`saveResult` hanya insert, tidak ada `--force`). `campaigns:exams:bulk-reset` hanya mereset registrasi ujian. **Keputusan
   Krisna:** dibiarkan seperti campaign lain.
4. **Filter `scholarship_package_id`.** Pijak 2027 menyimpan konstanta `1` (`PijakGateway::DEFAULT_SCHOLARSHIP_PACKAGE_ID`), jadi key config
   harus `1`. Kalau tidak cocok, skor tidak pernah dihitung dan tidak ada error.
5. **Label status di export sebagian tidak pernah muncul.** Subquery hanya mengambil registrasi berstatus selesai, jadi "Belum Mengerjakan"
   dan "Sedang Mengerjakan" tidak pernah tampil. Ujian yang sedang berjalan tampil sebagai "Belum Start Exam". Traits yang sudah
   selesai tetapi belum dihitung tampil kosong. **Simulasi 2026-10-05 (setelah PR #6017):** temuan ini tidak berlaku lagi,
   "Belum Mengerjakan" dan "Sedang Mengerjakan" sudah muncul. Sisa dua nilai yang bisa menyesatkan: traits selesai tapi belum
   dihitung tampil "Belum Start Exam", dan ujian teknis status selesai tanpa baris `exam_results` tampil 0. General Assessment
   dibagi jumlah semua modul, jadi 1 dari 5 modul bernilai 80 menjadi 16. **Keputusan Krisna:** dibiarkan.
6. **Course assessment di config.** `PijakGateway::getAssessmentCourseId()` membaca `token_packages[1]['course_ids'][0]`, nilai config dasar
   240, sedangkan BRIEF menyebut 887 (K4). Belum dicek apakah ada override production. **Pembaruan 2026-10-07:** `config/scholarships.php`
   dan override local sudah bernilai 887 setelah PR #6017 merge.
7. **Pemetaan Tes Teknis (Terkonfirmasi & Keputusan Ops).** Dipastikan ada 5 modul tes teknis di Course 887 (ID: 48636, 48639, 48642, 48645, 48648) dan 1 modul traits (ID: 45128). Permintaan Tim Ops: nilai kelima tes teknis digabung menjadi satu skor tunggal dengan rumus `(skor1 + skor2 + skor3 + skor4 + skor5) / 5`, sedangkan traits tetap dihitung terpisah lewat bobot Google Sheets. **Sudah diterapkan di PR #6017:** handler menghitung rata-rata nilai teknis dibagi jumlah modul di `technical_tutorial_ids`.
8. **Koreksi traits setelah reset ujian.** XLSX CodingCamp punya tab kerja bernama "Data User Exam Tereset 31 Des", "Perbandingan Score Sebelum dan..."
   dan "Abdul Rekonstruksi Exam". Dari namanya, kemungkinan pernah ada ujian ter-reset yang skornya direkonstruksi. Isinya tidak dibuka.
   Karena skor diturunkan dari jawaban dan hanya dihitung sekali, perlu kebijakan hitung ulang sebelum insiden serupa terjadi. **Keputusan Krisna 2026-10-05:** dibiarkan (lihat poin 3).

### 3.5 Isi `export_references/`

| Berkas | Isi |
|---|---|
| `Weight Scoring Campaigns.xlsx` | 6 tab bobot: AsahDSAI, AsahFS, AsahML, AsahFEBE-REBE, "AI-DS-FSW score from DBSCodingC", **Pijak - Assessment Traits** |
| `Weight Scoring ... Pijak - Assessment Traits.csv` | Ekspor tab Pijak (540 baris, lihat 3.3) |
| `coding_camp_2026_powered_by_dbs_foundation_participants.xlsx` | Workbook export CodingCamp. Tab data: Mahasiswa (Diploma), Mahasiswa (S1), Umum, Siswa SMK, Surat Komitmen, Offering & Cohort Data, Surat Rekomendasi, Pendaftaran Parsial. Plus tab kerja: pivot, reset ujian, rekonstruksi, query result |
| 7 CSV `coding_camp_2026_...participants - <tab>.csv` | Satu CSV per tab data di atas (tanpa Surat Rekomendasi) |

Kolom per tab CodingCamp (hanya nama kolom yang dibaca):

| Sheet | Kolom |
|---|---|
| Mahasiswa (Diploma) dan (S1) | Identitas, lokasi, zona waktu, pendidikan (kampus, semester, fakultas, jurusan, NIM, IPK), learning path, aktivitas, disabilitas, kondisi ekonomi dan bukti, perangkat, sumber info, twibbon, referral, **General / LP / Traits Assessment**, Financial Literacy, Terakhir Akses |
| Siswa SMK | Mirip, dengan NISN dan Kelas, ada tiga kolom assessment |
| Umum | Nama Institusi, Jenis Pekerjaan, Financial Literacy, tanpa kolom assessment |
| Surat Komitmen | Letter ID, UID, Nama, Email, File SK, Signed SK |
| Offering & Cohort Data | 15 kolom: offering (tanggal, status), kontak darurat, dosen pembimbing, konversi |
| Pendaftaran Parsial | 4 kolom: UID, Nama, Email, No. HP |

Peringatan data pribadi: CSV dan XLSX di folder ini berisi puluhan ribu baris data peserta nyata (nama, email, nomor HP) dan URL S3
bertanda tangan. `docs/domains/pijak2027/` saat dibuat dokumen ini masih untracked dan tidak diabaikan git, jadi mudah ter-`git add`
tanpa sengaja. Masukkan ke `.gitignore` atau simpan di luar repo.

### 3.6 Handler 2027 sekarang dan rencana sheet

`Pijak2027ParticipantsExportHandler` menulis tiga sheet: Young Adult, Vocational Student, Not Eligible, dengan kolom yang sama
untuk ketiganya (sekitar 90 kolom karena checkbox dipecah). Tidak ada kolom assessment dan tidak ada sheet lain. Spesifikasi BRIEF baris 664-683
meminta subsheet Young Adult (semua data pendaftaran), Vocational Student (semua data pendaftaran), dan Tidak Eligible, tanpa menyebut assessment.

**Pembaruan 2026-10-05:** paragraf di atas menggambarkan kondisi sebelum PR #6017. Setelah PR itu, handler menulis 6 sheet dan
kolom checkbox diringkas jadi satu sel per pertanyaan. Status tiap baris di tabel di bawah ikut diperbarui. Young Adult tidak memakai
`exportParticipantsByProgramIdAndCategoryWithAssessmentScore` karena mekanisme penilaian 2027 berbeda (nilai per modul teknis).

| Sheet | Isi yang diusulkan | Sumber data atau reuse | Status |
|---|---|---|---|
| Young Adult | Tambah kolom Tes Teknis dan Tes Kepribadian (traits), plus `ibm_account_email` | `exportParticipantsByProgramIdAndCategoryWithAssessmentScore` sudah menyelesaikan join ujian dan memilih kolom yang dipakai mapper 2027. Panggil dengan tutorial id 2027 lalu tambah kolom | Selesai (PR #6017), nilai per modul teknis, General Assessment, Traits Assessment |
| Vocational Student, Not Eligible | Tambah `ibm_account_email` (assessment tidak berlaku, lihat 3.1) | Tetap memakai `exportParticipantsByProgramIdAndCategory` | Selesai (PR #6017) |
| Pendaftaran Parsial | UID, Nama, Email, No. HP | Registrasi belum selesai (`campaign_initial_registrations`, autosave §13.6 sudah ada) | Selesai (PR #6017) |
| Surat Komitmen | Letter ID, UID, Nama, Email, file generated, file signed | Pola `getCommitmentLetterRows` legacy. Tipe surat dan storage 2027 (`PIJAK_SIGNED_COMMITMENT_LETTER`) beda dari legacy | Selesai (PR #6017) |
| Offering & Cohort Data | Offering, status, tanggal konfirmasi, kontak darurat | `offeringGateway->exportOfferingAndCohort` sudah ada. Kolom dosen pembimbing dan konversi SKS tidak relevan | Selesai (PR #6017) |
| Re-offer Request | User ID, waktu klik re-offer, status offering saat ini, due date offering | Penanda `reoffer_requested_at` di `other_requirements` join offering. Lihat §4.3 | Selesai (PR #6033 merged 2026-10-12) |

Sheet legacy yang tidak perlu dibawa: Surat Rekomendasi (dibatalkan), Bukti Upload Progres, Upload Sertifikat.

Ukuran: handler menulis satu `batchUpdate` per sheet dan menghapus isinya sebelum menulis ulang. Dengan puluhan ribu registran dan
sekitar 90 kolom, jumlah sel masih jauh di bawah batas 10 juta sel per spreadsheet (pengetahuan umum, belum dihitung untuk data Pijak).
CodingCamp berhasil dengan sekitar 33 ribu baris.

### 3.7 Keputusan yang perlu diambil sebelum membangun

1. Course Tes Seleksi 2027: diputuskan 887 (K4). Tutorial id telah terkonfirmasi: Tes Teknis terdiri dari 5 modul (48636, 48639, 48642, 48645, 48648) dengan nilai dirata-rata dibagi 5, dan Traits pada tutorial 45128.

2. Apakah sheet Young Adult cukup berisi dua tes (teknis dan traits), dan LP tidak diekspor.
3. ~~Apakah soal traits 2027 sama dengan 87 soal di sheet bobot.~~ **Selesai (Krisna 2026-10-05):** memakai tes yang sama, jadi
   jumlah soal dan konstanta `5.77` sudah sesuai.
4. Konfirmasi ke Ops bahwa assessment hanya untuk YA (K1), bukan semua kategori seperti di WIP.
5. Jadwal dan limit perhitungan traits supaya selalu selesai sebelum cron export 07.00 dan 14.00.
6. ~~Kebijakan hitung ulang kalau peserta mengulang atau terjadi reset ujian.~~ Dibiarkan seperti campaign lain (lihat 3.4 poin 3).
7. ~~Penerima email export~~ Diputuskan `pijak@dicoding.com` (K3).

### 3.8 Yang belum diverifikasi

- ~~Kecocokan id soal di sheet bobot dengan data ujian di database.~~ **Terverifikasi 100%** (2026-10-02): Menjalankan query `traits_text.sql` terhadap data ujian menghasilkan 540 baris dengan 0 `NULL` pada `question_text` maupun `choice_text`.
- Nilai config production dan ada tidaknya override production.
- Isi tab kerja di XLSX CodingCamp dan isi narasi di `Narasi Filtering & Promotion Pijak 2026.md` (hanya heading yang dibaca).
- ~~Apakah submit Twibbon Challenge sudah berfungsi (item 12).~~ **Terverifikasi** (2026-10-05, dikonfirmasi Krisna).
- ~~Driver queue dan batas argumen CLI yang disebut di item 14 dan 19.~~ **Diriset 2026-10-05:** ARG_MAX container 2 MiB, satu
  argumen dibatasi sekitar 128 KB (kira-kira 16 ribu id 6-7 digit). Queue `beanstalkd` di local (`sync` di testing), nilai production
  di `.env.php` yang tidak ada di repo. Command berjalan sinkron, hanya email event yang masuk queue.

### 3.9 Pembulatan skor dan query teks soal

- **Keputusan Krisna 2026-10-05:** tidak perlu unit test PHP tambahan, dianggap aman.
- Pembagian `total / 5.77` aman di batas atas: `577 / 5.77` bernilai `100.00000000000001` jadi `floor` tetap 100. Untuk semua total
  0 sampai 577 hasilnya sama dengan `floor(total x 100 / 577)`. Diuji di Python, belum di PHP.
- Untuk melihat teks soal dan pilihan dari pasangan Question ID dan Choice ID, pakai `exam_questions.question` dan
  `exam_multiple_choices.choice_content` (join `exam_multiple_choices.exam_question_id = exam_questions.id`). Soal yang dihapus
  ditandai `exam_questions.deleted_at`, soal drag-and-drop tidak menyimpan pilihannya di tabel itu.
- File `traits_text.sql` (folder yang sama) berisi query untuk 540 baris bobot dengan `LEFT JOIN`. Setelah data ujian diimpor ke DB lokal,
  dijalankan pengecekan dan terbukti 540 baris cocok sempurna (0 `NULL`). Butir "kecocokan id soal" resmi tuntas dan tertutup.
- Di mesin ini klien `mysql` tidak ada di host. Query lokal lewat `docker exec -i dicoding-mariadb-1 mariadb -u root -pdicoding dicoding`.


### 3.10 Artefak terkait

- Card Basecamp "[P1][Pijak] WIP PIJAK 2027 - Implementation Backlog" (board Campaigns, kolom In progress): isi sama dengan
  `WIP-pijak.md`. Kalau WIP diubah, card tidak ikut berubah.
- `WIP-pijak.md` sudah dirapikan format markdown-nya tanpa mengubah kata. Typo asli ("sismte", "kaish", dan lain-lain) sengaja dibiarkan.
- `implementation-gathering.md` §19.1 dan §19.5 serta `specs/uat-registration-fixes.md` sudah diperbarui per 2026-10-01 (status PR).
- Instruksi repo yang berlaku saat mengerjakan item: `CLAUDE.md` (TDD, `deck psalm` dan test setelah ubah PHP, tanpa komentar,
  tanpa tanda pisah panjang, `pr-preflight` sebelum PR).
- `implementation-backlog.md` ini diperbarui 2026-10-07 (verifikasi ulang kode dan PR). Entri log di bagian atas yang lebih lama
  sengaja tidak diubah meski status PR-nya sudah bergerak; bagian 2.1 dan 2.2 adalah status terkini.

## 4. Brainstorm Extramiles

Extramiles (GATH §10, WIP Extramiles) bukan scope Wave 1 dan dikerjakan kalau alur inti sudah stabil. Daftar: validasi email
SkillsBuild (item 11 dan 28), email "program selesai" (item 30, Dimas), tombol re-offer (item 27), preview dan edit LoA oleh Cohort
(item 29), reminder cohort data 24 jam (item 19), integrasi WABA (item 31).

### 4.1 Reminder cohort data 24 jam (item 19)

Dibahas 2026-10-06, **diputuskan 2026-10-08** (pendekatan 6, lihat akhir bagian ini), PR [#6063](https://github.com/dicoding-dev/dicoding/pull/6063).

Kondisi kode sekarang:

- `ScholarshipOfferingStatusWasUpdatedMailer` langsung mengirim `emails.scholarships.pijak.offering-accepted` saat peserta Pijak 2027
  menerima offering. Mailer ini hanya melayani Pijak 2027 status `ACCEPTED`, jadi kalau pengiriman dipindah ke command, mailer ini
  dihapus (event tetap ada). Tes terkait: `PijakOfferingAndCohortIntegrationTest::accept_offering_updates_status_and_redirects_to_announcement`.
- Waktu terima ada di `scholarship_offerings.confirmed_at`. Peserta dianggap sudah mengisi cohort kalau ada row `scholarship_cohorts`.
- Belum ada kolom atau tabel untuk mencatat reminder terkirim. Preseden: `campaigns:asah:remind-expired-invoices` memakai jendela
  `DATE(expired_at) = DATE(NOW() - INTERVAL 1 DAY)` tanpa tracking. `Queue::later` dipakai di `SpecificationQueueRunnerHandler`.

| # | Pendekatan | Kelebihan | Kekurangan |
|---|---|---|---|
| 1 | Kolom `cohort_reminder_sent_at` di `scholarship_offerings`, command memilih `ACCEPTED`, `confirmed_at <= now - 24 jam`, belum ada cohort, penanda null, lalu mengisi penanda | Idempoten, aman di-rerun, tidak terlewat kalau cron gagal, jadwal bebas | Migration di tabel bersama semua program offering |
| 2 | Tabel log reminder generik (user, program, type, sent_at) | Tabel offering tidak berubah, bisa dipakai reminder lain | Tabel baru untuk satu kebutuhan (YAGNI) |
| 3 | Jendela per jam: `confirmed_at` di antara 24 dan 25 jam lalu, cron per jam | Tanpa migration, tepat sekitar 24 jam | Run gagal berarti email hilang, jadwal bergeser bisa dobel, tidak aman di-rerun |
| 4 | Jendela harian pola Asah: `DATE(confirmed_at) = kemarin` | Ada preseden, paling sederhana | Jeda 24 sampai 48 jam (masalah di WIP), rerun dobel |
| 5 | `Queue::later(+24 jam)` dari mailer, job cek cohort sebelum kirim | Tanpa migration dan cron | Job bisa hilang saat queue di-flush, driver production tidak di repo, menyimpang dari permintaan pakai command |
| 6 | Seperti pendekatan 1, tetapi penanda disimpan sebagai key `cohort_reminder_sent_at` di `scholarship_participants.other_requirements` lewat `ScholarshipParticipantGateway::updateOtherRequirements()` (`JSON_SET`, key lain tidak tertimpa) | Kelebihan pendekatan 1 tanpa migration, dampak hanya ke Pijak, pola sama dengan `twibbon_link` dan `ibm_account_email`, baca key JSON sudah ada preseden (Mastercard, CodingCamp) | Penanda notifikasi bercampur dengan data pendaftaran, path JSON tidak bisa diindeks (kolom `text`) |
| 7 | Status offering baru (misalnya `accepted_reminded`) di enum `ScholarshipOfferingStatus` | Tanpa migration (kolom `status` bertipe `string`), query satu tabel, terlihat di DB dan export | Peserta terblok isi cohort form (`ScholarshipCohortRegistration.php:84` hanya menerima `ACCEPTED`), halaman pengumuman jatuh ke `default => NOT_STARTED` (`PijakViewModel.php:250`), sekitar 6 query `status = accepted` di `ScholarshipOfferingGateway` melewatkan peserta (baris 180 `!= accepted` malah menganggap belum menerima), `PijakUpdateFinalSelectionResultCommand.php:103` ikut terpengaruh, `toIndonesian()` tanpa `default` melempar `UnhandledMatchError`, `updateStatus` menimpa `confirmed_at` dan guard `ALREADY_CONFIRMED` menolak transisi, enum dipakai bersama Asah, CodingCamp, Tempa, IBM, dan secara makna status adalah keputusan peserta, bukan kejadian sistem |

Berlaku untuk semua pendekatan: jangan kirim kalau `cohort_form_deadline` sudah lewat, template `offering-accepted` dipakai ulang,
tidak perlu backfill (belum ada data lama).

Pembaruan 2026-10-07: pendekatan 7 ditolak karena perlu refactor semua cek `=== ACCEPTED` lintas program hanya untuk menyimpan
satu penanda. Rekomendasi bergeser ke pendekatan 6 dengan cron per jam (penanda mencegah kirim dobel, jadwal harian akan
mengembalikan jeda 48 jam). Pertanyaan terbuka ke Ops: apakah peserta masih perlu email konfirmasi langsung saat klik terima,
karena kalau mailer lama dihapus, peserta yang langsung mengisi cohort tidak menerima email apa pun.

Keputusan 2026-10-08: pendekatan 6 dipakai, cron per jam. Krisna memutuskan mailer lama dihapus, jadi email `offering-accepted`
hanya dikirim command setelah 24 jam kalau cohort belum diisi. Tidak perlu index baru: index `offerings_program_id_fk` dan unique
`(user_id, program_id)` di `scholarship_participants` dan `scholarship_cohorts` sudah cukup, `JSON_EXTRACT` hanya dievaluasi pada
offering `accepted` satu program. Diimplementasikan di PR [#6063](https://github.com/dicoding-dev/dicoding/pull/6063) (merged 2026-10-13).

Temuan saat E2E local 2026-10-08 (di luar lingkup PR ini):

- `pda/pheanstalk` hilang sejak upgrade queue Laravel 13 (`0d33e3186da`), sehingga queue `beanstalkd` gagal
  (`Class "Pheanstalk\Pheanstalk" not found`). Perlu ditambahkan ke `composer.json` di master, dan dicek apakah staging/production
  juga memakai `beanstalkd`. **Ditutup 2026-10-16:** queue server pindah ke SQS lewat env `QUEUE=sqs`, jadi `pda/pheanstalk`
  tidak dibutuhkan. `aws/aws-sdk-php` sudah terpasang (ditarik `league/flysystem-aws-s3-v3`). Diverifikasi di local dengan
  ElasticMQ: `Queue::push(Handler::class, ...)` dan `Queue::push('Class@whenX', ...)` (pola `EventMailerHandler`) diproses
  `queue:work sqs`. Yang perlu dicek di server: `VisibilityTimeout` queue lebih lama dari job terlama (default AWS 30 detik,
  beanstalkd dulu `retry_after` 180, job yang lewat batas akan jalan dua kali), `SQS_PREFIX` atau `SQS_QUEUE` berisi URL akun,
  `SQS_REGION`, izin IAM, dan worker supervisor memakai koneksi `sqs`.
- Email konfirmasi pendaftaran gagal render karena `emails.scholarships.pijak.components.step-number` muncul lagi lewat PR #5887.
  Perbaikannya ada di commit `92f465f0c71` PR #6021, sudah merge 2026-10-08.

### 4.2 Validasi email IBM SkillsBuild (item 11 dan 28)

Dibahas 2026-10-06. Item 11 dan 28 adalah kebutuhan yang sama, dibangun sekali.

Kondisi kode: email diisi di Syarat Administrasi tahap `ibm_account` (`PijakAdministrationStoreAction` ke
`PijakAdministrativeRequirementSpecification::submitIbmAccount()`), validasi baru `required_if` dan `email`, disimpan di
`scholarship_participants.other_requirements` key `ibm_account_email` lewat `PijakGateway::saveIbmAccount()`. Lokasi guard
sudah disepakati di GATH §5.D2: sebelum simpan di `submitIbmAccount()`, `throw InvariantException`.

**Keputusan Krisna 2026-10-06:**

- Penyimpanan: **tabel DB berisi email polos**, unique index di email. Array config (pola `pijak.ineligible_users`) ditolak karena
  30 ribu PII masuk git dan dimuat tiap request. Baca Google Sheet langsung sudah ditolak Dimas.
- **Email dinormalisasi** (trim dan lowercase). Kolasi tabel di DB ini `*_ci`, jadi perbandingan sudah tidak peka huruf besar.
- Data production dimasukkan oleh **tim infra**, bukan lewat command atau seeder di repo.
- Tabel kemungkinan dipakai juga untuk pengecekan di **Wave 2**.
- Sumber daftar: akun IBM yang pernah dipakai di program sebelumnya atau di tempat lain (bukan hanya Pijak 2026), jadi data memang
  dari Ops, tidak bisa diturunkan dari DB sendiri. Tujuan bisnis: KPI client butuh new registrant (email IBM baru).
- Tabel **general**, bisa dipakai consumer lain, tapi kode tetap sederhana. Bentuk final:

  ```
  excluded_emails
    id
    exclusion_code   string, contoh 'ibm_skillsbuild_used'
    email            string, dinormalisasi trim dan lowercase
    created_at, updated_at   ($table->timestamps(), konsisten dengan tabel lain)
    unique (exclusion_code, email)
  ```

  Gateway `ExcludedEmailGateway::isExcluded(codes, email)`. Kode eksklusi Pijak disimpan di config Pijak sebagai **array**
  `ibm_account_exclusion_codes` (keputusan Krisna 2026-10-06), supaya Wave 2 bisa mengecek beberapa daftar sekaligus, misalnya
  daftar IBM ditambah daftar email Wave 1, tanpa infra menyalin ulang data ke kode baru. Nama `excluded_*` mengikuti istilah `excluded_program_ids` di config Pijak.
  Alternatif yang ditolak: `email_lists`, `email_list_entries`, `imported_emails`, `dataset_emails`, `reference_emails`,
  `blacklisted_emails`, `used_emails`, tabel khusus IBM, dan tabel per `program_id` (menyulitkan Wave 2).
- Wave 2 yang juga harus memblokir email Wave 1: infra memasukkan email tersebut dengan kode eksklusi baru, lalu kode itu
  ditambahkan ke array config Wave 2. Bukan query ke JSON `other_requirements`.
- **Implementasi 2026-10-06** di branch `feature/pijak/excluded-ibm-account-email` (dari `master`), PR
  [#6030](https://github.com/dicoding-dev/dicoding/pull/6030), risk high (perlu review dan approval sebelum merge): migration
  `excluded_emails`, `ExcludedEmailGateway`, `PijakGateway::isIbmAccountEmailExcluded()`, guard dan lowercase di
  `PijakAdministrativeRequirementSpecification::submitIbmAccount()`, terjemahan
  `PIJAK.ADMINISTRATIVE_REQUIREMENT.IBM_ACCOUNT_EMAIL_ALREADY_REGISTERED`, runbook infra di `commands.md` bagian 5.
  `PijakAdministrativeRequirementIntegrationTest` (11 test) dan Psalm lolos.
- **Status 2026-10-13:** PR masih open (draft) dan BLOCKED menunggu review, jadi kode belum ada di `master`. Urutan deploy tetap
  migration lebih dulu, lalu infra impor, baru pendaftaran dibuka.
- **Perubahan desain 2026-10-16** (masih di branch yang sama, PR #6030 open, REVIEW_REQUIRED): tabel `excluded_emails` dan
  `ExcludedEmailGateway` dihapus. Pengecekan memakai tabel `meta_contents` lewat `MetaContentGateway::hasValueInKeys(keys, value)`,
  config `ibm_account_exclusion_codes` diganti `ibm_account_exclusion_keys` (`['pijak:ibmsb:registered_email']`), dan migration
  menambah unique index `meta_contents_key_value_unique` di `(key, value(255))`. Uraian `excluded_emails` di atas tinggal sebagai
  riwayat keputusan; runbook infra di `commands.md` perlu disesuaikan ke `meta_contents`.
- Serah terima infra: runbook di `commands.md` berisi format CSV satu kolom `email` dan perintah import yang mengisi
  `exclusion_code` serta menormalisasi email (`LOWER(TRIM(...))`, abaikan duplikat). Urutan: migration deploy, infra import,
  pendaftaran dibuka.

Masih terbuka: apakah email IBM yang sama boleh dipakai dua peserta Pijak 2027 (tanya Ops), apakah tahap `ibm_account` bisa
disubmit ulang setelah tersimpan (cek kode), dan copy pesan error (usulan key
`PIJAK.ADMINISTRATIVE_REQUIREMENT.IBM_ACCOUNT_EMAIL_ALREADY_REGISTERED`, tanpa menyebut "daftar IBM").

Peluncuran yang diundur ke awal November membuat data bisa dimasukkan sebelum pendaftaran dibuka, jadi kasus "peserta sudah submit
sebelum daftar diimpor" kemungkinan tidak terjadi.

### 4.3 Tombol re-offer (item 27)

Dibahas 2026-10-06. Latar belakang di card Basecamp
[10285207796](https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10285207796): Ops harus offering kedua kali
karena peserta lupa menerima atau menolak.

Kondisi kode:

- Re-offer dari admin sudah ada. `ScholarshipOfferingCreation::screeningCandidate()` memperpanjang offering `NOT_CONFIRMED` yang
  `due_date`-nya lewat (`min(now + 2 hari, offeringDeadline)`, pesan "Penawaran beasiswa telah diperpanjang"), menimpa baris yang
  sama. Setelah `offeringDeadline` lewat, admin ditolak dengan `SCHOLARSHIP.CREATE_OFFERING.CLOSED`.
- Perpanjangan tetap raise `ScholarshipOfferingWasCreated`, jadi `ScholarshipOfferingWasCreatedMailer` mengirim email dan WA offering
  lagi tanpa kode baru.
- `PijakViewModel` sudah menghasilkan `SubStepStatus::OFFERING_EXPIRED`.

Pendekatan yang dipertimbangkan: (A) klik langsung memperpanjang offering, (B) klik hanya mencatat permintaan lalu Ops re-offer
lewat admin, (C) gabungan keduanya. A dan C ditolak karena kursi peserta yang expired bisa sudah diberikan Ops ke kandidat lain
sehingga re-offer otomatis berisiko melebihi kuota.

**Keputusan Krisna 2026-10-06:**

- **Pendekatan B.** Peserta klik tombol, sistem mencatat waktu klik, Ops memilih user id dari sheet lalu upload CSV di halaman
  admin offering yang sudah ada. Tidak ada kode baru di sisi admin.
- **Penyimpanan:** key `reoffer_requested_at` di `scholarship_participants.other_requirements` (pola `ibm_account_email`), tanpa
  migration. Kolom di `scholarship_offerings` ditolak karena tabel bersama semua program.
- **Sheet export `Re-offer Request`:** user id, waktu klik, status offering saat ini, due date offering. Status dan due date
  ditambahkan karena sheet ditulis ulang tiap export, jadi Ops perlu membedakan permintaan yang sudah di-re-offer
  (`due_date` setelah waktu klik) dari yang belum.
- **Syarat tombol muncul** (juga dijaga di server dengan `InvariantException`): offering `NOT_CONFIRMED` dengan `due_date` lewat
  (bukan yang menolak), penanda masih kosong, dan `offeringDeadline` program belum lewat.
- **Setelah klik:** tombol hilang, status "Permohonan terkirim, menunggu peninjauan tim". Kalau `offeringDeadline` lewat dan Ops
  tidak re-offer, status menjadi "Periode penawaran telah berakhir" (cukup di ViewModel).
- **Sekali pakai:** penanda tidak dihapus saat Ops re-offer, jadi kalau offering kedua expired tombol tidak muncul lagi. Ini sudah
  memenuhi "wajib terima" dalam lingkup Pijak 2027. Modal konfirmasi berisi peringatan tersebut.
- **Re-offer manual tanpa klik dibiarkan:** peserta yang di-re-offer Ops tanpa pernah klik tetap punya satu kesempatan klik.
  Mencegahnya butuh penghitung offering di alur admin yang dipakai semua program.
- **Branch:** stacked di atas PR #6017 (`improvements/pijak/export-and-traits-assessment`) karena sheet 2027 ada di sana, dibuka
  sebagai draft PR sampai #6017 merge.

**Implementasi 2026-10-06**, dipecah jadi dua PR stacked (domain dan unit test terpisah dari non-domain dan integration test):

| PR | Branch | Base | Isi | Risk (Krisna) |
|---|---|---|---|---|
| [#6031](https://github.com/dicoding-dev/dicoding/pull/6031) | `feature/pijak/reoffer-request-domain` | `master` (sudah rebase per 2026-10-07) | Aggregate `PijakReofferRequest`, event `ReofferWasRequestedToPijak`, `PijakReofferRequestTest` (7 test) | medium, post-merge |
| [#6033](https://github.com/dicoding-dev/dicoding/pull/6033) (merged 2026-10-12) | `feature/pijak/reoffer-request` | `feature/pijak/reoffer-request-domain` (#6031) | Terjemahan `PIJAK.REOFFER.*`, `PijakGateway` (`saveReofferRequest`, `getReofferRequestedAt`, `getReofferRequests`), `PijakReofferRequestSpecification`, `PijakReofferRequestAction`, route `pijak2027.registration.announcement.reoffer`, `PijakViewModel` (`isOfferingClosed`, `canRequestReoffer`, `isReofferRequestPending`), partial `announcement/offering-expired.blade.php`, sheet `Re-offer Request` di `Pijak2027ParticipantsExportHandler`, integration test | medium, post-merge |

Status merge per 2026-10-13: #6031 merged 2026-10-08, #6033 merged 2026-10-12, dan perbaikan lanjutan
[#6090](https://github.com/dicoding-dev/dicoding/pull/6090) (guard re-offer tanpa offering, pesan dot notation) merged 2026-10-13.

Keputusan yang diambil saat implementasi:

- Status "menunggu tinjauan" dibedakan dari "offering kedua juga expired" dengan membandingkan `reoffer_requested_at >= due_date`.
  Re-offer dari admin memperpanjang `due_date` di baris offering yang sama (bukan baris baru), jadi setelah Ops re-offer, due date
  selalu lebih besar dari waktu klik.
- Tombol dan kartu ditaruh di partial khusus Pijak. `components.offering.has-expired` yang dipakai IBM dan CodingCamp tidak diubah
  (badge di sana masih "Kadaluwarsa", ejaan tidak baku, dibiarkan).
- Tidak ada case `SubStepStatus` baru. Status cukup dari method ViewModel karena hanya dipakai di view pengumuman Pijak.

Verifikasi:

- Unit test 7, integration test 26 (`PijakReofferRequestIntegrationTest`, `PijakAnnouncementIntegrationTest`,
  `PijakExportParticipantsCommandIntegrationTest`, `PijakOfferingAndCohortIntegrationTest`), Psalm dan pre-push Psalm lolos.
- E2E lokal lewat Chrome DevTools: akun baru `reoffer.tester@dicoding.local` (user 324) daftar jalur Intensif, syarat administrasi
  lewat UI (Tes Penilaian diisi langsung di `exam_registrations`), offering dikirim dari `/scholarships/offering` lewat upload CSV,
  `due_date` dimundurkan di DB, klik re-offer berhasil dan tersimpan. Re-offer ulang dari admin memperpanjang offering id 40, lalu
  setelah dibuat expired lagi tombol tidak muncul dan POST langsung ke endpoint ditolak `PIJAK.REOFFER.ALREADY_REQUESTED`.
- Toggle per-user `pijak-final-selection-result` (`feature_users`) mendahului semua status offering di halaman pengumuman. Akun tes
  yang punya toggle ini aktif tidak akan melihat kartu expired.

Masih terbuka:

- ~~Nit preflight R1 di #6033~~ **Selesai di #6090 (merged 2026-10-13):** pesan flash re-offer dan Twibbon kini memakai key
  terjemahan dot notation.
- Docblock `@throws` di `PijakReofferRequest::request()` (nit preflight #6031) dibiarkan, mengikuti `PijakParticipantRegistration`.
- Blacklist lintas program (D1) tetap ditunda.
