# Handoff: APD participants (card [3] dan sisa card [6])

Terakhir diperbarui 2026-11-04 (status PR). Catatan desain sesi 2026-10-29 di bawah tetap berlaku (K23 sampai K27). Rujukan utama: [implementation-backlog.md](../../domains/academic-program-dashboard/implementation-backlog.md)
(keputusan K1 sampai K27, pertanyaan terbuka, rencana PR card [3] di bagian 5). Verifikasi ulang status PR dengan `gh pr view` sebelum lanjut.

**Status 2026-11-04:** card [6] selesai (#6190, #6207, #6218, #6230 merged) dan #6248 merged. Card [3] tinggal tiga PR open
yang menunggu review: #6249 (base master), #6254 (base #6249, domain CSV), #6256 (base #6254, infra + web + UI CSV). Ketiganya
di-rebase ke master `64ca542fc20` dan di-force-push 2026-11-03. Card [4] stack di atas #6256, lihat
[handoff card 4](lecturer-mapping-card-4.md). Sisa: `ParticipantStoreAction` (#6249) masih `abort(404)` untuk program tanpa
campaign (belum disamakan dengan K33); edit satu peserta (K27) belum dikerjakan.

Catatan di bawah ini adalah riwayat sesi 2026-10-29.

**Card [3] PR C terbit: [#6254](https://github.com/dicoding-dev/dicoding/pull/6254) (draft, base #6249), domain CSV `ParticipantBulkCreation`, risk medium, preflight + ack `b5b0e54cf86` (digest `091c92f9`, report `/tmp/dicoding-pr-preflight.6SY9W5/`). Berikutnya PR D: isi stub gateway (`getUserIdsByEmail` key email lowercase, `getEnrolledParticipants`, `getUserIdsByProgramUserId`, `updateParticipant`), spec, import page dengan preview, lock per campaign.** Kolom `email, category, student_id`,
upsert (K23), Student ID hanya isi yang kosong dan tidak boleh dipakai orang lain (K24), khusus STUDENT (K25). Lock per campaign
untuk import dan tambah manual + preview masuk PR D (K26). Edit satu peserta menyusul setelah PR D (K27). Grup bukan scope card [3].

**PR D 2026-10-29 sore:** diimplementasikan di branch lokal `feature/apd/participant-bulk-creation-web` (base #6254), BELUM commit
(atas permintaan Krisna). Test: integration import + store, unit aggregate, vitest participants hijau; psalm bersih. Bundle `public/bundle` belum di-rebuild.
Lock K26 = `useCase->lock` per spec key `{program_code}` saja; import vs tambah manual tidak saling mengunci (lihat K26 di backlog). Port test `21a0ad3911b` selesai
dalam bentuk baru (pesan IN_PROGRESS per campaign).

## Status PR milik Krisna

| PR | Isi | Base | Status 2026-11-04 |
| --- | --- | --- | --- |
| #6190 | Domain enrollment (listener) | master | Merged oleh Hasbi |
| #6207 | Listener cohort form + spec + migration | master (otomatis setelah #6190 merge) | Merged |
| #6218 | Halaman participants | #6207 | Merged |
| #6230 | Tombol sync | #6218 | Merged |
| #6248 | Card [3] PR A: domain tambah satu student | #6230 (stack dibuat lurus 2026-10-29) | Merged |
| #6249 | Card [3] PR B: infra + web tambah satu student lewat email + Student ID opsional | master | Open, menunggu review; risk medium (post-merge), preflight + ack `17a4c663f5c` (digest `05786712`); menggantikan ack lama `21a0ad3911b` |
| #6254 | Card [3] PR C: domain CSV | #6249 | Open, menunggu review |
| #6256 | Card [3] PR D: infra + web + UI CSV | #6254 | Open, menunggu review |

Catatan 2026-10-29 siang: manual creation sekarang raise `ParticipantWasCreated(actor_id, user_id, program_code, role)`, terpisah dari
`ParticipantWasEnrolled` (otomatis). Student ID (`program_user_id`, Q11) dikerjakan agent lain, belum commit di working tree utama;
branch lokal `feature/apd/participant-creation-web` tertinggal dari origin (rebase + commit R1), rebase ke `origin/feature/apd/participant-creation-web` sebelum commit.

## Bentuk final #6248

- `ParticipantCreation(CommonActor $actor, int $userId, Campaign $campaign, string $programCode, bool $isAlreadyEnrolled, list<int> $campaignCategoryIds)`,
  action `create(?int $categoryId)`. Urutan: `authorize()` (`NOT_ADMIN`), `validate()` (`CATEGORY_NOT_IN_CAMPAIGN`, `ALREADY_ENROLLED`).
  Memakai VO `Participant` dan event `ParticipantWasEnrolled` yang sama dengan `ParticipantEnrollment`.
- `ParticipantCreationRepository::createAggregate(int $actorId, string $programCode, int $userId)`: campaign tidak ada menjadi
  `ObjectNotFoundException` (404-style, konvensi #8). Hanya `programCode` sebagai input agar campaign dan program tidak bisa beda (temuan preflight).
- Gateway stub (body TODO, diisi di PR B): `AcademicProgramDashboardCampaignGateway::findCampaignByProgramCode()`. Kategori dibaca lewat `findCampaignIdByProgramCode()` + `getCategoryIds()` yang sudah ada (temuan preflight KY-1).
- `categoryId` nullable karena campaign boleh tanpa kategori. Khusus `STUDENT`.

## Keputusan sesi ini

- Satu aggregate per use case (pola Alfian `CampaignGroupCreation`/`CampaignGroupBulkCreation`): `ParticipantCreation` (satu orang),
  nanti `ParticipantBulkCreation` (CSV). Nama `Creation`, bukan `Addition` (69 vs 2 aggregate di codebase).
- Guard admin di aggregate (konvensi codebase, 42 aggregate).
- Parameter `role` belum ditambah: enum di master hanya `STUDENT`, jadi role akan jadi kode yang tidak bisa dites. Ditambahkan saat enum
  staff ada dan card [4] Alfian (tambah Facilitator/Lecturer/Instructor) memakainya. Data (tabel access list, VO `Participant`, event) sudah dipakai bersama semua role.
- Penambahan manual satu per satu memang diminta PRD US-1.2 baris 54 dan AC card [3]. Tombol sync (#6230) tidak ada di PRD (keputusan engineering K18),
  kandidat ditunda kalau scope perlu dipangkas sebelum demo 13 Nov.
- Stack dibuat lurus atas permintaan Krisna: #6248 di-rebase ke atas #6230 (force-push oleh Krisna sendiri, base diubah lewat REST API
  karena `gh pr edit` gagal oleh error Projects classic). Temuan preflight KY-1 di #6248: stub `getCategoryIdsByProgramCode` dihapus,
  repository memakai `findCampaignIdByProgramCode()` + `getCategoryIds()`.
- PR B (#6249): satu spec saja, `ParticipantCreationSpecification` (lookup email lewat `MemberGateway::getIdsByEmails`, aggregate, save).
  Action tetap lewat `UseCase` (validasi rules, transaction, logging; 451 action memakai `useCase->run`, hanya 1 memanggil
  `runSpecification` langsung): `abort(404)` kalau campaign tidak ada, lalu `useCase->lock(spec, "{program_code}:{email}")`.
  Gagal dikembalikan lewat `withErrors(['participant' => ...])`, dialog menampilkannya di bawah field email.
- Email saja, bukan user ID (K21 di backlog): salah ketik user ID bisa diam-diam menambahkan orang lain. Rencana CSV (PR D) ikut aturan ini.
- CI "PR preflight evidence" hanya jalan untuk base master. Saat base #6248/#6249 pindah ke master setelah PR di bawahnya merge,
  receipt di body perlu di-refresh terhadap master (`--base origin/master`) dan di-ack ulang.
- Helper preflight untuk PR stacked: setiap perintah butuh `--base origin/<branch base>`, dan dijalankan dari worktree bersih di branch (bukan detached).
- Student ID opsional di tambah manual (K22): `Participant` VO punya `programUserId` (enrollment kirim null), aggregate menerima
  `programUserId` + `isProgramUserIdUsed` lewat constructor, gateway `isProgramUserIdUsed()` dan insert `program_user_id`.
- Helper preflight: satu temuan hanya bisa menunjuk satu commit, dan fixer hanya sekali. Commit tambahan setelah fixer = preflight baru.
- Ada sesi paralel yang ikut mengerjakan #6248/#6249 (ack `21a0ad3911b` sempat tertimpa). Sebelum force-push, cek SHA remote dan pakai
  `--force-with-lease=<branch>:<sha remote yang diharapkan>`.

## Langkah berikutnya

1. Kejar review/merge stack berurutan: #6207, #6218, #6230, #6248. CI "PR preflight evidence" hanya jalan untuk base master, jadi saat base PR
   berpindah ke master setelah PR di bawahnya merge, receipt di body perlu di-refresh terhadap master dan di-ack ulang.
2. Card [3] PR B: #6249 (base #6248), preflight + ack `17a4c663f5c` (digest `05786712`), report `/tmp/dicoding-pr-preflight.eKidcG/`.
   Isi: email saja (K21), Student ID opsional diketik admin dan ID ganda di campaign ditolak (K22), lock per email (lowercase) + per Student ID,
   lock yang dipegang -> pesan "Peserta ini sedang diproses...", error server tampil di level form. KY-1 (kolom Campaign duplikat di gateway) ditunda.
   Commit `c57533b8e62` (ParticipantWasCreated + actor_id) ada di base #6248 lokal/remote branch domain.
   **Follow-up:** port test dari commit `21a0ad3911b` (tertimpa force-push, objek masih ada lokal) dengan ekspektasi pesan IN_PROGRESS,
   bukan redirect tanpa error. Masukkan di PR C/D atau PR follow-up karena butuh preflight baru.
   Satu spec `ParticipantCreationSpecification` (lookup email, aggregate, save); action `useCase->lock(spec, "{program_code}:{email}")`. Email saja (K21).
3. Card [3] PR C/D (CSV): menunggu Q12 (siapa yang menulis `group_members`) dan Q11 (Student ID).
4. Card [4] Map Lecturers to their supervised Students: ditugaskan ke Krisna, masih Planning, bergantung card staff Alfian.

## Koordinasi yang belum dikirim (atas permintaan Krisna)

- Ikhlas, #6193: membuat `Enums/ParticipantRole.php` (STUDENT, INSTRUCTOR, FACILITATOR) yang sekarang konflik add/add dengan file dari #6190.
  APD lama memakai nilai role `MENTOR` (bukan `FACILITATOR`) dan `LECTURER`; cek nilai di data production access list sebelum enum final.
- Alfian, card [4] staff: pertimbangkan reuse access list + `ParticipantCreation` (tambah role) daripada tabel staff baru;
  `isParticipantEnrolled` sudah menegakkan "satu role per campaign".

## Artefak lokal

- Preflight #6249 (base #6248): `/tmp/dicoding-pr-preflight.3rNKaf/` (report, sections, body; worktree sudah dihapus).
- Preflight #6248 (base #6230): `/tmp/dicoding-pr-preflight.DWEsdI/` (report, sections, body). Preflight lama berbasis master `/tmp/dicoding-pr-preflight.yoXsAd/` sudah tidak berlaku, boleh dihapus.
- Branch cadangan sebelum rebase: `backup/apd-participant-creation-domain-0c8107c` (`0c8107cfbf3`), boleh dihapus.
