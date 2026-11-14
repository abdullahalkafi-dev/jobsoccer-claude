import type { Lang } from "../i18n";

/** Words of the e-mails, per language. {name}, {email}, {year}, {minutes} are filled by the template. */
export type TEmailTexts = {
  brand: string;
  verify: {
    subject: string;
    title: string;
    greeting: string;
    intro: string;
    ignore: string;
    security: string;
  };
  reset: {
    subject: string;
    title: string;
    greeting: string;
    intro: string;
    useCode: string;
    expires: string;
    security: string;
    help: string;
  };
  footerRights: string;
  footerSentTo: string;
  securityLabel: string;
};

export const emailTexts: Record<Lang, TEmailTexts> = {
  en: {
    brand: "Jobsoccer",
    verify: {
      subject: "Verify your Jobsoccer account",
      title: "Email verification",
      greeting: "Hello, {name}!",
      intro: "Thank you for signing up. Please verify your email address to complete your registration.",
      ignore: "If you didn't create an account, you can safely ignore this email.",
      security: "Never share this code with anyone. Our team will never ask for your password or this verification code.",
    },
    reset: {
      subject: "Reset your Jobsoccer password",
      title: "Password reset",
      greeting: "Hello, {name}!",
      intro: "We received a request to reset your password. If you didn't make this request, you can safely ignore this email.",
      useCode: "To reset your password, use the code below:",
      expires: "This code will expire in <strong>{minutes} minutes</strong>",
      security: "Never share this code with anyone. Our team will never ask for your password or this reset code.",
      help: "If you're having trouble with the code, please contact our support team.",
    },
    footerRights: "© {year} Jobsoccer. All rights reserved.",
    footerSentTo: "This email was sent to {email}",
    securityLabel: "Security notice:",
  },
  es: {
    brand: "Jobsoccer",
    verify: {
      subject: "Verifica tu cuenta de Jobsoccer",
      title: "Verificación de correo electrónico",
      greeting: "¡Hola, {name}!",
      intro: "Gracias por registrarte. Verifica tu correo electrónico para completar el registro.",
      ignore: "Si no has creado una cuenta, puedes ignorar este mensaje.",
      security: "No compartas este código con nadie. Nuestro equipo nunca te pedirá tu contraseña ni este código de verificación.",
    },
    reset: {
      subject: "Restablece tu contraseña de Jobsoccer",
      title: "Restablecimiento de contraseña",
      greeting: "¡Hola, {name}!",
      intro: "Hemos recibido una solicitud para restablecer tu contraseña. Si no la hiciste tú, puedes ignorar este mensaje.",
      useCode: "Para restablecer tu contraseña, usa el siguiente código:",
      expires: "Este código caducará en <strong>{minutes} minutos</strong>",
      security: "No compartas este código con nadie. Nuestro equipo nunca te pedirá tu contraseña ni este código de restablecimiento.",
      help: "Si tienes problemas con el código, ponte en contacto con nuestro equipo de soporte.",
    },
    footerRights: "© {year} Jobsoccer. Todos los derechos reservados.",
    footerSentTo: "Este mensaje se envió a {email}",
    securityLabel: "Aviso de seguridad:",
  },
  fr: {
    brand: "Jobsoccer",
    verify: {
      subject: "Vérifiez votre compte Jobsoccer",
      title: "Vérification de l'adresse e-mail",
      greeting: "Bonjour {name} !",
      intro: "Merci de votre inscription. Veuillez vérifier votre adresse e-mail pour finaliser votre inscription.",
      ignore: "Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.",
      security: "Ne communiquez ce code à personne. Notre équipe ne vous demandera jamais votre mot de passe ni ce code de vérification.",
    },
    reset: {
      subject: "Réinitialisez votre mot de passe Jobsoccer",
      title: "Réinitialisation du mot de passe",
      greeting: "Bonjour {name} !",
      intro: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Si vous n'en êtes pas à l'origine, vous pouvez ignorer cet e-mail.",
      useCode: "Pour réinitialiser votre mot de passe, utilisez le code ci-dessous :",
      expires: "Ce code expirera dans <strong>{minutes} minutes</strong>",
      security: "Ne communiquez ce code à personne. Notre équipe ne vous demandera jamais votre mot de passe ni ce code de réinitialisation.",
      help: "Si vous rencontrez un problème avec le code, veuillez contacter notre équipe d'assistance.",
    },
    footerRights: "© {year} Jobsoccer. Tous droits réservés.",
    footerSentTo: "Cet e-mail a été envoyé à {email}",
    securityLabel: "Avis de sécurité :",
  },
};
