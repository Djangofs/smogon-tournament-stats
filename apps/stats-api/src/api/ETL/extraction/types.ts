import { sheets_v4 } from 'googleapis';

export interface SpreadsheetData {
  roundIndices: number[];
  columnIndices: {
    playerIndex: number;
    teamIndex: number;
    priceIndex: number;
    tierIndex: number;
  };
  headerRow: string[];
  data: sheets_v4.Schema$GridData;
}
