import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQueryWithAuth';

export interface PlayerMatch {
  id: string;
  tournamentId: string;
  tournamentName: string;
  round: string;
  opponent: string;
  result: string;
  replay?: string;
}

export interface Player {
  id: string;
  name: string;
  matches?: PlayerMatch[];
}

export interface GetPlayersQueryParams {
  tournamentId?: string;
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
