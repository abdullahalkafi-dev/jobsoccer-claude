export interface EducationData {
  _id?: string;
  instituteName: string;
  degree: string;
  fieldOfStudy: string;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
  grade?: string;
  isCurrentlyStudying?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEducationRequest {
  instituteName: string;
  degree: string;
  fieldOfStudy: string;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
  grade?: string;
  isCurrentlyStudying?: boolean;
  description?: string;
}
