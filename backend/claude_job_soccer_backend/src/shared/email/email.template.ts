import { TCreateAccount, TResetPassword } from "./email.type";
import { DEFAULT_LANG, fillTemplate, isLang, Lang } from "../i18n";
import { emailTexts } from "./email.texts";

const themes = {
  "theme-red": { primary: "#e74c3c", secondary: "#c0392b", accent: "#fdeeee" },
  "theme-green": { primary: "#2ecc71", secondary: "#27ae60", accent: "#eafaf1" },
  "theme-purple": { primary: "#9b59b6", secondary: "#8e44ad", accent: "#f5eef8" },
  "theme-orange": { primary: "#f39c12", secondary: "#d35400", accent: "#fef5e7" },
  "theme-blue": { primary: "#3498db", secondary: "#2980b9", accent: "#e7f4fd" },
};

type TTheme = (typeof themes)[keyof typeof themes];

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

const styles = (theme: TTheme) => `
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background-color: #f6f6f6; color: #333333; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { border-collapse: collapse; }
    .container { max-width: 100%; width: 100%; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: ${theme.primary}; padding: 30px 20px; text-align: center; }
    .logo { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; }
    .content { padding: 30px; background-color: #ffffff; }
    .greeting { color: ${theme.primary}; margin-top: 0; margin-bottom: 20px; font-size: 22px; font-weight: 600; }
    .message { margin-bottom: 25px; font-size: 16px; line-height: 1.6; }
    .otp-container { text-align: center; margin: 30px 0; }
    .otp { display: inline-block; background-color: ${theme.primary}; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 18px 30px; border-radius: 12px; border: 2px dashed ${theme.secondary}; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-transform: uppercase; }
    .footer { background-color: ${theme.accent}; padding: 25px 20px; text-align: center; color: #666666; font-size: 14px; }
    .security-notice { background-color: ${theme.accent}; border-left: 4px solid ${theme.primary}; padding: 15px; margin-top: 25px; border-radius: 4px; }
    .expiration { text-align: center; margin: 20px 0; padding: 12px; background-color: #f9f9f9; border-radius: 6px; font-weight: 600; color: #555555; border: 1px solid #eeeeee; }
    .disclaimer { margin-top: 25px; font-size: 14px; color: #777777; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .header { padding: 25px 15px; } .logo { font-size: 24px; } .content { padding: 25px 15px; }
      .greeting { font-size: 20px; } .message { font-size: 15px; } .expiration { font-size: 14px; }
      .otp { font-size: 20px; padding: 15px 20px; letter-spacing: 3px; }
    }
    @media only screen and (max-width: 480px) {
      .header { padding: 20px 10px; } .logo { font-size: 22px; } .content { padding: 20px 10px; }
      .greeting { font-size: 18px; } .otp { font-size: 18px; padding: 12px 15px; letter-spacing: 2px; }
    }`;

const layout = (opts: { lang: Lang; theme: TTheme; title: string; body: string; email: string | undefined }) => {
  const texts = emailTexts[opts.lang];
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="${opts.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.title)}</title>
  <style type="text/css">${styles(opts.theme)}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6;">
  <div class="container">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" valign="top">
          <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td class="header">
                <h1 class="logo">${texts.brand}</h1>
              </td>
            </tr>
            <tr>
              <td class="content">${opts.body}
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p style="margin: 0;">${escapeHtml(fillTemplate(texts.footerRights, { year }))}</p>
                <p style="margin: 8px 0 0 0; font-size: 12px;">${escapeHtml(fillTemplate(texts.footerSentTo, { email: opts.email ?? "" }))}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};

const pickLang = (lang: unknown): Lang => (isLang(lang) ? lang : DEFAULT_LANG);

const createAccount = (values: TCreateAccount) => {
  const lang = pickLang(values.lang);
  const t = emailTexts[lang];
  const theme = themes[values.theme] ?? themes["theme-blue"];
  const body = `
                <h2 class="greeting">${escapeHtml(fillTemplate(t.verify.greeting, { name: values.name }))}</h2>
                <p class="message">${escapeHtml(t.verify.intro)}</p>
                <div class="otp-container">
                  <div class="otp">${escapeHtml(values.otp)}</div>
                </div>
                <p class="message">${escapeHtml(t.verify.ignore)}</p>
                <div class="security-notice">
                  <p style="margin: 0; font-size: 14px;"><strong>${escapeHtml(t.securityLabel)}</strong> ${escapeHtml(t.verify.security)}</p>
                </div>`;
  return {
    to: values.email,
    subject: t.verify.subject,
    html: layout({ lang, theme, title: t.verify.title, body, email: values.email }),
  };
};

const resetPassword = (values: TResetPassword) => {
  const lang = pickLang(values.lang);
  const t = emailTexts[lang];
  const theme = themes[values.theme as keyof typeof themes] ?? themes["theme-blue"];
  const body = `
                <h2 class="greeting">${escapeHtml(fillTemplate(t.reset.greeting, { name: values.name }))}</h2>
                <p class="message">${escapeHtml(t.reset.intro)}</p>
                <p class="message">${escapeHtml(t.reset.useCode)}</p>
                <div class="otp-container">
                  <div class="otp">${escapeHtml(values.otp)}</div>
                </div>
                <div class="expiration">${fillTemplate(t.reset.expires, { minutes: Number(values.expiresIn ?? 30) })}</div>
                <div class="security-notice">
                  <p style="margin: 0; font-size: 14px;"><strong>${escapeHtml(t.securityLabel)}</strong> ${escapeHtml(t.reset.security)}</p>
                </div>
                <p class="message disclaimer">${escapeHtml(t.reset.help)}</p>`;
  return {
    to: values.email,
    subject: t.reset.subject,
    html: layout({ lang, theme, title: t.reset.title, body, email: values.email }),
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
