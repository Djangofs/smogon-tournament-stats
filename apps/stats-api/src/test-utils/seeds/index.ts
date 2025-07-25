import { getDbClient } from '../../database/client';
import { seedBasicData } from './scenarios/basic.scenario';
import { seedCompleteTournament } from './scenarios/complete-tournament.scenario';
import { createTournaments } from './factories/tournament.factory';
import { createTeams } from './factories/team.factory';
import { createPlayers } from './factories/player.factory';

export interface QuickSeedConfig {
  tournaments?: number;
  teams?: number;
  players?: number;
}

export interface SeedResults {
  tournaments?: any[];
  teams?: any[];
  players?: any[];
  [key: string]: any;
}

export class SeedManager {
  /**
   * Seed data using predefined scenarios
   */
  static async seedScenario(
    scenarioName: string,
    options?: any
  ): Promise<SeedResults> {
    switch (scenarioName) {
      case 'basic':
        return await seedBasicData();
      case 'complete-tournament':
        return await seedCompleteTournament();
      default:
        throw new Error(`Unknown scenario: ${scenarioName}`);
    }
  }

  /**
   * Quickly seed simple entities without relationships
   */
  static async quickSeed(entities: QuickSeedConfig): Promise<SeedResults> {
    const results: SeedResults = {};

    if (entities.tournaments) {
      results.tournaments = await createTournaments(entities.tournaments);
    }

    if (entities.teams) {
      results.teams = await createTeams(entities.teams);
    }

    if (entities.players) {
      results.players = await createPlayers(entities.players);
    }

    return results;
  }

  /**
   * Clear all data from the database in the correct order
   * (respects foreign key constraints)
   */
  static async clearAllData(): Promise<void> {
    const client = getDbClient();

    // Delete in reverse dependency order
    await client.playerAlias.deleteMany();
    await client.player_Game.deleteMany();
    await client.player_Match.deleteMany();
    await client.game.deleteMany();
    await client.match.deleteMany();
    await client.round.deleteMany();
    await client.tournament_Player.deleteMany();
    await client.tournament_Team.deleteMany();
    await client.player.deleteMany();
    await client.team.deleteMany();
    await client.tournament.deleteMany();
  }

  /**
   * Get count of all entities for verification
   */
  static async getDataCounts(): Promise<Record<string, number>> {
    const client = getDbClient();

    const [
      tournaments,
      teams,
      players,
      rounds,
      matches,
      games,
      tournamentTeams,
      tournamentPlayers,
      playerMatches,
      playerGames,
      playerAliases,
    ] = await Promise.all([
      client.tournament.count(),
      client.team.count(),
      client.player.count(),
      client.round.count(),
      client.match.count(),
      client.game.count(),
      client.tournament_Team.count(),
      client.tournament_Player.count(),
      client.player_Match.count(),
      client.player_Game.count(),
      client.playerAlias.count(),
    ]);

    return {
      tournaments,
      teams,
      players,
      rounds,
      matches,
      games,
      tournamentTeams,
      tournamentPlayers,
      playerMatches,
      playerGames,
      playerAliases,
    };
  }
}

// Export factory functions for direct use
export * from './factories/tournament.factory';
export * from './factories/team.factory';
export * from './factories/player.factory';
export * from './factories/round.factory';
export * from './factories/match.factory';
export * from './factories/game.factory';

// Export scenarios
export * from './scenarios/basic.scenario';
export * from './scenarios/complete-tournament.scenario';

// Export fixtures for custom seeding
export * from './fixtures/tournaments.fixtures';
