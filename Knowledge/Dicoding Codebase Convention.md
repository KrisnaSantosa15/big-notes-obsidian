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
`enum:` sudah type-check sendiri lewat `tryFrom()`, aman untuk tipe apapun.

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
Kalau `$rules` (atau satu-satunya caller) sudah menjamin tipe/keberadaan sebuah field, getter/constructor tidak perlu cast atau `?? default` lagi. Itu cuma bikin reviewer harus cek dua kali apakah cast-nya beneran ngapa-ngapain. Berlaku di layer manapun (VO getter, constructor, UseCase), bukan cuma Domain.

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
Domain/UseCase yang melakukan date math (expiry, issuance, redemption window, dll) pakai `Carbon` supaya gampang di-test (freeze/travel time, fluent comparison), bukan string atau `DateTime` biasa.

```php
// Salah
public function updateToken(string $newExpiredDate, string $newDescription): void

// Benar
public function updateToken(Carbon $newExpiredDate, string $newDescription): void
```
`Asr::getNowDateTimeStringInDefaultTimeZone()` tetap dipakai untuk "now" dalam bentuk string di titik persistensi/logging (lihat CLAUDE.md), bungkus jadi `Carbon`/`Carbon::parse(...)` kalau nilainya perlu dipakai sebagai domain concept. Di test, pakai `Carbon` instance tetap (atau `Carbon::setTestNow()`) daripada string timestamp.

## 8. Null-check: bisa di constructor aggregate, bisa juga di repository, dua-duanya valid
- **404-style**: resource utama yang diakses langsung tidak ada. Repository/factory yang throw `ObjectNotFoundException`, sebelum aggregate-nya dibentuk.
- **400-style**: resource utamanya ada, tapi business rule dari action-nya sendiri masih bisa gagal. Aggregate yang throw `InvariantException`.

Cara 1 (return 400-style), throw langsung di constructor aggregate, dari `Dicoding/Domain/Subscriptions/Tokens/Aggregates/SubscriptionTokenEditor.php`:
```php
public function __construct(?SubscriptionToken $existingToken = null)
{
    if ($existingToken === null) {
        throw new InvariantException('SUBSCRIPTION.TOKEN.EDIT.EMPTY_EXISTING_TOKEN');
    }

    if ($existingToken->isAlreadyUsed()) {
        throw new InvariantException('SUBSCRIPTION.TOKEN.EDIT.ALREADY_USED');
    }

    $this->existingToken = $existingToken;
}
```

Cara 2 (return 404-style), throw di repository sebelum aggregate dibentuk, dari `Dicoding/Domain/DailyAddOns/Repositories/DailyAddOnTokenUpdateRepository.php`:
```php
public function createAggregate(int $tokenId): DailyAddOnTokenUpdate
{
    $row = $this->gateway->getById($tokenId);

    if ($row === null) {
        throw ObjectNotFoundException::create('Daily Add-On Token', $tokenId, __METHOD__);
    }

    return new DailyAddOnTokenUpdate(new ExistingDailyAddOnToken(array_merge((array) $row, [
        'add_on_type' => DailyAddOnType::from($row->add_on_type),
    ])));
}
```

## 9. Gateway return data mentah, jangan terikat ke VO/domain object
Assembly ke VO adalah kerjaan repository/factory yang manggil gateway ini, bukan gateway itu sendiri.

```php
// Salah
public function getById(int $id): ?ExistingDailyAddOnToken

// Benar
public function getById(int $id): ?object
```

## 10. Domain Service vs Service biasa: bedanya cuma raise event atau nggak
- **Domain Service**: dipakai kalau butuh query dengan data yang sejenis dari banyak Specification berbeda, dan hasil aksinya perlu raise domain event. Extends `Dicoding\Domain\Common\DomainService` (yang cuma `use EventRaisableObject`).
- **Service biasa**: dipakai kalau butuh query dengan data yang sejenis dari banyak Specification, tanpa raise event. Plain class biasa.

Contoh Domain Service, dari `Dicoding/DomainServices/ContributionPoint/UserContributionPointService.php`:
```php
class UserContributionPointService extends DomainService
{
    public function increase(ContributionPoint $contributionPoint): void
    {
        $newContributionPoint = $this->getCurrentContributionPoint($contributionPoint->getUserId())
            + $contributionPoint->getValue();
        $this->save($contributionPoint, $newContributionPoint);

        $this->raise(new ContributionPointWasIncreased($contributionPoint));
    }
    // ...
}
```

Contoh Service biasa (query dipakai berulang di banyak tempat, tanpa raise event), dari `Dicoding/DomainServices/CourseManagerPermission/CourseManagerPermissionService.php`:
```php
class CourseManagerPermissionService
{
    public function canManageCourse(UserRoleHelper $userRoleHelper, int $courseId): bool
    {
        if (!$userRoleHelper->isAuthed()) {
            return false;
        }
        if ($userRoleHelper->isInstructorForCourse($courseId)) {
            return true;
        }
        // ...
    }
}
```

## 11. Anonymous aggregate untuk perubahan data simpel yang gak perlu unit test tersendiri
Tiap perubahan data tetap wajib lewat aggregate. Tapi kalau cuma butuh insert simpel dan bikin Repository+VO kerasa berlebihan, dan aggregate-nya gak butuh di-test sendiri, pakai anonymous class.

Contoh nyata, dari `Dicoding/UseCases/ContactUs/SupportFormSpecification.php`:
```php
$aggregate = new class extends Aggregate {};
$aggregate->raise(new MessageFromContactUsWasSent(
    $actorId,
    $email,
    $subject,
));

return $this->payloadFactory->withSuccessfulDomainPayload($aggregate, message: '...');
```
Kalau business rule-nya cukup kompleks sampai butuh unit test sendiri, tetap bikin class aggregate biasa (seperti `DailyAddOnTokenUpdate`), jangan anonymous.

## 12. Factory sekarang jarang dipakai, perannya udah ke-cover Repository
Factory dan Repository punya peran yang sama (assembly domain object dari data mentah). Precedent lama masih ada, misalnya `SubscriptionTokenFactory::createById()`:
```php
public function createById(int $tokenId): SubscriptionToken
{
    $subscriptionTokenData = $this->subscriptionTokenGateway->getById($tokenId);

    if (empty($subscriptionTokenData)) {
        throw ObjectNotFoundException::create('Subscription Token', $tokenId, __METHOD__);
    }

    return $this->createSubscriptionToken($subscriptionTokenData);
}
```
Tapi untuk kode baru, logic assembly-nya cukup ditaruh langsung di Repository, contoh `DailyAddOnTokenUpdateRepository::createAggregate()` di poin 8 di atas. Gak perlu bikin class Factory terpisah kecuali sudah ada 2+ pemakai nyata yang butuh reuse.
