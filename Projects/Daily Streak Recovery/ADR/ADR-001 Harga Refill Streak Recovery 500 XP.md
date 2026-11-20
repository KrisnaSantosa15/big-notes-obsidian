---
status: accepted
date: 2026-11-20
project: "[[PRD Daily Streak Recovery]]"
source: https://docs.google.com/document/d/12z-FEvdzAGEvb1aRjf7pHo5SQ5SCrPNZXaBv3yIFo4s/edit?tab=t.0
---
# ADR-001: Harga refill Streak Recovery adalah 500 XP

## Konteks

PRD awalnya tidak konsisten soal jumlah XP untuk mendapatkan 1 Streak Recovery:

- Requirement US-1.2 menyebut 500 XP.
- Contoh dan acceptance criteria (US-1.2, US-3.1) memakai 1.000 XP (`600/1.000 XP`).
- Meeting notes menyebut 300 XP sebagai contoh.

## Keputusan

1 Streak Recovery = **500 XP**. Aturan lain di US-1.2 tetap:

- Progres hanya bertambah saat kuota di bawah 3.
- Satu aktivitas bisa menambah lebih dari 1 Streak Recovery sekaligus; sisa XP lanjut jadi progres.
- XP yang masuk saat kuota sudah 3, termasuk sisa XP dari aktivitas yang membuat kuota jadi 3, dibuang.

## Konsekuensi

- Contoh dan AC di PRD (Obsidian) sudah disesuaikan ke 500 XP pada 2026-11-20 (mis. `300/500 XP`, 1.250 XP menjadi 2 recovery + 250 progres).
- Google Doc belum diubah.
- Angka 500 disimpan sebagai konstanta domain, bukan config, sampai ada kebutuhan tuning dari tim Gamifikasi.
