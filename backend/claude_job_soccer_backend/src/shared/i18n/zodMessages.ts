import type { Lang } from "./index";

/**
 * Fallback sentences for Zod issues that carry no custom message. Messages written by hand in a
 * schema are passed through as written (and translated by the catalog when they are in it).
 */
type TZodTexts = {
  required: (f: string) => string;
  invalidType: (f: string, expected: string) => string;
  tooSmallText: (f: string, n: number | string) => string;
  tooSmallNumber: (f: string, n: number | string) => string;
  tooSmallList: (f: string, n: number | string) => string;
  tooBigText: (f: string, n: number | string) => string;
  tooBigNumber: (f: string, n: number | string) => string;
  tooBigList: (f: string, n: number | string) => string;
  email: (f: string) => string;
  url: (f: string) => string;
  uuid: (f: string) => string;
  format: (f: string) => string;
  oneOf: (f: string, options: string) => string;
  invalidValue: (f: string) => string;
  invalid: (f: string) => string;
  unrecognized: (keys: string) => string;
  types: Record<string, string>;
};

export const zodTexts: Record<Lang, TZodTexts> = {
  en: {
    required: (f) => `${f} is required`,
    invalidType: (f, e) => `${f} must be ${e}`,
    tooSmallText: (f, n) => `${f} must be at least ${n} characters`,
    tooSmallNumber: (f, n) => `${f} must be at least ${n}`,
    tooSmallList: (f, n) => `${f} must contain at least ${n} item(s)`,
    tooBigText: (f, n) => `${f} must be at most ${n} characters`,
    tooBigNumber: (f, n) => `${f} must be at most ${n}`,
    tooBigList: (f, n) => `${f} must contain at most ${n} item(s)`,
    email: (f) => `${f} must be a valid email address`,
    url: (f) => `${f} must be a valid URL`,
    uuid: (f) => `${f} must be a valid identifier`,
    format: (f) => `${f} format is invalid`,
    oneOf: (f, o) => `${f} must be one of: ${o}`,
    invalidValue: (f) => `${f} has an invalid value`,
    invalid: (f) => `${f} is invalid`,
    unrecognized: (k) => `Unexpected field(s): ${k}`,
    types: { string: "text", number: "a number", boolean: "true or false", array: "a list", object: "an object", date: "a date", integer: "a whole number" },
  },
  es: {
    required: (f) => `${f} es obligatorio`,
    invalidType: (f, e) => `${f} debe ser ${e}`,
    tooSmallText: (f, n) => `${f} debe tener al menos ${n} caracteres`,
    tooSmallNumber: (f, n) => `${f} debe ser como mínimo ${n}`,
    tooSmallList: (f, n) => `${f} debe contener al menos ${n} elemento(s)`,
    tooBigText: (f, n) => `${f} no puede superar los ${n} caracteres`,
    tooBigNumber: (f, n) => `${f} debe ser como máximo ${n}`,
    tooBigList: (f, n) => `${f} no puede contener más de ${n} elemento(s)`,
    email: (f) => `${f} debe ser un correo electrónico válido`,
    url: (f) => `${f} debe ser una URL válida`,
    uuid: (f) => `${f} debe ser un identificador válido`,
    format: (f) => `El formato de ${f} no es válido`,
    oneOf: (f, o) => `${f} debe ser uno de: ${o}`,
    invalidValue: (f) => `${f} tiene un valor no válido`,
    invalid: (f) => `${f} no es válido`,
    unrecognized: (k) => `Campo(s) no esperado(s): ${k}`,
    types: { string: "un texto", number: "un número", boolean: "verdadero o falso", array: "una lista", object: "un objeto", date: "una fecha", integer: "un número entero" },
  },
  fr: {
    required: (f) => `${f} est obligatoire`,
    invalidType: (f, e) => `${f} doit être ${e}`,
    tooSmallText: (f, n) => `${f} doit contenir au moins ${n} caractères`,
    tooSmallNumber: (f, n) => `${f} doit être au minimum ${n}`,
    tooSmallList: (f, n) => `${f} doit contenir au moins ${n} élément(s)`,
    tooBigText: (f, n) => `${f} ne peut pas dépasser ${n} caractères`,
    tooBigNumber: (f, n) => `${f} doit être au maximum ${n}`,
    tooBigList: (f, n) => `${f} ne peut pas contenir plus de ${n} élément(s)`,
    email: (f) => `${f} doit être une adresse e-mail valide`,
    url: (f) => `${f} doit être une URL valide`,
    uuid: (f) => `${f} doit être un identifiant valide`,
    format: (f) => `Le format de ${f} n'est pas valide`,
    oneOf: (f, o) => `${f} doit être l'une des valeurs suivantes : ${o}`,
    invalidValue: (f) => `${f} a une valeur non valide`,
    invalid: (f) => `${f} n'est pas valide`,
    unrecognized: (k) => `Champ(s) inattendu(s) : ${k}`,
    types: { string: "un texte", number: "un nombre", boolean: "vrai ou faux", array: "une liste", object: "un objet", date: "une date", integer: "un nombre entier" },
  },
};

/** Names of the fields people see in messages. Unknown fields are shown as a readable English-style label. */
const fieldLabels: Record<Exclude<Lang, "en">, Record<string, string>> = {
  es: {
    firstName: "El nombre", lastName: "El apellido", email: "El correo electrónico", password: "La contraseña",
    newPassword: "La nueva contraseña", currentPassword: "La contraseña actual", phoneNumber: "El teléfono",
    address: "La dirección", latitude: "La latitud", longitude: "La longitud", role: "El rol", title: "El título",
    description: "La descripción", oneTimeCode: "El código", country: "El país", city: "La ciudad", dateOfBirth: "La fecha de nacimiento",
    languages: "Los idiomas", startDate: "La fecha de inicio", endDate: "La fecha de fin", language: "El idioma", content: "El contenido",
    status: "El estado", interval: "El periodo",
  },
  fr: {
    firstName: "Le prénom", lastName: "Le nom de famille", email: "L'adresse e-mail", password: "Le mot de passe",
    newPassword: "Le nouveau mot de passe", currentPassword: "Le mot de passe actuel", phoneNumber: "Le téléphone",
    address: "L'adresse", latitude: "La latitude", longitude: "La longitude", role: "Le rôle", title: "Le titre",
    description: "La description", oneTimeCode: "Le code", country: "Le pays", city: "La ville", dateOfBirth: "La date de naissance",
    languages: "Les langues", startDate: "La date de début", endDate: "La date de fin", language: "La langue", content: "Le contenu",
    status: "Le statut", interval: "La période",
  },
};

/** "firstName" -> "First name" */
export const humanizeField = (name: string): string => {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : "Field";
};

export const fieldLabel = (name: string, lang: Lang): string => {
  if (lang === "en") return humanizeField(name);
  return fieldLabels[lang][name] ?? humanizeField(name);
};
