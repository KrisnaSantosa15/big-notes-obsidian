Setelah melakukan sync update 15 Oktober 2026 dengan tim ops ada beberapa hal yang bisa disampaikan:
Link Online: https://docs.google.com/document/d/1nLyQ7TX0WeODx_AcpLRX7jFLE-4ATQ0OTfCmJvvzWDk/edit?tab=t.0
# Request Baru
## Mentee Grouping
Tim ops ingin agar peserta yang menggunakan link referral fasilitator ketika mendaftar maka dia akan langsung diberikan email hasil registrasi yang berbeda.
Ada 3 use case:
- Jika peserta pijak2027 daftar pake link referral yang ternyata itu referral dari seorang fasil maka peserta tadi di assign jadi mentee fasil tersebut melalui link group whatsapp yang disediakan di email. Jika fasilitator tersebut ternyata sudah memiliki max 1000 mentee maka yang ke 1001 akan diassign ke fasil lain.
- Jika peserta pijak2027 daftar pake link referral yang bukan referral seoarang fasil, maka peserta tersebut di assign ke fasilitator yang masih kurang pesertanya melalui link group WA yang disediakan di email juga.
- Jika peserta pijak2027 daftar tanpa link referral maka peserta tersebut di assign ke fasilitator yang masih kurang pesertanya melalui link group WA yang disediakan di email juga.

Ops: kan di email akan terattach link group, nah si group rawan ter-banned jadi perlu ada mekanisme update link via sheet.. Jadi tim ops kalau mau update link bisa di sana, atau via platform juga bowlee.. Intinya biar email yang baru kekirim udh update link groupnya biar valid.
Engineer: Usulan solusi:
- Tim ops bikin aja shortlink yang bisa ganti-ganti link whatsapp di sini http://dicoding.id/lewat-sini. Nanti tim ops tinggal kasih hasil shortlink dan juga user id referrer/fasil nya nya ke engineer.
- Tim ops harus bikin shortlink seperti ini: dicoding.id/group-whatsapp-{UID-fasil}, misal dicoding.id/group-whatsapp-1234
- Nanti engineer bikin 300 line di config yang berisi user id fasil dan juga shortlink nya. atau bahkan tidak perlu isi shortlink, cukup ambil aja di config uid nya lalu di blade tinggal ganti
- Kalau ada perubahan link karena group kena banned atau hal lainnya, tinggal ubah aja isi shortlink nya tanpa mengubah link shortlink

Notes tambahan dan masih brainstorm: Jika mencapai 1000 referrer untuk seorang fasil maka sistem harus flag di other requirements bahwa fasil tersebut sudah max dan tidak bisa dikirimkan link group yang sama lagi (harus di assign ke fasil lain)

## Pemisahan Halaman Referral dan Twibbon
- Pisahkan halaman Twibbon dan Referral
- Update Narasi Referral dan Twibbon:

### Narasi Referral dan TWibbon:
Ajak dan Bagikan Semangat Anda untuk Bergabung dengan Program Beasiswa Pijak 2027 in collaboration with IBM SkillsBuild! 🎉
1. Referral
   Ajak seluruh teman untuk mendaftar Program Beasiswa Pijak 2027 in collaboration with IBM SkillsBuild menggunakan link referral Anda dan dapatkan kesempatan untuk memenangkan hadiah menarik! Referral akan dihitung sebagai PathMate valid setelah teman Anda menyelesaikan minimal 1 course di IBM SkillsBuild.
   [link referral]
   Salin tautan

Kunjungi dicoding.com/pijak/referral untuk informasi lengkapnya.
2. Twibbon
   Unggah twibbon Anda di media sosial dan kirimkan tautannya di sini. Menangkan kesempatan memperoleh voucher Tokopedia Gift Card senilai total ratusan ribu rupiah untuk postingan terbaik!
   [input link]
   Kirim

Kunjungi dicoding.com/pijak/twibbon untuk informasi lengkapnya.

## Leaderboard
- Update Design Leaderboard tapi harus nunggu Design Leaderboard dari Leo: https://www.figma.com/design/XtkHWTzXi48Dq55hcZXXpG/Pijak?node-id=177-4717&t=ZDtT8l7OUEV3Pqre-0
- Sistem Leaderboard juga berubah, saat ini kan siapapun yang mempunyai referral dan sudah mengisi form registrasi bisa langsung masuk leaderboard dan sorted by jumlah referral, tapi sekarang beda:
  Yang leaderboard referral butuh minimum 50 orang dibawa dan menyelesaikan minimal 1 course untuk masuk leaderboard karena biar balik modal.
  Ini datanya hasil export platform IBM yang dimiliki tim Ops (dari luar sistem Dicoding) jadi tidak bisa determined by sistem. Karena yang di sistem sekarang itu asalkan dia sudah selesai registrasi akan langsung bisa muncul di leaderboard. Di pijak flash sebelumnya berdasarkan upload bukti bahwa dia telah menyelesaikan minimal satu kelas IBM.
  Ini ada contoh yang sama untuk baca dari sheet yaitu digdaya.
  Usulan solusi:
  Bikin command baru untuk read data dari sheet tim ops terkait leaderboard yang ada user id nya. Isinya cohort yang sudah eligible untuk masuk leaderboard
  Cocokan user id yang ada di sheet dengan participant scholarships lalu simpan ke other requirements di scholarship participant.
  Lalu nanti untuk display di leaderboard page nya sort by count referrer

## Date Gimmick
- Registration closed date -> 31 januari 2027 ini aslinya, tapi ada gimmick bahwa registrasi ditutup 31 desember 2026. Jadi nanti setelah 1 januari tulisan otomatis pindah jadi 31 januari 2027.
- Token deadline: batas pengerjaan assessment test -> 31 januari 2027 23.59, tidak ada gimmick
- Offering opened at -> 13 Januari 2027 (gimmick tulisan), cuman display/tulisan aja. Aslinya sebisa mungkin cepat-cepat kasih offering by tim ops. Setelah 14 januari langsung pindah jadi 31 januari 2027 tulisannya
- Offering deadline: batas konfirmasi offering -> 13 Januari 2027 (gimmick juga, aslinya mah 31 januari, tapi untuk yang dapat offering di 13 januari harus tetap narasi emailnya di hari itu bukan yang 48 jam) bisa extend ke 31 januari (harus pindah jadi 31 januari setelah gimmick berakhir).
- Cohort form deadline. 16 januari (gimmick juga, aslinya mah 31 januari) tapi nanti bisa extend ke 31 januari, sama seperti offering deadline.
  Sekarang akan ada narasi baru di nomor 5 bagian cohort data terkait deadline pengisian cohort data. Ini narasinya: "Batas maksimum pengisian formulir ini hanya sampai dengan 16 Januari 2027. Apabila Anda tidak mengisi sesuai dengan batas waktu, Anda dinyatakan tidak lolos Beasiswa Intensif Pijak 2027."

## Frammer Integration
- Landing Page, Referral Page dan Story page akan disediakan oleh Leo melalui Frammer, engineer harus tau route frammernya biar nanti tinggal ganti di route


# Perbaikan
- Saat ini, kita menggunakan feature flag pijak untuk pijak2027, di production flag Pijak itu sudah aktif dan otomatis jika dibuka pijak2027/registration itu bisa dibuka, better disable toggle pijak atau untuk pijak 2027 ini bikin flag baru tapi route nya nanti tetap pijak/registration bukan pijak2027/registration
- Email pengumuman progressive perlu update, nunggu desain dari tim Ops
- Email peserta not eligible ketika daftar akan dapat benefit kelas bitt, tidak lagi kelas dicoding yang auto enroll itu. List kelas Bitt nya adalah: 
  - "Saring Sebelum Sharing, Tetap Kritis dan Beretika di Dunia AI (Bitt AI Series)" dan 
  - "Jangan Menyerah pada Keadaan (Bitt Inspirational Series)"
  - Desain Email nunggu dari tim Ops
- Not Eligible itu ada 2:
  - Not eligible dari awal karena tidak masuk syarat progressive/intensive: langsung diberikan email dan buka pengumuman bahwa dia tidak lolos dan benefitnya adalah kelas bitt
  - Not eligible karena dia tidak menyelesaikan minimal satu kelas ibm: ini akan diberikan datanya oleh tim ops dan pengumumannya berisi "Untuk melanjutkan semangat Anda, Anda dapat tetap mengakses pembelajaran di IBM SkillsBuild hingga 30 Maret 2027."
- Narasi pengumuman pengen berbeda dengan campaign lain, jadi sepertinya harus bikin komponen sendiri. (untuk tulisan 13 januari adalah gimmick tulisan aja dan harus dinamis ketika 14 januari harus pindah jadi 31 januari 2027). Ini narasinya dibagi per kategori, jika sudah sesuai jangan bikin lagi. bisa cek di https://docs.google.com/document/d/1sBJF9kF10arM3EpLV6qDq5dji4-0a-IXCAy-5gUAh1I/edit?tab=t.3dlvost3884w

## Narasi Pengumuman
### Menunggu Hasil Seleksi

Tahap selanjutnya adalah pengumuman yang akan diinfokan selambatnya pada 13 Januari 2027 mendatang. [ini akan berbuah jadi 31 januari 2027 ketika 14 januari/batas gimmick nya sudah berakhir (13 januari)]
Harap periksa secara rutin kotak masuk email terkait ([email pendaftar]), termasuk folder promosi, pembaruan, spam, atau sampah untuk memastikan tidak ada informasi penting yang terlewat.
Anda juga dapat memeriksa status pendaftaran melalui Dashboard Dicoding.

Salam,
Tim Pijak in Collaboration with IBM SkillsBuild

### Diterima - Masuk Intensif

**Selamat Bergabung di Program Beasiswa Intensif Pijak!**

Selamat bergabung! Ini menandai awal perjalanan transformatif Anda dalam mengembangkan keterampilan berharga, berkolaborasi dengan para ahli industri, dan mendorong batasan inovasi. Sambut tantangan yang ada di depan, dan manfaatkan kesempatan ini sebaik-baiknya.

Silakan periksa email Anda ([email peserta]) secara berkala selambatnya pada 13 Januari 2027 untuk petunjuk lebih lanjut. [ini akan berbuah jadi 31 januari 2027 ketika 14 januari/batas gimmick nya sudah berakhir (13 januari)]

Salam hangat,
**Tim Pijak in Collaboration with IBM SkillsBuild**

### Tidak Diterima - Masuk Progresif

**Terima kasih atas antusiasme Anda dalam bergabung dengan Program Beasiswa Pijak!**

Selamat atas keberhasilan Anda meraih Beasiswa Progresif! Jadikan momentum ini sebagai langkah awal untuk terus belajar, berkembang, dan mewujudkan cita-cita. Tetaplah semangat dan selalu berikan dedikasi terbaik Anda!

Salam hangat,
**Tim Pijak in Collaboration with IBM SkillsBuild**


### Tidak Eligible (Non YA/VS) atau Tidak Eligible Syarat Progresif (yang lolos kriteria tapi tidak menyelesaikan salah satu kelas IBM, ini gimana cara sistem taunya ya?)

**Terima kasih atas antusiasme Anda dalam bergabung dengan Program Beasiswa Pijak!**

Saat ini, Anda tidak termasuk di antara peserta yang terpilih di beasiswa Intensif maupun Progresif, tetapi semangat dan usaha Anda sangat dihargai.

**Untuk melanjutkan semangat Anda, Anda dapat tetap mengakses pembelajaran di IBM SkillsBuild hingga 30 Maret 2027.**

Teruslah belajar, berkembang, dan berusaha mencapai tujuan Anda. Peluang baru menanti dan kami berharap dapat melihat Anda mencoba lagi dalam kesempatan lain.

Salam hangat,
**Tim Pijak in Collaboration with IBM SkillsBuild**


### Tidak Eligible (Non YA/VS) - Mendapatkan Kelas Bitt (yang dari awal ketika pendaftaran sudah tidak masuk kriteria apapun)

**Terima kasih atas antusiasme Anda dalam bergabung dengan Program Beasiswa Pijak!**

Saat ini, Anda tidak termasuk di antara peserta yang terpilih, tetapi semangat dan usaha Anda sangat kami hargai. Sebagai bentuk apresiasi, kami memberikan Anda akses gratis ke 2 kelas Bitt selama 30 hari. Teruslah belajar, berkembang, dan berusaha mencapai tujuan Anda.

1. **Daftar dan hubungkan akun Bitt**
Bitt digunakan untuk mengakses kelas. Hubungkan akun Bitt dengan Dicoding untuk mulai belajar.

[Siapkan Akun Bitt](Button Merah)

**Syarat dan ketentuan:**
- Akses kelas hanya aktif apabila akun Bitt dan Dicoding terhubung menggunakan email yang sama.
- Lihat panduan belajar platform Bitt berikut: dicoding.id/Bitt-Guideline

2. **Mulai belajar di kelas Bitt**
Akses kelas Bitt berikut dalam 30 hari ke depan sampai dengan {{tanggal berakhir}}:
Saring Sebelum Sharing, Tetap Kritis dan Beretika di Dunia AI (Bitt AI Series) → hyperlink
Jangan Menyerah pada Keadaan (Bitt Inspirational Series) → hyperlink

Peluang baru menanti, dan kami berharap dapat melihat Anda mencoba lagi dalam kesempatan berikutnya.

Salam hangat,
**Tim Pijak in Collaboration with IBM SkillsBuild**

