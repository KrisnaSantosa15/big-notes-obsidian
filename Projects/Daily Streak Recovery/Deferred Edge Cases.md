---
project: "[[PRD Daily Streak Recovery]]"
created: 2026-11-20
---
# Deferred Edge Cases

Edge case dari PRD yang tidak dikerjakan di implementasi awal. Dicatat supaya bisa diambil nanti bila memungkinkan.

## Event aktivitas terlambat diproses mengembalikan kuota

Sumber: PRD §7, baris "Event aktivitas terlambat diproses".

PRD: aktivitas dicatat berdasarkan waktu terjadinya. Jika ternyata terjadi pada hari yang sudah dilindungi Streak Recovery, recovery dikembalikan ke kuota.

Kenapa ditunda:

- Bertentangan dengan US-2.2 bahwa pilihan pakai recovery atau reset bersifat final.
- Listener streak saat ini memakai `Carbon::now()` saat event diproses, bukan waktu kejadian, jadi mekanisme "waktu terjadinya" belum ada.

Kalau mau dikerjakan: listener perlu membawa tanggal kejadian dari event, lalu ada transaksi ledger baru dengan sumber `refund` yang mengubah hari terlindungi menjadi hari aktif.
