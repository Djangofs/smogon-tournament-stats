/**
 * Example integration test demonstrating complete database setup with new app factory
 * This file shows how to use the refactored app creation for testing
 */

import { createApp } from '../app';
import { setupTestDatabase, teardownTestDatabase } from './database-config';
import { SeedManager } from './seeds';
import request from 'supertest';
import type { Application } from 'express';

describe('Integration Test with App Factory', () => {
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

  it('should have a configured database connection', () => {
    expect(testDatabaseUrl).toBeDefined();
    expect(testDatabaseUrl).toContain('smogon_test_worker_');
    expect(app).toBeDefined();
  });

  it('should respond to health check endpoint', async () => {
    const response = await request(app).get('/api').expect(200);
    expect(response.body.message).toBe('Welcome to stats-api!');
  });

  it('should be able to use the database for API calls', async () => {
    const response = await request(app).get('/players').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should work with seeded tournament data', async () => {
    // Seed some basic tournament data
    const seedData = await SeedManager.seedScenario('basic');

    // Test that we can retrieve the tournament
    const response = await request(app).get('/tournaments').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Test Tournament Basic');
    expect(response.body[0].year).toBe(2024);

    // Test that we can retrieve players
    const playersResponse = await request(app).get('/players').expect(200);
    expect(playersResponse.body).toHaveLength(4);

    // Verify seeded data structure
    expect(seedData.tournament).toBeDefined();
    expect(seedData.teams).toHaveLength(2);
    expect(seedData.players).toHaveLength(4);
  });
});

describe('Per-Test Database with App Factory', () => {
  let app: Application;
  let testDatabaseUrl: string;

  beforeEach(async () => {
    testDatabaseUrl = await setupTestDatabase();
    app = createApp(testDatabaseUrl);
  }, 30000);

  afterEach(async () => {
    if (testDatabaseUrl) {
      await teardownTestDatabase(testDatabaseUrl);
    }
  }, 30000);

  it('test 1 has its own database and app with quick seed', async () => {
    expect(testDatabaseUrl).toBeDefined();
    expect(app).toBeDefined();

    // Quick seed some data
    await SeedManager.quickSeed({
      tournaments: 2,
      players: 5,
    });

    const response = await request(app).get('/api').expect(200);
    expect(response.body.message).toBe('Welcome to stats-api!');

    const tournamentsResponse = await request(app)
      .get('/tournaments')
      .expect(200);
    expect(tournamentsResponse.body).toHaveLength(2);

    const playersResponse = await request(app).get('/players').expect(200);
    expect(playersResponse.body).toHaveLength(5);
  });

  it('test 2 has its own database and app with complete scenario', async () => {
    expect(testDatabaseUrl).toBeDefined();
    expect(app).toBeDefined();

    // Seed complete tournament data
    const seedData = await SeedManager.seedScenario('complete-tournament');

    const response = await request(app).get('/players').expect(200);
    expect(response.body.length).toBeGreaterThan(20); // Should have 24+ players

    const tournamentResponse = await request(app)
      .get('/tournaments')
      .expect(200);
    expect(tournamentResponse.body).toHaveLength(1);
    expect(tournamentResponse.body[0].name).toBe('SPL XIV (Test)');

    // Verify the comprehensive data was created
    expect(seedData.stats.totalTeams).toBe(4);
    expect(seedData.stats.totalMatches).toBe(5);
    expect(seedData.stats.totalGames).toBeGreaterThan(0);
  });
});
