import { Player } from './player';
export interface Team {
  id: string;
  name: string;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  team: Team;
}

export interface PlayerMatch {
  playerId: string;
  matchId: string;
  tournament_teamId: string;
  winner: boolean;
  createdAt: string;
  updatedAt: string;
  player: Player;
  team: TournamentTeam;
}

export interface Match {
  id: string;
  players: PlayerMatch[];
  result: string;
  generation: string;
  tier: string;
}
