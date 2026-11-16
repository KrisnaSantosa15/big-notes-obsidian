---
date: 2026-10-13
updated: 2026-10-13
type: guide
tags: [guide, learning, dicoding, dicoding-platform]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Expose Personal Student Dashboard API (`student_dashboard`)

## Status
Implemented on branch `feature/academies/expose-student-dashboard-api`.
Dokumen ini merepresentasikan kondisi **aktual saat ini** (bukan rencana).

## Ringkasan Perubahan Utama

### 1) Renaming dan konsistensi identitas
- OAuth client identifier: `dashboard_v4` ➜ `student_dashboard`
- Route file: `app/routes/dashboard_v4.php` ➜ `app/routes/student_dashboard.php`
- Config URL dashboard baru: `app/config/dashboard_v4.php` ➜ `app/config/student_dashboard.php`
- Route name namespace: `api.dashboard.v4.*` ➜ `api.student_dashboard.*`

### 2) Endpoint API baru/terkonsolidasi
Base path: `/api/v1/student-dashboard`

Ownership scope (`/my`):
- `GET /my` → `api.student_dashboard.me`
- `POST /my/subscription/referral` → `api.student_dashboard.me.subscription.referral.store`
- `GET /my/subscription/bank-account` → `api.student_dashboard.me.subscription.bank-account.get`
- `PUT /my/subscription/bank-account` → `api.student_dashboard.me.subscription.bank-account.update`

Non-ownership:
- `GET /subscription/banks` → `api.student_dashboard.subscription.banks.get`

Referensi: `app/routes/student_dashboard.php`.

### 3) Integrasi OAuth
- Scope mapping di `app/config/oauth_server_scopes.php` untuk client `student_dashboard`:
  - `dashboard:students:readonly`
  - `referral:students:readwrite`
- First-party silent client di `app/config/oauth_silent.php` sudah memakai `student_dashboard`.
- Logout token revocation di `UserAuthenticationController` sudah diarahkan ke client `student_dashboard` (`revokeStudentDashboardTokens`).

## Kontrak Respons API Dashboard (payload yang diekspos)
Transformer: `Dicoding/Web/Transformers/StudentDashboardPayloadTransformer.php`

Field utama yang dipublikasikan:
- `profile_completion`
- `academy_activities`
- `subscription`
  - `current_plan`
  - `scoped_subscriptions`
  - `pending_submission_id`
- `subscription_referral`
  - `code`
- `activities`
  - `events`, `challenges`, `jobs`, `campaigns`
- `recommended_submissions`
- `academic_programs`
- `daily_checkin`
  - `enabled`, `has_enrolled_courses`, `has_checked_in`, `latest_checkin`, `checkins`, `meta`, `total`
- `daily_streak` ✅ **ditambahkan**
- `elevate`
- `pijak`
- `bootcamp_installments`
- `flash_sale`

## Penambahan Field `daily_streak`

Field `daily_streak` ditambahkan agar parity dengan data dashboard web lama (`dailyStreakData` di shared data/view). Implementasi saat ini:
- Data di-enrich pada action API (`StudentDashboardShowAction`) saat membentuk output payload.
- Transformer memetakan `dailyStreakData` ➜ `daily_streak`.

Commit terkait:
- `004dbc48cfa` — `feat(dashboard): add daily_streak field to response payload`

## Perubahan Test yang Sudah Dilakukan

### Integration tests dashboard API
File:
- `app/tests/IntegrationTests/Specifications/Dashboards/StudentDashboardShowActionIntegrationTest.php`
- `.../StudentDashboardSubscriptionReferralStoreActionIntegrationTest.php`
- `.../StudentDashboardSubscriptionBankAccountGetActionIntegrationTest.php`
- `.../StudentDashboardSubscriptionBankAccountUpdateActionIntegrationTest.php`
- `.../StudentDashboardSubscriptionBanksGetActionIntegrationTest.php`

Penyesuaian yang dilakukan:
- Ubah route name ke `api.student_dashboard.*`
- Ubah OAuth client setup ke `student_dashboard`
- Hilangkan helper OAuth duplikat (pakai helper bersama)
- Hilangkan case `should_reject_request_without_oauth_token` yang redundant dengan `OAuthFilterIntegrationTest`
- Gunakan assertion shape object yang lebih ringkas/terstandar

### Unit tests transformer
File:
- `app/tests/UnitTests/Web/Api/V1/Dashboards/StudentDashboardPayloadTransformerTest.php`

Penyesuaian yang dilakukan:
- Penggunaan concrete `createInvoice()` (menghindari over-mocking VO)
- Stub checkins dipisah ke helper method
- Penamaan test dirapikan
- Negative test diletakkan di awal
- Tambah assertion untuk field `daily_streak`

### Unit tests OAuth repository
File:
- `app/tests/UnitTests/Infrastructure/OAuth/AccessTokenRepositoryTest.php`
- `app/tests/UnitTests/Infrastructure/OAuth/RefreshTokenRepositoryTest.php`

Penyesuaian:
- Client identifier di test diubah menjadi `student_dashboard`.

## Jejak Commit Penting (ringkas)
- `b61d1890da4` — expose personal dashboard API
- `c350a6828c7` — add `subscription_referral` in response
- `ad9d839d0d8` — move API routes into dedicated route file
- `1721b118f77` — referral registration endpoint
- `762638b1ebb` — get student bank account endpoint
- `d38dcf6a383` — update student bank account endpoint
- `8b45ffb95ec` — get banks endpoint for referral
- `952417cd84a` — simplify oauth-based tests + transformer fixtures
- `c16e86d94e7` — unify OAuth test setup/remove duplicated helpers
- `18e0714af86` — remove redundant unauthorized tests
- `25a67083c4e` — OAuth client identifier normalization
- `004dbc48cfa` — add `daily_streak` in API response

## File Konfigurasi dan Routing yang Aktif
- `app/routes/student_dashboard.php`
- `app/config/student_dashboard.php`
- `app/config/oauth_server_scopes.php`
- `app/config/oauth_silent.php`
- `app/routes.php` (include route file baru)

## Catatan Operasional
- Pastikan env `STUDENT_DASHBOARD_URL` tersedia di semua environment.
- Feature flag versioning sengaja dipertahankan terpisah dari naming client/route (sesuai keputusan tim).