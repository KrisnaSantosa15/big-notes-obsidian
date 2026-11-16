---
date: 2026-10-13
updated: 2026-10-13
type: guide
tags: [guide, learning, dicoding, dicoding-platform]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Runbook — Error `Permission denied, wrong credentials` pada Email Platform

## Konteks Masalah

Saat mengirim email dari halaman `https://dicoding.local/emails/create` (platform: `sendportal`), response:

```json
{
  "success": false,
  "data": {
    "deliveredEmails": [],
    "deliveredEmailsAmount": 0,
    "lastErrorResponse": "{\"errors\":[{\"message\":\"Permission denied, wrong credentials\",\"field\":null,\"help\":null}]}"
  }
}
```

Ini menandakan request ke SendPortal API ditolak karena kredensial tidak valid / tidak terbaca di runtime.

---

## Root Cause (berdasarkan alur kode saat ini)

### Alur request

1. `POST /emails` (`EmailStoreAction`) atau `POST /emailtests` (`EmailTestAction`)
2. `EmailPlatformFactory` memilih `SendportalEmailPlatform`
3. `SendPortalClient` membuat HTTP client dengan header:
   - `Authorization: Bearer {services.sendportal.api_key}`
   - base URI: `{services.sendportal.domain}/api/v1/`

### Sumber konfigurasi

- `app/config/services.php`:
  - `services.sendportal.domain` ← `SENDPORTAL_DOMAIN`
  - `services.sendportal.api_key` ← `SENDPORTAL_API_KEY`
  - `services.sendportal.email_service_id` ← `SENDPORTAL_EMAIL_SERVICE_ID`

### Fakta di repo saat ini

- File env lokal (`.env.local.php`) belum memiliki key `SENDPORTAL_*` secara default.
- Jika key kosong/salah, SendPortal membalas `Permission denied, wrong credentials`.

---

## Solusi Cepat (untuk unblock reproduksi)

## 1) Isi env lokal dengan kredensial SendPortal valid

Update file: `.env.local.php` (jangan commit secret)

```php
'SENDPORTAL_DOMAIN' => 'https://<your-sendportal-host>',
'SENDPORTAL_API_KEY' => '<your-valid-sendportal-api-key>',
'SENDPORTAL_EMAIL_SERVICE_ID' => '<numeric-email-service-id>',
```

Catatan:
- `SENDPORTAL_DOMAIN` wajib domain root tanpa `/api/v1` (karena kode menambahkan `/api/v1/` sendiri).
- `SENDPORTAL_API_KEY` harus token API aktif milik workspace SendPortal yang benar.
- `SENDPORTAL_EMAIL_SERVICE_ID` harus ID email service yang valid di instance SendPortal tersebut.

---

## 2) Restart service web agar env terbaca ulang

Gunakan deck:

```bash
deck stop
deck start
```

---

## 3) Verifikasi kredensial langsung ke SendPortal (sebelum test dari UI)

```bash
curl -sS -H "Accept: application/json" \
  -H "Authorization: Bearer <SENDPORTAL_API_KEY>" \
  "<SENDPORTAL_DOMAIN>/api/v1/tags?name=healthcheck"
```

Expected:
- **200** dan payload JSON valid.

Jika masih `Permission denied`:
- API key salah / expired
- API key bukan untuk environment SendPortal yang dipakai
- token tidak punya scope/permission

---

## 4) Verifikasi dari Dicoding UI/API

1. Buka: `https://dicoding.local/emails/create?platform=sendportal`
2. Kirim test email (`POST /emailtests`) dengan payload kecil.
3. Expected response:
   - `success: true`
   - `lastErrorResponse: null`
   - `deliveredEmailsAmount > 0`

---

## Checklist Diagnostik Cepat

1. `SENDPORTAL_DOMAIN` terisi dan benar host-nya.
2. `SENDPORTAL_API_KEY` tidak kosong, valid, dan sesuai environment.
3. `SENDPORTAL_EMAIL_SERVICE_ID` valid (integer existing).
4. Service sudah restart setelah ubah env.
5. Endpoint `GET /api/v1/tags` via curl berhasil.

---

## Hardening yang Disarankan (lanjutan agar tidak terulang)

## A. Tambah placeholder env di template deck

Update:
- `deck/stubs/.env.local.stub`
- (opsional) `.env.php`, `.env.testing.php`, `.env.endtoend.php` sesuai kebutuhan env

Tambahkan:

```php
'SENDPORTAL_DOMAIN' => '',
'SENDPORTAL_API_KEY' => '',
'SENDPORTAL_EMAIL_SERVICE_ID' => '',
```

Manfaat:
- engineer baru tidak melewatkan konfigurasi penting ini.

## B. Fail-fast validasi konfigurasi SendPortal

Lokasi:
- `Dicoding/EmailPlatforms/EmailRequests/SendPortal/SendPortalClient.php`

Tambahkan validasi saat init client:
- jika domain/api_key/email_service_id kosong, lempar exception dengan message eksplisit.

Manfaat:
- error lebih cepat, lebih jelas, dan tidak ambigu dengan error dari provider.

## C. Tambah catatan setup di docs internal

Lokasi yang cocok:
- `deck/readme.md` (section setup env)

Tambahkan poin wajib isi `SENDPORTAL_*` saat mau pakai Email Platform sendportal.

---

## Keamanan

- **Jangan commit** nilai kredensial asli ke repository.
- Simpan key hanya di file env lokal/private secret manager.
- Hindari copy key ke issue/PR/chat tanpa masking.

