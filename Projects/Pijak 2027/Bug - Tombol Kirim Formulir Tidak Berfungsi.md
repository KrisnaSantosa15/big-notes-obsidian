---
tags: [pijak-2027, bug, registration, frontend]
date: 2026-11-20
status: root-cause-confirmed
---

# Bug: Tombol "Kirim formulir" Step 1 Tidak Berfungsi

## Laporan

- 1 pendaftar (danendraalvyn@gmail.com) melapor tombol "Kirim formulir" di Step 1 registrasi tidak berfungsi.
- Sudah coba hapus cache, ganti browser, ganti device: tetap gagal.
- Dari video, data sudah lengkap dan tombol tidak disabled, tapi klik tidak memunculkan apa pun.
- Production aman untuk pendaftar lain.

## Root cause (terkonfirmasi)

Nilai field **Instansi** (`institution`) atau **Nama Sekolah/Kampus/Institusi pendidikan terakhir** (`last_education_institution`) mengandung tanda kutip ganda `"`. Terkonfirmasi ada `"` di data ybs.

Alur di `frontend/src/pages/campaigns/pijak/registration-modals.ts`:

1. Baris 104: `e.preventDefault()` membatalkan submit bawaan.
2. `validateForm()` lolos (data memang lengkap).
3. Baris 142-144 saat membangun preview modal:
   ```ts
   const fieldEl = form.querySelector(`[name="${rawKey}"]`);
   if (fieldEl?.tagName === 'SELECT') {
     const selectedOption = fieldEl.querySelector(`option[value="${value}"]`);
   ```
   Value user masuk mentah ke CSS selector. Kalau ada `"` atau `\`, `querySelector` melempar `SyntaxError`.
4. Exception tidak ditangkap, jadi `$('#confirmationModal').modal('show')` tidak pernah jalan. Submit bawaan sudah dibatalkan, jadi tombol terlihat mati.

Dibuktikan via jsdom:

```
OK    SMA Negeri 1
THROW SMK "Bina Bangsa" -> SyntaxError
THROW PT ABC\          -> SyntaxError
OK    Univ 'Xyz'
```

### Kenapa field Instansi yang kena

`institution-input.blade.php` merender select SMA/SMK lebih dulu, lalu select kampus, lalu text input, semuanya dengan `name` yang sama. `form.querySelector('[name="institution"]')` selalu mengembalikan select pertama (`tagName === 'SELECT'`), walaupun user mengisi lewat text input. Jadi teks bebas berisi kutip langsung memicu crash.

### Kenapa ganti browser/device tidak membantu

Draft disimpan di server lewat autosave (`campaign_initial_registrations.form_data`, filter `user_id` + `program_id` Pijak, `deleted_at IS NULL`) dan terisi ulang di device mana pun.

## Workaround untuk user

Hapus tanda kutip `"` (dan backslash `\`) di kolom Instansi / Nama Sekolah terakhir, tunggu sekitar 1 detik agar autosave jalan, lalu klik "Kirim formulir" lagi.

Kalau kutip berasal dari pilihan dropdown (nama institusi di master data), user tidak bisa memperbaiki sendiri: perlu koreksi draft langsung di DB atau tunggu fix kode.

## Rencana fix (belum dikerjakan)

1. TDD: test vitest dulu untuk value yang mengandung `"`.
2. Ganti lookup jadi `Array.from(select.options).find((o) => o.value === value)` (atau `CSS.escape(value)`).
3. Ambil hanya elemen aktif: `[name="..."]:not(:disabled)`, supaya label preview diambil dari input yang benar-benar dipakai.

## Pola sama di form lain (belum dicek apakah bisa menerima teks bebas berkutip)

- `frontend/src/pages/campaigns/pijak-flash/registration-modals.js:129`
- `frontend/src/pages/campaigns/aicamp/registration-modals.js:180`
- `frontend/src/pages/campaigns/elevate/registration-modals.ts:172`
- `frontend/src/pages/campaigns/ibm/registration-modals.js:139`
- `frontend/src/pages/campaigns/tempa/controllers/TempaRegistrationFormController.ts:543, 557`
- `frontend/src/pages/campaigns/asah/re-register-form.ts:425`

## Kemungkinan lain yang sempat dipertimbangkan

- `timezone` kosong karena kolom `timezone` kota di DB kosong (hanya track Intensive). Dicoret karena kasus ini menampilkan error merah + scroll, tidak diam.
- Gagal server-side (mis. auto-redeem token): dicoret karena akan muncul toast `warning_message`, dan email non-verified sudah diblok di `PijakRegistrationIndexAction`.
