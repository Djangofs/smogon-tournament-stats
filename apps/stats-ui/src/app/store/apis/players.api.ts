import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { environment } from '../../../environments/environment';

export interface PlayerMatch {
  id: string;
  winner: boolean | null;
  generation: string;
  tier: string;
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
}

export interface PlayerDetails extends Player {
  matches: PlayerMatch[];
}

export interface GetPlayersQueryParams {
  generation?: string;
  tier?: string;
  startYear?: number;
  endYear?: number;
}

export const playersApi = createApi({
  reducerPath: 'playersApi',
  baseQuery: fetchBaseQuery({ baseUrl: environment.apiUrl }),
  endpoints: (builder) => ({
    getPlayers: builder.query<Player[], GetPlayersQueryParams>({
      query: (params) => ({
        url: 'players',
        params,
      }),
    }),
    getPlayerById: builder.query<PlayerDetails, string>({
      query: (id) => `players/${id}`,
    }),
  }),
});

export const { useGetPlayersQuery, useGetPlayerByIdQuery } = playersApi;
