import { z } from "zod";

const createProfessionalClubEmployerProfileDto = z.object({
    country: z.string().min(1, "Country is required"),
    address: z.string().trim().min(1, "Address is required"),
    level: z.string().trim().min(1, "Level is required"),
    founded: z.string().trim().min(1, "Founded is required"),
    website: z.string().trim().min(1, "Website is required"),
    socialMedia: z.string().trim().min(1, "Social media is required").optional(),
    phoneNumber: z.string().trim().min(1, "Phone number is required").optional(),
    clubName: z.string().trim().min(1, "Club name is required"),
    clubContact: z.string().trim().min(1, "Club contact is required"),
    clubDescription: z.string().trim().min(1, "Club description is required"),
});

const updateProfessionalClubEmployerProfileDto = createProfessionalClubEmployerProfileDto.partial();

export type TCreateProfessionalClubEmployerProfileDto = z.infer<
    typeof createProfessionalClubEmployerProfileDto
>;
export type TUpdateProfessionalClubEmployerProfileDto = z.infer<
    typeof updateProfessionalClubEmployerProfileDto
>;

export const ProfessionalClubEmployerProfileDto = {
    createProfessionalClubEmployerProfileDto,
    updateProfessionalClubEmployerProfileDto,
};
