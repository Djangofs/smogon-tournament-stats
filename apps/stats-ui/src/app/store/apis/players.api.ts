import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQueryWithAuth';

export interface PlayerMatch {
  id: string;
  winner: boolean | null;
  generation: string;
  tier: string;
  stage: string | null;
  year: number;
  tournamentName: string;
  opponentName: string;
  opponentId: string;
}

export interface Player {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
  deadGames: number;
  matches?: PlayerMatch[];
}

export interface GetPlayersQueryParams {
  tournamentId?: string;
  generation?: string;
  tier?: string;
  startYear?: number;
  endYear?: number;
  stage?: string;
}

export interface PlayerDetails extends Player {
  matches: PlayerMatch[];
}

// Define a service using a base URL and expected endpoints
export const playersApi = createApi({
  reducerPath: 'playersApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Players'],
  endpoints: (builder) => ({
    getPlayers: builder.query<Player[], GetPlayersQueryParams>({
      query: (params) => ({
        url: 'players',
        params,
      }),
      providesTags: ['Players'],
    }),
    getPlayerById: builder.query<PlayerDetails, string>({
      query: (id) => `players/${id}`,
    }),
  }),
});

// Export hooks for usage in components
export const { useGetPlayersQuery, useGetPlayerByIdQuery } = playersApi;
