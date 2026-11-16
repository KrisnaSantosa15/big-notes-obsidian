---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, backlog, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# WIP PIJAK 2027

1. Narasi dan gambar bagikan ke linkedin perlu diperbarui
2. Extramiles:

    - Validasi Email SkillBuild

      Better mana untuk menyimpan 30rb email untuk diblacklist sebagai validasi bahwa email tersebut sudah digunakan di program IBM sebelumnya. "email yang Anda masukkan sudah pernah terdaftar di sismte kami, silakan untuk mendaftarkan/menggunakan email baru"

      Card: <https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10285192040>

    - Email miss-leading "program selesai" ketika token MCT untuk kelas filtering habis.

      Card ini sudah diambil oleh bang Dimas: <https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10285196202>

    - Tambahan button untuk user yg offeringnya sudah expired ajukan permohonan offer ulang.

      daripada upload ulang offering, tim ops mau ada button yang bisa di klik untuk melakukan offering kembali, jadi tim ops tinggal buka sebuah halaman dan klik re-offer. Tapi bagaimana cara kita menyimpan data re-offer ini? di halaman admin? atau di mana? Solusi: gunakan export untuk melakukan export data yang re offer, nanti tim ops tinggal re offering pakai offering lagi?

      cek komentar di card basecamp ini juga: <https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10285207796>

    - Preview data LoA dan edit jika ada yang tidak sesuai secara mandiri oleh Cohort.

      Blm paham apa maksudnya.

    - Reminder pengisian cohort data jika dalam 24 jam belum diisi oleh peserta. email reminder ketika user klik tombol menerima offering tidak boleh langsung dikirimkan, tapi tunggu sampai 24 jam, jika lewat dari itu maka kirimkan emailnya.

      Ini bisa diimplementasikan dengan artisan command, tapi harus ditrack kapan user klik tombol terima offering tersebut dan jika pakai command yang berjalan 24 jam sekali: bisa saja user klik tombol offering itu ketika command nya sudah berjalan 3 jam yang lalu, dan ketika sudah 24 jam kemudian (command triggered lagi), posisi dari offering user tersebut belum 24 jam, otomatis dia akan mendapatkan email 48 jam kemudian (trigger kedua).

      cek card basecamp ini: <https://3.basecamp.com/5135326/buckets/44666023/card_tables/cards/10355580308>

3. Cek dan konfirmasi Narasi email autoreply dengan brief
4. Cek dan konfirmasi Kode/list courses IBM
5. Cek dan konfirmasi Narasi offering/pengumuman
6. Tambahkan Cron job untuk export setiap Jam: 07.00 WIB pagi & 14.00 siang (ketika sudah live di production)
7. Cek dan konfirmasi Narasi di pengumuman Meunggu Hasil Seleksi
8. Instansi kosong di surat komitmen juga kosong bukan -, harusnya "-" jika user tidak mengisi. perlu e2e testing dulu untuk membuktikan
9. Nilai dari hasil exam ini nanti mau disimpan di mana? Selain itu exam harusnya kan ada 2 tapi di lokal ini cuman satu tapi masih bisa ceklis, perlu cek lagi kode dan implementasi campaign lain.
10. Export itu harus dengan hasil nilai assesment, `exportParticipantsByProgramIdAndCategoryWithAssessmentScore` contohnya.

    ini contoh bagus: `Dicoding/Infrastructure/GlobalJobPushedHandlers/Scholarships/PijakParticipantsExportHandler.php`

    atau ada juga versi lain yaitu coding camp:

    - `CodingCampParticipantsExportHandler`
    - `CodingCampProgressiveV3ParticipantsExportHandler`

    Yang coding camp, sheet nya itu ada

    Mahasiswa (Diploma), Mahasiswa (S1), Umum, Siswa SMK, Surat Komitmen, Offering & Cohort Data, Surat Rekomendasi, Pendaftaran Parsial.

    Mungkin kita bisa adopsi itu ke Pijak 2027 dengan:

    Intensive Eligible (Young Adults), Progressive Eligible (Vocational Students), Not Eligible. di ketiga itu ada nilai assesment yang bisa diambil, Pendaftaran Parsial (yang tidak submit, cuman ada di auto save), Surat Komitmen, Offering & Cohort Data, Re-offer Request (Belum tau apakah mau ada data di sheet atau tidak? dan mekanismenya pakai command?).

    Ini weight scoring campaigns:

    <https://docs.google.com/spreadsheets/d/1sMQKMTY9Xd6M0gjHfl1S07kshckvWCrIQaAOQmq4TRU/edit?gid=32785611#gid=32785611>

    Isinya adalah Question ID, Choice ID, Score weights dan combined ids untuk perhitungan traits.

    cek direktori `docs/domains/pijak2027/export_references`

    Coding Camp:
    https://docs.google.com/spreadsheets/d/1ygmG1Qga9n56pIVgDdGwKLwVzPsnQLdH3gI_tfinMo0/edit

    `docs/domains/pijak2027/export_references/coding_camp_2026_powered_by_dbs_foundation_participants - (*).csv`

    Weight Scoring Campaigns:

    `docs/domains/pijak2027/export_references/Weight Scoring Campaigns - Pijak - Assessment Traits.csv`

    atau bisa juga versi xlsx nya langsung agar lengkap.

    Export Participants:

    `deck art scholarships:pijak:export-participants` atau `deck art scholarships:pijak2027:export`, perlu pertimbangan ketika membuatnya. apakah wajar ada angka di sebuah nama function/file.

11. Fitur pengumuman per batch untuk peserta progressive (nanti list nya diberikan oleh tim ops) mendapatkan email+buka pengumuman+auto enroll per batch. Ini entah lewat command+user id dari stdin, atau command+sheet terpisah yang diberikan oleh tim ops per batch per sheet. Perlu cek apakah ada pendekatan yang mirip terkait hal ini di codebase.

    sebetulnya ada command untuk pijak lawas yaitu:

    `deck art feature:toggle enable pijak-final-selection-result --users=123,11...` tapi gatau apakah ini bisa digunakan kembali (sesuai dengan case pijak sekarang?) ato tidak.

12. setelah peserta intensive menolak offering apakah langsung jadi peserta progressive? nanti ada email+pengumuman berubah+auto enroll seperti progressive juga?
13. Tambahkan narasi ini di modal cara mengetahui akun organisasi IBM SkillsBuild di bawah gambar

    > Bagaimana Jika Belum Terdaftar di "Yayasan Dicoding Indonesia"
    >
    > Daftar ulang dengan email baru melalui: dicoding.id/Pijak-AksesIBM

## STATE PENGUMUMAN:

- Eligible: menunggu, dapat offering, terima offering, tolak offering, tidak menonfirmasi offering, setelah isi form cohort data.
- Progressive: menunggu, hasil akhir pengumuman diterima progressive
- Not Eligible: pengumuman akhir tidak diterima

## TODO in sandbox:

- [ ] Edit config scholarship untuk sandbox
- [ ] Tambahkan service account di sandbox env agar bisa export data
- [ ] Coba lakukan `deck artisan feature:toggle enable pijak-final-selection-result --users=307` di sandbox
- [ ] Buat partners program baru agar di bisa digunakan untuk config
- [ ] cek mailpit

## TEMUAN:

- Cek bagaimana jika user belum menyelesaikan tes pleatihan dan unggah file surat tapi diberikan offering. apakah tetap harus menyelesaikan atau malah bisa bypass ke pengumuman untuk terima/tolak offering?

## CATATAN:

1. Untuk not eligible dan progressive itu kan kita bisa langsung tau dari hasil form registrasi.

    nah, email registrasi untuk kedua kategori tersebut langsung dikirimkan dan dengan jelas menyebutkan bahwa kategori not eligible tidak dapat diterima. Berati setelah mendapatkan email tersebut kan pendaftarannya langsung diarahkan ke pengumuman dan narasi pengumuman berubah menjadi ditolak ya? jadi tidak harus nunggu dulu.

    **Jawab: Ya.**

2. Not eligible benefitnya adalah:

    Dia mendapatkan satu kelas dicoding, kaish tau di bagian pengumuman dan di email.

    Tapi: ketika AI camp dan bitt ready, benefit not eligible dari satu kelas dicoding berubah menjadi 2 kelas bitt, tapi butuh sinkronisasi dengan platform bitt.

    di pertangahan akan ada perubahan pengumuman dan email untuk pergantian dari 1 kelas dicoding ke 2 kelas bitt.

    Ketika peserta berstatus not eligible dan ketika AI camp belum ready maka emailnya adalah 1 kelas dicoding yang auto enroll.
    Untuk yang not eligible tidak perlu nunggu pengumuman, langsung saja ke pengumuman bahwa dia tidak eligible. Ini hal yang baru dari implementasi sebelumnya.

    peserta not eligible langsung dapat email dan langsung dapat pengumuman bahwa dia ditolak tanpa harus menunggu.

3. Pijak flash itu pengumumannya ada 2 batch. batch 1 dan batch 2:

    **Pengumuman**

    - Batch 1
        - 5 Mei 2026
    - Batch 2
        - 5 Juni 2026

    Tapi pijak flash itu dilakukan oleh tim ops bukan oleh sistem.

4. Kategori Progressive fallback dari intensive: Menolak offering, offeringnya kadaluarsa, tidak melengkapi cohort data
5. tim ops pengen yang progressive itu dikirimkan per batch (email+buka pengumuman+auto enroll). Ini harus nunggu dulu data dari tim ops, bukan by system langsung dikasih tau bahwa dia adalah progressive. jadi nanti mungkin berdasarkan command yang isinya user id.

    misalkan `command-untuk-progressive --user_id=1,2,3,4,5`

    tapi seberapa banyak argumen yang bisa diberikan? itu jadi masalah jika ada limitasi. apa harus pakai google sheet?

6. tim ops pengen yang not eligible itu langsung dikirimkan email not eligible dan buka pengumuman + auto enroll 1 kelas dicoding.

    Tapi di pertengahan nanti, ketika AI camp dan bitt sudah ready, benefit dari not eligible ini diganti menjadi 2 kelas bitt yang perlu dilakukan sinkronisasi akun antara platform dicoding dan platform bitt. Selain itu, agar bisa auto sync, engineer harus memfilter peserta mana saja yang termasuk ke progressif agar bisa sync secara otomatis. tapi masalahnya kan progresif itu ada beberapa sumber (dari pendaftaran, dari orang yang menolak offering, dari list tim ops). Tapi untuk bitt ini nanti saja. kita fokus ke auto enroll satu kelas dicoding saja.

    Untuk course id yang akan auto enroll itu mungkin bisa kita simpan di config pijak, khusus untuk not eligible.
    Sekarang itu not eligible akan dikirimkan email saja dan langsung ke pengumuman tapi isinya adalah menunggu bukan langsung status.

    Ini sedang dikerjakan di branch `not-eligible-auto-enroll`

7. yang eligible itu fokus ke offering saja (email+pengumuman) tidak perlu ada auto enroll.

    Jadi nanti ketika user dapat offering maka tampilan akan berubah menjadi tmapilan terima/tolak offering, jika klik terima maka muncul di pengumumannya bahwa dia menerima dan siap untuk mengisi cohort form. Jika menolak berati muncul tampilan menolak (apakah langsung jadi progressive seperti kasus nomor 12?).

8. untuk email ketika user klik tombol menerima offering bukan langsung dikirimkan, tapi tunggu sampai 24 jam, jika lewat dari itu maka kirimkan emailnya.

    Ini bisa diimplementasikan dengan artisan command, tapi harus ditrack kapan user klik tombol terima offering tersebut dan jika pakai command yang berjalan 24 jam sekali: bisa saja user klik tombol offering itu ketika command nya sudah berjalan 3 jam yang lalu, dan ketika sudah 24 jam kemudian (command triggered lagi), posisi dari offering user tersebut belum 24 jam, otomatis dia akan mendapatkan email 48 jam kemudian (trigger kedua).

9. Ekspektasi Tim Ops

    - 300 yang diterima YA.
    - 600 itu yang di offer

10. Apakah IBM skills build bisa memberikan APIs yang digunakan untuk track kelas, apakah dia sudah lulus kelas tertentu atau tidak?
11. Untuk yang not eligible itu di campaign lain tidak perlu mengubah ke hasil pengumuman, tetap di menunggu saja. Tapi mereka taunya lewat email

## Email Registration Test:

`PijakRegistrationIntegrationTest`

- Not Eligible: `success_to_register_as_not_eligible_candidate`
- Intensive: `success_to_register_as_intensive_candidate`
- Progressive: `success_to_register_as_progressive_candidate`

## Accept Offering Test:

`PijakOfferingAndCohortIntegrationTest`

- Intensive Candidates Accept the Offering: `accept_offering_updates_status_and_redirects_to_announcement`

## Admin Offers to Pijak Eligible Scholarship Participant test:

`ScholarshipOfferingCreationIntegrationTest`

- Normal Deadline: `test_admin_offers_to_pijak_2027_scholarship_candidates`
- Within Deadline: `test_admin_offers_to_pijak_2027_scholarship_candidates_when_deadline_is_today`
