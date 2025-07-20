import { db } from './index';
import { sql } from 'drizzle-orm';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  database: {
    connected: boolean;
    latency?: number;
    error?: string;
  };
  timestamp: string;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test database connection with a simple query
    await db.execute(sql`SELECT 1`);
    
    const latency = Date.now() - startTime;
    
    return {
      status: 'healthy',
      database: {
        connected: true,
        latency,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      timestamp: new Date().toISOString(),
    };
  }
}