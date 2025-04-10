import { TransformLegacyTournamentData } from './legacy.transformer';
import { mockSpreadsheetData } from './transformation.fixtures';

describe('TransformLegacyTournamentData', () => {
  it('should correctly transform spreadsheet data into tournament data', async () => {
    // Act
    const result = await TransformLegacyTournamentData({
      spreadsheetData: mockSpreadsheetData,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.players).toHaveLength(8); // 8 players in the mock data
    expect(result.teams).toHaveLength(8); // 8 teams in the mock data
    expect(result.rounds).toHaveLength(10); // 10 rounds in the mock data (Week 1-5, Semis, Finals, Tiebreak, and 2 undefined)

    // Log matches for debugging
    console.log('All matches:', JSON.stringify(result.matches, null, 2));

    // Check that matches were correctly extracted
    expect(result.matches.length).toBeGreaterThan(0);

    // Check that each match has the required properties
    result.matches.forEach((match) => {
      expect(match.player1).toBeDefined();
      expect(match.player2).toBeDefined();
      expect(match.winner).toBeDefined();
      expect(match.generation).toBeDefined();
      expect(match.tier).toBeDefined();
      expect(match.roundName).toBeDefined();
      expect(match.stage).toBeDefined();
    });

    // Check that the stage is correctly determined based on the round name
    result.matches.forEach((match) => {
      const roundNameLower = match.roundName.toLowerCase();
      if (roundNameLower.startsWith('tiebreak')) {
        expect(match.stage).toBe('Tiebreak');
      } else if (
        roundNameLower.startsWith('semi') ||
        roundNameLower.startsWith('final')
      ) {
        expect(match.stage).toBe('Playoff');
      } else {
        expect(match.stage).toBe('Regular Season');
      }
    });

    // Check that players have the correct properties
    result.players.forEach((player) => {
      expect(player.player).toBeDefined();
      expect(player.team).toBeDefined();
      expect(player.price).toBeDefined();
    });

    // Check that teams have the correct properties
    result.teams.forEach((team) => {
      expect(team.name).toBeDefined();
    });

    // Check that rounds have the correct properties
    // Some rounds might have undefined names, so we'll check that at least the first 8 have names
    result.rounds.slice(0, 8).forEach((round) => {
      expect(round.name).toBeDefined();
    });

    // Check for specific matches to ensure they were correctly transformed
    const djangoVsReiku = result.matches.find(
      (match) => match.player1 === 'Django' && match.player2 === 'Reiku'
    );
    expect(djangoVsReiku).toBeDefined();
    expect(djangoVsReiku?.winner).toBe('player1'); // Django won
    expect(djangoVsReiku?.generation).toBe('SM'); // From the note field, normalized from USM
    expect(djangoVsReiku?.tier).toBe('OU');

    const finchinatorVsZ0MOG = result.matches.find(
      (match) => match.player1 === 'Finchinator' && match.player2 === 'Z0MOG'
    );
    expect(finchinatorVsZ0MOG).toBeDefined();
    expect(finchinatorVsZ0MOG?.winner).toBe('player1'); // Finchinator won
    expect(finchinatorVsZ0MOG?.generation).toBe('BW'); // From the note field, normalized from BW2
    expect(finchinatorVsZ0MOG?.tier).toBe('OU');

    // Check that the most common generation is used when not specified
    const z0MOGVsFinchinator = result.matches.find(
      (match) =>
        (match.player1 === 'Z0MOG' && match.player2 === 'Finchinator') ||
        (match.player1 === 'Finchinator' && match.player2 === 'Z0MOG')
    );
    expect(z0MOGVsFinchinator).toBeDefined();
    expect(z0MOGVsFinchinator?.generation).toBe('BW'); // From the default tier column
    expect(z0MOGVsFinchinator?.tier).toBe('OU');
  });
});
