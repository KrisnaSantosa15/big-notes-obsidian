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
Untuk memudahkan dalam proses pembuatan sertifikat.
Thanks to: Mas Alfian.

## GSA Automation V2:
Ada beberapa automation yang dibuat untuk mempermudah dalam proses penilaian GSA. Ada Social media profile sampai ke Self Aspiration dengan berbagai speed dari masing-masing automation. Hadirnya tool ini memangkas waktu yang sangat lama yaitu sekitar 600 jam.
Thanks to: mas Fikri, Rafy dan Alfian.

## Weekly Recap ILT feedback:

Instructors no longer need to wait for the weekly recap email, as weekly feedback has been fully integrated into the APD Dashboard and now syncs automatically with Student and Facilitator feedback in real time

## Infrastructure:

### (1):

#### Self-Hosting Chatwoot
- Permintaan dari pak HR karena chatwoot cloud kemahalan untuk 2 agen saja.
- Sudah dideploy ke nomad, ke chatwoot.dicoding.net
- Stack postgres, redis, s3, rails, sidekiq (queue manager / mirip laravel horizon)
- Sayangnya beberapa fitur masih dikunci, butuh berbayar dan harganya dihitung per agen juga

#### Snapshotting Dynomite/Redis
- Baru saja selesai! Mengimplementasikan baked snapshot sehingga lebih cepat saat butuh node tambahan (scale up)
- Integrasi dengan consul untuk update peers node. Begitu ada node dynomite baru, dynomite lain akan dikabari dan masuk ke cluster

#### Dicoding DB SQL Chat
- Development menggunakan VannaAI + RAG diubah menjadi Hono + AI SDK + JSONLD via Tool Calling dengan pendekatan Backend Service.
- Untuk UI pengguna kita akan

### (2):

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
