# Pijak 2027 - Perbaikan UAT 2

Rencana dan status perbaikan temuan UAT 2 (2026-11-02). Sumber feedback:
[dokumen UAT 2](https://docs.google.com/document/d/1I9mgo9yyQQUHSu1pjx4Qjr4tFLBym6FzcIIrXbTwoCs/edit?tab=t.ya42mw7fts6e).

Pembagian PR:

- **PR 1** (#6285, branch `improvements/pijak/uat-2-fixes`, risk low): narasi, link, tombol, dan bug kecil. Sudah dibuat,
  menunggu merge.
- **PR 2** (sedang dikerjakan): pertanyaan "background IT" dan pertanyaan pendidikan terakhir. Dua item ini digabung dalam satu
  PR karena memakai pipeline field form yang sama.

## PR 1: selesai (#6285)

| Item UAT | Perubahan |
|---|---|
| Narasi Bitt (email dan halaman Not Eligible) | Kalimat "⏳ Penting: Aktifkan akun Bitt Anda paling lambat 28 Februari 2027..." dan "⏳ Akses kelas berlaku 30 hari sejak akun Bitt Anda terhubung." dicetak bold penuh. Tanggal diambil dari config baru `scholarships.pijak.bitt_activation_deadline`, tidak lagi dihitung dari waktu email terkirim. Placeholder `[tanggal berakhir]` di halaman dihapus. |
| Tombol di email Not Eligible | "Lihat Kelas" dan "Klaim Akses Kelas Bitt" mengarah ke `pijak2027.registration.announcement.index` (variabel mailer `announcement_link`). |
| Judul course Bitt | Diganti "Bangkit dari Titik Paling Bawah (Bitt Inspirational Series)". Akhiran series tetap dipakai. Halaman Not Eligible menautkan ke bitt.id/courses/99 dan /85. |
| Link guideline Bitt | Diganti `dicoding.id/P27-BittGuideline`, hanya di Pijak. Config AI Camp tidak diubah. |
| CTA referral di email | Tombol Pathfinder mengarah ke `https://www.dicoding.com/pijak/referral`. |
| Surat komitmen | "Pekerjaan/Kegiatan Saat Ini" menampilkan `-` jika jawabannya "Tidak keseluruhan" atau kosong (`PijakCommitmentScholarshipLetter`). |
| Syarat administrasi (YA) | Tombol "Ke langkah berikutnya" dipindah ke paling bawah, setelah "Unggah File Surat". |
| Twibbon | Jarak antara headline dan link dirapatkan (`mb-4` jadi `mb-1`). |
| Greeting card LinkedIn | `public/img/pijak/appreciation-card-linkedin.png` ditimpa dengan aset baru. |
| Navbar dashboard registrasi | Link Homepage dan Referral (Tentang Referral, Leaderboard) dibuka di tab baru, berlaku untuk semua campaign karena navbar shared. Homepage Pijak sekarang mengarah ke landing page (`pijak.index`), sebelumnya ke halaman registrasi itu sendiri. |
| Tombol preview Cohort Data tetap disabled | Penyebabnya handler global `commons/scripts/helpers/submitButton.js`. Form cohort (shared Pijak, AI Camp, IBM, Tempa) diberi `data-enable-button-after-submit`. `Form::` dimigrasi ke `<form>` biasa dengan `@csrf`. Tombol submit final langsung disabled saat diklik supaya tidak terkirim dua kali. Form registrasi Pijak tidak kena bug ini karena memanggil `preventDefault()` pada klik. |

Item yang diputuskan tidak dikerjakan:

- **Modal "Lihat petunjuk" terbuka otomatis:** sempat dibuat, lalu dibatalkan karena menumpuk dengan modal "Bagikan ke
  LinkedIn" setelah offering diterima. Modal tetap dibuka manual lewat link.
- **Centang persetujuan hilang saat "Perbaiki Data":** ini perilaku bawaan sejak 2025-10-28 di semua campaign, dan tetap
  dipertahankan. PR 1 hanya menambahkan agar tombol submit ikut disabled setelah centang dihapus.

## PR 2: sisa pekerjaan

Pemetaan kode dilakukan pada sesi 2026-11-02. Semua field baru melewati pipeline yang sama dengan
`is_currently_studying`:

1. Blade `registration-form/education.blade.php`
2. `form-validator.ts` (rule dan pesan)
3. `registration-modals.ts` (`orderedFields`, `fieldLabels`, `yesNoFields`)
4. Whitelist `form_data` di `PijakRegistrationStoreAction`
5. Rule dan getter di VO `PijakRegistrationData`
6. Opsional: kolom JSON `education_info` di `PijakGateway::saveRegistration()`
7. `PijakViewModel::getRegistrationSummary()`
8. Header dan baris export di `Pijak2027ParticipantsExportHandler` (`$baseHeaders`, `mapParticipantRow()`)

Tidak perlu migrasi karena data disimpan di JSON `other_requirements`. Fixture test yang memakai payload lengkap perlu
diperbarui jika field-nya `required`.

### A. "Apakah Anda memiliki background IT?" (Ya/Tidak)

Letaknya setelah "Tingkat pendidikan saat ini". Field radio `1`/`0`, wajib diisi.

### B. Pendidikan terakhir (jika "Tidak sedang menempuh pendidikan")

Letaknya setelah "Asal instansi" (setelah `#institutionGroup`). Ketiga field ini hanya tampil dan wajib jika
`is_currently_studying = 0`:

1. "Apa pendidikan terakhir Anda?": dropdown dengan opsi yang sama seperti tingkat pendidikan. Label opsi yang berbunyi
   "Mahasiswa aktif ..." perlu disesuaikan.
2. "Nama Sekolah/Kampus/Institusi pendidikan terakhir": dropdown universitas atau sekolah untuk D1/D2/D3/D4/S1/S2/S3/SMK,
   input teks untuk lainnya. Aturannya berbeda dari field instansi yang sekarang: S2/S3 juga memakai dropdown
   universitas.
3. "Kapan tahun terakhir Anda menempuh pendidikan tersebut?": input tahun dengan batas min/max di sisi klien dan server.

Bagian yang bisa dipakai ulang:

- `toggleConditionalSection` di `registration-form.ts`
- `institution-field.ts` dari PR #5963. Saat ini masih di-hardcode untuk field `institution`, jadi perlu dibuat menerima
  konfigurasi (id container, nama field, select level, mapping level ke mode).
- Tersier action `ScholarshipInstitutionFilter`

### Keputusan (brainstorm 2026-11-02)

- Satu PR, tanpa dipecah domain dan web.
- Nama field: `has_it_background`, `last_education_level`, `last_education_institution`, `last_education_year`.
- Rule server: `has_it_background` `required|boolean`. Ketiga field pendidikan terakhir `required_if:is_currently_studying,0`.
  `last_education_year` `integer`, minimal tahun lahir peserta dan maksimal tahun berjalan.
- Penyimpanan: semua field ikut `other_requirements` lewat `toArray()` dan ditambahkan juga ke `education_info`.
- Opsi pendidikan terakhir: `SD atau sederajat`, `SMP atau sederajat`, `SMK`, `SMA`, `D1`, `D2`, `D3`, `D4`, `S1`,
  `S2/S3/Profesor/Profesi/Spesialis`. Opsi "Cuti/Tidak Aktif/DO" dibuang.
- Mode institusi terakhir: SMK memakai dropdown sekolah, D1 sampai S2/S3 memakai dropdown universitas, sisanya input teks.
- Field "Instansi (Sekolah/Kampus/Perusahaan)" yang lama tetap ditampilkan apa adanya.

## Catatan lingkungan lokal

- `bootstrap/environments/local/scholarships.php` (di-track git) meng-override `scholarships.pijak.program_id` menjadi
  **2208** di lokal. Nilai di `config/scholarships.php` adalah 2250. Data uji lokal harus memakai 2208.
- Halaman admin `/scholarships/offering`: tombol "Kirim Offering" tidak mengirim request (tidak ada POST dan tidak ada
  error di console) saat diuji 2026-11-02. **Ditelusuri 2026-11-05: bug regresi, bukan khusus Pijak.** Sejak commit
  8b271f099ae (2026-10-12, migrasi `components/base/button` ke `@base-ui/react/button`), `Button` dirender dengan
  `type="button"` secara default. Tombol di `offering-import-form.tsx` tidak menulis `type="submit"`, jadi form tidak
  pernah di-submit: validasi zod, modal konfirmasi, dan POST tidak pernah jalan. Dibuktikan di browser: setelah atribut
  diubah ke `submit`, pesan validasi langsung muncul. Form lain yang memakai `Button` di dalam `<form>` sudah menulis
  `type="submit"`.
  Setelah tombol diperbaiki muncul bug kedua: halaman React selalu mengirim `category_code=''`, dan sejak #6138
  (gimmick deadline) `ScholarshipOfferingCreationRepository` memakai `$categoryCode !== null`, sehingga program tanpa
  kategori (Pijak, Asah, IBM SkillsBuild) gagal dengan `Undefined array key "categories"`.
  Kedua bug hanya terjadi jika flag `offering_dashboard_react` aktif. Staging `pijak2027-sb` memakai halaman Blade lama
  yang tidak mengirim `category_code`, dan offering lewat UI di sana normal (diverifikasi 2026-11-05).
  **Diperbaiki di [#6326](https://github.com/dicoding-dev/dicoding/pull/6326):** `type="submit"` pada tombol dan
  `!empty($categoryCode)` di repository, plus test integration yang mem-POST `category_code=''`. Lihat backlog item 49.
- User UAT `uat2pijak@dicoding.local` (id 370) dibiarkan di halaman Cohort Data. Tes Penilaian ditandai lulus langsung di
  DB (`exam_registrations`) dan offering dibuat langsung di DB, lalu diterima lewat UI.
