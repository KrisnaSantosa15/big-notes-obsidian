---
date: 2026-10-13
updated: 2026-10-13
type: guide
tags: [guide, learning, dicoding, dicoding-platform]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Academy Discussions - Visual Architecture & Quick Reference

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTION LAYER                      │
│  Browser → Routes (app/routes.php) → HTTP Requests/Responses    │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    GET /discussions              POST /discussions
         │                               │
┌────────▼──────────────────┐   ┌────────▼─────────────────┐
│   WEB LAYER (Read)        │   │  WEB LAYER (Write)       │
│                           │   │                          │
│ AcademyDiscussionIndex    │   │ AcademyDiscussionStore   │
│ Action → extracts data    │   │ Action → extracts data   │
│                           │   │ ↓                        │
└────────┬──────────────────┘   │ AcademyDiscussionStore   │
         │                      │ Response                 │
    Calls QueryRepository       └────────┬─────────────────┘
         │                              │
┌────────▼──────────────────────────────┼──────────────────────┐
│           USECASE LAYER (Orchestration)                      │
│                                       │                      │
│ AcademyPageQueryRepository            │                      │
│ - Builds ViewModels                   │                      │
│ - Applies permissions                 │                      │
│ - Fetches related data                │                      │
│                                       │                      │
│                           AcademyDiscussionStore             │
│                           Specification                      │
│                           - Validates input                  │
│                           - Calls Domain Aggregate           │
│                           - Catches exceptions               │
└────────┬────────────────────────────┬─────────────────────┘
         │ Returns ViewModel           │ Returns Payload
    AcademyDiscussionVM         (Success/Failure)
    AcademyDiscussionShowVM          │
         │                           │
┌────────▼──────────────────┐  ┌────────▼──────────────────┐
│    DOMAIN LAYER            │  │  DOMAIN LAYER            │
│   (Read - QueryRepository) │  │  (Write - Aggregate)     │
│                            │  │                          │
│ StudyProgress              │  │ NewDiscussion Aggregate  │
│ Permission checks          │  │ - Validates creation     │
│                            │  │ - Creates ValueObject    │
│                            │  │ - Raises domain event    │
│                            │  │                          │
│                            │  │ NewCourseDiscussion (VO) │
│                            │  │ - Encapsulates data      │
│                            │  │ - Validates in constructor
│                            │  │                          │
│ CourseDiscussionPermission │  │ NewCourseDiscussionWas   │
│ PermissionHelper           │  │ Created (Domain Event)   │
│ - canOpen()                │  │                          │
│ - canManage()              │  │                          │
│ - canWrtiteNewDiscussion() │  │                          │
└────────┬──────────────────┘  └────────┬──────────────────┘
         │                              │
┌────────▼──────────────────────────────┼──────────────────────┐
│      INFRASTRUCTURE LAYER (Persistence)                      │
│                                       │                      │
│ AcademyPageQueryRepository            │                      │
│ (Implements QueryRepository Interface)│                      │
│                                       │                      │
│ AcademyDiscussionGateway              │                      │
│ - findById()                          │                      │
│ - getDiscussionsForCourse()           │                      │
│ - getPopularKeywordsOnCourse()        │                      │
│                                       │                      │
│ DiscussionCommentGateway              │                      │
│ - getParentCommentsOfDiscussion()     │                      │
│ - getRepliesWithParentComment()       │                      │
│ - store()                             │                      │
│                                       │                      │
│                           AcademyDiscussionGateway          │
│                           - saveNewCourseDiscussion()       │
│                           - updateDiscussion()              │
│                           - Flush cache tags                │
└────────┬──────────────────────────────┼──────────────────────┘
         │                              │
┌────────▼──────────────────┐  ┌────────▼──────────────────┐
│    DATABASE LAYER          │  │  DATABASE LAYER          │
│                            │  │                          │
│ SELECT queries:            │  │ INSERT/UPDATE queries:   │
│ - developer_journey_disc   │  │ - developer_journey_disc │
│ - course_discussion_comm   │  │ - course_discussion_comm │
│ - course_discussion_votes  │  │ - course_discussion_rel  │
│ - (with JOINs)             │  │ - (with keywords)        │
│                            │  │                          │
│ (Cached 23 hours)          │  │ (Cache flushed on write) │
└────────┬──────────────────┘  └────────┬──────────────────┘
         │                              │
┌────────▼──────────────────────────────┼──────────────────────┐
│      CACHE LAYER                      │ (Tag-based)          │
│                                       │                      │
│ Tag: "course_discussions:{courseId}"  │ - Flushes on create  │
│ Tag: "discussion:{discussionId}"      │ - Flushes on update  │
│                                       │ - Flushes on comment │
└────────┬──────────────────────────────┼──────────────────────┘
         │                              │
┌────────▼──────────────────┐  ┌────────▼──────────────────┐
│    RESPONSE LAYER          │  │  EVENT HANDLERS          │
│                            │  │                          │
│ AcademyDiscussionIndex     │  │ Domain Event Listeners:  │
│ Response                   │  │ - Send email notifs      │
│ → Render Blade template    │  │ - Update contribution    │
│ or return JSON             │  │ - Log activity           │
│                            │  │ - Trigger webhooks       │
└────────┬──────────────────┘  └────────┬──────────────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
            ┌───────────▼────────────┐
            │   USER SEES RESULT     │
            │ Rendered HTML or JSON  │
            └───────────────────────┘
```

---

## Database Schema Quick Reference

```
developer_journey_discussions (MAIN)
├── id (PK)
├── course_id (FK → developer_journeys)
├── tutorial_id (FK → developer_journey_tutorials)
├── creator_id (FK → users)
├── title
├── question
├── status (1=Published, 0=Pending, -1=Draft, -2=Deleted)
├── solved, solved_at
├── pinned_at
├── resolve, resolved_at
├── created_at, updated_at
└── Indexes: pinned_at, solved_at


course_discussion_comments_new (ACTIVE VERSION)
├── id (PK)
├── creator_id (FK → users)
├── discussion_id (FK → developer_journey_discussions)
├── parent_id (FK → self, NULL for root)
├── comment
├── status (0=Unpublished, 1=Published)
├── is_selected_answer (only 1 per discussion)
├── disqus_id (legacy)
├── created_at, updated_at, deleted_at (soft)


course_discussion_comments_votes
├── id (PK)
├── voter_id (FK → users)
├── comment_id (FK → course_discussion_comments_new)
├── vote_status (upvote | downvote)
├── timestamps


developer_journey_discussions_keywords
├── id (PK)
└── keyword

developer_journey_discussions_relations (N:M)
├── id (PK)
├── discussion_id (FK → discussions, CASCADE)
├── keyword_id (FK → keywords, CASCADE)
```

---

## Permission Hierarchy

```
Level 1: AUTHENTICATED?
└─ IF NOT → NO ACCESS

Level 2: ROLE CHECK (UserRoleHelper)
├─ isAcademyManager()           → FULL ACCESS
├─ isManagerForCourse()         → FULL ACCESS (course)
├─ isInstructorForCourse()      → Can see all statuses
├─ isCodeReviewerForCourse()    → Can see all statuses
├─ isEditorForCourse()          → Can see published
└─ isContentReviewerForCourse() → Can see published

Level 3: ENROLLMENT STATUS (StudyProgress)
├─ hasGraduated()           → FULL ACCESS
├─ isFullyEnrollment()      → Can see published
├─ isSubscriptionActiveOrTrial() → Can see published

Level 4: DISCUSSION STATUS
├─ 1 (Published)  → Visible to all authorized
├─ 0 (Pending)    → Only managers see
├─ -1 (Draft)     → Only creator + managers see
└─ -2 (Deleted)   → Hidden (soft delete)
```

---

## File Organization Summary

```
Dicoding/
├── Web/Http/Academies/Discussion/          ← HTTP Entry Points
│   ├── AcademyDiscussionIndexAction.php
│   ├── AcademyDiscussionCreateAction.php
│   ├── AcademyDiscussionStoreAction.php     ← CREATE
│   ├── AcademyDiscussionShowAction.php      ← READ
│   ├── AcademyDiscussionEditAction.php
│   ├── AcademyDiscussionUpdateAction.php    ← UPDATE
│   ├── AcademyDiscussionStateAction.php
│   ├── AcademyDiscussionPinAction.php
│   ├── AcademyDiscussionResolveAction.php
│   ├── AcademyDiscussionBotFeedbackStore*   ← AI Feedback
│   ├── *Response.php (23 files)             ← Response Formatters
│
├── Web/VM/Academies/Discussion/            ← Data Formatters (ViewModel)
│   ├── AcademyDiscussionVM.php              ← List view
│   ├── AcademyDiscussionShowVM.php          ← Detail view
│   ├── AcademyDiscussionEditVM.php
│   ├── AcademyDiscussionCreateVM.php
│   ├── AcademyDiscussionEmbeddedVM.php
│
├── UseCases/Academies/AcademyDiscussions/  ← Business Orchestration
│   ├── AcademyDiscussionStoreSpecification.php
│   ├── AcademyDiscussionBotFeedbackStore*.php
│
├── Domain/DeveloperJourney/Discussions/    ← Pure Business Logic
│   ├── Aggregates/
│   │   └── NewDiscussion.php                ← Creation logic
│   ├── ValueObjects/
│   │   └── NewCourseDiscussion.php          ← Data validation
│   ├── Events/
│   │   ├── NewCourseDiscussionWasCreated.php
│   │   └── AcademyDiscussionWasCreated.php
│   ├── Repositories/
│   │   └── NewDiscussionRepositoryInterface.php
│   ├── DiscussionUpdate.php                 ← Update aggregate
│   ├── DiscussionResolveUpdater.php
│   ├── DiscussionStateUpdater.php
│
├── DomainServices/CourseDiscussionPermission/
│   └── CourseDiscussionPermissionHelper.php ← Permission logic
│
├── Infrastructure/StorageGateways/Academies/Discussions/
│   ├── AcademyDiscussionGateway.php         ← Main persistence
│   ├── DiscussionCommentGateway.php         ← Comment persistence
│   ├── DiscussionLeaderboardGateway.php
│   ├── DiscussionBotFeedbackGateway.php
│   ├── QueuedDiscussionGateway.php
│
├── Infrastructure/QueryRepositories/Academies/
│   └── AcademyPageQueryRepository.php       ← Read-only queries
│
└── Database/Migrations/
    ├── 2017_12_12_131110_create_developer_journey_discussions_table.php
    ├── 2018_04_10_165235_create_course_discussion_comments_table.php (OLD)
    ├── 2020_08_21_103445_create_course_discussion_comments_new_table.php
    ├── 2020_09_09_135424_create_course_discussion_comments_votes_table.php
    ├── 2020_09_30_100447_add_approved_column_to_course_discussion_comments_new_table.php
    ├── 2020_10_15_104119_rename_approved_column_on_course_discussion_comments_new_table.php
    ├── 2018_02_19_162450_add_resolve_flagging_academy_discussion.php
    ├── 2018_02_20_140932_add_pinned_flagging_academy_discussion.php
    ├── 2019_04_23_100848_add_solved_date_in_developer_journey_discussions.php
    └── 2022_06_13_145233_create_discussion_pinned_at_index.php
```

---

## Data Flow - Quick Reference

### CREATE Discussion Flow
```
1. User: POST /academies/42/discussions
         ├─ title
         ├─ question
         ├─ keywords (comma-separated)
         └─ tutorial_id

2. AcademyDiscussionStoreAction
   └─ Extract request data

3. AcademyDiscussionStoreSpecification
   ├─ Validate: required fields
   ├─ Call: newDiscussionRepository->getNewDiscussion()
   ├─ Call: NewDiscussion->createDiscussion()
   └─ Return: PayloadInterface

4. NewDiscussion (Aggregate)
   ├─ validateCreation():
   │  ├─ Check: course is published
   │  ├─ Check: courseDiscussionPermissionHelper->canWrtiteNewDiscussion()
   │  └─ Check: tutorial_id in course
   ├─ processCreation():
   │  ├─ Create: NewCourseDiscussion ValueObject
   │  │           (validates data)
   │  └─ Raise: NewCourseDiscussionWasCreated event
   └─ Return: success

5. AcademyDiscussionGateway (Infrastructure)
   ├─ INSERT into developer_journey_discussions
   ├─ FOR EACH keyword:
   │  ├─ Find or CREATE in developer_journey_discussions_keywords
   │  └─ INSERT into developer_journey_discussions_relations
   ├─ Cache::flushTag("course_discussions:42")
   └─ Return: discussionId

6. Event Handlers
   ├─ Send email notifications
   ├─ Update contribution points
   └─ Log activity

7. AcademyDiscussionStoreResponse
   └─ Redirect to /academies/42/discussions/{discussionId}
      with: success_message
```

### READ Discussions List Flow
```
1. User: GET /academies/42/discussions

2. AcademyDiscussionIndexAction
   └─ Call: academyPageRepository->constructDiscussionVM()

3. AcademyPageQueryRepository
   ├─ Get: StudyProgress for current user
   ├─ Call: canManage() → false for student
   ├─ Call: canOpen() → true if enrolled
   ├─ Fetch: discussions (published only if not manager)
   ├─ Fetch: modules/tutorials
   ├─ Fetch: popular keywords (from cache)
   └─ Return: AcademyDiscussionVM

4. AcademyDiscussionIndexResponse
   └─ Render: Blade template with ViewModel
      OR return: JSON with ViewModel data

Result: User sees list of discussions
```

### READ Single Discussion + Comments Flow
```
1. User: GET /academies/42/discussions/999

2. AcademyDiscussionShowAction
   └─ Call: academyPageRepository->constructDiscussionShowVM()

3. AcademyPageQueryRepository
   ├─ Fetch: discussion by ID
   ├─ Check: canOpen(status=discussion->status)
   ├─ Check: course_id matches
   ├─ Fetch: root comments (paginated, 50/page)
   │         with upvote/downvote counts
   ├─ For EACH root comment:
   │  └─ Fetch: nested replies (from cache)
   └─ Return: AcademyDiscussionShowVM

4. AcademyDiscussionShowResponse
   └─ Render: Blade template with comments threaded

Result: User sees discussion with comment threads
```

### CREATE Comment Flow
```
1. User: POST /academies/42/discussions/999/comments
         ├─ comment: "Text of comment"
         └─ parent_id: null (or comment ID for reply)

2. CourseDiscussionCommentStoreAction/Specification
   └─ Validate: comment not empty

3. DiscussionCommentGateway
   ├─ INSERT into course_discussion_comments_new
   │  ├─ creator_id: current user
   │  ├─ discussion_id: 999
   │  ├─ parent_id: null or parent comment
   │  ├─ status: 1 (published)
   │  └─ timestamps
   ├─ Cache::flushTag("discussion:999")
   └─ Return: commentId

Result: Comment added to thread, visible immediately
```

### VOTE on Comment Flow
```
1. User: POST /academies/42/discussions/999/comments/1001/vote
         └─ vote_type: upvote | downvote

2. DiscussionCommentVoteGateway
   ├─ INSERT into course_discussion_comments_votes
   │  ├─ voter_id: current user
   │  ├─ comment_id: 1001
   │  └─ vote_status: upvote|downvote
   └─ Return: vote count

Result: Vote recorded, count updated in UI
```

---

## Cache Strategy

### Cache Keys
```
AcademyCacheKeys::courseDiscussionsTag($courseId)
├─ keywordusage:limit:-
├─ keywordusage:limit:15
└─ All invalidated when: discussion created/updated/deleted

AcademyCacheKeys::discussionTag($discussionId)
├─ All discussion data
├─ Comments
└─ Invalidated when: discussion/comment changes
```

### TTL (Time-To-Live)
```
Keywords:   1400 minutes (23 hours) - heavy calculation
Comments:   10080 minutes (1 week) - rarely changes
Discussions: Dynamic - tag-based flush only
```

### Invalidation Points
```
AcademyDiscussionGateway::saveNewCourseDiscussion()
  ├─ Flush "course_discussions:{courseId}"
  └─ Flush "discussion:{discussionId}"

AcademyDiscussionGateway::updateDiscussion()
  └─ Flush tags

DiscussionCommentGateway::store()
  └─ Flush "discussion:{discussionId}"

DiscussionCommentGateway::vote()
  └─ No cache flush (vote counts recalculated in query)
```

---

## Error Handling Layers

```
1. WEB LAYER
   ├─ CSRF token validation
   └─ Request data type coercion

2. USECASE LAYER
   ├─ $dataValidationRules validation
   ├─ Exception catch block
   └─ Returns PayloadInterface (error status)

3. DOMAIN LAYER
   ├─ ValueObject constructor validation
   ├─ Aggregate business logic validation
   └─ Throws InvariantException

4. INFRASTRUCTURE LAYER
   ├─ Foreign key constraints
   ├─ Database schema validation
   └─ Throws DatabaseException

CATCH:
Try-catch in Specification::runSpecification()
  ├─ ObjectNotFoundException → withMissingPayload()
  ├─ InvariantException → withInvariantExceptionPayload()
  └─ Exception → withExceptionPayload()

RETURN:
PayloadInterface with status:
  ├─ SUCCESS
  ├─ FAILURE
  ├─ NOT_FOUND
  └─ Server error messages
```

---

## Key Takeaways

1. **DDD Architecture**: Domain layer contains pure business logic, separated from infrastructure
2. **Permission Model**: Three-level check ensures comprehensive authorization
3. **Caching**: Tag-based invalidation for efficient cache management
4. **Event-Driven**: Domain events enable loose coupling
5. **Testability**: Dependency injection makes testing straightforward
6. **Separation**: Each layer has a single responsibility
7. **Repositories**: Domain (interfaces) vs Infrastructure (implementations)
8. **ValueObjects**: Immutable, always valid, encapsulate meaning

