import { PrismaClient } from '@prisma/client';
import { config } from '../config';

class DatabaseClient {
  private static instance: PrismaClient | null = null;
  private static customUrl: string | null = null;

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        datasources: {
          db: {
            url: this.customUrl || config.database.url,
          },
        },
      });
    }
    return this.instance;
  }

  // For testing: Override database URL at runtime
  static setDatabaseUrl(url: string): void {
    this.customUrl = url;
    this.resetInstance();
  }

  static resetInstance(): void {
    if (this.instance) {
      this.instance.$disconnect();
      this.instance = null;
    }
  }

  // For testing: Create isolated client
  static createTestClient(databaseUrl: string): PrismaClient {
    return new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
    });
  }
}

// Export getter function instead of pre-instantiated client
export const getDbClient = (): PrismaClient => DatabaseClient.getInstance();
export const DatabaseManager = DatabaseClient;
