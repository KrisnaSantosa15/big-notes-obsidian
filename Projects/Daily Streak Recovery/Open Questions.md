---
project: "[[PRD Daily Streak Recovery]]"
created: 2026-11-20
---
# Open Questions

| # | Pertanyaan | Ditanyakan ke | Konteks | Status |
|---|---|---|---|---|
| 1 | Sisa XP saat Recovery XP melewati 500: dibawa ke progres berikutnya, atau kembali ke 0 dan sisa hilang? Satu aktivitas (mis. submission) bisa memberi ratusan XP. | Product / Gamifikasi | [[ADR-004 Model Recovery XP]] | **Terjawab 2026-11-20** (PRD US-1.2): sisa dibawa selama kuota di bawah 3; satu aktivitas bisa memberi beberapa recovery sekaligus; sisa dari aktivitas yang membuat kuota mencapai 3 dibuang |
| 2 | Saat kuota 3/3, Recovery XP tetap berjalan dan kembali ke 0 di 500 dengan tulisan "Recovery penuh". Perlu divalidasi setelah dibuat. | Product, UI/UX | [[ADR-004 Model Recovery XP]] | **Terjawab 2026-11-20**: ikuti PRD. XP saat kuota 3 tidak disimpan, bar diam di 0 dengan tulisan "Recovery penuh" |
| 3 | Pilihan wajib di dashboard dan halaman lain (selain classroom yang wajib). Tim UI/UX sudah mendesain icon streak recovery di todo [[https://app.basecamp.com/5135326/buckets/25593983/todos/10516404883\|[UX] Daily Streak Icon]] (deadline 27/11/2026). | UI/UX | [[ADR-003 Mekanisme Pilihan Wajib Recovery atau Reset]] | Terbuka |