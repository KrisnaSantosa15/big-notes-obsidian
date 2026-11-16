# Implementasi Lengkap SSR Histori Komentar Diskusi (User + Admin)

Dokumen ini berisi **implementasi penuh** (bukan skeleton), dengan format:
1. **Penempatan file**
2. **Kode final**
3. **Perintah jalan test**

Scope:
- SSR only (tanpa API baru)
- Tidak pakai modul Elites
- Dibuat independen dari flow histori lama

---

## A. Perubahan pada File Existing

## A1) `app/routes.php` (tambahkan 2 route SSR baru)

> Letakkan di grup route web yang sama dengan route user activities dan academies administrations.

```php
Route::get('users/{id}/activities/discussion-comment-histories', [
    'as' => 'users.activities.discussion-comment-histories',
    'uses' => 'Dicoding\Web\Http\Users\Activity\UserActivityDiscussionCommentHistoryAction@action',
])->where('id', '[0-9]+');

Route::get('academies/administrations/discussions/comment-histories', [
    'as' => 'academies.administrations.discussion-comment-histories',
    'uses' => 'Dicoding\Web\Http\Academies\Admin\DiscussionCommentHistoriesIndexAction@action',
]);
```

---

## A2) `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/DiscussionCommentGateway.php`

### Tambahkan import
```php
use Dicoding\Domain\DeveloperJourney\Commons\Enums\CourseDiscussionStatus;
```

### Tambahkan method berikut ke dalam class `DiscussionCommentGateway`
```php
public function getHistoriesForUserActivity(int $userId): array
{
    return $this->db->table('course_discussion_comments_new AS comments')
        ->join('developer_journey_discussions AS discussions', 'discussions.id', '=', 'comments.discussion_id')
        ->join('developer_journeys AS courses', 'courses.id', '=', 'discussions.course_id')
        ->join('users AS creators', 'creators.id', '=', 'comments.creator_id')
        ->where('comments.creator_id', $userId)
        ->where('comments.status', CourseDiscussionCommentStatus::PUBLISHED()->getValue())
        ->where('discussions.status', CourseDiscussionStatus::PUBLISHED()->getValue())
        ->select([
            'comments.id AS comment_id',
            'comments.comment',
            'comments.created_at',
            'comments.creator_id',
            'creators.name AS creator_name',
            'creators.email AS creator_email',
            'discussions.id AS discussion_id',
            'discussions.title AS discussion_title',
            'courses.id AS course_id',
            'courses.name AS course_name',
        ])
        ->latest('comments.created_at')
        ->get();
}

public function getHistoriesForAdmin(int $limit = 30): \Illuminate\Pagination\Paginator
{
    return $this->db->table('course_discussion_comments_new AS comments')
        ->join('developer_journey_discussions AS discussions', 'discussions.id', '=', 'comments.discussion_id')
        ->join('developer_journeys AS courses', 'courses.id', '=', 'discussions.course_id')
        ->join('users AS creators', 'creators.id', '=', 'comments.creator_id')
        ->where('comments.status', CourseDiscussionCommentStatus::PUBLISHED()->getValue())
        ->where('discussions.status', CourseDiscussionStatus::PUBLISHED()->getValue())
        ->select([
            'comments.id AS comment_id',
            'comments.comment',
            'comments.created_at',
            'comments.creator_id',
            'creators.name AS creator_name',
            'creators.email AS creator_email',
            'discussions.id AS discussion_id',
            'discussions.title AS discussion_title',
            'courses.id AS course_id',
            'courses.name AS course_name',
        ])
        ->latest('comments.created_at')
        ->paginate($limit);
}
```

---

## B. File Baru — User SSR

## B1) `Dicoding/Web/VM/Users/Activities/UserActivityDiscussionCommentHistoryVM.php`

```php
<?php

namespace Dicoding\Web\VM\Users\Activities;

use Dicoding\Domain\User\Contracts\Member;
use Dicoding\Web\VM\ViewModel;

class UserActivityDiscussionCommentHistoryVM implements ViewModel
{
    /**
     * @param array<object> $histories
     */
    public function __construct(
        private readonly Member $student,
        private readonly array $histories
    ) {
    }

    public function getStudentId(): int
    {
        return $this->student->getId();
    }

    public function getHistories(): array
    {
        return $this->histories;
    }

    public function getCourseName(object $history): string
    {
        return $history->course_name;
    }

    public function getDiscussionTitle(object $history): string
    {
        return $history->discussion_title;
    }

    public function getCommentText(object $history): string
    {
        return $history->comment;
    }

    public function getCommentCreatedAt(object $history): string
    {
        return $history->created_at;
    }

    public function getDiscussionUrl(object $history): string
    {
        return route('academies.discussions.show', [
            'id' => $history->course_id,
            'discussionId' => $history->discussion_id,
        ]) . '#comment-' . $history->comment_id;
    }
}
```

## B2) `Dicoding/Web/Http/Users/Activity/UserActivityDiscussionCommentHistoryAction.php`

```php
<?php

namespace Dicoding\Web\Http\Users\Activity;

use Aura\Payload_Interface\PayloadInterface;
use Dicoding\Domain\Payloads\PayloadFactoryInterface;
use Dicoding\DomainServices\UserRoles\UserRoleHelper;
use Dicoding\Exception\AuthenticationException;
use Dicoding\Exception\ObjectNotFoundException;
use Dicoding\Infrastructure\QueryRepositories\UserActivitiesRepository;
use Dicoding\Infrastructure\StorageGateways\Academies\Discussions\DiscussionCommentGateway;
use Dicoding\Web\VM\Users\Activities\UserActivityDiscussionCommentHistoryVM;
use DicodingUtils\Mailing\ExceptionMailNotificationInterface;
use Psr\Log\LoggerInterface;

class UserActivityDiscussionCommentHistoryAction extends \BaseController
{
    public function __construct(
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly UserActivitiesRepository $userActivitiesRepository,
        private readonly DiscussionCommentGateway $discussionCommentGateway,
        private readonly LoggerInterface $logger,
        private readonly ExceptionMailNotificationInterface $exceptionMailNotification,
        private readonly UserRoleHelper $userRoleHelper
    ) {
        parent::__construct();
    }

    public function action(int $id): PayloadInterface
    {
        try {
            $this->validateAccess();

            $student = $this->userActivitiesRepository->getMember($id);
            if ($student === null) {
                throw ObjectNotFoundException::create('Member', $id, __CLASS__);
            }

            $histories = $this->discussionCommentGateway->getHistoriesForUserActivity($student->getId());
            $vm = new UserActivityDiscussionCommentHistoryVM($student, $histories);

            return $this->payloadFactory->withSuccessfulPayload(['vm' => $vm]);
        } catch (AuthenticationException $exception) {
            return $this->payloadFactory->withUnauthorizedPayload($exception->getMessage(), ['id' => $id]);
        } catch (ObjectNotFoundException $exception) {
            return $this->payloadFactory->withMissingPayload(null, ['id' => $id]);
        } catch (\Exception $exception) {
            $this->logger->error($exception);
            $this->exceptionMailNotification->notify($exception);

            return $this->payloadFactory->withExceptionPayload($exception, ['id' => $id]);
        }
    }

    /**
     * @throws AuthenticationException
     */
    private function validateAccess(): void
    {
        if (!$this->userRoleHelper->isUserManager() && !$this->userRoleHelper->isAcademyManager()) {
            throw new AuthenticationException("You don't have permission to access the resource");
        }
    }
}
```

## B3) `Dicoding/Web/Http/Users/Activity/UserActivityDiscussionCommentHistoryResponse.php`

```php
<?php

namespace Dicoding\Web\Http\Users\Activity;

use Aura\Payload_Interface\PayloadInterface;
use Aura\Payload_Interface\PayloadStatus;
use Dicoding\Web\Http\Responsable;

class UserActivityDiscussionCommentHistoryResponse implements Responsable
{
    public function with(PayloadInterface $payload)
    {
        if ($payload->getStatus() !== PayloadStatus::SUCCESS) {
            if ($payload->getStatus() === PayloadStatus::NOT_AUTHORIZED) {
                return \Redirect::route('dashboard')
                    ->with('warning_message', $payload->getMessages());
            }

            return \Redirect::route('users.index')
                ->with('warning_message', $payload->getMessages());
        }

        return \Response::view('ui.newusers.activities.discussion-comment-histories', $payload->getOutput());
    }
}
```

## B4) `app/views/ui/newusers/activities/discussion-comment-histories.blade.php`

```blade
@extends('ui.layouts.dashboards.admins')

@section('styles')
    @parent
    {{ \DicodingUtils\HTML\Tag::preloadedCss(dComponent('newuseractivities', 'style')) }}
@stop

@section('content')
    @include('ui.newdashboards.widget.admin.header',[
        'icon'  => 'fas fa-user',
        'title' => 'Discussion Comment Histories',
        'parents' => [
            [
                'title' => 'Dicoding Users',
                'url' => route('users.index')
            ],
            [
                'title' => 'Activities',
                'url' => route('users.activities.index', ['id' => $vm->getStudentId()])
            ]
        ]
    ])

    <div class="row">
        <div class="col-md-12 grid-margin">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title mb-4" style="text-transform: unset">Histori Komentar Diskusi</h4>

                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                            <tr>
                                <th>Kelas</th>
                                <th>Diskusi</th>
                                <th>Komentar</th>
                                <th>Dibuat</th>
                                <th>Aksi</th>
                            </tr>
                            </thead>
                            <tbody>
                            @if(count($vm->getHistories()) === 0)
                                <tr>
                                    <td colspan="5" class="text-center">Belum ada histori komentar diskusi.</td>
                                </tr>
                            @else
                                @foreach($vm->getHistories() as $history)
                                    <tr class="js-user-discussion-comment-history-row">
                                        <td>{{{ $vm->getCourseName($history) }}}</td>
                                        <td>{{{ $vm->getDiscussionTitle($history) }}}</td>
                                        <td><span title="{{{ $vm->getCommentText($history) }}}">{{{ textdotdot($vm->getCommentText($history), 100) }}}</span></td>
                                        <td>{{{ $vm->getCommentCreatedAt($history) }}}</td>
                                        <td>
                                            <a href="{{{ $vm->getDiscussionUrl($history) }}}" class="btn btn-sm btn-primary">
                                                <span class="text-icon"><i class="fa fa-search-plus"></i></span>
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@stop
```

---

## C. File Baru — Admin SSR

## C1) `Dicoding/Web/VM/Academies/Admin/DiscussionCommentHistoriesVM.php`

```php
<?php

namespace Dicoding\Web\VM\Academies\Admin;

use Dicoding\Web\VM\ViewModel;
use Illuminate\Pagination\Paginator;

class DiscussionCommentHistoriesVM implements ViewModel
{
    public function __construct(
        private readonly Paginator $histories
    ) {
    }

    public function getHistories(): Paginator
    {
        return $this->histories;
    }

    public function getCreatorName(object $history): string
    {
        return $history->creator_name;
    }

    public function getCreatorEmail(object $history): string
    {
        return $history->creator_email;
    }

    public function getCourseName(object $history): string
    {
        return $history->course_name;
    }

    public function getDiscussionTitle(object $history): string
    {
        return $history->discussion_title;
    }

    public function getCommentText(object $history): string
    {
        return $history->comment;
    }

    public function getCreatedAt(object $history): string
    {
        return $history->created_at;
    }

    public function getDiscussionUrl(object $history): string
    {
        return route('academies.discussions.show', [
            'id' => $history->course_id,
            'discussionId' => $history->discussion_id,
        ]) . '#comment-' . $history->comment_id;
    }
}
```

## C2) `Dicoding/Web/Http/Academies/Admin/DiscussionCommentHistoriesIndexAction.php`

```php
<?php

namespace Dicoding\Web\Http\Academies\Admin;

use Aura\Payload_Interface\PayloadInterface;
use BaseController;
use Dicoding\Domain\Payloads\PayloadFactoryInterface;
use Dicoding\Infrastructure\Reporters\ActivityReportInterface;
use Dicoding\Infrastructure\StorageGateways\Academies\Discussions\DiscussionCommentGateway;
use Dicoding\Web\VM\Academies\Admin\DiscussionCommentHistoriesVM;
use Exception;
use Illuminate\Http\Request;

class DiscussionCommentHistoriesIndexAction extends BaseController
{
    public function __construct(
        private readonly Request $request,
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly DiscussionCommentGateway $discussionCommentGateway,
        private readonly ActivityReportInterface $activityReport
    ) {
        parent::__construct();
        $this->beforeFilter('academy_admin');
    }

    public function action(): PayloadInterface
    {
        try {
            $limit = (int) $this->request->query('limit', 30);
            $limit = $limit > 0 ? $limit : 30;

            $vm = new DiscussionCommentHistoriesVM(
                $this->discussionCommentGateway->getHistoriesForAdmin($limit)
            );

            return $this->payloadFactory->withSuccessfulPayload(['vm' => $vm]);
        } catch (Exception $exception) {
            $this->activityReport->reportError($exception);
            return $this->payloadFactory->withExceptionPayload($exception);
        }
    }
}
```

## C3) `Dicoding/Web/Http/Academies/Admin/DiscussionCommentHistoriesIndexResponse.php`

```php
<?php

namespace Dicoding\Web\Http\Academies\Admin;

use Aura\Payload_Interface\PayloadInterface;
use Aura\Payload_Interface\PayloadStatus;
use Dicoding\Web\Http\Responsable;
use Illuminate\Routing\Redirector;
use Illuminate\View\Factory as ViewFactory;

class DiscussionCommentHistoriesIndexResponse implements Responsable
{
    public function __construct(
        private readonly ViewFactory $view,
        private readonly Redirector $redirector
    ) {
    }

    public function with(PayloadInterface $payload)
    {
        if ($payload->getStatus() !== PayloadStatus::SUCCESS) {
            return $this->redirector->route('dashboard')
                ->with('warning_message', $payload->getMessages());
        }

        return $this->view->make('ui.newacademies.admin.discussion-comment-histories', $payload->getOutput());
    }
}
```

## C4) `app/views/ui/newacademies/admin/discussion-comment-histories.blade.php`

```blade
@extends('ui.layouts.dashboards.academies')

@section('content')
    @include('ui.newdashboards.widget.academy.header', [
        'icon'  => 'fas fa-comments',
        'title' => 'Discussion Comment Histories'
    ])

    <div class="row">
        <div class="col-md-12 grid-margin stretch-card">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Kelas</th>
                                <th>Diskusi</th>
                                <th>Komentar</th>
                                <th>Dibuat</th>
                                <th>Aksi</th>
                            </tr>
                            </thead>
                            <tbody>
                            @if($vm->getHistories()->isEmpty())
                                <tr class="table-warning">
                                    <td colspan="7" class="text-center">Tidak ada data histori komentar</td>
                                </tr>
                            @else
                                @foreach($vm->getHistories() as $history)
                                    <tr class="js-discussion-comment-history-row">
                                        <td>{{{ $vm->getCreatorName($history) }}}</td>
                                        <td class="js-comment-creator-email">{{{ $vm->getCreatorEmail($history) }}}</td>
                                        <td>{{{ $vm->getCourseName($history) }}}</td>
                                        <td><span title="{{{ $vm->getDiscussionTitle($history) }}}">{{{ textdotdot($vm->getDiscussionTitle($history), 40) }}}</span></td>
                                        <td><span title="{{{ $vm->getCommentText($history) }}}">{{{ textdotdot($vm->getCommentText($history), 100) }}}</span></td>
                                        <td>{{{ $vm->getCreatedAt($history) }}}</td>
                                        <td>
                                            <a href="{{{ $vm->getDiscussionUrl($history) }}}" class="btn btn-sm btn-primary">
                                                <span class="text-icon"><i class="fa fa-search-plus"></i></span>
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            @endif
                            </tbody>
                        </table>
                    </div>

                    <div class="d-flex mt-3 justify-content-end">
                        {{ $vm->getHistories()->appends(Input::query())->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
@stop
```

---

## D. File Baru — Integration Tests

## D1) `app/tests/IntegrationTests/Specifications/Users/Activities/LoadingUserDiscussionCommentHistoriesPageTest.php`

```php
<?php

namespace DicodingTest\IntegrationTests\Specifications\Users\Activities;

use Dicoding\Domain\DeveloperJourney\DiscussionComments\Enums\CourseDiscussionCommentStatus;
use Dicoding\Domain\DeveloperJourney\Commons\Enums\CourseDiscussionStatus;
use Dicoding\Domain\DeveloperJourney\Commons\Enums\DiscussionResolveStatus;
use DicodingUser;
use IntegrationTest;

class LoadingUserDiscussionCommentHistoriesPageTest extends IntegrationTest
{
    /**
     * @test
     */
    public function loadingUserDiscussionCommentHistoriesPage(): void
    {
        $targetUserId = 900;

        $discussionId = $this->insertNewData('developer_journey_discussions', [
            'course_id' => 3,
            'tutorial_id' => 1,
            'creator_id' => 1,
            'title' => 'Diskusi A',
            'question' => 'Q',
            'status' => CourseDiscussionStatus::PUBLISHED()->getValue(),
            'solved' => DiscussionResolveStatus::NOT_SOLVED()->getValue(),
        ]);

        $this->insertNewData('course_discussion_comments_new', [
            [
                'id' => 1001,
                'creator_id' => $targetUserId,
                'discussion_id' => $discussionId,
                'parent_id' => null,
                'comment' => 'Komentar target 1',
                'status' => CourseDiscussionCommentStatus::PUBLISHED()->getValue(),
            ],
            [
                'id' => 1002,
                'creator_id' => $targetUserId,
                'discussion_id' => $discussionId,
                'parent_id' => null,
                'comment' => 'Komentar target 2',
                'status' => CourseDiscussionCommentStatus::PUBLISHED()->getValue(),
            ],
            [
                'id' => 1003,
                'creator_id' => 1,
                'discussion_id' => $discussionId,
                'parent_id' => null,
                'comment' => 'Komentar orang lain',
                'status' => CourseDiscussionCommentStatus::PUBLISHED()->getValue(),
            ],
            [
                'id' => 1004,
                'creator_id' => $targetUserId,
                'discussion_id' => $discussionId,
                'parent_id' => null,
                'comment' => 'Komentar deleted',
                'status' => CourseDiscussionCommentStatus::DELETED()->getValue(),
            ],
        ]);

        $this->be(DicodingUser::find(2));
        $this->get(route('users.activities.discussion-comment-histories', ['id' => $targetUserId]));

        $this->assertResponseOk();

        $crawler = $this->client->getCrawler();
        $rows = $crawler->filter('.js-user-discussion-comment-history-row');
        self::assertEquals(2, $rows->count());

        $this->assertCurrentPageHasNoWarning();
    }
}
```

## D2) `app/tests/IntegrationTests/Specifications/Academies/Discussions/LoadingDiscussionCommentHistoriesAdminPageTest.php`

```php
<?php

namespace DicodingTest\IntegrationTests\Specifications\Academies\Discussions;

use Dicoding\Domain\DeveloperJourney\DiscussionComments\Enums\CourseDiscussionCommentStatus;
use Dicoding\Domain\DeveloperJourney\Commons\Enums\CourseDiscussionStatus;
use Dicoding\Domain\DeveloperJourney\Commons\Enums\DiscussionResolveStatus;
use DicodingUser;
use IntegrationTest;

class LoadingDiscussionCommentHistoriesAdminPageTest extends IntegrationTest
{
    /**
     * @test
     */
    public function loadingDiscussionCommentHistoriesAdminPage(): void
    {
        $discussionId = $this->insertNewData('developer_journey_discussions', [
            'course_id' => 1,
            'tutorial_id' => 1,
            'creator_id' => 5,
            'title' => 'Diskusi Uji',
            'question' => 'Isi',
            'status' => CourseDiscussionStatus::PUBLISHED()->getValue(),
            'solved' => DiscussionResolveStatus::NOT_SOLVED()->getValue(),
        ]);

        $this->insertNewData('course_discussion_comments_new', [
            [
                'creator_id' => 7,
                'discussion_id' => $discussionId,
                'comment' => 'Komentar 1',
                'status' => CourseDiscussionCommentStatus::PUBLISHED()->getValue(),
            ],
            [
                'creator_id' => 11,
                'discussion_id' => $discussionId,
                'comment' => 'Komentar 2',
                'status' => CourseDiscussionCommentStatus::PUBLISHED()->getValue(),
            ],
            [
                'creator_id' => 7,
                'discussion_id' => $discussionId,
                'comment' => 'Komentar 3',
                'status' => CourseDiscussionCommentStatus::PUBLISHED()->getValue(),
            ],
        ]);

        $this->be(DicodingUser::find(2));
        $this->get(route('academies.administrations.discussion-comment-histories'));

        $this->assertResponseOk();

        $crawler = $this->client->getCrawler();
        $rows = $crawler->filter('.js-discussion-comment-history-row');
        self::assertEquals(3, $rows->count());

        $this->assertCurrentPageHasNoWarning();
    }
}
```

---

## E. File Baru — Unit Tests

## E1) `app/tests/UnitTests/VM/Users/Activities/UserActivityDiscussionCommentHistoryVMTest.php`

```php
<?php

use Dicoding\Web\VM\Users\Activities\UserActivityDiscussionCommentHistoryVM;

class UserActivityDiscussionCommentHistoryVMTest extends BusinessCase
{
    /**
     * @test
     */
    public function itBuildsDiscussionCommentHistoryDataForUserPage(): void
    {
        $student = $this->createCourseStudent(['id' => 5], ['id' => 900])->getMemberInstance();
        $history = (object) [
            'comment_id' => 1001,
            'comment' => 'Komentar target',
            'created_at' => '2026-01-01 10:00:00',
            'discussion_id' => 200,
            'discussion_title' => 'Diskusi A',
            'course_id' => 3,
            'course_name' => 'Belajar Dasar',
        ];

        $vm = new UserActivityDiscussionCommentHistoryVM($student, [$history]);

        static::assertCount(1, $vm->getHistories());
        static::assertEquals('Belajar Dasar', $vm->getCourseName($history));
        static::assertEquals('Diskusi A', $vm->getDiscussionTitle($history));
        static::assertEquals('Komentar target', $vm->getCommentText($history));
        static::assertStringContainsString('/academies/3/discussions/200', $vm->getDiscussionUrl($history));
        static::assertStringContainsString('#comment-1001', $vm->getDiscussionUrl($history));
    }
}
```

## E2) `app/tests/UnitTests/VM/Academies/Admin/DiscussionCommentHistoriesVMTest.php`

```php
<?php

use Dicoding\Web\VM\Academies\Admin\DiscussionCommentHistoriesVM;
use Illuminate\Pagination\Paginator;

class DiscussionCommentHistoriesVMTest extends BusinessCase
{
    /**
     * @test
     */
    public function itBuildsDiscussionCommentHistoryDataForAdminPage(): void
    {
        $history = (object) [
            'comment_id' => 1001,
            'comment' => 'Komentar admin',
            'created_at' => '2026-01-01 10:00:00',
            'discussion_id' => 200,
            'discussion_title' => 'Diskusi A',
            'course_id' => 3,
            'course_name' => 'Belajar Dasar',
            'creator_name' => 'Budi',
            'creator_email' => 'budi@example.com',
        ];

        $paginator = new Paginator([$history], 30);
        $vm = new DiscussionCommentHistoriesVM($paginator);

        static::assertEquals('Budi', $vm->getCreatorName($history));
        static::assertEquals('budi@example.com', $vm->getCreatorEmail($history));
        static::assertEquals('Belajar Dasar', $vm->getCourseName($history));
        static::assertEquals('Diskusi A', $vm->getDiscussionTitle($history));
        static::assertStringContainsString('/academies/3/discussions/200', $vm->getDiscussionUrl($history));
        static::assertStringContainsString('#comment-1001', $vm->getDiscussionUrl($history));
    }
}
```

---

## F. Command Eksekusi

## F1) Jalankan test target
```bash
deck integration-test --filter=LoadingUserDiscussionCommentHistoriesPageTest
deck integration-test --filter=LoadingDiscussionCommentHistoriesAdminPageTest
deck unit-test --filter=UserActivityDiscussionCommentHistoryVMTest
deck unit-test --filter=DiscussionCommentHistoriesVMTest
```

## F2) Jalankan static analysis
```bash
deck psalm
```

## F3) Jika menambah class baru
```bash
deck composer dump-autoload
```

---

## G. Checklist Final

1. Tidak ada perubahan di `app/api_routes.php`.
2. Tidak ada file test baru di namespace/folder `Elites`.
3. Semua route/URL detail diskusi pakai parameter `discussionId`.
4. Komentar yang ditampilkan hanya status `PUBLISHED`.
5. View output user content selalu `{{{ ... }}}`.
