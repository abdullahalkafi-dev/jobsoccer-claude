import fs from "fs";
import path from "path";
import { FileStorage, StoredObject } from "./fileStorage";

/** Files on the server disk under ./uploads (the original behaviour). */
export class LocalStorage implements FileStorage {
  readonly name = "local";

  constructor(private readonly root: string) {}

  resolve(key: string): string {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root) + path.sep)) {
      throw new Error(`Key escapes the uploads folder: ${key}`);
    }
    return full;
  }

  async put(key: string, localPath: string): Promise<void> {
    const target = this.resolve(key);
    if (path.resolve(localPath) === target) return;
    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    await fs.promises.copyFile(localPath, target);
  }

  async exists(key: string): Promise<boolean> {
    return fs.existsSync(this.resolve(key));
  }

  async toLocalFile(key: string): Promise<{ path: string; release: () => void }> {
    const full = this.resolve(key);
    if (!fs.existsSync(full)) throw new Error(`File not found: ${key}`);
    return { path: full, release: () => undefined };
  }

  async signedUrl(): Promise<string | null> {
    return null;
  }

  async *list(prefix = ""): AsyncIterable<StoredObject> {
    const start = prefix ? this.resolve(prefix) : path.resolve(this.root);
    if (!fs.existsSync(start)) return;
    const stack = [start];
    while (stack.length) {
      const dir = stack.pop()!;
      for (const entry of await fs.promises.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (entry.isFile()) {
          const key = path.relative(this.root, full).replace(/\\/g, "/");
          yield { key, size: (await fs.promises.stat(full)).size };
        }
      }
    }
  }
}
