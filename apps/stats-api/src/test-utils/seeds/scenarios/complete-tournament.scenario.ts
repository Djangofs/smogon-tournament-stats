import { createTournament } from '../factories/tournament.factory';
import { createTournamentWithTeams } from '../factories/team.factory';
import {
  addPlayersToTournamentTeam,
  createPlayerWithAliases,
} from '../factories/player.factory';
import { createRegularSeasonRounds } from '../factories/round.factory';
import { createMatchWithPlayers } from '../factories/match.factory';
import { createGamesForMatch } from '../factories/game.factory';

export const seedCompleteTournament = async () => {
  // Create tournament with 4 teams
  const { tournament, teams, tournamentTeams } =
    await createTournamentWithTeams(4, {
      name: 'SPL XIV (Test)',
      year: 2024,
      isOfficial: true,
      isTeam: true,
    });

  // Add players to each team (6 players per team)
  const teamPlayers = [];
  for (let i = 0; i < tournamentTeams.length; i++) {
    const { players, tournamentPlayers } = await addPlayersToTournamentTeam(
      tournamentTeams[i].id,
      6
    );
    teamPlayers.push({
      players,
      tournamentPlayers,
      tournamentTeamId: tournamentTeams[i].id,
    });
  }

  // Create some players with aliases for testing alias functionality
  const playerWithAliases = await createPlayerWithAliases('Finchinator', [
    'Finch',
    'FinchTest',
  ]);

  // Create rounds for the tournament (9 weeks)
  const rounds = await createRegularSeasonRounds(tournament.id, 9);

  // Create matches for the first few rounds
  const matches = [];
  const matchGames = [];

  // Week 1 matches
  for (let i = 0; i < 3; i++) {
    const team1Players = teamPlayers[i % 4];
    const team2Players = teamPlayers[(i + 1) % 4];

    // Pick random players from each team
    const player1 =
      team1Players.players[
        Math.floor(Math.random() * team1Players.players.length)
      ];
    const player2 =
      team2Players.players[
        Math.floor(Math.random() * team2Players.players.length)
      ];

    // Create match with random winner
    const winner = Math.random() > 0.5 ? 'player1' : 'player2';
    const bestOf = Math.random() > 0.7 ? 3 : 1;

    const matchData = await createMatchWithPlayers(
      rounds[0].id,
      { playerId: player1.id, tournamentTeamId: team1Players.tournamentTeamId },
      { playerId: player2.id, tournamentTeamId: team2Players.tournamentTeamId },
      { bestOf, generation: 'SV', tier: 'SV OU' },
      winner
    );

    matches.push(matchData);

    // Create games for this match
    const gamesData = await createGamesForMatch(
      matchData.match.id,
      player1.id,
      player2.id,
      bestOf,
      winner
    );

    matchGames.push(gamesData);
  }

  // Week 2 matches
  for (let i = 0; i < 2; i++) {
    const team1Players = teamPlayers[i];
    const team2Players = teamPlayers[i + 2];

    const player1 =
      team1Players.players[
        Math.floor(Math.random() * team1Players.players.length)
      ];
    const player2 =
      team2Players.players[
        Math.floor(Math.random() * team2Players.players.length)
      ];

    const winner = Math.random() > 0.5 ? 'player1' : 'player2';
    const bestOf = 1;

    const matchData = await createMatchWithPlayers(
      rounds[1].id,
      { playerId: player1.id, tournamentTeamId: team1Players.tournamentTeamId },
      { playerId: player2.id, tournamentTeamId: team2Players.tournamentTeamId },
      { bestOf, generation: 'SS', tier: 'SS OU' },
      winner
    );

    matches.push(matchData);

    const gamesData = await createGamesForMatch(
      matchData.match.id,
      player1.id,
      player2.id,
      bestOf,
      winner
    );

    matchGames.push(gamesData);
  }

  return {
    tournament,
    teams,
    tournamentTeams,
    teamPlayers,
    playerWithAliases,
    rounds,
    matches,
    matchGames,
    // Summary stats for easy testing
    stats: {
      totalTeams: teams.length,
      totalPlayers: teamPlayers.reduce((sum, tp) => sum + tp.players.length, 0),
      totalRounds: rounds.length,
      totalMatches: matches.length,
      totalGames: matchGames.reduce((sum, mg) => sum + mg.games.length, 0),
    },
  };
};
