# Dynamic Database Configuration

The stats-api now supports dynamic database configuration for different environments and testing scenarios.

## Environment Variables

The application checks for database URLs in this priority order:

1. `TEST_DATABASE_URL` - Highest priority, used for testing
2. `DATABASE_URL_OVERRIDE` - Runtime override capability
3. `DATABASE_URL` - Default configuration

## Usage Examples

### Development (Default)

```bash
# Uses DATABASE_URL from your .env file
npm run nx serve stats-api
```

### Testing with Different Database

```bash
# Override at runtime
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/smogon_test" npm run nx serve stats-api

# Or using the built-in test configuration
npm run nx serve:test-db stats-api
```

### Runtime Override

```bash
# Temporary override without changing .env
DATABASE_URL_OVERRIDE="postgresql://user:pass@localhost:5432/smogon_staging" npm run nx serve stats-api
```

### CI/CD Integration

```bash
# In your CI pipeline
export TEST_DATABASE_URL="postgresql://user:pass@postgres:5432/smogon_test_$CI_JOB_ID"
npm run nx serve stats-api
```

## Application Architecture

The application now uses a **clean separation** between app creation and server lifecycle:

- **`app.ts`** - Pure factory function that creates Express app instances with configurable database URLs
- **`main.ts`** - Production entry point that creates and starts the server
- **Tests** - Import `createApp()` to get testable app instances with isolated databases

### Benefits:

- ✅ **Clean Dependency Injection** - Database URL passed explicitly to app creation
- ✅ **No Side Effects** - App creation doesn't start servers or read environment
- ✅ **Testable** - Pure function returns configurable Express app
- ✅ **Flexible** - Same app factory works for production, testing, and development
- ✅ **Dynamic Database Switching** - Tests get fresh database connections via getter function

## Integration Testing Strategy

The application now supports **full database lifecycle management** for testing:

### 1. **Complete Integration Testing with App Factory**

```typescript
import { createApp } from '../app';
import { setupTestDatabase, teardownTestDatabase } from './test-utils/database-config';
import request from 'supertest';

// In test setup - creates database + runs migrations + creates app
const testDbUrl = await setupTestDatabase();
const app = createApp(testDbUrl);

// Use the app for API testing
const response = await request(app).get('/api/players').expect(200);

// In test teardown - drops the database
await teardownTestDatabase(testDbUrl);
```

### 2. **Per-Test-Worker Isolation**

```typescript
// Each Jest worker gets a unique database automatically
const testDbUrl = await setupTestDatabase();
// Example: postgresql://user:pass@localhost:5432/smogon_test_worker_1_1672531200000
```

### 3. **App Factory for Different Environments**

```typescript
import { createApp } from './app';

// Production (uses environment variables)
const app = createApp();

// Testing with specific database
const testApp = createApp('postgresql://user:pass@localhost:5432/test_db');

// Development with override
const devApp = createApp('postgresql://user:pass@localhost:5432/dev_custom');
```

### 4. **Complete Test Lifecycle**

The `setupTestDatabase()` function performs these steps:

1. **Generate unique database name** (includes worker ID + timestamp)
2. **Create new PostgreSQL database** using admin connection
3. **Run Prisma migrations** to set up schema
4. **Configure application** to use the new database
5. **Return database URL** for cleanup

The `teardownTestDatabase()` function:

1. **Disconnect** from test database
2. **Drop database** completely
3. **Reset** database client to default state

### 5. **Database Client Architecture**

The database client uses a **getter function pattern** to ensure tests use the correct database:

```typescript
// ❌ OLD: Pre-instantiated client (caches first connection)
export const dbClient = DatabaseClient.getInstance();

// ✅ NEW: Getter function (fresh connection each time)
export const getDbClient = () => DatabaseClient.getInstance();
```

**Why this matters for testing:**

- **Module caching**: JavaScript modules are cached on first import
- **Pre-instantiated clients**: Get frozen to the original database URL
- **Getter functions**: Call `getInstance()` fresh each time, respecting `setDatabaseUrl()` changes
- **Test isolation**: Each test gets the correct database connection

## Example .env Configuration

```bash
# Primary database
DATABASE_URL="postgresql://user:pass@localhost:5432/smogon_dev"

# Test database (optional)
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/smogon_test"

# Other required variables
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_AUDIENCE="your-audience"
GOOGLE_API_KEY="your-google-api-key"
LOG_LEVEL="info"
PORT=3333
```
