// Centralized configuration for Playwright tests
// All tests target the LIVE deployed system.
// IMPORTANT: We never modify the original seed data; every test creates its own
// records (suffixed with RUN_TAG) and cleans them up afterwards.

export const CONFIG = {
  // Live URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://qe190061-prn232-ass2-fe.vercel.app',
  BACKEND_URL: process.env.BACKEND_URL || 'https://qe190061-prn232-ass2-be.onrender.com',
  SWAGGER_URL: `${process.env.BACKEND_URL || 'https://qe190061-prn232-ass2-be.onrender.com'}/swagger/index.html`,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@tasktrack.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
  STAFF_EMAIL: process.env.STAFF_EMAIL || 'staff@tasktrack.com',
  STAFF_PASSWORD: process.env.STAFF_PASSWORD || 'Staff@123456',

  // Render free tier can be slow on first cold start
  NAV_TIMEOUT_MS: 90_000,
  ACTION_TIMEOUT_MS: 30_000,
  RENDER_COLD_START_BUFFER_MS: 5_000,

  // Unique tag injected into all test-created entities so we never collide
  // with seed data, and so cleanup is unambiguous.
  RUN_TAG: `PWTEST_${Date.now()}`,

  // Timeouts that account for free-tier cold start (Render spins down idle)
  API_TIMEOUT_MS: 60_000,
} as const;

// Enumerations from the assignment spec (must match backend)
export const PROJECT_STATUS = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  ON_HOLD: 3,
} as const;

export const TASK_STATUS = {
  TO_DO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
  CANCELLED: 3,
} as const;

export const TASK_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
} as const;
