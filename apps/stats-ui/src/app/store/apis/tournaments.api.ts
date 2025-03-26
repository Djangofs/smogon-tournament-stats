import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { environment } from '../../../environments/environment';

export type Tournament = {
  id: string;
  name: string;
};

export type CreateTournamentRequest = {
  name: string;
  sheetName: string;
  sheetId: string;
};

// Define a service using a base URL and expected endpoints
export const tournamentsApi = createApi({
  reducerPath: 'tournamentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: environment.apiUrl }),
  tagTypes: ['Tournaments'],
  endpoints: (builder) => ({
    getTournaments: builder.query<Tournament[], void>({
      query: () => `tournaments`,
      providesTags: ['Tournaments'],
    }),
    createTournament: builder.mutation<Tournament, CreateTournamentRequest>({
      query: (data) => ({
        url: 'tournament',
        method: 'POST',
        body: data,
      }),
      // Invalidate the getTournaments query to trigger a refetch
      invalidatesTags: ['Tournaments'],
    }),
  }),
});

// Export hooks for usage in components
export const { useGetTournamentsQuery, useCreateTournamentMutation } =
  tournamentsApi;
