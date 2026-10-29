import crypto from "crypto";
import mongoose from "mongoose";
import config from "../config";
import { aiConfig } from "../shared/ai/ai.config";
import { assertSafeEnvironment } from "../shared/safety/envGuard";

/**
 * Shared helpers for the end-to-end flow: settings, safety guards, a timed HTTP
 * client and the (guarded) database connection used to seed transcripts and read
 * the evaluation back. Staging / development only.
 */

export const E2E = {
  apiBase: (process.env.E2E_API_BASE ?? "https://api-dev.jobsoccer.com/api/v1").replace(/\/$/, ""),
  /** Public on purpose: these are throw-away test accounts on staging, so anyone on the team can log in. */
  password: "Test@123456",
  otp: "123456",
  emailDomain: "e2e.jobsoccer.test",
  pollMs: 2000,
  timeoutMs: 8 * 60 * 1000,
};

export const emailFor = (name: string) => `e2e.${name}@${E2E.emailDomain}`;

/** Refuse anything that is not the staging API or a local server. */
export const assertStagingTarget = (): void => {
  const host = new URL(E2E.apiBase).hostname;
  const allowed = host === "api-dev.jobsoccer.com" || host === "localhost" || host === "127.0.0.1";
  if (!allowed) {
    throw new Error(`Refusing to run against "${host}". The e2e flow is for staging (api-dev.jobsoccer.com) or localhost only.`);
  }
};

/** Connect to the development database; refuses the client's database. */
export const connectDevDatabase = async (): Promise<string> => {
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  if (!appEnv || appEnv === "production") {
    throw new Error("APP_ENV must be set to development/staging for the e2e flow (this .env looks like production).");
  }
  assertSafeEnvironment();
  if (!config.database_url) throw new Error("DATABASE_URL is not set");
  await mongoose.connect(config.database_url);
  return `${mongoose.connection.host}/${mongoose.connection.name}`;
};

export interface Timed {
  status: number;
  ok: boolean;
  ms: number;
  body: any;
}

/** One HTTP call with its duration. Never throws on a bad status. */
export const call = async (
  method: string,
  path: string,
  options: { token?: string; json?: unknown; form?: FormData } = {}
): Promise<Timed> => {
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let body: any;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = options.form;
  }
  const started = Date.now();
  const res = await fetch(`${E2E.apiBase}${path}`, { method, headers, body });
  const text = await res.text();
  const ms = Date.now() - started;
  let parsed: any = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* keep raw text */
  }
  return { status: res.status, ok: res.ok, ms, body: parsed };
};

export const sha256 = (bytes: Buffer): string => crypto.createHash("sha256").update(bytes).digest("hex");

/** A small file that passes the upload filter as an .mp4; unique bytes per call so every file has its own hash. */
export const fakeVideo = (label: string): Buffer =>
  Buffer.concat([Buffer.from(`E2E-FAKE-VIDEO|${label}|`), crypto.randomBytes(1024)]);

/** Smallest valid PNG (1x1), accepted by the image converter. */
export const tinyPng = (): Buffer =>
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const transcriptKey = () => ({ model: aiConfig.models.transcribe, language: aiConfig.transcriptionLanguage });

export interface Check {
  id: string;
  what: string;
  pass: boolean;
  detail: string;
}

export const check = (list: Check[], id: string, what: string, pass: boolean, detail: string) => {
  list.push({ id, what, pass, detail });
};
