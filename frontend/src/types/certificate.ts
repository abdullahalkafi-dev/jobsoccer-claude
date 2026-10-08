export interface CertificateData {
  _id?: string;
  name: string;
  issuingOrganization: string;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCertificateRequest {
  name: string;
  issuingOrganization: string;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}
