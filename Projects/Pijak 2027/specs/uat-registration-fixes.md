---
date: 2026-10-13
updated: 2026-10-13
type: spec
tags: [spec, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Pijak 2027 — Perbaikan UAT Form Registrasi

Rencana perbaikan untuk 12 temuan UAT (2026-09-28) atas form registrasi Pijak 2027
(`app/views/ui/v3/campaigns/pijak/registration/...`) dan step "Lengkapi Syarat Administrasi"
(`app/views/ui/v3/campaigns/pijak/registration/administration/index.blade.php`). Dokumen
ini hasil analisis kode existing untuk menentukan scope tiap item
sebelum dikerjakan. Item 2, 3, 5, 8, 12 sudah diimplementasikan di PR #5937 (PR A), item 9, 10 di PR #5941 (PR B), item 11 di PR #5947 (PR C), dan item 6 di PR #5963 (PR D, bertumpuk di atas PR C). Item 1, 4, 7 sudah diimplementasikan di branch
`improvements/pijak/uat-timezone-birthyear-source-label` (PR E, PR #5966, draft, bertumpuk di atas PR #5963), sehingga
seluruh 12 temuan sudah dikerjakan.

Status stack per 2026-10-01: PR #5937 sudah merge. PR #5941 (base master) open dan bukan draft. PR #5947, #5963, dan
#5966 masih draft dan bertumpuk berurutan (#5941, #5947, #5963, #5966). Tiap kali PR di bawahnya merge, ganti base PR di
atasnya ke master.

## Ringkasan

| # | Item | Kompleksitas | Status |
|---|---|---|---|
| 1 | Field Zona Waktu: input disabled vs teks | Keputusan desain | Selesai (branch PR E, memakai input disabled) |
| 2 | Link "Ikuti Tes Pelatihan" pakai `target="_blank"` | Trivial | Selesai (PR #5937) |
| 3 | Hapus titik di label checkbox "Setuju." | Trivial | Selesai (PR #5937) |
| 4 | Warning dinamis untuk tahun lahir mencurigakan | Kecil (perlu keputusan cutoff) | Selesai (branch PR E) |
| 5 | Tanggal lahir tidak boleh setelah hari ini | Trivial | Selesai (PR #5937) |
| 6 | Field Instansi wajib/dropdown sesuai status peserta | **Besar** | Selesai (PR #5963) |
| 7 | Ubah label opsi "Kampus (Roadshow...)" | Trivial | Selesai (branch PR E) |
| 8 | Format teks konfirmasi kirim formulir | Trivial | Selesai (PR #5937) |
| 9 | Pisah alert info jadi warning + danger, tombol course merah | Kecil | Selesai (PR #5941) |
| 10 | Restyle 2 section jadi checklist card | Sedang | Selesai (PR #5941) |
| 11 | 3-stage reveal syarat administrasi | **Besar** | Selesai (PR #5947) |
| 12 | Field timezone bocor ke summary/export untuk non-intensive | Kecil — **root cause terverifikasi** | Selesai (PR #5937) |

---

## 1. Field Zona Waktu — disabled input vs teks

**Temuan UAT:** field "Zona Waktu Anda saat Program mulai (Februari-Juni 2027)" sebaiknya pakai
form input yang `disabled`, bukan teks biasa. Tapi UAT juga mencatat desain (mockup) yang disetujui
menunjukkan field ini tetap teks biasa, bukan input.

**Kondisi saat ini:** `sections/registration-form/other-info.blade.php:113-119` — plain
`<p id="timezone_display">Pilih kota terlebih dahulu</p>` dipasangkan dengan
`<input type="hidden" id="timezone" name="timezone">`. Sudah sesuai desain yang disetujui.

**Catatan:** ini bukan bug, tapi permintaan yang bertentangan dengan mockup yang sudah di-approve.
Perlu keputusan produk/desain dulu — apakah tetap ikut desain (tidak ada perubahan) atau deviasi ke
`<input disabled>` sesuai rekomendasi UX tester.

**Keputusan:** deviasi dari mockup, mengikuti rekomendasi UX tester.

**Hasil implementasi (branch PR E):**
- `other-info.blade.php`: `<p id="timezone_display">` diganti `<input type="text" id="timezone_display" disabled>`
  dengan placeholder "Pilih kota terlebih dahulu". `<input type="hidden" id="timezone" name="timezone">` tetap
  menjadi field yang ter-submit.
- `registration-form.ts`: tampilan zona waktu diisi lewat `timezoneDisplay.value`, bukan `textContent`. Untuk
  peserta luar negeri nilainya "Tidak berlaku (tinggal di luar negeri)".

---

## 2. Link "Ikuti Tes Pelatihan" — buka tab baru

**Kondisi saat ini:** `administration/index.blade.php:250-253`, link "Kerjakan Tes Sekarang!" ke
route `academies.study.continue`, tanpa `target="_blank"`.

**Perbaikan:** tambah `target="_blank"` pada `<a>` tersebut. Satu atribut, tidak ada risiko.

---

## 3. Checkbox "Setuju." — hapus titik

**Kondisi saat ini:** `sections/registration-form/agreement.blade.php:27`,
`'checkbox_label' => 'Setuju.'`.

**Perbaikan:** ubah jadi `'Setuju'` (tanpa titik).

---

## 4. Warning dinamis untuk tanggal lahir mencurigakan (>2020)

**Temuan UAT:** perlu warning (bukan blocking) jika tahun lahir di atas 2020, tapi ambang batasnya
harus dinamis per batch — batch mendatang mungkin membuat 2020 jadi valid.

**Kondisi saat ini:** `personal-identity.blade.php:65-66` — `<input type="date" id="birth_date">`
tanpa `min`/`max`. Validator (`frontend/src/pages/campaigns/pijak/form-validator.js:10`) cuma
`'required|date'`, tidak ada pengecekan rentang tahun.

**Hook yang sudah ada:** `$vm->getAgeReferenceDate()` (config `scholarships.pijak.age_reference_date`,
saat ini `2027-02-01`) sudah dikirim ke view sebagai `#ageReferenceDate` dan dipakai
`registration-form.js:50,52-70` untuk hitung umur real-time — infrastruktur konfigurasi per-batch
sudah ada.

**Perbaikan:** tambah warning (bukan validasi hard-block) yang muncul saat tahun lahir menghasilkan
umur di bawah ambang batas masuk akal. **Keputusan terbuka:** ambang batas ini harus berbeda dari
rentang umur eligibility intensif (18-34) yang sudah ada — kemungkinan perlu config key baru
(mis. `min_plausible_birth_year` atau dihitung dari `age_reference_date` minus N tahun) supaya bisa
diubah per wave tanpa mengubah kode. Perlu ditentukan nilai N atau mekanisme konfigurasinya sebelum
implementasi.

**Hasil implementasi (branch PR E):**
- Tidak ada config key baru. Ambang ditulis sebagai konstanta `MAX_IMPLAUSIBLE_AGE = 6` di
  `frontend/src/pages/campaigns/pijak/birth-date-warning.ts`, dihitung terhadap `#ageReferenceDate`, jadi
  referensinya tetap dinamis per batch tetapi angka 6 hanya bisa diubah lewat kode.
- `isBirthDateImplausible(birthDate, referenceDate)` bernilai true saat umur pada tanggal referensi `<= 6`. Untuk
  referensi `2027-02-01`, lahir `2020-02-01` tidak diberi warning, lahir `2020-02-02` diberi warning. Input
  kosong tidak pernah diberi warning.
- `setupBirthDateWarning()` (dipanggil dari `registration-form.ts`) menampilkan atau menyembunyikan
  `#birthDateWarning` (`dcd-alert-warning` di `personal-identity.blade.php`) pada event `change`. Warning tidak
  memblokir submit.
- Unit test: `frontend/src/pages/campaigns/pijak/tests/birth-date-warning.test.ts`.
- Bila batch berikutnya butuh ambang berbeda, jadikan `MAX_IMPLAUSIBLE_AGE` sebuah config key dan kirim lewat view
  seperti `#ageReferenceDate`.

---

## 5. Tanggal lahir tidak boleh setelah hari ini

**Kondisi saat ini:** sama seperti item 4 — tidak ada `max` attribute atau validasi JS untuk
mencegah tanggal masa depan.

**Perbaikan:** tambah `max` attribute (di-render dari tanggal hari ini server-side) pada
`#birth_date`, plus validasi senada di `form-validator.js`. Tidak ada ambiguitas — ini validasi
sanity-check standar, bukan business rule yang butuh keputusan.

---

## 6. Field Instansi — wajib/dropdown sesuai status peserta

**Temuan UAT — aturan lengkap:**

Sedang menempuh pendidikan:
- SMK, D1, D2, D3, D4 → **wajib, dropdown** (list sudah ada di DB)
- SMA → wajib, isi sendiri (teks bebas)
- S1 → wajib, dropdown
- S2 dan seterusnya → wajib, isi sendiri (teks bebas)

Tidak sedang menempuh pendidikan:
- Job-seeker → opsional
- First jobber → wajib
- Professional → wajib
- Career switcher → wajib
- "Tidak keseluruhan" (kategori umum lain) → opsional

Tambahkan catatan bantuan: isi "-" jika tidak memiliki instansi (untuk kasus field wajib tapi
user genuinely tidak punya instansi).

**Kondisi sebelum PR #5963:** `sections/registration-form/education.blade.php` hanya punya satu field
teks bebas (`input-generic`), selalu opsional dan tampil sama, tanpa percabangan berdasarkan
`is_currently_studying`, `education_level`, atau `occupation_status`.

**Hasil riset skema (DB lokal), menjawab keputusan terbuka:**
- `scholarship_high_schools`: 8.042 baris (`npsn`, `name`, `status`, `category`). Semuanya
  `category = smk`, jadi daftar ini khusus SMK dan tidak memuat SMA.
- `scholarship_universities`: 5.719 baris (`university_code`, `name`, `category`, `status`).
  `category` berisi Negeri/Swasta (kepemilikan), bukan jenjang. **Tidak ada pembeda D1-D4 vs S1**,
  jadi dropdown D1-D4 dan S1 memakai satu daftar yang sama tanpa filter jenjang.
- Ada 262 kampus berstatus `Tutup`, 657 `Alih Bentuk`, serta nama kembar (40 kampus, 222 sekolah).
  Tidak difilter, karena yang disimpan adalah nama.

**Keputusan (mengikuti campaign lain, tanpa endpoint baru):**
- Pencarian memakai `ScholarshipInstitutionFilter` lewat `/tertiary` dan controller `select2-field`,
  seperti codingcamp, tempa, asah, pijak-flash, dan mastercard. Payload `highschool` atau
  `university`, minimal 2 karakter, 10 hasil teratas.
- Yang disimpan adalah nama (string). Server tidak memeriksa bahwa nama ada di daftar.
- Tanpa opsi "Lainnya". Catatan "Jika tidak tercantum, silakan hubungi pijak@dicoding.com"
  (pola codingcamp dan Pijak Flash). Konsekuensinya peserta yang sekolah atau kampusnya tidak ada
  tidak bisa submit sampai tim menambahkannya lewat CRUD admin Institusi Pendidikan.
- Jenjang di luar matriks ops (SD, SMP, Cuti/Tidak Aktif/DO) diperlakukan sebagai "S2 dan seterusnya":
  teks bebas dan wajib.

**Hasil implementasi (PR #5963):**
- Backend: aturan `institution` di `PijakRegistrationData` menjadi
  `required_if:is_currently_studying,1` dan
  `required_if:occupation_status,First jobber,Professional,Career switcher`, ditambah
  `string|max:255`. Nilai dari request berupa string `'1'` atau `'0'`, sedangkan test unit memakai
  bool. `required_if` membandingkan dengan `in_array` longgar, sehingga `1` mencakup keduanya.
- View: tiga container ber-`name="institution"` (select sekolah, select kampus, input teks). Hanya
  satu yang aktif, yang lain `disabled` sehingga tidak ikut ter-submit. Select punya catatan hubungi
  tim, input teks punya catatan `Isi "-" jika Anda tidak memiliki instansi`.
- Frontend: `institution-field.ts` menentukan mode (SMK: sekolah, D1-D4 dan S1: kampus, sisanya
  teks) dan status wajib, serta menampilkan tanda `*`. Aturan client `required_institution` ada di
  `form-validator.ts`, dan `getFormData()` hanya membaca field yang tidak `disabled`.
- Di luar rencana awal: seluruh JavaScript di `frontend/src/pages/campaigns/pijak` dikonversi ke
  TypeScript atas permintaan owner, termasuk dua `@vite` di Blade. Global `window.validateForm` dan
  `window.initFormValidator` dihapus karena tidak dipakai di luar Pijak.
- Diverifikasi e2e di browser untuk tiga kategori sampai halaman Pengumuman: Not Eligible (S1,
  dropdown kampus), Progressive (SMK, dropdown sekolah), dan Intensive (Professional, teks wajib).
- Batasan yang diketahui: autosave hanya mendengar event `input`, jadi memilih dari select2 tidak
  memicu autosave draf sampai ada ketikan lain. Ini perilaku lama semua select2 di form ini.

---

## 7. Ubah label opsi sumber informasi "Kampus (Roadshow...)"

**Temuan UAT:** ubah "Kampus (Roadshow, Info Dosen, Blogpost/Group Kampus)" menjadi
"Sekolah/Kampus (Roadshow, Info Guru/Dosen, Blogpost atau Grup Sekolah/Kampus)".

**Kondisi saat ini:** `other-info.blade.php:101` — array key dan label memakai string literal yang
identik: `'Kampus (Roadshow, Info Dosen, Blogpost/Group Kampus)' => 'Kampus (Roadshow, Info Dosen,
Blogpost/Group Kampus)'`.

**Perbaikan:** ganti key dan label langsung ke string baru. Key === label memang berarti jawaban
lama tidak akan match string baru, tapi Pijak 2027 masih tahap development dan belum punya data
registran, jadi tidak ada diskontinuitas yang perlu ditangani dan tidak perlu key stabil terpisah.
Tidak ada keputusan yang menahan item ini.

**Hasil implementasi (branch PR E):**
- `other-info.blade.php`: key dan label sama-sama diganti ke string baru.
- Di luar rencana awal: `Pijak2027ParticipantsExportHandler` memetakan string `knows_from` ke kolom export
  "Sumber Info: Kampus". Tanpa pembaruan mapping, peserta yang memilih opsi baru mendapat sel kosong. Mapping
  diperbarui ke string baru, dan `PijakExportParticipantsCommandIntegrationTest` disesuaikan.

---

## 8. Format teks konfirmasi kirim formulir

**Temuan UAT:** teks konfirmasi perlu newline + bold pada baris kedua:

```
Pastikan seluruh informasi yang Anda isikan telah benar dan lengkap.
**Data tidak dapat diubah setelah dikirim.**
Jika Anda yakin data sudah sesuai, silakan lanjutkan dengan mengirim formulir.
```

**Kondisi saat ini:** `sections/registration-form/preview-modal.blade.php:12-15` — satu `<p>` berisi
ketiga kalimat digabung tanpa `<br>`/`<strong>`.

**Perbaikan:** murni markup — pecah jadi 3 baris dengan `<br>`, bold baris kedua pakai `<strong>`.
Sudah diverifikasi lewat browser (modal "Konfirmasi Registrasi") — teksnya persis seperti yang
dirujuk UAT.

---

## 9. Alert IBM Course — pisah jadi warning + danger

**Temuan UAT:** alert `dcd-alert-info` untuk course IBM diubah ke tema merah (`dcd-alert-danger`).
Teks catatan "Apabila Anda ingin diterima di Beasiswa Intensif, salah satu syaratnya adalah
menyelesaikan seluruh kelas di bawah ini." dikeluarkan jadi alert warning terpisah. Jadi total 2
alert: warning (catatan) dan danger (list course). Tombol course di dalam alert danger juga
dibuat merah (`dcd-btn-danger`).

**Kondisi saat ini:** `administration/index.blade.php:113-179` — satu `<div class="dcd-alert
dcd-alert-info dcd-alert__rounded-4">` membungkus baik paragraf catatan (114-117) maupun `<ol>`
8 course (118-178).

**Kelas CSS sudah tersedia:** `dcd-alert-warning` dan `dcd-alert-danger` sudah dipakai di tempat lain
(`app/views/ui/newacademysubmissions/show.blade.php:186`,
`elevate/referral-leaderboard.blade.php:130`) — **tidak perlu CSS baru**.

**Perbaikan:** split satu div jadi dua, pindahkan paragraf catatan ke `dcd-alert-warning`, ganti
class div course-list ke `dcd-alert-danger`, dan ganti tombol course dari `dcd-btn-primary` ke
`dcd-btn-danger`. Di dalam `.campaign-card`, `.dcd-btn-danger` ditimpa jadi pink pucat
(`campaign-card/style.scss:47`), jadi perlu override scoped `.campaign-card .dcd-alert-danger
.dcd-btn-danger` di `pijak/style.scss` supaya kembali merah solid.

---

## 10. Restyle section IBM jadi checklist card

**Temuan UAT:** "Pendaftaran Akun IBM SkillsBuild" dan "Selesaikan Course IBM SkillsBuild" diubah
gayanya menyerupai "Ikuti Tes Penilaian" dan "Unggah File Surat" yang sudah checklist-style.

**Kondisi saat ini (semua di `administration/index.blade.php`):**
- Target style sudah ada di file yang sama: baris 222-306, pakai `.campaign-card` +
  `.campaign-card__title` + `@include('ui.v3.campaigns.components.icons.green-checklist'|'unchecked')`.
- Dua section yang mau diubah (baris 32-89 dan 91-202) masih pakai pola lama
  `.custom-accordion.card` + collapse.

**Perbaikan:** restyle markup kedua section itu ke pola checklist. **Bukan copy-paste murni** —
kedua section masih punya form field aktif (input email, checkbox acknowledge), bukan sekadar baris
checklist statis, jadi perlu adaptasi markup, bukan reuse verbatim.

**Keputusan implementasi:** section course IBM panjang tapi tim ops tetap ingin ikon centang, jadi
card tetap `.campaign-card` dengan ikon di judul, dan hanya daftar 8 course (alert danger) yang
dibungkus Bootstrap `collapse` dengan toggle "Lihat daftar 8 course". Terbuka saat belum submit,
terlipat setelah submit. Paragraf pengantar dan alert warning tetap terlihat. Terkait erat dengan item 11 —
sebaiknya dikerjakan bersamaan karena section yang sama akan dipecah strukturnya di item 11.

---

## 11. Tiga tahap reveal syarat administrasi

**Temuan UAT:** ubah alur "Lengkapi Syarat Administrasi" jadi 3 tahap berurutan:

1. User isi email IBM SkillsBuild + centang acknowledge (akun di bawah yayasan Dicoding) → klik
   simpan → baru section berikutnya muncul.
2. Section "Selesaikan Course IBM SkillsBuild" muncul, "Ikuti Tes Penilaian" dan "Unggah File Surat"
   masih tersembunyi → setelah disimpan, baru lanjut ke tahap 3.
3. "Ikuti Tes Penilaian" dan "Unggah File Surat" muncul bersamaan → setelah keduanya berhasil
   disimpan, baru tombol "lanjut ke langkah berikutnya" muncul.

UAT menduga pola ini sudah pernah ada di Pijak versi lama (mengacu ke desain lama), berdasarkan
screenshot step-sidebar dengan checklist bertahap (✓ Isi Formulir Registrasi, ✓ Lengkapi Syarat
Administrasi, ● Unggah Dokumen dengan 2 sub-item, 🔒 Pengumuman).

**Koreksi asumsi:** flow IBM lama **tidak** menerapkan reveal-bertahap ini. Diverifikasi di
`ibm/registration/sections/administrative-requirements/index.blade.php` — 3 section (course
enrollment, assessment, recommendation-letter) ditampilkan **sekaligus**, dengan teks eksplisit
"Anda dapat menyelesaikan ketiga tugas tersebut dalam urutan apa pun." Screenshot yang dirujuk UAT
sebenarnya berasal dari widget **lain** — step-sidebar keseluruhan step registrasi di
`ibm/registration/sections/upload-documents/documents-upload-section.blade.php`, bukan breakdown
internal step "Lengkapi Syarat Administrasi". Cocok sebagai referensi visual (gaya checklist), tapi
**bukan prior art** untuk logic sequencing yang diminta — ini pekerjaan baru, bukan "kembalikan
fitur lama".

**Kondisi saat ini:**
- Satu `Form::open(...)` (baris 25-30) mem-posting ke satu route
  (`pijak2027.registration.administration.store`), satu tombol "Simpan" (204-210) yang di-gate satu
  flag `$isSubmitted = $vm->isAdministrationSubmitted()` (baris 5).
- `PijakViewModel::isAdministrationSubmitted()` = `getIbmAccountEmail() !== null` — satu field DB
  dipakai sebagai proxy tunggal untuk "seluruh step submitted".
- `shouldShowIntensiveSteps()` = `isIntensiveParticipant() && isAdministrationSubmitted() &&
  !isRegistrationClosed()` — men-gate section assessment + upload sekaligus.
- Backend: `PijakAdministrationStoreAction` menerima ketiga field (`ibm_account_email`,
  `ibm_account_org_agreement`, `has_completed_at_least_one_ibm_course`) dalam **satu request**, ke
  satu `PijakAdministrativeRequirementSpecification`. **Tidak ada jalur partial-save** — tidak bisa
  simpan email+agreement saja dan biarkan course-completion masih kosong.

**Scope pekerjaan:**
1. Pisahkan `PijakAdministrationStoreAction`/`PijakAdministrativeRequirementSpecification` jadi
   minimal 2 operasi simpan independen: (a) email+agreement, (b) course-completion. Kemungkinan
   **tidak perlu kolom DB baru** — email/agreement dan course-completion sudah jadi field terpisah
   di baris yang sama, tinggal biarkan disimpan di waktu berbeda.
2. Route baru per tahap (atau AJAX partial-save ke satu route dengan payload berbeda).
3. Ganti `isAdministrationSubmitted()` (satu flag) jadi minimal 2 flag granular: "tahap 1 selesai"
   (email+agreement non-null) dan "tahap 2 selesai" (course-completion non-null). Update
   `shouldShowIntensiveSteps()` mengikuti flag baru.
4. Frontend: pecah satu form jadi 3 section yang submit independen, reveal berjenjang sesuai flag
   di atas.
5. Digabung dengan restyle item 10 karena menyentuh file dan section yang sama.

**Ini backend rework nyata, bukan sekadar reveal Blade** — sebaiknya jadi unit kerja/PR tersendiri
dengan test plan sendiri, terpisah dari batch quick-fix lainnya.

**Hasil implementasi (PR #5947):**
- Tahap disimpan lewat satu route, satu action, dan satu `PijakAdministrativeRequirementSpecification`
  dengan field `stage` (`ibm_account` atau `ibm_course`) dan aturan `required_if:stage,...`, mengikuti
  preseden `ScholarshipInstitutionSpecification`. Rencana dua route/spec terpisah tidak dipakai.
- Tahap course ditolak sampai akun IBM tersimpan (`PIJAK.ADMINISTRATIVE_REQUIREMENT.IBM_ACCOUNT_NOT_SUBMITTED`).
- Penanda tahap course adalah keberadaan key `has_completed_at_least_one_ibm_course`, bukan nilainya,
  jadi jawaban "Tidak" juga membuka tahap berikutnya. Tidak ada kolom baru dan tidak perlu backfill:
  peserta lama sudah punya ketiga key.
- Untuk progressive, `isDone()` sekarang butuh akun IBM dan jawaban course, jadi tombol "Ke langkah
  berikutnya" muncul setelah tahap 2. Untuk intensive, kartu tes dan surat muncul setelah tahap 2.
- Tambahan di PR yang sama: email, persetujuan, dan jawaban course wajib di server (`required_if`,
  `in:1`) dan divalidasi inline di client (`pijak/administration/index.js`), tanda `*` merah pada
  checkbox tanpa heading, dan perbaikan halaman registrasi yang bergetar saat hampir tidak bisa di-scroll
  (spacer navbar di `campaigns/style.scss`).
- Akar masalah getaran: `fixed-top-on-scroll.js` mengeluarkan navbar dari alur saat scroll, sehingga
  tinggi dokumen turun di bawah viewport pada halaman pendek. Spacer 82px menggantikan tinggi itu.
- Submit yang gagal validasi client harus menghentikan propagasi event, karena `submitButton.js`
  menonaktifkan semua tombol pada setiap event `submit` yang naik ke `body`.
- Celah lama yang belum ditutup: spec tidak mengecek kategori `not_eligible` untuk POST langsung.

---

## 12. Field timezone bocor ke summary/export untuk peserta non-intensive

**Temuan UAT:** field zona waktu semestinya hanya muncul untuk peserta intensif, tapi ternyata masih
muncul di summary konfirmasi (dan menurut laporan, sampai ke export) untuk peserta progressive.

**Root cause terverifikasi** (browser test via chrome-devtools: daftar sebagai peserta progressive —
sedang menempuh pendidikan, SMK, Bandung, WNI, Indonesia — isi formulir lengkap, klik "Kirim
formulir"):

Modal konfirmasi menampilkan **"Zona waktu Anda saat program mulai" → "WIB (Waktu Indonesia
Barat)"** meski field ini secara visual disembunyikan (`#intensiveOnlyFields { display: none }`)
sepanjang pengisian form.

Penyebab: dua fungsi independen di `frontend/src/pages/campaigns/pijak/registration-form.js` yang
tidak saling terhubung:
- `toggleIntensiveOnlyFields()` (baris 61-76) — benar menyembunyikan wrapper visual field timezone
  untuk peserta non-intensif.
- `setupTimezoneUpdater()` (baris 88-119) — mengisi `#timezone` (hidden input yang ikut ter-submit)
  setiap kali kota dipilih, **tanpa cek eligibility sama sekali**. Field-nya tersembunyi secara
  visual, tapi hidden input tetap terisi dan ikut di body form submission — karena itu bocor sampai
  ke penyimpanan data dan (sesuai laporan) ke export.

**Perbaikan:** gate `updateTimezone()`/`handleCountryChange()` di `setupTimezoneUpdater()` dengan
pengecekan eligibility yang sama (`isIntensiveEligible()`), atau paling sederhana: kosongkan
`#timezone` setiap kali `#intensiveOnlyFields` disembunyikan. Perubahan kecil, satu file frontend,
tidak menyentuh backend. Tidak perlu data cleanup karena belum ada data registran.

---

## Pembagian PR

**PR A: `[Improvements][Pijak]` Registration form quick fixes** (item 12, 2, 3, 5, 8)
Branch `improvements/pijak/registration-form-quick-fixes`, dari `origin/master`. Item 12 (bug timezone bocor ke
data non-intensif) digabung dengan perbaikan kecil lain karena tidak berbagi file dan sama-sama berisiko rendah.
Perkiraan 6-9 file.

**PR B: `[Improvements][Pijak]` Restyle section syarat administrasi jadi checklist** (item 9, 10)
Item 9 (pisah alert IBM jadi warning + danger) dipindah dari PR A ke sini karena alert-nya berada di section yang
di-restyle item 10 (`administration/index.blade.php` baris 91-202), sehingga akan konflik kalau dipisah. Restyle
visual murni tanpa perubahan behavior, jadi fondasi markup yang bersih untuk PR C. Perkiraan 1-2 file.

**PR C: `[Feature][Pijak]` Three-stage reveal untuk syarat administrasi** (item 11, di atas PR B)
Rework backend sesungguhnya: split store action, flag granular "stage selesai" baru, logic reveal frontend. Perlu
review dan test plan sendiri, tidak digabung ke PR B supaya restyle tidak tenggelam. Perkiraan awal 12-18 file;
hasil akhirnya PR #5947 (risiko High, satu route dengan `stage`), sekitar 14 file non-generated.

**PR D: `[Feature][Pijak]` Conditional institution field by participant status** (item 6, di atas PR C)
Hasil akhirnya PR #5963 (risiko medium), bertumpuk di atas PR #5947 karena berbagi area form registrasi
dan bundle. Tidak ada endpoint baru: memakai `ScholarshipInstitutionFilter` yang sudah dipakai campaign
lain, dan skema `scholarship_universities` sudah dicek (satu daftar tanpa pembeda jenjang). Sekitar 13 file
non-generated (1 PHP, 2 test, 3 Blade, 7 TypeScript), termasuk konversi seluruh JavaScript Pijak ke
TypeScript. Perkiraan awal 12-18 file. Setelah PR #5947 di-merge, base PR ini perlu diganti ke master.

**PR E: `[Improvements][Pijak]` UAT timezone, birth year warning, and source label** (item 1, 4, 7)
Branch `improvements/pijak/uat-timezone-birthyear-source-label`, PR #5966 (draft, base `feature/pijak/conditional-institution-field`). Tiga item kecil yang sebelumnya
ditahan: keputusan item 1 (input disabled) dan item 4 (konstanta umur `<= 6` terhadap `age_reference_date`) sudah
turun, dan item 7 tidak lagi ditahan. Item 7 juga menyentuh export (`Pijak2027ParticipantsExportHandler`).

### Ditahan, belum jadi PR

Tidak ada. Seluruh 12 item sudah dikerjakan.
