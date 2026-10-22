/**
 * Environment guard: a development or staging process must never be pointed at
 * the client's (production) database. Set APP_ENV and PROTECTED_DB_MARKERS
 * (comma separated host/db fragments of the production database) in the .env of
 * every non-production environment. When APP_ENV is not set the guard does
 * nothing, so existing deployments keep working.
 */

export interface EnvGuardInput {
  APP_ENV?: string;
  DATABASE_URL?: string;
  PROTECTED_DB_MARKERS?: string;
}

export const checkEnvironment = (env: EnvGuardInput): string | null => {
  const appEnv = env.APP_ENV?.trim().toLowerCase();
  if (!appEnv || appEnv === "production") return null;

  const markers = (env.PROTECTED_DB_MARKERS ?? "")
    .split(",")
    .map((marker) => marker.trim())
    .filter(Boolean);
  const url = env.DATABASE_URL ?? "";
  const hit = markers.find((marker) => url.includes(marker));
  if (!hit) return null;

  return `APP_ENV=${appEnv} must not use the protected production database (matched "${hit}"). Fix DATABASE_URL.`;
};

/** Throws when the environment is unsafe. Call before connecting to the database. */
export const assertSafeEnvironment = (env: EnvGuardInput = process.env as EnvGuardInput): void => {
  const problem = checkEnvironment(env);
  if (problem) throw new Error(problem);
};
