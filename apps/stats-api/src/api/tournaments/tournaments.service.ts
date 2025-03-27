import { tournamentsData } from './tournaments.data';
import { TournamentDatabase } from './tournaments.model';
import { createPlayer, createTournamentPlayer } from '../player/player.service';
import { createTeam, createTournamentTeam } from '../team/team.service';
import { createRound } from '../round/round.service';
import { createMatch, createPlayerMatch } from '../match/match.service';
import { createGame } from '../game/game.service';
import { extractTournamentData } from '../extraction/extraction.service';
import logger from '../../utils/logger';

interface TournamentPlayer {
  playerId: string;
  tournament_teamId: string;
  id: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PlayerRecord {
  id: string;
  name: string;
}

const createMatchWithGame = async ({
  roundId,
  currentPlayer,
  opponentPlayer,
  result,
  generation,
  tier,
  tournamentYear,
}: {
  roundId: string;
  currentPlayer: TournamentPlayer;
  opponentPlayer: TournamentPlayer;
  result: 'W' | 'L';
  generation: string;
  tier: string;
  tournamentYear: number;
}) => {
  // Create the match
  const newMatch = await createMatch({
    roundId,
    bestOf: 1, // Default to best of 1 for now
    player1Id: currentPlayer.playerId,
    player2Id: opponentPlayer.playerId,
    generation,
    tier,
    playedAt: new Date(tournamentYear, 0, 1), // January 1st of tournament year
  });

  // Create a game for the match
  await createGame({
    matchId: newMatch.id,
    player1Id: currentPlayer.playerId,
    player2Id: opponentPlayer.playerId,
    player1Winner: result === 'W',
    generation,
    tier,
    playedAt: new Date(tournamentYear, 0, 1), // January 1st of tournament year
  });

  // Create player match records based on game results
  await createPlayerMatch({
    playerId: currentPlayer.playerId,
    matchId: newMatch.id,
    tournament_teamId: currentPlayer.tournament_teamId,
  });

  await createPlayerMatch({
    playerId: opponentPlayer.playerId,
    matchId: newMatch.id,
    tournament_teamId: opponentPlayer.tournament_teamId,
  });

  return newMatch;
};

const findTournamentPlayer = (
  playerName: string,
  tournamentPlayers: TournamentPlayer[],
  createdPlayers: PlayerRecord[]
): TournamentPlayer | null => {
  // Find the player by name or alias
  const player = createdPlayers.find((p) => p.name === playerName);
  if (!player) {
    logger.warn(`Could not find player record for ${playerName}`);
    return null;
  }

  const tournamentPlayer = tournamentPlayers.find(
    (tp) => tp.playerId === player.id
  );
  if (!tournamentPlayer) {
    logger.warn(`Could not find tournament player record for ${playerName}`);
    return null;
  }

  return tournamentPlayer;
};

export const getAllTournaments = async (): Promise<TournamentDatabase[]> => {
  return tournamentsData.getAllTournaments();
};

export const getTournamentById = async (
  id: string
): Promise<TournamentDatabase> => {
  return tournamentsData.getTournamentById(id);
};

export const createTournament = async ({
  name,
  sheetName,
  sheetId,
  isOfficial,
  isTeam,
  year,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
}) => {
  let tournament: TournamentDatabase;
  const existingTournament = await tournamentsData.findTournament({ name });
  if (existingTournament) {
    logger.info(`Tournament ${name} already exists`);
    tournament = existingTournament;
  } else {
    tournament = await tournamentsData.createTournament({
      name,
      isOfficial,
      isTeam,
      year,
    });
  }

  // Extract data from spreadsheet
  const tournamentData = await extractTournamentData({
    sheetName,
    sheetId,
  });

  // Make any new teams
  const teamPromises = tournamentData.teams.map((team) =>
    createTeam({ name: team.name })
  );
  const createdTeams = await Promise.all(teamPromises);

  // Create the tournament_teams
  const tournamentId = tournament.id;
  const tournamentTeamPromises = createdTeams.map((team) =>
    createTournamentTeam({ tournamentId, teamId: team.id })
  );
  const tournamentTeams = await Promise.all(tournamentTeamPromises);

  // Make any new players
  const uniquePlayers = [
    ...new Set(tournamentData.players.map((row) => row.player)),
  ];
  const playerPromises = uniquePlayers.map((player) =>
    createPlayer({ name: player })
  );
  const createdPlayers = await Promise.all(playerPromises);

  // Create the tournament_players
  const tournamentPlayerPromises = tournamentData.players.map((data) => {
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
  for (const round of tournamentData.rounds) {
    const roundRecord = await createRound({
      tournamentId: tournament.id,
      name: round.name,
    });

    // Create matches for this round
    const matchPromises = tournamentData.matches
      .filter((match) => match.roundName === round.name)
      .map(async (match) => {
        const player1 = findTournamentPlayer(
          match.player1,
          tournamentPlayers,
          createdPlayers
        );
        if (!player1) return null;

        const player2 = findTournamentPlayer(
          match.player2,
          tournamentPlayers,
          createdPlayers
        );
        if (!player2) return null;

        return createMatchWithGame({
          roundId: roundRecord.id,
          currentPlayer: player1,
          opponentPlayer: player2,
          result: match.winner === 'player1' ? 'W' : 'L',
          generation: match.generation,
          tier: match.tier,
          tournamentYear: year,
        });
      });

    await Promise.all(matchPromises);
  }

  return tournament;
};
