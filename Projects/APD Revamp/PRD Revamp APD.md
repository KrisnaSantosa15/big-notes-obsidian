## **Ringkasan**

Academic Program Dashboard (APD) akan dipindahkan dari Google Sheets, Apps Script, dan Firebase ke *codebase* Dicoding dengan MariaDB sebagai basis datanya. *Campaign* pertama yang menggunakan sistem baru adalah AI Camp pada Januari 2027\.

Keputusan yang sudah disepakati:

* *Campaign* yang sedang berjalan akan tetap menggunakan APD lama sampai selesai.  
* Tidak ada migrasi data. Sistem baru dimulai dari kondisi kosong. Skema Firestore dan RTDB hanya digunakan sebagai referensi untuk merancang skema MariaDB.  
* Pengerjaan diprioritaskan berdasarkan urutan berikut: fondasi dan fitur wajib terlebih dahulu, ILT Feedback di pertengahan, lalu Capstone pada tahap akhir.

Dokumen ini disusun dalam bentuk *user story*. Setiap *story* dilengkapi *acceptance criteria* sebagai acuan estimasi dan pengujian. Kriteria tersebut masih berupa *draft* dan akan disempurnakan bersama engineer dan Ops saat *grooming*.

**Tujuan bisnis:** menyediakan pengalaman belajar yang terpusat bagi pengguna. Saat ini, informasi dan aktivitas tersebar di berbagai tempat sehingga pengalaman belajar belum berjalan semulus yang diharapkan.

## **Pengguna**

Sistem memiliki lima role akses utama, ditambah Ops yang bertugas menyiapkan *campaign*.

| Peran | Aktivitas di APD |
| ----- | ----- |
| **Student** | Melihat jadwal, *progress*, *announcement*, dan *important links*. Mengisi profil, *feedback*, serta *logbook capstone*. |
| **Fasilitator** | Melihat jadwal dan grup. Memberikan *feedback* kepada *Instructor* dan *Student*. |
| **Instructor** | Melihat sesi dan *teaching resources*. Memberikan *feedback* serta membaca hasil *feedback*. |
| **Lecturer** | Melihat Student yang dibina dan *progress* mereka. |
| **Admin** | Mengelola *campaign*, *announcement*, *important links*, dan konfigurasi *capstone*. |
| **Ops** | Menyiapkan pengguna, grup, jadwal, dan data *progress* untuk setiap *campaign*. Saat ini, proses tersebut dilakukan melalui Sheets. |

## **Epic 1: *Campaign*, pengguna, dan akses**

Fondasi bagi seluruh fitur lainnya. Dikerjakan pada Fase 1\.

### **US-1.1 Membuat *campaign***

Sebagai Admin, saya ingin tersedia halaman khusus di admin Dicoding untuk mengelola *campaign* APD, sehingga seluruh pengaturan *campaign* dapat dikelola dari satu tempat.

Di Dicoding, semua program dan *campaign* tersimpan di tabel `partner_programs`. Admin saat ini sudah memiliki halaman umum untuk menambahkan program baru, tetapi halaman tersebut belum secara khusus mendukung pengelolaan *campaign* APD. *User story* ini bertujuan menyediakan halaman khusus yang menjadi pusat pengelolaan *campaign* APD. Pendekatan implementasinya ditentukan oleh *engineer*.

* *Campaign* APD direpresentasikan sebagai satu baris di partner\_programs, yaitu tabel yang saat ini menampung seluruh program dan *campaign* di Dicoding.  
* Seluruh data, termasuk pengguna, jadwal, *progress*, dan *feedback*, terhubung ke *campaign* terkait.  
* Halaman ini tersedia di admin Dicoding dan hanya dapat diakses oleh *role* Admin. Karena Ops menggunakan *role* Admin, mereka juga mengelola *campaign* melalui halaman ini.  
* Halaman menampilkan daftar *campaign* APD. Admin dapat membuat *campaign* baru (menambahkan baris ke partner\_programs) dan mengelola pengaturannya melalui halaman tersebut.  
* Seluruh pengelolaan *campaign* APD dilakukan di satu tempat. Tidak boleh ada duplikasi data antara halaman khusus ini dan halaman umum yang sudah tersedia.  
* *Campaign* yang sudah memiliki data tidak dapat dihapus.  
* Halaman ini menjadi pusat pengaturan setiap *campaign*. Setelah memilih *campaign*, Admin dapat mengelola pengguna dan grup (US-1.2 sampai US-1.5), jadwal (Epic 2), *progress* (Epic 3), *announcement* dan *important links* (Epic 4), serta konfigurasi *capstone* (Epic 7). Pembagian menu akan dibahas lebih lanjut.  
* Pendekatan implementasi halaman ini, apakah dengan mengembangkan halaman admin yang sudah ada atau membuat halaman baru: **\[perlu diputuskan oleh engineer\]**

### **US-1.2 Menyiapkan peserta *campaign***

Sebagai Ops, saya ingin peserta yang telah mendaftar melalui Dicoding otomatis muncul di APD, sehingga saya tidak perlu memasukkan data mereka kembali.

* Peserta yang mendaftar ke *campaign* otomatis muncul di APD tanpa perlu diunggah oleh Ops.  
* Kategori peserta ditentukan saat pendaftaran dan otomatis tercatat di APD.  
* Informasi yang belum tersedia di Dicoding hanya grup. Ops dapat mengatur grup peserta satu per satu atau secara massal, misalnya melalui CSV.  
* Ops dapat menambahkan peserta ke *campaign* secara manual, baik satu per satu maupun melalui CSV. Peserta tersebut harus sudah memiliki akun Dicoding.  
* Satu orang dapat mengikuti lebih dari satu *campaign*, dengan grup yang dikelola secara terpisah untuk setiap *campaign*.  
* Jika ada baris yang gagal diproses, sistem menampilkan baris tersebut beserta alasan kegagalannya. Baris lainnya tetap diproses.  
* Data pengajar (Fasilitator, *Lecturer*, dan *Instructor*) belum tersedia di Dicoding, sehingga Ops perlu menambahkannya secara manual, baik satu per satu maupun melalui CSV. Admin tidak perlu ditambahkan karena akun Admin sudah tersedia di Dicoding.

### **US-1.3 Mengelola grup dan kategori**

Sebagai Ops, saya ingin mengelola grup (*batch* atau kelas) dan kategori program agar peserta dapat dikelompokkan sesuai dengan programnya.

* Satu pengguna dapat tergabung dalam satu grup atau lebih.  
* Grup dan kategori dapat diubah setelah dibuat.  
* Grup tempat pengguna terdaftar menentukan jadwal yang ditampilkan kepadanya.

### **US-1.4 Memetakan *Lecturer* ke *Student***

Sebagai Ops, saya ingin menghubungkan *Lecturer* dengan *Student* yang dibinanya agar *Lecturer* hanya dapat melihat *Student* yang menjadi tanggung jawabnya.

* Satu *Lecturer* dapat membina banyak *Student*. Setiap *Student* dihubungkan dengan *Lecturer* dari institusinya.  
* *Mapping* dapat diimpor secara massal.  
* *Lecturer* hanya dapat melihat *Student* yang tercantum dalam *mapping*\-nya.

### **US-1.5 Memetakan Fasilitator ke *Student***

Sebagai Ops, saya ingin menghubungkan Fasilitator dengan *Student* yang didampinginya agar Fasilitator hanya dapat melihat dan memberikan *feedback* kepada *Student* yang menjadi tanggung jawabnya.

* Satu Fasilitator dapat mendampingi banyak *Student*. *Mapping* dikelola secara terpisah untuk setiap *campaign*.  
* *Mapping* dapat diatur satu per satu maupun diimpor secara massal melalui CSV. Baris yang gagal ditampilkan beserta alasan kegagalannya, sementara baris lainnya tetap diproses.  
* *Mapping* dapat diubah selama *campaign* berlangsung, misalnya saat terjadi pergantian Fasilitator.  
* Fasilitator hanya dapat melihat *Student* yang tercantum dalam *mapping*\-nya.  
* *Mapping* ini menjadi acuan daftar *Student* pada form *feedback* Fasilitator (US-6.5) dan penentuan varian form *feedback* dua mingguan (US-6.3).  
* Apakah *mapping* dilakukan per *Student* atau mengikuti grup: **\[perlu diputuskan bersama Ops\]**

### **US-1.6 Akses sesuai *role***

Sebagai pengguna, saya ingin hanya dapat melihat dan mengubah data sesuai dengan *role* saya agar keamanan data peserta tetap terjaga.

* *Student* hanya dapat mengisi dan mengubah datanya sendiri.  
* *Instructor* hanya dapat memberikan *feedback* untuk sesi yang dia ajar.  
* Fasilitator hanya dapat mengisi *feedback* atas namanya sendiri.  
* Hanya Admin yang dapat mengelola *announcement*, *important links*, dan konfigurasi *capstone*.  
* Aturan akses untuk kelima *role* harus diuji sebelum sistem digunakan di *production*.

## **Epic 2: Jadwal ILT**

Pengelolaan jadwal sesi dan materi pengajar. US-2.1 dan US-2.2 dikerjakan pada Fase 1, sedangkan *user story* lainnya dikerjakan pada Fase 2\.

### **US-2.1 Mengelola jadwal sesi**

Sebagai Ops, saya ingin membuat dan mengubah jadwal sesi ILT di sistem agar pengelolaan jadwal tidak lagi bergantung pada Sheets.

* Setiap sesi memiliki tipe, judul, waktu mulai dan selesai, link meeting, grup peserta, Fasilitator, dan *Instructor*.  
* Ops dapat menandai Student tertentu yang perlu dijadwalkan ulang (*reschedule*) untuk sesi tersebut.  
* Jadwal dapat dibuat satu per satu maupun secara massal.  
* Perubahan jadwal langsung terlihat oleh peserta sesi terkait.

### **US-2.2 Melihat jadwal**

Sebagai *Student*, Fasilitator, atau *Instructor*, saya ingin melihat jadwal sesi yang relevan dengan saya agar mengetahui kapan harus hadir.

* *Student* melihat sesi untuk grupnya serta sesi yang dijadwalkan ulang khusus untuk dirinya.  
* Fasilitator melihat sesi yang didampinginya.  
* *Instructor* melihat sesi yang dia ajar.  
* Jadwal dapat difilter berdasarkan rentang tanggal.

### **US-2.3 Undangan kalender dan link meeting otomatis**

Sebagai Ops, saya ingin undangan kalender dan link meeting dibuat secara otomatis saat sesi dijadwalkan agar tidak perlu menyiapkannya satu per satu secara manual.

* Undangan dikirim kepada *Student*, Fasilitator, dan *Instructor* yang terlibat dalam sesi tersebut.  
* *Link meeting* disimpan pada data sesi dan ditampilkan di jadwal.  
* Perubahan jadwal memperbarui undangan yang sudah dikirim.  
* Detail proses pencocokan jadwal: **\[perlu dilengkapi oleh Mas Ikhlas\]**

### **US-2.4 Melihat sesi yang saya ajar**

Sebagai *Instructor*, saya ingin melihat seluruh sesi yang saya ajar dalam sebuah *campaign* agar dapat menyiapkan materi dan *feedback*.

* Daftar sesi menampilkan topik, tanggal, dan grup untuk setiap sesi.  
* Dari daftar tersebut, *Instructor* dapat membuka *teaching resources* dan mengisi *feedback* sesi.

### **US-2.5 Mengakses *teaching resources***

Sebagai *Instructor*, saya ingin mengakses materi pengajaran untuk setiap sesi agar dapat mempersiapkan diri sebelum mengajar.

* *Teaching resources* untuk setiap sesi memuat nama, link, dan tipe *resource*.  
* Ops dapat menambahkan dan mengubah *resource* untuk setiap sesi.  
* Hanya *Instructor* dan Admin yang dapat melihat *resource* tersebut.

## **Epic 3: *Progress* belajar**

*Student* dapat melihat *progress* belajarnya, sementara Ops mengelola datanya tanpa menggunakan Sheets. Dikerjakan pada Fase 2\.

### **US-3.1 Melihat *progress***

Sebagai *Student*, saya ingin melihat *progress* belajar saya agar mengetahui perkembangan saya dalam *campaign*.

* Tampilan memuat *progress course*, *assignments* (nama dan status), *attendance* (*event* dan status), serta riwayat poin (jumlah poin dan aktivitas).  
* *Student* hanya dapat melihat datanya sendiri.  
* *Lecturer* dapat melihat *progress Student* yang dibinanya.

### **US-3.2 Mengambil data *progress* otomatis**

Sebagai Ops, saya ingin *progress* belajar *Student* dihitung secara otomatis berdasarkan data yang tersedia di Dicoding agar tidak perlu lagi mengelola data melalui Sheets dan IMPORTRANGE.

* *Progress course* setiap *Student* diambil langsung dari data pembelajaran di Dicoding tanpa perlu diunggah oleh Ops.  
* Perhitungan *progress* mengikuti aturan *course progress* yang telah ditetapkan Ops.  
* *Progress* diperbaharui secara *real-time*, bukan melalui pembaruan terjadwal.  
* Untuk *attendance* dan *assignments*, mekanisme pengisian disesuaikan dengan ketersediaan data. *Engineer* bersama Ops akan menentukan apakah data dapat diambil secara otomatis dan seberapa sering data perlu diperbarui.  
* Jika masih ada data yang perlu diunggah Ops, misalnya data yang belum tersedia di Dicoding, proses unggah harus memperbarui baris terkait tanpa menimpa baris lainnya. Nilai yang tidak valid ditolak dengan pesan yang jelas. Hasil proses juga menampilkan jumlah baris yang berhasil dan gagal, beserta alasan kegagalannya.  
* *Engineer* perlu mengonfirmasi kepada Ops otomasi pada *sheet* pemrosesan *attendance* yang harus dipertahankan dan cara menanganinya di sistem baru. Otomasi yang ada saat ini mencakup kehadiran sesi ILT, banding ILT, abstrak, dan *feedback*.  
* *Point histories* dikelola melalui dashboard Admin, pada area pengaturan *campaign* yang sama dengan US-1.1. Dengan demikian, Ops tidak perlu mengunggah data poin melalui alur terpisah.

## **Epic 4: *Announcement* dan Student Portal**

Epic ini mencakup komunikasi kepada *Student* dan kumpulan tautan penting. Sebagian besar fitur sudah dikelola melalui Admin UI di sistem lama, sehingga pola yang ada dapat dipertahankan. Dikerjakan pada Fase 2\.

### **US-4.1 Mengelola *announcement***

Sebagai Admin, saya ingin membuat dan mengelola *announcement* agar informasi dapat disampaikan kepada *Student* di *campaign* yang tepat.

* Setiap *announcement* memiliki judul, gambar *cover*, isi, kategori, dan tipe.  
* Admin dapat menerbitkan, menyembunyikan, mengubah, dan menghapus *announcement*.  
* *Announcement* yang dihapus tidak lagi ditampilkan kepada *Student*, tetapi datanya tetap disimpan melalui mekanisme *soft delete*, termasuk informasi tentang pihak yang membuat dan menghapusnya.  
* Hanya Admin yang dapat membuat dan mengubah *announcement*.

### 

### **US-4.2 Notifikasi Discord saat publikasi**

Sebagai Admin, saya ingin notifikasi Discord dikirim secara otomatis saat *announcement* diterbitkan agar *Student* mengetahui adanya informasi baru.

* Notifikasi dikirim satu kali ketika status *announcement* berubah menjadi terbit.  
* Menyembunyikan atau mengubah *announcement* tidak memicu pengiriman notifikasi baru.

### **US-4.3 Membaca *announcement***

Sebagai *Student*, saya ingin membaca *announcement* yang telah diterbitkan agar tidak melewatkan informasi penting.

* *Student* hanya dapat melihat *announcement* yang telah diterbitkan dan belum dihapus.  
* *Announcement* diurutkan dari yang terbaru.

### **US-4.4 Mengelola *important links***

Sebagai Admin, saya ingin mengelola daftar *important links* untuk *Student* agar mereka dapat menemukan tautan yang dibutuhkan dari satu tempat.

* Setiap link memiliki label, URL, tipe dokumen, tipe *Student* yang dapat mengaksesnya, dan urutan tampilan.  
* Link baru otomatis ditempatkan di urutan terakhir, tanpa menghasilkan urutan yang duplikat.  
* Admin dapat mengubah dan menghapus link. Penghapusan dilakukan dengan mekanisme *soft delete*.

### **US-4.5 Melihat *important links***

Sebagai *Student*, saya ingin melihat *important links* yang relevan dengan saya agar dapat langsung membuka tautan yang dibutuhkan.

* *Student* melihat link sesuai dengan tipenya.  
* Link dikelompokkan berdasarkan kategori dan ditampilkan sesuai urutan yang ditetapkan Admin.

### **US-4.6 Mengelola konten informasi**

Sebagai Admin, saya ingin membuat dan mengelola Newsletter, Important Info, dan Violation Consequences langsung di Dicoding agar pengelolaan konten tidak lagi bergantung pada WordPress.

* Admin dapat membuat, mengubah, menerbitkan, dan menyembunyikan ketiga jenis konten tersebut.  
* Konten dibuat menggunakan editor yang sudah tersedia di *codebase* Dicoding, yaitu Froala atau Semicolon Editor. Editor yang digunakan: **\[ditentukan oleh engineer\]**  
* Konten yang disembunyikan tidak ditampilkan kepada *Student*, tetapi tetap tersimpan di sistem.  
* Hanya Admin yang dapat mengelola konten.

### **US-4.7 Membaca konten informasi**

Sebagai *Student*, saya ingin membaca Newsletter, Important Info, dan Violation Consequences di APD agar dapat memahami informasi dan aturan *campaign*.

* *Student* dapat membaca ketiga jenis konten tersebut langsung di APD tanpa perlu berpindah ke WordPress.  
* Hanya konten yang sudah diterbitkan yang ditampilkan.

*\*Newsletter juga akan mengirimkan email*

## **Epic 5: Profil dan dokumen *Student***

Epic ini mencakup data profil *Student* dan dokumen yang perlu mereka akses. Dikerjakan pada Fase 2\.

### **US-5.1 Mengisi profil *onboarding***

Sebagai *Student*, saya ingin mengisi profil saat pertama kali mengakses APD agar penyelenggara mengenal saya dan dapat menyiapkan kebutuhan *campaign*, seperti *merchandise*.

* Profil memuat data pribadi, minat topik, tujuan belajar, dan informasi *merchandise*, termasuk ukuran.  
* Sistem menandai apakah *Student* telah menyelesaikan profilnya.  
* *Student* hanya dapat membuat dan melihat profilnya sendiri.

### **US-5.2 Memperbarui profil**

Sebagai *Student*, saya ingin memperbarui alamat, kontak, foto profil, dan ukuran *merchandise* agar informasi saya tetap akurat.

* *Student* dapat mengubah alamat, kontak, foto profil, dan ukuran *merchandise*.  
* *Student* tidak dapat mengubah data yang dikelola Ops, seperti *role*, grup, dan kategori.  
* Waktu terakhir profil diperbarui harus tercatat.

### **US-5.3 Mengakses dokumen**

Sebagai *Student*, saya ingin melihat dokumen yang disediakan untuk saya agar dapat mengunduhnya tanpa perlu meminta bantuan Ops.

* *Student* dapat melihat dokumen yang ditujukan khusus untuk dirinya serta dokumen yang berlaku bagi seluruh peserta.  
* Setiap dokumen memiliki nama dan link.  
* Ops dapat menambahkan dokumen untuk satu *Student* atau untuk seluruh peserta dalam *campaign*.

### **US-5.4 Melihat riwayat *daily check-in***

Sebagai *Student*, saya ingin melihat riwayat *daily check-in* di APD agar dapat meninjau kembali *mood*, refleksi, dan tujuan saya.

* Riwayat *check-in* yang ditampilkan di APD mencakup tanggal, *mood*, deskripsi, refleksi, dan tujuan, dengan sumber data dari *check-in* yang sudah tersimpan di Dicoding.  
* *Student* hanya dapat melihat riwayat *check-in* miliknya sendiri.  
* APD hanya menampilkan data *check-in*. Pengisian dan penyimpanan *check-in* tidak dilakukan kembali di APD.

## **Epic 6: ILT *Feedback***

Epic ini mencakup *feedback* dari *Student*, *Instructor*, dan Fasilitator untuk setiap sesi. Pengerjaan dilakukan pada Fase 3 dengan urutan US-6.1 sampai US-6.3, kemudian US-6.4 dan US-6.5, lalu US-6.6 dan US-6.7. Rekapitulasi rating dan ringkasan membutuhkan data *feedback* yang sudah terkumpul.

### **US-6.1 Mengelola bank pertanyaan *feedback***

Sebagai Admin, saya ingin mengelola daftar pertanyaan *feedback* agar pertanyaan dapat diperbarui tanpa perlu mengubah kode.

* Setiap pertanyaan memiliki teks dan tipe.  
* Admin dapat menambah, mengubah, dan menonaktifkan pertanyaan.  
* Pertanyaan ditampilkan pada form *feedback* sesuai dengan *role* pengisi.

### **US-6.2 Memberi *feedback* untuk sesi**

Sebagai *Student*, saya ingin memberikan *feedback* untuk sesi yang saya ikuti agar penyelenggara dan *Instructor* mengetahui hal-hal yang perlu diperbaiki.

* Form mencakup penilaian terhadap materi, *Instructor*, dan sesi secara keseluruhan.  
* Satu *Student* hanya dapat mengirim satu *feedback* untuk setiap sesi.  
* *Student* hanya dapat mengirim *feedback* atas namanya sendiri dan untuk sesi yang termasuk dalam grupnya.  
* Data sesi, meliputi waktu, topik, grup, *Instructor*, dan Fasilitator, disimpan bersama *feedback*.

### **US-6.3 Memberi *feedback* dua mingguan kepada Fasilitator**

Sebagai *Student*, saya ingin memberikan *feedback* kepada Fasilitator setiap dua minggu agar kualitas pendampingan dapat dipantau.

* Form tersedia dalam dua varian: untuk kelas yang sudah memiliki Fasilitator dan untuk kelas yang belum memiliki Fasilitator.  
* Sistem menentukan varian form berdasarkan kelas *Student*.  
* *Feedback* dikumpulkan setiap dua minggu selama *campaign* berlangsung.

### **US-6.4 *Feedback* dari *Instructor***

Sebagai *Instructor*, saya ingin memberikan *feedback* mengenai sesi, *Student*, dan Fasilitator agar tersedia masukan dari sisi pengajar.

* *Instructor* hanya dapat mengisi *feedback* untuk sesi yang dia ajar.  
* *Feedback* mengenai sesi dan *Student* diisi melalui satu form.  
* Penilaian terhadap Fasilitator mencakup keaktifan dalam membantu, efektivitas komunikasi, kesesuaian kinerja dengan harapan, hal yang menonjol, serta catatan perbaikan dan harapan ke depan jika kinerjanya belum sesuai harapan.  
* *Instructor* hanya dapat menilai Fasilitator yang terdaftar pada sesi tersebut.

### **US-6.5 *Feedback* dari Fasilitator**

Sebagai Fasilitator, saya ingin memberikan *feedback* kepada *Instructor* dan *Student* agar tersedia masukan dari sisi pendamping.

* Fasilitator hanya dapat mengisi *feedback* atas namanya sendiri.  
* Form mencakup *feedback* untuk *Instructor* dan *feedback* untuk setiap *Student*.

### **US-6.6 Melihat rekap rating**

Sebagai Admin atau *Instructor*, saya ingin melihat rekap rating *feedback* untuk setiap sesi agar tidak perlu menghitungnya secara manual.

* Rekap menampilkan rata-rata rating *Instructor*, rating sesi, dan jumlah respons.  
* Rekap diperbarui secara otomatis setiap kali ada *feedback* baru dari *Student*.  
* Admin dapat melihat semua sesi, sedangkan *Instructor* hanya dapat melihat sesi yang dia ajar.

### **US-6.7 Ringkasan *feedback* dengan AI**

Sebagai Admin atau *Instructor*, saya ingin melihat ringkasan tertulis dari *feedback Student* untuk suatu sesi agar dapat memahami poin-poin utamanya dengan cepat.

* Ringkasan dibuat berdasarkan *feedback Student* untuk sesi terkait.  
* Status proses ditampilkan dengan jelas: sedang diproses, selesai, atau gagal.  
* Hanya Admin dan *Instructor* yang mengajar sesi terkait yang dapat membuat dan melihat ringkasan.  
* Penyedia AI yang digunakan saat ini adalah OpenAI.

## **Epic 7: *Capstone***

Epic ini mencakup pembentukan grup dan pencatatan *logbook capstone*. Pengerjaan dilakukan paling akhir, pada Fase 4, karena bergantung pada data pengguna dan grup dari Epic 1 serta memiliki logika *backend* yang lebih kompleks.

### **US-7.1 Mengatur registrasi *capstone***

Sebagai Admin, saya ingin mengatur periode registrasi *capstone* agar *Student* hanya dapat mendaftar pada waktu yang telah ditentukan.

* Admin dapat mengaktifkan atau menonaktifkan registrasi.  
* Admin menetapkan waktu buka dan tutup registrasi, domain email grup, serta definisi *member* aktif.  
* Setiap perubahan dicatat beserta waktu dan pihak yang melakukannya.

### **US-7.2 Mendaftarkan grup *capstone***

Sebagai *Student*, saya ingin mendaftarkan grup *capstone* bersama anggota tim agar grup kami tercatat secara resmi.

* Pendaftaran hanya dapat dilakukan saat registrasi aktif dan masih dalam rentang waktu pendaftaran.  
* Setiap grup mendapatkan nomor urut otomatis berdasarkan kategori. Nomor tidak boleh duplikat meskipun beberapa pendaftaran dilakukan secara bersamaan.  
* Satu *Student* hanya dapat menjadi anggota dari satu grup.  
* Data anggota, meliputi nama, email, grup, *learning path*, dan status *progress* saat bergabung, disimpan sebagai *snapshot* pada saat pendaftaran.  
* Setiap anggota memiliki peran, dan satu anggota ditetapkan sebagai *leader*.

### 

### 

### **US-7.3 Mengelola grup secara manual**

Sebagai Admin, saya ingin membuat dan menghapus grup *capstone* secara manual agar kasus yang tidak dapat ditangani melalui proses registrasi tetap bisa diselesaikan.

* Admin dapat membuat grup dengan menentukan kategori, anggota, dan *leader*.  
* Grup yang dihapus diberi status terhapus melalui mekanisme *soft delete*. Alasan penghapusan, waktu, dan pihak yang menghapus tetap tercatat.  
* Grup yang telah dihapus tidak ditampilkan dalam daftar grup aktif.

### **US-7.4 Mengatur *logbook***

Sebagai Admin, saya ingin mengatur *timeline* dan *checkpoint logbook* agar *Student* mengetahui apa yang harus dilaporkan dan kapan laporan perlu dikirimkan.

* *Logbook* memiliki satu atau lebih *timeline*, dan setiap *timeline* memiliki *checkpoint*.  
* Admin dapat mengaktifkan atau menonaktifkan *logbook*.  
* Admin dapat menambah, mengubah, dan menghapus *timeline*.

### **US-7.5 Mengisi *logbook***

Sebagai *Student*, saya ingin mengisi *logbook* pada setiap *checkpoint* agar *progress capstone* tim saya terdokumentasi.

* Setiap entri memuat deskripsi, bukti (tipe dan isi), serta status.  
* Setiap *Student* memiliki satu entri untuk setiap *checkpoint*.  
* Hanya anggota grup yang dapat mengisi *logbook*, dan setiap anggota hanya dapat mengisi untuk dirinya sendiri.  
* *Student* dapat mengubah entrinya sampai Admin melakukan *override*.

### **US-7.6 *Override* status *logbook***

Sebagai Admin, saya ingin mengubah status *logbook Student* secara langsung agar kasus khusus, misalnya kendala teknis, dapat ditangani.

* Hanya Admin yang dapat melakukan *override*.  
* Setiap *override* dicatat dalam *audit log*, meliputi tindakan, pelaku, waktu, dan detail perubahan.  
* Setelah status di-*override* oleh Admin, *Student* tidak dapat mengubah entri tersebut lagi.  
* Admin dapat melihat *audit log* untuk setiap grup.

### **US-7.7 Dashboard *capstone***

Sebagai Admin, saya ingin melihat ringkasan grup dan *logbook capstone* agar dapat memantau kondisi setiap kategori.

* Dashboard menampilkan daftar grup dan status *logbook* untuk setiap kategori.

## **Epic 8: Laporan otomatis**

Laporan Excel yang sebelumnya dibuat melalui Cloud Functions, seperti laporan *progress*, profil, *check-in*, *capstone*, dan *logbook*, akan digantikan dengan laporan Google Sheets yang diperbarui secara otomatis. Karena data sudah terpusat di Dicoding, proses ini diharapkan lebih sederhana. Dikerjakan paling akhir, pada Fase 5\.

### **US-8.1 Laporan *campaign* di Google Sheets yang diperbarui otomatis**

Sebagai Admin atau Ops, saya ingin laporan *campaign* tersedia melalui *link* Google Sheets yang diperbarui secara berkala agar tidak perlu mengunduh laporan satu per satu.

* Admin dan Ops mendapatkan *link* Google Sheets untuk setiap laporan.  
* Isi Google Sheets diperbarui secara otomatis sesuai jadwal, tanpa perlu Ops menjalankan proses *export* secara manual.  
* Data laporan bersumber dari data yang sudah terpusat di Dicoding.  
* Pembaruan dilakukan melalui *command* terjadwal yang mengikuti pola yang sudah digunakan di Dicoding.  
* Hanya pihak yang diberi akses yang dapat membuka laporan.  
* Jadwal pembaruan: **\[akan ditentukan bersama oleh engineer dan Ops\]**  
* Daftar laporan yang dibutuhkan (sebelumnya mencakup *progress*, profil, *check-in*, *capstone*, dan *logbook*): **\[perlu dikonfirmasi bersama Ops\]**

## **Fase dan strategi rilis**

Jadwal berikut masih berupa *draft*. Target sementara adalah sistem siap digunakan di *production* sebelum Jumat, 8 Januari 2027\. Tanggal pasti dimulainya *campaign* pertama masih perlu dikonfirmasi.

| Fase | Cakupan | Alasan penempatan fase |
| ----- | ----- | ----- |
| 1 | US-1.1 sampai US-1.6, US-2.1, US-2.2 | Harus tersedia sebelum hari pertama *campaign*. |
| 2 | US-2.3 sampai US-2.5, Epic 3, Epic 4, Epic 5 | Dibutuhkan selama minggu-minggu awal *campaign*. |
| 3 | Epic 6 (ILT Feedback) | Tetap krusial, tetapi dapat dikerjakan di pertengahan. |
| 4 | Epic 7 (Capstone) | Bergantung pada fondasi sebelumnya dan memiliki logika *backend* yang lebih kompleks. |
| 5 | Epic 8 (Laporan otomatis) | Dikerjakan paling akhir karena menggunakan data dari fitur lain. |

### **Jadwal**

| Tahap | Tanggal | Cakupan | Kriteria selesai |
| ----- | ----- | ----- | ----- |
| Persiapan | 14-16 Okt | Finalisasi PRD, penyelesaian keputusan yang masih terbuka, penetapan *owner* untuk setiap *scope*, dan eksplorasi *schema*. | PRD disepakati dan kartu *development* dibuat. |
| Fase 1 | 19 Okt-13 Nov (4 minggu) | US-1.1 sampai US-1.6, US-2.1, US-2.2 | Demo kepada Ops pada 13 Nov. |
| Fase 2 | 16 Nov-4 Des (3 minggu) | US-2.3 sampai US-2.5, Epic 3, Epic 4, Epic 5 | Demo kepada Ops pada 4 Des. |
| Fase 3 | 7-23 Des | Epic 6 (ILT Feedback) | Selesai sebelum libur Natal. |
| UAT dan *live prod* | 28 Des-8 Jan | UAT bersama Ops, perbaikan, dan pelatihan Ops. | Siap *live prod* pada 8 Jan. |
| Fase 4 | 11 Jan-5 Feb | Epic 7 (Capstone) | Rilis bertahap setelah *live prod*. |
| Fase 5 | 8-19 Feb | Epic 8 (Laporan otomatis) | Rilis setelah Capstone. |

### **Strategi rilis**

* **Batas penggunaan sistem baru:** Sistem baru hanya akan digunakan untuk *campaign* yang dimulai pada Januari 2027 dan seterusnya. *Campaign* yang sedang berjalan akan tetap menggunakan APD lama sampai selesai.  
* **Pembatasan perubahan pada APD lama:** Pengembangan fitur dan perubahan pada APD lama akan dihentikan, kecuali untuk perbaikan *bug* yang mendesak. Dengan demikian, fokus dan kapasitas tim dapat dialihkan ke pengembangan sistem baru.  
* **Penanganan fitur yang belum siap:** Jika ada fitur yang belum selesai saat *campaign* dimulai, tim akan menggunakan solusi sementara (*workaround*), misalnya tetap memakai form lama untuk mengumpulkan *feedback* sampai fitur baru tersedia.  
* Perlu ada *buffer time*, *just in case* ternyata jadwal ada yang maju lagi.