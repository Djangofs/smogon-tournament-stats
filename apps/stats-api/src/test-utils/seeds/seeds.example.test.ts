import { createApp } from '../../app';
import { setupTestDatabase, teardownTestDatabase } from '../database-config';
import {
  SeedManager,
  createTournament,
  createPlayer,
  createPlayerWithAliases,
} from './index';
import request from 'supertest';
import type { Application } from 'express';

describe('Seed Data Examples', () => {
  let app: Application;
  let testDatabaseUrl: string;

  beforeAll(async () => {
    testDatabaseUrl = await setupTestDatabase();
    app = createApp(testDatabaseUrl);
    console.log('Test database ready:', testDatabaseUrl);
  }, 30000);

  afterAll(async () => {
    if (testDatabaseUrl) {
      await teardownTestDatabase(testDatabaseUrl);
      console.log('Test database cleaned up');
    }
  }, 30000);

  beforeEach(async () => {
    // Clear data before each test
    await SeedManager.clearAllData();
  });

  describe('Basic Scenario Seeding', () => {
    it('should create basic tournament data', async () => {
      const seedData = await SeedManager.seedScenario('basic');

      expect(seedData.tournament).toBeDefined();
      expect(seedData.teams).toHaveLength(2);
      expect(seedData.players).toHaveLength(4);
      expect(seedData.rounds).toHaveLength(1);

      // Verify API returns the seeded data
      const response = await request(app).get('/tournaments').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Tournament Basic');
    });

    it('should verify data counts after basic seeding', async () => {
      await SeedManager.seedScenario('basic');

      const counts = await SeedManager.getDataCounts();
      expect(counts.tournaments).toBe(1);
      expect(counts.teams).toBe(2);
      expect(counts.players).toBe(4);
      expect(counts.rounds).toBe(1);
      expect(counts.tournamentTeams).toBe(2);
      expect(counts.tournamentPlayers).toBe(4);
    });
  });

  describe('Complete Tournament Scenario', () => {
    it('should create a full tournament with matches and games', async () => {
      const seedData = await SeedManager.seedScenario('complete-tournament');

      expect(seedData.tournament).toBeDefined();
      expect(seedData.teams).toHaveLength(4);
      expect(seedData.rounds).toHaveLength(9);
      expect(seedData.matches.length).toBeGreaterThan(0);
      expect(seedData.matchGames.length).toBeGreaterThan(0);

      // Verify the stats summary
      expect(seedData.stats.totalTeams).toBe(4);
      expect(seedData.stats.totalPlayers).toBe(24); // 6 players per team * 4 teams
      expect(seedData.stats.totalRounds).toBe(9);
      expect(seedData.stats.totalMatches).toBe(5); // 3 + 2 matches
      expect(seedData.stats.totalGames).toBeGreaterThan(0);

      // Test API endpoints with the seeded data
      const tournamentResponse = await request(app)
        .get('/tournaments')
        .expect(200);
      expect(tournamentResponse.body).toHaveLength(1);

      const playersResponse = await request(app).get('/players').expect(200);
      expect(playersResponse.body.length).toBeGreaterThan(20);
    });

    it('should create player with aliases', async () => {
      const seedData = await SeedManager.seedScenario('complete-tournament');

      expect(seedData.playerWithAliases.player.name).toBe('Finchinator');
      expect(seedData.playerWithAliases.aliases).toHaveLength(2);

      const counts = await SeedManager.getDataCounts();
      expect(counts.playerAliases).toBe(2);
    });
  });

  describe('Quick Seeding', () => {
    it('should create entities without relationships', async () => {
      const seedData = await SeedManager.quickSeed({
        tournaments: 3,
        teams: 8,
        players: 20,
      });

      expect(seedData.tournaments).toHaveLength(3);
      expect(seedData.teams).toHaveLength(8);
      expect(seedData.players).toHaveLength(20);

      // Verify they exist in database
      const counts = await SeedManager.getDataCounts();
      expect(counts.tournaments).toBe(3);
      expect(counts.teams).toBe(8);
      expect(counts.players).toBe(20);

      // But no relationships should exist
      expect(counts.tournamentTeams).toBe(0);
      expect(counts.tournamentPlayers).toBe(0);
    });
  });

  describe('Custom Factory Usage', () => {
    it('should use individual factory functions', async () => {
      // Create custom tournament
      const tournament = await createTournament({
        name: 'My Custom Tournament',
        year: 2025,
        isOfficial: false,
        isTeam: true,
      });

      expect(tournament.name).toBe('My Custom Tournament');
      expect(tournament.year).toBe(2025);
      expect(tournament.isOfficial).toBe(false);

      // Create players with specific names
      const player1 = await createPlayer({ name: 'CustomPlayer1' });
      const player2 = await createPlayerWithAliases('CustomPlayer2', [
        'CP2',
        'Player2Alt',
      ]);

      expect(player1.name).toBe('CustomPlayer1');
      expect(player2.player.name).toBe('CustomPlayer2');
      expect(player2.aliases).toHaveLength(2);

      // Verify via API
      const tournamentResponse = await request(app)
        .get('/tournaments')
        .expect(200);
      expect(tournamentResponse.body).toHaveLength(1);
      expect(tournamentResponse.body[0].name).toBe('My Custom Tournament');
    });
  });

  describe('Data Cleanup', () => {
    it('should clear all data properly', async () => {
      // First seed some data
      await SeedManager.seedScenario('complete-tournament');

      let counts = await SeedManager.getDataCounts();
      expect(counts.tournaments).toBeGreaterThan(0);
      expect(counts.players).toBeGreaterThan(0);

      // Clear all data
      await SeedManager.clearAllData();

      counts = await SeedManager.getDataCounts();
      expect(counts.tournaments).toBe(0);
      expect(counts.teams).toBe(0);
      expect(counts.players).toBe(0);
      expect(counts.rounds).toBe(0);
      expect(counts.matches).toBe(0);
      expect(counts.games).toBe(0);
      expect(counts.tournamentTeams).toBe(0);
      expect(counts.tournamentPlayers).toBe(0);
      expect(counts.playerMatches).toBe(0);
      expect(counts.playerGames).toBe(0);
      expect(counts.playerAliases).toBe(0);
    });
  });

  describe('Integration with API Endpoints', () => {
    it('should test player statistics with seeded data', async () => {
      const seedData = await SeedManager.seedScenario('complete-tournament');

      // Get a player who has played matches
      const playerWithMatches = seedData.teamPlayers[0].players[0];

      const response = await request(app)
        .get(`/players/${playerWithMatches.id}`)
        .expect(200);

      expect(response.body.id).toBe(playerWithMatches.id);
      expect(response.body.name).toBeDefined();
    });

    it('should test tournament data retrieval', async () => {
      const seedData = await SeedManager.seedScenario('complete-tournament');

      const response = await request(app).get('/tournaments').expect(200);
      expect(response.body).toHaveLength(1);

      const tournament = response.body[0];
      expect(tournament.id).toBe(seedData.tournament.id);
      expect(tournament.name).toBe('SPL XIV (Test)');
      expect(tournament.year).toBe(2024);
      expect(tournament.isTeam).toBe(true);
    });
  });
});
