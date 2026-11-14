import { describe, expect, it } from "vitest";
import { emailTemplate } from "./email.template";

const year = new Date().getFullYear();

describe("email templates", () => {
  const cases = [
    { lang: "en" as const, verifySubject: "Verify your Jobsoccer account", resetSubject: "Reset your Jobsoccer password", hello: "Hello, Zoë!", rights: "All rights reserved." },
    { lang: "es" as const, verifySubject: "Verifica tu cuenta de Jobsoccer", resetSubject: "Restablece tu contraseña de Jobsoccer", hello: "¡Hola, Zoë!", rights: "Todos los derechos reservados." },
    { lang: "fr" as const, verifySubject: "Vérifiez votre compte Jobsoccer", resetSubject: "Réinitialisez votre mot de passe Jobsoccer", hello: "Bonjour Zoë !", rights: "Tous droits réservés." },
  ];

  for (const c of cases) {
    it(`renders the sign-up e-mail in ${c.lang}`, () => {
      const mail = emailTemplate.createAccount({ name: "Zoë", email: "zoe@example.com", otp: "123456", theme: "theme-green", lang: c.lang });
      expect(mail.subject).toBe(c.verifySubject);
      expect(mail.to).toBe("zoe@example.com");
      expect(mail.html).toContain(`<html lang="${c.lang}">`);
      expect(mail.html).toContain(c.hello);
      expect(mail.html).toContain("123456");
      expect(mail.html).toContain(`© ${year} Jobsoccer. ${c.rights}`);
      expect(mail.html).not.toContain("PlayScout");
      expect(mail.html).not.toContain("2025");
    });

    it(`renders the password reset e-mail in ${c.lang}`, () => {
      const mail = emailTemplate.resetPassword({ name: "Zoë", email: "zoe@example.com", otp: "654321", theme: "theme-red", expiresIn: 30, lang: c.lang });
      expect(mail.subject).toBe(c.resetSubject);
      expect(mail.html).toContain(`<html lang="${c.lang}">`);
      expect(mail.html).toContain("654321");
      expect(mail.html).toContain("<strong>30 ");
      expect(mail.html).toContain("Jobsoccer");
      expect(mail.html).not.toContain("PlayScout");
    });
  }

  it("defaults to English and escapes the name", () => {
    const mail = emailTemplate.createAccount({ name: "<b>x</b>", email: "a@b.c", otp: "1", theme: "theme-blue" });
    expect(mail.html).toContain('<html lang="en">');
    expect(mail.html).toContain("&lt;b&gt;x&lt;/b&gt;");
  });
});
