## Nabila Putri Ananda Sari
- [Want to confirm] Logo terlihat tidak sejajar dengan sapaan salam. Apakah bisa dibuat lebih sejajar dengan kata atasnya?
- [Want to confirm] Apakah possible ketika checklist setuju belum unchecked, maka button “kirim formulir” disable, tujuannya supaya aware dari awal meskipun secara behaviour langsung diarahkan menuju error state ketika ada field yang belum terisi
- Kondisi ketika mengganti Negara tempat Indonesia menjadi luar negeri, field Domisili kota/kabupaten Anda saat ini pada form “Konfirmasi Registrasi” masih terlihat
- Belum ada list SMK ketika memasukkan keyword SMK pada field Instansi
- Belum ada list Instansi D1 ketika memasukkan keyword Politeknik maupun universitas pada field Instansi 
- Belum ada list Instansi D2 ketika memasukkan keyword Politeknik maupun universitas pada field Instansi 
- Belum ada list Instansi D3 ketika memasukkan keyword Politeknik maupun universitas pada field Instansi 
- Belum ada list Instansi D4 ketika memasukkan keyword Politeknik maupun universitas pada field Instansi 
- Belum ada list Instansi S1 ketika memasukkan keyword Universitas maupun universitas pada field Instansi
- [Need to confirm] Apakah possible ketika user belum centung komitmen pada program, button kirim formulir disable? 
- Detail informasi peserta pada Surat Komitmen tidak sejajar, sesuaikan dengan template SK (Pekerjaan/Kegiatan Saat Ini → tidak enter) → font isi dan keseluruhan detail sesuaikan dengan template SK 
- Nama Lengkap pada SK seharusnya mengambil dari nama lengkap di formulir registrasi bukan dari isian di field nama ktp 
- Informasi Guideline IBM dan catatan belum ada di section Pendaftaran Akun IBM SkillsBuild: "baca: guidelines belajar di IBM SkillsBuild", "*Catatan: Jika sebelumnya Anda telah..."

- TTD Pijak pada section pengumuman
"Salam hangat,
Tim Pijak in Collaboration with IBM SkillsBuild"

- [Email Autoreply] Eligible Vocational Students – Pemula 
  - Rata kanan kiri seperti pada brief referensi. Khususnya pada kalimat "Untuk melanjutkan proses seleksi Anda, silakan mengikuti langkah-langkah berikut dengan saksama:"
  - Rata kanan kiri seperti pada brief referensi. Khususnya pada kalimat Setelah seluruh langkah di atas diselesaikan, silakan menunggu pengumuman selanjutnya dari kami. 
  - Kelebihan enter sebelum kalimat “Terima kasih dan semangat!” 
  - Tahun program pada footer email harus "2026/2027"
- Pengumuman Tidak Eligible Syarat Progresif (YA/VS), belum ada informasi akses IBM hingga 30 Maret dan ttd Pijak sesuai brief



## Putri Yanti Nahampun

Feedback:
- Minor feedback
Agar lebih rapi, berikan enter sebelum kalimat “Jika Anda yakin data sudah sesuai, silakan lanjutkan dengan mengirim formulir.”

- Ketika mencoba case berikut:
  - Memilih domisili di Indonesia & sudah mengisi data kab/kota.
  - Melakukan perubahan dengan memilih domisili di Luar Negeri.
  - Tampilan data sebelum kirim formulir. (Terdapat informasi negara tempat tinggal ( di Belanda) namun domisili di Indonesia.
- Bagian status “status Anda saat ini” → tidak keseluruhan, yg awal nya milih tidak sedang mengikuti pendidikan sehingga opsi status Anda itu muncul. Namun ketika berubah, status tersebut tetap muncul.
- Hasil email setelah daftar tahap 1 berbeda dengan kode HTML yg disediakan:

Tampilan email yg didapatkan: (dari sisi jenis font, ukuran font, dan penggunaan kata ada yg berbeda).
KODE HTML yg diberikan: dokumen Pijk 2027 - Registration Draft


---

# Status dan keputusan (dicek di master 2026-10-21, status PR diperbarui 2026-10-26)

Total 23 poin feedback (Nabila 19, Putri 4), dikelompokkan ke kode A sampai D. Status dicek terhadap `master` dan branch PR terbuka.

## Rekap per poin feedback

| Poin | Feedback | Kode | Status |
|---|---|---|---|
| N1 | Logo tidak sejajar dengan "Salam," | A1 | Selesai, PR #6159 (merged) |
| N2 | Tombol "Kirim formulir" disable selama "Setuju" belum dicentang | A2 | Tidak diubah (keputusan) |
| N3 | Domisili kab/kota masih muncul setelah ganti ke luar negeri | A3 | Selesai, PR #6159 (merged) |
| N4 sampai N9 | List Instansi SMK, D1, D2, D3, D4, S1 kosong | A5 | Masalah staging, bukan kode |
| N10 | Tombol disable selama komitmen belum dicentang | A2 | Tidak diubah (keputusan) |
| N11 | Detail peserta di SK tidak sejajar, font beda template | B1 | Selesai, PR #6162 (merged) |
| N12 | Nama Lengkap SK dari form registrasi, bukan nama KTP | B2 | Selesai, PR #6162 (merged) |
| N13 | Guideline IBM dan catatan di section Pendaftaran Akun IBM SkillsBuild | B3 | Selesai, PR #6162 (merged) |
| N14 | TTD Pijak di section pengumuman | C1 | Selesai, PR #6143 (merged 2026-10-23) |
| N15 | Email VS Pemula: rata kanan kiri "Untuk melanjutkan proses seleksi..." | D1 | Selesai, PR #6167 (kalimat tidak ada lagi di versi 2) |
| N16 | Email VS Pemula: rata kanan kiri "Setelah seluruh langkah..." | D2 | Selesai, PR #6167 (kalimat tidak ada lagi di versi 2) |
| N17 | Email VS Pemula: kelebihan enter sebelum "Terima kasih dan semangat!" | D3 | Selesai, PR #6167 (kalimat tidak ada lagi di versi 2) |
| N18 | Footer email "2026/2027" | D4 | Selesai, PR #6167 |
| N19 | Pengumuman Tidak Eligible Syarat Progresif: akses IBM hingga 30 Maret dan TTD | C2 | Selesai, PR #6169 (merged 2026-10-26) |
| P1 | Enter sebelum "Jika Anda yakin data sudah sesuai..." | A6 | Selesai, PR #6159 (merged) |
| P2 | Domisili Indonesia tetap tampil setelah ganti ke luar negeri | A3 | Selesai, PR #6159 (merged, sama dengan N3) |
| P3 | "Status Anda saat ini" tetap tampil setelah jawaban pendidikan diubah | A4 | Selesai, PR #6159 (merged) |
| P4 | Email setelah daftar beda dengan HTML di Registration Draft | D5 | Selesai, PR #6167 |

## Detail per kode

### A. Form registrasi
- **A1** Logo `img/pijak/logo-pijak.png` (512x163) punya padding transparan sekitar 41px di kiri, pada lebar 180px bergeser sekitar 14px dari "Salam,". `instructions-modal.blade.php:28-29`. Fix: crop PNG atau margin kiri negatif.
- **A2** Keputusan Krisna: tombol tetap bisa diklik supaya pesan merah menunjukkan field yang belum diisi, karena field form banyak dan tanda * saja tidak cukup. Catatan: tombol sekarang sudah disabled sampai 3 checkbox pernyataan akhir dicentang (`registration-form.ts:141-154`), dibiarkan.
- **A3** `registration-form.ts:22-25` hanya menyembunyikan container kota, `city_id` tidak dikosongkan dan tidak di-skip di preview (`registration-modals.ts:120-122`). Nilai lama ikut auto-save dan submit.
- **A4** Pola sama dengan A3 untuk `occupation_status` dan `education_level` (`registration-form.ts:43-47`), juga `financial_hardship_categories` saat `has_financial_hardship=0`.
- **A5** Mapping jenjang ke lookup (`institution-field.ts`, `ScholarshipInstitutionFilter`) benar dan data lokal ada (8042 SMA/SMK, 5719 universitas). Keputusan Krisna: masalah di staging. Catatan kecil: `TersierAction.php:70-73` menambah key `action` ke hasil, sehingga `mapResults` menambah 1 hasil kosong.
- **A6** `preview-modal.blade.php:13-15` hanya satu `<br>`.

### B. Surat Komitmen dan administrasi
- **B1** `pijak_commitment_letter.blade.php:112-135`: tabel 2 kolom, ":" di kolom nilai, tanpa `nowrap`, font-size tabel tidak diset. Template memakai Red Hat Text 11pt dengan kolom label, ":", nilai.
- **B2** `PijakCommitmentScholarshipLetter.php:31` memakai `commitment_full_name ?: getParticipantName()`. Harus `full_name` dari form registrasi. Test `ProvidePijakCommitmentLetterTest.php:83,101` ikut diubah.
- **B3** `administration/index.blade.php:46-62` belum punya "baca: Guideline Belajar di IBM SkillsBuild" (`http://dicoding.id/Pijak-Guideline`) dan "*Catatan: Jika sebelumnya Anda telah memiliki akun IBM SkillsBuild di program Pijak 2026, silakan membuat akun baru." (teks dari Registration Draft).

### C. Halaman pengumuman
- **C1** Salam penutup ada di #6143 untuk waiting, intensive-accepted, progressive-accepted, not-eligible. `offering-expired` tidak punya narasi di brief, dibiarkan.
- **C2** Kalimat 30 Maret milik Not Eligible jenis b (tidak menyelesaikan kelas IBM, data dari Ops), bukan jenis a (Bitt, sudah di #6143). Dikerjakan di item 44 backlog, card [10417100155](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100155), di atas #6143. **Keputusan Krisna 2026-10-22:**
  - Penanda berupa feature flag per user `pijak-not-selected`, bukan key `other_requirements`. `category` tidak diubah.
  - **Diubah sebelum merge (2026-10-26):** penanda memakai status `category` (`progressive_ineligible` atau `intensive_ineligible`), bukan flag per user, karena flag per user bisa dinyalakan peserta sendiri lewat `/features/enabled`.
  - Command khusus `scholarships:pijak:announce-not-selected --userIds=...`, bukan `feature:toggle`, supaya flag tidak bisa menyala global karena lupa `--users` dan id yang bukan peserta dilaporkan gagal.
  - Tanpa aturan skip: daftar dari Ops dipercaya, tanpa token dan email.
  - Nama "not selected", bukan "not eligible", karena peserta ini kategorinya YA/VS dan "Not Eligible" sudah dipakai untuk jenis a.
  - Kartu dicek sebelum Progresif di `announcement/index`, ceklis sidebar Pengumuman dianggap selesai.
- **C2 email Bitt** Keputusan Krisna: email Not Eligible versi Bitt ikut item 42 (card [10417100099](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100099)). Isi: 30 hari, 2 nama kelas Bitt, tombol "Klaim Akses Kelas" ke halaman pengumuman registrasi.

### D. Email autoreply registrasi
- **D1 sampai D3** `registration-confirmation.blade.php:10,128-130`: paragraf tanpa style justify, `<br>` di antara dua `<p>`.
- **D4** `layout.blade.php:33` memakai tahun dinamis, harus "2026/2027".
- **D5** Beda dengan HTML referensi: banyak `<p>` memakai Helvetica (referensi Segoe UI), ukuran paragraf 14.5px dan 15px #555, sapaan 16px #333 (kode pink), subject dan sign-off memakai `$program_name` lengkap (referensi "Pendaftaran Pijak 2027 Berhasil!..." dan "Tim Pijak in collaboration with IBM SkillsBuild").
- **Keputusan Krisna:**
  - YA memakai versi 2 (intro bullet, Fasilitator & Grup Diskusi, Pijak PathFinder, FAQ).
  - VS dibuatkan versi 2 juga, sama seperti YA.
  - `{{Link FAQ}}` dibuat `@todo` dulu.
  - Nama fasil diambil dari tabel `users` lewat `facilitator_id` (user id), berlaku juga untuk fasil yang belum daftar Pijak.
  - "Kode Fasilitator" memakai user id fasil, konsisten dengan `?ref={user_id}` dan `group-whatsapp-{uid}` (Krisna 2026-10-21).
- Dikerjakan di atas #6141 (mentee grouping) karena butuh `facilitator_id`.
- **Catatan nama fasil (2026-10-22, belum diputuskan):** Ops (Putri) akan memberi data fasil dalam spreadsheet berisi nama lengkap yang dikumpulkan langsung dari fasil dan email akun Dicoding. Semua fasil wajib sudah punya akun Dicoding saat pendaftaran dibuka. Nama di akun Dicoding bisa berbeda dengan nama lengkap di sheet, karena tim fasil meminta nama lengkap. Krisna masih menanyakan ke Ops apakah nama akun Dicoding boleh dipakai.
  - Usulan: `facilitator_user_ids` diganti peta `uid => nama lengkap` di config (misalnya `facilitators`), diisi dari sheet Ops (email dipakai untuk mencari uid). Email membaca nama dari config, bukan dari `users`. Urutan config tetap dipakai untuk memecah seri pembagian mentee, dan kode fasil tetap uid.
  - Efek: `PijakGateway::getFacilitatorName()` dan query `users`-nya tidak dipakai lagi, sehingga temuan CR-1 (`TypeError` kalau uid fasil tidak ada di `users`) ikut hilang.
  - Kalau Ops setuju nama akun Dicoding dipakai, #6167 tetap seperti sekarang.

## Rencana PR

| PR | Isi | Base | Status |
|---|---|---|---|
| 1 | Form: A1, A3, A4, A6 | master | PR [#6159](https://github.com/dicoding-dev/dicoding/pull/6159), merged 2026-10-22 |
| 2 | SK dan administrasi: B1, B2, B3 | master | PR [#6162](https://github.com/dicoding-dev/dicoding/pull/6162), merged 2026-10-22 |
| 3 | Email versi 2 YA dan VS: D1 sampai D5 | master (#6141 merged 2026-10-22) | PR [#6167](https://github.com/dicoding-dev/dicoding/pull/6167), merged 2026-10-23 |
| 4 | Item 44: tidak terpilih, akses IBM hingga 30 Maret (C2) | #6143 | PR [#6169](https://github.com/dicoding-dev/dicoding/pull/6169), merged 2026-10-26 (penanda diubah ke status peserta) |
| 5 | Item 42: Bitt, termasuk email Not Eligible | #6143 | Dikerjakan Deden (card [10417100099](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417100099)) |
| 6 | A7: section Intensif tersembunyi di-disable (catatan reviewer #6159) | master | PR [#6177](https://github.com/dicoding-dev/dicoding/pull/6177), merged 2026-10-23 |

## Progres

### 2026-10-21: PR 1 (A1, A3, A4, A6)
- PR [#6159](https://github.com/dicoding-dev/dicoding/pull/6159) `[Improvements][Pijak] Drop stale registration answers and align the logo`, branch `bugfix/pijak/registration-form-qa-fixes` dari master, HEAD `91f54ed`. Open, risk low (post-merge), preflight lengkap (2 reviewer tanpa temuan).
- Pendekatan A3/A4: helper `toggleConditionalSection()` di `registration-form.ts` menyembunyikan section sekaligus men-`disabled` field di dalamnya, mengikuti pola `institution-field.ts`. Field disabled tidak masuk `FormData`, jadi tidak tampil di konfirmasi, tidak ter-auto-save, dan tidak ter-submit; muncul lagi dengan nilai lama saat section ditampilkan. Dipakai untuk kota, pendidikan/status, disabilitas, dan kondisi ekonomi, juga dijalankan saat load agar draft yang dipulihkan konsisten. Skip `disabilities` di `registration-modals.ts` dihapus karena sudah redundan.
- A1: `margin-left: -14px` di logo modal petunjuk saja. PNG tidak di-crop karena dipakai sebagai `program_logo` di banyak tempat.
- A6: `<br><br>` di `preview-modal.blade.php`.
- Bundle `public/bundle/campaigns-pijak-*.js` ikut di-commit (build lewat `deck fe-build`).
- Tanpa test frontend baru (keputusan Krisna: belum ada test form Pijak ter-commit). Verifikasi manual di local:
  - Draft auto-save (`campaign_initial_registrations`, admin uid 2) membuang `city_id` dan `occupation_status` setelah jawaban diganti.
  - Submit akun baru uid 342 (`qa.pijak.formfix1@dicoding.local`, jalur luar negeri + SMK): `city_id` dan `occupation_status` null.
  - Submit akun baru uid 343 (`qa.pijak.formfix2@dicoding.local`, `intensive_eligible`): kota kembali, `education_level` dan `disabilities` kosong.
  - Password kedua akun `Qapijak12345`.
- Catatan reviewer (tidak memblokir): `intensiveOnlyFields` dan `commitmentAccordion` masih hanya disembunyikan, belum di-disable. **Ditindaklanjuti 2026-10-22 (A7):** diverifikasi di browser, isian Intensif ikut tampil di preview dan tersimpan di draft. Diperbaiki di [#6177](https://github.com/dicoding-dev/dicoding/pull/6177) (open, risk low, preflight lengkap), lihat Progres PR 6.

### 2026-10-21: PR 2 (B1, B2, B3)
- PR [#6162](https://github.com/dicoding-dev/dicoding/pull/6162) `[Improvements][Pijak] Use the registration name and Ops font on the commitment letter`, branch `bugfix/pijak/commitment-letter-qa-fixes` dari master `1a09231`, HEAD `f7a7c02`. Open, risk low (post-merge), preflight lengkap (2 reviewer tanpa temuan).
- B2: `PijakCommitmentScholarshipLetter` memakai `LetterParameters::getParticipantName()` (`other_requirements.full_name`, lalu nama akun). `commitment_full_name` (nama KTP) tidak dipakai lagi di surat, tetapi tetap dikumpulkan dan disimpan. Tanda tangan ikut memakai nama dari form registrasi karena variabelnya sama. Dua test lama di `ProvidePijakCommitmentLetterTest` diganti satu test `test_full_name_is_taken_from_registration_form_instead_of_identity_card_name` (TDD, merah dulu).
- B1: tabel 3 kolom (label nowrap / ":" / nilai), Red Hat Text 11pt, `line-height` 1.15 supaya tetap 1 halaman dan tanda tangan tidak menimpa footnote. Font `RedHatText-Regular.ttf` dan `RedHatText-Bold.ttf` diambil dari font yang tertanam di docx template (425 glyph, Latin dan Latin-1), di-commit ke `public/fonts` dan dimuat lewat `@font-face` `public_path()` seperti sertifikat. Tidak memakai CDN karena PDF dibuat di queue worker. Catatan: sebelumnya "Google Sans" tidak pernah ter-embed, jadi surat lama tampil dengan font bawaan Dompdf.
- B3: kartu Pendaftaran Akun IBM SkillsBuild di `administration/index.blade.php` diberi kalimat "Anda wajib melakukan pendaftaran akun hanya melalui tombol di bawah ini (baca: Guideline Belajar di IBM SkillsBuild)" dengan link `https://dicoding.id/Pijak-Guideline`, dan catatan miring akun Pijak 2026. `Form::` di file itu tidak dimigrasi karena barisnya tidak diubah.
- Verifikasi: unit test (23), Psalm, `git diff --check`; PDF surat dirender lewat `PDFPrinting::printLetter` untuk peserta 118 (uid 343, `full_name` "QA Pijak Intensif", nama KTP "QA Pijak Intensif KTP"): surat menampilkan "QA Pijak Intensif", 1 halaman, kedua font ter-embed. Halaman administrasi dicek di Chrome dengan akun uid 343.
- Catatan local: Chrome DevTools MCP bisa terkunci oleh server MCP sesi lain (`The browser is already running`). Alternatif yang berhasil: Playwright dari cache npx dengan `executablePath: '/opt/google/chrome/chrome'` dan `headless: false`. Login curl gagal di halaman session duplication.
- Preflight: `validate` di checkout utama tetap gagal karena file untracked, jalankan dari worktree bersih (`git worktree add /tmp/dicoding-pf-wt <branch>`), termasuk tepat sebelum `gh pr create`.

### 2026-10-22: PR 3 (D1 sampai D5, email versi 2)
- PR [#6167](https://github.com/dicoding-dev/dicoding/pull/6167) `[Feature][Pijak] Registration email version 2 with facilitator details`, branch `feature/pijak/registration-email-v2`. Awalnya ditumpuk di atas #6141; karena #6141 merged sebelum PR dibuat, base menjadi `master`. HEAD `f0e65bf`, open, risk medium (post-merge), teks risk Krisna: "ganti narasi dan layout email".
- Email eligible (`registration-confirmation.blade.php`) mengikuti [VERSI 2] Registration Draft: intro bullet, kotak Langkah IBM SkillsBuild (8 course lewat `@foreach`), kotak Tes Seleksi & Administrasi khusus Intensif, banner batas waktu, kotak Fasilitator & Grup Diskusi, kotak Pijak Pathfinder (`http://dicoding.id/Pijak-Pathfinder`), FAQ `https://dicoding.id/pijak2027-faq`, "Semangat belajar dan sukses selalu! ✨". VS memakai struktur yang sama tanpa kotak Tes Seleksi. Not Eligible tidak berubah selain layout dan footer bersama.
- Fasilitator: kotak dan bullet fasil hanya tampil kalau `facilitator_id` ada (Not Eligible atau config `facilitator_user_ids` kosong tidak mendapat fasil; tanpa referral, referral bukan fasil, dan fasil penuh tetap dialokasikan ke fasil dengan mentee paling sedikit). Nama dari `users` lewat `PijakGateway::getFacilitatorName()` dengan `COALESCE(name, display_name)` (`display_name` NOT NULL), berlaku untuk fasil yang sudah maupun belum daftar Pijak. Kode Fasilitator = user id. Tombol "Join Grup Sekarang" merah ke `group-whatsapp-{uid}` (tidak ada di draft, dipertahankan agar peserta bisa bergabung).
- Subject eligible "Pendaftaran Pijak 2027 Berhasil! ..." dari `program_short_name` + `program_year`. Layout, footer, dan deadline banner bersama: penutup "Tim Pijak in collaboration with IBM SkillsBuild", footer "© 2026/2027 Program Pijak", Helvetica dibuang (ikut Segoe UI body). Berlaku juga untuk email offering dan pengumuman Progressive.
- `getFacilitatorName()` mengembalikan `?string` (temuan reviewer CR-1): uid fasil yang tidak ada di `users` membuat `TypeError` yang lolos dari `catch (Exception)` mailer sehingga job tidak dihapus. Keputusan Krisna: dibiarkan `?string` dulu; alternatif `string` + `ObjectNotFoundException` belum dipilih. Nit KY-1 (label "Pijak 2027" dirakit di mailer dan view) di-defer.
- Test: subject eligible di `PijakRegistrationIntegrationTest` diganti, test baru nama dan kode fasil serta penutup dan footer, test tanpa fasil memastikan "Kode Fasilitator" tidak tampil. Fallback `display_name` tanpa test (keputusan Krisna). Verifikasi: Psalm, unit Pijak 77, integration Pijak 101 (8 skipped), paratest penuh 3220 test dengan 2 kegagalan flaky Inertia/Vite yang lolos sendiri, base-compatibility dengan master `8dc40ef` (berisi #6162) lolos. Render email Intensif dan Progresif dicek lewat headless Chrome.
- Catatan preflight: base PR berganti dari `feature/pijak/mentee-grouping` ke `master` sehingga preflight diulang (helper menolak relabel review). Helper dijalankan dari worktree bersih; checkout utama dipindah sementara ke detached HEAD selama validasi.
- Belum: config production `facilitator_user_ids` masih `[]`, sehingga email terkirim tanpa kotak fasil sampai daftar uid fasil dari Ops diisi.

### 2026-10-22: PR 4 (C2, item 44)
- PR [#6169](https://github.com/dicoding-dev/dicoding/pull/6169) `[Feature][Pijak] Announce not selected participants via command`, branch `feature/pijak/announce-not-selected`, base `feature/pijak/announcement-narrative` (#6143). HEAD `09b3504`, 5 commit. Open, risk medium (post-merge), teks risk Krisna: "add announcement command for not selected participant to open their announcement page".
- `scholarships:pijak:announce-not-selected --userIds=...` (`PijakAnnounceNotSelectedCommand`, `PijakNotSelectedAnnouncementSpecification`): cek peserta Pijak 2027, lalu `FeatureUsersGateway::enableForUser()` flag `pijak-not-selected`. Bukan peserta dihitung gagal. Tanpa skip, email, dan token.
- Kartu `announcement/not-selected.blade.php` dengan narasi SYNC (akses IBM SkillsBuild hingga 30 Maret 2027, tanggal ditulis langsung di view) dan salam penutup. `PijakViewModel::isNotSelected()` dicek sebelum kartu Progresif; step Pengumuman di sidebar ceklis.
- Test (TDD, merah dulu): `PijakAnnounceNotSelectedCommandIntegrationTest` (id negatif, peserta diumumkan, bukan peserta gagal) dan satu test di `PijakAnnouncementIntegrationTest`. Psalm dan 106 integration test Pijak lolos.
- `commands.md` bagian 9 ditambahkan, catatan basi (#6021, #6063, token Not Eligible, `full_name` surat) dirapikan.
- Kata "Ops" dibuang dari kode: deskripsi dan opsi `announce-progressive` serta nama test-nya (commit terpisah di PR yang sama). `@todo` kuota di `PijakViewModel` dibiarkan.
- Verifikasi: unit 9312, Psalm penuh, paratest penuh 3228 (dijalankan langsung lewat `deck php ./vendor/bin/paratest` karena `deck composer paratest` kena batas waktu composer 300 detik; 3 gagal flaky dan lolos saat dijalankan sendiri). Cek browser local: uid 302 (Progresif) melihat kartu tidak terpilih dan ceklis sidebar, uid 303 (`not_eligible`) dengan flag tetap melihat kartu Bitt; flag kedua akun dimatikan lagi.
- Preflight: simplicity tanpa temuan. Rules CR-1 (test urutan kartu untuk `not_eligible`) di-dismiss karena daftar not selected hanya berisi Intensif dan Progresif. CR-2 (ceklis sidebar butuh administrasi selesai) terjawab: halaman pengumuman terkunci sampai administrasi selesai, sama seperti Asah, Coding Camp, dan Pijak 2026 yang flag hasil akhirnya tidak pernah membuka kunci. Skenario sementara: admin belum selesai di-redirect; offering aktif atau ditolak, dan flag Progresif sekaligus, tertimpa kartu tidak terpilih.
- Catatan: kalau Ops memasukkan peserta yang sedang punya offering aktif, tombol offering-nya hilang. Preflight CI (`verify-event`) hanya untuk PR ke `master`, jadi preflight diulang setelah #6143 merge dan base pindah ke `master`.

### Catatan umum
- Jalankan `deck` lewat `script -qec "deck ..." /dev/null` karena butuh TTY. `frontend/node_modules` sudah diperbarui (vitest dan `deck fe-build` jalan).
- PR #6141 (mentee grouping) di-rebase ke master dan di-force-push 2026-10-21 (konflik di `PijakRegistrationIntegrationTest` dan mailer dengan #6138), lalu merged 2026-10-22.

### 2026-10-22: PR 6 (A7, catatan reviewer #6159)
- PR [#6177](https://github.com/dicoding-dev/dicoding/pull/6177) `[Bugfix][Pijak] Drop hidden Intensive answers from the registration form`, branch `bugfix/pijak/disable-hidden-intensive-fields` dari master `d8fb067`, HEAD `cc507ee`. Open, risk low (post-merge), teks risk Krisna: "cuman hide komponen lain yang tidak relevan ketika kriteria user tidak sesuai di preview modal dan autosave". Preflight lengkap, 2 reviewer tanpa temuan.
- Bug (diverifikasi di browser sebelum perbaikan, uid 344): setelah peserta yang awalnya cocok Intensif mengganti jawaban jadi sedang kuliah, perangkat, pernyataan komitmen, dan "Nama lengkap sesuai KTP" tetap tampil di preview konfirmasi, dan tersimpan di draft `campaign_initial_registrations` bersama `is_currently_studying: "1"`.
- Perbaikan: `#intensiveOnlyFields` dan `#commitmentAccordion` memakai `toggleConditionalSection()`. Selector helper dipersempit ke field ber-`name` karena `timezone_display` (tanpa `name`) sengaja selalu disabled. Timezone ikut tidak terkirim untuk non-Intensif, sama dengan `PijakGateway` yang sudah membuangnya.
- Bundle: `deck fe-build` ikut mengubah 7 bundle lain (dashboard, home, index, inertia, show) karena bundle master tidak sinkron dengan source; hanya bundle `campaigns-pijak` dan barisnya di `vite-manifest.json` yang di-commit (chunk yang di-import tidak berubah hash).
- E2E Playwright 23/23 PASS: uid 344 (`qa.pijak.hidden1@dicoding.local`) tersembunyi dan disabled saat load, nilai lama kembali saat cocok Intensif lagi, preview dan submit tanpa isian Intensif (DB `progressive_eligible`, kosong); uid 345 (`qa.pijak.hidden2@dicoding.local`) validasi 7 komitmen tetap jalan, preview memuat isian Intensif, DB `intensive_eligible` dengan 2 perangkat, 7 komitmen, nama KTP, timezone WIB. Password keduanya `Qapijak12345`. Tanpa test vitest baru (belum ada test form Pijak ter-commit).
- Catatan local: akun baru wajib verifikasi email (link di Mailcatcher berawalan `http://http://`, buka path-nya langsung), dan login setelah daftar berhenti di `session-duplication` ("Lanjut di browser ini").
