---
date: 2026-10-13
updated: 2026-10-13
type: spec
tags: [spec, dicoding, daily-add-ons]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Daily Add-On Token Redemption — Implementation Plan
claude --resume 1424b7de-b933-44b4-a815-0fd7ec78e96f

Tambah 1 tipe token baru ke `/tokens/activation` (`Dicoding\Web\Http\Tokens\TokenActivationAction`) supaya token
aktivasi daily add-on (Sabak, Student-Chatbot) bisa diredeem lewat halaman yang sama seperti token kelas satuan,
token multi-kelas, dan token subscription — tanpa bikin halaman/flow baru. Fitur ini juga menambahkan admin surface
penuh (generate, listing, edit, export) untuk token daily add-on, mengikuti pola yang sudah ada di token subscription.

## Kondisi sekarang (referensi)

- **Dispatcher token**: `TokenActivationAction::findOutTokenType()` mencoba token ke gateway satu-per-satu
  (`CourseInvitationTokenGateway` → `MultiCourseTokensGateway` → `SubscriptionTokenGateway`), yang pertama nemu
  menentukan tipe. Tipe didefinisikan di `AcademyTokenType` (`Dicoding\Domain\DeveloperJourney\Commons\Enums`) —
  enum ini sudah lintas bounded-context (dipakai juga untuk `SUBSCRIPTION_TOKEN` yang domainnya beda dari
  `DeveloperJourney`), jadi menambah 1 case lagi untuk daily add-on konsisten dengan pola yang sudah ada.
- **Response setelah redeem juga branch by token type**: `TokenActivationResponse::with()` redirect ke halaman
  berbeda per `token_type` (`SINGLE_COURSE_TOKEN` → halaman course, `SUBSCRIPTION_TOKEN` → `subscriptions.my`,
  lainnya → `dashboard`). File ini di luar `TokenActivationAction` tapi wajib disentuh juga, gampang kelewat kalau
  cuma baca dispatcher-nya.
- **Entitlement daily add-on** disimpan per `(user_id, add_on_type)` — satu baris per kombinasi, dibaca lewat
  `CurrentAddOnGateway::findByUserAndType()` di `DailyAddOnEntitlementRepository::createAggregate()`.
- **Operasi inti yang generik**: `DailyAddOnEntitlement::grant(int $days)`
  (`Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnEntitlement.php:22`) — extend `expires_at` dari
  `max(sekarang, expiry lama)`. Method ini sudah dipakai jalur beli (lewat `GrantDailyAddOnEntitlementSpecification`
  setelah settlement Midtrans, dan langsung di `PurchaseDailyAddOnSpecification` saat lunas oleh poin) dan
  **tidak tahu/peduli dari mana pemanggilnya** — titik sambung ini yang harus dipakai ulang oleh jalur token, bukan
  ditulis ulang. Satu pengecualian: saat ini `grant()` juga yang me-`raise()` event `DailyAddOnPurchaseWasCompletelyPaid`
  — lihat "Redesain event `grant()`" di bawah, ini harus diubah supaya jalur token tidak ikut memicu event yang
  namanya menyiratkan pembayaran padahal tidak ada pembayaran.
- **Tidak ada guard "sudah aktif, tidak boleh beli lagi"** di `PurchaseDailyAddOnSpecification` — beli berkali-kali
  memang sengaja menumpuk (stack) durasi lewat `grant()`. Ini bukan perilaku baru yang perlu diputuskan untuk token,
  cukup diwarisi.
- **Event yang di-`raise()` di dalam aggregate tidak otomatis ter-dispatch** — dispatch hanya terjadi kalau
  aggregate dipanggil dari dalam `UseCaseSpecification` lewat `UseCase::run()`/`UseCase::lock()` (lihat
  `docs/domains/monthly-add-ons/adr/0008-manual-entitlement-grant-must-dispatch-domain-events.md`). Karena
  `RedeemDailyAddOnTokenSpecification` di plan ini dipanggil lewat `$this->useCase->run(...)` (sama seperti
  `RedeemSubscriptionTokenSpecification`), ini otomatis aman dari bug yang dijelaskan di ADR itu — event tetap
  ter-dispatch. Yang masih perlu diputuskan bukan soal dispatch-nya, tapi **nama event apa** yang seharusnya
  ter-dispatch (lihat bawah).

## Sisi penerbitan token (issuance) — perbandingan pola yang sudah ada

Yang di atas cuma sisi *pakai* (redeem). Token-token itu sendiri diterbitkan lewat 3 jalur berbeda yang sudah ada
di codebase, jadi sebelum putuskan pola issuance daily add-on, dibandingkan dulu ketiganya:

| Aspek | Single-course (`courseinvitationtokens`) | Multi-course (`multicoursetokens`) | Subscription (`subscriptions/tokens`) |
|---|---|---|---|
| Route + Action | `POST courseinvitationtokens` → `CourseInvitationTokenStoreAction` | `POST multicoursetokens` → `MultiCourseTokensStoreAction` | `POST dashboard/administrations/subscription/tokens` → `SubscriptionTokenStoreAction` |
| UseCase | `CreateInvitationTokenSpecification` | `MultiCourseTokensStoreSpecification` | `CreateSubscriptionTokensSpecification` |
| Aggregate generator | `CourseInvitationTokensGeneration` | `MultiCourseTokensCreation` | `SubscriptionTokenCreator` |
| Siapa yang boleh generate | Admin **atau** org/enterprise owner sendiri (`getOwnerId()`: kalau bukan admin, `owner_id` dipaksa jadi ID sendiri) — self-service lewat `OrganizationTokenIndexAction` | Admin (dipakai tim internal untuk program scholarship/batch) | **Admin-only** — `beforeFilter('admin')` eksplisit di constructor, satu-satunya dari ketiga yang di-gate begitu |
| Bisa auto-redeem saat dibuat? | Tidak | **Ya**, opsional (`is_with_auto_redemption`) — token dibuat lalu langsung diredeem ke `student_ids` yang eligible, tanpa perlu user input token manual | Tidak langsung dari form, tapi ada 2 listener event yang auto-generate (`SubscriptionsEventListener`, `DDCRegistrationEventListener`) |
| Format token | Tidak digenerate manual per-karakter di spec ini (perlu ditelusuri lebih lanjut kalau perlu detail exact) | `Str::random(5) . '-' . Str::random(5)` — random, 2 blok 5-karakter | `$hashids->encode($i)` — Hashids dengan salt unik per batch, bukan random string murni |
| Admin surface | Index, Create, Store, Edit, Export, Resend, Update | Index, Create, Store, Extend, Redemption-date update | **Index, Create (form), Store, Edit (form), Update, Export** (async, dikirim ke email admin) |
| Kompleksitas input form | Sedang (`amounts`, `recipient_emails_csv` opsional untuk kirim langsung ke daftar email) | **Tinggi** — eligibility check per siswa, deadline strict/tidak, auto-redemption, bypass verifikasi email, dst | **Rendah** — cuma `plan_id`, `quantity` (maks 1000), `expired_date`, `description`, `owner_id` |

**Keputusan: pola issuance daily add-on meniru Subscription secara penuh — termasuk admin surface-nya**, bukan
Single/Multi-course, karena:
- Sama-sama admin-only untuk fase awal (tidak ada kebutuhan self-service org untuk daily add-on saat ini).
- Sama-sama tidak butuh auto-redemption/eligibility check per-penerima — daily add-on cuma butuh qty + expiry + owner, tidak ada konsep "batch siswa yang dicek eligible" seperti multi-course token.
- Bentuk datanya paling mirip: `add_on_type` (pengganti `plan_id`), `days` (pengganti implicit `active_days` dari plan), `quantity`, `expired_date`, `description`, `owner_id`.
- **Admin surface-nya juga ditiru penuh** (Index, Create, Edit, Update, Export) — bukan cuma Store. Semua 3 pola
  token yang sudah ada (single-course, multi-course, subscription) punya admin surface lengkap, tidak ada yang
  cuma "Store-only". Kalau daily add-on token cuma dibekali Store, admin tidak punya cara lihat daftar token yang
  sudah dibuat/dipakai atau mengoreksi `expired_date`/`description` yang salah ketik tanpa masuk ke DB langsung —
  ini bukan gap yang bisa ditunda, karena semua sibling-nya sudah menyediakan ini sejak awal.

## Keputusan desain

1. **Tipe token baru**: tambah case `DAILY_ADD_ON_TOKEN` ke `AcademyTokenType`.
2. **Tabel + gateway baru**: `daily_add_on_tokens` (`token`, `add_on_type`, `days`, `description`, `used_by`,
   `used_at`, `owner_id`, `expired_date`, `created_at`, `updated_at`; opsional `org_id` kalau nanti perlu token
   milik organisasi seperti token subscription) + `DailyAddOnTokenGateway` — pola sama dengan `SubscriptionTokenGateway`,
   dipakai bersama oleh sisi create, redeem, **dan admin surface** (index/edit/export).
   - Nama kolom expiry-nya **`expired_date`** (bukan `ends_at` seperti `subscription_tokens`) — dipilih supaya sama
     dengan nama field input yang sudah dipakai di seluruh form issuance/edit token subscription
     (`CreateSubscriptionTokensSpecification`, `EditSubscriptionTokensSpecification` keduanya pakai key
     `expired_date`), biar tidak ada terjemahan nama field ⇄ kolom DB yang perlu diingat-ingat.
3. **UseCase baru** `RedeemDailyAddOnTokenSpecification` — meniru struktur `RedeemSubscriptionTokenSpecification`
   (tanpa lock, karena tidak ada race condition kapasitas seperti enrollment kelas):
   - Validasi profil lengkap dulu (`UserProfileService::hasMemberCompletedTheirProfile()`) — disamakan dengan
     `RedeemSubscriptionTokenSpecification`, bukan karena butuh profil untuk daily add-on secara spesifik, tapi
     supaya konsisten dengan syarat yang sudah berlaku untuk jalur token lain. Kalau produk suatu saat merasa ini
     kebanyakan buat daily add-on, ini keputusan yang mudah dicabut belakangan (baris validasi tunggal), bukan
     sebaliknya (menambah constraint baru setelah token sudah beredar tanpa syarat ini).
   - Validasi token: ditemukan, belum dipakai (`used_by is null`), belum kedaluwarsa (`expired_date`).
   - Tandai token terpakai (`used_by`, `used_at`).
   - Panggil `DailyAddOnEntitlementRepository::createAggregate($userId, $addOnType)` →
     `$entitlement->grant($days)` → `save()` — **wajib lewat repository yang sama dengan jalur beli**, jangan
     bikin jalur baca/tulis `expires_at` kedua.
   - **Tidak** menulis baris baru ke `daily_add_on_purchases` — lihat "Riwayat" di bawah, ini sengaja, bukan lupa.
4. **Redesain event `grant()`** — *(selesai, sudah dibuka sebagai PR #5592 — bukan lagi rencana, keputusan final beda
   dari draf awal di bawah)*. `DailyAddOnEntitlement::grant()` semula yang me-`raise()`
   `DailyAddOnPurchaseWasCompletelyPaid` langsung di dalam aggregate. Draf awal rencananya **memindahkan `raise()`
   keluar dari `grant()` ke caller** (use case) — tapi ini ditolak reviewer: "event apa yang relevan untuk
   perubahan state ini" adalah keputusan aggregate itu sendiri, bukan sesuatu yang boleh didelegasikan ke use case
   yang memanggilnya. PR sempat mengimplementasikan pemindahan ini lalu **di-revert** ke pendekatan yang aggregate
   tetap pegang kendali, hanya dengan tambahan konteks eksplisit soal sumbernya. Desain finalnya:
   - **Enum baru `DailyAddOnGrantSource`** (`Dicoding/Domain/DailyAddOns/Enums/DailyAddOnGrantSource.php`) — baru
     ada 1 case, `PAYMENT`.
   - `DailyAddOnEntitlement` constructor sekarang terima parameter kedua `DailyAddOnGrantSource $source` (readonly
     property), di samping `CurrentDailyAddOn $current`.
   - `grant()` **tetap** yang me-`raise()`, tapi memilih event-nya lewat
     `$this->raise(match ($this->source) { DailyAddOnGrantSource::PAYMENT => new DailyAddOnPurchaseWasCompletelyPaid(...) })`
     — aggregate tetap satu-satunya pihak yang memutuskan event apa yang cocok untuk perubahan state-nya, cuma
     sekarang keputusan itu berbasis sumber eksplisit, bukan hardcoded satu event untuk semua caller.
   - `DailyAddOnEntitlementRepository::createAggregate(int $userId, DailyAddOnType $addOnType, DailyAddOnGrantSource $source)`
     — tambah parameter ketiga, diteruskan ke constructor aggregate.
   - `GrantDailyAddOnEntitlementSpecification` dan `PurchaseDailyAddOnSpecification` (cabang lunas-oleh-poin) pass
     `DailyAddOnGrantSource::PAYMENT` ke `createAggregate()` — **nama & behavior event yang di-raise tidak berubah**
     untuk jalur yang sudah live di produksi.
   - **Implikasi untuk jalur token (PR #7/#8, belum dikerjakan) — keputusan terbuka**: karena `match()` tanpa
     `default` arm akan melempar `UnhandledMatchError` untuk case yang tidak dikenal, `RedeemDailyAddOnTokenSpecification`
     tidak bisa langsung memanggil `grant()` tanpa menyentuh `DailyAddOnGrantSource` lagi. Ini masih perlu diputuskan
     saat mengerjakan PR #7, bukan sesuatu yang sudah beres:
     1. Tambah case baru (misal `DailyAddOnGrantSource::TOKEN_REDEMPTION`) ke enum, dan tambah 1 arm baru di
        `match()` dalam `grant()` yang me-raise event untuk case itu — tapi event apa? Kalau reuse
        `DailyAddOnTokenWasRedeemed` di sini, aggregate token (`DailyAddOnTokenRedemption`, yang juga rencananya
        me-raise event yang sama untuk menandai token terpakai) berpotensi raise event yang sama dua kali dari dua
        aggregate berbeda dalam satu use case — perlu dicek apakah ini masalah (double listener trigger) atau
        memang salah satu sisi yang seharusnya tidak raise.
     2. Atau: `DailyAddOnTokenWasRedeemed` **hanya** di-raise oleh aggregate `DailyAddOnTokenRedemption` (menandai
        token dipakai), dan `grant()` untuk sumber token sengaja tidak raise apa-apa soal entitlement-nya — makna
        "grant source" jadi murni penanda konteks (skip-event marker), bukan pemicu event baru. Ini butuh `grant()`
        berubah dari `$this->raise(match(...))` jadi memanggil `raise()` secara kondisional (hanya untuk arm yang
        punya event), bukan match yang wajib mengembalikan event di semua case.
     - **Efek samping yang saat ini nempel di `DailyAddOnPurchaseWasCompletelyPaid`** (enroll `PremiumFeature` di
       `DailyAddOnEventListener`, email "Add-on Anda telah aktif" di `DailyAddOnEventMailer`) **tetap harus jalan**
       untuk token, terlepas dari opsi mana yang dipilih di atas — tambah `whenDailyAddOnTokenWasRedeemed(...)` di
       kedua listener itu, extract logic yang sama ke private method biar tidak duplikat.
5. **Branch baru** di `TokenActivationAction::findOutTokenType()` + constructor — inject `DailyAddOnTokenGateway`
   dan `RedeemDailyAddOnTokenSpecification`, urutan pengecekan gateway taruh di akhir (paling jarang dipakai).
6. **`TokenActivationResponse::with()` juga perlu branch baru** untuk `DAILY_ADD_ON_TOKEN` — tanpa ini, redirect
   setelah sukses redeem jatuh ke default (`route('dashboard')`), yang tidak error tapi belum tentu UX yang benar.
   Perlu diputuskan mau redirect ke mana (kandidat: halaman status add-on kalau ada, atau tetap `dashboard` sambil
   pesan sukses menyebut nama add-on-nya lewat `success_message`).
7. **View input token tidak berubah** — `app/views/ui/academies/tokens/activation.blade.php` sudah generik, satu
   input token untuk semua tipe. Copy footer-nya ("token beasiswa, voucher fisik kelas satuan..., voucher fisik
   langganan...") opsional ditambah varian daily add-on kalau produk mau token ini disebut eksplisit.
8. **Tidak perlu invoice/Midtrans/settlement webhook** untuk jalur redeem — token redeem langsung short-circuit ke
   `grant()`, sama seperti token subscription yang tidak lewat payment gateway sama sekali.
9. **Issuance meniru Subscription token secara penuh** (lihat tabel perbandingan di atas): admin-only
   (`beforeFilter('admin')`), dengan admin surface lengkap — Index, Create (form), Store, Edit (form), Update,
   Export — bukan cuma Store. Validasi input & bentuk data sama sederhananya dengan
   `CreateSubscriptionTokensSpecification`/`EditSubscriptionTokensSpecification` — tidak perlu eligibility check
   per penerima atau opsi auto-redemption seperti multi-course token.
10. **Quantity max 1000** (bukan "wajar") — disamakan persis dengan `CreateSubscriptionTokensSpecification`
    (`quantity: required|integer|min:1|max:1000`). Tujuannya bukan security boundary, tapi guard rail operasional:
    mencegah admin salah input (misal kelebihan nol) generate ratusan ribu token dalam sekali klik yang membanjiri
    insert batch/export/email. Profil risikonya sama seperti token subscription (sama-sama admin-only, sama-sama
    band token sekali generate), jadi angka cap-nya disamakan juga.
11. **Translation keys baru**, ikut pola `DOMAIN.FEATURE.ERROR_NAME` yang sudah dipakai di domain ini
    (`DAILY_ADD_ON.CHECKOUT.PACKAGE_NOT_FOUND` di `PurchaseDailyAddOnSpecification`):
    - `DAILY_ADD_ON.TOKEN.CREATE.*` — `INVALID_ADD_ON_TYPE`, `INVALID_EXPIRED_DATE`, `LESS_QUANTITY`,
      `OVER_QUANTITY`, `EMPTY_DESCRIPTION`, `LESS_DESCRIPTION`.
    - `DAILY_ADD_ON.TOKEN.EDIT.*` — `EMPTY_ID`, `INVALID_EXPIRED_DATE`, `LESS_DESCRIPTION`.
    - `DAILY_ADD_ON.TOKEN.REDEEM.*` — `TOKEN_NOT_FOUND`, `ALREADY_USED`, `TOKEN_EXPIRED`.
    - Tambahkan entri Bahasa Indonesia yang berpasangan di lang file (ikut convention project — Indonesia sebagai
      bahasa utama untuk terjemahan).

## Riwayat (history) — kenapa redeem token sengaja tidak nambah baris di `daily_add_on_purchases`

Pertanyaan yang sempat muncul: kalau `subscriptions.my` (`MySubscriptionAction`) menampilkan riwayat pembelian
daily add-on (`daily_add_on_purchases`, lewat `DailyAddOnGateway::getAllPurchasesByMember()`), apakah redeem token
juga harus muncul di situ?

**Jawaban: tidak, dan ini konsisten dengan precedent yang sudah ada di token subscription**, bukan gap baru:

- `SubscriptionTokenRedeemingRepository::saveRedeemedTokenSubscription()` — saat token subscription diredeem, cuma
  memanggil `SubscriptionGateway::addActiveSubscriptionPlan()`, yang **hanya update tabel `current_subscription_plans`**
  (current state), **tidak insert baris baru ke `subscription_purchases`** (tabel riwayat). Artinya redeem token
  subscription hari ini pun **tidak muncul** di riwayat pembelian pada `subscriptions.my`.
- Daily add-on token mengikuti pola yang sama persis: `grant()` + `save()` cuma menulis ke `current_add_ons`
  (lewat `CurrentAddOnGateway::upsertExpiry()`), tidak menyentuh `daily_add_on_purchases`.
- Menambahkan baris "purchase" palsu ke `daily_add_on_purchases` demi supaya redeem token terlihat di riwayat
  justru mencemari data itu — baris purchase seharusnya berarti "ada transaksi", lengkap dengan relasi ke
  `payment_invoices`. Token redemption bukan transaksi.
- Kalau ke depannya produk butuh riwayat aktivasi (baik dari beli maupun dari token) yang terpisah dari riwayat
  pembayaran, itu kebutuhan baru yang butuh sumber data baru (misal log aktivasi terpisah) — bukan sesuatu yang
  perlu diselesaikan sekarang, karena token subscription yang sudah lama live pun belum punya ini.

## Race condition pada redeem (double-submit token yang sama)

`RedeemSubscriptionTokenSpecification`/`SubscriptionTokenRedeemingRepository` mengecek `used_by is null` saat baca,
lalu `markAsUsed()` saat tulis — tanpa transaksi/lock atomik di antaranya. Dua request bersamaan (misal double-klik)
secara teori bisa lolos validasi bersamaan sebelum salah satu men-set `used_by`. Ini risiko lama yang sudah
diterima untuk token subscription, dan **diwarisi apa adanya** untuk daily add-on token — tidak menambah
pengaman atomik baru di fitur ini, supaya perilakunya konsisten dan tidak menjadi satu-satunya jalur token yang
beda penanganannya.

## Tasks

| # | Item | File |
|---|---|---|
| 1 | **[PR #0 — selesai, PR #5592]** Tambah enum `DailyAddOnGrantSource`; `DailyAddOnEntitlement::grant()` pilih event lewat `match($this->source)` alih-alih hardcode satu event | `Dicoding/Domain/DailyAddOns/Enums/DailyAddOnGrantSource.php`, `Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnEntitlement.php`, `Dicoding/Domain/DailyAddOns/Repositories/DailyAddOnEntitlementRepository.php`, `Dicoding/UseCases/DailyAddOns/Transactions/GrantDailyAddOnEntitlementSpecification.php`, `Dicoding/UseCases/DailyAddOns/Transactions/PurchaseDailyAddOnSpecification.php` |
| 2 | Migration tabel `daily_add_on_tokens` (`token`, `add_on_type`, `days`, `description`, `used_by`, `used_at`, `owner_id`, `expired_date`, `created_at`, `updated_at`) | migration baru |
| 3 | `DailyAddOnTokenGateway` — `findByToken()`, `markAsUsed()`, `createTokens()`, `updateToken()`, `listingTokenForAdministration()`, `getExportData()` | `Dicoding/Infrastructure/StorageGateways/DailyAddOns/` (baru) |
| 4 | Tambah case `DAILY_ADD_ON_TOKEN` | `Dicoding/Domain/DeveloperJourney/Commons/Enums/AcademyTokenType.php` |
| 5 | Event baru `DailyAddOnTokenWasRedeemed` + listener `whenDailyAddOnTokenWasRedeemed` (enroll premium feature + email aktivasi, extract logic bersama dari handler `DailyAddOnPurchaseWasCompletelyPaid`) | `Dicoding/Domain/DailyAddOns/Events/`, `Dicoding/Infrastructure/GlobalDomainEventHandlers/DailyAddOns/DailyAddOnEventListener.php`, `Dicoding/Infrastructure/Emailing/DailyAddOns/DailyAddOnEventMailer.php` |
| 6 | `RedeemDailyAddOnTokenSpecification` (reuse `DailyAddOnEntitlementRepository::grant()`, cek profil lengkap, raise `DailyAddOnTokenWasRedeemed`) | `Dicoding/UseCases/DailyAddOns/Transactions/` (baru) |
| 7 | `CreateDailyAddOnTokensSpecification` (validasi: `add_on_type`, `days`, `quantity` max 1000, `description`, `owner_id`, `actor_id`, `expired_date`) | `Dicoding/UseCases/DailyAddOns/Tokens/` (baru) |
| 8 | `EditDailyAddOnTokensSpecification` (update `expired_date`/`description` token yang sudah ada, meniru `EditSubscriptionTokensSpecification`) | `Dicoding/UseCases/DailyAddOns/Tokens/` (baru) |
| 9 | Aggregate generator `DailyAddOnTokenCreator` (validasi quantity, generate token, raise event create) + aggregate editor kecil untuk `updateToken()` | `Dicoding/Domain/DailyAddOns/Aggregates/` (baru) |
| 10 | Inject gateway + specification baru, tambah branch dispatcher | `Dicoding/Web/Http/Tokens/TokenActivationAction.php` |
| 11 | Tambah branch redirect untuk `DAILY_ADD_ON_TOKEN` | `Dicoding/Web/Http/Tokens/TokenActivationResponse.php` |
| 12 | **Admin surface — Create**: `DailyAddOnTokenStoreAction`, `DailyAddOnTokenCreateAction` (form) + Response masing-masing | `Dicoding/Web/Http/DailyAddOns/Tokens/` (baru) |
| 12b | **Admin surface — Edit**: `DailyAddOnTokenEditAction` (form), `DailyAddOnTokenUpdateAction` + Response masing-masing | `Dicoding/Web/Http/DailyAddOns/Tokens/` (baru) |
| 12c | **Admin surface — Index**: `DailyAddOnTokenIndexAction` + Response, meniru `SubscriptionTokenIndexAction` | `Dicoding/Web/Http/DailyAddOns/Tokens/` (baru) |
| 12d | **Admin surface — Export**: `DailyAddOnTokenExportAction` + job handler, async kirim email admin, meniru `SubscriptionTokenExportAction`/`SubscriptionTokenExportHandler` | `Dicoding/Web/Http/DailyAddOns/Tokens/` (baru) |
| 13 | Routes admin: `GET/POST dashboard/administrations/daily-add-ons/tokens`, `GET .../create`, `GET/PUT .../{id}/edit`, `GET .../export/{filter}` — ditambah bertahap, satu grup rute per kapabilitas | `app/routes.php` |
| 14 | Views admin (index/list, create form, edit form) — meniru views token subscription | `app/views/ui/subscriptions/tokens/*` → adaptasi untuk daily add-on |
| 15 | Copy sukses di footer `activation.blade.php` — opsional, sebut varian daily add-on kalau produk mau token ini terlihat di copy | `app/views/ui/academies/tokens/activation.blade.php` |
| 16 | Translation keys baru (`DAILY_ADD_ON.TOKEN.CREATE.*`, `EDIT.*`, `REDEEM.*`) + entri Bahasa Indonesia | lang files |

## Pemecahan PR

**Konvensi tim: 1 PR = 1 layer (Domain, atau Infrastruktur+Web/UI) di dalam 1 kapabilitas CRUD** — bukan digabung
rata untuk banyak aggregate sekaligus (Create+Edit+Index+Export tidak boleh dicampur dalam satu PR domain).
Dasarnya commit history `SubscriptionToken*` di repo ini sendiri:

```
Index/List:  2019-12-02, 2019-12-03  — action response index, lalu export action
Create:      2019-12-03 (SubscriptionTokenCreator, domain)
             2019-12-04 (repository, specification, store action)         → domain lalu infra+web, 2 hari
Edit:        2019-12-09 — aggregate, repository interface, repository impl,
             specification, DAN update action, SEMUA di hari yang sama    → tuntas dalam 1 hari
```

Index/List dan Export selesai duluan, baru Create dikerjakan tuntas (domain lalu infra+web), baru 6 hari kemudian
Edit dikerjakan. Tidak pernah ada momen di mana domain Create dan domain Edit dikerjakan berbarengan lalu infra-nya
menyusul belakangan bersama — **setiap kapabilitas CRUD selesai tuntas dulu sebelum kapabilitas berikutnya
dimulai**. Untuk fitur ini, tim memilih tetap memisah domain dan infra+web+UI secara eksplisit di **setiap**
kapabilitas (Create dan Edit termasuk) — bukan cuma opsional berdasarkan ukuran seperti precedent Edit di atas —
supaya semua kapabilitas konsisten direview dalam potongan yang sama granularitasnya.

**Repository tidak pakai interface lagi** — pola terbaru di domain `DailyAddOns` sendiri sudah begini:
`DailyAddOnEntitlementRepository` dan `DailyAddOnPurchaseRepository` (`Dicoding/Domain/DailyAddOns/Repositories/`)
keduanya `class` konkret langsung, tidak ada interface terpisah, dan langsung di-type-hint konkret oleh
consumer-nya (`GrantDailyAddOnEntitlementSpecification`). Ini beda dari pola lama `SubscriptionTokenCreator*`
yang masih interface+impl split. Jadi Repository untuk fitur ini ditulis sebagai 1 class konkret, method-nya
dinamai `createAggregate()` (ikut penamaan `DailyAddOnEntitlementRepository::createAggregate()`, bukan `create()`
generik ala Subscription).

Total **8 PR** (di luar PR #0 Prep yang sudah dibuka), dikerjakan berurutan, masing-masing **stacked di atas PR
sebelumnya** (bukan base dari master) — karena hampir semuanya nge-diff `DailyAddOnTokenGateway` yang sama:

| PR | Kapabilitas | Layer | Base |
|---|---|---|---|
| #0 | Prep — redesain event `grant()` | — | master *(selesai, OPEN: PR #5592)* |
| #1 | Issuance: Create | Domain | master |
| #2 | Issuance: Create | Infrastruktur + Web/UI | stacked di atas #1 |
| #3 | Issuance: Edit | Domain | stacked di atas #2 |
| #4 | Issuance: Edit | Infrastruktur + Web/UI | stacked di atas #3 |
| #5 | Issuance: Index | (single PR, cukup kecil) | stacked di atas #4 |
| #6 | Issuance: Export | (single PR, cukup kecil) | stacked di atas #5 |
| #7 | Redemption | Domain | stacked di atas #6 |
| #8 | Redemption | Infrastruktur + Web + Spec | stacked di atas #7 |

Catatan penting dari membaca pola `SubscriptionTokenGateway` yang sudah ada: **satu Gateway dipakai bersama** oleh
sisi create, edit, index, export, maupun redeem. `DailyAddOnTokenGateway` juga harus 1 file yang dipakai semua
kapabilitas di atas — konsekuensinya: **setiap PR yang menambah/mengisi method ke gateway ini wajib stacked di
atas PR sebelumnya** yang juga menyentuh file itu, supaya tidak ada 2 PR yang sama-sama nge-diff file yang sama
dari titik awal yang berbeda (base master masing-masing akan konflik saat merge).

`ExistingDailyAddOnToken` (VO dengan ID, hasil baca dari DB) **dibuat sekali di PR #3 (Edit: Domain)** — karena
Editor butuh ini untuk baca token yang sudah ada sebelum divalidasi/diubah — dan **dipakai ulang oleh PR #7
(Redemption: Domain)**, bukan dibuat ulang. Ini beda dari draf plan paling awal yang menaruh VO ini di PR Redemption.

**Penamaan VO token direvisi dari review PR #5593** — draf awal menamai VO token sebelum-persist sebagai
`DailyAddOnTokenWithoutID` (meniru `SubscriptionTokenWithoutID`). Review meminta nama yang lebih dekat ke istilah
domain daripada detail teknis "punya ID atau tidak", jadi:
- `DailyAddOnTokenWithoutID` → **`NewDailyAddOnToken`** (sudah di-rename di PR #5593).
- VO "dengan ID" yang tadinya direncanakan bernama `DailyAddOnToken` di PR #3 → **`ExistingDailyAddOnToken`**, untuk
  konsisten dengan pasangan New/Existing di atas (bukan lagi nama polos tanpa pasangan).
- Reviewer juga menyebut alternatif "satu VO saja, `id` dibuat nullable, dicek di aggregate" — **tidak dipilih**,
  tetap pakai dua VO terpisah (New/Existing) supaya tipe tetap membedakan "belum ada ID" vs "sudah ada ID" secara
  eksplisit di compiler/psalm, bukan lewat null-check runtime.

**Parameter `DailyAddOnTokenCreator` juga direvisi dari review yang sama** — draf awal memisah input jadi
parameter constructor (`addOnType`, `days`, `expiredDate`) dan parameter `createTokens()` (`quantity`, `description`,
`tokenOwner`), padahal keduanya sama-sama input dari satu form admin. Sudah digabung jadi satu VO
**`DailyAddOnTokenCreationRequest`** (`add_on_type`, `days`, `expired_date`, `quantity`, `description`,
`token_owner`), dan `createTokens(DailyAddOnTokenCreationRequest $request)` jadi satu-satunya method yang perlu
input selain constructor (`__construct(CommonActor $generator)` sekarang cuma menerima generator, cek admin saja).
Konsekuensi: pengecekan "expired date tidak boleh di masa lalu" ikut pindah dari constructor ke `createTokens()`
(karena `expiredDate` sekarang bagian dari request, bukan lagi field aggregate). Ini beda dari pola sibling
`SubscriptionTokenCreator` (yang tetap memisah constructor/method params) — perbedaan ini disengaja per hasil
review, khusus untuk fitur ini.

**Tipe tanggal juga dipindah ke `Carbon\Carbon`** (bukan `DateTimeImmutable`) di `NewDailyAddOnToken`,
`DailyAddOnTokenCreationRequest`, dan pengecekan "now" di `DailyAddOnTokenCreator::createTokens()` — permintaan
eksplisit setelah PR #5593 dibuka. `SubscriptionTokenCreator`/`SubscriptionToken`/`SubscriptionTokenWithoutID`
sendiri konsisten pakai `DateTimeImmutable`, tapi di domain `DailyAddOns`-nya sendiri `CurrentDailyAddOn` dan
`DailyAddOnEntitlement::grant()` sudah pakai `Carbon` (lewat `Asr::toCarbon()`) — jadi token creation side sengaja
disamakan dengan pola Carbon yang sudah ada di domain yang sama, bukan lagi dengan sibling Subscription. Idiom
"now" mengikuti persis yang dipakai `DailyAddOnEntitlement`: `Asr::toCarbon(Asr::getNowDateTimeImmutable())`.

### PR #0 — Prep: Redesain event `grant()` *(selesai — PR #5592, OPEN, CI hijau)*

| File | Status |
|---|---|
| `Dicoding/Domain/DailyAddOns/Enums/DailyAddOnGrantSource.php` — enum baru, 1 case (`PAYMENT`) | Baru |
| `Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnEntitlement.php` — constructor terima `DailyAddOnGrantSource $source`; `grant()` tetap `raise()`, tapi pilih event lewat `match($this->source)` | **Ubah** |
| `Dicoding/Domain/DailyAddOns/Repositories/DailyAddOnEntitlementRepository.php` — `createAggregate()` terima parameter ketiga `DailyAddOnGrantSource $source` | **Ubah** |
| `Dicoding/UseCases/DailyAddOns/Transactions/GrantDailyAddOnEntitlementSpecification.php` — pass `DailyAddOnGrantSource::PAYMENT` ke `createAggregate()` | **Ubah** |
| `Dicoding/UseCases/DailyAddOns/Transactions/PurchaseDailyAddOnSpecification.php` — sama, di cabang lunas-oleh-poin | **Ubah** |
| Unit test `DailyAddOnEntitlementTest`, `DailyAddOnEntitlementRepositoryTest` — construction & call site update untuk parameter `DailyAddOnGrantSource::PAYMENT` baru; `grant()` tetap diasersi menghasilkan event (bukan lagi "tidak menghasilkan pending event" seperti draf awal) | **Ubah** |

### PR #1 — Issuance: Create — Domain *(selesai — PR #5593, OPEN, CI hijau; sudah termasuk revisi dari review)*

| File | Status |
|---|---|
| `Dicoding/Domain/DailyAddOns/Events/DailyAddOnTokenWasCreated.php` | Baru |
| `Dicoding/Domain/DailyAddOns/ValueObjects/NewDailyAddOnToken.php` (di-rename dari `DailyAddOnTokenWithoutID`, hasil review) | Baru |
| `Dicoding/Domain/DailyAddOns/ValueObjects/DailyAddOnTokenCreationRequest.php` — VO input gabungan (`add_on_type`, `days`, `expired_date`, `quantity`, `description`, `token_owner`), hasil review (semula parameter terpecah di constructor + `createTokens()`) | Baru |
| `Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnTokenCreator.php` (meniru `SubscriptionTokenCreator` dari sisi validasi/generate; constructor cuma terima `CommonActor $generator`, `createTokens(DailyAddOnTokenCreationRequest $request)` — beda dari sibling yang tetap pisah param, hasil review; validasi quantity max 1000, generate token `Str::random(5)-Str::random(5)`, raise event) | Baru |
| `Dicoding/Domain/DailyAddOns/Repositories/DailyAddOnTokenCreatorRepository.php` — class konkret, `createAggregate(int $actorId)`, depend ke `DailyAddOnTokenGateway` yang bodynya masih kosong | Baru |
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — skeleton, method `createTokens(array $tokens): void` dengan body kosong | Baru |
| Unit test `DailyAddOnTokenCreatorTest` (validasi quantity min/max, bentuk token yang dihasilkan, dibangun lewat helper `createRequest()`) | Baru |

### PR #2 — Issuance: Create — Infrastruktur + Web/UI (stacked di atas PR #1)

| File | Status |
|---|---|
| Migration tabel `daily_add_on_tokens` | Baru |
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — isi body `createTokens()` | **Ubah** (file dari PR #1) |
| `Dicoding/UseCases/DailyAddOns/Tokens/CreateDailyAddOnTokensSpecification.php` (meniru `CreateSubscriptionTokensSpecification`; rakit `DailyAddOnTokenCreationRequest` dari `$useCaseData` lalu panggil `createAggregate($actorId)->createTokens($request)` — bukan pass primitives terpisah, ikut perubahan API PR #1) | Baru |
| `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenStoreAction.php` + Response — admin-only | Baru |
| `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenCreateAction.php` + Response — render form create | Baru |
| `app/routes.php` — `POST .../tokens`, `GET .../tokens/create` | **Ubah** |
| View form create | Baru |
| Translation keys `DAILY_ADD_ON.TOKEN.CREATE.*` + lang Indonesia | **Ubah** |
| Integration test store action + specification | Baru |

### PR #3 — Issuance: Edit — Domain (stacked di atas PR #2)

| File | Status |
|---|---|
| `Dicoding/Domain/DailyAddOns/ValueObjects/ExistingDailyAddOnToken.php` (meniru `SubscriptionToken` — VO dengan ID, hasil baca dari DB; namanya dipasangkan dengan `NewDailyAddOnToken` dari PR #1, hasil review; dipakai ulang nanti oleh PR #7) | Baru |
| `Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnTokenEditor.php` (meniru `SubscriptionTokenEditor`; menolak edit token yang sudah dipakai) | Baru |
| `Dicoding/Domain/DailyAddOns/Repositories/DailyAddOnTokenEditorRepository.php` — class konkret, method `createAggregate()` | Baru |
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — tambah stub kosong `getById()`, `updateToken()` | **Ubah** (file dari PR #1/#2) |
| Unit test `DailyAddOnTokenEditor` | Baru |

### PR #4 — Issuance: Edit — Infrastruktur + Web/UI (stacked di atas PR #3)

| File | Status |
|---|---|
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — isi body `getById()`, `updateToken()` | **Ubah** |
| `Dicoding/UseCases/DailyAddOns/Tokens/EditDailyAddOnTokensSpecification.php` (meniru `EditSubscriptionTokensSpecification`) | Baru |
| `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenEditAction.php` + Response — render form edit | Baru |
| `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenUpdateAction.php` + Response | Baru |
| `app/routes.php` — `GET .../{id}/edit`, `PUT .../{id}` | **Ubah** |
| View form edit | Baru |
| Translation keys `DAILY_ADD_ON.TOKEN.EDIT.*` + lang Indonesia | **Ubah** |
| Integration test edit action + specification | Baru |

### PR #5 — Issuance: Index (stacked di atas PR #4)

| File | Status |
|---|---|
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — tambah `listingTokenForAdministration()` | **Ubah** |
| `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenIndexAction.php` + Response — listing dengan filter, meniru `SubscriptionTokenIndexAction` | Baru |
| `app/routes.php` — `GET .../tokens` (index) | **Ubah** |
| View index/listing | Baru |
| Integration test index action | Baru |

### PR #6 — Issuance: Export (stacked di atas PR #5)

| File | Status |
|---|---|
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — tambah `getExportData()` | **Ubah** |
| `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenExportAction.php` + job handler — async, email ke admin, meniru `SubscriptionTokenExportAction`/`SubscriptionTokenExportHandler` | Baru |
| `app/routes.php` — `GET .../export/{filter}` | **Ubah** |
| Integration test export action | Baru |

### PR #7 — Redemption: Domain (stacked di atas PR #6)

| File | Status |
|---|---|
| `Dicoding/Domain/DeveloperJourney/Commons/Enums/AcademyTokenType.php` — tambah case `DAILY_ADD_ON_TOKEN` | **Ubah** |
| `Dicoding/Domain/DailyAddOns/Events/DailyAddOnTokenWasRedeemed.php` | Baru |
| `Dicoding/Domain/DailyAddOns/Aggregates/DailyAddOnTokenRedemption.php` (meniru `SubscriptionTokenRedeeming`; pakai `ExistingDailyAddOnToken` VO dari PR #3, tidak dibuat ulang; validasi token ditemukan/belum dipakai/belum kedaluwarsa, method `redeem()` yang raise `DailyAddOnTokenWasRedeemed`) | Baru |
| `Dicoding/Domain/DailyAddOns/Repositories/DailyAddOnTokenRedemptionRepository.php` — class konkret; setelah `redeem()` sukses, panggil juga `DailyAddOnEntitlementRepository::createAggregate()->grant($days)->save()` yang sudah ada — **buka dulu keputusan terbuka di "Keputusan desain" #4** soal bagaimana `grant()` menangani sumber token (butuh case `DailyAddOnGrantSource` baru + kemungkinan `DailyAddOnEntitlement.php`/`DailyAddOnGrantSource.php` ikut disentuh di PR ini) | Baru |
| `Dicoding/Infrastructure/GlobalDomainEventHandlers/DailyAddOns/DailyAddOnEventListener.php` — tambah `whenDailyAddOnTokenWasRedeemed()`, extract logic enroll premium feature ke private method bersama | **Ubah** |
| `Dicoding/Infrastructure/Emailing/DailyAddOns/DailyAddOnEventMailer.php` — tambah `whenDailyAddOnTokenWasRedeemed()` | **Ubah** |
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — nambah 2 method stub kosong: `findByToken(string $token)`, `markAsUsed(int $userId, int $tokenId): void` | **Ubah** (file dari PR #1-#6) |
| Unit test aggregate `DailyAddOnTokenRedemption` (tolak token yang sudah dipakai/kedaluwarsa/tidak ditemukan) | Baru |

### PR #8 — Redemption: Infrastruktur + Web + Spec (stacked di atas PR #7)

| File | Status |
|---|---|
| `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php` — isi body `findByToken()` & `markAsUsed()` | **Ubah** |
| `Dicoding/UseCases/DailyAddOns/Transactions/RedeemDailyAddOnTokenSpecification.php` (meniru `RedeemSubscriptionTokenSpecification`, termasuk cek `hasMemberCompletedTheirProfile()`) | Baru |
| `Dicoding/Web/Http/Tokens/TokenActivationAction.php` — inject gateway + specification baru, tambah branch di `findOutTokenType()` | **Ubah** |
| `Dicoding/Web/Http/Tokens/TokenActivationResponse.php` — tambah branch redirect untuk `DAILY_ADD_ON_TOKEN` | **Ubah** |
| `app/views/ui/academies/tokens/activation.blade.php` — copy (opsional) | **Ubah** (opsional) |
| Translation keys `DAILY_ADD_ON.TOKEN.REDEEM.*` + lang Indonesia | **Ubah** |
| Integration test redeem end-to-end — sekaligus tempat paling pas untuk assert kasus "extend" di section berikut (beli→redeem dan redeem→beli) | Baru |

## Note: interaksi beli vs redeem token (urutan tidak masalah)

Pertanyaan: kalau user **sudah beli** add-on lalu dapat token aktivasi, apakah extend? Atau sebaliknya, **sudah
redeem token** lalu beli lagi?

**Jawaban: keduanya extend, dan urutan tidak masalah** — selama UseCase token redeem memanggil
`DailyAddOnEntitlementRepository` + `DailyAddOnEntitlement::grant()` yang sama dengan yang dipanggil
`GrantDailyAddOnEntitlementSpecification` setelah settlement pembayaran. Alasannya di `grant()` sendiri:

```php
$extendsFrom = $currentExpiresAt !== null && $currentExpiresAt->greaterThan($now)
    ? $currentExpiresAt
    : $now;
$this->current = $this->current->withExpiresAt($extendsFrom->copy()->addDays($days));
```

- **Kasus A — beli dulu, redeem token belakangan**: entitlement aktif sampai `X` (masih di masa depan). Token
  diredeem → `grant($days_token)` dipanggil → `extendsFrom = max(now, X) = X` → expiry baru `X + days_token`.
  Extend dari sisa masa aktif yang sudah dibeli, bukan menimpanya.
- **Kasus B — redeem token dulu, beli belakangan**: token bikin expiry jadi `Y = now + days_token`. User beli lagi,
  bayar lunas, settlement selesai → `grant($days_beli)` dipanggil → `extendsFrom = max(now, Y) = Y` (asumsi belum
  lewat `Y`) → expiry baru `Y + days_beli`. Sama, extend.

Simetris karena **satu-satunya sumber kebenaran expiry adalah baris `CurrentAddOnGateway` per
`(user_id, add_on_type)`**, dan kedua jalur (beli maupun token) sama-sama wajib baca-modifikasi-simpan lewat baris
itu. Ini bukan perilaku yang perlu ditulis khusus — ini otomatis benar **selama Task #2 di atas tidak menyimpan
expiry token secara terpisah** (misal kolom `token_expires_at` sendiri di tabel lain). Kalau ada 2 sumber
kebenaran expiry, urutan JADI masalah (race antara mana yang menang saat ditampilkan/dicek akses). Jangan buat itu.

Redesain event di "Keputusan desain" #4 **tidak mengubah simetri ini** — event yang di-raise cuma beda nama/tempat,
matematika `grant()` (baca-tambah-simpan ke satu baris `current_add_ons`) tidak disentuh sama sekali.

Implikasi lain dari desain ini: karena tidak ada guard "sudah aktif tidak boleh beli/redeem lagi" (lihat kondisi
sekarang di atas), user boleh stack durasi dari kombinasi beli + redeem token sebanyak yang dia mau — konsisten
dengan perilaku beli-berkali-kali yang sudah ada hari ini, jadi tidak perlu keputusan produk baru untuk ini.
