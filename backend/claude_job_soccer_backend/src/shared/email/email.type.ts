import type { Lang } from "../i18n";



export type TCreateAccount = {
  name: string;
  email: string | undefined;
  otp: string;
  theme:
    | "theme-red"
    | "theme-green"
    | "theme-purple"
    | "theme-orange"
    | "theme-blue";
  expiresIn?: Number;
  /** Language of the e-mail (default en). */
  lang?: Lang;
};

export type TResetPassword = {
  email: string | undefined;
  otp: string;
  name: string;
  theme:
    | "theme-red"
    | "theme-green"
    | "theme-purple"
    | "theme-orange"
    | "theme-blue";
  expiresIn?: Number;
  /** Language of the e-mail (default en). */
  lang?: Lang;
};

export type ISendEmail = {
  to: string | undefined;
  subject: string;
  html: string;
};

