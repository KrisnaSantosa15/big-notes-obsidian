# Academy Discussions - Comprehensive Technical Exploration

**Date**: May 2026  
**Focus**: Database schema, relationships, data flow, permission patterns, and CRUD operations

---

## Executive Summary

The **Academy Discussions System** is a **DDD-based (Domain-Driven Design)** discussion forum for courses in Dicoding. It features:
- **Database-driven** discussions (stored in `developer_journey_discussions` table)
- **Hierarchical comments** (threaded discussions with parent-child replies)
- **Permission-based access control** via `CourseDiscussionPermissionHelper`
- **ViewModel-based data presentation** with `AcademyDiscussionVM`, `AcademyDiscussionShowVM`, etc.
- **Event-driven architecture** with domain events
- **Caching strategy** with cache tags for performance

---

## 1. Database Schema & Relationships

### Core Tables & Structure

#### `developer_journey_discussions` - Main Discussion Records
```
CREATE TABLE developer_journey_discussions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT UNSIGNED (FK → developer_journeys.id, CASCADE),
    tutorial_id BIGINT UNSIGNED (FK → developer_journey_tutorials.id, CASCADE),
    creator_id INT UNSIGNED (FK → users.id, CASCADE),
    title VARCHAR(255),
    question TEXT,
    status CHAR(2) DEFAULT '1',                          -- -2: Deleted, -1: Draft, 0: Pending, 1: Published
    solved TINYINT DEFAULT 0,                             -- 1 if marked as solved
    solved_at TIMESTAMP NULL,                             -- When marked as solved
    pinned_at TIMESTAMP NULL,                             -- When pinned by manager
    resolve TINYINT DEFAULT 0,                            -- 1 if marked as resolved
    resolved_at TIMESTAMP NULL,                           -- When resolved
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES developer_journeys(id) ON DELETE CASCADE,
    FOREIGN KEY (tutorial_id) REFERENCES developer_journey_tutorials(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pinned_at (pinned_at),
    INDEX idx_solved_at (solved_at)
);
```

**Key Fields**:
- **status**: Visibility level (Published/Draft/Pending/Deleted)
- **solved**: Whether discussion has accepted answer
- **pinned_at**: Featured at top by instructors
- **resolve**: Whether issue is resolved

#### `course_discussion_comments_new` - Comment Records (Active Version)
```
CREATE TABLE course_discussion_comments_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creator_id INT UNSIGNED (FK → users.id),
    discussion_id BIGINT UNSIGNED (FK → developer_journey_discussions.id),
    parent_id BIGINT UNSIGNED NULL (FK → course_discussion_comments_new.id),  -- NULL for root comments
    comment TEXT,
    status TINYINT DEFAULT 1,                             -- 0: Unpublished, 1: Published
    disqus_id VARCHAR(255) NULL,                          -- Legacy Disqus integration
    is_selected_answer TINYINT DEFAULT 0,                 -- 1 if marked as answer
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,                            -- Soft delete
    
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (discussion_id) REFERENCES developer_journey_discussions(id),
    FOREIGN KEY (parent_id) REFERENCES course_discussion_comments_new(id)
);
```

**Key Fields**:
- **parent_id**: Self-referencing for reply threading (NULL = root comment)
- **is_selected_answer**: Only discussion creator can mark one comment as "the answer"
- **deleted_at**: Soft deletes preserve data integrity
- **status**: 0 = needs approval, 1 = published

#### `course_discussion_comments_votes` - Vote Tracking
```
CREATE TABLE course_discussion_comments_votes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    voter_id INT UNSIGNED (FK → users.id),
    comment_id BIGINT UNSIGNED (FK → course_discussion_comments_new.id),
    vote_status ENUM('upvote', 'downvote'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Purpose**: Track helpful/not-helpful votes on comments.

#### `developer_journey_discussions_keywords` & `developer_journey_discussions_relations`
```
-- Keywords lookup table
CREATE TABLE developer_journey_discussions_keywords (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(255)
);

-- Many-to-many relationship
CREATE TABLE developer_journey_discussions_relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    discussion_id BIGINT UNSIGNED (FK → developer_journey_discussions.id, CASCADE),
    keyword_id BIGINT UNSIGNED (FK → developer_journey_discussions_keywords.id, CASCADE)
);
```

**Purpose**: Tag discussions with searchable keywords.

### Relationship Diagram

```
users (Student/Creator)
  ├── (1:N) creator_id → developer_journey_discussions
  ├── (1:N) creator_id → course_discussion_comments_new
  └── (1:N) voter_id → course_discussion_comments_votes

developer_journeys (Course)
  └── (1:N) course_id → developer_journey_discussions
       └── (1:N) discussion_id → course_discussion_comments_new
            ├── (N:N) parent_id (self-referencing for threads)
            └── (1:N) comment_id → course_discussion_comments_votes

developer_journey_tutorials (Module)
  └── (1:N) tutorial_id → developer_journey_discussions

developer_journey_discussions_keywords
  └── (N:N) via developer_journey_discussions_relations
```

---

## 2. Web Layer - HTTP Entry Points

### Action Classes (Request Handlers)

Located: `Dicoding/Web/Http/Academies/Discussion/*.php`

| Action | HTTP Method | Route | Purpose |
|--------|-------------|-------|---------|
| `AcademyDiscussionIndexAction` | GET | `/academies/{id}/discussions` | List discussions for course |
| `AcademyDiscussionCreateAction` | GET | `/academies/{id}/discussions/create` | Show create form |
| `AcademyDiscussionStoreAction` | POST | `/academies/{course_id}/discussions` | Save new discussion |
| `AcademyDiscussionShowAction` | GET | `/academies/{id}/discussions/{discussionId}` | Show discussion detail + comments |
| `AcademyDiscussionEditAction` | GET | `/academies/{id}/discussions/{discussionId}/edit` | Show edit form |
| `AcademyDiscussionUpdateAction` | PUT | `/academies/{id}/discussions/{discussionId}` | Update discussion |
| `AcademyDiscussionStateAction` | PATCH | `/academies/{id}/discussions/{discussionId}/state` | Change status (draft/publish) |
| `AcademyDiscussionResolveAction` | PATCH | `/academies/{id}/discussions/{discussionId}/resolve` | Mark as resolved/solved |
| `AcademyDiscussionPinAction` | PATCH | `/academies/{id}/discussions/{discussionId}/pin` | Pin/unpin discussion |

**Example: AcademyDiscussionStoreAction (Thin Handler)**
```php
class AcademyDiscussionStoreAction extends BaseController
{
    public function __invoke(int $courseId): PayloadInterface
    {
        return $this->useCase->run($this->specification, array_merge(
            $this->request->only(['title', 'question', 'keywords', 'tutorial_id']),
            ['course_id' => $courseId, 'creator_id' => Auth::id()]
        ));
    }
}
```

**Pattern**: Action → extracts HTTP data → delegates to UseCase/Specification

### Response Classes

Located: `Dicoding/Web/Http/Academies/Discussion/*Response.php`

| Response | Purpose |
|----------|---------|
| `AcademyDiscussionStoreResponse` | Redirect to show/create on success/failure |
| `AcademyDiscussionIndexResponse` | Return discussions list as JSON or redirect |
| `AcademyDiscussionShowResponse` | Return discussion detail + comments as JSON |
| `AcademyDiscussionUpdateResponse` | Redirect on update success/failure |

---

## 3. UseCase Layer - Business Orchestration

Located: `Dicoding/UseCases/Academies/AcademyDiscussions/*.php`

### Specification Pattern

Each UseCase is a **Specification** that:
1. Validates input data against rules
2. Fetches domain objects from repositories
3. Delegates business logic to Domain Aggregates
4. Catches exceptions and returns Payload (result object)

#### `AcademyDiscussionStoreSpecification`
```php
class AcademyDiscussionStoreSpecification extends UseCaseSpecification
{
    protected static $dataValidationRules = [
        'title'       => 'required|string',
        'question'    => 'required|string',
        'keywords'    => 'required',
        'tutorial_id' => 'required|integer|min:1',
        'course_id'   => 'required|integer|min:1',
    ];

    public function runSpecification(array $useCaseData = []): PayloadInterface
    {
        // 1. Get domain object (Aggregate)
        $newDiscussion = $this->newDiscussionRepository->getNewDiscussion($useCaseData['course_id']);
        
        // 2. Delegate to domain logic
        $newDiscussion->createDiscussion(
            $studyProgress,
            $userRoleHelper,
            $useCaseData
        );
        
        // 3. Persist via repository
        $this->newDiscussionRepository->saveNewDiscussion($newDiscussion);
        
        // 4. Return result
        return $this->payloadFactory->withSuccessfulPayload([...], 'Success message');
    }
}
```

**Flow**:
- Input validation
- Domain Aggregate processing
- Exception handling (returns error Payload if validation fails)
- Returns PayloadInterface (success/failure result)

---

## 4. Domain Layer - Business Logic

Located: `Dicoding/Domain/DeveloperJourney/Discussions/`

### Domain Aggregate: `NewDiscussion`

The Aggregate encapsulates discussion creation logic:

```php
class NewDiscussion extends Aggregate
{
    public function createDiscussion(
        StudyProgress $studyProgress,
        UserRoleHelper $userRoleHelper,
        array $newDiscussionData
    ): void {
        // 1. Validate business rules
        $this->validateCreation($studyProgress, $userRoleHelper, $newDiscussionData);
        
        // 2. Create domain objects
        $this->createdDiscussion = new NewCourseDiscussion([
            'creator_id'    => $studyProgress->getStudentId(),
            'course_id'     => $this->course->getId(),
            'tutorial_id'   => $newDiscussionData['tutorial_id'],
            'title'         => $newDiscussionData['title'],
            'question'      => $newDiscussionData['question'],
            'keywords'      => $newDiscussionData['keywords']
        ]);
        
        // 3. Raise domain event
        $this->raise(new NewCourseDiscussionWasCreated($this->createdDiscussion->toArray()));
    }

    private function validateCreation(...): void
    {
        // Check course is published
        if ($this->course->isUnpublished()) {
            throw new InvariantException('COURSE.NEW_DISCUSSION.INVALID_COURSE_STATUS');
        }

        // Check user can write discussion
        if (!$this->courseDiscussionPermissionHelper->canWrtiteNewDiscussion(...)) {
            throw new InvariantException('COURSE.NEW_DISCUSSION.INVALID_STUDENT_STATUS');
        }
        
        // Check tutorial belongs to course
        if (!in_array($tutorialId, $this->course->getTutorialIds(), false)) {
            throw new InvariantException('DEVELOPER_JOURNEY.DISCUSSION.NOT_MATCH_TUTORIAL');
        }
    }
}
```

**Key Principles**:
- Validates ALL business rules before state change
- Raises domain events after successful state change
- Throws `InvariantException` for business rule violations
- No infrastructure dependencies (no DB calls, no HTTP, no framework code)

### Domain ValueObject: `NewCourseDiscussion`

Encapsulates discussion data with validation:

```php
class NewCourseDiscussion extends ValueObject
{
    private static $rules = [
        'course_id'     => 'required|integer',
        'tutorial_id'   => 'required|integer',
        'creator_id'    => 'required|integer',
        'title'         => 'required',
        'question'      => 'required',
        'keywords'      => 'required',
        'created_at'    => 'required|date|date_format:"Y-m-d H:i:s"',
        'updated_at'    => 'required|date|date_format:"Y-m-d H:i:s"',
        'status'        => 'required|object:' . CourseDiscussionStatus::class
    ];

    public function __construct(private array $data)
    {
        $this->data['created_at'] = Asr::getNowDateTimeStringInDefaultTimeZone();
        $this->data['updated_at'] = $this->data['created_at'];
        $this->data['status'] = CourseDiscussionStatus::PUBLISHED();
        
        $this->validateData($this->data, self::$rules);
    }

    // Getters only - immutable value object
    public function getCourseId(): int { ... }
    public function getTitle(): string { ... }
    public function getKeywordLists(): array { ... }
    public function toArray(): array { ... }
}
```

**Key Principles**:
- Immutable (no setters)
- Always valid (validates in constructor)
- Encapsulates business meaning (keywords converted from comma-separated to array)
- Extends `ValueObject` base class with `Validatorable` trait

### Domain Service: `CourseDiscussionPermissionHelper`

Permission logic (authorization):

```php
class CourseDiscussionPermissionHelper
{
    /**
     * Can user MANAGE (edit/delete) discussions?
     */
    public function canManage(int $courseId, UserRoleHelper $userRoleHelper): bool
    {
        if ($userRoleHelper->isAcademyManager()) return true;
        if ($userRoleHelper->isManagerForCourse($courseId)) return true;
        return false;
    }

    /**
     * Can user OPEN/VIEW discussions?
     */
    public function canOpen(
        int $courseId,
        UserRoleHelper $userRoleHelper,
        StudyProgressInterface $studyProgress,
        int $discussionStatus = 1
    ): bool {
        // Auth check
        if (!$userRoleHelper->isAuthed()) return false;

        // Staff always see
        if ($userRoleHelper->isAcademyManager()) return true;
        if ($userRoleHelper->isCodeReviewerForCourse($courseId)) return true;
        if ($userRoleHelper->isInstructorForCourse($courseId)) return true;
        if ($userRoleHelper->isManagerForCourse($courseId)) return true;

        // Unpublished discussions hidden from students
        if (in_array($discussionStatus, [-2, -1, 0], true)) return false;

        // Student enrollment checks
        if ($studyProgress->isFullyEnrollment()) return true;
        if ($studyProgress->isSubscriptionActiveOrTrial()) return true;

        return false;
    }

    /**
     * Can user CREATE new discussions?
     */
    public function canWrtiteNewDiscussion(
        int $courseId,
        StudyProgress $studyProgress,
        UserRoleHelper $userRoleHelper
    ): bool
    {
        if ($userRoleHelper->isAcademyManager()) return true;
        if ($userRoleHelper->isManagerForCourse($courseId)) return true;
        if ($studyProgress->isFullyEnrollment()) return true;
        if ($studyProgress->isSubscriptionActiveOrTrial()) return true;
        return false;
    }
}
```

**Permission Hierarchy** (highest to lowest):
1. Academy Manager (global admin)
2. Course Manager/Instructor/Code Reviewer (course-level staff)
3. Fully Enrolled Student
4. Subscription/Trial Student
5. Unauthenticated (no access)

### Domain Events

Events raised when state changes:

```php
class NewCourseDiscussionWasCreated extends DomainEvent
{
    // Event data stored as primitives only
    // Handlers use these primitives to trigger side effects (emails, etc.)
}

class AcademyDiscussionWasCreated extends DomainEvent { ... }
```

**Event Handlers** listen and trigger side effects:
- Send email notifications
- Update analytics
- Trigger webhooks
- Update search indexes

---

## 5. Infrastructure Layer - Data Persistence

Located: `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/`

### Gateway: `AcademyDiscussionGateway`

Implements repository interface for database access:

```php
class AcademyDiscussionGateway
{
    public function saveNewCourseDiscussion(NewCourseDiscussion $newCourseDiscussion): int
    {
        $discussionId = $this->db->table('developer_journey_discussions')->insertGetId([
            'title'       => $newCourseDiscussion->getTitle(),
            'question'    => $newCourseDiscussion->getQuestion(),
            'course_id'   => $newCourseDiscussion->getCourseId(),
            'tutorial_id' => $newCourseDiscussion->getTutorialId(),
            'creator_id'  => $newCourseDiscussion->getCreatorId(),
            'created_at'  => $newCourseDiscussion->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at'  => $newCourseDiscussion->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);

        // Create keyword relationships
        foreach ($newCourseDiscussion->getKeywordLists() as $keyword) {
            $keywordId = $this->createAndGetKeywordId($newCourseDiscussion->getCourseId(), $keyword);
            $this->db->table('developer_journey_discussions_relations')->insertGetId([
                'discussion_id' => $discussionId,
                'keyword_id'    => $keywordId,
            ]);
        }

        // Invalidate cache
        $this->cache->flushTag(AcademyCacheKeys::courseDiscussionsTag($newCourseDiscussion->getCourseId()));

        return $discussionId;
    }

    public function findById(int $discussionId): ?object
    {
        // With JOIN to get course/tutorial/creator data
        return $this->db->table('developer_journey_discussions as discussions')
            ->join('developer_journeys', 'discussions.course_id', '=', 'developer_journeys.id')
            ->join('developer_journey_tutorials', 'discussions.tutorial_id', '=', 'developer_journey_tutorials.id')
            ->join('users', 'discussions.creator_id', '=', 'users.id')
            ->select([
                'discussions.*',
                'developer_journeys.name as journey_name',
                'developer_journey_tutorials.title as tutorial_name',
                'users.name as creator_name'
            ])
            ->where('discussions.id', $discussionId)
            ->first();
    }

    public function getPopularKeywordsOnCourse(int $courseId, ?int $limit = null): array
    {
        return $this->cache->rememberWithTag(
            AcademyCacheKeys::courseDiscussionsTag($courseId),
            'keywordusage:limit:' . ($limit ?? '-'),
            1400, // 23 hours
            function () use ($courseId, $limit) {
                // Query with GROUP BY and COUNT
            }
        );
    }
}
```

**Key Patterns**:
- Insert/Update methods accept Domain Value Objects
- Select/Find methods return plain objects (for ViewModels)
- Cache invalidation on write operations
- JOINs with related tables for efficient querying

### Gateway: `DiscussionCommentGateway`

Manages comments and votes:

```php
class DiscussionCommentGateway
{
    public function store(NewDiscussionComment $comment): int
    {
        $newCommentId = $this->db->table('course_discussion_comments_new')->insertGetId([
            'creator_id'    => $comment->getCommenterId(),
            'discussion_id' => $comment->getDiscussionId(),
            'parent_id'     => $comment->getParentId(),
            'comment'       => $comment->getCommentContent(),
            'status'        => CourseDiscussionCommentStatus::PUBLISHED(),
            'created_at'    => Asr::getNowDateTimeStringInDefaultTimeZone(),
            'updated_at'    => Asr::getNowDateTimeStringInDefaultTimeZone(),
        ]);

        $this->cache->flushTag(AcademyCacheKeys::discussionTag($comment->getDiscussionId()));
        return $newCommentId;
    }

    public function getParentCommentsOfDiscussion(int $discussionId): Paginator
    {
        // Returns root comments (parent_id IS NULL)
        // With vote counts and reply indicators
        // Paginated: 50 per page
    }

    public function getRepliesWithParentComment(int $discussionId, int $parentId): array
    {
        // Returns nested replies using MySQL CTE pattern
        // Recursive query to get all replies under parent
        // Cached for 10080 minutes (1 week)
    }
}
```

---

## 6. QueryRepository - ViewModel Building

Located: `Dicoding/Infrastructure/QueryRepositories/Academies/AcademyPageQueryRepository.php`

Read-only queries for UI data:

```php
class AcademyPageQueryRepository implements AcademyPageQueryRepositoryInterface
{
    /**
     * Build AcademyDiscussionVM for list view
     */
    public function constructDiscussionVM(
        UserRoleHelper $userRoleHelper,
        object $course,
        array $discussionFilters = []
    ): AcademyDiscussionVM {
        $courseId = (int)$course->id;
        $userId = $userRoleHelper->getUserId();
        $studyProgress = $this->getStudyProgress($userId, $courseId);

        // Check permissions
        $courseDiscussionPermission = new CourseDiscussionPermissionHelper();
        $isUserCanManageDiscussion = $courseDiscussionPermission->canManage($course->id, $userRoleHelper);
        $isUserCanOpenDiscussion = $courseDiscussionPermission->canOpen(
            $courseId,
            $userRoleHelper,
            $studyProgress
        );

        // Fetch data
        $discussions = $this->getDiscussionsForNewUI($discussionFilters, $isUserCanManageDiscussion, $courseId);
        $modules = $this->tutorialGateway->getPublishedTutorialList($courseId);
        $keywords = $this->academyDiscussionGateway->getPopularKeywordsOnCourse($courseId, 15);

        // Build ViewModel
        return new AcademyDiscussionVM(
            $discussions,
            $modules,
            $keywords,
            $isUserCanManageDiscussion,
            $isUserCanOpenDiscussion
        );
    }

    /**
     * Build AcademyDiscussionShowVM for detail view
     */
    public function constructDiscussionShowVM(
        UserRoleHelper $userRoleHelper,
        object $course,
        int $discussionId
    ): AcademyDiscussionShowVM {
        $courseId = (int)$course->id;
        $userId = $userRoleHelper->getUserId();
        
        // Fetch discussion
        $discussion = $this->academyDiscussionGateway->findById($discussionId);
        if (empty($discussion)) {
            throw ObjectNotFoundException::create('Discussion', $discussionId, __METHOD__);
        }

        // Check permission to view this specific discussion
        $studyProgress = $this->getStudyProgress($userId, $courseId);
        $courseDiscussionPermission = new CourseDiscussionPermissionHelper();
        $canOpenDiscussion = $courseDiscussionPermission->canOpen(
            $courseId,
            $userRoleHelper,
            $studyProgress,
            $discussion->status  // Status affects visibility
        );

        if (!$canOpenDiscussion) {
            throw new AuthenticationException('You don\'t have permission to view this discussion!');
        }

        // Validate course match
        if ((int)$discussion->course_id !== $courseId) {
            throw new InvariantException('Discussion does not belong to this course!');
        }

        // Build ViewModel
        return new AcademyDiscussionShowVM(
            $discussion,
            $courseDiscussionPermission->canManage($course->id, $userRoleHelper),
            (int)$discussion->creator_id === $userId  // Is current user the creator?
        );
    }
}
```

---

## 7. ViewModel Layer - Data Presentation

Located: `Dicoding/Web/VM/Academies/Discussion/`

ViewModels format data for views (no business logic):

### `AcademyDiscussionVM` - List View

```php
class AcademyDiscussionVM
{
    public function __construct(
        private $discussions,              // Paginator of discussion records
        private array $modules,            // Available modules/tutorials
        private array $popularKeywords,    // Top keywords for filtering
        private bool $canManageDiscussion, // Can current user manage?
        private bool $canOpenDiscussion    // Can current user open discussions?
    ) { }

    public function getDiscussions(): array { ... }        // Non-pinned
    public function getPinnedDiscussions(): array { ... }  // Pinned only
    public function getModules(): array { ... }
    public function getPopularKeywords(): array { ... }
    public function canManageDiscussion(): bool { ... }
}
```

### `AcademyDiscussionShowVM` - Detail View

```php
class AcademyDiscussionShowVM
{
    public function __construct(
        private object $discussion,
        private bool $canManage,
        private bool $isDiscussionCreator
    ) { }

    public function getDiscussionId(): int { ... }
    public function getDiscussionTitle(): string { ... }
    public function getDiscussionQuestion(): string { ... }
    public function getDiscussionCreatorName(): string { ... }
    public function canMarkCommentAsSelectedAnswer(): bool {
        return $this->isDiscussionCreator && !$this->hasApprovedComment();
    }
    public function canManageDiscussion(): bool { ... }
}
```

---

## 8. Complete Data Flow Examples

### Example 1: User Creates Discussion

```
1. USER INPUT
   POST /academies/42/discussions
   {
       "title": "How do I debug?",
       "question": "I'm getting error 500...",
       "keywords": "debugging, error, php",
       "tutorial_id": 123
   }

2. WEB LAYER
   AcademyDiscussionStoreAction::__invoke(courseId: 42)
   ├─ Extracts request data
   ├─ Adds Auth::id() and courseId
   └─ Passes to UseCase

3. USECASE LAYER
   AcademyDiscussionStoreSpecification::runSpecification()
   ├─ Validates via $dataValidationRules
   ├─ Gets NewDiscussion Aggregate from repository
   └─ Calls Aggregate::createDiscussion()

4. DOMAIN LAYER
   NewDiscussion::createDiscussion()
   ├─ Calls validateCreation():
   │  ├─ Checks course is published
   │  ├─ Calls canWrtiteNewDiscussion() → checks enrollment
   │  └─ Validates tutorial_id belongs to course
   ├─ Calls processCreation():
   │  ├─ Creates NewCourseDiscussion ValueObject
   │  │  └─ Constructor validates ALL fields
   │  └─ Raises NewCourseDiscussionWasCreated event
   └─ Returns ValueObject

5. INFRASTRUCTURE LAYER
   AcademyDiscussionGateway::saveNewCourseDiscussion()
   ├─ INSERT into developer_journey_discussions (id=999)
   ├─ For each keyword:
   │  ├─ Find or create keyword in developer_journey_discussions_keywords
   │  └─ INSERT into developer_journey_discussions_relations
   ├─ Cache::flush("course_discussions:42")
   └─ Returns discussionId: 999

6. EVENT HANDLERS (Infrastructure)
   NewCourseDiscussionWasCreated event triggered
   ├─ Send email to subscribed users
   ├─ Update contribution points
   └─ Log activity

7. RESPONSE
   AcademyDiscussionStoreResponse
   └─ Redirect to /academies/42/discussions/999
      with success_message: "Diskusi berhasil dibuat!"

RESULT: Discussion created and visible at discussions.show route
```

### Example 2: User Views Discussion List

```
1. USER INPUT
   GET /academies/42/discussions?filter=pending

2. WEB LAYER
   AcademyDiscussionIndexAction::__invoke()
   ├─ Gets current user from Auth
   ├─ Parses query filters
   └─ Calls QueryRepository

3. QUERY REPOSITORY
   AcademyPageQueryRepository::constructDiscussionVM()
   ├─ Gets StudyProgress for user
   ├─ Calls canManage() → false for student
   ├─ Calls canOpen() → true if enrolled
   ├─ Fetches discussions:
   │  └─ Shows ONLY published if not manager
   │  └─ Shows all statuses if manager
   ├─ Fetches modules via TutorialGateway
   ├─ Fetches popular keywords (cached 23hrs)
   └─ Returns AcademyDiscussionVM

4. INFRASTRUCTURE
   AcademyDiscussionGateway::getDiscussionsForCourse()
   └─ SELECT * FROM developer_journey_discussions
      WHERE course_id = 42 AND status = 1 (or all if manager)
      ORDER BY pinned_at DESC, created_at DESC

5. RESPONSE
   AcademyDiscussionIndexResponse
   └─ Return JSON or render Blade template with ViewModel

RESULT: User sees list of discussions with permission-based visibility
```

### Example 3: User Comments on Discussion

```
1. USER INPUT
   POST /academies/42/discussions/999/comments
   {
       "comment": "Try adding var_dump();",
       "parent_id": null  // Root comment
   }

2. WEB LAYER
   CourseDiscussionCommentStoreAction

3. USECASE
   CourseDiscussionCommentStoreSpecification
   ├─ Validates comment length > 0
   └─ Creates NewDiscussionComment ValueObject

4. DOMAIN LAYER
   NewDiscussionComment Aggregate
   ├─ Validates business rules
   └─ Raises event

5. INFRASTRUCTURE
   DiscussionCommentGateway::store()
   ├─ INSERT into course_discussion_comments_new
   │  ├─ creator_id: current user
   │  ├─ discussion_id: 999
   │  ├─ parent_id: NULL (root comment)
   │  └─ status: 1 (published)
   ├─ Cache::flushTag("discussion:999")
   └─ Returns comment id

6. RESPONSE
   Return JSON with new comment

RESULT: Comment appears in nested thread
```

### Example 4: User Marks Comment as Answer

```
1. USER INPUT (Only discussion creator can do this)
   PATCH /academies/42/discussions/999/comments/1001/mark-answer

2. PERMISSION CHECK
   ├─ Is current user creator of discussion 999?
   └─ Is there not already a marked answer?

3. UPDATE
   UPDATE course_discussion_comments_new
   SET is_selected_answer = 1
   WHERE id = 1001 AND discussion_id = 999

4. CACHE FLUSH
   Cache::flushTag("discussion:999")

RESULT: Comment marked as "selected answer" in UI
```

---

## 9. Caching Strategy

### Cache Keys (with tags for batch invalidation)

```php
AcademyCacheKeys::courseDiscussionsTag($courseId)
├─ "keywordusage:limit:-"         (popular keywords, 23 hours TTL)
├─ "keywordusage:limit:15"
└─ Invalidated on: create/update discussion or keywords

AcademyCacheKeys::discussionTag($discussionId)
├─ "discussion:{$discussionId}:*"  (all discussion data)
└─ Invalidated on: update discussion or add comment/vote

Cache Flushing Points:
├─ AcademyDiscussionGateway::saveNewCourseDiscussion()
├─ AcademyDiscussionGateway::updateDiscussion()
├─ DiscussionCommentGateway::store()
├─ DiscussionCommentGateway::vote()
└─ When keywords change
```

### TTL (Time-To-Live)

- **Keywords**: 1400 minutes (23 hours) - heavy calculation
- **Comments**: 10080 minutes (1 week) - rarely changes
- **Dynamic lists**: No TTL - tag-based invalidation only

---

## 10. Permission & Access Control Patterns

### Three-Level Permission Model

```
Level 1: AUTHENTICATION
├─ User logged in? (isAuthed)
└─ If NO → No access to any discussion

Level 2: ROLE-BASED (UserRoleHelper)
├─ isAcademyManager()           → Full access to all courses
├─ isManagerForCourse($id)      → Full access to specific course
├─ isInstructorForCourse($id)   → Can see all statuses
├─ isCodeReviewerForCourse($id) → Can see all statuses
├─ isEditorForCourse($id)       → Can see published
└─ isContentReviewerForCourse() → Can see published

Level 3: ENROLLMENT STATUS (StudyProgress)
├─ hasGraduated()              → Full access
├─ isFullyEnrollment()         → Can see published
├─ isSubscriptionActiveOrTrial()→ Can see published
└─ isTrialStudent()            → Can see published

Discussion Status:
├─ 1: Published  → Visible to all authorized
├─ 0: Pending    → Only managers see
├─ -1: Draft     → Only creator + managers see
└─ -2: Deleted   → Hidden (soft delete)

ALGORITHM: Can Open?
├─ IF not authed → return false
├─ IF status IN [-2,-1,0] AND user is staff → return true
├─ IF status IN [-2,-1,0] AND user is student → return false
├─ IF status = 1 → check enrollment
└─ → return true if enrolled
```

### Usage in Code

```php
// Check if user can VIEW discussion
$canOpen = $courseDiscussionPermissionHelper->canOpen(
    $courseId,           // Course ID
    $userRoleHelper,     // User's roles
    $studyProgress,      // Enrollment status
    $discussion->status  // Discussion visibility status
);

// Check if user can EDIT/DELETE discussion
$canManage = $courseDiscussionPermissionHelper->canManage(
    $courseId,
    $userRoleHelper
);

// Check if user can CREATE new discussion
$canWrite = $courseDiscussionPermissionHelper->canWrtiteNewDiscussion(
    $courseId,
    $studyProgress,
    $userRoleHelper
);
```

---

## 11. Error Handling & Validation

### Validation Layers

```
1. WEB LAYER (CSRF, Input Type)
   ├─ CSRF token check (middleware)
   └─ Request::only() extracts known fields

2. USECASE LAYER (Business Rules)
   ├─ $dataValidationRules checks required fields
   ├─ Validates data types
   └─ Custom messages returned in error Payload

3. DOMAIN LAYER (Business Logic)
   ├─ ValueObject validates data in constructor
   ├─ Aggregate validates state before change
   ├─ Throws InvariantException for rule violations
   └─ Causes Specification to catch and return error Payload

4. INFRASTRUCTURE LAYER (Data Integrity)
   ├─ Foreign key constraints
   ├─ Database schema validation
   └─ Returns PDOException if violated
```

### Exception Types

```php
// Business rule violation (Domain layer)
throw new InvariantException('COURSE.NEW_DISCUSSION.INVALID_COURSE_STATUS');

// User lacks permission (Web layer)
throw new AuthenticationException('You don\'t have permission!');

// Data not found (Infrastructure layer)
throw ObjectNotFoundException::create('Discussion', $id, __METHOD__);

// CAUGHT BY:
try {
    $specification->runSpecification($data);
} catch (ObjectNotFoundException $e) {
    return $payloadFactory->withMissingPayload(null, $data);
} catch (InvariantException $e) {
    return $payloadFactory->withInvariantExceptionPayload($e, $data);
} catch (Exception $e) {
    return $payloadFactory->withExceptionPayload($e, $data);
}
```

---

## 12. Key Files Reference

### Migrations
- `2017_12_12_131110_create_developer_journey_discussions_table.php` - Main tables
- `2018_04_10_165235_create_course_discussion_comments_table.php` - Old comments (deprecated)
- `2020_08_21_103445_create_course_discussion_comments_new_table.php` - New comments
- `2020_09_09_135424_create_course_discussion_comments_votes_table.php` - Votes
- `2018_02_19_162450_add_resolve_flagging_academy_discussion.php` - Resolve status
- `2018_02_20_140932_add_pinned_flagging_academy_discussion.php` - Pinning feature

### Web Layer
- `Dicoding/Web/Http/Academies/Discussion/*.php` - Actions & Responses (23 files)
- `Dicoding/Web/VM/Academies/Discussion/*.php` - ViewModels (5 files)
- `Dicoding/Web/VM/Academies/Index/AcademyDiscussionVM.php` - List ViewModel

### Domain Layer
- `Dicoding/Domain/DeveloperJourney/Discussions/Aggregates/NewDiscussion.php` - Main aggregate
- `Dicoding/Domain/DeveloperJourney/Discussions/ValueObjects/NewCourseDiscussion.php` - Value object
- `Dicoding/Domain/DeveloperJourney/Events/NewCourseDiscussionWasCreated.php` - Domain event
- `Dicoding/DomainServices/CourseDiscussionPermission/CourseDiscussionPermissionHelper.php` - Permission service

### UseCase Layer
- `Dicoding/UseCases/Academies/AcademyDiscussions/*.php` - Specifications

### Infrastructure Layer
- `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/AcademyDiscussionGateway.php` - Main gateway
- `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/DiscussionCommentGateway.php` - Comments gateway
- `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/DiscussionLeaderboardGateway.php` - Leaderboard
- `Dicoding/Infrastructure/StorageGateways/Academies/Discussions/DiscussionBotFeedbackGateway.php` - AI feedback
- `Dicoding/Infrastructure/QueryRepositories/Academies/AcademyPageQueryRepository.php` - Read queries

---

## 13. Best Practices & Patterns

### DDD Principles Applied

1. **Ubiquitous Language**
   - Discussion, Comment, Keyword, Selected Answer
   - Status: Published, Draft, Pending, Deleted

2. **Bounded Context**
   - Discussions Context separate from Users Context
   - Clear boundaries between domains

3. **Aggregates**
   - `NewDiscussion` is the aggregate root
   - Validates all business rules before state change
   - Raises events after successful creation

4. **Repository Pattern**
   - Repository interfaces in Domain
   - Gateways in Infrastructure (concrete implementation)
   - QueryRepository separate for complex reads

5. **Value Objects**
   - `NewCourseDiscussion` encapsulates data with validation
   - Always valid after construction
   - Immutable

6. **Domain Events**
   - Raised after state changes
   - Handlers trigger side effects (emails, etc.)
   - Enable loose coupling

### Code Organization

1. **Separation of Concerns**
   - Web layer handles HTTP only
   - UseCase orchestrates workflow
   - Domain contains pure business logic
   - Infrastructure handles persistence

2. **Dependency Inversion**
   - All dependencies injected via constructor
   - Depends on interfaces, not concrete classes
   - Easy to mock for testing

3. **Caching Strategy**
   - Tag-based invalidation for batch operations
   - Popular keywords cached for performance
   - Cache flushed strategically after writes

4. **Permission Model**
   - Three-level check: Auth → Role → Enrollment
   - Consistent across all actions
   - Easy to extend with new roles

---

## 14. Common Queries & Operations

### Query: Get Popular Keywords for Course
```php
$keywords = $this->academyDiscussionGateway->getPopularKeywordsOnCourse($courseId, 15);
// Returns top 15 keywords by usage count
// Cached 23 hours
```

### Query: Get All Discussions for User
```php
$discussions = $this->academyDiscussionGateway->getDiscussionsForCourse(
    $courseId,
    showAll: $isManager, // true = all statuses, false = published only
    limit: 50
);
```

### Query: Get Nested Comments
```php
// Root comments (paginated, 50 per page)
$rootComments = $this->discussionCommentGateway->getParentCommentsOfDiscussion($discussionId);

// Replies for specific parent (cached, entire tree)
$replies = $this->discussionCommentGateway->getRepliesWithParentComment($discussionId, $parentCommentId);
```

### Mutation: Create Discussion
```php
$discussionId = $this->academyDiscussionGateway->saveNewCourseDiscussion($newCourseDiscussion);
```

### Mutation: Update Discussion
```php
$this->academyDiscussionGateway->updateDiscussion($discussionUpdateAggregate);
```

### Mutation: Add Comment
```php
$commentId = $this->discussionCommentGateway->store($newComment);
```

### Mutation: Vote on Comment
```php
$this->discussionCommentGateway->vote($voterId, $commentId, $voteStatus);
```

---

## Conclusion

The **Academy Discussions System** exemplifies clean DDD architecture:
- **Clear separation** between Web, UseCase, Domain, and Infrastructure layers
- **Permission model** at the heart of access control
- **Event-driven** for loose coupling
- **Cached** for performance
- **Testable** through dependency injection

Each component has a single responsibility, making the codebase maintainable and extensible.

