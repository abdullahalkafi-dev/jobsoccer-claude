import { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger";
import { storage, toStorageKey } from "../storage";

/**
 * Fallback for /images, /videos, /docs and other upload links when the file is
 * not on local disk: redirect to a short-lived signed link in the bucket.
 * Mounted after express.static, so local files are still served as before and
 * every stored link (e.g. "videos/x.mp4") keeps working after files move to MinIO/S3.
 */
export const serveFromStorage =
  (folder = "") =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    let key: string;
    try {
      key = toStorageKey(`${folder}/${decodeURIComponent(req.path)}`);
    } catch {
      return next();
    }
    if (!key || key.endsWith("/")) return next();

    try {
      const url = await storage.signedUrl(key);
      if (!url || !(await storage.exists(key))) return next();
      res.setHeader("Cache-Control", "private, max-age=60");
      return res.redirect(302, url);
    } catch (error: any) {
      logger.error(`Could not serve ${key} from storage`, { error: error.message });
      return next();
    }
  };
