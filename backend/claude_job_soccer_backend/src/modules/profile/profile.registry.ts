import { ZodType } from "zod";
import { Model } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";

import { AmateurPlayerProfileDto } from "../candidate/amateurPlayerProfile/amateurPlayerProfile.dto";
import { AmateurPlayerProfile } from "../candidate/amateurPlayerProfile/amateurPlayerProfile.model";
import { CollegeUniversityPlayerProfileDto } from "../candidate/collegeUniversityPlayerProfile/collegeUniversityPlayerProfile.dto";
import { CollegeUniversityPlayerProfile } from "../candidate/collegeUniversityPlayerProfile/collegeUniversityPlayerProfile.model";
import { HighSchoolPlayerProfileDto } from "../candidate/highSchoolPlayerProfile/highSchoolPlayerProfile.dto";
import { HighSchoolPlayerProfile } from "../candidate/highSchoolPlayerProfile/highSchoolPlayerProfile.model";
import { OfficeStaffProfileDto } from "../candidate/officeStaffProfile/officeStaffProfile.dto";
import { OfficeStaffProfile } from "../candidate/officeStaffProfile/officeStaffProfile.model";
import { OnFieldStaffProfileDto } from "../candidate/onFieldStaffProfile/onFieldStaffProfile.dto";
import { OnFieldStaffProfile } from "../candidate/onFieldStaffProfile/onFieldStaffProfile.model";
import { ProfessionalPlayerProfileDto } from "../candidate/professionalPlayerProfile/professionalPlayerProfile.dto";
import { ProfessionalPlayerProfile } from "../candidate/professionalPlayerProfile/professionalPlayerProfile.model";

import { AcademyEmployerProfileDto } from "../employer/academyEmployerProfile/academyEmployerProfile.dto";
import { AcademyEmployerProfile } from "../employer/academyEmployerProfile/academyEmployerProfile.model";
import { AgentEmployerProfileDto } from "../employer/agentEmployerProfile/agentEmployerProfile.dto";
import { AgentEmployerProfile } from "../employer/agentEmployerProfile/agentEmployerProfile.model";
import { AmateurClubEmployerProfileDto } from "../employer/amateurClubEmployerProfile/amateurClubEmployerProfile.dto";
import { AmateurClubEmployerProfile } from "../employer/amateurClubEmployerProfile/amateurClubEmployerProfile.model";
import { CollegeUniversityEmployerProfileDto } from "../employer/collegeUniversityEmployerProfile/collegeUniversityEmployerProfile.dto";
import { CollegeUniversityEmployerProfile } from "../employer/collegeUniversityEmployerProfile/collegeUniversityEmployerProfile.model";
import { ConsultingCompanyEmployerProfileDto } from "../employer/consultingCompanyEmployerProfile/consultingCompanyEmployerProfile.dto";
import { ConsultingCompanyEmployerProfile } from "../employer/consultingCompanyEmployerProfile/consultingCompanyEmployerProfile.model";
import { HighSchoolEmployerProfileDto } from "../employer/highSchoolEmployerProfile/highSchoolEmployerProfile.dto";
import { HighSchoolEmployerProfile } from "../employer/highSchoolEmployerProfile/highSchoolEmployerProfile.model";
import { ProfessionalClubEmployerProfileDto } from "../employer/professionalClubEmployerProfile/professionalClubEmployerProfile.dto";
import { ProfessionalClubEmployerProfile } from "../employer/professionalClubEmployerProfile/professionalClubEmployerProfile.model";

/**
 * One entry per role: the Mongoose model and the validators for create/update.
 * Create and update flows look the role up here instead of repeating a
 * `switch` with 13 branches in every function.
 */
export type TProfileEntry = {
  model: Model<any>;
  createSchema: ZodType<any>;
  updateSchema: ZodType<any>;
};

const CANDIDATE_PROFILES: Record<CandidateRole, TProfileEntry> = {
  [CandidateRole.AMATEUR_PLAYER]: {
    model: AmateurPlayerProfile,
    createSchema: AmateurPlayerProfileDto.createAmateurPlayerProfileDto,
    updateSchema: AmateurPlayerProfileDto.updateAmateurPlayerProfileDto,
  },
  [CandidateRole.PROFESSIONAL_PLAYER]: {
    model: ProfessionalPlayerProfile,
    createSchema: ProfessionalPlayerProfileDto.createProfessionalPlayerProfileDto,
    updateSchema: ProfessionalPlayerProfileDto.updateProfessionalPlayerProfileDto,
  },
  [CandidateRole.HIGH_SCHOOL]: {
    model: HighSchoolPlayerProfile,
    createSchema: HighSchoolPlayerProfileDto.createHighSchoolPlayerProfileDto,
    updateSchema: HighSchoolPlayerProfileDto.updateHighSchoolPlayerProfileDto,
  },
  [CandidateRole.COLLEGE_UNIVERSITY]: {
    model: CollegeUniversityPlayerProfile,
    createSchema: CollegeUniversityPlayerProfileDto.createCollegeUniversityPlayerProfileDto,
    updateSchema: CollegeUniversityPlayerProfileDto.updateCollegeUniversityPlayerProfileDto,
  },
  [CandidateRole.ON_FIELD_STAFF]: {
    model: OnFieldStaffProfile,
    createSchema: OnFieldStaffProfileDto.createOnFieldStaffProfileDto,
    updateSchema: OnFieldStaffProfileDto.updateOnFieldStaffProfileDto,
  },
  [CandidateRole.OFFICE_STAFF]: {
    model: OfficeStaffProfile,
    createSchema: OfficeStaffProfileDto.createOfficeStaffProfileDto,
    updateSchema: OfficeStaffProfileDto.updateOfficeStaffProfileDto,
  },
};

const EMPLOYER_PROFILES: Record<EmployerRole, TProfileEntry> = {
  [EmployerRole.ACADEMY]: {
    model: AcademyEmployerProfile,
    createSchema: AcademyEmployerProfileDto.createAcademyEmployerProfileDto,
    updateSchema: AcademyEmployerProfileDto.updateAcademyEmployerProfileDto,
  },
  [EmployerRole.AGENT]: {
    model: AgentEmployerProfile,
    createSchema: AgentEmployerProfileDto.createAgentEmployerProfileDto,
    updateSchema: AgentEmployerProfileDto.updateAgentEmployerProfileDto,
  },
  [EmployerRole.AMATEUR_CLUB]: {
    model: AmateurClubEmployerProfile,
    createSchema: AmateurClubEmployerProfileDto.createAmateurClubEmployerProfileDto,
    updateSchema: AmateurClubEmployerProfileDto.updateAmateurClubEmployerProfileDto,
  },
  [EmployerRole.COLLEGE_UNIVERSITY]: {
    model: CollegeUniversityEmployerProfile,
    createSchema: CollegeUniversityEmployerProfileDto.createCollegeUniversityEmployerProfileDto,
    updateSchema: CollegeUniversityEmployerProfileDto.updateCollegeUniversityEmployerProfileDto,
  },
  [EmployerRole.CONSULTING_COMPANY]: {
    model: ConsultingCompanyEmployerProfile,
    createSchema: ConsultingCompanyEmployerProfileDto.createConsultingCompanyEmployerProfileDto,
    updateSchema: ConsultingCompanyEmployerProfileDto.updateConsultingCompanyEmployerProfileDto,
  },
  [EmployerRole.HIGH_SCHOOL]: {
    model: HighSchoolEmployerProfile,
    createSchema: HighSchoolEmployerProfileDto.createHighSchoolEmployerProfileDto,
    updateSchema: HighSchoolEmployerProfileDto.updateHighSchoolEmployerProfileDto,
  },
  [EmployerRole.PROFESSIONAL_CLUB]: {
    model: ProfessionalClubEmployerProfile,
    createSchema: ProfessionalClubEmployerProfileDto.createProfessionalClubEmployerProfileDto,
    updateSchema: ProfessionalClubEmployerProfileDto.updateProfessionalClubEmployerProfileDto,
  },
};

/** The profile entry for a user's role, or null when the role has no profile (admin / unknown). */
export const getProfileEntry = (userType: string, role: string): TProfileEntry | null => {
  if (userType === "candidate") return CANDIDATE_PROFILES[role as CandidateRole] ?? null;
  if (userType === "employer") return EMPLOYER_PROFILES[role as EmployerRole] ?? null;
  return null;
};
