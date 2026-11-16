# PRD — Forum AI Assist: Technical Addendum

**Melengkapi:** [prd.md](../prd.md)
**Kosakata domain:** [context.md](../context.md)
**Keputusan arsitektur:** [adr/](../adr/)
**Layanan AI:** [forum-ai-assist](https://github.com/dicodingacademy/forum-ai-assist)

---

## 1. Tujuan & Scope Dokumen

PRD mendefinisikan *apa* yang dibangun. Dokumen ini mendefinisikan *bagaimana* — skema tabel, kontrak HTTP ke Layanan AI, penempatan kode per layer DDD, state machine, dan mekanisme kuota. Setiap keputusan yang punya alternatif nyata dicatat terpisah sebagai ADR dan hanya dirujuk dari sini, tidak diulang argumennya.

**Di luar scope dokumen ini:**

- Desain visual final (PRD §8.7 — deliverable designer belum ada).
- Internal Layanan AI: prompt, persona, strategi retrieval, pemilihan model. Yang dipin di sini hanya *kontrak* di perbatasan.
- Urutan PR/branch pengerjaan. Itu catatan kerja, bukan spesifikasi durable.

**Konvensi:** semua kontrak di dokumen ini sudah diverifikasi langsung terhadap source Layanan AI (`app/main.py`, `app/products/forum/{schemas,router,callback}.py`, `app/products/indexing/router.py`, `app/core/config.py`), bukan terhadap dokumentasinya.

---

## 2. Skema Database (`forum_ai_assist_*`)

### 2.1 `forum_ai_assist_answers`

Satu baris per **Discussion** yang opt-in. `discussion_id` UNIQUE — itulah yang menjamin maksimal satu **Answer** per **Discussion** (ADR-0001), bukan pengecekan di kode.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `id` | `bigint unsigned` AI | PK |
| `discussion_id` | `int unsigned` | **UNIQUE**, FK → `developer_journey_discussions.id` |
| `student_id` | `int unsigned` | Penanya. Sumber `$userId` untuk `PremiumFeature::consume()` di callback (ADR-0003) |
| `course_id` | `int unsigned` | Denormalisasi dari diskusi; dipakai untuk observability NFR-09 tanpa join |
| `status` | `varchar(20)` | `PENDING` \| `ANSWERED` \| `ERROR` \| `DELETED` — lihat §5.3 |
| `content` | `longtext` nullable | Jawaban AI. NULL selama `PENDING` dan pada `ERROR` |
| `latency_ms` | `int unsigned` nullable | NFR-09 "durasi" |
| `error_code` | `varchar(30)` nullable | Hanya terisi saat `ERROR` — lihat §3.3 dan catatan di bawah |
| `deleted_at` | `datetime` nullable | Soft delete moderator (FR-27) |
| `deleted_by` | `int unsigned` nullable | User id moderator. Bersama event `ForumAiAssistAnswerWasDeleted` inilah audit trail-nya (FR-29) |
| `created_at` / `updated_at` | `datetime` | |

**Kenapa hanya segini — setiap kolom dipetakan ke kebutuhan PRD.** Draf sebelumnya menyimpan lima kolom lagi (`model`, `token_usage`, `sources`, `web_search_used`, `retry_count`) semata karena callback mengirimkannya. Itu bukan alasan; callback tetap mengirim kelimanya dan kita cukup mengabaikannya — kontraknya tidak berubah.

| Kolom yang dibuang | Kenapa tidak perlu |
| --- | --- |
| `model` | PRD §8.5 justru **melarang** menyebut "model"/"LLM" di user-facing copy, jadi tidak pernah ditampilkan. LangFuse sudah menyimpannya per generation |
| `token_usage` | LangFuse menyimpan token **dan** biaya lewat callback handler LLM (`pipeline.py`: *"Tracing/cost/latency are recorded in LangFuse"*). "Monitoring actual cost bulanan" di PRD §9 adalah dashboard LangFuse, bukan query MySQL |
| `web_search_used` | FR-11/E-2.5 hanya menuntut AI **bisa** web search. Tidak ada requirement menampilkan apakah dipakai |
| `retry_count` | Nol penyebutan di PRD. Retry ditangani sepenuhnya di sisi Layanan AI dan tidak mengubah apa pun yang siswa atau moderator lihat |
| `sources` | PRD §8.6 edge case #5 baru "**pertimbangkan** bagaimana menampilkan referensi/link ke diskusi lain" — pertimbangan untuk Designer, deliverable-nya belum ada (§8.7). Menyimpan struktur untuk UI yang belum diputuskan bentuknya adalah menebak |

**Kapan menambahkannya kembali** — masing-masing satu migration sepele, jadi tidak ada biaya menunggu:

- `sources` → begitu desain menetapkan bentuk tampilan referensi (edge case #5).
- `model` + `token_usage` → begitu muncul pertanyaan biaya yang benar-benar tidak bisa dijawab LangFuse, misalnya agregasi per course atau per siswa yang harus di-join ke tabel Dicoding.

**Kenapa `error_code` tetap disimpan meski LangFuse punya trace.** Ini satu-satunya pengecualian dari argumen "sudah ada di LangFuse", dan alasannya spesifik: `not_indexed` lahir dari `FileNotFoundError` yang dilempar di `router.py` **sebelum** `run_pipeline()` membuka `trace_scope`. Kegagalan itu karena itu tidak pernah menghasilkan trace sama sekali — baris ini satu-satunya tempat sinyalnya ada.

### 2.2 `forum_ai_assist_feedback`

Meniru `student_chatbot_feedback` (`2026_06_18_000001_…`), ditambah satu kolom yang tabel itu tidak punya.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `id` | `bigint unsigned` AI | PK |
| `answer_id` | `bigint unsigned` | FK → `forum_ai_assist_answers.id`. **UNIQUE bersama `student_id`** — lihat catatan di bawah |
| `student_id` | `int unsigned` | |
| `sentiment` | `varchar(20)` | `helpful` \| `not_helpful` |
| `qualitative_text` | `text` nullable | Hanya terisi saat `not_helpful`. **Internal-only** — disimpan untuk evaluasi tim, tidak pernah dirender publik (FR-23) |
| `created_at` / `updated_at` | `datetime` | |

Perbedaan dari Student Chatbot: di sana UNIQUE-nya `message_id` tunggal karena hanya pemilik percakapan yang bisa memberi feedback. Di sini **seluruh kelas** bisa memberi feedback pada satu **Answer** yang sama, jadi kuncinya `UNIQUE(answer_id, student_id)` — satu feedback per siswa per answer, boleh diganti (FR-24).

### 2.3 Perubahan pada tabel existing

`developer_journey_discussions` mendapat satu kolom:

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `ai_assist_enabled` | `tinyint(1)` | Default `0`. Ditulis sekali saat pembuatan diskusi; tidak pernah di-update |

Kolom ini adalah satu-satunya jejak Forum AI Assist di tabel milik domain lain. `ForumAiAssist` tidak pernah menulis ke `developer_journey_discussions` maupun `course_discussion_comments_new` — itulah yang membuat FR-30 ("hapus jawaban AI tidak boleh menyentuh diskusi atau reply manusia") terjamin secara struktural.

### 2.4 Aturan kolom umum

- Semua timestamp memakai `Asr::getNowDateTimeStringInDefaultTimeZone()`, format `Y-m-d H:i:s`, bukan `NOW()` database.
- Tidak ada kolom `request_id` maupun kolom trace. Korelasi ke LangFuse **diturunkan** dari `discussion_id`, tidak disimpan — lihat §2.5.
- Tidak ada tabel log/audit terpisah. NFR-09 menuntut tepat empat hal — *user, kelas, status, durasi* — dan keempatnya adalah kolom di baris ini: `student_id`, `course_id`, `status`, `latency_ms`. Detail yang lebih dalam (prompt, token, biaya, dokumen yang ter-retrieve) ada di LangFuse, yang bisa dicapai dari baris ini tanpa kolom tambahan (§2.5).

### 2.5 Korelasi ke LangFuse tanpa menyimpan apa pun

`request_id` yang dikembalikan pada respons `202` memang tidak pernah disimpan — dan tidak perlu, karena bukan itu kunci LangFuse. Layanan AI memakai **trace id deterministik** yang diturunkan dari `discussion_id` (`app/eval/tracing.py`):

```python
def forum_seed(discussion_id) -> str:
    return f"forum:{discussion_id}"

def forum_trace_id(discussion_id) -> str:
    return make_trace_id(forum_seed(discussion_id))   # Langfuse.create_trace_id(seed=…)
```

`pipeline.py` menyematkan id itu ke trace lewat `trace_scope(trace_id=forum_trace_id(...))`, jadi setiap jawaban forum selalu mendarat di trace yang id-nya bisa dihitung ulang kapan saja.

Algoritmanya murni hash, tanpa network — `Langfuse.create_trace_id(seed)` = 16 byte pertama dari SHA-256 seed, dalam hex. Artinya sisi PHP bisa menghitungnya sendiri tanpa memanggil Layanan AI maupun LangFuse:

```php
// Diverifikasi identik dengan Langfuse.create_trace_id(seed="forum:12345")
// → ad78994f16f43191559c16b0694eb141
$traceId = substr(hash('sha256', "forum:{$discussionId}"), 0, 32);
```

Sediakan helper kecil (mis. `ForumAiAssistAnswer::getLangfuseTraceId()`) dan tautkan dari halaman admin/debug bila perlu; jangan menambah kolom untuk ini (ADR-0010).

Dua catatan:

- **Seed-nya hanya `discussion_id`.** Dispatch ulang untuk diskusi yang sama menghasilkan trace id yang sama. Karena kontraknya maksimal satu **Answer** per **Discussion**, itu memang yang diinginkan — bukan kebetulan.
- **Konvensi seed adalah kontrak.** `forum_seed()` dipakai jalur jawaban *dan* jalur feedback/score di sisi Layanan AI. Mengubah formatnya memutus korelasi untuk semua trace lama; perlakukan seperti perubahan skema.

---

## 3. Kontrak Layanan AI

### 3.1 Auth

`main.py` memasang seluruh router `/api/v1` di balik satu dependency:

```python
app.include_router(api_router, prefix=settings.API_V1_STR, dependencies=[Depends(verify_api_key)])
```

Konsekuensinya: `Authorization: Bearer <API_KEY>` wajib di **semua** endpoint — endpoint jawaban, kedua endpoint indexing, dan kedua endpoint DELETE. Tidak ada route tanpa auth selain `/` dan `/health`. Kedua gateway keluar kita (`ForumAiAssistApiGateway`, `ForumAiAssistIndexingApiGateway`) mengambil token dari `config('forum_ai_assist.api_auth_bearer')`.

### 3.2 Permintaan jawaban — `POST /api/v1/forum-ai/answers`

Respons: `202 {"status":"accepted","request_id":"<uuid>"}`.

Body (`ForumAIRequest`):

| Field | Sumber di sisi kita |
| --- | --- |
| `discussion_id` | Baris diskusi yang baru dibuat |
| `course_id`, `tutorial_id` | Idem — `tutorial_id` sudah ada di `developer_journey_discussions`, tidak perlu kolom baru |
| `user_id` | `creator_id` diskusi |
| `title`, `question` | Idem. `question` dikirim sebagai HTML Froala apa adanya |
| `images[]` | URL CDN hasil ekstraksi dari body diskusi |
| `course_name`, `levels[]` | Dari service course yang sudah menopang halaman diskusi — `AcademyGateway` adalah titik awal yang benar (dipakai `SendMessageAction` untuk keperluan identik) |
| `persona`, `provider`, `model_name`, `reasoning_effort` | **Selalu dihilangkan** (ADR-0009) |
| `enable_thinking` | Dihilangkan; default `False` di sisi Layanan AI |

Layanan AI punya rate limiter sendiri (30 req/menit per user, 60 per IP). Itu jaring pengaman sekunder; gate utama tetap kuota `PremiumFeature` di sisi kita (§6).

### 3.3 Callback — `POST /api/v1/forum-ai/callback`

Endpoint yang **kita** bangun. Layanan AI mem-POST ke `settings.DICODING_CALLBACK_URL`; path-nya kita tentukan dan default di sisi Layanan AI disesuaikan (ADR-0006).

Payload sukses (`CallbackSuccessPayload`):

```json
{
  "discussion_id": 12345,
  "status": "answered",
  "answer": "<p>…</p>",
  "model": "google/gemini-2.5-flash-lite",
  "token_usage": {"prompt_tokens": 1820, "completion_tokens": 340, "total_tokens": 2160},
  "sources": [{"collection": "courses", "chunk_id": "…", "score": 0.82, "preview": "…"}],
  "web_search_used": false,
  "latency_ms": 8400
}
```

Payload gagal (`CallbackErrorPayload`):

```json
{
  "discussion_id": 12345,
  "status": "error",
  "error_code": "llm_error",
  "retry_count": 2,
  "latency_ms": 30100
}
```

`error_code` bernilai salah satu dari:

| Nilai | Arti | Tindakan |
| --- | --- | --- |
| `llm_error` | Panggilan LLM gagal setelah retry habis | Tampilkan error state; siswa bisa buat diskusi baru |
| `content_filtered` | Provider memblokir karena kebijakan konten | Idem |
| `timeout` | LLM tidak merespons dalam batas waktu | Idem |
| `not_indexed` | Course belum punya collection — retrieval tidak bisa jalan | **Bukan masalah generasi.** Berarti indexing (§7) belum pernah sukses untuk course itu. Cek job indexing sebelum menyalahkan pipeline |
| `unknown` | Exception pipeline lain | Butuh baca log Layanan AI |

Catatan kontrak yang wajib dipatuhi implementasi:

- **`collection` bernilai `"courses"`, bukan `"classes"`.**
- **`discussion_id` adalah satu-satunya kunci korelasi.** `send_callback()` mengirim `payload.model_dump()` dari skema di atas; `request_id` tidak ikut. `CallbackRequestPayload` ada di `schemas.py` tapi tidak pernah dipakai sebagai body keluar.
- **Retry LLM sudah ditangani di hulu.** Layanan AI mencoba ulang panggilan LLM sampai `LLM_RETRY_MAX` (= 2, sesuai FR-13/E-2.6) lewat `_call_with_retry()`, lalu meneruskan hitungannya ke `retry_count`. Karena retry itu sepenuhnya urusan Layanan AI dan tidak mengubah apa pun yang siswa atau moderator lihat, kita **tidak menyimpannya** (§2.1) — cukup abaikan field-nya.
- **Field callback yang tidak kita simpan:** `model`, `token_usage`, `sources`, `web_search_used`, `retry_count`. Semuanya tetap dikirim; alasan tidak menyimpannya ada di §2.1. Jangan menambahkan kolom hanya karena field-nya ada di payload.
- **Selalu balas `200`,** termasuk untuk `discussion_id` yang tidak dikenal atau sudah final (log + no-op). Ini didikte pengirim: `callback.py` hanya retry pada `5xx` dan error jaringan, sedangkan `4xx` menghentikan retry tapi tetap tercatat sebagai kegagalan di sisi mereka. `200` adalah satu-satunya respons yang sekaligus idempoten dan bersih di kedua log.
- **Auth masuk:** `Authorization: Bearer <DICODING_CALLBACK_API_KEY>`, divalidasi terhadap `config('forum_ai_assist.callback_auth_bearer')`. Route tidak memakai filter `auth` maupun `csrf`.

**Catatan `not_indexed`:** kode ini ditambahkan setelah review — sebelumnya cabang `FileNotFoundError` ikut dilaporkan sebagai `unknown`, sehingga "course belum ter-index" tidak terbedakan dari kegagalan generasi. Student Chatbot **tidak** bisa dijadikan acuan di sini: `ChatErrorCode` miliknya tidak punya padanan sama sekali dan `AiServiceGateway` melipat semua kasus non-spesifik jadi `SERVICE_UNAVAILABLE`; ADR-0007 Student Chatbot bahkan menandai celah yang sama dari sisi sebaliknya (tidak ada jalur hapus index saat course di-unpublish). Jadi ini perbaikan, bukan penyimpangan dari preseden.

### 3.4 Endpoint indexing — multipart, bukan JSON

Ini bagian yang paling mudah salah, jadi ditulis lengkap:

```python
@router.post("/courses")
async def index_courses(
    request: Request,
    file: UploadFile = File(...),
    courseId: int = Form(...),
    environment: str = Form(...),
): ...
```

- `POST /api/v1/index/courses` dan `POST /api/v1/index/discussions` adalah `multipart/form-data` dengan tepat tiga field wajib: `file` (ZIP), `courseId`, `environment`. Mengirim JSON menghasilkan `422`.
- `environment` bebas di sisi Python (hanya di-log), tapi di codebase ini nilainya `production|staging` — lihat `UpdateCourseVectorEmbeddingSpecification::$dataValidationRules` dan derivasinya di `UpdateAIVectorEmbeddingListener::getEnvironment()`. Pakai ulang derivasi itu apa adanya.
- **Bentuk multipart-nya sudah ada di repo ini:** `ExplainWithAIApiService::uploadCourseContentToVectorEmbedding()` membangun request yang persis sama — nama field identik (`courseId`, `environment`, `file`), termasuk `Content-Type: application/zip` pada bagian file. Salin; yang berubah hanya base URL, path, dan sumber bearer.
- Respons `200` (bukan 202) dan bersifat asinkron: `{"status":"queued","job_id":"<uuid>","course_id":…,"environment":…,"queue_position":N}`. **`200` berarti "job masuk antrian", bukan "konten sudah terindeks"** — satu worker global memproses satu job pada satu waktu, dan semua yang bisa gagal (ZIP rusak, embedding error, OOM) terjadi *setelah* respons ini. Satu-satunya jalan melihatnya adalah `GET /api/v1/index/{courses,discussions}/status/{job_id}`, yang kita poll secara berbatas — lihat §7.3.
- `DELETE /api/v1/index/courses` dan `DELETE /api/v1/index/discussions` menerima **body JSON** `{course_id: int, ids: int[]}` dan berjalan sinkron. Guzzle mendukungnya lewat `->delete($url, ['json' => …])`, bentuk yang sudah dipakai `ExplainWithAIApiService::deleteFromVectorStore()`.

### 3.5 Konvensi nama file di dalam ZIP

- **Courses:** setiap file wajib bernama `module_{module_id}.<ext>` (mis. `module_421.txt`). Pola itulah yang di-parse sebagai kunci upsert (`module_chunker.py::_parse_module_id`, regex `^module_(\d+)$`, dicocokkan ke *stem* nama file). Nama lain — `421.txt` atau nama ter-slugify — tetap terindeks, hanya tanpa kunci upsert/delete, sehingga pengiriman ulang menambah duplikat alih-alih mengganti.
- `extract_zip_flat()` meratakan semua direktori, jadi entri bersarang seperti `course_184/module_421.txt` mendarat sebagai `module_421.txt` dan tetap ter-parse. Bersarang tidak merusak apa pun, tapi juga tidak ada gunanya — tulis file di root ZIP.
- **Discussions:** setiap file bernama `discussion_{discussion_id}.json` berisi `{discussion_id, question, answer, tutorial_id?, title?}`. Nama file di sini kosmetik — Layanan AI membaca `discussion_id` dari body JSON, bukan dari nama file — tapi jaga konsistensinya dengan sisi courses.

---

## 4. Layering DDD (penempatan kode)

Mengikuti `Dicoding/{Domain,UseCases,Infrastructure,Web}/StudentChatbot/` di setiap layer. Penamaan mengikuti pola `<NamaAggregate>` / `<NamaAggregate>Repository` / `<NamaAggregate>Specification` — bukan verb-first.

```text
Dicoding/Domain/ForumAiAssist/
  Aggregates/    ForumAiAssistAnswerDispatch, ForumAiAssistAnswerFinalization,
                 ForumAiAssistAnswerDeletion, ForumAiAssistFeedbackSubmission
  Events/        ForumAiAssistAnswerWasRequested, …WasCompleted, …WasFailed,
                 …WasDeleted, ForumAiAssistFeedbackWasSubmitted
  Enums/         ForumAiAssistAnswerStatus, ForumAiAssistErrorCode,
                 ForumAiAssistFeedbackSentiment
                 ↑ ForumAiAssistErrorCode harus memuat kelima nilai di §3.3,
                   termasuk NOT_INDEXED — cocokkan persis dengan Literal
                   CallbackErrorPayload, callback dengan nilai tak dikenal
                   ditolak sebelum sempat disimpan
  ValueObjects/  ForumAiAssistAnswer

Dicoding/UseCases/ForumAiAssist/
  ForumAiAssistAnswerDispatchSpecification
  ForumAiAssistAnswerFinalizationSpecification
  ForumAiAssistAnswerDeletionSpecification
  ForumAiAssistFeedbackSubmissionSpecification
  IndexForumAiAssistCourseContentSpecification        ← verb-first, ikut presedennya sendiri
  IndexForumAiAssistDiscussionContentSpecification       (UpdateCourseVectorEmbeddingSpecification)

Dicoding/Infrastructure/
  Repositories/ForumAiAssist/     ForumAiAssistFactoryRepository (factory bersama)
                                  + satu Repository per aggregate
  StorageGateways/ForumAiAssist/  ForumAiAssistAnswerGateway, ForumAiAssistFeedbackGateway
  WebServices/ForumAiAssist/      ForumAiAssistApiGateway, ForumAiAssistIndexingApiGateway
  GlobalDomainEventHandlers/ForumAiAssist/
                                  ForumAiAssistAnswerWasRequestedListener
                                  ForumAiAssistCourseIndexingListener
                                  ForumAiAssistDiscussionIndexingListener

Dicoding/Web/ForumAiAssist/
  CallbackActions/  ForumAiAssistCallbackAction
  AnswerActions/    DeleteAnswerAction
  FeedbackActions/  SubmitFeedbackAction
```

Dua pemisahan yang disengaja:

- **`ForumAiAssistFeedbackGateway` terpisah dari `ForumAiAssistAnswerGateway`**, meniru pemisahan `ChatbotMessageGateway` / `ChatbotFeedbackGateway`, bukan menumpuk feedback ke gateway answer.
- **Web layer top-level `Dicoding/Web/ForumAiAssist/`**, bukan `Web/Api/V1/ForumAiAssist/`. Direktori `Web/Api/V1/` memang ada, tapi Student Chatbot — preseden yang diikuti di seluruh dokumen ini — tidak tinggal di sana.

Route hidup di `app/routes/forum-ai-assist.php`, di-`require` dari `app/routes.php`, dibungkus `Route::cache(__FILE__, function () { … })` persis seperti `app/routes/student-chatbot.php`. Lokasi file dan prefix URI independen — URI tetap diawali `api/v1/…`.

---

## 5. Alur & State Machine

### 5.1 Dispatch (siswa membuat diskusi)

```text
AcademyDiscussionStoreAction
  └─ gate PremiumFeature (§6) → ai_assist_enabled: bool
       └─ AcademyDiscussionStoreSpecification
            └─ NewDiscussionRepository::saveNewDiscussion()
                 ├─ INSERT developer_journey_discussions (ai_assist_enabled)
                 └─ raise AcademyDiscussionWasCreated(discussionId)
                      └─ ForumAiAssistAnswerWasRequestedListener   [in-request]
                           ├─ lookup baris diskusi
                           ├─ return early bila !ai_assist_enabled
                           └─ SpecificationQueueRunnerHandler::push(...)
                                └─ ForumAiAssistAnswerDispatchSpecification   [beanstalkd]
                                     ├─ INSERT forum_ai_assist_answers (PENDING)
                                     └─ POST /api/v1/forum-ai/answers → 202
```

Trigger-nya `AcademyDiscussionWasCreated`, **bukan** `NewCourseDiscussionWasCreated` (ADR-0002). Lookup ada di listener, bukan di Specification, supaya diskusi yang tidak opt-in — mayoritas besar — tidak pernah membuat job di antrian sama sekali.

Kegagalan pada tahap mana pun setelah INSERT diskusi tidak boleh membatalkan diskusinya (NFR-03). Itu terjamin oleh queue: pada saat listener jalan, diskusi sudah ter-commit.

### 5.2 Finalization (callback mendarat)

```text
POST /api/v1/forum-ai/callback
  └─ ForumAiAssistCallbackAction
       ├─ verifikasi Bearer
       ├─ ForumAiAssistAnswerFinalizationSpecification
       │    ├─ guard: status masih PENDING
       │    ├─ UPDATE forum_ai_assist_answers → ANSWERED | ERROR
       │    └─ payload: consumption_rate (1 bila sukses, 0 bila gagal)
       └─ bila sukses: PremiumFeature::consume($studentId, 'forum-ai-assist', $rate)
                        ↑ dari kolom student_id, bukan Auth::id()
```

`Auth::id()` tidak tersedia di sini — request ini terautentikasi sebagai Layanan AI, bukan sebagai siswa. Penempatan `consume()` di Action (bukan di Specification) tetap meniru `SendMessageAction`; hanya sumber id-nya yang berbeda.

### 5.3 State machine `forum_ai_assist_answers.status`

```text
            (dispatch berhasil)
                    │
                    ▼
                 PENDING ──── callback sukses ────▶ ANSWERED ──┐
                    │                                          │
                    └──── callback error ────────▶ ERROR       │ moderator
                                                     │         │  hapus
                                                     └────┬────┘
                                                          ▼
                                                       DELETED
```

- `PENDING` → `ANSWERED` | `ERROR` adalah satu-satunya transisi otomatis, dijaga di `ForumAiAssistAnswerFinalization` (callback pada baris yang sudah final = no-op, balas `200`).
- `DELETED` hanya dicapai lewat aksi moderator dan bersifat terminal.
- Tidak ada `PENDING` → `DELETED` yang berguna, tapi juga tidak dilarang khusus — moderator tidak punya UI untuk itu karena jawaban belum tampil.
- Tidak ada SSE dan tidak ada polling. State dirender server-side saat halaman dimuat (FR-16).

---

## 6. Quota & Cost Control

Memakai sistem `PremiumFeatures` generik, terdaftar di `app/config/premium_feature_configs.php` sebagai `forum-ai-assist` (ADR-0004):

```php
'forum-ai-assist' => [
    'limits' => [
        FeatureMode::SUBSCRIPTION->value => [/* placeholder, menunggu Product */],
        FeatureMode::TRIAL->value        => [/* placeholder */],
        FeatureMode::INTERNAL->value     => [/* placeholder — rollout internal dulu */],
    ],
    'unit_measurement' => UnitMeasurement::REQUEST->value,
    'feature_subscribed_to' => [
        SubscriptionType::ACADEMY_SUBSCRIPTION->value,
    ],
],
```

**Pembagian tanggung jawab (ADR-0003):**

| Tahap | Di mana | Kenapa |
| --- | --- | --- |
| Validasi | `AcademyDiscussionStoreAction` | `isEnabled()`/`isLimitExhausted()` diawali `\Auth::guest()`/`\Auth::id()`; hanya valid selama session siswa hidup |
| Konsumsi | `ForumAiAssistCallbackAction`, jalur sukses saja | `consume()` menerima `$userId` eksplisit, jadi aman di konteks webhook |

Gate-nya *inline*, bukan `beforeFilter('premium:forum-ai-assist')` seperti `SendMessageAction`, karena route pembuatan diskusi melayani semua siswa dan menggating seluruh route akan melanggar FR-04:

```php
'ai_assist_enabled' => (bool) $this->request->input('ai_assist_enabled')
    && PremiumFeature::isEnabled('forum-ai-assist')
    && !PremiumFeature::isLimitExhausted('forum-ai-assist'),
```

`PremiumFeature` adalah kelas `Web\Utils`, jadi memanggilnya dari layer Web benar; memanggilnya dari `UseCases` tidak.

**Yang tidak boleh dilakukan:** memanggil `PremiumFeature::isEnabled()` atau `isLimitExhausted()` dari `ForumAiAssistAnswerDispatchSpecification`. Specification itu berjalan di beanstalkd tanpa session — hasilnya akan menolak 100% request, senyap.

**Konsekuensi yang diwarisi dari Student Chatbot (ADR-0003 mereka):** reset `PremiumFeature` bersifat rolling 24 jam dari `last_reset_at`, bukan selaras kalender ke 00:00 WIB. Microcopy "kuota akan tersedia kembali besok" (PRD §8.5) harus diturunkan dari `nextResetAt` per user, bukan dari jam tetap.

**Perilaku bypass (ADR-0005):** siswa non-Premium atau yang kuotanya habis dan mengirim `ai_assist_enabled=true` tetap mendapatkan diskusinya; flag-nya yang dijatuhkan (`ai_assist_enabled = 0`, tanpa baris answer, tanpa job). Bukan `403`.

---

## 7. Indexing Pipeline

dicoding.com yang mendorong; Layanan AI tidak pernah menarik (ADR-0007). Setiap trigger mengirim hanya yang berubah — satu module, satu discussion — tidak pernah satu course penuh.

### 7.1 Materi course

| Trigger | Aksi |
| --- | --- |
| `CourseTutorialWasSetAsPublished` | Zip satu tutorial sebagai `module_{tutorialId}.txt` → `POST /api/v1/index/courses` |
| `CourseTutorialWasSetAsReady` | `DELETE /api/v1/index/courses` dengan `{course_id, ids: [tutorialId]}` |

Keduanya di-handle `ForumAiAssistCourseIndexingListener`, di-queue lewat `SpecificationQueueRunnerHandler::push()` biasa — **bukan** `pushLaterOnce`. Alasan batching mingguan pada Explain-with-AI (`startAt: next Monday 04:00`) tidak berlaku di sini: setiap trigger adalah upsert satu item yang murah, tidak ada yang perlu dikolaps.

Mengedit tutorial yang sudah publish tetap memicu ulang, tidak ada celah: `CourseTutorialUpdate::raiseDomainEvents()` memilih event berdasarkan `ModuleStatus` **target**, bukan status sebelumnya — jadi edit konten yang mempertahankan status `PUBLISHED` tetap menyalakan `CourseTutorialWasSetAsPublished`.

Tiga hal yang wajib diperhatikan implementasi:

1. **`CourseTutorialWasSetAsReady` perlu diberi `courseId`.** Bentuk sekarang `__construct(int $tutorialId)` — tanpa `course_id` dan tanpa getter sama sekali. Diubah menjadi `__construct(int $courseId, int $tutorialId)` + getter, menyamakannya dengan `CourseTutorialWasSetAsPublished`. Satu raiser, nol perubahan test (ADR-0008). Event ini juga menyala pada **setiap** transisi ke status non-PUBLISHED, termasuk draft yang belum pernah publish — mayoritas DELETE-nya akan no-op.
2. **Lewati upload bila jumlah chunk `0`.** `ExplainWithAIGateway::retrieveTutorialContentByChunkAndReturnCount()` memfilter `djt.type = ARTICLE`, `djt.status = PUBLISHED`, `dj.type = REGULER`, sedangkan `CourseTutorialWasSetAsPublished` menyala juga untuk kuis, ujian, submission, dan interactive video — semuanya sah menghasilkan 0 baris. `UpdateCourseVectorEmbeddingSpecification` melempar `InvariantException` pada kasus itu; untuk kita itu salah (akan melaporkan kegagalan pada publish kuis yang normal). Kembalikan payload sukses no-op.
3. **Jangan pernah mengirim ZIP kosong.** `extract_zip_flat()` memanggil `shutil.rmtree(target_dir)` *sebelum* mengekstrak, jadi ZIP kosong menghapus `data/courses/raw/course_{id}/`. Vektornya selamat (`index_modules` return awal saat docs kosong, tidak sampai `upsert_collection`), tapi mirror raw-nya hilang.

### 7.2 Q&A diskusi

| Trigger | Kondisi | Aksi |
| --- | --- | --- |
| `AcademyDiscussionWasUpdated` | payload `solved === 1` | Zip `discussion_{id}.json` → `POST /api/v1/index/discussions` |
| `AcademyDiscussionWasUpdated` | payload `solved === 0` | `DELETE /api/v1/index/discussions` |
| `DiscussionCommentWasDeleted` | komentar yang dihapus adalah `is_selected_answer` | `DELETE /api/v1/index/discussions` |

Isi `answer` diambil dari komentar dengan `is_selected_answer = 1` untuk diskusi tersebut (`DiscussionCommentGateway.php:312,325`).

`AcademyDiscussionWasUpdated` tidak membawa `course_id` dan tidak punya getter — payload-nya `(updaterId, discussionId, ['solved' => …])`, dibaca lewat `getEventData()`. Di sini **lookup**, bukan memperlebar event: ada tiga raiser (`DiscussionResolveUpdater`, `DiscussionUpdate`, `DiscussionStateUpdater`), berbeda dari kasus satu-raiser di §7.1 (ADR-0008).

### 7.3 Verifikasi keberhasilan indexing

`POST /index/...` hanya mengembalikan `job_id` — sukses HTTP berarti "job masuk antrian", bukan "konten sudah terindeks". Verifikasinya dilakukan di dalam Specification yang sudah berjalan di queue, dengan polling berbatas ke `GET /api/v1/index/{courses,discussions}/status/{job_id}`:

```text
POST /index/courses → 200 {job_id}
  └─ poll GET /index/courses/status/{job_id}
       backoff 2s → 4s → 8s → 16s (maks ~30 detik, 4 percobaan)

       status "done"                  → sukses, log total_chunks, selesai
       status "error"                 → reportError() — ini kegagalan nyata
       masih "queued" | "processing"  → berhenti polling, log "unverified"
                                        (backlog, BUKAN kegagalan)
```

Blocking beberapa detik di sini tidak berbiaya: Specification-nya memang sudah asinkron dan tidak ada pengguna yang menunggu.

**Kenapa timeout bukan kegagalan.** Layanan AI memproses job indexing dengan **satu worker global**, satu job pada satu waktu. Saat publish massal, job kita bisa mengantre lama tanpa ada yang salah. Membedakan `error` (pasti gagal) dari `queued`/`processing` (masih jalan) adalah inti desain ini — kalau tidak, alarm akan berbunyi setiap kali ada antrean panjang dan akhirnya diabaikan orang.

**Backstop untuk yang lolos verifikasi.** Polling menutup kasus "job gagal"; ia tidak menutup kasus "job hilang setelah kita berhenti menunggu". Yang menutup itu adalah `error_code: "not_indexed"` (§3.3): begitu ada siswa benar-benar bertanya di course yang collection-nya tidak ada, callback-nya menyebutkan persis itu. Dua mekanisme ini saling melengkapi — polling menangkap kegagalan lebih awal dan proaktif, `not_indexed` menangkap sisanya secara reaktif.

**Yang sengaja tidak dibangun:** job rekonsiliasi berkala yang membandingkan seluruh tutorial published terhadap isi index. Belum ada bukti index drift; bangun kalau `not_indexed` mulai muncul untuk course yang seharusnya sudah terindeks (ADR-0011).

### 7.4 Batasan yang diterima, bukan diselesaikan

- **Tidak ada backfill** untuk tutorial/diskusi yang sudah ada sebelum fitur ini rilis — disengaja karena fitur masih pra-launch. Bila ternyata rilis setelah ada konten lama, perlu command sekali jalan.
- **`raw/` bukan mirror.** Karena `rmtree` di atas, `data/courses/raw/course_{id}/` hanya berisi file dari job terakhir — di bawah model delta-send berarti satu file. Chroma adalah source of truth; jangan perlakukan direktori itu sebagai backup.
- **Off-switch.** `SpecificationQueueRunnerHandler::push()` menerima `$dependsFeature` dan akan short-circuit bila feature dimatikan. Isi parameter itu — tanpanya satu-satunya cara menghentikan indexing yang bermasalah adalah deploy.

---

## 8. API / Route Contracts

Semua route di `app/routes/forum-ai-assist.php`.

| Method | URI | Action | Filter | Catatan |
| --- | --- | --- | --- | --- |
| `POST` | `api/v1/forum-ai/callback` | `ForumAiAssistCallbackAction` | — | Bearer diperiksa di dalam Action. Tanpa `auth`/`csrf`. Selalu `200` |
| `DELETE` | `api/v1/forum-ai/{discussionId}/answer` | `DeleteAnswerAction` | `auth` | Role check di guard aggregate — lihat catatan di bawah |
| `PUT` | `api/v1/forum-ai/{discussionId}/feedback` | `SubmitFeedbackAction` | `auth`, `csrf` | Body `{sentiment, qualitative_text?}` |

Opt-in sendiri tidak punya route baru — ia menumpang `AcademyDiscussionStoreAction` yang sudah ada.

**Catatan role gating:** filter `academy_admin` dan `academy_manager` dua-duanya terdaftar (`app/filters.php:89-90`), tapi `beforeFilter` berkomposisi sebagai AND, bukan OR. Konfirmasi saat implementasi apakah sudah ada filter gabungan; bila belum, pakai `beforeFilter('auth')` dan lakukan OR-check di guard `ForumAiAssistAnswerDeletion` — tempat aturannya memang sudah dispesifikasikan.

---

## 9. Konfigurasi

`app/config/forum_ai_assist.php`:

| Kunci | Isi |
| --- | --- |
| `api_base_url` | Base URL Layanan AI |
| `api_auth_bearer` | Token keluar — dipakai gateway jawaban **dan** gateway indexing (§3.1) |
| `callback_auth_bearer` | Token masuk — harus sama dengan `DICODING_CALLBACK_API_KEY` di sisi Layanan AI |

Tidak ada kunci `default_provider` / `default_model`. PHP tidak pernah mengirim field itu (ADR-0009).

Di sisi Layanan AI, `DICODING_CALLBACK_URL` sudah default ke `…/api/v1/forum-ai/callback` — sama dengan yang kita expose, jadi **tidak ada perubahan upstream yang dibutuhkan** (ADR-0006, direvisi).

---

## 10. Security & Privacy Mapping

| Requirement | Pemenuhan |
| --- | --- |
| NFR-05 — hanya Premium yang boleh memicu request AI, divalidasi server-side | Gate di `AcademyDiscussionStoreAction` (§6), independen dari logika Blade. Tampering di klien tidak bisa menembusnya |
| NFR-06 — filter konten: tanpa PII, tanpa profanity | **Terpenuhi sebagian.** `output_filter.py::filter_output()` memeriksa kebocoran system prompt (mengganti **seluruh** jawaban) dan memanggil `redact_pii()` (email/telepon/kartu kredit, diredaksi **di tempat**). **Filter profanity belum ada** — lihat §11 |
| NFR-07 — AI tidak boleh mengakses submission privat siswa lain | Terjamin struktural: yang di-index hanya materi course publik dan diskusi di course tersebut (§7); tidak ada jalur dari submission ke vector store |
| NFR-09 — setiap request AI tercatat | Baris `forum_ai_assist_answers` itu sendiri (§2.4) |
| FR-29 — audit trail penghapusan | Kolom `deleted_at`/`deleted_by` + event `ForumAiAssistAnswerWasDeleted` (ADR-0001) |
| FR-30 — hapus jawaban AI tidak menyentuh diskusi/reply | Terjamin struktural: `ForumAiAssist` tidak pernah menulis ke tabel diskusi/komentar (§2.3) |
| Auth callback | Bearer shared-secret (§3.3). Sengaja **tidak** meniru `XenditNotificationAction`, preseden webhook masuk terdekat di codebase ini, yang sama sekali tidak memverifikasi signature/token |

---

## 11. Open Questions

| # | Isu | Owner | Status |
| --- | --- | --- | --- |
| 1 | **Filter profanity** (NFR-06) belum ada di kedua sisi. Implementasi berbasis regex/wordlist sempat dibuat lalu **di-rollback atas keputusan tim** — daftar kata statis dinilai rapuh (varian ejaan, leetspeak, false positive pada istilah teknis) dan sedang dicari pendekatan lain, misalnya klasifier atau guardrail di level model. Sampai itu ada, moderasi post-hoc (FR-27) adalah satu-satunya jaring pengaman | AI Engineer / PM | **Terbuka** |
| 2 | **Angka kuota final** untuk `forum-ai-assist` — masih placeholder. Perubahannya tidak butuh redeploy (E-6.1/NFR-08 terpenuhi), jadi ini tidak memblokir implementasi; hanya harus terisi sebelum rollout ke siswa | Product | **Terbuka** |
| 3 | **FR-25** (tampilan agregat jumlah helpful/not-helpful) berprioritas Low/opsional. Ditunda — tinjau ulang setelah `upsertFeedback()` ada dan ada data feedback nyata | Product / BE | **Ditunda** |
| ~~4~~ | ~~`error_code` untuk "course belum ter-index"~~ | — | **Selesai** — `not_indexed` (§3.3) |
| ~~5~~ | ~~Keberhasilan indexing tidak diverifikasi~~ | — | **Selesai** — polling berbatas + backstop `not_indexed` (§7.3, ADR-0011) |
| ~~6~~ | ~~Korelasi LangFuse tanpa `request_id`~~ | — | **Selesai** — trace id deterministik dari `discussion_id` (§2.5, ADR-0010) |

---

## 12. Revision History

| Tanggal | Perubahan |
| --- | --- |
| 2026-08-14 | Versi awal. Diturunkan dari implementation plan setelah seluruh kontrak diverifikasi terhadap source Layanan AI dan codebase dicoding.com; keputusan dipromosikan ke ADR-0001 s.d. ADR-0009 |
| 2026-08-14 | Menutup tiga open question. §2.5 korelasi LangFuse dari `discussion_id` (ADR-0010); `error_code: not_indexed` di §3.3; §7.3 verifikasi indexing lewat polling berbatas (ADR-0011). Perubahan sisi Layanan AI diimplementasikan, seluruh test suite lulus. Filter profanity sempat ikut diimplementasikan lalu di-rollback — tetap terbuka (§11 #1) |
| 2026-08-14 | Skema `forum_ai_assist_answers` diperkecil 17 → 12 kolom setelah dibandingkan langsung dengan PRD: `model`, `token_usage`, `sources`, `web_search_used`, `retry_count` dibuang karena tidak ada requirement yang memakainya dan datanya sudah ada di LangFuse (§2.1). Kontrak callback tidak berubah |
