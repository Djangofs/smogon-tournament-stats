/**
 * Example integration test demonstrating complete database setup with new app factory
 * This file shows how to use the refactored app creation for testing
 */

import { createApp } from '../app';
import { setupTestDatabase, teardownTestDatabase } from './database-config';
import request from 'supertest';
import type { Application } from 'express';

describe('Integration Test with App Factory', () => {
  let app: Application;
  let testDatabaseUrl: string;

  beforeAll(async () => {
    // Create a fresh database with schema for this test suite
    testDatabaseUrl = await setupTestDatabase();

    // Create app instance with test database
    app = createApp(testDatabaseUrl);

    console.log('Test database ready:', testDatabaseUrl);
  }, 30000);

  afterAll(async () => {
    // Clean up the test database
    if (testDatabaseUrl) {
      await teardownTestDatabase(testDatabaseUrl);
      console.log('Test database cleaned up');
    }
  }, 30000);

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
    // Example: Real API test with database
    const response = await request(app).get('/players').expect(200);

    // Should return empty array for fresh database
    expect(Array.isArray(response.body)).toBe(true);
  });
});

/**
 * Alternative pattern: Per-test database isolation with app factory
 * Use this if you need completely fresh database for each test
 */
describe('Per-Test Database with App Factory', () => {
  let app: Application;
  let testDatabaseUrl: string;

  beforeEach(async () => {
    // Fresh database and app for each test
    testDatabaseUrl = await setupTestDatabase();
    console.log('Test database ready:', testDatabaseUrl);
    app = createApp(testDatabaseUrl);
  }, 30000);

  afterEach(async () => {
    // Clean up after each test
    if (testDatabaseUrl) {
      await teardownTestDatabase(testDatabaseUrl);
    }
  }, 30000);

  it('test 1 has its own database and app', async () => {
    expect(testDatabaseUrl).toBeDefined();
    expect(app).toBeDefined();

    const response = await request(app).get('/api').expect(200);
    expect(response.body.message).toBe('Welcome to stats-api!');
  });

  it('test 2 has its own database and app', async () => {
    expect(testDatabaseUrl).toBeDefined();
    expect(app).toBeDefined();

    // Each test gets completely fresh state
    const response = await request(app).get('/players').expect(200);
    expect(response.body).toEqual([]);
  });
});
