/**
 * multer hands us the uploaded name decoded as latin1 ("JosÃ©" instead of "José"). Turn it back
 * into the text the visitor's browser sent. Text that is already proper (a JSON body, or
 * anything with characters above U+00FF, or bytes that are not valid UTF-8) is left alone.
 */
export const decodeUploadedName = (name: string): string => {
  if (!name || !/[\u0080-ÿ]/.test(name) || /[^\u0000-ÿ]/.test(name)) return name;
  const decoded = Buffer.from(name, "latin1").toString("utf8");
  return decoded.includes("�") ? name : decoded;
};

/** A safe ASCII slug for the stored file name: "Résumé de José.pdf" -> "resume-de-jose". */
export const toSafeSlug = (text: string): string => {
  const slug = text
    .replace(/[œŒ]/g, "oe")
    .replace(/[æÆ]/g, "ae")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "file";
};

const newFileName = (
  file: { originalname: string },
  path: { parse: (filename: string) => { name: string } }
): string => {
  const date = new Date();
  const formattedDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  // The stored name is plain ASCII; the readable original name stays wherever it is displayed.
  const originalNameWithoutExt = path.parse(decodeUploadedName(file.originalname)).name;
  const fileName =
    toSafeSlug(originalNameWithoutExt) +
    "-" +
    randomCode() +
    "-" +
    formattedDate;

  return fileName;
};
const randomCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default newFileName;
