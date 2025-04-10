import { google } from 'googleapis';
import { findColumnIndices, findRoundIndices } from './helpers';
import { SpreadsheetData } from './types';

export const extractDataFromSheet = async ({
  sheetName,
  sheetId,
}: {
  sheetName: string;
  sheetId: string;
}): Promise<SpreadsheetData> => {
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

  return {
    columnIndices,
    roundIndices,
    headerRow,
    data: sheetData,
  };
};
