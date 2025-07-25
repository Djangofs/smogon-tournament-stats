import { createTournament } from '../factories/tournament.factory';
import { createTeam, createTournamentTeam } from '../factories/team.factory';
import {
  createPlayer,
  createTournamentPlayer,
} from '../factories/player.factory';
import { createRound } from '../factories/round.factory';

export const seedBasicData = async () => {
  // Create a simple tournament
  const tournament = await createTournament({
    name: 'Test Tournament Basic',
    year: 2024,
    isOfficial: true,
    isTeam: true,
  });

  // Create two teams
  const teams = await Promise.all([
    createTeam({ name: 'Team Alpha' }),
    createTeam({ name: 'Team Beta' }),
  ]);

  // Link teams to tournament
  const tournamentTeams = await Promise.all(
    teams.map((team) => createTournamentTeam(tournament.id, team.id))
  );

  // Create some players
  const players = await Promise.all([
    createPlayer({ name: 'TestPlayer1' }),
    createPlayer({ name: 'TestPlayer2' }),
    createPlayer({ name: 'TestPlayer3' }),
    createPlayer({ name: 'TestPlayer4' }),
  ]);

  // Add players to teams
  const tournamentPlayers = await Promise.all([
    createTournamentPlayer(players[0].id, tournamentTeams[0].id, 15000),
    createTournamentPlayer(players[1].id, tournamentTeams[0].id, 12000),
    createTournamentPlayer(players[2].id, tournamentTeams[1].id, 18000),
    createTournamentPlayer(players[3].id, tournamentTeams[1].id, 10000),
  ]);

  // Create a round
  const round = await createRound(tournament.id, { name: 'Week 1' });

  return {
    tournament,
    teams,
    tournamentTeams,
    players,
    tournamentPlayers,
    rounds: [round],
  };
};
