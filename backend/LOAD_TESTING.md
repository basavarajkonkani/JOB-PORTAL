# Firebase Load Testing Guide

This document describes the load testing suite for Firebase services and how to interpret the results.

## Overview

The load testing suite evaluates the performance of Firebase services under various load conditions:

- **Firestore Query Performance**: Tests read/write operations, complex queries, batch operations, and pagination
- **Firebase Auth Performance**: Tests user creation, token verification, and custom claims updates
- **Cloud Storage Performance**: Tests file uploads and downloads of various sizes
- **Combined Load Tests**: Tests mixed operations to simulate real-world usage

## Running Load Tests

### Prerequisites

1. **Firebase Project**: Ensure you have a Firebase project configured
2. **Service Account**: Set up Firebase Admin SDK credentials in `.env`
3. **Environment Variables**: Configure all required Firebase environment variables

### Quick Start

```bash
# Navigate to backend directory
cd backend

# Run load tests
./scripts/run-load-tests.sh
```

### Manual Execution

```bash
# Run all load tests
npm test -- load-testing.test.ts --verbose --runInBand

# Run specific test suite
npm test -- load-testing.test.ts -t "Firestore Query Performance"

# Skip load tests (useful in CI/CD)
SKIP_LOAD_TESTS=true npm test
```

## Test Configuration

The load tests use the following configuration (defined in `load-testing.test.ts`):

```typescript
const CONCURRENT_REQUESTS = 50; // Number of concurrent operations
const SEQUENTIAL_BATCHES = 5; // Number of sequential batch operations
const TEST_TIMEOUT = 120000; // Test timeout (2 minutes)
```

You can modify these values to adjust the load intensity.

## Test Suites

### 1. Firestore Query Performance

#### Concurrent Document Reads

- **Purpose**: Measure performance of simultaneous document reads
- **Load**: 50 concurrent read operations
- **Expected**: 95%+ success rate, <500ms average response time

#### Concurrent Complex Queries

- **Purpose**: Test complex queries with filtering and sorting
- **Load**: 50 concurrent queries with where/orderBy/limit
- **Expected**: 95%+ success rate, <1000ms average response time

#### Sequential Batch Writes

- **Purpose**: Evaluate batch write performance
- **Load**: 5 batches of 10 documents each
- **Expected**: 100% success rate, <2000ms average per batch

#### Pagination

- **Purpose**: Test paginated query performance
- **Load**: 5 pages of 10 documents each
- **Expected**: 100% success rate, <1000ms average per page

### 2. Firebase Auth Performance

#### Concurrent User Creation

- **Purpose**: Test user creation under load
- **Load**: 20 concurrent user creation requests
- **Expected**: 90%+ success rate, <2000ms average response time
- **Note**: Reduced load to avoid Firebase rate limits

#### Concurrent Token Verification

- **Purpose**: Measure token verification performance
- **Load**: 50 concurrent verification requests
- **Expected**: 95%+ success rate, <500ms average response time

#### Concurrent Custom Claims Updates

- **Purpose**: Test custom claims update performance
- **Load**: 10 concurrent claims updates
- **Expected**: 100% success rate, <1000ms average response time

### 3. Cloud Storage Performance

#### Concurrent Small File Uploads

- **Purpose**: Test small file upload performance
- **Load**: 20 concurrent uploads of 10KB files
- **Expected**: 90%+ success rate, <3000ms average response time

#### Sequential Large File Uploads

- **Purpose**: Test large file upload performance
- **Load**: 5 sequential uploads of 1MB files
- **Expected**: 100% success rate, <10000ms average per upload

#### Concurrent File Downloads

- **Purpose**: Measure file download performance
- **Load**: 30 concurrent downloads
- **Expected**: 95%+ success rate, <2000ms average response time

### 4. Combined Load Test

#### Mixed Operations

- **Purpose**: Simulate real-world usage with mixed operations
- **Load**: 30 operations (mix of reads, writes, auth)
- **Expected**: 90%+ success rate, <2000ms average response time

## Performance Metrics

Each test reports the following metrics:

| Metric               | Description                          |
| -------------------- | ------------------------------------ |
| **Total Requests**   | Total number of operations attempted |
| **Successful**       | Number of successful operations      |
| **Failed**           | Number of failed operations          |
| **Success Rate**     | Percentage of successful operations  |
| **Total Duration**   | Total time for all operations (ms)   |
| **Average Duration** | Average time per operation (ms)      |
| **Min Duration**     | Fastest operation time (ms)          |
| **Max Duration**     | Slowest operation time (ms)          |
| **Requests/Second**  | Throughput (operations per second)   |

## Interpreting Results

### Success Rate

- **>95%**: Excellent - System is handling load well
- **90-95%**: Good - Minor issues under load
- **80-90%**: Fair - Performance degradation under load
- **<80%**: Poor - System struggling under load

### Average Response Time

- **Firestore Reads**: <500ms is excellent, <1000ms is acceptable
- **Firestore Writes**: <1000ms is excellent, <2000ms is acceptable
- **Auth Operations**: <500ms is excellent, <1000ms is acceptable
- **Storage Uploads**: <3000ms for small files, <10000ms for large files

### Requests Per Second

- Higher is better
- Compare with your expected production load
- Ensure Firebase quotas can handle the throughput

## Comparison with PostgreSQL Baseline

To compare Firebase performance with the previous PostgreSQL implementation:

### Read Operations

- **PostgreSQL**: Typically 50-200ms for indexed queries
- **Firestore**: Typically 100-500ms for indexed queries
- **Trade-off**: Firestore may be slightly slower but offers better scalability

### Write Operations

- **PostgreSQL**: Typically 10-50ms for single inserts
- **Firestore**: Typically 100-300ms for single writes
- **Trade-off**: Firestore writes are slower but offer automatic replication

### Complex Queries

- **PostgreSQL**: Excellent for complex joins and aggregations
- **Firestore**: Limited query capabilities, may require denormalization
- **Trade-off**: Firestore requires different data modeling approaches

### Scalability

- **PostgreSQL**: Vertical scaling, requires connection pooling
- **Firestore**: Automatic horizontal scaling, no connection management
- **Advantage**: Firestore scales automatically without infrastructure changes

## Firebase Quotas and Limits

Be aware of Firebase quotas when running load tests:

### Firestore

- **Reads**: 50,000/day (free tier), unlimited (paid)
- **Writes**: 20,000/day (free tier), unlimited (paid)
- **Deletes**: 20,000/day (free tier), unlimited (paid)

### Firebase Auth

- **User Creation**: Rate limited to prevent abuse
- **Token Verification**: Very high limits

### Cloud Storage

- **Uploads**: 5GB/day (free tier), unlimited (paid)
- **Downloads**: 1GB/day (free tier), unlimited (paid)

## Best Practices

### 1. Run Tests in Non-Production Environment

- Use a separate Firebase project for load testing
- Never run load tests against production data

### 2. Monitor Firebase Console

- Watch for quota warnings during tests
- Check for any error spikes in Firebase Console

### 3. Gradual Load Increase

- Start with lower concurrent requests
- Gradually increase load to find breaking points

### 4. Clean Up Test Data

- Tests automatically clean up created data
- Verify cleanup completed successfully

### 5. Regular Testing

- Run load tests before major releases
- Establish performance baselines
- Track performance trends over time

## Troubleshooting

### Tests Timing Out

- Increase `TEST_TIMEOUT` value
- Reduce `CONCURRENT_REQUESTS`
- Check network connectivity

### High Failure Rates

- Check Firebase quotas in console
- Verify service account permissions
- Check for rate limiting

### Slow Performance

- Review Firestore indexes
- Check security rules complexity
- Verify network latency

### Authentication Errors

- Verify service account credentials
- Check Firebase project configuration
- Ensure proper permissions

## CI/CD Integration

To skip load tests in CI/CD pipelines:

```bash
# In your CI/CD configuration
SKIP_LOAD_TESTS=true npm test
```

Or run load tests only on specific branches:

```yaml
# GitHub Actions example
- name: Run Load Tests
  if: github.ref == 'refs/heads/main'
  run: npm test -- load-testing.test.ts
  env:
    FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

## Performance Optimization Tips

### Firestore

1. **Create composite indexes** for complex queries
2. **Use batch operations** for multiple writes
3. **Implement caching** for frequently accessed data
4. **Denormalize data** to reduce reads

### Firebase Auth

1. **Cache user data** to reduce Auth API calls
2. **Use custom claims** for role-based access
3. **Implement token refresh** logic properly

### Cloud Storage

1. **Use resumable uploads** for large files
2. **Implement client-side compression**
3. **Use signed URLs** for direct access
4. **Set appropriate cache headers**

## Reporting Issues

If you encounter performance issues:

1. **Capture metrics**: Save the load test report
2. **Document environment**: Note Firebase project, region, tier
3. **Reproduce**: Try to reproduce with minimal test case
4. **Check Firebase Status**: Visit [Firebase Status Dashboard](https://status.firebase.google.com/)

## Additional Resources

- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Quotas and Limits](https://firebase.google.com/docs/firestore/quotas)
- [Cloud Storage Best Practices](https://firebase.google.com/docs/storage/best-practices)

## Example Report

```
============================================================
Load Test Results: Concurrent Document Reads
============================================================
Total Requests:       50
Successful:           49
Failed:               1
Success Rate:         98.00%
Total Duration:       12450.50ms
Average Duration:     254.09ms
Min Duration:         145.23ms
Max Duration:         487.65ms
Requests/Second:      3.94
============================================================
```

## Conclusion

Regular load testing helps ensure your Firebase implementation can handle production traffic. Use these tests to:

- Establish performance baselines
- Identify bottlenecks early
- Validate optimization efforts
- Plan for scaling needs

Remember that Firebase performance can vary based on:

- Geographic region
- Time of day
- Current load on Firebase infrastructure
- Your specific data model and query patterns
