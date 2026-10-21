import path from "path";
import "../../config"; // loads .env before process.env is read

/**
 * File storage settings.
 *
 * STORAGE_DRIVER=local  -> files stay in ./uploads (current behaviour)
 * STORAGE_DRIVER=s3     -> files are also stored in an S3-compatible bucket
 *                          (MinIO now, AWS S3 later: only these env values change)
 */
export type StorageDriverName = "local" | "s3";

const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const storageConfig = {
  driver: (process.env.STORAGE_DRIVER === "s3" ? "s3" : "local") as StorageDriverName,
  localRoot: path.join(process.cwd(), "uploads"),

  s3: {
    /** e.g. http://minio:9000 inside docker, empty for AWS S3. */
    endpoint: process.env.S3_ENDPOINT || undefined,
    /** Host used in signed links that browsers open, e.g. http://localhost:9000. */
    publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET || "jobsoccer",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    /** MinIO needs path-style URLs (http://host/bucket/key). */
    forcePathStyle: toBool(process.env.S3_FORCE_PATH_STYLE, true),
  },

  /** Lifetime of signed download links, in seconds. */
  signedUrlTtlSeconds: Number.parseInt(process.env.STORAGE_SIGNED_URL_TTL || "900", 10),

  /**
   * Remove the local copy after it is safely in the bucket. Off by default so
   * nothing on disk disappears until the bucket setup has been verified.
   */
  deleteLocalAfterUpload: toBool(process.env.STORAGE_DELETE_LOCAL_AFTER_UPLOAD, false),
} as const;
