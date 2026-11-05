import { z } from "zod";

const createAgentEmployerProfileDto = z.object({
    companyName: z.string().trim().min(1, "Company name is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    country: z.string().min(1, "Country is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    socialMedia: z.string().trim().min(1, "Social media is required").optional(),
    website: z.string().trim().min(1, "Website is required"),
    fifaLicenseNumber: z.string().trim().min(1, "FIFA license number is required"),
});

const updateAgentEmployerProfileDto = createAgentEmployerProfileDto.partial();

export type TCreateAgentEmployerProfileDto = z.infer<typeof createAgentEmployerProfileDto>;
export type TUpdateAgentEmployerProfileDto = z.infer<typeof updateAgentEmployerProfileDto>;

export const AgentEmployerProfileDto = {
    createAgentEmployerProfileDto,
    updateAgentEmployerProfileDto,
};
