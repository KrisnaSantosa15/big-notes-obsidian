---
date: 2026-10-13
updated: 2026-10-13
type: guide
tags: [guide, learning, dicoding, dicoding-platform]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Student Dashboard vs Jobs API — Read-Endpoint Conventions

> **Status:** Decision document (no code changed).
> **Date:** 2026-06-19
> **Author:** Engineering — Academies
> **Context:** While refactoring `GET /api/v1/student-dashboard/subscriptions` away from a read-only
> UseCase Specification (see the *"withoutDbTransaction Should Never Exist In A UseCase"* thread), we
> found **four** other GET endpoints in `app/routes/student_dashboard.php` that still wrap read-only
> flows in a Specification. Before fixing them we compared two house styles in the codebase —
> **Student Dashboard** and **Dicoding Jobs** — to decide whether to *migrate everything* to the Jobs
> convention or *adopt only what's needed* for the three Daily Check-in read endpoints.

---

## 1. TL;DR / Recommendation

- **Both conventions are valid.** They are two coherent house styles, not "right vs wrong".
- **Jobs is the more architecturally principled** API style (payload envelope, Responsable response
  layer, Policy-based authorization, reads bypass the Specification layer).
- **Student Dashboard is simpler and more direct** (`__invoke` → `JsonResponse`, inline auth guards,
  inline validation) and is internally consistent across all 13 of its endpoints.
- **Recommended: Approach 1 — targeted adoption.** Fix only the 4 spec-based reads, and make them
  look like the *existing clean reads in the same file* (the milestones endpoints), which already
  embody the Jobs read *principle* in the local idiom.
- **Do NOT do Approach 2 (full migration)** now. It rewrites 13 working endpoints (incl. 4 fine
  mutations) into a foreign style for no functional gain and a loss of local consistency. Keep it as
  a possible *future, separate* initiative if the team wants one API style platform-wide.

---

## 2. The problem being solved

`app/routes/student_dashboard.php` has GET endpoints whose actions run a **read-only** UseCase
Specification:

| Endpoint | Action | Spec | Transaction wrapping |
|---|---|---|---|
| `GET /` (home) | `StudentDashboardShowAction` | `HomeDashboardSpecification` | **plain `->run()` = full write transaction** |
| `GET /daily-check-in` | `DailyCheckInListAction` | `DailyCheckInListSpecification` | `withoutDbTransaction()` |
| `GET /daily-check-in/courses` | `DailyCheckInCourseListAction` | `DailyCheckInCourseListSpecification` | `withoutDbTransaction()` |
| `GET /daily-check-in/courses/{courseId}/submodules` | `DailyCheckInSubmoduleListAction` | `DailyCheckInSubmoduleListSpecification` | `withoutDbTransaction()` |

The agreed principle (from the thread): **a Specification exists to guard a business *change*.**
A flow that only SELECTs data should not be a Specification. Alternatives: **Query Repository**,
**Factory**, **Gateway** (preferred — "biasanya cukup manggil gateway saja"), or **ViewModel**.

`GET /subscriptions` was already migrated to a **Query Repository** in this branch. The remaining
three Daily Check-in reads (and, separately and more involved, the home endpoint) are the subject of
this document.

---

## 3. The two conventions, in detail

### 3.1 Student Dashboard convention

Reference files:
- `Dicoding/Web/Api/V1/DailyCheckIns/DailyCheckInMilestonesGetAction.php`
- `Dicoding/Web/Api/V1/DailyCheckIns/DailyCheckInMilestoneDetailGetAction.php`
- `Dicoding/Web/Api/V1/Dashboards/StudentDashboardSubscriptionBankAccountGetAction.php`

**Shape of a read action:**

```php
class SomethingGetAction extends BaseController
{
    public function __construct(
        private readonly Request $request,
        private readonly SomeGateway $gateway,   // or a read repository / factory
    ) {
        parent::__construct();
        $this->beforeFilter('oauth2:dashboard:students:readonly');
    }

    public function __invoke(): JsonResponse
    {
        if (Auth::guest()) {
            return new JsonResponse(['success' => false, 'message' => 'UNAUTHENTICATED'], 401);
        }
        if (!Auth::user()->isDeveloper()) {
            return new JsonResponse(['success' => false, 'message' => 'FORBIDDEN'], 403);
        }

        // inline validation (when needed), e.g. via the Validatorable trait
        // ... returns a manual 400 with a message code on failure

        $data = $this->gateway->read(Auth::id());

        return new JsonResponse(['success' => true, 'data' => $data]);
    }
}
```

Characteristics:

| Aspect | Student Dashboard |
|---|---|
| Entry point | `__invoke()` returning `Illuminate\Http\JsonResponse` |
| Route wiring | `'uses' => SomeAction::class` (invokable) |
| Auth | `beforeFilter('oauth2:dashboard:students:readonly')` + **inline guards** in every action (`Auth::guest()` → 401, `!isDeveloper()` → 403) |
| Validation | **Inline**, in the action: `Validatorable` trait (`DailyCheckInMilestonesGetAction`) or raw `DateTime` checks (`DailyCheckInMilestoneDetailGetAction`); returns a manual `400` + message code |
| Response shape | Hand-built `['success' => bool, 'data' => ...]` / `['success' => false, 'message' => ...]` |
| Error mapping | Manual per action; spec-based ones use `PayloadResponseStatus::getHttpCode($payload)` |
| Data fetch | **Mixed**: gateway, Query Repository, Domain read-repository, Factory, or (the anti-pattern) Specification |
| Response transformers | Sometimes (`*PayloadTransformer`); sometimes shaping inline in the action |

**Strengths:** minimal indirection; easy to read top-to-bottom; no payload/response ceremony; the
clean reads (milestones, banks, bank-account, subscriptions) are short and obvious.

**Weaknesses:**
- **Auth-guard boilerplate** (`Auth::guest()` / `!isDeveloper()`) is copy-pasted into ~9 actions.
- **Validation is ad-hoc** (trait here, `DateTime` there, spec rules elsewhere) — no single approach.
- **Shaping leaks into actions** (label mapping in `DailyCheckInMilestoneDetailGetAction`,
  `getGroupedTokensByProgram` in `MyAcademyProgressShowAction`).
- Error→HTTP mapping is re-derived in each action.

### 3.2 Jobs API convention

Reference files:
- `Dicoding/Web/Api/V1/Jobs/Vacancies/GetJobsVacanciesAction.php`
- `Dicoding/Web/Http/JobsApiBaseResponse.php`
- `Dicoding/Web/Api/V1/Jobs/Vacancies/GetJobsVacanciesResponse.php`
- `Dicoding/Domain/DicodingJobs/Policies/*`
- `app/jobs_routes.php`

**Shape of a read action:**

```php
class GetSomethingAction extends BaseController
{
    public function __construct(
        private readonly Request $request,
        private readonly SomeGateway $gateway,
        private readonly PayloadFactoryInterface $payloadFactory,
        private readonly ActivityReportInterface $activityReport,
    ) {
        parent::__construct();
        // group already applies 'before' => 'oauth2'
    }

    public function action(): PayloadInterface
    {
        try {
            // (authorization via a Policy object, when needed)
            $data = $this->gateway->getWithOptions(array_filter([
                'page' => $this->request->input('page'),
                'q'    => $this->request->input('q'),
                'user_id' => Auth::id(),
            ]));
            return $this->payloadFactory->withSuccessfulPayload($data->toArray());
        } catch (Exception $e) {
            $this->activityReport->reportError($e);
            return $this->payloadFactory->withExceptionPayload($e);
        }
    }
}
```

Characteristics:

| Aspect | Jobs API |
|---|---|
| Entry point | `action()` returning `Aura\Payload_Interface\PayloadInterface` |
| Route wiring | `'uses' => 'GetSomethingAction@action'` inside a `['before' => 'oauth2']` group |
| Auth | Group-level `before => oauth2`; finer authorization via **Policy** objects in `Domain/DicodingJobs/Policies/` (e.g. `GetJobsTalentListPolicy::isAuthorized()`) |
| Validation | **Essentially none** for query params: raw `request->input()` + `array_filter()`, occasional Value Object cast (`new Boolean($value)`). A `@review` comment in `GetJobsTalentListAction` admits VO-wrapping *would be better* |
| Response shape | A `Responsable` base class `JobsApiBaseResponse` maps `PayloadStatus → HTTP code` (SUCCESS→200, CREATED→201, NOT_FOUND→404, NOT_AUTHORIZED→401, ERROR→`translateDomainErrorStatusCode()`, else 500); per-endpoint `*Response extends JobsApiBaseResponse` shape success bodies (pagination meta, transforms) |
| Error mapping | Centralized in the base Response + domain-exception payload factory methods (`withInvariantExceptionPayload`, `withAuthorizationExceptionPayload`, …) |
| Data fetch | **Direct Gateway** (no Specification for reads, no Query Repository either) |
| Response transformers | Dedicated `*Response` classes |

**Strengths:**
- **Reads never touch the Specification/UseCase layer** — this is the principle we want.
- **Centralized, consistent error→HTTP mapping** via `JobsApiBaseResponse`.
- **Authorization is a first-class Domain concept** (Policy objects), reusable and testable.
- **Uniform** across the whole Jobs surface.

**Weaknesses:**
- **More moving parts per endpoint** (action + payload factory + a `*Response` class).
- **Query-param validation is effectively absent** (their own flagged debt); type-safety relies on
  gateways tolerating junk input.
- The `PayloadInterface → Response` indirection is heavier than a direct `JsonResponse` for trivial
  reads.

### 3.3 What they share (already-good DDD)

- **No Eloquent models in Domain/UseCases.** Gateways use `Illuminate\Database\ConnectionInterface`
  / query builder. ✅
- Actions are **thin-ish** and delegate fetching to gateways/repositories.
- Translation-keyed message codes for errors.

---

## 4. Side-by-side comparison

| Dimension | Student Dashboard | Jobs API |
|---|---|---|
| Action contract | `__invoke(): JsonResponse` | `action(): PayloadInterface` |
| Reads use Specification? | **Yes, in 4 endpoints (anti-pattern)** + clean ones don't | **Never** |
| Error→HTTP mapping | Per-action / `PayloadResponseStatus` | Centralized `JobsApiBaseResponse` |
| Authorization | Inline `Auth::guest()`/`isDeveloper()` guards (duplicated) | Group filter + Domain **Policy** objects |
| Input validation | Inline `Validatorable` / `DateTime` (ad-hoc) | Mostly none (raw input + `array_filter`) |
| Response body shaping | Inline or `*PayloadTransformer` | Dedicated `*Response` classes |
| Indirection / ceremony | Low | Higher |
| Internal consistency | High (one local idiom) | High (one local idiom) |
| Testability of authz | Lower (inline) | Higher (Policy units) |
| Best fit for | Small, focused dashboard surface | Large, multi-actor API surface |

**Which is "better"?** For a *large, multi-role public API* (Jobs has talents, recruiters, admins,
companies), the Jobs convention is better — centralized errors and Policy-based authz pay off at
scale. For a *small, single-audience internal dashboard* (Student Dashboard is one audience:
authenticated developer/student), the Student Dashboard convention is better — less ceremony, easier
to follow, and already internally consistent. **Neither is universally superior; fit depends on the
surface.**

---

## 5. The crucial finding

The Student Dashboard file **already contains clean, spec-free reads** that follow the local idiom:

- `GET /daily-check-in/milestones` (`DailyCheckInMilestonesGetAction`) — inject a read repository,
  **inline `Validatorable` validation**, direct fetch, `JsonResponse`.
- `GET /daily-check-in/milestones/{date}` — inline `DateTime` validation, direct fetch.
- `GET /subscriptions` — Query Repository (just migrated).
- `GET /subscriptions/referral/bank-account` & `…/banks` — direct gateway.
- `GET /progress` — Factory + gateways.

These prove the codebase has **already adopted Jobs' core read *principle* (reads bypass the
Specification layer)** *without* adopting Jobs' response architecture. So the target template for the
three broken Daily Check-in reads is **the milestones endpoints in the same file** — not the Jobs API.

---

## 6. The two approaches

### Approach 1 — Targeted adoption (RECOMMENDED)

**Scope:** the 3 Daily Check-in read endpoints (`/daily-check-in`, `/courses`,
`/courses/{courseId}/submodules`). The home endpoint is a separate, larger task (§8).

**What changes per endpoint:**
- Remove the `UseCase` + `Specification` + `withoutDbTransaction()`.
- Inject `DailyCheckInGateway` directly (it already exposes `getHistory`, `totalDailyCheckIn`,
  `getActiveCoursesWithModules`, `getUserActivities`).
- Keep `__invoke(): JsonResponse`, inline auth guards, and the existing `DailyCheckInPayloadTransformer`.
- **Validation:** move the list endpoint's date/`per_page` rules into the action with the
  `Validatorable` trait (exactly like `DailyCheckInMilestonesGetAction`).
- **`NOT_ENROLLED` guard** (submodules): keep as an inline guard returning the same HTTP status it
  produces today — consistent with the file's other inline guards (do **not** introduce Jobs-style
  Policy classes just for this).
- Optionally push the submodule filtering / `all_modules_completed` shaping into a gateway method
  (`getSubmodulesForCourse($userId, $courseId)`) to avoid in-action shaping.

| | |
|---|---|
| Files touched | 3 actions + 3 specs deleted (+ optional 1 gateway method) |
| Effort | Low (½–1 day incl. tests) |
| Risk | Low — behavior-preserving, mirrors a proven local template |
| Consistency | **Improves** — aligns the 3 reads with the clean reads beside them |
| Payoff | Removes the anti-pattern; nothing foreign introduced |

### Approach 2 — Full migration to Jobs convention

**Scope:** all 13 endpoints in `student_dashboard.php`.

**What changes (every endpoint):**
- `__invoke(): JsonResponse` → `action(): PayloadInterface`; routes → `Action@action`.
- Add a `StudentDashboardApiBaseResponse` (Responsable) + a `*Response` class per endpoint.
- Replace inline `Auth::guest()`/`isDeveloper()` guards with a Policy + base-response mapping.
- Route everything through `PayloadFactoryInterface`.
- Re-home all inline validation/shaping.

| | |
|---|---|
| Files touched | ~13 actions + ~13 response classes + policies + base response + every route line + all integration tests |
| Effort | High (multi-day, multi-PR) |
| Risk | High — rewrites 13 working endpoints, incl. 4 mutations that are already correct; behavior-change surface is large |
| Consistency | Platform-wide consistency *with Jobs*, at the cost of touching everything at once |
| Payoff | Mostly stylistic; **no functional gain** for the dashboard's single-audience surface |

---

## 7. Decision

**Adopt Approach 1.** Rationale:

1. The anti-pattern lives in only 4 endpoints; only those need to change to satisfy the thread.
2. The dashboard already has a consistent, proven local idiom — and a ready template (milestones).
3. Approach 2's benefits (centralized errors, Policy authz) matter for *large multi-actor APIs*;
   the Student Dashboard is a single-audience surface where they don't earn their cost.
4. Approach 2 is a big, risky, low-payoff rewrite of working code (including correct mutations).

If the organization later decides it wants **one** API convention everywhere, a full migration to the
Jobs style is the better long-term target — but that is a deliberate, separate, platform-wide
initiative, not a side effect of fixing three read endpoints.

---

## 8. Follow-up: the home endpoint (`GET /`)

`StudentDashboardShowAction` runs a **read-only** `HomeDashboardSpecification` via plain `->run()`,
i.e. a pure read wrapped in a **write transaction** — arguably worse than the `withoutDbTransaction`
cases. It also makes extra gateway calls and merges them into the spec output inside the action.

Because the spec aggregates ~20 gateway reads with conditional assembly, this is a **larger** refactor
than the three Daily Check-in reads. Recommended as its **own** change: convert to a
`HomeDashboardQueryRepository` (aggregation read, like the subscriptions Query Repository), or — as a
cheap interim correctness fix only — switch `->run()` to `->withoutDbTransaction()->run()` (still a
read-only spec, so not the final state).

---

## 9. Appendix — full endpoint inventory

| # | Method + path | Action | Current data fetch | Validation | Verdict |
|---|---|---|---|---|---|
| 1 | `GET /` | `StudentDashboardShowAction` | `HomeDashboardSpecification` via `->run()` (write txn) + extra gateways | spec rules | ⚠️ read-only spec in write txn (§8) |
| 2 | `GET /daily-check-in` | `DailyCheckInListAction` | `DailyCheckInListSpecification` + `withoutDbTransaction` | spec rules | ⚠️ fix (Approach 1) |
| 3 | `POST /daily-check-in` | `DailyCheckInStoreAction` | write Specification | spec rules | ✅ legit mutation |
| 4 | `GET /daily-check-in/courses` | `DailyCheckInCourseListAction` | `DailyCheckInCourseListSpecification` + `withoutDbTransaction` | user_id | ⚠️ fix (Approach 1) |
| 5 | `GET /daily-check-in/courses/{courseId}/submodules` | `DailyCheckInSubmoduleListAction` | `DailyCheckInSubmoduleListSpecification` + `withoutDbTransaction` | user_id/course_id | ⚠️ fix (Approach 1) |
| 6 | `GET /daily-check-in/milestones` | `DailyCheckInMilestonesGetAction` | `CalendarRepositoryInterface` (direct) | inline `Validatorable` | ✅ clean — **template** |
| 7 | `GET /daily-check-in/milestones/{date}` | `DailyCheckInMilestoneDetailGetAction` | `CalendarRepositoryInterface` (direct) | inline `DateTime` | ✅ clean (minor in-action shaping) |
| 8 | `GET /subscriptions` | `StudentDashboardSubscriptionsShowAction` | **Query Repository** | none (auth-derived) | ✅ clean (just migrated) |
| 9 | `POST /subscriptions/referral` | `StudentDashboardSubscriptionReferralStoreAction` | write Specification | spec rules | ✅ legit mutation |
| 10 | `GET /subscriptions/referral/bank-account` | `StudentDashboardSubscriptionBankAccountGetAction` | direct gateway | none | ✅ clean |
| 11 | `PUT /subscriptions/referral/bank-account` | `StudentDashboardSubscriptionBankAccountUpdateAction` | write Specification | spec rules | ✅ legit mutation |
| 12 | `GET /subscriptions/referral/banks` | `StudentDashboardSubscriptionBanksGetAction` | direct gateway | none | ✅ clean |
| 13 | `GET /progress` | `MyAcademyProgressShowAction` | Factory + gateways (direct) | none | ✅ clean (minor in-action shaping) |

**Legitimate Specifications** (mutations, leave as-is): #3, #9, #11.
**Anti-pattern to fix:** #2, #4, #5 (Approach 1) and #1 (separate, §8).
**Clean reads / local template:** #6, #7, #8, #10, #12, #13.
