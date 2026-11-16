---
date: 2026-10-13
updated: 2026-10-13
type: plan
tags: [plan, backlog, dicoding, daily-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# PR #5453 (`feature/monthly-add-ons/upgrade-modal-ui`) — Breakdown Task

Review [PR #5453](https://github.com/dicoding-dev/dicoding/pull/5453) menghasilkan 12 thread review.
Dokumen ini membagi mana yang harus selesai **sebelum PR ini merge** vs. yang secara eksplisit
di-defer ke **next PR**. Akan usang begitu diff final PR ini merge — update atau hapus setelah PR ini
ditutup.

## PR ini — perlu perubahan kode

| # | Item | Yang harus dikerjakan |
|---|---|---|
| 1 | **Sabak tidak pernah dimuat di halaman tutorial** (`Dicoding/Web/Http/Academies/Tutorial/AcademyTutorialShowAction.php:75`, `app/views/ui/v4/academytutorials/widgets/daily-add-ons/upgrade-premium-modal.blade.php:9,50`) | Buat `upgrade-premium-modal.blade.php` menerima parameter `addOnType` dan load config sendiri (`Config::getConfig("daily_add_on_configs.$addOnType")`), bukan menerima `$daily_add_on_plan` dari `DailyAddOnPurchaseViewModel` yang di-Action hardcode ke `student-chatbot`. Ini juga menghilangkan kebutuhan null-coalesce `?? 'student-chatbot'` di line 50 — type selalu explicit begitu dilewatkan sebagai parameter. |
| 2 | **Pindahkan checkout UI dari v3 ke v4** (`app/views/ui/v3/subscriptions/purchases/checkout/daily_add_ons.blade.php:1`) | Sesuai keputusan: pindahkan blade checkout dari `app/views/ui/v3/subscriptions/purchases/checkout/` ke folder baru di bawah v4 (mengikuti lokasi UI add-on lain yang sudah ada — `app/views/ui/v4/academytutorials/widgets/daily-add-ons/`). Update route registration (`daily_add_ons.checkout.index`) supaya menunjuk ke path view yang baru. |
| 3 | **Lokasi import style ikut pindah** (`frontend/src/pages/student-chatbot/style.scss:1558`) | Bagian dari #2 — begitu blade pindah ke v4, hentikan bundling `@import '@/pages/daily-add-ons/style'` lewat `student-chatbot/style.scss`; import langsung di scope v4 yang baru. |
| 4 | **Extract variabel hitungan ke method ViewModel** (`daily_add_ons.blade.php:4-6`) | Pindahkan `$addOn = $purchaseVM->getAddOnByType(...)`, `$hasSinglePackage`, `$defaultPackage` dari PHP inline di blade jadi satu method di `DailyAddOnPurchaseViewModel` (mis. `getCurrentAddOn()`). Mekanikal, tidak butuh diskusi. |
| 5 | **Flatten folder controller.ts** (`frontend/src/pages/daily-add-ons/upgrade-modal/controller.ts`) | Pindah ke `frontend/src/pages/daily-add-ons/upgrade-modal-controller.ts` — hapus subdirectory `upgrade-modal/`. Mekanikal. |
| 6 | **Rename folder docs domain** (`docs/domains/monthly-add-ons/` → `docs/domains/daily-add-ons/`) | Sesuai Alexz: kerjakan terakhir, tepat sebelum merge. Sekalian benerin penamaan "Monthly" yang masih stale di `context.md`/`prd.md`/`technical-addendum.md`/ADR-0001–0006 supaya sesuai kode aktual yang sudah pakai prefix `Daily` (lihat catatan penamaan di `specs/post-payment-follow-ups.md`, sudah ditulis pakai penamaan yang benar). |
| 9 | **Pindahkan `description`/`benefits` ke dalam `packages`** (`app/config/daily_add_on_configs.php:13-17`) | Sekarang `description`/`benefits` ada di level add-on-type (berlaku untuk semua package tipe itu). Pindahkan ke dalam masing-masing entry `packages[days]`. Berdampak ke: `DailyAddOnPurchaseViewModel::loadAddOns()`/`mapPackages()` (baca field per-package, bukan per-type), `daily_add_ons.blade.php` (`{{{ $addOn->benefits }}}` → per-package), dan `upgrade-premium-modal.blade.php` (`{{{ $daily_add_on_plan->description }}}` → per-package). Putuskan sekarang, sebelum merge — lebih murah daripada migrasi schema belakangan karena kode pembacanya masih fresh di PR ini. |

## Next PR — sudah eksplisit di-defer

| # | Item | Kenapa di-defer |
|---|---|---|
| 7 | **Konfirmasi package 1-hari sabak sudah tertangani** (`daily_add_ons.blade.php:5`) | Tidak perlu ubah kode hari ini (`hasSinglePackage` sudah `false` untuk sabak, jadi jatuh ke branch radio-picker yang sudah ada) — tapi direvisit bareng #10 di bawah karena sama-sama menyentuh code path seleksi multi-package/`days`. |
| 8 | **Guard `hasSinglePackage` sebelum `Form::hidden('days', ...)`** (`daily_add_ons.blade.php:104-106`) | Sudah dijawab di review (guard ini menghindari duplikat input `name="days"` yang bentrok dengan radio picker) — tapi akan tergantikan begitu #10 selesai, karena `days` nantinya tidak akan dipercaya dari form input sama sekali. |
| 10 | **Jangan percaya `days` dari form hidden input** | Security: spec pembelian harus validasi/derive `days` dari `daily_add_on_configs`, bukan dari data form yang dikirim client — input client rawan dimanipulasi. |
| 11 | **Checkout bisa diakses guest vs harus login** | Keputusan produk: apakah checkout add-on bisa diakses sebelum login (trigger dari pricing page publik), atau hanya bisa diakses saat sudah login (trigger dari classroom)? Belum diputuskan.<br><br>**Penyebab saat ini** (dicek langsung di kode): `Route::get('daily-add-ons/{type}/checkout', ...)` (`app/routes.php:3910`) didaftarkan di dalam `Route::group(['before' => ['auth', 'mfa_enforcement']], ...)` (buka `:1004`, tutup `:5480`), makanya selalu redirect ke login. `subscriptions/{id}/checkout` (`:5534`) didaftarkan **setelah** group itu tutup, jadi guest-accessible. Bukan keputusan sengaja di level Action — baik `DailyAddOnCheckoutIndexAction` maupun `SubscriptionCheckoutCreateAction` sama-sama tidak punya pengecekan auth sendiri, murni soal posisi registrasi route.<br><br>**Kalau diputuskan boleh guest:** pindahkan route `daily-add-ons/{type}/checkout` keluar dari group `auth`/`mfa_enforcement` itu, taruh di luar blok yang sama seperti `subscriptions/{id}/checkout`. Tidak perlu ubah Action apapun. |
| 12 | **Standarisasi design system** (`frontend/src/pages/daily-add-ons/style.scss`) | Alexz: "gpp dulu, refactor next time" — juga masih terhambat konfirmasi dari @ullyindr soal apakah style Figma-nya sudah ada di design system bersama. |

## Urutan kerja yang disarankan untuk PR ini

**1 → 2 (+3) → 9 → 4 → 5 → 6**, lalu minta review ulang. #9 didahulukan sebelum #4 karena method
ViewModel yang diextract di #4 sebaiknya sudah membaca struktur config yang benar (per-package) dari
#9, bukan ditulis sekali lalu dirombak lagi setelahnya.
