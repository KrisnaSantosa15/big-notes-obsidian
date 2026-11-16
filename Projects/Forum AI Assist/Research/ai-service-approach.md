---
date: 2026-10-13
updated: 2026-10-13
type: research
tags: [research, dicoding, forum-ai-assist]
related-projects: ["[[Projects/Dicoding Platform]]"]
related-people: ["[[People/Krisna]]"]
ai-first: true
---
# Forum AI Assist — Eksplorasi Pendekatan AI Service

**Berdasarkan:** Card Basecamp "[10][P2][KPI-10][FAA][LX35] Eksplorasi pendekatan AI Service untuk Forum AI Assist" (Krisna Santosa)
**Referensi:** [prd.md](../../domains/forum-ai-assist/prd.md), Chester AI (`~/projects/explain-with-chatbot/`)
**Status:** Final — hasil brainstorming dan keputusan arsitektur

---

## Daftar Isi

- [Goal Eksplorasi](#goal-eksplorasi)
- [Constraint](#constraint)
- [Pendekatan: Prototipe LangChain + LangFuse + ChromaDB](#pendekatan-prototipe-langchain--langfuse--chromadb)
- [Keputusan yang Telah Disepakati](#keputusan-yang-telah-disepakati)
- [Ringkasan Arsitektur Final](#ringkasan-arsitektur-final)
- [Codebase Reference: Chester AI](#codebase-reference-chester-ai)
- [Yang Berbeda dari Chester AI](#yang-berbeda-dari-chester-ai)
- [Struktur Folder FAA](#struktur-folder-faa)
  - [Prinsip Pemisahan Offline vs Online](#prinsip-pemisahan-offline-vs-online)
  - [Mapping `rag_utils` Chester FAA](#mapping-rag_utils-chester--faa)
- [Evaluasi Chester AI vs RAG Best Practices](#evaluasi-chester-ai-vs-rag-best-practices-20252026)
- [Strategi MVP: Samakan Dulu dengan Chester](#strategi-mvp-samakan-dulu-dengan-chester)
- [Blocker dan Solusi](#blocker-dan-solusi)
- [Task Breakdown (Updated)](#task-breakdown-updated)
- [Masih Perlu Ditanyakan](#masih-perlu-ditanyakan)

---

## Goal Eksplorasi

Berdasarkan card Basecamp, ada 6 goal eksplorasi:

1. **Strategi retrieval/grounding konteks** — akses materi kelas, pencarian diskusi lama relevan (RAG/semantic search?), parsing kode terlampir, fallback ke knowledge umum + web search
2. **Pemilihan LLM + web search tool** — feasible untuk Bahasa Indonesia + konten teknis + filter PII/profanity
3. **Desain async processing** — endpoint penerima request, retry (maks 2x), callback ke dicoding.com, observability
4. **Estimasi cost per request** — input penentuan quota harian per siswa
5. **Usulan kontrak request/callback** — payload, status, error semantics
6. **Output:** rekomendasi pendekatan + breakdown task implementasi AI Service

---

## Constraint

| Item | Detail |
|---|---|
| Sample | 30 pertanyaan forum riil (10 beginner + 10 intermediate + 10 advanced) |
| Multimodal | Teks, kode (inline), gambar (CDN URL) |
| Model yang dieksperimen | Gemini API, Gemma 4 (Ollama lokal), Phi-4, dan model lain |
| Observasi | Latency, token usage, cost per request, kualitas jawaban |

---

## Pendekatan: Prototipe LangChain + LangFuse + ChromaDB

**Strategi MVP:** Fork Chester AI dengan modifikasi minimal — samakan dulu, perbaiki best practices setelah stabil.

| Aspek | Detail |
|---|---|
| **Stack** | LangChain (retrieval + abstraction) + LangFuse (observasi) + ChromaDB (vector store lokal) + Python 3.13+ |
| **Goal ter-cover** | #1 ✅, #2 ✅, #3 ❌ (arsitektur), #4 ✅, #5 ❌ (arsitektur), #6 ✅ |
| **Alasan** | Chester AI sudah production-tested. LangChain memudahkan gonta-ganti model. Fork → adaptasi → test lebih cepat dari build ulang. ChromaDB + LangFuse sudah terintegrasi. |
| **Estimasi setup** | ~2-3 hari (fork + adaptasi minimal) |
| **Estimasi eksekusi** | ~1-2 hari (eksperimen 30 dataset) |

---

## Keputusan yang Telah Disepakati

### Q1: Strategi Retrieval → Pre-indexing RAG
Pre-index materi kelas + diskusi lama ke vector store. Retrieve top-K chunk relevan per pertanyaan.

### Q2: Vector Store → ChromaDB dengan 2 collection

| Collection | Sumber | Chunk Strategy | Indexing oleh |
|---|---|---|---|
| **Modul** | `developer_journey_tutorials.content` | `RecursiveCharacterTextSplitter(800, 300)` — dari Chester | Tim lain (manual/scheduled via ZIP + `/data/createDB`) |
| **Diskusi** | `developer_journey_discussions.question` + `course_discussion_comments_new.comment` (khusus `is_selected_answer = 1`) | QA-aware splitting (`Q:.*?A:`) — dari Chester | Tim lain (manual/scheduled) |

Untuk collection diskusi, **Answer hanya dari reply yang ditandai sebagai jawaban terpilih** (`is_selected_answer = true`). Reply lain (diskusi lanjutan, pertanyaan tambahan) tidak di-index — hanya Q (question) + A terpilih.

Keduanya di-retrieve saat kueri. Hasil digabung sebagai konteks untuk LLM.

### Q3: Gambar di konteks LLM → Kirim URL CDN
LLM multimodal bisa fetch gambar dari `assets.cdn.dicoding.com`. Dicoding PHP ekstrak `<img src>` dari HTML forum → kirim sebagai `images[]`.

### Q4: Pemilihan LLM → Multi-model eksperimen
Tidak ada keputusan final. Eksperimen bandingkan Gemini, Gemma 4 (Ollama), Phi-4, dan lain-lain. LangChain abstraction memudahkan gonta-ganti.

### Q5: Kriteria evaluasi → Combo (akurasi + cost)
Akurasi penting, tapi cost juga utama. Web search tool terpisah dari LLM.

### Q6: Benchmark dataset → Forum riil
30 pertanyaan dari kelas berbeda.

### Q7: Detail sampel → 30 pertanyaan, 3 kelas
10 per kelas (beginner, intermediate, advanced). Satu skenario full context per model.

### Q8: Infrastruktur → Lokal/script, GPU cloud untuk Gemma 4
Eksperimen lokal. LangChain + ChromaDB + LangFuse. Untuk Gemma 4 sewa GPU spot (RunPod/Vast).

### Q9: Fallback web search → Self-correction LLM + Tavily + self-hosted Firecrawl

**Bukan threshold.** Alurnya:

```
1. Retrieve dari ChromaDB (modul + diskusi)
2. Kirim RAG context + question ke LLM → LLM generate jawaban
3. Jika LLM menyimpulkan konteks tidak cukup → trigger web search
4. Inject hasil search + RAG context → LLM generate jawaban final
5. Jika masih kurang → jawab berdasarkan knowledge umum
```

LLM sendiri yang menentukan apakah konteks RAG cukup (self-correction), bukan threshold score. Hindari false positive (threshold terlalu rendah sehingga search padahal konteks cukup) dan false negative (threshold terlalu tinggi sehingga skip search padahal perlu).

- **Primary:** Tavily API
- **Fallback:** Self-hosted Firecrawl

### Q10: Chunk strategy → Adopsi dari Chester AI

| Setting | Modul Collection | Diskusi Collection |
|---|---|---|
| Chunk size | 800 chars | 800 chars |
| Overlap | 300 chars | 300 chars |
| Splitter | `RecursiveCharacterTextSplitter` | QA-aware (`Q:.*?A:` dari Chester) |
| Pre-processing | `strip_tags()` → plain text | Format: `Q: {question}\nA: {top_comment_1}\nA: {top_comment_2}` |
| Embedding | `BAAI/bge-m3` | `BAAI/bge-m3` |

### Q11: Filter konten PII/Profanity → Pre-filter + Guard prompt + Output filter
Pre-filter: strip PII dari konteks yang di-retrieve (nama, email, no telp dari diskusi lama).
Guard prompt: system prompt larang LLM menyebut PII.
Output filter: deteksi kebocoran system prompt via buffer pattern matching (adopsi dari Chester AI).

### Q12: Arsitektur async → Webhook callback
dicoding.com kirim request → AI Service return 202 → AI proses async → POST callback ke `POST /api/v1/forum-ai/callback` di dicoding.com.

### Q13: Kontrak request → AI Service retrieve dari ChromaDB sendiri (sama seperti Chester)

dicoding.com kirim **metadata + question** — bukan semua konteks.

```json
{
  "discussion_id": 12345,
  "course_id": 678,
  "tutorial_id": 456,
  "user_id": 98765,
  "title": "Error saat compile",
  "question": "kenapa error undefined variable? $foo = 1; echo $bar;",
  "images": ["https://assets.cdn.dicoding.com/xxx.png"],
  "provider": "gemini",
  "model_name": "gemini-2.0-flash"
}
```

- `question`: Froala HTML yang sudah di-`strip_tags()` di sisi PHP. Code tetap inline.
- `images[]`: hasil ekstraksi `<img src>` dari HTML forum.
- `user_id`: untuk rate limiting per-user dan audit log.
- `provider` & `model_name`: opsional — jika tidak dikirim, pakai default dari config FAA.
- **Auth:** `Authorization: Bearer <api_key>` (sama seperti Chester, via `API_KEY` config).

AI Service:
1. Retrieve dari ChromaDB collection **Modul** (filter: `course_id`)
2. Retrieve dari ChromaDB collection **Diskusi** (filter: `course_id`)
3. Gabung hasil retrieve → inject ke prompt → LLM → callback

### Q14: Kontrak callback → Sukses & Error payload
Callback dikirim sekali setelah selesai:
- **Sukses:** `discussion_id`, `status: "answered"`, `answer`, `model`, `token_usage`, `sources[]`, `web_search_used`, `latency_ms`
- **Error:** `discussion_id`, `status: "error"`, `error_code` (llm_error, content_filtered, timeout, unknown), `retry_count`, `latency_ms`

### Q15: Retry mechanism LLM → Internal di AI Service
AI Service retry internal maks 2x saat LLM gagal. Setelah habis, kirim callback `status: error`.

### Q16: Callback failure → Retry kirim ke dicoding.com maks 2x
Jika dicoding.com tidak merespon (5xx / timeout):
1. AI Service retry callback 2x
2. Jika tetap gagal, log sebagai `callback_failed`

### Q17: Quota tracking → di dicoding.com
AI Service tidak mengurus quota. Cukup kirim `token_usage` di callback.

### Q18: Auth antar service → API key (sama seperti Chester)

- **Request & Callback:** Static API key via `Authorization: Bearer <key>` header
- Config: `API_KEY` di environment variable FAA, dicocokkan dengan `dcd_auth_bearer` di config PHP
- Sama persis seperti Chester AI (`main.py` API key dependency)

---

## Ringkasan Arsitektur Final

```
INDEXING (dikirim dari PHP Dicoding ke FAA AI Service):
─────────────────────────────────────────────────────────
  Kelas (isi: modul-modul .txt) ──→ ZIP ──→ POST /index/classes ────→ FAA services/indexing/pipeline.py
  Kelas (isi: discussion QA .json) ──→ ZIP ──→ POST /index/discussions      │
       (khusus is_selected_answer = true)                                    │
                                                                             ▼
                                                                     ChromaDB collection #1 (modul)
                                                                     ChromaDB collection #2 (diskusi)


REQUEST + RETRIEVAL:
dicoding.com                              AI Service (FastAPI)
    │                                           │
    │  check quota harian                       │
    │  strip_tags(question) + extract images    │
    │                                           │
    │  POST /api/v1/forum-ai/process           │
    │  {discussion_id, course_id, tutorial_id,  │
    │   user_id, title, question, images[],     │
    │   provider?, model_name?}                │
    │  Auth: Bearer <api_key>                   │
    │──────────────────────────────────────────→│
    │                                           │
    │  202 Accepted {request_id}                 │
    │←──────────────────────────────────────────│
    │                                           │
    │  202 Accepted {request_id}                 │
    │←──────────────────────────────────────────│
    │                                           │
    │  [slot AI → loading state]                 │
    │                                    ┌──────┤
    │                                    │1. Pre-filter PII
    │                                    │                                     │
    │                                    │2. Retrieve dari 2 Chroma collections│
    │                                    │   (sama seperti Chester,            │
    │                                    │    tp dari 2 collections)            │
    │                                    │                                     │
    │                                    │3. Call LLM dengan RAG context       │
    │                                    │                                     │
    │                                    │4. Self-correction:                  │
    │                                    │   Jika LLM bilang konteks kurang    │
    │                                    │   → Tavily / Firecrawl             │
    │                                    │   → Call LLM ulang dengan web result│
    │                                    │                                     │
    │                                    │5. Guard prompt + output filter
    │                                    │6. Internal retry up to 2x
    │                                    └──────┤
    │                                           │
    │  POST /api/v1/forum-ai/callback            │
    │  {discussion_id, status, answer,            │
    │   model, token_usage, sources,              │
    │   web_search_used, latency_ms}              │
    │  Auth: Bearer <api_key>                     │
    │←──────────────────────────────────────────│
    │  Jika 5xx/timeout: retry 2x                 │
    │──────────────────────────────────────────→│
    │                                           │
    │  [slot AI → answered / error state]        │
    │                                           │
    │  dicoding.com catat token_usage             │
    │  → update quota harian siswa               │
```

---

## Codebase Reference: Chester AI

**Lokasi:** `~/projects/explain-with-chatbot/`
**Stack:** Python 3.13+, FastAPI, LangChain, ChromaDB, LangFuse, Sentence Transformers

### Pattern yang Di-reuse

| Pattern | File di Chester AI | Reuse? |
|---|---|---|
| Chunking: 800 chars, overlap 300 | `app/services/rag_utils/load_pdf.py:23-24` | ✅ Modul collection (tanpa QA-aware) |
| QA-aware splitting | `app/services/rag_utils/load_pdf.py:54-88` | ✅ Diskusi collection |
| Hybrid Retrieval: MMR + BM25 + FlashRank | `app/services/rag_utils/retrieve.py` | ✅ Sama |
| Embedding: `BAAI/bge-m3` | `app/services/rag_utils/load_embedding.py` | ✅ Sama |
| Vector Cache: LRU(20) + TTL(3600s) | `app/services/rag_utils/vector_cache.py` | ✅ Sama (untuk 2 collection) |
| PDF/ZIP loader + flatten | `app/api/v1/db.py:131-152` + `app/services/rag_utils/load_pdf.py` | ✅ Modul collection |
| Input Sanitizer | `app/services/guardrails/input_sanitizer.py` | ✅ Diadopsi |
| Output Filter (leak detection) | `app/services/guardrails/output_filter.py` | ✅ Diadopsi |
| Rate Limiter | `app/services/guardrails/rate_limiter.py` | ✅ Diadopsi |
| LLM Factory + fallback | `app/services/llm/factory.py` | ✅ Diadopsi |
| LangFuse tracing | `app/services/llm/*.py` | ✅ Di-reuse langsung |
| Modular Prompt Builder | `app/services/llm/prompt/base_prompt.py` | ✅ Diadaptasi (tanpa memory) |
| Vector Store bulk upload (`/data/createDB`) | `app/api/v1/db.py` | ✅ Indexing discussion |
| Memory (SQLite session) | `app/services/memory/` | ❌ Tidak dipakai |

---

## Yang Berbeda dari Chester AI

| Aspek | Chester AI | Forum AI Assist |
|---|---|---|
| **Input** | `message` (plain text) + `highlight_text` | `question` (strip_tags) + `images[]` |
| **Chroma collection** | 1 (modul) | 2 (modul + diskusi) |
| **Target output** | Stream SSE ke user | Callback HTTP ke dicoding.com |
| **Web search** | Tidak ada | ✅ Tavily + Firecrawl |
| **Indexing endpoint** | ❌ `/data/createDB` (ZIP modul) | ✅ `/data/createDB` (ZIP modul + discussion CSV) |
| **Memory** | ✅ SQLite session | ❌ Tidak ada |
| **Input processing** | Teks murni | PHP strip_tags + ekstrak `<img src>` |

---

## Struktur Folder FAA

```
app/
├── main.py                          # FastAPI app, lifespan, router mount
├── core/
│   └── config.py                    # Settings: API keys, Chroma path, model config
│
├── api/
│   └── v1/
│       ├── __init__.py
│       ├── router.py                # Include semua sub-routers
│       ├── forum.py                 # POST /api/v1/forum-ai/process (thin router)
│       └── index.py                 # POST /index/classes, POST /index/discussions, GET .../status/{job_id}
│
├── schemas/
│   ├── __init__.py
│   ├── request.py                   # ForumAIRequest (Pydantic)
│   └── callback.py                  # CallbackPayload, ErrorPayload
│
├── services/
│   ├── __init__.py
│   │
│   ├── indexing/                     # ⬇️ OFFLINE: modules & discussions indexing
│   │   ├── __init__.py
│   │   ├── chunkers/
│   │   │   ├── __init__.py
│   │   │   ├── module_chunker.py     # RecursiveCharacterTextSplitter (800/300)
│   │   │   └── discussion_chunker.py # QA-aware split (dari Chester load_pdf.py)
│   │   ├── loaders/
│   │   │   ├── __init__.py
│   │   │   ├── zip_loader.py         # Extract ZIP → files (dari Chester db.py)
│   │   │   └── csv_loader.py         # Baca CSV untuk eksperimen
│   │   ├── pipeline.py               # Orchestrate: load → chunk → embed → store
│   │   └── build_vector.py           # Build Chroma dari documents (dari Chester)
│   │
│   ├── retrieval/                    # ⬆️ ONLINE: query-time retrieval
│   │   ├── __init__.py
│   │   ├── chroma_client.py         # Init + cache 2 Chroma collections + embedding model
│   │   ├── retrieve.py              # Hybrid search (dari Chester, adapted)
│   │   └── vector_cache.py          # LRU + TTL cache per course_id
│   │
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── base.py                  # AbstractTool
│   │   ├── registry.py              # Registry: name → tool instance
│   │   │
│   │   └── web_search/
│   │       ├── __init__.py
│   │       ├── tavily.py
│   │       └── firecrawl.py
│   │
│   ├── orchestrator/
│   │   ├── __init__.py
│   │   └── forum_pipeline.py        # RAG → LLM → self-correction → tool → LLM final
│   │
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── factory.py               # Dari Chester
│   │   ├── base.py
│   │   ├── openai_service.py
│   │   ├── gemini_service.py
│   │   ├── lmstudio_service.py
│   │   ├── openrouter_service.py
│   │   └── prompt/
│   │       ├── __init__.py
│   │       └── forum_prompt.py      # System prompt forum (tanpa persona/memory)
│   │
│   ├── guardrails/
│   │   ├── __init__.py
│   │   ├── input_sanitizer.py       # Dari Chester
│   │   ├── output_filter.py         # Dari Chester
│   │   └── rate_limiter.py          # Dari Chester
│   │
│   └── callback/
│       ├── __init__.py
│       └── client.py                # HTTP POST ke dicoding.com + retry 2x
│
├── scripts/                         # Hanya untuk eksperimen lokal (tidak di-deploy)
│   └── run_experiment.py            # Test 30 pertanyaan, catat ke LangFuse
│
└── tests/
    ├── conftest.py
    ├── test_indexing/
    ├── test_retrieval/
    ├── test_tools/
    ├── test_orchestrator/
    ├── test_guardrails/
    └── test_callback/
```

### Prinsip Pemisahan Offline vs Online

| Workflow | Kapan | Dipicu oleh | Service di FAA |
|----------|-------|-------------|----------------|
| **Indexing** (load → chunk → embed → store) | Per-course: saat materi/discussion di-upload/diubah | PHP Dicoding via `POST /index/classes` (ZIP modul) atau `POST /index/discussions` (ZIP QA) | `services/indexing/` + `api/v1/index.py` |
| **Retrieval** (query → embed → search → rank) | Per-discussion: tiap request AI Assist | Dicoding via `POST /api/v1/forum-ai/process` | `services/retrieval/` |

**Keduanya ada di FAA AI Service**, karena:
- Chester sudah punya endpoint `/data/createDB` — FAA retain sebagai `/index/classes`
- PHP Dicoding kirim ZIP kelas (isi modul-modul) untuk di-index
- FAA tambah endpoint `/index/discussions` untuk ZIP diskusi per kelas (isi question + selected answer)

### Mapping `rag_utils/` Chester → FAA

| File Chester | Tugas | FAA | Workflow |
|-------------|-------|-----|----------|
| `retrieve.py` | Hybrid search (MMR + BM25 + FlashRank) | `services/retrieval/retrieve.py` | ⬆️ Online |
| `vector_cache.py` | LRU + TTL cache | `services/retrieval/vector_cache.py` | ⬆️ Online |
| `load_embedding.py` | Load model embedding | `services/retrieval/chroma_client.py` | ⬆️ Online |
| `load_vector.py` | Load persisted Chroma | `services/retrieval/chroma_client.py` | ⬆️ Online |
| `load_pdf.py` | Load + chunk file | `services/indexing/chunkers/` + `services/indexing/loaders/` | ⬇️ Offline |
| `build_vector.py` | Build Chroma dari docs | `services/indexing/build_vector.py` | ⬇️ Offline |
| `create_chroma.py` | CLI iterasi campaign | `services/indexing/pipeline.py` | ⬇️ Offline |
| `create_vdb.py` | Wrapper script | ❌ Tidak perlu | ⬇️ Offline |

---

## Evaluasi Chester AI vs RAG Best Practices 2025–2026

Berdasarkan riset best practices RAG production dari berbagai sumber (TensorBlue, Lushbinary, Orkes, arXiv papers 2025–2026).

### ✅ Already Best Practice (dipertahankan di FAA)

| Praktik | Chester | Notes |
|---------|---------|-------|
| Hybrid Search (BM25 + Vector) | ✅ `EnsembleRetriever(0.5/0.5)` | LangChain native, proven pattern |
| Reranking Cross-Encoder | ✅ FlashRank | 2-stage retrieval untuk akurasi |
| Guardrails Berlapis | ✅ 4 layers: input field, user msg, RAG context, output stream | Mature — diadopsi langsung |
| Observability | ✅ LangFuse tracing | Semua LLM call tercatat |
| QA-aware Chunking | ✅ Regex `Q:.*?A:` | Cocok untuk diskusi forum |
| Multi-Provider LLM | ✅ Factory pattern + auto-fallback | LMStudio → OpenAI → OpenRouter |
| Container Security | ✅ Multi-stage build, non-root user, health check | Siap production |
| Rate Limiter | ✅ Sliding window per-user + per-IP | In-process (cukup untuk eksperimen) |

### ❌ Missing dari Best Practices (notes untuk improvement setelah stabil)

| Praktik | Severity | Notes |
|---------|----------|-------|
| Query Rewriting/Expansion | Tinggi | Forum questions sering informal, rewrite bisa improve retrieval. **Tunda** |
| Contextual Chunk Headers | Sedang | Prepending document title + section title ke setiap chunk biar retrieval lebih kontekstual. **Tunda** |
| Metadata Filtering | Sedang | Filter `course_id` saat retrieval — jangan ambil chunk dari kelas lain. **Chester belum ada, FAA perlu** |
| Semantic Chunking | Sedang | Fixed-size `RecursiveCharacterTextSplitter` sudah cukup untuk forum short-text. **Tunda** |
| RRF (Reciprocal Rank Fusion) | Rendah | EnsembleRetriever sudah cukup baik |
| Multi-Query Retrieval | Rendah | Overkill untuk forum Q&A pendek |
| Async Ingestion Pipeline | Rendah | Indexing oleh tim lain, bukan FAA Service |

**Keputusan:** Untuk MVP, **samakan dulu dengan Chester** — fork dengan modifikasi minimal. Improvement best practices dilakukan setelah arsitektur stabil (post-Phase 1).

### ⚠️ Technical Debt Chester — Harus Dihindari di FAA

Beberapa tech debt Chester yang kita hindari saat fork:

| Debt | Chester | FAA (harus) |
|------|---------|-------------|
| Cache key pakai `id(vectordb)` | `cache_key = id(vectordb)` — bisa collision setelah GC | Pakai `course_id` sebagai stable key |
| Module-level side effects | LangFuse init di module level (`gemini_service.py`, `openai_service.py`) | Pindahkan ke `lifespan` |
| No version pins | Hanya LangChain yang di-pin | Pin semua dependensi |
| Error message bocor | `detail=f"Internal Server Error: {str(e)}"` di chat.py | Pakai generic message |
| `print()` di production | 10+ `print()` di explain.py | Pakai `logger` |
| Mutable default arg | `created_at: float = time.time()` | Pakai `field(default_factory=...)` |

---

## Strategi MVP: Samakan Dulu dengan Chester

**Pendekatan:** Fork Chester AI dengan modifikasi seminimal mungkin. Jangan rewrite — cukup tambah yang FAA butuh:

1. **Todo untuk FAA:** Web search, 2 collections, self-correction, callback, hapus memory
2. **Todo untuk Nanti (post-stabil):** Best practices improvement, semantic chunking, query expansion, etc.

**Alasan:**
- Chester sudah production-tested di Dicoding (Explain AI, Socratic Chat)
- Risk rendah: cukup fork, adaptasi, test
- Waktu lebih cepat: estimasi 2-3 hari vs 5-7 hari kalau build dari best practices
- Post-stabil improvement bisa incremental tanpa blocking eksperimen

---

## Blocker dan Solusi

### 1. Akses DB untuk Dataset Eksperimen

**Blocker:** Butuh data riil dari `developer_journey_discussions` + `course_discussion_comments_new` + `developer_journey_tutorials` untuk indexing dan benchmark.

**Solusi:** Gunakan **SQL query → export CSV**. Tidak perlu akses langsung ke DB:

```sql
-- 1. Export 30 forum questions + selected answer untuk benchmark
SELECT
  d.id AS discussion_id,
  d.course_id,
  d.tutorial_id,
  d.title,
  d.question,
  c.comment AS selected_answer,
  d.status
FROM developer_journey_discussions d
LEFT JOIN course_discussion_comments_new c
  ON c.discussion_id = d.id AND c.is_selected_answer = 1
WHERE d.status = 'OP'
LIMIT 30;

-- 2. Export module content untuk indexing
SELECT course_id, tutorial_id, title, content
FROM developer_journey_tutorials
WHERE course_id IN (<selected_course_ids>);

-- 3. Export all discussions + selected answers untuk indexing
SELECT
  d.id AS discussion_id,
  d.course_id,
  d.title,
  d.question,
  c.comment AS selected_answer
FROM developer_journey_discussions d
JOIN course_discussion_comments_new c
  ON c.discussion_id = d.id AND c.is_selected_answer = 1;
```

### 2. Indexing Production — 2 Endpoint Terpisah

**Flow indexing existing (Chester):**

```
Dicoding PHP                              Chester AI
────────────                              ──────────

[A] Full course rebuild (scheduled/manual):

  UpdateCourseVectorEmbeddingSpecification
    │ 1. Query developer_journey_tutorials
    │ 2. strip_tags(content) → .txt per tutorial
    │ 3. ZIP semua file .txt
    │
    └── POST /data/createDB ──────────────────→ db.py
         multipart: {file, courseId, environment}   │
                                                    ├── Extract ZIP ke data/{courseId}/
                                                    ├── create_chroma.py → chunk → embed
                                                    └── Invalidate vector cache

[B] Per-tutorial incremental (CLI: update:vectorstore upload):

  OpenAIUpdateCourseContentOnVectorStore
    │ Loop (course_id, tutorial_id):
    │ 1. extractLessonContent() → content
    │ 2. strip_tags(content)
    │
    └── POST /vector-store ──────────────────→ ???
         {course_id, tutorial_id, content}         (endpoint tidak ditemukan di Chester current codebase)

[C] Delete tutorial:

  └── DELETE /vector-store ─────────────────→ ???
       {course_id, tutorial_id}
```

**Untuk FAA, perlu 2 endpoint indexing:**

| Endpoint | Collection | Sumber Data | Cara Kerja |
|----------|-----------|-------------|------------|
| `POST /index/classes` | **Modul** (collection #1) | `developer_journey_tutorials.content` per kelas | PHP buat ZIP berisi file `.txt` (strip_tags) per modul dalam satu kelas → FAA extract → chunk → embed. Sama seperti Chester `/data/createDB`, hanya rename. |
| `POST /index/discussions` | **Diskusi** (collection #2) | `developer_journey_discussions.question` + `course_discussion_comments_new.comment` (is_selected_answer=1) per kelas | PHP buat ZIP berisi file CSV/JSON per discussion (QA pair) dalam satu kelas → FAA extract → QA-aware chunk → embed |

Keduanya async (queue + job_id + poll status), persis seperti Chester `db.py`.

Detail kontrak `POST /index/discussions`:

```json
// Request: multipart/form-data
// - file: ZIP containing {discussion_id}.json files
// - courseId: integer
// - environment: "production" | "staging"

// Format file dalam ZIP (satu file per discussion):
{
  "discussion_id": 12345,
  "question": "kenapa error undefined variable?",
  "answer": "karena variable $bar belum didefinisikan sebelumnya"
}

// Response
{
  "status": "queued",
  "job_id": "uuid",
  "course_id": 678
}

// Poll: GET /index/discussions/status/{job_id}
{
  "status": "done",
  "course_id": 678,
  "total_discussions": 150,
  "total_chunks": 450
}
```

### 3. Chunk Strategy Explain with AI

**Blocker:** Belum tahu bagaimana vector store production memotong materi.

**Solusi Sementara:** Fork chunk strategy Chester untuk MVP. Jika nanti ternyata Explain with AI pakai strategi berbeda, kita sesuaikan setelah dapat konfirmasi.

### 4. Auth Antar Service

**Blocker:** API key atau JWT — perlu diskusi engineer platform.

**Solusi Sementara:** Stub auth di kedua sisi. Pasang API key validation sederhana di FAA. Untuk callback, pasang static token dulu. Finalisasi setelah diskusi.

---

## Task Breakdown (Updated)

### Phase 1: Eksperimen & Validasi (Lokal)

| Task | Output | Estimasi |
|---|---|---|
| 1.1 Fork Chester AI — tambah web search (Tavily), hapus memory, 2 collections, callback stub | Base code siap | 1 hari |
| 1.2 Export data dari SQL → CSV: 30 forum QA + modules + all discussions (selected answer) | 3 file CSV | 0.5 hari |
| 1.3 Index CSV ke ChromaDB via `indexing/pipeline.py` — module + discussion chunker | 2 collections siap | 0.5 hari |
| 1.4 Implementasi self-correction pipeline: LLM → cek → web search → LLM ulang | Pipeline siap | 0.5 hari |
| 1.5 Test setiap model dengan 30 pertanyaan + catat latency, token usage, cost, accuracy (via LangFuse) | Raw data | 1-2 hari |
| 1.6 Evaluasi self-correction: berapa sering trigger search, impact ke accuracy | Analisis | 0.5 hari |
| 1.7 Analisis data: rekomendasi model + cost estimate per request | Laporan | 1 hari |

### Phase 2: Arsitektur AI Service

| Task | Output | Estimasi |
|---|---|---|
| 2.1 Desain endpoint `POST /api/forum-ai/process` + kontrak request (Q13) | Contract spec | 0.5 hari |
| 2.2 Implementasi retry LLM (max 2x) + callback retry (max 2x) | Retry logic | 1 hari |
| 2.3 Implementasi guardrails: sanitizer + output filter + rate limiter | Filter module | 0.5 hari |
| 2.4 Implementasi callback client ke dicoding.com + fallback log | Callback module | 0.5 hari |

### Phase 3: Integrasi

| Task | Output | Estimasi |
|---|---|---|
| 3.1 Callback endpoint `POST /api/v1/forum-ai/callback` + auth di dicoding.com | Endpoint + handler | 1 hari |
| 3.2 PHP: strip_tags + ekstrak `<img src>` sebelum kirim ke AI Service | Data cleaner | 0.5 hari |
| 3.3 Integrasi quota tracking (cek sebelum request, catat setelah callback) | Quota module | 0.5 hari |
| 3.4 Integrasi form diskusi: opt-in checkbox, kirim request ke AI Service | Full flow | 1-2 hari |
| 3.5 Integrasi slot AI: loading, answered, error, deleted states | UI + state | 2 hari |

---

## Masih Perlu Ditanyakan

1. **Chunk strategy Explain with AI** — bagaimana vector store production memotong materi?
2. **Akses DB** — minta tolong export SQL ke CSV (3 query di atas) atau DB dump read-only?
