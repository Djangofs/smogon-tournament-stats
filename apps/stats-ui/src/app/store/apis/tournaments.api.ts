import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { environment } from '../../../environments/environment';

export type Tournament = {
  id: string;
  name: string;
};

// Define a service using a base URL and expected endpoints
export const tournamentsApi = createApi({
  reducerPath: 'tournamentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: environment.apiUrl }),
  endpoints: (builder) => ({
    getTournaments: builder.query<Tournament[], void>({
      query: () => `tournaments`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetTournamentsQuery } = tournamentsApi;
