---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, backlog, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Pijak 2027 — Gathering Implementasi

> Dokumen ini merangkum hasil analisis perbandingan antara brief **"Pijak 2027 - Brief Landing Page & Registration"** dengan implementasi **PijakFlash** (yang aktif sekarang) dan pola-pola yang sudah ada di domain scholarship lain (Asah, Bangkit, CodingCamp, legacy IBM SkillsBuild). Fokus dokumen ini adalah **brief**, bukan notes diskusi rapat — item dari notes diskusi ditaruh terpisah di bagian akhir sebagai catatan yang ditunda.
>
> Sumber:
> - `docs/domains/pijak2027/Pijak 2027 - Brief Landing Page & Registration.md`
> - `docs/domains/pijak2027/Notes - Diskusi terkait registration flow Pijak X AI Camp.md` (hanya untuk beberapa referensi, tidak jadi fokus utama)

---

## 1. Perubahan Struktural Utama (PijakFlash → Pijak 2027)

PijakFlash sekarang: satu jalur flat, self-paced, tanpa cohort/ILT, satu periode buka-tutup. Pijak 2027 menambahkan 3 lapisan baru:

1. **Sistem Wave (4 gelombang)** — Wave 1 (Okt 2026–Jan 2027), Wave 2 (Feb–Apr 2027), Wave 3 (Mei–Jul/Ags 2027), Wave 4 (Ags/Sep–Des 2027), dengan syarat **UID harus unik lintas semua wave**.
2. **Percabangan Intensif vs Progresif dalam satu form** — ditentukan dari jawaban umur, status pendidikan, WNI, dan domisili yang diisi user di form yang sama (bukan dua route terpisah seperti CodingCamp vs CodingCampProgressive).
3. **Syarat kelulusan course IBM SkillsBuild berjenjang** — Progresif cukup ≥1 dari 8 course, Intensif wajib semua 8 course selesai.

### 1.1 Relasi Intensif ↔ Progresif — bukan fitur baru, tapi pergeseran titik keputusan

Terverifikasi ke kode: **legacy IBM SkillsBuild = Intensif** (Administration, Upload Dokumen, Cohort Data dengan field `supervisor_*`/`is_applied_sks_conversion`, Offering berjadwal — ciri program ber-ILT) dan **PijakFlash = Progresif** (full self-paced, tanpa cohort/offering sama sekali).

**Koreksi penting**: fallback dari gagal-Intensif ke Progresif **sudah ada sejak lama**, bukan hal baru untuk 2027. `PijakUpdateFinalSelectionResultCommand.php` (flow legacy) sudah memisahkan peserta jadi "diterima Intensif" (`offering_status=ACCEPTED && cohort_id!==null`) vs "kandidat Progresif" yang di-auto-redeem token kelas fallback lewat config `scholarships.ibm_skillsbuild.rejected_packages` — dan nama **"Progressive" itu sendiri berasal dari key config ini** (`description: 'Pijak in collaboration with IBM SkillsBuild Progressive'`). Pola yang identik juga ada di **Asah** (`rejected_packages` dengan struktur sama persis) — jadi ini preseden umum lintas program beasiswa, bukan sesuatu yang unik/baru untuk Pijak.

Yang **benar-benar berubah** untuk Pijak 2027 bukan "menambahkan fallback yang belum ada", tapi **memindahkan titik keputusan Progresif dari post-hoc (setelah gagal offering Intensif) menjadi eksplisit di awal form** — user langsung tahu masuk track mana begitu submit form, bukan menunggu hasil seleksi Intensif dulu baru "dikonsolasi" ke Progresif. Progresif jadi track yang setara dan mandiri, bukan cuma booby-prize.

---

## 2. Matriks Reuse — Apa yang Bisa Dipakai Ulang

| Bagian | Sumber Reuse | Status | Catatan |
|---|---|---|---|
| Modal "Petunjuk Pengisian Formulir Registrasi" | `ui.v3.campaigns.ibm.registration.sections.registration-form.instructions-modal.blade.php` | **Reuse 100%** | Sudah shared partial, di-`@include` PijakFlash. Isi identik dengan brief kata-per-kata, kecuali baris "Salam" (sekarang logo gambar, brief tulis nama tim sebagai teks — kemungkinan cuma salah transkrip brief, bukan permintaan ganti desain). |
| Cross-wave uniqueness check | **`ElevateParticipantRegistration`/`CampaignRegistrant::isRegisteredInOtherWave()`** — Elevate **sudah punya mekanisme multi-wave dedup produksi** | **Reuse 100%, bukan domain baru sama sekali** | **Koreksi atas asumsi sebelumnya** (loop manual ala `CampaignPromotionEligibilityChecker`): ternyata Elevate sudah menghadapi persis masalah yang sama (multi-wave) dan solusinya sudah ada di VO shared `CampaignRegistrant` (field `registered_in_other_wave`, sudah dipakai lintas campaign). Pola lengkapnya: `ElevateParticipantRegistrationRepository::create()` isi `registered_in_other_wave` dari `ElevateGateway::isRegisteredInExcludedPrograms($userId)` (1 query `EXISTS ... WHERE program_id IN (...)` ke `scholarship_participants`), lalu `ElevateParticipantRegistration::validatePreConditions()` cukup 1 baris `if ($this->registrant->isRegisteredInOtherWave()) throw ...`. Untuk Pijak: tiru persis pola ini — VO `CampaignRegistrant` tidak perlu diubah sama sekali, cukup buat gateway method serupa `isRegisteredInExcludedPrograms()` untuk tabel yang dipakai Pijak. |
| Logic penentu kategori eligibility (YA/VS/Intensif) | `IBMSkillsBuildParticipantRegistration::determineEligibilityStatus()` (`Dicoding/Domain/Scholarships/IBMSkillsBuild/Aggregates/IBMSkillsBuildParticipantRegistration.php:86-99`) + `CodingCampProgressiveParticipantRegistration::$resolvedCategory` | **Reuse pola, bukan invent baru** | **Koreksi atas klaim sebelumnya** ("domain service baru, belum ada preseden") — ternyata **sudah ada pola established**: method private di dalam aggregate registrasi, dipanggil sinkron saat `register()`, baca field form (WNI/negara/pendidikan), hasil kategori ikut di-raise sebagai event domain. Dikonfirmasi di **2 campaign** (legacy IBM, CodingCamp Progressive) — bukan kebetulan satu file. Untuk Pijak 2027: **aturan bisnisnya baru** (umur+status pendidikan+WNI+domisili, beda dari WNI+negara+pendidikan D1-S1 punya IBM), tapi **strukturnya tinggal contek** method ini. **Terpisah dari show/hide field** (Q13-29 di brief) yang murni frontend — pola `hidden="true"` + JS di `registration-modals.js`, tidak ada logic domain di baliknya. |
| Tingkat pendidikan (dropdown) | Enum `NewEducationLevel` (`Dicoding/Domain/Scholarships/Enums/NewEducationLevel.php`) | **Reuse penuh** | Sudah shared enum, dipakai Asah & Bangkit, label persis cocok dengan brief. |
| Auto-fill zona waktu (WIB/WITA/WIT) | Atribut `data-timezone` di tiap `<option>` kota (`personal-identity.blade.php:103`) | **Reuse penuh** | Mekanisme derive timezone dari kota yang dipilih sudah ada, tinggal dipakai untuk field zona waktu baru. |
| Tes Seleksi (Assessment Test) | Component `ui.v3.campaigns.components.assessment-card.blade.php` + `ExamResultGateway::getAssessmentCompletionStatus()` | **Reuse penuh** | Sudah shared component (dipakai Asah). Tinggal ganti course id ke `887`. |
| ~~Upload dokumen kondisi ekonomi~~ **(DIBATALKAN, lihat §6)** | ~~Asah re-registration form~~ | **Tidak jadi dipakai** | Brief awalnya minta upload dokumen (SKTM, KIP Kuliah, dst) persis pola Asah re-registration. **Ops sudah putuskan membatalkan ini** (thread Dimas Catur → Feni → Wintari) — diganti self-declaration + estimasi pendapatan, tanpa upload sama sekali. Lihat §6 untuk keputusan final. |
| Surat Komitmen (generate + preview/download) | `LetterType::IBM_SKILLSBUILD_COMMITMENT` + service `IBMSkillsBuildCommitmentScholarshipLetter` | **Reuse service, ubah timing** | Letter type & service sudah ada dan sudah pernah dites (`ProvideIBMSkillsBuildCommitmentLetterTest.php`). Bedanya: sekarang di-generate di tahap **cohort form** (setelah offering diterima); brief minta muncul **langsung setelah submit Step 1**. |
| Upload Surat Komitmen (balik) | Pola upload Bangkit (`S3RemoteStorageService` + `StorageType`) | **Reuse pola, +1 gap kecil** | `IBM_SKILLSBUILD_COMMITMENT` **belum** punya mapping di `LetterType::getStorageType()` — butuh 1 `StorageType` case + mapping baru. |
| Section "Item 13-29" (zona waktu, kondisi ekonomi, tools, knows_from, + seluruh "Komitmen pada Program" termasuk 3 checkbox penutup) | `ibm/registration/sections/registration-form/commitment.blade.php` + `confirmation.blade.php` | **Reuse field, tapi kondisionalitasnya ubah dari legacy** | Brief eksplisit: *"Jika pilihannya selain nomor 8 umurnya 18–34 tahun dan nomor 12 memilih Tidak sedang menempuh pendidikan, maka nomor 13-29 tidak muncul."* Dihitung urut nomornya, rentang 13-29 mencakup **timezone, has_financial_hardship/financial_hardship_categories, tools_availability, knows_from, commitments (7-poin), violation_agree, commitment_full_name, DAN confirm_all_true/confirm_awareness_and_responsible/terms_agreed** — bukan cuma section komitmen saja. **Koreksi penting**: legacy IBM/PijakFlash memperlakukan `confirm_all_true` dkk sebagai unconditional (blade `confirmation.blade.php` terpisah, tanpa `display:none`, dipakai semua peserta hari ini) — tapi itu perilaku **sistem lama**, brief 2027 secara eksplisit menyatukannya ke rentang 13-29 yang kondisional. Semua field ini di VO (`PijakRegistrationData`) sebagai `sometimes`, di-enforce di **aggregate** (`PijakParticipantRegistration::validateIntensiveTrackRequirements()`) setelah `determineEligibilityStatus()` menghasilkan `INTENSIVE`. `commitment_agreement` (consent paling awal, sebelum "Data Personal") **tetap unconditional**, di luar rentang 13-29. `commitment_full_name` juga dipakai Bangkit/CodingCamp/Tempa — di Bangkit unconditional (`BangkitRegistrationSpecification.php:54`) karena tidak ada percabangan track di sana. |
| Proses Offering (2 hari, notif dashboard+email) | `ScholarshipOfferingCreation.php` (`OFFERING_PERIOD_IN_DAYS = 2`) | **Reuse 100%, sudah pas persis** | Logic `due_date = min(now+2 hari, offeringDeadline)` sudah otomatis menangani kasus offering di hari terakhir (31 Des 2026, deadline cuma sampai 23.59 WIB hari itu). Tidak perlu perubahan apapun. |
| Cohort Data (kontak darurat + komitmen) | `ScholarshipCohortRegistrationSpecification` / `PijakCohortFormStoreAction.php` (flow legacy IBM SkillsBuild) | **Reuse, field existing superset** | Field brief (nama/hubungan/no telp/email kontak darurat + 3 checkbox) cocok. Field `supervisor_*`/`is_applied_sks_conversion` di kode existing tampaknya untuk jalur VS (di luar scope Wave 1), boleh dibiarkan optional. |
| Course Progresif (4 course) | `campaigns.php['pijak_flash']` (course id 862, 867, 753, 123) | **Reuse 100%** | Course id di brief identik dengan yang sudah ada. Token redemption pakai `MultiCourseTokenAutoRedemptionService` yang sama seperti CodingCamp/Bangkit. |
| Twibbon & Referral (mekanisme dasar) | `PijakFlashViewModel::getReferralUrl()` (append `?ref={user_id}`, tanpa kode terpisah) | **Reuse mekanisme** | Konfirmasi: tidak ada "kode referral" khusus, `user_id` itu sendiri jadi kodenya. |

---

## 3. Yang Genuinely Baru (Belum Ada Preseden)

1. **Restrukturisasi step-model registrasi** — `PijakFlashRegistrationStepStatus` sekarang 3 step linear (`InitialRegistrationStep → SelectionStep → AnnouncementStep`). Brief butuh "Syarat Administrasi" jadi 1 step besar dengan 4 sub-item (1a akun IBM, 1b course IBM, 2a assessment *kondisional*, 2b upload komitmen *kondisional*) sebelum lanjut ke Offering → Cohort → Pengumuman. Ini pemodelan domain baru, bukan reuse field semata.
2. ~~**Tracking granular 8-course**~~ **(DIBATALKAN, lihat §6)** — sempat diduga perlu diperluas jadi tracking per-course untuk bedakan "≥1 selesai" (Progresif) vs "semua 8 selesai" (Intensif). **Ops sudah konfirmasi (Wintari, thread Basecamp 18 Sep 2026)**: pertanyaan "sudah selesai minimal 1 dari 8 course?" cuma gimmick, jawaban "Tidak" tidak memblokir submit atau mengubah eligibility — form tetap lanjut apapun jawabannya. Jadi pola boolean tunggal existing (`has_complete_at_least_one_ibm_course`) **sudah cukup**, reuse langsung, tidak perlu domain logic baru atau perluasan verifikasi Google Sheets.
3. **Validasi cross-check email vs list SB 2026** — usulan Wintari. **Statusnya sekarang "Extramiles" (bukan scope Wave 1), lihat §10 poin 1** untuk detail teknis dan diskusi Dimas Saputra.
4. **Fitur "Ajukan permohonan offering ulang"** — `ScholarshipOfferingStatus` enum cuma punya `NOT_CONFIRMED/ACCEPTED/REJECTED`, tidak ada state "expired lalu diajukan ulang". **Statusnya sekarang "Extramiles" (bukan scope Wave 1), lihat §10 poin 3**.
5. **Email templates** — sumber narasi lengkap: `docs/domains/pijak2027/Narasi Filtering & Promotion Pijak 2026.md`. Pemetaan ke 5 email autoreply yang perlu di-update (brief tab "Email Autoreply", ditandai Wintari "Need to update"):
   - **Eligible (YA/VS)**: adaptasi "After Registration - Eligible" — **hapus bagian Surat Rekomendasi** (2027 cuma pakai Surat Komitmen, sesuai keputusan di §6).
   - **Not eligible**: adaptasi "After Registration - Non Eligible", isinya lebih simpel (tidak ada Tes Seleksi/Surat Komitmen).
   - **Peserta terpilih Intensif**: di 2026 ternyata **3 email terpisah** — "Offering" (+ varian "Last Day Offering" untuk hari terakhir), lalu setelah accept ada **"Selected Intensive Mahasiswa"** vs **"Selected Intensive Umum"** (subject beda per kategori), plus **"[15 Jan] LoA"** (welcome resmi, terpisah, setelah cohort data lengkap). Kode existing yang jadi basis: `ScholarshipOfferingWasCreatedMailer` (§2).
   - **Peserta terpilih Progresif**: adaptasi "[7 Jan] Selected Progressive" — sudah ada basis kode aktif: `DeveloperWasRegisteredToPijakProgressiveMailer.php`.
   - **Peserta tidak terpilih**: adaptasi "[7 Jan] Not Selected Progressive & Intensive" — **subject & isinya sudah persis sama** dengan yang sudah jalan di kode sekarang (`PijakSendEmailLastChanceCommand` → template `LastChanceToCompleteIBMCourses.blade.php`), tinggal reuse.

   Dokumen sumbernya juga berisi ~28 email/WA lifecycle tambahan (reminder belum tes, FU dosen, Cohort Data H+1/H+2, dll) di luar 5 autoreply ini — relevan untuk item WABA integration yang ditunda di §8, bukan scope Wave 1 sekarang.

---

## 4. Perubahan Field Step 1 (Form Registrasi)

Urutan & isi field sekarang (`PijakFlashInitialRegistrationForm.php`) vs brief:

| Sekarang | Brief 2027 | Status |
|---|---|---|
| full_name, current_email, gender, current_country, current_country_abroad, phone_number, city_id | Email → Nama Lengkap → Jenis Kelamin → **WNI (baru)** → Negara → No WA → **Tanggal Lahir (baru)** → **Provinsi (baru, terpisah dari kota)** → Kota/Kabupaten | Reorder + 3 field baru |
| — | Conditional Q13-29 berdasar umur (dari tanggal lahir) + status pendidikan | Logic baru, tidak ada di form sekarang |
| — | Field WNI (Ya/Tidak) | Field baru |
| `education_level` (saat studi) / `last_education_level` (tidak studi) | Sama, **+ sub-field baru**: kalau "Tidak sedang menempuh pendidikan" → pilih Job-seeker/First jobber/Professional/Career switcher/Tidak keseluruhan | Sub-field baru, **tapi sudah dikonfirmasi TIDAK jadi kriteria eligibility** (lihat §6) |
| `has_ibm_account`, `ibm_account_in_other_org`, `ibm_account_email` (Step 1) | Dipindah ke Syarat Administrasi (Step 2), disederhanakan jadi 1 field email + validasi cross-check SB2026 | Pindah step + validasi baru |

**Catatan soal Provinsi & Kota — sudah CLOSED, lihat §5.A1**: tidak perlu field provinsi baru. `city_id` tetap satu-satunya field yang disubmit (seperti sekarang), provinsi diturunkan via JOIN ke tabel `cities` saat dibutuhkan (mis. export). Untuk Luar Negeri, provinsi & kota di-hide sepenuhnya (dikonfirmasi Wintari), sama seperti perilaku sekarang.

---

## 5. Perlu Dikonfirmasi ke Tim Ops

### A0 — Desain `program_id` untuk Wave (CLOSED)
Brief menyebut "buka pendaftaran 4 Wave" seolah 4 periode dari **satu program yang sama**, bukan 4 program berbeda. Ini menentukan dua desain yang konsekuensinya sangat berbeda:

- ~~Opsi A — 1 `program_id` untuk semua wave, beda jendela tanggal per wave.~~
- **Opsi B — `program_id` terpisah per wave/batch — DIKONFIRMASI Ops.** Meskipun namanya tetap "Pijak", setiap wave/batch **wajib bikin row `partner_programs` baru** (id baru per wave), bukan 1 program dengan jendela tanggal berbeda.

**Konsekuensi teknis (dikonfirmasi, bukan asumsi lagi)**: mekanisme cross-wave dedup **wajib dibangun** — cek "sudah pernah daftar" bawaan `CampaignInitialRegistration::validateForm()` tidak cukup karena tiap wave punya `program_id` sendiri (lihat §2, baris "Cross-wave uniqueness check", dan §9 langkah 1).

### A1 — Provinsi & Kota (CLOSED)
Tidak perlu field provinsi terpisah: tabel `cities` (`ScholarshipsGateway::getCities()`, `Dicoding/Infrastructure/StorageGateways/Scholarships/ScholarshipsGateway.php:18-27`) sudah punya kolom `province` langsung di tiap row kota. Registrasi cuma perlu simpan `city_id` (seperti sekarang), provinsi diturunkan via JOIN saat dibutuhkan (lihat A1b) — user tidak pernah ditanya provinsi sama sekali.

**Perilaku untuk Luar Negeri — dikonfirmasi Wintari**: provinsi & kota/kabupaten **di-hide/remove sepenuhnya** ketika user isi negara tempat tinggal dengan "Luar Negeri", persis seperti perilaku PijakFlash sekarang (`city_id => required_if:current_country,Indonesia`). Bukan manual input seperti dugaan awal brief — itu salah paham dari sisi Ops karena tidak ada di brief eksplisit.

### A1b — Aksi konkret: tambahkan kolom `province` ke export Ops
Wintari minta akses lookup kota→provinsi untuk tim Ops. Rekomendasi: tambahkan 1 kolom `province` (hasil JOIN ke `cities`) ke pipeline export Google Sheets Pijak yang sudah ada (`export_google_sheets_id`), bukan bikin tool lookup terpisah. Ops otomatis dapat kolom itu di spreadsheet yang sudah biasa dipakai.

### A2 — Link/nomor course IBM (a-h) untuk YA vs VS (masih OPEN)
Apakah 8 link course IBM SkillsBuild di section "1b. Selesaikan Course IBM SkillsBuild" sama untuk track YA dan VS, dan konfirmasi ulang nomor course-nya — ini komentar Wintari yang masih terbuka di dokumen brief (belum ada jawaban dari siapapun). *(Topik validasi email vs list SB 2026 yang sebelumnya digabung di sini sudah dipindah ke §10 poin 1 — beda topik, sudah ada keputusan prioritas sendiri.)*

### A3 — Baris "Salam, Tim Pijak..." (CLOSED)
Dikonfirmasi Wintari: tetap **gambar/logo** (brief cuma salah transkrip jadi teks, bukan permintaan ganti desain). Ada juga varian logo landscape/horizontal yang perlu dipakai — file logo (termasuk varian landscape) sudah dikirim Yunus lewat folder Google Drive terpisah (link dibagikan di thread komentar brief, bukan didokumentasikan di sini karena itu aset desain, bukan spek teks).

### A4 — Bentuk field self-declaration kondisi ekonomi (CLOSED)
Sudah diputuskan **arahnya** (lihat §6): ganti upload dokumen jadi self-declaration. Bentuk field self-declaration-nya **sudah dikonfirmasi lewat draft form** (Q14): **bukan** textarea bebas, tapi pola gate + multi-select:

1. Radio Ya/Tidak — *"Apakah kondisi ekonomi/keluarga Anda pernah membatasi akses pendidikan, kesehatan, atau kebutuhan dasar?"*
2. **Kalau "Ya"**, muncul checkbox multi-select (boleh pilih lebih dari 1), kategori kondisi — pada dasarnya kategori yang sama persis dengan opsi upload dokumen di brief awal, cuma sekarang self-declared (dicentang sendiri) bukan dibuktikan dokumen:
   - Kesulitan membiayai pendidikan atau pelatihan
   - Keterbatasan akses terhadap perangkat atau internet untuk belajar
   - Kesulitan memenuhi kebutuhan dasar sehari-hari
   - Memiliki tanggungan keluarga yang memengaruhi kemampuan finansial
   - Bergantung pada bantuan sosial atau bantuan pendidikan
   - Pendapatan keluarga tidak tetap
   - "Lainnya" (free text)

Secara struktur ini **reuse langsung** — 1 radio gate (pola sama dengan field WNI, lihat §11.3) + 1 checkbox-group kondisional, tidak perlu komponen baru. **Field "estimasi pendapatan" terpisah TIDAK diperlukan (dikonfirmasi 2026-09-21)**: sempat dikira perlu field angka/range terbuka tambahan, tapi itu salah paham — "Pendapatan keluarga tidak tetap" **sudah** jadi salah satu dari 7 opsi checkbox multi-select di Q14 di atas, bukan sub-bagian yang butuh field angka terbuka terpisah. Q14 (radio gate + checkbox multi-select) sudah final dan lengkap apa adanya.

### B4 — Mekanisme "atau saat pendaftaran intensif ditutup" (CLOSED)
Sudah diaudit **semua** config campaign di `campaigns.php` dan `scholarships.php` (Tempa, PijakFlash, Bootcamp/Asah, IDCamp, Lintasarta, DBS, Bangkit, IBM SkillsBuild, Elevate, semua versi CodingCamp) — **tidak ada satupun** yang pakai mekanisme dinamis/kuota/toggle admin untuk menutup pendaftaran. Semuanya pakai tanggal statis di config (`closed_at`/`registration_ended_at`/`registration_deadline`/`registration_closed_at`). Jadi flow-nya standar seperti campaign lain: Ops minta ke engineer untuk menutup lebih awal, engineer edit tanggal di config secara manual, redeploy. Tidak ada mekanisme baru yang perlu dibangun untuk ini.

### D1 — Scope Blacklist Offering Re-request (DITUNDA — bukan prioritas sekarang)
Kalimat *"blacklist permanen di program beasiswa intensif Dicoding"* ambigu: khusus Pijak Intensif saja, atau semua program beasiswa Dicoding (Asah, Bangkit, CodingCamp, dst)? Menentukan apakah blacklist perlu cross-program atau cukup scoped ke Pijak.

**Sub-pertanyaan tambahan**: di mana data blacklist ini disimpan, dan siapa yang maintain? Preseden yang ada (`pijak.ineligible_users`, blocklist ~2.400 user id) disimpan sebagai **array di file config, di-track git** — artinya setiap kali mau tambah/hapus orang, **harus lewat engineer** (edit file, commit, deploy), bukan self-serve untuk Ops. Perlu dikonfirmasi apakah Pijak 2027 mau pola yang sama (Ops kirim daftar ke engineer secara berkala) atau dibangun lebih self-serve (tabel DB + panel admin, karena ini fitur baru, bisa didesain lebih baik dari awal).

**Status: sengaja ditunda** — item ini sendiri sudah Extramiles (§10 poin 3, fitur "ajukan permohonan offering ulang" bukan scope Wave 1), jadi keputusan scope blacklist-nya juga tidak perlu dikejar sekarang.

### D2 — Blacklist email akun IBM yang pernah dipakai, di step Syarat Administrasi (masih OPEN, 2026-09-22)

Beda dengan D1 (blacklist user Pijak pasca-offering, ditunda). Ini soal field `ibm_account_email` yang diisi di step **Syarat Administrasi** (`PijakAdministrativeRequirementSpecification`): Ops akan memberikan daftar **~30.000 email akun IBM SkillsBuild yang pernah dipakai sebelumnya**. Kalau email yang diisi user ada di daftar itu, submission **ditolak** dengan pesan minta user daftar pakai email IBM yang baru/belum pernah dipakai — bukan blokir pendaftaran ke program secara keseluruhan, cuma menolak email tersebut di step ini.

**Lokasi validasi**: guard clause di awal `PijakAdministrativeRequirementSpecification::runSpecification()` (branch `feature/pijak/registration-step-model-infra`), sejajar dengan pengecekan `hasParticipantRegistered` yang sudah ada — sebelum `$this->gateway->saveAdministrativeRequirement(...)` dipanggil. Pola guard-nya sama seperti preseden `PijakFlashInitialRegistrationSpecification::validateUser()` (cek terhadap config array, `throw new InvariantException(...)`).

**Yang masih terbuka — penyimpanan datanya**: belum diputuskan array-di-config (seperti `pijak.ineligible_users`, ~2.400 entri) atau tabel DB terpisah. Catatan pertimbangan: preseden config-array itu untuk ~2.400 entri; untuk ~30.000 entri, file config PHP yang di-load tiap request + di-track git (harus commit+deploy tiap update) kemungkinan kurang cocok dibanding tabel dengan index di kolom email. Keputusan final masih menunggu diskusi tim.

### A5a — Referral bisa dipakai walau referrer belum daftar Pijak (CLOSED)

Dikonfirmasi lewat thread Basecamp (Wintari ↔ Krisna, kasus "Fasilitator" yang di-share link-nya sebelum program buka pendaftaran): **link referral (`?ref={user_id}`) tetap tercatat meskipun si referrer (fasilitator) sendiri belum/tidak pernah mendaftar Pijak**. Konteks bisnis: fasilitator terpilih dapat email berisi link referral mereka SEBELUM pendaftaran dibuka, diarahkan untuk daftar juga tapi kemungkinan ada yang telat — kasusnya "ada yang pakai link aku sebagai referrer padahal aku belum daftar Pijaknya."

**Sudah match dengan kode yang ada, tidak perlu perubahan apapun**: `PijakRegistrationIndexAction::setReferrer()` cuma validasi `?ref=` numeric, bukan diri sendiri (`Auth::id()`), dan `DicodingUser::find($referrerId)` ketemu (user Dicoding manapun, bukan spesifik peserta Pijak) — **tidak ada** pengecekan "apakah referrer ini sudah terdaftar sebagai peserta Pijak". Jadi behavior yang diminta Ops sudah berjalan by design sejak awal.

### A5 — Fitur "Fasilitator" / referral link (masih OPEN)
Wintari sempat menanyakan soal teks referral link ("Ajak seluruh teman untuk mendaftar Program Beasiswa Pijak 2027...") dan fitur "Fasilitator". Setelah dianalisis, mekanisme dasarnya **sudah ada** — `PijakFlashViewModel::getReferralUrl()` (`?ref={user_id}`, lihat §2 baris "Twibbon & Referral") — dan sudah dibuktikan jalan end-to-end (referrer_id tersimpan ke `campaign_initial_registrations` saat tes lokal).

**Rekomendasi (belum difinalkan ke Ops)**: cukup expose `getReferralUrl()` yang sudah ada lewat halaman baru yang **tidak digated** di belakang `hasCompletedRegistrationStep()` (beda dari PijakFlash sekarang yang baru menampilkan link setelah user submit Step 1) — **bukan** membangun sistem referrer terpisah gaya Asah (yang mengumpulkan bank account/NIK untuk payout komisi), karena Pijak tidak berbayar, hadiah referral berupa prize/voucher bukan komisi cash. Belum ada keputusan final dari Wintari soal rekomendasi ini.

**Klarifikasi "belum final" (2026-09-21)**: maksudnya rekomendasi teknis di atas — expose link referral lebih awal, sebelum user submit Step 1 — masih murni usulan sepihak dari sisi engineering, **belum pernah diajukan atau dikonfirmasi ke Wintari/Ops secara eksplisit**. Jadi status OPEN-nya bukan soal implementasi yang rumit (mekanismenya sudah ada dan sudah terbukti jalan), tapi soal keputusan bisnis yang belum diambil: apakah link referral memang boleh muncul sebelum submit Step 1 (mengubah behavior dari PijakFlash sekarang), atau tetap digate seperti sekarang sampai form selesai.

### A6 — Item 13-16 (timezone, kondisi ekonomi, tools, knows_from) beneran kondisional ke Intensif? (CLOSED, lihat §16.2)
Brief eksplisit: *"Jika pilihannya selain nomor 8 umurnya per 2027 18–34 tahun dan nomor 12 memilih Tidak sedang menempuh pendidikan, maka nomor 13-29 tidak muncul."* Dihitung urut nomor, rentang itu termasuk `timezone`, `has_financial_hardship`/`financial_hardship_categories`, `tools_availability`, `knows_from` — bukan cuma section "Komitmen pada Program" (17-29).

Sudah diimplementasikan **sesuai teks brief secara harfiah** (`PijakRegistrationData` — field-field ini `sometimes`, di-enforce di `PijakParticipantRegistration::validateIntensiveTrackRequirements()` hanya untuk kategori Intensif). Tapi ada 2 hal yang bikin ini **layak dikonfirmasi ulang ke Ops**, bukan cuma diterima mentah-mentah:

1. **Tidak ada satupun campaign lain** (IBM, Elevate, Bangkit, CodingCamp) yang menjadikan `timezone`/`tools_availability`/`knows_from` kondisional ke kategori/eligibility apapun — di semua tempat itu selalu `required` unconditional. Field-field ini juga secara konsep terasa seperti pertanyaan profil umum (zona waktu, kesiapan perangkat, sumber info), bukan sesuatu yang secara alami spesifik Intensif — beda dengan section Komitmen (capstone project, deklarasi WNI, tanda tangan KTP) yang jelas konsepnya spesifik Intensif.
2. **Inkonsistensi kondisi gating di brief sendiri, dan buktinya lebih kuat dari yang tercatat sebelumnya**: sudah di-grep seluruh dokumen brief (bukan cuma section Step 1) untuk semua kemunculan kalimat gating "umur 18-34 + tidak menempuh pendidikan". Hasilnya: kalimat gating **4 kriteria** ("...+ WNI + tinggal di Indonesia") muncul **konsisten di ~6 tempat berbeda** — section Komitmen (baris 43), panel Preview hasil pendaftaran (baris 44), gate untuk **Step 3 "Proses Offering" itu sendiri** (baris 46), dan 3 kemunculan lain (baris 154, 170, 198). Sementara versi **2 kriteria** (tanpa WNI + Indonesia) cuma muncul **1 kali saja** — persis di kalimat "nomor 13-29 tidak muncul" (baris 43). Karena gate yang sama dipakai konsisten 4-kriteria di mana-mana kecuali 1 tempat, kemungkinan besar itu **typo/kelupaan** penulis brief (lupa tulis "WNI, dan tinggal di Indonesia"), bukan aturan yang sengaja dibedakan.

**Perlu ditanyakan ke Ops**: apakah Progresif candidate memang dimaksudkan tidak perlu isi zona waktu/kondisi ekonomi/tools/sumber info sama sekali, atau ini cuma efek dokumentasi brief yang di-flatten dari Google Docs (mirip masalah kualitas brief lain yang sudah dicatat, §5.A3) sehingga penomoran 13-29 keliru mencakup field yang seharusnya unconditional. Given bukti di atas, dugaan condong ke **"kode saat ini sudah benar" (4 kriteria seragam)** — 2-kriteria di baris 43 kemungkinan besar cuma typo, bukan aturan beneran berbeda — tapi tetap perlu konfirmasi eksplisit sebelum dianggap final.

**CLOSED (2026-09-21)**: brief final (§16) sudah menjawab ini eksplisit — field 13-16 **bukan** shared ke semua Eligible seperti sempat disimpulkan di §15.3, tapi **YA/Intensive-eligible only** (timezone + tools_availability), sedangkan financial_hardship + knows_from pindah ke blok "selalu tampil" (lihat §16.2 untuk field-split final). Implementasi di A2-FE sudah mengikuti pola final ini dan dikonfirmasi user sudah sesuai — tidak perlu konfirmasi Ops tambahan lagi.

### A7 — Materi kurikulum Intensif vs Progresif (untuk C1/C2, belum tercatat sebelumnya)

Brief punya daftar course konkret per kategori, ditemukan belum tercatat di dokumen ini sama sekali:

**Intensif** (lulusan Pemula, kurikulum lanjutan):
- Teknis (7 wajib): Belajar Dasar Pemrograman Web, Belajar Dasar Pemrograman JavaScript, Belajar Membuat Front-End Web untuk Pemula, Belajar Membuat Aplikasi Web dengan React, Belajar Fundamental Aplikasi Web dengan React, Belajar Back-End Pemula dengan JavaScript, IBM SkillsBuild: Web Development Fundamentals.
- Bonus (2, syarat & ketentuan berlaku — belum jelas syaratnya apa): Belajar Fundamental Back-End dengan JavaScript, Menjadi React Web Developer Expert.
- Non-teknis (6): Growth Mindset and Personal Development, Power Up Your Productivity, Navigating Change, Essential Innovation & Collaboration, Public Speaking Mastery, Personal Branding & Interview Preparation.

**Progresif** (self-paced, 4 course): AI Praktis untuk Produktivitas, Belajar Penggunaan Generative AI, Prompt Engineering untuk Software Developer, Belajar Dasar Pemrograman Web.

**Catatan penting soal jumlah**: §1 menyebut "Progresif cukup ≥1 dari 8 course, Intensif wajib semua 8 course" — tapi daftar riil di atas Intensif ada **9 teknis (7 wajib + 2 bonus) + 6 non-teknis**, Progresif cuma **4**, bukan "8 course" yang sama untuk keduanya seperti diasumsikan sebelumnya. Angka "8 course" di §1 kemungkinan referensi ke jumlah course PijakFlash yang sekarang (legacy), bukan kurikulum Pijak 2027 yang baru — **perlu diverifikasi ulang saat C1/C2**, jangan diasumsikan datanya sama.

**Bukan scope A2**: ini murni referensi konten course, tidak mengubah `scholarship_package_id` di A2 (lihat diskusi — kolom itu placeholder konstan mengikuti pola DBN, course list yang sebenarnya hidup di `PijakFlashIBMClassesSelection`/C1-C2, bukan `scholarship_participants.scholarship_package_id`).

**Rencana bentuk config untuk C1/C2** (belum diterapkan ke `app/config/*.php`, course_id asli juga belum dicari): ikuti pola `scholarships.elevate.token_packages` — `course_ids` per key — plus key terpisah untuk 2 course bonus:

```php
'token_packages' => [
    'intensive' => [
        'course_ids' => [/* 7 course teknis wajib */],
    ],
    'progressive' => [
        'course_ids' => [/* 4 course */],
    ],
],
'bonus_packages' => [
    'intensive' => [
        'course_ids' => [/* 2 course "syarat & ketentuan berlaku" */],
    ],
],
```

Non-teknis (6 course) dan Capstone Project belum jelas masuk struktur yang sama atau butuh mekanisme terpisah (Capstone jelas bukan course token biasa) — perlu diputuskan saat C1/C2 digarap, bukan sekarang.

### D2 — Timing pengiriman 4 varian email pengumuman (CLOSED)
Dicek: **tidak ada command/cron yang otomatis membuat atau mengirim offering** di codebase manapun (`PijakUpdateFinalSelectionResultCommand` dan `UpdateCodingCampFinalSelectionResultCommand` cuma **membaca** `offering_status` yang sudah ada untuk keputusan auto-redeem token, bukan membuat offering baru). Satu-satunya jalur pembuatan offering adalah action admin (`ScholarshipsOfferingStoreAction`, upload CSV) yang murni manual/on-demand.

**Keputusan**: ikuti pola yang sama — 4 varian email pengumuman dikirim lewat trigger admin (Ops pencet kapan mereka mau), bukan sistem yang otomatis hitung jadwal. Tidak perlu logic auto-scheduling untuk ini.

### D3 — Reminder otomatis 24 jam (offering belum dikonfirmasi & Cohort Data belum diisi) — masih OPEN, butuh konfirmasi Ops

Brief §3a/§3b menyebut dua reminder otomatis:
1. Reminder kalau offering belum dikonfirmasi (dalam window 2 hari).
2. Reminder berjudul **"Pijak 2027 - Registration Draft"** kalau Cohort Data belum diisi 24 jam setelah offering diterima.

**Sudah dicek exhaustif (2026-09-21) dan nihil**: seluruh `app/commands/**`, scheduler (`app/start/artisan.php`), dan WhatsApp handler (`TemplatedWhatsAppType`) lintas **semua** program beasiswa (Asah, Bangkit, CodingCamp, IBM SkillsBuild) — tidak ada satupun yang punya reminder 24 jam semacam ini, baik untuk offering maupun cohort form. Satu-satunya notifikasi WhatsApp offering yang ada (`ASAH_AFTER_OFFERING`) dikirim langsung saat offering dibuat, bukan reminder tertunda.

**Kenapa ditandai OPEN, bukan langsung dikerjakan**: belum jelas apakah ini (a) fitur baru yang genuinely belum pernah dibangun untuk program manapun, atau (b) mekanisme yang sudah ada tapi belum ketemu (mis. dijadwalkan di luar repo ini — tidak ada file crontab/scheduler yang ter-track di repo, jadi command bisa saja ada tapi schedule-nya tidak kelihatan dari sini). **Perlu dikonfirmasi ke Ops/Wintari** sebelum dianggap scope Wave 1 dan mulai dibangun.

### D4 — `offering_deadline` di config tidak cocok dengan brief — masih OPEN, butuh konfirmasi Ops

Config lokal (`scholarships.pijak.offering_deadline`) sekarang bernilai `2027-01-15 23:59:59`. Brief (§3a Proses Offering, dan berulang di §Step 3/§Step 4) eksplisit bilang masa offering berakhir **31 Desember 2026**, bukan 15 Januari 2027:

> "Namun, offering yang diberikan di hari terakhir masa offering (31 Desember 2026) dengan batas waktu konfirmasi hingga pukul 23.59 WIB."

Sudah digrep seluruh dokumen pijak2027 (brief baru, brief lama, Narasi Filtering) — **tidak ada satupun** yang menyebut "15 Januari 2027". Kemungkinan besar nilai itu salah tebak/analogi keliru dari narasi siklus lama (`Narasi Filtering & Promotion Pijak 2026.md` menyebut "15 Januari 2025"/"15 Januari 2026" untuk LoA, konteks & tahun beda).

**Field lain dicek sekalian (2026-09-22)**:
- `registration_closed_at` (2026-12-31) dan `token_deadline` (2026-12-31) — **cocok** dengan brief ("Tanggal terakhir registrasi & deadline token: 31 Desember 2026 pukul 23.59 WIB").
- `age_reference_date` (2027-02-01) — **cocok** dengan brief ("Berusia 18–34 tahun per Februari 2027").
- `offering_opened_at` (2027-01-01) dan `cohort_form_deadline` (2027-01-20) — brief **tidak menyebut** tanggal eksplisit untuk keduanya sama sekali, jadi bukan mismatch yang terbukti, tapi juga tidak tersumber jelas dari brief — perlu diklarifikasi asalnya.

**Perlu dikonfirmasi ke Ops** sebelum `offering_deadline` diubah — belum diubah di kode, sengaja ditahan sampai ada konfirmasi karena ini legitimately bisa saja keputusan Ops yang belum terdokumentasi di brief (bukan cuma soal grep dokumen).

---

## 6. Keputusan yang Sudah Dikunci (tidak perlu ditanyakan lagi)

- **Desain `program_id` per wave (§5.A0)**: setiap wave/batch punya `partner_programs` sendiri (id baru), bukan 1 program shared dengan jendela tanggal berbeda. Konsekuensi: mekanisme cross-wave dedup wajib dibangun (lihat §2, §9 langkah 1).
- **Tidak perlu migration/kolom/tabel baru untuk field form baru** (WNI, `birth_date`, self-declaration, hasil kategori eligibility): `campaign_initial_registrations.form_data` schema-less (lihat §11.8) — field baru cukup jadi property di form VO PHP, otomatis ikut ter-serialize.
- **Penamaan kode: `Pijak`, bukan `Pijak2027`** — namespace/class domain baru pakai `Dicoding\Domain\Scholarships\Pijak\...` tanpa embed tahun (konsisten dengan campaign lain seperti `IBMSkillsBuild`, tidak perlu rename lagi tahun depan). Tahun ("2027"/wave) tetap boleh muncul di level **data/config** (nama program di `partner_programs.name`, key config per-wave), bukan di nama class/namespace.
- **Bentuk field self-declaration kondisi ekonomi (§5.A4, sebagian)**: radio gate Ya/Tidak + checkbox multi-select kondisional (7 kategori + "Lainnya"), reuse pola radio existing (§11.3) + checkbox-group biasa. Field estimasi pendapatan masih terpisah dan belum ditentukan bentuknya.
- **Timing eligibility check**: ikuti alur PijakFlash sekarang (dihitung setelah submit form, bukan pre-form gate terpisah).
- **Kriteria eligibility YA/Intensif**: HANYA 4 kriteria dari TL;DR — umur 18-34 (dari tanggal lahir), tidak sedang menempuh pendidikan, WNI, tinggal di Indonesia. Field job-seeker/first-jobber/professional/career-switcher **bukan** kriteria gating, murni informasi tambahan.
- **Kondisi ekonomi/keluarga — DIBATALKAN dari upload dokumen, diganti self-declaration**: keputusan final dari thread Dimas Catur Wibowo → Feni Astuti → Wintari (disetujui Wintari, "aku pakai yang Feni"). **Tidak ada upload dokumen sama sekali** (SKTM/KIP Kuliah/dst dari brief awal dibatalkan). Diganti dengan:
  1. **Self-declaration** — user mendeskripsikan sendiri kondisi ekonominya (bentuk field: kemungkinan textarea, belum ditentukan detail UI-nya).
  2. **Estimasi pendapatan** — field tambahan usulan Feni, kira-kira perkiraan pendapatan keluarga/diri sendiri (bentuk: angka bebas atau range/bracket, belum ditentukan).

  Ini secara teknis **jauh lebih sederhana** dari rencana awal — tidak perlu `uppy-uploaders`, tidak perlu `StorageType` baru, tidak perlu S3. Cukup 1-2 field teks/dropdown baru di form. **Perlu diperjelas ke Ops**: bentuk pasti field self-declaration (textarea bebas vs pilihan kategori) dan field estimasi pendapatan (angka bebas vs range/bracket) — belum didetailkan di thread.
- **Jalur VS di Wave 1**: ikuti brief apa adanya, section "[ARCHIVED] H2 - SOON" (Surat Rekomendasi VS) dianggap di luar scope Wave 1.
- **Pertanyaan "sudah selesai minimal 1 dari 8 course IBM SkillsBuild?" bersifat non-gating (CLOSED)**: dikonfirmasi Wintari via Basecamp (18 Sep 2026) — jawaban "Tidak" **tidak** memblokir tombol submit dan **tidak** otomatis membuat user not eligible, form tetap lanjut. Sifatnya cuma gimmick/informasional. Karena course IBM SkillsBuild ada di sistem eksternal (IBM), Dicoding memang hanya bisa mengandalkan self-report user, bukan verifikasi real-time. Implikasi teknis: **tidak perlu granular per-course tracking** (lihat §3 poin 2, dibatalkan) — pola boolean tunggal `has_complete_at_least_one_ibm_course` yang sudah ada di `PijakFlashIBMClassesSelection` cukup di-reuse apa adanya untuk 2027, cukup update copy/label pertanyaannya saja.

---

## 7. Referensi Tanggal Penting di Brief

| Tanggal/Periode | Konteks |
|---|---|
| Umur dihitung **per Februari 2027** | Kriteria eligibility (satu tempat sebut Februari, bukan cuma "per 2027") |
| **Februari–Juni 2027** | Periode program berjalan (untuk field zona waktu) |
| **31 Desember 2026, 23:59 WIB** | Deadline berulang untuk gating section Intensif (lihat §5.B4) + deadline token assessment test |
| **30 hari setelah bulk auto enroll** | Deadline token kelas Progresif (relatif, bukan tanggal tetap) |
| **2 hari** sejak ditawarkan | Window konfirmasi offering (sudah match kode: `OFFERING_PERIOD_IN_DAYS = 2`) |
| **13 Januari 2027** | Pengumuman hasil akhir — **tanggal terpisah** dari 31 Desember 2026, jangan tertukar |
| Wave 1: Okt 2026–Jan 2027 / Wave 2: Feb–Apr 2027 / Wave 3: Mei–Jul/Ags 2027 / Wave 4: Ags/Sep–Des 2027 | Periode wave |

**Bagian yang kemungkinan besar sisa draft lama** (jangan dipakai sebagai spek final): section "🎁 [Need Update] Twibbon & Referral" dan "🪜 [Need Update] Leaderboard Referral" — judulnya sendiri sudah ditandai "Need Update" oleh penulis brief, isinya masih pakai tanggal 2025/2026 dan hashtag `#Pijak2026` yang urutannya sendiri tidak konsisten (pemenang diumumkan sebelum periode referral berakhir).

---

## 8. Ditunda — Berasal dari Notes Diskusi, Bukan Brief

Item berikut berasal dari dokumen "Notes - Diskusi..." dan sengaja **tidak** jadi fokus saat ini sesuai arahan — dicatat di sini supaya tidak hilang untuk direview nanti:

- Pertanyaan Wintari ke tim engineer soal bentuk notifikasi offering sebelumnya ("Bentuknya seperti apa ya sebelumnya?").
- Kesiapan mekanisme Twibbon & Referral dari sisi sistem vs Ops (2 minggu sebelum launch).
- Pertanyaan Dimas Saputra soal volume pesan WABA & nomor pengirim (integrasi WABA reminder, ditandai "Extramiles").
- Permintaan bulk generate LoA (Letter of Acceptance) otomatis — versi lebih presisi & resmi ada di §10 poin 4.
- Integrasi reminder otomatis via Email Platform/Sendportal.

---

## 9. Urutan Implementasi yang Disarankan

### Cara `program_id` dibuat (belum ada untuk Pijak 2027, ini yang perlu dikerjakan duluan)

Belum ada `program_id` untuk Pijak 2027 di manapun — brief maupun notes tidak menyebutkannya sama sekali (sudah dicek, nihil). Ini wajar: `program_id` bukan sesuatu yang Ops tentukan di brief, tapi artefak sisi engineering. Tidak ada panel admin untuk membuat row `partner_programs` (sudah dicek, tidak ada controller Admin untuk tabel ini) — polanya:

1. Engineer bikin migration data (atau insert manual) ke tabel `partner_programs`, dapat `id` auto-increment. Contoh existing: `pijak_flash.id => 2207`, `bootcamp_asah.asah_id => 2237`.
2. Id itu di-hardcode ke config (`campaigns.php`/`scholarships.php`).
3. Kode baca id dari config, bukan dari `partner_programs` langsung tiap request.
4. Baru setelah row itu ada, registrasi bisa jalan — kalau lupa langkah ini, hasilnya `PDOException` foreign key constraint (persis yang berulang kali ditemukan saat testing lokal Pijak/CodingCamp/Bangkit di awal proyek ini).

**§5.A0 sudah CLOSED**: 4 wave = 4 row `partner_programs` terpisah (id baru per wave), jadi langkah 1 di bawah ini sudah pasti perlu dikerjakan, bukan kondisional lagi.

1. Domain wave + config `program_id` per wave + extend `CampaignFactories`/`CampaignGateway` untuk cross-wave check.
2. Restrukturisasi step-model (`PijakFlashRegistrationStepStatus` → step Syarat Administrasi bercabang).
3. Perluasan form Step 1 (field baru + reorder + conditional logic umur/pendidikan).
4. Reuse assessment-card + commitment letter, geser trigger point generate letter ke setelah Step 1.
5. Perluasan `PijakFlashIBMClassesSelection` untuk tracking granular 8 course (**tanpa** validasi email SB2026 — itu Extramiles, lihat §10).
6. Reuse Offering + Cohort domain (program_id baru). **Fitur "request re-offer" + blacklist TIDAK termasuk scope Wave 1** (Extramiles, lihat §10 poin 3).
7. Email templates (bisa paralel, tidak blocking alur teknis).

---

## 10. Extramiles — Prioritas Resmi dari Dimas Saputra (Engineer)

**Bukan scope Wave 1, dan urutannya sekuensial terhadap §9, bukan paralel**: core alur pendaftaran (§9) harus selesai dan stabil (fixed) dulu, baru 4 item di bawah ini digarap **kalau masih ada waktu** — bukan dikerjakan bersamaan dengan core. Ini backlog yang sudah disepakati urutannya lewat diskusi Wintari ↔ Dimas Saputra (bukan sekadar wishlist notes rapat seperti §8), jadi statusnya lebih pasti — dicatat di sini supaya urutan prioritasnya tidak hilang saat scope Wave 1 sudah selesai.

1. **Validasi Email SkillsBuild vs list SB 2026** — cek email yang diinput user terhadap daftar ~20-30 ribu email peserta SkillsBuild 2026; kalau sudah terdaftar, tandai invalid dan arahkan user daftar pakai email baru.
   - **Catatan teknis dari Dimas**: karena skalanya 20-30 ribu baris, **tidak bisa** pakai pola baca-Google-Sheets-langsung seperti `PijakUpdateFinalSelectionResultCommand` (itu cocok untuk verifikasi batch kecil via cron, bukan validasi real-time tiap submit form). Data harus di-import ke tabel DB dengan index yang proper.
   - **Catatan bisnis dari Wintari**: ini "grey area" — tujuannya menaikkan angka user aktif SkillsBuild (insentif bisnis Dicoding-IBM), bukan murni kebutuhan seleksi. Precedent: program **Arcade** sudah lakukan ini secara terbuka/blak-blakan.
2. **Bug/copy: email misleading "program selesai"** ketika token MCT (Multi Course Token) untuk kelas filtering/assessment habis — user dapat email seolah program sudah selesai padahal cuma token yang habis. Belum ada detail lebih lanjut, perlu digali lagi kalau sudah masuk prioritas.
3. **Tombol "ajukan permohonan offering ulang"** untuk offering yang sudah expired — sudah dibahas di §3 poin 4 dan §5.D1 sebelumnya. Sekarang confirmed **Extramiles**, bukan wajib Wave 1.
4. **Preview & edit mandiri data LoA (Letter of Acceptance) oleh tim Cohort** — beda dari catatan lama di §8 (yang menyebut peserta sendiri yang review): versi ini spesifik untuk **tim Cohort (ops)** bisa preview dan edit data LoA sendiri kalau ada yang tidak sesuai, tanpa perlu minta bantuan engineer tiap kali ada revisi.
5. ~~**Autosave/draft persistence untuk form Step 1**~~ — **SUPERSEDED, sudah tidak Extramiles lagi, lihat §13.6.** Alasan asli item ini ditunda (retrofit ke `CampaignInitialRegistration` dianggap kerjaan berdiri sendiri yang belum sepadan) sudah tidak berlaku — revisi domain model §13.3 memutuskan NOT_ELIGIBLE wajib lewat layer itu juga, jadi infra-nya toh dibangun duluan; sekalian dipakai buat autosave semua kategori jadi murah. Preseden PijakFlash (debounced `fetch` tiap event `input`, lihat `frontend/src/pages/campaigns/pijak-flash/registration-form.js`) tetap jadi basis reuse, tapi lewat use case generic `CampaignInitialRegistrationSpecification`/`DefaultInitialRegistrationForm`, bukan VO custom.

---

## 11. Audit Cross-Campaign Tambahan

Penelusuran lanjutan ke **semua** domain scholarship lain yang belum pernah dicek di dokumen ini (Tempa, Elevate, AWS AI Academy, IDCamp, Lintasarta, Bangun Negeri/DBN) — untuk pastikan rencana di atas benar-benar reuse maksimal, bukan invent ulang sesuatu yang sebenarnya sudah ada polanya.

### 11.1 Logic penentu eligibility — ternyata ada di 4 campaign, bukan 2

Selain `IBMSkillsBuildParticipantRegistration` dan `CodingCampProgressiveParticipantRegistration` yang sudah dicatat di §2, ketemu **2 preseden tambahan** dengan pola identik:

- **`AsahReRegistration::determineEligibilityStatus()`** (`Dicoding/Domain/Scholarships/Asah/Aggregates/AsahReRegistration.php:151-167`) — cek `is_indonesian_citizen` + `current_country === 'Indonesia'` + `education_level` masuk D3/D4/S1, return `AsahParticipantCategory::ELIGIBLE`/`NOT_ELIGIBLE`.
- **`TempaEligibilityUpdate::update()`** (`Dicoding/Domain/Campaigns/Tempa/Aggregates/TempaEligibilityUpdate.php`) — varian sedikit beda: ini **aggregate terpisah** khusus untuk update eligibility (bukan inline di aggregate registrasi utama), cek `is_currently_studying` + `education_level` college-level, raise `TempaUserEligibilityWasUpdated`. Pola ini relevan sebagai alternatif desain kalau Pijak 2027 butuh eligibility bisa di-**recompute** terpisah dari submit awal (bukan cuma sekali saat register).

**Total sekarang 4 campaign** (IBM, CodingCampProgressive, Asah re-registration, Tempa) pakai pola yang sama persis: baca field form → tentukan kategori → raise event. Makin kuat buktinya bahwa ini idiom established, bukan sesuatu yang perlu didesain dari nol.

**Tapi tidak satupun dari 4 preseden ini pakai UMUR/tanggal lahir sebagai kriteria** — semuanya WNI + negara + tingkat pendidikan saja. Sudah digrep `diffInYears`/`->age`/`ageAt`/`calculateAge` ke **seluruh** `Dicoding/Domain/Scholarships` dan `Dicoding/UseCases/Scholarships` — nihil, nol hasil. Jadi kriteria "umur 18-34 dihitung dari tanggal lahir" untuk Pijak 2027 **genuinely logic baru** (tidak ada preseden perhitungan umur di manapun), meskipun field `birth_date` itu sendiri **field lama** — dipakai di 4 campaign lain (lihat 11.2).

### 11.2 Field `birth_date` — reuse lebih luas dari yang dicatat sebelumnya

Sebelumnya cuma dicatat Elevate yang punya field tanggal lahir. Ternyata **4 campaign** mengumpulkan `birth_date` dengan validasi sama (`required|date`): `AWS/Aggregates/AWSParticipantRegistration.php`, `AWS/ValueObjects/AWSParticipantRegistrationData.php`, `Elevate/ValueObjects/ElevateRegistrantData.php`, `Idcamp/ARLensStudioRegistration.php`, dan use case `LintasartaParticipantRegistrationSpecification.php`. Field-nya reuse penuh — yang baru cuma logic hitung umur dari field ini (lihat 11.1).

### 11.3 Field WNI (`is_indonesian_citizen`) — reuse di 6 tempat, bukan cuma IBM

Field + component-nya **sudah jadi pola umum lintas program**, pakai component shared yang sama (`ui.v3.campaigns.registration.components.input-radio`):

- `app/views/ui/v3/campaigns/bangkit/registration/sections/application-form/personal-identity.blade.php:84-93` — contoh markup persis:
  ```php
  @include('ui.v3.campaigns.registration.components.input-radio', [
      'label' => 'Are you an Indonesian Citizen?',
      'name' => 'is_indonesian_citizen',
      'items' => ['1' => 'Yes', '0' => 'No'],
  ])
  ```
- Field yang sama juga dipakai di: `codingcamp/registration/sections/registration-form/personal-identity.blade.php`, `tempa/registration/sections/re-register/personal-identity.blade.php`, `asah/registration/sections/re-register/{personal-identity,commitment}.blade.php`, `ibm/registration/sections/registration-form/personal-identity.blade.php`.

Reuse 100% — field name, component, dan validasi (radio Ya/Tidak) tidak perlu didesain ulang sama sekali.

### 11.4 Self-declaration + estimasi pendapatan — dikonfirmasi genuinely baru

Sudah digrep `pendapatan`/`penghasilan`/`income_range`/`income_bracket`/`self_declaration` ke **seluruh** domain Scholarships + semua view campaign — satu-satunya hasil adalah `ParticipantFinancialHardshipFileType` enum (mekanisme lama yang **sudah dibatalkan**, lihat §6) dan view Asah re-register yang sudah dicatat sebelumnya. **Tidak ada satupun campaign** yang punya field self-declaration bebas atau income-bracket. Konfirmasi ulang: field ini (§A4, masih OPEN) genuinely perlu didesain dari nol — meski secara komponen UI tetap generic (textarea/dropdown biasa, bukan komponen baru).

### 11.5 Multi-wave / cross-batch uniqueness — tidak ada preseden lain

Sudah digrep `wave` ke `campaigns.php` dan `scholarships.php` — nihil, istilah ini sama sekali belum pernah dipakai di config manapun. Tidak ada campaign lain (Tempa, Elevate, AWS, IDCamp, Lintasarta, DBN) yang punya konsep multi-batch dalam satu tahun. Preseden terdekat tetap seperti yang sudah dicatat di §2: `bootcamp_asah.bootcamp_program_ids` (array id) dan versioning `codingcamp_progressive_v3`. Tidak ada temuan baru di poin ini.

### 11.6 Registrasi dua-tingkat (ringan → lengkap) — sudah confirmed via `CampaignInitialRegistration`

Tidak ketemu campaign lain dengan pola berbeda dari yang sudah dicatat — `CampaignInitialRegistration` (shared aggregate, dipakai PijakFlash & Asah) sebagai step ringan pertama, lalu specification terpisah untuk step lanjutan, sudah jadi pola yang established dan konsisten di semua campaign yang dicek. Tidak ada preseden alternatif yang lebih baik.

### 11.7 Step-model bercabang — Elevate dicek, ternyata lebih simpel dari PijakFlash

`ElevateRegistrationStepStatus` (`Dicoding/Domain/Scholarships/Elevate/ValueObjects/ElevateRegistrationStepStatus.php`) cuma 2 step (`InitialRegistrationStep` → `AnnouncementStep`) — lebih simpel dari PijakFlash (3 step), bukan preseden yang lebih baik dari IBM (4 step biner) untuk kebutuhan Pijak 2027 yang bercabang banyak.

Tapi ketemu 1 hal berguna: **semua step-status VO** (Elevate, IBM, CodingCamp, Asah, PijakFlash) ternyata extend dari 1 abstract class yang sama — `Dicoding/Domain/Scholarships/CampaignRegistration/Objects/RegistrationStep.php` (`isDone()`/`getStatus()`/`lockThisStep()`). Jadi kalau nanti bikin step-status baru untuk Pijak 2027 yang bercabang, **building block dasarnya reuse** (extend abstract class ini), yang baru cuma komposisi/orkestrasinya (lihat §3 poin 1 — klaim itu tetap valid, cuma perlu ditambahkan catatan reuse building block ini).

### 11.8 Skema `campaign_initial_registrations` — schema-less, konfirmasi tidak perlu migration

Dicek langsung skema tabel (`DESCRIBE campaign_initial_registrations`): cuma 9 kolom fixed — `id, program_id, user_id, referrer_id, is_completed, form_data (TEXT), created_at, updated_at, deleted_at`. Tidak ada kolom per-field (tidak ada `full_name`, `gender`, dst sebagai kolom sendiri).

Ditelusuri ke kode: `CampaignInitialRegistration::register()` (`Dicoding/Domain/Campaigns/Commons/Aggregates/CampaignInitialRegistration.php:29-51`) bungkus form ke `SavedInitialRegistrationSubmission`, yang isi `form_data`-nya adalah `json_encode($this->form->getFormData())` (`SavedInitialRegistrationSubmission.php:18`). Jadi seluruh field form (termasuk yang PijakFlash pakai sekarang: `full_name`, `gender`, `phone_number`, dst) disimpan sebagai JSON blob di 1 kolom TEXT, bukan kolom individual.

**Konsekuensi untuk Pijak 2027**: field baru (WNI, `birth_date`, self-declaration, hasil kategori eligibility) **tidak butuh migration/kolom/tabel baru sama sekali** — cukup ditambahkan sebagai property baru di form VO PHP (`PijakFlashInitialRegistrationForm`/pengganti barunya), otomatis ikut ter-serialize ke `form_data` yang sudah ada. Ini juga berlaku untuk kolom fixed lain (`program_id`, `referrer_id`, `is_completed`) yang sudah cukup untuk kebutuhan Pijak 2027 tanpa tambahan.

### 11.9 Pola submit registrasi — "One-shot" vs "Two-tier", dan mana yang cocok untuk Pijak 2027

Ditelusuri flow lengkap (route → Action → Specification → Aggregate → Repository → Gateway → tabel) untuk **5 campaign**: PijakFlash, legacy IBM SkillsBuild, Asah, CodingCampProgressive, Bangkit. Ketemu **2 pola arsitektur berbeda soal kapan eligibility ditentukan dan berapa kali user submit form** — ini murni soal alur backend/persistensi, bukan soal rendering halaman (komponen show/hide field tetap sama di semua campaign).

**Pola A — One-shot** (1 form, 1 kali submit, langsung tentukan eligibility saat itu juga):
- **Legacy IBM SkillsBuild**: `POST /pijak/registration` → `IBMRegistrationStoreAction` → `IBMSkillsBuildRegistrationSpecification::runSpecification()` (validasi ~20 rules sekaligus) → `IBMSkillsBuildParticipantRegistration::register()` → `determineEligibilityStatus()` dipanggil langsung → kalau ELIGIBLE, auto-redeem token di request yang sama → insert langsung ke tabel `scholarship_participants` (`IBMSkillsBuildGateway::saveRegistration()`).
- **CodingCampProgressive**: `POST /codingcamp-progressive/registration` — tidak ada route kedua/re-register sama sekali. Insert langsung ke `scholarship_participants` (`CodingCampProgressiveGateway.php:159`).
- **Bangkit**: sama, `BangkitGateway::TABLE = 'scholarship_participants'`.

**Pola B — Two-tier** (2 kali submit terpisah, keputusan eligibility baru di submit kedua):
- **Asah**: tahap 1 — `POST /asah/registration` → `AsahInitialRegistrationStoreAction` → pakai `CampaignInitialRegistration` (sama persis dengan PijakFlash) → simpan mentah ke `campaign_initial_registrations` (JSON blob, belum ada keputusan eligible/tidak). Tahap 2 — `POST /asah/registration/re-register` → `AsahReRegistrationStoreAction` → `AsahReRegistrationSpecification` → `AsahReRegistration::determineEligibilityStatus()` → baru di sini eligibility ditentukan, disimpan ke `scholarship_participants`. Satu class (`AsahGateway.php`) pegang ketiga tabel: `campaign_initial_registrations`, `scholarship_participants`, dan `asah_referrals` (sistem referral berbayar terpisah, lihat §5.A5).
- **PijakFlash (sekarang)**: pakai mekanisme yang sama dengan tahap 1 Asah (`CampaignInitialRegistration` → `campaign_initial_registrations`), tapi **berhenti di situ saja** — tidak ada tahap 2/aggregate eligibility, karena PijakFlash memang tanpa seleksi (self-paced, tanpa syarat lolos).

**Temuan tambahan**: `scholarship_participants` juga **hybrid**, bukan full-typed — `DESCRIBE scholarship_participants` = `id, user_id, program_id, referrer_id, scholarship_package_id, category (varchar), knows_from (text), disabilities (varchar), education_info (text), other_requirements (text), created_at, updated_at`. Kolom `category` **sudah ada dari dulu** sebagai varchar generik (dipakai IBM/CodingCamp/Bangkit untuk simpan hasil eligibility), dan `province` untuk IBM disimpan dengan cara JOIN ke `cities` lalu diselipkan ke `other_requirements` (JSON) — bukti konkret keputusan §5.A1 (province derivable via JOIN) sudah jadi pola aktif, bukan usulan baru.

**Implikasi ke desain Pijak 2027**: brief minta eligibility (Intensif/Progresif) ditentukan **begitu user submit 1 form**, bukan menunggu submit kedua. Ini **cocok dengan Pola A** (IBM/CodingCamp/Bangkit), bukan Pola B (Asah/PijakFlash) — meskipun PijakFlash yang jadi basis reuse utama justru Pola B (tapi berhenti di tier 1 karena tidak butuh eligibility). Konsekuensinya: aggregate baru untuk Pijak 2027 desain alurnya lebih dekat meniru cara `IBMSkillsBuildParticipantRegistration::register()` bekerja (validasi + tentukan kategori + simpan, semua dalam 1 request) — bukan menyalin pola dua-tahap PijakFlash apa adanya. Dua opsi tabel tujuan yang sama-sama **tidak butuh migration** (lihat §11.8): reuse `campaign_initial_registrations` (taruh logic eligibility di tier yang sudah ada) atau ikut pola one-shot ke `scholarship_participants` (kolom `category` sudah tersedia, field lain numpang `other_requirements`).

### Ringkasan Audit 11

| Poin | Hasil |
|---|---|
| Eligibility determination | **Diperkuat** — 4 preseden (bukan 2), semua tanpa kriteria umur |
| Field `birth_date` | **Diperluas** — 4 campaign lain reuse field ini, bukan cuma Elevate |
| Field WNI | **Diperluas** — 6 tempat reuse, component shared `input-radio` |
| Self-declaration + income | **Dikonfirmasi ulang** — tetap genuinely baru, nol preseden |
| Multi-wave | **Tidak ada temuan baru** — preseden tetap seperti §2 |
| Registrasi 2-tingkat | **Tidak ada temuan baru** — pola `CampaignInitialRegistration` tetap yang terbaik |
| Step-model bercabang | **1 temuan baru** — abstract base class `RegistrationStep` reusable sebagai building block |
| Skema `form_data` | **1 temuan baru** — `campaign_initial_registrations.form_data` schema-less (JSON blob), field baru tidak butuh migration sama sekali |
| Pola submit registrasi | **1 temuan baru** — One-shot (IBM/CodingCamp/Bangkit) vs Two-tier (Asah/PijakFlash); brief Pijak 2027 lebih cocok pola One-shot untuk desain aggregate barunya |

---

## 12. Estimasi File & Pengelompokan PR (Core Wave 1)

Konvensi PR di codebase ini: **PR1 (Domain)** — enums, events, aggregate, VO, repository, gateway (body dikosongkan dulu boleh), unit test. **PR2 (Infra+Web+Spec)** — integration test, specification, isi body gateway dari PR1, Action (Response digabung ke Action, tidak dipakai terpisah).

**Aturan pengelompokan (revisi)**: sebuah PR baru boleh berdiri sendiri **kalau pemanggilnya ada di PR yang sama atau di PR pasangannya (PR2) yang langsung menyusul**. Kalau pemanggilnya baru muncul di slice/PR lain yang terpisah jauh, itu tanda salah kelompok — jangan bangun infra/domain service yang menggantung tanpa consumer nyata (pelajaran dari draft awal: sempat mau bikin `PijakWaveRegistrationGuard` sebagai class Infrastructure Service berdiri sendiri, sebelum ketemu preseden Elevate — lihat baris "Cross-wave uniqueness check" di §2 — yang ternyata sudah menyelesaikan masalah ini lewat 1 field di VO shared `CampaignRegistrant`, bukan class terpisah).

Urutan di bawah **diprioritaskan domain dulu** (artefak domain murni yang tidak bergantung ke slice lain duluan), baru infra/wiring yang menkonsumsinya.

### Pengelompokan PR yang disarankan (9 PR — domain & infra dipisah konsisten di semua slice, A2 pecah lagi jadi backend+frontend karena ukurannya >20 file, A3 baru ditambahkan saat eksekusi untuk halaman preview pasca-registrasi)

Dipisah lagi persis konvensi asli (PR1 Domain / PR2 Infra+Web+Spec) di **semua** slice — supaya batas unit test (PR domain) vs integration test (PR infra) tetap jelas di tiap slice, tidak digabung demi mengurangi jumlah PR. **Penomoran huruf diurutkan A→D sesuai urutan pengerjaan yang sudah pasti** (bukan lagi C/B/D sisa revisi sebelumnya).

| PR | Status | Isi | Changed | Added | Total |
|---|---|---|---|---|---|
| **A1 (Domain)** — Form Step 1 + eligibility logic (termasuk wave dedup) | ✅ **DONE** — [PR #5769](https://github.com/dicoding-dev/dicoding/pull/5769), branch `feature/pijak/registration-eligibility` | `PijakParticipantCategory` (enum), `PijakRegistrationData` (VO), `DeveloperWasRegisteredToPijak` (event), `PijakParticipantRegistration` (aggregate — precondition `registered_in_other_wave` reuse `CampaignRegistrant` yang sudah ada, `CampaignPrograms` reuse untuk `isRegistrationClosed()`, `age_reference_date` **bukan** ditaruh di `CampaignPrograms` melainkan parameter constructor terpisah di aggregate), `PijakParticipantRegistrationRepository` + `PijakGateway` skeleton (body ditandai TODO, diisi di A2) + **unit test** (16 test) — plus 2 fix commit dari testing manual: `isset()`→`!empty()` untuk timezone/gender kosong (crash saat user Luar Negeri submit timezone kosong), dan `Aggregate::getCategory()` yang dibutuhkan Repository | 0 | 7 | 7 |
| **A2 (Infra+Web+Spec)** — Form Step 1, backend | ✅ **DONE** — [PR #5779](https://github.com/dicoding-dev/dicoding/pull/5779), branch `feature/pijak/registration-eligibility-infra` (stacked di atas A1) | Isi body `PijakGateway` (query `scholarship_participants`), `PijakRegistrationSpecification`, `PijakRegistrationStoreAction`+`PijakRegistrationIndexAction`, `PijakViewModel` (implement `CampaignRegistrationVMInterface`), `app/routes/pijak_2027.php` (prefix sementara `pijak2027`) + `app/routes.php` (1 baris require) + config `scholarships.pijak` + translasi `PIJAK.REGISTRATION.*` + **integration test** (2 test, real DB, Progressive & Intensive) | 4 | 6 | 10 |
| **A2-FE (Web UI)** — Form Step 1, frontend | ✅ **DONE** — [PR #5780](https://github.com/dicoding-dev/dicoding/pull/5780), branch `feature/pijak/registration-eligibility-frontend` (stacked di atas A2) | **Deviasi dari konvensi PR1/PR2 di atas** — blade+JS dipisah jadi PR tersendiri (bukan digabung ke A2) karena kalau digabung totalnya >20 file dalam 1 PR. Blade di-clone dari `pijak-flash/registration/(sections/registration-form/)*.blade.php` lalu diedit field-nya per brief, `registration-form.js`+`form-validator.js` (live show/hide field 13-20 berdasar eligibility, validasi Validator.js termasuk "Lainnya" free-text), `style.scss` sendiri (bukan lagi share punya IBM) | 1 | 13 | 14 |

**Update**: `registration-modals.js`-equivalent (modal konfirmasi sebelum submit) **sudah dibangun** — ditambahkan ke PR #5780 (2 commit tambahan: `feat(pijak): add confirmation modal before registration submit` + bundle rebuild), clone dari pola `pijak-flash/registration-modals.js` (preview live dari `FormData`, bukan dari `getRegistrationSummary()` server-side).

**Update kedua**: `getRegistrationSummary()` + `hasRegistered()` (dan seluruh halaman preview pasca-registrasi) **sudah dibangun**, tapi bukan di PR ini — jadi PR tersendiri (**A3**, lihat baris baru di §12) di-stack **sebelum** B1/B2, bukan sesudah B2 seperti rencana awal (lihat catatan di baris B2 dan bagian "Strategi Branch" untuk alasannya).
| **A3 (Domain+Infra+Web)** — Halaman preview pasca-registrasi + trigger Surat Komitmen | ✅ **DONE** — [PR #5793](https://github.com/dicoding-dev/dicoding/pull/5793), branch `feature/pijak/registration-preview` (stacked di atas A2-FE, **bukan** setelah B2 seperti rencana awal — lihat "Strategi Branch") | `PijakViewModel::hasRegistered()`/`isIntensiveParticipant()`/`getCommitmentLetter()`/`getCommitmentLetterProgress()`/`getReferralUrl()`/`getTwibbonLink()`/`getRegistrationSummary()`; `registration/index.blade.php` sekarang branch di `hasRegistered()` (form vs preview), `sections/registration-form/index.blade.php` (email terdaftar, "Unduh Surat Komitmen" khusus Intensif, "Lihat formulir" summary modal, "Ke langkah berikutnya", referral/twibbon) — pola disalin persis dari legacy IBM (`ibm/registration/sections/registration-form/index.blade.php`), bukan dari PijakFlash (PijakFlash tidak punya letter box). **Surat Komitmen**: `PijakCommitmentScholarshipLetter` provider baru (bukan reuse `IBMSkillsBuildCommitmentScholarshipLetter` — field itu butuh `universityName`/`studentIdentifier` yang tidak pernah dikumpulkan Pijak 2027), `LetterType::PIJAK_COMMITMENT`, `PijakRegistrationListener` (trigger di event `DeveloperWasRegisteredToPijak`, gated kategori Intensif). **Twibbon**: `PijakTwibbonSpecification`+`PijakTwibbonStoreAction`+route, plus `ScholarshipParticipantGateway::updateOtherRequirements()` baru (generic, mirror `updateEducationInfo`). ~~`institution` di surat sengaja `'-'` — dikonfirmasi user, tidak ada field "Instansi" di form Pijak 2027, tidak perlu ditambahkan.~~ **SUPERSEDED, lihat §14** — field Instansi ternyata perlu ditambahkan ke form. | 10 | 8 | 18 |
| **B1 (Domain)** — Step-model bercabang | ✅ **DONE** — [PR #5790](https://github.com/dicoding-dev/dicoding/pull/5790), branch `feature/pijak/registration-step-model` (base di-retarget ke A3 saat restacking, lihat "Strategi Branch") | `InitialRegistrationStep`/`AdministrativeRequirementStep`/`AnnouncementStep` (extend `RegistrationStep`) + `PijakRegistrationStepStatus` (composing VO, locking cascade) + **unit test** (9 test). `AnnouncementStep` gabungkan offering+cohort+pengumuman akhir jadi 1 `SubStepStatus` field — pola persis Asah/CodingCamp (`isInEnums(DONE, OFFERING_ACCEPTED, OFFERING_REJECTED, OFFERING_EXPIRED)`), bukan 3 field terpisah (percobaan awal yang over-engineer, sudah dikoreksi). `AdministrativeRequirementStep` sengaja gabungkan 1a/1b/2a/2b jadi 1 class (beda dari IBM/CodingCamp yang pisah Administration vs Upload Document jadi 2 step) — karena brief eksplisit taruh keempatnya di 1 halaman "Syarat Administrasi" yang bisa diisi bebas urutan, bukan wizard 2 tahap. | 0 | 4 | 4 |
| **B2 (Infra+Web+Spec)** — Step-model wiring untuk Syarat Administrasi (1a/1b) | 🟡 Kode sudah ada, **belum di-commit** (conflict hasil restacking baru saja diresolve manual di working tree, branch `feature/pijak/registration-step-model-infra`) — belum ada PR | **Tidak perlu Repository/Gateway interface baru** — dicek Elevate (`ElevateRegistrationViewModel::getStepStatus()`) dan `PijakParticipantRegistrationRepository` A1: keduanya bangun VO step-status langsung di ViewModel dari Gateway, bukan lewat interface `{Campaign}RegistrationRepository` (pola itu cuma dipakai IBM/CodingCamp/Asah, lebih lama/legacy). **Scope dipersempit** (keputusan lanjutan): 2 method baru di `PijakGateway` (baca status 1a email akun IBM, 1b radio course completion — 2a/2b tetap placeholder), `PijakViewModel::getStepStatus()` + `getRegistrationSteps()` expand jadi 3 step, Action+route+blade baru untuk halaman Syarat Administrasi (1a+1b saja) + **integration test**. Trigger generate Surat Komitmen **ternyata tidak menunggu B2** — sudah dikerjakan lebih dulu di A3 karena cuma bergantung ke event Step 1 (`DeveloperWasRegisteredToPijak`), bukan ke step-model B1/B2 sama sekali (lihat "Strategi Branch"). | 3 | 1 | 4 |
| **C1 (Domain)** — Granular 8-course tracking | ⬜ Belum dikerjakan | Perluasan `PijakFlashIBMClassesSelection` (bukan aggregate baru) + **unit test** | 1 | 1 | 2 |
| **C2 (Infra+Web+Spec)** — Granular 8-course tracking | ⬜ Belum dikerjakan | `...StoreAction`, `...IndexAction`, `...Specification`, `ibm-classes.blade.php` + **integration test** | 4 | 1 | 5 |
| **D** — Email templates | ✅ **DONE** (dikonfirmasi user 2026-09-21 — email terkirim setelah submit Step 1) | Konten/copy, bukan logic, tidak ada domain/infra split relevan — tetap 1 PR. **Beda concern dari A3**: A3 cuma generate *Surat Komitmen* (PDF/letter), bukan kirim *email* konfirmasi registrasi. | 2 | 3 | 5 |

**Temuan D (riwayat)**: sempat dikira email sama sekali tidak terkirim setelah submit Step 1 — analisis awal (di bawah ini, dipertahankan sebagai riwayat) menduga `EventMailerHandler::handleEvent()` "menelan" event `DeveloperWasRegisteredToPijak` tanpa error karena mailer class/method-nya belum ada. **Klaim ini keliru** — diverifikasi empiris via Chrome DevTools + Mailcatcher pada sesi sebelumnya: `DeveloperWasRegisteredToPijakMailer` **sudah ada dan sudah jalan** lewat convention-based resolution yang sama. Dikonfirmasi ulang oleh user (2026-09-21): email setelah submit Step 1 **sudah beres**, tidak perlu pekerjaan tambahan untuk item D.

<details>
<summary>Analisis awal (sudah tidak akurat, disimpan untuk riwayat)</summary>

`Dicoding\Domain\Scholarships\Pijak\Events\DeveloperWasRegisteredToPijak` sudah otomatis tertangkap wildcard listener `Event::listen('Dicoding.Domain.Scholarships.*', ScholarshipEventMailer::class)` (`Dicoding/Infrastructure/Emailing/EventMailerServiceProvider.php:59`), tapi `EventMailerHandler::handleEvent()` (parent `ScholarshipEventMailer`) cuma benar-benar kirim email kalau salah satu ada: (1) class `Dicoding\Infrastructure\Emailing\Scholarship\DeveloperWasRegisteredToPijakMailer`, atau (2) method `ScholarshipEventMailer::whenDeveloperWasRegisteredToPijak()`. Sempat dikira keduanya belum ada — ternyata mailer class-nya sudah ada duluan.

</details>
| **Total** (9 PR — A2 pecah jadi 2, + A3 baru untuk preview page) | | | 27 | 43 | **70** |

**Rencana PR berdiri sendiri untuk wave dedup + config Offering/Cohort (sempat disebut "PR A" di revisi sebelumnya) tetap dibubarkan** — isinya (guard dedup, config `program_id`) cuma berarti kalau ada Specification yang benar-benar mendaftarkan user pakai `program_id` itu, dan itu adanya di A2. Digabung ke A1/A2 supaya tidak ada kode menggantung tanpa pemanggil.

### Di mana cek wave dedup ini sebenarnya hidup

**Koreksi kedua atas rencana awal**: bukan cuma soal layer pemanggilan (Action vs Specification/domain service) — ternyata tidak perlu ada class checker/guard terpisah sama sekali. Ditemukan preseden **Elevate** yang sudah menghadapi persis masalah multi-wave ini:

- VO shared `CampaignRegistrant` (`Dicoding/Domain/Scholarships/ValueObjects/CampaignRegistrant.php`) **sudah punya** field `registered_in_other_wave` + getter `isRegisteredInOtherWave()` — dipakai apa adanya, tidak diubah sama sekali.
- `ElevateParticipantRegistrationRepository::create()` mengisi field itu dari `ElevateGateway::isRegisteredInExcludedPrograms($userId)` — 1 query `EXISTS (... WHERE program_id IN (...))`.
- `ElevateParticipantRegistration::validatePreConditions()` cukup `if ($this->registrant->isRegisteredInOtherWave()) throw ...` — 1 baris, di dalam aggregate itu sendiri.

Pola yang sama sudah diterapkan ke `PijakParticipantRegistration` (aggregate baru, A1): precondition `registered_in_other_wave` sudah ada di method `validatePreConditions()`, tinggal Repository (A2, Infra) yang perlu isi field itu lewat gateway method serupa `isRegisteredInExcludedPrograms()`. Tidak ada "guard" atau "checker" Infrastructure Service terpisah yang perlu dibangun — pelajaran: **cek dulu preseden campaign lain yang paling mirip (multi-wave), bukan cuma preseden konseptual yang mirip (promo eligibility)**.

### Catatan soal card Basecamp (board Campaigns)

Ada 5 card Pijak di board **Campaigns** (kolom Exploring/Planning), 1 card per tahap user journey (visit form → filling form → syarat administrasi → offering → pengumuman). **Card-card ini murni untuk pencatatan/tracking PM**, bukan penentu batas teknis PR — satu card bisa mencakup beberapa PR sekaligus (sesuai konvensi `bc-cards`: "One story = one card", PR-PR-nya didaftar di bagian **Pull Requests** pada deskripsi card, bukan dipecah jadi card domain vs infra terpisah). Urutan & pengelompokan teknis tetap mengikuti tabel PR di atas (domain dulu), bukan urutan card.

### Strategi Branch: Stacked atau Tidak

**Perlu stacked branch untuk seluruh rantai A1→A2→B1→B2→C1→C2, kecuali D (berdiri sendiri).** Alasan per pasangan/silang-slice:

- **Dependency kode nyata antar-pasangan, bukan cuma soal urutan kerja**: A2 memanggil class-class yang baru dibuat di A1 (`PijakParticipantRegistration` aggregate, `PijakRegistrationData` VO) — tanpa A1 lebih dulu ada di tree, A2 tidak bisa dikompilasi/direview sebagai unit yang utuh. Sama untuk B1→B2 (Action/ViewModel butuh step-status VO baru) dan C1→C2 (Action/Specification butuh perluasan aggregate).
- **Overlap file lintas-slice yang berisiko konflik**: A2 dan B2 sama-sama menyentuh `PijakFlashRegistrationIndexAction.php`/`PijakFlashViewModel.php` (A2 wiring Specification form Step 1, B2 wiring step-status baru). Kalau B2 dibangun dari `master` secara paralel sebelum A2 merge, risiko merge conflict di file yang sama itu nyata. C2 juga bergantung tahu step-status dari B1 sudah ada supaya tahu kapan sub-item 8-course "unlock".
- **Urutan branch aktual** (sudah dieksekusi, bukan lagi rencana): `feature/pijak/registration-eligibility` (A1) → `-infra` (A2) → `-frontend` (A2-FE, PR #5780) → **`feature/pijak/registration-preview` (A3, PR #5793)** → `feature/pijak/registration-step-model` (B1, PR #5790) → `feature/pijak/registration-step-model-infra` (B2, belum di-PR) → (rencana: C1 off B2 → C2 off C1). Tiap branch di-PR dengan base ke branch sebelumnya (bukan `master`), dan base-nya otomatis pindah ke `master` begitu branch sebelumnya di-merge (perilaku standar GitHub untuk PR berantai).
- **Deviasi dari rencana awal — A3 disisipkan setelah A2-FE, bukan setelah B2**: rencana §12 semula menaruh trigger Surat Komitmen sebagai "PR tersendiri setelah B2" (lihat baris B2), dengan asumsi implisit bahwa halaman preview pasca-registrasi butuh step-model (B1/B2) dulu. Ternyata **tidak** — `hasRegistered()`, `getReferralUrl()`, `getTwibbonLink()`, dan trigger `PijakRegistrationListener` semuanya cuma bergantung ke A2 (`PijakGateway::hasParticipantRegistered()`, event `DeveloperWasRegisteredToPijak`), sama sekali tidak menyentuh `PijakRegistrationStepStatus`/`AdministrativeRequirementStep` dari B1. Menaruhnya tepat setelah A2-FE (bukan menunggu B2 selesai) berarti tidak ada dependency palsu yang menahan pekerjaan ini — sesuai prinsip pengelompokan PR di atas ("jangan bangun sesuatu yang menggantung tanpa consumer nyata", tapi juga sebaliknya: jangan tunda sesuatu yang consumer-nya sudah ada duluan).
- **Konsekuensi nyata dari penyisipan A3 di tengah rantai — B1 & B2 perlu di-rebase ulang**: karena B1/B2 sudah lebih dulu dibangun (stacked langsung di atas A2-FE) sebelum keputusan menyisipkan A3 diambil, kedua branch itu perlu di-rebase pindah pondasi (`git rebase --onto feature/pijak/registration-preview <old-base> feature/pijak/registration-step-model`, lalu `step-model-infra` menyusul di atas `step-model` yang baru). Base PR #5790 diupdate ke `feature/pijak/registration-preview` lewat `gh api repos/.../pulls/5790 -X PATCH -f base=...` (`gh pr edit --base` gagal karena bug GraphQL `gh` CLI yang query field `projectCards` dari Projects-classic yang sudah deprecated — workaround-nya langsung lewat REST API, bukan lewat `gh pr edit`).
- **D tidak perlu ikut rantai ini** — tidak menyentuh file manapun di A/B/C (murni template email + mailer existing), jadi cukup branch langsung dari `master`, kapan saja, tidak perlu menunggu PR lain selesai.
- **Konsekuensi stacking**: kalau ada review feedback yang mengubah A1 (misal), semua branch di bawahnya perlu di-rebase. Ini trade-off yang wajar untuk kerjaan solo (bukan banyak engineer paralel) — lebih baik daripada menunggu tiap PR di-approve+merge dulu baru mulai yang berikutnya, karena review turnaround bisa lama sementara dependency-nya nyata secara kode, bukan cuma preferensi urutan. **Bukti konkret dari sesi ini**: menyisipkan A3 di tengah rantai B1/B2 yang sudah ada memang butuh 1 kali rebase manual (lihat "Temuan Teknis" di bawah untuk bug yang muncul selama proses itu) — tapi ini jauh lebih murah daripada menunggu B1/B2 di-review+merge dulu sebelum mulai A3.

### Temuan Teknis Saat Restacking (sesi ini)

Ditemukan **2 bug nyata** saat menggabungkan A3 (baru) dengan B1/B2 (sudah ada duluan) lewat rebase — keduanya murni akibat 2 branch independen menambahkan hal berbeda ke file yang sama, bukan kesalahan logika dari awal:

1. **Duplikasi method `PijakGateway::getCategory()`** — A3 menambahkan `getCategory(int $userId): ?string` (baca kategori lewat `ScholarshipParticipantGateway::getParticipantCategoryOnProgram()`), sedangkan B1 (dibuat lebih dulu, terpisah) juga menambahkan `getCategory()` versi stub (`TODO`, langsung `return PROGRESSIVE`). Karena kedua penambahan itu berada di baris file yang tidak overlap, `git rebase` **tidak** mendeteksinya sebagai conflict tekstual — hasilnya class dengan 2 method bernama sama (fatal error "cannot redeclare"). Baru ketauan saat re-run unit test setelah rebase. **Fix**: interactive rebase (`git rebase -i`, tandai commit B1 yang menambahkan stub itu jadi `edit`), hapus versi stub, biarkan versi real dari A3 yang menang — lalu commit itu di-amend, bukan nambah commit "fix" terpisah di atasnya (supaya histori tetap bersih, commit B1 tidak pernah benar-benar rusak di histori final).
2. **`other_requirements` di-`json_decode()` dua kali** — `ScholarshipParticipantGateway::getParticipantOnProgram()` **sudah** men-decode kolom `other_requirements` (dari `TEXT` JSON) jadi `stdClass` sebelum dikembalikan. Kode baru di `PijakViewModel` (`getTwibbonLink()`, `getRegistrationSummary()`) sempat menulis `json_decode($participant->other_requirements ?? '', true)` — memanggil `json_decode()` lagi ke sesuatu yang **bukan string** (sudah jadi object). Ketahuan saat meninjau ulang kode setelah conflict resolution (bukan dari test yang gagal — test belum sempat menyentuh path ini). **Fix**: `(array) ($participant->other_requirements ?? [])`, cast langsung tanpa decode ulang.

Pelajaran untuk slice berikutnya (B2, C1, C2): kalau 2 branch yang independen sama-sama menyentuh `PijakGateway`/`PijakViewModel`, **selalu re-run unit test setelah rebase**, jangan asumsikan "rebase sukses tanpa conflict" berarti behaviornya juga otomatis benar — git cuma menjamin tidak ada tumpang tindih baris, bukan tidak ada tumpang tindih makna (nama method, kontrak data).

### Strategi Route File: `pijak_2027.php` sementara, cutover di akhir

**Masalah**: route production `/pijak/*` saat ini dilayani `app/routes/pijak_flash.php` (aktif), sedangkan `app/routes/pijak.php` sudah ada tapi mati (`require`-nya di-comment di `app/routes.php` baris 12) — isinya rute jalur Intensif/ILT lama (`/registration/administration`, `/registration/upload-documents`, `/registration/cohort`, `/offering`) yang menunjuk ke Action IBM legacy. Kedua file itu **sama-sama pakai prefix `pijak` dan nama route yang sama** (`pijak.registration.store` dst) — tidak bisa aktif bersamaan, Laravel akan bentrok nama route.

Karena Pijak 2027 menyatukan track Intensif + Progresif dalam satu form (§1), rute yang dibutuhkan akhirnya adalah **gabungan** dari isi kedua file itu (administration/upload-documents/cohort/offering dari `pijak.php` + granular `ibm-classes` selection dari `pijak_flash.php`) plus rute baru untuk Step 1 form. Mengedit `pijak_flash.php` langsung selama A1-D berarti production `/pijak/*` ikut berubah tiap PR merge — berisiko ke user yang masih pakai PijakFlash saat ini.

**Keputusan**: buat file baru `app/routes/pijak_2027.php`, di-`require` langsung (tanpa guard environment) di `app/routes.php` sejak **A2**. Supaya tidak bentrok nama route dengan `pijak_flash.php` yang masih live, selama pengerjaan A1-D file ini pakai:

- **Prefix sementara**: `pijak2027` (bukan `pijak`) — jadi route-nya `/pijak2027/registration`, dst.
- **Nama route sementara**: `pijak2027.registration.store`, `pijak2027.registration.index`, dst (bukan `pijak.*`).

Ini artinya bisa langsung dites lewat integration test & browser dari A2 dan seterusnya tanpa menyentuh sama sekali behavior `/pijak/*` yang sedang dipakai user PijakFlash. Isi file berkembang bertahap mengikuti slice yang jalan: A2 isi rute Step 1 registration, B2 isi rute step-model tambahan (kalau ada endpoint baru), C2 isi rute `ibm-classes` (porting dari pola `pijak_flash.php`).

**Cutover (setelah D selesai, PR/step terpisah, di luar hitungan 7 PR di atas)**:

1. Rename `app/routes/pijak.php` → `app/routes/old_pijak.php` (arsip rute IBM legacy, sudah mati, tidak perlu dihapus — masih berguna sebagai referensi historis).
2. Rename `app/routes/pijak_2027.php` → `app/routes/pijak.php`, ganti prefix `pijak2027` → `pijak` dan semua nama route `pijak2027.*` → `pijak.*`.
3. Di `app/routes.php`: cabut/comment `require` ke `pijak_flash.php`, ganti requirenya ke `pijak.php` yang baru (persis pola `pijak.php` yang di-comment hari ini, tapi terbalik).
4. **Belum diputuskan**: nasib `app/routes/pijak_flash.php` itu sendiri saat cutover — apakah ikut di-arsip (`old_pijak_flash.php`) atau dihapus total, karena isinya sudah sepenuhnya digantikan `pijak_2027.php`/`pijak.php` baru. Ditandai sebagai keputusan yang perlu diambil pas cutover, bukan blocker A2 sekarang.

**Risiko utama pendekatan ini**: blade/link/email yang hardcode `route('pijak.registration...')` tidak otomatis mengikuti — karena selama dev nama route baru adalah `pijak2027.*`, bukan `pijak.*`. Semua blade section & Action baru yang dibuat A2-D harus konsisten pakai `pijak2027.*` dari awal, supaya rename massal di step cutover cukup 1 kali cari-ganti string, bukan nyari satu-satu.

---

## 13. Revisi Domain Model — 3 Kategori Eligibility + Storage Flow (pasca A1-B2)

> Hasil brainstorming lanjutan setelah A1-A3/B1 di-merge dan B2 sedang jalan (branch `feature/pijak/registration-step-model-infra`). Ini **mengganti** logic eligibility & storage flow yang sudah diimplementasikan di A1 (`PijakParticipantRegistration::determineEligibilityStatus()`) dan A2 (`PijakGateway::saveRegistration()`) — bukan penambahan, tapi revisi. Konsekuensinya dijabarkan di §13.5.

### 13.1 Kriteria eligibility — decision tree biner, ganti dari AND-gabungan

Kriteria lama di kode (A1): 1 kondisi gabungan (umur 18-34 AND tidak studi AND WNI AND domisili Indonesia) → hasilnya cuma INTENSIVE vs PROGRESSIVE (PROGRESSIVE = default fallback, tanpa cek `education_level` sama sekali).

Kriteria baru — split dulu dari `is_currently_studying`, baru cabang kedua beda tergantung cabang:

```
is_currently_studying?
├─ FALSE (tidak sekolah/kuliah)
│   └─ WNI + domisili Indonesia + umur 18–34 (per age_reference_date)?
│         → SEMUA terpenuhi → INTENSIVE
│         → salah satu gagal (termasuk umur ≤17 atau ≥35) → NOT_ELIGIBLE
└─ TRUE (sekolah/kuliah)
    └─ education_level ∈ {SMK, D1, D2, D3, D4} (NewEducationLevel)?
          → YA → PROGRESSIVE
          → TIDAK (SD/SMP/MA/SMA/S1/NON_COLLEGE/GAP_YEAR/GRADUATED/dst) → NOT_ELIGIBLE
```

**Catatan umur**: dikonfirmasi tetap **18-34** (bukan 17-34 seperti sempat disebut di awal brainstorm) — umur di bawah 18 (≤17) jatuh ke NOT_ELIGIBLE lewat kondisi gagal "umur 18-34", bukan lewat pelebaran range. Tidak ada perubahan dari kode A1 di titik ini.

**Catatan Progressive**: beda fundamental dari A1 — sekarang PROGRESSIVE **bukan** default fallback tapi hasil pengecekan eksplisit ke `education_level` (mirror field VS/Vokasi di brief §4 baris "Jalur Siswa/Mahasiswa Vokasi"). Peserta yang tidak studi tapi gagal kriteria Intensif (misal WNI tapi umur 35) **tidak otomatis** PROGRESSIVE lagi — langsung NOT_ELIGIBLE.

**Implementasi `determineEligibilityStatus()` — NOT_ELIGIBLE ditulis sebagai fallback, bukan kondisi eksplisit**: biar robust terhadap kombinasi yang belum kepikiran (mis. nilai `education_level` baru di masa depan), cek 2 kondisi eligible dulu (INTENSIVE lalu PROGRESSIVE), sisanya otomatis NOT_ELIGIBLE — bukan menuliskan syarat gagal secara eksplisit:

```php
if ($isIntensiveEligible) {
    return PijakParticipantCategory::INTENSIVE;
}

if ($isProgressiveEligible) {
    return PijakParticipantCategory::PROGRESSIVE;
}

return PijakParticipantCategory::NOT_ELIGIBLE; // fallback — semua yang gak lolos 2 kondisi di atas
```

Dengan `$isIntensiveEligible = !is_currently_studying && is_indonesian_citizen && current_country==='Indonesia' && umur 18-34` dan `$isProgressiveEligible = is_currently_studying && education_level ∈ {SMK, D1, D2, D3, D4}`.

Kalau dijabarkan, participant jatuh ke NOT_ELIGIBLE kalau:

| `is_currently_studying` | Kenapa NOT_ELIGIBLE |
|---|---|
| `false` (tidak sekolah/kuliah) | bukan WNI, **atau** domisili bukan Indonesia, **atau** umur ≤17, **atau** umur ≥35 |
| `true` (sekolah/kuliah) | `education_level` di luar {SMK, D1, D2, D3, D4} — yaitu SD, SMP, MA, SMA, S1, NON_COLLEGE (S2/S3/dst), GAP_YEAR, GRADUATED |

### 13.2 Kategori baru: `NOT_ELIGIBLE` (bukan `INELIGIBLE`)

`PijakParticipantCategory` perlu tambah case ketiga. Penamaan disamakan dengan preseden `AsahParticipantCategory::NOT_ELIGIBLE` (`Dicoding/Domain/Scholarships/Asah/Enums/AsahParticipantCategory.php`) — bukan `INELIGIBLE`:

```php
enum PijakParticipantCategory: string
{
    case INTENSIVE = 'intensive';
    case PROGRESSIVE = 'progressive';
    case NOT_ELIGIBLE = 'not_eligible';
}
```

### 13.3 Storage flow — row LANGSUNG ada di `scholarship_participants` untuk INTENSIVE & PROGRESSIVE (adopsi pola legacy, bukan nahan di `campaign_initial_registrations`)

**Keputusan (locked)**: setelah audit `ScholarshipOfferingGateway` (`Dicoding/Infrastructure/StorageGateways/Scholarships/Offerings/ScholarshipOfferingGateway.php`), ditemukan **seluruh domain Offering** (dipakai lintas program — Asah, Bangkit, Tempa, IBM, bukan cuma Pijak) hard-depend ke row `scholarship_participants` sudah ada duluan:
- `getCandidatesByProgramId()` (dipakai admin screening waktu bikin offering) — `LEFT JOIN scholarship_participants`, kalau belum ada row → `is_participant=0` → `ScholarshipOfferingCreation::screeningCandidate()` reject kandidat ("Tidak terdaftar pada pendaftaran ulang.").
- `getOfferingByUserIdAndProgramId()` (dipakai nampilin offering ke peserta sendiri) — **INNER JOIN** ke `scholarship_participants`, return null kalau row belum ada.

Rencana awal (Intensive ditahan di `campaign_initial_registrations` sampai accept) akan butuh rewrite domain Offering yang shared ini — risiko besar, blast radius ke semua program lain. **Diputuskan: tidak jadi**, adopsi pola legacy `PijakUpdateFinalSelectionResultCommand` sebagai gantinya — row `scholarship_participants` **langsung dibuat saat submit form**, baik untuk INTENSIVE maupun PROGRESSIVE:

| Kategori | Ke mana | Kapan |
|---|---|---|
| NOT_ELIGIBLE | **cuma** `campaign_initial_registrations` | saat submit, tidak pernah dipromosikan ke `scholarship_participants` |
| PROGRESSIVE | `scholarship_participants` (`category=progressive`) | langsung saat submit |
| INTENSIVE | `scholarship_participants` (`category=intensive`) | **langsung saat submit juga** — bukan ditahan sampai offering accept |

Status "beneran Intensif vs jatuh ke Progresif" direpresentasikan lewat `offering_status`/`cohort_id` di tabel `scholarship_offerings`/`scholarship_cohorts` (persis pola legacy `PijakUpdateFinalSelectionResultCommand::getListOfProgressiveParticipants()`), bukan lewat ada/tidaknya row di `scholarship_participants`.

**Konsekuensi ke registrasi form**: berarti kembali butuh dua tujuan tabel dari 1 form submit — NOT_ELIGIBLE ke `CampaignInitialRegistration`/`campaign_initial_registrations` (pola yang sama dengan PijakFlash/Asah tier 1), sedangkan INTENSIVE/PROGRESSIVE **juga** menyentuh `campaign_initial_registrations` (lihat §13.6 — bukan cuma NOT_ELIGIBLE lagi) **plus** `scholarship_participants` (pola A1 yang sudah ada, cukup diperluas). Bukan pure one-shot maupun pure two-tier seperti dikategorikan di §11.9 — kombinasi tergantung hasil kategori.

### 13.6 Autosave/autoresume Step 1 — revive item Extramiles §10 poin 5, sekarang masuk scope

**Konteks**: §10 poin 5 sebelumnya menandai autosave/draft persistence sebagai **Extramiles** (out of scope Wave 1) — alasannya waktu itu, retrofit ke layer `CampaignInitialRegistration` dianggap kerjaan berdiri sendiri yang belum sepadan. **Status berubah**: karena §13.3 di atas sudah memutuskan NOT_ELIGIBLE tetap lewat `CampaignInitialRegistration`, infra itu **sudah pasti dibangun** terlepas dari autosave — jadi biaya marginal buat sekalian pakai layer yang sama buat autosave semua kategori jadi jauh lebih kecil. **Diputuskan: masuk scope, bukan Extramiles lagi.**

**Temuan penting — nggak perlu VO baru**: `CampaignInitialRegistrationSpecification` (`Dicoding/UseCases/Campaigns/CampaignInitialRegistrationSpecification.php`) itu **use case generic**, bukan spesifik PijakFlash — dipakai bareng `DefaultInitialRegistrationForm` (`Dicoding/Domain/Campaigns/Commons/ValueObjects/DefaultInitialRegistrationForm.php`) yang cuma pass-through array `form_data` tanpa validasi apapun (`validateFormAfterCompleted()`/`validatePackage()` no-op). PijakFlash autosave-nya (`StoreInitialPijakRegistrationFormAction` + `frontend/src/pages/campaigns/pijak-flash/registration-form.js:410-440`, `debounce()` di event `input`) pakai mekanisme generic ini, cuma beda di `PijakFlashInitialRegistrationForm` (VO custom PijakFlash yang nge-strict-validate saat `is_complete=true`). **Untuk Pijak 2027, cukup reuse `DefaultInitialRegistrationForm` apa adanya** — validasi ketat tetap dilakukan terpisah oleh `PijakRegistrationData`/aggregate `PijakParticipantRegistration` di endpoint submit final, bukan di layer draft.

**Alur (locked)**:
1. **Tiap keystroke** di form Step 1 → debounced XHR POST ke endpoint draft baru → `CampaignInitialRegistrationSpecification` (`is_complete=false`) → upsert row `campaign_initial_registrations`.
2. **Reload/resume** → prefill form dari `CampaignInitialRegistrationRepository::getExistingFormData()` (method generic, sudah ada).
3. **Klik Submit final** → tetap lewat `PijakRegistrationStoreAction`/`PijakRegistrationSpecification` (validasi ketat + kategorisasi, tidak berubah dari A1/A2) → `PijakParticipantRegistrationRepository::save()` direvisi:
   - **Selalu** tandai row `campaign_initial_registrations` jadi complete (universal, semua kategori — bukan cuma NOT_ELIGIBLE seperti draft awal §13.3).
   - **Tambahan** kondisional: kalau INTENSIVE/PROGRESSIVE, tetap juga insert ke `scholarship_participants` via `PijakGateway::saveRegistration()` (tidak berubah).

**Keputusan desain**: sengaja **tidak** nyontek persis pola PijakFlash yang 1 endpoint dipakai dobel (autosave dan submit final sama-sama `/pijak/registration`, dibedakan flag `is_registration_step_done`) — karena submit final Pijak 2027 butuh validasi ketat `PijakRegistrationData` (beda rules dari array generik draft). Dipisah jadi 2 endpoint: 1 ringan buat draft (generic, toleran data belum lengkap), 1 endpoint existing buat submit final (ketat).

**File yang terdampak** (tambahan di luar §13.5):
- **ADD** `Dicoding/Web/Http/Scholarships/Pijak/PijakRegistrationDraftStoreAction.php` (nama tentatif) — endpoint autosave, mirror `StoreInitialPijakRegistrationFormAction`, panggil `CampaignInitialRegistrationSpecification` langsung.
- **MODIFY** `PijakParticipantRegistrationRepository::save()` — selalu tandai `campaign_initial_registrations` complete + kondisional `scholarship_participants`.
- **MODIFY** `PijakRegistrationIndexAction`/`PijakViewModel` — tambah method ambil draft existing buat prefill form.
- **MODIFY** `app/routes/pijak_2027.php` — 1 route baru buat draft endpoint.
- **MODIFY** blade Step 1 + `registration-form.js` (punya Pijak 2027, bukan PijakFlash) — tambah debounce+fetch (clone logic dari `pijak-flash/registration-form.js`), prefill value dari data existing.
- **MODIFY/ADD** integration test — draft tersimpan partial, reload dapet data balik, submit final tetap benar kategorisasinya + `campaign_initial_registrations` ke-mark complete.

### 13.4 Fallback Intensif → Progresif saat offering ditolak/tidak diambil — LOCKED (semua poin sudah diputuskan)

**Trigger mekanisme — batch manual, bukan event-driven.** Dikonfirmasi lewat brief sendiri (section "Kelas untuk Eligible (Intensif)" dan "Kelas untuk Eligible (Progresif)"): keduanya eksplisit bilang **"Akan auto enroll mandiri by tim Cohort"** — enrollment/redeem token bukan realtime otomatis di sistem saat user klik Tolak, tapi proses **bulk yang dijalankan sendiri oleh tim Cohort** kapan mereka mau. Ini juga konsisten dengan field "Deadline token: **30 hari setelah bulk auto enroll**" — deadline-nya relatif ke kapan proses bulk itu dijalankan, bukan ke tanggal submit/reject individual. Jadi **tidak perlu listener event-driven** di `ScholarshipOfferingStatusWasUpdated` — cukup reuse pola command batch yang sudah ada (`PijakUpdateFinalSelectionResultCommand`/`scholarships:pijak:update-final-selection-result`), yang otomatis juga menutup kasus "offering expired tanpa direspon" (didiemin sampai due_date lewat) karena command itu scan semua kandidat sekaligus, tidak bergantung ke 1 event tunggal.

Config token buat proses bulk auto-enroll Progresif (dari brief, section "Kelas untuk Eligible (Progresif)"):
- **4 course**: AI Praktis untuk Produktivitas (`/academies/862`), Belajar Penggunaan Generative AI (`/academies/867`), Prompt Engineering untuk Software Developer (`/academies/753`), Belajar Dasar Pemrograman Web (`/academies/123`) — course id ini identik dengan yang sudah dipakai `campaigns.php['pijak_flash']` (lihat §2, baris "Course Progresif"), reuse penuh.
- Token owner: `pijak@dicoding.com`; deskripsi: "Pijak 2027 in collaboration with IBM SkillsBuild Progressive"; deadline: **30 hari setelah bulk auto enroll** (relatif, bukan tanggal tetap).

**Kandidat yang tidak pernah di-offer sama sekali — diperlakukan SAMA seperti reject, tanpa syarat tambahan** (rekomendasi sebelumnya dikonfirmasi user). Alasan: sudah tervalidasi Intensif secara eligibility saat submit form, jadi tidak perlu syarat ekstra tambahan (beda dari legacy yang masih cek completion 3 course IBM lewat Google Sheets — itu spesifik kebutuhan lama, tidak diadopsi). Jadi kandidat masuk kelompok "eligible untuk bulk auto-enroll Progresif" kalau **salah satu** dari: (a) offering ditolak eksplisit, (b) offering expired tanpa respon, (c) tidak pernah di-offer sama sekali — ketiganya sama, tidak dibedakan treatment-nya.

### 13.5 Dampak ke kode yang sudah di-PR (A1-A3, B1, B2 sedang jalan)

- **`PijakParticipantCategory`** (A1, PR #5769): tambah case `NOT_ELIGIBLE`.
- **`PijakParticipantRegistration::determineEligibilityStatus()`** (A1): rewrite total ganti jadi decision tree §13.1 (skip WNI/domisili buat cabang studi, tambah cek `education_level`).
- **`PijakParticipantRegistration::register()`**: buat NOT_ELIGIBLE, alur registrasi butuh cabang ke `CampaignInitialRegistration` bukan langsung `saveRegistration()` — kemungkinan aggregate ini pecah jadi 2 langkah atau `PijakRegistrationSpecification` (UseCase layer) yang decide tujuan tabel berdasar hasil kategori dari aggregate.
- **`PijakGateway::saveRegistration()`** (A2, PR #5779): tetap dipakai apa adanya untuk INTENSIVE/PROGRESSIVE (tidak jadi diganti nahan-di-initial-registrations seperti rencana sebelumnya) — cuma perlu wiring baru buat NOT_ELIGIBLE ke `CampaignInitialRegistrationRepository`.
- **`ScholarshipOfferingGateway`/`ScholarshipOfferingCreation`/offering domain lain**: **tidak perlu diubah sama sekali** — ini alasan utama keputusan §13.3, supaya blast radius ke program lain nol.
- **A3 (`PijakViewModel::getRegistrationSummary()`, dll, PR #5793)** dan **B1/B2 (step-model)**: perlu ditinjau ulang apakah masih valid untuk kandidat NOT_ELIGIBLE (kemungkinan besar step "Syarat Administrasi"/"Offering"/"Pengumuman" semuanya di-skip/hidden buat NOT_ELIGIBLE, karena mereka tidak pernah masuk `scholarship_participants` sama sekali).
- **C1/C2 (granular 8-course tracking)**: belum dikerjakan, desainnya tinggal ikut kategori baru ini, tidak ada dampak balik.

---

## 14. Field "Instansi" baru — koreksi keputusan A3 yang sudah ditandai CLOSED

**Konteks**: A3 (PR #5793) sempat mendokumentasikan `institution` di Surat Komitmen sengaja di-hardcode `'-'` karena "tidak ada field Instansi di form Pijak 2027, tidak perlu ditambahkan". Ternyata **keputusan itu salah** — dikoreksi lewat thread Basecamp (Krisna ↔ Wintari):

> Krisna: *"di template surat komitmen ada isian 'Instansi' tapi di form pendaftaran diatas tidak ada field untuk mengisi instansi mba, apakah isian di form komitmen dihapus, atau ada field tambahan ketika mengisi no 12?"*
> Wintari: *"Ohh jadinya nambahin field ketika isi no 12 ya"*
> Krisna: *"field nya berupa inputan text biasa ya bukan radio/dropdown? juga field ini opsional ya? kalau tidak diisi berati nanti di surat komitmen isinya adalah '-'"*
> Wintari: *"Betul, nanti paling minta di proper biar dia rapih ga capslock sama kalo ga diisi - aja yaa"*

**Keputusan (locked, direvisi)**:
- Field **Instansi** — text input bebas (bukan radio/dropdown), **opsional**.
- **Field name: `institution`** (bukan `job_institution`) — sengaja digeneralisasi, karena field ini konsekuensi dari Surat Komitmen (semua peserta Intensif dapat surat, terlepas status kerja/studi), bukan spesifik "instansi tempat kerja". Nama `job_institution` (preseden PijakFlash/Tempa) menyiratkan cuma buat yang bekerja — salah, direname supaya general.
- **Ditampilkan unconditional** — tidak digate ke `is_currently_studying` (beda dari keputusan awal yang menaruhnya bareng nomor 12/occupation_status). Muncul buat semua peserta terlepas pilihan "sedang menempuh pendidikan" atau tidak, karena mahasiswa pun bisa punya instansi (kampus/organisasi) yang relevan buat surat.
- Kalau kosong, Surat Komitmen tetap tampil `'-'` (perilaku default yang sudah ada, tidak berubah).
- **Proper-casing**: teks yang diinput user perlu dirapikan (bukan asal-caps) saat ditampilkan di surat — perlu di-title-case/proper-case saat render, bukan ditampilkan mentah dari input user.

**Status implementasi**:
1. ✅ **DONE** (branch `feature/pijak/registration-eligibility`, A1) — `PijakRegistrationData` (`Dicoding/Domain/Scholarships/Pijak/ValueObjects/PijakRegistrationData.php`): rule `'institution' => 'sometimes|string|max:255'` + getter `getInstitution()`, unit test (optional→null, captured saat diisi). Otomatis ikut ke-serialize ke `other_requirements` lewat `PijakGateway::saveRegistration()` (sudah `json_encode($data->toArray())`, tidak perlu ubah gateway).
2. ✅ **DONE** — `PijakCommitmentScholarshipLetter::validateParams()` (`Dicoding/Domain/Scholarships/Letters/Services/Providers/PijakCommitmentScholarshipLetter.php`) sudah baca `$otherRequirements->institution ?? '-'` (key baru, bukan `job_institution` lagi). Diverifikasi langsung ke kode 2026-09-21 — perubahan ini sudah ada sejak commit `35849f7fc70`, predates audit sebelumnya yang sempat menandainya "BELUM".
3. ✅ **DONE** (branch `feature/pijak/registration-eligibility-frontend`, A2-FE) — Blade form: text input Instansi ditambahkan ke `education.blade.php`, ditampilkan **unconditional** (di luar container `educationLevelContainer`/`occupationStatusContainer`, tidak di-hide/show berdasar `is_currently_studying`).

---

## 15. Revisi Kedua — Kategori Eligibility vs Penempatan Final, dan Scope Boundary "Kita Cuma Nyimpen Registrasi"

> Brainstorming lanjutan setelah §13 diimplementasikan (A1/A2/A2-FE sudah di-push). Ini **merevisi pemahaman** soal apa yang direpresentasikan `PijakParticipantCategory`, bukan mengubah logic keputusan `determineEligibilityStatus()` itu sendiri (decision tree §13.1 tetap sama persis) — cuma nama & maknanya yang diperjelas.

### 15.1 Kriteria 4-kriteria itu gate ELIGIBLE, bukan pembeda Intensif-vs-Progresif (LOCKED)

Klarifikasi penting: kriteria "umur 18–34 + tidak studi + WNI + tinggal di Indonesia" (brief, gate section 13-29) itu menentukan **jalur YA (Young Adult) — salah satu dari 2 jalur eligible**, bukan otomatis berarti "orang ini bakal jadi Intensif". Jalur eligible kedua adalah **VS (Vocational School)** — studying + `education_level` ∈ {SMK, D1-D4}. Constraint umur tetap **18-34** (dikonfirmasi ulang, bukan 17 — itu salah ketik berulang, bukan perubahan beneran).

**Penempatan final (Intensif vs Progresif) ditentukan BELAKANGAN**, di luar scope registrasi Step 1 yang sedang kita kerjakan:
- Step 2 (Syarat Administrasi — SK, tes penilaian, lulus kelas SB) — sudah ada kerangka domainnya di `PijakAdministrativeRequirement`/`PijakAdministrativeRequirementSpecification` (branch B2).
- Step 3 (Offering — terima/tolak) — kalau YA-eligible **terima** offering → Intensif. Kalau **tolak** atau nggak pernah di-offer → jatuh ke pipeline Progresif, **di-provide manual oleh tim Ops** (bukan otomatis oleh sistem) — mekanisme ini sudah dibahas di §13.4.
- Konfirmasi Ops soal kasus "nggak pernah di-offer": tergantung apakah peserta sudah menyelesaikan SkillsBuild course-nya atau belum — ini murni soal Step 2/3, **tidak perlu aksi apapun di kode Step 1 kita sekarang**.

**Kesimpulan eksplisit dari user**: *"kategorinya akan lebih sesuai jika dinamakan Intensive Eligible, progressive eligible dan not eligible karena belum tentu yang intensive jadi intensive karena bisa saja ditolak atau tidak menyelesaikan administrasi. jadi di kita tugasnya adalah untuk menyimpan registrasi saja."* — scope Step 1 (yang sedang kita bangun) **cuma nentuin eligibility**, bukan penempatan final.

### 15.2 Rename enum (✅ DONE — sudah dieksekusi ke kode, diverifikasi 2026-09-21)

`PijakParticipantCategory`:
- `INTENSIVE` → **`INTENSIVE_ELIGIBLE`**
- `PROGRESSIVE` → **`PROGRESSIVE_ELIGIBLE`**
- `NOT_ELIGIBLE` — tidak berubah.

Perlu update semua consumer: `PijakParticipantRegistration` (aggregate), `PijakGateway`, `PijakViewModel`, `PijakRegistrationListener`, `PijakRegistrationStepStatus`, `AdministrativeRequirementStep`, plus seluruh unit/integration test yang reference nilai enum ini. Decision tree logic-nya **sendiri tidak berubah** (§13.1 tetap valid) — murni rename buat kejelasan semantik.

### 15.3 Field 13-16 ternyata shared buat semua Eligible, bukan YA-exclusive — resolve ambiguitas §5.A6 (LOCKED, dengan 1 sub-poin masih OPEN)

Cross-check ulang ke brief (grep langsung): baris 99 — **"Syarat Administrasi (1a+1b) muncul untuk Eligible YA/VS"** (bukan YA doang), sementara baris 152/168 — **2a (Tes Penilaian) dan 2b (Upload Surat) eksplisit "khusus YA"**. Ini konsisten dengan proposal field-split user (form 1-12 / 1-16 / 1-20):

- **Form 1-12** (Data Personal dasar) — semua orang isi, ini yang nentuin eligible/nggak. Not Eligible cuma sampai sini.
- **Form 13-16** (zona waktu, kondisi ekonomi, tools, knows_from) — muncul buat **siapapun Eligible** (YA maupun VS), bukan YA-exclusive. Progressive-eligible ikut mengisi ini.
- **Form 17-20** (section Komitmen — commitments, violation_agree, commitment_full_name, 3 checkbox konfirmasi) — **YA/Intensive-eligible only**.

Ini **meng-close ambiguitas yang dicatat di §5.A6** (brief sendiri nggak konsisten pakai 2-kriteria vs 4-kriteria di titik gate "13-29") — resolusinya: gate buat blok 13-16 lebih longgar (Eligible secara umum), gate buat blok 17-20 tetap ketat (YA/Intensive spesifik). Field-split ini **dikonfirmasi bukan aneh**, sudah divalidasi konsisten dengan teks brief.

**Masih OPEN**: apakah field 13-16 (khususnya financial hardship & tools) beneran dimaksudkan ditanya juga ke anak SMK/kuliah (VS) — user masih nanya ini ke Ops langsung, belum ada jawaban final.

### 15.4 "PARTIAL" — dibutuhkan cuma buat export, BUKAN kategori domain (LOCKED, sudah dipertimbangkan & ditolak sebagai enum case)

Kebutuhan aslinya: tim Ops mau, saat export, ada **sheet terpisah** berisi orang yang mendaftar tapi nggak sampai selesai. Awalnya dikira perlu tambah case `PARTIAL` ke `PijakParticipantCategory` (niru `CodingCampProgressiveParticipantCategory::PARTIAL = 'partial_submission'`) — sudah dicek dan **diputuskan tidak perlu**.

**Kenapa CodingCampProgressive beda konteks**: `CodingCampProgressiveParticipantRegistration::register()` — kalau `!isCompleted()`, langsung set `resolvedCategory = PARTIAL` dan **upsert row ke `scholarship_participants` juga** (`getParticipantToPersist()` return non-null buat complete MAUPUN partial). Itu masuk akal buat CodingCampProgressive karena **cuma ada 1 tabel** buat semua state.

**Kenapa Pijak 2027 nggak perlu ikutin pola itu**: kita sengaja pisah 2 tabel (§13.3, gara-gara FK Offering domain) — `campaign_initial_registrations` (draft, `is_completed` flag) dan `scholarship_participants` (cuma buat yang eligible & complete). Field `is_completed` di `campaign_initial_registrations` **sudah otomatis merepresentasikan** state "partial" ini, hasil dari mekanisme autosave (§13.6) yang udah dibangun & dites. Jadi buat kebutuhan export, **tinggal query, nggak perlu ubah domain sama sekali**:

```sql
-- Sheet "Partial" (daftar tapi belum selesai) — tanpa join
SELECT * FROM campaign_initial_registrations
WHERE program_id = <pijak_program_id> AND is_completed = 0;

-- Sheet "Not Eligible" (form selesai tapi nggak eligible) — BUTUH join
SELECT cir.* FROM campaign_initial_registrations cir
LEFT JOIN scholarship_participants sp
  ON sp.user_id = cir.user_id AND sp.program_id = cir.program_id
WHERE cir.program_id = <pijak_program_id> AND cir.is_completed = 1 AND sp.id IS NULL;

-- Sheet "Intensive Eligible" / "Progressive Eligible" — tanpa join, persis pola export handler lama
SELECT * FROM scholarship_participants
WHERE program_id = <pijak_program_id> AND category = 'intensive_eligible'; -- atau 'progressive_eligible'
```

**Konsekuensi kalau dipaksa jadi enum case beneran** (dipertimbangkan, ditolak): (1) `PijakParticipantRegistration`/`PijakRegistrationData` harus jalan juga buat data belum lengkap → longgarin validasi ketat yang sekarang jadi jaminan eligibility (atau bikin jalur validasi paralel, duplikasi), (2) kepaksa nulis row ke `scholarship_participants` di **setiap autosave keystroke** → membuka lagi risiko pencemaran data kandidat yang dikonsumsi domain Offering, persis yang sudah sengaja dihindari di §13.3, (3) case yang nggak pernah reachable secara real dari aggregate manapun — misleading.

**`PijakParticipantsExportHandler.php`** yang eksis dulu itu **legacy IBM SkillsBuild** — kategori lama (`'eligible'`/`'not_eligible'`, 2 nilai), config `scholarships.ibm_skillsbuild.*`, sama sekali nggak nyentuh `campaign_initial_registrations`. Pijak 2027 butuh export handler baru (bukan extend yang lama).

**✅ DONE (2026-09-21)**: export handler baru sudah dibangun — `Dicoding/Infrastructure/GlobalJobPushedHandlers/Scholarships/Pijak/PijakParticipantsExportHandler.php` + command `scholarships:pijak:export-participants` ([PR #5848](https://github.com/dicoding-dev/dicoding/pull/5848), branch `feature/pijak/export-participants`). Scope sengaja **cuma data registrasi** (3 sheet by kategori — Young Adult/Vocational Student/Not Eligible — 10 kolom sama: waktu daftar, user_id, nama lengkap, jenis kelamin, kota/kabupaten, provinsi, no WhatsApp, total referral digunakan, referrer user id, referrer profile link), belum termasuk sheet "Partial" (draft belum selesai) dari query SQL di atas — bisa ditambahkan sebagai iterasi berikutnya kalau Ops butuh.

## 16. Brief final (bukan draft lagi) — kriteria VS ketambahan WNI+domisili, §15.3 dikoreksi

Brief `Pijak 2027 - Brief Landing Page & Registration.md` sudah di-finalize (label "OLD" dihapus) — ada 2 perubahan yang berdampak ke kode yang sudah dibangun.

### 16.1 Kriteria final (LOCKED)

- **Young Adult/Intensive**: 18-34 tahun per Februari 2027, tidak sedang menempuh pendidikan, **WNI**, **tinggal di Indonesia**. (Tidak berubah dari §13.1/§15.1.)
- **Vocational Student/Progressive**: **WNI**, **tinggal di Indonesia**, sedang menempuh pendidikan (SMK/D1/D2/D3/D4). **Ini perubahan** — sebelumnya `isProgressiveEligible()` cuma cek `is_currently_studying` + `education_level`, tanpa WNI/domisili. Fixed di `PijakParticipantRegistration::isProgressiveEligible()` (branch A1), plus 2 unit test negatif baru (studying-tapi-bukan-WNI, studying-tapi-luar-negeri → NOT_ELIGIBLE).
- **Not Eligible**: tidak masuk ke keduanya.
- Aturan reassignment "YA yang nolak/nggak pernah di-offer → masuk Progresif" **dikonfirmasi murni Step 3 (Offering/Pengumuman)**, bukan Step 1 — lihat brief bagian Pengumuman ("Tidak Diterima - Masuk Progresif"). **Tidak ada perubahan kode Step 1** buat ini, sudah sesuai §15.1.

### 16.2 §15.3 KELIRU — field 13-16 ternyata TIDAK shared buat semua Eligible (KOREKSI)

§15.3 sebelumnya menyimpulkan field 13-16 (timezone, financial hardship, tools, knows_from) muncul buat **semua Eligible** (YA maupun VS). Brief final membantah ini secara eksplisit: *"Jika Pilihan = VS ... atau Not Eligible langsung ke pernyataan"* — VS **skip langsung** ke bagian pernyataan akhir, sama seperti Not Eligible. Cuma YA yang lanjut ke field tambahan.

**Field-split final yang benar**:
- **Selalu tampil** (semua kandidat, termasuk Not Eligible & VS): persetujuan, identitas personal (nama, email, gender, WNI?, negara, HP, tanggal lahir, domisili), disabilitas, **kondisi ekonomi/financial_hardship**, **knows_from** ("dari mana tahu program ini"), tingkat pendidikan/occupation_status. *(financial_hardship & knows_from PINDAH dari blok Intensive-only ke sini — bagian dari koreksi ini.)*
- **YA/Intensive-eligible only**: zona waktu (timezone), checklist tools/perangkat, lalu pernyataan komitmen (commitments 1-7, violation_agree, commitment_full_name/KTP).
- **Selalu tampil lagi** (submit gate, semua kandidat): 3 checkbox konfirmasi akhir (confirm_all_true, confirm_awareness_and_responsible, terms_agreed) + tombol submit.

Implementasi (branch A2-FE): `other-info.blade.php` sekarang cuma isi disability+financial_hardship+knows_from (semua always-shown, `intensiveOnlyFields` div dihapus dari file ini). `timezone`+`tools_availability` pindah ke `confirmation.blade.php`, digabung dalam div `#intensiveOnlyFields` baru persis sebelum `#commitmentAccordion` (dua-duanya di-toggle bareng oleh `isIntensiveEligible()` doang — VS-exception yang sempat ditambah di komit sebelumnya di-revert). Urutan section di `index.blade.php` diubah: `other-info` sekarang render **sebelum** `education` (sesuai urutan field di brief: disabilitas → kondisi ekonomi → knows_from → tingkat pendidikan).

---

## 17. Status Sinkronisasi Dokumen & Sisa Pekerjaan (2026-09-21)

> Ringkasan audit ulang — poin-poin di §5/§12/§14/§15 di atas sudah dikoreksi inline (lihat tag CLOSED/DONE di masing-masing bagian). Section ini isinya konsolidasi status terkini supaya tidak perlu scroll ke banyak tempat.

### 17.1 Tabel status §12 sudah stale terhadap kode aktual — perlu dianggap indikatif, bukan akurat
Dicek langsung ke branch/PR lokal (2026-09-21): rantai PR stacked Pijak **sudah jauh lebih lanjut** dari yang tercatat di §12 (yang cuma sampai B2 "belum di-commit"). PR terbuka saat ini, urut dari `master`:

`#5793` (preview page) → `#5790` (step-model) → `#5824` (Syarat Administrasi) → `#5828` (upload surat komitmen) → `#5836` (not-eligible bypass + offering helpers) → `#5837` (announcement view/gates) → `#5843` (offering response + cohort submission) → `#5848` (export participants)

Artinya B2, C1/C2 (kalau ada), dan slice announcement/offering/cohort **sudah dikerjakan dan sudah di-PR**, jauh melebihi apa yang §12 catat "belum dikerjakan". §12 sebaiknya di-audit ulang baris per baris terhadap isi PR ini kalau mau dipakai sebagai acuan progress — untuk sekarang, jangan percaya status ⬜/🟡 di §12 begitu saja.

### 17.2 Item yang sudah CLOSED/DONE per audit ini (detail di section masing-masing)
- §5.A4 — estimasi pendapatan **tidak diperlukan**, sudah tercakup opsi "Pendapatan keluarga tidak tetap" di checkbox Q14.
- §5.A6 — resolved via §16.2, implementasi sekarang sudah sesuai brief final.
- §15.2 — rename enum `INTENSIVE_ELIGIBLE`/`PROGRESSIVE_ELIGIBLE` sudah dieksekusi ke kode.
- §14 poin 2 — `PijakCommitmentScholarshipLetter` sudah baca `institution` (bukan `job_institution` lagi).
- §15.4 — export handler baru Pijak 2027 sudah dibangun (PR #5848).
- Item D (§12) — email konfirmasi setelah submit Step 1 sudah terkirim, dikonfirmasi user.
- Google Sheets export credential lokal — sudah di-setup, tidak lagi jadi blocker verifikasi.

### 17.3 Masih OPEN — butuh konfirmasi Ops
- **§5.A2** — kesamaan link/nomor course IBM SkillsBuild untuk track YA vs VS.
- **§5.A5** — expose link referral sebelum submit Step 1 (klarifikasi ditambahkan di §5.A5: ini murni usulan engineering, belum pernah diajukan ke Wintari).
- **§5.D3** — reminder otomatis 24 jam (offering & cohort draft) — belum ditemukan di codebase manapun, perlu konfirmasi apakah fitur baru atau memang belum pernah dibangun.
- **§5.D4** — mismatch `offering_deadline` config (`2027-01-15`) vs brief (`31 Des 2026`) — jangan diubah sebelum ada jawaban Ops.
- **LoA (Letter of Acceptance)** — dugaan sementara: proses **manual oleh tim Ops** (bukan generate otomatis oleh sistem), tapi ini masih perlu dikonfirmasi eksplisit ke Ops sebelum dianggap final — kalau ternyata butuh generate otomatis, ini gap kode nyata (nol implementasi sekarang).

### 17.4 Belum dikerjakan — pending testing, bukan pending keputusan
- **Testing role selain Intensif-diterima** — Progressive, Not Eligible, skenario tolak/expired offering — belum dicoba sama sekali.
- **Twibbon submission + referral test dari akun kedua** — belum dicoba, perlu dilakukan (dikonfirmasi ulang user: "harus kita coba").

### 17.5 Extramiles (tetap ditunda, tidak berubah)
Validasi email vs list SB2026, bug copy email token MCT habis, tombol "ajukan offering ulang", preview/edit LoA mandiri oleh tim Cohort — urutan prioritas tetap di §10, dikerjakan setelah core stabil.

---

## 18. Mekanisme Pengumuman Hasil Final & Auto-Enroll Kelas (2026-09-21)

### 18.1 Koreksi mapping email — §3 poin 5 sebagian stale
Brief final (bukan draft/notes lama) cuma define 2 titik komunikasi hasil, bukan 5 varian email independen seperti sempat dicatat di §3 poin 5:

1. **`# Email Autoreply`** (brief baris 50-54) — cuma 2 varian: **Eligible** & **Not eligible**, dikirim **segera setelah submit Step 1**. Sudah diimplementasi & dikonfirmasi jalan (item D di §12/§17.2). Isi template (`registration-confirmation.blade.php`) sengaja **tidak membocorkan hasil eligibility** buat kategori Not Eligible — cuma "pendaftaran diterima, tunggu pengumuman", sesuai brief.
2. **`# 📢 4 - Pengumuman`** (brief baris 278-332) — notifikasi hasil final, dikirim **belakangan**, deadline sama dengan Offering (13 Jan 2027). Isinya cuma **4 state**, bukan 5:
   - Menunggu Hasil Seleksi (default)
   - Diterima - Masuk Intensif
   - Tidak Diterima - Masuk Progresif (framing "Selamat!", diperlakukan sebagai pencapaian bukan penolakan — konsisten §13.4)
   - **Tidak Eligible (Non YA/VS) atau Tidak Eligible Syarat Progresif** — **1 bucket buat 2 populasi**: Not-Eligible-dari-awal (Step 1) DAN YA-eligible-yang-gagal-syarat-fallback-Progresif. **Ini yang sempat dicatat sebagai varian "Not Selected" terpisah di §3 poin 5 — ternyata sudah digabung jadi 1 bucket/copy yang sama dengan Not Eligible di brief final, bukan 2 email/state terpisah.**

**Konsekuensi**: status DONE item D (§12/§17.2) **cuma menutup poin 1 di atas** (email ack Step 1). Poin 2 (notifikasi Pengumuman final) **masih gap penuh**, belum ada event/mailer/command apapun di kode Pijak 2027 untuk ini.

### 18.2 "Auto enroll mandiri by tim Cohort" — 2 target berbeda, bukan double-enroll
Brief menyebut kalimat identik ("Akan auto enroll mandiri by tim Cohort") di 2 section berbeda (baris 70-88) — sempat menimbulkan kekhawatiran double-enroll. **Diklarifikasi: ini 2 target enrollment independen, populasi & course beda**, bukan orang yang sama di-enroll 2×:

| Section brief | Populasi | Course | Status kode |
|---|---|---|---|
| Kelas untuk Eligible (Intensif) | Accepted-offering + cohort data selesai | Kurikulum penuh (7 wajib + 2 bonus + 6 non-teknis + capstone, §5.A7) | ⬜ **Belum ada mekanisme sama sekali** — course_id juga belum dicari (§5.A7 blocker) |
| Kelas untuk Eligible (Progresif) | VS-eligible langsung ATAU YA-fallback (offering ditolak/expired/never-offered) | 4 course (862/867/753/123), reuse config `pijak_flash` | Bagian dari command final-selection §18.3 — **enroll dan email "Selected Progresif" adalah 1 aksi yang sama** (auto-redeem token sukses → dispatch event → mailer), bukan 2 langkah terpisah |
| Kelas untuk Not Eligible | Not Eligible dari awal | — | ⬜ **Belum ditentukan** — brief bilang "Akan diskusi terlebih dahulu dengan tim LD terkait penggunaan Bitt", murni notifikasi tanpa akses kelas apapun untuk sekarang |

"Mandiri by tim Cohort" = tim Cohort yang **menentukan kapan batch dijalankan** (self-directed timing, kasih daftar id ke engineer kapan mereka siap), bukan tim Cohort mengklik enroll satu-satu di tools lain — mekanisme eksekusinya tetap command yang dijalankan engineer.

### 18.3 Mekanisme final-selection command — LOCKED, ikut pola existing (dikonfirmasi user 2026-09-21)
Dicek 2 preseden (`PijakUpdateFinalSelectionResultCommand` legacy IBM SkillsBuild, `UpdateCodingCampFinalSelectionResultCommand`) — pattern-nya identik:
- Command artisan, **bukan tombol admin/cron**, dipicu manual oleh engineer.
- Wajib `--userIds`/`--user-ids` eksplisit (comma-separated) — **command tidak auto-detect dari DB meskipun secara teknis bisa** (`offering_status`/`cohort_id` sudah cukup buat nentuin siapa accepted-Intensif). Kalau kosong, command langsung `return []`, tidak memproses siapapun.
- Alur: tim Cohort/Ops kumpulkan daftar user id → kasih ke engineer → engineer jalankan command → command auto-redeem token (`ScholarshipTokenAutoRedemptionSpecification`) → sukses → dispatch event domain → email terkirim otomatis lewat convention mailer (`EventMailerHandler`), bukan pemanggilan "send email" terpisah.
- Khusus kasus tanpa token/kelas (not-eligible/last-chance di legacy Pijak) — command terpisah tanpa event, langsung `sendMail()`.

**Keputusan (locked)**: Pijak 2027 **ikut pola existing** — command baru butuh `--userIds` eksplisit dari Ops, tidak auto-detect dari DB, konsisten dengan 2 program lain. Alasan: kontrol operasional per-batch (Ops bisa exclude orang tertentu/blacklist secara manual per batch, tidak berisiko command "kebablasan" memproses semua yang eligible saat itu juga tanpa direview dulu).

### 18.4 Yang perlu dibangun (belum ada satupun di kode Pijak 2027 baru)
1. Event baru untuk hasil final Progresif (nama tentatif, hindari bentrok dengan event IBM legacy `DeveloperWasRegisteredToPijakProgressive`).
2. Event baru untuk notifikasi final Not Eligible/Not Selected (1 event, 1 mailer, cover 2 populasi — lihat §18.1 poin 2).
3. Mailer baru untuk masing-masing, convention-based (`{EventName}Mailer`).
4. Command baru `scholarships:pijak:update-final-selection-result` (atau nama serupa, scoped ke `program_id=2208` + enum `PijakParticipantCategory` baru — **bukan** reuse config/gateway legacy `ibm_skillsbuild.*`), dengan opsi `--userIds` wajib, 3 cabang hasil (Intensif-curriculum-enroll terpisah, Progresif-enroll+email, Not-Eligible-email-only).
5. Config course_id kurikulum Intensif penuh — belum dicari (§5.A7), blocker buat poin 4 bagian Intensif.

### 18.5 Sumber copy resmi ditemukan — `docs/domains/pijak2027/Pijak 2027 - Registration Draft.md`

Dokumen terpisah (bukan brief) berisi draft copy email lengkap dari tim Engineer & tim Registrasi, per 2026-09-21:

**`[By Engineer] Registration Flow`** (email Step 1, 3 varian — subject beda per kategori, tidak seperti kode kita yang subject-nya generic sama untuk semua):
- **Eligible YA** & **Eligible VS** — sudah cocok secara struktur dengan `registration-confirmation.blade.php` (YA dapat 4 langkah termasuk Surat Komitmen+Tes Seleksi, VS cuma 2 langkah tanpa itu).
- **Not Eligible** — **beda signifikan** dari implementasi sekarang: draft **langsung membocorkan hasil** ("saat ini Anda belum memenuhi kriteria eligibilitas...") + menawarkan kelas konsolasi gratis di platform **Bitt** (placeholder `[nama kelas Bitt]`/`[XX hari — need konfirmasi ke tim LD]`), sementara kode kita sekarang cuma bilang "tunggu pengumuman" tanpa reveal apapun. **Dikonfirmasi user (2026-09-21): draft Not Eligible ini masih belum final**, jangan diimplementasi dulu.

**`Kondisi setelah user Dapat Offering`** (3 email offering, **belum ada satupun terkait di §18.4 sebelumnya, ini temuan baru**):
1. **Offering Normal** — deadline "2x24 jam". **Sudah match** dengan `ScholarshipOfferingWasCreatedMailer` existing (`OFFERING_PERIOD_IN_DAYS=2`), sudah diverifikasi jalan lewat Mailcatcher sesi sebelumnya.
2. **Offering yang dilakukan di 31 Desember 2026 ("mepet"/hari terakhir)** — copy **beda**: *"Batas waktu konfirmasi: hari ini, pukul 23.59 WIB... penawaran ini diberikan pada hari terakhir periode seleksi"*. **Gap dikonfirmasi**: dicek `ScholarshipOfferingWasCreatedMailer.php` — **tidak ada logic percabangan** copy berdasar apakah `due_date` sama-hari vs +2 hari, cuma passing `offering_due_date` mentah ke template. Domain logic (`min(now+2, offeringDeadline)`) sudah benar (§2), tapi **copy emailnya belum branching** untuk kasus ini.
3. **Kondisi setelah Menerima Offering — "perlu mengisi Cohort Data"** — **ini isi konkret buat gap yang ditemukan turn sebelumnya** (`ScholarshipOfferingStatusWasUpdated` event tanpa mailer sama sekali, cross-program). Copy-nya **bukan** ucapan selamat generik, tapi reminder terarah: "Terima kasih telah menerima offering, sekarang isi Formulir Data Cohort (kontak darurat + komitmen), formulir cuma bisa diisi sekali" — placeholder deadline `[tanggal & jam batas waktu]` (masih belum ditentukan, terkait §5.D4/D3 soal `cohort_form_deadline` yang juga belum jelas sumbernya).

**`[By Regist Team] Announcement Regist`** (3 slot: Terpilih Intensif/Terpilih Progresif/Tidak Terpilih) dan **`EDM/SheetMailer`**, **`WhatsApp`** — **dikonfirmasi kosong total**, cuma header tabel tanpa isi. Menguatkan §18.1/§18.4 dan §5.D3 (reminder 24 jam) — bukan cuma kode yang belum ada, **copy-nya sendiri juga belum ditulis tim Regist**.

**Update status §18.4 poin 1-2**: event/mailer final-selection (Progresif, Not Eligible/Tidak Terpilih) **masih blocked ganda** — kode belum ada DAN copy dari tim Regist juga belum ada. **Item baru ditambahkan ke daftar gap**: mailer untuk "terima offering → isi Cohort Data" (copy sudah ada di draft ini, tinggal diimplementasi) dan percabangan copy "Offering mepet" di `ScholarshipOfferingWasCreatedMailer` yang sudah ada.

### 18.6 KOREKSI (2026-09-21) — Progresif & Not Eligible TIDAK butuh email push tambahan, §18.1/§18.4 poin 1-2 direvisi

Dikonfirmasi lewat diskusi dengan engineer lain: 3 slot "Announcement Regist" yang kosong di draft (§18.5) **bukan berarti belum sempat ditulis**, tapi memang **tidak direncanakan sebagai email terpisah**. Draft cuma berisi konten buat 2 jalur: **Step 1** (3 varian) dan **Offering** (normal, mepet, after-accept) — keduanya jalur Intensif-sentris atau berlaku umum di Step 1. Tidak ada rencana email lanjutan buat "tolak offering" maupun "not eligible lanjutan".

**Alasan desain (koheren, bukan cuma keputusan sepihak)**: email push cuma dibutuhkan buat kondisi yang **ada aksi berbatas waktu** dari user (konfirmasi offering 2×24 jam, isi Cohort Data) — kalau tidak di-push, user bisa kehilangan kesempatan tanpa sadar. Progresif & Not Eligible **tidak punya aksi/deadline apapun** setelah Step 1:
- **Progresif** — begitu auto-enroll (§18.2/§18.3) jalan, kelas otomatis muncul di halaman "Kelas Saya" milik user (mekanisme platform existing, independen dari email) — tidak perlu notifikasi tambahan buat tahu.
- **Not Eligible** — tidak ada aksi susulan, cukup cek Dashboard kalau penasaran (copy "Menunggu Hasil Seleksi" di §4 brief sendiri mengarahkan ke situ: *"Anda juga dapat memeriksa status pendaftaran melalui Dashboard Dicoding"*).

**Konten "Pengumuman" (§4 brief: Diterima-Intensif/Tidak Diterima-Progresif/Tidak Eligible) statusnya diklarifikasi**: ini konten buat **halaman/dashboard** (`AnnouncementStep`, sedang dibangun PR #5837), **bukan** otomatis berarti email terpisah — beda hal yang sebelumnya tertukar di §18.1.

**Catatan konteks (bukan acuan)**: legacy Pijak (`DeveloperWasRegisteredToPijakProgressiveMailer`) ternyata **memang kirim email ke-2** ("Selamat! Anda Lolos ke Tahap Progresif") saat auto-redeem token sukses — jadi ada preseden buat pola lama. Tapi untuk Pijak 2027, **scope disederhanakan** (dikonfirmasi user 2026-09-21): tidak ikut pola itu.

**Revisi final §18.4 — yang benar-benar perlu dibangun**, dipersempit dari 5 poin jadi:
1. Mailer "terima offering → isi Cohort Data" (copy sudah ada di §18.5, event `ScholarshipOfferingStatusWasUpdated` sudah ada, tinggal buat mailer + hook).
2. Percabangan copy "Offering mepet" di `ScholarshipOfferingWasCreatedMailer` yang sudah ada.
3. ~~Command auto-enroll Progresif~~ — **dibatalkan** (lihat §18.7).
4. ~~Config course_id kurikulum Intensif + command auto-enroll Intensif~~ — **dibatalkan** (lihat §18.7).
5. ~~Event/mailer final-selection Progresif & Not Eligible~~ — **dibatalkan, tidak perlu dibangun** (lihat alasan di atas).

### 18.7 KOREKSI KEDUA (2026-09-21) — auto-enroll (Progresif maupun Intensif) juga TIDAK perlu dibangun sistem, murni operasional tim Cohort

Diklarifikasi lebih lanjut oleh user: "Akan auto enroll mandiri by tim Cohort" (brief, §18.2) **artinya benar-benar dilakukan tim Cohort sendiri di luar sistem kita** — bukan tim Cohort memicu command yang kita bangun. Ini merevisi asumsi di §18.2/§18.3 yang menyamakan "mandiri" dengan "trigger command engineering via `--userIds`".

**Konsekuensi**: §5.A7 (config course_id kurikulum Intensif) dan mekanisme `ScholarshipTokenAutoRedemptionSpecification`/command baru buat auto-enroll (baik Progresif 4-course maupun Intensif kurikulum penuh) **keluar dari scope kita sepenuhnya** — bukan cuma "belum prioritas", tapi memang bukan tanggung jawab engineering Pijak 2027 untuk dibangun. Tim Cohort punya cara sendiri (kemungkinan tools/admin panel generik yang sudah ada di luar konteks Pijak, tidak perlu dikonfirmasi lebih lanjut kecuali muncul kebutuhan baru).

**Scope final engineering buat email/enrollment Pijak 2027, tersisa cuma 2 item** (dari §18.4 yang sudah dipangkas):
1. Mailer "terima offering → isi Cohort Data".
2. Percabangan copy "Offering mepet" di `ScholarshipOfferingWasCreatedMailer`.

Command final-selection (§18.3) yang sempat direncanakan **juga tidak perlu dibangun** — karena isinya (auto-redeem token) sudah bukan tanggung jawab kita, dan hasil selection (Progresif/Not Eligible) tidak butuh email tambahan (§18.6). Yang tersisa dari command itu, kalaupun ada, cuma soal Intensif-accepted → tapi itu juga sudah tercover alur Offering existing (poin 1 di atas), bukan command terpisah.

---

## 19. Verifikasi PR Chain & Sisa Pekerjaan (2026-09-22)

> §12/§17 sudah stale terhadap kode aktual (masih menyebut B2 "belum di-commit", tidak menyebut #5851). Section ini menggantikan keduanya sebagai acuan status — diverifikasi langsung lewat `gh pr list` dan grep kode, bukan dari ingatan/prosa dokumen sebelumnya.
>
> **Diperbarui 2026-10-01**: seluruh PR di tabel §19.1 sudah MERGED. Status terkini ada di tabel itu dan di §19.5.

### 19.1 PR chain aktual (stacked, urut dari `master`)

| PR | Judul | Status |
|---|---|---|
| [#5769](https://github.com/dicoding-dev/dicoding/pull/5769) | Step 1 registration eligibility domain | ✅ **MERGED** |
| [#5779](https://github.com/dicoding-dev/dicoding/pull/5779) | Step 1 registration infra and web actions | ✅ **MERGED** |
| [#5780](https://github.com/dicoding-dev/dicoding/pull/5780) | Step 1 registration form UI | ✅ **MERGED** |
| [#5793](https://github.com/dicoding-dev/dicoding/pull/5793) | Post-registration preview page | ✅ **MERGED** |
| [#5790](https://github.com/dicoding-dev/dicoding/pull/5790) | Step-model for Syarat Administrasi and Pengumuman | ✅ **MERGED** |
| [#5824](https://github.com/dicoding-dev/dicoding/pull/5824) | Syarat Administrasi page and admin submission flow | ✅ **MERGED** |
| [#5828](https://github.com/dicoding-dev/dicoding/pull/5828) | Signed commitment letter upload and dropzone UI | ✅ **MERGED** |
| [#5836](https://github.com/dicoding-dev/dicoding/pull/5836) | Support not eligible bypass and offering helpers in step model | ✅ **MERGED** |
| [#5837](https://github.com/dicoding-dev/dicoding/pull/5837) | Announcement view, gates, and view model | ✅ **MERGED** |
| [#5843](https://github.com/dicoding-dev/dicoding/pull/5843) | Offering response and cohort submission | ✅ **MERGED** |
| [#5848](https://github.com/dicoding-dev/dicoding/pull/5848) | Export participants to Google Sheets | ✅ **MERGED** |
| [#5851](https://github.com/dicoding-dev/dicoding/pull/5851) | Redesign announcement emails to match approved draft | ✅ **MERGED** |
| [#5887](https://github.com/dicoding-dev/dicoding/pull/5887) | Auto-enroll not-eligible participants and simplify final announcement (§21, §22 poin 4) | ✅ **MERGED** |
| [#5924](https://github.com/dicoding-dev/dicoding/pull/5924) | Guest welcome page before registration form | ✅ **MERGED** |
| [#5937](https://github.com/dicoding-dev/dicoding/pull/5937) | UAT registration form quick fixes (item 12, 2, 3, 5, 8) | ✅ **MERGED** |
| [#5941](https://github.com/dicoding-dev/dicoding/pull/5941) | UAT restyle administration step as checklist cards (item 9, 10) | 🟢 **OPEN**, bukan draft, base master |
| [#5947](https://github.com/dicoding-dev/dicoding/pull/5947) | UAT submit administration requirements in stages (item 11) | 🟡 DRAFT, base #5941 |
| [#5963](https://github.com/dicoding-dev/dicoding/pull/5963) | UAT conditional institution field by participant status (item 6) | 🟡 DRAFT, base #5947 |
| [#5966](https://github.com/dicoding-dev/dicoding/pull/5966) | UAT timezone input, birth date warning, and source label (item 1, 4, 7) | 🟡 DRAFT, base #5963 |

Per 2026-10-01 seluruh alur inti (registrasi → eligibility → Syarat Administrasi → offering → cohort → pengumuman → export → email) sudah merge ke master. Yang masih berjalan hanya stack perbaikan UAT (#5941, #5947, #5963, #5966), detailnya di `specs/uat-registration-fixes.md`.

### 19.2 §18.4/§18.6 — 2 item mailer yang sempat ditandai "belum ada" ternyata SUDAH ada di kode
Dicek langsung ke kode (2026-09-22), bukan cuma dari draft copy:
1. **Mailer "terima offering → isi Cohort Data"** — `ScholarshipOfferingStatusWasUpdatedMailer::handle()` sudah gated ke `program_id === scholarships.pijak.program_id` + `status === ACCEPTED`, kirim template `emails.scholarships.pijak.offering-accepted` dengan `cohort_form_deadline`. **DONE**, bagian dari branch kerja sekarang (#5851 & pendahulunya).
2. **Percabangan copy "Offering mepet"** — `ScholarshipOfferingWasCreatedMailer::isLastDayOffering()`/`buildOfferingCreatedSubject($isLastDayOffering, ...)` sudah ada. **DONE**.

Berarti §18's "yang perlu dibangun" (2 item tersisa setelah 2 koreksi) sudah tuntas semua — tidak ada gap mailer/event yang diketahui sekarang untuk Wave 1.

### 19.3 D4 — masih BELUM diubah (terverifikasi ulang)
`app/config/local/scholarships.php:17` → `'offering_deadline' => '2027-01-15 23:59:59'`. Brief masih minta `2026-12-31 23:59:59`. **Sengaja belum diubah**, tetap menunggu konfirmasi Ops (lihat §5.D4) — bukan terlewat.

### 19.4 Daftar Pekerjaan Tersisa — diurutkan dari yang bisa langsung dikerjakan sampai yang menunggu/blocking (konsolidasi final, gantikan §17.3/§17.4/§10)

**Tier 1 — Bisa langsung dikerjakan sekarang, tidak ada blocker apapun**
1. Review & merge #5824 (sudah siap, bukan draft).
2. Lanjutkan & promote dari draft ke ready, urut sesuai stack: #5828 → #5836 → #5837 → #5843 → #5848 → #5851 (tiap PR nunggu base-nya merge duluan, tapi ini dependency internal antar-PR kita sendiri, bukan menunggu pihak luar).
3. Testing skenario Progressive-eligible, Not Eligible, dan offering ditolak/expired end-to-end — baru Intensif-diterima yang pernah dites, sisanya bisa dicoba sekarang juga.
4. Testing Twibbon submission + referral dari akun kedua.

**Tier 2 — Bisa dikerjakan sekarang, tapi menunggu Tier 1 kelar dulu (dependency internal kita sendiri, bukan menunggu Ops)**
5. Cari course_id kurikulum Intensif penuh (§5.A7 — 7 wajib + 2 bonus + 6 non-teknis + Capstone), belum dicari nomor course aslinya. Bisa dikerjakan kapan saja secara independen (riset internal, bukan nunggu jawaban Ops), tapi non-urgent karena auto-enroll-nya sendiri sudah dikonfirmasi bukan tanggung jawab engineering (§18.7, dilakukan manual oleh tim Cohort) — cuma berguna kalau ada kebutuhan lain yang menyentuh kurikulum ini.
6. Cutover route `pijak_2027.php`/`pijak2027.*` → `pijak.php`/`pijak.*` (langkah 1-4 di §12 "Strategi Route File", termasuk keputusan nasib `pijak_flash.php`) — **wajib nunggu semua PR Tier 1 merge dulu**, karena mengganti route production `/pijak/*`.

**Tier 3 — Blocked, menunggu keputusan/konfirmasi Ops sebelum bisa dianggap final**
7. §5.D4 — mismatch `offering_deadline` config (`2027-01-15` vs brief `2026-12-31`, lihat §19.3) — jangan ubah sebelum ada jawaban Ops.
8. §5.A2 — kesamaan link/nomor course IBM SkillsBuild untuk track YA vs VS, belum dikonfirmasi ulang.
9. §5.D3 — reminder otomatis 24 jam (offering & cohort draft belum diisi) — nihil di kode manapun, perlu kepastian apakah genuinely scope Wave 1.
10. §5.A5 — expose link referral sebelum submit Step 1 — masih usulan sepihak engineering, belum pernah diajukan ke Wintari.
11. §5.D2 — blacklist ~30rb email IBM SkillsBuild bekas: storage (config array vs tabel DB) belum diputuskan Ops.
12. LoA (Letter of Acceptance) — dugaan proses manual oleh tim Ops, belum dikonfirmasi eksplisit; kalau ternyata butuh generate otomatis, ini gap kode nyata (nol implementasi sekarang).

**Tier 4 — Extramiles, sengaja ditunda sampai Tier 1-3 stabil, sebagian juga butuh data/keputusan Ops (§10, tidak berubah)**
13. Tombol "ajukan permohonan offering ulang" untuk offering expired + desain blacklist-nya — **blocked** ke keputusan scope §5.D1 (cross-program atau scoped Pijak saja).
14. Validasi email pendaftar vs list SkillsBuild 2026 (~20-30rb baris) — **blocked** ke data list dari Ops, plus butuh tabel DB baru (bukan baca Google Sheets langsung).
15. Preview & edit mandiri data LoA oleh tim Cohort — logis dikerjakan setelah LoA process (poin 12) jelas, jadi transitif blocked ke situ.
16. Bug/copy: email "program selesai" yang misleading saat token MCT habis — tidak ada blocker Ops, tapi sengaja di ekor prioritas (item lama, belum digali detailnya).

### 19.5 Status Terkini (2026-10-01), gantikan Tier 1 dan Tier 2 di §19.4

Diverifikasi lewat `gh pr list` dan pengecekan langsung ke kode.

**Selesai sejak §19.4 ditulis**: Tier 1 poin 1 dan 2 (seluruh PR di §19.1 sudah merge), poin 3 (skenario Progressive, Not Eligible, dan tolak offering sudah dites E2E, lihat §20), poin 4 (referral dari akun kedua, §20.3f), serta fitur Not Eligible (§21, PR #5887).

**Masih berjalan**: stack perbaikan UAT #5941, #5947, #5963, #5966 (lihat `specs/uat-registration-fixes.md`).

**Masih terbuka di kode**:
1. **§22, mekanisme "diterima" untuk Progressive.** Belum ada command batch, penyimpanan hasil per user, email, dan auto-enroll token Progresif. Di `app/commands/Scholarships/Pijak/` hanya ada `PijakExportParticipantsCommand`, `PijakSendEmailLastChanceCommand`, dan `PijakUpdateFinalSelectionResultCommand` versi lama. Keputusan storage (kolom `scholarship_participants` atau tabel terpisah) masih ditahan.
2. **§20.3b, fallback `institution` di Surat Komitmen.** `PijakCommitmentScholarshipLetter.php:33` masih `?? '-'`, belum `?:`.
3. **§20.2, copy "Menunggu Hasil Seleksi".** `offering/waiting.blade.php` masih shared. Belum diverifikasi ulang apakah PR #5887 mengubah teks tanggalnya.
4. **Cutover route.** `app/routes/pijak_2027.php` masih ada di samping `pijak.php` dan `pijak_flash.php`. Menunggu stack UAT merge.
5. **§5.A7, course_id kurikulum Intensif.** Config `token_packages` dan `bonus_packages` belum dibuat.

**Masih menunggu Ops**: §5.D4 (`offering_deadline` di `app/config/scholarships.php:18` masih `2027-01-15 23:59:59`, brief menyebut `2026-12-31`), §5.A2, §5.D3, §5.A5, §5.D2, dan LoA. Tier 3 dan Tier 4 di §19.4 tidak berubah.

---

## 20. Temuan E2E Testing (2026-09-22)

> Testing dilakukan di branch `feature/pijak/announcement-emails` (tip dari stack PR, lihat §19.1) memakai akun dari `testing-credentials.md`. Dicatat di sini karena mengoreksi klaim §13.3/§15.4 dan menemukan gap copy baru yang belum tercatat di manapun.

### 20.4 KOREKSI: `DeveloperWasRegisteredToPijakMailer` SUDAH terkirim otomatis — masalah aslinya queue worker gagal boot, bukan listener yang belum di-wire (2026-09-23)
Muncul saat mendesain fitur auto-enroll + email untuk kandidat Not Eligible (branch baru `feature/pijak/not-eligible-auto-enroll`, di atas tip `feature/pijak/announcement-emails`). Analisis statis awal (grep seluruh codebase untuk `DeveloperWasRegisteredToPijakMailer` dan `whenDeveloperWasRegisteredToPijak`) sempat menyimpulkan mailer ini tidak pernah di-wire ke event `DeveloperWasRegisteredToPijak`. **Kesimpulan itu SALAH** — dikoreksi di sini setelah verifikasi langsung.

**Metode verifikasi (percobaan pertama, tampak mengonfirmasi kesimpulan yang salah)**: registrasi baru sungguhan via Chrome DevTools MCP memakai akun bersih `pijaknoteligible@dicoding.local` (user_id 298), jawaban dipilih supaya pasti jatuh ke kategori Not Eligible (lahir 1975, "Tidak sedang menempuh pendidikan", status "Professional"). Mailcatcher dicek: 0 email sebelum & sesudah submit. Registrasi diulang sekali lagi (data dihapus manual, submit ulang) — hasilnya sama, tetap 0 email. Berdasarkan itu, kesimpulan "mailer tidak pernah di-wire" ditulis di sini (versi sebelumnya).

**Yang sebenarnya terjadi**: saat investigasi lanjut via `deck artisan logs:read`, ditemukan `app/start/artisan.php:216` (`Artisan::add(App::make(PijakExportParticipantsCommand::class))`, ditambahkan oleh PR #5848/`export-participants`) gagal resolve — `BindingResolutionException: Target class [PijakExportParticipantsCommand] does not exist`. Ini bikin **setiap boot `artisan`** (termasuk child process yang di-fork `queue:listen` untuk memproses tiap job) crash sebelum sempat menjalankan apapun — akibatnya **seluruh job di queue, lintas semua campaign, diam-diam tidak pernah diproses** selama checkout branch ini belum menjalankan `composer dump-autoload` (classmap lokal masih dari sebelum file `app/commands/Scholarships/Pijak/PijakExportParticipantsCommand.php` ada). Bukan bug kode — sekadar langkah rutin yang perlu diingat tiap ganti branch berisi file classmap baru di `app/commands/**`.

**Setelah `deck composer dump-autoload` dijalankan**: registrasi diulang sekali lagi (data dihapus, submit ulang) → **2 email langsung masuk Mailcatcher** (kedua percobaan register sebelumnya, yang sempat nyangkut di queue, ikut terkirim begitu queue worker bisa jalan lagi). Subject: "Status Pendaftaran Pijak Not Eligible Tester di Program Pijak 2027..."; isi body **cocok persis** dengan branch `is_eligible=false` di `registration-confirmation.blade.php` (termasuk placeholder `[Nama Kelas Bitt]`/`[XX hari]` yang masih TODO — lihat draft BITT yang disinggung di percakapan sebelum §20.4 ini).

**Kesimpulan yang benar**: `DeveloperWasRegisteredToPijakMailer` **sudah otomatis terkirim** untuk registrasi Pijak 2027 (mekanisme pasti dispatch-nya belum ditelusuri ulang — bukan lewat `EventMailerServiceProvider`/`ScholarshipEventMailer` yang sempat dicek, kemungkinan via jalur lain yang belum ditemukan saat analisis statis awal). **Tidak perlu menambah listener/dispatch baru** untuk mengirim email konfirmasi — sudah jalan. Untuk fitur Not Eligible auto-enroll, cukup fokus ke bagian yang belum ada: auto-enroll course + resolusi status halaman Pengumuman (bukan wiring email).

### 20.1 Skenario C (Not Eligible) — BERHASIL, tapi §13.3/§15.4 perlu dikoreksi
Registrasi `noteligible@dicoding.local` (user_id 301, kombinasi studying + S1) sukses sampai halaman preview pasca-registrasi. Verifikasi DB:
- `campaign_initial_registrations`: `is_completed=1` — sesuai rencana.
- `scholarship_participants`: **ada row**, `category='not_eligible'`.

**Koreksi atas §13.3/§15.4**: kedua section itu menyatakan NOT_ELIGIBLE seharusnya **tidak pernah** masuk `scholarship_participants` (cuma `campaign_initial_registrations`), dan §15.4 mendesain export lewat `LEFT JOIN` khusus untuk kasus ini. **Kode aktual tidak mengikuti rencana itu** — dikonfirmasi baca langsung `PijakParticipantRegistrationRepository::save()` (`Dicoding/Domain/Scholarships/Pijak/Repositories/PijakParticipantRegistrationRepository.php:61-64`): method ini memanggil `$this->pijakGateway->saveRegistration(...)` **unconditional untuk semua kategori** (INTENSIVE_ELIGIBLE, PROGRESSIVE_ELIGIBLE, maupun NOT_ELIGIBLE), tanpa percabangan kategori sama sekali.

**Ini bukan bug** — dikonfirmasi konsisten dengan `PijakParticipantsExportHandler` (`Dicoding/Infrastructure/GlobalJobPushedHandlers/Scholarships/Pijak/PijakParticipantsExportHandler.php:70-84`) yang sudah dibangun di PR #5848: handler ini iterate `PijakParticipantCategory::cases()` dan query `scholarship_participants WHERE category = ...` untuk ketiga kategori termasuk `Not Eligible`, **bukan** pakai pola `LEFT JOIN` ke `campaign_initial_registrations` seperti didesain di §15.4. Implementasi nyatanya lebih sederhana dari rencana: semua kategori seragam masuk 1 tabel, tidak perlu query berbeda untuk kasus Not Eligible.

**Efek samping kecil (bukan regresi baru)**: karena row NOT_ELIGIBLE sekarang ada di `scholarship_participants`, mereka lolos check `is_participant` di `ScholarshipOfferingGateway::getCandidatesByProgramId()` (`Dicoding/Infrastructure/StorageGateways/Scholarships/Offerings/ScholarshipOfferingGateway.php:28-42` — cuma cek `scholarship_participants.id IS NOT NULL`, tidak filter `category`). Tapi ini pre-existing gap yang sama di flow legacy (check ini memang tidak pernah category-aware) — bukan sesuatu yang baru diperparah oleh keputusan desain ini. Ops tetap perlu hati-hati saat upload CSV Offering supaya tidak salah include user Not Eligible.

### 20.2 Copy "Menunggu Hasil Seleksi" tidak sesuai brief — TEMUAN BARU, perlu diupdate
Brief (`Pijak 2027 - Brief Landing Page & Registration.md` baris 282-290) mendefinisikan copy "Menunggu Hasil Seleksi" sebagai berikut:
> Tahap selanjutnya adalah **pengumuman** yang akan diinfokan selambatnya pada **13 Januari 2027** mendatang.
> Harap periksa secara rutin kotak masuk email terkait (**[email pendaftar]**)...
> Anda juga dapat memeriksa status pendaftaran melalui **Dashboard Dicoding**.

Tapi copy yang ter-render di kode sekarang (`app/views/ui/v3/campaigns/components/offering/waiting.blade.php`, shared component dipakai lintas program) isinya:
> Tahap selanjutnya adalah **proses penawaran** yang akan diinfokan bertahap pada `{{ getProgramOfferingOpenedAt() }}` hingga `{{ getProgramOfferingDeadline() }}` mendatang...

**Perbedaan konkret**:
1. Brief bicara soal **pengumuman final** (13 Jan 2027) sebagai tahap berikutnya; kode bicara soal **proses penawaran/offering** (rentang tanggal offering) — dua konsep berbeda, brief eksplisit menyebut tanggal pengumuman final bukan tanggal offering.
2. Kode tidak menyebutkan tanggal "13 Januari 2027" sama sekali di state ini.
3. Baris "Anda juga dapat memeriksa status pendaftaran melalui Dashboard Dicoding" **tidak ada** di komponen kode sekarang.

**Belum diketahui**: apakah komponen `waiting.blade.php` ini shared dan sengaja generik (dipakai program lain juga, jadi tidak bisa di-hardcode teks Pijak-spesifik begitu saja), atau memang perlu dibuat varian Pijak-spesifik (mirip pola `emails/scholarships/pijak/*` yang sudah punya template sendiri terpisah dari shared mailer). **Perlu ditambahkan ke daftar pekerjaan Tier 1** (§19.4) — cek dulu apakah komponen ini dipakai program lain sebelum memutuskan cara fix-nya (override view khusus Pijak vs parameterize tanggal pengumuman final ke component yang sudah ada).

**Diperkuat via testing E2E langsung (2026-09-22)**: dicoba end-to-end sebagai kandidat Progressive-eligible (`progressive@dicoding.local`, user_id 300) — Step 1 → Syarat Administrasi (1a+1b) → Pengumuman, tanpa lewat Offering sama sekali (dikonfirmasi: Progressive memang tidak pernah dapat Offering, cuma Intensif). Halaman Pengumuman kandidat ini **tetap menampilkan copy "proses penawaran... 2027-01-01 hingga 2027-01-15"** — ini **lebih serius dari sekadar copy mismatch**: kandidat Progresif secara faktual **tidak pernah** mengalami proses Offering, jadi menampilkan rentang tanggal offering ke mereka bukan cuma beda kata dari brief, tapi informasi yang keliru/membingungkan bagi populasi yang menerimanya. Perlu prioritas lebih tinggi dari sekadar "copy tidak sesuai brief" — ini termasuk kategori bug UX yang menyesatkan user, bukan cuma copy polish.

### 20.3c Skenario A (Intensive) — Syarat Administrasi lengkap (1a/1b/2a/2b), semua berhasil
Dilanjutkan E2E untuk `intensive@dicoding.local` (user_id 299) setelah submit Step 1: isi 1a (email akun IBM) + 1b (course "Tidak") → tersimpan. Sub-item 2a (Tes Penilaian, `/academies/19/tutorials/47`, ujian 5 soal placeholder lokal — bukan course production 887) diselesaikan, skor 100/100, "Selamat! Anda telah lulus dari ujian ini." Sub-item 2b (Unggah Surat Komitmen, dropzone PDF max 2MB, route `pijak2027.registration.administration.commitment-letter`, storage `PIJAK_SIGNED_COMMITMENT_LETTER`) diunggah berhasil ("Surat komitmen berhasil diunggah."), tersimpan ke `campaign_docs/pijak/signed-commitment_letters/`. Catatan: modal peringatan ujian di UI bilang "60 menit" untuk retry (bukan "tidak bisa diulang selamanya" seperti disangka dari copy sebelumnya) — jauh lebih ringan dari kesan awal, aman dites di lokal.

### 20.3d Skenario A (Intensive) — E2E PENUH berhasil sampai Cohort Data, semua terverifikasi
Melanjutkan dari §20.3c: admin (`admin@dicodinglocal.com`) membuat Offering via `/scholarships/offering` (radio "Pijak 2027", CSV berisi `user_id=299`, tanpa `category_code` karena config Pijak tidak punya sub-`categories`) → "Offering Berhasil Dikirim!". Verifikasi DB: `scholarship_offerings` row dibuat, `status=not_confirmed`, `due_date` = created_at + 2 hari (`OFFERING_PERIOD_IN_DAYS`, cocok). Email "Selamat, ...! Anda Mendapatkan Penawaran Beasiswa Intensif Pijak 2027" terkirim, deadline di body cocok dengan `due_date` DB.

Sebagai `intensive@dicoding.local`: klik "Terima" di halaman Pengumuman → `status` berubah ke `accepted` (dicek DB, `confirmed_at` terisi) → form Cohort Data (kontak darurat + 3 checkbox komitmen) langsung muncul di halaman yang sama tanpa reload → submit → "Formulir berhasil terkirim." → row baru di `scholarship_cohorts` (`emergency_contact` JSON tersimpan benar) → email "Siap Jadi Peserta Resmi Pijak 2027? Lengkapi Data Sekarang!" (mailer `ScholarshipOfferingStatusWasUpdatedMailer`, sudah diverifikasi kodenya di §19.2) **terkonfirmasi benar-benar terkirim** saat offering di-accept, bukan cuma dugaan dari baca kode. Halaman akhir menampilkan "Terima kasih telah mengisi formulir cohort data. Silakan tunggu pengumuman dan surat penerimaan (LoA)."

**Kesimpulan**: seluruh rantai Intensive (Registrasi → Syarat Administrasi lengkap 1a/1b/2a/2b → Offering admin → Accept → Cohort Data → email tiap tahap) **berfungsi end-to-end tanpa blocker**, di luar 2 temuan bug kecil (§20.3b field `institution`, dan §20.2 copy halaman Pengumuman generik).

### 20.3e Skenario D (Intensive tolak offering) — E2E berhasil, temuan gate step model
Menggunakan `pijakintensive@dicoding.local` (user_id 296): Step 1 (`category=intensive_eligible`) → admin buat Offering (sebelum Syarat Administrasi diisi sama sekali) → **temuan**: mengakses `/pijak2027/registration/announcement` langsung di-redirect balik ke `/administration` meskipun Offering sudah ada di DB — step model men-gate akses halaman Pengumuman ke penyelesaian minimal Syarat Administrasi (1a/1b/2a/2b), terlepas dari apakah Offering sudah dibuat admin atau belum. Setelah 1a/1b/2a (ternyata sudah lulus dari sesi sebelumnya, academy completion tidak ikut ter-wipe oleh reset Pijak-only)/2b lengkap, halaman Pengumuman baru bisa diakses.

Klik **"Tolak"** → modal konfirmasi ("tidak akan berpartisipasi... tidak akan menerima tawaran serupa selama periode program ini") → konfirmasi → halaman berubah jadi "Anda Telah Menolak Tawaran Program Ini". Verifikasi DB: `scholarship_offerings.status='rejected'`, **`scholarship_participants.category` TETAP `intensive_eligible`** (tidak berubah/downgrade) — mengonfirmasi tepat keputusan §15.1 (kategori = eligibility, bukan penempatan final; fallback ke Progresif adalah proses manual Ops terpisah, bukan perubahan DB otomatis). **Tidak ada email terkirim** setelah reject — sesuai §18.6 (reject tidak butuh email push, cukup state UI).

### 20.3f Skenario F (referral tanpa referrer daftar) — Berhasil, mengonfirmasi §5.A5a empiris
`pijakprogressive@dicoding.local` (user_id 297) mendaftar via `/pijak2027/registration?ref=284` — 284 adalah `test@dicoding.local`, dikonfirmasi via query **belum pernah** terdaftar Pijak 2027 (0 row di `campaign_initial_registrations` maupun `scholarship_participants`). Hasil: registrasi 297 sukses normal (`category=progressive_eligible`), dan `campaign_initial_registrations.referrer_id=284` tersimpan meski referrer-nya sendiri tidak pernah mendaftar. Ini **bukti empiris**, bukan cuma analisis kode, atas kesimpulan §5.A5a: `PijakRegistrationIndexAction::setReferrer()` memang tidak pernah memvalidasi status pendaftaran referrer.

### 20.3h Klarifikasi: "2 batch pengumuman" PijakFlash TERNYATA bukan preseden kode, cuma teks statis
Dicek atas pertanyaan user (2026-09-22): apakah PijakFlash punya mekanisme nyata mengumumkan Progresif dalam 2 batch berbeda ("Batch 1: 5 Mei 2026", "Batch 2: 5 Juni 2026"). **Hasil: tidak ada logic pembeda batch di kode sama sekali.**

- Config `app/config/local/campaigns.php:15` — `'announcement_date' => '5 Mei 2026 dan 5 Juni 2026'`, kedua tanggal digabung jadi **1 string**, bukan 2 field terpisah.
- `app/views/ui/v3/campaigns/pijak-flash/registration/announcement.blade.php:33-37` — hardcode ulang teks yang sama secara manual di blade (duplikasi, bukan manggil VM getter).
- `PijakFlashActivityProvider.php:48-57` (dashboard card) — satu-satunya pemanggil `$vm->getAnnouncementDate()`, tapi cuma widget status generik "Pengumuman", tidak ada percabangan per-batch.
- `PijakFlashViewModel::getAnnouncementDateBatch2()` (baris 363-366) **ada** tapi baca config key `announcement_date_batch_2` yang **tidak eksis** (selalu fallback `Carbon::tomorrow()`), dan **tidak dipanggil di manapun** — dead code/sisa desain yang tidak pernah selesai diwire.
- Halaman `announcement.blade.php` PijakFlash **cuma 1 state statis** "Menunggu Hasil Seleksi ⏳", tidak pernah berubah jadi hasil apapun di web — hasil sesungguhnya dikirim lewat email via proses manual terpisah (kelas mekanisme yang sama dengan `PijakUpdateFinalSelectionResultCommand`).

**Implikasi untuk Pijak 2027**: "2 batch" PijakFlash **bukan preseden kode yang bisa dicontek** untuk kebutuhan 3-state Pengumuman (§20.3g) — beda dari temuan CodingCamp yang beneran punya percabangan kondisional nyata di kode.

### 20.3i Cara PijakFlash beneran umumkan hasil ke peserta: 2 command manual + email, bukan web
Menjawab lanjutan pertanyaan user (2026-09-22): mekanisme "2 batch pengumuman" itu di-eksekusi lewat `scholarships:pijak:update-final-selection-result` (`PijakUpdateFinalSelectionResultCommand`) — dijalankan manual oleh engineer, butuh `--userIds` eksplisit, kemungkinan besar dijalankan **2x terpisah** (sekali per tanggal batch, daftar userIds beda), bukan 2 jalur kode berbeda.

**Alur per userIds yang diberikan**:
1. `getListOfProgressiveParticipants()` — skip user yang sudah `offering_status=ACCEPTED && cohort_id!==null` (itu Intensif). Sisanya dicek ke **Google Sheets tab "PROGRESIF"** (spreadsheet `1t0MokzTvI8Ji1Dfn6wdw5Qdls5vUaxf3JP9RmR_Le7Y`) untuk status manual penyelesaian 3 course IBM (AI/GenAI/AI Ethics) — verifikasi manual tim Ops/LD, bukan otomatis ke IBM API.
2. **Eligible** → `autoRedeemTokensForParticipants()` (auto-redeem token kelas Progresif via `ScholarshipTokenAutoRedemptionSpecification`, config `scholarships.ibm_skillsbuild.rejected_packages`) → dispatch event `DeveloperWasRegisteredToPijakProgressive` → **email "Selamat! Lolos ke Tahap Progresif" otomatis terkirim**.
3. **Tidak eligible** → panggil command kedua `scholarships:pijak:send-email-last-chance` (`PijakSendEmailLastChanceCommand`) → kirim email `[Pijak] Hasil Seleksi – Kesempatan Belajar Tetap Terbuka` (template `emails.scholarships.ibm.LastChanceToCompleteIBMCourses`, isi 3 course konsolasi hardcoded).
4. Command pertama tutup dengan `Artisan::call('feature:toggle', ['feature'=>'pijak-final-selection-result','subcommand'=>'enable'])` — **cuma mempengaruhi halaman legacy IBM** (`ibm/registration/sections/announcement`), TIDAK mempengaruhi `pijak-flash/registration/announcement.blade.php` (halaman itu statis, tidak baca flag ini — lihat §20.3h).

**Kesimpulan**: pengumuman hasil ke peserta PijakFlash/Progresif **sepenuhnya lewat email**, bukan lewat perubahan halaman web — web-nya tidak pernah berubah dari state "Menunggu Hasil Seleksi ⏳".

### 20.3g GAP: halaman Pengumuman final cuma 2-state (accepted/rejected generik), bukan 3-state sesuai brief
Ditemukan saat user bertanya cara mengubah state Pengumuman dari "Menunggu Hasil Seleksi" ke "Tidak Diterima - Masuk Progresif" / "Tidak Eligible" (2026-09-22).

**Mekanisme switch**: `PijakViewModel::shouldDisplayFinalAnnouncement()` (`Dicoding/Web/VM/Campaigns/PijakViewModel.php:108-111`) baca 1 feature toggle GLOBAL `pijak-final-selection-result` (`Feature::isEnabled`, tabel `toggles`), di-enable via `php artisan feature:toggle pijak-final-selection-result enable` — sama persis flag yang di-flip otomatis di baris terakhir `PijakUpdateFinalSelectionResultCommand::fire()` (command lama era IBM SkillsBuild, `app/commands/Scholarships/Pijak/PijakUpdateFinalSelectionResultCommand.php:55-58`). Toggle ini **bukan per-user/per-kategori** — begitu di-enable, SEMUA peserta langsung pindah dari state "Menunggu" ke state final sekaligus.

**Gap**: `announcement/index.blade.php:30-34` percabangannya cuma 2 jalur — `isAuthUserAcceptedInFinalAnnouncement()` (baca `hasCohortFormSubmitted()`, binary) → `accepted.blade.php` kalau true, `rejected.blade.php` kalau false. `rejected.blade.php` **tidak baca `category` sama sekali** — isinya generik ("Sayangnya, Anda belum terpilih untuk mengikuti pelatihan intensif...") dan dipakai SAMA PERSIS untuk Progressive-eligible, Not-Eligible-dari-awal, maupun Intensive-yang-ditolak/expired. `PijakViewModel::isEligibleParticipant()` (baris 122-131) sudah baca `getCategory()` tapi **tidak dipakai** di percabangan Pengumuman ini.

**Konsekuensi**: brief §4 minta 3 state berbeda (Diterima-Intensif / Tidak Diterima-Progresif dengan framing "Selamat!" / Tidak Eligible) tapi kode yang sudah merge/di-PR cuma implementasi 2-state. **Ditambahkan ke Tier 1 §19.4** — gap kode nyata, bukan blocker Ops, bisa dikerjakan sekarang.

**Cara toggle yang BENAR (2026-09-22)**: urutan argumen `feature:toggle` adalah `<subcommand> <feature>`, bukan sebaliknya (`app/commands/FeatureToggle.php:83-86`). `deck artisan feature:toggle pijak-final-selection-result enable` SALAH urutan → `subcommand` jadi string feature-nya, tidak match `enable`/`disable`, jatuh ke `interactiveCommandFallback()` (`ask('Feature: ')`) yang abort di shell non-interactive. **Command benar**: `deck artisan feature:toggle enable pijak-final-selection-result`.

**Audit cross-campaign (2026-09-22) — ketemu preseden asli**: dicek IBM SkillsBuild legacy, Asah, CodingCamp.
- **IBM legacy & Asah**: `rejected.blade.php` masing-masing **generik total**, zero percabangan kategori — pesan konsolasi statis. Pola binary accepted/rejected Pijak 2027 **memang pola lama yang di-inherit**, bukan regresi PR Pijak.
- **CodingCamp** (`app/views/ui/v3/campaigns/codingcamp/registration/sections/announcement/rejected.blade.php`) — **preseden paling relevan**: 1 template yang sama, tapi ada blok kondisional `count($vm->getCoursesOnCodingCampProgressive()) > 0` yang menampilkan pesan+daftar "3 kelas Dicoding" fallback HANYA kalau user punya assignment kelas Progresif; kalau tidak, cuma pesan generik. **Rekomendasi konkret**: tiru pola ini di `rejected.blade.php` Pijak — tambah blok kondisional berdasar `$vm->isEligibleParticipant()` (sudah ada di `PijakViewModel:122-131`, belum dipakai) untuk membedakan Progressive vs Not Eligible, **bukan** bikin file/branch index.blade.php terpisah — jauh lebih murah.

**Risiko minor dicatat, bukan blocker**: key `pijak-final-selection-result` **sama persis** dengan yang dipakai legacy IBM (`ibm/registration/sections/announcement/index.blade.php:32`) — tapi route legacy-nya (`app/routes/pijak.php`) sudah di-comment (`app/routes.php:12`), jadi tidak ada collision nyata sekarang. Perlu diwaspadai kalau route lama itu diaktifkan lagi di masa depan.

### 20.3b Bug: field `institution` kosong tidak fallback ke "-" di Surat Komitmen
Dikonfirmasi di kode: `Dicoding/Domain/Scholarships/Letters/Services/Providers/PijakCommitmentScholarshipLetter.php:33` — `'institution' => $otherRequirements->institution ?? '-'`. Form mengirim `institution=""` (string kosong) saat field opsional ini dibiarkan kosong, **bukan** `null`. Operator `??` cuma trigger fallback untuk `null`/undefined, bukan string kosong — jadi `"" ?? '-'` tetap hasilnya `""`. **Ini melanggar keputusan §14** ("kalau kosong, Surat Komitmen tetap tampil '-'", locked). Ditemukan via E2E testing user `intensive@dicoding.local` (institution dibiarkan kosong saat submit Step 1) — perlu fix ganti `??` jadi `?:` atau `!empty()` check eksplisit. **Belum diperbaiki**, menunggu konfirmasi.

### 20.3a Verifikasi langsung: pertanyaan 8-course benar-benar non-gating (dikonfirmasi via E2E)
Dites eksplisit atas permintaan user: kandidat Intensive-eligible (`intensive@dicoding.local`, user_id 299) di step Syarat Administrasi sengaja menjawab **"Tidak"** untuk "Apakah Anda sudah menyelesaikan minimal satu (1) dari (8) course IBM SkillsBuild di atas?". Hasil: **"Syarat administrasi berhasil disimpan."** tanpa error, `category` tetap `intensive_eligible` (dicek DB, tidak berubah/downgrade), dan halaman lanjut normal ke sub-item Tes Penilaian + Upload Surat Komitmen. `other_requirements.has_completed_at_least_one_ibm_course` tersimpan `"0"`. **Mengonfirmasi tepat keputusan §6** — pertanyaan ini murni informasional, tidak pernah menggate apapun.

### 20.3 Skenario B (Progressive) — E2E penuh berhasil sampai Pengumuman
Alur `progressive@dicoding.local` (user_id 300): Step 1 (`category=progressive_eligible`) → Syarat Administrasi (email akun IBM + radio "sudah selesai 1 dari 8 course" = Ya, tersimpan sebagai `Ya` di ringkasan) → halaman Pengumuman menampilkan state "Menunggu Hasil Seleksi" (lihat §20.2 untuk masalah copy-nya). Kategori tetap `progressive_eligible` sepanjang alur (dicek ulang di `scholarship_participants` setelah sampai Pengumuman, tidak berubah). Konfirmasi: menu step "Lengkapi Syarat Administrasi" muncul juga untuk Progressive (bukan cuma Intensif) — menjawab pertanyaan yang sebelumnya belum diverifikasi di §5.15.3/§16.2 soal ruang lingkup step ini per kategori.

## 21. Rencana (BELUM dikerjakan): Not Eligible — email, pengumuman "ditolak" langsung, auto-enroll kelas (2026-09-23)

> Di-park sementara atas instruksi user ("simpan dulu saja rencananya... kita fokus ke `feature/pijak/announcement-step-model`"). Belum ada kode yang ditulis untuk rencana ini — baru riset + keputusan desain. Branch `feature/pijak/not-eligible-auto-enroll` sudah dibuat (di atas tip `feature/pijak/announcement-emails`) tapi masih kosong (0 commit baru).

**Kebutuhan dari tim Ops** (disampaikan user): kandidat Not Eligible, segera setelah daftar, harus (1) dapat email, (2) langsung diarahkan ke halaman Pengumuman dengan hasil final "tidak lolos" (bukan state menunggu), (3) auto-enroll ke 1 kelas Dicoding sekarang — nanti (setelah AI Camp & Bitt ready) diganti ke 2 kelas Bitt yang perlu sinkronisasi akun Dicoding↔Bitt (bagian Bitt ini eksplisit **di luar scope sekarang**, termasuk kerumitan "progresif ada 2 sumber" — dari registrasi awal dan dari yang menolak offering Intensif).

**Temuan kunci yang mengubah rencana awal (§20.4)**: `DeveloperWasRegisteredToPijakMailer` **sudah otomatis terkirim** saat registrasi (dikonfirmasi live E2E + Mailcatcher, isi sudah sesuai kategori `is_eligible`/`is_intensive`). Jadi bagian "email" **tidak perlu listener/dispatch baru** — sudah beres. Sisa pekerjaan cuma 2:
1. **Auto-enroll**: pakai `Dicoding\UseCases\Academies\Enrollments\FullEnrollmentToCourseSpecification` (`course_id` + `student_id`, gratis tanpa token) untuk tiap course id di config baru `scholarships.pijak.not_eligible_course_ids` (array, supaya nanti gampang diganti ke 2 course id Bitt). Titik pemicu belum final — kandidat paling natural masih `PijakRegistrationListener::whenDeveloperWasRegisteredToPijak()` (`Dicoding/Infrastructure/GlobalDomainEventHandlers/Campaigns/PijakRegistrationListener.php:26-40`, saat ini cuma tangani `INTENSIVE_ELIGIBLE`), tambah cabang `NOT_ELIGIBLE` di situ.
2. **Halaman Pengumuman langsung final**: bikin `not-eligible.blade.php` baru pakai copy PERSIS dari brief §4 "Tidak Eligible (Non YA/VS) atau Tidak Eligible Syarat Progresif" (lihat isi lengkap di baris ~323 file `Pijak 2027 - Brief Landing Page & Registration.md`). Ditampilkan begitu `!$vm->isEligibleParticipant()` (method ini sudah ada), **tidak lewat** mekanisme `SubStepStatus`/offering (`AnnouncementStep`) sama sekali — kandidat Not Eligible memang tidak pernah dapat offering. Status "sudah dapat kelas atau belum" diturunkan langsung dari cek eksistensi enrollment ke course id yang dikonfigurasi (pola derive-jangan-duplikat, sama seperti perbaikan cek status upload surat komitmen di PR #5828), bukan kolom DB baru.

**Draft email BITT yang sudah kadung ditulis**: blok `is_eligible=false` di `registration-confirmation.blade.php` (branch `feature/pijak/announcement-emails`) sudah berisi copy soal akses kelas Bitt lengkap dengan placeholder `[Nama Kelas Bitt]`/`[XX hari]` dan link hardcode `https://bitt.id` — ini draft utk FASE BITT NANTI, bukan fase sekarang. Perlu direvisi dulu supaya cocok dengan fase "1 kelas Dicoding" sebelum PR ini di-lanjutkan, tapi copy BITT-nya jangan dihapus total — simpan sebagai referensi utk swap nanti.

**Belum diputuskan / menunggu user**:
- Course id Dicoding yang sebenarnya (produksi) — user akan kasih tahu nanti. Untuk testing lokal, course id `1` sudah dikonfirmasi tersedia (dipakai campaign lain di `app/config/local/scholarships.php`).
- Apakah auto-enroll tetap taruh di `PijakRegistrationListener`, atau titik lain — belum final karena tadinya direncanakan sekalian dengan wiring email (yang ternyata sudah tidak perlu).

## 22. GAP terkonfirmasi: mekanisme "diterima" untuk Progressive salah total — pakai proxy cohort form, seharusnya hasil batch dari tim Ops (2026-09-24)

> Ditemukan saat QA visual manual (buat 6 akun preview lokal `pijak-*@dicoding.local`, id 302-307, untuk lihat semua state Pengumuman tanpa daftar ulang) atas alur yang dijelaskan user. **Belum dikerjakan** — user minta dicatat dulu ("catat dulu"), fokus masih ke pekerjaan lain.

**Alur yang benar menurut user** (mengonfirmasi ulang §20.3i/§20.3g dengan bahasa lebih tegas):
- **Eligible (Intensif)**: menunggu → dapat offering → terima/tolak offering (individual, per-user, sudah benar di kode) → (kalau terima) isi Cohort Data → "tunggu pengumuman & LoA" (state akhir Intensif, BUKAN lewat `accepted.blade.php`).
- **Progressive**: menunggu → **langsung** hasil akhir "diterima Progresif" — **tidak pernah** lewat layar dapat/terima/tolak offering individual sama sekali. Hasilnya datang dari command batch yang dijalankan tim Ops.
- **Not Eligible**: langsung pengumuman akhir tidak diterima (sudah benar, §21).

**Bukti pendukung dari brief** (`Pijak 2027 - Brief Landing Page & Registration.md`, baris 70-88, section "Kelas untuk Eligible (Progresif)"): *"Akan auto enroll mandiri by tim Cohort"* — pakai token terpisah (Deskripsi: "Pijak 2027... Progressive", Deadline token: 30 hari setelah **bulk auto enroll**). Ini persis pola command lama `PijakUpdateFinalSelectionResultCommand`/`autoRedeemTokensForParticipants()` yang sudah dibedah di §20.3i (era IBM SkillsBuild lama), bukan alur cohort-form individual. Catatan: bagian ringkasan umum brief (baris 25) sempat terkesan menyamakan alur Intensif & Progresif ("Terima dan Konfirmasi Penawaran... Isi Form Data Cohort" berlaku "Intensif atau Progresif") — tapi section spesifik "Kelas untuk Eligible (Progresif)" ini yang jadi rujukan akurat karena bicara mekanisme konkret, bukan ringkasan.

**Gap kode yang terkonfirmasi via percobaan langsung** (bukan cuma baca kode): dibuat akun preview kategori `progressive_eligible` + row `scholarship_offerings` (status `accepted`) + row `scholarship_cohorts` secara artifisial, ternyata kode **tetap bisa** menampilkan form Cohort Data individual ke akun ini — karena `offering/index.blade.php` (dan seluruh state machine `SubStepStatus`/`AnnouncementStep`) **tidak pernah cek kategori sama sekali**. Lebih parah lagi: dicoba nyalakan `pijak-final-selection-result` (per-user, via `deck artisan feature:toggle enable pijak-final-selection-result --users=<id>`) dengan cohort form row dihapus (mensimulasikan Progressive asli yang tidak pernah isi cohort form) — hasilnya `isAuthUserAcceptedInFinalAnnouncement()` (baca `hasCohortFormSubmitted()`) selalu `false`, jadi yang tampil **selalu `rejected.blade.php`**, walaupun ops sudah menandai peserta itu diterima. **Kesimpulan: dengan mekanisme saat ini, peserta Progressive asli (yang memang tidak pernah isi cohort form) tidak akan pernah bisa melihat halaman "Selamat Bergabung" (`accepted.blade.php`) sama sekali** — bukan cuma "sumber data belum ada" (seperti dicatat di F5/SCOPE-1 pada preflight PR #5843/#5848), tapi struktur logikanya memang tidak cocok untuk Progressive.

**Rencana perbaikan (dibahas, belum ditulis kode)**:
1. `shouldDisplayFinalAnnouncement()`/`isAuthUserAcceptedInFinalAnnouncement()` di-gate khusus kategori Progressive saja — Intensif tidak pernah butuh mekanisme ini (state akhir mereka sudah cukup di layar cohort-form-submitted).
2. Command baru (pola sama seperti rencana batch Not Eligible/Progressive di §21 dan poin 1 brainstorm not-eligible sebelumnya), bentuk kira-kira `scholarships:pijak:progressive-final-result --accepted=<id,id,...>`. Untuk tiap user_id: simpan hasil (butuh penyimpanan baru — kolom `final_selection_result` di `scholarship_participants`, atau tabel kecil terpisah; belum diputuskan mana), kirim email diterima, auto-enroll token kelas Progresif (course id sesuai brief baris 78-82: "AI Praktis untuk Produktivitas", dst — beda dari `not_eligible_course_ids` di §21).
3. `shouldDisplayFinalAnnouncement()` untuk Progressive jadi "apakah hasil sudah tersimpan untuk user ini" (bukan toggle global `feature:toggle` lagi) — begitu ops proses user tertentu, cuma user itu yang langsung lihat hasilnya, Progressive lain yang belum diproses tetap "Menunggu". Ini juga otomatis menghilangkan risiko tabrakan nama flag global yang sudah dicatat di COORD-1 (preflight PR #5848).
4. **Tidak ada skenario "Progressive ditolak" di brief manapun** — dicek ulang seluruh mention "Progresif"/"Progressive" di `Pijak 2027 - Brief Landing Page & Registration.md`, cuma ada 3 hasil akhir: diterima Intensif, "**Tidak Diterima - Masuk Progresif**" (baris 312-316 — judulnya menyesatkan, tapi isinya *"Selamat atas keberhasilan Anda meraih Beasiswa Progresif!"*, artinya "tidak diterima **di Intensif**, tapi masuk Progresif", BUKAN penolakan Progresif), dan Tidak Eligible total (§21, sudah beda jalur). **Konsekuensi, sudah dikerjakan (2026-09-24)**: `rejected.blade.php` **sudah dihapus** (`git rm`), `accepted.blade.php` **sudah di-rename** jadi `progressive-accepted.blade.php`, dan `index.blade.php` diupdate supaya begitu `shouldDisplayFinalAnnouncement()` true langsung `@include` `progressive-accepted` tanpa cabang `@if/@else` lagi (cabang itu satu-satunya pemakai `rejected`). `isAuthUserAcceptedInFinalAnnouncement()` di `PijakViewModel` **sengaja dibiarkan ada** di class (tidak dipakai lagi di view ini) — nasibnya menunggu keputusan command batch di poin 2. Regression test ditambahkan di `PijakAnnouncementIntegrationTest::progressive_participant_sees_final_result_as_accepted_when_final_announcement_is_enabled` (mengaktifkan toggle `pijak-final-selection-result` tanpa cohort form submitted, verifikasi tetap tampil accepted — sebelumnya tampil `rejected.blade.php`).

**Referensi tambahan untuk command batch (poin 2), belum dikerjakan**: sudah ada command lama `app/commands/Scholarships/Pijak/PijakUpdateFinalSelectionResultCommand.php` (artisan `scholarships:pijak:update-final-selection-result`, dari era Pijak sebelumnya) yang mengimplementasikan pola sangat mirip — split partisipan eligible/ineligible, auto-redeem token via `MultiCourseTokenAutoRedemptionService::autoRedeem()`, dispatch event `DeveloperWasRegisteredToPijakProgressive`, kirim email lewat command terpisah untuk yang tidak lolos. Konvensi CLI option comma-list di codebase ini pakai `--userIds`/`-uid` (lihat `PijakSendEmailLastChanceCommand`), bukan `--accepted=`. Ini kandidat kuat untuk dipakai ulang/diadaptasi saat command batch §22 benar-benar dikerjakan, bukan dibangun dari nol.

**Belum diputuskan**: bentuk penyimpanan hasil (kolom di `scholarship_participants` — tabel shared lintas program — vs tabel kecil terpisah seperti `scholarship_cohorts`/`scholarship_offerings`), dan urutan pengerjaan relatif terhadap fitur Not Eligible (§21) — kemungkinan digabung karena pola & config course id auto-enroll-nya mirip. User eksplisit menahan keputusan ini ("nanti saja") dan scope command batch/storage/email/auto-enroll ("terlalu jauh" untuk dikerjakan sekaligus dengan poin 4) — tetap open item.

> Kredensial akun preview untuk QA visual halaman Pengumuman (menunggu/offering/cohort/dsb) dicatat di `testing-credentials.md`, bukan di file ini.
