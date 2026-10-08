import { baseApi } from "@/redux/api/baseApi";

const employerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployers: builder.query({
      query: (filters) => ({
        url: "/employer/search",
        method: "GET",
        params: filters,
      }),
    }),
    getEmployerById: builder.query({
      query: (id) => ({
        url: `/employer/${id}`,
        method: "GET",
      }),
    }),
    getEmployerFeatured: builder.query({
      query: () => ({
        url: "/employer/featured",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetEmployersQuery, useGetEmployerByIdQuery, useGetEmployerFeaturedQuery } = employerApi;
