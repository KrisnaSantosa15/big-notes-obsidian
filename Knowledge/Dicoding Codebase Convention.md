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
public function createAggregate(int $actorId, int $tokenId): DailyAddOnTokenUpdate
{
    $row = $this->gateway->getById($tokenId);

    if ($row === null) {
        throw ObjectNotFoundException::create('Daily Add-On Token', $tokenId, __METHOD__);
    }

    return new DailyAddOnTokenUpdate(
        $this->actorFactory->getById($actorId),
        new ExistingDailyAddOnToken(array_merge((array) $row, [
            'add_on_type' => DailyAddOnType::from($row->add_on_type),
        ])),
    );
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

## 13. Ada rule `integer`? Selalu tambahkan `min:`
`integer` doang gak nolak angka negatif atau nol. Untuk ID/quantity/kuantitas yang harus positif, selalu pasangkan dengan `min:` (biasanya `min:1`).

```php
// Salah, dari CreateDailyAddOnTokensSpecification (belum diperbaiki)
'actor_id' => 'required|integer',
'owner_id' => 'required|integer',
'days' => 'required|integer',
'quantity' => 'required|integer',

// Benar, dari MultiCourseTokensStoreSpecification
'actor_id' => 'required|integer|min:1',
'owner_id' => 'required|integer|min:1',
```
Precedent yang sudah konsisten: `MultiCourseTokensStoreSpecification`, `MultiCourseTokenDropoutSpecification`, `MultiCourseTokensRedemptionDateUpdateSpecification`, dan `EditDailyAddOnTokensSpecification` (`token_id`, `actor_id`) semuanya pakai `min:1`.

## 14. Jangan bikin `setUp()` kalau isinya cuma manggil `parent::setUp()`
Override `setUp()` di test class cuma boleh ada kalau beneran ngapa-ngapain di luar `parent::setUp()` (insert data fixture, mock, `Route::enableFilters()` yang beneran dibutuhkan test-nya). Kalau isinya cuma manggil parent doang, itu dead code, hapus.

```php
// Salah, dari UpdateDailyAddOnTokenIntegrationTest (sebelum diperbaiki)
use Route;

class UpdateDailyAddOnTokenIntegrationTest extends IntegrationTest
{
    #[\Override]
    protected function setUp(): void
    {
        parent::setUp();

        Route::enableFilters();
    }

    /** @test */
    public function admin_updates_an_existing_daily_add_on_token(): void
    {
        // ...
    }
}

// Benar
class UpdateDailyAddOnTokenIntegrationTest extends IntegrationTest
{
    /** @test */
    public function admin_updates_an_existing_daily_add_on_token(): void
    {
        // ...
    }
}
```
`Route::enableFilters()` maksa filter chain (`auth`, `mfa_enforcement`, dst) yang normalnya di-skip pas testing supaya beneran jalan. Baru perlu dipertahankan kalau test-nya emang lagi nge-assert perilaku filter itu sendiri, atau belum ada sibling test lain di route group yang sama yang sudah membuktikan filter chain-nya lolos untuk request yang sah (di sini sudah dibuktikan oleh `CreateDailyAddOnTokenIntegrationTest` di direktori yang sama).

## 15. Integration test untuk simple CRUD yang aggregate-nya sudah unit-tested: cukup 1 test happy path
Kalau semua rejection case udah di-assert exhaustive di unit test aggregate-nya (lihat poin 17 soal urutan), jangan ulangi lagi satu-satu di integration test HTTP-nya. Integration test cukup buktikan hal yang gak dibuktikan test lain: full round-trip HTTP -> UseCase -> Aggregate -> Repository -> Gateway -> row DB -> redirect target.

Contoh: `DailyAddOnTokensCreationTest` (`app/tests/UnitTests/Domain/DailyAddOns/DailyAddOnTokensCreationTest.php`) sudah exhaustive nge-assert tiap rejection (non-admin, expired date invalid, quantity di luar batas, description kependekan). `CreateDailyAddOnTokenIntegrationTest` (`app/tests/IntegrationTests/Specifications/DailyAddOns/CreateDailyAddOnTokenIntegrationTest.php`) gak perlu re-assert rejection yang sama, cukup satu test sukses (`admin_creates_a_batch_of_daily_add_on_tokens`).

Sama logikanya untuk admin-gate rejection (`beforeFilter('admin')`): filter-nya infrastruktur shared yang sudah dipakai banyak route, dan aggregate-nya sendiri juga sudah unit-tested nolak non-admin. Sebelum nambah integration test di luar happy path, tanya dulu: "ini mbuktiin apa yang belum dijamin sama unit test, framework, atau static analysis?" Kalau jawabannya "gak ada", skip.

## 16. GET/listing page simpel (index, tanpa domain layer): boleh skip integration test
Untuk halaman admin GET/listing yang cuma query Gateway + render Blade, tanpa aggregate/domain layer di baliknya, boleh skip integration test dan cukup cek manual lewat browser.

Contoh: `DailyAddOnTokenIndexAction` (`Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenIndexAction.php`) sengaja gak punya integration test.

Ini bukan pengecualian yang eksepsional, ini mayoritas: dari 551 route GET di `app/routes.php`, cuma ~14% yang dites lewat `$this->get(route(...))` di integration test; dipersempit ke route `*.index` doang, ~11%. Write routes (POST/PUT/PATCH/DELETE) dites jauh lebih konsisten (~43.5%). Jadi jangan reflek nulis integration test buat setiap Index/listing page baru cuma karena ada fitur analog yang punya test soalnya itu preseden minoritas, bukan default. Berlaku khusus untuk halaman read/listing murni, tidak berlaku untuk Create/Edit/Update (write action) yang di codebase ini dites jauh lebih konsisten, atau GET yang punya business logic/validasi nyata di baliknya.

## 17. Test method: urutan negatif (paling umum ke paling spesifik) dulu, positif/sukses paling akhir
Tulis dulu semua kemungkinan rejection case secara exhaustive (validasi tiap field, authorization, business rule), baru tulis test sukses paling akhir. Urutan method di dalam class harus ikut urutan ini: rejection paling umum di atas, makin ke bawah makin spesifik, sukses di paling bawah.

Contoh nyata urutan yang sudah konsisten, dari `DailyAddOnTokensCreationTest` (`app/tests/UnitTests/Domain/DailyAddOns/DailyAddOnTokensCreationTest.php`):
```php
test_a_non_admin_token_creator_is_rejected()               // gate authorization, paling umum
test_an_expired_date_in_the_past_is_rejected()              // validasi per field
test_creating_fewer_than_one_token_is_rejected()
test_creating_more_than_one_thousand_tokens_is_rejected()
test_a_description_shorter_than_four_characters_is_rejected()
test_reading_created_tokens_before_creating_any_is_rejected() // makin spesifik
test_creating_a_batch_generates_distinct_tokens_matching_the_batch_and_raises_an_event() // sukses, paling akhir
```

## 18. Action + Response: gabung jadi satu invokable class kalau logic Response-nya simpel
Untuk `Web\Http` Action yang logic response-nya simpel (render satu view, atau branch status payload buat redirect + flash message), jangan dipecah jadi `XxxAction` + `XxxResponse` (pola lama `action(): PayloadInterface` + `Responsable::with()`). Cukup satu class invokable: `__invoke(): View|RedirectResponse` yang langsung ngerjain dan return response akhirnya.

Pola lama (dua class terpisah), dari `Dicoding/Web/Http/Subscriptions/Tokens/SubscriptionTokenStoreAction.php`:
```php
class SubscriptionTokenStoreAction extends BaseController
{
    /**
     * @testedAt CreateSubscriptionTokenIntegrationTest
     * @return PayloadInterface
     */
    public function action(): PayloadInterface
    {
        $this->session->flashInput($this->request->all());
        return $this->useCase->run($this->specification, [
            'plan_id' => $this->request->input('plan_id'),
            // ...
        ]);
    }
}
```

Pola baru (satu class, langsung invoke), dari `Dicoding/Web/Http/DailyAddOns/Tokens/DailyAddOnTokenStoreAction.php`:
```php
class DailyAddOnTokenStoreAction extends BaseController
{
    public function __invoke(): RedirectResponse
    {
        $payload = $this->useCase->run($this->specification, [
            'actor_id' => Auth::id(),
            'owner_id' => $this->request->input('owner_id'),
            // ...
        ]);

        if ($payload->getStatus() !== PayloadStatus::SUCCESS) {
            return $this->redirector->route('daily_add_ons.tokens.create')
                ->withInput()
                ->with('warning_message', $payload->getMessages());
        }

        return $this->redirector->route('daily_add_ons.tokens.index')
            ->with('success_message', $payload->getMessages());
    }
}
```
Baru pecah jadi `XxxResponse` terpisah kalau logic shaping response-nya beneran kompleks (banyak bentuk output tergantung struktur payload, assembly view-model, dll), bukan sekadar "response beda buat sukses vs gagal dengan flash message" yang masih terhitung simpel. Kalau lagi niru sibling feature LAMA (misalnya Subscription tokens) yang masih pakai pola Action+Response, tetap pilih pola domain sejenis yang lebih baru kalau dua-duanya ada sebagai preseden.

## 19. Constructor boleh validasi, asal datanya sudah lengkap di parameter — bukan hasil pemanggilan method lain di instance yang sama

Ini penjelasan yang lebih presisi dari poin 1 dan 8 di atas (dua-duanya konsisten, cuma kelihatan kontradiktif kalau dibaca sebagai aturan mutlak "constructor gak boleh validasi").

Aturannya: constructor boleh throw exception selama semua data yang dicek **sudah tersedia langsung sebagai argumen** saat itu juga — baik itu data baru (insert) maupun data existing yang sudah di-fetch lebih dulu (update/edit, seperti `$existingToken` di poin 8). Yang **gak boleh** divalidasi di constructor adalah aturan yang butuh state yang baru kebentuk lewat pemanggilan method *lain* pada instance yang sama setelah instance-nya lahir — karena saat constructor jalan, state itu memang belum ada, bukan soal gaya penulisan.

Contoh nyata dari `Dicoding/Domain/EmailPlatforms/Aggregates/EmailDraftCreation.php`:

```php
// Boleh — $actor sudah lengkap saat constructor dipanggil, gak butuh state dari method lain
public function __construct(private readonly CommonActor $actor) {
    if (!$this->actor->isAdmin()) {
        throw new AuthorizationException('EMAIL_PLATFORMS.DRAFT_CREATION.NOT_ADMIN');
    }
}

// Gak bisa dipindah ke constructor — $this->composed baru ada setelah create() dipanggil
public function withPersistedDraftId(int $draftId): self
{
    if (!$this->composed) {
        throw new DomainException('EMAIL_PLATFORMS.DRAFT_CREATION.DRAFT_NOT_YET_COMPOSED');
    }
    if ($this->persisted) {
        throw new DomainException('EMAIL_PLATFORMS.DRAFT_CREATION.ALREADY_PERSISTED');
    }
    // ...
}
```

Poin 1 (`DailyAddOnTokenUpdate`) sengaja tetap mendorong validasi ke `updateToken()` walau datanya sebenarnya sudah cukup di constructor — itu pilihan tim biar orkestrasi validasi terpusat di satu method (`validateEditTokenRules()`), bukan karena constructor secara teori dilarang validasi. Poin 8 (`SubscriptionTokenEditor`) menunjukkan constructor yang validasi langsung dari argumen tetap valid karena datanya ($existingToken) sudah lengkap di titik itu.

**Rujukan teori (DDD asli, bukan konvensi tim):** Eric Evans, *Domain-Driven Design*, bab Life Cycle/Factories — "a public constructor must be an atomic operation that satisfies all invariants of the created object." Constructor secara teori DDD tidak dilarang memvalidasi; yang dilarang adalah object lahir dalam keadaan tidak valid. Vaughn Vernon, *Effective Aggregate Design* — invariant sejati (*true invariant*) harus ditegakkan di setiap operasi yang bisa melanggarnya, termasuk operasi pembuatan.

## 20. Nama unit test pakai bahasa bisnis, bukan istilah teknis kode

Nama method test harus menjelaskan **aturan bisnis** yang diuji, bukan mekanisme kode (constructor, class, method) di baliknya.

Salah, dari `app/tests/UnitTests/Domain/EmailPlatforms/Aggregates/EmailDraftCreationTest.php`:
```php
public function rejects_construction_when_actor_is_not_admin(): void
```
"construction" itu istilah teknis (proses instansiasi object di kode), bukan bahasa yang dipakai domain expert buat menyebut aturan ini.

Benar, dari `app/tests/UnitTests/Domain/DailyAddOns/DailyAddOnTokensCreationTest.php` (lihat juga poin 17):
```php
public function test_a_non_admin_token_creator_is_rejected(): void
```
Menyatakan aturan bisnisnya langsung — "pembuat token yang bukan admin ditolak" — tanpa menyebut constructor/method apa yang menjalankannya.

## 21. `// TODO` boleh dipakai untuk stub method yang implementasinya nyusul, taruh di dalam body

Pengecualian dari aturan "no comments": method stub (body kosong/placeholder, misalnya `return null;` doang) yang implementasi aslinya baru datang di PR lain boleh ditandai `// TODO`, biar gak disalahartikan sebagai logic yang memang disengaja.

Taruh komentarnya **di dalam body method**, bukan di atas signature — yang belum lengkap itu isinya, bukan method-nya (method-nya sendiri sudah ada dan sudah dipanggil). Isi pesannya singkat dan menjelaskan apa yang perlu diimplementasikan, **bukan** nomor PR yang bakal ngerjain (PR itu belum tentu ada/jadi, jangan gantungin komentar ke sesuatu yang bisa berubah).

Contoh, dari `Dicoding/Infrastructure/StorageGateways/DailyAddOns/DailyAddOnTokenGateway.php`:
```php
public function findByToken(string $token): ?object
{
    // TODO: look up the token row by its token value
    return null;
}

public function markAsUsed(int $userId, int $tokenId): void
{
    // TODO: mark the token row as used by this redeemer
}
```
