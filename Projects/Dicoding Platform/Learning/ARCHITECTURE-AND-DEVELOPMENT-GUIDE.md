---
date: 2026-10-13
updated: 2026-10-13
type: guide
tags: [guide, learning, dicoding, dicoding-platform]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Dicoding Platform - Complete Architecture & Development Guide

## Table of Contents
1. [Gambaran Besar Repo](#1-gambaran-besar-repo)
2. [Konsep Fundamental](#2-konsep-fundamental)
3. [Arsitektur DDD Dicoding](#3-arsitektur-ddd-dicoding)
4. [Flow Lengkap dari Request hingga Response](#4-flow-lengkap-dari-request-hingga-response)
5. [Studi Kasus: Implementasi Feature "Discussion Reaction"](#5-studi-kasus-implementasi-feature-discussion-reaction)

---

## 1. Gambaran Besar Repo

### 1.1 Struktur Folder Tingkat Atas

```
dicoding/
├── app/                          # Legacy Laravel 4.2 directory
│   ├── routes.php               # HTTP route definitions
│   ├── views/                   # Blade templates (legacy + new)
│   ├── database/migrations/     # Database migrations
│   ├── tests/                   # Test suite (Unit, Integration, Component)
│   └── commands/                # CLI commands (Artisan)
│
├── Dicoding/                     # Main codebase (DDD-based)
│   ├── Web/                     # Web Layer (HTTP concerns)
│   │   ├── Http/               # Actions, Responses
│   │   ├── VM/                 # View Models (data for templates)
│   │   └── Utils/              # Web utilities (routing, helpers)
│   │
│   ├── UseCases/               # Application Layer
│   │   └── {Domain}/          # Specifications (orchestration)
│   │
│   ├── Domain/                 # Domain Layer (business logic)
│   │   └── {Domain}/          # Aggregates, ValueObjects, Events, Services
│   │
│   ├── Infrastructure/         # Infrastructure Layer
│   │   ├── StorageGateways/   # Database queries
│   │   ├── QueryRepositories/ # Read-only queries (VMs)
│   │   ├── GlobalJobPushedHandlers/  # Job queue handlers
│   │   ├── GlobalDomainEventHandlers/ # Domain event listeners
│   │   └── WebServices/       # External API integration
│   │
│   ├── DomainServices/        # Shared domain logic (permission helpers)
│   ├── Exception/             # Custom exceptions
│   └── DicodingServiceProvider.php # DI container registration
│
├── DicodingUtils/              # Utility library
├── frontend/                   # React/TypeScript frontend (Vite)
├── public/                     # Static assets, compiled JS/CSS
├── resources/                  # Frontend components, SCSS
├── gulpfile.js/               # Legacy build system
└── docs/                       # Documentation

```

### 1.2 Alur Eksekusi Request Tingkat Tinggi

```
User Browser (HTTP Request)
           ↓
      app/routes.php  (Route definition & method binding)
           ↓
   Middleware Pipeline (Auth, CSRF, etc)
           ↓
   Dicoding/Web/Http/*/Action.php  (Thin HTTP handler)
           ↓
   Dicoding/UseCases/*/Specification.php  (Business orchestration)
           OR
   Dicoding/Infrastructure/QueryRepositories/* (For read operations)
           ↓
   Dicoding/Domain/*  (Pure business logic, events)
   AND
   Dicoding/Infrastructure/StorageGateways/*  (Database queries)
           ↓
   Domain Events Triggered
           ↓
   Dicoding/Infrastructure/GlobalDomainEventHandlers/*  (Side effects)
           ↓
   Dicoding/Web/Http/*/Response.php  (HTTP response builder)
           ↓
   app/views/*.blade.php  (Template rendering)
           ↓
   HTTP Response (HTML/JSON)
           ↓
   User Browser (Display)
```

---

## 2. Konsep Fundamental

### 2.1 Apa itu Route?

**Route** = Mapping antara URL path dan Action handler.

**File:** `app/routes.php`

**Contoh:**
```php
Route::get('academies/{id}/discussions', [
    'as' => 'academies.discussions.index',
    'uses' => AcademyDiscussionIndexAction::class,
]);
```

**Breakdown:**
- `GET` = HTTP method
- `academies/{id}/discussions` = URL path pattern
  - `{id}` = route parameter (course ID)
- `as` = route name (unique identifier for link generation)
- `uses` = Action class to invoke

**Di mana route digunakan:**
- Template: `route('academies.discussions.index', ['id' => 1])` → `/academies/1/discussions`
- Email: Link generation untuk deep linking
- Redirect: `redirect()->route('academies.discussions.index', ['id' => $courseId])`

**Middleware:**
```php
// Protected routes
Route::group(['middleware' => 'auth'], function() {
    Route::get(...) // Hanya bisa diakses user yang login
});
```

### 2.2 Apa itu Action?

**Action** = Thin HTTP handler yang menerima request dan mengembalikan response.

**Lokasi:** `Dicoding/Web/Http/{Domain}/{Entity}/Action.php`

**Tanggung jawab:**
1. ✅ Extract parameter dari HTTP request
2. ✅ Validate basic data (tipe, format)
3. ✅ Call UseCase/Repository
4. ✅ Return Payload (success/failure/error)

**Yang TIDAK boleh di Action:**
- ❌ Database query
- ❌ Business rule logic
- ❌ Permission check (di Specification atau Service)
- ❌ Rendering template

**Contoh:**
```php
class AcademyDiscussionIndexAction extends BaseController {
    public function __construct(
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly AcademyPageQueryRepositoryInterface $academyPageRepository,
        private readonly UserRoleHelper $userRoleHelper,
        // ... other dependencies
    ) { }

    public function __invoke(int $courseId): PayloadInterface {
        try {
            $payload = $this->payloadFactory->withSuccessfulPayload(
                $this->buildPayloadData($courseId)
            );
        } catch (ObjectNotFoundException $e) {
            $payload = $this->payloadFactory->withMissingPayload('Course tidak ditemukan');
        }
        return $payload;
    }

    private function buildPayloadData(int $courseId): array {
        // Call repository untuk fetch data
        // Build ViewModel
        // Return array untuk template
    }
}
```

### 2.3 Apa itu View Model (VM)?

**ViewModel** = Object yang hold data specifically untuk template rendering.

**Bukan Model database** - ViewModel adalah data **setelah** processing:
- Permission filtering sudah applied
- Data sudah diformat untuk display
- Computed properties (e.g., `getFormattedDate()`)
- Template-specific helpers (e.g., `canEditDiscussion()`)

**Lokasi:** `Dicoding/Web/VM/{Domain}/{Entity}/{EntityName}VM.php`

**Contoh: `AcademyDiscussionVM`**
```php
class AcademyDiscussionVM {
    private array $discussions;
    private array $tutorials;
    private array $keywords;
    private bool $canManage;
    private bool $canOpen;

    public function __construct(
        array $discussions,
        array $tutorials,
        array $keywords,
        bool $canManage,
        bool $canOpen
    ) {
        $this->discussions = $discussions;
        $this->tutorials = $tutorials;
        $this->keywords = $keywords;
        $this->canManage = $canManage;
        $this->canOpen = $canOpen;
    }

    // Getter methods
    public function getDiscussions(): array { return $this->discussions; }
    public function canOpenDiscussion(): bool { return $this->canOpen; }

    // Template helper methods
    public function hasPermissionToCreateDiscussion(): bool {
        // Logic: bisa create kalau canOpen && (enrolled atau admin)
        return $this->canOpen && auth()->user()->?->isEnrolled();
    }
}
```

**Di Template:**
```blade.php
@if($discussionVM->canOpenDiscussion())
    <div class="discussions-container">
        @foreach($discussionVM->getDiscussions() as $discussion)
            <div class="discussion-item">
                {{ $discussion->title }}
                @if($discussionVM->canManage())
                    <a href="#edit">Edit</a>
                @endif
            </div>
        @endforeach
    </div>
@else
    <p>Anda tidak memiliki akses</p>
@endif
```

### 2.4 Apa itu Specification?

**Specification** = UseCase orchestrator yang menangani business workflow.

**Lokasi:** `Dicoding/UseCases/{Domain}/{EntityAction}Specification.php`

**Tanggung jawab:**
1. ✅ Validasi input data
2. ✅ Check permission & authorization
3. ✅ Call Domain Aggregate/Service untuk business logic
4. ✅ Handle exceptions
5. ✅ Return Payload (success/failure)

**Contoh: `AcademyDiscussionStoreSpecification`**
```php
class AcademyDiscussionStoreSpecification extends UseCaseSpecification {
    protected static $dataValidationRules = [
        'course_id' => 'required|integer|min:1',
        'title' => 'required|string|min:5|max:255',
        'content' => 'required|string|min:10',
        'tutorial_id' => 'required|integer|min:1',
    ];

    public function runSpecification(array $useCaseData = []): PayloadInterface {
        try {
            // Validate input
            // Check authorization
            // Create aggregate
            // Save to database
            // Raise domain event
            // Return success payload
        } catch (AuthorizationException $e) {
            return $this->payloadFactory->withAuthorizationExceptionPayload($e);
        }
    }
}
```

### 2.5 Apa itu Domain Layer?

**Domain Layer** = Tempat pure business logic yang independent dari framework.

**4 Komponen Utama:**

#### A. Aggregate Root
Boundary untuk state management, harus selalu valid.
```php
class NewDiscussion {
    private int $courseId;
    private string $title;
    private string $content;
    private int $creatorId;
    private string $status = 'draft';

    public function __construct(int $courseId, string $title, string $content, int $creatorId) {
        // Validate all inputs
        if (strlen($title) < 5) throw new InvariantException('Title terlalu pendek');
        if (strlen($content) < 10) throw new InvariantException('Content terlalu pendek');

        $this->courseId = $courseId;
        $this->title = $title;
        $this->content = $content;
        $this->creatorId = $creatorId;
    }

    public function publish(): void {
        if ($this->status !== 'draft') throw new InvariantException('Hanya draft bisa published');
        $this->status = 'published';
        $this->recordEvent(new DiscussionWasPublished($this->courseId, $this->id));
    }
}
```

#### B. ValueObject
Immutable object yang represent business concept.
```php
class DiscussionTitle {
    private string $value;

    public function __construct(string $value) {
        if (strlen($value) < 5) throw new InvariantException('Title minimal 5 karakter');
        $this->value = $value;
    }

    public function toString(): string { return $this->value; }
    public function equals(DiscussionTitle $other): bool {
        return $this->value === $other->value;
    }
}
```

#### C. Domain Event
Notification bahwa sesuatu terjadi di domain.
```php
class DiscussionWasCreated {
    public function __construct(
        private int $discussionId,
        private int $courseId,
        private int $creatorId,
        private string $title
    ) {}

    public function getDiscussionId(): int { return $this->discussionId; }
    // ... getters
}
```

#### D. Domain Service
Stateless service untuk business logic yang span multiple aggregates.
```php
class CourseDiscussionPermissionHelper {
    public function canOpen(int $courseId, UserRoleHelper $userRoleHelper): bool {
        // Check: user authenticated?
        // Check: user enrolled?
        // Check: user is admin?
        // Check: discussion published?
    }

    public function canManage(int $courseId, UserRoleHelper $userRoleHelper): bool {
        // Check: user is instructor of this course?
        // Check: user is admin?
    }
}
```

### 2.6 Apa itu QueryRepository?

**QueryRepository** = Read-only data fetching untuk construct ViewModels.

**BERBEDA dari Specification:**
- Specification: Untuk CREATE/UPDATE/DELETE + business logic
- QueryRepository: Untuk READ-ONLY + ViewModel building

**Lokasi:** `Dicoding/Infrastructure/QueryRepositories/{Domain}/PageQueryRepository.php`

**Contoh:**
```php
class AcademyPageQueryRepository implements AcademyPageQueryRepositoryInterface {
    public function constructDiscussionVM(
        UserRoleHelper $userRoleHelper,
        object $course,
        array $filters = []
    ): AcademyDiscussionVM {
        $courseId = (int)$course->id;
        $userId = $userRoleHelper->getUserId();

        // Check permission
        $permissionHelper = new CourseDiscussionPermissionHelper();
        $canManage = $permissionHelper->canManage($courseId, $userRoleHelper);
        $canOpen = $permissionHelper->canOpen($courseId, $userRoleHelper);

        // Fetch discussions (apply permission filter)
        $discussions = $this->academyDiscussionGateway
            ->getDiscussionsForNewUI($filters, $canManage, $courseId);

        // Fetch related data
        $tutorials = $this->tutorialGateway->getPublishedTutorialList($courseId);
        $keywords = $this->academyDiscussionGateway->getPopularKeywordsOnCourse($courseId, 15);

        // Build ViewModel
        return new AcademyDiscussionVM(
            $discussions,
            $tutorials,
            $keywords,
            $canManage,
            $canOpen
        );
    }
}
```

### 2.7 Apa itu Gateway?

**Gateway** = Infrastructure class untuk database queries.

**Lokasi:** `Dicoding/Infrastructure/StorageGateways/{Domain}/{Entity}Gateway.php`

**Tanggung jawab:**
- Execute SQL queries (via Eloquent atau raw SQL)
- Handle database transactions
- Map raw database rows ke objects
- Implement caching strategy

**Contoh:**
```php
class AcademyDiscussionGateway {
    public function getDiscussionsForNewUI(
        array $filters,
        bool $canManageAll,
        int $courseId
    ): array {
        $query = DeveloperJourneyDiscussion::where('course_id', $courseId);

        // Jika bukan manager, hanya show published
        if (!$canManageAll) {
            $query->where('status', 'published');
        }

        // Apply filters
        if (!empty($filters['title'])) {
            $query->where('title', 'like', '%' . $filters['title'] . '%');
        }

        return $query->paginate(50)->items();
    }

    public function findById(int $discussionId): ?object {
        return Cache::tags(['discussions'])
            ->remember("discussion:{$discussionId}", 3600, function () use ($discussionId) {
                return DeveloperJourneyDiscussion::find($discussionId);
            });
    }
}
```

### 2.8 Apa itu Response?

**Response** = HTTP response builder yang map Payload to actual HTTP response.

**Lokasi:** `Dicoding/Web/Http/{Domain}/{Entity}Response.php`

**Tanggung jawab:**
- Cek status Payload (SUCCESS/FAILURE/ERROR)
- Render template atau redirect
- Inject data ke template

**Contoh:**
```php
class AcademyDiscussionIndexResponse implements Responsable {
    public function with(PayloadInterface $payload) {
        if ($payload->getStatus() !== PayloadStatus::SUCCESS) {
            return redirect()->route('academies.list')
                ->with('warning_message', $payload->getMessages());
        }

        if (Feature::isEnabled('classroom_v3.0')) {
            return view('ui.v3.discussions.index', $payload->getOutput());
        }

        return view('ui.newacademies.discussions.index', $payload->getOutput());
    }
}
```

---

## 3. Arsitektur DDD Dicoding

### 3.1 4-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  WEB LAYER (HTTP Concerns)                              │
│  - Routes (app/routes.php)                             │
│  - Actions (Dicoding/Web/Http/*/Action)                │
│  - Responses (Dicoding/Web/Http/*/Response)            │
│  - ViewModels (Dicoding/Web/VM/*)                      │
│  - Templates (app/views/)                              │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  APPLICATION LAYER (Orchestration)                      │
│  - UseCaseSpecifications (Dicoding/UseCases/*/*)        │
│  - QueryRepositories (read-only)                        │
│  - Payload Factory (success/error wrapper)              │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  DOMAIN LAYER (Pure Business Logic)                     │
│  - Aggregates (encapsulate state + invariants)          │
│  - ValueObjects (immutable business concepts)           │
│  - Events (what happened in the domain)                 │
│  - Services (business logic without state)              │
│  - Repositories (interface definitions)                 │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  INFRASTRUCTURE LAYER (Implementation)                  │
│  - StorageGateways (implements Repository interface)    │
│  - Database queries (Eloquent ORM)                      │
│  - Cache management                                     │
│  - External API calls                                   │
│  - Event handlers (side effects)                        │
│  - Job queue handlers                                   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow Diagram

```
REQUEST comes in
       ↓
Route matches → Action extracted
       ↓
Action.__invoke() called
       ├─ (IF READ operation) → QueryRepository
       │                        ├─ Fetch from Gateway/Cache
       │                        ├─ Check permission
       │                        ├─ Build ViewModel
       │                        └─ Return ViewModel
       │
       └─ (IF WRITE operation) → Specification
                                 ├─ Validate input
                                 ├─ Check authorization
                                 ├─ Call Domain Aggregate
                                 │  ├─ Validate state changes
                                 │  ├─ Record domain events
                                 │  └─ Return modified aggregate
                                 ├─ Call Gateway to persist
                                 ├─ Trigger Domain Events
                                 │  ├─ Event 1 → Handler 1
                                 │  ├─ Event 2 → Handler 2 (email, points, etc)
                                 │  └─ Event N → Handler N
                                 └─ Return success/failure payload
       ↓
Response.with(Payload) called
       ├─ Check Payload status
       ├─ (IF FAILURE) → Redirect + error message
       └─ (IF SUCCESS) → Render template with data
           ↓
       Blade template gets ViewModel
           ├─ Access $vm->getSomething()
           ├─ Check $vm->canDoSomething()
           └─ Render HTML
           ↓
       Browser receives HTML/JSON
```

---

## 4. Flow Lengkap dari Request hingga Response

### Contoh: GET /academies/1/discussions (List Discussions)

```
Step 1: Browser Request
═══════════════════════════════════════════════════════════
GET /academies/1/discussions HTTP/1.1

Route Match: app/routes.php
──────────────────────────────────────────────────────────
Route::get('academies/{id}/discussions', [
    'as' => 'academies.discussions.index',
    'uses' => AcademyDiscussionIndexAction::class,
]);

Parameters extracted: $courseId = 1


Step 2: Middleware Pipeline
═══════════════════════════════════════════════════════════
- Auth check: User logged in? ✓
- CSRF validation: ✓
- Permission: Part of auth middleware ✓


Step 3: Action Called
═══════════════════════════════════════════════════════════
AcademyDiscussionIndexAction::__invoke(1)

  // Inject dependencies
  $courseId = 1
  $userRoleHelper → current user context
  $academyPageRepository → query repo
  $payloadFactory → payload wrapper

  // Get course
  $course = $this->academyGateway->getCourseWithRelations(1)
  // → SELECT * FROM developer_journeys WHERE id = 1 + related tables

  // Check access
  if (!$this->permissionService->canOpenCourse($userRoleHelper, $course)) {
      throw AuthorizationException
  }

  // Build data
  $vm = $this->academyPageRepository
      ->constructDiscussionVMWithExistingStudentOnCourseVM(
          $studentVM, $userRoleHelper, $parameters
      )

  // Return payload
  return $this->payloadFactory->withSuccessfulPayload($this->buildPayloadData($courseId))


Step 4: QueryRepository Processing
═══════════════════════════════════════════════════════════
AcademyPageQueryRepository::constructDiscussionVMWithExistingStudentOnCourseVM()

  $courseId = 1
  $userRoleHelper = current user

  // Check permissions
  $permissionHelper = new CourseDiscussionPermissionHelper()
  $canManage = $permissionHelper->canManage(1, $userRoleHelper)
      → Is user instructor/admin of course 1? → false (regular student)
  $canOpen = $permissionHelper->canOpen(1, $userRoleHelper)
      → Is user enrolled in course 1? → true (student enrolled)

  // Fetch discussions
  $discussions = $this->academyDiscussionGateway
      ->getDiscussionsForNewUI($filters, false, 1)

  // SQL Query (simplified):
  // SELECT * FROM developer_journey_discussions 
  // WHERE course_id = 1 
  // AND status = 'published'  ← because canManage = false
  // ORDER BY created_at DESC 
  // LIMIT 50

  // Fetch tutorials (modules)
  $tutorials = $this->tutorialGateway->getPublishedTutorialList(1)

  // Fetch keywords
  $keywords = $this->academyDiscussionGateway
      ->getPopularKeywordsOnCourse(1, 15)

  // Build ViewModel
  return new AcademyDiscussionVM(
      discussions: $discussions,
      tutorials: $tutorials,
      keywords: $keywords,
      canManage: false,
      canOpen: true
  )


Step 5: Payload Assembly
═══════════════════════════════════════════════════════════
$payload = new SuccessPayload([
    'vm' => $studentOnCourseVM,  // course info
    'discussionVM' => $discussionVM,  // discussions list + metadata
    'parameters' => $parameters,
    'visitorCanEditCourse' => false,
    'hasModuleCategory' => true,
])


Step 6: Response Class Processes Payload
═══════════════════════════════════════════════════════════
AcademyDiscussionIndexResponse::with($payload)

  $status = $payload->getStatus()  // SUCCESS

  if ($status === PayloadStatus::SUCCESS) {
      if (Feature::isEnabled('classroom_v3.0')) {
          return view('ui.v3.discussions.index', $payload->getOutput())
      } else {
          return view('ui.newacademies.discussions.index', $payload->getOutput())
      }
  }


Step 7: Blade Template Rendering
═══════════════════════════════════════════════════════════
File: app/views/ui/v3/discussions/index.blade.php

@extends('ui.layouts.commons.academies')

@section('content')
    @include('ui.commons.newsessionmessage')
    @include('ui.v3.discussions.widgets.top-nav')
    @include('ui.v3.discussions.partials.header')

    @if($discussionVM->canOpenDiscussion())
        @include('ui.v3.discussions.partials.main')
        
        // Template gets: $vm (StudentOnCourseVM), $discussionVM (AcademyDiscussionVM)
        
        <h2>{{ $vm->getCourseName() }}</h2>
        <div class="discussions">
            @foreach($discussionVM->getDiscussions() as $discussion)
                <div class="discussion-item">
                    <h3>{{ $discussion->title }}</h3>
                    <p>{{ $discussion->content }}</p>
                    <small>by {{ $discussion->author_name }} at {{ $discussion->created_at }}</small>

                    @if($discussionVM->canManage())
                        <a href="{{ route('academies.discussions.edit', ['id' => $vm->getCourseId(), 'discussionId' => $discussion->id]) }}">Edit</a>
                    @endif
                </div>
            @endforeach
        </div>
    @else
        <p>Anda tidak memiliki izin untuk mengakses diskusi ini!</p>
    @endif
@endsection


Step 8: HTML Generated & Sent to Browser
═══════════════════════════════════════════════════════════
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 5432

<!DOCTYPE html>
<html>
<head>
    <title>Dicoding Academy - Diskusi</title>
</head>
<body>
    <h1>Dicoding Academy - Diskusi</h1>
    
    <div class="discussions">
        <div class="discussion-item">
            <h3>Bagaimana cara membuat REST API?</h3>
            <p>Saya bingung tentang best practice REST API design...</p>
            <small>by Budi at 2026-05-06 10:30:00</small>
        </div>
        <div class="discussion-item">
            <h3>Laravel middleware itu apa?</h3>
            <p>Bisakah dijelaskan middleware dalam Laravel...</p>
            <small>by Ani at 2026-05-06 09:15:00</small>
        </div>
    </div>
</body>
</html>


Step 9: Browser Renders
═══════════════════════════════════════════════════════════
User sees: List of discussions with titles, content preview, author, date
```

---

## 5. Studi Kasus: Implementasi Feature "Discussion Reaction"

### 5.1 Feature Requirement

**User Story:**
```
Sebagai student yang sedang mengikuti course,
Aku ingin memberikan reaksi (emoji) pada diskusi atau comment,
Sehingga aku bisa express feelings atau agreement terhadap discussion thread.
```

**Requirements:**
- Reactions: 👍 (like), ❤️ (love), 😂 (haha), 😢 (sad), 😲 (wow)
- Bisa react pada:
  1. Diskusi (parent discussion)
  2. Comment (individual comment)
- User bisa remove reaction
- Show reaction count di UI
- Only enrolled students dapat react

**Database Tables Needed:**
```sql
-- New table untuk track reactions
CREATE TABLE `discussion_reactions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `discussion_id` BIGINT UNSIGNED,
    `comment_id` BIGINT UNSIGNED,
    `user_id` INT,
    `reaction_type` VARCHAR(20), -- 'like', 'love', 'haha', 'sad', 'wow'
    `created_at` TIMESTAMP,
    UNIQUE KEY `unique_reaction` (discussion_id, comment_id, user_id, reaction_type),
    FOREIGN KEY (`discussion_id`) REFERENCES `developer_journey_discussions`(id),
    FOREIGN KEY (`comment_id`) REFERENCES `course_discussion_comments_new`(id),
    FOREIGN KEY (`user_id`) REFERENCES `users`(id)
);

-- Summary table untuk performa
CREATE TABLE `discussion_reaction_summaries` (
    `discussion_id` BIGINT UNSIGNED,
    `comment_id` BIGINT UNSIGNED,
    `reaction_type` VARCHAR(20),
    `count` INT DEFAULT 0,
    PRIMARY KEY (discussion_id, comment_id, reaction_type),
    FOREIGN KEY (`discussion_id`) REFERENCES `developer_journey_discussions`(id),
    FOREIGN KEY (`comment_id`) REFERENCES `course_discussion_comments_new`(id)
);
```

### 5.2 Complete Implementation

#### Step 1: Create Domain Model

**File:** `Dicoding/Domain/DeveloperJourney/Discussions/ValueObjects/DiscussionReaction.php`

```php
<?php

namespace Dicoding\Domain\DeveloperJourney\Discussions\ValueObjects;

use Dicoding\Domain\Common\ValueObject;
use Dicoding\Exception\InvariantException;

class DiscussionReaction extends ValueObject {
    private const ALLOWED_REACTIONS = ['like', 'love', 'haha', 'sad', 'wow'];

    private string $type;
    private int $discussionId;
    private ?int $commentId;
    private int $userId;

    public function __construct(
        string $type,
        int $discussionId,
        ?int $commentId,
        int $userId
    ) {
        if (!in_array($type, self::ALLOWED_REACTIONS)) {
            throw new InvariantException(
                "Reaction type '{$type}' tidak valid. Pilihan: " . implode(', ', self::ALLOWED_REACTIONS)
            );
        }

        if ($discussionId <= 0) {
            throw new InvariantException('Discussion ID harus > 0');
        }

        if ($userId <= 0) {
            throw new InvariantException('User ID harus > 0');
        }

        $this->type = $type;
        $this->discussionId = $discussionId;
        $this->commentId = $commentId;
        $this->userId = $userId;
    }

    public function getType(): string { return $this->type; }
    public function getDiscussionId(): int { return $this->discussionId; }
    public function getCommentId(): ?int { return $this->commentId; }
    public function getUserId(): int { return $this->userId; }
}
```

#### Step 2: Create Domain Service

**File:** `Dicoding/Domain/DeveloperJourney/Discussions/Services/DiscussionReactionService.php`

```php
<?php

namespace Dicoding\Domain\DeveloperJourney\Discussions\Services;

use Dicoding\Domain\DeveloperJourney\Discussions\ValueObjects\DiscussionReaction;
use Dicoding\Exception\InvariantException;

class DiscussionReactionService {
    public function validateReaction(DiscussionReaction $reaction): void {
        // Validation logic
        if (empty($reaction->getDiscussionId())) {
            throw new InvariantException('Discussion ID diperlukan');
        }

        // Can add more business rules:
        // - Check if discussion exists
        // - Check if comment exists (if commentId provided)
        // - Check if user has permission to react
    }
}
```

#### Step 3: Create Domain Event

**File:** `Dicoding/Domain/DeveloperJourney/Discussions/Events/DiscussionReactionWasAdded.php`

```php
<?php

namespace Dicoding\Domain\DeveloperJourney\Discussions\Events;

use Dicoding\Domain\DeveloperJourney\Discussions\ValueObjects\DiscussionReaction;

class DiscussionReactionWasAdded {
    private DiscussionReaction $reaction;
    private int $occurredAt;

    public function __construct(DiscussionReaction $reaction) {
        $this->reaction = $reaction;
        $this->occurredAt = time();
    }

    public function getReaction(): DiscussionReaction { return $this->reaction; }
    public function getOccurredAt(): int { return $this->occurredAt; }
}
```

#### Step 4: Create Gateway

**File:** `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/DiscussionReactionGateway.php`

```php
<?php

namespace Dicoding\Infrastructure\StorageGateways\Academies\Discussions;

use Dicoding\Domain\DeveloperJourney\Discussions\ValueObjects\DiscussionReaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DiscussionReactionGateway {
    public function addReaction(DiscussionReaction $reaction): void {
        $discussionId = $reaction->getDiscussionId();
        $commentId = $reaction->getCommentId();
        $userId = $reaction->getUserId();
        $reactionType = $reaction->getType();

        // Insert reaction
        DB::table('discussion_reactions')->insert([
            'discussion_id' => $discussionId,
            'comment_id' => $commentId,
            'user_id' => $userId,
            'reaction_type' => $reactionType,
            'created_at' => now(),
        ]);

        // Update summary
        $this->incrementReactionCount($discussionId, $commentId, $reactionType);

        // Invalidate cache
        Cache::tags(['discussions', "discussion:{$discussionId}"])
            ->flush();
    }

    public function removeReaction(int $discussionId, ?int $commentId, int $userId, string $reactionType): void {
        // Delete reaction
        DB::table('discussion_reactions')
            ->where('discussion_id', $discussionId)
            ->where('comment_id', $commentId)
            ->where('user_id', $userId)
            ->where('reaction_type', $reactionType)
            ->delete();

        // Update summary
        $this->decrementReactionCount($discussionId, $commentId, $reactionType);

        // Invalidate cache
        Cache::tags(['discussions', "discussion:{$discussionId}"])
            ->flush();
    }

    public function getReactionSummary(int $discussionId, ?int $commentId): array {
        return Cache::tags(['discussions', "discussion:{$discussionId}"])
            ->remember(
                "reactions:{$discussionId}:{$commentId}",
                3600,
                function () use ($discussionId, $commentId) {
                    return DB::table('discussion_reaction_summaries')
                        ->where('discussion_id', $discussionId)
                        ->where('comment_id', $commentId)
                        ->get()
                        ->groupBy('reaction_type')
                        ->map(fn($items) => $items->sum('count'))
                        ->toArray();
                }
            );
    }

    public function getUserReaction(int $discussionId, ?int $commentId, int $userId): ?string {
        return DB::table('discussion_reactions')
            ->where('discussion_id', $discussionId)
            ->where('comment_id', $commentId)
            ->where('user_id', $userId)
            ->value('reaction_type');
    }

    private function incrementReactionCount(int $discussionId, ?int $commentId, string $reactionType): void {
        DB::table('discussion_reaction_summaries')
            ->updateOrInsert(
                [
                    'discussion_id' => $discussionId,
                    'comment_id' => $commentId,
                    'reaction_type' => $reactionType,
                ],
                ['count' => DB::raw('count + 1')]
            );
    }

    private function decrementReactionCount(int $discussionId, ?int $commentId, string $reactionType): void {
        DB::table('discussion_reaction_summaries')
            ->where('discussion_id', $discussionId)
            ->where('comment_id', $commentId)
            ->where('reaction_type', $reactionType)
            ->decrement('count');
    }
}
```

#### Step 5: Create UseCase Specification

**File:** `Dicoding/UseCases/Academies/DiscussionReactions/AddDiscussionReactionSpecification.php`

```php
<?php

namespace Dicoding\UseCases\Academies\DiscussionReactions;

use Aura\Payload_Interface\PayloadInterface;
use Dicoding\Domain\DeveloperJourney\Discussions\Events\DiscussionReactionWasAdded;
use Dicoding\Domain\DeveloperJourney\Discussions\Services\DiscussionReactionService;
use Dicoding\Domain\DeveloperJourney\Discussions\ValueObjects\DiscussionReaction;
use Dicoding\Domain\Payloads\PayloadFactoryInterface;
use Dicoding\DomainServices\CourseDiscussionPermission\CourseDiscussionPermissionHelper;
use Dicoding\Exception\AuthenticationException;
use Dicoding\Exception\InvariantException;
use Dicoding\Exception\ObjectNotFoundException;
use Dicoding\Infrastructure\StorageGateways\Academies\Discussions\AcademyDiscussionGateway;
use Dicoding\Infrastructure\StorageGateways\Academies\Discussions\DiscussionCommentGateway;
use Dicoding\Infrastructure\StorageGateways\Academies\Discussions\DiscussionReactionGateway;
use Dicoding\UseCases\Contracts\UseCaseSpecification;
use Dicoding\DomainServices\UserRoles\UserRoleHelper;

class AddDiscussionReactionSpecification extends UseCaseSpecification {
    protected static $dataValidationRules = [
        'discussion_id' => 'required|integer|min:1',
        'comment_id' => 'nullable|integer|min:1',
        'reaction_type' => 'required|in:like,love,haha,sad,wow',
        'course_id' => 'required|integer|min:1',
    ];

    public function __construct(
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly AcademyDiscussionGateway $discussionGateway,
        private readonly DiscussionCommentGateway $commentGateway,
        private readonly DiscussionReactionGateway $reactionGateway,
        private readonly DiscussionReactionService $reactionService,
        private readonly UserRoleHelper $userRoleHelper,
    ) {}

    public function runSpecification(array $useCaseData = []): PayloadInterface {
        try {
            return $this->processReaction($useCaseData);
        } catch (AuthenticationException $e) {
            return $this->payloadFactory->withAuthenticationExceptionPayload($e, $useCaseData);
        } catch (ObjectNotFoundException $e) {
            return $this->payloadFactory->withMissingPayload($e->getMessage(), $useCaseData);
        } catch (InvariantException $e) {
            return $this->payloadFactory->withInvariantExceptionPayload($e, $useCaseData);
        }
    }

    private function processReaction(array $useCaseData): PayloadInterface {
        // Step 1: Validate user is authenticated
        if (!$this->userRoleHelper->isAuthed()) {
            throw new AuthenticationException('Harus login untuk memberikan reaksi');
        }

        $userId = $this->userRoleHelper->getUserId();
        $courseId = (int)$useCaseData['course_id'];
        $discussionId = (int)$useCaseData['discussion_id'];
        $commentId = $useCaseData['comment_id'] ? (int)$useCaseData['comment_id'] : null;
        $reactionType = $useCaseData['reaction_type'];

        // Step 2: Check permission to access discussion
        $permissionHelper = new CourseDiscussionPermissionHelper();
        if (!$permissionHelper->canOpen($courseId, $this->userRoleHelper)) {
            throw new AuthenticationException('Anda tidak memiliki akses ke diskusi ini');
        }

        // Step 3: Verify discussion exists
        $discussion = $this->discussionGateway->findById($discussionId);
        if (empty($discussion) || $discussion->course_id != $courseId) {
            throw new ObjectNotFoundException('Diskusi tidak ditemukan');
        }

        // Step 4: If commenting, verify comment exists and belongs to discussion
        if ($commentId) {
            $comment = $this->commentGateway->findById($commentId);
            if (empty($comment) || $comment->discussion_id != $discussionId) {
                throw new ObjectNotFoundException('Comment tidak ditemukan');
            }
        }

        // Step 5: Create and validate reaction domain object
        $reaction = new DiscussionReaction($reactionType, $discussionId, $commentId, $userId);
        $this->reactionService->validateReaction($reaction);

        // Step 6: Check if user already reacted with this type
        $existingReaction = $this->reactionGateway->getUserReaction($discussionId, $commentId, $userId);

        if ($existingReaction === $reactionType) {
            // Toggle off: Remove reaction
            $this->reactionGateway->removeReaction($discussionId, $commentId, $userId, $reactionType);
            $message = 'Reaksi dihapus';
        } else {
            // Add or replace reaction
            if ($existingReaction) {
                $this->reactionGateway->removeReaction($discussionId, $commentId, $userId, $existingReaction);
            }

            $this->reactionGateway->addReaction($reaction);

            // Record domain event
            event(new DiscussionReactionWasAdded($reaction));

            $message = 'Reaksi ditambahkan';
        }

        // Step 7: Get updated summary
        $reactionSummary = $this->reactionGateway->getReactionSummary($discussionId, $commentId);

        return $this->payloadFactory->withSuccessfulPayload([
            'discussion_id' => $discussionId,
            'comment_id' => $commentId,
            'reaction_summary' => $reactionSummary,
            'user_reaction' => $this->reactionGateway->getUserReaction($discussionId, $commentId, $userId),
        ], [], $message);
    }
}
```

#### Step 6: Create Web Action

**File:** `Dicoding/Web/Http/Academies/Discussion/DiscussionReactionStoreAction.php`

```php
<?php

namespace Dicoding\Web\Http\Academies\Discussion;

use Aura\Payload_Interface\PayloadInterface;
use BaseController;
use Dicoding\UseCases\Academies\DiscussionReactions\AddDiscussionReactionSpecification;
use Dicoding\Domain\Payloads\PayloadFactoryInterface;
use Illuminate\Http\Request;

class DiscussionReactionStoreAction extends BaseController {
    public function __construct(
        private readonly Request $request,
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly AddDiscussionReactionSpecification $addReactionSpecification,
    ) {
        parent::__construct();
    }

    public function __invoke(int $courseId, int $discussionId): PayloadInterface {
        $payload = $this->addReactionSpecification->runSpecification([
            'course_id' => $courseId,
            'discussion_id' => $discussionId,
            'comment_id' => $this->request->input('comment_id'),
            'reaction_type' => $this->request->input('reaction_type'),
        ]);

        return $payload;
    }
}
```

#### Step 7: Create Response Class

**File:** `Dicoding/Web/Http/Academies/Discussion/DiscussionReactionStoreResponse.php`

```php
<?php

namespace Dicoding\Web\Http\Academies\Discussion;

use Aura\Payload_Interface\PayloadInterface;
use Aura\Payload_Interface\PayloadStatus;
use Dicoding\Web\Http\Responsable;
use Illuminate\Http\JsonResponse;

class DiscussionReactionStoreResponse implements Responsable {
    public function with(PayloadInterface $payload) {
        if ($payload->getStatus() !== PayloadStatus::SUCCESS) {
            return new JsonResponse([
                'success' => false,
                'message' => $payload->getMessages(),
            ], 400);
        }

        return new JsonResponse([
            'success' => true,
            'message' => $payload->getMessages(),
            'data' => $payload->getOutput(),
        ], 200);
    }
}
```

#### Step 8: Add Route

**File:** `app/routes.php`

```php
Route::post('academies/{id}/discussions/{discussionId}/reaction', [
    'as' => 'academies.discussions.reaction.store',
    'uses' => \Dicoding\Web\Http\Academies\Discussion\DiscussionReactionStoreAction::class,
])->middleware('auth');
```

#### Step 9: Update ViewModel

**File:** `Dicoding/Web/VM/Academies/Discussion/AcademyDiscussionShowVM.php` (tambahan)

```php
private array $reactionSummary = [];
private ?string $userReaction = null;

public function __construct(/* existing params */, array $reactionSummary = [], ?string $userReaction = null) {
    // ... existing code
    $this->reactionSummary = $reactionSummary;
    $this->userReaction = $userReaction;
}

public function getReactionSummary(): array { return $this->reactionSummary; }
public function getUserReaction(): ?string { return $this->userReaction; }
public function getReactionEmoji(string $type): string {
    return match($type) {
        'like' => '👍',
        'love' => '❤️',
        'haha' => '😂',
        'sad' => '😢',
        'wow' => '😲',
        default => '👍'
    };
}
```

#### Step 10: Create Blade Template Component

**File:** `app/views/ui/v3/discussions/components/reaction-buttons.blade.php`

```blade.php
<div class="discussion-reactions">
    @php
        $reactionTypes = ['like' => '👍', 'love' => '❤️', 'haha' => '😂', 'sad' => '😢', 'wow' => '😲'];
        $reactionSummary = $discussionVM->getReactionSummary();
        $userReaction = $discussionVM->getUserReaction();
    @endphp

    <div class="reaction-buttons">
        @foreach($reactionTypes as $type => $emoji)
            <button 
                class="reaction-btn {{ $userReaction === $type ? 'active' : '' }}"
                data-reaction="{{ $type }}"
                data-discussion-id="{{ $discussionId }}"
                data-comment-id="{{ $commentId ?? null }}"
                data-course-id="{{ $courseId }}"
                title="{{ ucfirst($type) }}"
            >
                <span class="emoji">{{ $emoji }}</span>
                @if(!empty($reactionSummary[$type]))
                    <span class="count">{{ $reactionSummary[$type] }}</span>
                @endif
            </button>
        @endforeach
    </div>
</div>

<script>
document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const reactionType = this.dataset.reaction;
        const discussionId = this.dataset.discussionId;
        const commentId = this.dataset.commentId;
        const courseId = this.dataset.courseId;

        fetch(`/academies/${courseId}/discussions/${discussionId}/reaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
                reaction_type: reactionType,
                comment_id: commentId,
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Update UI with new reaction summary
                location.reload(); // Or do partial update
            }
        });
    });
});
</script>

<style>
.reaction-buttons {
    display: flex;
    gap: 8px;
}

.reaction-btn {
    border: 1px solid #e0e0e0;
    background: white;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
}

.reaction-btn:hover {
    border-color: #999;
    background: #f5f5f5;
}

.reaction-btn.active {
    background: #f0f0ff;
    border-color: #5a5aff;
}

.reaction-btn .emoji {
    font-size: 18px;
}

.reaction-btn .count {
    font-size: 12px;
    color: #666;
}
</style>
```

#### Step 11: Update Discussion Show Template

**File:** `app/views/ui/v3/discussions/show.blade.php` (tambahan)

```blade.php
<div class="discussion-detail">
    <!-- Discussion content -->
    <h2>{{ $discussionVM->getTitle() }}</h2>
    <p>{{ $discussionVM->getContent() }}</p>

    <!-- Reactions for discussion -->
    @include('ui.v3.discussions.components.reaction-buttons', [
        'discussionId' => $discussionVM->getId(),
        'commentId' => null,
        'courseId' => $vm->getCourseId(),
        'discussionVM' => $discussionVM,
    ])

    <!-- Comments section -->
    <div class="comments">
        @foreach($comments as $comment)
            <div class="comment">
                <p>{{ $comment->content }}</p>
                <small>by {{ $comment->author_name }}</small>

                <!-- Reactions for comment -->
                @include('ui.v3.discussions.components.reaction-buttons', [
                    'discussionId' => $discussionVM->getId(),
                    'commentId' => $comment->id,
                    'courseId' => $vm->getCourseId(),
                    'discussionVM' => $discussionVM,
                ])
            </div>
        @endforeach
    </div>
</div>
```

#### Step 12: Create Migration

**File:** `app/database/migrations/2026_05_06_000000_create_discussion_reactions_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;

class CreateDiscussionReactionsTable extends Migration {
    public function up(): void {
        Schema::create('discussion_reactions', function ($table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('discussion_id');
            $table->unsignedBigInteger('comment_id')->nullable();
            $table->unsignedInteger('user_id');
            $table->string('reaction_type', 20);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['discussion_id', 'comment_id', 'user_id', 'reaction_type'], 'unique_reaction');
            $table->foreign('discussion_id')->references('id')->on('developer_journey_discussions');
            $table->foreign('comment_id')->references('id')->on('course_discussion_comments_new');
            $table->foreign('user_id')->references('id')->on('users');

            $table->index(['discussion_id']);
            $table->index(['comment_id']);
            $table->index(['user_id']);
        });

        Schema::create('discussion_reaction_summaries', function ($table) {
            $table->unsignedBigInteger('discussion_id');
            $table->unsignedBigInteger('comment_id')->nullable();
            $table->string('reaction_type', 20);
            $table->integer('count')->default(0);

            $table->primary(['discussion_id', 'comment_id', 'reaction_type']);
            $table->foreign('discussion_id')->references('id')->on('developer_journey_discussions');
            $table->foreign('comment_id')->references('id')->on('course_discussion_comments_new');

            $table->index(['discussion_id']);
            $table->index(['comment_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('discussion_reaction_summaries');
        Schema::dropIfExists('discussion_reactions');
    }
}
```

#### Step 13: Create Event Handler (Optional - for side effects)

**File:** `Dicoding/Infrastructure/GlobalDomainEventHandlers/Discussions/LogDiscussionReactionHandler.php`

```php
<?php

namespace Dicoding\Infrastructure\GlobalDomainEventHandlers\Discussions;

use Dicoding\Domain\DeveloperJourney\Discussions\Events\DiscussionReactionWasAdded;
use Psr\Log\LoggerInterface;

class LogDiscussionReactionHandler {
    public function __construct(private readonly LoggerInterface $logger) {}

    public function __invoke(DiscussionReactionWasAdded $event): void {
        $reaction = $event->getReaction();
        
        $this->logger->info('Discussion reaction added', [
            'discussion_id' => $reaction->getDiscussionId(),
            'comment_id' => $reaction->getCommentId(),
            'user_id' => $reaction->getUserId(),
            'reaction_type' => $reaction->getType(),
        ]);

        // Could also:
        // - Send notification to discussion creator
        // - Award user points
        // - Update user engagement stats
    }
}
```

### 5.3 Testing the Feature

**File:** `app/tests/IntegrationTests/Specifications/AddDiscussionReactionIntegrationTest.php`

```php
<?php

namespace Dicoding\Tests\IntegrationTests\Specifications;

use PHPUnit\Framework\TestCase;
use Dicoding\UseCases\Academies\DiscussionReactions\AddDiscussionReactionSpecification;
use Dicoding\Domain\DeveloperJourney\Discussions\ValueObjects\DiscussionReaction;

class AddDiscussionReactionIntegrationTest extends TestCase {
    private AddDiscussionReactionSpecification $specification;

    public function setUp(): void {
        // Setup di sini
    }

    public function test_user_dapat_add_reaction_ke_discussion() {
        $payload = $this->specification->runSpecification([
            'course_id' => 1,
            'discussion_id' => 1,
            'comment_id' => null,
            'reaction_type' => 'like',
        ]);

        $this->assertTrue($payload->getStatus() === PayloadStatus::SUCCESS);
        $this->assertEquals('👍', $payload->getOutput()['user_reaction']);
    }

    public function test_user_cannot_add_invalid_reaction() {
        $this->expectException(InvariantException::class);

        new DiscussionReaction('invalid_type', 1, null, 1);
    }

    public function test_toggle_reaction_removes_if_same() {
        // First add like
        $this->specification->runSpecification([...]);

        // Add like again (should remove)
        $payload = $this->specification->runSpecification([...]);

        $this->assertNull($payload->getOutput()['user_reaction']);
    }
}
```

### 5.4 Summary Flow untuk Feature Ini

```
USER CLICKS REACTION EMOJI (Browser)
    ↓
JavaScript fetch() POST /academies/1/discussions/1/reaction
    ↓
Route matches → DiscussionReactionStoreAction
    ↓
Action::__invoke(courseId=1, discussionId=1)
    ├─ Get reaction_type from request
    ├─ Get comment_id from request (optional)
    └─ Call AddDiscussionReactionSpecification->runSpecification()
    ↓
Specification::runSpecification()
    ├─ Validate input (reaction_type in enum)
    ├─ Check auth (user logged in)
    ├─ Check permission (canOpen discussion)
    ├─ Verify discussion exists
    ├─ Create DiscussionReaction ValueObject (validates)
    ├─ Check if user already reacted
    │  ├─ If same reaction: call removeReaction()
    │  └─ If different: replace reaction
    ├─ Call DiscussionReactionGateway->addReaction()
    │  ├─ INSERT into discussion_reactions
    │  ├─ UPDATE discussion_reaction_summaries
    │  └─ Flush cache
    ├─ Trigger DiscussionReactionWasAdded event
    │  └─ LogDiscussionReactionHandler logs it
    └─ Return success payload with updated summary
    ↓
DiscussionReactionStoreResponse
    └─ Wrap in JSON response
    ↓
Browser receives JSON
    ├─ Parse reaction_summary
    ├─ Update reaction button UI
    └─ Show updated count
```

---

## Kesimpulan

Dengan dokumentasi ini, Anda seharusnya memahami:

1. **Gambaran Besar Repo** - Struktur folder dan alur request
2. **Konsep Fundamental** - Route, Action, ViewModel, Specification, Domain, Gateway
3. **Arsitektur DDD** - 4 layer, data flow, permission control
4. **Flow Lengkap** - Dari GET request hingga HTML rendered
5. **Studi Kasus Praktis** - Implementasi feature "Discussion Reaction" yang menggunakan seluruh pattern

**Next Steps:**
- Jalankan migration: `deck artisan migrate`
- Implementasikan controller actions
- Test dengan Postman atau browser dev tools
- Optimalkan performance dengan caching
- Audit security dengan Psalm: `deck psalm`
