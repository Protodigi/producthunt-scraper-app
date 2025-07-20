import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
// For production on Railway, this will use the provided connection string
// with SSL enabled and proper connection pooling
const sql = postgres(connectionString, {
  // Railway PostgreSQL requires SSL in production
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  // Connection pool settings
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export * from './schema';

// Export utilities
export * from './utils';

// Export health check
export { performHealthCheck } from './health';
export type { HealthCheckResult } from './health';

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper function to close database connection (useful for scripts)
export async function closeDatabaseConnection(): Promise<void> {
  await sql.end();
}