import { DatabaseManager } from '../database/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class TestDatabaseConfig {
  /**
   * Generate a unique test database URL for a Jest worker
   */
  static generateTestDatabaseUrl(workerId = 1): string {
    const baseUrl =
      process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432';
    const timestamp = Date.now();
    const testDbName = `smogon_test_worker_${workerId}_${timestamp}`;

    // Replace database name in URL
    return baseUrl.replace(/\/[^/?]+(\?|$)/, `/${testDbName}$1`);
  }

  /**
   * Extract connection details from DATABASE_URL
   */
  static parseConnectionUrl(databaseUrl: string) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: url.port || '5432',
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      adminDatabase: 'postgres', // Default admin database
    };
  }

  /**
   * Create a new database and run migrations
   */
  static async setupTestDatabase(databaseUrl?: string): Promise<string> {
    const testDbUrl =
      databaseUrl || this.generateTestDatabaseUrl(getJestWorkerId());
    const dbConfig = this.parseConnectionUrl(testDbUrl);

    try {
      // Step 1: Create the database
      await this.createDatabase(dbConfig);

      // Step 2: Run migrations on the new database
      await this.runMigrations(testDbUrl);

      // Step 3: Configure the application to use this database
      DatabaseManager.setDatabaseUrl(testDbUrl);

      console.log(`✅ Test database setup complete: ${dbConfig.database}`);
      return testDbUrl;
    } catch (error) {
      console.error(
        `❌ Failed to setup test database: ${dbConfig.database}`,
        error
      );
      // Cleanup on failure
      await this.teardownTestDatabase(testDbUrl).catch(() => {
        // Ignore cleanup errors
      });
      throw error;
    }
  }

  /**
   * Create a new PostgreSQL database
   */
  static async createDatabase(
    dbConfig: ReturnType<typeof TestDatabaseConfig.parseConnectionUrl>
  ): Promise<void> {
    const adminUrl = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.adminDatabase}`;

    // Use Prisma to create the database since we already have it as a dependency
    const createDbCommand = `npx prisma db execute --url="${adminUrl}" --stdin <<< "CREATE DATABASE \\"${dbConfig.database}\\""`;

    try {
      await execAsync(createDbCommand);
      console.log(`📄 Created database: ${dbConfig.database}`);
    } catch (error) {
      // Database might already exist, check if it's a "already exists" error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists')) {
        console.log(`📄 Database already exists: ${dbConfig.database}`);
        return;
      }
      throw new Error(
        `Failed to create database ${dbConfig.database}: ${errorMessage}`
      );
    }
  }

  /**
   * Run Prisma migrations on the test database
   */
  static async runMigrations(databaseUrl: string): Promise<void> {
    // Use relative path from the current working directory
    const schemaPath = process.cwd().includes('apps/stats-api')
      ? 'src/prisma/schema.prisma'
      : 'apps/stats-api/src/prisma/schema.prisma';

    // Set the DATABASE_URL for this migration run
    const migrationCommand = `DATABASE_URL="${databaseUrl}" npx prisma migrate deploy --schema ${schemaPath}`;

    try {
      const { stdout, stderr } = await execAsync(migrationCommand);
      console.log(`🔄 Migrations completed for test database`);
      if (stdout) console.log('Migration output:', stdout);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Migration error:', errorMessage);
      throw new Error(`Failed to run migrations: ${errorMessage}`);
    }
  }

  /**
   * Clean up test database by dropping it
   */
  static async teardownTestDatabase(databaseUrl: string): Promise<void> {
    const dbConfig = this.parseConnectionUrl(databaseUrl);
    const adminUrl = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.adminDatabase}`;

    try {
      // Disconnect any existing connections first
      DatabaseManager.resetInstance();

      // Drop the database
      const dropDbCommand = `npx prisma db execute --url="${adminUrl}" --stdin <<< "DROP DATABASE IF EXISTS \\"${dbConfig.database}\\""`;
      await execAsync(dropDbCommand);

      console.log(`🗑️  Dropped test database: ${dbConfig.database}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `❌ Failed to drop test database ${dbConfig.database}:`,
        errorMessage
      );
      // Don't throw here - cleanup should be best effort
    }
  }

  /**
   * Configure database for testing environment
   */
  static configureForTesting(databaseUrl?: string): void {
    const testDbUrl = databaseUrl || this.generateTestDatabaseUrl();
    DatabaseManager.setDatabaseUrl(testDbUrl);
  }

  /**
   * Reset to default database configuration
   */
  static resetToDefault(): void {
    DatabaseManager.resetInstance();
  }

  /**
   * Get current database URL (for debugging)
   */
  static getCurrentDatabaseUrl(): string | undefined {
    return (
      process.env.TEST_DATABASE_URL ||
      process.env.DATABASE_URL_OVERRIDE ||
      process.env.DATABASE_URL
    );
  }
}

// For Jest worker detection
export const getJestWorkerId = (): number => {
  return parseInt(process.env.JEST_WORKER_ID || '1', 10);
};

// Utility for integration tests - with full database setup
export const setupTestDatabase = async (
  customUrl?: string
): Promise<string> => {
  return await TestDatabaseConfig.setupTestDatabase(customUrl);
};

// Utility for integration tests - cleanup
export const teardownTestDatabase = async (
  databaseUrl: string
): Promise<void> => {
  await TestDatabaseConfig.teardownTestDatabase(databaseUrl);
};
