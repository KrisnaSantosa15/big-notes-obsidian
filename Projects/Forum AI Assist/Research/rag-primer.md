Oke, kita bedah dari nol sampai kamu benar-benar punya “mental model”-nya.

---

# 1. Apa itu Retrieval (dalam RAG)

## 👉 Definisi sederhana

**Retrieval = proses mencari potongan informasi paling relevan dari database sebelum dikirim ke LLM.**

---

## Analogi gampang

Bayangkan kamu punya:

* 10.000 halaman dokumen
* User tanya: *“apa itu RAG?”*

LLM **tidak mungkin baca semua 10.000 halaman**.

Jadi sistem melakukan:

```text id="r1"
Search → ambil bagian paling relevan → baru dikirim ke LLM
```

👉 Proses “search ini” = **retrieval**

---

## Dalam RAG pipeline:

```text id="r2"
User Question
   ↓
RETRIEVAL (cari dokumen relevan)
   ↓
Context (hasil search)
   ↓
LLM (jawab)
```

---

# 2. Apa itu Semantic Retrieval

## 👉 Definisi

**Semantic retrieval = mencari berdasarkan MAKNA, bukan kata.**

---

## Cara kerjanya:

1. Kalimat diubah jadi vector (embedding)
2. Query juga diubah jadi vector
3. Sistem cari yang “paling mirip secara makna”

---

## Contoh:

User tanya:

> “cara login gagal”

Dokumen yang cocok:

> “tidak bisa masuk ke akun”

👉 Walaupun kata “login” tidak ada, tetap cocok

---

## Teknologi:

* embedding model
* cosine similarity
* vector database (Chroma, Qdrant, dll)

---

## Intinya:

```text id="r3"
Semantic = cari arti / makna
```

---

# 3. Apa itu Keyword Search

## 👉 Definisi

**Keyword search = cari berdasarkan kata yang sama persis**

---

## Contoh:

Query:

> “reset password”

Dokumen:

> “cara reset password akun”

✔ cocok

Tapi:

> “cara mengganti kata sandi”

❌ bisa tidak ketemu

---

## Teknologi:

* BM25
* Elasticsearch
* SQL LIKE / full-text search

---

## Intinya:

```text id="r4"
Keyword = cari kata yang sama
```

---

# 4. Apa itu Vector Search

Ini sebenarnya bagian dari semantic retrieval.

## 👉 Definisi:

**Vector search = proses mencari similarity antar embedding vector**

---

## Cara kerja:

```text id="r5"
Text → embedding → vector (angka)
Query → embedding → vector
↓
hitung jarak (cosine similarity)
↓
ambil yang paling dekat
```

---

## Intinya:

```text id="r6"
Vector search = mesin di balik semantic search
```

---

# 5. Apa itu Hybrid Retrieval

## 👉 Definisi:

**Hybrid retrieval = gabungan keyword + semantic search**

---

## Kenapa digabung?

Karena masing-masing punya kelemahan:

| Method   | Kelemahan                           |
| -------- | ----------------------------------- |
| Semantic | kadang tidak tepat keyword spesifik |
| Keyword  | tidak paham makna                   |

---

## Hybrid = gabungan kekuatan:

```text id="r7"
Query
 ├── Vector Search (makna)
 ├── Keyword Search (kata exact)
 └── Digabung hasilnya
```

---

## Contoh:

Query:

> “error login 401”

Hybrid akan:

* keyword menang: “401”
* semantic menang: “login error”
* hasil digabung

---

# 6. Apa itu Reranking

## 👉 Definisi

**Reranking = menyusun ulang hasil setelah retrieval supaya paling relevan di atas**

---

## Kenapa perlu?

Vector search biasanya ambil:

```text id="r8"
Top 20 hasil mirip
```

Tapi:

* urutan belum tentu akurat
* ada noise

---

## Reranker bekerja seperti ini:

```text id="r9"
Top 20 hasil
   ↓
model cross-encoder / LLM scoring
   ↓
urutkan ulang
   ↓
Top 5 terbaik
```

---

## Analogi:

* Retrieval = ambil 20 kandidat restoran
* Rerank = kasih rating ulang → pilih 5 terbaik

---

## Intinya:

```text id="r10"
Reranking = quality booster hasil search
```

---

# 7. Apa itu Top-K

## 👉 Definisi

**Top-K = jumlah hasil yang diambil dari retrieval**

---

## Contoh:

```text id="r11"
Top-K = 5
```

Artinya:
👉 ambil 5 dokumen paling relevan

---

## Contoh lain:

```text id="r12"
Top-K = 20
```

Artinya:
👉 ambil 20 kandidat awal

---

## Biasanya dipakai seperti ini:

```text id="r13"
Vector search → Top 20
Reranker → Top 5
LLM → pakai 5 itu
```

---

# 8. Semua digabung (mental model lengkap)

```text id="r14"
User Query
   ↓
(1) Keyword Search ─────┐
                        ├── Hybrid Merge
(2) Vector Search ──────┘
   ↓
Top 20 (candidate)
   ↓
Reranking model
   ↓
Top 5 final context
   ↓
LLM generates answer
```

---

# 9. Ringkasan super sederhana

| Istilah            | Arti                            |
| ------------------ | ------------------------------- |
| Retrieval          | proses mencari info relevan     |
| Semantic retrieval | cari berdasarkan makna          |
| Keyword search     | cari berdasarkan kata           |
| Vector search      | teknik semantic pakai embedding |
| Hybrid retrieval   | gabungan keyword + semantic     |
| Reranking          | mengurutkan ulang hasil terbaik |
| Top-K              | jumlah hasil yang diambil       |

---

# 10. Kesimpulan penting

👉 Retrieval = “mesin pencarian sebelum LLM berpikir”
👉 Semantic = makna
👉 Keyword = kata
👉 Hybrid = gabungan
👉 Rerank = polishing hasil
👉 Top-K = jumlah kandidat

---

Kalau kamu mau, aku bisa lanjutkan ke:

* contoh implementasi **hybrid retrieval pakai Chroma + BM25 + reranker**
* atau diagram production RAG yang dipakai di industri (biar kamu lihat end-to-end sistemnya)

biar kamu benar-benar bisa build sendiri sistemnya.
