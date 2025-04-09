import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQueryWithAuth';

export interface Game {
  id: string;
  generation: string;
  tier: string;
  playedAt: string;
  replayUrl?: string;
  players: {
    player: {
      id: string;
      name: string;
    };
    winner: boolean;
  }[];
}

export interface Match {
  id: string;
  generation: string;
  tier: string;
  playedAt: string;
  stage: string | null;
  bestOf: number;
  games: Game[];
  players: {
    player: {
      id: string;
      name: string;
    };
    team: {
      id: string;
      name: string;
    };
    winner: boolean | null;
  }[];
}

export interface GetMatchesQueryParams {
  tournamentId?: string;
  playerId?: string;
}

// Define a service using a base URL and expected endpoints
export const matchesApi = createApi({
  reducerPath: 'matchesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Matches'],
  endpoints: (builder) => ({
    getMatches: builder.query<Match[], GetMatchesQueryParams>({
      query: (params) => ({
        url: 'matches',
        params,
      }),
      providesTags: ['Matches'],
    }),
    getMatchById: builder.query<Match, string>({
      query: (id) => `matches/${id}`,
    }),
  }),
});

// Export hooks for usage in components
export const { useGetMatchesQuery, useGetMatchByIdQuery } = matchesApi;
