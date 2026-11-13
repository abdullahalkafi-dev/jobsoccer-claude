import crypto from "crypto";
import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import newFileName from "../../shared/util/filenameGenerator";
import { VIDEO_LIMITS, VideoKind } from "./video.constant";
import { VideoService } from "./video.service";

/**
 * Resumable video upload: the browser sends the file in pieces of CHUNK_BYTES. When the
 * connection drops, it asks how much arrived and continues from there instead of starting
 * again. Choosing the same file again later (even after closing the tab) continues the same
 * upload. When every byte has arrived, the file goes through the normal video checks.
 *
 * Pieces are kept in uploads/.partial-videos (on the persistent uploads volume, so a server
 * restart does not lose them; dot-folders are never served by express.static). Unfinished
 * uploads are removed after 24 hours.
 */

export const CHUNK_BYTES = 8 * 1024 * 1024;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PARTIAL_DIR = path.join(process.cwd(), "uploads", ".partial-videos");
const VIDEO_DIR = path.join(process.cwd(), "uploads", "videos");

type TSession = {
  id: string;
  userId: string;
  kind: VideoKind;
  fileName: string;
  ext: string;
  size: number;
  fingerprint: string;
  replaceVideoId?: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
};

const ID_PATTERN = /^[a-f0-9]{32}$/;
const metaPath = (id: string) => path.join(PARTIAL_DIR, `${id}.json`);
const partPath = (id: string) => path.join(PARTIAL_DIR, `${id}.part`);

const ensureDir = () => fs.promises.mkdir(PARTIAL_DIR, { recursive: true });

const readSession = async (id: string): Promise<TSession | null> => {
  if (!ID_PATTERN.test(id)) return null;
  try {
    return JSON.parse(await fs.promises.readFile(metaPath(id), "utf8")) as TSession;
  } catch {
    return null;
  }
};

const writeSession = async (session: TSession): Promise<void> => {
  const tmp = `${metaPath(session.id)}.tmp`;
  await fs.promises.writeFile(tmp, JSON.stringify(session));
  await fs.promises.rename(tmp, metaPath(session.id));
};

const removeSession = async (id: string): Promise<void> => {
  await fs.promises.unlink(metaPath(id)).catch(() => undefined);
  await fs.promises.unlink(partPath(id)).catch(() => undefined);
};

/** Bytes that really arrived (the file on disk is the truth). */
const receivedBytesOf = async (id: string): Promise<number> => {
  try {
    return (await fs.promises.stat(partPath(id))).size;
  } catch {
    return 0;
  }
};

/** Every session in the folder (there are only a few at any time). */
const listSessions = async (): Promise<TSession[]> => {
  await ensureDir();
  const names = (await fs.promises.readdir(PARTIAL_DIR)).filter((name) => name.endsWith(".json"));
  const sessions = await Promise.all(names.map((name) => readSession(name.slice(0, -5))));
  return sessions.filter((session): session is TSession => !!session);
};

/** Remove unfinished uploads nobody touched for 24 hours. */
const removeExpired = async (sessions: TSession[]): Promise<TSession[]> => {
  const now = Date.now();
  const alive: TSession[] = [];
  for (const session of sessions) {
    if (now - session.updatedAt > MAX_AGE_MS) await removeSession(session.id);
    else alive.push(session);
  }
  return alive;
};

/** One piece at a time per upload: a retried piece must not be written twice. */
const locks = new Map<string, Promise<unknown>>();
const withLock = async <T>(id: string, work: () => Promise<T>): Promise<T> => {
  const previous = locks.get(id) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(work);
  locks.set(id, next);
  try {
    return await next;
  } finally {
    if (locks.get(id) === next) locks.delete(id);
  }
};

const notFound = () => new AppError(StatusCodes.NOT_FOUND, "This upload was not found or has expired. Please choose the file again.");

const loadOwn = async (userId: string, id: string): Promise<TSession> => {
  const session = await readSession(id);
  if (!session || session.userId !== userId) throw notFound();
  return session;
};

/**
 * Start an upload, or continue the unfinished one for the same file (same name, size and
 * modified date). Checks consent / lock / slot first, so nobody uploads 500 MB for nothing.
 */
const start = async (input: {
  userId: string;
  kind: VideoKind;
  fileName: string;
  size: number;
  lastModified?: number;
  replaceVideoId?: string;
  title?: string;
}) => {
  const ext = path.extname(input.fileName).toLowerCase();
  if (!(VIDEO_LIMITS.allowedExtensions as readonly string[]).includes(ext)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Only MP4 or MOV video files are accepted.");
  }
  if (!Number.isFinite(input.size) || input.size <= 0) throw new AppError(StatusCodes.BAD_REQUEST, "The file is empty.");
  if (input.size > VIDEO_LIMITS.maxBytes) {
    throw new AppError(StatusCodes.REQUEST_TOO_LONG, `This video is larger than ${Math.round(VIDEO_LIMITS.maxBytes / (1024 * 1024))} MB.`);
  }
  await VideoService.checkUploadAllowed(input.userId, input.kind, input.replaceVideoId);

  const fingerprint = crypto
    .createHash("sha256")
    .update([input.userId, input.kind, input.replaceVideoId ?? "", input.fileName, input.size, input.lastModified ?? ""].join("|"))
    .digest("hex");

  const sessions = await removeExpired(await listSessions());
  const existing = sessions.find((session) => session.userId === input.userId && session.fingerprint === fingerprint);
  if (existing) {
    return { uploadId: existing.id, chunkSize: CHUNK_BYTES, size: existing.size, receivedBytes: await receivedBytesOf(existing.id), resumed: true };
  }

  const now = Date.now();
  const session: TSession = {
    id: crypto.randomBytes(16).toString("hex"),
    userId: input.userId,
    kind: input.kind,
    fileName: path.basename(input.fileName),
    ext,
    size: input.size,
    fingerprint,
    replaceVideoId: input.replaceVideoId,
    title: input.title,
    createdAt: now,
    updatedAt: now,
  };
  await fs.promises.writeFile(partPath(session.id), Buffer.alloc(0));
  await writeSession(session);
  return { uploadId: session.id, chunkSize: CHUNK_BYTES, size: session.size, receivedBytes: 0, resumed: false };
};

/** How much of the file has arrived (the browser asks after a dropped connection). */
const status = async (userId: string, id: string) => {
  const session = await loadOwn(userId, id);
  return { uploadId: id, size: session.size, receivedBytes: await receivedBytesOf(id), chunkSize: CHUNK_BYTES };
};

/** Add one piece. It must start exactly where the previous one ended. */
const appendChunk = (input: { userId: string; id: string; offset: number; data: Buffer }) =>
  withLock(input.id, async () => {
    const session = await loadOwn(input.userId, input.id);
    const received = await receivedBytesOf(input.id);
    if (input.offset !== received) {
      // Usually a piece that arrived although the browser did not get the answer: it skips ahead
      throw new AppError(StatusCodes.CONFLICT, `Expected the piece starting at byte ${received}.`);
    }
    if (!input.data.length) throw new AppError(StatusCodes.BAD_REQUEST, "Empty piece.");
    if (input.data.length > CHUNK_BYTES || received + input.data.length > session.size) {
      throw new AppError(StatusCodes.BAD_REQUEST, "This piece does not fit the file.");
    }
    await fs.promises.appendFile(partPath(input.id), input.data);
    session.updatedAt = Date.now();
    await writeSession(session);
    return { receivedBytes: received + input.data.length, size: session.size };
  });

/** Every byte arrived: move the file into place and run the normal video checks and save. */
const complete = (userId: string, id: string) =>
  withLock(id, async () => {
    const session = await loadOwn(userId, id);
    const received = await receivedBytesOf(id);
    if (received !== session.size) {
      throw new AppError(StatusCodes.CONFLICT, `The upload is not finished yet (${received} of ${session.size} bytes).`);
    }
    await fs.promises.mkdir(VIDEO_DIR, { recursive: true });
    const finalPath = path.join(VIDEO_DIR, newFileName({ originalname: session.fileName }, path) + session.ext);
    await fs.promises.rename(partPath(id), finalPath);
    await fs.promises.unlink(metaPath(id)).catch(() => undefined);
    // uploadVideo deletes the file itself if the video is rejected (too long, under 720p, no sound…)
    return VideoService.uploadVideo({
      userId,
      kind: session.kind,
      file: { path: finalPath, size: session.size },
      title: session.title,
      replaceVideoId: session.replaceVideoId,
    });
  });

export const ResumableVideoUpload = { start, status, appendChunk, complete, CHUNK_BYTES };
