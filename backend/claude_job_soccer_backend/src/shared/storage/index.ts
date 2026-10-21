import fs from "fs";
import { logger } from "../logger/logger";
import { contentTypeFor, FileStorage, toStorageKey } from "./fileStorage";
import { LocalStorage } from "./localStorage";
import { S3Storage } from "./s3Storage";
import { storageConfig } from "./storage.config";

export { toStorageKey } from "./fileStorage";
export type { FileStorage } from "./fileStorage";

export const localStorage = new LocalStorage(storageConfig.localRoot);

export const storage: FileStorage =
  storageConfig.driver === "s3"
    ? new S3Storage({ ...storageConfig.s3, signedUrlTtlSeconds: storageConfig.signedUrlTtlSeconds })
    : localStorage;

/**
 * Copy freshly uploaded files (still on local disk) into the configured storage.
 * With the local driver this is a no-op. The local copy is removed only when
 * STORAGE_DELETE_LOCAL_AFTER_UPLOAD=true and the upload succeeded.
 */
export const persistUploadedFiles = async (localPaths: string[]): Promise<void> => {
  if (storage === localStorage) return;
  for (const localPath of localPaths) {
    if (!fs.existsSync(localPath)) continue; // removed by the request (e.g. validation failed)
    const key = toStorageKey(localPath);
    try {
      await storage.put(key, localPath, contentTypeFor(key));
      if (storageConfig.deleteLocalAfterUpload) await fs.promises.unlink(localPath);
      logger.info(`Stored ${key} in ${storage.name} storage`);
    } catch (error: any) {
      // The local file is kept, so nothing is lost; it can be copied later by the migrate script.
      logger.error(`Failed to store ${key} in ${storage.name} storage`, { error: error.message });
    }
  }
};

/**
 * Local path for a stored file: the local copy when it exists, otherwise a
 * temporary download from storage. Always call release() when done.
 */
export const getLocalCopy = async (urlOrKey: string): Promise<{ path: string; release: () => void }> => {
  const key = toStorageKey(urlOrKey);
  if (await localStorage.exists(key)) return localStorage.toLocalFile(key);
  return storage.toLocalFile(key);
};
