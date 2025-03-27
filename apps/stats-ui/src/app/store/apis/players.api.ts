import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { environment } from '../../../environments/environment';

export type Player = {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
};

export type GetPlayersQueryParams = {
  generation?: string;
  tier?: string;
  startYear?: number;
  endYear?: number;
};

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
  }),
});

export const { useGetPlayersQuery } = playersApi;
