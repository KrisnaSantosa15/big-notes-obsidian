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