import { Schema } from "mongoose";
import { appEvents } from "./appEvents";

/**
 * Mongoose plugin: announce "profile.changed" whenever a record that feeds the
 * Profile Quality Score is created, updated or deleted (experience, education,
 * licences, CV, identity verification). The score then recalculates in the
 * background, with no change needed in any of those services.
 *
 * Usage: schema.plugin(profileChangedPlugin, "experience")
 */
export const profileChangedPlugin = (schema: Schema, reason: string): void => {
  const announce = (doc: { userId?: unknown } | null | undefined) => {
    if (doc?.userId) appEvents.emit("profile.changed", { userId: String(doc.userId), reason });
  };
  schema.post("save", announce);
  schema.post("findOneAndUpdate", announce);
  schema.post("findOneAndDelete", announce);
  schema.post("deleteOne", { document: true, query: false }, function (this: any) {
    announce(this);
  });
};
