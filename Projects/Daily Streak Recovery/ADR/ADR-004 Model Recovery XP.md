---
status: accepted
date: 2026-11-20
project: "[[PRD Daily Streak Recovery]]"
related:
  - "[[ADR-001 Harga Refill Streak Recovery 500 XP]]"
---
# ADR-004: Model Recovery XP

## Konteks

Pengguna butuh progres yang terlihat menuju Streak Recovery berikutnya, terpisah dari Total XP yang sudah ada (`gamification_user_xp`).

## Keputusan

### Dua penghitung XP

| Penghitung | Perilaku |
|---|---|
| Total XP | Sudah ada, terus bertambah, tidak pernah reset |
| Recovery XP | Baru, 0 sampai 499. Saat mencapai 500 kembali ke 0 |

UI menampilkan dua progress bar: Total XP dan Recovery XP (`x/500`).

### Recovery XP mengikuti Total XP

Setiap XP yang menambah Total XP juga menambah Recovery XP dengan jumlah yang sama, dari **semua sumber** (`tutorial`, `exam_module`, `submission_module`, bonus buff, `loyalty_bonus`, `daily_commit`). Perbedaannya: Recovery XP kembali ke 0 setiap mencapai 500, dan hanya bertambah selama kuota di bawah 3.

Implementasi: disambungkan di `GamificationXpGateway::recordAndIncrementXp`, hanya ketika `recordXpHistory` berhasil (idempoten lewat `INSERT IGNORE`), sehingga XP yang sama tidak terhitung dua kali. Bukan di event `CoreLearningXPWasAwarded` karena event itu hanya membawa XP dasar.

### Penyimpanan

Kolom `recovery_xp` (0 sampai 499) di baris yang sama dengan kuota, di-update dalam satu transaksi dengan pencatatan XP.

### Saat kuota penuh (3/3), mengikuti PRD (diputuskan 2026-11-20)

XP yang diperoleh saat kuota 3 **tidak disimpan** sebagai Recovery XP. Recovery XP tetap 0 dan UI menampilkan tulisan "Recovery penuh" (bar tidak bergerak). Setelah pengguna memakai recovery, progres mulai dari 0/500.

Versi sebelumnya (Recovery XP tetap berjalan saat penuh) ditolak karena bertentangan dengan aturan "sisa XP saat mencapai 3 dibuang" dan membuat "tabungan XP" yang melemahkan dorongan konsistensi belajar.

### Sisa XP saat melewati 500 (terjawab dari PRD US-1.2, 2026-11-20)

- Selama kuota di bawah 3, sisa XP dibawa ke progres berikutnya. Contoh: Recovery XP 450 + 100 XP menjadi +1 recovery, Recovery XP 50.
- Satu aktivitas bisa memberi beberapa recovery sekaligus. Contoh: kuota 0, Recovery XP 0, + 1.250 XP menjadi kuota 2, Recovery XP 250.
- Sisa XP dari aktivitas yang membuat kuota mencapai 3 dibuang. Contoh: kuota 2, Recovery XP 400, + 300 XP menjadi kuota 3, sisa 200 dibuang.
