import { SpreadsheetData } from '../extraction/types';

/**
 * Mock data for testing the transformation functions
 */
export const mockSpreadsheetData: SpreadsheetData = {
  roundIndices: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  columnIndices: {
    playerIndex: 0,
    teamIndex: 1,
    priceIndex: 2,
    tierIndex: 3,
  },
  headerRow: [
    'Player',
    'Team',
    'Cost',
    'Tier',
    'Week 1',
    'Week 2',
    'Week 3',
    'Week 4',
    'Week 5',
    'Semis',
    'Finals',
    'Tiebreak',
  ],
  data: {
    rowData: [
      {
        values: [
          { formattedValue: 'Player' },
          { formattedValue: 'Team' },
          { formattedValue: 'Cost' },
          { formattedValue: 'Tier' },
          { formattedValue: 'Week 1' },
          { formattedValue: 'Week 2' },
          { formattedValue: 'Week 3' },
          { formattedValue: 'Week 4' },
          { formattedValue: 'Week 5' },
          { formattedValue: 'Semis' },
          { formattedValue: 'Finals' },
          { formattedValue: 'Tiebreak' },
        ],
      },
      {
        values: [
          { formattedValue: 'Django' },
          { formattedValue: 'Team Alpha' },
          { formattedValue: '10.5' },
          { formattedValue: 'SS OU / USM OU' },
          { formattedValue: 'vs. Reiku (W)', note: 'USM OU' },
          { formattedValue: 'vs. Finchinator (L)', note: 'SS OU' },
          { formattedValue: 'vs. Z0MOG (W)' },
          { formattedValue: 'vs. ABR (W)', note: 'BW2 OU' },
          { formattedValue: 'vs. Empo (L)' },
          { formattedValue: 'vs. ABR (W)' },
          { formattedValue: 'vs. Empo (W)' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'Reiku' },
          { formattedValue: 'Team Beta' },
          { formattedValue: '9.0' },
          { formattedValue: 'USM OU' },
          { formattedValue: 'vs. Django (L)' },
          { formattedValue: 'vs. Z0MOG (W)', note: 'SS OU' },
          { formattedValue: 'vs. Finchinator (L)' },
          { formattedValue: 'vs. Empo (W)', note: 'ORAS OU' },
          { formattedValue: 'vs. ABR (L)' },
          { formattedValue: '' },
          { formattedValue: '' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'Finchinator' },
          { formattedValue: 'Team Gamma' },
          { formattedValue: '11.0' },
          { formattedValue: 'SS OU / BW2 OU' },
          { formattedValue: 'vs. Z0MOG (W)', note: 'BW2 OU' },
          { formattedValue: 'vs. Django (W)' },
          { formattedValue: 'vs. Reiku (W)', note: 'ORAS OU' },
          { formattedValue: 'vs. ABR (L)' },
          { formattedValue: 'vs. Empo (W)', note: 'USM OU' },
          { formattedValue: 'vs. Empo (L)' },
          { formattedValue: '' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'Z0MOG' },
          { formattedValue: 'Team Delta' },
          { formattedValue: '8.5' },
          { formattedValue: 'ORAS OU' },
          { formattedValue: 'vs. Finchinator (L)' },
          { formattedValue: 'vs. Reiku (L)' },
          { formattedValue: 'vs. Django (L)', note: 'USM OU' },
          { formattedValue: 'vs. Empo (L)', note: 'SS OU' },
          { formattedValue: 'vs. ABR (L)' },
          { formattedValue: '' },
          { formattedValue: '' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'ABR' },
          { formattedValue: 'Team Epsilon' },
          { formattedValue: '10.0' },
          { formattedValue: 'SS OU / ORAS OU' },
          { formattedValue: 'vs. Empo (W)', note: 'ORAS OU' },
          { formattedValue: 'vs. Z0MOG (W)' },
          { formattedValue: 'vs. Finchinator (W)', note: 'USM OU' },
          { formattedValue: 'vs. Django (L)', note: 'BW2 OU' },
          { formattedValue: 'vs. Reiku (W)' },
          { formattedValue: 'vs. Django (L)' },
          { formattedValue: '' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'Empo' },
          { formattedValue: 'Team Zeta' },
          { formattedValue: '9.5' },
          { formattedValue: 'SS OU / BW2 OU' },
          { formattedValue: 'vs. ABR (L)' },
          { formattedValue: 'vs. Django (W)', note: 'USM OU' },
          { formattedValue: 'vs. Z0MOG (W)' },
          { formattedValue: 'vs. Reiku (L)' },
          { formattedValue: 'vs. Finchinator (L)', note: 'ORAS OU' },
          { formattedValue: 'vs. Finchinator (W)' },
          { formattedValue: 'vs. Django (L)' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'Lycans' },
          { formattedValue: 'Team Omega' },
          { formattedValue: '8.0' },
          { formattedValue: 'SS UU / USM UU' },
          { formattedValue: 'vs. Z0MOG (W)', note: 'SS UU' },
          { formattedValue: 'vs. Reiku (L)', note: 'USM UU' },
          { formattedValue: 'vs. Finchinator (L)' },
          { formattedValue: 'vs. ABR (W)', note: 'ORAS UU' },
          { formattedValue: 'vs. Empo (L)' },
          { formattedValue: '' },
          { formattedValue: '' },
          { formattedValue: '' },
        ],
      },
      {
        values: [
          { formattedValue: 'Lopunny' },
          { formattedValue: 'Team Theta' },
          { formattedValue: '7.5' },
          { formattedValue: 'SS RU / USM RU' },
          { formattedValue: 'vs. Finchinator (L)', note: 'SS RU' },
          { formattedValue: 'vs. Z0MOG (W)', note: 'USM RU' },
          { formattedValue: 'vs. Reiku (L)' },
          { formattedValue: 'vs. ABR (L)', note: 'ORAS RU' },
          { formattedValue: 'vs. Empo (W)' },
          { formattedValue: '' },
          { formattedValue: '' },
          { formattedValue: '' },
        ],
      },
    ],
  },
};

/**
 * Mock data for SPL Middle tournament with proper scheduling
 * Each player plays exactly once per round with no duplicates
 */
export const splMiddleSpreadsheetData: SpreadsheetData = {
  roundIndices: [5, 6, 7, 8, 9],
  columnIndices: {
    playerIndex: 0,
    teamIndex: 1,
    priceIndex: 2,
    tierIndex: 3,
  },
  headerRow: [
    'Player',
    'Team',
    'Cost',
    'Tier(s)',
    'Record',
    'Round 1',
    'Round 2',
    'Round 3',
    'Round 4',
    'Round 5',
  ],
  data: {
    rowData: [
      // Header row
      {
        values: [
          { formattedValue: 'Player' },
          { formattedValue: 'Team' },
          { formattedValue: 'Cost' },
          { formattedValue: 'Tier(s)' },
          { formattedValue: 'Record' },
          { formattedValue: 'Round 1' },
          { formattedValue: 'Round 2' },
          { formattedValue: 'Round 3' },
          { formattedValue: 'Round 4' },
          { formattedValue: 'Round 5' },
        ],
      },
      // KantoElite - TrainerRed
      {
        values: [
          { formattedValue: 'TrainerRed' },
          { formattedValue: 'KantoElite' },
          { formattedValue: '25000' },
          { formattedValue: 'SS OU' },
          { formattedValue: '4 - 1 - 0' },
          { formattedValue: 'W vs CrystalClear (SS OU)' },
          { formattedValue: 'W vs EmeraldGreen (SS OU)' },
          { formattedValue: 'W vs Platinum (SS OU)' },
          { formattedValue: 'W vs Calem (SS OU)' },
          { formattedValue: 'W vs Hilbert (SS OU)' },
        ],
      },
      // KantoElite - BlueOak
      {
        values: [
          { formattedValue: 'BlueOak' },
          { formattedValue: 'KantoElite' },
          { formattedValue: '22000' },
          { formattedValue: 'SM OU / USM OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs SilverRocket (SM OU)' },
          { formattedValue: 'L vs DiamondPearl (USM OU)' },
          { formattedValue: 'L vs Pearl (SM OU)' },
          { formattedValue: 'L vs Serena (USM OU)' },
          { formattedValue: 'L vs Hilda (SM OU)' },
        ],
      },
      // KantoElite - GreenLeaf
      {
        values: [
          { formattedValue: 'GreenLeaf' },
          { formattedValue: 'KantoElite' },
          { formattedValue: '18000' },
          { formattedValue: 'ORAS OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'L vs RubyRed (ORAS OU)' },
          { formattedValue: 'W vs BlackWhite (ORAS OU)' },
          { formattedValue: 'W vs Diamond (ORAS OU)' },
          { formattedValue: 'L vs Lysandre (ORAS OU)' },
          { formattedValue: 'L vs N (ORAS OU)' },
        ],
      },
      // KantoElite - YellowPika
      {
        values: [
          { formattedValue: 'YellowPika' },
          { formattedValue: 'KantoElite' },
          { formattedValue: '15000' },
          { formattedValue: 'DPP OU / BW OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'W vs SapphireBlue (DPP OU)' },
          { formattedValue: 'L vs XY (BW OU)' },
          { formattedValue: 'W vs Cyrus (DPP OU)' },
          { formattedValue: 'L vs Diantha (BW OU)' },
          { formattedValue: 'L vs Ghetsis (DPP OU)' },
        ],
      },
      // JohtoChamps - CrystalClear
      {
        values: [
          { formattedValue: 'CrystalClear' },
          { formattedValue: 'JohtoChamps' },
          { formattedValue: '20000' },
          { formattedValue: 'SS OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'L vs TrainerRed (SS OU)' },
          { formattedValue: 'W vs Hilbert (SS OU)' },
          { formattedValue: 'L vs Calem (SS OU)' },
          { formattedValue: 'W vs EmeraldGreen (SS OU)' },
          { formattedValue: 'W vs Platinum (SS OU)' },
        ],
      },
      // JohtoChamps - SilverRocket
      {
        values: [
          { formattedValue: 'SilverRocket' },
          { formattedValue: 'JohtoChamps' },
          { formattedValue: '12000' },
          { formattedValue: 'BW OU / XY OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'L vs BlueOak (BW OU)' },
          { formattedValue: 'L vs Hilda (XY OU)' },
          { formattedValue: 'W vs Serena (BW OU)' },
          { formattedValue: 'L vs DiamondPearl (XY OU)' },
          { formattedValue: 'W vs Pearl (BW OU)' },
        ],
      },
      // JohtoChamps - RubyRed
      {
        values: [
          { formattedValue: 'RubyRed' },
          { formattedValue: 'JohtoChamps' },
          { formattedValue: '19000' },
          { formattedValue: 'ORAS OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'W vs GreenLeaf (ORAS OU)' },
          { formattedValue: 'W vs N (ORAS OU)' },
          { formattedValue: 'W vs Lysandre (ORAS OU)' },
          { formattedValue: 'L vs BlackWhite (ORAS OU)' },
          { formattedValue: 'L vs Diamond (ORAS OU)' },
        ],
      },
      // JohtoChamps - SapphireBlue
      {
        values: [
          { formattedValue: 'SapphireBlue' },
          { formattedValue: 'JohtoChamps' },
          { formattedValue: '17000' },
          { formattedValue: 'ORAS OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'L vs YellowPika (ORAS OU)' },
          { formattedValue: 'W vs Ghetsis (ORAS OU)' },
          { formattedValue: 'L vs Diantha (ORAS OU)' },
          { formattedValue: 'W vs XY (ORAS OU)' },
          { formattedValue: 'W vs Cyrus (ORAS OU)' },
        ],
      },
      // HoennHeroes - EmeraldGreen
      {
        values: [
          { formattedValue: 'EmeraldGreen' },
          { formattedValue: 'HoennHeroes' },
          { formattedValue: '16000' },
          { formattedValue: 'ORAS OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'W vs Platinum (ORAS OU)' },
          { formattedValue: 'L vs TrainerRed (ORAS OU)' },
          { formattedValue: 'L vs Hilbert (ORAS OU)' },
          { formattedValue: 'L vs CrystalClear (ORAS OU)' },
          { formattedValue: 'L vs Calem (ORAS OU)' },
        ],
      },
      // HoennHeroes - DiamondPearl
      {
        values: [
          { formattedValue: 'DiamondPearl' },
          { formattedValue: 'HoennHeroes' },
          { formattedValue: '14000' },
          { formattedValue: 'DPP OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'L vs Pearl (DPP OU)' },
          { formattedValue: 'W vs BlueOak (DPP OU)' },
          { formattedValue: 'W vs Hilda (DPP OU)' },
          { formattedValue: 'W vs SilverRocket (DPP OU)' },
          { formattedValue: 'L vs Pearl (DPP OU)' },
        ],
      },
      // HoennHeroes - BlackWhite
      {
        values: [
          { formattedValue: 'BlackWhite' },
          { formattedValue: 'HoennHeroes' },
          { formattedValue: '13000' },
          { formattedValue: 'BW OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs Diamond (BW OU)' },
          { formattedValue: 'L vs GreenLeaf (BW OU)' },
          { formattedValue: 'W vs N (BW OU)' },
          { formattedValue: 'W vs RubyRed (BW OU)' },
          { formattedValue: 'W vs Diamond (BW OU)' },
        ],
      },
      // HoennHeroes - XY
      {
        values: [
          { formattedValue: 'XY' },
          { formattedValue: 'HoennHeroes' },
          { formattedValue: '11000' },
          { formattedValue: 'XY OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs Cyrus (XY OU)' },
          { formattedValue: 'W vs YellowPika (XY OU)' },
          { formattedValue: 'W vs Ghetsis (XY OU)' },
          { formattedValue: 'L vs SapphireBlue (XY OU)' },
          { formattedValue: 'L vs Diantha (XY OU)' },
        ],
      },
      // SinnohStars - Platinum
      {
        values: [
          { formattedValue: 'Platinum' },
          { formattedValue: 'SinnohStars' },
          { formattedValue: '10000' },
          { formattedValue: 'DPP OU' },
          { formattedValue: '1 - 4 - 0' },
          { formattedValue: 'L vs EmeraldGreen (DPP OU)' },
          { formattedValue: 'W vs Calem (DPP OU)' },
          { formattedValue: 'L vs TrainerRed (DPP OU)' },
          { formattedValue: 'L vs Hilbert (DPP OU)' },
          { formattedValue: 'L vs CrystalClear (DPP OU)' },
        ],
      },
      // SinnohStars - Pearl
      {
        values: [
          { formattedValue: 'Pearl' },
          { formattedValue: 'SinnohStars' },
          { formattedValue: '9000' },
          { formattedValue: 'DPP OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs DiamondPearl (DPP OU)' },
          { formattedValue: 'W vs Serena (DPP OU)' },
          { formattedValue: 'W vs BlueOak (DPP OU)' },
          { formattedValue: 'W vs Hilda (DPP OU)' },
          { formattedValue: 'L vs SilverRocket (DPP OU)' },
        ],
      },
      // SinnohStars - Diamond
      {
        values: [
          { formattedValue: 'Diamond' },
          { formattedValue: 'SinnohStars' },
          { formattedValue: '8000' },
          { formattedValue: 'DPP OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'L vs BlackWhite (DPP OU)' },
          { formattedValue: 'W vs Lysandre (DPP OU)' },
          { formattedValue: 'L vs GreenLeaf (DPP OU)' },
          { formattedValue: 'W vs N (DPP OU)' },
          { formattedValue: 'W vs RubyRed (DPP OU)' },
        ],
      },
      // SinnohStars - Cyrus
      {
        values: [
          { formattedValue: 'Cyrus' },
          { formattedValue: 'SinnohStars' },
          { formattedValue: '7000' },
          { formattedValue: 'DPP OU' },
          { formattedValue: '1 - 4 - 0' },
          { formattedValue: 'L vs XY (DPP OU)' },
          { formattedValue: 'L vs Diantha (DPP OU)' },
          { formattedValue: 'L vs YellowPika (DPP OU)' },
          { formattedValue: 'L vs Ghetsis (DPP OU)' },
          { formattedValue: 'L vs SapphireBlue (DPP OU)' },
        ],
      },
      // UnovaUnited - Hilbert
      {
        values: [
          { formattedValue: 'Hilbert' },
          { formattedValue: 'UnovaUnited' },
          { formattedValue: '6000' },
          { formattedValue: 'BW OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'L vs Calem (BW OU)' },
          { formattedValue: 'L vs CrystalClear (BW OU)' },
          { formattedValue: 'W vs EmeraldGreen (BW OU)' },
          { formattedValue: 'W vs Platinum (BW OU)' },
          { formattedValue: 'L vs TrainerRed (BW OU)' },
        ],
      },
      // UnovaUnited - Hilda
      {
        values: [
          { formattedValue: 'Hilda' },
          { formattedValue: 'UnovaUnited' },
          { formattedValue: '5000' },
          { formattedValue: 'BW OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs Serena (BW OU)' },
          { formattedValue: 'W vs SilverRocket (BW OU)' },
          { formattedValue: 'L vs DiamondPearl (BW OU)' },
          { formattedValue: 'W vs Pearl (BW OU)' },
          { formattedValue: 'W vs BlueOak (BW OU)' },
        ],
      },
      // UnovaUnited - N
      {
        values: [
          { formattedValue: 'N' },
          { formattedValue: 'UnovaUnited' },
          { formattedValue: '4000' },
          { formattedValue: 'BW OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs Lysandre (BW OU)' },
          { formattedValue: 'L vs RubyRed (BW OU)' },
          { formattedValue: 'W vs BlackWhite (BW OU)' },
          { formattedValue: 'L vs Diamond (BW OU)' },
          { formattedValue: 'W vs GreenLeaf (BW OU)' },
        ],
      },
      // UnovaUnited - Ghetsis
      {
        values: [
          { formattedValue: 'Ghetsis' },
          { formattedValue: 'UnovaUnited' },
          { formattedValue: '3000' },
          { formattedValue: 'BW OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'L vs Diantha (BW OU)' },
          { formattedValue: 'L vs SapphireBlue (BW OU)' },
          { formattedValue: 'L vs XY (BW OU)' },
          { formattedValue: 'W vs Cyrus (BW OU)' },
          { formattedValue: 'W vs YellowPika (BW OU)' },
        ],
      },
      // KalosKings - Calem
      {
        values: [
          { formattedValue: 'Calem' },
          { formattedValue: 'KalosKings' },
          { formattedValue: '2000' },
          { formattedValue: 'XY OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs Hilbert (XY OU)' },
          { formattedValue: 'L vs Platinum (XY OU)' },
          { formattedValue: 'W vs CrystalClear (XY OU)' },
          { formattedValue: 'L vs TrainerRed (XY OU)' },
          { formattedValue: 'W vs EmeraldGreen (XY OU)' },
        ],
      },
      // KalosKings - Serena
      {
        values: [
          { formattedValue: 'Serena' },
          { formattedValue: 'KalosKings' },
          { formattedValue: '1000' },
          { formattedValue: 'XY OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'L vs Hilda (XY OU)' },
          { formattedValue: 'L vs Pearl (XY OU)' },
          { formattedValue: 'L vs SilverRocket (XY OU)' },
          { formattedValue: 'W vs BlueOak (XY OU)' },
          { formattedValue: 'W vs DiamondPearl (XY OU)' },
        ],
      },
      // KalosKings - Lysandre
      {
        values: [
          { formattedValue: 'Lysandre' },
          { formattedValue: 'KalosKings' },
          { formattedValue: '900' },
          { formattedValue: 'XY OU' },
          { formattedValue: '2 - 3 - 0' },
          { formattedValue: 'L vs N (XY OU)' },
          { formattedValue: 'L vs Diamond (XY OU)' },
          { formattedValue: 'L vs RubyRed (XY OU)' },
          { formattedValue: 'W vs GreenLeaf (XY OU)' },
          { formattedValue: 'L vs BlackWhite (XY OU)' },
        ],
      },
      // KalosKings - Diantha
      {
        values: [
          { formattedValue: 'Diantha' },
          { formattedValue: 'KalosKings' },
          { formattedValue: '800' },
          { formattedValue: 'XY OU' },
          { formattedValue: '3 - 2 - 0' },
          { formattedValue: 'W vs Ghetsis (XY OU)' },
          { formattedValue: 'W vs Cyrus (XY OU)' },
          { formattedValue: 'W vs SapphireBlue (XY OU)' },
          { formattedValue: 'W vs YellowPika (XY OU)' },
          { formattedValue: 'W vs XY (XY OU)' },
        ],
      },
    ],
  },
};

/**
 * Mock replay data for testing
 */
export const mockReplayData = [
  {
    player1: 'Django',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123456',
  },
  {
    player1: 'Django',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123457',
  },
  {
    player1: 'Django',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123458',
  },
  {
    player1: 'Django',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen5ou-123459',
  },
  {
    player1: 'Django',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123460',
  },
  {
    player1: 'Reiku',
    player2: 'Django',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123461',
  },
  {
    player1: 'Reiku',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123462',
  },
  {
    player1: 'Reiku',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123463',
  },
  {
    player1: 'Reiku',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123464',
  },
  {
    player1: 'Reiku',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123465',
  },
  {
    player1: 'Finchinator',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen5ou-123466',
  },
  {
    player1: 'Finchinator',
    player2: 'Django',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123467',
  },
  {
    player1: 'Finchinator',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123468',
  },
  {
    player1: 'Finchinator',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123469',
  },
  {
    player1: 'Finchinator',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123470',
  },
  {
    player1: 'Z0MOG',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen5ou-123471',
  },
  {
    player1: 'Z0MOG',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123472',
  },
  {
    player1: 'Z0MOG',
    player2: 'Django',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123473',
  },
  {
    player1: 'Z0MOG',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123474',
  },
  {
    player1: 'Z0MOG',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123475',
  },
  {
    player1: 'ABR',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123476',
  },
  {
    player1: 'ABR',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123477',
  },
  {
    player1: 'ABR',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ou-123478',
  },
  {
    player1: 'ABR',
    player2: 'Django',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen5ou-123479',
  },
  {
    player1: 'ABR',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123480',
  },
  {
    player1: 'Empo',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123481',
  },
  {
    player1: 'Empo',
    player2: 'Django',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123482',
  },
  {
    player1: 'Empo',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123483',
  },
  {
    player1: 'Empo',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ou-123484',
  },
  {
    player1: 'Empo',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ou-123485',
  },
  {
    player1: 'Lycans',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8uu-123486',
  },
  {
    player1: 'Lycans',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7uu-123487',
  },
  {
    player1: 'Lycans',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8uu-123488',
  },
  {
    player1: 'Lycans',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6uu-123489',
  },
  {
    player1: 'Lycans',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8uu-123490',
  },
  {
    player1: 'Lopunny',
    player2: 'Finchinator',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ru-123491',
  },
  {
    player1: 'Lopunny',
    player2: 'Z0MOG',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen7ru-123492',
  },
  {
    player1: 'Lopunny',
    player2: 'Reiku',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ru-123493',
  },
  {
    player1: 'Lopunny',
    player2: 'ABR',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen6ru-123494',
  },
  {
    player1: 'Lopunny',
    player2: 'Empo',
    replayUrl: 'https://replay.pokemonshowdown.com/smogtours-gen8ru-123495',
  },
];
