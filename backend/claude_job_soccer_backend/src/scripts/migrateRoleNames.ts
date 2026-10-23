/**
 * One-time clean-up of stored role names (2026-10-23, names confirmed by the client).
 *
 *   node dist/scripts/migrateRoleNames.js                       dry run: only lists what would change
 *   node dist/scripts/migrateRoleNames.js --apply --confirm-db <database name>
 *   node dist/scripts/migrateRoleNames.js --restore <backup file>   undo a previous --apply
 *
 * - Only the `position` field of on-field and office staff profiles is changed.
 * - --apply first writes the full old documents to a backup file (./logs/role-migration-*.json).
 * - Safe to run twice: only documents that still hold an old name are touched.
 * - --confirm-db must match the connected database name, so a wrong .env cannot be applied by accident.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import config from "../config";

type Change = { collection: string; map: Record<string, string> };

const CHANGES: Change[] = [
  {
    collection: "onfieldstaffcans",
    map: {
      "GK Coach": "Goalkeeper Coach",
      "Video Analyst Coach": "Video Analyst",
      "Specific Forward Coach": "Attacking Coach",
      "Specific Offensive Coach": "Attacking Coach",
      "Specific Defensive Coach": "Defensive Coach",
      "Specific Technical Coach": "Technical Development Coach",
    },
  },
  {
    // The four removed office roles have no direct match; mapped to the nearest new role (approved by the developer).
    collection: "officestaffcans",
    map: {
      "Medical Staff": "Nutritionist",
      "Performance Staff": "Data Analyst",
      "Equipment Staff": "Team Manager",
      Sales: "Digital Marketing",
    },
  },
];

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const has = (name: string) => process.argv.includes(name);

const main = async () => {
  if (!config.database_url) throw new Error("DATABASE_URL is not set");
  await mongoose.connect(config.database_url);
  const db = mongoose.connection.db!;
  const dbName = mongoose.connection.name;
  console.log(`Connected: host=${mongoose.connection.host} database=${dbName}`);

  const restoreFile = arg("--restore");
  if (restoreFile) {
    const backup = JSON.parse(fs.readFileSync(restoreFile, "utf8")) as {
      database: string;
      docs: { collection: string; _id: string; position: string }[];
    };
    if (backup.database !== dbName) throw new Error(`Backup is for "${backup.database}", connected to "${dbName}". Abort.`);
    for (const d of backup.docs) {
      await db.collection(d.collection).updateOne({ _id: new mongoose.Types.ObjectId(d._id) }, { $set: { position: d.position } });
    }
    console.log(`Restored ${backup.docs.length} documents from ${restoreFile}`);
    return;
  }

  const plan: { collection: string; _id: mongoose.Types.ObjectId; from: string; to: string }[] = [];
  const full: Record<string, unknown>[] = [];
  for (const change of CHANGES) {
    const docs = await db
      .collection(change.collection)
      .find({ position: { $in: Object.keys(change.map) } })
      .toArray();
    for (const doc of docs) {
      plan.push({ collection: change.collection, _id: doc._id, from: doc.position, to: change.map[doc.position] });
      full.push({ collection: change.collection, ...doc });
    }
  }

  console.log(plan.length === 0 ? "Nothing to change." : `${plan.length} document(s) to change:`);
  plan.forEach((p) => console.log(`  ${p.collection} ${p._id}: "${p.from}" -> "${p.to}"`));
  if (!has("--apply")) {
    console.log("Dry run only. Nothing was written.");
    return;
  }
  if (arg("--confirm-db") !== dbName) throw new Error(`--confirm-db must equal the connected database name ("${dbName}"). Abort, nothing written.`);
  if (plan.length === 0) return;

  const dir = path.join(process.cwd(), "logs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `role-migration-${dbName}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ database: dbName, createdAt: new Date().toISOString(), docs: plan.map((p) => ({ collection: p.collection, _id: String(p._id), position: p.from })), fullDocuments: full }, null, 2)
  );
  console.log(`Backup written: ${file}`);

  for (const p of plan) {
    await db.collection(p.collection).updateOne({ _id: p._id, position: p.from }, { $set: { position: p.to } });
  }
  console.log(`Updated ${plan.length} document(s). Undo with: node dist/scripts/migrateRoleNames.js --restore "${file}"`);
};

main()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
