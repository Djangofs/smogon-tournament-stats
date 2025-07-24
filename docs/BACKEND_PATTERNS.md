# Backend Development Patterns

This document provides detailed implementation patterns and examples for backend development in the Smogon Tournament Stats Node.js/Express API. For general coding standards, see [Coding Standards](./CODING_STANDARDS.md).

## Project Architecture

### Layer Architecture Pattern

```
src/
├── api/                    # API layer - organized by domain
│   ├── tournaments/       # Tournament domain
│   │   ├── tournaments.route.ts      # Routes
│   │   ├── tournaments.controller.ts # Controllers
│   │   ├── tournaments.service.ts    # Business logic
│   │   ├── tournaments.data.ts       # Data access
│   │   └── tournaments.model.ts      # Types/interfaces
│   ├── players/           # Player domain
│   ├── matches/           # Match domain
│   └── ETL/              # Extract, Transform, Load operations
├── middleware/            # Express middleware
├── utils/                # Utility functions
├── prisma/               # Database schema and migrations
├── config.ts             # Configuration management
└── main.ts               # Application entry point
```

### Domain-Driven Organization

Each domain (tournaments, players, matches) follows the same structure:

- **Routes**: Express route definitions
- **Controllers**: Request/response handling
- **Services**: Business logic
- **Data**: Database operations
- **Models**: TypeScript types and interfaces

## API Route Patterns

### Route Structure

```typescript
// Example from apps/stats-api/src/api/tournaments/tournaments.route.ts
import { Request, Response, Router } from 'express';
import { tournamentsController } from './tournaments.controller';
import { requireAdminRole } from '../../middleware/auth.middleware';
import logger from '../../utils/logger';

const router = Router();

// Public routes - no authentication required
router.get('/', getAllTournamentsRoute);

// Protected routes - require admin role
router.post('/', requireAdminRole, createTournamentRoute);

export const tournamentsRouter = router;

// Route handlers - private functions in the same file
async function getAllTournamentsRoute(req: Request, res: Response) {
  try {
    const tournaments = await getAllTournamentsController();
    res.send(tournaments);
  } catch (error) {
    logger.error('Error fetching tournaments', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tournaments',
    });
  }
}
```

### Route Naming Conventions

- Use **descriptive route handler names** ending with `Route`
- Group **public routes first**, then **protected routes**
- Use **middleware consistently** for authentication/authorization
- Export the router with a descriptive name: `tournamentsRouter`

### HTTP Status Code Patterns

```typescript
// Success responses
res.json(data); // 200 OK (default)
res.status(201).json(data); // 201 Created
res.status(204).send(); // 204 No Content

// Client error responses
res.status(400).json({ error: 'Bad Request', message: 'Invalid input' });
res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
res.status(404).json({ error: 'Not Found', message: 'Resource not found' });

// Server error responses
res.status(500).json({ error: 'Internal Server Error', message: 'Generic error message' });
```

## Controller Patterns

### Controller Structure

```typescript
// Example from apps/stats-api/src/api/tournaments/tournaments.controller.ts
import { Request, Response } from 'express';
import { getAllTournaments, createTournament } from './tournaments.service';
import { CreateTournamentRequest } from './tournaments.model';
import logger from '../../utils/logger';

export const tournamentsController = {
  getAllTournaments: async (req: Request, res: Response) => {
    try {
      const tournaments = await getAllTournaments();
      res.json(tournaments);
    } catch (error) {
      logger.error('Error getting tournaments:', error);
      res.status(500).json({ error: 'Failed to get tournaments' });
    }
  },

  createTournament: async (req: Request, res: Response) => {
    try {
      const tournament = await createTournament(req.body as CreateTournamentRequest);
      res.status(201).json(tournament);
    } catch (error) {
      logger.error('Error creating tournament:', error);
      res.status(500).json({ error: 'Failed to create tournament' });
    }
  },
};
```

### Controller Guidelines

- **Export as object** with named methods
- **Always use try-catch** for async operations
- **Log errors** with context before responding
- **Type request bodies** using interfaces
- **Keep controllers thin** - delegate business logic to services
- **Use consistent error response format**

## Service Layer Patterns

### Service Structure

```typescript
// Example from apps/stats-api/src/api/tournaments/tournaments.service.ts
import { tournamentsData } from './tournaments.data';
import { TournamentDatabase } from './tournaments.model';
import logger from '../../utils/logger';

export const createTournament = async ({ name, sheetName, sheetId, isOfficial, isTeam, year, replayPostUrl }: CreateTournamentRequest): Promise<TournamentDatabase> => {
  logger.info(`Starting tournament creation process for ${name}`);

  // Check if tournament already exists
  const existingTournament = await tournamentsData.findTournament({ name });
  if (existingTournament) {
    logger.info(`Tournament ${name} already exists with ID: ${existingTournament.id}`);
    return existingTournament;
  }

  // Create new tournament
  logger.info(`Creating new tournament: ${name}`);
  const tournament = await tournamentsData.createTournament({
    name,
    isOfficial,
    isTeam,
    year,
    replayPostUrl,
  });

  logger.info(`Created tournament with ID: ${tournament.id}`);
  return tournament;
};
```

### Service Guidelines

- **Export individual functions** (not objects)
- **Use descriptive function names** that describe the business operation
- **Include comprehensive logging** at info level for business operations
- **Handle business logic validation**
- **Call data layer for persistence**
- **Return typed results**

## Data Access Patterns

### Prisma Data Layer

```typescript
// Example from apps/stats-api/src/api/players/player.data.ts
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

export const playerData = {
  async findPlayerByName({ name }: { name: string }) {
    try {
      // Try exact match first
      let player = await prisma.player.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        include: { aliases: true },
      });

      // If no exact match, try aliases
      if (!player) {
        const alias = await prisma.playerAlias.findFirst({
          where: { alias: { equals: name, mode: 'insensitive' } },
          include: { player: { include: { aliases: true } } },
        });
        player = alias?.player || null;
      }

      return player;
    } catch (error) {
      logger.error('Error finding player by name:', error);
      throw error;
    }
  },

  async createPlayer({ name }: { name: string }) {
    try {
      return await prisma.player.create({
        data: { name },
      });
    } catch (error) {
      logger.error('Error creating player:', error);
      throw error;
    }
  },

  async updatePlayer({ id, data }: { id: string; data: Partial<Player> }) {
    try {
      return await prisma.player.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('Error updating player:', error);
      throw error;
    }
  },
};
```

### Data Layer Guidelines

- **Export as object** with named methods
- **Use descriptive method names** (findPlayerByName, not getPlayer)
- **Handle all database errors** consistently
- **Use appropriate Prisma includes** for related data
- **Use case-insensitive queries** where appropriate
- **Log errors before rethrowing**

## Configuration Management

### Environment Configuration Pattern

```typescript
// Example from apps/stats-api/src/config.ts
import { z } from 'zod';

// Define the environment schema
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().transform(Number).default('3333'),

  // Auth0 Configuration
  AUTH0_DOMAIN: z.string(),
  AUTH0_AUDIENCE: z.string(),

  // Google API Key
  GOOGLE_API_KEY: z.string(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export configuration object
export const config = {
  server: {
    port: env.PORT,
  },
  google: {
    apiKey: env.GOOGLE_API_KEY,
  },
  auth0: {
    domain: env.AUTH0_DOMAIN,
    audience: env.AUTH0_AUDIENCE,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;
```

### Configuration Guidelines

- **Use Zod for validation** of environment variables
- **Provide sensible defaults** where possible
- **Group related configurations** into objects
- **Use const assertions** for type safety
- **Transform string values** to appropriate types (numbers, booleans)

## Error Handling Patterns

### Global Error Handler

```typescript
// Example from apps/stats-api/src/main.ts
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
});
```

### Service-Level Error Handling

```typescript
// Pattern for handling expected vs unexpected errors
export const getPlayerById = async (id: string): Promise<PlayerDetail> => {
  try {
    const player = await playerData.getPlayerById(id);

    if (!player) {
      // Expected error - return appropriate message
      throw new Error(`Player with ID ${id} not found`);
    }

    return player;
  } catch (error) {
    // Log error with context
    logger.error(`Error getting player ${id}:`, error);

    // Re-throw to let controller handle the response
    throw error;
  }
};
```

## Authentication & Authorization

### Middleware Pattern

```typescript
// Example from apps/stats-api/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import logger from '../utils/logger';

// Initialize Auth0 middleware
const validateAuth0Token = auth({
  audience: 'https://stats-api',
  issuerBaseURL: `https://${process.env['AUTH0_DOMAIN']}/`,
  tokenSigningAlg: 'RS256',
});

// Middleware to check if user has admin role
export const requireAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First validate the token
    await new Promise<void>((resolve, reject) => {
      validateAuth0Token(req, res, (err) => {
        if (err) {
          logger.error('Error validating token', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Check if user has admin role
    const authPayload = (req as any).auth?.payload as Auth0Payload;
    const permissions = authPayload?.permissions || [];

    if (!permissions.includes('admin')) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions to access this resource',
      });
    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  }
};
```

### Authentication Guidelines

- **Use middleware functions** for authentication/authorization
- **Validate tokens first**, then check permissions
- **Log authentication attempts** and failures
- **Return appropriate HTTP status codes** (401 vs 403)
- **Don't expose sensitive information** in error messages

## Logging Patterns

### Logger Setup

```typescript
// Example from apps/stats-api/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export default logger;
```

### Logging Examples by Level

```typescript
// Info level - business operations
logger.info('Starting tournament creation process for Summer Tour');
logger.info(`Found ${players.length} players for tournament`);

// Error level - unexpected errors
logger.error('Error validating token', error);
logger.error('Database connection failed:', error);

// Debug level - detailed flow information
logger.debug(`Processing cell - value: "${value}", note: "${note}"`);
logger.debug(`Found replay URL for match: ${playerPairKey}`);

// Warn level - recoverable issues
logger.warn(`Could not parse match data: ${matchData.value}`);
```

### Logging Guidelines

- Use **Winston** for structured logging
- **Include relevant context** in log messages
- **Log before throwing errors** to maintain context
- **Don't log sensitive information** (passwords, tokens)

## Database Schema Patterns

### Prisma Schema Conventions

```prisma
// Example from apps/stats-api/src/prisma/schema.prisma
model Tournament {
  id           String @db.Uuid @id @default(uuid())
  name         String
  rounds       Round[]
  rosters      Tournament_Team[]
  isOfficial   Boolean @default(false)
  isTeam       Boolean @default(false)
  year         Int
  replayPostUrl String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Player {
  id           String @db.Uuid @id @default(uuid())
  name         String
  matches      Player_Match[]
  games        Player_Game[]
  tournaments  Tournament_Player[]
  aliases      PlayerAlias[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Schema Guidelines

- **Use UUIDs for primary keys** (`@db.Uuid @id @default(uuid())`)
- **Include audit fields** (`createdAt`, `updatedAt`)
- **Use descriptive relation names** for many-to-many tables
- **Make optional fields nullable** with `?`
- **Use appropriate field types** (String, Int, DateTime, Boolean)
- **Define proper relations** between models

## Validation Patterns

### Input Validation with Zod

```typescript
// Define validation schemas
const createTournamentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sheetName: z.string().min(1, 'Sheet name is required'),
  sheetId: z.string().min(1, 'Sheet ID is required'),
  isOfficial: z.boolean().default(false),
  isTeam: z.boolean().default(false),
  year: z.number().int().min(1900).max(2100),
  replayPostUrl: z.string().url().optional(),
});

// Use in controller
export const createTournament = async (req: Request, res: Response) => {
  try {
    const validatedData = createTournamentSchema.parse(req.body);
    const tournament = await tournamentService.createTournament(validatedData);
    res.status(201).json(tournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    } else {
      throw error;
    }
  }
};
```

## Testing Patterns

### Unit Test Structure

```typescript
// Example from apps/stats-api/src/api/ETL/transformation/legacy.transformer.test.ts
import { TransformLegacyTournamentData } from './legacy.transformer';
import { mockSpreadsheetData } from './transformation.fixtures';

describe('TransformLegacyTournamentData', () => {
  it('should correctly transform spreadsheet data into tournament data', async () => {
    // Arrange
    const expectedPlayerCount = 8;
    const expectedTeamCount = 8;

    // Act
    const result = await TransformLegacyTournamentData({
      spreadsheetData: mockSpreadsheetData,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.players).toHaveLength(expectedPlayerCount);
    expect(result.teams).toHaveLength(expectedTeamCount);
    expect(result.matches.length).toBeGreaterThan(0);

    // Verify match structure
    result.matches.forEach((match) => {
      expect(match.player1).toBeDefined();
      expect(match.player2).toBeDefined();
      expect(match.winner).toBeDefined();
      expect(match.generation).toBeDefined();
      expect(match.tier).toBeDefined();
    });
  });

  it('should handle edge cases gracefully', async () => {
    // Test with empty data, malformed data, etc.
  });
});
```

### Integration Test Pattern

```typescript
// Example API integration test
describe('Tournaments API', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestDatabase();
  });

  it('should create a tournament', async () => {
    const tournamentData = {
      name: 'Test Tournament',
      sheetName: 'Test Sheet',
      sheetId: 'test-id',
      isOfficial: true,
      isTeam: false,
      year: 2024,
    };

    const response = await request(app).post('/tournaments').send(tournamentData).expect(201);

    expect(response.body.name).toBe(tournamentData.name);
    expect(response.body.id).toBeDefined();
  });
});
```

## Performance Patterns

### Database Query Optimization

```typescript
// Use appropriate includes to avoid N+1 queries
const getPlayerWithStats = async (id: string) => {
  return prisma.player.findUnique({
    where: { id },
    include: {
      matches: {
        include: {
          match: {
            include: {
              round: {
                include: {
                  tournament: true,
                },
              },
            },
          },
        },
      },
      aliases: true,
    },
  });
};

// Use select to limit returned fields
const getPlayerNames = async () => {
  return prisma.player.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};
```

### Caching Patterns

```typescript
// Simple in-memory cache for static data
const cache = new Map<string, any>();

export const getCachedGenerations = (): Generation[] => {
  const cacheKey = 'generations';

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const generations = GENERATIONS;
  cache.set(cacheKey, generations);
  return generations;
};
```

This backend patterns document focuses specifically on Node.js/Express implementation details while referencing the main coding standards for general guidelines.
