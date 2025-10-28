/**
 * Load Testing Suite for Firebase Services
 *
 * This test suite performs load testing on:
 * - Firestore query performance
 * - Firebase Auth performance
 * - Cloud Storage upload performance
 *
 * Tests are designed to run against a real Firebase instance
 * and measure performance metrics under load.
 */

import { auth, firestore, storage } from '../config/firebase';
import admin from 'firebase-admin';

// Skip these tests in CI/CD or when SKIP_LOAD_TESTS is set
const describeLoadTests = process.env.SKIP_LOAD_TESTS === 'true' ? describe.skip : describe;

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  requestsPerSecond: number;
}

/**
 * Calculate performance metrics from test results
 */
function calculateMetrics(durations: number[], failures: number): PerformanceMetrics {
  const totalRequests = durations.length + failures;
  const successfulRequests = durations.length;
  const failedRequests = failures;
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const requestsPerSecond = totalDuration > 0 ? successfulRequests / (totalDuration / 1000) : 0;

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    totalDuration,
    averageDuration,
    minDuration,
    maxDuration,
    requestsPerSecond,
  };
}

/**
 * Print performance metrics in a readable format
 */
function printMetrics(testName: string, metrics: PerformanceMetrics): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Load Test Results: ${testName}`);
  console.log('='.repeat(60));
  console.log(`Total Requests:       ${metrics.totalRequests}`);
  console.log(`Successful:           ${metrics.successfulRequests}`);
  console.log(`Failed:               ${metrics.failedRequests}`);
  console.log(
    `Success Rate:         ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`
  );
  console.log(`Total Duration:       ${metrics.totalDuration.toFixed(2)}ms`);
  console.log(`Average Duration:     ${metrics.averageDuration.toFixed(2)}ms`);
  console.log(`Min Duration:         ${metrics.minDuration.toFixed(2)}ms`);
  console.log(`Max Duration:         ${metrics.maxDuration.toFixed(2)}ms`);
  console.log(`Requests/Second:      ${metrics.requestsPerSecond.toFixed(2)}`);
  console.log('='.repeat(60));
}

describeLoadTests('Firebase Load Testing', () => {
  // Test configuration
  const CONCURRENT_REQUESTS = 50;
  const SEQUENTIAL_BATCHES = 5;
  const TEST_TIMEOUT = 120000; // 2 minutes

  // Test data cleanup
  const testUserIds: string[] = [];
  const testJobIds: string[] = [];
  const testApplicationIds: string[] = [];

  afterAll(async () => {
    // Cleanup test data
    console.log('\nCleaning up test data...');

    // Delete test users from Auth
    for (const userId of testUserIds) {
      try {
        await auth.deleteUser(userId);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    // Delete test documents from Firestore
    const batch = firestore.batch();

    for (const userId of testUserIds) {
      batch.delete(firestore.collection('users').doc(userId));
      batch.delete(firestore.collection('candidateProfiles').doc(userId));
    }

    for (const jobId of testJobIds) {
      batch.delete(firestore.collection('jobs').doc(jobId));
    }

    for (const appId of testApplicationIds) {
      batch.delete(firestore.collection('applications').doc(appId));
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }

    console.log('Cleanup completed');
  });

  describe('Firestore Query Performance', () => {
    test(
      'should handle concurrent document reads efficiently',
      async () => {
        // Setup: Create test documents
        const testDocs: string[] = [];
        const setupBatch = firestore.batch();

        for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
          const docRef = firestore.collection('jobs').doc();
          testDocs.push(docRef.id);
          testJobIds.push(docRef.id);

          setupBatch.set(docRef, {
            title: `Load Test Job ${i}`,
            description: 'Test job for load testing',
            status: 'published',
            location: 'Remote',
            type: 'full-time',
            level: 'mid',
            orgId: 'test-org',
            createdBy: 'test-user',
            publishedAt: admin.firestore.Timestamp.now(),
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });
        }

        await setupBatch.commit();

        // Test: Concurrent reads
        const durations: number[] = [];
        let failures = 0;

        const readPromises = testDocs.map(async (docId) => {
          const startTime = Date.now();
          try {
            const doc = await firestore.collection('jobs').doc(docId).get();
            const duration = Date.now() - startTime;

            if (doc.exists) {
              durations.push(duration);
            } else {
              failures++;
            }
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(readPromises);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent Document Reads', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(CONCURRENT_REQUESTS * 0.95); // 95% success rate
        expect(metrics.averageDuration).toBeLessThan(500); // Average under 500ms
      },
      TEST_TIMEOUT
    );

    test(
      'should handle concurrent complex queries efficiently',
      async () => {
        const durations: number[] = [];
        let failures = 0;

        const queryPromises = Array.from({ length: CONCURRENT_REQUESTS }, async (_, i) => {
          const startTime = Date.now();
          try {
            const snapshot = await firestore
              .collection('jobs')
              .where('status', '==', 'published')
              .orderBy('publishedAt', 'desc')
              .limit(10)
              .get();

            const duration = Date.now() - startTime;
            durations.push(duration);
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(queryPromises);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent Complex Queries', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(CONCURRENT_REQUESTS * 0.95);
        expect(metrics.averageDuration).toBeLessThan(1000); // Average under 1 second
      },
      TEST_TIMEOUT
    );

    test(
      'should handle sequential batch writes efficiently',
      async () => {
        const durations: number[] = [];
        let failures = 0;

        for (let batchNum = 0; batchNum < SEQUENTIAL_BATCHES; batchNum++) {
          const startTime = Date.now();
          const batch = firestore.batch();

          for (let i = 0; i < 10; i++) {
            const docRef = firestore.collection('applications').doc();
            testApplicationIds.push(docRef.id);

            batch.set(docRef, {
              jobId: 'test-job',
              userId: 'test-user',
              status: 'pending',
              coverLetter: 'Test cover letter',
              createdAt: admin.firestore.Timestamp.now(),
              updatedAt: admin.firestore.Timestamp.now(),
            });
          }

          try {
            await batch.commit();
            const duration = Date.now() - startTime;
            durations.push(duration);
          } catch (error) {
            failures++;
          }
        }

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Sequential Batch Writes (10 docs/batch)', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBe(SEQUENTIAL_BATCHES);
        expect(metrics.averageDuration).toBeLessThan(2000); // Average under 2 seconds
      },
      TEST_TIMEOUT
    );

    test(
      'should handle pagination efficiently',
      async () => {
        const durations: number[] = [];
        let failures = 0;
        const pageSize = 10;
        const numPages = 5;

        let lastDoc: admin.firestore.QueryDocumentSnapshot | null = null;

        for (let page = 0; page < numPages; page++) {
          const startTime = Date.now();
          try {
            let query = firestore
              .collection('jobs')
              .where('status', '==', 'published')
              .orderBy('publishedAt', 'desc')
              .limit(pageSize);

            if (lastDoc) {
              query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();
            const duration = Date.now() - startTime;
            durations.push(duration);

            if (!snapshot.empty) {
              lastDoc = snapshot.docs[snapshot.docs.length - 1];
            }
          } catch (error) {
            failures++;
          }
        }

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Paginated Queries', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBe(numPages);
        expect(metrics.averageDuration).toBeLessThan(1000);
      },
      TEST_TIMEOUT
    );
  });

  describe('Firebase Auth Performance', () => {
    test(
      'should handle concurrent user creation efficiently',
      async () => {
        const durations: number[] = [];
        let failures = 0;
        const numUsers = 20; // Reduced to avoid rate limits

        const createPromises = Array.from({ length: numUsers }, async (_, i) => {
          const startTime = Date.now();
          const email = `loadtest-${Date.now()}-${i}@example.com`;

          try {
            const userRecord = await auth.createUser({
              email,
              password: 'TestPassword123!',
              displayName: `Load Test User ${i}`,
            });

            testUserIds.push(userRecord.uid);

            const duration = Date.now() - startTime;
            durations.push(duration);
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(createPromises);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent User Creation', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(numUsers * 0.9); // 90% success rate
        expect(metrics.averageDuration).toBeLessThan(2000);
      },
      TEST_TIMEOUT
    );

    test(
      'should handle concurrent token verification efficiently',
      async () => {
        // Setup: Create a test user and get a token
        const testEmail = `tokentest-${Date.now()}@example.com`;
        const userRecord = await auth.createUser({
          email: testEmail,
          password: 'TestPassword123!',
        });
        testUserIds.push(userRecord.uid);

        // Create a custom token
        const customToken = await auth.createCustomToken(userRecord.uid);

        const durations: number[] = [];
        let failures = 0;

        // Note: In a real scenario, you'd verify ID tokens, not custom tokens
        // This test simulates the verification load
        const verifyPromises = Array.from({ length: CONCURRENT_REQUESTS }, async () => {
          const startTime = Date.now();
          try {
            // Simulate token verification by getting user
            await auth.getUser(userRecord.uid);
            const duration = Date.now() - startTime;
            durations.push(duration);
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(verifyPromises);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent Token Verification', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(CONCURRENT_REQUESTS * 0.95);
        expect(metrics.averageDuration).toBeLessThan(500);
      },
      TEST_TIMEOUT
    );

    test(
      'should handle concurrent custom claims updates efficiently',
      async () => {
        // Setup: Create test users
        const numUsers = 10;
        const userIds: string[] = [];

        for (let i = 0; i < numUsers; i++) {
          const userRecord = await auth.createUser({
            email: `claimstest-${Date.now()}-${i}@example.com`,
            password: 'TestPassword123!',
          });
          userIds.push(userRecord.uid);
          testUserIds.push(userRecord.uid);
        }

        const durations: number[] = [];
        let failures = 0;

        const claimsPromises = userIds.map(async (uid, i) => {
          const startTime = Date.now();
          try {
            await auth.setCustomUserClaims(uid, {
              role: i % 2 === 0 ? 'candidate' : 'recruiter',
            });
            const duration = Date.now() - startTime;
            durations.push(duration);
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(claimsPromises);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent Custom Claims Updates', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBe(numUsers);
        expect(metrics.averageDuration).toBeLessThan(1000);
      },
      TEST_TIMEOUT
    );
  });

  describe('Cloud Storage Performance', () => {
    test(
      'should handle concurrent small file uploads efficiently',
      async () => {
        const durations: number[] = [];
        let failures = 0;
        const numFiles = 20; // Reduced to avoid rate limits
        const fileSize = 1024 * 10; // 10KB files

        const bucket = storage.bucket();

        const uploadPromises = Array.from({ length: numFiles }, async (_, i) => {
          const startTime = Date.now();
          const fileName = `load-test/small-file-${Date.now()}-${i}.txt`;
          const file = bucket.file(fileName);
          const content = Buffer.alloc(fileSize, 'a');

          try {
            await file.save(content, {
              metadata: {
                contentType: 'text/plain',
              },
            });
            const duration = Date.now() - startTime;
            durations.push(duration);

            // Cleanup
            await file.delete().catch(() => {});
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(uploadPromises);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent Small File Uploads (10KB)', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(numFiles * 0.9);
        expect(metrics.averageDuration).toBeLessThan(3000);
      },
      TEST_TIMEOUT
    );

    test(
      'should handle sequential large file uploads efficiently',
      async () => {
        const durations: number[] = [];
        let failures = 0;
        const numFiles = 5;
        const fileSize = 1024 * 1024; // 1MB files

        const bucket = storage.bucket();

        for (let i = 0; i < numFiles; i++) {
          const startTime = Date.now();
          const fileName = `load-test/large-file-${Date.now()}-${i}.bin`;
          const file = bucket.file(fileName);
          const content = Buffer.alloc(fileSize, 'b');

          try {
            await file.save(content, {
              metadata: {
                contentType: 'application/octet-stream',
              },
            });
            const duration = Date.now() - startTime;
            durations.push(duration);

            // Cleanup
            await file.delete().catch(() => {});
          } catch (error) {
            failures++;
          }
        }

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Sequential Large File Uploads (1MB)', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBe(numFiles);
        expect(metrics.averageDuration).toBeLessThan(10000); // Under 10 seconds
      },
      TEST_TIMEOUT
    );

    test(
      'should handle concurrent file downloads efficiently',
      async () => {
        // Setup: Upload a test file
        const bucket = storage.bucket();
        const fileName = `load-test/download-test-${Date.now()}.txt`;
        const file = bucket.file(fileName);
        const content = Buffer.from('Test content for download');

        await file.save(content, {
          metadata: { contentType: 'text/plain' },
        });

        const durations: number[] = [];
        let failures = 0;
        const numDownloads = 30;

        const downloadPromises = Array.from({ length: numDownloads }, async () => {
          const startTime = Date.now();
          try {
            const [data] = await file.download();
            const duration = Date.now() - startTime;

            if (data.length > 0) {
              durations.push(duration);
            } else {
              failures++;
            }
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(downloadPromises);

        // Cleanup
        await file.delete().catch(() => {});

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Concurrent File Downloads', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(numDownloads * 0.95);
        expect(metrics.averageDuration).toBeLessThan(2000);
      },
      TEST_TIMEOUT
    );
  });

  describe('Combined Load Test', () => {
    test(
      'should handle mixed operations under load',
      async () => {
        const durations: number[] = [];
        let failures = 0;
        const numOperations = 30;

        const operations = Array.from({ length: numOperations }, async (_, i) => {
          const startTime = Date.now();
          const operationType = i % 3;

          try {
            switch (operationType) {
              case 0: // Firestore read
                await firestore
                  .collection('jobs')
                  .where('status', '==', 'published')
                  .limit(5)
                  .get();
                break;

              case 1: // Firestore write
                const docRef = firestore.collection('applications').doc();
                testApplicationIds.push(docRef.id);
                await docRef.set({
                  jobId: 'test-job',
                  userId: 'test-user',
                  status: 'pending',
                  createdAt: admin.firestore.Timestamp.now(),
                });
                break;

              case 2: // Auth operation
                const email = `mixedtest-${Date.now()}-${i}@example.com`;
                const userRecord = await auth.createUser({
                  email,
                  password: 'TestPassword123!',
                });
                testUserIds.push(userRecord.uid);
                break;
            }

            const duration = Date.now() - startTime;
            durations.push(duration);
          } catch (error) {
            failures++;
          }
        });

        await Promise.all(operations);

        const metrics = calculateMetrics(durations, failures);
        printMetrics('Mixed Operations Under Load', metrics);

        // Assertions
        expect(metrics.successfulRequests).toBeGreaterThan(numOperations * 0.9);
        expect(metrics.averageDuration).toBeLessThan(2000);
      },
      TEST_TIMEOUT
    );
  });
});
