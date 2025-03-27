export const GENERATIONS = [
  'SV',
  'SWSH',
  'SM',
  'ORAS',
  'BW',
  'DPP',
  'ADV',
  'GSC',
  'RBY',
] as const;

export const TIERS = ['OU', 'Uber', 'UU', 'RU', 'NU', 'PU', 'LC'] as const;

export type Generation = (typeof GENERATIONS)[number];
export type Tier = (typeof TIERS)[number];
