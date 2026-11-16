---
date: 2026-11-11
updated: 2026-11-11
type: handoff
tags: [handoff, dicoding, pijak2027]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Handoff Pijak 2027: migrasi route `pijak2027` ke `pijak` dan config production launch

Ditulis 2026-11-05. Pendaftaran Pijak 2027 dibuka **2026-11-12 00:00** (`registration_opened_at`). Backlog lengkap ada di
[docs/domains/pijak2027/implementation-backlog.md](../../domains/pijak2027/implementation-backlog.md). Card Basecamp launch:
[10417267880](https://app.basecamp.com/5135326/buckets/44666023/card_tables/cards/10417267880).

> **Status 2026-11-11: selesai.** PR 1 merged sebagai [#6330](https://github.com/dicoding-dev/dicoding/pull/6330) (2026-11-09) dan
> PR 2 sebagai [#6369](https://github.com/dicoding-dev/dicoding/pull/6369) (2026-11-10). Berbeda dari keputusan di bawah, middleware
> grup `/pijak` akhirnya memakai **`features:pijak`**, bukan `features:pijak2027` (commit `f8cac950ddc`), dan `program_id`
> production adalah **2304**. Sisa pekerjaan launch dicatat di blok "Pembaruan 2026-11-11" di
> [implementation-backlog.md](../../domains/pijak2027/implementation-backlog.md).

## Keputusan (Krisna, 2026-11-05)

Pekerjaan dipecah menjadi **dua PR terpisah**:

| | PR 1: Migrasi route | PR 2: Config production launch |
|---|---|---|
| Isi | Perubahan kode route, nama route, URL hardcode, redirect | Hanya nilai di `config/scholarships.php` blok `pijak` |
| Kapan | Dikerjakan duluan, semua keputusan sudah ada | Dibuka dengan nilai yang sudah pasti, diperbarui saat data masuk, merge menjelang 12 Nov |
| Alasan dipisah | Tidak perlu menunggu data Ops, bisa direview dan dites lebih awal | Nilai bergantung pada Ops, tim Bitt, infra; tanpa logika baru |

Keputusan untuk PR 1:

- **Pijak Flash:** `app/routes/pijak_flash.php` cukup **berhenti dimuat** (comment `require` di `app/routes.php`, sama seperti
  `pijak.php` lama). Kode action/view `PijakFlash` dibiarkan; penghapusan kalau perlu di PR terpisah.
- **Nama route:** **rename `pijak2027.*` menjadi `pijak.*`** supaya sama dengan URL akhir.
- **Middleware:** grup `/pijak` memakai **`features:pijak2027`** (keputusan item 41, #6170). Flag `pijak2027` harus aktif global di
  production saat launch.
- Kerjakan dengan TDD, branch baru dari master terbaru, jangan commit sebelum diminta.

## PR 1: kondisi kode sekarang (dicek 2026-11-05 di master)

- `app/routes.php`:
  - baris 12 `//require __DIR__ . '/routes/pijak.php';` (route IBM/Pijak lama, sudah tidak dimuat)
  - baris 13 `require __DIR__ . '/routes/pijak_flash.php';` (aktif, menguasai `/pijak/*`, nama `pijak.*`, middleware `pijak`
    = `PijakRouteFilter`)
  - baris 14 `require __DIR__ . '/routes/pijak_2027.php';` (aktif, prefix `pijak2027`, nama `pijak2027.*`, middleware
    `features:pijak2027`, ada `@todo` di baris 2 bahwa file ini akan menggantikan `pijak.php`)
- Route di `pijak_flash.php` yang **harus ikut dipindah ke grup 2027** karena dipakai Pijak 2027:
  - `GET /pijak` `FramerProxyAction`, `framer_page_path => 'pijak'`, `favicon_path => 'img/pijak/favicon.ico'`, nama
    `pijak.index` (dipakai navbar Pijak 2027 sejak #6285)
  - `GET /pijak/referral` `FramerProxyAction`, `framer_page_path => 'pijak/referral'`, nama `pijak.referral.index`
- Route 2027 yang ada (semua harus jadi `/pijak/...` dan `pijak.*`): registration (GET/POST), registration/twibbon,
  registration/administration (GET/POST), registration/administration/commitment-letter, registration/announcement,
  registration/announcement/reoffer, registration/bitt-learning, leaderboard, registration/cohort.
- Nama `pijak2027.*` dipakai di sekitar **30 file** di luar `app/routes/` (action, view, mailer, test). Cari dengan
  `grep -rln "pijak2027\.\(registration\|referral\)" Dicoding app frontend/src`.
- URL hardcode yang harus diganti:
  - `frontend/src/pages/campaigns/pijak/registration-form.ts:196` `fetch('/pijak2027/registration', ...)` (perlu rebuild bundle)
  - `config/scholarships.php:10` `'base_url' => 'https://dicoding.com/pijak2027/registration'`
  - String `pijak2027` lain di test (`twibbonize.com/pijak2027test`, `instagram.com/p/pijak2027`) hanya data contoh, tidak perlu diubah.
- **Redirect 301** `/pijak2027/*` ke `/pijak/*` dengan query string, karena link `?ref=` yang sudah dibagikan dan link di email
  yang terkirim sebelum cutover masih ke `/pijak2027/...` (Notes Sync 14 Okt, backlog item 2).
- Jangan jalankan `PijakUpdateFinalSelectionResultCommand` di production: command lama itu menyalakan flag
  `pijak-final-selection-result` untuk semua orang.
- Setelah edit `app/routes.php`, jika route baru "Route not defined" di lokal, restart container `dicoding-web-1` (opcache route
  cache), bukan `appcache:clear`.

## PR 2: isi config production (`config/scholarships.php` blok `pijak`)

| Key | Nilai | Status |
|---|---|---|
| `facilitator_group_link_format` | `https://dicoding.id/p27-gr-%d` (sekarang `https://dicoding.id/group-whatsapp-%d`) | **Pasti**, dipakai `DeveloperWasRegisteredToPijakMailer.php:80`. Test memakai format sendiri, tidak terpengaruh |
| `facilitator_user_ids` | sekarang `[]` | Menunggu sheet fasil dari Ops dan keputusan apakah nama akun Dicoding boleh dipakai (backlog item 47) |
| `facilitator_mentee_quota` | master `1000`, staging `10` | Konfirmasi kuota per fasil di production |
| `bitt.login_url` (dan ID kelas 99, 85 jika beda) | masih `https://bitt-webapp-sbx.dicoding.space/...` (sandbox) | Tanya tim Bitt/Deden. AI Camp sudah ke `bitt.id` lewat #6324 (backlog item 48) |
| `export_google_sheets_id` | `1ix2Y1KI11sQgprlrq9U1po14sZm9TXwX5b0irHPhCDY` | Pastikan ini sheet production |
| Course production | Tes Seleksi 887; Progresif 862, 867, 753, 123 | Verifikasi id production. **Kurikulum Intensif belum dicari** |

Di luar config tapi bagian launch (card 10417267880): row `partner_programs` program 2250 di production, dan jadwal infra (export
07.00 dan 14.00 WIB didahului `campaigns:exams:calculate-results pijak`, `scholarships:pijak:remind-cohort-form` tiap jam).

## Konteks lain dari sesi 2026-11-05

- **`staging/pijak2027` vs master:** staging hanya punya 4 commit config UAT (2026-10-28): `registration_opened_at`
  `2026-10-12`, `token_packages[1].course_ids` `[630]`, `facilitator_user_ids` `[3171219, 3171220, 3171221]`,
  `facilitator_mentee_quota` `10`. Master punya 35 commit yang belum ada di staging (antara lain #6285, #6286, #6290, #6304,
  #6326), jadi staging belum memuat UAT 2, kelas Bitt, dan perbaikan offering.
- **PR open:** [#6326](https://github.com/dicoding-dev/dicoding/pull/6326) perbaikan kirim offering dari halaman admin React
  (backlog item 49, risk low) dan [#6321](https://github.com/dicoding-dev/dicoding/pull/6321) leaderboard (Deden, draft).
  Setelah #6326 merge, cek apakah flag `offering_dashboard_react` aktif di production.
- **Lokal:** sejak #6313 `config/app.php` membaca `APP_KEY` dari env; `.env` lokal sudah diberi `APP_KEY` dengan nilai lama.
- **Masih terbuka di luar dua PR ini:** halaman Framer Landing/Referral/Story dan route `/pijak/twibbon` (menunggu Leo, item 34),
  Preview/edit LoA (tanya Dimas Saputra, item 29), Wave 2 sebelum Feb 2027 (item 33), dashboard Metabase (item 23), dan
  merapikan card Basecamp yang PR-nya sudah merge.
