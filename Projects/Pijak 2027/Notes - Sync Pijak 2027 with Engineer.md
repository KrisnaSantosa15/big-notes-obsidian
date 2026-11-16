---
date: 2026-10-19
updated: 2026-10-19
type: meeting
tags: [meeting, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
## Oct 14, 2026 | [Sync Pijak 2027 with Engineer](https://www.google.com/calendar/event?eid=N2pzcGo0ZW9lOGJwamYwaDZlN2E4NGgyaHAgd2ludGFyaUBkaWNvZGluZy5jb20)

Attendees: [Dimas Saputra](mailto:dimas@dicoding.com) [Krisna Santosa](mailto:krisna@dicoding.com) [Wintari Yasmin](mailto:wintari@dicoding.com)

Notes

* Done:   
  * All registration flow end-to-end  
  * Re-offer Button  
  * Form Cohort Reminder 24h  
  * Email Misleading filtering test, implemented by mas [Dimas Saputra](mailto:dimas@dicoding.com)  
* Not Implemented (Yet)  
  * Preview LoA: bikin aja modal preview cohort data  
  * Tugas Tari di dokumen UAT: [User Acceptance Testing: Pijak 2027 Registration](https://docs.google.com/document/d/1I9mgo9yyQQUHSu1pjx4Qjr4tFLBym6FzcIIrXbTwoCs/edit?tab=t.0)  
  * Validasi Email IBM  
  * Jangan lupa beberes perihal route (di akhir)  
    * Beberes route h-3, tapi untuk link kode referral fasilitator harus merujuk langsung ke [dicoding.com/pijak/registration](http://dicoding.com/pijak/registration) bukan ke [dicoding.com/pijak2027/registration](http://dicoding.com/pijak2027/registration). (pembahasan terkait link referral untuk fasil akan dilakukan h-2 minggu)  
  * Benefit untuk not eligible dari awal dikasih kelas bitt  
* Implemented but Need Confirmation:  
  * Email announcement untuk Cohort tidak terpilih & terpilih Progresif [Pijak 2027 - Registration Draft](https://docs.google.com/document/d/10leJ3w4B_BDsH2WTsfw7l4OltT8pKV6sCO9bmJwpqL8/edit?tab=t.rfkrojs16muu#heading=h.5bs4mytudez1)  
    * Progresif bisa per batch sesuai req Ops  
      * UID by tim Ops  
      * Auto email pengumuman diterima di Progresif  
      * Bagian pengumuman terupdate  
      * Auto enroll – deadline perlu dimakesure  
    * Tidak terpilih – Not Eligible (Bukan YA/VS)  
      * Auto email pengumuman arahin ke Bitt  
  * Landing page & referral page (framer). By Leo  
    * Ada page story  
    * Design leaderboard  
  * Testing Export Pijak2027: [Testing PIJAK 2027 Export](https://docs.google.com/spreadsheets/d/1ix2Y1KI11sQgprlrq9U1po14sZm9TXwX5b0irHPhCDY/edit?gid=1841360320#gid=1841360320)  
  * Not eligible benefit \+ token active period  
    * Langsung integrate dengan bitt, jadi benefitnya kelas bitt bukan kelas Dicoding  
    * Mana List kelasnya?  
      * Saring Sebelum Sharing, Tetap Kritis dan Beretika di Dunia AI (Bitt AI Series)  
      * Jangan Menyerah pada Keadaan (Bitt Inspirational Series)  
    * Ikuti proses integrasi dan sync kelasnya dengan AI Camp  
  * Progressive benefit \+ token active period  
    * Sudah sesuai dengan dokumen [Pijak 2027 - Brief Landing Page & Registration](https://docs.google.com/document/d/1sBJF9kF10arM3EpLV6qDq5dji4-0a-IXCAy-5gUAh1I/edit?tab=t.gr8362c0oj8u#heading=h.3rlp08bi8icb)  
  * **Registration closed date** \-\> 31 januari 2027 ini aslinya, tapi ada gimmick bahwa registrasi ditutup **31 desember 2026**. Jadi nanti setelah 1 januari tulisan otomatis pindah jadi 31 januari 2027\.  
  * Token deadline: batas pengerjaan assessment test \-\> 31 januari 2027 23.59, tidak ada gimmick  
  * Offering opened at \-\> 13 Januari 2027 (gimmick tulisan), cuman display/tulisan aja. Aslinya sebisa mungkin cepat-cepat kasih offering by tim ops. Setelah 14 januari langsung pindah jadi 31 januari 2026 tulisannya  
  * Offering deadline: batas konfirmasi offering \-\> 13 Januari 2027 (gimmick juga, aslinya mah 31 januari, tapi untuk yang dapat offering di 13 januari harus tetap narasi emailnya di hari itu bukan yang 48 jam) bisa extend ke 31 januari (harus pindah jadi 31 januari setelah gimmick berakhir).  
  * Cohort form deadline. 16 januari (gimmick juga, aslinya mah 31 januari) tapi nanti bisa extend ke 31 januari, sama seperti offering deadline.  
    * Sekarang akan ada narasi baru di nomor 5 bagian cohort data terkait deadline pengisian cohort data.  
  * Narasi pengumuman pengen berbeda dengan campaign lain, jadi sepertinya harus bikin komponen sendiri. (untuk tulisan 13 januari adalah gimmick aja)  
* Pembaruan: Yang leaderboard referral butuh minimum 50 orang dibawa dan menyelesaikan minimal 1 course untuk masuk leaderboard karena biar balik modal.  
  * Ini datanya hasil export platform IBM yang dimiliki tim Ops (dari luar sistem Dicoding) jadi tidak bisa determined by sistem. Karena yang di sistem sekarang itu asalkan dia sudah selesai registrasi akan langsung bisa muncul di leaderboard. Di pijak flash sebelumnya berdasarkan upload bukti bahwa dia telah menyelesaikan minimal satu kelas IBM.  
  * Ini ada contoh yang sama untuk baca dari sheet yaitu digdaya.  
  * Usulan solusi:  
    * Bikin command baru untuk read data dari sheet tim ops terkait leaderboard yang ada user id nya. Isinya cohort yang sudah eligible untuk masuk leaderboard  
    * Cocokan user id yang ada di sheet dengan participant scholarships lalu simpan ke other requirements di scholarship participant.  
    * Lalu nanti untuk display di leaderboard page nya sort by count referrer  
* Request baru:  
  * Peserta yang pake referral fasilitator akan langsung di assign ke fasil tersebut.  
    * Ada 3 use case:  
      * Jika peserta pijak2027 daftar pake link referral yang ternyata itu referral dari seorang fasil maka peserta tadi di assign jadi mentee fasil tersebut melalui link group whatsapp yang disediakan di email.  
      * Jika peserta pijak2027 daftar pake link referral yang bukan referral seoarang fasil, maka peserta tersebut di assign ke fasilitator yang masih kurang pesertanya melalui link group WA yang disediakan di email juga.  
      * Jika peserta pijak2027 daftar tanpa link referral maka peserta tersebut di assign ke fasilitator yang masih kurang pesertanya melalui link group WA yang disediakan di email juga.   
        * Jika mencapai 1000 referrer untuk seorang fasil maka sistem harus flag di other requirements bahwa fasil tersebut sudah max dan tidak bisa dikirimkan link group yang sama lagi (harus di assign ke fasil lain)  
    * Baru inget buat mekanisme matchmaking fasil itu ada tambahan 1 lagi @Krisna Santosa  
      Kan di email akan terattach link group, nah si group rawan ter-banned jadi perlu ada mekanisme update link via sheet.. Jadi tim ops kalau mau update link bisa di sana, atau via platform juga bowlee.. Intinya biar email yang baru kekirim udh update link groupnya biar valid.  
* Tim ops bikin aja shortlink yang bisa ganti-ganti link whatsapp di sini [http\://dicoding.id/lewat-sini](http://dicoding.id/lewat-sini). Nanti tim ops tinggal kasih hasil shortlink dan juga user id referrer/fasil nya nya ke engineer.  
* Tim ops harus bikin shortlink seperti ini: [dicoding.id/group-whatsapp-{UID-fasil](http://dicoding.id/group-whatsapp-{UID-fasil)}, misal [dicoding.id/group-whatsapp-1234](http://dicoding.id/group-whatsapp-1234)   
* Nanti engineer bikin 300 line di config yang berisi user id fasil dan juga shortlink nya. 

Action items

- [x] ~~Request design leaderboard ke Leo~~  
- [x] ~~Draft Email Auto email pengumuman diterima di Progresif~~  
- [x] ~~Draft Email Auto email pengumuman arahin ke Bitt (NOT ELIGIBLE BUKAN YA/VS) di Senin HTML~~  
- [ ] \[ASYNC\] Diskusi dengan tim Bitt → akan menggunakan mekanisme yang di AI Camp  
- [x] ~~Draft narasi pengumuman halaman Not Eligible (Bukan YA/VS) sync Bitt~~  
- [ ] Update Tugas Tari [https\://docs.google.com/document/d/1I9mgo9yyQQUHSu1pjx4Qjr4tFLBym6FzcIIrXbTwoCs/edit?tab=t.0\#bookmark=id.7jy7v55osppz](https://docs.google.com/document/d/1I9mgo9yyQQUHSu1pjx4Qjr4tFLBym6FzcIIrXbTwoCs/edit?tab=t.0#bookmark=id.7jy7v55osppz)   
- [x] ~~Penambahan narasi batas maksimum pengisian Cohort Data [Pijak 2027 - Brief Landing Page & Registration](https://docs.google.com/document/d/1sBJF9kF10arM3EpLV6qDq5dji4-0a-IXCAy-5gUAh1I/edit?tab=t.wjrtafq1qgz7#bookmark=id.y79432phmaca)~~

Online: https://docs.google.com/document/d/1nLyQ7TX0WeODx_AcpLRX7jFLE-4ATQ0OTfCmJvvzWDk/edit?tab=t.0