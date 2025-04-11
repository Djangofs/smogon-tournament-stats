import { SpreadsheetData } from '../extraction/types';

export async function TransformModernTournamentData({
  spreadsheetData,
}: {
  spreadsheetData: SpreadsheetData;
}) {
  // TODO: Implement modern transformer
  // For now, just use the legacy transformer's logic
  return {
    teams: [],
    players: [],
    rounds: [],
    matches: [],
  };
}
