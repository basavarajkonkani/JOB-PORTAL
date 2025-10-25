import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL connection pool with optimized settings for performance
 * 
 * Configuration:
 * - max: Maximum number of clients in the pool (20 for balanced performance)
 * - min: Minimum number of clients to keep in the pool (2 for quick response)
 * - idleTimeoutMillis: How long a client can be idle before being closed (30s)
 * - connectionTimeoutMillis: How long to wait for a connection (2s)
 * - allowExitOnIdle: Allow pool to close when all clients are idle (false for production)
 * - statement_timeout: Maximum query execution time (30s)
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'jobportal_db',
  user: process.env.DB_USER || 'jobportal',
  password: process.env.DB_PASSWORD || 'jobportal_dev',
  
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '2'), // Minimum pool size
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
  allowExitOnIdle: false, // Keep pool alive in production
  
  // Query settings
  statement_timeout: 30000, // 30 seconds max query time
  query_timeout: 30000, // 30 seconds
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✅ New database connection established');
});

pool.on('acquire', () => {
  console.log('🔄 Database connection acquired from pool');
});

pool.on('remove', () => {
  console.log('❌ Database connection removed from pool');
});

export default pool;
