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
  aliases?: string[];
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
  aliases: string[];
}

export interface AddPlayerAliasRequest {
  playerId: string;
  alias: string;
}

export interface AddPlayerAliasResponse {
  id: string;
  name: string;
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
      providesTags: (_result, _error, id) => [{ type: 'Players', id }],
    }),
    addPlayerAlias: builder.mutation<
      AddPlayerAliasResponse,
      AddPlayerAliasRequest
    >({
      query: ({ playerId, alias }) => ({
        url: `players/${playerId}/alias`,
        method: 'POST',
        body: { playerId, alias },
      }),
      invalidatesTags: (_result, _error, { playerId }) => [
        { type: 'Players', id: playerId },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPlayersQuery,
  useGetPlayerByIdQuery,
  useAddPlayerAliasMutation,
} = playersApi;
