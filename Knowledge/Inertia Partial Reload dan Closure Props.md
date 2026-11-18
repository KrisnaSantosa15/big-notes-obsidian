---
date: 2026-11-18
type: knowledge
tags: [inertia, laravel, performance, apd]
---

# Inertia partial reload dan closure props

`router.reload({ only: [...] })` hanya membatasi prop yang dikirim ke browser. Di server, Laravel tetap menjalankan action dari baris pertama, jadi setiap prop yang ditulis langsung (eager) tetap menjalankan query-nya, lalu hasilnya dibuang oleh Inertia. Prop yang dibungkus closure baru dijalankan kalau prop itu diminta.

## Alurnya

Contoh dari halaman Students APD (PR [#6450](https://github.com/dicoding-dev/dicoding/pull/6450)). Saat Ops mengetik email di dialog Add student, frontend memanggil:

```ts
router.reload({ only: ['studentCandidates'], data: { email_search: 'sit' } });
```

Server menjalankan `AcademicProgramDashboardStudentIndexAction` lagi, lalu Inertia hanya mengirim `studentCandidates`.

Kalau prop ditulis langsung, query sudah jalan saat array prop disusun, sebelum Inertia membaca `only`:

```php
$students = $this->accessListGateway->paginateCampaignStudents(...); // query + COUNT
$lecturersByStudentId = $this->supervisedStudentGateway->getLecturersByStudentId(...);

return inertia('...', [
    'students' => [...],
    'categories' => $this->campaignGateway->getCategories($campaignId),
    'studentCandidates' => inertia()->optional(fn (): array => ...),
]);
```

Setiap pencarian email menjalankan lima query (siswa, total, lecturer, kategori, email), padahal yang dipakai hanya query email.

Kalau prop dibungkus closure, array hanya menyimpan fungsinya. Inertia memanggil closure milik prop yang diminta saja:

```php
return inertia('...', [
    'students' => function () use ($programCode, $filters): array {
        $students = $this->accessListGateway->paginateCampaignStudents(...);
        // ... susun data + lecturer
        return [...];
    },
    'categories' => fn (): array => $this->campaignGateway->getCategories($campaignId),
    'studentCandidates' => inertia()->optional(fn (): array => ...),
]);
```

Sekarang pencarian email hanya menjalankan query email. Saat halaman dibuka biasa, semua closure tetap dijalankan, jadi data yang diterima browser sama persis.

| Situasi | Tanpa closure | Dengan closure |
| --- | --- | --- |
| Buka halaman | siswa, total, lecturer, kategori | sama |
| Pencarian email (partial reload) | siswa, total, lecturer, kategori, email | email saja |

## Aturan praktis

- Bungkus dengan closure setiap prop yang menjalankan query, terutama di halaman yang memakai partial reload (autocomplete, filter, pagination).
- Prop tanpa query, seperti `filters` yang hanya membaca request, tidak perlu dibungkus.
- `fn () =>` hanya boleh berisi satu ekspresi. Kalau isinya beberapa langkah, pakai `function () use (...) {}` atau pindahkan ke method private lalu panggil lewat `fn (): array => $this->studentsPage(...)`.
- `inertia()->optional(...)` berbeda dari closure biasa: prop optional tidak ikut saat halaman dibuka dan hanya dikirim kalau diminta lewat `only`. Closure biasa ikut saat halaman dibuka dan dilewati saat partial reload yang tidak memintanya.

Panduan repo juga menyebut aturan ini: `docs/guidelines/development/frontend-inertia.md` ("Wrap each prop that runs a query in a closure").
