import { google } from 'googleapis';
import logger from '../../utils/logger';

export interface MatchData {
  roundIndex: number;
  player1: string;
  player2: string;
  winner: 'player1' | 'player2';
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

const parseMatchData = (
  matchData: string,
  roundName: string,
  roundIndex: number,
  currentPlayer: string
): MatchData | null => {
  if (!matchData) return null;

  // Parse match data (e.g., "vs. reiku (W) ORAS OU")
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
  const tier = trimmedData.slice(closeParenIndex + 1).trim();

  return {
    roundIndex,
    player1: currentPlayer,
    player2,
    winner: result === 'W' ? 'player1' : 'player2',
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

  return { playerIndex, teamIndex, priceIndex };
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

  // Don't need the full range, a sheet name gets everything in that sheet
  const sheetsData = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetName,
  });

  const data = sheetsData.data.values;
  const headerRow = data[0];

  const columnIndices = findColumnIndices(headerRow);
  const roundIndices = findRoundIndices(headerRow);

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
          currentPlayer
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

  return {
    players: playerData,
    teams,
    rounds,
    matches: uniqueMatches,
  };
};
