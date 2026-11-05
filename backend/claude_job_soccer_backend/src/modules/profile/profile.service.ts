import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { getProfileEntry } from "./profile.registry";
import { appEvents } from "../../shared/events/appEvents";
import redisOperations from "../../shared/redis/redisClient";
import { unlinkFileSync } from "../../shared/util/unlinkFile";

/** Fields that live on the User document, not on the role profile. */
const USER_LEVEL_FIELDS = ["firstName", "lastName"] as const;

const invalidateMeCache = (userId: string) => redisOperations.del(`user:${userId}:me`).catch(() => undefined);

/**
 * Create the role profile for a user (candidate or employer).
 * Videos are NOT part of this request: they are uploaded one at a time through the
 * video module, so a large file can never make the profile save fail or time out.
 */
const createProfile = async (payload: { userId: string; data: Record<string, any>; profileImage?: string | null }) => {
  const { userId, data, profileImage } = payload;

  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (user.profileId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User already has a profile. Use update instead.");
  }

  const entry = getProfileEntry(user.userType, user.role);
  if (!entry) {
    const reason = user.userType === "admin" ? "Admin users cannot have profiles" : `Invalid ${user.userType} role: ${user.role}`;
    throw new AppError(StatusCodes.BAD_REQUEST, reason);
  }

  const validated = entry.createSchema.parse(data);
  const profile = await entry.model.create(validated);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profileId: profile._id.toString(), ...(profileImage ? { profileImage } : {}) },
    { new: true }
  );
  if (!updatedUser) throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to link the profile to the user");

  await invalidateMeCache(userId);
  appEvents.emit("profile.changed", { userId, reason: "profile-created" });
  return { user: updatedUser, profileId: profile._id.toString() };
};

/** Update the role profile, and the user-level name / images when given. */
const updateProfile = async (payload: {
  userId: string;
  data: Record<string, any>;
  profileImage?: string | null;
  bannerImage?: string | null;
}) => {
  const { userId, data, profileImage, bannerImage } = payload;

  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (!user.profileId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User does not have a profile. Use create profile instead.");
  }

  const entry = getProfileEntry(user.userType, user.role);
  if (!entry) throw new AppError(StatusCodes.BAD_REQUEST, `Profiles are not available for ${user.userType} users`);

  // Split user-level fields from role-profile fields. The e-mail cannot change here.
  const profileData: Record<string, any> = { ...data };
  delete profileData.email;
  const userUpdate: Record<string, any> = {};
  for (const field of USER_LEVEL_FIELDS) {
    if (field in profileData) {
      userUpdate[field] = profileData[field];
      delete profileData[field];
    }
  }

  const validated = entry.updateSchema.parse(profileData);
  const updatedProfile = await entry.model.findByIdAndUpdate(user.profileId, validated, { new: true, runValidators: true });
  if (!updatedProfile) throw new AppError(StatusCodes.NOT_FOUND, "Profile not found");

  if (profileImage) {
    if (user.profileImage) unlinkFileSync(user.profileImage);
    userUpdate.profileImage = profileImage;
  }
  if (bannerImage) {
    if (user.bannerImage) unlinkFileSync(user.bannerImage);
    userUpdate.bannerImage = bannerImage;
  }

  const updatedUser = Object.keys(userUpdate).length
    ? await User.findByIdAndUpdate(userId, userUpdate, { new: true })
    : await User.findById(userId);
  if (!updatedUser) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  await invalidateMeCache(userId);
  appEvents.emit("profile.changed", { userId, reason: "profile-updated" });
  return { user: updatedUser, profile: updatedProfile };
};

/** The raw profile document for a user, or null (used by getMe, search and the AI modules). */
const getProfileOf = async (user: { userType: string; role: string; profileId?: unknown }) => {
  if (!user.profileId) return null;
  const entry = getProfileEntry(user.userType, user.role);
  return entry ? entry.model.findById(user.profileId).lean() : null;
};

export const ProfileService = { createProfile, updateProfile, getProfileOf };
