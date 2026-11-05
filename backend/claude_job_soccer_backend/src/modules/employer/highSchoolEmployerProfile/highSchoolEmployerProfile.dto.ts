import { z } from "zod";

const createHighSchoolEmployerProfileDto = z.object({
    highSchoolName: z.string().trim().min(1, "High school name is required"),
    country: z.string().min(1, "Country is required"),
    address: z.string().trim().min(1, "Address is required"),
    founded: z.string().trim().min(1, "Founded is required"),
    clubName: z.string().trim().min(1, "Club name is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required").optional(),
    location: z.string().trim().min(1, "Location is required"),
    level: z.string().trim().min(1, "Level is required"),
    website: z.string().trim().min(1, "Website is required"),
    clubContact: z.string().trim().min(1, "Club contact is required"),
    clubDescription: z.string().trim().min(1, "Club description is required"),
});

const updateHighSchoolEmployerProfileDto = createHighSchoolEmployerProfileDto.partial();

export type TCreateHighSchoolEmployerProfileDto = z.infer<typeof createHighSchoolEmployerProfileDto>;
export type TUpdateHighSchoolEmployerProfileDto = z.infer<typeof updateHighSchoolEmployerProfileDto>;

export const HighSchoolEmployerProfileDto = {
    createHighSchoolEmployerProfileDto,
    updateHighSchoolEmployerProfileDto,
};
