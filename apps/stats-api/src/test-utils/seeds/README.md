# Seed Data Utilities

This directory contains utilities for generating realistic test data for integration testing. The seed system provides multiple approaches depending on your testing needs.

## 🏗️ Architecture

```
seeds/
├── fixtures/           # Static test data (names, tiers, etc.)
├── factories/          # Entity creation functions
├── scenarios/          # Pre-built test scenarios
└── index.ts           # Main SeedManager API
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { SeedManager } from './test-utils/seeds';

// Create basic tournament structure
const data = await SeedManager.seedScenario('basic');

// Quick entity creation
const entities = await SeedManager.quickSeed({
  tournaments: 3,
  players: 20,
  teams: 8,
});

// Clear all data
await SeedManager.clearAllData();
```

### Integration Test Example

```typescript
import { createApp } from '../app';
import { setupTestDatabase, teardownTestDatabase } from './database-config';
import { SeedManager } from './seeds';

describe('Tournament API', () => {
  let app: Application;
  let testDatabaseUrl: string;

  beforeAll(async () => {
    testDatabaseUrl = await setupTestDatabase();
    app = createApp(testDatabaseUrl);
  }, 30000);

  beforeEach(async () => {
    await SeedManager.clearAllData();
  });

  it('should calculate team statistics', async () => {
    const seedData = await SeedManager.seedScenario('complete-tournament');

    const response = await request(app).get(`/tournaments/${seedData.tournament.id}/stats`).expect(200);

    expect(response.body.totalMatches).toBe(5);
    expect(response.body.teams).toHaveLength(4);
  });
});
```

## 📚 Available Scenarios

### `basic`

- 1 tournament with 2 teams
- 4 players (2 per team)
- 1 round
- No matches or games

Perfect for testing basic CRUD operations.

```typescript
const data = await SeedManager.seedScenario('basic');
// Returns: { tournament, teams, players, rounds, ... }
```

### `complete-tournament`

- 1 full tournament (SPL style)
- 4 teams with 6 players each
- 9 rounds (regular season)
- 5 matches with games and results
- Player with aliases

Perfect for testing complex queries and statistics.

```typescript
const data = await SeedManager.seedScenario('complete-tournament');
// Returns: { tournament, teams, rounds, matches, stats, ... }
```

## 🏭 Factory Functions

Create individual entities with realistic defaults:

### Tournaments

```typescript
import { createTournament } from './seeds';

const tournament = await createTournament({
  name: 'My Tournament',
  year: 2024,
  isOfficial: true,
});
```

### Teams & Players

```typescript
import { createTournamentWithTeams, createPlayerWithAliases } from './seeds';

// Tournament with linked teams
const { tournament, teams } = await createTournamentWithTeams(6);

// Player with aliases
const { player, aliases } = await createPlayerWithAliases('Finchinator', ['Finch', 'FinchTest']);
```

### Matches & Games

```typescript
import { createMatchWithPlayers, createGamesForMatch } from './seeds';

// Create a match between two players
const matchData = await createMatchWithPlayers(
  roundId,
  { playerId: player1.id, tournamentTeamId: team1.id },
  { playerId: player2.id, tournamentTeamId: team2.id },
  { bestOf: 3, tier: 'SV OU' },
  'player1' // winner
);

// Create games for the match
const gamesData = await createGamesForMatch(
  matchData.match.id,
  player1.id,
  player2.id,
  3, // bestOf
  'player1' // match winner
);
```

## 🔧 Quick Seeding

For simple entity creation without relationships:

```typescript
const entities = await SeedManager.quickSeed({
  tournaments: 5, // Creates 5 tournaments
  teams: 12, // Creates 12 teams
  players: 50, // Creates 50 players
});

// No relationships are created - just raw entities
```

## 🧹 Data Management

### Clear All Data

```typescript
// Respects foreign key constraints
await SeedManager.clearAllData();
```

### Get Data Counts

```typescript
const counts = await SeedManager.getDataCounts();
console.log(counts);
// {
//   tournaments: 1,
//   teams: 4,
//   players: 24,
//   matches: 5,
//   games: 8,
//   ...
// }
```

## 📋 Realistic Test Data

The seed system uses realistic Smogon tournament data:

### Tournaments

- Smogon Premier League XIV
- World Cup of Pokemon 2024
- OST VII
- Snake Draft III

### Players

- ABR, BKC, Finchinator, Lax, McMeghan
- Soulwind, TPP, Vileman, dice, John
- 50+ real Smogon player names

### Teams

- Alpha Ruiners, Circus Maximus Tiger Sharks
- Driftveil City Gears, Golden State Georgies
- 10 realistic team names

### Tiers & Formats

- All SV tiers (OU, Ubers, UU, RU, etc.)
- Historical generations (SS, SM, ORAS, BW, etc.)
- National Dex, Doubles, Monotype

## 🎯 Testing Patterns

### Test Suite Level Seeding

```typescript
describe('Tournament Stats', () => {
  let seedData: any;

  beforeAll(async () => {
    seedData = await SeedManager.seedScenario('complete-tournament');
  });

  // All tests share the same seeded data
});
```

### Per-Test Seeding

```typescript
describe('Player Management', () => {
  beforeEach(async () => {
    await SeedManager.clearAllData();
    // Each test gets fresh data
  });

  it('should create player', async () => {
    const data = await SeedManager.quickSeed({ players: 1 });
    // Test with single player
  });
});
```

### Custom Seeding

```typescript
it('should handle complex tournament structure', async () => {
  // Build exact scenario needed
  const tournament = await createTournament({ name: 'Test SPL' });
  const { teams } = await createTournamentWithTeams(8);
  const rounds = await createRegularSeasonRounds(tournament.id, 12);

  // Test specific scenario
});
```

## ⚡ Performance Tips

1. **Batch Operations**: Factories use `Promise.all()` for parallel creation
2. **Realistic Constraints**: Uses actual Smogon data constraints
3. **Efficient Cleanup**: `clearAllData()` respects foreign keys
4. **Minimal Seeding**: Only create what you need for each test

## 🔗 Integration Points

- **Works with** `setupTestDatabase()` / `teardownTestDatabase()`
- **Compatible with** `createApp()` factory pattern
- **Supports** both suite-level and per-test isolation
- **Integrates with** all existing API endpoints

## 📖 Examples

See `seeds.example.test.ts` for comprehensive usage examples including:

- Basic and complete scenario usage
- Custom factory combinations
- API endpoint integration
- Data cleanup verification
- Per-test vs suite-level patterns
