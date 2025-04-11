import { TransformSPLMiddleTournamentData } from './spl-middle.transformer';
import { splMiddleSpreadsheetData } from './transformation.fixtures';
import { TournamentData } from './types';

describe('TransformSPLMiddleTournamentData', () => {
  let result: TournamentData;

  beforeAll(async () => {
    // Act
    result = await TransformSPLMiddleTournamentData({
      spreadsheetData: splMiddleSpreadsheetData,
    });
  });

  it('should correctly count the total number of matches', () => {
    // Assert
    expect(result).toBeDefined();
    expect(result.matches).toBeDefined();

    // Count the total number of matches
    const totalMatches = result.matches.length;
    console.log(`Total matches: ${totalMatches}`);

    // Verify total number of matches
    expect(totalMatches).toBe(60); // 12 matches per round × 5 rounds (24 players ÷ 2 players per match)
  });

  it('should correctly extract player data', () => {
    // Assert
    expect(result.players).toBeDefined();
    expect(result.players.length).toBe(24); // 24 players in the tournament

    // Verify each player has valid data
    result.players.forEach((player) => {
      expect(player.player).toBeDefined();
      expect(player.team).toBeDefined();
      expect(player.price).toBeDefined();
    });

    // Verify specific players exist
    const playerNames = result.players.map((p) => p.player);
    expect(playerNames).toContain('TrainerRed');
    expect(playerNames).toContain('BlueOak');
    expect(playerNames).toContain('GreenLeaf');
  });

  it('should correctly extract team data', () => {
    // Assert
    expect(result.teams).toBeDefined();
    expect(result.teams.length).toBe(6); // 6 teams in the tournament

    // Verify each team has a valid name
    result.teams.forEach((team) => {
      expect(team.name).toBeDefined();
    });

    // Verify specific teams exist
    const teamNames = result.teams.map((t) => t.name);
    expect(teamNames).toContain('KantoElite');
    expect(teamNames).toContain('JohtoChamps');
    expect(teamNames).toContain('HoennHeroes');
    expect(teamNames).toContain('SinnohStars');
    expect(teamNames).toContain('UnovaUnited');
    expect(teamNames).toContain('KalosKings');
  });

  it('should correctly extract round data', () => {
    // Assert
    expect(result.rounds).toBeDefined();
    expect(result.rounds.length).toBe(5); // 5 rounds in the tournament

    // Verify each round has a valid name
    result.rounds.forEach((round) => {
      expect(round.name).toBeDefined();
    });

    // Verify round names match expected format
    const roundNames = result.rounds.map((r) => r.name);
    expect(roundNames).toContain('Round 1');
    expect(roundNames).toContain('Round 2');
    expect(roundNames).toContain('Round 3');
    expect(roundNames).toContain('Round 4');
    expect(roundNames).toContain('Round 5');
  });

  it('should correctly extract match data', () => {
    // Assert
    expect(result.matches).toBeDefined();

    // Verify each match has valid data
    result.matches.forEach((match) => {
      expect(match.player1).toBeDefined();
      expect(match.player2).toBeDefined();
      expect(match.winner).toBeDefined();
      expect(match.generation).toBeDefined();
      expect(match.tier).toBeDefined();
      expect(match.roundName).toBeDefined();
      expect(match.roundIndex).toBeDefined();
      expect(match.stage).toBeDefined();

      // Verify winner is either player1 or player2
      expect(['player1', 'player2']).toContain(match.winner);
    });
  });

  it('should ensure match uniqueness', () => {
    // Create a set of unique match keys
    const uniqueMatchKeys = new Set<string>();

    result.matches.forEach((match) => {
      const matchKey = [match.player1, match.player2].sort().join(' vs ');
      uniqueMatchKeys.add(matchKey);
    });

    // Verify that the number of unique matches equals the total number of matches
    expect(uniqueMatchKeys.size).toBe(result.matches.length);
  });

  it('should ensure each player participates in exactly one match per round', () => {
    // Create a map to track player participation per round
    const playerParticipation = new Map<string, Set<string>>();

    // Initialize the map
    result.players.forEach((player) => {
      playerParticipation.set(player.player, new Set<string>());
    });

    // Track player participation
    result.matches.forEach((match) => {
      playerParticipation.get(match.player1)?.add(match.roundName);
      playerParticipation.get(match.player2)?.add(match.roundName);
    });

    // Verify each player participates in exactly one match per round
    result.players.forEach((player) => {
      const participation = playerParticipation.get(player.player);
      expect(participation?.size).toBe(result.rounds.length);

      // Verify player participates in each round
      result.rounds.forEach((round) => {
        expect(participation?.has(round.name)).toBe(true);
      });
    });
  });

  it('should ensure each team has at least one player participating', () => {
    // Create a map to track team participation
    const teamParticipation = new Map<string, boolean>();

    // Initialize the map
    result.teams.forEach((team) => {
      teamParticipation.set(team.name, false);
    });

    // Track team participation
    result.players.forEach((player) => {
      teamParticipation.set(player.team, true);
    });

    // Verify each team has at least one player participating
    result.teams.forEach((team) => {
      expect(teamParticipation.get(team.name)).toBe(true);
    });
  });

  it('should correctly normalize generations', () => {
    // Verify that all generations are normalized
    result.matches.forEach((match) => {
      // Check that the generation is one of the expected values
      expect(['SS', 'USM', 'ORAS', 'DPP', 'BW', 'XY', 'SM']).toContain(
        match.generation
      );
    });
  });

  it('should correctly determine match stages', () => {
    // Verify that all matches have a valid stage
    result.matches.forEach((match) => {
      // Check that the stage is one of the expected values
      expect(['Regular Season', 'Playoffs']).toContain(match.stage);
    });
  });
});
