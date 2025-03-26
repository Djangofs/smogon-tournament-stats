import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { environment } from '../../../environments/environment';

export interface Tournament {
  id: string;
  name: string;
  isOfficial: boolean;
  isTeam: boolean;
  createdAt: string;
  updatedAt: string;
  rounds?: Round[];
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerMatch {
  playerId: string;
  matchId: string;
  tournament_teamId: string;
  winner: boolean;
  createdAt: string;
  updatedAt: string;
  player: Player;
}
export interface Round {
  id: string;
  name: string;
  matches?: Match[];
}

export interface Match {
  id: string;
  players: PlayerMatch[];
  result: string;
}

export interface CreateTournamentRequest {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial?: boolean;
  isTeam?: boolean;
}

// Define a service using a base URL and expected endpoints
export const tournamentsApi = createApi({
  reducerPath: 'tournamentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: environment.apiUrl }),
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
        url: 'tournament',
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
