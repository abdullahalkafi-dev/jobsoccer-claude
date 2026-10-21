/**
 * Copy existing files from ./uploads into the configured bucket (MinIO/S3).
 *
 *   pnpm storage:migrate            -> dry run: lists what would be copied
 *   pnpm storage:migrate --apply    -> copies files
 *
 * Never deletes or changes local files, and never touches the database:
 * storage keys equal the relative paths already stored (e.g. "videos/x.mp4").
 * Files already in the bucket with the same size are skipped, so it can be re-run.
 */
import path from "path";
import { contentTypeFor } from "../shared/storage/fileStorage";
import { localStorage, storage } from "../shared/storage";

const run = async () => {
  const apply = process.argv.includes("--apply");
  if (storage === localStorage) {
    console.log("STORAGE_DRIVER is 'local' - nothing to migrate. Set STORAGE_DRIVER=s3 and the S3_* settings.");
    return;
  }

  const existing = new Map<string, number>();
  for await (const object of storage.list()) existing.set(object.key, object.size);

  let toCopy = 0;
  let skipped = 0;
  let copied = 0;
  let failed = 0;
  let bytes = 0;

  for await (const file of localStorage.list()) {
    if (path.basename(file.key).startsWith(".")) continue;
    if (existing.get(file.key) === file.size) {
      skipped++;
      continue;
    }
    toCopy++;
    bytes += file.size;
    if (!apply) {
      console.log(`would copy ${file.key} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      continue;
    }
    try {
      await storage.put(file.key, localStorage.resolve(file.key), contentTypeFor(file.key));
      copied++;
      console.log(`copied ${file.key}`);
    } catch (error: any) {
      failed++;
      console.error(`FAILED ${file.key}: ${error.message}`);
    }
  }

  console.log(
    `\n${apply ? "Copied" : "Dry run"}: ${apply ? copied : toCopy} file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB; ` +
      `already in bucket: ${skipped}; failed: ${failed}. Local files were not changed.`
  );
  if (failed > 0) process.exitCode = 1;
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
