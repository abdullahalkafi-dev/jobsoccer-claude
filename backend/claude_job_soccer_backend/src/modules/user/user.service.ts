import { StatusCodes } from "http-status-codes";
import type { Lang } from "../../shared/i18n";
import { rememberUserLang } from "../../shared/i18n/languageMiddleware";
import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { unlinkFileSync } from "../../shared/util/unlinkFile";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";
import redisOperations from "../../shared/redis/redisClient";
import { ProfileService } from "../profile/profile.service";
import { qualityFor } from "../profileQuality/profileQuality.view";
import { hideVerificationDetails } from "../credentialVerification/credentialVerification.fields";
import { Subscription } from "../subscription/subscription.model";
import { CandidateEducationService } from "../candidateEducation/candidateEducation.service";
import { CandidateExperienceService } from "../candidateExperience/candidateExperience.service";
import { CandidateLicensesAndCertificationService } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.service";
import { AdminVerificationService } from "../adminVerification/adminVerification.service";

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(["firstName", "lastName", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { result, meta };
};
const getUserById = async (userId: string, viewerId?: string, lang: Lang = "en") => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  // The role profile (candidate or employer) comes from the profile registry.
  const profile: any = await ProfileService.getProfileOf(user);
  const educations = await CandidateEducationService.getAllEducationsByUser(
    userId
  );
  const experiences = await CandidateExperienceService.getAllExperiencesByUser(
    userId
  );
  const certifications =
    await CandidateLicensesAndCertificationService.getAllLicensesAndCertificationsByUser(
      userId
    );
  // Only the owner sees the score breakdown, tips and consent record; everyone else gets stars and level.
  const { profileQuality, videoConsent, ...publicUser } = user;
  const isOwner = viewerId === String(user._id);
  const viewer = { id: viewerId };
  return {
    ...publicUser,
    profileQuality: qualityFor(profileQuality as any, user._id, viewerId, lang),
    ...(isOwner ? { videoConsent } : {}),
    profile,
    educations: hideVerificationDetails(educations as object[], userId, viewer),
    experiences: hideVerificationDetails(experiences as object[], userId, viewer),
    certifications: hideVerificationDetails(certifications as object[], userId, viewer),
  };
};
const updateUser = async (id: string, updateData: any) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (updateData.profileImage && user.profileImage) {
    unlinkFileSync(user.profileImage);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User update failed");
  }

  await redisOperations.del(`user:${id}:me`);

  return updatedUser;
};
const updateUserActivationStatus = async (
  id: string,
  status: "active" | "delete"
) => {

  const user = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true }
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  
  await redisOperations.del(`user:${id}:me`); // Invalidate cache for this user
  
  return user;
};
const updateUserRole = async (id: string, role: "USER" | "ADMIN") => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true }
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  await redisOperations.del(`user:${id}:me`); // Invalidate cache for this user
  
  return user;
};

/** Save the user's language. Everything sent to them later (messages, emails, notifications) uses it. */
const updateLanguage = async (userId: string, language: Lang) => {
  const user = await User.findByIdAndUpdate(userId, { $set: { language } }, { new: true }).select("language").lean();
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  rememberUserLang(userId, language);
  await redisOperations.del(`user:${userId}:me`); // the cached /me includes the language
  return { language: user.language };
};

const getMe = async (userId: string): Promise<any> => {
  // Check Redis cache first
  const cacheKey = `user:${userId}:me`;
  const cached = await redisOperations.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query the database using lean with virtuals enabled.
  const user = await User.findById(userId).lean({
    virtuals: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  // Get subscription details
  let subscriptionInfo = null;
  if (user.activeSubscriptionId) {
    const subscription = await Subscription.findById(
      user.activeSubscriptionId
    ).lean();
    if (subscription) {
      const isActive =
        subscription.status === "active" &&
        subscription.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd) > new Date();

      subscriptionInfo = {
        hasActiveSubscription: isActive,
        interval: subscription.interval,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        remainingDays: subscription.currentPeriodEnd
          ? Math.max(
              0,
              Math.ceil(
                (new Date(subscription.currentPeriodEnd).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0,
      };
    }
  }

  // The role profile (candidate or employer) comes from the profile registry.
  const profile: any = await ProfileService.getProfileOf(user);
  const educations = await CandidateEducationService.getAllEducationsByUser(
    userId
  );
  const experiences = await CandidateExperienceService.getAllExperiencesByUser(
    userId
  );
  const certifications =
    await CandidateLicensesAndCertificationService.getAllLicensesAndCertificationsByUser(
      userId
    );
  const adminVerificationStatus =
    await AdminVerificationService.getUserVerificationStatus(userId);

  const result = {
    ...user,
    // Older accounts have no saved language yet
    language: user.language ?? "en",
    profile,
    educations,
    experiences,
    certifications,
    subscription: subscriptionInfo,
    adminVerificationStatus: adminVerificationStatus,
  };

  // Cache the result for 5 minutes
  await redisOperations.set(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
  updateLanguage,
  getMe,
};
