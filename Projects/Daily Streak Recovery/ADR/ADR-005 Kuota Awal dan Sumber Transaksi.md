---
status: accepted
date: 2026-11-20
project: "[[PRD Daily Streak Recovery]]"
related:
  - "[[ADR-004 Model Recovery XP]]"
---
# ADR-005: Kuota awal dan sumber transaksi

## Konteks

Semua akun Dicoding, baik lama, baru, maupun yang akan datang, harus memiliki 3 Streak Recovery. Baris `daily_streaks` saat ini hanya dibuat ketika pengguna pertama kali beraktivitas, jadi tidak semua akun memiliki baris.

## Keputusan

### Kuota awal sebagai aturan, bukan transaksi

- Kolom `recovery_quota` dengan `DEFAULT 3`. Baris lama otomatis terisi 3 saat kolom ditambahkan, dan baris baru otomatis 3.
- Akun tanpa baris `daily_streaks` dianggap memiliki 3.
- **Tidak ada transaksi `default`.** Kuota awal 3 adalah aturan. Ledger hanya mencatat perubahan setelahnya.

### Sumber transaksi

| Sumber | Delta | Catatan |
|---|---|---|
| `xp_reward` | +N | Satu transaksi per aktivitas yang membuat Recovery XP melewati 500 |
| `usage` | −N | Satu transaksi per keputusan "recover". Baris hari yang dilindungi menyimpan id transaksi ini |
| `admin` | ± | Wajib alasan dan `admin_id`. Hasil akhir tetap 0 sampai 3 |

Setiap transaksi menyimpan waktu, delta, sumber, dan `quota_after`, jadi riwayat terbaca tanpa transaksi pembuka.

### Keputusan reset tidak masuk ledger

Pilihan reset dan reset otomatis tidak mengubah kuota, jadi tidak dicatat di ledger. Keduanya dicatat lewat event tracking di Fase 2 (PRD §9 dan §11) untuk metrik "recover vs reset".

## Konsekuensi

- Tidak ada backfill per akun.
- AC US-1.1 dan daftar transaksi US-1.3 di PRD disesuaikan pada 2026-11-20.
