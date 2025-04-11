import { SpreadsheetData } from '../extraction/types';
import { TournamentData, PlayerData, MatchData } from './types';
import { normalizeGeneration } from '@smogon-tournament-stats/shared-constants';
import { determineStageFromRoundName } from './helpers';
import logger from '../../../utils/logger';

interface TransformSPLMiddleTournamentDataParams {
  spreadsheetData: SpreadsheetData;
}

/**
 * Transforms SPL Middle tournament spreadsheet data into the required TournamentData format
 * This transformer is specifically designed for the SPL Middle tournament format
 */
export async function TransformSPLMiddleTournamentData({
  spreadsheetData,
}: TransformSPLMiddleTournamentDataParams): Promise<TournamentData> {
  logger.info('Starting SPL Middle tournament data transformation');
  const { roundIndices, columnIndices, headerRow, data } = spreadsheetData;
  const { playerIndex, teamIndex, priceIndex } = columnIndices;

  // Extract players and teams
  const players: PlayerData[] = [];
  const teams = new Set<string>();

  // Skip the header row
  for (let i = 1; i < data.rowData.length; i++) {
    const row = data.rowData[i];
    const player = row.values[playerIndex].formattedValue;
    const team = row.values[teamIndex].formattedValue;
    const price = row.values[priceIndex].formattedValue;

    if (player && team) {
      players.push({ player, team, price });
      teams.add(team);
    }
  }

  logger.info(`Found ${players.length} players and ${teams.size} teams`);

  // Extract rounds
  const rounds = roundIndices.map((index) => ({
    name: headerRow[index],
  }));

  logger.info(`Processing rounds: ${rounds.map((r) => r.name).join(', ')}`);
  logger.info(`Round indices: ${roundIndices.join(', ')}`);

  // Extract matches
  const matches: MatchData[] = [];
  const processedMatches = new Set<string>(); // Track unique matches

  // Process each player's row
  for (let i = 1; i < data.rowData.length; i++) {
    const row = data.rowData[i];
    const player1 = row.values[playerIndex].formattedValue;
    logger.info(`Processing matches for player: ${player1}`);

    // Process each round
    for (let j = 0; j < roundIndices.length; j++) {
      const roundIndex = roundIndices[j];
      const roundName = headerRow[roundIndex];
      const matchValue = row.values[roundIndex].formattedValue;

      // Skip empty cells
      if (!matchValue) continue;

      // Parse the match value to extract player2, result, and tier
      // Format examples: "W vs BlueOak (SS OU)", "L vs GreenLeaf (USM OU)"
      const matchRegex = /(W|L) vs ([^(]+) \(([^)]+)\)/;
      const matchResult = matchValue.match(matchRegex);

      if (matchResult) {
        const [_, result, player2, tierInfo] = matchResult;

        // Skip if player2 is empty
        if (!player2.trim()) continue;

        // Create a unique key for this match
        const matchKey = [player1, player2.trim()].sort().join(' vs ');

        // Skip if we've already processed this match
        if (processedMatches.has(matchKey)) {
          logger.debug(`Skipping duplicate match: ${matchKey}`);
          continue;
        }

        processedMatches.add(matchKey);

        // Determine the winner
        const winner = result === 'W' ? 'player1' : 'player2';

        // Parse generation and tier from tierInfo (e.g., "SS OU", "USM OU")
        const tierParts = tierInfo.trim().split(' ');
        const generation = normalizeGeneration(tierParts[0]);
        const tier = tierParts.slice(1).join(' ');

        // Determine the stage based on the round name
        const stage = determineStageFromRoundName(roundName);

        logger.debug(
          `Creating match: ${player1} vs ${player2.trim()} in ${roundName}`
        );
        matches.push({
          player1,
          player2: player2.trim(),
          winner,
          generation,
          tier,
          roundName,
          roundIndex,
          stage,
        });
      }
    }
  }

  logger.info(`Total matches created: ${matches.length}`);
  logger.info(`Total unique matches: ${processedMatches.size}`);

  return {
    players,
    teams: Array.from(teams).map((name) => ({ name })),
    rounds,
    matches,
  };
}
