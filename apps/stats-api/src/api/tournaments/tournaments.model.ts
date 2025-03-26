import { Tournament } from '@prisma/client';

export type TournamentDatabase = Tournament;

export interface CreateTournamentRequest {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial?: boolean;
  isTeam?: boolean;
}

export interface TournamentDTO {
  id: string;
  name: string;
  isOfficial: boolean;
  isTeam: boolean;
  createdAt: Date;
  updatedAt: Date;
}
