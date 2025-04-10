import {
  Generation,
  parseFormat,
} from '@smogon-tournament-stats/shared-constants';
import { TournamentData, MatchData } from './types';
import { SpreadsheetData } from '../extraction/types';
import {
  getTiersFromRow,
  processCellWithTier,
  findMostCommonGeneration,
  processPlayerRow,
  determineStageFromRoundName,
} from './helpers';
import logger from '../../../utils/logger';

const parseMatchData = (
  matchData: { value: string; format: string } | undefined,
  roundName: string,
  roundIndex: number,
  currentPlayer: string,
  defaultGen: Generation
): MatchData | null => {
  if (!matchData || !matchData.value) return null;

  logger.debug(
    `Parsing match data: "${matchData.value}" for player ${currentPlayer} in round ${roundName}`
  );

  // Parse match data (e.g., "vs. reiku (W)" with format "ORAS OU" or "USM OU")
  const trimmedData = matchData.value.trim();
  if (!trimmedData.startsWith('vs.')) {
    logger.debug('Match data does not start with "vs." - skipping');
    return null;
  }

  // Extract opponent name and result
  const vsIndex = trimmedData.indexOf('vs.');
  const openParenIndex = trimmedData.indexOf('(');
  const closeParenIndex = trimmedData.indexOf(')');

  if (vsIndex === -1 || openParenIndex === -1 || closeParenIndex === -1) {
    logger.warn(`Could not parse match data: ${matchData.value}`);
    return null;
  }

  const player2 = trimmedData.slice(vsIndex + 3, openParenIndex).trim();
  const result = trimmedData.slice(openParenIndex + 1, closeParenIndex).trim();
  logger.debug(`Extracted player2: ${player2}, result: ${result}`);

  // Use the format directly from the cell
  const format = parseFormat(matchData.format, defaultGen);
  logger.debug(`Parsed format: ${format}`);

  // Split format into generation and tier
  const [generation, tier] = format.split(' ');
  logger.debug(`Split format - generation: ${generation}, tier: ${tier}`);

  // Determine the stage based on the round name
  const stage = determineStageFromRoundName(roundName);
  logger.debug(`Determined stage: ${stage} from round name: ${roundName}`);

  const parsedMatch: MatchData = {
    roundIndex,
    player1: currentPlayer,
    player2,
    winner: result === 'W' ? 'player1' : result === 'L' ? 'player2' : 'dead',
    generation,
    tier,
    roundName,
    stage,
  };
  logger.debug('Created match data:', JSON.stringify(parsedMatch, null, 2));

  return parsedMatch;
};

// Steps:
// Get Players
// Get Teams
// Get Rounds
// Get Matches
export const TransformLegacyTournamentData = async ({
  spreadsheetData,
}: {
  spreadsheetData: SpreadsheetData;
}): Promise<TournamentData> => {
  logger.info('Starting tournament data transformation');
  logger.info(
    'Input spreadsheet data:',
    JSON.stringify(spreadsheetData, null, 2)
  );

  // Convert rowData to a 2D array of cell values with tier information
  const data = spreadsheetData.data.rowData.map((row) => {
    if (!row.values) return [];

    // Get default tiers for this row
    const defaultTiers = getTiersFromRow(
      row.values.map((cell) => cell.formattedValue || ''),
      spreadsheetData.columnIndices.tierIndex
    );
    logger.debug('Default tiers for row:', defaultTiers);

    return row.values.map((cell) => processCellWithTier(cell, defaultTiers));
  });
  logger.info('Processed data array:', JSON.stringify(data, null, 2));

  // Find the most common generation in the tournament using the tiers column
  const defaultGen = findMostCommonGeneration(
    data.map((row) => row.map((cell) => cell.format)),
    spreadsheetData.columnIndices.tierIndex
  );
  logger.info('Most common generation:', defaultGen);

  // Process all player data
  const playerData = data.slice(1).map((row) =>
    processPlayerRow(
      row.map((cell) => cell.value),
      spreadsheetData.columnIndices
    )
  );
  logger.info('Processed player data:', JSON.stringify(playerData, null, 2));

  // Extract unique teams
  const teams = [...new Set(playerData.map((row) => row.team))]
    .filter((team) => !team.includes('/'))
    .map((name) => ({ name }));
  logger.info('Extracted teams:', JSON.stringify(teams, null, 2));

  // Extract rounds from the header row
  const rounds = spreadsheetData.roundIndices.map((index) => ({
    name: spreadsheetData.headerRow[index],
  }));
  logger.info('Extracted rounds:', JSON.stringify(rounds, null, 2));

  // Extract all matches
  const matches = data.slice(1).flatMap((row) => {
    const currentPlayer = row[spreadsheetData.columnIndices.playerIndex].value;
    logger.debug(`Processing matches for player: ${currentPlayer}`);
    return spreadsheetData.roundIndices
      .map((roundIndex) => {
        const matchData = row[roundIndex];
        const parsedMatch = parseMatchData(
          matchData,
          spreadsheetData.headerRow[roundIndex],
          roundIndex,
          currentPlayer,
          defaultGen
        );
        if (parsedMatch) {
          logger.debug(`Parsed match: ${JSON.stringify(parsedMatch, null, 2)}`);
        }
        return parsedMatch;
      })
      .filter((match): match is MatchData => match !== null);
  });
  logger.info('All extracted matches:', JSON.stringify(matches, null, 2));

  // Filter out duplicate matches
  const uniqueMatches = matches.filter((match, index, self) => {
    // Find if there's another match with the same players in the same round
    const duplicateIndex = self.findIndex(
      (m) =>
        m.roundIndex === match.roundIndex &&
        ((m.player1 === match.player1 && m.player2 === match.player2) ||
          (m.player1 === match.player2 && m.player2 === match.player1))
    );
    // Only keep the match if it's the first occurrence
    return duplicateIndex === index;
  });
  logger.info(
    'Filtered unique matches:',
    JSON.stringify(uniqueMatches, null, 2)
  );

  return {
    players: playerData,
    teams,
    rounds,
    matches: uniqueMatches,
  };
};
