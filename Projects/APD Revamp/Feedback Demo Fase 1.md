---
date: 2026-11-16
updated: 2026-11-16
type: project
status: active
tags: [project, dicoding, apd, feedback]
related-people: ["[[People/Krisna]]"]
---

# Feedback Demo APD Fase 1

Demo 13 Nov 2026. Sumber: [Demo APD (Google Doc)](https://docs.google.com/document/d/1csq9azd1xwRDtc3BJ63XrIyjKHDv-AMXllrOLHWU0Zw/edit?tab=t.0)

## Feedback yang sama dengan card

| Feedback | Card |
| --- | --- |
| Email pakai select2 (Krisna), autocomplete di tambah kontributor (Hasbi) | [Email autocomplete in the add-participant form](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257720) |
| Bulk remove student, >100 withdraw/terminated (Krisna, Desi) | [Ops edits a campaign participant](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711) (baru single remove) |
| Ganti kategori jadi withdraw | [Ops manages Students' progress status](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257815) (status WITHDRAW) |
| Form weekly cukup pilih grup, fasil otomatis; sembunyikan fasil yang tidak dimapping | [Map Facilitators to groups](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894512) |
| Invite Google Calendar otomatis | [Automatic calendar invites](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894961) |
| Progress kelas dan kehadiran (demo awal Des) | [Students see learning progress](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257746), [attendance](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257792), [course progress](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257784) |
| Bulk tambah kontributor (Fikri) | [Add Facilitators, Lecturers, Instructors](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894097) (Alfian) |
| Grup + cohort sekaligus via CSV (Wintari) vs dipisah (Alfian, Hasbi) | [Assign participants to groups](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894227) (Alfian) |
| Bulk reschedule, n8n, link Sheets langsung | [Bulk upload schedule](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10411894886) (Ikhlas), [#6404](https://github.com/dicoding-dev/dicoding/pull/6404) |

## Feedback tanpa card

Legenda: 🟢 bisa kita kerjakan, 🟡 butuh keputusan dulu, ⚪ milik tim lain

- [ ] 🟢 Ganti narasi "import mapping" (Krisna) → [#6319](https://github.com/dicoding-dev/dicoding/pull/6319)
- [ ] 🟢 Link template import di dialog import (Krisna) → [APD Import Template](https://docs.google.com/spreadsheets/d/1fdLxbSePC0NVPFcL-03uwleyKDoj0nIKNKuQc1PRPNU/edit?usp=sharing)
- [ ] 🟢 Bulk assign/unassign lecturer (Krisna) → masih scope card [4]
- [ ] 🟡 CSV student terima kolom group (Krisna, Wintari) → putuskan dengan Alfian
- [ ] 🟡 Diskusi UI/UX flow sync peserta dan mapping lecturer (Krisna)
- [ ] 🟡 Lecturer/kontributor tanpa akun Dicoding (Desi, Fikri) → tunggu alur login lecturer
- [ ] 🟡 Fitur per kategori, misal guru SMK tanpa poin (Desi)
- [ ] 🟡 Whitelist `operational@` dari batas multi-login (Wintari)
- [ ] ⚪ Modal vs Dialog (Alfian) → halaman kita sudah pakai `ui/modal`, sisa `group-list` dan `contributor-list`
- [ ] ⚪ Upload dan tambah grup dipisah (Hasbi) → Alfian
- [ ] ⚪ Menu contributor di bawah participants (Hasbi) → Alfian
- [ ] ⚪ Jenis jadwal lain: technical briefing, team meeting, tech hour (Desi, Haya) → Ikhlas
- [ ] ⚪ Admin membuat akun Dicoding untuk PoP (Fikri) → sementara manual oleh engineer
- [ ] ⚪ Normalisasi data jurusan (Wintari) → standarisasi nanti (Kevin)

## Item Krisna

Item tanpa card sudah masuk checklist di atas. Sisanya:

- [ ] Email pakai select2 → card autocomplete
- [ ] Bulk remove student → brainstorm no. 1
- [x] Program tanpa APD ikut tersync? Tidak: enrollment gagal `CAMPAIGN_NOT_FOUND` kalau program belum punya campaign

## Brainstorm

1. **Bulk remove = remove access**, bukan hapus baris atau ganti kategori. Isi `accessible_until = now` (atau `removed_at`): data tetap ada, bisa dipulihkan, gate role cukup cek periode. Bulk lewat checkbox + CSV `email`. Masuk card "Ops edits a campaign participant".
2. **Autocomplete satu kali pakai dua tempat**: satu endpoint search user (admin only, nama + email, limit) dan satu `UserCombobox`, dipakai di dialog peserta dan kontributor.
3. **CSV grup**: CSV student terima `group` opsional, diteruskan ke use case group assignment Alfian. CSV assign grup tetap ada untuk perubahan.
4. **Lecturer tanpa akun Dicoding**: bentrok dengan model `user_id` di access list. Tunggu keputusan alur login lecturer.

## Pertanyaan ke Ops

- Student terminated kehilangan akses total, atau masih boleh lihat dokumen/sertifikat?
- Field peserta apa saja yang boleh diedit?
- Student ID ikut bisa diedit?

## Urutan kerja

1. Narasi + template di [#6319](https://github.com/dicoding-dev/dicoding/pull/6319)
2. Bulk assign/unassign lecturer
3. Card Email autocomplete
4. Card Ops edits participant + bulk remove access

## References

- [Demo APD (feedback)](https://docs.google.com/document/d/1csq9azd1xwRDtc3BJ63XrIyjKHDv-AMXllrOLHWU0Zw/edit?tab=t.0)
- [Notes - APD Discussion - Contributor](https://docs.google.com/document/d/1Ue0wh7ivrqSjHjm6B4v9NETPr8-2EsnpMQ3hGgsLa1Q/edit?tab=t.0#heading=h.y1au6mf6pm63)
- [Revamp APD Dev x Ops (chat)](https://chat.google.com/room/AAQA-2ovAzM/uvZcPKPx8DE/uvZcPKPx8DE?cls=10)
- [Basecamp board Revamp APD](https://app.basecamp.com/5135326/buckets/44666023/card_tables/10277335621)
- Stack card [4]: [#6299](https://github.com/dicoding-dev/dicoding/pull/6299), [#6301](https://github.com/dicoding-dev/dicoding/pull/6301), [#6302](https://github.com/dicoding-dev/dicoding/pull/6302), [#6303](https://github.com/dicoding-dev/dicoding/pull/6303), [#6319](https://github.com/dicoding-dev/dicoding/pull/6319)
- Repo: `docs/domains/academic-program-dashboard/implementation-backlog.md`, `PRD Revamp APD.md`
