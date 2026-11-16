# Belajar DDD Architecture dari Codebase Dicoding (Panduan Junior)

Dokumen ini menjelaskan **konsep DDD (Domain-Driven Design)** sampai **contoh implementasi nyata** berdasarkan codebase ini.
Bahasanya sengaja dibuat sederhana, tapi tetap detail supaya bisa kamu jadikan pegangan saat ngoding.

---

## 1) Gambaran Besar Arsitektur di Codebase Ini

Codebase ini memakai gaya:

- **Laravel 4.2 (customized)**
- **Clean Architecture + DDD**
- Arsitektur berlapis:

```text
Route -> Web Layer -> UseCases Layer -> Domain Layer -> Infrastructure Layer
```

Lokasi utamanya:

- Route: `app/routes.php`, `app/api_routes.php`
- Web (Action/Response): `Dicoding/Web/...`
- UseCase (Specification): `Dicoding/UseCases/...`
- Domain (Aggregate, ValueObject, Event, Service): `Dicoding/Domain/...`
- Infrastructure (Gateway, Repository impl, Event Handler): `Dicoding/Infrastructure/...`

**Tujuan utamanya:** bisnis rule tidak tercampur dengan HTTP, database, atau vendor API.

---

## 2) Konsep DDD yang Wajib Dipahami

## 2.1 Ubiquitous Language

Tim harus pakai istilah domain yang sama di semua tempat (kode, diskusi, dokumen).
Contoh istilah domain di codebase ini:

- `BootcampInstallmentInvoiceRegeneration`
- `ScholarshipLetterWasRegenerated`
- `SavedBootcampInitialRegistration`

Nama class sudah mencerminkan bahasa bisnis, bukan bahasa teknis.

## 2.2 Bounded Context

Satu area bisnis dipisah sesuai konteks.
Contoh konteks yang terlihat:

- Campaigns
- Scholarships
- Payments

Masing-masing punya folder domain sendiri, supaya logic tidak campur.

## 2.3 Entity vs Value Object

- **Entity**: punya identitas yang penting (id).
- **Value Object (VO)**: fokus ke nilai/data, bukan identitas.

Contoh VO:
- `Dicoding/Domain/Scholarships/Letters/ValueObjects/LetterReference.php`
- `Dicoding/Domain/Campaigns/Commons/ValueObjects/SavedBootcampInitialRegistration.php`

VO membantu menghindari “array liar” dan menjaga validasi data.

## 2.4 Aggregate (Pusat Aturan Bisnis)

Aggregate adalah gerbang perubahan state bisnis.

Contoh bagus:
- `Dicoding/Domain/Campaigns/Commons/Aggregates/BootcampInstallmentInvoiceRegeneration.php`

Di dalam aggregate ini ada pola penting:
1. cek otorisasi (`authorize`)
2. cek invariant/aturan (`validateCurrentInvoice`)
3. ubah state + raise domain event (`regenerateInvoice`)

## 2.5 Domain Event

Domain event menandakan “sesuatu yang penting sudah terjadi di bisnis”.

Contoh:
- `BootcampInstallmentInvoiceWasRegenerated`
- `ScholarshipLetterWasCreated`
- `ScholarshipLetterWasRegenerated`

Event dipakai untuk side effect (queue, notifikasi, dll) tanpa membuat domain jadi bergantung ke infrastruktur.

## 2.6 Repository

Repository adalah jembatan domain <-> data source.

Contoh interface:
- `Dicoding/Domain/Scholarships/Letters/Repositories/LetterRepository.php`

Contoh implementasi:
- `Dicoding/Infrastructure/Repositories/Scholarships/Letters/DefaultLetterRepository.php`

## 2.7 Domain Service

Dipakai saat logic domain tidak cocok ditempatkan di satu entity/aggregate.

Contoh:
- `Dicoding/Domain/Scholarships/Letters/Services/ScholarshipLetterProvider.php`
- `LetterGeneratorService` (dipakai di use case scholarship letter)

---

## 3) Mapping Tanggung Jawab Tiap Layer (Sangat Penting)

## 3.1 Web Layer (Action)

Contoh:
- `Dicoding/Web/Http/Campaigns/BootcampInstallmentInvoiceRegenerateAction.php`
- `Dicoding/Web/Api/V1/Scholarships/Letters/RegenerateScholarshipLetterAction.php`

Tugas Action:
- Ambil input dari request
- Panggil UseCase
- Ubah hasil payload jadi response HTTP/redirect/json

Action di codebase ini sudah cukup “tipis” (thin controller), ini praktik yang benar.

## 3.2 UseCases Layer (Specification)

Contoh:
- `BootcampInstallmentInvoiceRegenerationSpecification`
- `ScholarshipLetterCreationSpecification`
- `RegenerateScholarshipLetterSpecification`

Tugas specification:
- Validasi input use case (`$dataValidationRules`)
- Orkestrasi flow aplikasi
- Tangani exception jadi payload yang konsisten

Catatan penting: ini adalah “application logic”, bukan tempat aturan bisnis inti yang kompleks.

## 3.3 Domain Layer

Tugas:
- Menjaga aturan bisnis inti (invariant)
- Menentukan state transition yang valid
- Raise domain event

Contoh kuat:
- Aggregate: `BootcampInstallmentInvoiceRegeneration`
- Event: `BootcampInstallmentInvoiceWasRegenerated`
- VO: `RegeneratedBootcampInstallmentInvoice`, `LetterReference`

## 3.4 Infrastructure Layer

Tugas:
- Query DB
- Integrasi S3/Xendit/Queue/vendor
- Implementasi repository interface

Contoh:
- Gateway: `ScholarshipLetterGateway`
- Repository impl: `DefaultLetterRepository`
- Event listener: `LetterGenerationListener`
- Job handler: `ProceedGenerateScholarshipLetterHandler`

---

## 4) Contoh Alur Nyata #1 (Sinkron): Regenerate Invoice Bootcamp

Flow nyata dari codebase:

1. Route
   - `app/routes.php` (route `bootcamp.registrations.invoice.regenerate`)
2. Action
   - `BootcampInstallmentInvoiceRegenerateAction::__invoke(...)`
3. UseCase
   - `UseCase::lock(...)` lalu jalankan `BootcampInstallmentInvoiceRegenerationSpecification`
4. Specification
   - Ambil aggregate dari repository
   - Ambil invoice
   - Panggil `aggregate->regenerate($invoice)`
   - Simpan hasil lewat repository
5. Aggregate
   - Otorisasi user
   - Validasi invoice (belum dibayar, sudah lewat deadline, entity benar, terkait registration)
   - Buat invoice baru + raise `BootcampInstallmentInvoiceWasRegenerated`
6. Repository + Gateway
   - Simpan invoice baru ke DB
   - Hubungkan dengan Xendit
   - Update invoice id di registrasi

### Kenapa ini contoh DDD yang bagus?

- Rule bisnis ada di aggregate, bukan di controller
- Use case jadi orkestrator
- Side effect teknis ada di repository/gateway
- Event domain dipakai sebagai jejak perubahan domain

---

## 5) Contoh Alur Nyata #2 (Asinkron/Event-Driven): Scholarship Letter

Flow:

1. API request masuk ke:
   - `RegenerateScholarshipLetterAction`
2. Action memanggil:
   - `RegenerateScholarshipLetterSpecification`
3. Specification:
   - Validasi participant
   - Set progress letter jadi `IN_PROGRESS`
   - Raise event `ScholarshipLetterWasRegenerated`
4. `UseCase` commit transaction lalu dispatch event
5. Event listener:
   - `LetterGenerationListener` push job `ProceedGenerateScholarshipLetterHandler`
6. Job handler:
   - Jalankan `ScholarshipLetterGenerationSpecification`
7. Generation specification:
   - Generate file letter
   - Upload
   - Simpan success/failed status

### Nilai DDD di sini

- Domain event memisahkan proses “request diterima” vs “proses berat generate file”
- Action tetap cepat, pekerjaan berat dipindah ke queue
- Side effect lintas sistem tetap terstruktur

---

## 6) Pola Penting di Codebase Ini yang Harus Kamu Tiru

1. **Thin Action**
   - Action hanya jembatan HTTP -> UseCase.
2. **Specification sebagai orchestration**
   - Ada validasi input + error handling payload.
3. **Aggregate menjaga invariant**
   - Rule bisnis kritis tidak boleh bocor ke controller/gateway.
4. **Event untuk decoupling**
   - Hal “setelah sukses” diproses lewat event/listener/job.
5. **Repository/ Gateway untuk I/O**
   - SQL, storage, API vendor tidak masuk domain.

---

## 7) Cara Implementasi Fitur Baru dengan Gaya DDD (Praktis)

Urutan kerja yang aman untuk junior:

1. Tentukan dulu bahasa domainnya (istilah bisnis).
2. Buat flow endpoint (route + action) yang tipis.
3. Buat `Specification` untuk orkestrasi use case.
4. Kalau ada aturan bisnis kompleks, buat/ubah `Aggregate`.
5. Simpan data lewat repository/gateway.
6. Kalau ada proses lanjutan berat, raise event lalu queue job.
7. Tulis unit test untuk aggregate dan integration test untuk flow penting.

---

## 8) Testing Strategy di Codebase Ini

Lokasi test:

- Unit: `app/tests/UnitTests` (fokus domain, cepat)
- Integration: `app/tests/IntegrationTests` (uji wiring antar layer)

Contoh test nyata:

- Unit:
  - `app/tests/UnitTests/Domain/Campaigns/BootcampInstallmentInvoiceRegenerationTest.php`
- Integration:
  - `app/tests/IntegrationTests/Specifications/Campaigns/BootcampInstallmentInvoiceRegenerationIntegrationTest.php`

Pelajaran penting dari test domain:
- Uji kasus gagal (authorization, invalid state, not found)
- Uji event ter-raise
- Uji state yang dihasilkan sesuai invariant

---

## 9) Kesalahan Umum Junior Saat Mulai DDD

1. Menaruh rule bisnis di controller/action.
2. Menaruh query DB langsung di domain object.
3. Menggunakan array mentah terus-menerus tanpa VO.
4. Tidak raise event saat state penting berubah.
5. Membuat use case terlalu gemuk sampai jadi “god class”.

Kalau kamu menghindari 5 hal ini, kualitas desain akan naik jauh.

---

## 10) Checklist Cepat Saat Review Kode DDD

Sebelum PR, cek:

- Apakah action sudah tipis?
- Apakah aturan bisnis inti berada di aggregate/domain?
- Apakah error jadi payload yang konsisten?
- Apakah operasi I/O hanya di infrastructure?
- Apakah event domain dipakai untuk side effect?
- Apakah test domain untuk invariant sudah ada?

Jika mayoritas “ya”, biasanya desainmu sudah sejalan dengan DDD di codebase ini.

---

## Penutup

DDD di project ini bukan teori murni, tapi sudah dipakai nyata:
- dari route dan action yang tipis,
- ke specification sebagai orkestrator,
- ke aggregate sebagai penjaga aturan bisnis,
- lalu ke event + queue untuk side effect yang scalable.

Kalau kamu belajar dari alur Bootcamp Invoice dan Scholarship Letter dulu, kamu akan cepat paham pola utama DDD yang dipakai di codebase ini.
