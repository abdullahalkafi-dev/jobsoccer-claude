/**
 * One-time clean-up of player profile data (2026-11-22, client round).
 *
 *   node dist/scripts/migratePlayerProfileFields.js                       dry run: only lists what would change
 *   node dist/scripts/migratePlayerProfileFields.js --apply --confirm-db <database name>
 *   node dist/scripts/migratePlayerProfileFields.js --restore <backup file>   undo a previous --apply
 *
 * 1. position "Forward" -> "Striker" (Forward was removed from the choices) in the four player profile collections.
 * 2. nationalTeamCategory: one string -> a list of one (a player can have several categories) in professional and amateur players.
 *
 * - Nothing is deleted; only those two fields of documents that still hold the old shape are changed.
 * - --apply first writes the old values to a backup file (./logs/player-fields-migration-*.json).
 * - Safe to run twice. --confirm-db must match the connected database name.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import config from "../config";

const POSITION_COLLECTIONS = ["professionalplayercans", "amateurplayercans", "highschoolcans", "collegeoruniversitycans"];
const CATEGORY_COLLECTIONS = ["professionalplayercans", "amateurplayercans"];

type TPlan = { collection: string; _id: mongoose.Types.ObjectId; field: "position" | "nationalTeamCategory"; from: unknown; to: unknown };

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
    const backup = JSON.parse(fs.readFileSync(restoreFile, "utf8")) as { database: string; docs: { collection: string; _id: string; field: string; from: unknown }[] };
    if (backup.database !== dbName) throw new Error(`Backup is for "${backup.database}", connected to "${dbName}". Abort.`);
    for (const d of backup.docs) {
      await db.collection(d.collection).updateOne({ _id: new mongoose.Types.ObjectId(d._id) }, { $set: { [d.field]: d.from } });
    }
    console.log(`Restored ${backup.docs.length} change(s) from ${restoreFile}`);
    return;
  }

  const plan: TPlan[] = [];
  for (const collection of POSITION_COLLECTIONS) {
    const docs = await db.collection(collection).find({ position: "Forward" }).project({ position: 1 }).toArray();
    docs.forEach((doc) => plan.push({ collection, _id: doc._id, field: "position", from: "Forward", to: "Striker" }));
  }
  for (const collection of CATEGORY_COLLECTIONS) {
    const docs = await db.collection(collection).find({ nationalTeamCategory: { $type: "string" } }).project({ nationalTeamCategory: 1 }).toArray();
    docs.forEach((doc) =>
      plan.push({ collection, _id: doc._id, field: "nationalTeamCategory", from: doc.nationalTeamCategory, to: doc.nationalTeamCategory ? [doc.nationalTeamCategory] : [] })
    );
  }

  console.log(plan.length === 0 ? "Nothing to change." : `${plan.length} change(s):`);
  plan.forEach((p) => console.log(`  ${p.collection} ${p._id} ${p.field}: ${JSON.stringify(p.from)} -> ${JSON.stringify(p.to)}`));
  if (!has("--apply")) {
    console.log("Dry run only. Nothing was written.");
    return;
  }
  if (arg("--confirm-db") !== dbName) throw new Error(`--confirm-db must equal the connected database name ("${dbName}"). Abort, nothing written.`);
  if (plan.length === 0) return;

  const dir = path.join(process.cwd(), "logs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `player-fields-migration-${dbName}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ database: dbName, createdAt: new Date().toISOString(), docs: plan.map((p) => ({ collection: p.collection, _id: String(p._id), field: p.field, from: p.from })) }, null, 2)
  );
  console.log(`Backup written: ${file}`);

  for (const p of plan) {
    await db.collection(p.collection).updateOne({ _id: p._id, [p.field]: p.from }, { $set: { [p.field]: p.to } });
  }
  console.log(`Updated ${plan.length} change(s). Undo with: node dist/scripts/migratePlayerProfileFields.js --restore "${file}"`);
};

main()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
