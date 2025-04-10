export const findColumnIndices = (
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

export const findRoundIndices = (headerRow: string[]): number[] => {
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
