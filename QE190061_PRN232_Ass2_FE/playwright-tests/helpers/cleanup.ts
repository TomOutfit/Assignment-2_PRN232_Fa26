// Shared cleanup tracker.
// Each suite pushes IDs of entities it created; the global teardown deletes
// them in reverse-dependency order so we never violate FK constraints
// (Tag → Task → Project → Department).
//
// Strategy:
//   - We never touch seed data. We only delete records we created ourselves.
//   - Cleanup is best-effort: a failure to delete is logged but does not fail
//     the test run.

import type { APIRequestContext } from '@playwright/test';

export interface CleanupTracker {
  tagIds: number[];
  taskIds: number[];
  projectIds: number[];
  departmentIds: number[];
}

export function createTracker(): CleanupTracker {
  return { tagIds: [], taskIds: [], projectIds: [], departmentIds: [] };
}

export async function runCleanup(
  api: APIRequestContext,
  baseURL: string,
  tracker: CleanupTracker
): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];
  let ok = true;

  // 1) Soft-delete any tasks we created (the spec mandates soft delete).
  for (const id of [...tracker.taskIds].reverse()) {
    try {
      const res = await api.delete(`${baseURL}/api/tasks/${id}`);
      if (!res.ok()) {
        errors.push(`Task ${id}: HTTP ${res.status()}`);
        ok = false;
      }
    } catch (e: any) {
      errors.push(`Task ${id}: ${e.message}`);
      ok = false;
    }
  }

  // 2) Delete projects we created (only succeeds if no tasks reference them,
  //    and since we soft-deleted above this is safe).
  for (const id of [...tracker.projectIds].reverse()) {
    try {
      const res = await api.delete(`${baseURL}/api/projects/${id}`);
      if (!res.ok() && res.status() !== 204) {
        errors.push(`Project ${id}: HTTP ${res.status()}`);
        ok = false;
      }
    } catch (e: any) {
      errors.push(`Project ${id}: ${e.message}`);
      ok = false;
    }
  }

  // 3) Delete departments we created.
  for (const id of [...tracker.departmentIds].reverse()) {
    try {
      const res = await api.delete(`${baseURL}/api/departments/${id}`);
      if (!res.ok() && res.status() !== 204) {
        errors.push(`Department ${id}: HTTP ${res.status()}`);
        ok = false;
      }
    } catch (e: any) {
      errors.push(`Department ${id}: ${e.message}`);
      ok = false;
    }
  }

  // 4) Delete tags we created (only succeeds if no tasks reference them).
  for (const id of [...tracker.tagIds].reverse()) {
    try {
      const res = await api.delete(`${baseURL}/api/tags/${id}`);
      if (!res.ok() && res.status() !== 204) {
        errors.push(`Tag ${id}: HTTP ${res.status()}`);
        ok = false;
      }
    } catch (e: any) {
      errors.push(`Tag ${id}: ${e.message}`);
      ok = false;
    }
  }

  return { ok, errors };
}
