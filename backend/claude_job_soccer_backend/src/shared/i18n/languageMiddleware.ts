import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import { jwtHelper } from "../util/jwtHelper";
import { User } from "../../modules/user/user.model";
import { isLang, Lang, resolveLang } from "./index";

/**
 * Saved language per user id, kept for a short time so a signed-in visitor does not cost a
 * database read on every request. Dropped by rememberUserLang / forgetUserLang when it changes.
 */
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 5000;
const cache = new Map<string, { lang: Lang | undefined; expires: number }>();

export const rememberUserLang = (userId: string, lang: Lang) => {
  cache.set(String(userId), { lang, expires: Date.now() + CACHE_TTL_MS });
};
export const forgetUserLang = (userId: string) => {
  cache.delete(String(userId));
};

const savedLanguageOf = async (userId: string): Promise<Lang | undefined> => {
  const hit = cache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.lang;
  const user = await User.findById(userId).select("language").lean();
  const lang = isLang(user?.language) ? user.language : undefined;
  if (cache.size >= CACHE_MAX) cache.clear();
  cache.set(userId, { lang, expires: Date.now() + CACHE_TTL_MS });
  return lang;
};

/**
 * Sets req.lang (and req.userLang when the signed-in user has a saved language).
 * Never fails a request: a bad token or a database error simply falls back to the header.
 */
export const languageMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        const verified = jwtHelper.verifyToken(header.split(" ")[1], config.jwt.jwt_secret as Secret);
        if (verified?.id) req.userLang = await savedLanguageOf(String(verified.id));
      } catch {
        // invalid token or lookup problem: the auth middleware deals with it, we use the header
      }
    }
  } catch {
    // ignore
  }
  req.lang = resolveLang(req);
  next();
};
