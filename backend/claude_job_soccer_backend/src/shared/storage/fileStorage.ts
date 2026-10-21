import path from "path";

/**
 * Storage keys are the same relative paths the database already stores,
 * e.g. "videos/coach-interview-123.mp4", "images/abc.webp", "docs/cv.pdf".
 * Keeping them identical means no database links change when the driver changes.
 */
export interface StoredObject {
  key: string;
  size: number;
}

export interface FileStorage {
  readonly name: string;
  /** Store a local file under `key`. */
  put(key: string, localPath: string, contentType?: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /**
   * Make the object available as a local file (for ffmpeg, Whisper, text
   * extraction). `release()` removes any temporary copy.
   */
  toLocalFile(key: string): Promise<{ path: string; release: () => void }>;
  /** Link a browser can open; null when files are served by the API itself. */
  signedUrl(key: string): Promise<string | null>;
  list(prefix?: string): AsyncIterable<StoredObject>;
}

/** Normalise any stored url/path ("/videos/x.mp4", "videos\\x.mp4", absolute path) to a key. */
export const toStorageKey = (value: string): string => {
  const normalized = value.replace(/\\/g, "/");
  const marker = normalized.lastIndexOf("/uploads/");
  const relative = marker >= 0 ? normalized.slice(marker + "/uploads/".length) : normalized;
  const key = path.posix.normalize(relative.replace(/^\/+/, ""));
  if (key.startsWith("..") || key === ".") throw new Error(`Invalid storage key: ${value}`);
  return key;
};

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
};

export const contentTypeFor = (key: string): string =>
  CONTENT_TYPES[path.extname(key).toLowerCase()] ?? "application/octet-stream";
