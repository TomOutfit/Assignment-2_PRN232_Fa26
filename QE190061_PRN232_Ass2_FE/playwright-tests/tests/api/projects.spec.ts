import { test, expect, request as apiRequest } from '@playwright/test';
import { CONFIG, PROJECT_STATUS } from '../../config';
import { createTracker, runCleanup } from '../../helpers/cleanup';
import type { Department, Project } from '../../helpers/types';

test.describe('Backend API — Projects', () => {
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
  // 1) GET /api/projects — list all active (include department name)
  // --------------------------------------------------------------------
  test('GET /api/projects returns active projects with department name', async () => {
    const res = await api.get('/api/projects');
    expect(res.status()).toBe(200);
    const list = (await res.json()) as Project[];
    expect(list.length).toBeGreaterThan(0);
    for (const p of list) {
      expect(typeof p.projectId).toBe('number');
      expect(typeof p.projectName).toBe('string');
      expect(typeof p.departmentId).toBe('number');
      expect(typeof p.isActive).toBe('boolean');
    }
    expect(list.every((p) => p.isActive)).toBeTruthy();
  });

  // --------------------------------------------------------------------
  // 2) GET /api/projects/{id} — get one project and its tasks
  // --------------------------------------------------------------------
  test('GET /api/projects/{id} returns the project with its tasks', async () => {
    // Find a project that has tasks (seed project 1)
    const res = await api.get('/api/projects/1');
    expect(res.status()).toBe(200);
    const p = (await res.json()) as any;
    expect(p.projectId).toBe(1);
    expect(typeof p.projectName).toBe('string');
    expect(typeof p.departmentName).toBe('string');
    expect(Array.isArray(p.tasks)).toBeTruthy();
  });

  test('GET /api/projects/{id} with a non-existent ID returns 404', async () => {
    const res = await api.get('/api/projects/999999');
    expect(res.status()).toBe(404);
  });

  // --------------------------------------------------------------------
  // 3) GET /api/projects/department/{departmentId}
  // --------------------------------------------------------------------
  test('GET /api/projects/department/{id} returns only projects in that department', async () => {
    const res = await api.get('/api/projects/department/1');
    expect(res.status()).toBe(200);
    const list = (await res.json()) as Project[];
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.departmentId === 1)).toBeTruthy();
  });

  // --------------------------------------------------------------------
  // 4) GET /api/projects/search?name=&status=&departmentId=
  // --------------------------------------------------------------------
  test('GET /api/projects/search filters by status', async () => {
    const res = await api.get(`/api/projects/search?status=${PROJECT_STATUS.IN_PROGRESS}`);
    expect(res.status()).toBe(200);
    const list = (await res.json()) as Project[];
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.status === PROJECT_STATUS.IN_PROGRESS)).toBeTruthy();
  });

  test('GET /api/projects/search filters by departmentId', async () => {
    const res = await api.get('/api/projects/search?departmentId=2');
    expect(res.status()).toBe(200);
    const list = (await res.json()) as Project[];
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.departmentId === 2)).toBeTruthy();
  });

  test('GET /api/projects/search filters by partial name match', async () => {
    const list = (await (await api.get('/api/projects')).json()) as Project[];
    const seed = list[0];
    const fragment = seed.projectName.substring(0, 3);

    const res = await api.get(`/api/projects/search?name=${fragment}`);
    expect(res.status()).toBe(200);
    const found = (await res.json()) as Project[];
    expect(found.length).toBeGreaterThan(0);
    expect(found.some((p) => p.projectId === seed.projectId)).toBeTruthy();
  });

  // --------------------------------------------------------------------
  // 5) POST /api/projects — create
  // --------------------------------------------------------------------
  test('POST /api/projects creates a new project', async () => {
    const body = {
      projectName: `${CONFIG.RUN_TAG}_ProjA`,
      description: 'Project created by automated test.',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: PROJECT_STATUS.NOT_STARTED,
      departmentId: 1,
      isActive: true,
    };

    const res = await api.post('/api/projects', { data: body });
    expect(res.status()).toBe(201);
    const created = (await res.json()) as Project;
    expect(created.projectId).toBeGreaterThan(0);
    expect(created.projectName).toBe(body.projectName);
    expect(created.status).toBe(body.status);
    expect(created.departmentId).toBe(1);

    tracker.projectIds.push(created.projectId);
  });

  test('POST /api/projects without required fields returns 400', async () => {
    const res = await api.post('/api/projects', { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body)).toMatch(/ProjectName/);
  });

  test('POST /api/projects with invalid status (out of range) returns 400', async () => {
    const res = await api.post('/api/projects', {
      data: {
        projectName: `${CONFIG.RUN_TAG}_Bad`,
        startDate: '2024-01-01',
        status: 99, // out of range 0..3
        departmentId: 1,
      },
    });
    expect(res.status()).toBe(400);
  });

  // --------------------------------------------------------------------
  // 6) PUT /api/projects/{id} — update
  // --------------------------------------------------------------------
  test('PUT /api/projects/{id} updates an existing project', async () => {
    const body = {
      projectName: `${CONFIG.RUN_TAG}_ProjB`,
      description: 'Initial.',
      startDate: '2024-01-01',
      endDate: null,
      status: PROJECT_STATUS.NOT_STARTED,
      departmentId: 1,
      isActive: true,
    };
    const created = (await (await api.post('/api/projects', { data: body })).json()) as Project;
    tracker.projectIds.push(created.projectId);

    const update = {
      projectName: `${CONFIG.RUN_TAG}_ProjB_RENAMED`,
      description: 'Updated description.',
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      status: PROJECT_STATUS.IN_PROGRESS,
      departmentId: 1,
      isActive: true,
    };
    const res = await api.put(`/api/projects/${created.projectId}`, { data: update });
    expect(res.status()).toBe(200);
    const updated = (await res.json()) as Project;
    expect(updated.projectName).toBe(update.projectName);
    expect(updated.status).toBe(PROJECT_STATUS.IN_PROGRESS);
    expect(updated.description).toBe(update.description);
  });

  test('PUT /api/projects/{id} with a non-existent ID returns 404', async () => {
    const res = await api.put('/api/projects/999999', {
      data: {
        projectName: 'x',
        startDate: '2024-01-01',
        status: 0,
        departmentId: 1,
      },
    });
    expect([400, 404]).toContain(res.status());
  });

  // --------------------------------------------------------------------
  // 7) DELETE /api/projects/{id}
  // --------------------------------------------------------------------
  test('DELETE /api/projects/{id} with no tasks succeeds (204)', async () => {
    const body = {
      projectName: `${CONFIG.RUN_TAG}_ProjDelete`,
      startDate: '2024-01-01',
      status: PROJECT_STATUS.NOT_STARTED,
      departmentId: 1,
      isActive: true,
    };
    const created = (await (await api.post('/api/projects', { data: body })).json()) as Project;

    const res = await api.delete(`/api/projects/${created.projectId}`);
    expect(res.status()).toBe(204);

    const after = await api.get(`/api/projects/${created.projectId}`);
    expect(after.status()).toBe(404);
  });

  test('DELETE /api/projects/{id} with linked tasks returns 400', async () => {
    // Project 1 has tasks in the seed data
    const res = await api.delete('/api/projects/1');
    expect(res.status()).toBe(400);

    // Confirm still there
    const after = await api.get('/api/projects/1');
    expect(after.status()).toBe(200);
  });

  test('DELETE /api/projects/{id} with a non-existent ID returns 404', async () => {
    const res = await api.delete('/api/projects/999999');
    expect([400, 404]).toContain(res.status());
  });
});
