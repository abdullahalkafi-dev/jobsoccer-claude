import crypto from "crypto";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import mongoose from "mongoose";
import config from "../config";
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

/** ffmpeg: the one bundled as a dev dependency when present, otherwise the one on PATH. */
const ffmpegBinary = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@ffmpeg-installer/ffmpeg").path as string;
  } catch {
    return "ffmpeg";
  }
};

let baseVideo: Buffer | null = null;

/** One real, valid 720p MP4 (3 s, with a silent audio track), made once with ffmpeg. */
const buildBaseVideo = (): Buffer => {
  const out = path.join(os.tmpdir(), `e2e_base_${process.pid}.mp4`);
  execFileSync(
    ffmpegBinary(),
    ["-y", "-f", "lavfi", "-i", "testsrc=size=1280x720:rate=10", "-f", "lavfi", "-i", "anullsrc=r=16000:cl=mono", "-t", "3", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", out],
    { stdio: "ignore" }
  );
  const bytes = fs.readFileSync(out);
  fs.unlinkSync(out);
  return bytes;
};

/**
 * A valid MP4 that passes the real upload checks (format, length, 720p, sound).
 * A trailing "free" box (ignored by every player) makes the bytes - and so the
 * SHA-256 used as the transcript cache key - unique per call.
 */
export const testVideo = (label: string): Buffer => {
  baseVideo ??= buildBaseVideo();
  const payload = Buffer.concat([Buffer.from(`E2E|${label}|`), crypto.randomBytes(256)]);
  const header = Buffer.alloc(8);
  header.writeUInt32BE(payload.length + 8, 0);
  header.write("free", 4, "ascii");
  return Buffer.concat([baseVideo, header, payload]);
};

/** Smallest valid PNG (1x1), accepted by the image converter. */
export const tinyPng = (): Buffer =>
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface Check {
  id: string;
  what: string;
  pass: boolean;
  detail: string;
}

export const check = (list: Check[], id: string, what: string, pass: boolean, detail: string) => {
  list.push({ id, what, pass, detail });
};
