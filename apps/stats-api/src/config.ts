import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

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

// Export type for the config object
export type Config = typeof config;
