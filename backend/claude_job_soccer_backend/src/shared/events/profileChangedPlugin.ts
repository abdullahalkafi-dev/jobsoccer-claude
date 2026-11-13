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
/**
 * The user's id, whether `userId` is a plain id or a populated user document.
 * (An update that ends in .populate("userId") hands the hook a document: String() of it is not an id,
 * which silently skipped the recalculation, e.g. after an admin approved an identity check.)
 */
export const userIdOf = (value: unknown): string | null => {
  if (!value) return null;
  const populated = (value as { _id?: unknown })._id;
  const id = String(populated ?? value);
  return /^[a-f\d]{24}$/i.test(id) ? id : null;
};

export const profileChangedPlugin = (schema: Schema, reason: string): void => {
  const announce = (doc: { userId?: unknown } | null | undefined) => {
    const userId = userIdOf(doc?.userId);
    if (userId) appEvents.emit("profile.changed", { userId, reason });
  };
  schema.post("save", announce);
  schema.post("findOneAndUpdate", announce);
  schema.post("findOneAndDelete", announce);
  schema.post("deleteOne", { document: true, query: false }, function (this: any) {
    announce(this);
  });
};
