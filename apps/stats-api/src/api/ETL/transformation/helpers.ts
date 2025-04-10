import {
  GENERATIONS,
  Generation,
  normalizeGeneration,
} from '@smogon-tournament-stats/shared-constants';
import { PlayerData } from './types';
import logger from '../../../utils/logger';

export const getTiersFromRow = (row: string[], tierIndex: number): string[] => {
  const tierCell = row[tierIndex];
  if (!tierCell) return [];
  const tiers = tierCell.split('/').map((tier) => tier.trim());
  logger.debug(`Extracted tiers from row: ${tiers.join(', ')}`);
  return tiers;
};

export const processCellWithTier = (
  cell: { formattedValue?: string; note?: string },
  defaultTiers: string[]
): { value: string; format: string } => {
  const value = cell.formattedValue || '';
  const note = cell.note || '';
  logger.debug(
    `Processing cell - value: "${value}", note: "${note}", defaultTiers: ${defaultTiers.join(
      ', '
    )}`
  );

  // If there's no match data, return empty format
  if (!value) return { value, format: '' };

  // If there's a note, it indicates a different tier
  if (note) {
    logger.debug(`Using note for tier - format: "${note}"`);
    return { value, format: note };
  }

  // If there's only one default tier, use it
  if (defaultTiers.length === 1) {
    logger.debug(`Using single default tier - format: "${defaultTiers[0]}"`);
    return { value, format: defaultTiers[0] };
  }

  // If there are multiple default tiers, use the first one
  logger.debug(
    `Using first of multiple default tiers - format: "${defaultTiers[0]}"`
  );
  return { value, format: defaultTiers[0] };
};

export const findMostCommonGeneration = (
  data: string[][],
  tierIndex: number
): Generation => {
  logger.debug('Finding most common generation from data');
  const genCounts: Record<Generation, number> = GENERATIONS.reduce(
    (acc, gen) => ({ ...acc, [gen]: 0 }),
    {} as Record<Generation, number>
  );

  // Count generations in the tiers column
  data.forEach((row) => {
    const tierCell = row[tierIndex];
    if (tierCell) {
      const tiers = tierCell.split('/').map((tier) => tier.trim());
      tiers.forEach((tier) => {
        const gen = normalizeGeneration(tier);
        genCounts[gen]++;
      });
    }
  });

  logger.debug('Generation counts:', genCounts);

  // Find the most common generation
  let maxCount = 0;
  let defaultGen: Generation = GENERATIONS[0];

  Object.entries(genCounts).forEach(([gen, count]) => {
    if (count > maxCount) {
      maxCount = count;
      defaultGen = gen as Generation;
    }
  });

  logger.info(
    `Most common generation found: ${defaultGen} (count: ${maxCount})`
  );
  return defaultGen;
};

export const processPlayerRow = (
  row: string[],
  columnIndices: { playerIndex: number; teamIndex: number; priceIndex: number }
): PlayerData => {
  const player = row[columnIndices.playerIndex];
  let team = row[columnIndices.teamIndex];
  // TODO: Add second team record for players who were traded
  if (team.includes('/')) {
    team = team.split('/')[0].trim();
  }
  const price = row[columnIndices.priceIndex];

  logger.debug(
    `Processing player row - player: ${player}, team: ${team}, price: ${price}`
  );

  return {
    player,
    team,
    price,
  };
};

/**
 * Determines the tournament stage based on the round name
 * @param roundName The name of the round
 * @returns The stage name: 'Tiebreak', 'Playoff', or 'Regular Season'
 */
export const determineStageFromRoundName = (roundName: string): string => {
  const roundNameLower = roundName.toLowerCase();

  // First check for tiebreak matches, as they take precedence
  if (roundNameLower.startsWith('tiebreak')) {
    return 'Tiebreak';
  }
  // Then check for playoff matches (semifinals, finals)
  else if (
    roundNameLower.startsWith('semi') ||
    roundNameLower.startsWith('final')
  ) {
    return 'Playoff';
  }
  // All other matches are considered regular season
  else {
    return 'Regular Season';
  }
};
