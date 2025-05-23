import { createApi } from '@reduxjs/toolkit/query/react';
import { Tournament, CreateTournamentRequest } from '../../types/tournament';
import { baseQueryWithAuth } from './baseQueryWithAuth';

// Define a service using a base URL and expected endpoints
export const tournamentsApi = createApi({
  reducerPath: 'tournamentsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Tournaments'],
  endpoints: (builder) => ({
    getTournaments: builder.query<Tournament[], void>({
      query: () => 'tournaments',
      providesTags: ['Tournaments'],
    }),
    getTournamentById: builder.query<Tournament, string>({
      query: (id) => `tournaments/${id}`,
    }),
    createTournament: builder.mutation<Tournament, CreateTournamentRequest>({
      query: (tournament) => ({
        url: 'tournaments',
        method: 'POST',
        body: tournament,
      }),
      // Invalidate the getTournaments query to trigger a refetch
      invalidatesTags: ['Tournaments'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTournamentsQuery,
  useGetTournamentByIdQuery,
  useCreateTournamentMutation,
} = tournamentsApi;
