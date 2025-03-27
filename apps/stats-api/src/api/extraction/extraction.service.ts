import { google } from 'googleapis';
import logger from '../../utils/logger';

export interface MatchData {
  roundIndex: number;
  player1: string;
  player2: string;
  winner: 'player1' | 'player2';
  generation: string;
  tier: string;
  roundName: string;
}

export interface PlayerData {
  player: string;
  team: string;
  price: string;
}

export interface TeamData {
  name: string;
}

export interface RoundData {
  name: string;
}

export interface SpreadsheetData {
  playerIndex: number;
  teamIndex: number;
  priceIndex: number;
  roundIndices: number[];
  playerData: PlayerData[];
}

export interface TournamentData {
  players: PlayerData[];
  teams: TeamData[];
  rounds: RoundData[];
  matches: MatchData[];
}

export type Generation =
  | 'RBY'
  | 'GSC'
  | 'ADV'
  | 'DPP'
  | 'BW'
  | 'ORAS'
  | 'SM'
  | 'SWSH'
  | 'SV';
export type Tier = 'OU' | 'Uber' | 'UU' | 'RU' | 'NU' | 'PU' | 'LC';
export type Format = `${Generation} ${Tier}`;

const normalizeGeneration = (gen: string): Generation => {
  const genMap: Record<string, Generation> = {
    RBY: 'RBY',
    GSC: 'GSC',
    ADV: 'ADV',
    DPP: 'DPP',
    BW: 'BW',
    BW2: 'BW',
    XY: 'ORAS',
    ORAS: 'ORAS',
    SM: 'SM',
    USM: 'SM',
    SWSH: 'SWSH',
    SV: 'SV',
  };
  return genMap[gen] || 'SV'; // Default to latest gen if unknown
};

const normalizeTier = (tier: string): Tier => {
  const tierMap: Record<string, Tier> = {
    OU: 'OU',
    Uber: 'Uber',
    Ubers: 'Uber',
    UU: 'UU',
    RU: 'RU',
    NU: 'NU',
    PU: 'PU',
    LC: 'LC',
  };
  return tierMap[tier] || 'OU'; // Default to OU if unknown
};

const findMostCommonGeneration = (
  data: string[][],
  tierIndex: number
): Generation => {
  const genCounts: Record<Generation, number> = {
    RBY: 0,
    GSC: 0,
    ADV: 0,
    DPP: 0,
    BW: 0,
    ORAS: 0,
    SM: 0,
    SWSH: 0,
    SV: 0,
  };

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

  // Find the most common generation
  let maxCount = 0;
  let defaultGen: Generation = 'SV';

  Object.entries(genCounts).forEach(([gen, count]) => {
    if (count > maxCount) {
      maxCount = count;
      defaultGen = gen as Generation;
    }
  });

  return defaultGen;
};

const parseFormat = (formatStr: string, defaultGen: Generation): Format => {
  if (!formatStr) return `${defaultGen} OU`; // Use tournament's default gen if no format

  // Split by space and handle various formats
  const parts = formatStr.trim().split(/\s+/);

  if (parts.length === 1) {
    // If only one part, check if it's a generation or tier
    const part = parts[0];
    const normalizedGen = normalizeGeneration(part);
    const normalizedTier = normalizeTier(part);

    // If the part matches a generation (after normalization), use it with default tier
    if (normalizedGen !== defaultGen || part === defaultGen) {
      return `${normalizedGen} OU`;
    }

    // If the part matches a tier (after normalization), use it with tournament's default gen
    if (normalizedTier !== 'OU' || part === 'OU') {
      return `${defaultGen} ${normalizedTier}`;
    }

    // If we can't determine if it's a gen or tier, use tournament's defaults
    return `${defaultGen} OU`;
  }

  if (parts.length === 2) {
    // If two parts, assume it's "Gen Tier"
    return `${normalizeGeneration(parts[0])} ${normalizeTier(parts[1])}`;
  }

  // If more parts or unknown format, use tournament's defaults
  return `${defaultGen} OU`;
};

const parseMatchData = (
  matchData: string,
  roundName: string,
  roundIndex: number,
  currentPlayer: string,
  defaultGen: Generation
): MatchData | null => {
  if (!matchData) return null;

  // Parse match data (e.g., "vs. reiku (W) ORAS OU" or "vs. reiku (W) OU" or "vs. reiku (W) USM OU")
  const trimmedData = matchData.trim();
  if (!trimmedData.startsWith('vs.')) return null;

  // Extract opponent name and result
  const vsIndex = trimmedData.indexOf('vs.');
  const openParenIndex = trimmedData.indexOf('(');
  const closeParenIndex = trimmedData.indexOf(')');

  if (vsIndex === -1 || openParenIndex === -1 || closeParenIndex === -1) {
    logger.warn(`Could not parse match data: ${matchData}`);
    return null;
  }

  const player2 = trimmedData.slice(vsIndex + 3, openParenIndex).trim();
  const result = trimmedData.slice(openParenIndex + 1, closeParenIndex) as
    | 'W'
    | 'L';

  // Extract format from the rest of the string
  const formatStr = trimmedData.slice(closeParenIndex + 1).trim();
  const format = parseFormat(formatStr, defaultGen);

  // Split format into generation and tier
  const [generation, tier] = format.split(' ');

  return {
    roundIndex,
    player1: currentPlayer,
    player2,
    winner: result === 'W' ? 'player1' : 'player2',
    generation,
    tier,
    roundName,
  };
};

const findColumnIndices = (
  headerRow: string[]
): {
  playerIndex: number;
  teamIndex: number;
  priceIndex: number;
  tierIndex: number;
} => {
  const priceIndex = headerRow.findIndex((cell: string) =>
    cell.includes('Cost')
  );
  const playerIndex = headerRow.findIndex((cell: string) =>
    cell.includes('Player')
  );
  const teamIndex = headerRow.findIndex((cell: string) =>
    cell.includes('Team')
  );
  const tierIndex = headerRow.findIndex((cell: string) =>
    cell.includes('Tier')
  );

  return { playerIndex, teamIndex, priceIndex, tierIndex };
};

const findRoundIndices = (headerRow: string[]): number[] => {
  return headerRow
    .map((cell: string, index: number) => {
      if (
        cell.includes('Week') ||
        cell.includes('Semis') ||
        cell.includes('Final') ||
        cell.includes('Tiebreak')
      ) {
        return index;
      }
      return -1;
    })
    .filter((index) => index !== -1);
};

const processPlayerRow = (
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

  return {
    player,
    team,
    price,
  };
};

const getTierFromRow = (row: string[], tierIndex: number): string[] => {
  const tierCell = row[tierIndex];
  if (!tierCell) return [];
  return tierCell.split('/').map((tier) => tier.trim());
};

const processCellWithTier = (
  cell: { formattedValue?: string; note?: string },
  defaultTiers: string[]
): string => {
  const value = cell.formattedValue || '';
  const note = cell.note || '';

  // If there's no match data, return as is
  if (!value.startsWith('vs.')) return value;

  // If there's a note, it indicates a different tier
  if (note) {
    return `${value} ${note}`;
  }

  // If there's only one default tier, use it
  if (defaultTiers.length === 1) {
    return `${value} ${defaultTiers[0]}`;
  }

  // If there are multiple default tiers, use the first one
  return `${value} ${defaultTiers[0]}`;
};

export const extractTournamentData = async ({
  sheetName,
  sheetId,
}: {
  sheetName: string;
  sheetId: string;
}): Promise<TournamentData> => {
  // Get Data from Google Sheets Api
  const sheets = google.sheets({
    version: 'v4',
    auth: process.env.GOOGLE_API_KEY,
  });

  const sheetsData = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    includeGridData: true,
    ranges: [sheetName],
  });

  // Get the first sheet's data
  const sheetData = sheetsData.data.sheets[0].data[0];
  if (!sheetData || !sheetData.rowData) {
    throw new Error('No data found in sheet');
  }

  // Get header row first to find column indices
  const headerRow =
    sheetData.rowData[0]?.values?.map((cell) => cell.formattedValue || '') ||
    [];
  if (!headerRow.length) {
    throw new Error('No header row found in sheet');
  }

  const columnIndices = findColumnIndices(headerRow);
  const roundIndices = findRoundIndices(headerRow);

  // Convert rowData to a 2D array of cell values with tier information
  const data = sheetData.rowData.map((row) => {
    if (!row.values) return [];

    // Get default tiers for this row
    const defaultTiers = getTierFromRow(
      row.values.map((cell) => cell.formattedValue || ''),
      columnIndices.tierIndex
    );

    return row.values.map((cell) => processCellWithTier(cell, defaultTiers));
  });

  // Find the most common generation in the tournament using the tiers column
  const defaultGen = findMostCommonGeneration(data, columnIndices.tierIndex);

  // Process all player data
  const playerData = data
    .slice(1)
    .map((row: string[]) => processPlayerRow(row, columnIndices));

  // Extract unique teams
  const teams = [...new Set(playerData.map((row) => row.team))]
    .filter((team) => !team.includes('/'))
    .map((name) => ({ name }));

  // Extract rounds from the header row
  const rounds = roundIndices.map((index) => ({
    name: headerRow[index],
  }));

  // Extract all matches
  const matches = data.slice(1).flatMap((row: string[]) => {
    const currentPlayer = row[columnIndices.playerIndex];
    return roundIndices
      .map((roundIndex) => {
        const matchData = row[roundIndex];
        return parseMatchData(
          matchData,
          headerRow[roundIndex],
          roundIndex,
          currentPlayer,
          defaultGen
        );
      })
      .filter((match): match is MatchData => match !== null);
  });

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

  console.log(uniqueMatches);

  return;

  return {
    players: playerData,
    teams,
    rounds,
    matches: uniqueMatches,
  };
};
