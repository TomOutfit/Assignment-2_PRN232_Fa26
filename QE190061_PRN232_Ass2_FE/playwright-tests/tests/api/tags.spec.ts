import { test, expect, request as apiRequest, type APIRequestContext } from '@playwright/test';
import { CONFIG } from '../../config';
import { createTracker, runCleanup } from '../../helpers/cleanup';
import type { Tag } from '../../helpers/types';

test.describe('Backend API — Tags', () => {
  const base = CONFIG.BACKEND_URL;
  let api: APIRequestContext;
  const tracker = createTracker();

  test.beforeAll(async () => {
    const tempApi = await apiRequest.newContext({ baseURL: base, timeout: CONFIG.API_TIMEOUT_MS });
    const loginRes = await tempApi.post('/api/auth/login', {
      data: { email: CONFIG.STAFF_EMAIL, password: CONFIG.STAFF_PASSWORD }
    });
    const authData = await loginRes.json();
    const token = authData.token || authData.accessToken;
    await tempApi.dispose();

    api = await apiRequest.newContext({
      baseURL: base,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      timeout: CONFIG.API_TIMEOUT_MS,
    });
  });

  test.afterAll(async () => {
    await runCleanup(api, base, tracker);
    await api.dispose();
  });

  // --------------------------------------------------------------------
  // 1) GET /api/tags
  // --------------------------------------------------------------------
  test('GET /api/tags returns a non-empty list', async () => {
    const res = await api.get('/api/tags');
    expect(res.status()).toBe(200);
    const list = (await res.json()) as Tag[];
    expect(list.length).toBeGreaterThan(0);
    for (const t of list) {
      expect(typeof t.tagId).toBe('number');
      expect(typeof t.tagName).toBe('string');
      expect(t.color == null || typeof t.color === 'string').toBeTruthy();
    }
  });

  // --------------------------------------------------------------------
  // 2) GET /api/tags/{id}
  // --------------------------------------------------------------------
  test('GET /api/tags/{id} returns one tag', async () => {
    const res = await api.get('/api/tags/1');
    expect(res.status()).toBe(200);
    const t = (await res.json()) as Tag;
    expect(t.tagId).toBe(1);
  });

  test('GET /api/tags/{id} with a non-existent ID returns 404', async () => {
    const res = await api.get('/api/tags/999999');
    expect(res.status()).toBe(404);
  });

  // --------------------------------------------------------------------
  // 3) POST /api/tags — create
  // --------------------------------------------------------------------
  test('POST /api/tags creates a new tag', async () => {
    const body = {
      tagName: `${CONFIG.RUN_TAG}_tag1`,
      color: '#ABCDEF',
    };
    const res = await api.post('/api/tags', { data: body });
    expect(res.status()).toBe(201);
    const t = (await res.json()) as Tag;
    expect(t.tagId).toBeGreaterThan(0);
    expect(t.tagName).toBe(body.tagName);
    tracker.tagIds.push(t.tagId);
  });

  test('POST /api/tags with empty body returns 400', async () => {
    const res = await api.post('/api/tags', { data: {} });
    expect(res.status()).toBe(400);
  });

  // --------------------------------------------------------------------
  // 4) PUT /api/tags/{id} — update
  // --------------------------------------------------------------------
  test('PUT /api/tags/{id} updates an existing tag', async () => {
    const create = (await (await api.post('/api/tags', {
      data: { tagName: `${CONFIG.RUN_TAG}_tagUpd`, color: '#111111' },
    })).json()) as Tag;
    tracker.tagIds.push(create.tagId);

    const res = await api.put(`/api/tags/${create.tagId}`, {
      data: { tagName: `${CONFIG.RUN_TAG}_tagUpd_RENAMED`, color: '#222222' },
    });
    expect(res.status()).toBe(200);
    const updated = (await res.json()) as Tag;
    expect(updated.tagName).toBe(`${CONFIG.RUN_TAG}_tagUpd_RENAMED`);
    expect(updated.color).toBe('#222222');
  });

  test('PUT /api/tags/{id} with a non-existent ID returns 404', async () => {
    const res = await api.put('/api/tags/999999', {
      data: { tagName: 'x', color: '#000000' },
    });
    expect([400, 404]).toContain(res.status());
  });

  // --------------------------------------------------------------------
  // 5) DELETE /api/tags/{id}
  // --------------------------------------------------------------------
  test('DELETE /api/tags/{id} with no assigned tasks succeeds (204)', async () => {
    const create = (await (await api.post('/api/tags', {
      data: { tagName: `${CONFIG.RUN_TAG}_tagDel`, color: '#AABBCC' },
    })).json()) as Tag;

    const res = await api.delete(`/api/tags/${create.tagId}`);
    expect(res.status()).toBe(204);

    const after = await api.get(`/api/tags/${create.tagId}`);
    expect(after.status()).toBe(404);
  });

  test('DELETE /api/tags/{id} with assigned tasks returns 400', async () => {
    // Tag 1 is assigned to seed task 1
    const res = await api.delete('/api/tags/1');
    expect(res.status()).toBe(400);

    const after = await api.get('/api/tags/1');
    expect(after.status()).toBe(200);
  });

  test('DELETE /api/tags/{id} with a non-existent ID returns 404', async () => {
    const res = await api.delete('/api/tags/999999');
    expect([400, 404]).toContain(res.status());
  });
});
