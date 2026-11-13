import { describe, expect, it } from "vitest";
import { errorLogger } from "./winstonExpressLogger";

/**
 * express-winston builds the log metadata for every request (before deciding to skip it),
 * so a large raw body must stay cheap: an 8 MB upload piece crashed the backend before.
 */
describe("request logger with a large raw body", () => {
  it("handles an 8 MB Buffer body quickly and without copying it", async () => {
    const body = Buffer.alloc(8 * 1024 * 1024, 1);
    const req: any = { body, query: {}, params: {}, headers: {}, url: "/api/v1/videos/uploads/x?offset=0", originalUrl: "/api/v1/videos/uploads/x", method: "PUT", get: () => "test", httpVersionMajor: 1, httpVersionMinor: 1 };
    const listeners: Record<string, () => void> = {};
    const res: any = { statusCode: 200, getHeader: () => undefined, end: () => undefined, on: (e: string, f: () => void) => (listeners[e] = f), once: (e: string, f: () => void) => (listeners[e] = f) };
    const started = Date.now();
    await new Promise<void>((resolve) => errorLogger(req, res, () => resolve()));
    res.end();
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
