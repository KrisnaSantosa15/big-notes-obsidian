# Email Subscription Event Tracking — Implementation Guide

## Ringkasan Masalah

Saat ini event `EmailSubscriptionWasUpdated` hanya menyimpan `user_id`. Ini tidak cukup untuk menjawab kebutuhan inspeksi:

- user unsubscribe tipe apa
- kapan perubahan terjadi
- kondisi subscription sebelum/sesudah perubahan

Karena disepakati **tanpa membuat tabel history baru**, solusi paling pragmatis adalah memperkaya `eventData` pada domain event yang sudah ada.

---

## Tujuan Implementasi

1. Event menyimpan delta perubahan:
   - `subscribed_types`
   - `unsubscribed_types`
2. Event menyimpan snapshot:
   - `before`
   - `after`
3. Berlaku untuk semua tipe pada enum:
   - `academies`, `challenges`, `events`, `jobs`, `newsletter`, `promo`
4. Tetap sesuai guideline domain:
   - `eventData` hanya primitives/array primitives
   - tidak menambah tabel history

---

## Kontrak Event Baru (Final)

Path: `Dicoding/Domain/EmailSubscriptions/Events/EmailSubscriptionWasUpdated.php`

```php
[
    'user_id' => 123,
    'subscribed_types' => ['academies', 'newsletter'],
    'unsubscribed_types' => ['promo'],
    'before' => [
        'academies' => false,
        'challenges' => false,
        'events' => false,
        'jobs' => false,
        'newsletter' => false,
        'promo' => true,
    ],
    'after' => [
        'academies' => true,
        'challenges' => false,
        'events' => false,
        'jobs' => false,
        'newsletter' => true,
        'promo' => false,
    ],
]
```

> **Kapan berubah** diambil dari timestamp log domain event (`created_at` log), bukan dari kolom tambahan baru.

---

## Desain Solusi per Layer

### 1. Domain Event: tambah field eventData

**File yang diubah**

- `Dicoding/Domain/EmailSubscriptions/Events/EmailSubscriptionWasUpdated.php`

**Perubahan**

- Ubah constructor dari hanya `int $userId` menjadi:
  - `int $userId`
  - `array $subscribedTypes`
  - `array $unsubscribedTypes`
  - `array $before`
  - `array $after`

Contoh:

```php
public function __construct(
    int $userId,
    array $subscribedTypes,
    array $unsubscribedTypes,
    array $before,
    array $after
) {
    $this->eventData = [
        'user_id' => $userId,
        'subscribed_types' => array_values($subscribedTypes),
        'unsubscribed_types' => array_values($unsubscribedTypes),
        'before' => $before,
        'after' => $after,
    ];
}
```

---

### 2. Aggregate: hitung before/after + delta saat update

**File yang diubah**

- `Dicoding/Domain/EmailSubscriptions/Aggregates/EmailSubscriptionUpdate.php`

**Perubahan utama**

1. Tambah properti state awal subscription:
   - `private array $beforeSubscriptions;`
2. Constructor menerima state awal:
   - `__construct(int $userId, array $beforeSubscriptions = [])`
3. Pada `update(array $subscriptions)`:
   - tetap build `EmailSubscription` agar validasi tipe tetap berjalan
   - hitung `after` dari hasil `EmailSubscription`
   - hitung delta:
     - `subscribed_types`: `before=false && after=true`
     - `unsubscribed_types`: `before=true && after=false`
   - emit event dengan payload lengkap

Contoh inti logika:

```php
$emailSubscription = (new EmailSubscription($this->userId))->withSubscribed($subscriptions);
$this->emailSubscriptions = $emailSubscription;

$after = $this->extractStateFromEmailSubscription($emailSubscription);
[$subscribedTypes, $unsubscribedTypes] = $this->calculateDelta($this->beforeSubscriptions, $after);

$this->raise(new EmailSubscriptionWasUpdated(
    $this->userId,
    $subscribedTypes,
    $unsubscribedTypes,
    $this->beforeSubscriptions,
    $after
));
```

**Catatan**

- State wajib dinormalisasi ke semua tipe enum (`EmailSubscriptionType::toValuesArray()`), default `false` jika belum ada row.
- Jangan simpan object pada eventData.

---

### 3. Repository: inject state awal dari storage ke aggregate

**File yang diubah**

- `Dicoding/Infrastructure/Repositories/EmailSubscriptions/EmailSubscriptionUpdateRepository.php`

**Perubahan utama**

1. Di `createFromToken()` dan `createFromId()`, jangan lagi instantiate aggregate dengan userId saja.
2. Ambil current subscription dari gateway:
   - `$this->gateway->getCurrentSubscriptions($userId)`
3. Normalisasi menjadi map boolean per tipe, lalu kirim ke constructor aggregate.

Contoh:

```php
return new EmailSubscriptionUpdate(
    $userId,
    $this->normalizeCurrentSubscriptions($this->gateway->getCurrentSubscriptions($userId))
);
```

Tambahkan helper privat:

```php
private function normalizeCurrentSubscriptions(?object $current): array
{
    $state = [];
    foreach (EmailSubscriptionType::toValuesArray() as $type) {
        $state[$type] = $current !== null && isset($current->{$type}) && (int) $current->{$type} === 1;
    }

    return $state;
}
```

---

### 4. UseCase Specification: pastikan semua jalur emitter tetap lewat repository

**File yang perlu diverifikasi (biasanya tanpa perubahan besar)**

- `Dicoding/UseCases/EmailSubscriptions/NonAuthEmailSubscriptionUpdateSpecification.php`
- `Dicoding/UseCases/EmailSubscriptions/AuthedEmailSubscriptionUpdateSpecification.php`
- `Dicoding/UseCases/Users/Settings/UserEmailSubscriptionUpdateSpecification.php`

Checklist:

1. Semua jalur memanggil `createFromToken()` / `createFromId()` dari repository.
2. Tidak ada lagi jalur yang membuat `new EmailSubscriptionUpdate(...)` langsung di use case.
3. `$aggregate->update($updateData)` tetap dipakai.

---

## Daftar File yang Diupdate

### Wajib

1. `Dicoding/Domain/EmailSubscriptions/Events/EmailSubscriptionWasUpdated.php`
2. `Dicoding/Domain/EmailSubscriptions/Aggregates/EmailSubscriptionUpdate.php`
3. `Dicoding/Infrastructure/Repositories/EmailSubscriptions/EmailSubscriptionUpdateRepository.php`
4. `app/tests/UnitTests/Domain/EmailSubscriptions/UpdatingUserEmailSubscriptionTest.php`

### Direkomendasikan (untuk verifikasi end-to-end event log)

1. `app/tests/IntegrationTests/Specifications/Users/UpdateUserEmailSubscriptionIntegrationTest.php`

---

## Perubahan Test yang Disarankan

## Unit Test (wajib)

File: `app/tests/UnitTests/Domain/EmailSubscriptions/UpdatingUserEmailSubscriptionTest.php`

1. Ganti assertion event lama:
   - dari hanya `assertObjectRaisedDomainEvent(...)`
   - menjadi `assertDomainEventContains(...)` untuk memastikan payload lengkap
2. Tambahkan skenario delta:
   - before: semua false, after: `academies/newsletter=true`
   - expect:
     - `subscribed_types = ['academies', 'newsletter']`
     - `unsubscribed_types = []`
3. Tambahkan skenario unsubscribe:
   - before: `promo=true`, after: `promo=false`
   - expect:
     - `subscribed_types = []`
     - `unsubscribed_types = ['promo']`
4. Update mock repository test:
   - expect `getCurrentSubscriptions($userId)` dipanggil saat `createFromToken`/`createFromId`

Contoh assertion:

```php
$this->assertDomainEventContains(
    $aggregate,
    EmailSubscriptionWasUpdated::class,
    [
        'user_id' => 5,
        'subscribed_types' => ['academies', 'newsletter'],
        'unsubscribed_types' => [],
        'before' => [
            'academies' => false,
            'challenges' => false,
            'events' => false,
            'jobs' => false,
            'newsletter' => false,
            'promo' => false,
        ],
        'after' => [
            'academies' => true,
            'challenges' => false,
            'events' => false,
            'jobs' => false,
            'newsletter' => true,
            'promo' => false,
        ],
    ]
);
```

## Integration Test (disarankan)

File: `app/tests/IntegrationTests/Specifications/Users/UpdateUserEmailSubscriptionIntegrationTest.php`

- Ubah verifikasi event menjadi:

```php
$this->verifyEventLoggedWith(EmailSubscriptionWasUpdated::class, [
    'eventData' => [
        // payload lengkap
    ]
]);
```

- Supaya deterministic, set state awal `email_subscriptions` dulu dengan `updateExistingData(...)` sebelum submit form.

---

## Urutan Implementasi (Praktis)

1. Update event class + contract payload.
2. Update aggregate untuk hitung before/after/delta.
3. Update repository agar inject before state dari gateway.
4. Update unit tests (domain + repository behavior).
5. (Opsional tapi disarankan) update integration test untuk payload event.
6. Jalankan static analysis + test.

---

## Perintah Verifikasi (sesuai tooling proyek)

> Gunakan `deck` untuk semua perintah PHP.

```bash
deck php vendor/bin/phpunit app/tests/UnitTests/Domain/EmailSubscriptions/UpdatingUserEmailSubscriptionTest.php
deck php vendor/bin/phpunit app/tests/IntegrationTests/Specifications/Users/UpdateUserEmailSubscriptionIntegrationTest.php
deck psalm
```

## Verifikasi Event Log (Manual Testing)

Untuk memastikan event `EmailSubscriptionWasUpdated` benar-benar tercatat dengan payload baru (`subscribed_types`, `unsubscribed_types`, `before`, `after`), jalankan:

```bash
grep -R "Dicoding.Domain.EmailSubscriptions.Events.EmailSubscriptionWasUpdated" ~/www/DICODING_ENV/DOMAIN_EVENTS/ | tail -n 20
```

Gunakan command ini setelah melakukan update subscription dari UI/API, lalu cocokkan isi `eventData` dengan perubahan yang Anda kirim.

---

## Dampak dan Kompatibilitas

- **Backward compatibility**:
  - `user_id` tetap ada, jadi consumer lama yang hanya baca `user_id` tetap aman.
- **Behavior**:
  - update subscription tetap berjalan seperti sebelumnya.
  - event menjadi lebih kaya (observability naik) tanpa perubahan schema database.
- **Tradeoff yang diterima**:
  - event payload lebih besar, namun jauh lebih murah dibanding membangun history table + infra baru.

---

## Out of Scope (sesuai keputusan diskusi)

- Tidak menambah tabel history subscription.
- Tidak menambah kolom JSON `latest_field_datetime_updates`.
- Tidak membangun layanan query audit terpisah.
