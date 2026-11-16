---
date: 2026-11-16
updated: 2026-11-16
type: project
status: active
tags: [project, dicoding, apd, feedback]
related-people: ["[[People/Krisna]]"]
---

# Feedback Demo APD Fase 1

Demo 13 Nov 2026, hanya item milik Krisna. Sumber: [Demo APD (Google Doc)](https://docs.google.com/document/d/1csq9azd1xwRDtc3BJ63XrIyjKHDv-AMXllrOLHWU0Zw/edit?tab=t.0)

## Checklist

**Sudah ada card**

- [ ] Email pakai select2 → [Email autocomplete in the add-participant form](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257720)
- [ ] Bulk remove student, >100 withdraw/terminated → [Ops edits a campaign participant](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10493257711) (card baru single remove, perluas ke bulk)

**Tanpa card**

- [x] Ganti narasi "import mapping" jadi "Import supervised students" → [#6319](https://github.com/dicoding-dev/dicoding/pull/6319)
- [x] Link [APD Import Template](https://docs.google.com/spreadsheets/d/1fdLxbSePC0NVPFcL-03uwleyKDoj0nIKNKuQc1PRPNU/edit?usp=sharing) di dialog import
- [x] Bulk assign/unassign lecturer → bulk assign lewat dialog Add students, bulk remove di [#6301](https://github.com/dicoding-dev/dicoding/pull/6301)
- [ ] CSV student terima kolom group → sepakati dulu dengan Alfian
- [x] Diskusi UI/UX flow sync peserta dan mapping lecturer
- [x] Program tanpa APD ikut tersync? Tidak: enrollment gagal `CAMPAIGN_NOT_FOUND` kalau program belum punya campaign

## Hasil diskusi UI/UX

**Narasi**

- [ ] Students: "Import CSV" → "Import students"
- [x] Lecturers: "Import mappings" → "Import supervised students" ([#6319](https://github.com/dicoding-dev/dicoding/pull/6319))
- [x] Manage students lecturer: "Unmap from lecturer" → "Remove" ([#6301](https://github.com/dicoding-dev/dicoding/pull/6301))
- [ ] Modal remove student: tombol "Remove" jadi outline (putih), "Cancel" jadi "Keep" (hitam) ([#6301](https://github.com/dicoding-dev/dicoding/pull/6301)) → ditunda, modal APD lain belum ada yang dibalik (Cancel outline, konfirmasi solid)

**Layout header (Students, Lecturers, Manage students)**: ditunda, layout tombol tetap seperti sekarang

- [ ] Baris heading hanya berisi judul
- [ ] Baris kedua: search pendek (ikon kaca pembesar di dalam input), lalu dropdown category dan jumlah row
- [ ] Di baris yang sama, rata kanan: total ("50 students"), Sync students, Import students, Add student

## Keputusan desain

1. **Bulk remove = remove access**: isi `accessible_until = now` (atau `removed_at`), bukan hapus baris atau ganti kategori. Data tetap ada dan bisa dipulihkan. Bulk lewat checkbox + CSV `email`.
2. **Autocomplete**: endpoint search user khusus admin (nama + email, ada limit) + komponen `UserCombobox` yang bisa dipakai ulang.
3. **CSV group**: kolom `group` opsional di CSV student, diteruskan ke use case group assignment yang sudah ada.

## Pertanyaan ke Ops

- [ ] Student terminated kehilangan akses total, atau masih boleh lihat dokumen/sertifikat?
- [ ] Field peserta apa saja yang boleh diedit? Student ID termasuk?

## Urutan kerja

1. Narasi "Remove" (#6301), lalu narasi di #6319
2. Bulk assign/unassign lecturer
3. Card Email autocomplete
4. Card Ops edits participant + bulk remove access

## References

- [Demo APD (feedback)](https://docs.google.com/document/d/1csq9azd1xwRDtc3BJ63XrIyjKHDv-AMXllrOLHWU0Zw/edit?tab=t.0)
- [Revamp APD Dev x Ops (chat)](https://chat.google.com/room/AAQA-2ovAzM/uvZcPKPx8DE/uvZcPKPx8DE?cls=10)
- [Basecamp board Revamp APD](https://app.basecamp.com/5135326/buckets/44666023/card_tables/10277335621)
- Stack card [4]: [#6299](https://github.com/dicoding-dev/dicoding/pull/6299), [#6301](https://github.com/dicoding-dev/dicoding/pull/6301), [#6302](https://github.com/dicoding-dev/dicoding/pull/6302), [#6303](https://github.com/dicoding-dev/dicoding/pull/6303), [#6319](https://github.com/dicoding-dev/dicoding/pull/6319)
- Repo: `docs/domains/academic-program-dashboard/implementation-backlog.md`, `PRD Revamp APD.md`
