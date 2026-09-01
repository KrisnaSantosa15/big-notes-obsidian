https://docs.google.com/presentation/d/1ECTdIUm70ys79mbk_LOVer_FHP7twskCmcj6dTjdHMM/edit

Assalamualaikum.
Halo selamat pagi semuanya.

Untuk yang belum kenal aku, perkenalkan aku Krisna Santosa yang akan share terkait progress yang ada di tim engineering selama satu bulan terakhir ini.

Setidaknya ada 8 hal yang akan kita bahas, jadi. Mari kita mulai.

## Classroom V4:
Yang pertama datang dari Classroom. Disini, classroom student telah melalui beberapa proses perubahan dengan segala fiturnya dan sekarang kita sudah berada di versi 4 dengan beberapa fitur baru seperti
1. Learning with AI: User dapat berdiskusi langsung dengan chatbot, harapannya student dapat mendapatkan penjelasan lebih jauh terkait modul yang sedang dipelajari. Thanks to: mas Rafy, Alex, Najib.
2. SABAK: user dapat langsung praktek terkait project yang sedang dikerjakan dengan Editor, Terminal dan Notebook tanpa harus install apapun, cukup klik nanti langsung muncul environmentnya. Thanks to: mas Fikri, Hasbi, Dimas.
3. Ketiga ada Add Ons. Nah kedua fitur yang disebutkan tadi adalah fitur berbayar yang student bisa beli dengan mekanisme Add On melalui uang atau dicoding points. Thanks ke para reviewer: mas Alex, Agis, Dimas.

Masih tetap di classroom, Ada 2 fitur lainnya yaitu:
1. Text to Speech. kini user dapat belajar tidak hanya melalui teks, tapi juga bisa mendengarkan penjelasan dari modul tersebut. Saat ini baru dirilis di kelas Belajar Dasar AI dan kedepannya akan diperluas ke kelas lainnya. Thanks to: mba Farida, mas Alfian, Rafy dan tim terkait.
2. Learning Time Tracker. Selain itu, kini user juga bisa melakukan tracking waktu berapa lama modul itu dikerjakan. Ini akan membantu siswa ataupun evaluasi bagi tim academy dalam memprediksikan berapa lama seharusnya suatu modul/kelas itu dapat diselesaikan. Thanks to: mas Ikhlas

## Bitt:
Micro learningnya dicoding, saat ini masih dalam tahap pengembangan, ada beberapa progress yang sudah dikerjakan diantaranya terkait:
1. Design system: ini adalah komponen-komponen yang bisa digunakan kembali sehingga ketika proses development cukup mendefinisikan sekali nanti bisa di-reuse.
2. application Sheel: ini adalah layout utama dari aplikasi web nya ada header, navigation, footer, dll
3. CMS: Content Management System -> tempat tim untuk manage kelas, tags, modules dan hal lainnya.

Thanks to: mas Alex, Hasbi, Najib, mba Rully dan tim terkait.

## Email Platform:
Background
Revamp email platform bertujuan agar Email Administrator bisa melakukan draft, tracking dan penjadwalany pengiriman email tanpa harus stay terus menerus di tab browser. Juga membawa beberapa fitur penting dari SheetMailer, seperti substitusi variabel. Serta juga agar bisa diaudit dan transparan antara pengiriman email campaign.

Status saat ini : Sudah rilis dan sedang dalam tahap ujicoba pairing pada beberapa email Campaign
Ujicoba 31 Agustus - 11 September, sebelum dilepas sepenuhnya…

Announcement dan briefing lebih khusus ada di hari Jum’at. Terkait development lainnya yang berhubungan dengan integrasi email platform Cantika akan diinformasikan kemudian…

Thanks to: mas Alex dan tim ops.

## Certificate Generator:
Sertifikat generator sudah hampir selesai untuk diintegrasikan dengan dicoding, sekarang internal dicoding sudah bisa membuat sertifikat baru, untuk membuatnya bisa cek di link berikut **[https://certificate.dicoding-ai.dev/](https://certificate.dicoding-ai.dev/)** 

Saat ini masih dalam tahap testing, kedepannya ada rencana juga untuk migrasi METC dan coding camp alumni yang terbaru.

Thanks to: Mas Alfian.

## GSA Automation V2:
Ada beberapa automation yang dibuat untuk mempermudah dalam proses penilaian GSA. Ada Social media profile sampai ke Self Aspiration dengan berbagai speed dari masing-masing automation. Hadirnya tool ini memangkas waktu yang sangat lama yaitu sekitar 600 jam.
Thanks to: mas Fikri, Rafy dan Alfian.

## Weekly Recap ILT feedback:

Para instruktur tidak perlu lagi menunggu email rangkuman mingguan, karenaweekly feedback telah sepenuhnya terintegrasi ke dalam APD (Academic Program Dashboard) dan sekarang secara otomatis sync dengan feedback dari student dan fasil.

Thanks to: mas Ikhlas.

## Infrastructure:

### (1):

- Development menggunakan VannaAI + RAG diubah menjadi Hono + AI SDK + JSONLD via Tool Calling dengan pendekatan Backend Service.
- Untuk UI pengguna kita akan menggunakan browser extension sehingga bisa dengan mudah digunakan bersamaan dengan metabase

Saat ini ketika menggunakan metabase kita harus tau SQL/query untuk mendapatkan data tapi tidak semua orang bisa untuk menuliskan query. alhasil dibuat extension untuk memudahkan kita dalam proses mencari data yang relevan hanya dengan prompt, misalkan cari nama user krisna, maka dia akan translate prompt tersebut menjadi SQL misalkan `select * from users where username=krisna`

Thanks to: mas Abdul.

### (2):

Ini sangat menarik, jika teman-teman ngeuh, kemarin tanggal 1 september jam **06.14 - 08.07** dicoding itu down.  Ternyata setelah diinvestigasi, ubuntu melakukan auto update terhadap library/package yang digunakan oleh mariadb/database. semua database di dicoding itu direstart dan alhasil dicoding down, padahal restart database itu tidak boleh direstart semua sekaligus, harus satu satu dan harus hati-hati apalagi jika ada lonjakan request. 

Selain itu ketika proses update database juga gagal karena timout, lama melakukan restartnya. Solusi yang sudah dilakukan tim infra adalah dengan menerapkan proteksi auto update & restart pada komponen mariadb, security update tetap berjalan. selain itu tim infra sedang evaluasi alternatif untuk manajemen incident supaya lebih baik lagi.

#### Root Cause
- Server database mati secara bersamaan akibat update sistem otomatis ubuntu yang berjalan di pagi hari. Kemudian, database di-restart secara bersamaan oleh sistem. Sementara, database kita itu harus di-restart satu-satu dengan hati-hati.
- Package yang di-update bukan mariadb tetapi dependensi pihak ketiga yang dipakai oleh mariadb.

#### Solusi
- Menerapkan proteksi auto update & restart pada komponen mariadb.
- Security update tetap berjalan otomatis.

#### Temuan
- Proses buffer scan 16gb berjalan lama, butuh ~5 menit untuk sekali loop restart.
1. Setelah ditelusuri, proses ini memang sudah pilihan yang baik.
2. Data yang tersimpan pada buffer, cukup untuk menangani toleransi kegagalan sistem dengan durasi yang lebih lama.
3. Apabila kita menurunkan buffer ini, artinya waktu toleransi kegagalan semakin sempit dan dapat berakibat full copy(>5 menit).
- Response sangat-sangat telat karena terdistraksi dengan notif lainnya yang ada di google chat. Saat ini, tim Infra sedang mengevaluasi beberapa alternatif incident on call platform, seperti grafana oncall, [incident.io](http://incident.io), [incidentrelay.io](http://incidentrelay.io), [xurrent.com](http://xurrent.com), dan spike.sh

Thanks to: mas Habibi, Abdul, mba Farida.