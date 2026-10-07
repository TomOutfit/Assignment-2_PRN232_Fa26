# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\management.spec.ts >> Frontend UI — Management pages CRUD >> Department Management: create → edit → delete via UI
- Location: tests\ui\management.spec.ts:44:3

# Error details

```
Error: Created department "PWTEST_1791376640834_MgmtDept" should be present

expect(received).toBeTruthy()

Received: undefined
```

# Test source

```ts
  1   | // Management-page CRUD flow tests.
  2   | // Each test creates a brand new test entity tagged with RUN_TAG, exercises the
  3   | // UI to edit / delete it, and (via the backend API in afterEach) verifies it
  4   | // was actually removed. The seed data is never touched.
  5   | 
  6   | import { test, expect, request as apiRequest, type APIRequestContext } from '@playwright/test';
  7   | import { CONFIG, PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY } from '../../config';
  8   | import { createTracker, runCleanup } from '../../helpers/cleanup';
  9   | 
  10  | test.describe('Frontend UI — Management pages CRUD', () => {
  11  |   test.use({ navigationTimeout: CONFIG.NAV_TIMEOUT_MS });
  12  | 
  13  |   const base = CONFIG.BACKEND_URL;
  14  |   let api: APIRequestContext;
  15  |   const tracker = createTracker();
  16  | 
  17  |   test.beforeAll(async () => {
  18  |     const tempApi = await apiRequest.newContext({ baseURL: base, timeout: CONFIG.API_TIMEOUT_MS });
  19  |     const loginRes = await tempApi.post('/api/auth/login', {
  20  |       data: { email: CONFIG.STAFF_EMAIL, password: CONFIG.STAFF_PASSWORD }
  21  |     });
  22  |     const authData = await loginRes.json();
  23  |     const token = authData.token || authData.accessToken;
  24  |     await tempApi.dispose();
  25  | 
  26  |     api = await apiRequest.newContext({
  27  |       baseURL: base,
  28  |       extraHTTPHeaders: {
  29  |         'Content-Type': 'application/json',
  30  |         'Authorization': `Bearer ${token}`,
  31  |       },
  32  |       timeout: CONFIG.API_TIMEOUT_MS,
  33  |     });
  34  |   });
  35  | 
  36  |   test.afterAll(async () => {
  37  |     await runCleanup(api, base, tracker);
  38  |     await api.dispose();
  39  |   });
  40  | 
  41  |   // ----------------------------------------------------------------
  42  |   // DEPARTMENT MANAGEMENT
  43  |   // ----------------------------------------------------------------
  44  |   test('Department Management: create → edit → delete via UI', async ({ page }) => {
  45  |     const originalName = `${CONFIG.RUN_TAG}_MgmtDept`;
  46  |     const updatedName = `${CONFIG.RUN_TAG}_MgmtDept_EDITED`;
  47  | 
  48  |     // Navigate to Department Management
  49  |     await page.goto('/departments/manage');
  50  |     await expect(page.getByRole('heading', { name: /departments/i }).first()).toBeVisible({
  51  |       timeout: 60_000,
  52  |     });
  53  |     await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  54  | 
  55  |     // 1) CREATE — open modal, fill, submit
  56  |     await page.getByRole('button', { name: /new department/i }).first().click();
  57  |     const modal = page.locator('[role="dialog"]').first();
  58  |     await expect(modal).toBeVisible({ timeout: 10_000 });
  59  |     await modal.locator('#dept-name').fill(originalName);
  60  |     await modal.locator('#dept-desc').fill('Created via UI test.');
  61  |     await modal.getByRole('button', { name: /create department/i }).click();
  62  | 
  63  |     // Wait for the modal to close + toast / row update
  64  |     await expect(modal).toBeHidden({ timeout: 15_000 });
  65  | 
  66  |     // Verify in DB
  67  |     await page.waitForTimeout(500);
  68  |     const search = await api.get(`/api/departments/search?name=${encodeURIComponent(CONFIG.RUN_TAG)}`);
  69  |     const found = (await search.json()) as any[];
  70  |     const created = found.find((d) => d.departmentName === originalName);
> 71  |     expect(created, `Created department "${originalName}" should be present`).toBeTruthy();
      |                                                                               ^ Error: Created department "PWTEST_1791376640834_MgmtDept" should be present
  72  |     tracker.departmentIds.push(created.departmentId);
  73  | 
  74  |     // 2) EDIT — find the row, click the edit button, change name, submit
  75  |     const row = page.locator('tr', { hasText: originalName }).first();
  76  |     await expect(row).toBeVisible({ timeout: 15_000 });
  77  |     await row.locator('button[title="Edit Department"]').click();
  78  |     const editModal = page.locator('[role="dialog"]').first();
  79  |     await expect(editModal).toBeVisible({ timeout: 10_000 });
  80  |     await editModal.locator('#dept-name').fill(updatedName);
  81  |     await editModal.getByRole('button', { name: /update department/i }).click();
  82  |     await expect(editModal).toBeHidden({ timeout: 15_000 });
  83  | 
  84  |     // Verify updated name in DB
  85  |     const after2 = await api.get(`/api/departments/${created.departmentId}`);
  86  |     expect(after2.status()).toBe(200);
  87  |     const updated = await after2.json();
  88  |     expect(updated.departmentName).toBe(updatedName);
  89  | 
  90  |     // 3) DELETE — open confirm modal and confirm
  91  |     const row2 = page.locator('tr', { hasText: updatedName }).first();
  92  |     await expect(row2).toBeVisible({ timeout: 15_000 });
  93  |     await row2.locator('button[title="Delete Department"]').click();
  94  |     const confirm = page.locator('[role="dialog"]').first();
  95  |     await expect(confirm).toBeVisible({ timeout: 10_000 });
  96  |     // The danger button text is "Delete Department"
  97  |     await confirm.getByRole('button', { name: /^delete department$/i }).click();
  98  |     await expect(confirm).toBeHidden({ timeout: 15_000 });
  99  | 
  100 |     // Verify gone in DB
  101 |     const after3 = await api.get(`/api/departments/${created.departmentId}`);
  102 |     expect(after3.status()).toBe(404);
  103 | 
  104 |     // Remove from tracker since we already deleted it
  105 |     tracker.departmentIds = tracker.departmentIds.filter((id) => id !== created.departmentId);
  106 |   });
  107 | 
  108 |   test('Department Management: form validates required name field client-side', async ({ page }) => {
  109 |     await page.goto('/departments/manage');
  110 |     await expect(page.getByRole('heading', { name: /departments/i }).first()).toBeVisible({
  111 |       timeout: 60_000,
  112 |     });
  113 |     await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  114 | 
  115 |     await page.getByRole('button', { name: /new department/i }).first().click();
  116 |     const modal = page.locator('[role="dialog"]').first();
  117 |     await expect(modal).toBeVisible({ timeout: 10_000 });
  118 | 
  119 |     // The name input has the `required` attribute — Playwright honors this.
  120 |     const nameInput = modal.locator('#dept-name');
  121 |     await expect(nameInput).toHaveAttribute('required', '');
  122 | 
  123 |     // Try to submit with empty name — should not call the API and should
  124 |     // show browser-native validation.
  125 |     await modal.getByRole('button', { name: /create department/i }).click();
  126 |     // Modal still open (submission was blocked)
  127 |     await expect(modal).toBeVisible({ timeout: 3_000 });
  128 | 
  129 |     // Close the modal
  130 |     await modal.getByRole('button', { name: /^cancel$/i }).click();
  131 |     await expect(modal).toBeHidden();
  132 |   });
  133 | 
  134 |   test('Department Management: delete is blocked with friendly message when projects are linked', async ({
  135 |     page,
  136 |   }) => {
  137 |     // Seed: Department 1 (Engineering) has projects attached. UI should
  138 |     // display a friendly error toast and NOT delete the department.
  139 |     await page.goto('/departments/manage');
  140 |     await expect(page.getByRole('heading', { name: /departments/i }).first()).toBeVisible({
  141 |       timeout: 60_000,
  142 |     });
  143 |     await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  144 | 
  145 |     const row = page.locator('tr', { hasText: 'Engineering' }).first();
  146 |     await expect(row).toBeVisible({ timeout: 15_000 });
  147 |     await row.locator('button[title="Delete Department"]').click();
  148 | 
  149 |     const confirm = page.locator('[role="dialog"]').first();
  150 |     await expect(confirm).toBeVisible({ timeout: 10_000 });
  151 |     await confirm.getByRole('button', { name: /^delete department$/i }).click();
  152 | 
  153 |     // The dialog stays open on failure; we expect an error toast.
  154 |     await expect(page.locator('.toast-item.toast-error')).toBeVisible({ timeout: 15_000 });
  155 |     const toastText = await page.locator('.toast-item.toast-error').first().innerText();
  156 |     expect(toastText.toLowerCase()).toMatch(/linked|projects/);
  157 | 
  158 |     // Engineering is still in the table
  159 |     await expect(page.locator('tr', { hasText: 'Engineering' }).first()).toBeVisible();
  160 | 
  161 |     // And still in DB
  162 |     const stillThere = await api.get('/api/departments/1');
  163 |     expect(stillThere.status()).toBe(200);
  164 | 
  165 |     // Close the still-open confirm dialog manually so we leave the page clean
  166 |     await confirm.getByRole('button', { name: /^cancel$/i }).click().catch(() => {});
  167 |   });
  168 | 
  169 |   // ----------------------------------------------------------------
  170 |   // PROJECT MANAGEMENT
  171 |   // ----------------------------------------------------------------
```