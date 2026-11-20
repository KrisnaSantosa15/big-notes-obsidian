---
status: accepted
date: 2026-11-20
project: "[[PRD Daily Streak Recovery]]"
related:
  - "[[ADR-002 Pergantian Hari Mengikuti WIB]]"
---
# ADR-003: Mekanisme pilihan wajib recovery atau reset

## Konteks

PRD awal memunculkan pilihan setelah pengguna menyelesaikan aktivitas valid pertama, dan reset memulai streak dari 1. Ini memunculkan kasus "belajar sambil pending" (aktivitas berhari-hari sebelum memilih) yang membuat logika bercabang.

## Keputusan

### Status dihitung, tidak disimpan

Hari terlewat = hari tanpa aktivitas valid dan belum dilindungi, dari setelah `last_check_in_day` sampai **kemarin** (WIB). Hari ini tidak pernah dihitung terlewat.

| Hari terlewat | Status | Perilaku |
|---|---|---|
| 0 | Normal | Seperti Daily Streak sekarang |
| 1 sampai kuota | Pending | Pilihan wajib ditampilkan |
| Lebih dari kuota | Reset otomatis | Streak menjadi 0, kuota tetap |

Konsep "jendela pemulihan" tidak perlu disimpan: aturan "jumlah hari terlewat ≤ kuota" sudah setara dengan jendela pemulihan di PRD.

### Pilihan muncul saat membuka Dicoding

- Pilihan muncul ketika pengguna membuka halaman (bukan setelah aktivitas), selama status pending.
- Pilihan tidak bisa ditutup. Jika browser ditutup, pilihan muncul lagi di kunjungan berikutnya.
- Jika pengguna terus tidak memilih sampai hari terlewat melebihi kuota, streak di-reset otomatis.

Contoh, kuota 3, streak 100 pada Minggu:

| Hari | Kejadian | Hari terlewat | Hasil |
|---|---|---|---|
| Sen | Tidak belajar | 0 | Normal, streak 100 |
| Sel | Buka Dicoding | 1 (Sen) | Pending, ditanya |
| Rab | Buka Dicoding, belum memilih | 2 (Sen, Sel) | Pending, ditanya |
| Kam | Buka Dicoding, belum memilih | 3 | Pending, ditanya |
| Jum | Buka Dicoding | 4 | Reset otomatis ke 0 |

### Hasil pilihan

- **Recover:** semua hari terlewat dilindungi (tidak bisa sebagian), kuota berkurang sebanyak hari terlewat, angka streak tetap (100). Aktivitas berikutnya menambah streak seperti biasa.
- **Reset:** streak menjadi **0**, kuota tetap. Aktivitas berikutnya membuat streak 1.

### Penjagaan di server

- Selama pending, aktivitas valid yang tetap masuk ke server (tab lama, form yang sudah terbuka) **tidak menambah streak** dan tidak mengubah `last_check_in_day`. Tanpa ini, hari terlewat tersambung gratis tanpa memakai kuota.
- **XP tidak diubah.** XP tetap diberikan selama pending. `CoreLearningXPService` tidak disentuh. Efek samping yang diterima:
  - Aktivitas saat pending tidak menambah streak; setelah memilih, pengguna perlu satu aktivitas lagi agar hari itu terhitung.
  - XP saat pending bisa menggenapkan recovery XP sehingga kuota bertambah dan batas hari terlewat ikut melebar. Ini diterima karena didapat dari belajar.

### Pesan reset

Satu pesan untuk semua reset otomatis, tanpa membedakan apakah pengguna sempat melihat pilihan:

> Streak kamu direset karena hari yang terlewat melebihi jumlah Streak Recovery.

Pesan ditampilkan sekali (butuh penanda "sudah ditampilkan").

### Halaman tempat pilihan muncul

- **Wajib (aturan teknis):** semua halaman tempat pengguna bisa mendapat XP atau progres, yaitu halaman classroom (modul, kuis, exam, submission).
- **Usulan, perlu disepakati UI/UX:** dashboard juga menampilkan pilihan. Halaman lain (jobs, event, profil) tidak menampilkan modal, cukup penanda di ikon streak navbar.

## Konsekuensi

- Kode sekarang hanya me-reset saat aktivitas (`DailyStreaksGateway::increaseStreak()` lewat `getProcessedDailyStreakData()`), sehingga UI menampilkan streak lama sampai aktivitas berikutnya. Fitur ini menambahkan status pending dan memindahkan reset otomatis ke saat halaman dibuka. Lihat [[Technical Design]].
- Tidak perlu kolom status pending.
- PRD US-2.2, US-2.3, US-2.4, US-3.3, §5.1, §7, dan §8.1 disesuaikan pada 2026-11-20.
