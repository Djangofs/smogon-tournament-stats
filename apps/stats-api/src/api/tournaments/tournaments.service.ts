import { google } from 'googleapis';
import { tournamentsData } from './tournaments.data';
import { TournamentDatabase } from './tournaments.model';
import { createPlayer, createTournamentPlayer } from '../player/player.service';
import { createTeam, createTournamentTeam } from '../team/team.service';
import { roundData } from '../round/round.data';
import { createMatch, createPlayerMatch } from '../match/match.service';

interface MatchData {
  roundIndex: number;
  opponent: string;
  result: 'W' | 'L';
  tier: string;
  roundName: string;
}

interface PlayerData {
  player: string;
  team: string;
  price: string;
  matches: MatchData[];
}

export const getAllTournaments = async (): Promise<TournamentDatabase[]> => {
  return tournamentsData.getAllTournaments();
};

export const createTournament = async ({
  name,
  sheetName,
  sheetId,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
}) => {
  let tournament: TournamentDatabase;
  const existingTournament = await tournamentsData.findTournament({ name });
  if (existingTournament) {
    console.log(`Tournament ${name} already exists`);
    tournament = existingTournament;
  } else {
    tournament = await tournamentsData.createTournament({ name });
  }

  // Get Data from Google Sheets Api
  const sheets = google.sheets({
    version: 'v4',
    auth: process.env.GOOGLE_API_KEY,
  });

  // Don't need the full range, a sheet name gets everything in that sheet
  const sheetsData = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetName,
  });

  const data = sheetsData.data.values;

  const priceIndex = data[0].findIndex((cell: string) => cell.includes('Cost'));
  // Find the player column
  const playerIndex = data[0].findIndex((cell: string) =>
    cell.includes('Player')
  );
  const teamIndex = data[0].findIndex((cell: string) => cell.includes('Team'));

  // Create rounds from the spreadsheet data
  const roundIndices = data[0]
    .map((cell: string, index: number) => {
      if (
        cell.includes('Week') ||
        cell.includes('Semis') ||
        cell.includes('Finals')
      ) {
        return index;
      }
      return -1;
    })
    .filter((index) => index !== -1);

  const betterData: PlayerData[] = data.slice(1).map((row: string[]) => {
    const player = row[playerIndex];
    let team = row[teamIndex];
    // TODO: Add second team record for players who were traded
    if (team.includes('/')) {
      team = team.split('/')[0].trim();
    }
    const price = row[priceIndex];

    // Get all match data from round columns
    const matches = roundIndices
      .map((roundIndex) => {
        const matchData = row[roundIndex];
        if (!matchData) return null;

        // Parse match data (e.g., "vs. reiku (W) ORAS OU")
        const trimmedData = matchData.trim();
        if (!trimmedData.startsWith('vs.')) return null;

        // Extract opponent name and result
        const vsIndex = trimmedData.indexOf('vs.');
        const openParenIndex = trimmedData.indexOf('(');
        const closeParenIndex = trimmedData.indexOf(')');

        if (vsIndex === -1 || openParenIndex === -1 || closeParenIndex === -1) {
          console.log(`Could not parse match data: ${matchData}`);
          return null;
        }

        const opponent = trimmedData.slice(vsIndex + 3, openParenIndex).trim();
        const result = trimmedData.slice(
          openParenIndex + 1,
          closeParenIndex
        ) as 'W' | 'L';
        const tier = trimmedData.slice(closeParenIndex + 1).trim();

        return {
          roundIndex,
          opponent,
          result,
          tier,
          roundName: data[0][roundIndex],
        };
      })
      .filter((match): match is MatchData => match !== null);

    return {
      player,
      team,
      price,
      matches,
    };
  });

  // Make any new teams
  const teams = betterData.map((row) => row.team);
  const uniqueTeams = [...new Set(teams)].filter((team) => !team.includes('/'));
  const teamPromises = uniqueTeams.map((team) => createTeam({ name: team }));
  const createdTeams = await Promise.all(teamPromises);

  // Create the tournament_teams
  const tournamentId = tournament.id;
  const tournamentTeamPromises = createdTeams.map((team) =>
    createTournamentTeam({ tournamentId, teamId: team.id })
  );
  const tournamentTeams = await Promise.all(tournamentTeamPromises);

  // Make any new players
  const players = betterData.map((row) => row.player);
  const uniquePlayers = [...new Set(players)];
  const playerPromises = uniquePlayers.map((player) =>
    createPlayer({ name: player })
  );
  const createdPlayers = await Promise.all(playerPromises);

  // Create the tournament_players
  const tournamentPlayerPromises = betterData.map((data) => {
    const teamId = createdTeams.find((team) => data.team === team.name).id;
    const tournamentTeamId = tournamentTeams.find(
      (team) => team.teamId === teamId
    ).id;
    const playerId = createdPlayers.find(
      (player) => data.player === player.name
    ).id;
    return createTournamentPlayer({
      tournamentTeamId,
      playerId,
      price: Number(data.price),
    });
  });

  const tournamentPlayers = await Promise.all(tournamentPlayerPromises);

  // Create rounds and matches
  for (const roundIndex of roundIndices) {
    const roundName = data[0][roundIndex];
    const round = await roundData.createRound({
      tournamentId: tournament.id,
      name: roundName,
    });

    // Create matches for this round
    const matchPromises = betterData.map(async (row) => {
      const match = row.matches.find((m) => m.roundIndex === roundIndex);
      if (!match) return null;

      // Find the opponent's tournament player record
      const opponentPlayer = tournamentPlayers.find(
        (tp) =>
          tp.playerId ===
          createdPlayers.find((p) => p.name === match.opponent)?.id
      );
      if (!opponentPlayer) {
        console.log(
          `Could not find opponent player record for ${match.opponent}`
        );
        return null;
      }

      // Find current player's tournament player record
      const currentPlayer = tournamentPlayers.find(
        (tp) =>
          tp.playerId === createdPlayers.find((p) => p.name === row.player)?.id
      );
      if (!currentPlayer) {
        console.log(`Could not find current player record for ${row.player}`);
        return null;
      }

      // Create the match
      const newMatch = await createMatch({
        roundId: round.id,
        bestOf: 1, // Default to best of 1 for now
        player1Id: currentPlayer.playerId,
        player2Id: opponentPlayer.playerId,
      });

      // Create player match records
      await createPlayerMatch({
        playerId: currentPlayer.playerId,
        matchId: newMatch.id,
        tournament_teamId: currentPlayer.tournament_teamId,
        winner: match.result === 'W',
      });

      await createPlayerMatch({
        playerId: opponentPlayer.playerId,
        matchId: newMatch.id,
        tournament_teamId: opponentPlayer.tournament_teamId,
        winner: match.result === 'L',
      });

      return newMatch;
    });

    await Promise.all(matchPromises);
  }

  return tournament;
};
