import { ZodType } from "zod";
import { Model } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";

import { AmateurPlayerCanDto } from "../candidate/amateurPlayerCan/amateurPlayerCan.dto";
import { AmateurPlayerCan } from "../candidate/amateurPlayerCan/amateurPlayerCan.model";
import { CollegeOrUniversityCanDto } from "../candidate/collegeOrUniversityCan/collegeOrUniversityCan.dto";
import { CollegeOrUniversity } from "../candidate/collegeOrUniversityCan/collegeOrUniversityCan.model";
import { HighSchoolCanDto } from "../candidate/highSchoolCan/highSchoolCan.dto";
import { HighSchoolCan } from "../candidate/highSchoolCan/highSchoolCan.model";
import { OfficeStaffCanDto } from "../candidate/officeStaffCan/officeStaffCan.dto";
import { OfficeStaffCan } from "../candidate/officeStaffCan/officeStaffCan.model";
import { OnFieldStaffCanDto } from "../candidate/onFieldStaffCan/onFieldStaffCan.dto";
import { OnFieldStaffCan } from "../candidate/onFieldStaffCan/onFieldStaffCan.model";
import { ProfessionalPlayerCanDto } from "../candidate/professionalPlayerCan/professionalPlayerCan.dto";
import { ProfessionalPlayerCan } from "../candidate/professionalPlayerCan/professionalPlayerCan.model";

import { AcademyEmpDto } from "../employer/academyEmp/academyEmp.dto";
import { AcademyEmp } from "../employer/academyEmp/academyEmp.model";
import { AgentEmpDto } from "../employer/agentEmp/agentEmp.dto";
import { AgentEmp } from "../employer/agentEmp/agentEmp.model";
import { AmateurClubEmpDto } from "../employer/amateurClubEmp/amateurClubEmp.dto";
import { AmateurClubEmp } from "../employer/amateurClubEmp/amateurClubEmp.model";
import { CollegeOrUniversityEmpDto } from "../employer/collegeOrUniversityEmp/collegeOrUniversityEmp.dto";
import { CollegeOrUniversityEmp } from "../employer/collegeOrUniversityEmp/collegeOrUniversityEmp.model";
import { ConsultingCompanyEmpDto } from "../employer/consultingCompanyEmp/consultingCompanyEmp.dto";
import { ConsultingCompanyEmp } from "../employer/consultingCompanyEmp/consultingCompanyEmp.model";
import { HighSchoolEmpDto } from "../employer/highSchoolEmp/highSchoolEmp.dto";
import { HighSchoolEmp } from "../employer/highSchoolEmp/highSchoolEmp.model";
import { ProfessionalClubEmpDto } from "../employer/professionalClubEmp/professionalClubEmp.dto";
import { ProfessionalClubEmp } from "../employer/professionalClubEmp/professionalClubEmp.model";

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
    model: AmateurPlayerCan,
    createSchema: AmateurPlayerCanDto.createAmateurPlayerCanDto,
    updateSchema: AmateurPlayerCanDto.updateAmateurPlayerCanDto,
  },
  [CandidateRole.PROFESSIONAL_PLAYER]: {
    model: ProfessionalPlayerCan,
    createSchema: ProfessionalPlayerCanDto.createProfessionalPlayerCanDto,
    updateSchema: ProfessionalPlayerCanDto.updateProfessionalPlayerCanDto,
  },
  [CandidateRole.HIGH_SCHOOL]: {
    model: HighSchoolCan,
    createSchema: HighSchoolCanDto.createHighSchoolCanDto,
    updateSchema: HighSchoolCanDto.updateHighSchoolCanDto,
  },
  [CandidateRole.COLLEGE_UNIVERSITY]: {
    model: CollegeOrUniversity,
    createSchema: CollegeOrUniversityCanDto.createCollegeOrUniversityCanDto,
    updateSchema: CollegeOrUniversityCanDto.updateCollegeOrUniversityCanDto,
  },
  [CandidateRole.ON_FIELD_STAFF]: {
    model: OnFieldStaffCan,
    createSchema: OnFieldStaffCanDto.createOnFieldStaffCanDto,
    updateSchema: OnFieldStaffCanDto.updateOnFieldStaffCanDto,
  },
  [CandidateRole.OFFICE_STAFF]: {
    model: OfficeStaffCan,
    createSchema: OfficeStaffCanDto.createOfficeStaffCanDto,
    updateSchema: OfficeStaffCanDto.updateOfficeStaffCanDto,
  },
};

const EMPLOYER_PROFILES: Record<EmployerRole, TProfileEntry> = {
  [EmployerRole.ACADEMY]: {
    model: AcademyEmp,
    createSchema: AcademyEmpDto.createAcademyEmpDto,
    updateSchema: AcademyEmpDto.updateAcademyEmpDto,
  },
  [EmployerRole.AGENT]: {
    model: AgentEmp,
    createSchema: AgentEmpDto.createAgentEmpDto,
    updateSchema: AgentEmpDto.updateAgentEmpDto,
  },
  [EmployerRole.AMATEUR_CLUB]: {
    model: AmateurClubEmp,
    createSchema: AmateurClubEmpDto.createAmateurClubEmpDto,
    updateSchema: AmateurClubEmpDto.updateAmateurClubEmpDto,
  },
  [EmployerRole.COLLEGE_UNIVERSITY]: {
    model: CollegeOrUniversityEmp,
    createSchema: CollegeOrUniversityEmpDto.createCollegeOrUniversityEmpDto,
    updateSchema: CollegeOrUniversityEmpDto.updateCollegeOrUniversityEmpDto,
  },
  [EmployerRole.CONSULTING_COMPANY]: {
    model: ConsultingCompanyEmp,
    createSchema: ConsultingCompanyEmpDto.createConsultingCompanyEmpDto,
    updateSchema: ConsultingCompanyEmpDto.updateConsultingCompanyEmpDto,
  },
  [EmployerRole.HIGH_SCHOOL]: {
    model: HighSchoolEmp,
    createSchema: HighSchoolEmpDto.createHighSchoolEmpDto,
    updateSchema: HighSchoolEmpDto.updateHighSchoolEmpDto,
  },
  [EmployerRole.PROFESSIONAL_CLUB]: {
    model: ProfessionalClubEmp,
    createSchema: ProfessionalClubEmpDto.createProfessionalClubEmpDto,
    updateSchema: ProfessionalClubEmpDto.updateProfessionalClubEmpDto,
  },
};

/** The profile entry for a user's role, or null when the role has no profile (admin / unknown). */
export const getProfileEntry = (userType: string, role: string): TProfileEntry | null => {
  if (userType === "candidate") return CANDIDATE_PROFILES[role as CandidateRole] ?? null;
  if (userType === "employer") return EMPLOYER_PROFILES[role as EmployerRole] ?? null;
  return null;
};
