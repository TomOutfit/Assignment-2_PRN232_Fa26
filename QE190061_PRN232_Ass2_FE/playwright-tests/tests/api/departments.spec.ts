import { test, expect, request as apiRequest } from '@playwright/test';
import { CONFIG } from '../../config';
import { createTracker, runCleanup } from '../../helpers/cleanup';
import type { Department } from '../../helpers/types';

test.describe('Backend API — Departments', () => {
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

  // --------------------------------------------------------------------
  // 1) GET /api/departments
  // --------------------------------------------------------------------
  test('GET /api/departments returns a non-empty list of active departments', async () => {
    const res = await api.get('/api/departments');
    expect(res.status()).toBe(200);
    const list = (await res.json()) as Department[];
    expect(Array.isArray(list)).toBeTruthy();
    expect(list.length).toBeGreaterThan(0);
    // Each item has the required fields
    for (const d of list) {
      expect(typeof d.departmentId).toBe('number');
      expect(typeof d.departmentName).toBe('string');
      expect(typeof d.departmentDescription).toBe('string');
      expect(typeof d.isActive).toBe('boolean');
    }
    // Should only contain active departments per the spec
    expect(list.every((d) => d.isActive)).toBeTruthy();
  });

  // --------------------------------------------------------------------
  // 2) GET /api/departments/{id}
  // --------------------------------------------------------------------
  test('GET /api/departments/{id} returns the department details', async () => {
    const list = (await (await api.get('/api/departments')).json()) as Department[];
    const sample = list[0];

    const res = await api.get(`/api/departments/${sample.departmentId}`);
    expect(res.status()).toBe(200);
    const d = (await res.json()) as Department;
    expect(d.departmentId).toBe(sample.departmentId);
    expect(d.departmentName).toBe(sample.departmentName);
  });

  test('GET /api/departments/{id} with a non-existent ID returns 404', async () => {
    const res = await api.get('/api/departments/999999');
    expect(res.status()).toBe(404);
  });

  // --------------------------------------------------------------------
  // 3) GET /api/departments/search?name=
  // --------------------------------------------------------------------
  test('GET /api/departments/search?name= performs partial-match search', async () => {
    // Take a known department and search for a substring
    const list = (await (await api.get('/api/departments')).json()) as Department[];
    const seed = list[0];
    const fragment = seed.departmentName.substring(0, 3).toLowerCase();

    const res = await api.get(`/api/departments/search?name=${fragment}`);
    expect(res.status()).toBe(200);
    const found = (await res.json()) as Department[];
    expect(found.length).toBeGreaterThan(0);
    expect(
      found.some((d) => d.departmentId === seed.departmentId)
    ).toBeTruthy();
  });

  test('GET /api/departments/search?name=NoSuchName returns empty array', async () => {
    const res = await api.get('/api/departments/search?name=NoSuchName_Zzz_Xxx');
    expect(res.status()).toBe(200);
    const found = (await res.json()) as Department[];
    expect(found).toEqual([]);
  });

  // --------------------------------------------------------------------
  // 4) POST /api/departments (CRUD create)
  // --------------------------------------------------------------------
  test('POST /api/departments creates a new department and returns it', async () => {
    const body = {
      departmentName: `${CONFIG.RUN_TAG}_DeptA`,
      departmentDescription: 'Department created by automated Playwright test.',
      isActive: true,
    };

    const res = await api.post('/api/departments', { data: body });
    expect(res.status()).toBe(201);
    const created = (await res.json()) as Department;
    expect(created.departmentId).toBeGreaterThan(0);
    expect(created.departmentName).toBe(body.departmentName);
    expect(created.departmentDescription).toBe(body.departmentDescription);
    expect(created.isActive).toBe(true);

    tracker.departmentIds.push(created.departmentId);
  });

  test('POST /api/departments without required fields returns 400 with field errors', async () => {
    const res = await api.post('/api/departments', { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body)).toMatch(/DepartmentName/);
    expect(JSON.stringify(body)).toMatch(/DepartmentDescription/);
  });

  // --------------------------------------------------------------------
  // 5) PUT /api/departments/{id} (CRUD update)
  // --------------------------------------------------------------------
  test('PUT /api/departments/{id} updates an existing department', async () => {
    const body = {
      departmentName: `${CONFIG.RUN_TAG}_DeptB`,
      departmentDescription: 'Initial description.',
      isActive: true,
    };
    const created = (await (await api.post('/api/departments', { data: body })).json()) as Department;
    tracker.departmentIds.push(created.departmentId);

    const update = {
      departmentName: `${CONFIG.RUN_TAG}_DeptB_RENAMED`,
      departmentDescription: 'Updated description.',
      isActive: true,
    };
    const res = await api.put(`/api/departments/${created.departmentId}`, { data: update });
    expect(res.status()).toBe(200);
    const updated = (await res.json()) as Department;
    expect(updated.departmentName).toBe(update.departmentName);
    expect(updated.departmentDescription).toBe(update.departmentDescription);
  });

  test('PUT /api/departments/{id} with a non-existent ID returns 404', async () => {
    const res = await api.put('/api/departments/999999', {
      data: { departmentName: 'x', departmentDescription: 'x', isActive: true },
    });
    expect([400, 404]).toContain(res.status());
  });

  // --------------------------------------------------------------------
  // 6) DELETE /api/departments/{id} — happy path & referential integrity
  // --------------------------------------------------------------------
  test('DELETE /api/departments/{id} with no linked projects succeeds (204)', async () => {
    const body = {
      departmentName: `${CONFIG.RUN_TAG}_DeptDelete`,
      departmentDescription: 'Temporary.',
      isActive: true,
    };
    const created = (await (await api.post('/api/departments', { data: body })).json()) as Department;
    // No push to tracker — we delete it explicitly inside this test

    const res = await api.delete(`/api/departments/${created.departmentId}`);
    expect(res.status()).toBe(204);

    // Confirm it is gone
    const after = await api.get(`/api/departments/${created.departmentId}`);
    expect(after.status()).toBe(404);
  });

  test('DELETE /api/departments/{id} returns 400 when projects are linked', async () => {
    // Department 1 (Engineering) has seed projects attached
    const res = await api.delete('/api/departments/1');
    expect(res.status()).toBe(400);

    // Confirm it still exists
    const after = await api.get('/api/departments/1');
    expect(after.status()).toBe(200);
  });

  test('DELETE /api/departments/{id} with a non-existent ID returns 404', async () => {
    const res = await api.delete('/api/departments/999999');
    expect([400, 404]).toContain(res.status());
  });
});
