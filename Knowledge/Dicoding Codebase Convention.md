Konvensi kode domain di Dicoding (PHP/DDD). Lihat [[PR Retrospective/dicoding-dev-dicoding/00 Index|PR Retrospective]] untuk konteks/sumber lengkapnya.

## 1. Jangan validasi di constructor aggregate
Constructor cuma nyimpen dependency. Validasi/otorisasi jalan di action method lewat satu method validasi gabungan.

```php
// Salah
public function __construct(?ExistingDailyAddOnToken $token) {
    if ($token === null) throw new InvariantException(...);
    $this->token = $token;
}

// Benar
public function __construct(private readonly ?ExistingDailyAddOnToken $token) {}

public function updateToken(Carbon $newExpiredDate, string $newDescription): void {
    $this->validateEditTokenRules($newExpiredDate); // 1 method gabungan, bukan dipecah-pecah
    $this->updatedToken = $this->token->withNewSelf($newExpiredDate, $newDescription);
}
```

## 2. Ada `enum` rule? Jangan tambah `string`/`integer` lagi
`enum:` sudah type-check sendiri lewat `tryFrom()` — aman untuk tipe apapun.

```php
// Salah
'add_on_type' => 'required|string|enum:' . DailyAddOnType::class,

// Benar
'add_on_type' => 'required|enum:' . DailyAddOnType::class,
```

## 3. Nama aggregate = noun proses, bukan noun pelaku (`-or`/`-er`)
```php
// Salah
class DailyAddOnTokenEditor extends Aggregate
class DailyAddOnTokenCreator extends Aggregate

// Benar
class DailyAddOnTokenUpdate extends Aggregate
class DailyAddOnTokensCreation extends Aggregate
```
Ikuti pola yang sudah ada: `MultiCourseTokensCreation`, `MultiCourseTokenDropout`, `MultiCourseTokenDeadlineExtension`.

## 4. Insert/update lewat Gateway: jangan pakai `$vo->toArray()`, tulis eksplisit
`toArray()` di VO itu buat serialisasi output (API response), bukan buat bentuk row DB. Gateway harus tahu sendiri kolom apa saja yang di-insert.

```php
// Salah
$this->db->table($table)->insert(array_map(
    fn ($token) => array_merge($token->toArray(), ['created_at' => $now]),
    $tokens,
));

// Benar
$this->db->table($table)->insert(array_map(
    fn ($token) => [
        'token' => $token->getToken(),
        'add_on_type' => $token->getAddOnType()->value,
        'expired_date' => $token->getExpiredDate()->format('Y-m-d H:i:s'),
        'created_at' => $now,
    ],
    $tokens,
));
```

## 5. Gunakan data yang sudah ada di database testing

```php
// Salah
$admin = $this->createDicodingUser(['user_role' => MembershipRole::ADMIN()->getValue()]);
$owner = $this->createDicodingUser();
$expiredDateInput = Carbon::now()->addDays(30)->format('d-m-Y H:i');
$expectedExpiredDate = Carbon::createFromFormat('d-m-Y H:i', $expiredDateInput)->format('Y-m-d H:i:s');
$this->be(DicodingUser::find($admin->id));

// Benar
$this->be(DicodingUser::find(DicodingUser::ADMINID)); atau be(DicodingUser::find(2))

```

## 6. Jangan cast/default ulang kalau tipe sudah pasti
Kalau `$rules` (atau satu-satunya caller) sudah menjamin tipe/keberadaan sebuah field, getter/constructor tidak perlu cast atau `?? default` lagi — itu cuma bikin reviewer harus cek dua kali apakah cast-nya beneran ngapa-ngapain. Berlaku di layer manapun (VO getter, constructor, UseCase), bukan cuma Domain.

```php
// Salah
// rule: 'discussion_id' => 'required|integer'
public function getDiscussionId(): int {
    return (int) $this->data['discussion_id'];
}

// Benar
public function getDiscussionId(): int {
    return $this->data['discussion_id'];
}
```
Cek dulu: apakah rule validasi atau caller (grep `new <VOName>(`) sudah menjamin tipe/kehadirannya? Kalau ya, hapus cast/default-nya. Cast/default baru dipertahankan kalau jaminannya memang belum ada (field `sometimes`, banyak caller dengan jaminan beda-beda, atau tipe yang legitimately berubah setelah validasi).

## 7. Gunakan `Carbon`, bukan string mentah/`DateTime`, untuk tanggal
Domain/UseCase yang melakukan date math (expiry, issuance, redemption window, dll) pakai `Carbon` supaya gampang di-test (freeze/travel time, fluent comparison) — bukan string atau `DateTime` biasa.

```php
// Salah
public function updateToken(string $newExpiredDate, string $newDescription): void

// Benar
public function updateToken(Carbon $newExpiredDate, string $newDescription): void
```
`Asr::getNowDateTimeStringInDefaultTimeZone()` tetap dipakai untuk "now" dalam bentuk string di titik persistensi/logging (lihat CLAUDE.md) — bungkus jadi `Carbon`/`Carbon::parse(...)` kalau nilainya perlu dipakai sebagai domain concept. Di test, pakai `Carbon` instance tetap (atau `Carbon::setTestNow()`) daripada string timestamp.
