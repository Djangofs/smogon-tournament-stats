import { tournamentsData } from './tournaments.data';
import { TournamentDatabase } from './tournaments.model';
import { createPlayer, createTournamentPlayer } from '../player/player.service';
import { createTeam, createTournamentTeam } from '../team/team.service';
import { createRound } from '../round/round.service';
import { createMatch, createPlayerMatch } from '../match/match.service';
import { createGame } from '../game/game.service';
import { extractDataFromSheet, extractReplays } from '../ETL/extraction';
import { TransformLegacyTournamentData } from '../ETL/transformation/legacy.transformer';
import { TransformModernTournamentData } from '../ETL/transformation/modern.transformer';
import { TransformSPLMiddleTournamentData } from '../ETL/transformation/spl-middle.transformer';
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
  replayUrl,
  stage,
}: {
  roundId: string;
  currentPlayer: TournamentPlayer;
  opponentPlayer: TournamentPlayer;
  result: 'W' | 'L' | 'dead';
  generation: string;
  tier: string;
  tournamentYear: number;
  roundName: string;
  replayUrl?: string;
  stage: string;
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
    stage,
  });

  // Only create a game if it's not a dead game
  if (result !== 'dead') {
    // Create a game for the match
    await createGame({
      matchId: newMatch.id,
      player1Id: currentPlayer.playerId,
      player2Id: opponentPlayer.playerId,
      player1Winner: result === 'W',
      generation,
      tier,
      playedAt: new Date(tournamentYear, 0, 1), // January 1st of tournament year
      replayUrl,
    });
  }

  // Create player match records based on game results
  await createPlayerMatch({
    playerId: currentPlayer.playerId,
    matchId: newMatch.id,
    tournament_teamId: currentPlayer.tournament_teamId,
    winner: result === 'dead' ? null : result === 'W',
  });

  await createPlayerMatch({
    playerId: opponentPlayer.playerId,
    matchId: newMatch.id,
    tournament_teamId: opponentPlayer.tournament_teamId,
    winner: result === 'dead' ? null : result === 'L',
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
  replayPostUrl,
  replaySource = 'none',
  transformer = 'legacy',
}: {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
  replayPostUrl?: string;
  replaySource?: 'thread' | 'embedded' | 'none';
  transformer?: string;
}) => {
  logger.info(
    `Starting tournament creation process for ${name} with transformer: ${transformer}`
  );

  let tournament: TournamentDatabase;
  const existingTournament = await tournamentsData.findTournament({ name });
  if (existingTournament) {
    logger.info(
      `Tournament ${name} already exists with ID: ${existingTournament.id}`
    );
    tournament = existingTournament;
  } else {
    logger.info(`Creating new tournament: ${name}`);
    tournament = await tournamentsData.createTournament({
      name,
      isOfficial,
      isTeam,
      year,
      replayPostUrl,
    });
    logger.info(`Created tournament with ID: ${tournament.id}`);
  }

  // Extract data from spreadsheet
  logger.info(`Extracting data from sheet: ${sheetName} (ID: ${sheetId})`);
  const spreadsheetData = await extractDataFromSheet({
    sheetName,
    sheetId,
  });
  logger.info(
    `Extracted spreadsheet data with ${spreadsheetData.data.rowData.length} rows`
  );

  // Transform the data using the specified transformer
  logger.info(`Transforming data using transformer: ${transformer}`);
  let tournamentData;
  switch (transformer) {
    case 'modern':
      logger.info('Using Modern transformer');
      tournamentData = await TransformModernTournamentData({
        spreadsheetData,
      });
      break;
    case 'spl-middle':
      logger.info('Using SPL Middle transformer');
      tournamentData = await TransformSPLMiddleTournamentData({
        spreadsheetData,
      });
      break;
    default:
      logger.info('Using Legacy transformer');
      tournamentData = await TransformLegacyTournamentData({
        spreadsheetData,
      });
  }

  logger.info(
    `Transformation complete. Found ${tournamentData.players.length} players, ${tournamentData.teams.length} teams, ${tournamentData.rounds.length} rounds, and ${tournamentData.matches.length} matches`
  );

  // Extract replays based on the replay source
  let replays: { player1: string; player2: string; replayUrl: string }[] = [];
  if (replaySource === 'thread' && replayPostUrl) {
    try {
      logger.info(`Extracting replays from: ${replayPostUrl}`);
      replays = await extractReplays(replayPostUrl);
      logger.info(`Extracted ${replays.length} replays from ${replayPostUrl}`);
    } catch (error) {
      logger.error(`Failed to extract replays from ${replayPostUrl}:`, error);
    }
  }

  // Associate replays with matches
  const matchReplayMap = new Map<string, string>();
  if (replays.length > 0) {
    // Create a map of player pairs to replay URLs
    for (const replay of replays) {
      // Create a unique key for the player pair (order doesn't matter)
      const playerPairKey = [replay.player1, replay.player2].sort().join('|');
      matchReplayMap.set(playerPairKey, replay.replayUrl);
    }
    logger.info(`Associated ${matchReplayMap.size} replays with matches`);
  }

  // LOADING PROCESS BELOW
  // TODO: Refactor this into the ETL folders

  // Make any new teams
  logger.info(`Creating ${tournamentData.teams.length} teams`);
  const teamPromises = tournamentData.teams.map((team) =>
    createTeam({ name: team.name })
  );
  const createdTeams = await Promise.all(teamPromises);
  logger.info(`Created ${createdTeams.length} teams`);

  // Create the tournament_teams
  logger.info(
    `Creating tournament-team associations for tournament ID: ${tournament.id}`
  );
  const tournamentId = tournament.id;
  const tournamentTeamPromises = createdTeams.map((team) =>
    createTournamentTeam({ tournamentId, teamId: team.id })
  );
  const tournamentTeams = await Promise.all(tournamentTeamPromises);
  logger.info(`Created ${tournamentTeams.length} tournament-team associations`);

  // Make any new players
  logger.info(`Creating ${tournamentData.players.length} players`);
  const uniquePlayers = [
    ...new Set(tournamentData.players.map((row) => row.player)),
  ];
  logger.info(`Found ${uniquePlayers.length} unique players`);
  const playerPromises = uniquePlayers.map((player) =>
    createPlayer({ name: player as string })
  );
  const createdPlayers = await Promise.all(playerPromises);
  logger.info(`Created ${createdPlayers.length} players`);

  // Create the tournament_players
  logger.info(`Creating tournament-player associations`);
  const tournamentPlayerPromises = tournamentData.players.map((data) => {
    const teamId = createdTeams.find((team) => data.team === team.name)?.id;
    if (!teamId) {
      logger.error(`Could not find team ID for team: ${data.team}`);
      return null;
    }

    const tournamentTeamId = tournamentTeams.find(
      (team) => team.teamId === teamId
    )?.id;
    if (!tournamentTeamId) {
      logger.error(`Could not find tournament team ID for team ID: ${teamId}`);
      return null;
    }

    const playerId = createdPlayers.find(
      (player) => data.player === player.name
    )?.id;
    if (!playerId) {
      logger.error(`Could not find player ID for player: ${data.player}`);
      return null;
    }

    return createTournamentPlayer({
      tournamentTeamId,
      playerId,
      price: Number(data.price),
    });
  });

  const tournamentPlayers = (
    await Promise.all(tournamentPlayerPromises)
  ).filter(Boolean);
  logger.info(
    `Created ${tournamentPlayers.length} tournament-player associations`
  );

  // Create rounds and matches
  logger.info(
    `Creating ${tournamentData.rounds.length} rounds and their matches`
  );
  for (const round of tournamentData.rounds) {
    logger.info(`Creating round: ${round.name}`);
    const roundRecord = await createRound({
      tournamentId: tournament.id,
      name: round.name,
    });
    logger.info(`Created round with ID: ${roundRecord.id}`);

    // Create matches for this round
    const roundMatches = tournamentData.matches.filter(
      (match) => match.roundName === round.name
    );
    logger.info(
      `Found ${roundMatches.length} matches for round: ${round.name}`
    );

    const matchPromises = roundMatches.map(async (match) => {
      logger.debug(`Processing match: ${match.player1} vs ${match.player2}`);

      const player1 = findTournamentPlayer(
        match.player1,
        tournamentPlayers,
        createdPlayers
      );
      if (!player1) {
        logger.error(`Could not find tournament player for: ${match.player1}`);
        return null;
      }

      const player2 = findTournamentPlayer(
        match.player2,
        tournamentPlayers,
        createdPlayers
      );
      if (!player2) {
        logger.error(`Could not find tournament player for: ${match.player2}`);
        return null;
      }

      // Find a matching replay for this match using the pre-created map
      const playerPairKey = [match.player1, match.player2].sort().join('|');
      const replayUrl = matchReplayMap.get(playerPairKey);
      if (replayUrl) {
        logger.debug(`Found replay URL for match: ${playerPairKey}`);
      }

      try {
        const result = await createMatchWithGame({
          roundId: roundRecord.id,
          currentPlayer: player1,
          opponentPlayer: player2,
          result:
            match.winner === 'player1'
              ? 'W'
              : match.winner === 'player2'
              ? 'L'
              : 'dead',
          generation: match.generation,
          tier: match.tier,
          tournamentYear: year,
          roundName: round.name,
          replayUrl,
          stage: match.stage,
        });
        logger.debug(`Created match with ID: ${result.id}`);
        return result;
      } catch (error) {
        logger.error(
          `Failed to create match: ${match.player1} vs ${match.player2}`,
          error
        );
        return null;
      }
    });

    const createdMatches = (await Promise.all(matchPromises)).filter(Boolean);
    logger.info(
      `Created ${createdMatches.length} matches for round: ${round.name}`
    );
  }

  logger.info(`Tournament creation process completed for: ${name}`);
  return tournament;
};
