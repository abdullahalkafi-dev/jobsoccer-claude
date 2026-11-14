import { UploadError, type TUploadErrorInfo, type TVideoKind } from "./types";

/** Longest one single-request upload may take on the server (backend UPLOAD_REQUEST_TIMEOUT_MS). */
export const UPLOAD_LIMIT_MINUTES = 45;

const API = () => `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/videos`;
const bearer = (token: string) => (token.startsWith("Bearer ") ? token : `Bearer ${token}`);

/** An answer from the server (status 0 = no answer: the connection failed). */
class UploadHttpError extends UploadError {
  constructor(public status: number, info: TUploadErrorInfo) {
    super(info);
  }
}

/** The server's own message (already in the visitor's language) or, without one, the generic failure code. */
const infoFrom = (text: string): TUploadErrorInfo => {
  try {
    const message = JSON.parse(text)?.message;
    if (typeof message === "string" && message) return { code: "SERVER", message };
  } catch {
    // not JSON
  }
  return { code: "FAILED" };
};

const CONNECTION_LOST: TUploadErrorInfo = { code: "NETWORK" };

/**
 * Upload ONE video in a single request with a real progress bar. (fetch cannot report upload
 * progress, so this uses XMLHttpRequest.) Kept as a fallback for a server without resumable uploads.
 */
export const uploadVideo = (input: {
  token: string;
  kind: TVideoKind;
  file: File;
  replaceVideoId?: string;
  onProgress: (loadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
}): Promise<void> =>
  new Promise((resolve, reject) => {
    const { token, kind, file, replaceVideoId, onProgress, signal } = input;
    const form = new FormData();
    form.append("kind", kind);
    if (replaceVideoId) form.append("replaceVideoId", replaceVideoId);
    form.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", API());
    xhr.setRequestHeader("Authorization", bearer(token));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      if (xhr.status === 413) return reject(new UploadError({ code: "TOO_LARGE", params: { megabytes: 600 } }));
      if (xhr.status === 408) {
        return reject(new UploadError({ code: "TIMEOUT", params: { minutes: UPLOAD_LIMIT_MINUTES } }));
      }
      reject(new UploadError(infoFrom(xhr.responseText)));
    };
    xhr.onerror = () => reject(new UploadError(CONNECTION_LOST));
    xhr.onabort = () => reject(new UploadError({ code: "CANCELLED" }));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });

// ---------------------------------------------------------------- resumable upload

const requestJson = async <T>(method: string, url: string, token: string, body?: unknown): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { Authorization: bearer(token), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new UploadHttpError(0, CONNECTION_LOST);
  }
  const text = await response.text();
  if (!response.ok) throw new UploadHttpError(response.status, infoFrom(text));
  return (JSON.parse(text)?.data ?? {}) as T;
};

/** Send one piece (raw bytes) with progress inside the piece. */
const sendPiece = (input: { url: string; token: string; piece: Blob; onProgress: (sent: number) => void }) =>
  new Promise<{ receivedBytes: number }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", input.url);
    xhr.setRequestHeader("Authorization", bearer(input.token));
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.timeout = 10 * 60 * 1000; // a stalled connection counts as dropped after 10 minutes
    xhr.upload.onprogress = (event) => input.onProgress(event.loaded);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          return resolve(JSON.parse(xhr.responseText).data);
        } catch {
          return reject(new UploadHttpError(0, CONNECTION_LOST));
        }
      }
      reject(new UploadHttpError(xhr.status, infoFrom(xhr.responseText)));
    };
    xhr.onerror = () => reject(new UploadHttpError(0, CONNECTION_LOST));
    xhr.ontimeout = () => reject(new UploadHttpError(0, CONNECTION_LOST));
    xhr.send(input.piece);
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Wait before the next try; continue at once when the browser says it is back online. */
const waitBeforeRetry = (seconds: number) =>
  new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      window.removeEventListener("online", done);
      resolve();
    };
    const timer = setTimeout(done, seconds * 1000);
    window.addEventListener("online", done);
  });

/** Problems that trying again cannot fix (wrong file, locked, no consent, not signed in…). */
const isFinal = (status: number) => status >= 400 && status < 500 && status !== 408 && status !== 409 && status !== 429;

export type TResumableEvents = {
  onProgress: (loadedBytes: number, totalBytes: number) => void;
  /** The connection dropped; the next try starts in `seconds`. */
  onRetry: (seconds: number) => void;
  /** An earlier, unfinished upload of this same file was found; it continues from `bytes`. */
  onResume: (bytes: number) => void;
  /** Every byte has arrived; the server now checks and saves the video. */
  onUploaded: () => void;
};

/**
 * Upload ONE video in pieces. A dropped connection is retried automatically (waiting 2 s, 4 s,
 * 8 s… up to 30 s, or until the browser is back online) and continues from the last piece the
 * server has. Choosing the same file again later continues the same upload on the server.
 */
export const uploadVideoResumable = async (
  input: { token: string; kind: TVideoKind; file: File; replaceVideoId?: string } & TResumableEvents
): Promise<void> => {
  const { token, kind, file, replaceVideoId } = input;

  let session: { uploadId: string; chunkSize: number; receivedBytes: number; resumed: boolean };
  try {
    session = await requestJson("POST", `${API()}/uploads`, token, {
      kind,
      fileName: file.name,
      size: file.size,
      lastModified: file.lastModified,
      replaceVideoId,
    });
  } catch (error) {
    // A server without resumable uploads: use the single request instead
    if (error instanceof UploadHttpError && error.status === 404) {
      return uploadVideo({ token, kind, file, replaceVideoId, onProgress: input.onProgress });
    }
    throw error;
  }

  const url = `${API()}/uploads/${session.uploadId}`;
  let offset = session.receivedBytes;
  if (session.resumed && offset > 0) input.onResume(offset);
  input.onProgress(offset, file.size);

  let failures = 0;
  const MAX_FAILURES = 15; // about 6 minutes of trying without any progress
  while (offset < file.size) {
    const end = Math.min(offset + session.chunkSize, file.size);
    try {
      const result = await sendPiece({
        url: `${url}?offset=${offset}`,
        token,
        piece: file.slice(offset, end),
        onProgress: (sent) => input.onProgress(offset + sent, file.size),
      });
      offset = result.receivedBytes;
      failures = 0;
      input.onProgress(offset, file.size);
    } catch (error) {
      const status = error instanceof UploadHttpError ? error.status : 0;
      if (isFinal(status)) throw error;
      if (status !== 409) {
        failures += 1;
        if (failures > MAX_FAILURES) throw new UploadError(CONNECTION_LOST);
        const seconds = Math.min(30, 2 ** failures);
        input.onRetry(seconds);
        await waitBeforeRetry(seconds);
      }
      // Ask the server how much really arrived, then continue from there
      try {
        const now = await requestJson<{ receivedBytes: number }>("GET", url, token);
        offset = now.receivedBytes;
        input.onProgress(offset, file.size);
      } catch (statusError) {
        const s = statusError instanceof UploadHttpError ? statusError.status : 0;
        if (isFinal(s)) throw statusError;
        await sleep(1000);
      }
    }
  }

  input.onUploaded();
  // Checking and saving a large file can take a little while; retry if the answer is lost
  for (let attempt = 1; ; attempt++) {
    try {
      await requestJson("POST", `${url}/complete`, token);
      return;
    } catch (error) {
      const status = error instanceof UploadHttpError ? error.status : 0;
      // The upload is gone after a successful save: if the first answer was lost, a retry gets 404
      if (status === 404 && attempt > 1) return;
      if (isFinal(status) || attempt >= 4) throw error;
      await waitBeforeRetry(5 * attempt);
    }
  }
};
