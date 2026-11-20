---
source: https://docs.google.com/document/d/12z-FEvdzAGEvb1aRjf7pHo5SQ5SCrPNZXaBv3yIFo4s/edit?tab=t.0
---
## **1\. Ringkasan**

Daily Streak Recovery merupakan pengembangan dari fitur Daily Streak yang sudah berjalan sejak Q1 2026\. Fitur ini memungkinkan pengguna mempertahankan *streak* meskipun melewatkan satu atau beberapa hari belajar.

Melalui fitur ini, setiap pengguna akan mendapatkan 3 Streak Recovery secara *default*. Satu Streak Recovery dapat digunakan untuk melindungi satu hari ketika pengguna tidak melakukan aktivitas belajar. Streak Recovery yang sudah digunakan juga bisa didapatkan kembali dengan mengumpulkan XP dari aktivitas belajar, dengan batas maksimal kepemilikan sebanyak 3\.

Fitur ini tidak mengubah mekanisme Daily Streak yang sudah berjalan. Pengguna tetap mendapatkan satu *streak* setiap harinya ketika menyelesaikan minimal satu aktivitas valid, yaitu:

* Menyelesaikan submodul.  
* Menyelesaikan kelas.  
* Mengirimkan (*submit*) submission.  
* Menyelesaikan kuis.  
* Menyelesaikan *exam*.

Beberapa aktivitas dalam satu hari tetap hanya menghasilkan satu *streak*. Sebaliknya, jika pengguna tidak melakukan aktivitas valid hingga hari berakhir, *streak* berpotensi terputus. Di sinilah Streak Recovery berperan untuk memberikan kesempatan kepada pengguna mempertahankan *streak* yang sudah dibangun.

Dokumen ini disusun menggunakan pendekatan *user story* dan *acceptance criteria* sebagai acuan bagi tim Product, Design, dan Engineering dalam proses pengembangan serta pengujian fitur.

Beberapa kebutuhan masih berupa usulan dan ditandai dengan **\[Perlu diputuskan\]**. Hal-hal tersebut perlu dikonfirmasi bersama stakeholder sebelum masuk ke tahap implementasi.

## **2\. Problem Statement dan Tujuan**

### **2.1. Problem Statement**

Saat ini, pengguna harus menjaga konsistensi belajar setiap hari agar *streak* yang sudah dikumpulkan tidak terputus.

Meskipun mekanisme ini dapat mendorong kebiasaan belajar, aturan tersebut juga terasa cukup kaku. Pengguna yang sudah memiliki *streak* panjang bisa kehilangan seluruh progresnya hanya karena melewatkan satu hari.

Situasi ini berpotensi membuat pengguna kehilangan motivasi untuk kembali belajar, terutama ketika mereka harus memulai kembali *streak* dari awal.

Beberapa dampak yang ingin kita hindari:

* Pengguna berhenti belajar setelah kehilangan *streak* yang sudah dibangun dalam waktu lama (*streak loss churn*).  
* Daily Streak yang seharusnya membantu membangun kebiasaan belajar justru menjadi sumber frustrasi ketika pengguna melewatkan satu hari.

### **2.2. Tujuan Produk**

Fitur Streak Recovery dikembangkan dengan beberapa tujuan berikut:

1. **Memberikan fleksibilitas dalam menjaga *streak*.** Pengguna tetap memiliki kesempatan untuk mempertahankan *streak* meskipun sesekali melewatkan hari belajar.  
2. **Tetap mendorong konsistensi belajar.** Streak Recovery merupakan resource yang terbatas, dengan maksimal 3 kepemilikan. Pengguna perlu mengumpulkan XP melalui aktivitas belajar untuk mendapatkan Streak Recovery kembali.  
3. **Menghubungkan sistem Daily Streak dengan gamifikasi.** XP yang diperoleh dari aktivitas belajar dapat digunakan untuk mengisi ulang Streak Recovery.

### **2.3. Prinsip yang Perlu Dijaga**

Walaupun memberikan fleksibilitas, Streak Recovery tidak boleh menghilangkan tujuan utama Daily Streak, yaitu mendorong pengguna untuk belajar secara konsisten.

Oleh karena itu, terdapat beberapa batasan yang perlu dipertahankan:

* Setiap pengguna hanya dapat memiliki maksimal 3 Streak Recovery.  
* Streak Recovery yang sudah digunakan hanya dapat diperoleh kembali melalui XP dari aktivitas belajar.  
* Hari yang dilindungi oleh Streak Recovery hanya berfungsi menyambungkan *streak*, bukan menambah angka *streak*.  
* Pengguna tetap perlu melakukan aktivitas belajar setiap hari untuk meningkatkan angka *streak*.

Dengan demikian, Streak Recovery memberikan ruang bagi pengguna ketika melewatkan hari belajar, tanpa menjadikan aktivitas belajar harian tidak lagi diperlukan.

### 

### 

### 

### **2.4. Di Luar Cakupan**

Beberapa hal berikut tidak termasuk dalam pengembangan saat ini:

* Mengubah kriteria aktivitas yang dapat menghasilkan Daily Streak.  
* Membeli Streak Recovery menggunakan uang atau poin. Fitur ini direncanakan untuk iterasi berikutnya.  
* Mengubah atau membangun ulang sistem XP dan level yang sudah berjalan.

## **3\. Pengguna dan Glosarium**

### **3.1. Pengguna yang Terlibat**

| Peran | Kebutuhan atau Aktivitas |
| :---: | ----- |
| User (sudah login) | Mendapatkan 3 Streak Recovery secara *default*, melihat jumlah yang dimiliki dan progres pengisiannya, serta menggunakan Streak Recovery ketika melewatkan hari belajar. |
| User dengan *streak* terancam | Mendapatkan pengingat agar kembali belajar sebelum *streak* terputus. |
| Tim Gamifikasi | Menentukan jumlah XP yang dibutuhkan untuk mendapatkan 1 Streak Recovery. |
| Engineering | Mengintegrasikan Streak Recovery dengan sistem Daily Streak dan XP, serta membantu menangani laporan kehilangan *streak* melalui riwayat penggunaan Streak Recovery. |

### **3.2. Glosarium**

| Istilah | Definisi |
| :---: | ----- |
| Hari aktif | Hari ketika pengguna menyelesaikan minimal satu aktivitas valid Daily Streak. |
| Hari terlewat | Hari ketika pengguna tidak menyelesaikan aktivitas valid, setelah hari aktif terakhirnya. |
| Hari terlindungi | Hari terlewat yang berhasil dilindungi menggunakan Streak Recovery. |
| Kuota Streak Recovery | Jumlah Streak Recovery yang masih dimiliki dan belum digunakan. Nilainya berada di antara 0 sampai 3\. |
| Progres pengisian ulang | Jumlah XP yang sudah dikumpulkan untuk mendapatkan 1 Streak Recovery berikutnya. Progres hanya bertambah ketika kuota masih di bawah 3\. |
| *Streak* aktif | Rangkaian hari aktif dan hari terlindungi yang tersambung tanpa jeda, hingga hari ini atau kemarin. |
| Jendela pemulihan | Batas waktu bagi pengguna untuk menggunakan Streak Recovery setelah melewatkan hari. Pemulihan masih bisa dilakukan selama jumlah hari terlewat (sampai kemarin) tidak melebihi kuota. Contohnya, kuota 1 berarti tersedia waktu 1 hari untuk melakukan pemulihan. Lihat [[ADR-003 Mekanisme Pilihan Wajib Recovery atau Reset]]. |
| Status pending | Kondisi ketika jumlah hari terlewat antara 1 sampai kuota dan pengguna belum memilih recovery atau reset. Status ini dihitung, tidak disimpan. |

# **4\. Epic 1: Kuota dan Pengisian Ulang Streak Recovery**

Setiap pengguna mendapatkan kuota Streak Recovery dengan jumlah maksimal 3\. Ketika Streak Recovery digunakan, pengguna dapat mengisi kembali kuotanya dengan mengumpulkan XP dari aktivitas belajar.

Epic ini termasuk dalam Fase 1 pengembangan.

## **US-1.1. Mendapatkan Kuota Awal Streak Recovery**

**User Story**

Sebagai pengguna, saya ingin langsung mendapatkan Streak Recovery ketika fitur ini dirilis agar saya bisa memanfaatkannya tanpa perlu mengumpulkan XP terlebih dahulu.

**Requirements**

* Ketika fitur dirilis, seluruh pengguna, termasuk pengguna lama, langsung mendapatkan 3 Streak Recovery.  
* Pengguna yang baru mendaftar setelah fitur dirilis juga langsung mendapatkan 3 Streak Recovery.  
* Jumlah maksimal Streak Recovery yang dapat dimiliki adalah 3\.
* Kuota awal 3 adalah aturan, bukan transaksi. Tidak ada transaksi `default`. Lihat [[ADR-005 Kuota Awal dan Sumber Transaksi]].

**Acceptance Criteria**

1. Given fitur Streak Recovery sudah dirilis, when pengguna lama membuka halaman yang menampilkan Daily Streak, then sistem menampilkan kuota sebanyak 3 Streak Recovery.  
2. Given pengguna baru saja mendaftar setelah fitur dirilis, when akun berhasil dibuat, then pengguna langsung memiliki 3 Streak Recovery.

## **US-1.2. Mengisi Ulang Streak Recovery Menggunakan XP**

**User Story**

Sebagai pengguna, saya ingin mendapatkan kembali Streak Recovery melalui XP yang saya kumpulkan dari aktivitas belajar agar saya memiliki perlindungan untuk kesempatan berikutnya.

**Requirements**

* Pengisian ulang hanya berlaku ketika kuota Streak Recovery berada di angka 0 sampai 2\.  
* Setiap mencapai jumlah XP tertentu, pengguna mendapatkan tambahan 1 Streak Recovery.  
* Jumlah XP yang dibutuhkan untuk mendapatkan 1 Streak Recovery jadinya adalah sebanyak 500 XP.  
* Recovery XP mengikuti Total XP dari semua sumber selama kuota di bawah 3, dan kembali ke 0 setiap mencapai 500. Saat kuota 3, UI menampilkan "Recovery penuh". Lihat [[ADR-004 Model Recovery XP]].  
* Hanya XP yang diperoleh ketika kuota berada di bawah 3 yang dihitung sebagai progres pengisian ulang. Total XP yang sudah dimiliki pengguna sebelumnya tidak ikut diperhitungkan.  
* Progres XP yang belum mencapai target tetap tersimpan meskipun pengguna kembali menggunakan Streak Recovery.

**Contoh:**

Pengguna memiliki 2 Streak Recovery dengan progres pengisian ulang sebesar 300/500 XP. Ketika pengguna menggunakan 1 Streak Recovery, kuotanya menjadi 1, tetapi progres pengisian ulang tetap berada di angka 300/500 XP.

* Jika satu aktivitas menghasilkan XP yang cukup untuk mendapatkan beberapa Streak Recovery sekaligus, seluruh Streak Recovery tersebut langsung ditambahkan. Sisa XP akan digunakan untuk melanjutkan progres berikutnya.

**Contoh:**

Pengguna memiliki 0 Streak Recovery dan mendapatkan 1.250 XP dari satu aktivitas. Setelah aktivitas tersebut selesai, pengguna mendapatkan 2 Streak Recovery dan memiliki progres tambahan sebesar 250/500 XP.

* Pengisian ulang akan berhenti ketika kuota mencapai 3\.  
* XP yang diperoleh ketika kuota sudah 3 tidak akan disimpan sebagai progres pengisian ulang, termasuk sisa XP dari aktivitas yang membuat kuota mencapai 3\.

**Contoh:**

Pengguna memiliki 0 Streak Recovery. Setelah mengumpulkan 500 XP, kuotanya menjadi 1\. Setelah mengumpulkan total 1.000 XP, kuotanya menjadi 2\. Ketika total XP mencapai 1.500, kuotanya kembali penuh menjadi 3\. XP berikutnya tidak lagi dihitung sebagai progres pengisian ulang.

**Acceptance Criteria**

1. Given pengguna memiliki 2 Streak Recovery dan progres pengisian ulang 0 XP, when pengguna mendapatkan 500 XP, then kuota bertambah menjadi 3 dan sistem mencatat transaksi dengan sumber `pengisian ulang XP`.  
2. Given pengguna memiliki 2 Streak Recovery dan progres pengisian ulang 300 XP, when pengguna menggunakan 1 Streak Recovery, then kuota menjadi 1 dan progres pengisian ulang tetap 300 XP.  
3. Given pengguna memiliki 0 Streak Recovery dan progres pengisian ulang 0 XP, when pengguna mendapatkan 1.250 XP dari satu aktivitas, then kuota bertambah menjadi 2 dan progres pengisian ulang menjadi 250 XP.  
4. Given pengguna memiliki 2 Streak Recovery dan progres pengisian ulang 400 XP, when pengguna mendapatkan tambahan 300 XP, then kuota menjadi 3 dan sisa 200 XP tidak disimpan.  
5. Given pengguna sudah memiliki 3 Streak Recovery, when pengguna mendapatkan XP dari aktivitas apa pun, then kuota tetap 3 dan progres pengisian ulang tidak bertambah.

## **US-1.3. Menyimpan Kuota dan Riwayat Streak Recovery**

**User Story**

Sebagai pengguna, saya ingin kuota Streak Recovery yang saya miliki tersimpan dengan aman agar dapat digunakan kapan pun dibutuhkan.

**Requirements**

* Kuota dan progres pengisian ulang Streak Recovery disimpan untuk setiap pengguna dan tidak bergantung pada kelas maupun Learning Path tertentu.  
* Setiap perubahan kuota setelah kuota awal harus dicatat sebagai transaksi, yaitu:  
  * Pengisian ulang menggunakan XP (`xp_reward`).  
  * Penggunaan Streak Recovery (`usage`).  
  * Koreksi kuota oleh Admin (`admin`).  
* Pilihan reset tidak dicatat sebagai transaksi karena tidak mengubah kuota. Pilihan ini dicatat lewat *event tracking* (Fase 2).  
* Setiap transaksi harus menyimpan informasi waktu, jumlah perubahan, sumber transaksi, dan jumlah kuota setelah transaksi.  
* Kuota tidak boleh kurang dari 0 maupun melebihi 3\.  
* Streak Recovery tidak memiliki masa berlaku.

**Acceptance Criteria**

1. Given pengguna memiliki 1 Streak Recovery, when sistem mencoba mengurangi kuota sebanyak 2, then transaksi ditolak dan kuota tetap 1\.  
2. Given terjadi perubahan kuota Streak Recovery, when riwayat transaksi dibuka, then transaksi tersebut menampilkan jumlah perubahan, sumber, waktu transaksi, dan jumlah kuota setelah transaksi.

## **US-1.4. Melihat dan Mengoreksi Kuota Streak Recovery sebagai Admin**

**User Story**

Sebagai tim Engineering, saya ingin dapat melihat riwayat Streak Recovery milik pengguna dan melakukan koreksi kuota jika diperlukan agar laporan kehilangan *streak* akibat bug dapat ditangani dengan lebih mudah.

**Requirements**

* Admin dapat melihat informasi berikut:  
  * Jumlah Streak Recovery yang dimiliki pengguna.  
  * Progres pengisian ulang XP.  
  * Riwayat transaksi Streak Recovery.  
  * Riwayat hari aktif dan hari yang dilindungi Streak Recovery.  
* Admin dapat menambah atau mengurangi kuota Streak Recovery dengan menyertakan alasan koreksi.  
* Koreksi kuota tetap harus mengikuti batas minimum 0 dan maksimum 3\.  
* Setiap koreksi harus tercatat beserta identitas Admin yang melakukannya.

# **5\. Epic 2: Menggunakan Streak Recovery**

Streak Recovery digunakan untuk melindungi hari yang terlewat agar *streak* pengguna tetap tersambung.

Pengguna memiliki kendali penuh atas penggunaan Streak Recovery. Sistem tidak akan menggunakan Streak Recovery secara otomatis tanpa persetujuan pengguna.

Epic ini termasuk dalam Fase 1 pengembangan.

## **5.1. Mekanisme Penggunaan Streak Recovery**

Streak Recovery hanya dapat digunakan ketika pengguna memilihnya.

Ketika pengguna kembali membuka Dicoding setelah melewatkan satu atau beberapa hari, sistem akan menampilkan pilihan antara menggunakan Streak Recovery atau memulai ulang *streak*. Pilihan muncul saat membuka halaman, sebelum pengguna melakukan aktivitas belajar.

Pilihan ini wajib dijawab dan tidak dapat ditutup sebelum pengguna menentukan pilihannya.

Beberapa aturan yang berlaku (detail di [[ADR-003 Mekanisme Pilihan Wajib Recovery atau Reset]]):

* Hari terlewat dihitung dari setelah hari aktif terakhir sampai kemarin. Jika jumlahnya 1 sampai kuota, status menjadi pending dan pilihan ditampilkan. Jika melebihi kuota, *streak* langsung di-reset menjadi 0 tanpa ditanya.  
* Pengguna dapat memilih menggunakan Streak Recovery atau melakukan *reset streak*.  
* Jika pengguna menutup aplikasi sebelum menentukan pilihan, pilihan yang sama akan ditampilkan kembali ketika pengguna mengakses Dicoding berikutnya.  
* Selama pending, aktivitas valid yang tetap masuk ke server tidak menambah *streak*. XP tetap diberikan seperti biasa.  
* Jendela pemulihan ditentukan berdasarkan jumlah Streak Recovery yang dimiliki pengguna dan dihitung sejak hari pertama yang terlewat.

Contoh:

* Jika pengguna memiliki 1 Streak Recovery dan melewatkan hari Jumat, pemulihan harus dilakukan paling lambat pada akhir hari Sabtu.  
* Jika pengguna memiliki 3 Streak Recovery dan melewatkan hari Jumat, pemulihan harus dilakukan paling lambat pada akhir hari Senin.

Dengan demikian, durasi maksimal jendela pemulihan adalah 3 hari.

Jika pengguna tidak memilih hingga jendela pemulihan berakhir, *streak* akan di-reset menjadi 0 dengan pesan: "Streak kamu direset karena hari yang terlewat melebihi jumlah Streak Recovery."

### **Contoh Skenario**

Seorang pengguna memiliki 3 Streak Recovery dan aktif belajar dari hari Senin sampai Rabu (*streak* 3). Pada hari Kamis, pengguna tidak melakukan aktivitas belajar. Kemudian, pada hari Jumat, pengguna kembali membuka Dicoding.

Sistem akan menampilkan pilihan wajib berikut:

| Pilihan | Hasil |
| :---: | ----- |
| Gunakan 1 Streak Recovery untuk hari Kamis | Hari Kamis berhasil dilindungi. Kuota berkurang dari 3 menjadi 2\. *Streak* tetap 3 karena Kamis tidak menambah angka *streak*. Setelah pengguna menyelesaikan aktivitas valid pada Jumat, *streak* menjadi 4 (Senin, Selasa, Rabu, dan Jumat). Progres pengisian ulang mulai berjalan. |
| *Reset streak* | *Streak* menjadi 0. Setelah pengguna menyelesaikan aktivitas valid pada Jumat, *streak* menjadi 1\. Kuota Streak Recovery tetap 3\. |

## **US-2.1. Mendeteksi Hari yang Terlewat**

**User Story**

Sebagai sistem, saya perlu mendeteksi hari ketika pengguna tidak melakukan aktivitas valid agar dapat menentukan apakah *streak* masih bisa dipertahankan dan berapa Streak Recovery yang dibutuhkan.

**Requirements**

* Hari terlewat dihitung sebagai hari kalender di antara hari aktif terakhir dan hari ini, selama tidak memiliki aktivitas valid dan belum dilindungi Streak Recovery.  
* Penentuan pergantian hari mengikuti WIB (`Asia/Jakarta`) untuk semua pengguna, sesuai dengan mekanisme Daily Streak yang sudah berjalan. Lihat [[ADR-002 Pergantian Hari Mengikuti WIB]].  
* Hari ini belum dihitung sebagai hari terlewat selama hari tersebut belum berakhir.

## **US-2.2. Memilih Menggunakan Streak Recovery**

**User Story**

Sebagai pengguna, saya ingin menentukan sendiri apakah Streak Recovery akan digunakan untuk melindungi hari yang terlewat agar saya tetap memiliki kendali atas kuota yang saya miliki.

**Requirements**

* Jika terdapat hari terlewat yang masih berada dalam jendela pemulihan dan kuota pengguna mencukupi, sistem akan menampilkan pilihan penggunaan Streak Recovery.  
* Pilihan tersebut menampilkan tanggal hari yang terlewat dan jumlah Streak Recovery yang akan digunakan.  
* Pilihan muncul ketika pengguna membuka halaman Dicoding selama status pending, sebelum melakukan aktivitas belajar.  
* Pilihan wajib muncul di semua halaman tempat pengguna bisa mendapatkan XP atau progres (halaman classroom: modul, kuis, exam, submission). Tampilan di dashboard dan halaman lain **perlu disepakati dengan tim UI/UX**.  
* Selama pending, aktivitas valid yang tetap masuk ke server tidak menambah *streak* dan tidak mengubah hari aktif terakhir. XP tetap diberikan.  
* Streak Recovery hanya digunakan setelah pengguna memilih opsi tersebut. Sistem tidak boleh mengurangi kuota secara otomatis.  
* Satu Streak Recovery hanya dapat digunakan untuk melindungi satu hari terlewat.  
* Streak Recovery hanya dapat digunakan untuk hari yang terlewat setelah hari aktif terakhir dalam rangkaian *streak* yang masih berjalan. Fitur ini tidak dapat mengembalikan *streak* yang sudah resmi terputus.  
* Jika pengguna melewatkan beberapa hari sekaligus, seluruh hari tersebut harus dilindungi agar *streak* tetap tersambung. Pengguna tidak dapat memilih untuk melindungi sebagian hari saja.  
* Pilihan menggunakan Streak Recovery atau melakukan *reset streak* bersifat final.  
* Pilihan tidak dapat ditutup atau dilewati sebelum pengguna menentukan keputusan.  
* Jika jendela pemulihan berakhir tanpa pilihan, *streak* di-reset menjadi 0, kuota Streak Recovery tetap, dan pengguna mendapat pesan reset satu kali.  
* Jumlah hari berturut-turut yang dapat dilindungi mengikuti jumlah kuota yang dimiliki, dengan maksimal 3 hari.  
* Satu hari hanya dapat dilindungi satu kali. Sistem harus mencegah pengurangan kuota berulang akibat klik berulang, *retry*, maupun request duplikat.

**Acceptance Criteria**

1. Given *streak* pengguna masih aktif sampai Kamis, Jumat terlewat, dan pengguna memiliki 1 Streak Recovery, when pengguna membuka Dicoding pada Sabtu, then sistem menampilkan pilihan wajib untuk menggunakan 1 Streak Recovery pada Jumat atau melakukan *reset streak*. Kuota belum berkurang sebelum pengguna memilih.  
2. Given pilihan tersebut sudah ditampilkan, when pengguna memilih menggunakan Streak Recovery, then Jumat berstatus terlindungi, kuota berkurang menjadi 0, dan *streak* tetap tersambung.  
3. Given Jumat dan Sabtu terlewat dan pengguna memiliki 2 Streak Recovery, when pengguna memilih menggunakan Streak Recovery pada hari Minggu, then kedua hari tersebut terlindungi, kuota menjadi 0, dan *streak* tetap tersambung.  
4. Given pilihan penggunaan Streak Recovery sudah ditampilkan, when pengguna memilih *reset streak*, then *streak* menjadi 0 dan kuota tetap.  
5. Given pengguna memiliki 1 Streak Recovery dan Jumat terlewat, when pengguna tidak memilih (atau tidak membuka Dicoding) hingga akhir Sabtu dan baru kembali pada Minggu, then jendela pemulihan sudah berakhir, pilihan tidak lagi ditampilkan, *streak* di-reset menjadi 0, kuota tetap 1, dan pengguna mendapat pesan reset satu kali.  
6. Given pengguna memiliki 3 Streak Recovery, aktif dari Senin sampai Rabu, dan Kamis terlewat, when pengguna membuka Dicoding pada Jumat, then sistem langsung menampilkan pilihan untuk melindungi Kamis menggunakan 1 Streak Recovery atau melakukan *reset streak*.  
7. Given pilihan tersebut sudah ditampilkan, when pengguna memilih menggunakan Streak Recovery, then Kamis terlindungi, kuota menjadi 2, dan *streak* tetap 3. Setelah aktivitas valid pada Jumat, *streak* bernilai 4 (Senin, Selasa, Rabu, dan Jumat).  
8. Given pilihan tersebut sudah ditampilkan, when pengguna memilih *reset streak*, then *streak* menjadi 0, kuota tetap 3, dan aktivitas valid pada Jumat membuat *streak* menjadi 1\.  
9. Given pilihan menggunakan Streak Recovery atau *reset streak* sedang ditampilkan, when pengguna mencoba menutup pilihan tanpa menentukan keputusan, then pilihan tetap ditampilkan dan kuota maupun *streak* tidak berubah.  
10. Given pilihan sudah ditampilkan dan pengguna menutup aplikasi tanpa menentukan keputusan, when pengguna membuka Dicoding kembali, then sistem menampilkan pilihan yang sama.  
11. Given pengguna sudah memilih menggunakan Streak Recovery atau melakukan *reset streak*, when pengguna kembali membuka Dicoding, then pilihan untuk hari terlewat yang sama tidak ditampilkan lagi.  
12. Given Jumat sudah dilindungi menggunakan Streak Recovery, when terdapat request penggunaan kedua untuk tanggal yang sama, then kuota tidak berubah dan sistem memberikan respons bahwa hari tersebut sudah terlindungi.  
13. Given terdapat dua request penggunaan Streak Recovery untuk tanggal yang sama secara bersamaan, when kedua request diproses, then hanya satu request yang berhasil dan kuota hanya berkurang satu kali.  
14. Given status pending dan pengguna menyelesaikan modul dari tab yang sudah terbuka sebelumnya, when aktivitas diproses server, then *streak* dan hari aktif terakhir tidak berubah, sedangkan XP tetap diberikan.

## **US-2.3. Menangani Kondisi Streak Recovery Tidak Mencukupi**

**User Story**

Sebagai pengguna, saya ingin mendapatkan informasi yang jelas ketika jumlah Streak Recovery yang saya miliki tidak mencukupi agar saya memahami mengapa *streak* harus dimulai kembali.

**Requirements**

* Jika pengguna memiliki 0 Streak Recovery, sistem tidak menampilkan pilihan penggunaan Streak Recovery. *Streak* akan terputus sesuai aturan Daily Streak yang berlaku.  
* Jika jumlah Streak Recovery lebih sedikit dibandingkan jumlah hari yang terlewat, opsi penggunaan Streak Recovery tidak ditampilkan.  
* Pengguna tidak dapat menggunakan Streak Recovery untuk melindungi sebagian hari saja.  
* Dalam kondisi tersebut, kuota tidak berkurang dan *streak* menjadi 0\.  
* Pengguna mendapatkan informasi bahwa *streak* telah terputus, termasuk jumlah Streak Recovery yang masih dimiliki dan progres pengisian ulang XP. Pesan alasan sama dengan reset otomatis: "Streak kamu direset karena hari yang terlewat melebihi jumlah Streak Recovery."

**Acceptance Criteria**

1. Given pengguna melewatkan tiga hari dan hanya memiliki 2 Streak Recovery, when pengguna kembali membuka Dicoding, then sistem tidak menampilkan pilihan penggunaan Streak Recovery, kuota tetap 2, *streak* menjadi 0, dan pengguna mendapatkan informasi mengenai alasan *streak* terputus.  
2. Given pengguna memiliki 0 Streak Recovery dan melewatkan satu hari, when pengguna kembali membuka Dicoding, then *streak* menjadi 0\.

## **US-2.4. Memperbarui Jumlah Streak Setelah Penggunaan Streak Recovery**

**User Story**

Sebagai pengguna, saya ingin melihat angka *streak* yang sesuai dengan keputusan saya agar tidak bingung ketika menggunakan Streak Recovery atau memilih untuk memulai kembali dari awal.

**Requirements**

* Selama pengguna belum memilih menggunakan Streak Recovery atau melakukan *reset streak*, sistem belum memperbarui status *streak*, dan aktivitas valid tidak menambah *streak*.  
* Angka *streak* yang ditampilkan selama menunggu keputusan tetap menggunakan angka terakhir sebelum hari terlewat.  
* Jika pengguna memilih menggunakan Streak Recovery, hari yang terlewat akan dilindungi, rangkaian *streak* tetap tersambung, dan angka *streak* tidak berubah. Aktivitas valid berikutnya menambah *streak* seperti biasa.  
* Jika pengguna memilih *reset streak* atau jendela pemulihan berakhir, *streak* menjadi 0. Aktivitas valid berikutnya membuat *streak* menjadi 1.  
* Hari yang dilindungi Streak Recovery hanya berfungsi menyambungkan *streak* dan tidak menambah angkanya.

**Contoh:**

Pengguna aktif dari Senin sampai Kamis, melewatkan Jumat, lalu menggunakan Streak Recovery untuk melindungi hari Jumat dan kembali aktif pada Sabtu. Angka *streak* menjadi 5, bukan 6, karena hari Jumat hanya berfungsi menyambungkan rangkaian *streak*.

* Streak Recovery tidak memengaruhi sistem XP maupun *buff* gamifikasi yang sudah berjalan.  
* XP dari aktivitas belajar tetap diberikan seperti biasa, termasuk ketika pengguna memilih Streak Recovery atau melakukan *reset streak*.  
* Hari yang dilindungi Streak Recovery bukan aktivitas belajar sehingga tidak menghasilkan XP.

**Acceptance Criteria**

1. Given pengguna aktif Senin sampai Kamis (*streak* 4), Jumat terlewat, dan memiliki 1 Streak Recovery, when pengguna membuka Dicoding pada Sabtu, memilih menggunakan Streak Recovery, lalu menyelesaikan kuis, then Jumat terlindungi dan *streak* bernilai 5 (Senin sampai Kamis, dan Sabtu). Jumat tidak menambah angka *streak*.  
2. Given kondisi yang sama, when pengguna memilih *reset streak* lalu menyelesaikan kuis pada Sabtu, then *streak* menjadi 1 dan kuota Streak Recovery tetap 1\.  
3. Given pengguna menyelesaikan tiga aktivitas valid pada hari yang sama setelah kembali aktif, when seluruh aktivitas diproses, then sistem hanya mencatat satu *streak* untuk hari tersebut.

# **6\. Epic 3: Pengalaman Pengguna, Informasi, dan Notifikasi**

Pengguna perlu mengetahui jumlah Streak Recovery yang dimiliki, progres pengisian ulang, serta kondisi *streak* mereka saat ini.

Informasi tersebut perlu ditampilkan dengan jelas agar pengguna memahami kapan Streak Recovery dapat digunakan, bagaimana cara mendapatkannya kembali, dan apa dampaknya terhadap *streak*.

Epic ini dikerjakan pada Fase 2, kecuali informasi kuota dan progres pengisian ulang yang sudah termasuk dalam Fase 1\.

## **US-3.1. Melihat Kuota dan Progres Pengisian Ulang**

**User Story**

Sebagai pengguna, saya ingin melihat jumlah Streak Recovery yang saya miliki beserta progres pengisian ulangnya agar dapat mengetahui seberapa besar perlindungan yang masih tersedia untuk *streak* saya.

**Requirements**

* Informasi jumlah Streak Recovery ditampilkan di dekat komponen Daily Streak yang sudah tersedia.  
* Jika kuota berada di bawah 3, sistem juga menampilkan progres XP menuju Streak Recovery berikutnya.

Contoh: `300/500 XP`.

* Kalender atau riwayat Daily Streak perlu membedakan tiga status hari:  
  * Hari aktif.  
  * Hari yang dilindungi Streak Recovery.  
  * Hari terlewat.  
* Tersedia informasi tambahan, baik dalam bentuk halaman maupun *tooltip*, yang menjelaskan:  
  * Jumlah Streak Recovery yang diberikan secara *default*.  
  * Cara mendapatkan kembali Streak Recovery melalui XP.  
  * Cara menggunakan Streak Recovery untuk melindungi hari yang terlewat.

**Acceptance Criteria**

1. Given pengguna memiliki 2 Streak Recovery dengan progres pengisian ulang 300 XP, when pengguna membuka halaman yang menampilkan Daily Streak, then sistem menampilkan kuota 2 dan progres `300/500 XP` sesuai data yang tersimpan.  
2. Given pengguna memiliki 3 Streak Recovery, when halaman dibuka, then sistem menampilkan kuota 3 tanpa menampilkan progres pengisian ulang.  
3. Given Jumat sudah dilindungi menggunakan Streak Recovery, when pengguna membuka kalender *streak*, then Jumat ditampilkan dengan penanda yang berbeda dari hari aktif dan hari terlewat.

## **US-3.2. Mendapatkan Informasi Ketika Streak Recovery Terisi Kembali**

**User Story**

Sebagai pengguna, saya ingin mendapatkan informasi ketika Streak Recovery berhasil terisi kembali melalui XP agar mengetahui bahwa jumlah perlindungan *streak* saya bertambah.

**Requirements**

* Sistem menampilkan informasi ketika kuota Streak Recovery bertambah melalui pengisian ulang XP.  
* Informasi tersebut mencakup jumlah Streak Recovery yang berhasil ditambahkan dan total kuota terbaru.  
* Bentuk informasi dapat berupa *toast* maupun *modal*. Penentuan desain akhir dilakukan bersama Designer.

## 

## 

## **US-3.3. Mendapatkan Pengingat Ketika Streak Terancam**

**User Story**

Sebagai pengguna, saya ingin mendapatkan pengingat ketika *streak* saya berisiko terputus agar memiliki kesempatan untuk kembali belajar pada hari tersebut.

**Requirements**

* Pengingat hanya ditampilkan ketika pengguna belum melakukan aktivitas valid pada hari berjalan, sementara *streak* dari hari sebelumnya masih aktif.  
* Tujuan pengingat adalah mendorong pengguna melakukan aktivitas belajar sebelum hari berakhir.  
* Ketika pengguna kembali membuka Dicoding setelah melewatkan hari, sistem menampilkan pilihan wajib antara menggunakan Streak Recovery atau melakukan *reset streak*.  
* Pilihan tersebut menampilkan informasi mengenai hari yang terlewat dan jumlah Streak Recovery yang akan digunakan.  
* Pengingat hanya menggunakan kanal notifikasi *in-app*.

## **US-3.4. Mendapatkan Konfirmasi Setelah Streak Berhasil Diselamatkan atau Terputus**

**User Story**

Sebagai pengguna, saya ingin mendapatkan informasi mengenai hasil penggunaan Streak Recovery agar memahami perubahan pada *streak* dan kuota yang saya miliki.

**Requirements**

* Jika pengguna berhasil menggunakan Streak Recovery, sistem menampilkan:  
  * Tanggal yang berhasil dilindungi.  
  * Jumlah Streak Recovery yang digunakan.  
  * Sisa kuota Streak Recovery.  
  * Progres pengisian ulang XP.  
  * Angka *streak* terbaru.  
* Jika *streak* terputus karena jumlah Streak Recovery tidak mencukupi, sistem menjelaskan alasan *streak* terputus.  
* Sistem juga perlu menginformasikan bahwa kuota Streak Recovery tidak berkurang dalam kondisi tersebut.  
* Informasi hasil hanya ditampilkan satu kali untuk setiap kejadian.

**Acceptance Criteria**

1. Given Jumat baru saja berhasil dilindungi menggunakan Streak Recovery, when pengguna pertama kali membuka dashboard setelah kejadian tersebut, then sistem menampilkan informasi berupa tanggal Jumat, keterangan "1 Streak Recovery digunakan", sisa kuota, dan angka *streak* terbaru. Informasi tersebut tidak ditampilkan kembali pada kunjungan berikutnya.

# **7\. Aturan Bisnis dan Edge Cases**

Bagian ini merangkum berbagai kondisi yang perlu diperhatikan agar implementasi Streak Recovery tetap konsisten.

Kolom status menunjukkan apakah perilaku tersebut sudah disepakati atau masih berupa usulan untuk didiskusikan lebih lanjut.

| Kasus | Perilaku yang Diharapkan |
| ----- | ----- |
| Pengguna tidak memiliki Streak Recovery (kuota 0\) | *Streak* terputus mengikuti aturan yang berlaku. Pengguna tetap mendapatkan informasi mengenai progres XP menuju Streak Recovery berikutnya. |
| Streak Recovery tidak cukup untuk melindungi seluruh hari terlewat | Kuota tidak berkurang dan *streak* terputus. Pengguna tidak dapat melindungi sebagian hari saja. |
| Penggunaan Streak Recovery secara otomatis atau manual | Streak Recovery hanya digunakan setelah pengguna memilihnya. |
| Pengguna kembali setelah beberapa hari terlewat | Streak Recovery masih dapat digunakan selama pengguna berada dalam jendela pemulihan, yaitu sesuai jumlah kuota yang dimiliki (maksimal 3 hari). |
| Kuota sudah mencapai 3 dan pengguna mendapatkan XP | XP tidak lagi dihitung sebagai progres pengisian ulang. |
| Satu aktivitas menghasilkan XP dalam jumlah besar | XP dapat menambahkan beberapa Streak Recovery sekaligus. Sisa XP tetap dihitung sebagai progres berikutnya selama kuota belum mencapai 3\. |
| Terdapat beberapa hari yang belum terlindungi | Hari dilindungi secara berurutan, dimulai dari hari yang paling lama terlewat. Seluruh hari harus terlindungi agar *streak* dapat tersambung. |
| Aktivitas masuk ke server saat status pending (tab lama, form yang sudah terbuka) | Tidak menambah *streak* dan tidak mengubah hari aktif terakhir. XP tetap diberikan. Lihat [[ADR-003 Mekanisme Pilihan Wajib Recovery atau Reset]]. |
| Pengguna berpindah zona waktu | Tidak relevan. Pergantian hari mengikuti WIB untuk semua pengguna. Lihat [[ADR-002 Pergantian Hari Mengikuti WIB]]. |
| Event aktivitas terlambat diproses | Ditunda, lihat [[Deferred Edge Cases]]. |
| Penggunaan berulang untuk tanggal yang sama | Sistem menggunakan kunci unik per pengguna dan tanggal. Request kedua tidak boleh mengurangi kuota kembali. |
| Penggunaan Streak Recovery untuk hari sebelum fitur dirilis | Tidak diizinkan. |
| Penggunaan Streak Recovery untuk hari ini | Tidak diizinkan karena pengguna masih memiliki kesempatan untuk melakukan aktivitas belajar pada hari tersebut. |
| Koreksi aktivitas, misalnya submission dibatalkan | Mengikuti mekanisme Daily Streak yang berlaku untuk aktivitas yang dibatalkan. |

### 

### 

### **7.1. Aturan yang Wajib Dipenuhi**

Terlepas dari berbagai kondisi di atas, terdapat beberapa aturan utama yang harus selalu dijaga:

1. Satu Streak Recovery hanya dapat melindungi satu hari.  
2. Jumlah kuota tidak boleh kurang dari 0 atau melebihi 3\.  
3. Satu tanggal hanya dapat dilindungi satu kali untuk setiap pengguna.  
4. Streak Recovery tidak menghasilkan XP dan tidak dihitung sebagai aktivitas belajar.  
5. Setiap perubahan kuota, progres pengisian ulang, dan status hari harus tercatat serta dapat diaudit.

# **8\. User Flow**

![][image1]

### **8.1. Alur Penggunaan Streak Recovery**

Alur utama dimulai ketika pengguna kembali membuka Dicoding setelah melewatkan satu atau beberapa hari.

Sistem kemudian memeriksa apakah terdapat hari terlewat, apakah jumlah Streak Recovery mencukupi, dan apakah pengguna masih berada dalam jendela pemulihan.

Jika seluruh kondisi terpenuhi, sistem menampilkan pilihan wajib kepada pengguna untuk menggunakan Streak Recovery atau melakukan *reset streak*.

Streak Recovery hanya akan digunakan jika pengguna memilih opsi tersebut. Jika kuota tidak mencukupi, pengguna memilih *reset*, atau jendela pemulihan berakhir tanpa pilihan, *streak* menjadi 0 tanpa mengurangi kuota yang tersisa.

### **8.2. Alur Pendukung**

**1\. Pengisian ulang Streak Recovery**

Streak Recovery digunakan → pengguna mengumpulkan XP dari aktivitas belajar → setiap mencapai kelipatan XP yang ditentukan, pengguna mendapatkan tambahan 1 Streak Recovery → proses berlangsung hingga kuota kembali mencapai 3 → sistem menampilkan informasi ketika kuota bertambah.

**2\. Pengingat Streak yang Terancam**

Hari berjalan tanpa aktivitas belajar, sementara *streak* dari hari sebelumnya masih aktif → sistem menampilkan pengingat *in-app* → pengguna diharapkan kembali belajar sebelum hari berakhir agar *streak* tidak terputus.

# **9\. Metrik Keberhasilan**

Fitur Streak Recovery diharapkan dapat membantu lebih banyak pengguna mempertahankan kebiasaan belajar meskipun sesekali melewatkan hari.

Keberhasilan fitur tidak hanya diukur dari seberapa sering Streak Recovery digunakan, tetapi juga dari dampaknya terhadap keberlanjutan aktivitas belajar pengguna.

Target numerik akan ditentukan setelah baseline metrik tersedia. Pengukuran dapat dilakukan dengan membandingkan kondisi sebelum dan sesudah rilis, atau menggunakan kelompok kontrol jika fitur dirilis melalui *feature flag*.

### **9.1. Metrik Utama**

| Metrik | Definisi | Tujuan Pengukuran |
| :---: | ----- | ----- |
| *Streak Continuation Rate* | Persentase pengguna dengan *streak* minimal 3 hari yang melewatkan satu hari tetapi berhasil mempertahankan rangkaian *streak*. | Mengukur secara langsung apakah Streak Recovery berhasil menyelesaikan masalah utama. |
| Retensi 7 dan 30 hari setelah hari terlewat | Persentase pengguna yang kembali melakukan aktivitas dalam 7 dan 30 hari setelah hari pertama yang terlewat. | Mengetahui apakah Streak Recovery membantu mengurangi *streak loss churn*. |

### **9.2. Metrik Pendukung**

| Metrik | Definisi | Tujuan Pengukuran |
| ----- | ----- | ----- |
| Tingkat penggunaan Streak Recovery | Persentase pilihan wajib yang dijawab dengan menggunakan Streak Recovery dibandingkan dengan melakukan *reset*. | Mengetahui apakah pengguna memahami dan menganggap fitur ini bermanfaat. |
| Waktu pengisian ulang | Rata-rata jumlah hari yang dibutuhkan sejak kuota berkurang hingga kembali mencapai 3\. | Menjadi bahan evaluasi untuk menentukan jumlah XP yang ideal bersama tim Gamifikasi. |
| Rata-rata panjang *streak* | Median panjang *streak* aktif pengguna. | Melihat dampak fitur terhadap kebiasaan belajar jangka panjang. |
| Rasio hari aktif dan hari terlindungi | Perbandingan jumlah hari aktif dengan hari yang dilindungi Streak Recovery dalam rangkaian *streak*. | Memastikan Streak Recovery tidak menggantikan aktivitas belajar. |
| *Daily Active Learners* | Jumlah pengguna yang melakukan minimal satu aktivitas valid setiap hari. | Memastikan aktivitas belajar harian tidak mengalami penurunan setelah fitur dirilis. |
| Keluhan *streak* ke Support | Jumlah laporan atau tiket terkait *streak* yang hilang. | Mengukur apakah aturan dan pengalaman penggunaan fitur sudah cukup jelas. |

Seluruh metrik tersebut membutuhkan dukungan *event tracking* yang mencakup:

* Pengisian ulang melalui XP.  
* Penggunaan Streak Recovery.  
* Pilihan *reset streak* dan reset otomatis.  
* Kegagalan penggunaan Streak Recovery.  
* Identitas pengguna.  
* Tanggal yang dilindungi.  
* Jumlah kuota sebelum dan sesudah transaksi.  
* Progres pengisian ulang sebelum dan sesudah transaksi.

# 

# **10\. Dependensi**

### **10.1. Dependensi**

Pengembangan Streak Recovery bergantung pada beberapa sistem dan tim yang sudah berjalan:

**1\. Daily Streak**

* Pencatatan aktivitas harian pengguna.  
* Mekanisme penentuan apakah *streak* masih aktif atau sudah terputus.  
* Penentuan batas hari berdasarkan zona waktu.  
* Komponen tampilan Daily Streak yang sudah tersedia.

**2\. Gamifikasi (XP)**

* Event perolehan XP dari setiap aktivitas yang dapat digunakan sebagai pemicu pengisian ulang Streak Recovery.  
* Feature flag `gamification_core_learning_xp` yang direncanakan aktif untuk seluruh pengguna ketika Streak Recovery dirilis.

**3\. Notifikasi**

* Ketersediaan kanal notifikasi *in-app* untuk mengingatkan pengguna ketika *streak* terancam.

**4\. Analytics**

* Dukungan *event tracking* untuk mengukur metrik keberhasilan yang sudah dijelaskan pada bagian sebelumnya.

# **11\. Fase dan Strategi Rilis**

Pengembangan Streak Recovery direncanakan dilakukan secara bertahap agar kebutuhan utama dapat segera tersedia, sementara penyempurnaan pengalaman pengguna dan pengukuran dampaknya dapat dikerjakan pada fase berikutnya.

Tahapan berikut masih berupa rancangan dan belum memiliki tanggal target.

### **11.1. Tahapan Pengembangan**

| Tahap | Cakupan | Pertimbangan |
| ----- | ----- | ----- |
| Persiapan | Menjawab pertanyaan stakeholder, khususnya penentuan jumlah XP untuk mendapatkan 1 Streak Recovery, menyiapkan desain, dan mengukur baseline metrik. | Jumlah XP yang dibutuhkan akan memengaruhi mekanisme pengisian ulang. |
| Fase 1 | Epic 1, Epic 2, dan US-3.1 (kuota, progres pengisian ulang, dan status hari). | Memastikan mekanisme inti Streak Recovery sudah dapat digunakan, mulai dari mendapatkan kuota, mengisi ulang, hingga melindungi *streak*. |
| Fase 2 | US-3.2 sampai US-3.4 serta implementasi *event tracking*. | Melengkapi informasi kepada pengguna dan memastikan dampak fitur dapat diukur. |
| Fase 3 | UAT, rilis bertahap menggunakan *feature flag*, dan evaluasi metrik. | Memvalidasi implementasi serta dampak fitur sebelum dirilis kepada seluruh pengguna. |

### **11.2. Strategi Rilis**

Beberapa hal yang perlu diperhatikan dalam proses peluncuran:

* Fitur dirilis menggunakan *feature flag* agar dampaknya dapat dibandingkan dengan kelompok kontrol.  
* Ketika fitur diaktifkan, seluruh pengguna mendapatkan 3 Streak Recovery.  
* Streak Recovery hanya berlaku untuk hari terlewat setelah tanggal rilis fitur. Hari yang terlewat sebelum fitur dirilis tidak dapat dilindungi.  
* Komunikasi peluncuran perlu menjelaskan secara singkat jumlah Streak Recovery yang diberikan, cara mendapatkan kembali Streak Recovery melalui XP, dan bagaimana cara menggunakannya.

  ## **Meeting Notes:**

* Bukan streak freeze, tapi streak recovery dengan konsep hari yang terlewat jika di-recover tidak akan ikut ke dalam perhitungan current streak.  
* Memikirkan mekanisme recycle streak ini. Berapa XP yang dibutuhkan oleh user untuk dia recycle?  
  * Meningkatkan motivasi belajar \-\> Bisa “di-monetize” oleh S\&M.  
* [Lalu Triawanri Novianung (Aan)](mailto:lalu@dicoding.com)Ada batas maksimum user yang membuka Dicoding dan itu yang harus di-maintain.  
  * Melihat jangka pendek untuk recovery ini.  
* [Ahmad Imaduddin](mailto:ahmad@dicoding.com)Pake jangka pendek, berapa hari toleransi streak putus yang dialami oleh user?  
  * Misal: Dapet 300 XP dapet 1 streak.  
* 

[image1]: <data:image/png;base64,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>