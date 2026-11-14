import { JwtPayload } from 'jsonwebtoken';
import type { Lang } from '../i18n';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        id: string;
        role: string;
        email: string;
        userType: string;
      };
      id: string;
      /** Language of this request (see shared/i18n). Always set after languageMiddleware. */
      lang: Lang;
      /** Saved language of the signed-in user, when there is one. */
      userLang?: Lang;
    }
  }
}
