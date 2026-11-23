---
project: "[[PRD Daily Streak Recovery]]"
created: 2026-11-20
status: draft
related:
  - "[[ADR-001 Harga Refill Streak Recovery 500 XP]]"
  - "[[ADR-002 Pergantian Hari Mengikuti WIB]]"
  - "[[ADR-003 Mekanisme Pilihan Wajib Recovery atau Reset]]"
  - "[[ADR-004 Model Recovery XP]]"
  - "[[ADR-005 Kuota Awal dan Sumber Transaksi]]"
  - "[[Open Questions]]"
---
# Technical Design: Daily Streak Recovery

## 1. Kondisi kode sekarang (terverifikasi 2026-11-20)

| Hal | Fakta | Lokasi |
|---|---|---|
| Tabel | `daily_streaks`: `user_id` (unique), `current_streak`, `max_streak`, `last_check_in_day` | `app/database/migrations/2025_10_01_164941_create_daily_streaks_table.php` |
| Penambah streak | 3 listener memanggil `DailyStreaksGateway::increaseStreak()` | `GlobalDomainEventHandlers/Academies/{DeveloperJourneyTutorialWasCompleted,DeveloperJourneySubmissionWasSubmitted,MultipleChoiceQuestionWasCompleted}Listener.php` |
| Aktivitas valid | Submodul (`ModuleCompletionService`), kuis (`MultipleChoiceQuestionWasCompleted`, `AcceptingCourseSubmission`), exam (`ExamFinalization`), submission. Kelas tercakup lewat submodul terakhir | |
| Reset | **Hanya saat aktivitas**: `increaseStreak()` memanggil `getProcessedDailyStreakData()` yang me-reset ke 0 jika ada hari terlewat | `Infrastructure/StorageGateways/Journeys/DailyStreaksGateway.php` |
| Tampilan | Navbar v3, classroom (`ClassroomTutorialExtras::streakOf`), widget dashboard, dan Inertia membaca `get()` mentah. **Setelah hari terlewat, UI tetap menampilkan streak lama sampai aktivitas berikutnya** | |
| Kalender Inertia | `normalizeDailyStreak` menganggap hari aktif selalu berurutan: `[last - current + 1, last]` | `frontend/src/modules/student-dashboard/normalizers/streak.ts` |
| Hari dikecualikan | `StreakGapPolicy::EXEMPT_DATES` (global) | `Dicoding/DomainServices/DailyStreak/StreakGapPolicy.php` |
| XP | Semua XP lewat `GamificationXpGateway::recordAndIncrementXp()` (idempoten `INSERT IGNORE`). Keenam pemanggil ada di satu file | `Infrastructure/Services/Gamification/CoreLearningXPService.php` |
| Feature flag | Global: `Feature::isEnabled('daily-checkin')`. Per user: `featureUsersGateway->isEnabled(...)` | `ClassroomTutorialExtras.php:84`, `ModuleCompletionService.php:161` |
| Pola use case terbaru | Satu aggregate per use case (`DailyAddOnTokenRedemption`, `...Creation`, `...Update`), repository konkret `createAggregate()` + `save()`, Specification mengorkestrasi | `Dicoding/Domain/DailyAddOns/`, `UseCases/DailyAddOns/Transactions/RedeemDailyAddOnTokenSpecification.php` |

## 2. Skema

### Ubah `daily_streaks`

| Kolom | Tipe | Default | Catatan |
|---|---|---|---|
| `recovery_quota` | `TINYINT UNSIGNED` | `3` | ADR-005. Baris lama terisi 3 otomatis |
| `recovery_xp` | `SMALLINT UNSIGNED` | `0` | ADR-004, 0 sampai 499 |
| `has_unseen_reset_notice` | `BOOLEAN` | `false` | Pesan reset tampil sekali (ADR-003) |

### Tabel baru `daily_streak_protected_days`

| Kolom | Catatan |
|---|---|
| `id` | |
| `user_id` | FK `users` |
| `protected_date` | `DATE` |
| `recovery_transaction_id` | FK ke transaksi `usage` yang membayar hari ini |
| `created_at` | |

`UNIQUE(user_id, protected_date)`: satu hari hanya bisa dilindungi sekali (US-2.2 AC-12/13).

### Tabel baru `daily_streak_recovery_transactions`

| Kolom | Catatan |
|---|---|
| `id` | |
| `user_id` | FK `users` |
| `delta` | `TINYINT` bertanda |
| `source` | `xp_reward` / `usage` / `admin` |
| `quota_after` | |
| `admin_id` | nullable, wajib untuk `admin` |
| `reason` | nullable, wajib untuk `admin` |
| `created_at` | |

Index `(user_id, created_at)`.

## 3. Domain

### Kebijakan hari terlewat

Domain service baru `Dicoding/Domain/DailyStreak/Services/MissedDayService`:

```
missedDays(Carbon $lastCheckInDay, Carbon $today, array $protectedDays): array<Carbon>
```

Hasil: hari setelah `lastCheckInDay` sampai **kemarin**, dikurangi `protectedDays`. Hari yang dilindungi maupun yang terlewat dibungkus VO `StreakDays` (`contains()`, `count()`, `getDateStrings()`, `fromDateStrings()`), jadi konversi Carbon dan string hanya ada di VO itu.

Diputuskan 2026-11-20: **tidak** memperluas `StreakGapPolicy` dan tidak memakai `EXEMPT_DATES`. `EXEMPT_DATES` adalah perbaikan insiden 2026-10-21 (streak hilang saat patch PHP), bukan bagian fitur recovery. Saat fitur rilis, jarak yang mencakup tanggal itu pasti melebihi kuota (Expired), jadi pengecualian tidak berpengaruh. `StreakGapPolicy` dibiarkan seperti di master, dan ikut tidak terpakai saat listener lama diganti `DailyStreakCheckIn` (PR4).

Status (ADR-003), enum `DailyStreakStatus`:

| Kondisi | Status |
|---|---|
| `missedDays = 0` | `Normal` |
| `1 ≤ missedDays ≤ quota` | `Pending` |
| `missedDays > quota` | `Expired` |

### Aggregate per use case

Mengikuti pola DailyAddOns. Semua di `Dicoding/Domain/DailyStreak/`.

| Aggregate | Method | Aturan | Event |
|---|---|---|---|
| `DailyStreakCheckIn` | `checkIn()` | Pending: tidak melakukan apa-apa (penjaga server). Expired: reset lalu jadi 1. Normal: +1 jika belum hari ini | `DailyStreakWasIncreased` |
| `DailyStreakRecovery` | `recover()` | Wajib Pending. Melindungi semua hari terlewat, kuota −N, streak tetap | `DailyStreakWasRecovered` (user, tanggal, `quota_after`) |
| | `reset()` | Wajib Pending. Streak 0, kuota tetap | `DailyStreakWasResetByChoice` |
| `DailyStreakExpiration` | `expire()` | Wajib Expired. Streak 0, `has_unseen_reset_notice = true` | `DailyStreakWasExpired` |
| `StreakRecoveryXpEarning` | `earn(int $xp)` | Kuota 3: tidak melakukan apa-apa. Di bawah 3: tambah `recovery_xp`, setiap kelipatan 500 jadi +1 kuota dan sisa dibawa. Saat kuota mencapai 3, `recovery_xp` jadi 0 dan sisa dibuang (ADR-004) | `StreakRecoveryWasEarned` (jika kuota bertambah) |
| `StreakRecoveryQuotaCorrection` | `correct(int $delta, string $reason)` | Hasil 0 sampai 3, admin wajib | `StreakRecoveryQuotaWasCorrected` |

- Error key: `DAILY_STREAK.RECOVERY.NOT_PENDING`, `DAILY_STREAK.RECOVERY.NOT_RECOVERED_YET`, `DAILY_STREAK.RECOVERY.NOT_EXPIRED`, `DAILY_STREAK.RECOVERY.QUOTA_OUT_OF_RANGE`.
- Konstanta `StreakRecoveryXpEarning::XP_PER_RECOVERY = 500` dan `MAX_QUOTA = 3` (ADR-001).
- Tanggal sebagai `Carbon` (WIB, ADR-002).

### Repository

Satu repository konkret per aggregate (`createAggregate()` + `save()`), tanpa interface. Semua memakai satu `DailyStreakRecoveryGateway` baru. `DailyStreaksGateway` lama tetap untuk leaderboard dan pembacaan tampilan.

## 4. Use case dan konkurensi

| Specification | Dipicu oleh | Isi |
|---|---|---|
| `CheckInDailyStreakSpecification` | 3 listener aktivitas (menggantikan `increaseStreak`) | Transaksi DB, baris dikunci `lockForUpdate`, `checkIn()`, simpan. Session flash `show-streaks-modal` dipindah ke listener |
| `ChooseDailyStreakRecoverySpecification` | `POST` pilihan user | Transaksi + lock, hitung ulang hari terlewat, `recover()` atau `reset()`. Klik ganda: request kedua mendapat `NOT_PENDING` |
| `ResolveDailyStreakStatusSpecification` | Saat halaman classroom dan dashboard dirender | Jika Expired: `expire()` dan simpan (idempoten). Mengembalikan status, tanggal terlewat, kuota, `recovery_xp`, dan pesan reset jika ada |
| `EarnStreakRecoveryXpSpecification` | `CoreLearningXPService` setelah `recordAndIncrementXp()` berhasil | Transaksi + lock, `earn()`, simpan. Lewat satu helper privat di service tersebut agar keenam sumber XP tercakup (ADR-004) |
| `CorrectStreakRecoveryQuotaSpecification` | Halaman admin | `correct()` dan simpan |

Catatan:
- `ResolveDailyStreakStatusSpecification` menulis saat GET. Ini dipilih karena pesan reset butuh penanda "sudah ditampilkan" dan agar tampilan streak tidak basi lagi (masalah di §1).
- Semua penulisan kuota dan `recovery_xp` lewat baris `daily_streaks` yang dikunci, jadi refill XP dan pemakaian recovery tidak saling menimpa.

## 5. Web dan UI

- `POST /api/v1/daily-streak/recovery` dengan `choice = recover|reset`. Action tipis ke Specification, respons memakai `PayloadResponseStatus`.
- **Modal wajib (ADR-003):**
  - Classroom v3 dan v4 (`academytutorials/show.blade.php`), data dari `ClassroomTutorialExtras`.
  - Dashboard Inertia ([[Open Questions]] #3, UI/UX).
- **Kuota dan dua progress bar:** Total XP dan Recovery XP `x/500`, atau tulisan "Recovery penuh" saat 3/3 (bar diam, ADR-004).
- **Kalender:**
  - Hari terlindungi diberi penanda berbeda.
  - `normalizeDailyStreak` dan widget Blade perlu daftar tanggal terlindungi dari backend, karena asumsi "hari aktif berurutan" tidak lagi benar.

## 6. Feature flag

Flag baru per user `daily_streak_recovery` (untuk kelompok kontrol, PRD §11.2).
- **Mati:** perilaku sama persis dengan sekarang. `missedDays` tanpa hari terlindungi, tidak ada Pending (langsung Expired), tidak ada modal, tidak ada refill.
- **Hidup:** semua perilaku di atas.

Kolom tetap ada untuk semua user, sehingga kuota 3 sudah siap saat flag dinyalakan.

## 7. Urutan PR (stack lurus)

Aturan: **satu PR, satu aggregate** (keputusan 2026-11-20, agar mudah direview). Setiap aggregate mengikuti split domain lalu infra. Migration hanya menambah kolom/tabel yang dibutuhkan PR itu.

| PR | Aggregate | Layer | Isi |
|---|---|---|---|
| 1 | `DailyStreakRecovery` | Domain | `MissedDayService::missedDays()`, enum `DailyStreakStatus`, aggregate (recover/reset), unit test, repository + gateway kosong |
| 2 | `DailyStreakRecovery` | Infra + Web | Migration (`recovery_quota`, `daily_streak_protected_days`, `daily_streak_recovery_transactions`), gateway, `ChooseDailyStreakRecoverySpecification`, `POST /api/v1/daily-streak/recovery`, integration test, flag `daily_streak_recovery` |
| 3 | `DailyStreakCheckIn` | Domain | Aggregate (penjaga Pending, Expired jadi 1, Normal +1), unit test, repository |
| 4 | `DailyStreakCheckIn` | Infra | `CheckInDailyStreakSpecification`, ganti 3 listener, integration test |
| 5 | `StreakRecoveryXpEarning` | Domain | Aggregate refill, unit test, repository |
| 6 | `StreakRecoveryXpEarning` | Infra | Migration `recovery_xp`, spec, hook di `CoreLearningXPService`, integration test |
| 7 | `DailyStreakExpiration` | Domain | Aggregate, unit test, repository |
| 8 | `DailyStreakExpiration` | Infra | Migration `has_unseen_reset_notice`, `ResolveDailyStreakStatusSpecification`, integration test |
| 9+ | (UI) | Frontend | Modal wajib, kuota + progress bar, kalender, pesan reset. Menunggu UI/UX ([[Open Questions]] #3) |
| 10 | `StreakRecoveryQuotaCorrection` | Domain | Aggregate, unit test, repository |
| 11 | `StreakRecoveryQuotaCorrection` | Infra + Web | Spec, halaman admin (US-1.4), integration test |
| Fase 2 | | | Event tracking (recover/reset/expire), toast refill dan konfirmasi (US-3.2 sampai 3.4) |

Flag `daily_streak_recovery` tetap mati sampai minimal PR 1 sampai 4 dan UI modal merge. `DailyStreakRecovery` tanpa penjaga `DailyStreakCheckIn` membuat streak bisa tersambung gratis.

## 8. Risiko yang perlu dicek sebelum PR2

- `ALTER TABLE daily_streaks` di produksi: pastikan `ADD COLUMN ... DEFAULT` berjalan instan (online DDL) untuk ukuran tabelnya.
- Apakah dispatch `GlobalDomainEventServiceProvider` sinkron di dalam request? Ini memengaruhi transaksi dan session flash di listener.
- Leaderboard di-cache 1440 menit; status Pending tidak mengubah angka, jadi aman. Perlu dicek setelah reset.
