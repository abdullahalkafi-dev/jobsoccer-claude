import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { toStorageKey } from "./fileStorage";
import { LocalStorage } from "./localStorage";
import { S3Storage } from "./s3Storage";

describe("toStorageKey", () => {
  it("normalises stored links and absolute paths to the same key", () => {
    expect(toStorageKey("videos/a.mp4")).toBe("videos/a.mp4");
    expect(toStorageKey("/videos/a.mp4")).toBe("videos/a.mp4");
    expect(toStorageKey("C:\\app\\uploads\\videos\\a.mp4")).toBe("videos/a.mp4");
    expect(toStorageKey("/app/uploads/images/b.webp")).toBe("images/b.webp");
  });

  it("rejects keys that escape the uploads folder", () => {
    expect(() => toStorageKey("../../etc/passwd")).toThrow();
  });
});

describe("LocalStorage", () => {
  it("stores, lists and resolves files inside its root only", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "local-storage-"));
    const source = path.join(root, "..", `src-${Date.now()}.txt`);
    fs.writeFileSync(source, "hello");
    const local = new LocalStorage(root);
    await local.put("docs/a.txt", source);
    expect(await local.exists("docs/a.txt")).toBe(true);
    const keys: string[] = [];
    for await (const o of local.list()) keys.push(o.key);
    expect(keys).toEqual(["docs/a.txt"]);
    expect(() => local.resolve("../outside.txt")).toThrow();
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(source, { force: true });
  });
});

// Runs only against a local MinIO: S3_TEST_ENDPOINT=http://localhost:9000
const endpoint = process.env.S3_TEST_ENDPOINT;
describe.skipIf(!endpoint)("S3Storage against MinIO", () => {
  it("uploads, signs links, refuses unsigned access and downloads", async () => {
    const s3 = new S3Storage({
      endpoint,
      publicEndpoint: endpoint,
      region: "us-east-1",
      bucket: `jobsoccer-test-${Date.now()}`,
      accessKeyId: process.env.S3_TEST_ACCESS_KEY_ID || "jobsoccer",
      secretAccessKey: process.env.S3_TEST_SECRET_ACCESS_KEY || "jobsoccer-dev-secret",
      forcePathStyle: true,
      signedUrlTtlSeconds: 60,
    });
    const file = path.join(os.tmpdir(), `s3-test-${Date.now()}.txt`);
    fs.writeFileSync(file, "video bytes");

    await s3.put("videos/test.mp4", file, "video/mp4");
    expect(await s3.exists("videos/test.mp4")).toBe(true);
    expect(await s3.exists("videos/missing.mp4")).toBe(false);

    const signed = (await s3.signedUrl("videos/test.mp4"))!;
    const ok = await fetch(signed);
    expect(ok.status).toBe(200);
    expect(await ok.text()).toBe("video bytes");

    const unsigned = await fetch(signed.split("?")[0]);
    expect(unsigned.status).toBe(403);

    const copy = await s3.toLocalFile("videos/test.mp4");
    expect(fs.readFileSync(copy.path, "utf8")).toBe("video bytes");
    copy.release();
    expect(fs.existsSync(copy.path)).toBe(false);

    const listed: string[] = [];
    for await (const o of s3.list("videos/")) listed.push(o.key);
    expect(listed).toEqual(["videos/test.mp4"]);
    fs.rmSync(file, { force: true });
  }, 30_000);
});
