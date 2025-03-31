import { Match } from './match';

export interface Round {
  id: string;
  name: string;
  matches?: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
  replayPostUrl?: string;
  createdAt: string;
  updatedAt: string;
  rounds?: Round[];
}

export interface CreateTournamentRequest {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial?: boolean;
  isTeam?: boolean;
  year: number;
  replayPostUrl?: string;
}
