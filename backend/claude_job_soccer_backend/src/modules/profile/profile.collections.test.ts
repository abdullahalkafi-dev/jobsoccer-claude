import { describe, expect, it } from "vitest";
import { CandidateRole, EmployerRole } from "../user/user.interface";
import { getProfileEntry } from "./profile.registry";

/**
 * The profile models were renamed (…Can -> …Profile, …Emp -> …EmployerProfile) but the data stays
 * where it is: every model pins its original collection name. If one of these fails, a model
 * would silently start reading an empty collection.
 */
const CANDIDATE_COLLECTIONS: Record<CandidateRole, string> = {
  [CandidateRole.AMATEUR_PLAYER]: "amateurplayercans",
  [CandidateRole.PROFESSIONAL_PLAYER]: "professionalplayercans",
  [CandidateRole.HIGH_SCHOOL]: "highschoolcans",
  [CandidateRole.COLLEGE_UNIVERSITY]: "collegeoruniversitycans",
  [CandidateRole.ON_FIELD_STAFF]: "onfieldstaffcans",
  [CandidateRole.OFFICE_STAFF]: "officestaffcans",
};

const EMPLOYER_COLLECTIONS: Record<EmployerRole, string> = {
  [EmployerRole.ACADEMY]: "academyemps",
  [EmployerRole.AGENT]: "agentemps",
  [EmployerRole.AMATEUR_CLUB]: "amateurclubemps",
  [EmployerRole.COLLEGE_UNIVERSITY]: "collegeoruniversityemps",
  [EmployerRole.CONSULTING_COMPANY]: "consultingcompanyemps",
  [EmployerRole.HIGH_SCHOOL]: "highschoolemps",
  [EmployerRole.PROFESSIONAL_CLUB]: "professionalclubemps",
};

describe("profile models keep their original collections", () => {
  for (const [role, collection] of Object.entries(CANDIDATE_COLLECTIONS)) {
    it(`candidate ${role} -> ${collection}`, () => {
      expect(getProfileEntry("candidate", role)!.model.collection.name).toBe(collection);
    });
  }
  for (const [role, collection] of Object.entries(EMPLOYER_COLLECTIONS)) {
    it(`employer ${role} -> ${collection}`, () => {
      expect(getProfileEntry("employer", role)!.model.collection.name).toBe(collection);
    });
  }
});
