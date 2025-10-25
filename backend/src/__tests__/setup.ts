import { Pool } from 'pg';
import redisClient from '../config/redis';

// Test database connection
let testPool: Pool;

export async function setupTestDatabase() {
  testPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'job_portal_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  // Clean up test data before tests
  await cleanDatabase();
}

export async function cleanDatabase() {
  if (!testPool) return;

  try {
    // Delete in order to respect foreign key constraints
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM metrics_cache');
    await testPool.query('DELETE FROM applications');
    await testPool.query('DELETE FROM resume_versions');
    await testPool.query('DELETE FROM resumes');
    await testPool.query('DELETE FROM jobs');
    await testPool.query('DELETE FROM candidate_profiles');
    await testPool.query('DELETE FROM recruiter_profiles');
    await testPool.query('DELETE FROM users');
    await testPool.query('DELETE FROM orgs');
  } catch (error) {
    console.error('Error cleaning database:', error);
  }
}

export async function teardownTestDatabase() {
  if (testPool) {
    await cleanDatabase();
    await testPool.end();
  }

  // Close Redis connection
  try {
    await redisClient.quit();
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}

export function getTestPool(): Pool {
  return testPool;
}

// Global setup and teardown
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

afterEach(async () => {
  await cleanDatabase();
});
