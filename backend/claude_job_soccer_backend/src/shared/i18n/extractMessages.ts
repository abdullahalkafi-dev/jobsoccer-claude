/**
 * Developer helper (used by the coverage test and `pnpm i18n:check`, never by the app).
 * Finds every literal user-facing message in the source:
 *   - AppError(status, "message" ...) / new ApiError(...)
 *   - sendResponse(res, { ... message: "..." ... })
 * Template literals become patterns: `${job.title}` -> "{title}" (name of the last identifier).
 */
import fs from "fs";
import path from "path";

export type TFound = { key: string; file: string; line: number; dynamic: boolean };

const SKIP_DIRS = new Set(["node_modules", "i18n", "e2e"]);

export const listSourceFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...listSourceFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith(".ts") && entry.name !== "AppError.ts" && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".d.ts")) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
};

/** Reads one string/template literal starting at src[i] (a quote). Returns the pattern text and end index. */
const readLiteral = (src: string, i: number): { text: string; end: number } => {
  const quote = src[i];
  let text = "";
  let j = i + 1;
  const used: Record<string, number> = {};
  while (j < src.length && src[j] !== quote) {
    if (src[j] === "\\") {
      const next = src[j + 1];
      text += next === "n" ? "\n" : next;
      j += 2;
      continue;
    }
    if (quote === "`" && src[j] === "$" && src[j + 1] === "{") {
      let depth = 1;
      let k = j + 2;
      while (k < src.length && depth > 0) {
        if (src[k] === "{") depth++;
        else if (src[k] === "}") depth--;
        k++;
      }
      const expr = src.slice(j + 2, k - 1);
      const idents = expr.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? ["value"];
      const skip = new Set(["toLowerCase", "toUpperCase", "toString", "toFixed", "String", "Number", "length", "join", "name_"]);
      const filtered = idents.filter((x) => !skip.has(x));
      let name = filtered[filtered.length - 1] ?? "value";
      used[name] = (used[name] ?? 0) + 1;
      if (used[name] > 1) name += used[name];
      text += `{${name}}`;
      j = k;
      continue;
    }
    text += src[j];
    j++;
  }
  return { text, end: j + 1 };
};

/** Splits the argument list that starts right after "(" into top-level argument source ranges. */
const readArgs = (src: string, start: number): { args: string[]; offsets: number[] } => {
  const args: string[] = [];
  const offsets: number[] = [];
  let depth = 0;
  let argStart = start;
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = readLiteral(src, i).end;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 2;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) {
        args.push(src.slice(argStart, i));
        offsets.push(argStart);
        return { args, offsets };
      }
      depth--;
    } else if (c === "," && depth === 0) {
      args.push(src.slice(argStart, i));
      offsets.push(argStart);
      argStart = i + 1;
    }
    i++;
  }
  return { args, offsets };
};

/** "a" + `b ${x}` -> "ab {x}". Returns null if the expression is not made of literals only. */
const evalConcat = (expr: string): string | null => {
  let i = 0;
  let text = "";
  let seen = false;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c) || c === "+") {
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const lit = readLiteral(expr, i);
      text += lit.text;
      seen = true;
      i = lit.end;
      continue;
    }
    return null;
  }
  return seen ? text : null;
};

/** All plain literals inside an expression (used for ternaries: cond ? "a" : "b"). */
const allLiterals = (expr: string): string[] => {
  const out: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === '"' || c === "'" || c === "`") {
      const lit = readLiteral(expr, i);
      out.push(lit.text);
      i = lit.end;
    } else i++;
  }
  return out;
};

const lineOf = (src: string, idx: number) => src.slice(0, idx).split("\n").length;

export const extractMessages = (rootDir: string): { found: TFound[]; nonLiteral: TFound[] } => {
  const found: TFound[] = [];
  const nonLiteral: TFound[] = [];
  for (const file of listSourceFiles(rootDir)) {
    const src = fs.readFileSync(file, "utf8");
    const rel = path.relative(rootDir, file).split(path.sep).join("/");

    const callRe = /\b(?:new\s+)?(AppError|ApiError)\(/g;
    let m: RegExpExecArray | null;
    while ((m = callRe.exec(src))) {
      // skip the class declaration / import lines
      const before = src.slice(Math.max(0, m.index - 20), m.index);
      if (/class\s+$/.test(before)) continue;
      const { args, offsets } = readArgs(src, m.index + m[0].length);
      if (args.length < 2) continue;
      const text = evalConcat(args[1]);
      const line = lineOf(src, offsets[1]);
      if (text === null && args[1].includes("?")) {
        for (const lit of allLiterals(args[1])) found.push({ key: lit, file: rel, line, dynamic: /\{[A-Za-z0-9_]+\}/.test(lit) });
      } else if (text === null) nonLiteral.push({ key: args[1].trim(), file: rel, line, dynamic: true });
      else found.push({ key: text, file: rel, line, dynamic: /\{[A-Za-z0-9_]+\}/.test(text) });
    }

    const respRe = /\bsendResponse\(/g;
    while ((m = respRe.exec(src))) {
      const { args, offsets } = readArgs(src, m.index + m[0].length);
      const obj = args[1];
      if (!obj) continue;
      const mm = /(^|[\s,{])message\s*:\s*/.exec(obj);
      if (!mm) continue;
      const exprStart = mm.index + mm[0].length;
      const sub = readArgs(obj, exprStart); // reads until the "," or "}" that ends the property
      const text = evalConcat(sub.args[0] ?? "");
      const line = lineOf(src, offsets[1] + exprStart);
      const subExpr = sub.args[0] ?? "";
      if (text === null && subExpr.includes("?")) {
        for (const lit of allLiterals(subExpr)) found.push({ key: lit, file: rel, line, dynamic: /\{[A-Za-z0-9_]+\}/.test(lit) });
      } else if (text === null && /^\s*[A-Za-z_.]+\.message\s*$/.test(subExpr)) {
        // a message produced by a service: that literal is found by the service scan below
      } else if (text === null) nonLiteral.push({ key: subExpr.trim(), file: rel, line, dynamic: true });
      else found.push({ key: text, file: rel, line, dynamic: /\{[A-Za-z0-9_]+\}/.test(text) });
    }

    // Services that return { message: "..." } to their controller.
    if (file.endsWith(".service.ts")) {
      const msgRe = /\bmessage\s*:\s*(?=["'`])/g;
      while ((m = msgRe.exec(src))) {
        const sub = readArgs(src, m.index + m[0].length);
        const text = evalConcat(sub.args[0] ?? "");
        if (text !== null) found.push({ key: text, file: rel, line: lineOf(src, m.index), dynamic: /\{[A-Za-z0-9_]+\}/.test(text) });
      }
    }
  }
  return { found, nonLiteral };
};
