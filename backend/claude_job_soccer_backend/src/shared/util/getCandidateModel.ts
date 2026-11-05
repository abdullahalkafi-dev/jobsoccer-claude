import { StatusCodes } from "http-status-codes";
import { AmateurPlayerProfile } from "../../modules/candidate/amateurPlayerProfile/amateurPlayerProfile.model";
import { CollegeUniversityPlayerProfile } from "../../modules/candidate/collegeUniversityPlayerProfile/collegeUniversityPlayerProfile.model";
import { HighSchoolPlayerProfile } from "../../modules/candidate/highSchoolPlayerProfile/highSchoolPlayerProfile.model";
import { OfficeStaffProfile } from "../../modules/candidate/officeStaffProfile/officeStaffProfile.model";
import { OnFieldStaffProfile } from "../../modules/candidate/onFieldStaffProfile/onFieldStaffProfile.model";
import { ProfessionalPlayerProfile } from "../../modules/candidate/professionalPlayerProfile/professionalPlayerProfile.model";
import { CandidateRole } from "../../modules/user/user.interface";
import AppError from "../../errors/AppError";

/**
 * Get candidate model based on role
 */
export const getCandidateModel = (role: any): any => {
  switch (role) {
    case CandidateRole.PROFESSIONAL_PLAYER:
      return ProfessionalPlayerProfile;
    case CandidateRole.AMATEUR_PLAYER:
      return AmateurPlayerProfile;
    case CandidateRole.HIGH_SCHOOL:
      return HighSchoolPlayerProfile;
    case "High School":
      return HighSchoolPlayerProfile;
    case CandidateRole.COLLEGE_UNIVERSITY:
      return CollegeUniversityPlayerProfile;
    case "College/University":
      return CollegeUniversityPlayerProfile;
    case CandidateRole.ON_FIELD_STAFF:
      return OnFieldStaffProfile;
    case CandidateRole.OFFICE_STAFF:
      return OfficeStaffProfile;
    default:
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid candidate role");
  }
};
