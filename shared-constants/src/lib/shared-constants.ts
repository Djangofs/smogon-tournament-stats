export function sharedConstants(): string {
  return 'shared-constants';
}

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
export type Format = `${Generation} ${Tier}`;

const GEN_MAP: Record<string, Generation> = {
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

const TIER_MAP: Record<string, Tier> = {
  OU: 'OU',
  Uber: 'Uber',
  Ubers: 'Uber',
  UU: 'UU',
  RU: 'RU',
  NU: 'NU',
  PU: 'PU',
  LC: 'LC',
};

export const normalizeGeneration = (gen: string): Generation => {
  return GEN_MAP[gen] || GENERATIONS[0]; // Default to latest gen if unknown
};

export const normalizeTier = (tier: string): Tier => {
  return TIER_MAP[tier] || TIERS[0]; // Default to OU if unknown
};

export const parseFormat = (
  formatStr: string,
  defaultGen: Generation
): Format => {
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
