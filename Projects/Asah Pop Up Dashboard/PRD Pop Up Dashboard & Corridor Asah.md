---
date: 2026-10-13
updated: 2026-10-13
type: prd
tags: [prd, brief, dicoding, asah]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Tab 1

# **Product Requirement Document (PRD)**

Status			: Draft  
Last Updated		: 10 Jun 2026  
Target Release	: TBD

## **Overview**

PopUp Cross-Selling Asah 2026 adalah fitur in-platform yang memungkinkan tim internal menampilkan pesan promosi program Asah 2026 secara tertarget kepada pengguna aktif di dalam platform Dicoding, tanpa membutuhkan budget eksternal dan tanpa mengorbankan pengalaman belajar pengguna. 

Fitur ini memanfaatkan infrastruktur PopUp yang sebelumnya telah digunakan untuk program Pijak dengan conversion rate 2.1% dan Coding Camp dengan conversion rate 2.9% dari halaman [dicoding.com/blog](http://dicoding.com/blog).

**Tujuan Utama:**  
Meningkatkan registrasi program Asah 2026 dengan memanfaatkan traffic pengguna aktif yang sudah ada di platform, sebagai channel distribusi yang lebih efisien dibandingkan channel eksternal. Target popup aktif: 15 Juni – 6 Agustus 2026\.

**Fitur Utama (MVP):**

* PopUp berbasis placement di Homepage, Dashboard, dan Classroom  
* Segmentasi pengguna yang menerima popup (eligibility logic)  
* CTA button yang terhubung ke halaman registrasi Asah 2026 atau Bootcamp  
* Event tracking untuk mengukur performa setiap popup

## **Problem Alignment**

Program Asah 2026 membutuhkan saluran distribusi informasi yang efektif kepada pengguna internal platform. Awareness terhadap program ini masih sangat bergantung pada channel marketing activation eksternal  social media organic & ads, email & WA blasting, KoL activation  yang membutuhkan budget signifikan. Padahal basis pengguna aktif di dalam platform jauh lebih besar dan memiliki intent belajar yang lebih tinggi, sehingga berpotensi menghasilkan konversi yang lebih efisien.

Fitur PopUp Cross-Selling Asah 2026 diharapkan menjadi mekanisme in-platform untuk menjembatani gap antara jumlah pengguna aktif yang sudah ada dengan tingkat registrasi yang belum optimal, tanpa mengorbankan pengalaman belajar pengguna.

## **Key Insights**

Existing Conversion Rate Popup Benchmark

| Program | Source | Views | Conversion Rate |
| :---- | :---- | :---- | :---- |
| Pijak | dicoding.com/blog | 941.261 | 2.1% |
| Coding Camp | dicoding.com/blog | 490.432 | 2.9% |

Existing Insight Popup Benchmark from Pijak

| Metric | pijak\_cta\_click  |  |  | pijak\_corridor\_cta\_click  |
| ----- | ----- | ----- | ----- | ----- |
|  | **dashboard** | **classroom** | **certificate** |  |
| Event Count  | 11,000 | 1,400 | 41 | 2,200 |
| Total Users  | 8,300 | 1,200 | 38 | 1,900 |
| Event/Active User  | 1.4  | 1.4 | 1.4 | 1.1  |

\#Existing Platform Traffic (Jan 1 – June 1, 2026\)

| Source | Views | Views/Active User | Avg. Engagement Time (s) |
| :---- | :---- | :---- | :---- |
| /dashboard | 1,896,852 | 175,264 | 2m 53s |
| /academies/my | 1,426,160 | 139,615 | 2m 35s |
| /academies/184/corridor | 184,317 | 26,063 | 1m 16s |
| /academies/123/corridor | 127,238 | 22,952 | 1m 07s |
| /academies/86/corridor | 126,811 | 27,573 | 45s |
| /academies/653/corridor | 105,242 | 30,097 | 36s |
| /academies/256/corridor | 94,174 | 16,231 | 2m 40s |

Top 5 Koridor Kelas (berdasarkan traffic):

* Belajar Machine Learning untuk Pemula  
* Belajar Dasar Pemrograman Web  
* Memulai Pemrograman dengan Python  
* Belajar Dasar AI  
* Belajar Dasar Pemrograman JavaScript

Relevansi terhadap Asah 2026:  
Learning path Asah 2026 mencakup: 

* AI Full-Stack Developer  
* Data Science Specialist  
* Next-Gen AI Engineer

Kelas-kelas di Top 5 Koridor relevan secara konten, namun perlu dicek potensi konflik dengan program aktif lain (Bootcamp) sebelum placement popup di koridor diaktifkan.

Notes:  
Halaman /academysubmissions di-exclude karena anomali views/active user 1,521x (user sedang fokus mengerjakan submission, engagement time \~2.2 jam). Placement di halaman ini berpotensi mengganggu learning experience.

## **Conflict Program di Top 5 Corridor**

Seluruh top 5 koridor kelas saat ini juga menjadi target program Bootcamp Batch 15\. Diperlukan solusi mengenai cara menampilkan informasi program Asah 2026 dan Bootcamp Batch 15 kepada segmen pengguna yang tepat tanpa mengganggu placement program yang sudah berjalan.

## **Goals & Metrics**

### 

### Goals

| Goals | Keterangan |
| :---- | :---- |
| Meningkatkan awareness program Asah 2026 kepada internal user | Target: pengguna aktif platform yang belum terdaftar Asah 2026 |
| Meningkatkan registrasi program dari traffic internal platform | Dari pengguna aktif yang disesuaikan berdasarkan placement popup |
| Tidak mengganggu pengalaman belajar pengguna | Popup hanya muncul di titik yang aman secara learning journey |
| Memanfaatkan infrastruktur popup yang sudah ada | Reuse PopUp Cross-Selling yang telah dibangun untuk program Pijak |

### Success Metrics

| Metrics | Target | How to Track |
| :---- | :---- | :---- |
| Conversion rate Pop Up | \> 5% | Event Tracker CTA button |
| Registrasi traffic pop up | \> 2% dari total popup impression | Google Analytics Dash |
| Pop CTR | \> 5% | asah\_cta\_click |

### Eligibility Metrics (Target Users)

| Kondisi Users | Tampilkan Pop Up? |
| :---- | :---- |
| Sudah full registrasi ke Asah 2026 (total registrant) | Exclude |
| Sudah melakukan pembayaran Rp 250.000 (paid registrant) | Exclude |
| Sudah mendaftar ke Bootcamp 15 |  |
| Berlangganan aktif (Subscription/Langganan) program Dicoding | Exclude |
| Sudah pernah lihat popup di placement yang sama pada campaign ini | Exclude |
| Belum login (guest) | Exclude |
| Users dengan token Dicoding Bootcamp | Exclude |

## **Deliverables Details**

Phase 1 \- MVP (Prioritas Asah 2026\)

### Scope Placement

| Page | URL | Titik munculnya Popup | Priority |
| :---- | :---- | :---- | :---- |
| Homepage | dicoding.com | Saat pertama kali user login | High |
| Dashboard | /dashboard | Setelah halaman load / saat idle | High |
| Classroom | /academies/my | Saat pertama kali masuk ke halaman classroom | Medium |
| Koridor | /academies/\\d+/corridor | Saat pertama kali masuk koridor (non-conflict) | Low |

### Eligibility Logic (Segmentasi Pengguna)

| Halaman Homepage |
| :---- |

User story \#0 → As a user, I want to see a pop-up when I visit the Homepage, so that I am aware of the Asah 2026 program

| 🟢 Scenario 1: Popup muncul untuk logged-in user yang eligible di Homepage Given user sudah login ke platform Dicoding And user TIDAK memiliki subscription aktif dan token exclude aktif And user BELUM registrasi ke program Asah 2026 (total maupun berbayar) And popup BELUM pernah ditampilkan ke user ini di placement homepage pada campaign saat ini Then halaman homepage berhasil dimuat And popup cross-selling Asah 2026 ditampilkan |
| :---- |

| Halaman Dashboard |
| :---- |

User story \#1 → As a user, I want to see a pop-up when I visit the dashboard page, so that I am aware of the Asah 2026 program

| 🟢 Scenario 1: Pop-up muncul saat user navigasi ke Dashboard dari Landing Page Background: Given user sudah login ke platform Dicoding And user TIDAK memiliki subscription aktif dan token exclude aktif And user BELUM registrasi ke program Asah 2026 And campaign popup Asah 2026 sedang aktif And popup BELUM pernah ditampilkan ke user ini pada campaign saat ini Scenario: Pop-up muncul ketika user masuk ke Dashboard dari Landing Page Given user berada di halaman Landing Page (/) When user mengklik menu "Home" atau navigasi ke "/dashboard" Then halaman Dashboard berhasil dimuat And pop-up cross-selling Asah 2026 ditampilkan di atas konten dashboard |
| :---- |

| Halaman Academy / Classroom (Progress Belajar) |
| :---- |

User Story \#2 → As a user, I want to see a pop-up when I visit the Academy page, so that I am aware of the Asah 2026 program

| 🟢 Scenario 1: PopUp Cross-Selling on Academy Page (/academies/my) Background: Given user sudah login ke platform Dicoding And user TIDAK memiliki subscription aktif dan token exclude aktif And user BELUM registrasi ke program Asah 2026 And campaign popup Asah 2026 sedang aktif Scenario: Popup muncul saat user membuka tab "Kelas yang Dipelajari" Given user belum pernah melihat popup di halaman /academies/my pada campaign Asah 2026 saat ini When user mengklik menu "Academy" dari navbar atas Then user diarahkan ke halaman "/academies/my" And tab "Kelas yang Dipelajari" aktif secara default And daftar kelas yang sedang dipelajari ditampilkan And popup cross-selling Asah 2026 ditampilkan di atas konten halaman |
| :---- |

| Halaman Koridor (Kelas Non-Conflict) |
| :---- |

User Story \#3 → As a user, I want to see a pop-up when I visit a corridor page of a non-conflict class, so that I am aware of the Asah 2026 program

| Background Given user sudah login ke platform Dicoding And user TIDAK memiliki subscription aktif dan token exclude aktif And user BELUM registrasi ke program Asah 2026 And campaign popup Asah 2026 sedang aktif And popup BELUM pernah ditampilkan ke user ini pada placement corridor dalam campaign saat ini |
| :---- |

| 🟢 Scenario 1: Popup muncul di corridor kelas yang tidak overlap program aktif Given user memenuhi semua kondisi Background And halaman corridor BUKAN kelas yang digunakan oleh Bootcamp dan Tempa When user mengakses halaman "/academies/{id}/corridor" Then halaman corridor berhasil dimuat And popup cross-selling Asah 2026 ditampilkan |
| :---- |

| 🟢 Scenario 2: Popup TIDAK muncul di corridor kelas yang overlap dengan program aktif Given user adalah peserta aktif Bootcamp atau Tempa When user mengakses corridor kelas yang digunakan oleh program tersebut Then halaman corridor berhasil dimuat And popup TIDAK ditampilkan |
| :---- |

### Edge Cases

| 🟢 Scenario 1: Pop-up TIDAK muncul jika user sudah terdaftar di program Asah 2026 Given user sudah terdaftar (registrasi total maupun berbayar) di program Asah 2026 When user mengunjungi halaman "/dashboard" dari sumber manapun Then halaman Dashboard berhasil dimuat And pop-up cross-selling Asah 2026 TIDAK ditampilkan And dashboard ditampilkan seperti biasa tanpa gangguan |
| :---- |

| 🟢 Scenario 2: Pop-up TIDAK muncul jika sudah pernah ditampilkan pada campaign yang sama Given pop-up sudah pernah ditampilkan ke user ini pada campaign Asah 2026 saat ini When user mengunjungi halaman "/dashboard" kembali (visit ke-2, ke-3, dst.) Then halaman Dashboard berhasil dimuat And pop-up cross-selling Asah 2026 TIDAK ditampilkan lagi And dashboard ditampilkan seperti biasa |
| :---- |

| 🟢 Scenario 3: User menutup pop-up dengan tombol close Given pop-up cross-selling Asah 2026 sedang ditampilkan When user mengklik tombol close (✕) pada pop-up Then pop-up menghilang dari layar And user dapat berinteraksi dengan konten halaman secara normal |
| :---- |

### Event Tracking

| Placement | Event Tracker |
| :---- | :---- |
| Homepage | asah\_cta\_click |
| Dashboard | asah\_cta\_click |
| Classroom | asah\_cta\_click |
| Corridor | asah\_corridor\_cta\_click |

### Timeline

Campaign Period: 15 Juni – 6 Agustus 2026 (52 hari)

| Milestone | Target Date |
| :---- | :---- |
| Draft & Submit Requirement | 4 Jun 2026 |
| Design \- Homepage & Dashboard |  |
| Design \- Classroom & Corridor |  |
| Setup Event Tracker (asah\_cta\_click, asah\_corridor\_cta\_click) |  |
| Live  PopUp aktif di Homepage & Dashboard | TBD |
| Live  PopUp aktif di Classroom & Corridor (if cleared) |  |
| Campaign End | 6 Ags 2026 |

### Insights

Section ini akan diisi setelah campaign berjalan. Data yang akan di-track:

| Metric | asah\_cta\_click | asah\_corridor\_cta\_click |
| :---- | :---- | :---- |
| Event Count | \- | \- |
| Total Users | \- | \- |
| Event/Active User | \- | \- |

# Draft Narasi Pop-Up

## **Draft Narasi Pop-Up**

**Alternative 1**

| Ada kesempatan belajar IT bareng mentor expert, lengkap dengan sertifikat untuk portofolio kamu\! 🚀Biar rekomendasi program belajarnya makin pas, boleh kasih tau kami, status kamu sekarang: |  |
| :---: | :---: |
| **Opsi A** | **Opsi B** |
| **Mahasiswa Aktif** | **Sudah Lulus / Bekerja / Lainnya** |
| **Asah 2026** | **Bootcamp Batch 15** |
|  \[image\]  Kembangkan kemampuan AI Full-Stack Developer, Data Science Specialist, atau Next-Gen AI Engineer bareng mentor profesional, dapatkan sertifikat, dan bangun portofolio yang dilihat industri, mulai dari sekarang.Kuota terbatas\! Pendaftaran dibuka sampai 6 Agustus 2026\. |  [\[image\]](https://drive.google.com/file/d/1oY_P03hrivF47_i68_QfMPc4ZPg56kD6/view?usp=drive_link)  Siapkan dirimu untuk berkarier di industri teknologi bersama Dicoding Bootcamp\! Belajar langsung dari expert, bangun portofolio melalui proyek nyata, dan dapatkan dukungan karier untuk menjadi talenta digital siap kerja.Kuota terbatas\! Pendaftaran dibuka sampai 31 Juli 2026\. |

**Alternative 2**

| Saatnya upgrade pengalaman belajar jadi lebih intensif dengan bimbingan praktisi industri, live session mingguan, dan project akhir yang bisa langsung kamu jadikan portofolio profesional \! 🚀Ambil kesempatannya sekarang\! |  |
| :---: | :---: |
| **Opsi A** | **Opsi B** |
| **Saya Mahasiswa Aktif** | **Saya Sudah Lulus / Bekerja / Lainnya** |
| **Asah 2026** | **Bootcamp Batch 15** |
|  \[image\]  Kembangkan kemampuan AI Full-Stack Developer, Data Science Specialist, atau Next-Gen AI Engineer bareng mentor profesional, dapatkan sertifikat, dan bangun portofolio yang dilihat industri, mulai dari sekarang.Kuota terbatas\! Pendaftaran dibuka sampai 6 Agustus 2026\. | [\[image\]](https://drive.google.com/file/d/1oY_P03hrivF47_i68_QfMPc4ZPg56kD6/view?usp=drive_link)  Wujudkan karier impianmu di dunia teknologi\! Pilih jalur Full Stack Web Developer atau Generative AI, belajar bersama praktisi industri, bangun portofolio melalui proyek nyata, dan tingkatkan kesiapanmu memasuki dunia kerja. Kuota terbatas\! Pendaftaran dibuka sampai 31 Juli 2026\. |

