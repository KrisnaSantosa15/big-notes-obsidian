---
status: accepted
date: 2026-11-20
project: "[[PRD Daily Streak Recovery]]"
---
# ADR-002: Pergantian hari mengikuti WIB

## Konteks

PRD US-2.1 menyebut pergantian hari "mengikuti zona waktu pengguna, sesuai dengan mekanisme Daily Streak yang sudah berjalan". Kenyataannya Daily Streak sekarang memakai `Carbon::now()` dengan `config/app.php` `timezone = Asia/Jakarta`, jadi semua pengguna mengikuti hari WIB. XP dan leaderboard juga sama.

## Keputusan

Streak Recovery memakai **WIB** untuk semua pengguna, sama seperti Daily Streak sekarang. Kolom `cities.timezone` tidak dipakai.

## Konsekuensi

- Tidak ada migrasi dan tidak ada perubahan perilaku Daily Streak yang sudah berjalan.
- Pengguna WITA/WIT yang belajar pukul 00.00 sampai 01.59 waktu lokal tercatat di hari sebelumnya (WIB).
- Kasus "pengguna berpindah zona waktu" di PRD §7 tidak relevan.
- Zona waktu per pengguna bisa dievaluasi nanti sebagai perubahan Daily Streak secara keseluruhan, bukan bagian Streak Recovery.
