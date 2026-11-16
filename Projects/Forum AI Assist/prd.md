---
date: 2026-10-13
updated: 2026-10-13
type: prd
tags: [prd, brief, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# **Forum AI Assist \- PRD**

**Product Name:** Forum AI Assist  
**Version:** 1.0 (MVP)  
**Status:** Draft  
**Last Updated:** 12 April 2026  
**Based on:** Survei Indonesia Developer Outlook 2026 (n \= 2.576 responden)

---

## **1\. Executive Summary**

Forum AI Assist adalah fitur tambahan pada Forum Diskusi kelas Dicoding yang memungkinkan siswa **meminta bantuan jawaban dari AI** saat membuat pertanyaan baru. AI memberikan respons berbasis konteks materi kelas, diskusi sebelumnya, kode yang dilampirkan, dan web search ketika diperlukan, sehingga siswa mendapatkan panduan awal tanpa harus menunggu lama untuk direspons expert atau peer.

Forum AI Assist **tidak menggantikan interaksi manusia**. Expert dan sesama siswa tetap bisa menjawab seperti biasa. AI hadir sebagai *first response* yang cepat dan sebagai basis knowledge publik yang dapat dimanfaatkan siswa lain dengan pertanyaan serupa.

### **Konsep Utama**

1. **Opt-in per Pertanyaan**: Siswa menentukan sendiri apakah pertanyaannya mau dibantu jawab oleh AI melalui checkbox saat membuat diskusi. Tidak semua diskusi perlu dijawab AI.  
2. **Slot Khusus untuk Jawaban AI**: Jawaban AI memiliki area tersendiri di halaman diskusi, terpisah dari kolom reply manusia. Jawaban AI tidak dapat di-reply — hanya dapat diberi *feedback*.  
3. **Premium-Only untuk Penanya, dengan Passive Discovery**: Hanya siswa Premium yang **dapat menggunakan** opsi *"Bantu jawab dengan AI"*. Namun, checkbox tetap terlihat oleh siswa non-Premium dalam keadaan disabled, disertai narasi bahwa fitur ini eksklusif untuk berlangganan. Tujuannya: menjaga cost AI dan kualitas layanan, sekaligus memberikan paparan fitur premium ke siswa non-Premium sebagai growth channel.  
4. **Konteks Kelas sebagai Grounding Utama**: AI menjawab berdasarkan materi kelas, diskusi lama yang relevan di kelas tersebut, dan kode yang dilampirkan penanya. Web search digunakan sebagai pelengkap agar jawaban tetap up-to-date.  
5. **Moderasi Post-hoc**: Jawaban AI tampil langsung setelah diproses. Admin, Academy Admin, dan Academy Manager dapat menghapus jawaban yang dianggap salah atau tidak pantas.

### **Diferensiasi dari Fitur AI Lain**

| Fitur | Sifat | Interaksi | Visibilitas |
| :---- | :---- | :---- | :---- |
| Student Chatbot (on-progress) | Personal, 1-on-1 | Siswa aktif bertanya, respons private | Hanya siswa ybs |
| Explain with AI (existing) | Kontekstual di materi | Siswa klik "jelaskan ini", respons inline | Hanya siswa ybs |
| **Forum AI Assist (fitur ini)** | **Community-facing** | **Otomatis trigger saat post opt-in, respons publik** | **Seluruh peserta kelas** |

Forum AI Assist unik karena jawabannya **menjadi bagian dari knowledge base publik kelas**. Siswa lain dengan pertanyaan serupa dapat menemukan dan membaca jawaban AI tersebut tanpa harus bertanya ulang.

---

## **2\. Problem Statement**

### **2.1 Masalah yang Diselesaikan**

Berdasarkan Survei Indonesia Developer Outlook 2026 (n \= 2.576 responden), Dicoding mengidentifikasi tiga pain point utama yang dapat langsung dijawab oleh fitur ini:

1. **Respons Forum yang Lambat** Forum Diskusi dipilih **38,6%** responden sebagai fitur platform paling membantu saat belajar programming, menandakan forum merupakan channel penting. Namun, dalam praktiknya, siswa sering menunggu lama untuk mendapatkan *first response* dari expert atau peer — terutama di luar jam kerja. Penundaan ini menghambat proses belajar yang seharusnya berjalan fluid.  
     
2. **Keterbatasan Waktu Siswa** Kendala "keterbatasan waktu / kesibukan kerja" dipilih **62,7%** responden sebagai hambatan terbesar dalam belajar. Saat siswa meluangkan waktu terbatas untuk belajar dan tersendat karena pertanyaan tidak terjawab, sesi belajar berpotensi terbuang. Mereka butuh *first response* cepat agar dapat melanjutkan belajar.  
     
3. **Kurangnya Motivasi karena Minim Feedback Cepat** Kendala "kurang motivasi" dirasakan **24,8%** responden. Respons cepat di forum berkontribusi pada engagement — siswa yang pertanyaannya direspons cepat cenderung lebih terlibat dan lebih kecil kemungkinannya drop-off.

### **2.2 Peluang Inovasi**

Survei juga mencatat **AI Assistant dalam Materi** sudah dipilih **31,7%** responden sebagai fitur yang membantu — menunjukkan bahwa adopsi AI dalam learning experience sedang bertumbuh dan siswa terbuka untuk dibantu oleh AI. Ini peluang untuk menggabungkan kebutuhan *forum yang responsif* dengan tren *AI-assisted learning*.

### **2.3 Solusi: Forum AI Assist**

Fitur ini memberikan siswa **pilihan** untuk meminta bantuan AI saat membuat diskusi baru. AI merespons secara asynchronous berdasarkan konteks kelas, dan jawabannya muncul di slot khusus yang jelas ditandai sebagai "Dijawab oleh AI". Expert dan peer tetap dapat menjawab di kolom reply normal, sehingga siswa mendapatkan **dua lapis bantuan**: respons cepat dari AI dan jawaban mendalam dari manusia.

---

## **3\. Goals & Success Metrics**

### **3.1 Goals**

1. **Mempercepat First Response di Forum Kelas**: Siswa yang opt-in AI mendapat jawaban awal jauh lebih cepat dibanding menunggu expert/peer.  
2. **Membangun Public Knowledge Base Kelas**: Jawaban AI menjadi referensi yang dapat dibaca dan dicari oleh seluruh peserta kelas, mengurangi pertanyaan berulang.  
3. **Meningkatkan Engagement Siswa Premium**: Forum yang lebih responsif mendorong siswa untuk lebih sering bertanya dan lebih lama tinggal di platform.  
4. **Mengurangi Beban Expert untuk Pertanyaan Dasar**: Expert dapat memfokuskan perhatian ke diskusi yang lebih kompleks karena pertanyaan dasar sudah terjawab duluan oleh AI.  
5. **Menjadi Growth Channel untuk Konversi Premium**: Checkbox opt-in yang terlihat oleh siswa non-Premium dalam keadaan disabled (dengan narasi dan CTA upgrade) memberikan paparan fitur Premium ke segmen yang belum berlangganan, membuka peluang konversi organik.

### **3.2 Success Metrics**

| Metric | Definisi | Target MVP | Cara Mengukur |
| :---- | :---- | :---- | :---- |
| **Adoption Rate** | % diskusi baru yang opt-in AI dari total diskusi baru di forum kelas premium | ≥ 30% dalam 2 bulan pertama | Rasio `diskusi_opt_in / total_diskusi_baru` per minggu |
| **Helpful Rate** | % jawaban AI yang di-*rate* "helpful" oleh penanya dari total jawaban AI yang diberi feedback | ≥ 70% | Rasio `feedback_helpful / total_feedback` |
| **Penurunan Waktu Forum Terselesaikan** | Rata-rata selisih waktu antara post dibuat sampai penanya menandai diskusi sebagai "selesai", dibanding baseline pre-fitur | Turun ≥ 25% | Perbandingan median `waktu_selesai` antara diskusi opt-in AI vs. non-opt-in (dan vs. baseline historis) |
| **Upsell CTA Click-Through Rate** | % siswa non-Premium yang melihat checkbox opt-in AI dan meng-klik CTA "Upgrade ke Premium" | Baseline tracking (belum ada target MVP) | Rasio `klik_cta_upgrade / impression_form_diskusi_non_premium` per minggu |
| **Premium Conversion dari Forum** | Jumlah siswa non-Premium yang berlangganan Premium setelah meng-klik CTA upgrade dari form diskusi, dalam window 7 hari | Baseline tracking (belum ada target MVP) | Attribution dari klik CTA → pembelian Premium dengan UTM / referrer tracking |

Metric tambahan untuk dipantau (tidak jadi target utama di MVP):

* Jumlah jawaban AI yang dihapus oleh moderator (indikator kualitas buruk)  
* Jumlah feedback "not helpful" (indikator perbaikan retrieval/prompt)  
* Rata-rata jumlah reply manusia di diskusi yang opt-in AI vs. yang tidak (memastikan AI tidak "membunuh" diskusi manusia)  
* Impression form pembuatan diskusi oleh siswa non-Premium (denominator untuk CTR upsell)

---

## **4\. Scope MVP**

### **4.1 In Scope (Must Have)**

| Fitur | Deskripsi |
| :---- | :---- |
| Opt-in Checkbox di Post Creation | Siswa Premium dapat mencentang "Bantu jawab dengan AI" saat membuat diskusi baru di forum kelas |
| Slot Khusus untuk Jawaban AI | Area terpisah di halaman diskusi yang khusus menampilkan jawaban AI, dengan label "Dijawab AI" yang jelas |
| Placeholder Loading State | Saat AI sedang memproses, slot AI menampilkan placeholder "AI sedang menyusun jawaban untuk diskusi ini..." |
| Jawaban AI Non-Replyable | Jawaban AI tidak dapat di-reply. Hanya penanya/pembaca yang dapat memberikan feedback |
| Feedback Helpful / Not Helpful | Siswa dapat menandai jawaban AI sebagai membantu atau tidak membantu |
| Feedback Kualitatif | Siswa dapat memberikan feedback kualitatif ketika merasa jawaban AI tidak membantu. |
| Konteks Materi Kelas | AI memiliki akses ke materi/modul kelas terkait saat menyusun jawaban |
| Konteks Diskusi Lama di Kelas | AI dapat merujuk ke diskusi yang relevan dari kelas yang sama |
| Konteks Kode Terlampir | Jika penanya melampirkan kode di post, AI dapat membaca dan menganalisisnya |
| Fallback Knowledge Umum | AI boleh menggunakan knowledge umum saat konteks kelas tidak cukup untuk menjawab |
| Web Search Tool | AI dapat melakukan pencarian web untuk informasi yang butuh data up-to-date (versi library, API terbaru, dll) |
| Async Processing | Pemrosesan jawaban berjalan di background, tidak memblokir penanya saat submit post |
| Retry on Failure | Jika AI gagal menjawab, sistem melakukan retry maksimal 2 kali sebelum menampilkan error state |
| Error State di Slot AI | Jika gagal setelah retry, slot AI menampilkan pesan bahwa AI tidak dapat menjawab pertanyaan ini |
| Quota Harian per Siswa | Setiap siswa Premium memiliki kuota harian maksimal request AI untuk mencegah abuse |
| Premium Gating untuk Penanya | Opsi opt-in AI hanya muncul untuk siswa Premium; non-premium tidak melihat opsi ini |
| Moderasi oleh Admin/Academy Admin/Academy Manager | Role moderator dapat menghapus jawaban AI yang dianggap salah atau tidak pantas |

### **4.2 Out of Scope (Future Phase)**

| Fitur | Alasan |
| :---- | :---- |
| Edit konten jawaban AI oleh moderator | Moderator hanya dapat menghapus (bukan mengedit) untuk menjaga transparansi di MVP |
| Auto-regenerate setelah feedback "not helpful" | Feedback negatif di MVP digunakan sebagai data evaluasi, bukan trigger retry otomatis |
| Integrasi notifikasi push/email khusus AI | MVP mengandalkan sistem notifikasi forum yang sudah ada |
| Opt-in AI untuk post non-Premium | Cost control di MVP; bisa dievaluasi di fase berikutnya |
| Jawaban AI untuk reply di thread diskusi | AI hanya menjawab pertanyaan utama, tidak ikut di dalam diskusi lanjutan |
| Moderasi pre-publish (queue approval) | Menghilangkan benefit "respons cepat". Moderasi berjalan post-hoc |
| Dashboard analytics untuk PM/moderator | MVP menggunakan query manual / BI existing; dashboard dedicated di fase berikutnya |
| Hard cap budget / cost limiter otomatis | MVP mengandalkan quota harian per siswa. Budget cap otomatis di-evaluasi setelah ada data actual cost |

---

## **5\. Functional Requirements**

### **5.1 Post Creation dengan Opt-in AI**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-01 | Siswa Premium harus dapat melihat dan mencentang checkbox "Bantu jawab dengan AI" saat membuat diskusi baru di forum kelas | High |
| FR-02 | Checkbox opt-in AI **harus tetap tampil** untuk siswa non-Premium dalam keadaan disabled, disertai narasi bahwa fitur ini eksklusif untuk siswa berlangganan dan CTA untuk upgrade | High |
| FR-03 | Siswa non-Premium **tidak boleh** dapat mencentang atau memicu opt-in AI saat membuat diskusi (enforcement di client dan server) | High |
| FR-04 | Siswa Premium harus tetap dapat membuat diskusi tanpa mencentang opt-in AI (opt-in bersifat opsional) | High |
| FR-05 | Saat siswa Premium sudah mencapai kuota harian AI, checkbox opt-in AI harus di-disable dengan informasi alasannya | High |
| FR-06 | Saat diskusi baru dengan opt-in AI disubmit, sistem harus segera menampilkan diskusi kepada penanya tanpa menunggu jawaban AI siap | High |

### **5.2 Pemrosesan Jawaban AI**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-07 | Sistem harus memproses jawaban AI secara asynchronous di background setelah diskusi dengan opt-in AI dibuat | High |
| FR-08 | AI harus memiliki akses ke materi/modul kelas tempat diskusi dibuat sebagai konteks grounding utama | High |
| FR-09 | AI harus dapat merujuk ke diskusi lama di kelas yang sama yang relevan dengan pertanyaan | High |
| FR-10 | AI harus dapat membaca kode yang dilampirkan oleh penanya di body post sebagai konteks | High |
| FR-11 | AI harus dapat melakukan web search untuk memperkaya jawaban dengan informasi up-to-date ketika diperlukan | Medium |
| FR-12 | AI boleh menggunakan knowledge umumnya sebagai fallback ketika konteks kelas tidak cukup untuk menjawab | Medium |
| FR-13 | Sistem harus melakukan retry maksimal 2 kali ketika pemrosesan jawaban AI gagal (error LLM, timeout, konten tidak pantas) | High |
| FR-14 | Sistem harus memiliki quota harian maksimal request AI per siswa yang dapat dikonfigurasi | High |

### **5.3 Tampilan Slot AI di Halaman Diskusi**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-15 | Diskusi yang opt-in AI harus memiliki **slot khusus** untuk jawaban AI yang terpisah dari kolom reply manusia | High |
| FR-16 | Saat AI sedang memproses jawaban, slot AI harus menampilkan placeholder "AI sedang menyusun jawaban untuk diskusi ini..." | High |
| FR-17 | Ketika jawaban AI siap, slot AI harus menampilkan jawaban lengkap dengan label/badge "Dijawab AI" yang jelas terlihat | High |
| FR-18 | Jawaban AI di slot AI **tidak boleh** dapat di-reply oleh siapa pun (siswa, expert, moderator) | High |
| FR-19 | Jika pemrosesan jawaban gagal setelah retry maksimum, slot AI harus menampilkan pesan bahwa AI tidak dapat menjawab pertanyaan ini | High |
| FR-20 | Slot AI harus tetap terlihat oleh semua peserta kelas (visibilitas publik dalam konteks kelas), bukan hanya penanya | High |
| FR-21 | Kolom reply manusia harus tetap berfungsi normal — expert dan peer tetap dapat menjawab di kolom tersebut tanpa terpengaruh keberadaan slot AI | High |

### **5.4 Feedback terhadap Jawaban AI**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-22 | Siswa harus dapat memberikan feedback "helpful" atau "not helpful" pada jawaban AI | High |
| FR-23 | Siswa harus dapat memberikan feedback kualitatif jika memilih “not helpful” dan feedback tersebut tidak muncul secara publik hanya digunakan untuk internal tim melakukan evaluasi. | High |
| FR-24 | Satu akun siswa hanya dapat memberikan satu feedback per jawaban AI (dapat diganti sebelum finalized) | Medium |
| FR-25 | Ringkasan jumlah feedback (helpful vs. not helpful) boleh ditampilkan di slot AI untuk memberi context ke pembaca lain | Low |
| FR-26 | Data feedback harus tersimpan dan dapat diakses untuk evaluasi kualitas jawaban AI | High |

### **5.5 Moderasi Jawaban AI**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-27 | Role Admin, Academy Admin, dan Academy Manager harus dapat menghapus jawaban AI yang dianggap salah atau tidak pantas | High |
| FR-28 | Setelah jawaban AI dihapus, slot AI harus menampilkan indikator bahwa jawaban telah dihapus oleh moderator | High |
| FR-29 | Tindakan penghapusan jawaban AI harus tercatat di audit log (siapa, kapan, jawaban mana) | Medium |
| FR-30 | Penghapusan jawaban AI **tidak** menghapus diskusi penanya atau reply manusia di diskusi tersebut | High |

### **5.6 Integrasi dengan Fitur Existing**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-31 | Fitur "Tandai Diskusi Selesai" oleh penanya (existing) harus tetap berfungsi normal di diskusi yang opt-in AI | High |
| FR-32 | Notifikasi forum (existing) harus tetap berjalan untuk reply manusia. MVP tidak menambah notifikasi khusus untuk jawaban AI | Medium |

---

## **6\. Non-Functional Requirements**

| ID | Category | Requirement |
| :---- | :---- | :---- |
| NFR-01 | Performance | Penanya harus dapat submit diskusi dan melihat halaman diskusinya tanpa harus menunggu jawaban AI siap (non-blocking UX) |
| NFR-02 | Performance | Pemrosesan jawaban AI berjalan best-effort — tidak ada SLA keras di MVP, namun diharapkan wajar dalam hitungan menit dalam kondisi normal |
| NFR-03 | Reliability | Kegagalan layanan AI **tidak boleh** membuat diskusi siswa gagal tersimpan. Diskusi tetap publish, hanya slot AI yang menampilkan error state |
| NFR-04 | Reliability | Layanan AI harus dapat di-deploy dan di-maintain independen dari dicoding.com tanpa membuat fitur forum umum down |
| NFR-05 | Security | Hanya siswa Premium yang boleh memicu request AI. Validasi dilakukan server-side, bukan hanya di UI |
| NFR-06 | Security | Jawaban AI harus melewati filter konten dasar sebelum ditampilkan (tidak mengandung PII siswa lain, tidak profane) |
| NFR-07 | Privacy | AI **tidak boleh** mengakses submission privat siswa lain. Konteks hanya materi publik kelas, diskusi di kelas, dan kode yang dilampirkan penanya sendiri |
| NFR-08 | Scalability | Quota harian per siswa harus dapat dikonfigurasi tanpa perlu re-deploy (misal melalui config/env) |
| NFR-09 | Observability | Setiap request AI harus tercatat (user, kelas, status: processing/success/failed, durasi) untuk keperluan evaluasi dan debug |
| NFR-10 | Cost Control | Quota harian per siswa adalah mekanisme utama pencegahan abuse dan cost blow-up di MVP. Mekanisme hard cap budget di-evaluasi post-MVP |

---

## **7\. User Stories**

**Development Strategy:** Layanan AI dibangun sebagai service terpisah oleh Engineer AI Service. Integrasi forum, data diskusi, dan UI tetap berada di dicoding.com yang dikerjakan oleh Engineer Dicoding.com. Dua engineer perlu sinkronisasi pada titik integrasi (kontrak request/response antara dicoding.com dan AI Service).

### **Epic E-1: Post Creation dengan Opt-in AI**

| ID | Title | User Story | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- | :---- |
| E-1.1 | Checkbox Opt-in AI | Sebagai **siswa Premium**, saya ingin melihat checkbox "Bantu jawab dengan AI" saat membuat diskusi baru di forum kelas, sehingga saya dapat memilih apakah pertanyaan saya ingin dijawab oleh AI. | 1\. Checkbox tampil di form pembuatan diskusi forum kelas. 2\. Checkbox hanya terlihat oleh siswa Premium. 3\. Checkbox default dalam keadaan tidak tercentang. | High |
| E-1.2 | Passive Discovery untuk Non-Premium | Sebagai **siswa non-Premium**, saya ingin melihat keberadaan fitur opt-in AI meskipun belum dapat menggunakannya, sehingga saya tahu ada nilai tambah jika berlangganan Premium. | 1\. Siswa non-Premium melihat checkbox opt-in AI pada form diskusi dalam keadaan disabled. 2\. Ada narasi singkat bahwa fitur ini eksklusif untuk siswa berlangganan. 3\. Ada CTA upgrade ke Premium yang mengarahkan ke halaman langganan. 4\. Siswa non-Premium tidak dapat mencentang checkbox, dan server menolak request yang mencoba mem-bypass client-side gating. | High |
| E-1.3 | Quota Exceeded State | Sebagai **siswa Premium**, saya ingin tahu jika saya sudah mencapai batas kuota harian AI, sehingga saya mengerti kenapa opsi opt-in tidak bisa saya centang. | 1\. Jika kuota habis, checkbox ter-disable. 2\. Ada tooltip/informasi: "Kuota bantuan AI harian Anda sudah habis. Kuota akan di-reset besok." | High |
| E-1.4 | Non-Blocking Submit | Sebagai **siswa**, saya ingin tetap bisa langsung melihat diskusi saya setelah submit meskipun jawaban AI belum siap, sehingga saya tidak menunggu lama. | 1\. Setelah submit, user langsung diarahkan ke halaman diskusi. 2\. Halaman diskusi sudah menampilkan post siswa. 3\. Slot AI menampilkan placeholder loading. | High |

### **Epic E-2: Pemrosesan Jawaban AI**

| ID | Title | User Story | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- | :---- |
| E-2.1 | Terima Request Pemrosesan | Sebagai **AI Service**, saya ingin menerima request pemrosesan jawaban dari dicoding.com yang berisi konteks yang diperlukan, sehingga saya dapat memulai pemrosesan. | 1\. AI Service memiliki endpoint untuk menerima request. 2\. Request memuat identifier diskusi, konteks kelas, dan konteks pertanyaan. 3\. Request diproses asynchronous. | High |
| E-2.2 | Konteks Materi Kelas | Sebagai **AI Service**, saya ingin memiliki akses ke materi kelas tempat diskusi dibuat, sehingga jawaban saya relevan dengan kurikulum kelas. | 1\. AI dapat mengambil materi kelas dari sumber yang disediakan oleh [dicoding.com](http://dicoding.com). 2\. AI menggunakan materi tersebut sebagai grounding utama. | High |
| E-2.3 | Konteks Diskusi Lama | Sebagai **AI Service**, saya ingin dapat merujuk ke diskusi lama yang relevan di kelas yang sama, sehingga siswa mendapat informasi tambahan dan pertanyaan berulang berkurang. | 1\. AI dapat mencari diskusi lama yang relevan dari kelas yang sama. 2\. Jawaban AI dapat mereferensikan diskusi lama tersebut. | High |
| E-2.4 | Konteks Kode Terlampir | Sebagai **AI Service**, saya ingin dapat membaca kode yang dilampirkan penanya di body post, sehingga saya dapat memberikan analisis yang kontekstual. | 1\. Kode yang dilampirkan di body post dapat di-parse. 2\. AI menganalisis kode tersebut dalam jawabannya. | High |
| E-2.5 | Web Search Tool | Sebagai **AI Service**, saya ingin dapat melakukan web search ketika diperlukan, sehingga jawaban saya mencakup informasi up-to-date. | 1\. AI dapat memicu web search sebagai bagian dari proses menjawab. 2\. Hasil search digunakan untuk memperkaya jawaban. | Medium |
| E-2.6 | Retry on Failure | Sebagai **AI Service**, saya ingin otomatis mencoba ulang maksimal 2 kali jika terjadi kegagalan, sehingga tingkat keberhasilan jawaban lebih tinggi. | 1\. Jika gagal, retry otomatis hingga 2x. 2\. Setelah 2 retry gagal, AI Service mengembalikan status error ke [dicoding.com](http://dicoding.com). 3\. Setiap retry dan status final tercatat di log. | High |
| E-2.7 | Callback ke dicoding.com | Sebagai **AI Service**, saya ingin mengembalikan hasil jawaban ke dicoding.com setelah selesai diproses, sehingga jawaban dapat ditampilkan ke siswa. | 1\. AI Service mengirim hasil (jawaban atau error) ke [dicoding.com](http://dicoding.com). 2\. Payload berisi identifier diskusi, konten jawaban, status, dan metadata yang perlu. | High |

### **Epic E-3: Slot AI di Halaman Diskusi**

| ID | Title | User Story | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- | :---- |
| E-3.1 | Slot AI Placeholder | Sebagai **siswa**, saya ingin melihat placeholder "AI sedang menyusun jawaban..." saat AI memproses, sehingga saya tahu ada jawaban yang sedang disiapkan. | 1\. Placeholder muncul di slot AI segera setelah diskusi di-publish dengan opt-in AI. 2\. Placeholder memiliki indikator visual (loading state). | High |
| E-3.2 | Slot AI Jawaban Tampil | Sebagai **siswa**, saya ingin melihat jawaban AI muncul di slot khusus dengan label "Dijawab AI" yang jelas, sehingga saya dapat membedakan antara jawaban AI dan jawaban manusia. | 1\. Slot AI menampilkan jawaban lengkap ketika siap. 2\. Ada label/badge "Dijawab AI" yang prominent. 3\. Slot AI terpisah secara visual dari kolom reply manusia. | High |
| E-3.3 | Slot AI Non-Replyable | Sebagai **siswa**, saya ingin tidak dapat me-reply jawaban AI langsung, sehingga diskusi di kolom reply tetap terpisah antara manusia dan AI. | 1\. Tidak ada tombol "reply" di slot AI. 2\. Siswa yang ingin bertanya lanjut harus membuat diskusi baru atau reply di kolom manusia. | High |
| E-3.4 | Slot AI Error State | Sebagai **siswa**, saya ingin melihat pesan yang jelas jika AI gagal menjawab, sehingga saya tahu untuk tidak menunggu lagi. | 1\. Jika retry habis dan gagal, slot AI menampilkan "AI tidak dapat menjawab pertanyaan ini saat ini." 2\. Tetap ada informasi bahwa expert/peer masih dapat menjawab di kolom reply manusia. | High |
| E-3.5 | Visibility untuk Seluruh Kelas | Sebagai **siswa lain di kelas**, saya ingin dapat membaca jawaban AI di diskusi teman sekelas, sehingga saya juga terbantu jika punya pertanyaan serupa. | 1\. Slot AI dapat dilihat semua peserta kelas, bukan hanya penanya. 2\. Slot AI tampil permanen di halaman diskusi kecuali dihapus moderator. | High |

### **Epic E-4: Feedback terhadap Jawaban AI**

| ID | Title | User Story | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- | :---- |
| E-4.1 | Tombol Helpful / Not Helpful | Sebagai **siswa**, saya ingin dapat menandai jawaban AI sebagai membantu atau tidak membantu, sehingga saya dapat memberikan masukan kualitas. | 1\. Dua tombol/icon feedback tersedia di slot AI. 2\. Klik tombol menyimpan feedback. 3\. Siswa dapat mengganti pilihannya. | High |
| E-4.2 | Input Feedback Kualitatif | Sebagai siswa, saya ingin dapat memberikan feedback kualitatif jika jawaban tidak membantu, sehingga saya dapat memberikan masukan kualitas yang lebih detail. | 1\. Tombol Not Helpful dipilih siswa 2\. Text Area muncul. 3\. Siswa menuliskan feedback kualitatif. | High |
| E-4.2 | Penyimpanan Feedback | Sebagai **PM**, saya ingin semua feedback tersimpan dengan baik, sehingga saya dapat mengevaluasi kualitas fitur. | 1\. Feedback tercatat: siapa, kapan, diskusi mana, nilai (helpful/not). 2\. Data dapat di-query untuk kebutuhan analisis. | High |
| E-4.3 | Ringkasan Feedback (Opsional MVP) | Sebagai **siswa pembaca**, saya ingin melihat ringkasan feedback sebelumnya agar tahu apakah jawaban dianggap bermanfaat. | 1\. Slot AI opsional menampilkan jumlah helpful vs. not helpful. 2\. Jika belum ada feedback, ringkasan tidak tampil. | Low |

### **Epic E-5: Moderasi Jawaban AI**

| ID | Title | User Story | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- | :---- |
| E-5.1 | Delete Jawaban AI | Sebagai **Admin/Academy Admin/Academy Manager**, saya ingin dapat menghapus jawaban AI yang saya anggap salah atau tidak pantas, sehingga kualitas informasi di forum tetap terjaga. | 1\. Moderator melihat tombol hapus di slot AI. 2\. Ada konfirmasi sebelum hapus. 3\. Setelah hapus, slot AI menampilkan "Jawaban AI telah dihapus oleh moderator." | High |
| E-5.2 | Audit Log Penghapusan | Sebagai **Admin**, saya ingin setiap penghapusan jawaban AI tercatat, sehingga tindakan moderasi dapat ditinjau jika perlu. | 1\. Log berisi: siapa yang menghapus, kapan, diskusi mana, konten jawaban yang dihapus. 2\. Log dapat diakses oleh role Admin. | Medium |
| E-5.3 | Diskusi & Reply Manusia Tidak Terpengaruh | Sebagai **siswa**, saya ingin penghapusan jawaban AI tidak menghapus diskusi atau reply manusia, sehingga diskusi utama tetap berjalan. | 1\. Hanya konten slot AI yang dihapus. 2\. Post siswa dan reply manusia tetap ada. | High |

### **Epic E-6: Cost Control (Quota Harian)**

| ID | Title | User Story | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- | :---- |
| E-6.1 | Konfigurasi Quota Harian | Sebagai **PM/Admin**, saya ingin dapat mengkonfigurasi kuota harian AI per siswa tanpa perlu deploy ulang, sehingga saya dapat menyesuaikan berdasarkan data actual usage. | 1\. Nilai kuota tersimpan di config/env. 2\. Perubahan berlaku tanpa re-deploy. | High |
| E-6.2 | Hitung Penggunaan Kuota | Sebagai **sistem**, saya ingin menghitung penggunaan kuota AI per siswa per hari, sehingga pembatasan dapat ditegakkan. | 1\. Setiap request AI yang sukses mengonsumsi kuota. 2\. Kuota ter-reset setiap hari (zona waktu didefinisikan di appendix/config). 3\. Retry yang gagal tidak menggunakan kuota tambahan. | High |
| E-6.3 | Enforcement di Post Creation | Sebagai **sistem**, saya ingin menolak opt-in AI dari siswa yang kuotanya sudah habis, sehingga kuota benar-benar ditegakkan. | 1\. Validasi server-side sebelum trigger pemrosesan AI. 2\. UI menampilkan feedback yang sesuai (lihat E-1.3). | High |

---

## **8\. UI/UX Design Guidelines**

Section ini ditujukan sebagai panduan untuk UI/UX Designer dalam menyusun desain fitur Forum AI Assist. Designer memiliki keleluasaan dalam eksplorasi visual dan wireframe, selama output-nya memenuhi kebutuhan fungsional, microcopy, dan edge cases yang tercatat di bawah ini.

### **8.1 Prinsip & Scope Desain**

| Aspek | Ketentuan |
| :---- | :---- |
| Platform | Web Desktop dan Web Mobile (responsive). Native mobile app tidak termasuk MVP |
| Design System | Ikuti design system Dicoding yang sudah ada sebisa mungkin. Designer boleh mengusulkan komponen baru untuk kebutuhan yang belum tercakup (contoh: slot AI, badge "Dijawab AI", placeholder loading khusus) |
| Referensi Basis | Halaman Forum Diskusi existing di dicoding.com sebagai starting point — struktur thread, pattern reply, hierarki visual yang sudah familiar bagi siswa |
| Tone Visual | AI harus terasa "membantu" bukan "mendominasi". Slot AI tidak boleh secara visual mengecilkan kolom reply manusia atau membuat diskusi terasa didominasi oleh AI |
| Tone Copywriting | Hangat, ringkas, dan jujur bahwa jawaban berasal dari AI. Hindari kesan "ini pasti benar" — selalu undang siswa untuk tetap bertanya ke expert/peer jika perlu |

### **8.2 Inventory Halaman & Komponen**

Daftar area yang perlu didesain oleh Designer:

| \# | Area | Deskripsi | Platform |
| :---- | :---- | :---- | :---- |
| 1 | Form Pembuatan Diskusi Baru (Penambahan Checkbox Opt-in AI) | Perubahan pada form existing — tambah checkbox "Bantu jawab dengan AI" beserta deskripsi singkat | Desktop \+ Mobile |
| 2 | Slot AI di Halaman Detail Diskusi | Komponen baru: area khusus untuk jawaban AI, terpisah dari kolom reply manusia | Desktop \+ Mobile |
| 3 | Badge/Label "Dijawab AI" | Label visual yang membedakan jawaban AI dari konten lain | Desktop \+ Mobile |
| 4 | Feedback Control (Helpful / Not Helpful) | Tombol/icon untuk memberikan feedback pada jawaban AI | Desktop \+ Mobile |
| 5 | Quota Indicator (Opsional) | Indikator sisa kuota AI harian siswa (jika designer menganggap perlu untuk transparansi) | Desktop \+ Mobile |
| 6 | Moderator Action — Delete Button | Tombol hapus jawaban AI yang hanya terlihat oleh Admin/Academy Admin/Academy Manager | Desktop \+ Mobile |
| 7 | Konfirmasi Delete Jawaban AI | Dialog/modal konfirmasi sebelum moderator menghapus jawaban AI | Desktop \+ Mobile |

### **8.3 Key UI States per Komponen**

Designer wajib menyiapkan desain untuk **seluruh state** di setiap komponen berikut, karena tiap state mewakili kondisi nyata yang dialami pengguna.

#### **8.3.1 Checkbox Opt-in AI (di Form Pembuatan Diskusi)**

| State | Kondisi | Kebutuhan Visual |
| :---- | :---- | :---- |
| Default (Enabled, Unchecked) | Siswa Premium, kuota masih ada | Checkbox tampil, default tidak tercentang, deskripsi singkat terlihat |
| Checked | Siswa Premium memilih opt-in | Visual tercentang, deskripsi tetap terlihat (konfirmasi pilihan) |
| Disabled — Quota Habis | Siswa Premium sudah mencapai kuota harian | Checkbox ter-disable, tooltip/helper text menjelaskan alasan (kuota habis, reset besok) |
| Disabled — Non-Premium (Upsell) | Siswa non-Premium | Checkbox tampil namun ter-disable, disertai narasi singkat "Fitur ini eksklusif untuk siswa berlangganan" dan CTA "Pelajari Premium" / "Upgrade ke Premium" yang mengarahkan ke halaman langganan. Styling harus mengundang tanpa terasa mengganggu pembuatan diskusi |

#### **8.3.2 Slot AI di Halaman Detail Diskusi**

| State | Kondisi | Kebutuhan Visual |
| :---- | :---- | :---- |
| Not Applicable | Diskusi dibuat tanpa opt-in AI | Slot AI **tidak tampil sama sekali**. Layout halaman identik dengan forum existing |
| Processing (Loading) | AI sedang memproses jawaban | Placeholder dengan indikator loading \+ teks informatif. Slot tampil tapi tanpa konten jawaban |
| Answered | Jawaban AI berhasil dihasilkan | Slot menampilkan konten jawaban lengkap \+ badge "Dijawab AI" \+ feedback control |
| Error (Retry Habis) | Pemrosesan gagal setelah retry maksimum | Slot menampilkan pesan error \+ arahan bahwa siswa tetap dapat menunggu jawaban dari expert/peer |
| Deleted by Moderator | Jawaban dihapus oleh moderator | Slot menampilkan indikator "Jawaban AI telah dihapus oleh moderator". Konten asli tidak lagi terlihat |

#### **8.3.3 Feedback Control (Helpful / Not Helpful)**

| State | Kondisi | Kebutuhan Visual |
| :---- | :---- | :---- |
| Neutral (Belum Memberi Feedback) | User belum klik apa-apa | Dua tombol/icon dalam keadaan netral |
| Helpful Selected | User klik "helpful" | Tombol helpful terlihat aktif/highlighted, tombol opposite dalam state netral |
| Not Helpful Selected | User klik "not helpful" | Sebaliknya |
| Summary Visible (Opsional MVP) | Ada feedback dari siswa lain | Tampilkan jumlah ringkasan feedback (misal "5 menganggap membantu") |
| Read-only (Jawaban Dihapus) | Slot sudah dalam state deleted | Feedback control tidak tampil / ter-disable |

#### **8.3.4 Moderator Delete Flow**

| State | Kondisi | Kebutuhan Visual |
| :---- | :---- | :---- |
| Button Hidden | User bukan moderator | Tombol delete tidak terlihat sama sekali |
| Button Visible | User adalah Admin/Academy Admin/Academy Manager | Tombol delete tampil di area slot AI, di posisi yang tidak mengganggu fokus baca siswa |
| Confirmation Dialog | Moderator klik delete | Modal konfirmasi muncul: judul, penjelasan dampak, dua tombol (Batal / Hapus) |
| Post-Delete State | Setelah konfirmasi hapus | Slot AI berubah ke state "Deleted by Moderator" (lihat 8.3.2) |

### **8.4 User Flow (Textual)**

Designer dapat menggunakan flow berikut sebagai referensi saat membuat wireframe dan prototype.

#### **Flow 1 — Siswa Premium Opt-in AI untuk Pertanyaan Baru**

| \[1\] Siswa Premium di halaman forum diskusi kelas     ↓ klik "Buat Diskusi Baru" \[2\] Form pembuatan diskusi terbuka     → Checkbox "Bantu jawab dengan AI" tampil (Premium \+ kuota OK)     ↓ Siswa mengisi judul \+ body \+ centang opt-in     ↓ klik "Kirim"\[3\] Halaman detail diskusi terbuka (diskusi sudah publish)     → Kolom reply manusia masih kosong     → Slot AI tampil dalam state "Processing" (placeholder loading)     ↓ (siswa dapat scroll/pergi/lanjut aktivitas lain \-- async)\[4\] Beberapa menit kemudian, siswa kembali ke halaman diskusi     → Slot AI berubah ke state "Answered" dengan jawaban \+ badge "Dijawab AI"     ↓ Siswa baca jawaban\[5\] Siswa klik "Helpful" atau "Not Helpful" di feedback control     → Feedback tersimpan |
| :---- |

#### **Flow 2 — Siswa Lain Melihat Diskusi dengan Jawaban AI**

| \[1\] Siswa (Premium/Non-Premium) membuka diskusi teman sekelas\[2\] Halaman detail diskusi terbuka     → Post penanya terlihat     → Slot AI tampil di area khusus dengan jawaban AI \+ badge "Dijawab AI"     → Kolom reply manusia menampilkan reply yang ada (jika ada)\[3\] Siswa membaca jawaban AI → mendapat pemahaman     ↓ (opsional) Siswa dapat memberikan feedback helpful/not     ↓ (opsional) Siswa dapat reply di kolom reply manusia untuk melanjutkan diskusi |
| :---- |

#### **Flow 3 — Moderator Menghapus Jawaban AI**

| \[1\] Admin/Academy Admin/Academy Manager membuka halaman diskusi     → Slot AI menampilkan jawaban AI     → Tombol "Hapus" hanya visible untuk role moderator\[2\] Moderator menilai jawaban AI salah / tidak pantas     ↓ klik "Hapus"\[3\] Dialog konfirmasi muncul     → Judul: "Hapus Jawaban AI?"     → Penjelasan dampak     ↓ klik "Hapus"\[4\] Slot AI berubah ke state "Deleted by Moderator"     → Penanya dan siswa lain melihat indikator bahwa jawaban telah dihapus     → Kolom reply manusia tetap utuh |
| :---- |

#### **Flow 4 — Siswa Premium dengan Kuota Habis**

| \[1\] Siswa Premium yang sudah mencapai kuota harian membuka form diskusi baru\[2\] Checkbox "Bantu jawab dengan AI" tampil dalam state Disabled     → Tooltip / helper text menjelaskan alasan \+ kapan kuota reset\[3\] Siswa tetap dapat membuat diskusi tanpa opt-in AI |
| :---- |

#### **Flow 5 — Siswa Non-Premium Melihat Checkbox (Passive Discovery)**

| \[1\] Siswa non-Premium di halaman forum diskusi kelas     ↓ klik "Buat Diskusi Baru"\[2\] Form pembuatan diskusi terbuka     → Checkbox "Bantu jawab dengan AI" tampil dalam state Disabled     → Narasi singkat: "Fitur ini eksklusif untuk siswa berlangganan (Premium)"     → CTA "Upgrade ke Premium" terlihat di dekat checkbox     ↓ (opsional) Siswa klik CTA → diarahkan ke halaman langganan\[3\] Siswa tetap dapat melanjutkan pembuatan diskusi tanpa opt-in AI     ↓ klik "Kirim"\[4\] Diskusi publish secara normal tanpa slot AI |
| :---- |

### **8.5 Microcopy / Copywriting Guide**

Designer dapat menggunakan daftar teks berikut sebagai baseline. Teks final dapat disempurnakan bersama PM.

| Lokasi | State / Konteks | Teks (ID) |
| :---- | :---- | :---- |
| Checkbox opt-in AI | Label utama | **Bantu jawab dengan AI** |
| Checkbox opt-in AI | Deskripsi pendukung | AI akan mencoba memberikan jawaban awal berdasarkan materi kelas. Expert dan peer tetap dapat menjawab seperti biasa. |
| Checkbox opt-in AI | State Disabled (quota habis) | Kuota bantuan AI harian Anda sudah habis. Kuota akan tersedia kembali besok. |
| Checkbox opt-in AI | State Disabled — Non-Premium (narasi utama) | Bantuan jawaban AI hanya tersedia untuk siswa berlangganan (Premium). |
| Checkbox opt-in AI | State Disabled — Non-Premium (CTA) | Upgrade ke Premium |
| Slot AI | Judul slot | Jawaban dari AI |
| Slot AI | Badge/label | Dijawab AI |
| Slot AI | State Processing | AI sedang menyusun jawaban untuk diskusi ini… |
| Slot AI | Disclaimer di bawah jawaban | Jawaban ini dihasilkan oleh AI berdasarkan konteks kelas. Harap tetap verifikasi dengan expert atau peer jika ragu. |
| Slot AI | State Error | AI tidak dapat menjawab pertanyaan ini saat ini. Expert dan peer masih dapat membantu Anda di kolom diskusi di bawah. |
| Slot AI | State Deleted by Moderator | Jawaban AI pada diskusi ini telah dihapus oleh moderator. |
| Feedback control | Tombol positif | Membantu |
| Feedback control | Tombol negatif | Tidak Membantu |
| Feedback control | Thank-you setelah feedback | Terima kasih atas masukan Anda. |
| Feedback summary | Ringkasan | {n} siswa menganggap jawaban ini membantu |
| Delete confirmation | Judul | Hapus Jawaban AI? |
| Delete confirmation | Body | Jawaban AI ini akan dihapus dari halaman diskusi. Tindakan ini tidak dapat dibatalkan. Diskusi dan reply dari siswa lain tidak akan terhapus. |
| Delete confirmation | Tombol primer | Hapus |
| Delete confirmation | Tombol sekunder | Batal |

**Catatan untuk Designer:** Gunakan Bahasa Indonesia sebagai primer. Hindari istilah teknis seperti "inference", "LLM", "model" di user-facing copy. Saat merujuk ke AI, gunakan kata "AI" (bukan "bot", "asisten", "robot") untuk konsistensi dengan fitur lain Dicoding.

### **8.6 Empty States & Edge Cases**

Designer wajib memikirkan kasus-kasus berikut saat menyusun desain:

| \# | Edge Case | Yang Harus Dipikirkan Designer |
| :---- | :---- | :---- |
| 1 | Diskusi tanpa opt-in AI | Halaman detail diskusi **tidak** menampilkan slot AI sama sekali. Designer harus memastikan layout tetap clean tanpa ruang kosong yang aneh |
| 2 | Diskusi opt-in AI tapi belum ada reply manusia sama sekali | Kolom reply manusia dalam state empty, slot AI sudah ada. Urutan visual harus tetap jelas — slot AI jangan "menenggelamkan" kolom reply yang masih kosong |
| 3 | Jawaban AI sangat panjang | Tentukan apakah perlu truncate \+ "Baca selengkapnya", terutama di mobile. Pastikan jawaban yang mengandung code block tetap terbaca |
| 4 | Jawaban AI mengandung kode | Gunakan styling code block sesuai design system. Pertimbangkan syntax highlighting dan tombol "copy" |
| 5 | Jawaban AI merujuk ke diskusi lama di kelas yang sama | Pertimbangkan bagaimana menampilkan referensi/link ke diskusi lain — inline link, card preview, atau footnote |
| 6 | Penanya non-Premium membuka diskusi teman sekelas yang opt-in AI | Siswa non-Premium tetap dapat **melihat** jawaban AI dan memberi feedback. Yang dibatasi hanyalah kemampuan opt-in AI sebagai penanya. Pertimbangkan apakah perlu menampilkan CTA upgrade di dekat slot AI bagi siswa non-Premium (upsell opportunity) |
| 7 | AI gagal menjawab (retry habis) | Error state harus tetap "mengundang" — tidak terasa sebagai kegagalan akhir. Tekankan bahwa expert/peer tetap bisa menjawab |
| 8 | Jawaban AI dihapus moderator sementara feedback sudah banyak | Deleted state harus konsisten: feedback control dan konten jawaban sama-sama tidak tampil. Cukup tampilkan indikator "dihapus oleh moderator" |
| 9 | Mobile view: slot AI vs kolom reply manusia | Tentukan hierarki vertikal yang jelas. Pertimbangkan apakah slot AI di atas atau di bawah kolom reply, dan bagaimana user scroll-nya terasa natural |
| 10 | Penanya me-refresh halaman saat AI masih processing | Halaman harus tetap menampilkan state Processing dengan benar setelah refresh (bukan state Error palsu) |
| 11 | Diskusi opt-in AI yang sudah ditandai "Selesai" oleh penanya | Visual "Diskusi Selesai" existing harus tetap konsisten. Slot AI tetap tampil seperti biasa |
| 12 | Quota Indicator (opsional) | Jika designer memutuskan untuk menampilkan sisa kuota, pertimbangkan: lokasi (di mana?), visibilitas (selalu tampil atau hanya saat mendekati habis?), dan interaksi dengan state Disabled checkbox |

### **8.7 Deliverables yang Diharapkan dari Designer**

| \# | Deliverable | Deskripsi |
| :---- | :---- | :---- |
| 1 | Wireframe low-fidelity | Alur utama (Flow 1-4) dalam bentuk wireframe untuk Desktop dan Mobile |
| 2 | High-fidelity mockup | Tampilan final untuk seluruh state (lihat §8.3) di kedua platform |
| 3 | Interactive prototype | Prototype yang dapat dijalankan untuk Flow 1 (end-to-end opt-in AI) sebagai basis user testing |
| 4 | Component spec untuk komponen baru | Jika designer menambah komponen baru (slot AI, badge "Dijawab AI", dll), sertakan spesifikasi yang siap dipakai engineer |
| 5 | Finalized microcopy | Teks final hasil diskusi dengan PM, sudah siap untuk implementasi |
| 6 | Design handoff notes | Catatan tambahan untuk engineer: behavior interaksi, edge case yang perlu di-handle, asset (icon, illustration) yang diperlukan |

---

## **9\. Risks & Mitigations**

| Risk | Impact | Probability | Mitigation |
| :---- | :---- | :---- | :---- |
| Jawaban AI salah atau menyesatkan | Siswa mendapatkan informasi yang salah, nama baik Dicoding terganggu | Medium | Grounding kuat pada materi kelas, label "Dijawab AI" yang jelas, feedback siswa, moderasi delete oleh Admin/Academy Admin/Academy Manager, monitoring helpful rate |
| Cost AI tidak terkontrol | Budget melebihi ekspektasi | Medium | Quota harian per siswa, gating Premium-only untuk penanya, monitoring actual cost bulanan, evaluasi hard cap di post-MVP |
| AI "membunuh" diskusi manusia | Expert dan peer enggan menjawab karena AI sudah merespons, nilai komunitas menurun | Medium | Slot AI dipisahkan jelas dari kolom reply manusia, jawaban AI non-replyable, kolom reply manusia tetap prominent, monitoring rasio reply manusia di diskusi opt-in vs non-opt-in |
| Abuse dengan pertanyaan spam untuk drain quota | Cost terbuang dan kualitas forum menurun | Low | Quota harian per siswa sudah menjadi bottleneck alami, monitoring pola pertanyaan anomali, opsi soft-ban manual oleh moderator |
| Adoption rate rendah karena siswa tidak tahu fitur | Fitur tidak menghasilkan value yang diharapkan | Medium | Placement checkbox yang jelas di form post, komunikasi in-app / release notes saat launch, monitoring adoption rate minggu pertama |
| Web search mengembalikan hasil yang tidak relevan / tidak sehat | Jawaban AI terkontaminasi informasi yang kurang tepat | Medium | Web search hanya dilakukan ketika konteks kelas tidak cukup, filter dasar pada hasil, feedback siswa sebagai mekanisme evaluasi |
| Integrasi dua service (dicoding.com & AI Service) menimbulkan kompleksitas sinkronisasi | Diskusi publish tapi slot AI stuck di loading forever | Medium | Kontrak yang jelas di awal antara dua engineer, mekanisme retry di AI Service, timeout safeguard di dicoding.com untuk menandai jawaban sebagai error jika terlalu lama, observability log |
| Pemrosesan AI lama sehingga penanya kehilangan minat | Penanya sudah scroll/pergi sebelum jawaban tersedia | Low | Notifikasi forum existing saat ada update di diskusi, placeholder yang jelas menandakan proses berjalan, evaluasi waktu pemrosesan untuk penyempurnaan di fase berikutnya |

---

## **10\. Appendix**

### **10.1 Stakeholders**

| Role | Name |
| :---- | :---- |
| Product Manager | Dimas Saputra |
| AI Engineer (AI Service) | TBD |
| Engineer (Dicoding.com) | TBD |
| UI/UX Designer | TBD |

### **10.2 Referensi Data Survei**

**Survei:** Indonesia Developer Outlook 2026   
**Sampel:** 2.576 responden  
**Periode pengumpulan data:** Mulai 16 Februari 2026

**Data yang menjadi justifikasi fitur:**

| Temuan | Nilai | Relevansi dengan Forum AI Assist |
| :---- | :---- | :---- |
| Forum Diskusi & Tanya Jawab (fitur platform paling membantu \#3) | 38,6% | Memvalidasi bahwa forum adalah channel penting bagi siswa |
| AI Assistant dalam Materi (fitur platform paling membantu \#4) | 31,7% | Memvalidasi openness siswa terhadap bantuan AI dalam learning experience |
| Keterbatasan waktu / kesibukan kerja (kendala \#1) | 62,7% | Justifikasi utama kebutuhan first response yang cepat di forum |
| Kurang motivasi (kendala \#5) | 24,8% | Respons cepat di forum dapat mengurangi drop-off dan meningkatkan engagement |

### **10.3 Glossary**

| Term | Definisi |
| :---- | :---- |
| Forum AI Assist | Fitur tambahan pada Forum Diskusi kelas Dicoding yang memberikan opsi bantuan jawaban dari AI |
| Opt-in AI | Tindakan siswa mencentang checkbox "Bantu jawab dengan AI" saat membuat diskusi baru |
| Slot AI | Area khusus di halaman diskusi yang hanya menampilkan jawaban AI, terpisah dari kolom reply manusia |
| First Response | Jawaban pertama yang diterima penanya setelah post diskusi dibuat |
| Premium | Siswa berlangganan berbayar di Dicoding. Hanya siswa Premium yang dapat memicu opt-in AI sebagai penanya |
| Academy Admin / Academy Manager | Role moderator di Dicoding yang memiliki kewenangan menghapus jawaban AI |
| Adoption Rate | Persentase diskusi baru yang opt-in AI dari total diskusi baru di forum kelas Premium |
| Helpful Rate | Persentase feedback "helpful" dari total feedback yang diterima jawaban AI |

---

## **Revision History**

| Version | Date | Author | Changes |
| :---- | :---- | :---- | :---- |
| 1.0 | 12 April 2026 | Dimas Saputra | Initial PRD Forum AI Assist (MVP): opt-in per diskusi, slot khusus jawaban AI non-replyable, konteks materi kelas \+ diskusi lama \+ kode terlampir \+ web search, gating Premium-only untuk penanya, moderasi post-hoc oleh Admin/Academy Admin/Academy Manager, quota harian per siswa, success metric berbasis adoption, helpful rate, dan penurunan waktu forum terselesaikan |

