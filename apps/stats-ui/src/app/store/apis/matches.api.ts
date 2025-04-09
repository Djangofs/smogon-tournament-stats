import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { environment } from '../../../environments/environment';

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

// Define a service using a base URL and expected endpoints
export const matchesApi = createApi({
  reducerPath: 'matchesApi',
  baseQuery: fetchBaseQuery({ baseUrl: environment.apiUrl }),
  tagTypes: ['Matches'],
  endpoints: (builder) => ({
    getMatchById: builder.query<Match, string>({
      query: (id) => `matches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Matches', id }],
    }),
  }),
});

export const { useGetMatchByIdQuery } = matchesApi;
