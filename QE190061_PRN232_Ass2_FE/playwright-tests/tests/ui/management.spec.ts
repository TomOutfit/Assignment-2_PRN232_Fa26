// Management-page CRUD flow tests.
// Each test creates a brand new test entity tagged with RUN_TAG, exercises the
// UI to edit / delete it, and (via the backend API in afterEach) verifies it
// was actually removed. The seed data is never touched.

import { test, expect, request as apiRequest } from '@playwright/test';
import { CONFIG, PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY } from '../../config';
import { createTracker, runCleanup } from '../../helpers/cleanup';

test.describe('Frontend UI — Management pages CRUD', () => {
  test.use({ navigationTimeout: CONFIG.NAV_TIMEOUT_MS });

  const base = CONFIG.BACKEND_URL;
  let api: Awaited<ReturnType<typeof apiRequest>>;
  const tracker = createTracker();

  test.beforeAll(async () => {
    api = await apiRequest.newContext({
      baseURL: base,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
      timeout: CONFIG.API_TIMEOUT_MS,
    });
  });

  test.afterAll(async () => {
    await runCleanup(api, base, tracker);
    await api.dispose();
  });

  // ----------------------------------------------------------------
  // DEPARTMENT MANAGEMENT
  // ----------------------------------------------------------------
  test('Department Management: create → edit → delete via UI', async ({ page }) => {
    const originalName = `${CONFIG.RUN_TAG}_MgmtDept`;
    const updatedName = `${CONFIG.RUN_TAG}_MgmtDept_EDITED`;

    // Navigate to Department Management
    await page.goto('/departments/manage');
    await expect(page.getByRole('heading', { name: /departments/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    // 1) CREATE — open modal, fill, submit
    await page.getByRole('button', { name: /new department/i }).first().click();
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.locator('#dept-name').fill(originalName);
    await modal.locator('#dept-desc').fill('Created via UI test.');
    await modal.getByRole('button', { name: /create department/i }).click();

    // Wait for the modal to close + toast / row update
    await expect(modal).toBeHidden({ timeout: 15_000 });

    // Verify in DB
    await page.waitForTimeout(500);
    const search = await api.get(`/api/departments/search?name=${encodeURIComponent(CONFIG.RUN_TAG)}`);
    const found = (await search.json()) as any[];
    const created = found.find((d) => d.departmentName === originalName);
    expect(created, `Created department "${originalName}" should be present`).toBeTruthy();
    tracker.departmentIds.push(created.departmentId);

    // 2) EDIT — find the row, click the edit button, change name, submit
    const row = page.locator('tr', { hasText: originalName }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.locator('button[title="Edit Department"]').click();
    const editModal = page.locator('[role="dialog"]').first();
    await expect(editModal).toBeVisible({ timeout: 10_000 });
    await editModal.locator('#dept-name').fill(updatedName);
    await editModal.getByRole('button', { name: /update department/i }).click();
    await expect(editModal).toBeHidden({ timeout: 15_000 });

    // Verify updated name in DB
    const after2 = await api.get(`/api/departments/${created.departmentId}`);
    expect(after2.status()).toBe(200);
    const updated = await after2.json();
    expect(updated.departmentName).toBe(updatedName);

    // 3) DELETE — open confirm modal and confirm
    const row2 = page.locator('tr', { hasText: updatedName }).first();
    await expect(row2).toBeVisible({ timeout: 15_000 });
    await row2.locator('button[title="Delete Department"]').click();
    const confirm = page.locator('[role="dialog"]').first();
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    // The danger button text is "Delete Department"
    await confirm.getByRole('button', { name: /^delete department$/i }).click();
    await expect(confirm).toBeHidden({ timeout: 15_000 });

    // Verify gone in DB
    const after3 = await api.get(`/api/departments/${created.departmentId}`);
    expect(after3.status()).toBe(404);

    // Remove from tracker since we already deleted it
    tracker.departmentIds = tracker.departmentIds.filter((id) => id !== created.departmentId);
  });

  test('Department Management: form validates required name field client-side', async ({ page }) => {
    await page.goto('/departments/manage');
    await expect(page.getByRole('heading', { name: /departments/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    await page.getByRole('button', { name: /new department/i }).first().click();
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // The name input has the `required` attribute — Playwright honors this.
    const nameInput = modal.locator('#dept-name');
    await expect(nameInput).toHaveAttribute('required', '');

    // Try to submit with empty name — should not call the API and should
    // show browser-native validation.
    await modal.getByRole('button', { name: /create department/i }).click();
    // Modal still open (submission was blocked)
    await expect(modal).toBeVisible({ timeout: 3_000 });

    // Close the modal
    await modal.getByRole('button', { name: /^cancel$/i }).click();
    await expect(modal).toBeHidden();
  });

  test('Department Management: delete is blocked with friendly message when projects are linked', async ({
    page,
  }) => {
    // Seed: Department 1 (Engineering) has projects attached. UI should
    // display a friendly error toast and NOT delete the department.
    await page.goto('/departments/manage');
    await expect(page.getByRole('heading', { name: /departments/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    const row = page.locator('tr', { hasText: 'Engineering' }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.locator('button[title="Delete Department"]').click();

    const confirm = page.locator('[role="dialog"]').first();
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    await confirm.getByRole('button', { name: /^delete department$/i }).click();

    // The dialog stays open on failure; we expect an error toast.
    await expect(page.locator('.toast-item.toast-error')).toBeVisible({ timeout: 15_000 });
    const toastText = await page.locator('.toast-item.toast-error').first().innerText();
    expect(toastText.toLowerCase()).toMatch(/linked|projects/);

    // Engineering is still in the table
    await expect(page.locator('tr', { hasText: 'Engineering' }).first()).toBeVisible();

    // And still in DB
    const stillThere = await api.get('/api/departments/1');
    expect(stillThere.status()).toBe(200);

    // Close the still-open confirm dialog manually so we leave the page clean
    await confirm.getByRole('button', { name: /^cancel$/i }).click().catch(() => {});
  });

  // ----------------------------------------------------------------
  // PROJECT MANAGEMENT
  // ----------------------------------------------------------------
  test('Project Management: create → edit → delete via UI', async ({ page }) => {
    const originalName = `${CONFIG.RUN_TAG}_MgmtProj`;
    const updatedName = `${CONFIG.RUN_TAG}_MgmtProj_EDITED`;

    await page.goto('/projects/manage');
    await expect(page.getByRole('heading', { name: /projects/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    // 1) CREATE
    await page.getByRole('button', { name: /new project/i }).first().click();
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.locator('#proj-name').fill(originalName);
    await modal.locator('#proj-desc').fill('Created via UI test.');
    await modal.locator('#proj-dept').selectOption({ label: 'Engineering' });
    await modal.locator('#proj-status').selectOption(String(PROJECT_STATUS.IN_PROGRESS));
    await modal.locator('#proj-start').fill('2024-06-01');
    await modal.getByRole('button', { name: /create project/i }).click();
    await expect(modal).toBeHidden({ timeout: 15_000 });

    // Verify in DB
    await page.waitForTimeout(1_000);
    const search = await api.get(`/api/projects/search?name=${encodeURIComponent(CONFIG.RUN_TAG)}`);
    const found = (await search.json()) as any[];
    const created = found.find((p) => p.projectName === originalName);
    expect(created, `Created project "${originalName}" should be present`).toBeTruthy();
    tracker.projectIds.push(created.projectId);

    // 2) EDIT
    const row = page.locator('tr', { hasText: originalName }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.locator('button[title="Edit Project"]').click();
    const editModal = page.locator('[role="dialog"]').first();
    await expect(editModal).toBeVisible({ timeout: 10_000 });
    await editModal.locator('#proj-name').fill(updatedName);
    await editModal.locator('#proj-status').selectOption(String(PROJECT_STATUS.COMPLETED));
    await editModal.getByRole('button', { name: /update project/i }).click();
    await expect(editModal).toBeHidden({ timeout: 15_000 });

    // Verify in DB
    const after2 = await api.get(`/api/projects/${created.projectId}`);
    expect(after2.status()).toBe(200);
    const updated = await after2.json();
    expect(updated.projectName).toBe(updatedName);
    expect(updated.status).toBe(PROJECT_STATUS.COMPLETED);

    // 3) DELETE
    const row2 = page.locator('tr', { hasText: updatedName }).first();
    await expect(row2).toBeVisible({ timeout: 15_000 });
    await row2.locator('button[title="Delete Project"]').click();
    const confirm = page.locator('[role="dialog"]').first();
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    await confirm.getByRole('button', { name: /^delete project$/i }).click();
    await expect(confirm).toBeHidden({ timeout: 15_000 });

    // Verify gone
    const after3 = await api.get(`/api/projects/${created.projectId}`);
    expect(after3.status()).toBe(404);

    tracker.projectIds = tracker.projectIds.filter((id) => id !== created.projectId);
  });

  // ----------------------------------------------------------------
  // TAG MANAGEMENT
  // ----------------------------------------------------------------
  test('Tag Management: create → edit → delete via UI', async ({ page }) => {
    const originalName = `${CONFIG.RUN_TAG}_mgmttag`;
    const updatedName = `${CONFIG.RUN_TAG}_mgmttag_edited`;

    await page.goto('/tags/manage');
    await expect(page.getByRole('heading', { name: /tags/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    // 1) CREATE
    await page.getByRole('button', { name: /new tag/i }).first().click();
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.locator('#tag-name').fill(originalName);
    await modal.getByRole('button', { name: /create tag/i }).click();
    await expect(modal).toBeHidden({ timeout: 15_000 });

    // Verify in DB
    await page.waitForTimeout(500);
    const allTags = (await (await api.get('/api/tags')).json()) as any[];
    const created = allTags.find((t) => t.tagName === originalName);
    expect(created, `Created tag "${originalName}" should be present`).toBeTruthy();
    tracker.tagIds.push(created.tagId);

    // 2) EDIT
    const card = page.locator('.tag-saas-card', { hasText: `#${originalName}` }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.locator('button[title="Edit Tag"]').click();
    const editModal = page.locator('[role="dialog"]').first();
    await expect(editModal).toBeVisible({ timeout: 10_000 });
    await editModal.locator('#tag-name').fill(updatedName);
    await editModal.getByRole('button', { name: /update tag/i }).click();
    await expect(editModal).toBeHidden({ timeout: 15_000 });

    const after2 = await api.get(`/api/tags/${created.tagId}`);
    expect(after2.status()).toBe(200);
    const updated = await after2.json();
    expect(updated.tagName).toBe(updatedName);

    // 3) DELETE
    const card2 = page.locator('.tag-saas-card', { hasText: `#${updatedName}` }).first();
    await expect(card2).toBeVisible({ timeout: 15_000 });
    await card2.locator('button[title="Delete Tag"]').click();
    const confirm = page.locator('[role="dialog"]').first();
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    await confirm.getByRole('button', { name: /^delete tag$/i }).click();
    await expect(confirm).toBeHidden({ timeout: 15_000 });

    const after3 = await api.get(`/api/tags/${created.tagId}`);
    expect(after3.status()).toBe(404);

    tracker.tagIds = tracker.tagIds.filter((id) => id !== created.tagId);
  });

  test('Tag Management: delete is blocked with friendly message when tag is in use', async ({
    page,
  }) => {
    // Tag 1 ("frontend") is used by seed task 1.
    await page.goto('/tags/manage');
    await expect(page.getByRole('heading', { name: /tags/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    const card = page.locator('.tag-saas-card', { hasText: '#frontend' }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.locator('button[title="Delete Tag"]').click();

    const confirm = page.locator('[role="dialog"]').first();
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    await confirm.getByRole('button', { name: /^delete tag$/i }).click();

    // Error toast appears; confirm dialog stays open
    await expect(page.locator('.toast-item.toast-error')).toBeVisible({ timeout: 15_000 });

    // Tag 1 should still exist
    const stillThere = await api.get('/api/tags/1');
    expect(stillThere.status()).toBe(200);

    // Close confirm dialog manually
    await confirm.getByRole('button', { name: /^cancel$/i }).click().catch(() => {});
  });

  // ----------------------------------------------------------------
  // TASK MANAGEMENT
  // ----------------------------------------------------------------
  test('Task Management: create (with tags) → edit → soft-delete via UI', async ({ page }) => {
    const originalTitle = `${CONFIG.RUN_TAG}_MgmtTask`;
    const updatedTitle = `${CONFIG.RUN_TAG}_MgmtTask_EDITED`;

    await page.goto('/tasks/manage');
    await expect(page.getByRole('heading', { name: /tasks/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    // The default view is Kanban. Switch to Table for easier row selection.
    const tableBtn = page.locator('button[title="Table List View"]');
    if ((await tableBtn.count()) > 0) {
      await tableBtn.click();
      await page.waitForTimeout(500);
    }

    // 1) CREATE
    await page.getByRole('button', { name: /new task/i }).first().click();
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.locator('#task-title').fill(originalTitle);
    await modal.locator('#task-project').selectOption({ index: 1 });
    await modal.locator('#task-status').selectOption(String(TASK_STATUS.TO_DO));
    await modal.locator('#task-priority').selectOption(String(TASK_PRIORITY.HIGH));
    // Pick the first available tag if any
    const firstTag = modal.locator('.tag-picker-chip').first();
    if ((await firstTag.count()) > 0) await firstTag.click();
    await modal.getByRole('button', { name: /create task/i }).click();
    await expect(modal).toBeHidden({ timeout: 15_000 });

    // Find the task by listing
    await page.waitForTimeout(1_000);
    const list = (await (await api.get('/api/tasks/search?title=' + encodeURIComponent(CONFIG.RUN_TAG))).json()) as any[];
    const created = list.find((t) => t.title === originalTitle);
    expect(created, `Created task "${originalTitle}" should be present`).toBeTruthy();
    tracker.taskIds.push(created.taskId);

    // 2) EDIT
    const row = page.locator('tr', { hasText: originalTitle }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.locator('button[title="Edit Task"]').click();
    const editModal = page.locator('[role="dialog"]').first();
    await expect(editModal).toBeVisible({ timeout: 10_000 });
    await editModal.locator('#task-title').fill(updatedTitle);
    await editModal.locator('#task-status').selectOption(String(TASK_STATUS.IN_PROGRESS));
    await editModal.getByRole('button', { name: /update task/i }).click();
    await expect(editModal).toBeHidden({ timeout: 15_000 });

    const after2 = await api.get(`/api/tasks/${created.taskId}`);
    expect(after2.status()).toBe(200);
    const updated = await after2.json();
    expect(updated.title).toBe(updatedTitle);
    expect(updated.status).toBe(TASK_STATUS.IN_PROGRESS);
    expect(updated.modifiedDate).not.toBeNull();

    // 3) SOFT-DELETE
    const row2 = page.locator('tr', { hasText: updatedTitle }).first();
    await expect(row2).toBeVisible({ timeout: 15_000 });
    await row2.locator('button[title="Delete Task"]').click();
    const confirm = page.locator('[role="dialog"]').first();
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    await confirm.getByRole('button', { name: /^delete task$/i }).click();
    // On success the dialog closes
    await expect(confirm).toBeHidden({ timeout: 15_000 });

    // Soft-delete via UI works — task is hidden from list
    const stillInList = await api.get('/api/tasks/search?title=' + encodeURIComponent(updatedTitle));
    const stillInListArr = (await stillInList.json()) as any[];
    expect(stillInListArr.some((t) => t.taskId === created.taskId)).toBeFalsy();

    // ⚠ KNOWN BUG (same as tasks API suite): GET /api/tasks/{id} still
    // returns 200 with isActive=false. The soft-delete is real (IsActive=false
    // is persisted, the task is hidden from list/search), but the by-ID
    // endpoint is inconsistent. See TaskRepository.GetByIdWithTagsAsync —
    // it does not filter on IsActive.
    const after3 = await api.get(`/api/tasks/${created.taskId}`);
    expect(after3.status()).toBe(200); // documents current behavior
    const body3 = (await after3.json()) as any;
    expect(body3.isActive).toBe(false);

    tracker.taskIds = tracker.taskIds.filter((id) => id !== created.taskId);
  });
});
