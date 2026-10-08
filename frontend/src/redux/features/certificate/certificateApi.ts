import { baseApi } from "../../api/baseApi";
import { CertificateData, CreateCertificateRequest } from "@/types/certificate";

export interface GetCertificatesResponse {
  success: boolean;
  data: CertificateData[];
  message?: string;
}

export interface CreateCertificateResponse {
  success: boolean;
  data: CertificateData;
  message: string;
}

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all certificates for a user
    getUserCertificates: builder.query<GetCertificatesResponse, string>({
      query: (userId) =>
        `/candidate-licenses-and-certifications/user/${userId}`,
      providesTags: ["Candidate"],
    }),

    // Create new certificate
    createCertificate: builder.mutation<
      CreateCertificateResponse,
      CreateCertificateRequest
    >({
      query: (body) => ({
        url: "/candidate-licenses-and-certifications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Update certificate
    updateCertificate: builder.mutation<
      CreateCertificateResponse,
      { id: string; body: Partial<CreateCertificateRequest> }
    >({
      query: ({ id, body }) => ({
        url: `/candidate-licenses-and-certifications/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Delete certificate
    deleteCertificate: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/candidate-licenses-and-certifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidate"],
    }),
  }),
});

export const {
  useGetUserCertificatesQuery,
  useCreateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} = certificateApi;
