export interface ExperienceData {
  _id?: string;
  id?: string;
  title: string;
  employmentType: string;
  club: string;
  location: string;
  isCurrentlyWorking: boolean;
  startMonth: string;
  startYear: string | number;
  endMonth?: string;
  endYear?: string | number;
  description: string;
}
