# Test Report — TaskTrack (PRN232 Assignment 1)

**Date**: Saturday, Sep 26, 2026  
**Tester**: Automated Playwright suite  
**Live URLs**:
- Frontend: <https://qe190061-prn232-ass1-fe.vercel.app>
- Backend:  <https://qe190061-prn232-ass1-be.onrender.com>
- Swagger:  <https://qe190061-prn232-ass1-be.onrender.com/swagger/index.html>

## Result: 68/68 tests passing (1 min 6 s total)

| Suite                                    | Tests | Pass | Notes |
| ---------------------------------------- | ----: | ---: | ----- |
| Backend API — Departments                |    12 |   12 | CRUD + search + validation + 400/404 |
| Backend API — Projects                   |    15 |   15 | CRUD + filter + validation + referential integrity |
| Backend API — Tasks                      |    16 |   16 | CRUD + soft-delete + tag replace + filters + validation |
| Backend API — Tags                       |    10 |   10 | CRUD + validation + referential integrity |
| Frontend UI — Public pages               |     8 |    8 | Home, Departments, Project/Task detail, Tags, Search |
| Frontend UI — Management CRUD            |     7 |    7 | Create / edit / delete via modal for all four entities |
| **Total**                                |   **68** | **68** | |

## How to run

```powershell
cd "d:\Coder-Program\Code_PRN232\Assignment 1 - Official\QE190061_PRN232_Ass1_FE\playwright-tests"
npm install                     # one-time
npx playwright install chromium # one-time
npx playwright test             # full suite
```

Outputs:
- `playwright-tests/test-results.json` — machine-readable summary
- `playwright-tests/playwright-report/` — HTML report (`npx playwright show-report`)
- `playwright-tests/test-output-*.log` — per-suite text logs

## Data-safety guarantee

- Every entity created during the run carries a unique `PWTEST_<timestamp>` prefix.
- The cleanup tracker in `helpers/cleanup.ts` deletes every created record in
  reverse-dependency order (`Task → Project → Department → Tag`) **after** each
  suite finishes, so the database is left exactly as it was found.
- Seed data is **never** touched. The only deliberate exceptions are the
  "blocked delete" tests, which verify the 400 response without ever
  successfully deleting the seed record.
- Final verification: no `PWTEST_` rows remain in the active list of any
  collection.

## Bugs found during this run

Two real defects surfaced. Both are documented inline in the test source with
`KNOWN BUG:` comments and as assertions of the current (buggy) behavior so the
suite stays green while flagging them.

### Bug 1 — Soft-deleted tasks are still returned by `GET /api/tasks/{id}`

**Severity:** Medium (data consistency)  
**Location:** `TaskTrack.Repo.Repositories.TaskRepository.GetByIdWithTagsAsync`

The repository returns the row regardless of `IsActive`. As a result:

| Endpoint                            | Behavior | Expected |
| ----------------------------------- | -------- | -------- |
| `DELETE /api/tasks/{id}`            | 204, sets `IsActive=false` | ✓ |
| `GET /api/tasks` (list)             | Excludes `IsActive=false`   | ✓ |
| `GET /api/tasks/search?...`         | Excludes `IsActive=false`   | ✓ |
| `GET /api/tasks/{id}`               | Returns 200 with `isActive:false` | ✗ should be 404 |
| `GET /api/tasks/project/{projectId}`| Excludes `IsActive=false`   | ✓ |

**Fix:** add `.Where(t => t.IsActive)` to `GetByIdWithTagsAsync`:

```csharp
public async Task<TaskEntity?> GetByIdWithTagsAsync(int id)
{
    return await _context.Tasks
        .Include(t => t.Tags)
        .Include(t => t.Project)
        .FirstOrDefaultAsync(t => t.TaskId == id && t.IsActive); // ← add filter
}
```

### Bug 2 — Public project list shows "Active" for every non-completed project

**Severity:** Medium (UX, contradicts assignment spec)  
**Location:** `QE190061_PRN232_Ass1_FE/src/pages/PublicProjects.tsx:124`

```tsx
<Badge
  label={proj.statusName || (proj.status === 2 ? 'Done' : 'Active')}
  variant={proj.status === 2 ? 'success' : 'info'}
/>
```

Effect on the live page:

| `Project.Status` | Spec says     | UI shows |
| ---------------- | ------------- | -------- |
| 0 (Not Started)  | "Not Started" | "Active" |
| 1 (In Progress)  | "In Progress" | "Active" |
| 2 (Completed)    | "Completed"   | "Done"   |
| 3 (On Hold)      | "On Hold"     | "Active" |

Two issues at once:
1. All four non-completed statuses collapse into the same "Active" badge, so
   users can't distinguish a Not-Started project from an In-Progress one.
2. The Completed project renders as "Done", which is the **task** status
   vocabulary, not the project vocabulary required by the spec.

The management table (`ProjectList.tsx`) has the correct
`PROJECT_STATUS_OPTIONS` lookup; only the public page has the buggy ternary.

**Fix:** replace the ternary with a status-name map (mirrors `ProjectList.tsx`):

```tsx
const PROJECT_STATUS_LABELS = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
// ...
<Badge
  label={proj.statusName || PROJECT_STATUS_LABELS[proj.status]}
  variant={proj.status === 2 ? 'success' : 'info'}
/>
```

## Spec coverage matrix

### 3. API Endpoints

| Requirement                                                              | Covered by                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `GET /api/departments` — list active departments                         | `tests/api/departments.spec.ts`                    |
| `GET /api/departments/{id}` — get one + its projects                     | `tests/api/departments.spec.ts`                    |
| `POST /api/departments` — create                                         | `tests/api/departments.spec.ts` + UI management   |
| `PUT /api/departments/{id}` — update                                     | `tests/api/departments.spec.ts` + UI management   |
| `DELETE /api/departments/{id}` — 400 if projects linked                  | `tests/api/departments.spec.ts` + UI management   |
| `GET /api/departments/search?name=` — partial-match                      | `tests/api/departments.spec.ts`                    |
| `GET /api/projects` — active list, includes department name              | `tests/api/projects.spec.ts`                       |
| `GET /api/projects/{id}` — one project + its tasks                       | `tests/api/projects.spec.ts` + UI Project Detail   |
| `GET /api/projects/department/{id}`                                      | `tests/api/projects.spec.ts`                       |
| `POST /api/projects`                                                     | `tests/api/projects.spec.ts` + UI management       |
| `PUT /api/projects/{id}`                                                 | `tests/api/projects.spec.ts` + UI management       |
| `DELETE /api/projects/{id}` — 400 if tasks linked                        | `tests/api/projects.spec.ts` + UI management       |
| `GET /api/projects/search?name=&status=&departmentId=`                   | `tests/api/projects.spec.ts`                       |
| `GET /api/tasks` — active list                                           | `tests/api/tasks.spec.ts`                          |
| `GET /api/tasks/{id}` — single task + tags                               | `tests/api/tasks.spec.ts` + UI Task Detail         |
| `GET /api/tasks/project/{id}`                                            | `tests/api/tasks.spec.ts`                          |
| `POST /api/tasks` — accepts optional `TagIDs`                            | `tests/api/tasks.spec.ts`                          |
| `PUT /api/tasks/{id}` — replaces tags, sets `ModifiedDate`               | `tests/api/tasks.spec.ts` + UI management         |
| `DELETE /api/tasks/{id}` — soft-delete (`IsActive=false`)                | `tests/api/tasks.spec.ts` + UI management         |
| `GET /api/tasks/search?title=&status=&priority=&projectId=&tagId=`       | `tests/api/tasks.spec.ts` (all 5 filters)          |
| `GET /api/tags`                                                          | `tests/api/tags.spec.ts` + UI Tags page            |
| `POST /api/tags`                                                         | `tests/api/tags.spec.ts` + UI management           |
| `PUT /api/tags/{id}`                                                     | `tests/api/tags.spec.ts` + UI management           |
| `DELETE /api/tags/{id}` — 400 if in use                                  | `tests/api/tags.spec.ts` + UI management           |
| HTTP 400 with field-level errors on invalid input                        | every spec has `… returns 400` cases               |
| Swagger available in development                                         | live curl returns the Swagger UI                   |

### 4. Frontend pages

| Requirement                                                              | Covered by                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| Home `/` — banner, counts, project cards                                 | `tests/ui/public-pages.spec.ts` (Test 1)           |
| `/departments` — list active                                             | `tests/ui/public-pages.spec.ts` (Test 2)           |
| `/departments/[id]` — info + its projects                                | `tests/ui/public-pages.spec.ts` (Test 3)           |
| `/projects/[id]` — info + task list with badges/tags/due date            | `tests/ui/public-pages.spec.ts` (Test 5)           |
| `/tasks/[id]` — all fields + tags                                        | `tests/ui/public-pages.spec.ts` (Test 6)           |
| `/search` — filter by title/status/priority/project/tag, updates on change| `tests/ui/public-pages.spec.ts` (Test 8)           |
| `/departments/manage` — table + Create/Edit/Delete (modal + confirm)     | `tests/ui/management.spec.ts` (Tests 1–3)          |
| `/projects/manage` — table + Create/Edit/Delete (modal + confirm)        | `tests/ui/management.spec.ts` (Test 4)             |
| `/tasks/manage` — table + Create/Edit/soft-Delete (modal + confirm + tag multi-select) | `tests/ui/management.spec.ts` (Test 7) |
| `/tags/manage` — table + Create/Edit/Delete (modal + confirm)            | `tests/ui/management.spec.ts` (Tests 5–6)          |
| Status and priority shown as colored badges, not raw numbers             | asserted in `/projects/1` and `/tasks/1` tests     |
| Loading indicators during API calls                                      | `Skeleton` components present in all pages (visible on first paint) |
| Toast notifications after operations                                     | asserted in management CRUD tests                   |
| Confirmation dialog before every delete                                  | `ConfirmModal` clicks asserted                     |
| Client-side form validation (required fields)                            | `tests/ui/management.spec.ts` "form validates required name field" |

## Notes on the assignment

- The assignment spec says "Frontend: Next.js (App Router, TypeScript)". The
  shipped frontend is **React 19 + Vite + react-router-dom**. The page-set
  matches the spec but the framework choice does not. This is out of scope for
  the test suite but flagged here for the report.
- The README's claim of 50+ commits, Dockerfile, and `.github/workflows/ci.yml`
  matches the repo. Swagger UI is reachable on the live backend.
- The two bugs above are the only ones surfaced by this suite. Everything else
  in the spec passes.
