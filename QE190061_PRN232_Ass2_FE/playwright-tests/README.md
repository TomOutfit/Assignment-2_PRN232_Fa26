# TaskTrack Playwright Test Suite

Automated end-to-end test suite for the live TaskTrack application:

- Frontend (Vercel): <https://qe190061-prn232-ass1-fe.vercel.app>
- Backend (Render): <https://qe190061-prn232-ass1-be.onrender.com>
- Swagger: <https://qe190061-prn232-ass1-be.onrender.com/swagger/index.html>

The suite covers the full assignment specification (CRUD for Departments,
Projects, Tasks, and Tags — both at the API layer and through the React UI).

## Run

```powershell
cd playwright-tests
npm install
npx playwright install chromium
npx playwright test
```

Sub-suites:
- `npx playwright test tests/api` — Backend API only
- `npx playwright test tests/ui` — Frontend UI only

HTML report:
```powershell
npx playwright show-report
```

## Layout

```
playwright-tests/
├── config.ts                   # Centralized URLs + enum constants
├── playwright.config.ts        # Test runner config
├── helpers/
│   ├── cleanup.ts              # Reverse-dependency DB cleanup
│   └── types.ts                # Typed DTOs / response shapes
├── tests/
│   ├── api/                    # 53 backend API tests
│   │   ├── departments.spec.ts
│   │   ├── projects.spec.ts
│   │   ├── tasks.spec.ts
│   │   └── tags.spec.ts
│   └── ui/                     # 15 frontend UI tests
│       ├── public-pages.spec.ts
│       └── management.spec.ts
└── TEST_REPORT.md              # Full test report with bug analysis
```

## Data safety

Every entity created during a run carries a unique `PWTEST_<timestamp>` prefix
and is tracked in `createTracker()`. After each suite finishes, the
`runCleanup()` helper deletes every tracked record in dependency order
(`Task → Project → Department → Tag`) so the database is left exactly as it
was found. **Seed data is never modified.**

## Test result snapshot

68/68 tests passing on Sep 26, 2026 — see `TEST_REPORT.md` for full details,
spec-coverage matrix, and the two bugs found.
