export interface PlayerData {
  player: string;
  team: string;
  price: string;
}

export interface MatchData {
  roundIndex: number;
  player1: string;
  player2: string;
  winner: 'player1' | 'player2' | 'dead';
  generation: string;
  tier: string;
  roundName: string;
  stage: string;
}

export interface TeamData {
  name: string;
}

export interface RoundData {
  name: string;
}

export interface TournamentData {
  players: PlayerData[];
  teams: TeamData[];
  rounds: RoundData[];
  matches: MatchData[];
}
